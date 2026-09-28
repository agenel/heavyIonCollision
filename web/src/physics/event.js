// Event orchestration for the explorer: port of hic_core/event.py _lookup_data plus the live pipeline
// (same nuclei for every b: sample once, collide at any b). The flow gain and a_n come from the exported
// Python calibration (web_data.json "calibration"), interpolated in b.
import { RNG } from "./rng.js";
import { interp, interpCent } from "./util.js";
import { sampleNucleus, params } from "./nuclei.js";
import { collide, systemKey, centralityOfB, bOfCentrality, crossingTime, yBeam, gamma, beta } from "./glauber.js";
import { makeGrid, nucleonWeights, reducedThickness, integral } from "./trento.js";
import { EoS, longProfileSigma } from "./eos.js";
import { Fireball } from "./fireball.js";

export const DEFAULTS = { tau_0: 0.4, tau_acc: 2.5, trento_p: 0, nucleon_width: 0.96, fluct_k: 1.23, d_min: 0.4, grid_L: 16, grid_n: 96, diffusion: 0.15 };

function closestKey(D, table, sys) {
  const key = systemKey(D, sys.A, sys.B, sys.sqrt_snn);
  if (key in table) return key;
  const e = Math.round(sys.sqrt_snn);
  for (const k of Object.keys(table)) if (k.endsWith(`_${e}`)) return k;
  return sys.sqrt_snn > 1000 ? "PbPb_5020" : "AuAu_200";
}

/** Centrality of the reference system with the same dN_ch/deta (event._c_equiv). */
function cEquiv(D, refKey, dNch) {
  const tab = D.multiplicity[refKey];
  const idx = tab.dNch_deta.map((_, i) => i).sort((a, b) => tab.dNch_deta[a] - tab.dNch_deta[b]);
  return interp(Math.log(dNch), idx.map((i) => Math.log(tab.dNch_deta[i])), idx.map((i) => tab.centrality_mid[i]));
}

/** Port of Event._lookup_data. in: c_mid (%), eps {2..5} of this event, I (TRENTo integral, fm^2). */
export function lookupInputs(D, sys, { c_mid, eps, I }) {
  const key = systemKey(D, sys.A, sys.B, sys.sqrt_snn);
  let dNch, multKey, method;
  if (key in D.multiplicity) {
    const t = D.multiplicity[key];
    dNch = interpCent(t.centrality_mid, t.dNch_deta, c_mid); multKey = key; method = "table";
  } else {
    const refs = D.trento_norm;
    multKey = Object.keys(refs).filter((k) => k !== "trento")
      .reduce((best, k) => (Math.abs(Math.log(refs[k].sqrt_snn / sys.sqrt_snn)) < Math.abs(Math.log(refs[best].sqrt_snn / sys.sqrt_snn)) ? k : best));
    const rows = refs[multKey].bins.filter((r) => r.c[1] <= 60);
    const norm = (rows.reduce((a, r) => a + r.norm, 0) / rows.length) * (sys.sqrt_snn / refs[multKey].sqrt_snn) ** 0.31;
    dNch = norm * I; method = `TRENTo integral × norm(${multKey})`;
  }
  const shape = D.multiplicity[multKey].shape;
  const ykey = closestKey(D, D.yields, sys);
  const c_y = ykey === key ? c_mid : cEquiv(D, ykey, dNch);
  const bwT = D.yields[ykey].blastwave;
  const bw = { beta_T: interp(c_y, bwT.centrality_mid, bwT.beta_T), T_kin_MeV: interp(c_y, bwT.centrality_mid, bwT.T_kin_MeV),
    n: interp(c_y, bwT.centrality_mid, bwT.n) };
  const fkey = closestKey(D, D.flow, sys);
  const vn = {};
  let c_f;
  const ft = D.flow[fkey];
  if (fkey === key) {
    c_f = c_mid;
    for (const n of [2, 3, 4]) vn[n] = interpCent(ft.centrality_mid, ft[`v${n}`], c_mid, false);
  } else {
    const mref = fkey in D.multiplicity ? fkey : multKey;
    c_f = cEquiv(D, mref, dNch);
    for (const n of [2, 3, 4]) vn[n] = interpCent(ft.centrality_mid, ft[`v${n}`], c_f, false);
    const gkey = fkey in D.centrality_tables ? fkey : (sys.sqrt_snn > 1000 ? "PbPb_5020" : "AuAu_200");
    const gt = D.centrality_tables[gkey].bins, cm = gt.map((r) => 0.5 * (r.c[0] + r.c[1]));
    for (const n of [2, 3]) {
      const eref = interp(c_f, cm, gt.map((r) => r[`eps${n}`]));
      vn[n] *= eps[n] / Math.max(eref, 1e-6);
    }
  }
  const warnings = [];
  const R = Math.max(params(D, sys.A).R ?? 1, params(D, sys.B).R ?? 1);
  const tc = crossingTime(D, R, sys.sqrt_snn);
  if (tc > DEFAULTS.tau_0) warnings.push(`The nuclei take ${tc.toFixed(2)} fm/c to cross, longer than τ₀ = 0.4 fm/c.`);
  if (sys.sqrt_snn < 39) warnings.push("Baryon-rich matter at this energy: the μ_B = 0 lattice EoS is approximate.");
  if (dNch < 60) warnings.push("Small droplet: whether it behaves as a fluid is debated.");
  return { key, dNch, multKey, method, shape, bw, vn_target: vn, c_equiv: { yields: c_y, flow: c_f }, warnings, yieldKey: ykey, flowKey: fkey };
}

