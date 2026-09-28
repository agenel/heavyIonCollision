import * as THREE from "three";
import { RNG } from "./physics/rng.js";
import { CollisionModel } from "./physics/event.js";
import { bOfCentrality, coulombDeflection, crossingTime } from "./physics/glauber.js";
import { params } from "./physics/nuclei.js";
import { ensureCustom, opticalCofB } from "./physics/custom.js";
import { Stage } from "./scene/stage.js";
import { Nucleons } from "./scene/nucleons.js";
import { FireballVolume } from "./scene/volume.js";
import { Hits, sampleHits } from "./scene/hits.js";
import { cssBlackbody } from "./scene/blackbody.js";
import { BMap, BeamsEye, PhiHist, zonesFor } from "./ui/cards.js";
import { TimeAxis, T_APPROACH, fmtTime } from "./ui/timeline.js";
import { storyHTML, phaseOf, explainerHTML } from "./ui/story.js";

const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ELEMENT = { Pb208: "lead", Au197: "gold", Xe129: "xenon", U238: "uranium", Cu63: "copper", O16: "oxygen" };
const SYMBOL = { Pb208: "²⁰⁸Pb", Au197: "¹⁹⁷Au", Xe129: "¹²⁹Xe", U238: "²³⁸U", Cu63: "⁶³Cu", O16: "¹⁶O" };

const D = await (await fetch("data/web_data.json")).json();

// ------------------------------------------------------------------ state
const S = {
  sys: D.systems[0], seed: 1, b: 9.2, t: -T_APPROACH, playing: !reduceMotion, speed: 1,
  view: "side", shape: "pancake", tracks: false, drawFrac: 0.35, customA: 100, customE: "lhc",
};
const stage = new Stage($("stage"));
const nucleons = new Nucleons(stage.scene);
let model, col, init, fb, gen, hitsList = [], summary = null, arrived = [];
let volume = null;
const hits = new Hits(stage.scene, stage);
const axis = new TimeAxis(20);
const bmap = new BMap($("bmap"), (b) => setB(b));
const eye = new BeamsEye($("eye"));
const phiHist = new PhiHist($("phi"));

