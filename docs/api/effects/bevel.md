# Bevel Effect (`js/effects/bevel.js`)

Implements a 3D bevel and emboss effect using pixel-based height maps and lighting.

## Algorithm
The effect does not use 3D geometry. Instead, it simulates 3D appearance using 2D image processing techniques:
1.  **Alpha Map**: Extracts validity/opacity from the source image.
2.  **SDF**: Computes a Signed Distance Field to determine how far each pixel is from the edge.
3.  **Height Map**: Converts SDF distance to a height value (0..1) based on the "Technique" (Chisel/Smooth).
4.  **Normal Map**: Calculates surface normals (`dx`, `dy`) from the height map neighbors.
5.  **Lighting**:
    - Calculates Light Vector (`L`) using `Altitude` and `Angle`.
    - Computes Diffuse (`N · L`) and Specular components.
6.  **Composite**: Blends Highlight and Shadow colors onto the original pixels based on the calculated lighting intensity.

## Exports

### `applyBevelEffect(ctx, x, y, width, height, scale)`
Applies the effect in-place to the given context's `ImageData`.
*Note: This is a CPU-intensive operation as it iterates over every pixel in the bounding box.*
