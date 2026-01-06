# Render Module (`js/render.js`)

This module contains the primary logic for drawing the text effect scene to a CanvasRenderingContext2D.

## Functions

### `drawCanvas()`
**Scope**: Exported, Global.
**Description**: Helper function that grabs the user-facing canvas element (`#myCanvas`) and calls `renderScene` with the default scale.

### `renderScene(canvas, ctx, scale = 1)`
**Scope**: Exported.
**Description**: The core rendering pipeline. It is stateless regarding the canvas; it simply draws the current DOM state onto the provided context.

**Parameters**:
- `canvas`: The target HTMLCanvasElement (used for dimensions).
- `ctx`: The 2D rendering context.
- `scale`: Resolution multiplier (default 1). Higher values (e.g., 2 or 3) are used for high-DPI export.

**Pipeline Steps**:
1.  **Clear**: Clears canvas and sets background color.
2.  **Configuration**: Reads DOM elements (Text, Font, Flags, Warp Settings).
3.  **Measurement**:
    - Calculates total text width including tracking.
    - Computes centering coordinates (`startX`, `startY`).
4.  **Off-Screen Prep**:
    - If Bevel, Inner Shadow, or Glow is enabled, an off-screen canvas is created to generate a clean "Text Mask" without background interference.
5.  **Main Loop (Per Character)**:
    - Calculates Warp offset (`warpValue`).
    - **Shadows**: Calls `drawShadow()` (Effects drawn *behind* text).
    - **Stroke/Fill**: Draws the base text with `strokeText/fillText` or Gradient fill.
    - **Decorations**: Renders Underline/Strikethrough.
6.  **Post-Processing**:
    - **Outer Glow**: Applied to main context.
    - **Inner Shadow/Glow**: Applied to off-screen context.
    - **Bevel**: Applied to off-screen context.
    - **Composite**: Draws the off-screen canvas onto the main canvas.
