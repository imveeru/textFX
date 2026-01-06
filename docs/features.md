# Features

The Text Effect Demo allows for the creation of rich, high-quality text graphics.

## Text Customization
- **Font Family**: Integration with Google Fonts.
- **Font Styles**: Toggle Bold, Italic, Underline, and Strikethrough.
- **Size & Tracking**: Adjust font size and character spacing (tracking).

## Fill and Stroke
- **Solid**: Flat color fill.
- **Gradient**:
  - **Linear**: Adjustable angle.
  - **Radial**: Center-weighted gradient.
  - **Gradient Editor**: Add/remove stops, adjust opacity and position.
- **Outline**:
  - Draw only the text border.
  - Supports both Solid and Gradient strokes.
  - Adjustable stroke width.

## Dimensional Effects
### Shadows
- **Drop Shadow**: Classic detached shadow with Blur, Offset X/Y, Color, and Opacity controls.
- **Block Shadow**: A solid, extruded shadow (retro 3D look) at a fixed angle.
- **3D Shadow**: Similar to block, but with layered stacking for improved depth perception.
- **Inner Shadow**: Creates a cut-out visual within the text body.

### Warp
Distort the text geometry in real-time.
- **Types**: Arc, Flag, Wave, Fish, etc.
- **Intensity**: Control the strength of the distortion.

### Bevel & Emboss
Adds realistic 3D lighting to the text surface.
- **Techniques**: Chisel Hard, Chisel Soft, Smooth.
- **Styles**: Inner Bevel, Outer Bevel, Pillow Emboss, Emboss.
- **Lighting**: Adjustable Angle, Altitude, Highlight Mode, and Shadow Mode.
- **SDF-Based**: Uses Signed Distance Fields for smooth, resolution-independent edge detection.

### Glow
- **Outer Glow**: Radiating light around the text.
- **Inner Glow**: Radiating light from the edge inwards.

## Export & Tools
- **Auto-Update**: Canvas refreshes automatically to reflect changes.
- **High-Res Export**: Download as PNG or JPEG at 300 DPI (scaled resolution).
- **SVG Export**: Export vector paths (experimental support).
- **JSON Presets**: Save your current configuration to a JSON file and load it back later.