// ------------------------------------------------------------------ controls
function buildControls() {
  const sysBox = $("systems");
  for (const s of [...D.systems, { id: "custom", label: "Custom", energy: "any A" }]) {
    const b = document.createElement("button");
    b.className = "pill"; b.dataset.id = s.id; b.innerHTML = `${s.label}<small>${s.energy}</small>`;
    b.addEventListener("click", () => (s.id === "custom" ? setCustom() : setSystem(s.id)));
    sysBox.appendChild(b);
  }
  const zoneNames = [["central", "Central"], ["mid", "Mid"], ["peripheral", "Periph."], ["grazing", "Grazing"], ["upc", "UPC"]];
  for (const [id, name] of zoneNames) {
    const b = document.createElement("button");
    b.className = "pill"; b.dataset.zone = id; b.textContent = name;
    b.title = { central: "0–10 %", mid: "10–40 %", peripheral: "40–80 %", grazing: "80–100 %", upc: "no nucleons collide" }[id];
    b.addEventListener("click", () => setB(zoneCenterB(id)));
    $("zones").appendChild(b);
  }
  for (const [id, name] of [["side", "Side"], ["beam", "Along the beam"], ["orbit", "Orbit"]]) {
    const b = document.createElement("button");
    b.className = "pill"; b.dataset.view = id; b.textContent = name;
    b.addEventListener("click", () => { S.view = id; stage.setView(id); syncPressed(); });
    $("views").appendChild(b);
  }
  $("bSlider").addEventListener("input", (e) => setB(+e.target.value));
  for (const [id, name, tip] of [["rest", "Rest frame", "Round nuclei, no Lorentz contraction (a visual aid)"],
    ["pancake", "Pancake", "Nuclei flattened to 1 fm, nucleons drawn round (default)"],
    ["true", "True γ", "Everything contracted by 1/γ, as in the lab"]]) {
    const b = document.createElement("button");
    b.className = "pill"; b.dataset.shape = id; b.textContent = name; b.title = tip;
    b.addEventListener("click", () => { S.shape = id; syncPressed(); });
    $("shapes").appendChild(b);
  }
  for (const [id, name] of [["lhc", "LHC 5.02 TeV"], ["rhic", "RHIC 200 GeV"]]) {
    const b = document.createElement("button");
    b.className = "pill"; b.dataset.energy = id; b.textContent = name;
    b.addEventListener("click", () => { S.customE = id; setCustom(); });
    $("energies").appendChild(b);
  }
  let aTimer = null;
  $("aSlider").addEventListener("input", (e) => {
    S.customA = +e.target.value; showCustomInfo();
    clearTimeout(aTimer); aTimer = setTimeout(setCustom, 120);
  });
  $("nDraw").addEventListener("input", (e) => { S.drawFrac = +e.target.value / 100; applyDrawCount(); });
  $("tracks").addEventListener("click", () => { S.tracks = !S.tracks; hits.showTracks = S.tracks; syncPressed(); });
  $("reseed").addEventListener("click", () => { S.seed++; newModel(); });
  $("play").addEventListener("click", () => {
    if (!S.playing && S.t >= axis.tEnd - 1e-6) S.t = -T_APPROACH;
    S.playing = !S.playing; syncPressed();
  });
  $("speed").addEventListener("click", () => { S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 0.5 : 1; $("speed").textContent = `${S.speed}×`; });
  const dlg = $("explainer");
  $("explainerBody").innerHTML = explainerHTML(D);
  $("help").addEventListener("click", () => dlg.showModal());
  $("closeHelp").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  // scrubber
  const sc = $("scrub");
  let drag = false;
  const seek = (e) => { const r = sc.getBoundingClientRect(); S.t = axis.tOf(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))); S.playing = false; syncPressed(); };
  sc.addEventListener("pointerdown", (e) => { if (e.target.classList.contains("mark")) return; drag = true; sc.setPointerCapture(e.pointerId); seek(e); });
  sc.addEventListener("pointermove", (e) => drag && seek(e));
  sc.addEventListener("pointerup", () => (drag = false));
  sc.addEventListener("keydown", (e) => {
    const u = axis.uOf(S.t);
    if (e.key === "ArrowRight") S.t = axis.tOf(Math.min(1, u + 0.01));
    if (e.key === "ArrowLeft") S.t = axis.tOf(Math.max(0, u - 0.01));
    if (e.key === " ") { e.preventDefault(); $("play").click(); }
  });
}

function syncPressed() {
  for (const b of $("systems").children) b.setAttribute("aria-pressed", b.dataset.id === S.sys.id);
  for (const b of $("views").children) b.setAttribute("aria-pressed", b.dataset.view === S.view);
  for (const b of $("shapes").children) b.setAttribute("aria-pressed", b.dataset.shape === S.shape);
  for (const b of $("energies").children) b.setAttribute("aria-pressed", b.dataset.energy === S.customE);
  $("customRow").hidden = S.sys.id !== "custom";
  $("tracks").setAttribute("aria-pressed", S.tracks);
  $("play").textContent = S.playing ? "❚❚" : "▶";
  $("play").setAttribute("aria-label", S.playing ? "Pause" : "Play");
}

// ------------------------------------------------------------------ geometry helpers
const bEdge = () => {           // b beyond which 99.5 % of the inelastic cross section lies at smaller b
  const t = D.c_of_b[S.sys.id];
  for (let i = 0; i < t.b.length; i++) if (t.c[i] >= 99.5) return t.b[i];
  return t.b[t.b.length - 1];
};
const bOfC = (c) => bOfCentrality(D, S.sys.id, c);
const zones = () => zonesFor(D, S.sys.id, bOfC, bEdge());
const zoneOf = (b) => { const z = zones(); for (const q of z) if (b < q.b[1]) return q.id; return "upc"; };
function zoneCenterB(id) {
  const c = { central: 5, mid: 30, peripheral: 60, grazing: 90 }[id];
  return id === "upc" ? bEdge() + 2 : bOfC(c);
}
const bMax = () => bEdge() + 5;

// ------------------------------------------------------------------ model lifecycle
function newModel() {
  model = new CollisionModel(D, S.sys, S.seed);
  nucleons.setModel(model, new RNG(S.seed * 31 + 5));
  if (!volume) volume = new FireballVolume(stage.scene, model.eos);
  const P = params(D, S.sys.A);
  $("sysNote").textContent = S.sys.note;
  $("sysEnergy").textContent = `${S.sys.collider} · √s_NN = ${S.sys.energy}`;
  $("bSlider").max = bMax().toFixed(2);
  setB(Math.min(S.b, bMax()), true);
}

