# Multi-nucleon transfer explorer — plan

Working title: **"The Nucleon Exchange"**, a companion page to *The Little Bang* (same look, same publish and
test pipeline). Status: built (T1–T6), 2026-09-26 — see §10. Research behind it (verified citations, formulas, data catalogue):

- `01-models.md` — trajectory models with friction, DNS master equation, Langevin, GRAZING, TDHF, ImQMD, Fokker–Planck;
  recommended browser model with every constant and its source (66 citations).
- `02-measured-reactions.md` — 105 measured reactions (~100 projectile–target pairs), key numbers per priority system,
  EXFOR accession numbers, data-quality flags (152 DOIs resolved).
- `03-nuclear-inputs.md` — masses (AME2020 + FRDM2012), deformations, radii, potentials, level densities,
  fission barriers; files, sizes, licences.

## 1. What the page is for

At 5–10 MeV per nucleon two heavy nuclei meet just above their Coulomb barrier. The impact parameter decides the
outcome, exactly as in the Dubna sketch: Rutherford scattering → grazing (quasi-elastic, 1–2 nucleons move) →
deep-inelastic (the nuclei stick for ~10⁻²¹ s, rotate, exchange dozens of nucleons and convert up to ~300 MeV of
kinetic energy into heat) → capture (fusion or quasi-fission). The products include neutron-rich nuclei near N = 126
and new actinide isotopes that no other reaction reaches. The page lets you *see* that: drag b (or ℓ) and watch the
trajectory bend, the neck form, nucleons cross, and the products land on a nuclide chart next to the measured ones.

## 2. The page

| Element | Content |
|---|---|
| Hero (3D, three.js) | The two nuclei as nucleon clusters (round, no Lorentz contraction at these energies) on their real curved orbit in the reaction plane; a neck while in contact; individual protons/neutrons shown crossing at the model's rate; heat as a glow (V). Time scrubber in zeptoseconds. |
| Main control | Impact parameter b / angular momentum ℓ (slider, drag on the trajectory map, zone presets) |
| Second control | Beam energy (E_cm / V_B from 0.9 to 2), system picker (curated list + any Z,A pair), potential and friction options in an "expert" drawer |
| Trajectory map card | The Dubna-style picture made live: family of orbits for all ℓ with the chosen one highlighted, zones (Rutherford / quasi-elastic / deep-inelastic / capture), grazing angle |
| Deflection-function card | Θ(ℓ) and TKEL(ℓ), contact time; the classic "rainbow" and orbiting to negative angles |
| Wilczyński card | d²σ/dθ dTKEL computed live; overlay of measured ridges where published (Kozulin 2012, 136Xe+208Pb) |
| Nuclide chart card | N–Z chart around the reaction partners: primary (before evaporation) and final yields as a heat map, measured cross sections as circles (EXFOR), magic numbers and stability line; click a nuclide for σ model vs data |
| Mass–TKE card | Primary mass vs total kinetic energy, the two-humped quasi-elastic + damped structure (Kozulin 2012 data) |
| Readouts | E_cm, V_B (Coulomb barrier), ℓ_gr, θ_gr, TKEL, contact time, ΔZ/ΔN of the mean product, σ(capture), σ(transfer) |
| Narrative card | Rewrites per state, e.g. "At ℓ = 180 ħ the nuclei touch for 1.9 zs, lose 142 MeV and swap on average 3 protons and 7 neutrons; the lead-like partner is pulled toward N = 126." |
| "How it works" | Model, calibration, accuracy (factor 2–5 near the target, ~10 far away), sources |

## 3. Physics model (live, in a Web Worker, < 1 s)

Recommended in `01-models.md` §3, with the fixes found there:

1. **Entrance channel and trajectory.** Proximity 77 nuclear potential (Błocki et al. 1977; constants via Dutt & Puri
   PRC 81, 064609) + Coulomb + centrifugal; surface-friction model (Gross & Kalinowski, Phys. Rep. 45, 175) in the form of
   Abe & Bouriquet (APPB 34, 1927): radial and tangential friction ∝ (dV_N/dr)², rolling/sticking limits; RK4 in
   (r, θ, p, L); Rutherford tail analytically. Outputs Θ(ℓ), TKEL(ℓ), contact time (surface separation < 2 fm),
   E_diss(t), L(t). Optional Langevin noise (fluctuation–dissipation, T = √(E*/a)) for the Wilczyński spread.
   *Fixes required by the research:* (a) the friction strength K_r⁰ must be calibrated together with the potential
   (with Prox 77 the Gross–Kalinowski value blocks the measured capture of 40Ca+208Pb); (b) spherical fragments cannot
   reach the fully damped TKE of Xe+Pb and U+Cm → add one elongation (neck) coordinate, or cap fully damped events at the
   Viola fission-fragment TKE (constants to be verified); (c) Prox 77 has no barrier for the heaviest systems → use a
   contact-point prescription there (DNS convention: potential at the touching distance / pocket).
