
import { appState } from "./state.js";
import { downloadDataUrl, downloadBlob, showToast } from "./utils.js";
import { renderScene } from "./render.js";
import { warpValue } from "./effects/warp.js";
import { updateUiVisibility, selectFont, updateStyleButtons, renderGradientEditor, updateGradientPreview } from "./ui.js";

// We need to re-import updateUiVisibility etc because applySettings calls them.
// But circular dependency UI <-> Export (if export calls UI functions).
// UI calls export (triggerExport).
// Export calls UI (applySettings -> selectFont etc).
// This is circular.
// Ideally applySettings should be in logic/controller, not strictly UI?
// Or import what we need. Cyclic imports are allowed in ES Modules if handled carefully.
// Let's proceed.

export function triggerExport() {
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
    } else if (format === "json") {
        exportJson();
    }
}

export function exportJson() {
    const text = document.getElementById("textInput").value;
    const fam = document.getElementById("fontFamily").value;
    // Note: Use the raw input values, not scaled ones, for preservation
    const size = parseInt(document.getElementById("fontSize").value);
    const tracking = parseFloat(document.getElementById("tracking").value);

    const fillType = document.getElementById("fillType").value;
    const outlineWidth = parseFloat(document.getElementById("outlineWidth").value);
    const gradType = document.getElementById("gradType").value;
    // Gradient stops are already in 'stops' global (appState.stops)
    const solidColor = document.getElementById("solidColor").value;
    const gradAngle = parseFloat(document.getElementById("gradAngle").value);

    const strokeEnabled = document.getElementById("strokeEnabled").checked;
    const strokeColor = document.getElementById("strokeColor").value;
    const strokeWidth = parseFloat(document.getElementById("strokeWidth").value);

    // Shadow
    const shadowType = document.getElementById("shadowType").value;
    const shadowColor = document.getElementById("shadowColor").value;
    const shadowOpacity = parseFloat(document.getElementById("shadowOpacity").value);
    const shadowAngle = parseFloat(document.getElementById("shadowAngle").value);
    const shadowDist = parseFloat(document.getElementById("shadowDistance").value);
    const shadowBlur = parseFloat(document.getElementById("shadowBlur").value);
    const shadowDepth = parseFloat(document.getElementById("shadowDepth").value);

    // Bevel
    const bevelEnabled = document.getElementById("bevelEnabled").checked;
    const bevelStyle = document.getElementById("bevelStyle").value;
    const bevelTechnique = document.getElementById("bevelTechnique").value;
    const bevelDirList = document.getElementsByName("bevelDirection");
    let bevelDirection = "up";
    for (let r of bevelDirList) if (r.checked) bevelDirection = r.value;

    const bevelSize = parseFloat(document.getElementById("bevelSize").value);
    const bevelDepth = parseFloat(document.getElementById("bevelDepth").value);
    const bevelSoften = parseFloat(document.getElementById("bevelSoften").value);
    const bevelAngle = parseFloat(document.getElementById("bevelAngle").value);
    const bevelAltitude = parseFloat(document.getElementById("bevelAltitude").value);
    const bevelHighlightColor = document.getElementById("bevelHighlightColor").value;
    const bevelHighlightOpacity = parseFloat(document.getElementById("bevelHighlightOpacity").value);
    const bevelShadowColor = document.getElementById("bevelShadowColor").value;
    const bevelShadowOpacity = parseFloat(document.getElementById("bevelShadowOpacity").value);

    // Glow
    const glowEnabled = document.getElementById("glowEnabled").checked;
    const glowType = document.getElementById("glowType").value;
    const glowColor = document.getElementById("glowColor").value;
    const glowBlend = document.getElementById("glowBlend").value;
    const glowOpacity = parseFloat(document.getElementById("glowOpacity").value);
    const glowSize = parseFloat(document.getElementById("glowSize").value);
    const glowSpread = parseFloat(document.getElementById("glowSpread").value);
    const glowNoise = parseFloat(document.getElementById("glowNoise").value);

    // Warp
    const warpType = document.getElementById("warpType").value;
    const warpIntensity = parseFloat(document.getElementById("warpIntensity").value);

    // Construct conditional style objects
    const mkStyle = (enabled, params) => enabled ? { enabled: true, ...params } : { enabled: false };

    const data = {
        content: {
            text: text,
            fontFamily: fam,
            fontSize: size,
            tracking: tracking,
            styles: {
                bold: appState.fontFlags.bold,
                italic: appState.fontFlags.italic,
                underline: appState.fontFlags.underline,
                strike: appState.fontFlags.strike
            }
        },
        fill: {
            type: fillType,
            solid: mkStyle(fillType === "solid" || fillType === "outline", {
                color: solidColor
            }),
            gradient: mkStyle(fillType === "gradient", {
                type: gradType,
                angle: gradAngle,
                stops: appState.stops
            })
        },
        stroke: mkStyle(strokeEnabled, {
            color: strokeColor,
            width: strokeWidth
        }),
        shadow: mkStyle(shadowType !== "none", {
            type: shadowType,
            color: shadowColor,
            opacity: shadowOpacity,
            angle: shadowAngle,
            distance: shadowDist,
            blur: shadowBlur,
            depth: shadowDepth
        }),
        bevel: mkStyle(bevelEnabled, {
            style: bevelStyle,
            technique: bevelTechnique,
            direction: bevelDirection,
            size: bevelSize,
            depth: bevelDepth,
            soften: bevelSoften,
            angle: bevelAngle,
            altitude: bevelAltitude,
            highlight: {
                color: bevelHighlightColor,
                opacity: bevelHighlightOpacity
            },
            shadow: {
                color: bevelShadowColor,
                opacity: bevelShadowOpacity
            }
        }),
        glow: mkStyle(glowEnabled, {
            type: glowType,
            color: glowColor,
            blend: glowBlend,
            opacity: glowOpacity,
            size: glowSize,
            spread: glowSpread,
            noise: glowNoise
        }),
        warp: mkStyle(warpType !== "none", {
            type: warpType,
            intensity: warpIntensity
        })
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    downloadBlob(blob, "text_effect.json");
}

function exportSVGInternal() {
    const text = document.getElementById("textInput").value;
    const fam = document.getElementById("fontFamily").value;
    const size = parseInt(document.getElementById("fontSize").value);
    const wgt = appState.fontFlags.bold ? "700" : "400";
    const sty = appState.fontFlags.italic ? "italic" : "normal";

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
        appState.stops.forEach(s => {
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

    if (shadowType === "inner") {
        defs += `
        <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <!-- Shadow mechanism -->
            <feFlood flood-color="${shadowColor}" flood-opacity="${shadowOpacity}"/>
            <feComposite operator="out" in2="SourceGraphic"/>
            <feGaussianBlur stdDeviation="${shadowBlur / 2}"/>
            <feOffset dx="${dx}" dy="${dy}"/>
            <feComposite operator="atop" in2="SourceGraphic"/>
        </filter>`;
    }

    defs += "</defs>";
    svgContent += defs;

    // Group for translation 
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
    let startX = (540 - totalTextWidth) / 2;
    let startY = 540 / 2 + size / 3;

    let x = startX;

    chars.forEach((ch, i) => {
        const warpOffsetY = warpValue(warp, i, mid, inten);
        const y = startY - warpOffsetY;

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
        let filterAttr = "";
        if (shadowType === "drop") filterAttr = `filter="url(#dropShadow)"`;
        if (shadowType === "inner") filterAttr = `filter="url(#innerShadow)"`;
        svgContent += `<text x="${x}" y="${y}" ${fontAttrs} ${fillAttr} ${strokeAttr} ${filterAttr}>${ch}</text>`;

        x += charWidth + tracking;
    });

    svgContent += `</g>`;
    svgContent += `</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    downloadBlob(blob, "text_effect.svg");
}

export function handleFileSelect(event) {
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

export function applySettings(data) {
    // 1. Content & Font
    if (data.content) {
        if (data.content.text) document.getElementById("textInput").value = data.content.text;
        if (data.content.fontSize) document.getElementById("fontSize").value = data.content.fontSize;
        if (data.content.tracking !== undefined) document.getElementById("tracking").value = data.content.tracking;

        if (data.content.fontFamily) {
            selectFont(data.content.fontFamily);
        }

        if (data.content.styles) {
            appState.fontFlags.bold = !!data.content.styles.bold;
            appState.fontFlags.italic = !!data.content.styles.italic;
            appState.fontFlags.underline = !!data.content.styles.underline;
            appState.fontFlags.strike = !!data.content.styles.strike;
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
                // Modify state array
                appState.stops.length = 0; // Clear
                data.fill.gradient.stops.forEach(s => {
                    appState.stops.push({
                        pos: parseFloat(s.pos),
                        color: s.color,
                        opacity: s.opacity !== undefined ? parseFloat(s.opacity) : 100
                    });
                });
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
        if (data.shadow.depth !== undefined) document.getElementById("shadowDepth").value = data.shadow.depth;
    }

    // 5. Warp
    if (data.warp) {
        document.getElementById("warpType").value = data.warp.type || "none";
        if (data.warp.intensity !== undefined) document.getElementById("warpIntensity").value = data.warp.intensity;
    }

    // 6. Bevel
    if (data.bevel) {
        document.getElementById("bevelEnabled").checked = !!data.bevel.enabled;
        if (data.bevel.style) document.getElementById("bevelStyle").value = data.bevel.style;
        if (data.bevel.technique) document.getElementById("bevelTechnique").value = data.bevel.technique;
        if (data.bevel.direction) {
            const rad = document.querySelector(`input[name="bevelDirection"][value="${data.bevel.direction}"]`);
            if (rad) rad.checked = true;
        }
        if (data.bevel.size !== undefined) {
            document.getElementById("bevelSize").value = data.bevel.size;
            document.getElementById("bevelSizeVal").innerText = data.bevel.size + "px";
        }
        if (data.bevel.depth !== undefined) {
            document.getElementById("bevelDepth").value = data.bevel.depth;
            document.getElementById("bevelDepthVal").innerText = data.bevel.depth + "%";
        }
        if (data.bevel.soften !== undefined) {
            document.getElementById("bevelSoften").value = data.bevel.soften;
            document.getElementById("bevelSoftenVal").innerText = data.bevel.soften + "px";
        }
        if (data.bevel.angle !== undefined) document.getElementById("bevelAngle").value = data.bevel.angle;
        if (data.bevel.altitude !== undefined) document.getElementById("bevelAltitude").value = data.bevel.altitude;
        if (data.bevel.highlightColor) document.getElementById("bevelHighlightColor").value = data.bevel.highlightColor;
        if (data.bevel.highlightOpacity !== undefined) {
            document.getElementById("bevelHighlightOpacity").value = data.bevel.highlightOpacity;
            document.getElementById("bevelHighlightOpVal").innerText = data.bevel.highlightOpacity + "%";
        }
        if (data.bevel.shadowColor) document.getElementById("bevelShadowColor").value = data.bevel.shadowColor;
        if (data.bevel.shadowOpacity !== undefined) {
            document.getElementById("bevelShadowOpacity").value = data.bevel.shadowOpacity;
            document.getElementById("bevelShadowOpVal").innerText = data.bevel.shadowOpacity + "%";
        }
    }

    // 7. Glow
    if (data.glow) {
        document.getElementById("glowEnabled").checked = !!data.glow.enabled;
        if (data.glow.type) document.getElementById("glowType").value = data.glow.type;
        if (data.glow.color) document.getElementById("glowColor").value = data.glow.color;
        if (data.glow.blend) document.getElementById("glowBlend").value = data.glow.blend;
        if (data.glow.opacity !== undefined) {
            document.getElementById("glowOpacity").value = data.glow.opacity;
            if (document.getElementById("glowOpacityVal")) document.getElementById("glowOpacityVal").innerText = data.glow.opacity + "%";
        }
        if (data.glow.size !== undefined) document.getElementById("glowSize").value = data.glow.size;
        if (data.glow.spread !== undefined) {
            document.getElementById("glowSpread").value = data.glow.spread;
            if (document.getElementById("glowSpreadVal")) document.getElementById("glowSpreadVal").innerText = data.glow.spread + "%";
        }
        if (data.glow.noise !== undefined) {
            document.getElementById("glowNoise").value = data.glow.noise;
            if (document.getElementById("glowNoiseVal")) document.getElementById("glowNoiseVal").innerText = data.glow.noise + "%";
        }
    }


    // Finalize
    updateUiVisibility();
    drawCanvas();
    showToast("Settings Imported");
}
