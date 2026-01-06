# Main Module (`js/main.js`)

The `main.js` file serves as the entry point for the application. It orchestrates the initialization and binds global event handlers.

## Usage
Imported by `index.html` as a module.

## Global Exposure
The following functions are exposed to the `window` object to allow inline HTML event handlers (e.g., `onclick="drawCanvas()"`) to function:

- `drawCanvas`: Renders the main scene.
- `toggleFontDropdown`: Opens/closes the custom font picker.
- `toggleStyle`: Toggles boolean font flags (Bold/Italic).
- `addStop`: Adds a new stop to the gradient editor.
- `triggerExport`: Initiates file download.
- `handleFileSelect`: Handles JSON preset upload.

## Initialization
`window.onload` triggers:
1.  `preloadAllFonts()`: Loads font definitions.
2.  `selectFont("Poppins")`: Sets default font.
3.  `updateStyleButtons()`: Syncs UI state.
4.  `renderGradientEditor()`: Draws initial gradient UI.
5.  `setupFontListeners()` & `setupEventListeners()`: Binds DOM events.
6.  `setInterval(drawCanvas, 500)`: Starts the auto-update loop (0.5s interval).
