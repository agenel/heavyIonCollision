import * as THREE from "three";
import { Stage } from "./scene.js";
import { OrbitMap, NuclideChart, DeflPlot, outcome, heatLegend, LOGMIN, LOGMAX } from "./cards.js";
import { Nuclides } from "./physics/nuclides.js";
import { Potential } from "./physics/potential.js";
import { ecmFromElab } from "./physics/model.js";
import { compareDataset, usableSets, windowFor, datasetEnergies } from "./physics/compare.js";

const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const load = (p) => fetch(p).then((r) => r.json());
const [NJ, X, CAT, CAL, VAL] = await Promise.all([load("data/nuclides.json"), load("data/exfor.json"), load("data/catalogue.json"),
  load("data/calibration.json").catch(() => ({ params: {} })), load("data/validation.json").catch(() => null)]);
const nuc = new Nuclides(NJ);
const PARAMS = { ...(CAL.params ?? {}), orient: "fast" };   // interactive: correlated orientations (3 runs) for doubly deformed pairs
const USABLE = usableSets(X.sets);

// ------------------------------------------------------------------ worker
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
let reqId = 0; const pending = new Map();
worker.onmessage = (e) => { const p = pending.get(e.data.id); if (p) { pending.delete(e.data.id); e.data.type === "error" ? p.rej(new Error(e.data.error)) : p.res(e.data.result); } };
const ask = (msg) => new Promise((res, rej) => { const id = ++reqId; pending.set(id, { res, rej }); worker.postMessage({ ...msg, id }); });

// ------------------------------------------------------------------ systems
const CURATED = ["136Xe+208Pb", "136Xe+198Pt", "238U+248Cm", "238U+238U", "40Ca+208Pb", "58Ni+208Pb", "40Ar+208Pb",
  "204Hg+208Pb", "136Xe+248Cm", "48Ca+248Cm", "40Ca+124Sn", "206Pb+118Sn"];
const label = (n) => `${n.A}${nuc.zToSym[n.Z]}`;
const parsePair = (s) => { const [a, b] = s.split("+"); return { P: nuc.parse(a), T: nuc.parse(b) }; };
function datasetsFor(P, T) {
  return USABLE.filter((d) => d.projectile[0] === P.Z && d.projectile[1] === P.A && d.target[0] === T.Z && d.target[1] === T.A);
}
function barrierOf(P, T) {
  const b = new Potential(P, T, "bass80").barrier();
  if (b) return b.B;
  const p = new Potential(P, T, "prox77");        // no Bass barrier (very heavy systems): potential at 2 fm surface separation
  return p.V(p.C1 + p.C2 + 2);
}
function energiesFor(P, T) {
  const B = barrierOf(P, T), m = new Map();
  for (const d of datasetsFor(P, T)) for (const e of datasetEnergies(d, B)) { const k = e.Ecm.toFixed(0); if (!m.has(k)) m.set(k, e.Ecm); }
  return [...m.values()].sort((a, b) => a - b);
}

const S = { P: null, T: null, Ecm: 0, VB: 0, l: 0, stage: "final", plot: "defl", t: 0, playing: !reduceMotion, speed: 1, sys: null, wave: null, cmp: [] };

// ------------------------------------------------------------------ UI
const stage = new Stage($("stage"));
const orbitMap = new OrbitMap($("orbitMap"), (l) => setL(l));
const chart = new NuclideChart($("chart"), $("tip"));
const defl = new DeflPlot($("defl"));

