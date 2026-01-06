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

// Add listeners
document.getElementById("fillType").addEventListener("change", updateUiVisibility);
document.getElementById("strokeEnabled").addEventListener("change", updateUiVisibility);
document.getElementById("shadowType").addEventListener("change", updateUiVisibility);
document.getElementById("bevelEnabled").addEventListener("change", () => {
    updateUiVisibility();
    drawCanvas();
});
document.getElementById("tracking").addEventListener("input", drawCanvas);

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
        // Size is number but let's show px? Actually size input is number type not range for size? 
        // Wait, UI code uses input type="number" for Size.
        // Wait, index.html snippet: <input id="glowSize" type="number" ...>
        // But the listener logic above assumes range for some.
        // Let's just update the label if it exists. 
        // Glow Size doesn't have a label update in HTML snippet (no id="glowSizeVal").
        // But Opacity, Noise do.
        if (document.getElementById(id + "Val")) {
            document.getElementById(id + "Val").innerText = val;
        }
        drawCanvas();
    });
});


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

function applyInnerShadow(ctx, width, height, scale) {
    const shadowColor = document.getElementById("shadowColor").value;
    const shadowOpacity = parseFloat(document.getElementById("shadowOpacity").value);
    const shadowBlur = parseFloat(document.getElementById("shadowBlur").value) * scale;
    const shadowAngle = parseFloat(document.getElementById("shadowAngle").value) * Math.PI / 180;
    const shadowDist = parseFloat(document.getElementById("shadowDistance").value) * scale;

    const dx = Math.cos(shadowAngle) * shadowDist;
    const dy = Math.sin(shadowAngle) * shadowDist;

    // Create a temporary canvas for the inner shadow effect
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw the current text (which is already on the main ctx) onto the temp canvas
    // Wait, 'ctx' here is likely the offscreen buffer or the main canvas.
    // Inner shadow needs the source alpha of the text.
    // If we are calling this after drawing text, 'ctx' has the text.

    // Strategy:
    // 1. We need the text shape as a mask.
    // 2. We draw the shadow offset and blurred.
    // 3. We composite the shadow ONLY where the text exists (source-in)
    // 4. BUT, for inner shadow, we usually want the shadow INSIDE the text.
    //    Actually, "Inner Shadow" means the object casts a shadow inside itself?
    //    Or is it like a cutout?
    //    Standard Inner Shadow: The background outside casts a shadow onto the object.

    // Proper Inner Shadow Algo:
    // 1. Create a mask of the text (inverted or normal).
    // 2. Draw the inverted mask offset.
    // 3. Blur it.
    // 4. Clip it to the original text.

    // Let's use the 'ctx' (which presumably has the text) as the source.
    // To do this cleanly without reading pixels, it's best to draw the text again or use the existing alpha.

    // Easier approach since we have the render command in main loop:
    // We can't easily grab the "text only" from ctx if other things are there.
    // But in renderScene, we can setup a specific layer for inner shadow.

    // Let's assume 'ctx' passed here contains ONLY the text we want to shadow (plus maybe stroke).
    // Actually, renderScene draws text to 'drawCtx'.
    // If we want inner shadow, we should apply it to 'drawCtx' which might be an offscreen buffer.

    // Refined Inner Shadow Algo (Post-Process on Layer):
    // 1. 'ctx' has the text.
    // 2. Create 'shadowCtx'. Fit 'ctx' content? No.
    // 3. We use GlobalCompositeOperation.

    // Method:
    // 1. Draw text to a buffer (A).
    // 2. Prepare buffer (B) filled with Shadow Color.
    // 3. Cut A out of B (dest-out). B now has a hole in the shape of text.
    // 4. Blur B.
    // 5. Offset B.
    // 6. Draw B onto A using 'source-atop' (or 'source-in' of the shadow onto the text?).
    //    - 'source-atop': New shape (shadow) is drawn ONLY where it overlaps existing content (text).
    //    - AND we want the shadow to be the "hole's shadow".

    // Let's try simplified:
    // 1. Draw text usually.
    // 2. Set blend mode 'source-atop'. (Keeps opacity of implementation, changes color).
    // 3. Draw shadow (offset, blurred) ... wait.

    // Let's use the standard "Inverted Alpha" trick.
    // 1. Input: Canvas with opaque text.
    // 2. Shadow Canvas:
    //    - Fill with Shadow Color.
    //    - Destination-Out draw the text. (Now we have a color block with a transparent text-hole).
    //    - Apply Shadow Blur.
    //    - Apply Shadow Offset (by drawing this canvas offset?)
    // 3. Composite Shadow Canvas onto Input Canvas with 'source-atop'.
    //    - This draws the shadow content ONLY where input is opaque (inside text).
    //    - Since Shadow Canvas is "surrounding" color, the blur leaks INTO the hole.
    //    - By compositing "surrounding" atop "text", we see the leaked blur inside the text boundaries.

    tempCtx.drawImage(ctx.canvas, 0, 0); // Copy text
    tempCtx.globalCompositeOperation = "source-atop";
    tempCtx.fillStyle = shadowColor;
    // Wait, that just recolors.

    // Let's go with:
    // 1. helperCanvas = copy of text.
    // 2. shadowCanvas = fill entire bounds with shadowColor.
    // 3. shadowCanvas globalComposite = "destination-out". Draw helperCanvas.
    //    (shadowCanvas is now a colored rect with a text-shaped hole).
    // 4. ctx (original text) globalComposite = "source-atop".
    // 5. ctx draw shadowCanvas with offset (dx, dy) and blur.
    //    - Issue: shadowCanvas has valid pixels everywhere EXCEPT text.
    //    - If we draw it offset, the "hole" moves. The "solid" part covers the text.
    //    - We want the blur of the edge to cover the text.

    // Correct Canvas Inner Shadow:
    // 1. Save ctx.
    // 2. ctx.globalCompositeOperation = "source-atop"; (Only draw on top of existing text pixels)
    // 3. ctx.shadowBlur = blur;
    // 4. ctx.shadowColor = rgba(shadowColor, opacity);
    // 5. ctx.shadowOffsetX = dx;
    // 6. ctx.shadowOffsetY = dy;
    // 7. // Now the tricky part: We need to cast a shadow from "outside".
    // 8. Draw a shape that is "Everything EXCEPT the text".
    // 9. If we draw that shape with a shadow, the shadow will fall INTO the text hole (which is where our text is).
    // 10. Since we are 'source-atop', we only see the part of that shadow that falls on our text.

    // Implementation:
    // 1. Need a path or mask for "Everything except text".
    //    - Can't easily do vector path here since we use fillText.
    //    - Raster approach:

    // Raster Inner Shadow:
    // 1. 'ctx' has the text.
    // 2. 'mask' canvas: Fill opaque. 'destination-out' draw text. (Inverse of text).
    // 3. Back to 'ctx':
    //    - globalCompositeOperation = 'source-atop'.
    //    - shadowBlur, shadowColor, shadowOffset...
    //    - drawImage('mask', 0, 0).
    // This draws the "inverted text" (solid block with hole) onto the text.
    // The "solid block" casts a shadow.
    // The shadow goes into the hole.
    // Since we clipped to text ('source-atop'), we see the shadow inside.
    // The solid block itself (inverted text) also tries to draw.
    // But since it's the INVERSE, it doesn't overlap the text pixels!
    // So 'source-atop' clips away the solid block part (off-text), leaving only the shadow that bled onto the text.

    // One catch: If shadow distance is large, the solid block might shift and overlap text?
    // - We draw the mask at (0,0)? No, shadow offset handles the shift.
    // - Check: drawImage(mask, 0, 0) with shadowOffsetX.
    // - The mask has a hole at (x,y). Text is at (x,y).
    // - If we draw mask at (0,0), it doesn't overlap text.
    // - Shadow is shifted. The shadow of the "solid surrounding" naturally falls into the hole.

    // This seems correct and is the standard way.

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext("2d");

    // Fill mask with solid color (any, but opaque)
    maskCtx.fillStyle = "#000000";
    maskCtx.fillRect(0, 0, width, height);

    // Cut out the text
    maskCtx.globalCompositeOperation = "destination-out";
    maskCtx.drawImage(ctx.canvas, 0, 0);

    // Prepare Main Context for Inner Shadow
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";

    // Setup Shadow
    ctx.shadowColor = shadowColor + Math.floor(shadowOpacity * 255).toString(16).padStart(2, '0');
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = dx;
    ctx.shadowOffsetY = dy;

    // Draw the mask
    // The solid part of mask (outside text) casts shadow. 
    // The shadow falls into the hole (inside text).
    // 'source-atop' clips so we only see what falls on original text.
    ctx.drawImage(maskCanvas, 0, 0);

    ctx.restore();
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
    renderScene(c, ctx, 2);
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
    const fontStr = `${sty} ${wgt} ${size}px ${fam}, sans-serif`;

    // Font setting for measurement
    ctx.font = fontStr;

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

    // --- BEVEL OR INNER SHADOW SETUP ---
    const bevelEnabled = document.getElementById("bevelEnabled").checked;
    const shadowType = document.getElementById("shadowType").value;
    const innerShadowEnabled = (shadowType === "inner");
    const glowEnabled = document.getElementById("glowEnabled").checked;

    let drawCtx = ctx;
    let offCanvas = null;

    if (bevelEnabled || innerShadowEnabled || glowEnabled) {
        offCanvas = document.createElement("canvas");
        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;
        drawCtx = offCanvas.getContext("2d");
        // We don't fill background of offCanvas, we need transparent for alpha mask
    }

    // Set common props on target context
    drawCtx.save();
    drawCtx.font = fontStr;

    // Retrieve styles
    let fillType = document.getElementById("fillType").value;
    let fillStyleVal;
    if (fillType === "solid") fillStyleVal = document.getElementById("solidColor").value;
    if (fillType === "gradient") fillStyleVal = buildGradient(drawCtx, parseFloat(document.getElementById("gradAngle").value), totalTextWidth, size);

    drawCtx.fillStyle = fillStyleVal;

    let strokeEnabled = document.getElementById("strokeEnabled").checked;
    let strokeColor = document.getElementById("strokeColor").value;
    let strokeWidth = parseFloat(document.getElementById("strokeWidth").value) * scale;

    let x = startX;

    chars.forEach((ch, i) => {
        let warpOffsetY = warpValue(warp, i, mid, inten);
        let y = startY - warpOffsetY;

        // Draw shadow/3D first (ALWAYS to main ctx)
        // If we are passing 'ctx' to drawShadow, it needs correct warp/position.
        // And importantly, shadows are usually behind the text.
        // We use the 'ctx' (main canvas) for shadows.
        drawShadow(ctx, ch, x, y, scale);

        // Draw main text and stroke (uses the fillStyle set outside this loop)
        if (strokeEnabled) {
            drawCtx.lineWidth = strokeWidth;
            drawCtx.strokeStyle = strokeColor;
            drawCtx.strokeText(ch, x, y);
        }

        drawCtx.fillText(ch, x, y);

        let m = drawCtx.measureText(ch);
        let cw = m.width;

        // Render Decorations (Underline / Strikethrough)
        if (fontFlags.underline) {
            drawCtx.fillRect(x, y + size * 0.1, cw, size * 0.07);
        }
        if (fontFlags.strike) {
            drawCtx.fillRect(x, y - size * 0.25, cw, size * 0.07);
        }

        x += cw + tracking;
    });

    drawCtx.restore();

    // --- POST EFFECTS (Composite back) ---

    // Glow (Post-Effect)
    if (offCanvas) {
        // Glow (Outer) - Draw BEHIND text? 
        // Actually, we generally draw Outer Glow on the main canvas (ctx).
        // But we can do it here if we want.
        // Let's stick to the logic:
        // If Outer Glow: we draw it onto 'ctx' (which has BG/Shadows) BEFORE compositing 'offCanvas' (Text).

        const glowType = document.getElementById("glowType").value;
        // Note: applyGlowEffect draws to targetCtx.
        // For Outer Glow: target is ctx (main). Source is offCanvas (text shape).
        if (glowEnabled && glowType === "outer") {
            applyGlowEffect(ctx, offCanvas, scale, "outer");
        }

        // Inner Shadow (Draws to offCanvas)
        if (innerShadowEnabled) {
            applyInnerShadow(drawCtx, offCanvas.width, offCanvas.height, scale);
        }

        // Glow (Inner) - Draw ATOP text (Draws to offCanvas)
        if (glowEnabled && glowType === "inner") {
            applyGlowEffect(drawCtx, offCanvas, scale, "inner");
        }

        // Bevel (Draws to offCanvas)
        if (bevelEnabled) {
            applyBevelEffect(drawCtx, 0, 0, offCanvas.width, offCanvas.height, scale);
        }

        // Finally, composite Text (+ Inner Effects) onto Main Canvas
        ctx.drawImage(offCanvas, 0, 0);
    }
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

    if (shadowType === "inner") {
        // SVG Inner Shadow Filter
        // 1. offsetBlur = blur(SourceAlpha) + offset
        // 2. innerShadow = composite(offsetBlur, SourceAlpha, 'out') -> gets shadow inside? 
        //    Actually standard SVG inner shadow:
        //    <feComposite operator="out" in="SourceGraphic" in2="offsetBlur" result="inverse" />
        //    <feFlood flood-color="..." result="color" />
        //    <feComposite operator="in" in="color" in2="inverse" result="shadow" />
        //    <feComposite operator="over" in="shadow" in2="SourceGraphic" />

        // Simpler Standard Inner Shadow:
        // <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
        // <feOffset dx="4" dy="4"/>
        // <feUnknown... composite>

        // Correct Standard:
        // 1. SourceAlpha
        // 2. Flood (color) -> masked by SourceAlpha (actually we want inverse)

        // Let's use the standard "Shadow on Inverted Alpha then Clip" approach
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

    // Finalize
    updateUiVisibility();
    drawCanvas();
    showToast("Settings Imported");
}


/* --- Bevel & Emboss Logic --- */

function applyBevelEffect(ctx, x, y, width, height, scale = 1) {
    // 1. Get Image Data from the specific area
    // We purposefully get a slightly larger area to avoid edge artifacts if possible, 
    // but for now strict bounds:
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    const len = width * height;

    // Parameters
    const size = parseFloat(document.getElementById("bevelSize").value) * scale;
    const depth = parseFloat(document.getElementById("bevelDepth").value) / 100;
    const soften = parseFloat(document.getElementById("bevelSoften").value) * scale;
    const angle = parseFloat(document.getElementById("bevelAngle").value);
    const altitude = parseFloat(document.getElementById("bevelAltitude").value);
    const technique = document.getElementById("bevelTechnique").value;
    const style = document.getElementById("bevelStyle").value;
    const direction = document.querySelector('input[name="bevelDirection"]:checked').value;

    // Light Vector
    const radAngle = (angle - 90) * (Math.PI / 180); // Adjust for canvas coords
    const radAlt = altitude * (Math.PI / 180);
    const Lx = Math.cos(radAlt) * Math.cos(radAngle);
    const Ly = Math.cos(radAlt) * Math.sin(radAngle);
    const Lz = Math.sin(radAlt);

    // Colors
    const hCol = hexToRgb(document.getElementById("bevelHighlightColor").value);
    const hOp = parseFloat(document.getElementById("bevelHighlightOpacity").value) / 100;
    const sCol = hexToRgb(document.getElementById("bevelShadowColor").value);
    const sOp = parseFloat(document.getElementById("bevelShadowOpacity").value) / 100;

    // 2. Generate Alpha Map
    const alpha = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        alpha[i] = data[i * 4 + 3];
    }

    // 3. Compute Distance Field (SDF Approximation)
    // For real-time JS, a true EDT (Euclidean Distance Transform) is expensive.
    // We'll use a fast iterative approximation or a simple bounded search if size is small.
    // Given 'size' is usually < 50px, a brute force window or separable pass is okay.
    // Let's use a separable Dead Reckoning or just a simple multi-pass blur approximation for 'smooth'? 
    // No, 'Smooth' bevel usually implies specific rounded profile.
    // Let's implement a simple Chamfer Distance or Manhattan for speed, or Meijster if we want accurate.
    // For simplicity and effect: "Pseudo-SDF" via Repeated Box Blur or Erosion is common in old Photoshop implementations, 
    // but we can do a single pass EDT.

    const dist = new Float32Array(len);
    computeDistanceField(alpha, dist, width, height, size, style);

    // 4. Height Map
    const heightMap = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        // Normalize dist 0..1 based on size
        let d = dist[i];
        if (d > size) d = size;

        let h = d / size; // 0..1

        // Apply Technique/Profile
        if (technique === "chiselHard") {
            // Linear, essentially
        } else if (technique === "chiselSoft") {
            // Smoother linear
        } else {
            // Smooth (Sinusoidal or circular arc)
            h = Math.sin(h * Math.PI / 2);
        }

        // Direction & Style adjustments
        if (direction === "down") h = 1.0 - h;

        // Pillow emboss modify h... 
        if (style === "pillow") {
            // Pillow is like inner bevel + outer bevel logic combined? 
            // Or just a frequency modulation.
            // Simplified:
            h = Math.sin(h * Math.PI);
        }

        heightMap[i] = h * depth * 255; // Scale to some localized height factor
    }

    // Soften: Blur the height map
    if (soften > 0) {
        blurHeightMap(heightMap, width, height, soften);
    }

    // 5. Normal & Lighting
    // We compose directly into ImageData to avoid massive allocations
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = y * width + x;
            const a = alpha[i];

            if (a === 0 && style !== "outer") continue; // Optimization: skip empty pixels for inner styles

            // Compute Normal from Height Map
            // Sobel or central difference
            const dx = heightMap[i - 1] - heightMap[i + 1];
            const dy = heightMap[i - width] - heightMap[i + width];
            // const dz = 1.0; // Implicit step Z

            // Normalize (dx, dy, 1) effectively. 
            // We need to scale dx/dy by some factor representing pixel pitch vs height scale.

            const lenN = Math.sqrt(dx * dx + dy * dy + 1.0);
            const nx = dx / lenN;
            const ny = dy / lenN;
            const nz = 1.0 / lenN;

            // Diffuse: N dot L
            let diff = nx * Lx + ny * Ly + nz * Lz;

            // Specular: N dot H
            // View vector V = (0,0,1) for ortho 2D
            // H = normalize(L + V)
            const Vz = 1.0;
            const Hlen = Math.sqrt(Lx * Lx + Ly * Ly + (Lz + Vz) * (Lz + Vz));
            const Hx = Lx / Hlen;
            const Hy = Ly / Hlen;
            const Hz = (Lz + Vz) / Hlen;

            let spec = nx * Hx + ny * Hy + nz * Hz;
            spec = Math.max(0, spec);
            spec = Math.pow(spec, 32); // Hardcoded gloss for now, adds sharpness

            // Composite
            // We verify if we are in Highlight or Shadow state
            // If diff > 0 -> light? No, standard Phong:
            // Diffuse usually contributes to shadow in Emboss? 
            // Actually Emboss lighting is: 
            // Base + Highlight + Shadow.

            // Simplified Bevel Lighting Model:
            // Highlight where lighting is positive/strong
            // Shadow where lighting is negative/weak relative to surface

            // Let's stick to standard Blinn-Phong overlay

            // We need to blend highlight and shadow ON TOP of existing color.

            const rBase = data[i * 4];
            const gBase = data[i * 4 + 1];
            const bBase = data[i * 4 + 2];
            const aBase = data[i * 4 + 3];

            let rOut = rBase;
            let gOut = gBase;
            let bOut = bBase;

            // Apply Shadow (Multiply) or standard shadow logic
            // Light < 0 or low diffuse implies shadow. 
            // But with N dot L, usually diffuse factor 0..1 maps to dark..bright.

            // Standard Emboss:
            // Lighten parts facing light, Darken parts facing away.
            // diff range -1..1 possible?
            // With z-up L and z-up N, diff is mostly positive unless extreme angles.
            // Let's use the 'slope' logic often used in 2D bevels:
            // slope = (Nx*Lx + Ny*Ly); 
            // if slope > 0 highlight, else shadow.

            // Let's try separate contribution:
            const lightingTerm = (nx * Lx + ny * Ly);

            if (lightingTerm > 0) {
                // Highlight
                const amount = lightingTerm * hOp * (aBase / 255); // modulated by alpha
                rOut = rBase + (hCol.r - rBase) * amount;
                gOut = gBase + (hCol.g - gBase) * amount;
                bOut = bBase + (hCol.b - bBase) * amount;

                // Specular add
                if (spec > 0) {
                    const specAmount = spec * hOp * (aBase / 255);
                    rOut += hCol.r * specAmount;
                    gOut += hCol.g * specAmount;
                    bOut += hCol.b * specAmount;
                }
            } else {
                // Shadow
                const amount = -lightingTerm * sOp * (aBase / 255);
                rOut = rBase - (rBase - sCol.r) * amount;
                gOut = gBase - (gBase - sCol.g) * amount;
                bOut = bBase - (bBase - sCol.b) * amount;
            }

            data[i * 4] = Math.min(255, Math.max(0, rOut));
            data[i * 4 + 1] = Math.min(255, Math.max(0, gOut));
            data[i * 4 + 2] = Math.min(255, Math.max(0, bOut));
        }
    }

    ctx.putImageData(imageData, x, y);
}

