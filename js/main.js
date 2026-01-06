
import { preloadAllFonts, selectFont, updateStyleButtons, renderGradientEditor, setupFontListeners, updateUiVisibility, setupEventListeners, toggleFontDropdown, toggleStyle, addStop } from "./ui.js";
import { drawCanvas } from "./render.js";
import { triggerExport, handleFileSelect } from "./export.js";


// Expose to Global Scope for HTML onclick handlers
window.drawCanvas = drawCanvas;
window.toggleFontDropdown = toggleFontDropdown;
window.toggleStyle = toggleStyle;
window.addStop = addStop;
window.triggerExport = triggerExport;
window.handleFileSelect = handleFileSelect;
// Also updateUiVisibility might be needed if HTML calls it? No, listeners do.
// But wait, gradient editor elements created dynamically calling updateGradientPreview?
// `colorInp.oninput` in UI.js calls it locally. SAFE.
// `delBtn.onclick` calls locally. SAFE.
// `addStop` button in HTML calls `addStop()`. EXPOSED.


window.onload = () => {
    // Initial Font Load (Batch)
    preloadAllFonts();

    // Explicitly set Poppins initial state
    selectFont("Poppins");

    updateStyleButtons(); // Initialize style button states
    renderGradientEditor();
    setupFontListeners();
    setupEventListeners(); // Attach all dynamic listeners
    updateUiVisibility();

    // selectFont("Poppins") already calls drawCanvas via setTimeout 0

    // Auto-update every 0.5s as requested
    setInterval(drawCanvas, 500);
};
