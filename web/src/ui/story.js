// Narrative card text (rewritten for the current state) and the "How it works" explainer.
const n0 = (x) => Math.round(x).toLocaleString("en-US");
const f1 = (x) => x.toFixed(1), f2 = (x) => x.toFixed(2);
const num = (s) => `<span class="k-num">${s}</span>`;

export function speedString(beta, gamma) {
  const x = 1 / (2 * gamma * gamma);           // 1 - beta for gamma >> 1
  const digits = Math.min(12, Math.max(2, Math.ceil(-Math.log10(x)) + 1));
  return beta.toFixed(digits).replace(/0+$/, "") + " c";
}

export function phaseOf(s) {
  if (s.upc) return s.t < 0 ? ["approach", "Approach"] : ["upc", "Ultra-peripheral pass"];
  if (s.t < 0) return ["approach", "Approach"];
  if (s.t < s.tau0) return ["impact", "Impact"];
  if (!s.fbReady || s.t < s.qgpEnd) return ["qgp", "Quark–gluon plasma"];
  if (s.t < s.tFo) return ["hadrons", "Hadronisation"];
  return ["detect", "Freeze-out and detection"];
}

/** s: {sys, nameA, nameB, A_A, A_B, b, c, npart, ncoll, nspec, eps2, gamma, beta, t, tau0, T0, Tnow, qgpEnd, tFo, dNch, v2, nHits, upc, theta, zone} */
export function storyHTML(s) {
  const [ph] = phaseOf(s);
  const A = `<span class="k-a">${s.nameA}</span>`, B = `<span class="k-b">${s.nameB}</span>`;
  const same = s.nameA === s.nameB;
  const nuclei = same ? `Two ${s.nameA} nuclei` : `A ${A} and a ${B} nucleus`;
  if (s.upc && ph !== "approach") {
    return `At ${num(f1(s.b) + " fm")} the nuclei miss each other: not one nucleon hits another. They still feel each other's electric field. At this energy the fields are flattened into bursts of photons, which can knock a nucleus apart or make particle pairs. The Coulomb kick bends the path by only ${num(fmtTheta(s.theta))}, so the path stays straight.`;
  }
  switch (ph) {
    case "approach":
      return `${nuclei} close in at ${num(speedString(s.beta, s.gamma))}. Relativity flattens them ${num(n0(s.gamma) + "×")} along the beam. Their centres are offset by the impact parameter ${num("b = " + f1(s.b) + " fm")}${s.upc ? ", more than their two radii together." : `, so ${num(n0(s.npart))} of ${num(n0(s.A_A + s.A_B))} nucleons sit in the overlap.`}`;
    case "impact":
      return `The discs pass through each other in ${num(f2(s.crossT) + " fm/c")}. ${num(n0(s.npart))} nucleons collide, in ${num(n0(s.ncoll))} nucleon–nucleon collisions. The other ${num(n0(s.nspec))} are spectators and fly on. The energy left in the overlap forms a dense glowing field.`;
    case "qgp":
      if (!s.fbReady) return `The overlap has become a droplet of quark–gluon plasma. Its shape follows the overlap: ε₂ = ${num(f2(s.eps2))}. Computing how it expands…`;
      return `The overlap is now quark–gluon plasma at up to ${num(n0(s.Tnow) + " MeV")}, about ${num(f1(s.Tnow * 0.0116) + "×10¹² K")}. ${s.eps2 > 0.15
        ? `The droplet is almond-shaped (ε₂ = ${num(f2(s.eps2))}). Pressure pushes harder across the short side, so more matter flows along the reaction plane.`
        : `The droplet is nearly round (ε₂ = ${num(f2(s.eps2))}), so it expands almost evenly in every direction.`} It expands and cools as it goes.`;
    case "hadrons":
      return `Below ${num("156.5 MeV")} quarks and gluons bind into hadrons. By ${num("τ ≈ " + f1(s.qgpEnd) + " fm/c")} almost none of the plasma is left. The hadron gas keeps flowing outward and colliding until about ${num(f1(s.tFo) + " fm/c")}.`;
    case "detect":
      return `The hadrons stop interacting and stream to the detector: ${num(n0(s.nHits))} charged particles in its central part. More of them fly along the reaction plane than across it. This is elliptic flow, ${num("v₂ = " + s.v2.toFixed(3))}, the almond shape handed on to the particles.`;
  }
  return "";
}