2. **Nucleon exchange.** Master equation in (Z₁, N₁) with single-nucleon steps and detailed-balance rates
   W± = D·exp(∓ΔU/2T); driving potential U from the mass table (AME2020, FRDM2012 beyond it) + Coulomb + nuclear + rotational
   energy at contact (DNS convention, Feng et al. PRC 80, 067601; Zhu, Feng & Zhang J. Phys. G 42, 085102). Diffusion
   strengths D_NN ≈ 0.05–0.1 (fm/c)⁻¹, D_ZZ ≈ D_NN/2 (Ayik et al. PRC 97, 054618) switched on by the Woods–Saxon form factor
   of the surface separation (ρ_F = 2 fm, a_F = 0.6 fm); integrated along each trajectory while the nuclei are in contact.
   A fast Gaussian mode (Ayik covariance equations) for dragging; the full master equation when the slider stops.
   Optional "microscopic DNS" rates (Li et al. J. Phys. G 32, 1143) for comparison.
3. **Cross sections.** σ(Z,N) = (π/k²) Σ_ℓ (2ℓ+1) P_ℓ(Z,N); capture ℓ reported separately (fusion + quasi-fission).
   Angle and TKE per channel from Θ(ℓ) and TKE = E_cm + Q_gg − E_diss.
4. **De-excitation.** E* shared in proportion to mass; neutron-evaporation cascade with separation energies from the mass
   table and Fermi-gas temperatures; Γ_n/Γ_f competition for Z ≳ 88 (Yanez & Loveland PRC 91, 044608; Ignatyuk level
   density; fission barriers from WS4-BF). Charged-particle emission neglected (stated).
5. **Direct (quasi-elastic) transfer** at s > 2 fm is missing from this model (known shortcoming of DNS-type models,
   fixed in the literature by adding GRAZING). Plan: implement it later only if the validation shows the ±1–2 nucleon
   channels are off by more than a factor 3; otherwise state it.

## 4. Systems

- **Any projectile + target** (Z, A from the mass table) at any energy: the model runs for all of them.
- **Curated list with data** (overlay + validation), from `02-measured-reactions.md`:
  - heavy / N = 126: 136Xe+208Pb (Barrett 2015 EXFOR C2178; Kozulin 2012 mass–TKE + F1274), 136Xe+198Pt (Watanabe 2015
    D0799, Desai 2019/2020 C2398/C2922), 136Xe+238U, 204Hg+208Pb (C2515), 160Gd+186W (C1829, F1350);
  - actinides: 238U+248Cm (Schädel 1982 — figures only, no database entry: largest gap), 238U+238U (Kratz 2013 D0776),
    238U+232Th, 48Ca+248Cm (D8038);
  - near-barrier transfer (LNL): 40Ca+208Pb (D0845), 58Ni+208Pb (D0843), 40Ar+208Pb (D0816, best absolute dataset),
    40Ca+124Sn, 40Ca+90,96Zr, 64Ni+238U, 90Zr+208Pb, 92Mo+54Fe, 206Pb+118Sn;
  - classic deep-inelastic: 40Ar+232Th (Wilczyński 1973), 84Kr+238U, 86Kr+Ni/Sn.
- **The full catalogue** (~100 pairs) is listed in the "?" panel with references, with a data overlay wherever numbers
  are available.

## 5. Data acquisition (needs your permission to download)

