// Gradient State with Opacity
let stops = [
    { pos: 0, color: "#ff0000", opacity: 100 },
    { pos: 100, color: "#0000ff", opacity: 100 }
];

function hexToRgba(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
}

function updateUiVisibility() {
    // Fill Logic
    const fillType = document.getElementById("fillType").value;
    const fillSolidOpts = document.getElementById("fillSolidOptions");
    const fillGradOpts = document.getElementById("fillGradientOptions");

    if (fillType === "solid") {
        fillSolidOpts.classList.remove("hidden");
        fillGradOpts.classList.add("hidden");
    } else {
        fillSolidOpts.classList.add("hidden");
        fillGradOpts.classList.remove("hidden");
        // Re-render editor when showing
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

        if (shadowType === "drop") {
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
}

// Add listeners
document.getElementById("fillType").addEventListener("change", updateUiVisibility);
document.getElementById("strokeEnabled").addEventListener("change", updateUiVisibility);
document.getElementById("shadowType").addEventListener("change", updateUiVisibility);
document.getElementById("tracking").addEventListener("input", drawCanvas);


function updateGradientPreview() {
    let preview = document.getElementById("gradientPreview");
    if (!preview) return; // Guard if element missing

    // Sort stops by position for correct rendering
    let sorted = [...stops].sort((a, b) => a.pos - b.pos);

    let gradientStr = sorted.map(s => `${hexToRgba(s.color, s.opacity)} ${s.pos}%`).join(", ");
    preview.style.background = `linear-gradient(to right, ${gradientStr})`;
}

function renderGradientEditor() {
    const list = document.getElementById("gradientStopsList");
    if (!list) return;
    list.innerHTML = "";

    stops.sort((a, b) => a.pos - b.pos).forEach((s, i) => {
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
            if (stops.length > 2) {
                stops.splice(i, 1);
                renderGradientEditor();
                updateGradientPreview();
                drawCanvas();
            } else {
                alert("Minimum 2 stops required.");
            }
        };

        row.append(colorInp, opContainer, posContainer, delBtn);
        list.appendChild(row);
    });
}

function addStop() {
    stops.push({ pos: 50, color: "#ffffff", opacity: 100 });
    renderGradientEditor();
    updateGradientPreview();
    drawCanvas();
}

function buildGradient(ctx, angle, width, height) {
    let rad = angle * Math.PI / 180;

    // Calculate simple bounding box center
    // Text draws from (0,0) baseline. Approx height is 'height' (fontSize).
    // Let's assume the gradient box is (0, -height) to (width, 0)
    let cx = width / 2;
    let cy = -height / 2;

    // Calculate a reasonably sized gradient vector centered on the text
    // This logic ensures 0% and 100% are somewhat near the text edges for typical angles
    // A simplified method: scale a unit vector by the text's diagonal / 2
    let diag = Math.sqrt(width * width + height * height);
    let len = diag / 2; // Half diagonal

    let x1 = cx - Math.cos(rad) * len;
    let y1 = cy - Math.sin(rad) * len;
    let x2 = cx + Math.cos(rad) * len;
    let y2 = cy + Math.sin(rad) * len;

    let g = ctx.createLinearGradient(x1, y1, x2, y2);

    // Sort stops to ensure validity
    let sorted = [...stops].sort((a, b) => a.pos - b.pos);
    sorted.forEach(s => g.addColorStop(s.pos / 100, hexToRgba(s.color, s.opacity)));
    return g;
}

function warpValue(t, i, m, inten) {
    if (t === "none") return 0;
    if (t === "arch") return -inten * ((i - m) ** 2 / (m ** 2)) + inten;
    if (t === "wave") return Math.sin(i * 0.6) * inten;
    if (t === "bulge") return inten * Math.cos((i - m) / m * Math.PI);
    if (t === "rise") return -(i - m) * (inten / m);
    if (t === "fisheye") { let d = (i - m) / m; return -inten * Math.exp(-(d * d) * 4); }
    return 0;
}

function drawShadow(ctx, ch, x, y, scale = 1) {
    let type = document.getElementById("shadowType").value;
    if (type === "none") return;

    let angle = parseFloat(document.getElementById("shadowAngle").value) * Math.PI / 180;
    let dist = parseFloat(document.getElementById("shadowDistance").value) * scale;
    let blur = parseFloat(document.getElementById("shadowBlur").value) * scale;
    let op = parseFloat(document.getElementById("shadowOpacity").value);
    let scol = document.getElementById("shadowColor").value;
    let depth = parseInt(document.getElementById("shadowDepth").value) * scale;

    let dx = Math.cos(angle) * dist;
    let dy = Math.sin(angle) * dist;

    ctx.save(); // Save main text fillStyle before applying shadow color/properties

    if (type === "drop") {
        ctx.shadowBlur = blur;
        ctx.shadowColor = scol + Math.floor(op * 255).toString(16);
        ctx.shadowOffsetX = dx;
        ctx.shadowOffsetY = dy;
        // The text is drawn here so the canvas applies the drop shadow
        ctx.fillText(ch, x, y);
        // Shadow props will be cleared by ctx.restore()
    }

    if (type === "block" || type === "3d") {
        ctx.fillStyle = scol;

        // Use depth for 3D and distance for block for clearer separation
        let extrusionAmount = (type === "block") ? dist : depth;
        let iterationCount = (type === "block") ? dist : depth;
        // Adjust iteration count for scale to avoid gaps or too many draws? 
        // Actually, for block shadow, iteration count usually matches pixels. 
        // If we scale up, we might need more iterations to keep it smooth.
        // Let's rely on the scaled 'extrusionAmount' which is basically length.

        // For performance on high-res, we might want to limit iterations or step size?
        // But for now, simple scaling:

        for (let i = 1; i <= iterationCount; i++) {
            ctx.fillText(ch, x + dx * (i / extrusionAmount), y + dy * (i / extrusionAmount));
        }
    }

    ctx.restore(); // Restore state, including main text fillStyle
}

let fontFlags = {
    bold: true,
    italic: false,
    underline: false,
    strike: false
};

function toggleStyle(type) {
    fontFlags[type] = !fontFlags[type];
    updateStyleButtons();
    drawCanvas();
}

function updateStyleButtons() {
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

    setBtn("btnBold", fontFlags.bold);
    setBtn("btnItalic", fontFlags.italic);
    setBtn("btnUnderline", fontFlags.underline);
    setBtn("btnStrike", fontFlags.strike);
}

function drawCanvas() {
    let c = document.getElementById("myCanvas");
    let ctx = c.getContext("2d");
    renderScene(c, ctx, 1);
}

function renderScene(canvas, ctx, scale = 1) {
    // Clear with scale-adjusted dimensions if needed, but usually we just clear the whole canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background with light gray to better distinguish shadows
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let text = document.getElementById("textInput").value;
    let fam = document.getElementById("fontFamily").value;
    // Scale pixel-dependent input values
    let size = parseInt(document.getElementById("fontSize").value) * scale;
    let tracking = (parseFloat(document.getElementById("tracking").value) || 0) * scale;

    // Construct font string from flags
    let wgt = fontFlags.bold ? "700" : "400";
    let sty = fontFlags.italic ? "italic" : "normal";

    // Font string with fallback
    ctx.font = `${sty} ${wgt} ${size}px ${fam}, sans-serif`;

    let warp = document.getElementById("warpType").value;
    // Warp intensity should also scale with resolution to maintain proportion
    let inten = parseFloat(document.getElementById("warpIntensity").value) * scale;

    // Calculate Text Width including tracking
    let chars = text.split("");
    let mid = chars.length / 2;

    let totalTextWidth = 0;
    chars.forEach((ch, i) => {
        totalTextWidth += ctx.measureText(ch).width;
        if (i < chars.length - 1) totalTextWidth += tracking;
    });

    // Center calculation based on current canvas dimensions
    let startX = (canvas.width - totalTextWidth) / 2;
    // Approximated vertical center
    let startY = canvas.height / 2 + size / 3;

    ctx.save();

    let fillType = document.getElementById("fillType").value;
    // Set the main text fillStyle
    if (fillType === "solid") ctx.fillStyle = document.getElementById("solidColor").value;
    if (fillType === "gradient") ctx.fillStyle = buildGradient(ctx, parseFloat(document.getElementById("gradAngle").value), totalTextWidth, size);

    let strokeEnabled = document.getElementById("strokeEnabled").checked;
    let strokeColor = document.getElementById("strokeColor").value;
    let strokeWidth = parseFloat(document.getElementById("strokeWidth").value) * scale;

    let x = startX;

    chars.forEach((ch, i) => {
        let warpOffsetY = warpValue(warp, i, mid, inten);
        let y = startY - warpOffsetY;

        // Draw shadow/3D first
        drawShadow(ctx, ch, x, y, scale);

        // Draw main text and stroke (uses the fillStyle set outside this loop)
        if (strokeEnabled) {
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = strokeColor;
            ctx.strokeText(ch, x, y);
        }

        ctx.fillText(ch, x, y);

        let m = ctx.measureText(ch);
        let cw = m.width;

        // Render Decorations (Underline / Strikethrough)
        if (fontFlags.underline) {
            ctx.fillRect(x, y + size * 0.1, cw, size * 0.07);
        }
        if (fontFlags.strike) {
            ctx.fillRect(x, y - size * 0.25, cw, size * 0.07);
        }

        x += cw + tracking;
    });

    ctx.restore();
}

function triggerExport() {
    const format = document.getElementById("exportFormat").value;

    if (format === "svg") {
        exportSVGInternal();
    } else if (format === "png" || format === "jpeg") {
        // High-Res Export (4x)
        const scale = 4;
        const width = 540 * scale; // 2160
        const height = 540 * scale; // 2160

        const offCanvas = document.createElement("canvas");
        offCanvas.width = width;
        offCanvas.height = height;
        const offCtx = offCanvas.getContext("2d");

        // Render scene to offscreen canvas
        renderScene(offCanvas, offCtx, scale);

        const mime = format === "png" ? "image/png" : "image/jpeg";
        const quality = format === "jpeg" ? 0.9 : undefined;
        const dataUrl = offCanvas.toDataURL(mime, quality);
        const ext = format === "png" ? "png" : "jpg";

        downloadDataUrl(dataUrl, `text_effect.${ext}`);
    }
}

function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a); // Required for Firefox/Chrome download attr
    a.click();
    document.body.removeChild(a);
}

