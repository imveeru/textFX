# Text Effect Data Model

## Data Dictionary

| Field Name | Type | Required | Description | Constraints & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`content`** | Object | Yes | Core text and font properties. | |
| `content.text` | String | Yes | The actual strings of characters to render. | Default: "Hello World" |
| `content.fontFamily` | String | Yes | Name of the font family to use. | Must match a loaded Google Font name (e.g., "Poppins"). |
| `content.fontSize` | Integer | Yes | The size of the text in pixels. | > 0. Default: 80. Scaled during export. |
| `content.tracking` | Float | No | Spacing between characters (letter-spacing) in pixels. | Default: 0. Can be negative. |
| `content.styles` | Object | Yes | Boolean flags for font styling. | |
| `content.styles.bold` | Boolean | Yes | Toggles font weight 700 vs 400. | |
| `content.styles.italic` | Boolean | Yes | Toggles font style italic vs normal. | |
| `content.styles.underline` | Boolean | Yes | Draws a line below the baseline. | Validated in render loop. |
| `content.styles.strike` | Boolean | Yes | Draws a line through the center. | Validated in render loop. |
| | | | | |
| **`fill`** | Object | Yes | Configuration for the text face color. | |
| `fill.type` | Enum | Yes | Determines which fill logic to use. | Values: `"solid"`, `"gradient"`. |
| `fill.solidColor` | Hex String | Cond. | Color used if type is "solid". | Format: `#RRGGBB`. |
| `fill.gradient` | Object | Cond. | Settings used if type is "gradient". | |
| `fill.gradient.angle` | Integer | Yes | Angle of the linear gradient in degrees. | 0-360. |
| `fill.gradient.stops` | Array | Yes | List of color stops. | Min 2 items. Sorted by `pos` during render. |
| `fill.gradient.stops[].pos` | Integer | Yes | Position of the stop in percent. | 0-100. |
| `fill.gradient.stops[].color` | Hex String | Yes | Color of the stop. | Format: `#RRGGBB`. |
| `fill.gradient.stops[].opacity`| Integer | Yes | Opacity of the stop in percent. | 0-100. Converted to 0.0-1.0 alpha. |
| | | | | |
| **`stroke`** | Object | Yes | Configuration for the text outline. | |
| `stroke.enabled` | Boolean | Yes | Whether to draw an outline. | |
| `stroke.color` | Hex String | Cond. | Color of the outline. | Used if enabled. Format: `#RRGGBB`. |
| `stroke.width` | Float | Cond. | Thickness of the outline in pixels. | > 0. Used if enabled. |
| | | | | |
| **`shadow`** | Object | Yes | Configuration for shadows and 3D effects. | |
| `shadow.type` | Enum | Yes | The type of shadow effect. | Values: `"none"`, `"drop"`, `"block"`, `"3d"`. |
| `shadow.color` | Hex String | Cond. | Base color for the shadow/extrusion. | Format: `#RRGGBB`. |
| `shadow.opacity` | Float | Cond. | Opacity of the shadow. | 0.0-1.0. Applied to color alpha. |
| `shadow.angle` | Integer | Cond. | Direction of shadow/extrusion in degrees. | 0-360. |
| `shadow.distance` | Float | Cond. | Distance for Drop Shadow & Block Shadow. | Used for `"drop"` and `"block"`. |
| `shadow.blur` | Float | Cond. | Blur radius in pixels. | Used only for `"drop"`. |
| `shadow.depth` | Integer | Cond. | Extrusion depth (iterations). | Used only for `"3d"`. Note: Code treats "block" distance as depth too. |
| | | | | |
| **`warp`** | Object | Yes | Distortion effects applied to character positions. | |
| `warp.type` | Enum | Yes | The mathematical function for distortion. | Values: `"none"`, `"arch"`, `"wave"`, `"bulge"`, `"rise"`, `"fisheye"`. |
| `warp.intensity` | Float | Yes | Magnitude of the distortion. | Can be negative for inverted effects. |

## JSON Structure

```json
{
  "content": {
    "text": "Hello World",
    "fontFamily": "Poppins",
    "fontSize": 80,
    "tracking": 0,
    "styles": {
      "bold": true,
      "italic": false,
      "underline": false,
      "strike": false
    }
  },
  "fill": {
    "type": "gradient",
    "solidColor": "#000000",
    "gradient": {
      "angle": 0,
      "stops": [
        { "pos": 0, "color": "#ff0000", "opacity": 100 },
        { "pos": 100, "color": "#0000ff", "opacity": 100 }
      ]
    }
  },
  "stroke": {
    "enabled": false,
    "color": "#000000",
    "width": 3
  },
  "shadow": {
    "type": "drop",
    "color": "#000000",
    "opacity": 0.5,
    "angle": 45,
    "distance": 10,
    "blur": 15,
    "depth": 20
  },
  "warp": {
    "type": "none",
    "intensity": 40
  }
}
```

## TypeScript Definition

```typescript
type HexColor = string; // e.g., "#FF0000"

interface TextEffect {
  content: {
    text: string;
    fontFamily: string;
    fontSize: number;
    tracking: number; 
    styles: {
      bold: boolean;
      italic: boolean;
      underline: boolean;
      strike: boolean;
    };
  };

  fill: {
    type: "solid" | "gradient";
    solidColor?: HexColor; // Required if type is 'solid'
    gradient?: {           // Required if type is 'gradient'
      angle: number;
      stops: Array<{
        pos: number;      // 0 to 100
        color: HexColor;
        opacity: number;  // 0 to 100
      }>;
    };
  };

  stroke: {
    enabled: boolean;
    color: HexColor;
    width: number;
  };

  shadow: {
    type: "none" | "drop" | "block" | "3d";
    // Properties below are technically optional based on 'type', 
    // but usually stored persistently to retain state when switching types.
    color: HexColor;
    opacity: number;    // 0.0 to 1.0
    angle: number;      // Degrees
    distance: number;   // Used for 'drop' and 'block'
    blur: number;       // Used for 'drop' only
    depth: number;      // Used for '3d' only
  };

  warp: {
    type: "none" | "arch" | "wave" | "bulge" | "rise" | "fisheye";
    intensity: number;
  };
}
```
