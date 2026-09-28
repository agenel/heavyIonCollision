# Heavy-Ion Collision Animation in Blender — Project Plan

Goal: a physically faithful, parameter-driven 3D animation of relativistic heavy-ion collisions (RHIC and LHC systems), rendered in Blender 5.2 with a GUI panel for every physics and visual parameter. Every number the animation uses traces to a published measurement or a peer-reviewed model; the sources are collected in `docs/physics/`.

## 1. Accuracy contract

"Scientifically accurate" is defined here as:

1. **Geometry** is a Monte Carlo Glauber model with the published Woods-Saxon parameters, nucleon-nucleon cross sections, d_min and centrality-to-b tables (`docs/physics/01-initial-state.md`).
2. **Time evolution** follows the standard model of heavy-ion collisions with measured or lattice-QCD-constrained timescales, temperatures and flow velocities: pre-equilibrium (~0.4 fm/c), viscous-hydro-like QGP expansion (5-10 fm/c), crossover at T_c = 156.5 MeV (HotQCD), chemical freeze-out at T_ch = 156.5 MeV, kinetic freeze-out at T_kin ≈ 90-100 MeV with ⟨β_T⟩ ≈ 0.65 (LHC) / 0.59 (RHIC), decoupling at 10-11 fm/c (LHC, HBT) (`docs/physics/02-spacetime-evolution.md`).
3. **Final state** reproduces measured multiplicities, particle composition, ⟨p_T⟩, p_T spectra (blast-wave parameters), dN/dη shape, v_2/v_3/v_4 vs centrality, and spectator kinematics (`docs/physics/03-final-state-data.md`).
4. **Colour and scale** are physical: fireball colour comes from the local temperature through the HotQCD equation of state; 1 Blender unit = 1 fm; on-screen time is in fm/c.
5. **Honest visualization**: everything that must be exaggerated to be visible (Lorentz-contracted pancake thickness of 0.005 fm at the LHC, particle sphere radius, time warp between the approach and the expansion phases) is a named parameter with a physical default, and the HUD states when a visual exaggeration is active.

Two fidelity levels are planned:

- **Level A — built-in model (default).** Glauber MC + TRENTo-style entropy deposition + an analytic 3+1D fireball evolution (Bjorken longitudinal expansion, blast-wave radial expansion with the measured β_T(r) profile, eccentricity-driven anisotropic flow tuned to the measured v_n) + Cooper-Frye-like hadron emission from the T_kin hypersurface with measured yields and blast-wave momentum spectra. This is a data-calibrated parametrization, not a hydrodynamic simulation. It runs in seconds in numpy and reproduces the measured observables it is tuned to.
- **Level B — external simulation data.** Importers for real event-by-event simulation output: TRENTo grids, MUSIC/vHLLE evolution snapshots (T, ε, u^μ per cell), and SMASH/UrQMD OSCAR2013 particle lists at fixed time steps (JETSCAPE HepMC3 as a stretch goal). With these, every frame is the output of a first-principles code and the animation layer only visualizes.

## 2. Physics pipeline (what happens at each frame)

| Phase | Physical time | Model (Level A) | Visual elements |
|---|---|---|---|
| 0. Approach | t < 0 (visual only; real crossing time 0.005-3 fm/c depending on √s_NN) | Nucleons sampled from Woods-Saxon (deformed where applicable), d_min = 0.4 fm, both nuclei contracted by 1/γ along z, impact parameter b from centrality table | Two nucleus point clouds (protons/neutrons coloured), pancake thickness floor parameter, beam axis, impact-parameter indicator |
| 1. Overlap, t = 0 | 0 | Participants flagged with D = √(σ_NN/π) black-disk criterion; spectators keep beam rapidity | Participants light up; N_part, N_coll, ε_2, ε_3 shown in HUD |
| 2. Pre-equilibrium | 0 < τ < τ_0 (0.4 fm/c default; range 0.2-1.2) | Entropy density from TRENTo reduced thickness (p = 0, w = 0.96 fm, k from σ_fluct = 0.9) on a transverse grid; longitudinal profile boost-invariant plateau with Gaussian fall-off toward ±y_beam | Glasma flash: emissive volume rises from the participant zone |
| 3. QGP expansion | τ_0 < τ < τ_c (≈5 fm/c RHIC, ≈10 fm/c LHC) | T(x,τ): ideal-Bjorken cooling T ∝ τ^(-1/3) corrected by transverse expansion, radial velocity profile β_T(r,τ) growing to the blast-wave ⟨β_T⟩ at freeze-out; ε→T via HotQCD EoS table; anisotropic modulation of the radius R(φ) with amplitudes set so the emitted v_n match measurement | OpenVDB temperature+density sequence rendered with blackbody emission; colour legend in MeV; T_max in HUD; optional isotherm shells (T_c, T_kin) |
| 4. Hadronization / chemical freeze-out | local T = 156.5 MeV | Species mix from statistical hadronization yields (π, K, p, Λ, Ξ, Ω, φ, d …) per centrality | Volume fades where T < T_c; hadrons appear on the T_c surface |
| 5. Hadronic phase | T_c → T_kin (4-7 fm/c at LHC, up to 10-20 fm/c in cascades) | Particles move with local flow; resonance decays (K*, ρ) optional | Hadron point cloud inside a dim hadron-gas volume |
| 6. Kinetic freeze-out & free streaming | τ ≈ 10-11 fm/c (LHC) to end of animation (~30 fm/c) | Momenta sampled from blast-wave (T_kin, β_s, n per centrality), boosted by local flow and v_z = z/t; N per species from measured dN/dy scaled by the dN/dη shape; trajectories straight lines | Hadrons stream outward with species colours/sizes; optional trails; spectators leave along ±z with Fermi-motion spread; photons optional |
| 7. Optional hard probes | any | Dijet toggle with quenched away-side (R_AA from data), J/ψ marker | Two collimated sprays |

