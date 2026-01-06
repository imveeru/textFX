# Warp Effect (`js/effects/warp.js`)

Calculates vertical displacement (Y-offset) for individual characters to simulate text distortion.

## Function
### `warpValue(type, index, mid, intensity)`
Calculates the pixel offset for a given character index.
- **`type`**: The shape name.
- **`index` (`i`)**: Index of the character in the string.
- **`mid` (`m`)**: Middle index of the string (center point).
- **`intensity`**: Strength of the effect (pixels).

## Supported Types
- **Bottom/Up variants**: Not strictly defined in this file (handled by sign of intensity or specific logic).
- **`arc` (arch)**: Parabolic curve (`-x^2`).
- **`wave`**: Sine wave (`sin`).
- **`bulge`**: Cosine curve (`cos`), highest in center.
- **`rise`**: Linear slope.
- **`fisheye`**: Gaussian-like curve (`exp`), expontential dropoff from center.