function downloadBlob(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}


function exportSVGInternal() {
    const text = document.getElementById("textInput").value;
    const fam = document.getElementById("fontFamily").value;
    const size = parseInt(document.getElementById("fontSize").value);
    const wgt = fontFlags.bold ? "700" : "400";
    const sty = fontFlags.italic ? "italic" : "normal";

    const fillType = document.getElementById("fillType").value;
    const solidColor = document.getElementById("solidColor").value;
    const gradAngle = parseFloat(document.getElementById("gradAngle").value);

    const strokeEnabled = document.getElementById("strokeEnabled").checked;
    const strokeColor = document.getElementById("strokeColor").value;
    const strokeWidth = parseFloat(document.getElementById("strokeWidth").value);

    const shadowType = document.getElementById("shadowType").value;
    const shadowColor = document.getElementById("shadowColor").value;
    const shadowOpacity = parseFloat(document.getElementById("shadowOpacity").value);
    const shadowAngle = parseFloat(document.getElementById("shadowAngle").value) * Math.PI / 180;
    const shadowDist = parseFloat(document.getElementById("shadowDistance").value);
    const shadowBlur = parseFloat(document.getElementById("shadowBlur").value);
    const shadowDepth = parseInt(document.getElementById("shadowDepth").value);

    const warp = document.getElementById("warpType").value;
    const inten = parseFloat(document.getElementById("warpIntensity").value);

    // Calc shadow offsets
    const dx = Math.cos(shadowAngle) * shadowDist;
    const dy = Math.sin(shadowAngle) * shadowDist;

    // Canvas to measure text
    const ctx = document.getElementById("myCanvas").getContext("2d");
    ctx.font = `${sty} ${wgt} ${size}px ${fam}`;

    // SVG Header
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="540">`;

    // Background (matching canvas)
    svgContent += `<rect width="540" height="540" fill="#eeeeee"/>`;

    // DEFS
    let defs = "<defs>";

    // Gradient
    if (fillType === "gradient") {
        const rad = gradAngle * Math.PI / 180;
        // Match canvas 1400 unit gradient projection (legacy) -> update to 540 or diagonal
        const x2 = Math.cos(rad) * 540;
        const y2 = Math.sin(rad) * 540;

        defs += `<linearGradient id="grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${x2}" y2="${y2}">`;
        stops.forEach(s => {
            defs += `<stop offset="${s.pos}%" stop-color="${s.color}" />`;
        });
        defs += `</linearGradient>`;
    }

    // Drop Shadow Filter
    if (shadowType === "drop") {
        defs += `
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="${shadowBlur / 2}" result="blur"/>
            <feOffset in="blur" dx="${dx}" dy="${dy}" result="offsetBlur"/>
            <feFlood flood-color="${shadowColor}" flood-opacity="${shadowOpacity}" result="flood"/>
            <feComposite in="flood" in2="offsetBlur" operator="in" result="shadow"/>
            <feMerge>
                <feMergeNode in="shadow"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>`;
    }

    defs += "</defs>";
    svgContent += defs;

    // Group for translation (matching ctx.translate(100, 320))
    // We removed translation in canvas, effectively using 0,0 and absolute positioning
    svgContent += `<g transform="translate(0, 0)">`;

    const tracking = parseFloat(document.getElementById("tracking").value) || 0;

    const chars = text.split("");
    const mid = chars.length / 2;

    // Calculate total text width for centering
    let totalTextWidth = 0;
    chars.forEach((ch, i) => {
        let cw = ctx.measureText(ch).width;
        totalTextWidth += cw;
        if (i < chars.length - 1) totalTextWidth += tracking;
    });

    // Center starting positions
    // Canvas is 540x540
    // Center X
    let startX = (540 - totalTextWidth) / 2;
    // Center Y (approximate vertical centering based on font size)
    // Baseline is roughly at height/2 + size/3 for many fonts
    let startY = 540 / 2 + size / 3;

    let x = startX;

    chars.forEach((ch, i) => {
        // Calculate Y Warp (relative to original baseline Y which was 0 in loop logic, but applied to startY)
        // Warp logic assumes 0-based index vs mid.
        // We can keep warp logic as is, just offsetting the final y position.
        const warpOffsetY = warpValue(warp, i, mid, inten);
        const y = startY - warpOffsetY;

        // Use exact width from canvas
        const charWidth = ctx.measureText(ch).width;

        // Common Attributes
        const fontAttrs = `font-family="${fam}" font-size="${size}" font-weight="${wgt}" font-style="${sty}"`;
        const fillAttr = (fillType === "solid") ? `fill="${solidColor}"` : `fill="url(#grad)"`;
        const strokeAttr = strokeEnabled ? `stroke="${strokeColor}" stroke-width="${strokeWidth}"` : "";

        // SHADOWS (Block / 3D Loop)
        if (shadowType === "block" || shadowType === "3d") {
            let extrusionAmount = (shadowType === "block") ? shadowDist : shadowDepth;
            let iterationCount = (shadowType === "block") ? shadowDist : shadowDepth;

            // Loop for extrusion shadow layers
            for (let j = 1; j <= iterationCount; j++) {
                const sx = x + dx * (j / extrusionAmount);
                const sy = y + dy * (j / extrusionAmount);
                // Shadow layers are simple solid text
                svgContent += `<text x="${sx}" y="${sy}" ${fontAttrs} fill="${shadowColor}">${ch}</text>`;
            }
        }

        // MAIN TEXT
        let filterAttr = (shadowType === "drop") ? `filter="url(#dropShadow)"` : "";
        svgContent += `<text x="${x}" y="${y}" ${fontAttrs} ${fillAttr} ${strokeAttr} ${filterAttr}>${ch}</text>`;

        x += charWidth + tracking;
    });

    svgContent += `</g>`;
    svgContent += `</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    downloadBlob(blob, "text_effect.svg");
}