function buildControls() {
  for (const s of CURATED) {
    const { P, T } = parsePair(s);
    const b = document.createElement("button");
    b.className = "pill"; b.dataset.sys = s;
    b.innerHTML = `${label(P)}+${label(T)}` + (datasetsFor(P, T).length ? "" : "<small>no table</small>");
    b.addEventListener("click", () => setSystem(P, T));
    $("systems").appendChild(b);
  }
  $("goCustom").addEventListener("click", () => {
    const P = nuc.parse($("projIn").value || ""), T = nuc.parse($("targIn").value || "");
    if (!P || !T) { $("sysNote").textContent = "Write nuclei as mass number + symbol, for example 136Xe and 208Pb."; return; }
    setSystem(P, T);
  });
  let eTimer = null;
  $("eSlider").addEventListener("input", (e) => { S.Ecm = +e.target.value * S.VB; showEnergy(); clearTimeout(eTimer); eTimer = setTimeout(runSystem, 200); });
  $("lSlider").addEventListener("input", (e) => setL(+e.target.value));
  for (const b of document.querySelectorAll("[data-stage]")) b.addEventListener("click", () => { S.stage = b.dataset.stage; syncTabs(); drawChart(); });
  for (const b of document.querySelectorAll("[data-plot]")) b.addEventListener("click", () => { S.plot = b.dataset.plot; syncTabs(); drawDefl(); });
  $("play").addEventListener("click", () => { if (!S.playing && S.wave && S.t >= tEnd() - 1) S.t = 0; S.playing = !S.playing; syncPlay(); });
  $("speed").addEventListener("click", () => { S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 0.5 : 1; $("speed").textContent = `${S.speed}×`; });
  const sc = $("scrub"); let drag = false;
  const seek = (e) => { const r = sc.getBoundingClientRect(); S.t = tEnd() * Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); S.playing = false; syncPlay(); };
  sc.addEventListener("pointerdown", (e) => { drag = true; sc.setPointerCapture(e.pointerId); seek(e); });
  sc.addEventListener("pointermove", (e) => drag && seek(e));
  sc.addEventListener("pointerup", () => (drag = false));
  sc.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") S.t = Math.min(tEnd(), S.t + 10); if (e.key === "ArrowLeft") S.t = Math.max(0, S.t - 10); if (e.key === " ") { e.preventDefault(); $("play").click(); } });
  for (const d of document.querySelectorAll("dialog")) { d.addEventListener("click", (e) => { if (e.target === d || e.target.dataset.close !== undefined) d.close(); }); }
  $("help").addEventListener("click", () => $("explainer").showModal());
  $("openCat").addEventListener("click", () => $("catalogue").showModal());
  $("catN").textContent = CAT.rows.length;
  buildCatalogue(); buildExplainer();
  $("chartLegend").innerHTML = `<span>σ model:</span><span style="display:inline-flex;gap:0">${heatLegend().map((c) => `<i style="background:${c};border-radius:0;margin:0;width:12px"></i>`).join("")}</span><span>10⁻⁶ … 10³ mb</span>` +
    `<span><i style="background:transparent;border:2px solid #7fd6a4"></i>data within ×3</span><span><i style="background:transparent;border:2px solid #ff8b7b"></i>model above</span><span><i style="background:transparent;border:2px solid #7cb4ff"></i>model below</span><span><i style="background:transparent;border:2px solid #8d97a9"></i>not modelled</span>`;
}
function syncTabs() {
  for (const b of document.querySelectorAll("[data-stage]")) b.setAttribute("aria-pressed", b.dataset.stage === S.stage);
  for (const b of document.querySelectorAll("[data-plot]")) b.setAttribute("aria-pressed", b.dataset.plot === S.plot);
  $("deflTitle").textContent = { defl: "Deflection function", wil: "Wilczyński plot", data: "Model versus data" }[S.plot];
}
function syncPlay() { $("play").textContent = S.playing ? "❚❚" : "▶"; $("play").setAttribute("aria-label", S.playing ? "Pause" : "Play"); }

