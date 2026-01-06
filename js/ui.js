
import { appState } from "./state.js";
import { googleFonts as initialFonts } from "./data/fonts.js";
import { drawCanvas } from "./render.js";
import { hexToRgba, showToast } from "./utils.js";

// Internal state for UI
let currentFontCat = "all";
let fontSearchQuery = "";
let allFonts = [...initialFonts]; // Start with local list
let filteredFonts = [];
let fontListCursor = 0;
const PAGE_SIZE = 20;
let isFontListLoading = false;

// Attach to window so HTML onchange can call them
// We must expose these:
// toggleFontDropdown, toggleStyle, addStop, triggerExport (in export.js), handleFileSelect (in export.js), drawCanvas (in render.js)

export function updateUiVisibility() {
    // Fill Logic
    const fillType = document.getElementById("fillType").value;
    const fillSolidOpts = document.getElementById("fillSolidOptions");
    const fillGradOpts = document.getElementById("fillGradientOptions");
    const fillOutlineOpts = document.getElementById("fillOutlineOptions");

    // Reset visibility
    fillSolidOpts.classList.add("hidden");
    fillGradOpts.classList.add("hidden");
    fillOutlineOpts.classList.add("hidden");

    if (fillType === "solid") {
        fillSolidOpts.classList.remove("hidden");
    } else if (fillType === "gradient") {
        fillGradOpts.classList.remove("hidden");
        renderGradientEditor();
        updateGradientPreview();
    } else if (fillType === "outline_solid") {
        fillSolidOpts.classList.remove("hidden");
        fillOutlineOpts.classList.remove("hidden");
    } else if (fillType === "outline_gradient") {
        fillGradOpts.classList.remove("hidden");
        fillOutlineOpts.classList.remove("hidden");
        renderGradientEditor();
        updateGradientPreview();
    }

    // Stroke Logic
    const strokeEnabled = document.getElementById("strokeEnabled").checked;
    const strokeOpts = document.getElementById("strokeOptions");
    if (strokeEnabled) {
        strokeOpts.classList.remove("hidden");
    } else {
        strokeOpts.classList.add("hidden");
    }

    // Shadow Logic
    const shadowType = document.getElementById("shadowType").value;
    const shadowCommonOpts = document.getElementById("shadowCommonOptions");
    const shadowBlurWrapper = document.getElementById("shadowBlurWrapper");
    const shadowOpacityWrapper = document.getElementById("shadowOpacityWrapper");
    const shadowDepthWrapper = document.getElementById("shadowDepthWrapper");

    if (shadowType === "none") {
        shadowCommonOpts.classList.add("hidden");
    } else {
        shadowCommonOpts.classList.remove("hidden");

        if (shadowType === "drop" || shadowType === "inner") {
            shadowBlurWrapper.classList.remove("hidden");
            shadowOpacityWrapper.classList.remove("hidden");
            shadowDepthWrapper.classList.add("hidden");
        } else {
            // Block or 3D
            shadowBlurWrapper.classList.add("hidden");
            shadowOpacityWrapper.classList.add("hidden");
            shadowDepthWrapper.classList.remove("hidden");
        }
    }

    // Bevel Logic
    const bevelEnabled = document.getElementById("bevelEnabled").checked;
    const bevelOpts = document.getElementById("bevelOptions");
    if (bevelEnabled) {
        bevelOpts.classList.remove("hidden");
    } else {
        bevelOpts.classList.add("hidden");
    }

    // Glow Logic
    const glowEnabled = document.getElementById("glowEnabled").checked;
    const glowOpts = document.getElementById("glowOptions");
    if (glowEnabled) {
        glowOpts.classList.remove("hidden");
    } else {
        glowOpts.classList.add("hidden");
    }
}


export function updateGradientPreview() {
    let preview = document.getElementById("gradientPreview");
    if (!preview) return; // Guard if element missing

    // Sort stops by position for correct rendering
    let sorted = [...appState.stops].sort((a, b) => a.pos - b.pos);

    let gradientStr = sorted.map(s => `${hexToRgba(s.color, s.opacity)} ${s.pos}%`).join(", ");
    preview.style.background = `linear-gradient(to right, ${gradientStr})`;
}

