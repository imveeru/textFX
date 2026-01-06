
import { appState } from "./state.js";
import { warpValue } from "./effects/warp.js";
import { buildGradient } from "./effects/gradient.js";
import { drawShadow, applyInnerShadow } from "./effects/shadow.js";
import { applyGlowEffect } from "./effects/glow.js";
import { applyBevelEffect } from "./effects/bevel.js";

// Make drawCanvas available globally if needed for HTML onclick attributes,
// but checking ui.js, it seems we attach listeners, so maybe not strictly needed globally.
// EXCEPT index.html has onclick="drawCanvas()" in button.
// So we MUST expose it to window.
export function drawCanvas() {
    let c = document.getElementById("myCanvas");
    let ctx = c.getContext("2d");
    renderScene(c, ctx, 2);
}

export function renderScene(canvas, ctx, scale = 1) {
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
    let wgt = appState.fontFlags.bold ? "700" : "400";
    let sty = appState.fontFlags.italic ? "italic" : "normal";
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
    if (fillType === "solid" || fillType === "outline_solid") fillStyleVal = document.getElementById("solidColor").value;
    if (fillType === "gradient" || fillType === "outline_gradient") {
        // Gradient needs to be centered on the text.
        // Center X is exactly mid-canvas because we centered startX calculation.
        // Center Y is roughly mid-canvas (startY - size/2 roughly).
        // Let's use the bounding box center:
        let cx = canvas.width / 2;
        // StartY is baseline. Top is roughly startY - size.
        // Middle is startY - size/2.
        let cy = startY - size * 0.35; // Fine tune based on baseline

        fillStyleVal = buildGradient(drawCtx, parseFloat(document.getElementById("gradAngle").value), cx, cy, totalTextWidth, size);
    }

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
        // Draw main text and stroke (uses the fillStyle set outside this loop)
        if (strokeEnabled) {
            drawCtx.lineWidth = strokeWidth;
            drawCtx.strokeStyle = strokeColor;
            drawCtx.strokeText(ch, x, y);
        }

        if (fillType.startsWith("outline")) {
            let outlineW = parseFloat(document.getElementById("outlineWidth").value) * scale;
            drawCtx.lineWidth = outlineW;
            drawCtx.strokeStyle = fillStyleVal;
            drawCtx.strokeText(ch, x, y);
        } else {
            drawCtx.fillText(ch, x, y);
        }

        let m = drawCtx.measureText(ch);
        let cw = m.width;

        // Render Decorations (Underline / Strikethrough)
        if (appState.fontFlags.underline) {
            drawCtx.fillRect(x, y + size * 0.1, cw, size * 0.07);
        }
        if (appState.fontFlags.strike) {
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