function buildCatalogue() {
  const bib = CAT.bibliography;
  const ref = (k) => { const b = bib[k]; if (!b) return k; const u = b.doi ? `https://doi.org/${b.doi}` : b.arxiv ? `https://arxiv.org/abs/${b.arxiv}` : null; return u ? `<a href="${u}" target="_blank" rel="noopener" title="${b.text.replace(/"/g, "&quot;")}">${k}</a>` : k; };
  const rows = CAT.rows.map((r) => `<tr class="${r.pairs.length ? "pick" : ""}" data-n="${r.n}"><td>${r.n}</td><td class="sys">${r.system}</td><td>${r.E_lab}</td><td>${r.facility}</td><td>${r.observables}</td><td>${r.refs.map(ref).join(", ")}</td><td>${r.data}</td></tr>`);
  $("catTable").innerHTML = `<thead><tr><th>#</th><th>System</th><th>E_lab (MeV)</th><th>Facility</th><th>Observables</th><th>Ref</th><th>Data</th></tr></thead><tbody>${rows.join("")}</tbody>`;
  $("catTable").addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const tr = e.target.closest("tr.pick"); if (!tr) return;
    const r = CAT.rows.find((q) => q.n === +tr.dataset.n), [Zp, Ap, Zt, At] = r.pairs[0];
    const Elab = parseFloat(String(r.E_lab).replace(/[^0-9.].*$/, ""));
    $("catalogue").close();
    setSystem({ Z: Zp, A: Ap }, { Z: Zt, A: At }, isFinite(Elab) && Elab > 20 ? ecmFromElab({ A: Ap }, { A: At }, Elab) : null);
  });
}

