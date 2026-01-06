
import { hexToRgb } from "../utils.js";
import { computeDistanceField, blurHeightMap } from "./sdf.js";

export function applyBevelEffect(ctx, x, y, width, height, scale = 1) {
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
