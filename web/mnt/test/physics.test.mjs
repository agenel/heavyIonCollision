// Unit tests of the multi-nucleon-transfer model (no browser):  node web/mnt/test/physics.test.mjs
import { readFileSync } from "node:fs";
import { Nuclides } from "../src/physics/nuclides.js";
import { Potential } from "../src/physics/potential.js";
import { Collision } from "../src/physics/trajectory.js";
import { Transfer } from "../src/physics/transfer.js";
import { Evaporation, NEBIN } from "../src/physics/evaporation.js";
import { plfLabAngle } from "../src/physics/model.js";

const nuc = new Nuclides(JSON.parse(readFileSync(new URL("../data/nuclides.json", import.meta.url))));
let pass = 0, fail = 0;
const check = (name, ok, detail = "") => { ok ? pass++ : fail++; console.log(`${ok ? "ok  " : "FAIL"} ${name} ${detail}`); };
const close = (a, b, tol) => Math.abs(a - b) <= tol;
const Xe = { Z: 54, A: 136 }, Pb = { Z: 82, A: 208 }, Ca = { Z: 20, A: 40 };

// masses: AME2020 values reproduced from the table (mass excess, MeV)
check("mass excess 208Pb = -21.749 MeV (AME2020)", close(nuc.massExcess(82, 126), -21.749, 1e-3));
check("mass excess 136Xe = -86.429 MeV (AME2020)", close(nuc.massExcess(54, 82), -86.429, 1e-3), nuc.massExcess(54, 82));
check("S_n(208Pb) = 7.368 MeV", close(nuc.Sn(82, 126), 7.368, 2e-3), nuc.Sn(82, 126).toFixed(3));
check("Q(136Xe+208Pb -> 137Xe+207Pb) = S_n(208Pb) - S_n(137Xe) sign check", nuc.Qgg(54, 82, 82, 126, 54, 83) < 0);

// barriers: Bass-80 within 10 % of the Prox-77 touching-region maximum for light systems; heavy systems have no Prox-77 pocket
const b1 = new Potential(Ca, Pb, "bass80").barrier().B, b2 = new Potential(Ca, Pb, "prox77").barrier().B;
check("40Ca+208Pb: Bass-80 and Prox-77 barriers within 10 %", Math.abs(b1 - b2) / b1 < 0.1, `${b1.toFixed(1)} / ${b2.toFixed(1)} MeV`);
check("136Xe+208Pb Bass-80 barrier 427 MeV (Kozulin 2012 quote V_B ~ 423)", close(new Potential(Xe, Pb, "bass80").barrier().B, 425, 10));

// trajectory: Rutherford limit and energy conservation without friction
const c0 = new Collision(Xe, Pb, 526, { potential: "coulomb", Kr0: 0, Kphi0: 0 });
for (const l of [250, 350]) {
  const r = c0.run(l), k = c0.pot.ZZ, L = l * 197.3269804, eps = Math.sqrt(1 + (2 * 526 * L * L) / (c0.mu * k * k));
  check(`Rutherford deflection l=${l}`, close(r.theta, 2 * Math.asin(1 / eps), 1e-3), `${((r.theta * 180) / Math.PI).toFixed(3)} deg`);
}
{
  const c = new Collision(Xe, Pb, 526, { Kr0: 0, Kphi0: 0, fV: 0 });
  let worst = 0;
  c.run(250, { onStep: (t, y) => { worst = Math.max(worst, Math.abs(c.energy(y, 250 * 197.3269804).Ediss)); } });
  check("energy conserved without friction (|E_diss| < 0.05 MeV)", worst < 0.05, worst.toExponential(2));
}
{
  const c = new Collision(Xe, Pb, 526);
  const r = c.run(0);
  check("head-on Xe+Pb is fully damped: TKEL close to E_cm - Viola TKE (205 MeV)", r.TKEL > 150 && r.TKEL < 230, r.TKEL.toFixed(0));
  check("Xe+Pb is not captured (no pocket, quasi-fission)", r.pCapture < 0.05, r.pCapture.toFixed(3));
}
{
  const c = new Collision(Ca, Pb, 208);
  check("40Ca+208Pb at 208 MeV: head-on collision is captured", c.run(0).pCapture > 0.5);
}

// master equation: probability conservation and detailed balance
{
  const tr = new Transfer(nuc, Xe, Pb, { Tmin: 0.1 });
  tr.setL(0);
  for (let i = 0; i < 400; i++) tr.step(2, 1, 2.0);
  const m = tr.moments();
  check("master equation conserves probability", close(m.norm, 1, 1e-9), m.norm);
  // after long evolution at fixed T the neighbour ratio approaches exp(-(U_j - U_i)/T)
  tr.o.DNN0 = 0.5; for (let i = 0; i < 4000; i++) tr.step(2, 1, 2.0);
  const k1 = tr.idx(54, 82), k2 = tr.idx(54, 83);
  const ratio = tr.P[k2] / tr.P[k1], expect = Math.exp(-(tr.U[k2] - tr.U[k1]) / 2.0);
  check("detailed balance: P(j)/P(i) -> exp(-dU/T)", Math.abs(Math.log(ratio / expect)) < 0.05, `${ratio.toExponential(3)} vs ${expect.toExponential(3)}`);
}

// evaporation: probability conservation, S_n threshold
{
  const ev = new Evaporation(nuc);
  const pop = new Map(); const h = new Float64Array(NEBIN); h[40] = 1; pop.set(126, h);
  const r = ev.cascade(82, pop);
  const tot = [...r.final.values()].reduce((a, b) => a + b, 0) + r.fission;
  check("evaporation conserves probability", close(tot, 1, 1e-9), tot);
  const mean = [...r.final].reduce((a, [N, p]) => a + p * (126 - N), 0);
  check("208Pb at E* = 40 MeV evaporates ~4 neutrons", mean > 3 && mean < 5.5, mean.toFixed(2));
  const cold = new Map(); const h2 = new Float64Array(NEBIN); h2[5] = 1; cold.set(126, h2);
  check("below S_n nothing is emitted", ev.cascade(82, cold).final.get(126) === 1);
}

// kinematics: lab angle of the projectile-like fragment for elastic scattering, inverse kinematics sanity
check("elastic 136Xe+198Pt: theta_cm 90 deg -> theta_lab < 90 deg", plfLabAngle(Xe, { Z: 78, A: 198 }, 643, Math.PI / 2, 643) < 90);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