function computeDistanceField(alpha, dist, w, h, size, style) {
    // Brute-force local search optimization
    // We only care about distance up to 'size'.
    // For each pixel, if random, search neighborhood.
    // Optimization: separate X and Y passes?
    // Using Meijster algorithm is O(N) but complex to impl in one go.
    // Let's use a restricted BFS or just a simple neighborhood scan since max size is usually small for text effects (10-20px).

    // Actually, for "Inner Bevel", we need distance to nearest 0-alpha pixel.
    // For "Outer Bevel", distance to nearest >0-alpha pixel.

    // Let's implement a naive O(Pixels * Size) approach which is fast enough for < 1000px canvas and < 20px bevel.

    const INF = 10000;

    // Helper: isInside
    const isInside = (i) => alpha[i] > 127; // Threshold

    // Brute-force local search optimization
    // We only care about distance up to 'size'.

    // Check if called from Glow (style outer/inner) or Bevel
    // Bevel styles: inner, outer, emboss, pillow
    // Glow styles: inner, outer

    // Interpretation:
    // Bevel "Inner": Distance to outside (nearest 0 alpha).
    // Bevel "Outer": Distance to inside (nearest >0 alpha).

    // Glow "Inner": Distance to outside (nearest 0 alpha). SAME.
    // Glow "Outer": Distance to inside (nearest >0 alpha). SAME.

    // So 'inner' means "calc distance inside the shape".
    // 'outer' means "calc distance outside the shape".
    // For Outer: compute dist to inside.

    // Initialize
    for (let i = 0; i < w * h; i++) {
        if (style === "inner" || style === "emboss" || style === "pillow") {
            dist[i] = isInside(i) ? INF : 0;
        } else {
            dist[i] = isInside(i) ? 0 : INF;
        }
    }

    // Chamfer distance pass (Forward)
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            if (dist[i] > 0) {
                const min = Math.min(
                    dist[i - 1] + 1,
                    dist[i - w] + 1,
                    dist[i - w - 1] + 1.414,
                    dist[i - w + 1] + 1.414
                );
                if (min < dist[i]) dist[i] = min;
            }
        }
    }
    // Backward
    for (let y = h - 2; y >= 1; y--) {
        for (let x = w - 2; x >= 1; x--) {
            const i = y * w + x;
            if (dist[i] > 0) {
                const min = Math.min(
                    dist[i],
                    dist[i + 1] + 1,
                    dist[i + w] + 1,
                    dist[i + w + 1] + 1.414,
                    dist[i + w - 1] + 1.414
                );
                if (min < dist[i]) dist[i] = min;
            }
        }
    }
}

