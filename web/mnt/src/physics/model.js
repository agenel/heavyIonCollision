// The multi-nucleon-transfer model: trajectory (with Kramers quasi-fission decay) + master equation along it +
// cross sections + neutron evaporation. See docs/mnt/PLAN.md §3.
//   sigma_primary(Z1, N1) = (pi / k^2) sum_l (2l + 1) P_l(Z1, N1)   (P_l summed over the exits of partial wave l)
import { Collision, FMC_PER_ZS, DEFAULT_TRAJ } from "./trajectory.js";
import { Transfer, DEFAULT_TRANSFER } from "./transfer.js";
import { Evaporation, EBIN, NEBIN } from "./evaporation.js";
import { deformedDR } from "./potential.js";

export const DEFAULTS = { ...DEFAULT_TRAJ, ...DEFAULT_TRANSFER, nL: 36, orient: "full" };

// Orientation average for statically deformed nuclei (A >= 100, |beta2| >= 0.15, FRDM2012 deformations): random
// orientations, i.e. uniform in cos(theta) of each symmetry axis relative to the line of centres, integrated with a
// 3-point Gauss-Legendre rule on [0, 1] (tip ~ cos 1, side ~ cos 0). Only the radius along the line of centres changes
// (R(theta) = R0 (1 + beta2 Y20 + beta4 Y40)); curvature and Coulomb quadrupole terms are neglected (stated).
const GL3 = [[0.1127016654, 0.2777777778], [0.5, 0.4444444444], [0.8872983346, 0.2777777778]];
export function orientations(nuc, P, T, mode = "full") {
  const def = (n) => { const r = nuc.get(n.Z, n.A - n.Z); return n.A >= 100 && r && Math.abs(r.b2 ?? 0) >= 0.15 ? r : null; };
  const dP = mode === "off" ? null : def(P), dT = mode === "off" ? null : def(T);
  const q1 = dP ? GL3 : [[null, 1]], q2 = dT ? GL3 : [[null, 1]];
  const out = [];
  if (mode === "fast" && dP && dT) {                       // correlated axes: 3 runs instead of 9 (interactive use)
    for (const [c, w] of GL3) out.push({ w, dR1: deformedDR(P.A, dP.b2, dP.b4, c), dR2: deformedDR(T.A, dT.b2, dT.b4, c), c1: c, c2: c });
    return out;
  }
  for (const [c1, w1] of q1) for (const [c2, w2] of q2) {
    out.push({ w: w1 * w2, dR1: dP ? deformedDR(P.A, dP.b2, dP.b4, c1) : 0, dR2: dT ? deformedDR(T.A, dT.b2, dT.b4, c2) : 0, c1, c2 });
  }
  return out;
}

export function ecmFromElab(P, T, Elab) { return (Elab * T.A) / (P.A + T.A); }

/** Lab angle (deg) of the projectile-like fragment for a centre-of-mass deflection Theta (rad) and final TKE (MeV),
 * non-relativistic two-body kinematics with the entrance masses. */
export function plfLabAngle(P, T, Ecm, Theta, TKE) {
  const chi = Math.acos(Math.cos(Theta));                   // scattering angle in [0, pi]
  const Elab = (Ecm * (P.A + T.A)) / T.A;
  const V = Math.sqrt(2 * Elab / P.A) * P.A / (P.A + T.A);  // CM velocity (units of sqrt(MeV/u))
  const v1 = Math.sqrt((2 * Math.max(TKE, 1e-6) * T.A) / (P.A * (P.A + T.A)));
  return (Math.atan2(Math.sin(chi), Math.cos(chi) + V / v1) * 180) / Math.PI;
}
const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
/** Fraction of a Gaussian (mean m, width s, deg) inside [a, b]. */
export function windowFraction(m, a, b, s) { return 0.5 * (erf((b - m) / (Math.SQRT2 * s)) - erf((a - m) / (Math.SQRT2 * s))); }

export class MNTModel {
  constructor(nuc) { this.nuc = nuc; this.evap = new Evaporation(nuc); }

