"""Level-B importers: read the output of real heavy-ion simulation codes (formats verified against the codes'
source, see docs/physics/04-simulation-formats.md) and convert it to the cache format the Blender scene reads.

- oscar:  SMASH OSCAR2013 / OSCAR2013Extended / ASCII (text) and SMASH binary v10; UrQMD OSC1997A / OSC1999A
- grids:  TRENTo event grids, vHLLE legacy-VTK snapshots, MUSIC evolution_all_xyeta.dat / evolution_for_movie_xyeta.dat
- pdg:    PDG code -> species index used by the scene
- convert: particle blocks and/or hydro grids -> cache directory (particles.npz, frames.npy, volume/, meta.json)
"""
from . import pdg, oscar, grids, convert  # noqa: F401
