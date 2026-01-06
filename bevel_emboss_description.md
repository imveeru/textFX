# Feature: Bevel & Emboss (Procedural Text Effect)

## 1. Feature Overview (What the user gets)

**Bevel & Emboss** adds a **3D-like raised or engraved appearance** to text by simulating how light interacts with a beveled surface along the glyph edges.

The effect:

* Does **not** create real 3D geometry
* Is computed **per pixel** using lighting equations
* Is **resolution-independent**
* Is **fully reversible and parameterized**

This makes it ideal for:

* Text effects
* Logos
* UI typography
* Exportable, editable design systems

---

## 2. User-Facing Controls (Inputs / UI Elements)

These controls are exposed in the **Text Effects → Bevel & Emboss** panel.

---

### 2.1 Effect Enablement

* **Checkbox:** Enable Bevel & Emboss

---

### 2.2 Style Controls

| UI Control    | Type     | Meaning                                                 |
| ------------- | -------- | ------------------------------------------------------- |
| **Style**     | Dropdown | `Inner Bevel`, `Outer Bevel`, `Emboss`, `Pillow Emboss` |
| **Direction** | Toggle   | `Up` (raised) / `Down` (engraved)                       |
| **Technique** | Dropdown | `Smooth` (default), `Chisel Soft`, `Chisel Hard`        |

> Internally controls **how the height field is shaped**.

---

### 2.3 Geometry Controls

| UI Control | Type        | Backend Parameter                   |
| ---------- | ----------- | ----------------------------------- |
| **Size**   | Slider (px) | Bevel width (distance field radius) |
| **Depth**  | Slider (%)  | Height scale multiplier             |
| **Soften** | Slider      | Height field blur radius            |

---

### 2.4 Shading & Lighting Controls

| UI Control            | Type          | Backend Parameter           |
| --------------------- | ------------- | --------------------------- |
| **Angle**             | Dial (0–360°) | Light azimuth               |
| **Altitude**          | Dial (0–90°)  | Light elevation             |
| **Gloss Contour**     | Curve editor  | Specular exponent remapping |
| **Highlight Color**   | Color picker  | Specular color              |
| **Highlight Opacity** | Slider        | Specular strength           |
| **Shadow Color**      | Color picker  | Diffuse shadow color        |
| **Shadow Opacity**    | Slider        | Diffuse strength            |

---

### 2.5 Contour Controls

| UI Control        | Type         | Effect                  |
| ----------------- | ------------ | ----------------------- |
| **Bevel Contour** | Curve editor | Height profile shape    |
| **Anti-alias**    | Checkbox     | Smooth contour sampling |

---

## 3. Data Model (Serializable)

```json
{
  "style": "inner",
  "direction": "up",
  "size": 14,
  "depth": 1.0,
  "soften": 1.5,
  "bevelContour": "round",
  "glossContour": "linear",
  "light": {
    "angle": 135,
    "altitude": 30
  },
  "highlight": {
    "color": "#ffffff",
    "opacity": 0.75
  },
  "shadow": {
    "color": "#000000",
    "opacity": 0.6
  }
}
```

This JSON is:

* Editor-friendly
* Undo/redo-safe
* Exportable
* Optimizable (EA / search)

---

## 4. Backend Implementation Logic (Canvas / JS)

### High-Level Pipeline

> **Text → Distance Field → Height Map → Normals → Lighting → Composite**

Everything happens **in screen space**, per pixel.

---

## 4.1 Step 1: Text Mask Generation

**Input**

* Text string
* Font family, size, weight
* Transform (scale/rotate)

**Process**

* Render text to offscreen canvas
* Extract alpha channel

**Output**

* Binary alpha mask `A(x, y)`

---

## 4.2 Step 2: Signed Distance Field (SDF)

**Purpose**

* Measure distance from each pixel to nearest glyph edge

**Logic**

* Inside glyph → positive distance
* Outside glyph → negative distance

**Output**

* `D(x, y)` (Float32Array)

This is the **core geometry proxy**.

---

## 4.3 Step 3: Height Field Construction

**Inputs**

* Distance field `D`
* UI: `size`, `depth`, `bevelContour`

**Logic**

```text
normalizedDistance = clamp(D / size, 0, 1)
height = bevelContour(normalizedDistance) * depth
```

**Notes**

* Inner bevel → clamp inside glyph
* Outer bevel → clamp outside glyph
* Pillow emboss → invert center

**Output**

* Height map `H(x, y)`

---

## 4.4 Step 4: Normal Map Estimation

**Purpose**

* Approximate surface orientation per pixel

**Logic**

```text
dx = H(x-1,y) - H(x+1,y)
dy = H(x,y-1) - H(x,y+1)
normal = normalize(-dx, -dy, 1)
```

**Output**

* Per-pixel surface normal `N(x,y)`

---

## 4.5 Step 5: Lighting Computation

### Light Vector

```text
L = (
  cos(altitude) * cos(angle),
  cos(altitude) * sin(angle),
  sin(altitude)
)
```

### Diffuse (Shadow)

```text
diffuse = max(0, dot(N, L)) * shadowOpacity
```

### Specular (Highlight)

```text
half = normalize(L + view)
specular = pow(max(0, dot(N, half)), glossExponent)
specular *= highlightOpacity
```

---

## 4.6 Step 6: Color Composition

```text
finalColor =
  baseTextColor
  + diffuse * shadowColor
  + specular * highlightColor
```

Alpha remains from original text mask.

---

## 4.7 Step 7: Soften (Optional)

If `soften > 0`:

* Apply small Gaussian blur to height map **before** normal computation
