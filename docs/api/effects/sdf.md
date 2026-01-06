# SDF Module (`js/effects/sdf.js`)

Provides utility functions for computing Signed Distance Fields and blurring height maps.

## Functions

### `computeDistanceField(alpha, dist, width, height, size, style)`
Generates an approximate Euclidean distance transform.
- **Input**: `alpha` (Uint8Array of opacity).
- **Output**: `dist` (Float32Array of distances).
- **Logic**:
    - Iterates pixels.
    - If inside the shape (alpha > 0), searches neighbors to find distance to nearest edge.
    - Uses a brute-force or separable pass approach (depending on implementation specifics) to fill the `dist` array.

### `blurHeightMap(heightMap, w, h, radius)`
Applies a box or gaussian blur to the height map to soften edges.
- **Usage**: Used by `bevel.js` when "Soften" parameter is > 0.
