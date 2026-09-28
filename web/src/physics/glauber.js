// Port of hic_core/glauber.py + kinematics.py (black-disk NN profile).
// Coordinates: beam along z, impact parameter along x; nucleus A at x = -b/2 moving +z, B at +b/2 moving -z.
import { interp } from "./util.js";
import { params, resolve } from "./nuclei.js";

// ---------------------------------------------------------------- kinematics
export const gamma = (D, s) => s / (2 * D.constants.M_NUCLEON);
export const beta = (D, s) => Math.sqrt(1 - 1 / gamma(D, s) ** 2);
export const yBeam = (D, s) => Math.acosh(gamma(D, s));
export const crossingTime = (D, R, s) => (2 * R / gamma(D, s)) / beta(D, s);

/** Inelastic NN cross section (mb): tabulated preset within 1 %, else the dEL20 fit a + b ln^n s. */
export function sigmaNN(D, sqrtS) {
  for (const [k, v] of Object.entries(D.sigma_nn.presets)) {
    if (Math.abs(+k - sqrtS) <= 0.01 * +k) return +v;
  }
  const { a, b, n } = D.sigma_nn.fit;
  return a + b * Math.log(sqrtS * sqrtS) ** n;
}
export const diskDiameter = (sigmaMb) => Math.sqrt((sigmaMb * 0.1) / Math.PI);

export function systemKey(D, A, B, sqrtS) {
  const short = { Pb208: "Pb", Au197: "Au", Xe129: "Xe", Cu63: "Cu", U238: "U", Ru96: "Ru", Zr96: "Zr", O16: "O", Ne20: "Ne", He3: "He3", d: "d", p: "p" };
  const a = resolve(D, A), b = resolve(D, B);
  return `${short[a] ?? a}${short[b] ?? b}_${Math.round(sqrtS)}`;
}

// ---------------------------------------------------------------- collision at a given b
/**
 * nucA/nucB: results of sampleNucleus (rest-frame positions). Returns participant flags, binary pairs,
 * N_part, N_coll, eccentricities and overlap area for impact parameter b. Pure function of (nuclei, b).
 */
export function collide(D, sys, nucA, nucB, b) {
  const sig = sigmaNN(D, sys.sqrt_snn);
  const D2 = diskDiameter(sig) ** 2;
  const nA = nucA.A, nB = nucB.A;
  const ncollA = new Uint16Array(nA), ncollB = new Uint16Array(nB);
  const pairs = [];
  for (let i = 0; i < nA; i++) {
    const xa = nucA.pos[3 * i] - b / 2, ya = nucA.pos[3 * i + 1];
    for (let j = 0; j < nB; j++) {
      const dx = xa - (nucB.pos[3 * j] + b / 2), dy = ya - nucB.pos[3 * j + 1];
      if (dx * dx + dy * dy < D2) { ncollA[i]++; ncollB[j]++; pairs.push(i, j); }
    }
  }
  let npart = 0;
  const xy = [];
  for (let i = 0; i < nA; i++) if (ncollA[i] > 0) { npart++; xy.push(nucA.pos[3 * i] - b / 2, nucA.pos[3 * i + 1]); }
  for (let j = 0; j < nB; j++) if (ncollB[j] > 0) { npart++; xy.push(nucB.pos[3 * j] + b / 2, nucB.pos[3 * j + 1]); }
  const { eps, psi } = eccentricities(xy);
  return { b, sigmaNN: sig, ncollA, ncollB, pairs, npart, ncoll: pairs.length / 2, eps, psi,
    area: overlapArea(xy), partXY: Float64Array.from(xy) };
}

/** Participant-plane eccentricities with r^n weighting (LKD18 convention), Psi_n along the short axis. */
export function eccentricities(xy, orders = [2, 3, 4, 5]) {
  const n = xy.length / 2;
  const eps = {}, psi = {};
  if (n < 2) { for (const o of orders) { eps[o] = 0; psi[o] = 0; } return { eps, psi }; }
  let cx = 0, cy = 0;
  for (let i = 0; i < n; i++) { cx += xy[2 * i]; cy += xy[2 * i + 1]; }
  cx /= n; cy /= n;
  for (const o of orders) {
    let c = 0, s = 0, rn = 0;
    for (let i = 0; i < n; i++) {
      const x = xy[2 * i] - cx, y = xy[2 * i + 1] - cy;
      const r = Math.hypot(x, y), ph = Math.atan2(y, x), r_n = r ** o;
      c += r_n * Math.cos(o * ph); s += r_n * Math.sin(o * ph); rn += r_n;
    }
    eps[o] = Math.hypot(c / n, s / n) / (rn / n);
    psi[o] = (Math.atan2(s / n, c / n) + Math.PI) / o;
  }
  return { eps, psi };
}

export function overlapArea(xy) {
  const n = xy.length / 2;
  if (n < 3) return 0;
  let cx = 0, cy = 0;
  for (let i = 0; i < n; i++) { cx += xy[2 * i]; cy += xy[2 * i + 1]; }
  cx /= n; cy /= n;
  let sx2 = 0, sy2 = 0, sxy = 0;
  for (let i = 0; i < n; i++) { const x = xy[2 * i] - cx, y = xy[2 * i + 1] - cy; sx2 += x * x; sy2 += y * y; sxy += x * y; }
  sx2 /= n; sy2 /= n; sxy /= n;
  return 4 * Math.PI * Math.sqrt(Math.max(sx2 * sy2 - sxy * sxy, 0));
}

/** Centrality (%) of impact parameter b, from the exported glauber.centrality_of_b curve. */
export function centralityOfB(D, sysId, b) {
  const t = D.c_of_b[sysId];
  return interp(b, t.b, t.c);
}
/** Inverse: b (fm) at centrality c (%). */
export function bOfCentrality(D, sysId, c) {
  const t = D.c_of_b[sysId];
  // c is non-decreasing in b; find the first b reaching c
  for (let i = 1; i < t.b.length; i++) {
    if (t.c[i] >= c) {
      const w = t.c[i] > t.c[i - 1] ? (c - t.c[i - 1]) / (t.c[i] - t.c[i - 1]) : 0;
      return t.b[i - 1] + w * (t.b[i] - t.b[i - 1]);
    }
  }
  return t.b[t.b.length - 1];
}

export function radiusOf(D, name) { return params(D, name).R ?? 1.0; }

/**
 * Coulomb (Rutherford) deflection angle of the projectile for a straight-line pass at impact parameter b:
 * theta = 2 Z_A Z_B alpha hbar c / (b p beta), impact approximation (Jackson, Classical Electrodynamics §13.1).
 */
export function coulombDeflection(D, sys, b) {
  const PA = params(D, sys.A), PB = params(D, sys.B);
  const alphaHbarc = 1.43996e-3;                 // e^2/(4 pi eps0) in GeV fm
  const pN = gamma(D, sys.sqrt_snn) * beta(D, sys.sqrt_snn) * D.constants.M_NUCLEON;   // GeV per nucleon
  const p = PA.A * pN;
  return (2 * PA.Z * PB.Z * alphaHbarc) / (Math.max(b, 0.1) * p * beta(D, sys.sqrt_snn));
}
