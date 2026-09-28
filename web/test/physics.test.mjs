// Cross-check of the JavaScript physics against the Python reference (hic_core), no browser needed:
//   node web/test/physics.test.mjs
// References are produced by scripts/export_web.py. Statistical checks use |JS - Py| < 4 sigma (combined SEM,
// with a 1 % floor for systematic differences of the random streams); deterministic checks use tight tolerances.
import { readFileSync } from "node:fs";
import { RNG } from "../src/physics/rng.js";
import { sampleNucleus } from "../src/physics/nuclei.js";
import { collide } from "../src/physics/glauber.js";
import { makeGrid, nucleonWeights, reducedThickness, integral } from "../src/physics/trento.js";
import { EoS } from "../src/physics/eos.js";
import { Fireball } from "../src/physics/fireball.js";
import { lookupInputs } from "../src/physics/event.js";
import { opticalCofB } from "../src/physics/custom.js";
import { interp } from "../src/physics/util.js";

const here = new URL(".", import.meta.url);
const D = JSON.parse(readFileSync(new URL("../data/web_data.json", here)));
const R = JSON.parse(readFileSync(new URL("refs.json", here)));
const sysById = Object.fromEntries(D.systems.map((s) => [s.id, s]));
const only = process.argv[2];

let failed = 0, passed = 0;
const rows = [];
function check(name, js, py, tol, detail = "") {
  const ok = Math.abs(js - py) <= tol;
  ok ? passed++ : failed++;
  rows.push(`${ok ? "ok  " : "FAIL"} ${name.padEnd(46)} js ${fmt(js)}  py ${fmt(py)}  tol ${fmt(tol)} ${detail}`);
}
const fmt = (x) => (Math.abs(x) >= 100 ? x.toFixed(1) : Math.abs(x) >= 1 ? x.toFixed(3) : x.toFixed(4)).padStart(9);
function stats(a) {
  a = a.filter(Number.isFinite);
  const m = a.reduce((s, v) => s + v, 0) / a.length;
  const v = a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
  return { mean: m, sem: Math.sqrt(v / a.length) };
}
const statTol = (js, py) => 4 * Math.hypot(js.sem, py.sem) + 0.01 * Math.abs(py.mean);

// ---------------------------------------------------------------- Glauber
if (!only || only === "glauber") {
  for (const ref of R.glauber) {
    const sys = sysById[ref.system], rng = new RNG(1000 + Math.round(ref.b * 10));
    const v = { npart: [], ncoll: [], eps2: [], eps3: [] };
    for (let e = 0; e < ref.n; e++) {
      const A = sampleNucleus(D, sys.A, rng, { orientation: sys.orientation });
      const B = sampleNucleus(D, sys.B, rng, { orientation: sys.orientation });
      const c = collide(D, sys, A, B, ref.b);
      v.npart.push(c.npart); v.ncoll.push(c.ncoll);
      v.eps2.push(c.npart > 2 ? c.eps[2] : NaN); v.eps3.push(c.npart > 2 ? c.eps[3] : NaN);
    }
    for (const k of ["npart", "ncoll", "eps2", "eps3"]) {
      const js = stats(v[k]);
      check(`glauber ${ref.system} b=${ref.b} <${k}>`, js.mean, ref[k].mean, statTol(js, ref[k]));
    }
  }
}

// ---------------------------------------------------------------- TRENTo integral
if (!only || only === "trento") {
  const grid = makeGrid(16, 96);
  for (const ref of R.trento) {
    const sys = sysById[ref.system], rng = new RNG(77 + Math.round(ref.b * 10));
    const I = [];
    for (let e = 0; e < ref.n; e++) {
      const A = sampleNucleus(D, sys.A, rng, { orientation: sys.orientation });
      const B = sampleNucleus(D, sys.B, rng, { orientation: sys.orientation });
      const c = collide(D, sys, A, B, ref.b);
      const TR = reducedThickness(grid, A, B, c, nucleonWeights(A.A, 1.23, rng), nucleonWeights(B.A, 1.23, rng));
      I.push(integral(grid, TR));
    }
    const js = stats(I);
    check(`trento ${ref.system} b=${ref.b} <I>`, js.mean, ref.I.mean, statTol(js, ref.I));
  }
}