| File | Source | Size | Use |
|---|---|---|---|
| `mass-frdm12.dat` (AME2020 + FRDM2012, β₂, β₄, shell energies) | IAEA RIPL-4 on GitHub | 805 kB | masses, Q-values, deformations |
| `mass-ws4.dat` | IAEA RIPL-4 on GitHub | 802 kB | alternative mass model (uncertainty band) |
| `charge_radii.csv` | IAEA NDS (Angeli–Marinova) | 29 kB | radii check |
| `BFWS4.txt` | imqmd.com (Wang et al., CPC 48 (2024) 094103) | 139 kB | fission barriers for de-excitation |
| EXFOR entries (≈25, listed in `02-measured-reactions.md` §3.2) | IAEA Dataexplorer API (JSON) | a few kB each | measured cross sections |
| Kozulin 2012 mass–TKE, Schädel 1982 U+Cm | journal figures (no tables) | — | digitised by hand from figures, marked "digitised" with the figure number |

Raw files go to `data/raw/` (not committed if you prefer), a script (`scripts/mnt_build_data.py`) turns them into
`web/mnt/data/*.json` with a `meta` block of citations and file hashes. None of the tables carries an explicit licence;
the page will attribute every source in an "About the data" panel. If the page becomes public, a courtesy e-mail to the
IAEA mass data centre and the WS4 authors is advisable (EU database right; not legal advice).

## 6. Validation and calibration

- **Calibrated parameters (few, global, not per system):** friction strength K_r⁰ (with Prox 77), diffusion strength
  D_NN⁰ (with D_ZZ/D_NN fixed at 1/2), and the TKE cap / neck stiffness. Fitted on a *training* set:
  40Ca+208Pb capture above the barrier, 40Ar+208Pb and 58Ni+208Pb channel cross sections, 136Xe+208Pb (Barrett 2015,
  Kozulin 2012 TKEL). Frozen afterwards.