function buildExplainer() {
  const s = VAL?.summary;
  const acc = s ? `Against ${s.train.n + s.test.n} measured cross sections in ${VAL.rows.length} datasets: on the ${s.test.n} held-out points the model is within a factor 3 for ${(100 * s.test.x3).toFixed(0)} % and within a factor 10 for ${(100 * s.test.x10).toFixed(0)} % (mean log₁₀(model/data) ${s.test.mean.toFixed(2)}).` : "";
  const refs = [["[AB03]", "Abe & Bouriquet, Acta Phys. Pol. B 34 (2003) 1927 (surface-friction equations)"], ["[GK78]", "Gross & Kalinowski, Phys. Rep. 45 (1978) 175"],
    ["[BRST77]", "Błocki, Randrup, Świątecki, Tsang, Ann. Phys. 105 (1977) 427 (proximity potential; constants via Dutt & Puri PRC 81 (2010) 064609)"],
    ["[Bass]", "Bass, Nuclear Reactions with Heavy Ions (1980): barrier used for E/V_B"], ["[AYYU18]", "Ayik et al., PRC 97 (2018) 054618 (diffusion in N, Z)"],
    ["[FJL09]", "Feng, Jin, Li, Scheid, PRC 80 (2009) 067601 (dinuclear-system master equation)"], ["[ZFZ15]", "Zhu, Feng, Zhang, J. Phys. G 42 (2015) 085102 (Kramers quasi-fission rate)"],
    ["[Li06]", "Li et al., J. Phys. G 32 (2006) 1143 (relaxation times)"], ["[VKW85]", "Viola, Kwiatkowski, Walker, PRC 31 (1985) 1550 (fission-fragment TKE)"],
    ["[dR13]", "du Rietz et al., PRC 88 (2013) 054618 (quasi-fission versus mean fissility)"], ["[YL15]", "Yanez & Loveland, PRC 91 (2015) 044608 (evaporation and fission competition)"],
    ["[BM]", "Bohr & Mottelson, Nuclear Structure II; Ignatyuk et al. (1975): damping of shell effects with temperature"],
    ["[AME]", "Wang et al., Chin. Phys. C 45 (2021) 030003 (AME2020 masses)"], ["[FRDM]", "Möller et al., ADNDT 109–110 (2016) 1 (FRDM2012)"],
    ["[WS4]", "Wang et al., PLB 734 (2014) 215; Wang & Liu, CPC 48 (2024) 094103 (fission barriers)"], ["[EXFOR]", "IAEA EXFOR database (nds.iaea.org), measured cross sections"],
    ["[Bar15]", "Barrett et al., PRC 91 (2015) 064615 (136Xe+208Pb yields; the tef metric)"]];
  $("explainerBody").innerHTML = `
<h3>What happens</h3><p>At a few MeV per nucleon above the Coulomb barrier two heavy nuclei come close enough to touch. Their surfaces stick together, a neck forms, and for about 10⁻²¹ s (a zeptosecond) the pair rotates as one dinuclear system. Protons and neutrons flow through the neck in both directions, and friction turns up to a few hundred MeV of kinetic energy into heat. Then the neck breaks and two new nuclei fly apart. Cool enough products survive as isotopes that are hard to make any other way, for example neutron-rich nuclei near N = 126 or new actinides.</p>
<h3>The impact parameter decides</h3><p>Far apart (large ℓ) the nuclei only feel each other's charge: Rutherford scattering. At the grazing distance a few nucleons hop across (quasi-elastic transfer). Closer in the nuclei stick, lose energy and swap many nucleons (deep-inelastic collisions); the orbit can wrap around to negative angles. Closer still the system is captured: it fuses into one nucleus or, for heavy pairs, falls apart again after a longer time (quasi-fission).</p>
<h3>The model, step by step</h3><ol>
<li><b>Orbit.</b> Classical motion with the Coulomb force, the proximity nuclear potential [BRST77] and surface friction [GK78, AB03]; the neck elongates toward the scission shape of fission systematics [VKW85] with relaxation time 4 zs [Li06], weighted by the quasi-fission propensity of the mean fissility [dR13].</li>
<li><b>Deformed nuclei.</b> Statically deformed partners (A ≥ 100, |β₂| ≥ 0.15, FRDM2012 deformations) are averaged over random orientations (3-point Gauss–Legendre in cos θ): a nucleus hit on its tip touches earlier and has a lower barrier.</li>
<li><b>Capture.</b> A trapped dinuclear system either fuses (fraction set by the mean fissility) or decays over its quasi-fission barrier at the Kramers rate [ZFZ15].</li>
<li><b>Nucleon exchange.</b> A master equation for the proton and neutron numbers along the orbit, single-nucleon steps obeying detailed balance [FJL09, AYYU18], driven by the measured masses [AME, FRDM] with shell effects damped by the temperature [BM].</li>
<li><b>Cooling.</b> The excitation energy is shared by mass; neutrons evaporate until the energy is below the separation energy, and heavy products may fission instead [YL15, WS4].</li>
<li><b>Cross section.</b> σ = π/k² Σ(2ℓ+1) P_ℓ, summed over angular momenta.</li></ol>
<h3>Calibration and accuracy</h3><p>Global parameters (friction strength, diffusion strength, transfer range, the effective temperature floor of cold transfer) were fitted once to four training datasets (136Xe+208Pb, 40Ar, 40Ca, 58Ni+208Pb) and frozen: ${JSON.stringify(PARAMS)}. ${acc} Published models do about as well near the target and fail by orders of magnitude far from it [Bar15]. The chart's rings show every measured point with its model/data colour.</p>
<h3>What is not modelled</h3><ul><li>Direct (tunnelling) transfer at large separations beyond the calibrated form factor, which matters most below the barrier.</li><li>Charged-particle evaporation (protons, alphas) and gamma competition above the neutron threshold.</li><li>Deformed nuclei are only partly treated: the orientation average changes the radius along the line of centres, not the curvature or the Coulomb quadrupole energy. On this page doubly deformed pairs use three correlated orientations; the validation uses the full 3 × 3 average.</li><li>Sub-barrier transfer (for example 204Hg+208Pb below our barrier) is essentially absent.</li><li>Fluctuations of the orbit (the Wilczyński plot is smeared for display).</li></ul>
<h3>Drawing conventions</h3><p>The 3D view shows the centre-of-mass frame in the reaction plane; the grid circles are 10 fm apart. Nucleons are placed randomly inside each nucleus; protons are red, neutrons pale. Nucleons move across the neck when the model's mean proton or neutron number changes; the extra back-and-forth hopping is a visual cue for the exchange rate.</p>
<h3>Sources</h3><ol>${refs.map(([k, t]) => `<li>${k} ${t}</li>`).join("")}</ol>
<p>The measured reactions and their references are listed under "All reactions in the literature".</p>`;
}

