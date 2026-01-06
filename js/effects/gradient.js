
import { hexToRgba } from "../utils.js";
import { appState } from "../state.js";

export function buildGradient(ctx, angle, cx, cy, width, height) {
    let type = document.getElementById("gradType").value;
    let sorted = [...appState.stops].sort((a, b) => a.pos - b.pos);
    let g;

    if (type === "radial") {
        // Radial Gradient: Center to edge
        // Use max dimension to ensure coverage
        let r = Math.max(width, height) / 2;
        g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    } else {
        // Linear Gradient (Existing)
        let rad = angle * Math.PI / 180;
        let diag = Math.sqrt(width * width + height * height);
        let len = diag / 2;

        let x1 = cx - Math.cos(rad) * len;
        let y1 = cy - Math.sin(rad) * len;
        let x2 = cx + Math.cos(rad) * len;
        let y2 = cy + Math.sin(rad) * len;

        g = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    sorted.forEach(s => g.addColorStop(s.pos / 100, hexToRgba(s.color, s.opacity)));
    return g;
}
