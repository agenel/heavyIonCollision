# Level B: animating real simulation output

The built-in model (Level A) is a data-calibrated parametrisation. For frames that are the output of first-principles
codes, run the codes yourself and import their output. Formats and every option below were verified against the
codes' source (see `docs/physics/04-simulation-formats.md`, 2026-09-23).

## What each code contributes

| Stage | Code (licence) | Output to request | Importer |
|---|---|---|---|
| Initial entropy profile | TRENTo (MIT) | text grid per event: `trento Pb Pb 1 -o DIR` (keep the header) | `run_event.py --trento DIR/0.dat` (drives the Level-A fireball) |
| Hydrodynamics | MUSIC (GPL-2.0) | `output_evolution_data 2` → `evolution_all_xyeta.dat` (binary, cells with e ≥ `output_evolution_e_cut`), or `output_movie_flag 1` → `evolution_for_movie_xyeta.dat` | `import_event.py --music FILE` |
| Hydrodynamics | vHLLE (GPL-2.0) | `VTK_output_values T` → `T_taustep%05d.vtk` per time step; note τ0 and dtau from the parameter file (not stored in the files) | `import_event.py --vhlle-vtk DIR --tau0 T0 --dtau DT` |
| Hadronic afterburner / full transport | SMASH (GPL-3.0) | in the `Output:` section: `Output_Interval: 0.5` (fm/c) and `Particles: {Format: [Oscar2013], Only_Final: No}` (or `Binary`) | `import_event.py --particles particle_lists.oscar` |
| Hadronic transport | UrQMD (UrQMD licence) | file19 (OSC1997A; `CTOption(55)=1` for one block per time step) or file20 (OSC1999A) | `import_event.py --particles FILE` |

Pick a particle output interval of 0.5-1 fm/c: between two outputs the importer moves particles on straight lines
(exact once they stop scattering). With `Only_Final: Yes` you only get the final state and nothing before it.

## Typical chain

```bash
# 1. hydro (MUSIC, 2+1D or 3+1D) and afterburner (SMASH in list modus) run outside this project
# 2. import both, add the incoming nuclei from the Glauber model with the same impact parameter
python scripts/import_event.py --music evolution_all_xyeta.dat --particles particle_lists.oscar --event 0 \
       --approach Pb Pb 5020 --b 9.2 --frames 60 540 --out cache/music_smash_event0
# 3. scene and render exactly as for Level A
blender -b --python scripts/build_scene.py -- cache/music_smash_event0 renders/music_smash.blend --preview 4
```

## What the importer does and does not claim

- Fields are mapped to the lab frame with τ = √(t² − z²), η_s = atanh(z/t); 2+1D (boost-invariant) grids fill
  |η_s| < `--eta-window` (default 2). Temperatures from the codes are shown with the same colour key as Level A.
- The incoming nuclei and spectators added by `--approach` are a Glauber sample with the same b, not the nucleons of
  the imported event (the HUD says so). Hydro codes do not record them.
- UrQMD final lists give each hadron's own freeze-out point: hadrons appear there and stream outwards.
- Round trips are tested (`tests/test_importers.py`): a Level-A event exported as OSCAR2013 and as MUSIC binary
  (`hic_core/exporters.py`) re-imports to the same particle positions and temperatures.