/* --- Font Selector Logic --- */

// Curated list of popular Google Fonts
const googleFonts = [
    { name: "Roboto", category: "sans-serif" },
    { name: "Open Sans", category: "sans-serif" },
    { name: "Lato", category: "sans-serif" },
    { name: "Montserrat", category: "sans-serif" },
    { name: "Poppins", category: "sans-serif" },
    { name: "Oswald", category: "sans-serif" },
    { name: "Raleway", category: "sans-serif" },
    { name: "Nunito", category: "sans-serif" },
    { name: "Merriweather", category: "serif" },
    { name: "Playfair Display", category: "serif" },
    { name: "Lora", category: "serif" },
    { name: "PT Serif", category: "serif" },
    { name: "Roboto Slab", category: "serif" },
    { name: "Bebas Neue", category: "display" },
    { name: "Lobster", category: "display" },
    { name: "Abril Fatface", category: "display" },
    { name: "Comfortaa", category: "display" },
    { name: "Dancing Script", category: "handwriting" },
    { name: "Pacifico", category: "handwriting" },
    { name: "Shadows Into Light", category: "handwriting" },
    { name: "Indie Flower", category: "handwriting" },
    { name: "Caveat", category: "handwriting" },
    { name: "Permanent Marker", category: "handwriting" },
    { name: "Inconsolata", category: "monospace" },
    { name: "Roboto Mono", category: "monospace" },
    { name: "Source Code Pro", category: "monospace" },
    { name: "Space Mono", category: "monospace" },
    { name: "Press Start 2P", category: "display" },
    { name: "Creepster", category: "display" },
    { name: "Bangers", category: "display" },
    { name: "Audiowide", category: "display" },
    { name: "Fredoka One", category: "display" },
    { name: "Righteous", category: "display" },
    { name: "Cinzel", category: "serif" },
    { name: "Anton", category: "sans-serif" },
    { name: "Fjalla One", category: "sans-serif" },
    { name: "Rubik", category: "sans-serif" },
    { name: "Kanit", category: "sans-serif" },
    { name: "Teko", category: "sans-serif" },
    { name: "Exo 2", category: "sans-serif" }
];

