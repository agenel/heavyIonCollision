// Blackbody colour of a temperature in kelvin: Planck spectrum integrated against the CIE 1931 2° colour
// matching functions (multi-lobe fit of Wyman, Sloan & Shirley, JCGT 2 (2013) 1), converted to linear sRGB and
// normalised to max component 1. Visual mapping (V): the fireball uses T[K] = 13 * T[MeV], as in Blender.

function g(x, mu, s1, s2) { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); }
function cie(l) {           // l in nm
  const X = 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
  const Y = 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
  const Z = 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);
  return [X, Y, Z];
}
export function blackbodyRGB(TK) {
  const h = 6.62607015e-34, c = 2.99792458e8, k = 1.380649e-23;
  let X = 0, Y = 0, Z = 0;
  for (let l = 380; l <= 780; l += 5) {
    const lm = l * 1e-9, B = 1 / (lm ** 5 * (Math.exp((h * c) / (lm * k * TK)) - 1));
    const [x, y, z] = cie(l); X += B * x; Y += B * y; Z += B * z;
  }
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  r = Math.max(r, 0); gg = Math.max(gg, 0); b = Math.max(b, 0);
  const m = Math.max(r, gg, b) || 1;
  return [r / m, gg / m, b / m];
}

/** RGB table over T_MeV in [T0, T1] with the 13 K/MeV mapping (Float32 RGBA, n entries). */
export function blackbodyTable(T0 = 100, T1 = 600, n = 256, KperMeV = 13) {
  const out = new Float32Array(4 * n);
  for (let i = 0; i < n; i++) {
    const T = T0 + ((T1 - T0) * i) / (n - 1);
    const [r, g2, b] = blackbodyRGB(T * KperMeV);
    out.set([r, g2, b, 1], 4 * i);
  }
  return out;
}

export function cssBlackbody(TMeV, KperMeV = 13) {
  const [r, g2, b] = blackbodyRGB(Math.max(TMeV, 60) * KperMeV);
  const s = (v) => Math.round(255 * Math.pow(v, 1 / 2.2));
  return `rgb(${s(r)},${s(g2)},${s(b)})`;
}