/** Flow gain and a_n from the Python calibration (median over seeds, interpolated in b), a_n rescaled to this
 * event's v_n target. Systems without their own calibration (custom nuclei) borrow sys.calibRef's at equal centrality. */
export function calibrationAt(D, sys, b, c, vnTarget) {
  let id = sys.id, bb = b;
  if (!D.calibration[id]) { id = sys.calibRef; bb = bOfCentrality(D, id, Math.min(c, 99)); }
  const t = D.calibration[id];
  const gain = interp(bb, t.b, t.gain);
  const a_n = {};
  for (const n of [2, 3, 4]) {
    const a = interp(bb, t.b, t[`a${n}`]), v = interp(bb, t.b, t[`v${n}`]);
    a_n[n] = Math.abs(v) > 1e-6 ? Math.max(-0.8, Math.min(0.8, (a * vnTarget[n]) / v)) : a;
  }
  return { gain, a_n, source: id };
}

/** The live model: one pair of nuclei (fixed by seed), any impact parameter. */
export class CollisionModel {
  constructor(D, sys, seed = 1, opts = {}) {
    this.D = D; this.sys = sys; this.seed = seed; this.o = { ...DEFAULTS, ...opts };
    this.eos = new EoS(D);
    this.grid = makeGrid(this.o.grid_L, this.o.grid_n);
    const rng = new RNG(seed * 7919 + 17);
    const kw = { dMin: this.o.d_min, orientation: sys.orientation };
    this.nucA = sampleNucleus(D, sys.A, rng, kw);
    this.nucB = sampleNucleus(D, sys.B, rng, kw);
    this.wA = nucleonWeights(this.nucA.A, this.o.fluct_k, rng);
    this.wB = nucleonWeights(this.nucB.A, this.o.fluct_k, rng);
    this.gamma = gamma(D, sys.sqrt_snn); this.beta = beta(D, sys.sqrt_snn); this.yBeam = yBeam(D, sys.sqrt_snn);
    this.RA = params(D, sys.A).R ?? 1; this.RB = params(D, sys.B).R ?? 1;
  }
  /** Fast (< 5 ms): participants, N_part, N_coll, eccentricities, centrality. */
  geometry(b) {
    const col = collide(this.D, this.sys, this.nucA, this.nucB, b);
    col.c = centralityOfB(this.D, this.sys.id, b);
    col.upc = col.ncoll === 0;
    return col;
  }
  /** Initial state and data inputs for a geometry (TRENTo + lookup + calibration); ~20 ms. */
  initial(col) {
    if (col.upc || col.npart < 2) return null;
    const TR = reducedThickness(this.grid, this.nucA, this.nucB, col, this.wA, this.wB, { p: this.o.trento_p, w: this.o.nucleon_width });
    const I = integral(this.grid, TR);
    const L = lookupInputs(this.D, this.sys, { c_mid: Math.min(col.c, 99.5), eps: col.eps, I });
    const S_per_ch = this.D.misc.entropy_per_charged_hadron;
    const dS_deta = S_per_ch * L.dNch;
    const norm = dS_deta / Math.max(this.o.tau_0 * I, 1e-30);
    const s0 = new Float64Array(TR.length);
    for (let k = 0; k < TR.length; k++) s0[k] = norm * TR[k];
    const cal = calibrationAt(this.D, this.sys, col.b, col.c, L.vn_target);
    return { TR, I, s0, dS_deta, lookup: L, cal };
  }
  fireball(col, init) {
    const L = init.lookup;
    return new Fireball({
      s0: init.s0, grid: this.grid, eos: this.eos, dS_deta: init.dS_deta,
      sigma_eta: longProfileSigma(L.shape), y_beam: this.yBeam,
      beta_T: L.bw.beta_T, n_prof: L.bw.n, T_kin: L.bw.T_kin_MeV,
      flow_gain: init.cal.gain, a_n: init.cal.a_n, psi_n: { 2: col.psi[2], 3: col.psi[3], 4: col.psi[4] },
      tau_0: this.o.tau_0, tau_acc: this.o.tau_acc,
    });
  }
}