function setSystem(id, sysObj = null) {
  if (id === S.sys.id && !sysObj) return;
  const cOld = zoneOf(S.b) === "upc" ? null : model ? model.geometry(S.b).c : 30;
  S.sys = sysObj ?? D.systems.find((s) => s.id === id);
  // keep the centrality, not b, when switching nuclei
  if (cOld !== null) S.b = bOfC(Math.min(cOld, 95)); else S.b = bEdge() + 2;
  syncPressed(); newModel();
}

// custom nucleus: any mass number, spherical Woods-Saxon, optical-Glauber centrality, borrowed flow calibration
function customSys() {
  const A = S.customA, name = ensureCustom(D, A), lhc = S.customE === "lhc";
  const ref = lhc ? [["OO_5360", 16], ["XeXe_5440", 129], ["PbPb_5020", 208]] : [["AuAu_200", 197]];
  const calibRef = ref.reduce((a, r) => (Math.abs(Math.log(r[1] / A)) < Math.abs(Math.log(a[1] / A)) ? r : a))[0];
  const refLabel = D.systems.find((x) => x.id === calibRef).label;
  return { id: "custom", label: "Custom", A: name, B: name, sqrt_snn: lhc ? 5020 : 200, energy: lhc ? "5.02 TeV" : "200 GeV",
    collider: lhc ? "LHC" : "RHIC", orientation: "random", calibRef,
    note: `A made-up spherical nucleus with ${A} nucleons (${D.nuclei[name].Z} protons), R = 1.12A^⅓ − 0.86A^−⅓ fm. Centrality from the optical Glauber model; flow response borrowed from ${refLabel}.` };
}
function showCustomInfo() {
  const P = D.nuclei[ensureCustom(D, S.customA)];
  $("aVal").textContent = `A ${S.customA} · Z ${P.Z} · R ${P.R.toFixed(2)} fm`;
}
function setCustom() {
  const sys = customSys(), P = D.nuclei[sys.A];
  D.c_of_b.custom = opticalCofB(D, P, P, sys.sqrt_snn);
  showCustomInfo();
  setSystem("custom", sys);
}
function applyDrawCount() {
  const n = Math.round(S.drawFrac * hitsList.length);
  hits.setCount(n);
  $("nDrawVal").textContent = hitsList.length ? `${n.toLocaleString("en-US")} of ${hitsList.length.toLocaleString("en-US")}` : `${Math.round(100 * S.drawFrac)} %`;
}

let recomputeTimer = null;
function setB(b, immediate = false) {
  S.b = Math.max(0, Math.min(b, bMax()));
  col = model.geometry(S.b);
  nucleons.setGeometry(col);
  $("bSlider").value = S.b;
  summary = null; fb = null; gen = null; hitsList = []; hits.setHits([], 0, 0); applyDrawCount();
  if (volume) { volume.fb = null; volume.K = 0; }
  $("busy").hidden = col.upc;
  clearTimeout(recomputeTimer);
  recomputeTimer = setTimeout(computeFireball, immediate ? 0 : 140);
  updateStatic();
}

function computeFireball() {
  if (col.upc || col.npart < 2) { $("busy").hidden = true; finishUPC(); return; }
  init = model.initial(col);
  fb = model.fireball(col, init);
  const Tkin = init.lookup.bw.T_kin_MeV;
  const tauEnd = 30;
  volume.begin(fb, Math.ceil((tauEnd - fb.tau_0) / 0.1) + 3);
  gen = fb.evolveSteps({ tau_end: tauEnd, dtau: 0.05, snapEvery: 0.1, diffusion: 0.15, stopBelowT: Math.min(0.95 * Tkin, 100), stepsPerYield: 4 });
  $("busy").hidden = false;
}