// ------------------------------------------------------------------ state changes
function setSystem(P, T, Ecm = null) {
  S.P = P; S.T = T; S.VB = barrierOf(P, T);
  const Es = energiesFor(P, T);
  S.Ecm = Ecm ?? (Es.length ? Es[Math.floor(Es.length / 2)] : 1.25 * S.VB);
  for (const b of $("systems").children) b.setAttribute("aria-pressed", b.dataset.sys === `${label(P)}+${label(T)}`);
  $("projIn").value = label(P); $("targIn").value = label(T);
  const E = $("energies"); E.innerHTML = "";
  for (const e of Es) {
    const b = document.createElement("button"); b.className = "pill"; b.textContent = `${e.toFixed(0)} MeV`; b.title = "an energy with measured data (centre of mass)";
    b.addEventListener("click", () => { S.Ecm = e; showEnergy(); runSystem(); });
    E.appendChild(b);
  }
  const nd = datasetsFor(P, T).length;
  $("sysMeta").textContent = `Z₁Z₂ = ${P.Z * T.Z} · V_B ≈ ${S.VB.toFixed(0)} MeV`;
  $("sysNote").textContent = nd ? `${nd} measured dataset${nd > 1 ? "s" : ""} in EXFOR for this pair. Energy buttons: energies with data (centre of mass).` :
    "No tabulated cross sections for this pair; the model still runs.";
  stage.setNuclei(P, T, mulberry(P.Z * 1000 + T.A));
  showEnergy();
  runSystem();
}
function showEnergy() {
  $("eVal").innerHTML = `${S.Ecm.toFixed(0)} <small>MeV c.m. · ${(S.Ecm * (S.P.A + S.T.A) / S.T.A / S.P.A).toFixed(2)} MeV/u</small>`;
  $("eSlider").value = (S.Ecm / S.VB).toFixed(3);
  $("r-e").textContent = (S.Ecm / S.VB).toFixed(2);
}
let sysToken = 0;
async function runSystem() {
  const token = ++sysToken;
  $("busy").hidden = false;
  $("busy").textContent = `computing ${label(S.P)} + ${label(S.T)} at ${S.Ecm.toFixed(0)} MeV…`;
  if (!S.sys) { $("phaseName").textContent = "Computing"; $("storyText").innerHTML = `Running the model for ${label(S.P)} + ${label(S.T)} at ${S.Ecm.toFixed(0)} MeV: about 40 partial waves, each an orbit with friction and a master equation for the nucleon exchange.`; }
  const res = await ask({ type: "system", P: S.P, T: S.T, Ecm: S.Ecm, params: PARAMS });
  if (token !== sysToken) return;
  S.sys = res;
  const lMax = res.waves[res.waves.length - 1].l;
  $("lSlider").max = lMax;
  // default ℓ: the most deep-inelastic partial wave that still separates (the interesting region), else grazing
  if (!S.lChosen || S.l > lMax) {
    const dic = res.waves.filter((w) => outcome(w) === "dic");
    S.l = dic.length ? dic[Math.floor(dic.length * 0.6)].l : res.col.lGrazing;
  }
  $("r-cap").textContent = res.sigCap.toFixed(0);
  await compareData();
  $("busy").hidden = true;
  drawAll();
  runWave();
}
async function compareData() {
  S.cmp = [];
  const sets = datasetsFor(S.P, S.T).filter((d) => datasetEnergies(d, S.VB).some((e) => Math.abs(e.Ecm - S.Ecm) < 0.03 * S.Ecm));
  const fin = new Map(S.sys.final);
  for (const d of sets) {
    let final = fin;
    const win = windowFor(d);
    if (win) { const r = await ask({ type: "system", P: S.P, T: S.T, Ecm: S.Ecm, params: { ...PARAMS, window: win } }); final = new Map(r.final); }
    const c = compareDataset(d, final);
    c.points.forEach((p) => { p.set = d.id; p.dz = p.Z - (Math.abs(p.Z - S.P.Z) < Math.abs(p.Z - S.T.Z) ? S.P.Z : S.T.Z); });
    c.outside.forEach((p) => { p.set = d.id + " (outside the model: fission or quasi-fission fragment)"; p.tef = NaN; });
    S.cmp.push({ ...c, ds: d });
  }
}
function setL(l) {
  S.l = Math.max(0, Math.min(+$("lSlider").max || 300, Math.round(l))); S.lChosen = true;
  $("lSlider").value = S.l;
  drawOrbit(); drawDefl();
  clearTimeout(setL.tm); setL.tm = setTimeout(runWave, 60);
}
let waveToken = 0;
async function runWave() {
  const token = ++waveToken;
  const w = await ask({ type: "wave", P: S.P, T: S.T, Ecm: S.Ecm, l: S.l, params: PARAMS });
  if (token !== waveToken) return;
  S.wave = w; S.t = S.playing ? 0 : Math.min(S.t, tEnd());
  stage.resetOwners();
  // trail of both centres in the CM frame
  const mP = S.P.A / (S.P.A + S.T.A), mT = 1 - mP;
  const R = w.hist.map((h) => relVec(h, w));
  stage.setTrail(R.map(([x, y]) => [mT * x, mT * y]), R.map(([x, y]) => [-mP * x, -mP * y]));
  const tc = w.hist.filter((h) => h.ff > 0.3);
  const c = $("scrubContact");
  if (tc.length) { c.hidden = false; c.style.left = `${(100 * tc[0].t) / tEnd()}%`; c.style.width = `${(100 * (tc[tc.length - 1].t - tc[0].t)) / tEnd()}%`; } else c.hidden = true;
  updateReadouts();
}
const tEnd = () => (S.wave ? S.wave.hist[S.wave.hist.length - 1].t : 1);
function relVec(h, w) { const phi = Math.PI - w.tailIn - h.th; return [h.r * Math.cos(phi), h.r * Math.sin(phi)]; }
function sampleAt(t) {
  const H = S.wave.hist;
  let i = 1; while (i < H.length - 1 && H[i].t < t) i++;
  const a = H[i - 1], b = H[i], f = Math.max(0, Math.min(1, (t - a.t) / Math.max(b.t - a.t, 1e-9)));
  const lerp = (k) => a[k] + f * (b[k] - a[k]);
  return { t, r: lerp("r"), th: lerp("th"), d: lerp("d"), Ed: lerp("Ed"), ff: lerp("ff"), Z1: lerp("Z1"), N1: lerp("N1"), sZ: lerp("sZ"), sN: lerp("sN"), surv: lerp("surv") };
}