export function renderGradientEditor() {
    const list = document.getElementById("gradientStopsList");
    if (!list) return;
    list.innerHTML = "";

    appState.stops.sort((a, b) => a.pos - b.pos).forEach((s, i) => {
        let row = document.createElement("div");
        row.className = "flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm";

        // Color Input
        let colorInp = document.createElement("input");
        colorInp.type = "color";
        colorInp.value = s.color;
        colorInp.className = "w-8 h-8 p-0 border-0 rounded cursor-pointer";
        colorInp.oninput = (e) => {
            s.color = e.target.value;
            updateGradientPreview();
            drawCanvas();
        };

        // Opacity Slider
        let opContainer = document.createElement("div");
        opContainer.className = "flex flex-col flex-1";
        let opLabel = document.createElement("label");
        opLabel.className = "text-[10px] text-gray-500 uppercase font-bold";
        opLabel.innerText = `Opacity: ${s.opacity}%`;
        let opRange = document.createElement("input");
        opRange.type = "range";
        opRange.min = 0; opRange.max = 100;
        opRange.value = s.opacity;
        opRange.className = "w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer";
        opRange.oninput = (e) => {
            s.opacity = parseInt(e.target.value);
            opLabel.innerText = `Opacity: ${s.opacity}%`;
            updateGradientPreview();
            drawCanvas();
        };
        opContainer.append(opLabel, opRange);

        // Position Slider
        let posContainer = document.createElement("div");
        posContainer.className = "flex flex-col flex-1";
        let posLabel = document.createElement("label");
        posLabel.className = "text-[10px] text-gray-500 uppercase font-bold";
        posLabel.innerText = `Pos: ${s.pos}%`;
        let posRange = document.createElement("input");
        posRange.type = "range";
        posRange.min = 0; posRange.max = 100;
        posRange.value = s.pos;
        posRange.className = "w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer";
        posRange.oninput = (e) => {
            s.pos = parseInt(e.target.value);
            posLabel.innerText = `Pos: ${s.pos}%`;
            updateGradientPreview();
            drawCanvas();
        };
        posContainer.append(posLabel, posRange);

        // Delete Button (only if more than 2 stops)
        let delBtn = document.createElement("button");
        delBtn.className = "text-gray-400 hover:text-red-500 transition-colors p-1";
        delBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
        delBtn.title = "Remove Stop";
        delBtn.onclick = () => {
            if (appState.stops.length > 2) {
                // Find index again ensuring we delete the right object instance if sorting changed
                // Actually 's' is the reference.
                const idx = appState.stops.indexOf(s);
                if (idx > -1) {
                    appState.stops.splice(idx, 1);
                    renderGradientEditor();
                    updateGradientPreview();
                    drawCanvas();
                }
            } else {
                alert("Minimum 2 stops required.");
            }
        };

        row.append(colorInp, opContainer, posContainer, delBtn);
        list.appendChild(row);
    });
}

export function addStop() {
    appState.stops.push({ pos: 50, color: "#ffffff", opacity: 100 });
    renderGradientEditor();
    updateGradientPreview();
    drawCanvas();
}

export function toggleStyle(type) {
    appState.fontFlags[type] = !appState.fontFlags[type];
    updateStyleButtons();
    drawCanvas();
}

export function updateStyleButtons() {
    const activeClass = "bg-gray-200 text-primary";
    const inactiveClass = "hover:bg-gray-100 text-gray-700";

    // Helper to toggle classes
    const setBtn = (id, active) => {
        const btn = document.getElementById(id);
        if (active) {
            btn.className = `p-1.5 rounded transition-colors ${activeClass}`;
        } else {
            btn.className = `p-1.5 rounded transition-colors ${inactiveClass}`;
        }
    };

    setBtn("btnBold", appState.fontFlags.bold);
    setBtn("btnItalic", appState.fontFlags.italic);
    setBtn("btnUnderline", appState.fontFlags.underline);
    setBtn("btnStrike", appState.fontFlags.strike);
}