function blurHeightMap(H, w, h, r) {
    // Simple box blur or approx gauss
    if (r < 1) return;
    const len = w * h;
    const temp = new Float32Array(len);

    // Horizontal
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let sum = 0;
            let count = 0;
            for (let k = -r; k <= r; k++) {
                const px = x + k;
                if (px >= 0 && px < w) {
                    sum += H[y * w + px];
                    count++;
                }
            }
            temp[y * w + x] = sum / count;
        }
    }
    // Vertical
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let sum = 0;
            let count = 0;
            for (let k = -r; k <= r; k++) {
                const py = y + k;
                if (py >= 0 && py < h) {
                    sum += temp[py * w + x];
                    count++;
                }
            }
            H[y * w + x] = sum / count; // Write back
        }
    }
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}


function applyGlowEffect(targetCtx, sourceCanvas, scale, type) {
    // 1. Parameters
    const color = hexToRgb(document.getElementById("glowColor").value);
    const opacity = parseFloat(document.getElementById("glowOpacity").value) / 100;
    const size = parseFloat(document.getElementById("glowSize").value) * scale;
    const spread = parseFloat(document.getElementById("glowSpread").value) / 100;
    const noise = parseFloat(document.getElementById("glowNoise").value) / 100;
    const blend = document.getElementById("glowBlend").value;

    if (size === 0) return;

    // 2. Get Source Alpha (from offscreen canvas which has text)
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const ctx = sourceCanvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const len = width * height;

    const alpha = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        alpha[i] = data[i * 4 + 3];
    }

    // 3. Compute Distance Field
    const dist = new Float32Array(len);
    // For Glow:
    // Inner Glow: needs dist to OPAQUE (inside). Style 'inner'.
    // Outer Glow: needs dist to TRANSPARENT (outside). Style 'outer'.

    computeDistanceField(alpha, dist, width, height, size * 2, type);

    // 4. Generate Glow Pixels
    const glowImg = targetCtx.createImageData(width, height);

    // Render glow to an offscreen buffer, then `drawImage` with blend mode.
    const renderCanvas = document.createElement("canvas");
    renderCanvas.width = width;
    renderCanvas.height = height;
    const renderCtx = renderCanvas.getContext("2d");
    const renderImg = renderCtx.createImageData(width, height);
    const rData = renderImg.data;

    for (let i = 0; i < len; i++) {
        let d = dist[i];

        // Normalize & Falloff
        let norm = d / size;
        if (norm > 1) norm = 1;

        let intensity;
        if (spread > 0.99) {
            intensity = (norm < 1) ? 1 : 0;
        } else {
            if (norm < spread) intensity = 1;
            else {
                intensity = 1.0 - (norm - spread) / (1.0 - spread);
            }
        }

        if (intensity < 0) intensity = 0;

        // Noise
        if (noise > 0 && intensity > 0) {
            const nVal = (Math.random() - 0.5) * noise;
            intensity += nVal;
            if (intensity > 1) intensity = 1;
            if (intensity < 0) intensity = 0;
        }

        // Masking Logic
        // Inner: Mask to Inside (alpha > 0)
        // Outer: Usually behind, but valid masking is often simply alpha modulation.
        //        Ideally Outer Glow is "outside text". If inside, distance is 0 -> intensity 1.
        //        So we should likely mask OUT the text for Outer Glow if we want "only outer".
        //        But standard "Outer Glow" usually implies "Behind". 
        //        If we draw behind, we don't strictly need to mask out the center, unless opacity is low.
        //        Let's allow it to fill center (behind text).

        if (type === "inner") {
            if (alpha[i] === 0) intensity = 0; // Cut to shape
        }

        if (intensity > 0) {
            rData[i * 4] = color.r;
            rData[i * 4 + 1] = color.g;
            rData[i * 4 + 2] = color.b;
            rData[i * 4 + 3] = intensity * 255 * opacity;
        }
    }

    renderCtx.putImageData(renderImg, 0, 0);

    // Composite
    targetCtx.save();
    targetCtx.globalCompositeOperation = blend;

    // Detailed Inner Glow Compositing
    if (type === "inner") {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = width; maskCanvas.height = height;
        const mCtx = maskCanvas.getContext("2d");
        mCtx.putImageData(imageData, 0, 0);

        // Clip glow to text
        renderCtx.globalCompositeOperation = "destination-in";
        renderCtx.drawImage(maskCanvas, 0, 0);

        // Now draw clipped glow atop target with blend
        targetCtx.globalCompositeOperation = blend === "normal" ? "source-atop" : blend;
        if (targetCtx.globalCompositeOperation !== blend) {
            // Fallback if browser doesn't support complex blend + source-atop?
            // Actually 'source-atop' is a composite op, 'screen' is a blend mode.
            // Canvas 2D uses globalCompositeOperation for both. You can't mix easily.
            // If user wants 'screen' inner glow:
            // We drew glow clipped to text in 'renderCanvas'.
            // If we draw 'renderCanvas' with 'screen' over 'targetCtx', it works, BUT 
            // it might draw over transparent areas if 'renderCanvas' has pixels there?
            // No, we clipped 'renderCanvas' to text.
            // So valid pixels only exist where text exists.
            targetCtx.globalCompositeOperation = blend;
            // But we must ensure we don't draw outside text? 
            // Yes, clipping handled that.

            // HOWEVER, for Inner Glow to be strictly "Inner", it shouldn't bleed out.
            // Clipping ensures that.

            // EXCEPT: 'source-atop' ensures we trace the alpha of the DESTINATION.
            // If we just use 'blend', we rely on renderCanvas's alpha.
            // That should be fine if clipping was correct.
        }
    }

    targetCtx.drawImage(renderCanvas, 0, 0);
    targetCtx.restore();
}

function hexToRgb(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}


// Expose functions to global scope
window.drawCanvas = drawCanvas;
window.toggleFontDropdown = toggleFontDropdown;
window.updateUiVisibility = updateUiVisibility;

function toggleFontDropdown() {
    const dd = document.getElementById("fontDropdown");
    if (dd.classList.contains("hidden")) {
        dd.classList.remove("hidden");
        // Focus search
        setTimeout(() => document.getElementById("fontSearch").focus(), 50);
    } else {
        dd.classList.add("hidden");
    }
}

// Initialize
// Initial render
// We can rely on window.onload or just run it if script is at end of body (it is)
// But let's verify googleFonts is loaded or we load it?
// Assuming googleFonts array is defined elsewhere or we need to define it.