function fmtTheta(th) { return th < 1e-3 ? `${(th * 1e6).toFixed(1)} µrad` : `${(th * 1e3).toFixed(2)} mrad`; }

export function explainerHTML(D) {
  const src = D.sources.map((x) => `<li>${x.what}: ${x.ref}. <a href="https://arxiv.org/abs/${x.arxiv}" target="_blank" rel="noopener">arXiv:${x.arxiv}</a></li>`).join("");
  return `
<h3>The impact parameter</h3>
<p><em>b</em> is the distance between the centres of the two nuclei, measured across the beam. The impact-parameter map is the classic sketch of it. At low beam energy, near the Coulomb barrier, <em>b</em> sorts collisions into fusion, deep-inelastic reactions, grazing reactions and Rutherford scattering. At RHIC and LHC energies the nuclei move so fast that their paths stay straight (the Coulomb deflection is millionths of a radian), and <em>b</em> decides how much of each nucleus overlaps.</p>
<p>Experiments cannot measure <em>b</em>. They sort events by how many particles they produce and quote a <strong>centrality</strong>: 0–10 % are the most head-on, 80–100 % barely touch. Past about two nuclear radii no nucleons meet at all; these ultra-peripheral collisions are driven by photons from the nuclei's electric fields.</p>
<h3>Participants and spectators</h3>
<p>Each nucleon is drawn from the measured density of its nucleus (a Woods–Saxon profile, deformed for Xe, U and Cu). Two nucleons interact if they pass closer than √(σ<sub>NN</sub>/π), about 1.5 fm at the LHC. Nucleons that hit at least one other are <strong>participants</strong>. The rest, the <strong>spectators</strong>, fly on down the beam pipe. This is the Monte Carlo Glauber model. The same nuclei are kept when you move <em>b</em>, so you see one collision at different offsets.</p>
<h3>The fireball</h3>
<p>The participants deposit entropy in the overlap (the TRENTo initial condition), normalised to the measured number of charged particles. At τ₀ = 0.4 fm/c this matter is quark–gluon plasma. Its temperature comes from the lattice-QCD equation of state. It expands at the flow speed measured in the particle spectra and cools. Below T<sub>c</sub> = 156.5 MeV it turns into hadrons. The almond shape of mid-central collisions becomes an anisotropy of the flow, calibrated so that the particles carry the measured v₂, v₃ and v₄.</p>
<h3>What the detector card shows</h3>
<p>Each dot is one charged particle with |η| &lt; 0.8, the central part of the detector. Its direction is drawn from dN/dφ ∝ 1 + 2 Σ v<sub>n</sub> cos n(φ − Ψ<sub>n</sub>) with this event's flow. With a few thousand particles the measured v₂ scatters around the input by about 1/√(2N). The simulation knows the true reaction plane; an experiment has to estimate it from the particles.</p>
<h3>What is drawn to scale, and what is not</h3>
<p>Nucleon positions, the overlap, the fireball size, temperatures and times are the model's values in femtometres and fm/c. Three things are adjusted to be visible. The nuclei are drawn 1 fm thick instead of 2R/γ (press <em>True thickness</em> to see the real one). The fireball colour is the blackbody colour of 13 K per MeV; the real temperature is about 10¹² K. The detector is about 10¹⁵ times too small.</p>
<h3>Accuracy</h3>
<p>The physics is a JavaScript port of this project's Python model. Its results are checked against the Python code (Glauber averages, the initial entropy, the data lookup and the fireball evolution). The fireball is a calibrated model, not a full viscous hydrodynamics simulation. It is least accurate for peripheral and very small systems.</p>
<h3>Sources</h3>
<ol>${src}</ol>`;
}