export function toggleFontDropdown() {
    const dd = document.getElementById("fontDropdown");
    if (dd.classList.contains("hidden")) {
        dd.classList.remove("hidden");
        // Focus search
        setTimeout(() => document.getElementById("fontSearch").focus(), 50);

        // Initial render if empty
        const list = document.getElementById("fontList");
        if (list.children.length === 0) {
            renderFontList(true);
        }
    } else {
        dd.classList.add("hidden");
    }
}

// ----------------------
// NEW FONT HANDLING LOGIC
// ----------------------

export async function preloadAllFonts() {
    // Renamed purpose: Fetch fonts from API, doesn't actually bulk load CSS anymore
    try {
        const response = await fetch("https://api.fontsource.org/v1/fonts");
        if (!response.ok) throw new Error("Failed to fetch fonts");
        const data = await response.json();

        // Map to our format and Filter for Google fonts
        // API returns { family: "Abril Fatface", category: "display", type: "google" ... }
        const fetchedFonts = data
            .filter(f => f.type === 'google')
            .map(f => ({
                name: f.family,
                category: f.category
            }));

        if (fetchedFonts.length > 0) {
            allFonts = fetchedFonts;

            // If dropdown is open, re-render
            if (!document.getElementById("fontDropdown").classList.contains("hidden")) {
                renderFontList(true);
            }
        }
    } catch (e) {
        console.error("Error fetching fonts:", e);
        // Fallback checks
        if (allFonts.length === 0) {
            // Should not happen as we init with initialFonts
        }
    }

    // Preload default font 'Poppins' to ensure it renders correctly
    loadGoogleFont("Poppins");
}