- **Held-out tests:** 136Xe+198Pt (two energies), 204Hg+208Pb, 238U+238U, 160Gd+186W, 64Ni+238U, 40Ca+124Sn.
- **Metric:** theory-evaluation factor tef = log₁₀(σ_model/σ_exp) per nuclide, reported as mean ± spread per system
  and as a function of ΔZ (the literature's own metric, e.g. Barrett 2015); plus TKEL range, grazing angle, mass-drift
  direction, σ_Z² ∝ TKEL (Huizenga et al.).
- **Fair comparison** (`02-measured-reactions.md` §2.9): apply the experimental angle windows, fold thick-target
  data over the energy loss in the target, compare primary vs secondary correctly, down-weight datasets normalised to
  GRAZING.
- **Target accuracy, stated up front:** factor 2–5 for channels within a few nucleons of the target, an order of
  magnitude further away — the level of published DNS and Langevin models. The page shows tef next to every data point.
- `scripts/mnt_validate.mjs` (Node) writes `docs/mnt/validation.md`, like `docs/validation.md` for the collider model.

## 7. Architecture

```
web/mnt/                     the page (shares web/src/scene/blackbody.js, styles, publish flow)
  src/physics/               potential.js, trajectory.js, transfer.js (master eq. + Gaussian mode),
                             evaporation.js, xsec.js, nuclides.js
  src/scene/, src/ui/        3D stage, cards (trajectory map, deflection, Wilczyński, chart, mass–TKE)
  data/nuclides.json         masses, deformations, barriers (from the raw tables)
  data/exfor/*.json          measured cross sections, one file per dataset, with bibliography
  test/                      unit tests (barriers vs Bass systematics, Rutherford limit, detailed balance,
                             particle-number conservation) + validation runner
scripts/mnt_build_data.py    raw tables + EXFOR → JSON
scripts/mnt_validate.mjs     calibration and validation report
docs/mnt/                    research, plan, validation, formulas (added to docs/formulas.tex as a new part)
```

One implementation (JavaScript) this time: the model is small, and Node runs the tests, the calibration and the
validation without a browser. Python only prepares the data.

## 8. Milestones

| # | Deliverable | Done when |
|---|---|---|
| T1 | Data: download (with your OK), parse, `nuclides.json`, EXFOR JSON for the curated systems, digitised figures | Q-values and S_n reproduce AME2020 exactly; each dataset carries its reference |
| T2 | Trajectory + potential + friction; deflection function, TKEL, contact time; neck/TKE-cap fix | Rutherford limit exact; Prox 77 barriers within 10 % of Bass systematics; 40Ca+208Pb captured; Xe+Pb TKEL reaches the measured 200–350 MeV |
| T3 | Nucleon exchange (master equation + Gaussian mode) + cross sections + evaporation | Detailed balance and number conservation tests; primary→secondary shifts as in Barrett 2015 |
| T4 | Calibration on the training set, validation on held-out systems, `validation.md` | tef statistics published per system, no per-system tuning |
| T5 | Page: 3D stage, trajectory map, deflection, Wilczyński, nuclide chart, mass–TKE, narrative, "?" | Every control responds in < 1 s; data overlays for the curated list |
| T6 | Polish, phone layout, publish (private link), formulas added to `formulas.tex` | Link shared |

## 9. Open points

- **238U+248Cm:** the only data (Schädel 1982) are in figures; digitising them is the best available, marked as such.
- **Unverified constants** in the research (Viola TKE constants, λ₀ of the level-density rate, two factors in the
  microscopic DNS formula): verify in the typeset papers during T2/T3 or avoid them (the recommended rates do not need λ₀).
- **Deformed actinides** (U, Cm): orientation matters at contact; first version averages tip and side orientations
  with the geometric weights, as DNS papers do.

## 10. Status (2026-09-26): built

`web/mnt/` implements T1–T6; formulas in `docs/formulas.tex` (part "Multi-nucleon transfer explorer"); validation in
`docs/mnt/validation.md`. Changes against the plan, all found while building and documented in the code:

- **Potential.** Proximity 77 is the default (it has the right pocket systematics: a pocket for Ca+Pb, none for Xe+Pb and
  U+Cm); its cubic is continued below ξ = −1 with a stiff wall. Bass 80 (no inner repulsion) gives the quoted barrier V_B.
- **Separation of heavy systems.** A neck coordinate relaxes toward the Viola scission elongation (τ = 4 zs, Li et al. 2006)
  and thins the nuclear attraction; trapped dinuclear systems fuse with probability 1 − g(x_m) (mean fissility, du Rietz 2013)
  or decay at the Kramers quasi-fission rate (Zhu, Feng & Zhang 2015). Xe+Pb reaches the fully damped TKEL of Viola
  systematics (198 of 205 MeV) without being captured; Ca+Pb is captured.
- **Transfer rates.** Bounded detailed-balance ("Glauber") rates 2D/(1 + e^{ΔU/T}) replace D e^{∓ΔU/2T} (same detailed
  balance and Einstein drift, no divergence at low T). Shell + pairing energies (FRDM2012 E_mic) are damped with temperature
  (τ/sinh τ). Before this, the doubly magic Xe/Pb valleys froze the distributions (σ_N ≈ 1).
- **De-excitation.** The shell part of the fission barrier is damped with E* (E_d = 18.5 MeV) over the liquid-drop barrier.
- **Deformed nuclei** (A ≥ 100, |β₂| ≥ 0.15): orientation average, 3-point Gauss–Legendre per nucleus (page: 3 correlated
  orientations for doubly deformed pairs). Gd+W improved from tef −4.8 to −2.1, Xe+Cm from −1.4 to +0.5.
- **Detector windows** for angle-integrated datasets (Watanabe 2015 24–34°, D8119 16–28°) via two-body kinematics.
- **Calibration** (three grid passes, 168 evaluations): K_r⁰ = 2×10⁻²³ s/MeV, D_NN = 0.06 (fm/c)⁻¹, s_C = 1.5 fm,
  a_C = 0.4 fm, T_min = 7 MeV. The fit prefers a weak driving force (objective flat for T_min = 5–10 MeV): fast transfer is
  far from equilibrium and governed by the Q-value window rather than by the temperature.
- **Result:** training 404 points, 85 % within ×10 (54 % within ×3); held-out 2625 points, 64 % within ×10 (37 % within ×3),
  mean tef −0.50. Best held-out: 136Xe+198Pt (419 points, 87 % within ×10), 238U+238U, 40Ca+124Sn, 206Pb+118Sn, 86Kr+124Sn.
  Documented failures: 204Hg+208Pb (measured below our barrier; the model has no sub-barrier transfer), 160Gd+186W mass
  yields (quasi-fission beyond the grid), 40Ar+238U (fission-dominated data), the single tentative 260No point of 48Ca+248Cm.
- **Speed:** 0.7–1.8 s per reaction in Node (2–4 s in a browser Web Worker); one partial wave with history ~50 ms.
- **Tests:** `node web/mnt/test/physics.test.mjs` (18 checks: AME masses, barriers, Rutherford limit, energy conservation,
  capture systematics, probability conservation and detailed balance of the master equation, evaporation).
