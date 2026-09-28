// Nucleus-nucleus potential: Proximity 1977 (Błocki, Randrup, Świątecki, Tsang, Ann. Phys. 105 (1977) 427; constants
// as tabulated by Dutt & Puri, PRC 81 (2010) 064609), Bass 1980 (optional), Coulomb of two uniformly charged spheres.
// Units: fm, MeV. e^2 = 1.439964 MeV fm.
export const E2 = 1.439964;
export const HBARC = 197.3269804;

/** Proximity-77 half-density radius R and central radius C = R (1 - (b/R)^2), b = 1 fm. */
export function proxRadius(A) { return 1.28 * Math.cbrt(A) - 0.76 + 0.8 / Math.cbrt(A); }
export function proxCentral(A) { const R = proxRadius(A); return R * (1 - 1 / (R * R)); }

/**
 * Universal proximity function Phi(xi) (Prox 77). Below xi = -1 the cubic turns over and becomes repulsive (an artefact,
 * docs/mnt/01-models.md §1.2), so it is continued linearly there and a stiff quadratic wall models the nuclear
 * incompressibility for overlaps beyond xi = -1.5 (model choice, stated in the "?" panel).
 */
export function phi77(xi) {
  const a = 2.54, bk = 0.0852;
  const cubic = (x) => -0.5 * (x - a) ** 2 - bk * (x - a) ** 3;
  if (xi >= 1.2511) return -3.437 * Math.exp(-xi / 0.75);
  if (xi >= -1) return cubic(xi);
  const f0 = cubic(-1), d0 = -(-1 - a) - 3 * bk * (-1 - a) ** 2;      // Phi(-1), Phi'(-1)
  let v = f0 + d0 * (xi + 1);
  if (xi < -1.5) v += 6.0 * (xi + 1.5) ** 2;
  return v;
}

const Y20 = (c) => Math.sqrt(5 / (16 * Math.PI)) * (3 * c * c - 1);
const Y40 = (c) => (3 / (16 * Math.sqrt(Math.PI))) * (35 * c ** 4 - 30 * c * c + 3);
/** Radius change of an axially deformed nucleus along a direction at angle theta (cos = c) to its symmetry axis. */
export function deformedDR(A, b2, b4, c) { return proxRadius(A) * ((b2 ?? 0) * Y20(c) + (b4 ?? 0) * Y40(c)); }

export class Potential {
  /**
   * P, T: {Z, A}; kind "prox77" (default) or "bass80". The surface tension uses N, Z of the whole system.
   * dR1, dR2: radius change along the line of centres of deformed nuclei, R(theta) - R0 = R0 (beta2 Y20 + beta4 Y40).
   */
  constructor(P, T, kind = "prox77", { dR1 = 0, dR2 = 0 } = {}) {
    Object.assign(this, { P, T, kind });
    this.C1 = proxCentral(P.A) + dR1; this.C2 = proxCentral(T.A) + dR2;
    this.Cbar = (this.C1 * this.C2) / (this.C1 + this.C2);
    const Z = P.Z + T.Z, A = P.A + T.A, I = (A - 2 * Z) / A;
    this.gamma = 0.9517 * (1 - 1.7826 * I * I);                      // MeV fm^-2
    this.RC = 1.2 * (Math.cbrt(P.A) + Math.cbrt(T.A));               // Coulomb sharp-sphere radius (fm), standard
    this.ZZ = P.Z * T.Z * E2;
    this.dSc = Infinity;
    if (kind === "bass80") {
      const R = (a) => { const Rs = proxRadius(a); return Rs * (1 - 0.98 / (Rs * Rs)); };
      this.R1b = R(P.A) + dR1; this.R2b = R(T.A) + dR2;
    }
  }
  /**
   * Nuclear potential at centre distance r with an extra elongation d of the dinuclear system (fm). The neck thins as
   * the system elongates: the attraction is scaled by (1 - d/dSc), vanishing at the scission elongation dSc (set by the
   * caller; Infinity = no neck thinning).
   */
  VN(r, d = 0) {
    const n = this.dSc > 0 && isFinite(this.dSc) ? Math.max(0, 1 - d / this.dSc) : 1;
    return n === 0 ? 0 : n * this.VNraw(r, d);
  }
  VNraw(r, d = 0) {
    if (this.kind === "coulomb") return 0;
    if (this.kind === "bass80") {
      const s = r - d - this.R1b - this.R2b;
      return -((this.R1b * this.R2b) / (this.R1b + this.R2b)) / (0.033 * Math.exp(s / 3.5) + 0.007 * Math.exp(s / 0.65));
    }
    const xi = r - d - this.C1 - this.C2;                            // b = 1 fm
    return 4 * Math.PI * this.gamma * this.Cbar * phi77(xi);
  }
  dVN(r, d = 0, h = 1e-3) { return (this.VN(r + h, d) - this.VN(r - h, d)) / (2 * h); }
  VC(r) { return r >= this.RC ? this.ZZ / r : (this.ZZ / (2 * this.RC)) * (3 - (r * r) / (this.RC * this.RC)); }
  dVC(r) { return r >= this.RC ? -this.ZZ / (r * r) : -(this.ZZ * r) / this.RC ** 3; }
  V(r, d = 0) { return this.VN(r, d) + this.VC(r); }
  /** Surface separation s = r - d - C1 - C2 (fm). */
  s(r, d = 0) { return r - d - this.C1 - this.C2; }
  /** s-wave barrier: {B, RB} or null if the potential has no maximum outside the touching point. */
  barrier() {
    let best = null, prev = this.V(40);
    for (let r = 40; r > this.C1 + this.C2 - 1; r -= 0.01) {
      const v = this.V(r);
      if (v < prev && best === null && r < 39) best = { B: prev, RB: r + 0.01 };
      prev = v;
      if (best) break;
    }
    return best;
  }
}

