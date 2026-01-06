# Feature: Glow (Inner / Outer)
---

## 1. Feature Overview (What the user gets)

**Glow** adds a **soft luminous halo** either:

* **inside** the text boundary (**Inner Glow**), or
* **outside** the text boundary (**Outer Glow**)

Unlike shadows, glow:

* Radiates **uniformly from edges**
* Is **not directional**
* Is **purely distance-based**
* Has **no lighting model**

This makes Glow:

* Visually soft and atmospheric
* Extremely fast to compute
* Highly stable across resolutions

---

## 2. User-Facing Controls (Inputs / UI Elements)

All controls appear under **Text Effects → Glow**.

---

### 2.1 Effect Enablement

* **Checkbox:** Enable Glow

---

### 2.2 Glow Type (Required Dropdown)

| UI Control    | Type                       |
| ------------- | -------------------------- |
| **Glow Type** | Dropdown: `Inner`, `Outer` |

This single dropdown switches the **distance domain** used.

---

### 2.3 Appearance Controls

| UI Control     | Type            | Meaning                              |
| -------------- | --------------- | ------------------------------------ |
| **Blend Mode** | Dropdown        | `Normal`, `Screen`, `Overlay`, `Add` |
| **Opacity**    | Slider (0–100%) | Glow strength                        |
| **Color**      | Color picker    | Glow color                           |
| **Noise**      | Slider (%)      | Adds stochastic variation            |

---

### 2.4 Geometry Controls

| UI Control             | Type        | Backend Parameter  |
| ---------------------- | ----------- | ------------------ |
| **Size**               | Slider (px) | Glow radius        |
| **Spread**             | Slider (%)  | Edge hardness      |
| **Choke** *(optional)* | Slider (%)  | Inner glow falloff |

---

### 2.5 Contour Controls

| UI Control     | Type         | Effect               |
| -------------- | ------------ | -------------------- |
| **Contour**    | Curve editor | Falloff shape        |
| **Anti-alias** | Checkbox     | Smooth edge sampling |

---

## 3. Data Model (Serializable)

```json
{
  "effect": "glow",
  "enabled": true,
  "type": "outer",
  "blendMode": "screen",
  "opacity": 0.8,
  "color": "#00ffff",
  "size": 18,
  "spread": 0.3,
  "noise": 0.0,
  "contour": "exponential"
}
```

---

## 4. Backend Implementation Logic (Canvas / JS)

### High-Level Pipeline

> **Text → Distance Field → Falloff → Color → Composite**

No normals.
No lighting.
No view direction.

---

## 4.1 Step 1: Text Mask Generation

Same as Bevel:

* Render text to offscreen canvas
* Extract alpha mask `A(x,y)`

---

## 4.2 Step 2: Signed Distance Field (SDF)

Compute:
[
D(x,y) =
\begin{cases}
+\text{distance to edge}, & \text{inside text} \
-\text{distance to edge}, & \text{outside text}
\end{cases}
]

This single field supports **both inner and outer glow**.

---

## 4.3 Step 3: Domain Selection (Inner vs Outer)

### Inner Glow

```text
distance = clamp( D / size , 0 , 1 )
```

### Outer Glow

```text
distance = clamp( -D / size , 0 , 1 )
```

This is the **only difference** between inner and outer glow.

---

## 4.4 Step 4: Spread / Choke Control

Spread hardens the edge by remapping distance:

```text
d = max(0, (distance - spread) / (1 - spread))
```

* `spread = 0` → soft
* `spread → 1` → hard edge

---

## 4.5 Step 5: Contour Application

Apply user-defined falloff curve:

```text
intensity = contour(d)
```

Examples:

* Linear
* Exponential
* Gaussian-like
* Custom curve LUT

---

## 4.6 Step 6: Noise (Optional)

```text
intensity *= 1 + noise * random(x,y)
```

Used for organic or fiery glows.

---

## 4.7 Step 7: Color & Opacity

```text
glowColor = color * intensity * opacity
alpha = intensity * opacity
```

---

## 4.8 Step 8: Blending / Compositing

Blend onto base text using selected mode:

* **Normal**
* **Screen**
* **Add**
* **Overlay**

Alpha is preserved from text layer.

---

## 5. Minimal JS Pseudocode

```js
for (pixel of pixels) {
  let d = type === "inner"
    ? clamp(D[pixel] / size, 0, 1)
    : clamp(-D[pixel] / size, 0, 1)

  d = Math.max(0, (d - spread) / (1 - spread))
  let intensity = contour(d)

  let glow = color * intensity * opacity
  composite(pixel, glow, blendMode)
}
```



