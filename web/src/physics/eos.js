// Port of hic_core/eos.py and the entropy inversion in fireball.py (HotQCD 2014 lattice EoS).
import { interp } from "./util.js";

export class EoS {
  constructor(D) {
    const E = D.eos, hc3 = D.constants.HBARC ** 3;
    this.Tc = E.T_c_MeV;
    this.hc3 = hc3;
    // energy density: extended grid, log-T interpolation of e/T^4 (constant 2.33 below 130 MeV)
    this.T_ext = [50, 80, 100, 120, ...E.T];
    this.eT4_ext = [2.33, 2.33, 2.33, 2.33, ...E.e_T4];
    this.logT_ext = this.T_ext.map(Math.log);
    // entropy density grid for T(s): T in [20, 1200] MeV, s/T^3 clamped to the table range [130, 400] MeV
    const N = 2000;
    this.Tg = new Float64Array(N); this.logS = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const T = 20 + (1180 * i) / (N - 1);
      const sT3 = interp(Math.min(Math.max(T, 130), 400), E.T, E.s_T3);
      this.Tg[i] = T; this.logS[i] = Math.log((sT3 * (T / 1000) ** 3) / hc3);
    }
    this.sMin = Math.exp(this.logS[0]);
  }
  /** GeV/fm^3 */
  epsilon(T) {
    T = Math.min(Math.max(T, this.T_ext[0]), 2000);
    const eT4 = interp(Math.log(T), this.logT_ext, this.eT4_ext);
    return (eT4 * (T / 1000) ** 4) / this.hc3;
  }
  /** MeV from entropy density fm^-3 (0 for s below the grid) */
  T_of_s(s) {
    if (!(s > this.sMin)) return 0;
    const ls = Math.log(s), g = this.logS;
    if (ls >= g[g.length - 1]) return this.Tg[g.length - 1];
    let lo = 0, hi = g.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (g[m] <= ls) lo = m; else hi = m; }
    return this.Tg[lo] + ((ls - g[lo]) / (g[hi] - g[lo])) * (this.Tg[hi] - this.Tg[lo]);
  }
  /** Uniform table in log s for shaders: returns {logS0, dLogS, T: Float32Array, eps: Float32Array} */
  table(n = 1024) {
    const l0 = this.logS[0], l1 = this.logS[this.logS.length - 1];
    const T = new Float32Array(n), eps = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = this.T_of_s(Math.exp(l0 + ((l1 - l0) * i) / (n - 1)) * (1 + 1e-9));
      T[i] = t; eps[i] = t > 0 ? this.epsilon(t) : 0;
    }
    return { logS0: l0, logS1: l1, T, eps };
  }
}

/** fireball.long_profile_sigma: space-time-rapidity width from the measured dN/deta shape. */
export function longProfileSigma(shape) {
  let s;
  if (shape.type === "double_gauss") s = 3.86;
  else if (shape.type === "fwhm_gauss") s = shape.fwhm / 2.3548;
  else s = 3.0;
  return Math.sqrt(Math.max(s * s - 0.8 * 0.8, 1.0));
}
