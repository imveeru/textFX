# Gradient Generaton (`js/effects/gradient.js`)

## Functions

### `buildGradient(ctx, angle, cx, cy, width, height)`
Creates a `CanvasGradient` object (Linear or Radial) based on the application state (`appState.stops`).

- **Linear**: Calculates start and end points `(x0, y0)` to `(x1, y1)` based on the angle and the text dimensions/center.
- **Radial**: Creates a radial gradient centered at `(cx, cy)`.
- **Stops**: Iterates through `appState.stops` and adds colors via `addColorStop`.

This function encapsulates the geometric math needed to rotate gradients properly relative to the text center.