// ------------------------------------------------------------------ drawing
function drawOrbit() {
  const r = orbitMap.draw(S.sys, S.l, { P: label(S.P), T: label(S.T) });
  if (r) { $("r-l").textContent = S.l; $("r-b").textContent = r.b.toFixed(1); $("lVal").innerHTML = `${S.l} <small>ħ · b = ${r.b.toFixed(1)} fm</small>`; }
  $("orbitVal").textContent = S.sys ? `ℓ_grazing ≈ ${S.sys.col.lGrazing}ħ` : "";
}
function drawChart() {
  const data = S.cmp.flatMap((c) => [...c.points, ...c.outside]);
  chart.draw(S.sys, nuc, S.stage, data);
  const tot = [...new Map(S.sys[S.stage])].filter(([k]) => { const Z = Math.floor(k / 1000), A = k % 1000; return !(Z === S.P.Z && A === S.P.A) && !(Z === S.T.Z && A === S.T.A); })
    .reduce((a, [, v]) => a + v, 0) / 2;
  $("chartCap").textContent = `Transfer products ${S.stage === "final" ? "after neutron evaporation" : "before evaporation (primary)"}: ${tot.toFixed(0)} mb in total. ` +
    (data.length ? `${data.length} measured values at this energy.` : "No measured values at this energy.");
}
function drawDefl() {
  defl.draw(S.plot, S.sys, S.l, S.cmp);
  const cap = { defl: "Deflection angle (white) and kinetic-energy loss (amber) per angular momentum; bands: Rutherford, quasi-elastic, deep-inelastic, captured. Red line: the chosen ℓ.",
    wil: "Cross section versus centre-of-mass angle and energy loss (Wilczyński 1973): quasi-elastic events near the grazing angle, damped ones focusing to smaller angles.",
    data: S.cmp.length ? S.cmp.map((c) => `${c.ds.id}: ${c.n} nuclides, mean log₁₀(model/data) ${c.mean.toFixed(2)}, ${c.within3} within ×3`).join(" · ") : "" }[S.plot];
  $("deflCap").textContent = cap;
}
function drawAll() { drawOrbit(); drawChart(); drawDefl(); syncTabs(); }

