# Text Effect Demo Documentation

Welcome to the technical documentation for the Text Effect Demo project. This project is a web-based tool for generating valid CSS/Canvas text effects with real-time preview and export capabilities.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Dependencies](#dependencies)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

## Project Overview

The Text Effect Demo allows users to:
1.  Type custom text.
2.  Apply various fonts and styling (Bold, Italic, etc.).
3.  Apply complex effects like Bevel, Emboss, Glow, Shadows, and Warp.
4.  Export the result as high-resolution PNG, JPEG, or SVG.
5.  Save and load presets via JSON.

## Dependencies

This project is built with **Vanilla JavaScript** (ES6 Modules) and **HTML5 Canvas**. No build tools (like Webpack or Vite) are currently required to run the development version, though a local server is needed for module loading (CORS).

**External Services:**
- [Google Fonts API](https://fonts.google.com): Used for loading dynamic font families.
- [Remix Icon](https://remixicon.com/): Used for UI icons.
- [Tailwind CSS](https://tailwindcss.com): Used via CDN for UI styling.


## Architecture

The project tracks state in `state.js` and renders to a valid HTML5 Canvas in `render.js`. User interactions flow through `ui.js` which updates the inputs and triggers redraws.

See [Architecture Guide](./architecture.md) for more details.

## Features

- **Typography**: Tracking, diverse font selection via Google Fonts.
- **Fill Effects**: Solid colors, Linear/Radial Gradients, Outlines.
- **Dimensional Effects**:
    - **Drop Shadow**: Standard offset shadows.
    - **Block Shadow**: Extruded retro feel.
    - **3D Shadow**: Realistic depth.
- **Post-Processing**:
    - **Bevel & Emboss**: Pixel-perfect lighting effects using SDF.
    - **Glow**: Inner and Outer glow effects.
    - **Warp**: Text distortion (Arc, Flag, etc.).

See [Feature Documentation](./features.md) for detailed explanations.

## API Reference

Detailed documentation for the code modules:

- **Core**:
  - [Main Entry (`main.js`)](./api/main.md)
  - [Rendering Engine (`render.js`)](./api/render.md)
  - [State Management (`state.js`)](./api/state.md)
  - [UI Logic (`ui.js`)](./api/ui.md)
  - [Export (`export.js`)](./api/export.md)
- **Effects**:
  - [Bevel (`effects/bevel.js`)](./api/effects/bevel.md)
  - [Glow (`effects/glow.js`)](./api/effects/glow.md)
  - [SDF (`effects/sdf.js`)](./api/effects/sdf.md)
  - [Shadow (`effects/shadow.js`)](./api/effects/shadow.md)
  - [Warp (`effects/warp.js`)](./api/effects/warp.md)
  - [Gradient (`effects/gradient.js`)](./api/effects/gradient.md)

## Project Structure

```
├── index.html          # Application entry point
├── styles.css          # Application global styles
├── js/
│   ├── main.js         # Bootstrapping
│   ├── render.js       # Main rendering loop
│   ├── state.js        # Global app state
│   ├── ui.js           # DOM event handling
│   ├── export.js       # File export logic
│   ├── utils.js        # Helpers
│   ├── data/
│   │   └── fonts.js    # Font constants
│   └── effects/        # Effect implementations
│       ├── bevel.js
│       ├── glow.js
│       ├── gradient.js
│       ├── sdf.js
│       ├── shadow.js
│       └── warp.js
```
