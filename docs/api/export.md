# Export Module (`js/export.js`)

Manages file input/output operations, specifically exporting the canvas as an image and importing/exporting JSON settings.

## Functions

### `triggerExport(format)`
**Input**: format string (`'png'`, `'jpg'`, `'svg'`, `'json'`).
**Process**:
1.  **JSON**: Serializes DOM input values and `appState` to a JSON string and triggers download.
2.  **PNG/JPG**:
    - Creates a new, temporary off-screen canvas.
    - Sets dimensions to 1080x1080 (fixed high-res square).
    - Calls `renderScene` with a `scale` factor (e.g., 2.0 or 3.0) to match the high resolution.
    - Converts canvas to Blob (`canvas.toBlob`).
    - Triggers download.
3.  **SVG**: Calls logic (if implemented) to serialize paths.

### `handleFileSelect(event)`
**Input**: File input change event.
**Process**:
1.  Reads the file using `FileReader`.
2.  Parses JSON content.
3.  `applySettings(data)`: Maps JSON keys back to DOM IDs and `appState`, then triggers a re-render.