function updateReadouts() {
  const w = S.wave; if (!w) return;
  $("r-th").textContent = isFinite(w.theta) && w.pCapture < 0.5 ? (Math.acos(Math.cos(w.theta)) * 180 / Math.PI).toFixed(0) : "–";
  $("r-tkel").textContent = isFinite(w.TKEL) ? w.TKEL.toFixed(0) : "–";
  $("r-tc").textContent = (w.tContact / 299.79).toFixed(2);
}

const n0 = (x) => Math.round(x).toLocaleString("en-US"), f1 = (x) => x.toFixed(1);
const num = (s) => `<span class="k-num">${s}</span>`;
function story(sm) {
  const w = S.wave, P = `<span class="k-a">${label(S.P)}</span>`, T = `<span class="k-b">${label(S.T)}</span>`;
  const RA = w.C1, RB = w.C2, s = sm.r - sm.d - RA - RB;
  const dZ = sm.Z1 - S.P.Z, dN = sm.N1 - (S.P.A - S.P.Z);
  const kind = w.pCapture > 0.5 ? "captured" : outcome({ ...w, minS: Math.min(...w.hist.map((h) => h.r - h.d)) - RA - RB });
  const flow = (v, p, n) => (Math.abs(v) < 0.15 ? `no net ${p}` : `${num(Math.abs(v).toFixed(1))} ${v > 0 ? `${n} to the ${label(S.P)}-like side` : `${n} to the ${label(S.T)}-like side`}`);
  if (sm.t < (w.hist.find((h) => h.ff > 0.05)?.t ?? Infinity)) {
    if (kind === "rutherford") return ["approach", "Rutherford orbit", `At ℓ = ${num(S.l + "ħ")} the ${P} passes the ${T} at ${num(f1(S.l / S.sys.k) + " fm")} impact parameter. Their nuclear surfaces never meet, so only the Coulomb force acts: a Rutherford orbit, no nucleons exchanged.`];
    return ["approach", "Approach", `${P} (${num(S.P.Z)} protons, ${num(S.P.A - S.P.Z)} neutrons) comes in at ${num(f1(S.Ecm) + " MeV")}, ${num((S.Ecm / S.VB).toFixed(2) + " ×")} the Coulomb barrier, with impact parameter ${num(f1(S.l / S.sys.k) + " fm")}. The Coulomb repulsion slows it and bends the orbit.`];
  }
  if (sm.ff > 0.05) {
    return ["contact", "Contact", `The surfaces touch and a neck forms. ${num(f1(sm.Ed) + " MeV")} of kinetic energy has turned into heat. So far ${flow(dZ, "proton flow", "protons")} and ${flow(dN, "neutron flow", "neutrons")}; the spread is ±${num(sm.sZ.toFixed(1))} protons and ±${num(sm.sN.toFixed(1))} neutrons.`];
  }
  if (kind === "captured") return ["captured", "Captured", `The pair is trapped behind its barrier: it fuses into one nucleus or decays later by quasi-fission. Partial waves like this one feed σ_capture (${num(n0(S.sys.sigCap) + " mb")}).`];
  const th = Math.acos(Math.cos(w.theta)) * 180 / Math.PI;
  return ["separate", "Separation", `The neck breaks. The fragments fly apart at ${num(th.toFixed(0) + "°")} (centre of mass) having lost ${num(f1(w.TKEL) + " MeV")}. On average the ${P}-like fragment gained ${num((dZ >= 0 ? "+" : "") + dZ.toFixed(1))} protons and ${num((dN >= 0 ? "+" : "") + dN.toFixed(1))} neutrons; hot fragments then evaporate neutrons (see the nuclide chart).`];
}
let lastPhase = "";

