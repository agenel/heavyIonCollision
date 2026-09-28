#!/usr/bin/env python3
"""Import the output of a real simulation code into an animation cache (Level B), then build the scene as usual.

Particles (any of):  --particles FILE     SMASH OSCAR2013 / Extended / ASCII, SMASH binary v10, UrQMD OSC1997A / OSC1999A
Fields (any of):     --music FILE         MUSIC evolution_all_xyeta.dat / evolution_for_movie_xyeta.dat (binary)
                     --vhlle-vtk DIR --tau0 T --dtau D   vHLLE T_taustep*.vtk snapshots (tau is not in the files)
Approach phase:      --approach A B SQRT_SNN [--b B]   Glauber nuclei for t < 0 and spectators (the codes start after the collision)

Example (hydro + afterburner chain, 30-40% Pb-Pb):
  python scripts/import_event.py --music evolution_all_xyeta.dat --particles particle_lists.oscar --event 0 \\
         --approach Pb Pb 5020 --b 9.2 --out cache/imported_pbpb
  blender -b --python scripts/build_scene.py -- cache/imported_pbpb renders/imported.blend --preview 4
Formats: docs/physics/04-simulation-formats.md
"""
import argparse, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from hic_core.importers import oscar, grids, convert

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--particles"); ap.add_argument("--event", type=int, default=None, help="event number to import (default: first)")
ap.add_argument("--music"); ap.add_argument("--vhlle-vtk"); ap.add_argument("--tau0", type=float); ap.add_argument("--dtau", type=float)
ap.add_argument("--eta-window", type=float, default=2.0, help="2+1D hydro: |eta_s| range to fill (boost invariance)")
ap.add_argument("--approach", nargs=3, metavar=("A", "B", "SQRT_SNN")); ap.add_argument("--b", type=float)
ap.add_argument("--seed", type=int, default=1)
ap.add_argument("--frames", type=int, nargs=2, default=[60, 540], metavar=("PRE", "POST")); ap.add_argument("--t-end", type=float)
ap.add_argument("--label"); ap.add_argument("--out", required=True)
a = ap.parse_args()
if not (a.particles or a.music or a.vhlle_vtk):
    ap.error("give at least one of --particles, --music, --vhlle-vtk")
t0 = time.time(); sources = []
blocks = None; impact = a.b
if a.particles:
    blocks, infos = oscar.read_particles(a.particles)
    evs = sorted({b.event for b in blocks})
    if not evs:
        sys.exit("no particle blocks found")
    ev = a.event if a.event is not None else evs[0]
    blocks = [b for b in blocks if b.event == ev]
    info = next((i for (e, _), i in infos.items() if e == ev), None)
    if impact is None and info is not None and info.impact is not None:
        impact = info.impact
    print(f"particles: {a.particles}: event {ev}, {len(blocks)} blocks, t = {min(b.t for b in blocks):.2f} .. {max(b.t for b in blocks):.2f} fm/c, "
          f"impact parameter {impact}")
    sources.append(os.path.basename(a.particles))
grid = None
if a.music:
    grid = grids.read_music_evolution(a.music); sources.append(os.path.basename(a.music))
elif a.vhlle_vtk:
    grid = grids.read_vhlle_vtk_series(a.vhlle_vtk, "T", a.tau0, a.dtau); sources.append("vHLLE VTK")
if grid is not None:
    grid.eta_window = a.eta_window
    print(f"fields: {grid.source}: {len(grid.taus)} snapshots tau = {grid.taus[0]:.2f} .. {grid.taus[-1]:.2f} fm/c, "
          f"grid {grid.T.shape[1]}x{grid.T.shape[2]}x{grid.T.shape[3]}, T_max = {grid.T.max():.0f} MeV")
approach = None
if a.approach:
    approach = dict(A=a.approach[0], B=a.approach[1], sqrt_snn=float(a.approach[2]), b=impact if impact is not None else 0.0, seed=a.seed)
meta = convert.build_cache(a.out, blocks=blocks, grid=grid, approach=approach, n_pre=a.frames[0], n_post=a.frames[1],
                           t_end=a.t_end, label=a.label, sqrt_snn=float(a.approach[2]) if a.approach else None, impact=impact,
                           source=" + ".join(sources), progress=lambda m: print("   ", m))
print(f"cache written to {a.out}: {len(meta['hud'])} frames, {meta['n_hadrons']} hadrons, {meta['n_nucleons']} nucleons "
      f"in {time.time() - t0:.1f}s")