export function loadGoogleFont(fontName) {
    const id = "font-link-" + fontName.replace(/\s+/g, "-").toLowerCase();
    if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        // Load only 400, 700 weights for efficiency
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@400;700&display=swap`;
        document.head.appendChild(link);
    }
}

export function batchLoadFonts(fontNames) {
    // Create a batch URL provided it's not too long. 
    // Google Fonts API can handle multiple families separated by '&'.
    // family=Font1&family=Font2...
    // We'll do chunks of 20 to be safe.
    if (fontNames.length === 0) return;

    // Filter out already loaded ones
    const toLoad = fontNames.filter(name => {
        const id = "font-link-" + name.replace(/\s+/g, "-").toLowerCase();
        return !document.getElementById(id);
    });

    if (toLoad.length === 0) return;

    // For simplicity, just call loadGoogleFont for each. 
    // Modern HTTP/2 handles multiple requests well.
    toLoad.forEach(name => loadGoogleFont(name));
}


export function selectFont(fontName) {
    // Update Hidden Input
    document.getElementById("fontFamily").value = fontName;
    // Update Display
    const display = document.getElementById("selectedFontDisplay");
    display.innerText = fontName;
    display.style.fontFamily = `"${fontName}", sans-serif`;

    // Load Font (idempotent check inside)
    loadGoogleFont(fontName);

    // Hide Dropdown
    document.getElementById("fontDropdown").classList.add("hidden");

    // Trigger redraw immediately and reliably
    setTimeout(() => {
        drawCanvas();
        showToast(`Font changed to ${fontName}`);
    }, 0);
}

export function renderFontList(reset = false) {
    const list = document.getElementById("fontList");

    if (reset) {
        list.scrollTop = 0;
        list.innerHTML = "";
        fontListCursor = 0;
        // Re-filter
        filteredFonts = allFonts.filter(f => {
            const matchesCat = currentFontCat === "all" || f.category === currentFontCat;
            const matchesSearch = f.name.toLowerCase().includes(fontSearchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }

    if (filteredFonts.length === 0) {
        if (reset) {
            list.innerHTML = `<li class="py-2 pl-3 text-gray-500 text-sm">No fonts found</li>`;
        }
        return;
    }

    // Get next batch
    const batch = filteredFonts.slice(fontListCursor, fontListCursor + PAGE_SIZE);

    if (batch.length === 0) return; // No more items

    // Load fonts for this batch so they preview correctly
    batchLoadFonts(batch.map(f => f.name));

    const fragment = document.createDocumentFragment();

    batch.forEach(f => {
        const li = document.createElement("li");
        li.className = "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900 flex items-center justify-between";

        const nameSpan = document.createElement("span");
        nameSpan.innerText = f.name;
        // Inline style for preview
        nameSpan.style.fontFamily = `"${f.name}", sans-serif`;
        nameSpan.style.fontSize = "1.1em";

        li.appendChild(nameSpan);

        li.onclick = () => selectFont(f.name);
        fragment.appendChild(li);
    });

    list.appendChild(fragment);
    fontListCursor += batch.length;
}

export function setupFontListeners() {
    const search = document.getElementById("fontSearch");
    search.addEventListener("input", (e) => {
        fontSearchQuery = e.target.value;
        renderFontList(true);
    });

    const categories = document.getElementById("fontCategoryFilters");
    categories.addEventListener("click", (e) => {
        if (e.target.classList.contains("font-filter-btn")) {
            // Update active state
            document.querySelectorAll(".font-filter-btn").forEach(b => {
                b.classList.remove("bg-blue-600", "text-white", "active-filter");
                b.classList.add("bg-gray-100", "text-gray-700");
            });
            e.target.classList.remove("bg-gray-100", "text-gray-700");
            e.target.classList.add("bg-blue-600", "text-white", "active-filter");

            currentFontCat = e.target.dataset.cat;
            renderFontList(true);
        }
    });

    // Close dropdown if clicked outside
    document.addEventListener("click", function (e) {
        const dd = document.getElementById("fontDropdown");
        const btn = document.getElementById("fontSelectorBtn");
        if (!dd.classList.contains("hidden") && !dd.contains(e.target) && !btn.contains(e.target)) {
            dd.classList.add("hidden");
        }
    });

    // Infinite Scroll
    const list = document.getElementById("fontList");
    // Remove existing listeners? Not easily possible without storing the ref. 
    // But this setupFontListeners is called once.
    list.addEventListener("scroll", () => {
        if (list.scrollTop + list.clientHeight >= list.scrollHeight - 50) {
            renderFontList(false);
        }
    });
}

// SETUP GLOBAL LISTENERS
export function setupEventListeners() {
    // Add listeners
    document.getElementById("fillType").addEventListener("change", updateUiVisibility);
    document.getElementById("strokeEnabled").addEventListener("change", updateUiVisibility);
    document.getElementById("shadowType").addEventListener("change", updateUiVisibility);
    document.getElementById("bevelEnabled").addEventListener("change", () => {
        updateUiVisibility();
        drawCanvas();
    });
    document.getElementById("tracking").addEventListener("input", drawCanvas);
    document.getElementById("outlineWidth").addEventListener("input", drawCanvas);

    // Bevel Inputs
    ["bevelStyle", "bevelTechnique", "bevelAngle", "bevelAltitude", "bevelHighlightColor", "bevelShadowColor"].forEach(id => {
        document.getElementById(id).addEventListener("input", drawCanvas);
    });
    ["bevelSize", "bevelDepth", "bevelSoften", "bevelHighlightOpacity", "bevelShadowOpacity"].forEach(id => {
        document.getElementById(id).addEventListener("input", (e) => {
            // Update label
            let val = e.target.value;
            if (id.includes("Opacity") || id.includes("Depth")) val += "%";
            else val += "px";
            document.getElementById(id + "Val").innerText = val;
            drawCanvas();
        });
    });

    document.querySelectorAll("input[name='bevelDirection']").forEach(r => {
        r.addEventListener("change", drawCanvas);
    });

    // Glow Inputs
    document.getElementById("glowEnabled").addEventListener("change", () => {
        updateUiVisibility();
        drawCanvas();
    });
    ["glowType", "glowColor", "glowBlend"].forEach(id => {
        document.getElementById(id).addEventListener("input", drawCanvas);
    });
    ["glowOpacity", "glowSize", "glowSpread", "glowNoise"].forEach(id => {
        document.getElementById(id).addEventListener("input", (e) => {
            let val = e.target.value;
            if (id.includes("Opacity") || id.includes("Noise") || id.includes("Spread")) val += "%";
            if (document.getElementById(id + "Val")) {
                document.getElementById(id + "Val").innerText = val;
            }
            drawCanvas();
        });
    });
}
