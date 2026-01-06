# State Management (`js/state.js`)

A lightweight module for managing transient application state not easily represented in the DOM.

## Data Structure

```javascript
export let appState = {
    // Gradient Editor Stops
    stops: [
        { pos: 0, color: "#ff0000", opacity: 100 },
        { pos: 100, color: "#0000ff", opacity: 100 }
    ],
    // Font Decoration Flags
    fontFlags: {
        bold: true,
        italic: false,
        underline: false,
        strike: false
    }
};
```

## Usage
- **Read**: `render.js` and `ui.js` read this state to determine how to render fonts and gradients.
- **Write**: `ui.js` updates `fontFlags` when toolbar buttons are clicked, and updates `stops` when the gradient editor is manipulated.