function finishFireball() {
  gen = null; volume.sync();
  const qgpEnd = fb.qgpEnd();
  // kinetic freeze-out estimate as in event.py: hadronic phase 4.5 fm/c * min(R0/6.5, 1) (floor 0.5) after
  // the QGP has hadronised, or earlier if the whole droplet is already below T_kin
  const tauHad = Math.max(D.misc.hadronic_phase_fm * Math.min(fb.R_0 / 6.5, 1), 0.5);
  let tKin = Infinity;
  for (const t of fb.snap.tau) if (fb.eos.T_of_s(snapMax(fb, t)) < fb.T_kin) { tKin = t; break; }
  const tFo = Math.min(qgpEnd + tauHad, tKin);
  summary = { qgpEnd, tFo, T0: fb.T_max(fb.tau_0), Rfo: fb.radius(tFo) };
  const vn = init.lookup.vn_target;
  hitsList = sampleHits(new RNG(S.seed * 1009 + Math.round(S.b * 100)), { dNch: init.lookup.dNch, vn, psi: col.psi, tFo });
  hits.setHits(hitsList, summary.Rfo, Math.round(S.drawFrac * hitsList.length)); applyDrawCount();
  axis.setEnd(Math.min(Math.max(tFo + 7, 12), 30));
  $("busy").hidden = true;
  buildMarks(); updateStatic();
}
function snapMax(fb, t) { const s = fb.s2d(t); let m = 0; for (const v of s) if (v > m) m = v; return m; }

function finishUPC() {
  summary = null; axis.setEnd(14); buildMarks(); updateStatic();
}

// ------------------------------------------------------------------ timeline marks
function buildMarks() {
  const M = $("marks"); M.innerHTML = "";
  const marks = [["Approach", -T_APPROACH + 6], ["Impact", 0]];
  if (summary) marks.push(["QGP", 0.9], ["Hadrons", summary.qgpEnd], ["Freeze-out", summary.tFo]);
  else if (!col.upc) marks.push(["QGP", 0.9]);
  marks.forEach(([name, t]) => {
    const el = document.createElement("span");
    el.className = name === "Impact" || name === "Freeze-out" ? "mark key" : "mark"; el.textContent = name; el.dataset.t = t; el.title = name;
    el.style.left = `${100 * axis.uOf(t)}%`;
    el.addEventListener("click", () => { S.t = Math.max(t, -T_APPROACH) + (name === "Impact" ? 0.05 : 0); S.playing = false; syncPressed(); });
    M.appendChild(el);
  });
}

// ------------------------------------------------------------------ readouts + story
function updateStatic() {
  $("r-b").textContent = S.b.toFixed(1);
  $("r-c").textContent = col.upc ? "–" : col.c < 99.95 ? col.c.toFixed(col.c < 10 ? 1 : 0) : "100";
  $("r-np").textContent = col.npart;
  $("r-nc").textContent = col.ncoll;
  $("r-e2").textContent = col.npart > 2 ? col.eps[2].toFixed(2) : "–";
  $("r-life").textContent = summary ? summary.qgpEnd.toFixed(1) : col.upc ? "–" : "…";
  $("r-dn").textContent = init && !col.upc && fb ? Math.round(init.lookup.dNch) : col.upc ? "0" : "…";
  $("bval").innerHTML = `${S.b.toFixed(2)} <small>fm</small>`;
  const z = zoneOf(S.b);
  for (const btn of $("zones").children) btn.setAttribute("aria-pressed", btn.dataset.zone === z);
  const th = coulombDeflection(D, S.sys, S.b);
  const nm = (n) => SYMBOL[n] ?? `A = ${n.slice(1)}`;
  bmap.draw({ b: S.b, RA: model.RA, RB: model.RB, aA: params(D, S.sys.A).a ?? 0.5, aB: params(D, S.sys.B).a ?? 0.5,
    zones: zones(), bMax: bMax(), theta: th, labelA: `${nm(S.sys.A)} projectile`, labelB: `${nm(S.sys.B)} target`, zone: z });
  $("bmapVal").textContent = col.upc ? "no collision" : `${col.c.toFixed(0)} % centrality`;
  const w = init?.lookup?.warnings ?? [];
  $("warn").hidden = !w.length || col.upc; $("warn").textContent = w.join(" ");
}

