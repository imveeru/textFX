
export function drawShadow(ctx, ch, x, y, scale = 1) {
    let type = document.getElementById("shadowType").value;
    if (type === "none") return;

    let fillType = document.getElementById("fillType").value;
    let isOutline = fillType.startsWith("outline");

    let angle = parseFloat(document.getElementById("shadowAngle").value) * Math.PI / 180;
    let dist = parseFloat(document.getElementById("shadowDistance").value) * scale;
    let blur = parseFloat(document.getElementById("shadowBlur").value) * scale;
    let op = parseFloat(document.getElementById("shadowOpacity").value);
    let scol = document.getElementById("shadowColor").value;
    let depth = parseInt(document.getElementById("shadowDepth").value) * scale;

    let dx = Math.cos(angle) * dist;
    let dy = Math.sin(angle) * dist;

    ctx.save(); // Save main text fillStyle before applying shadow color/properties

    if (isOutline) {
        ctx.lineWidth = 1.5 * scale; // Match main outline width
    }

    if (type === "drop") {
        ctx.shadowBlur = blur;
        ctx.shadowColor = scol + Math.floor(op * 255).toString(16).padStart(2, '0');
        ctx.shadowOffsetX = dx;
        ctx.shadowOffsetY = dy;

        if (isOutline) {
            ctx.strokeStyle = scol; // Outline shadow source
            ctx.strokeText(ch, x, y);
        } else {
            ctx.fillText(ch, x, y);
        }
    }

    if (type === "block" || type === "3d") {
        // Use depth for 3D and distance for block for clearer separation
        let extrusionAmount = (type === "block") ? dist : depth;
        let iterationCount = (type === "block") ? dist : depth;

        if (isOutline) {
            ctx.strokeStyle = scol;
            for (let i = 1; i <= iterationCount; i++) {
                ctx.strokeText(ch, x + dx * (i / extrusionAmount), y + dy * (i / extrusionAmount));
            }
        } else {
            ctx.fillStyle = scol;
            for (let i = 1; i <= iterationCount; i++) {
                ctx.fillText(ch, x + dx * (i / extrusionAmount), y + dy * (i / extrusionAmount));
            }
        }
    }

    ctx.restore(); // Restore state, including main text fillStyle
}

export function applyInnerShadow(ctx, width, height, scale) {
    const shadowColor = document.getElementById("shadowColor").value;
    const shadowOpacity = parseFloat(document.getElementById("shadowOpacity").value);
    const shadowBlur = parseFloat(document.getElementById("shadowBlur").value) * scale;
    const shadowAngle = parseFloat(document.getElementById("shadowAngle").value) * Math.PI / 180;
    const shadowDist = parseFloat(document.getElementById("shadowDistance").value) * scale;

    const dx = Math.cos(shadowAngle) * shadowDist;
    const dy = Math.sin(shadowAngle) * shadowDist;

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