let currentFontCat = "all";
let fontSearchQuery = "";

function toggleFontDropdown() {
    const dd = document.getElementById("fontDropdown");
    dd.classList.toggle("hidden");
    if (!dd.classList.contains("hidden")) {
        document.getElementById("fontSearch").focus();
    }
}

// Close dropdown if clicked outside
document.addEventListener("click", function (e) {
    const dd = document.getElementById("fontDropdown");
    const btn = document.getElementById("fontSelectorBtn");
    if (!dd.classList.contains("hidden") && !dd.contains(e.target) && !btn.contains(e.target)) {
        dd.classList.add("hidden");
    }
});

// Batch load all fonts at once
function preloadAllFonts() {
    // Construct a single Google Fonts URL
    // Format: family=Font1:wght@400;700&family=Font2...
    const families = googleFonts.map(f => `family=${f.name.replace(/\s+/g, "+")}:wght@400;700`).join("&");
    const id = "google-fonts-batch";

    if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
        link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
        document.head.appendChild(link);
    }
}

function loadGoogleFont(fontName) {
    const id = "font-link-" + fontName.replace(/\s+/g, "-").toLowerCase();
    if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@400;700&display=swap`;
        document.head.appendChild(link);
    }
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.remove("opacity-0");
    setTimeout(() => {
        toast.classList.add("opacity-0");
    }, 2000);
}

function selectFont(fontName) {
    // Update Hidden Input
    document.getElementById("fontFamily").value = fontName;
    // Update Display
    document.getElementById("selectedFontDisplay").innerText = fontName;
    document.getElementById("selectedFontDisplay").style.fontFamily = `"${fontName}", sans-serif`;

    // Load Font (idempotent check inside)
    loadGoogleFont(fontName);

    // Hide Dropdown
    document.getElementById("fontDropdown").classList.add("hidden");

    // Trigger redraw immediately and reliably
    // Using setTimeout 0 helps execute draw after the DOM update cycle completes
    setTimeout(() => {
        drawCanvas();
        showToast(`Font changed to ${fontName}`);
    }, 0);
}

function renderFontList() {
    const list = document.getElementById("fontList");
    list.innerHTML = "";

    const filtered = googleFonts.filter(f => {
        const matchesCat = currentFontCat === "all" || f.category === currentFontCat;
        const matchesSearch = f.name.toLowerCase().includes(fontSearchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    filtered.forEach(f => {
        const li = document.createElement("li");
        li.className = "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900 flex items-center justify-between";

        const nameSpan = document.createElement("span");
        nameSpan.innerText = f.name;
        nameSpan.style.fontFamily = `"${f.name}", sans-serif`;
        nameSpan.style.fontSize = "1.1em";

        li.appendChild(nameSpan);

        li.onclick = () => selectFont(f.name);
        list.appendChild(li);
    });

    if (filtered.length === 0) {
        list.innerHTML = `<li class="py-2 pl-3 text-gray-500 text-sm">No fonts found</li>`;
    }
}

function setupFontListeners() {
    const search = document.getElementById("fontSearch");
    search.addEventListener("input", (e) => {
        fontSearchQuery = e.target.value;
        renderFontList();
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
            renderFontList();
        }
    });

    // Initial Render
    renderFontList();
}


window.onload = () => {
    // Initial Font Load (Batch)
    preloadAllFonts();

    // Explicitly set Poppins initial state
    selectFont("Poppins");

    updateStyleButtons(); // Initialize style button states
    renderGradientEditor();
    setupFontListeners();
    updateUiVisibility();
    // selectFont("Poppins") already calls drawCanvas via setTimeout 0
};

/* --- JSON Import Logic --- */

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const json = JSON.parse(e.target.result);
            applySettings(json);
            // Reset input so same file can be selected again if needed
            event.target.value = '';
        } catch (err) {
            console.error("Error parsing JSON", err);
            alert("Invalid JSON file");
        }
    };
    reader.readAsText(file);
}

function applySettings(data) {
    // 1. Content & Font
    if (data.content) {
        if (data.content.text) document.getElementById("textInput").value = data.content.text;
        if (data.content.fontSize) document.getElementById("fontSize").value = data.content.fontSize;
        if (data.content.tracking !== undefined) document.getElementById("tracking").value = data.content.tracking;

        if (data.content.fontFamily) {
            selectFont(data.content.fontFamily);
        }

        if (data.content.styles) {
            fontFlags.bold = !!data.content.styles.bold;
            fontFlags.italic = !!data.content.styles.italic;
            fontFlags.underline = !!data.content.styles.underline;
            fontFlags.strike = !!data.content.styles.strike;
            updateStyleButtons();
        }
    }

    // 2. Fill & Color
    if (data.fill) {
        document.getElementById("fillType").value = data.fill.type || "solid";

        if (data.fill.type === "solid") {
            if (data.fill.solidColor) document.getElementById("solidColor").value = data.fill.solidColor;
        } else if (data.fill.type === "gradient" && data.fill.gradient) {
            if (data.fill.gradient.angle !== undefined) {
                document.getElementById("gradAngle").value = data.fill.gradient.angle;
            }
            if (data.fill.gradient.stops && Array.isArray(data.fill.gradient.stops)) {
                // formatting check: ensure opacity and pos are numbers
                stops = data.fill.gradient.stops.map(s => ({
                    pos: parseFloat(s.pos),
                    color: s.color,
                    opacity: s.opacity !== undefined ? parseFloat(s.opacity) : 100
                }));
                renderGradientEditor();
                updateGradientPreview();
            }
        }
    }

    // 3. Stroke
    if (data.stroke) {
        document.getElementById("strokeEnabled").checked = !!data.stroke.enabled;
        if (data.stroke.color) document.getElementById("strokeColor").value = data.stroke.color;
        if (data.stroke.width !== undefined) document.getElementById("strokeWidth").value = data.stroke.width;
    }

    // 4. Shadow
    if (data.shadow) {
        document.getElementById("shadowType").value = data.shadow.type || "none";
        if (data.shadow.color) document.getElementById("shadowColor").value = data.shadow.color;
        if (data.shadow.opacity !== undefined) document.getElementById("shadowOpacity").value = data.shadow.opacity;
        if (data.shadow.angle !== undefined) document.getElementById("shadowAngle").value = data.shadow.angle;
        if (data.shadow.distance !== undefined) document.getElementById("shadowDistance").value = data.shadow.distance;
        if (data.shadow.blur !== undefined) document.getElementById("shadowBlur").value = data.shadow.blur;
        // Depth might be missing in some JSONs if not 3D, but good to check
        if (data.shadow.depth !== undefined) document.getElementById("shadowDepth").value = data.shadow.depth;
    }

    // 5. Warp
    if (data.warp) {
        document.getElementById("warpType").value = data.warp.type || "none";
        if (data.warp.intensity !== undefined) document.getElementById("warpIntensity").value = data.warp.intensity;
    }

    // Finalize
    updateUiVisibility();
    drawCanvas();
    showToast("Settings Imported");
}

