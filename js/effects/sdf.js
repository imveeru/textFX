
export function computeDistanceField(alpha, dist, w, h, size, style) {
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

export function blurHeightMap(H, w, h, r) {
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
