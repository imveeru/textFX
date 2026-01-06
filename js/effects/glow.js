
import { hexToRgb } from "../utils.js";
import { computeDistanceField } from "./sdf.js";

export function applyGlowEffect(targetCtx, sourceCanvas, scale, type) {
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
        // targetCtx.globalCompositeOperation = blend === "normal" ? "source-atop" : blend;
        // See comments in original file.
        targetCtx.globalCompositeOperation = blend;
    }

    targetCtx.drawImage(renderCanvas, 0, 0);
    targetCtx.restore();
}
