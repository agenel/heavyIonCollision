# heavyIonCollision

Scientifically grounded Blender animation of relativistic heavy-ion collisions (RHIC and LHC systems), with a parameter panel inside Blender. Every number the model uses traces to a published measurement or model; see `docs/physics/` and `docs/validation.md`.

## Layout

- `PLAN.md` — architecture, physics pipeline, parameter list, validation plan, milestones and status.
- `docs/physics/` — cited reference tables: `01-initial-state.md` (nuclei, Glauber, TRENTo), `02-spacetime-evolution.md` (timescales, Bjorken, EoS, freeze-out, simulation codes), `03-final-state-data.md` (multiplicities, yields, flow, spectators, HEPData), `04-simulation-formats.md` (verified output formats of SMASH, UrQMD, vHLLE, MUSIC, TRENTo).
- `docs/validation.md` — generated report comparing the model with the reference tables.
- `docs/formulas.tex` / `docs/formulas.pdf` — every formula the code evaluates, with source files and references; empirical and visual choices are marked.
- `hic_core/` — numpy-only physics package (works in Blender's bundled Python): `nuclei`, `glauber`, `kinematics`, `eos`, `fireball`, `freezeout`, `event`, `cache`, with the data tables in `hic_core/data/*.json` (each carries its source).
- `hic_viz/` — Blender 5.2 extension: N-panel GUI (`Heavy Ion` tab), background physics job, scene builder (point cloud + OpenVDB volume + HUD + camera).
- `scripts/` — `run_event.py` (event + cache, presets), `build_scene.py` (cache → .blend), `render.sh` / `render_setup.py` (frames + MP4), `import_event.py` (Level B), `validate.py`, `calibrate_trento_norm.py`, `dev_blender.sh`.
- `docs/level-b-workflow.md` — how to animate real SMASH / UrQMD / MUSIC / vHLLE / TRENTo output.
- `tests/` — pytest suite (Glauber tables, kinematics, EoS, samplers, full event).
- `web/mnt/` — **The Nucleon Exchange**, the multi-nucleon-transfer explorer (low energy, near the Coulomb barrier): orbit with friction, neck and quasi-fission, nucleon-exchange master equation, evaporation, 72 EXFOR datasets and the literature catalogue. Research, plan and validation: `docs/mnt/`.
- `web/` — **The Little Bang**, the interactive browser explorer (three.js): `src/physics/` is a JavaScript port of `hic_core` (Glauber, TRENTo, EoS, Level-A fireball, data lookup), `src/scene/` the 3D stage, `src/ui/` the cards and text, `data/web_data.json` the exported inputs, `test/physics.test.mjs` the cross-check against Python. Plan and design notes: `docs/interactive-plan.md`.

## Quick start

```bash
python3 -m venv .venv && .venv/bin/pip install numpy pytest
.venv/bin/python -m pytest -q tests
```

List the presets and render one end to end (event cache → scene → Cycles/Metal frames → MP4):

```bash
.venv/bin/python scripts/run_event.py --list-presets
```

```bash
scripts/render.sh PbPb_5020_midcentral --res 1920x1080 --samples 32
```

The render loop is resumable: rerunning the command skips frames that already exist. Output goes to `renders/<PRESET>/`.

Compare one collision at several impact parameters side by side (nucleons + fireball only, no hadrons; same nuclei in every panel, same spatial scale):

```bash
.venv/bin/python scripts/compare_b.py --b 0 7 12
```

Output: `renders/compare_b/compare_b.mp4` (three portrait panels, 1920×1080). Add `--preview 4` to render only four frames per panel first.

Run a single event without rendering (prints Glauber, fireball, hadron and flow numbers and writes a cache):

```bash
.venv/bin/python scripts/run_event.py --preset UU_193_bodybody --full cache/uu_body --frames 60 540
```

Build a scene from any cache and render preview frames (headless):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --python scripts/build_scene.py -- cache/uu_body renders/uu_body.blend --preview 4 --engine CYCLES --res 960x540
```

Interactive use: open Blender with the panel loaded from the repo, then N-sidebar → "Heavy Ion" → pick a preset → Load → Compute event.

```bash
scripts/dev_blender.sh
```

Real simulation output (SMASH, UrQMD, MUSIC, vHLLE, TRENTo) is imported with `scripts/import_event.py`; see `docs/level-b-workflow.md`.

Interactive explorer in the browser (change b, the system, a custom mass number, the number of particles drawn, and scrub through time):

```bash
python3 -m http.server 8765 --directory web
```

then open http://localhost:8765 (The Little Bang) or http://localhost:8765/mnt/ (The Nucleon Exchange). After changing `hic_core` data or physics, regenerate the web inputs (flow calibration runs the full Python event loop, ~12 min on 10 cores) and rerun the cross-check:

```bash
.venv/bin/python scripts/export_web.py
node web/test/physics.test.mjs
```

## Model in one paragraph

Monte Carlo Glauber (Woods-Saxon nuclei with deformation and neutron skin, black-disk or Gaussian NN profile, LKD18 centrality tables) → TRENTo-style entropy deposition at τ₀ → boost-invariant, entropy-conserving transverse expansion with a prescribed radial flow whose strength is anchored to the measured blast-wave ⟨β_T⟩ and whose azimuthal modulation is calibrated to the measured v₂/v₃/v₄ → temperature from the HotQCD lattice EoS → hadrons formed at T_c = 156.5 MeV, carried by the flow for the measured hadronic-phase duration, then emitted with Cooper-Frye/blast-wave momenta (measured T_kin, species yields) → free streaming; spectators continue at beam rapidity with Fermi-motion smearing. Limitations and the Level-B (real hydro output) path are in `PLAN.md`.

### Multi-nucleon transfer explorer (web/mnt)

```bash
scripts/mnt_fetch.sh                     # download masses (IAEA RIPL-4), radii, fission barriers and EXFOR entries into data/raw/mnt
python3 scripts/mnt_build_data.py        # build web/mnt/data/{nuclides,exfor,catalogue}.json
node web/mnt/test/physics.test.mjs       # unit tests
scripts/mnt_calibrate.sh 9               # parallel grid-search calibration + validation -> docs/mnt/validation.md
node scripts/mnt_validate.mjs            # validation only, with web/mnt/data/calibration.json
```