  /**
   * P, T: {Z, A}; Ecm (MeV); opts: DEFAULTS overrides. Returns partial-wave table, cross sections (mb) of primary and
   * final products, capture cross section, and the exit channels for the Wilczyński and mass-TKE plots.
   */
  run(P, T, Ecm, opts = {}) {
    const o = { ...DEFAULTS, ...opts };
    const ors = orientations(this.nuc, P, T, o.orient);
    if (ors.length === 1) return this.runOriented(P, T, Ecm, { ...o, dR1: ors[0].dR1, dR2: ors[0].dR2 });
    // average cross sections over orientations; waves/exits for display from the middle orientation(s)
    const runs = ors.map((q) => ({ q, r: this.runOriented(P, T, Ecm, { ...o, dR1: q.dR1, dR2: q.dR2 }) }));
    const avg = (key) => { const m = new Map(); for (const { q, r } of runs) for (const [k, v] of r[key]) m.set(k, (m.get(k) ?? 0) + q.w * v); return m; };
    const mid = runs.reduce((a, b) => (Math.abs((b.q.c1 ?? 0.5) - 0.5) + Math.abs((b.q.c2 ?? 0.5) - 0.5) < Math.abs((a.q.c1 ?? 0.5) - 0.5) + Math.abs((a.q.c2 ?? 0.5) - 0.5) ? b : a)).r;
    return { ...mid, primary: avg("primary"), final: avg("final"),
      sigCap: runs.reduce((a, { q, r }) => a + q.w * r.sigCap, 0), sigFission: runs.reduce((a, { q, r }) => a + q.w * r.sigFission, 0),
      exits: runs.flatMap(({ q, r }) => r.exits.map((e) => ({ ...e, sigma: e.sigma * q.w }))),
      orientations: ors, ms: runs.reduce((a, { r }) => a + r.ms, 0) };
  }

  runOriented(P, T, Ecm, o) {
    const t0 = (typeof performance !== "undefined" ? performance : Date).now();
    const col = new Collision(P, T, Ecm, o);
    const tr = new Transfer(this.nuc, P, T, o);
    const aLev = (P.A + T.A) / 12;
    const k2 = col.k;                                      // fm^-2
    const lMax = col.lGrazing + Math.max(12, Math.round(0.12 * col.lGrazing));
    const dl = Math.max(1, Math.round(lMax / o.nL));
    const waves = [], exits = [];
    const primary = new Map();                             // key Z*1000+A -> sigma (mb); both fragments
    const hist = new Map();                                // (Z, N) -> Float64Array(NEBIN) of sigma per E* bin
    let sigCap = 0, sigTot = 0;
    const addHist = (Z, N, Estar, s) => {
      const key = Z * 1000 + N;
      let h = hist.get(key); if (!h) { h = new Float64Array(NEBIN); hist.set(key, h); }
      h[Math.max(0, Math.min(NEBIN - 1, Math.floor(Estar / EBIN)))] += s;
    };
    for (let l = 0; l <= lMax; l += dl) {
      const weight = (Math.PI / k2) * (2 * l + 1) * dl * 10;   // fm^2 -> mb
      sigTot += weight;
      tr.setL(l);
      let accE = new Float64Array(tr.size);
      const wExits = [];
      // exits are batched: the distribution P changes little over a few fm/c, so pending weight is flushed every 8 fm/c
      let pendW = 0, pendWE = 0, lastFlush = -1e9;
      const flush = () => {
        if (pendW <= 0) return;
        tr.exit(pendW);
        const Em = pendWE / pendW, { nn } = tr, [i0, j0] = tr.lo, [i1, j1] = tr.hi;
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) accE[i * nn + j] += pendW * tr.P[i * nn + j] * Em;
        pendW = 0; pendWE = 0;
      };
      col.onExit = (e) => {
        // optional detector window on the projectile-like fragment's lab angle (both partners of accepted events count)
        const f = o.window ? windowFraction(plfLabAngle(P, T, Ecm, e.theta, Ecm - e.TKEL), o.window[0], o.window[1], o.window[2] ?? 4) : 1;
        pendW += e.w * f; pendWE += e.w * f * e.Ediss;
        if (e.t - lastFlush > 8) { flush(); lastFlush = e.t; }
        wExits.push(e);
      };
      const res = col.run(l, {
        onStep: (t, y, ff, h) => {
          if (ff < 1e-4) { tr.flushSteps(); return; }
          const Ed = col.energy(y, l * 197.3269804).Ediss;
          tr.feed(h, ff, Math.sqrt(Math.max(Ed, 0) / aLev));
        },
      });
      tr.flushSteps();
      flush();
      col.onExit = null;
      sigCap += weight * res.pCapture;
      const m = tr.accW > 0 ? tr.moments(tr.acc) : { Z1: P.Z, N1: P.A - P.Z, varZ: 0, varN: 0 };
      waves.push({ l, weight, theta: res.theta, TKEL: res.TKEL, Ediss: res.Ediss, tContact: res.tContact / FMC_PER_ZS,
        pCapture: res.pCapture, dZ: m.Z1 - P.Z, dN: m.N1 - (P.A - P.Z), varZ: m.varZ, varN: m.varN, minS: res.minS, Lf: res.Lf });
      for (const e of wExits) exits.push({ l, sigma: weight * e.w, theta: e.theta, TKEL: e.TKEL, t: e.t / FMC_PER_ZS });
      // primary products and their excitation energies (E* = E_diss + Q_gg, shared in proportion to mass)
      const { nn } = tr;
      for (let k = 0; k < tr.size; k++) {
        const p = tr.acc[k];
        if (p < 1e-14 || !tr.valid[k]) continue;
        const Z1 = tr.Z0 + Math.floor(k / nn), N1 = tr.N0 + (k % nn), Z2 = tr.Ztot - Z1, N2 = tr.Ntot - N1;
        const s = weight * p;
        const Estar = Math.max(0, accE[k] / p + tr.Q[k]);
        const A1 = Z1 + N1, A2 = Z2 + N2, f1 = A1 / (A1 + A2);
        primary.set(Z1 * 1000 + A1, (primary.get(Z1 * 1000 + A1) ?? 0) + s);
        primary.set(Z2 * 1000 + A2, (primary.get(Z2 * 1000 + A2) ?? 0) + s);
        addHist(Z1, N1, Estar * f1, s); addHist(Z2, N2, Estar * (1 - f1), s);
      }
    }
    // evaporation, element by element
    const byZ = new Map();
    for (const [key, h] of hist) { const Z = Math.floor(key / 1000), N = key % 1000; if (!byZ.has(Z)) byZ.set(Z, new Map()); byZ.get(Z).set(N, h); }
    const final = new Map(); let sigFission = 0;
    for (const [Z, pop] of byZ) {
      const r = this.evap.cascade(Z, pop);
      sigFission += r.fission;
      for (const [N, s] of r.final) final.set(Z * 1000 + Z + N, (final.get(Z * 1000 + Z + N) ?? 0) + s);
    }
    const ms = (typeof performance !== "undefined" ? performance : Date).now() - t0;
    return { P, T, Ecm, opts: o, col: { lGrazing: col.lGrazing, xm: col.xm, gQF: col.gQF, dSc: col.dSc, dEq: col.dEq,
      C1: col.pot.C1, C2: col.pot.C2, barrier: col.pot.barrier() },
      waves, exits, primary, final, sigCap, sigTot, sigFission, ms };
  }
}