// ---------------------------------------------------------------- data lookup (deterministic)
if (!only || only === "lookup") {
  for (const ref of R.lookup) {
    const sys = sysById[ref.system];
    const eps = Object.fromEntries(Object.entries(ref.eps).map(([k, v]) => [+k, v]));
    const L = lookupInputs(D, sys, { c_mid: ref.c_mid, eps, I: ref.I_trento });
    const tag = `${ref.system} b=${ref.b}`;
    check(`lookup ${tag} dNch`, L.dNch, ref.dNch, 1e-6 * ref.dNch);
    check(`lookup ${tag} beta_T`, L.bw.beta_T, ref.bw.beta_T, 1e-9);
    check(`lookup ${tag} T_kin`, L.bw.T_kin_MeV, ref.bw.T_kin_MeV, 1e-6);
    for (const n of ["2", "3", "4"]) check(`lookup ${tag} v${n} target`, L.vn_target[n], ref.vn_target[n], 1e-9);
  }
}

// ---------------------------------------------------------------- fireball (deterministic, same s0)
if (!only || only === "fireball") {
  const eos = new EoS(D);
  for (const ref of R.fireball) {
    const P = ref.params, grid = makeGrid(ref.L, ref.n);
    const num = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [+k, v]));
    const t0 = performance.now();
    const opts = { s0: Float64Array.from(ref.s0), grid, eos, sigma_eta: P.sigma_eta, y_beam: P.y_beam, beta_T: P.beta_T,
      n_prof: P.n_prof, T_kin: P.T_kin, flow_gain: P.flow_gain, a_n: num(P.a_n), psi_n: num(P.psi_n), tau_0: P.tau_0,
      tau_acc: P.tau_acc_ref, dS_deta: P.dS_deta };
    const fb = new Fireball(opts);
    fb.run({ tau_end: P.tau_end, diffusion: P.diffusion });
    const ms = performance.now() - t0;
    const E = ref.expect, tag = `${ref.case.A} b=${ref.case.b}`;
    check(`fireball ${tag} R_0`, fb.R_0, E.R_0, 1e-4 * E.R_0);
    check(`fireball ${tag} tau_acc`, fb.tau_acc, E.tau_acc, 1e-4 * E.tau_acc);
    check(`fireball ${tag} eps2(tau0)`, fb.ecc_0[0], E.ecc_0[0], 1e-6);
    E.taus.forEach((t, i) => {
      check(`fireball ${tag} T_max(${t})`, fb.T_max(t), E.T_max[i], 0.002 * E.T_max[i] + 0.2);
      check(`fireball ${tag} R(${t})`, fb.radius(t), E.R[i], 0.002 * E.R[i]);
      check(`fireball ${tag} eps2(${t})`, fb.eccAt(t)[0][0], E.eps2[i], 0.002);
    });
    check(`fireball ${tag} QGP end`, fb.qgpEnd(), E.qgp_end, 0.101);
    rows.push(`     fireball ${tag}: ${(ms / 1000).toFixed(2)} s for ${fb.snap.tau.length} snapshots (dtau 0.02)`);
    // live setting (dtau 0.05, stop below 100 MeV): how much does it move the observables?
    const t1 = performance.now();
    const fast = new Fireball(opts);
    fast.run({ tau_end: P.tau_end, dtau: 0.05, diffusion: P.diffusion, stopBelowT: 100 });
    const ms2 = performance.now() - t1;
    const dT = Math.max(...E.taus.map((t, i) => Math.abs(fast.T_max(t) - E.T_max[i]) / E.T_max[i]));
    rows.push(`     live dtau=0.05: ${(ms2 / 1000).toFixed(2)} s, max |ΔT_max|/T_max = ${(100 * dT).toFixed(2)} %, QGP end ${fast.qgpEnd().toFixed(2)} vs ${E.qgp_end.toFixed(2)}`);
    check(`fireball ${tag} live-step T_max deviation`, dT, 0, 0.02);
  }
}

// ---------------------------------------------------------------- optical-Glauber centrality (custom nuclei)
if (!only || only === "optical") {
  for (const id of ["PbPb_5020", "AuAu_200", "OO_5360"]) {
    const sys = sysById[id], P = D.nuclei[sys.A];
    const opt = opticalCofB(D, P, P, sys.sqrt_snn);
    const mc = D.c_of_b[id];
    let worst = 0, wb = 0;
    for (let i = 0; i < mc.b.length; i++) {
      if (mc.c[i] < 1 || mc.c[i] > 80) continue;          // the optical model differs in the >90 % tail
      const d = Math.abs(interp(mc.b[i], opt.b, opt.c) - mc.c[i]);
      if (d > worst) { worst = d; wb = mc.b[i]; }
    }
    check(`optical c(b) vs Monte Carlo ${id} (max |dc|, % abs, at b=${wb})`, worst, 0, id === "OO_5360" ? 6 : 3);
  }
}

console.log(rows.join("\n"));
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