let lastPhase = "";
function updateDynamic(Tnow) {
  const st = {
    nameA: ELEMENT[S.sys.A] ?? `A = ${model.nucA.A}`, nameB: ELEMENT[S.sys.B] ?? `A = ${model.nucB.A}`, A_A: model.nucA.A, A_B: model.nucB.A,
    b: S.b, npart: col.npart, ncoll: col.ncoll, nspec: model.nucA.A + model.nucB.A - col.npart, eps2: col.eps[2] ?? 0,
    gamma: model.gamma, beta: model.beta, t: S.t, tau0: model.o.tau0 ?? 0.4, Tnow, upc: col.upc,
    fbReady: !!summary, qgpEnd: summary?.qgpEnd ?? 99, tFo: summary?.tFo ?? 99, v2: init?.lookup?.vn_target?.[2] ?? 0,
    nHits: hitsList.length, theta: coulombDeflection(D, S.sys, S.b), crossT: crossingTime(D, Math.max(model.RA, model.RB), S.sys.sqrt_snn),
  };
  st.tau0 = 0.4;
  const [ph, phName] = phaseOf(st);
  const html = storyHTML(st);
  if (html !== $("storyText").innerHTML) $("storyText").innerHTML = html;
  if (ph !== lastPhase) {
    $("phaseName").textContent = phName; lastPhase = ph;
    const dotCol = { approach: "#a8dcff", impact: "#fff1d6", qgp: "#ffb14a", hadrons: "#ff8b6b", detect: "#7cc4ff", upc: "#c9a8ff" }[ph];
    $("phaseDot").style.background = dotCol; $("phaseDot").style.boxShadow = `0 0 10px ${dotCol}`;
  }
  $("r-T").textContent = Tnow > 0 ? Math.round(Tnow) : "–";
  $("r-T").style.color = Tnow > 0 ? cssBlackbody(Tnow) : "";
}

// ------------------------------------------------------------------ 3D labels
const labelEls = {};
function label(id, html) {
  if (!labelEls[id]) { const el = document.createElement("div"); el.className = "lab"; $("labels").appendChild(el); labelEls[id] = el; }
  const el = labelEls[id];
  if (el._html !== html) { el.innerHTML = html; el._html = html; }
  return el;
}
function placeLabel(id, html, v, show) {
  const el = label(id, html);
  const p = show ? stage.project(v) : null;
  const rect = $("stage").getBoundingClientRect();
  if (!p) { el.style.opacity = 0; return; }
  el.style.opacity = 1; el.style.left = `${rect.left + p[0]}px`; el.style.top = `${rect.top + p[1] - 10}px`;
}
function updateLabels(Tnow) {
  const t = S.t, xA = -T_APPROACH < t && t < 0 ? model.beta * t : t;
  const nm = (n) => SYMBOL[n] ?? `A = ${n.slice(1)}`;
  placeLabel("A", `<i style="background:#ffb14a"></i>${nm(S.sys.A)} · γ = ${Math.round(model.gamma).toLocaleString("en-US")}`, new THREE.Vector3(Math.min(xA, 60), S.b / 2 + model.RA + 1.5, 0), t < 0 && t > -32);
  placeLabel("B", `<i style="background:#7cc4ff"></i>${nm(S.sys.B)}`, new THREE.Vector3(Math.max(-xA, -60), -S.b / 2 + model.RB + 1.5, 0), t < 0 && t > -32);
  placeLabel("spec", "Spectators", new THREE.Vector3(Math.min(t, 40), S.b / 2 + model.RA + 1.5, 0), t > 1.5 && col.npart < model.nucA.A + model.nucB.A - 4);
  placeLabel("qgp", `QGP · ${Math.round(Tnow)} MeV`, new THREE.Vector3(0, (fb ? fb.radius(Math.max(t, 0.4)) : 5) + 1.5, 0),
    !!fb && t > 0.5 && Tnow > 157);
  placeLabel("rp", "Reaction plane", new THREE.Vector3(-22, 21, 0), S.view !== "beam" && t < 0 && t > -30);
  placeLabel("det", "Detector (drawn ~10¹⁵× too small)", new THREE.Vector3(0, 32.5, -6), summary && t > summary.tFo);
}