Longitudinal structure uses Milne coordinates (τ, η_s); each transverse slice at η_s is boosted with v_z = tanh(η_s), so the fireball is a stretching cylinder rather than a sphere, as in real collisions.

## 3. Software architecture

```
heavyIonCollision/
├── PLAN.md                      this file
├── README.md
├── docs/physics/                cited reference tables (01 initial state, 02 evolution, 03 final state)
├── hic_core/                    pure-numpy physics package (runs in system Python 3.14 and Blender's 3.13)
│   ├── nuclei.py                Woods-Saxon / deformed / Hulthén / He-3 samplers, parameter tables
│   ├── glauber.py               impact parameter, participants, N_part/N_coll, ε_n, centrality tables
│   ├── kinematics.py            γ, y_beam, Lorentz contraction, Milne coordinates
│   ├── initial_state.py         TRENTo reduced thickness on a grid
│   ├── eos.py                   HotQCD ε(T), T(ε) tables and interpolation
│   ├── fireball.py              analytic T(x,y,η_s,τ), flow field, freeze-out surfaces
│   ├── freezeout.py             blast-wave sampling, species yields, spectators, decays
│   ├── data/                    experiment tables (multiplicity, yields, v_n, blast-wave params, σ_NN) as CSV/JSON with source in each file
│   ├── importers/               Level B: OSCAR2013, MUSIC/vHLLE snapshots, TRENTo, HepMC3
│   ├── event.py                 Event = parameters → run all stages → EventCache
│   └── cache.py                 write .npz (particles) + .vdb (fields) + meta.json
├── hic_viz/                     Blender extension (blender_manifest.toml, __init__.py, ui.py, ops.py, scene.py, materials.py, handlers.py)
├── scripts/                     CLI: run_event.py, build_scene.py, render.sh, validate.py
├── tests/                       pytest for hic_core (Glauber tables, EoS, kinematics, yields)
└── renders/
```

Data flow: GUI parameters → `hic_core.event.run()` → cache on disk → `hic_viz` builds/streams the scene → EEVEE preview in the viewport → Cycles/Metal final render from the CLI.

Blender-specific implementation details (point cloud streaming, VDB writing, extension skeleton, render flags) are in the `blender` skill at `~/.claude/skills/blender/` and its reference `references/blender-5.2-api.md`, all verified on this machine.

## 4. Customizable parameters (GUI panel)

Collision setup
- Projectile / target nucleus: Pb-208, Au-197, Xe-129, Cu-63, U-238, Ru-96, Zr-96, O-16, Ne-20, p, d, He-3 (with Woods-Saxon R, a, w, β2, β4 editable and reset-to-published)
- √s_NN: presets 7.7, 19.6, 39, 62.4, 130, 200 GeV, 2.76, 5.02, 5.36, 5.44, 5.5 TeV, or free value (σ_NN from the fit formula)
- Centrality class (0-5% … 80-90%) or explicit impact parameter b, plus random seed
- Glauber: σ_NN override, d_min, black-disk vs Gaussian profile (ω), nucleus orientation (random / tip-tip / body-body / body-body along b)
- Preset dropdown with Load (19 systems, `hic_core/data/presets.json`)

Initial state and QGP
- TRENTo p, nucleon width w, fluctuation k, normalization; optional TRENTo event file as the initial profile
- τ_0 (hydrodynamization), η/s (affects the anisotropy response scale), T_c, T_ch, T_kin, ⟨β_T⟩ / β_s and n (blast-wave), fireball lifetime override
- Longitudinal profile: plateau half-width and fall-off (defaults from the dN/dη fits)

