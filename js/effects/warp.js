
export function warpValue(t, i, m, inten) {
    if (t === "none") return 0;
    if (t === "arch") return -inten * ((i - m) ** 2 / (m ** 2)) + inten;
    if (t === "wave") return Math.sin(i * 0.6) * inten;
    if (t === "bulge") return inten * Math.cos((i - m) / m * Math.PI);
    if (t === "rise") return -(i - m) * (inten / m);
    if (t === "fisheye") { let d = (i - m) / m; return -inten * Math.exp(-(d * d) * 4); }
    return 0;
}