// ------------------------------------------------------------------ main loop
let last = performance.now(), textClock = 1;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (S.wave) {
    let sm = sampleAt(S.t);
    if (S.playing) {
      const rate = (sm.ff > 0.05 ? 90 : 320) * S.speed;       // fm/c per second (slower while in contact)
      S.t += rate * dt;
      if (S.t >= tEnd()) { S.t = tEnd(); S.playing = false; syncPlay(); }
      sm = sampleAt(S.t);
    }
    const [x, y] = relVec(sm, S.wave), mP = S.P.A / (S.P.A + S.T.A), mT = 1 - mP;
    const heat = Math.min(1, sm.Ed / Math.max(60, 0.25 * S.Ecm));
    stage.update({ cA: [mT * x, mT * y], cB: [-mP * x, -mP * y], wantZ1: Math.round(sm.Z1), wantN1: Math.round(sm.N1),
      ff: sm.ff, heat, t: S.t, chatter: sm.ff > 0.3 ? 0.25 * sm.ff : 0 });
    textClock += dt;
    if (textClock > 0.1) {
      textClock = 0;
      const [ph, name, html] = story(sm);
      if ($("storyText").innerHTML !== html) $("storyText").innerHTML = html;
      if (ph !== lastPhase) { lastPhase = ph; $("phaseName").textContent = name; const c = { approach: "#a8dcff", contact: "#ff7a66", captured: "#ff7a66", separate: "#ffb14a" }[ph]; $("phaseDot").style.background = c; $("phaseDot").style.boxShadow = `0 0 10px ${c}`; }
      $("r-dzn").textContent = `${(sm.Z1 - S.P.Z >= 0 ? "+" : "") + (sm.Z1 - S.P.Z).toFixed(1)} ${(sm.N1 - S.P.A + S.P.Z >= 0 ? "+" : "") + (sm.N1 - S.P.A + S.P.Z).toFixed(1)}`;
      $("tval").innerHTML = `${(S.t / 299.79).toFixed(2)} zs<small>${f1(S.t)} fm/c · r = ${f1(sm.r)} fm</small>`;
    }
    const u = S.t / tEnd();
    $("scrubFill").style.width = `${100 * u}%`; $("scrubKnob").style.left = `${100 * u}%`;
  }
  stage.tick(); stage.render();
  requestAnimationFrame(frame);
}

function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// local test parameters (?p=&t=&E=&l=&t=&plot=); the published page ignores the query string
const Q = new URLSearchParams(location.search);
buildControls(); syncPlay();
const first = Q.has("p") ? parsePair(Q.get("p")) : parsePair("136Xe+208Pb");
if (Q.has("l")) { S.l = +Q.get("l"); S.lChosen = true; }
if (Q.has("plot")) S.plot = Q.get("plot");
if (Q.has("t")) { S.playing = false; }
setSystem(first.P, first.T, Q.has("E") ? +Q.get("E") : null);
if (Q.has("t")) { const want = +Q.get("t"); const wait = () => (S.wave ? (S.t = want * 299.79) : setTimeout(wait, 50)); wait(); }
window.nucleonExchange = { S };
requestAnimationFrame(frame);