Final state
- Species to include, total multiplicity scale (1.0 = measured, lower for render budget), neutral particles on/off, photons on/off, resonance decays on/off
- Flow amplitudes v_2/v_3/v_4 (default: measured table; editable), event-plane angle
- Spectators on/off, Fermi-motion spread, fragment clustering on/off
- Hard-probe toggles (dijet with quenching, J/ψ)

Visualization
- Frames, fps, physical time range, time-warp curve (approach vs expansion), slow-motion factor
- Pancake thickness floor (fm), particle radius per species, trail length, volume density/emission gain, colour mode (blackbody from EoS / scientific colormap), isotherm shells, HUD contents (t, T_max, N_part, N_coll, b, ε_2, N_ch), legend
- Camera presets (side, along the beam, isometric) and moves (static, follow, orbit), resolution, engine (EEVEE preview / Cycles Metal), samples, output path

Level B
- Import OSCAR2013 / MUSIC / vHLLE / TRENTo files, time-step mapping, unit checks

## 5. Validation plan (`scripts/validate.py`)

For each preset system, run 200 Level-A events and compare against the tables in `docs/physics/`:

| Observable | Tolerance | Reference |
|---|---|---|
| ⟨N_part⟩, ⟨N_coll⟩ per centrality | within quoted Glauber uncertainty | LKD18 Tables X/XX |
| ε_2, ε_3 per centrality | ±15% | LKD18 |
| Crossing time, γ, y_beam | exact | kinematics |
| T(τ) at τ_0, τ_c ; τ_c; decoupling time | within stated ranges | Heinz-Snellings, HBT |
| dN_ch/dη at midrapidity and total N_ch | ±10% | ALICE/PHOBOS tables |
| K/π, p/π, ⟨p_T⟩ per species | ±10% | ALICE 1303.0737, STAR 0808.2041 |
| v_2{2}, v_3{2} vs centrality | ±0.01 absolute | ALICE 1602.01119, STAR |
| N_spec vs centrality | exact from Glauber | ALICE 1301.4361 |

The validation output is a Markdown report with the measured value, the generated value and the source, so the accuracy claim is auditable.

## 6. Milestones

1. **M1 – Physics core (Glauber + kinematics + EoS)**: `hic_core.nuclei/glauber/kinematics/eos` with tests reproducing the LKD18 centrality tables. Deliverable: `scripts/run_event.py --system PbPb --energy 5020 --centrality 30-40` prints N_part, N_coll, ε_n, γ, crossing time.
2. **M2 – Fireball + freeze-out (Level A)**: analytic evolution, VDB temperature sequence, blast-wave hadron sampling with measured yields/flow; validation report passes tolerances.
3. **M3 – Blender scene builder**: nuclei, participants, fireball volume, hadron point cloud, spectators, HUD, camera presets, time warp; first full 10-second EEVEE preview of Pb-Pb 5.02 TeV 30-40%.
4. **M4 – GUI extension**: `hic_viz` panel exposing all Section 4 parameters, modal operator running the physics in chunks, cache management, "Reset to published values" buttons with source tooltips.
5. **M5 – Final rendering & presets**: Cycles/Metal render pipeline, camera moves, legend and captions, presets for Au-Au 200 GeV, Pb-Pb 5.02 TeV, Xe-Xe, O-O, U-U tip-tip/body-body, p-Pb.
6. **M6 – Level B importers**: OSCAR2013 (SMASH/UrQMD) and MUSIC/vHLLE snapshots, with a documented workflow to run those codes (Docker) and drop their output into the animation.

## 7. Known limitations and risks

- Level A is a calibrated parametrization; event-by-event fluctuations, viscosity effects and non-linear flow response are only mimicked. Level B removes this caveat.
- The 5.02 TeV Bjorken energy density and the full v_2-vs-centrality table for Au-Au 200 GeV were not extracted from primary sources yet (flagged in docs); they are needed for M2 validation.
- hepdata.net blocks automated downloads (Cloudflare); use the Rivet reference YODA files or download tables manually once and commit them under `hic_core/data/` with their INSPIRE ids.
- Rendering 30k particles plus a volume with Cycles on an 8-core M4 GPU takes ~1-2 s per 320x240 frame; expect 30-90 s per 1080p frame with volumetrics and denoising. EEVEE is the preview engine.
- Blender's bundled Python has no scipy; the physics package must stay numpy-only (Bessel functions I_0, K_1 for the blast wave are implemented with series/asymptotic forms and tested against known values).

## 8. Status (2026-09-23)

All six milestones are implemented; 41 tests pass (`tests/`), and `docs/validation.md` is regenerated by `scripts/validate.py`.

