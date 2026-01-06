# Glow Effect (`js/effects/glow.js`)

Implements SDF-based Inner and Outer Glow effects.

## Usage
Called by `render.js` during the post-processing phase.

## Function
### `applyGlowEffect(targetCtx, sourceCanvas, scale, type)`
- **`targetCtx`**: Context to draw the glow onto.
- **`sourceCanvas`**: The canvas containing the text shape (used for alpha extraction).
- **`type`**: `'inner'` or `'outer'`.

## Logic
1.  **SDF Calculation**:
    - `'outer'`: Calculates distance from the shape edge to the *outside*.
    - `'inner'`: Calculates distance from the shape edge to the *inside*.
2.  **Intensity Mapping**:
    - Uses `Spread` and `Size` to map distance 0..1 to an alpha intensity.
    - Applies `Noise` if configured.
3.  **Compositing**:
    - Draws the generated glow pixels to an intermediate canvas.
    - Leverages `globalCompositeOperation` (Blend Mode) to merge with the background/text.
    - For `inner` glow, uses `destination-in` masking to ensure glow creates a hard cut at the text boundary.