/**
 * One partial wave with its full history for the animation: t (fm/c), r, theta, d, E_diss, L, contact form factor,
 * survival, mean (Z1, N1) and widths of the transfer distribution. Trapped systems are shown separating at the median
 * exit time (survival 1/2) along the outgoing Coulomb orbit from the barrier top.
 */
export function waveHistory(nuc, P, T, Ecm, l, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const col = new Collision(P, T, Ecm, o), tr = new Transfer(nuc, P, T, o);
  tr.setL(l);
  const aLev = (P.A + T.A) / 12, L0 = l * 197.3269804;
  const H = [];
  let medianExit = null, lastT = -1e9;
  const res = col.run(l, {
    onStep: (t, y, ff, h, surv) => {
      const Ed = col.energy(y, L0).Ediss;
      if (ff >= 1e-4) tr.feed(h, ff, Math.sqrt(Math.max(Ed, 0) / aLev)); else tr.flushSteps();
      if (t - lastT >= 3) {
        lastT = t;
        const m = tr.moments();
        H.push({ t, r: y[0], th: y[2], d: y[4], Ed: Math.max(Ed, 0), L: y[3] / 197.3269804, ff, surv, Z1: m.Z1, N1: m.N1, sZ: Math.sqrt(Math.max(m.varZ, 0)), sN: Math.sqrt(Math.max(m.varN, 0)) });
      }
      if (!medianExit && surv < 0.5) medianExit = { t, r: y[0], th: y[2], L: y[3] };
    },
  });
  // cut the trapped phase at the median exit and continue on a Coulomb + centrifugal orbit
  if (medianExit && res.exits.length) {
    const i = H.findIndex((h) => h.t >= medianExit.t);
    const kept = H.slice(0, Math.max(i, 1));
    const last = kept[kept.length - 1], mu = col.mu, ZZ = col.pot.ZZ, Lf = medianExit.L;
    let r = last.r + 0.5, th = last.th, pr = 0, t = last.t;
    while (r < 60 && t < last.t + 4000) {
      const h = 2, F = ZZ / (r * r) + (Lf * Lf) / (mu * r ** 3);
      pr += F * h; r += (pr / mu) * h; th += (Lf / (mu * r * r)) * h; t += h;
      if (t - kept[kept.length - 1].t >= 3) kept.push({ ...last, t, r, th, d: last.d, ff: 0, surv: 0 });
    }
    return { hist: kept, res, col, exitT: medianExit.t, trapped: true };
  }
  return { hist: H, res, col, exitT: null, trapped: false };
}

/** sigma(Z, A) lookup helpers */
export const key = (Z, A) => Z * 1000 + A;