- **M1** physics core: Glauber MC reproduces the LKD18 centrality tables (N_part, N_coll within a few %, ε₂/ε₃ with the rⁿ-weighting convention); named orientations for deformed nuclei (random, tip-tip, body-body); kinematics, HotQCD EoS, numpy-only special functions.
- **M2** Level-A fireball and freeze-out: entropy-conserving expansion with flow calibrated to the measured pion ⟨p_T⟩ and v₂/v₃/v₄, hadrons at T_c carried for the measured hadronic-phase duration, Cooper-Frye/blast-wave emission with measured yields. Systems without their own tables get dN_ch/dη from the TRENTo entropy integral (normalisation calibrated on Pb-Pb/Au-Au, `hic_core/data/trento_norm.json`) and freeze-out/flow response from the reference at equal multiplicity; the HUD warns where the model is stretched (slow crossing, baryon-rich matter, small systems).
- **M3** scene builder: Lorentz-contracted nucleon instances, hadron point cloud, OpenVDB temperature/energy volume, HUD, temperature colour key and species key placed just in front of the lens, camera rig with static / follow / orbit moves framed separately along and across the beam.
- **M4** GUI extension `hic_viz`: preset dropdown + Load, all physics/time/look parameters, TRENTo file input, background compute thread, look-only updates, render button.
- **M5** 19 presets (`hic_core/data/presets.json`: Pb-Pb 2.76/5.02 central to peripheral, Xe-Xe, O-O, Ne-Ne, Au-Au 19.6/62.4/200, U-U tip-tip and body-body, Ru-Ru, Zr-Zr, Cu-Au, p-Pb, d-Au, ³He-Au); `scripts/render.sh PRESET` runs cache → scene → Cycles/Metal frames (resumable frame loop) → MP4.
- **M6** Level-B importers (`hic_core/importers/`, `scripts/import_event.py`): SMASH OSCAR2013/Extended/ASCII (versions 1.8-3.4) and binary v10, UrQMD OSC1997A/1999A, MUSIC binary evolution, vHLLE VTK series (including the grid-resize quirk), TRENTo grids; exporters for round-trip tests. Workflow: `docs/level-b-workflow.md`. Docker recipes for running the codes were not written.

Accuracy (see `docs/validation.md`):
- Glauber N_part, N_coll, ε₂, ε₃ within 1-7% of the LKD18 tables; midrapidity dN_ch/dη within 5% for every tabulated system.
- Pion ⟨p_T⟩ calibrated (±3%); kaon and proton ⟨p_T⟩ within ~10-25%.
- v₂, v₃ within ~5-10% for 0-50% centrality; 60-70% falls ~25% short in v₂.
- Predictions for systems that are not inputs (U-U, Cu-Au multiplicity; U-U v₂; isobar and small-system N_part) are listed against their measurements in the report.

Open:
- Peripheral classes (≥ 60-70%) and small systems are the least accurate parts of Level A: Pb-Pb 60-70% v₂ is 22% low; p-Pb pion ⟨p_T⟩ 15% low; d-Au v₂ is not reproduced (0.02 vs a target of 0.11, which is itself an extrapolated flow response). In the Level-A flow field a very elongated, few-hundred-hadron source produces a large negative geometric v₂ that the bounded anisotropy calibration only partly overcomes; a pressure-gradient-directed flow field (v ∥ −∇s) would be the physics fix. U-U v₂ with random orientations is 0.033 vs 0.027 measured (STAR).
- Blender 5.2 does not pick up handler-driven point-cloud changes in `blender -a` renders of a reloaded file; rendering therefore uses a frame_set + still-render loop (`scripts/render_setup.py`).

## 9. Interactive explorer (2026-09-26)

`web/` — "The Little Bang", a three.js page in the style of sael.net/plane-of-focus, driven by a JavaScript port of the
Level-A model that is cross-checked against `hic_core` (`node web/test/physics.test.mjs`, 279 checks). Plan, design and
status: `docs/interactive-plan.md`. Inputs are exported by `scripts/export_web.py` from `hic_core/data` plus the Python
flow calibration; no new numbers enter.

## 10. Multi-nucleon transfer explorer (2026-09-26)

`web/mnt/` — "The Nucleon Exchange": low-energy heavy-ion collisions near the Coulomb barrier (orbit with surface friction,
neck, capture and Kramers quasi-fission, nucleon-exchange master equation on AME2020/FRDM2012 masses, neutron evaporation with
fission competition), calibrated once on four EXFOR datasets and validated on 2625 held-out measured cross sections from ~30
systems. Research (models, 105 measured reactions, nuclear inputs), plan and status: `docs/mnt/`.