// ------------------------------------------------------------------ main loop
let last = performance.now(), cardClock = 1, lastSync = 0;
const PLAY_SECONDS = 16;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  // time-sliced fireball evolution (~7 ms per frame)
  if (gen) {
    const t0 = performance.now();
    let r;
    while (performance.now() - t0 < 7) { r = gen.next(); if (r.done) break; }
    if (r && r.done) finishFireball();
    else if (now - lastSync > 180) { volume.sync(); lastSync = now; }
  }
  if (S.playing) {
    const u = axis.uOf(S.t) + (dt * S.speed) / PLAY_SECONDS;
    // wait for the fireball before running past the impact
    const hold = !summary && !col.upc && S.t > 0.9 ? true : false;
    if (!hold) S.t = axis.tOf(Math.min(1, u));
    if (u >= 1) { S.playing = false; syncPressed(); }
  }
  const t = S.t;
  nucleons.update(t, { shape: S.shape });
  volume.update(t, stage.camera);
  arrived = hits.update(summary ? t : -1e9);
  // T at the centre slice now
  let Tnow = 0;
  if (fb && t > 0) Tnow = t < fb.tau_0 ? fb.T_max(fb.tau_0) : fb.T_max(t);
  // cards at ~12 Hz
  cardClock += dt;
  if (cardClock > 0.08) {
    cardClock = 0;
    eye.draw({ model, col, t, fb: fb && fb.snap && fb.snap.tau.length ? fb : null, tau0: 0.4, Tc: 156.5 });
    $("eyeVal").textContent = fb && t > 0 ? `T max ${Math.round(Tnow)} MeV` : `ε₂ = ${(col.eps[2] ?? 0).toFixed(2)}`;
    $("eyeCap").textContent = t > 0.4 && fb ? "Temperature at z = 0 (colour = blackbody of T). Dashed line: Ψ₂, the direction the flow is strongest." : "Looking down the beam. Filled dots collide; rings are spectators.";
    const v2in = init?.lookup?.vn_target?.[2] ?? 0;
    const r = phiHist.draw({ hits: arrived, psi2: col.psi[2] ?? 0, v2in, total: hits.nDraw });
    $("phiVal").textContent = r.N ? `v₂ = ${r.v2.toFixed(3)} ± ${r.err.toFixed(3)}` : col.upc ? "no particles" : "waiting";
    $("phiCap").innerHTML = r.N ? `${r.N.toLocaleString("en-US")} of ${hits.nDraw.toLocaleString("en-US")} drawn particles. Curve: 1 + 2v₂ cos 2(φ − Ψ₂) with the input v₂ = ${v2in.toFixed(3)}.`
      : "Charged particles in |η| < 0.8 vs angle to the reaction plane.";
    updateDynamic(Tnow);
    const fm = fmtTime(t);
    $("tval").innerHTML = `${fm.fm}<small>${fm.s}</small>`;
  }
  const u = axis.uOf(t);
  $("scrubFill").style.width = `${100 * u}%`; $("scrubKnob").style.left = `${100 * u}%`;
  $("scrub").setAttribute("aria-valuenow", Math.round(1000 * u));
  for (const m of $("marks").children) m.classList.toggle("on", t >= +m.dataset.t);
  updateLabels(Tnow);
  stage.tick(dt);
  stage.render();
  requestAnimationFrame(frame);
}

window.littleBang = { S, setB: (b) => setB(b), setSystem: (id) => setSystem(id), get fb() { return fb; }, get summary() { return summary; } };
buildControls();
S.b = bOfCentrality(D, S.sys.id, 35);
// test parameters for local screenshots (?sys=&b=&t=&shape=&view=&draw=&A=&tracks); the published page ignores them
const Q = new URLSearchParams(location.search);
if (Q.has("A")) { S.customA = +Q.get("A"); }
if (Q.has("sys") && Q.get("sys") !== "custom") S.sys = D.systems.find((x) => x.id === Q.get("sys")) ?? S.sys;
if (Q.has("shape")) S.shape = Q.get("shape");
if (Q.has("draw")) S.drawFrac = +Q.get("draw") / 100;
if (Q.has("tracks")) { S.tracks = true; hits.showTracks = true; }
newModel();
if (Q.get("sys") === "custom") setCustom();
if (Q.has("b")) setB(+Q.get("b"), true);
if (Q.has("view")) { S.view = Q.get("view"); stage.setView(S.view, true); }
if (Q.has("t")) { S.t = +Q.get("t"); S.playing = false; }
syncPressed();
buildMarks();
if (reduceMotion) S.t = 3;
requestAnimationFrame(frame);
