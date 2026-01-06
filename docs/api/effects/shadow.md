# Shadow Effect (`js/effects/shadow.js`)

Implements Drop, Block, 3D, and Inner Shadow effects.

## Functions

### `drawShadow(ctx, ch, x, y, scale)`
Renders an external shadow for a single character character-by-character.
- **`drop`**: Uses native Canvas `shadowColor`, `shadowBlur`, `shadowOffsetX/Y`.
- **`block` / `3d`**: Simulates extrusion by repeatedly drawing the text shape at incremental offsets (`iterationCount`). This creates a solid "trail".
    - `block`: Uses `Shadow Distance` to determine length.
    - `3d`: Uses `Shadow Depth` to determine length.
- **Handling Outlines**: Checks `isOutline` to decide whether to use `strokeText` or `fillText`, ensuring the shadow matches the text fill style.

### `applyInnerShadow(ctx, width, height, scale)`
Renders a shadow *inside* the text body.
**Logic**:
1.  Creates a **reverse mask**: A solid rectangle with the text shape "cut out" (erased via `destination-out`).
2.  Draws this reverse mask onto the text canvas using `source-atop`.
    - `source-atop` ensures we only draw where the original text exists.
3.  The reverse mask casts a standard Drop Shadow.
    - Because the "caster" is outside and the "receiver" is inside, the shadow falls inward from the edge.
