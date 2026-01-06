# UI Module (`js/ui.js`)

Handles all DOM interaction, event listeners, and dynamic UI updates (like the Gradient Editor).

## Key Functions

### listener Setup
- `setupFontListeners()`: Populates the font dropdown and adds search functionality.
- `setupEventListeners()`: Attaches `input` and `change` listeners to all controls (Inputs, Selects, Sliders) to trigger `drawCanvas`.

### Font Control
- `preloadAllFonts()`: Loads font objects from `js/data/fonts.js`.
- `toggleFontDropdown()`: Manages the visibility of the custom select menu.
- `selectFont(fontName)`: Updates selected state and triggers render.
- `toggleStyle(style)`: Toggles entries in `appState.fontFlags` and updates visual button state.

### Gradient Editor
- `renderGradientEditor()`: Re-generates the HTML for the gradient slider, creating drag handles for each stop in `appState.stops`.
- `addStop()`: Adds a new stop at 50% position.
- `updateGradientPreview()`: Updates the CSS background of the preview bar.

## Design Pattern
The UI module acts as the "Controller". It does not perform rendering logic itself but modifies the DOM/State and calls `drawCanvas` (often via `window.drawCanvas`) to reflect changes.
