#!/usr/bin/env python3
"""Run one Glauber event and print the initial-state summary.
Example: python scripts/run_event.py --system Pb Pb --energy 5020 --centrality 30 40 --seed 1
"""
import argparse, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import numpy as np
from hic_core import glauber, kinematics, nuclei

p = argparse.ArgumentParser()
p.add_argument("--system", nargs=2, default=["Pb", "Pb"])
p.add_argument("--energy", type=float, default=5020.0, help="sqrt(s_NN) in GeV")
p.add_argument("--centrality", nargs=2, type=float, default=None)
p.add_argument("--b", type=float, default=None)
p.add_argument("--seed", type=int, default=0)
p.add_argument("--profile", choices=["disk", "gauss"], default="disk")
p.add_argument("--full", metavar="OUT_DIR", help="run the full fireball + hadron pipeline and write a cache directory")
p.add_argument("--mult-scale", type=float, default=1.0)
p.add_argument("--frames", type=int, nargs=2, default=[60, 540], metavar=("PRE", "POST"))
p.add_argument("--no-volume", action="store_true")
p.add_argument("--preset", help="use a preset from hic_core/data/presets.json (other flags given explicitly override it)")
p.add_argument("--list-presets", action="store_true")
p.add_argument("--trento", metavar="FILE", help="TRENTo event file (text) as the initial entropy profile; its b is used")
a = p.parse_args()
if a.list_presets:
    from hic_core import presets as _pr
    for k, v in _pr.load().items():
        print(f"{k:22s} {v['label']:32s} {v['description']}")
    raise SystemExit
if a.preset:
    from hic_core import presets as _pr
    _pp = _pr.event_params(a.preset)
    a.system = [_pp.A, _pp.B] if a.system == ["Pb", "Pb"] else a.system
    a.energy = _pp.sqrt_snn if a.energy == 5020.0 else a.energy
    a.centrality = list(_pp.centrality) if a.centrality is None else a.centrality
    a.b = _pp.b if a.b is None else a.b
    _orientation = _pp.orientation
else:
    _orientation = "random"

rng = np.random.default_rng(a.seed)
c = tuple(a.centrality) if a.centrality else None
ev = glauber.run_event(a.system[0], a.system[1], a.energy, b=a.b, centrality=None if a.b is not None else c, rng=rng,
                       profile=a.profile, orientation=_orientation)
RA = nuclei.params(a.system[0]).get("R", 1.0)
print(f"{ev.A}+{ev.B} at sqrt(s_NN) = {a.energy:g} GeV   sigma_NN = {ev.sigma_nn_mb:.1f} mb   seed {a.seed}")
print(f"  gamma = {ev.meta['gamma']:.1f}   y_beam = {ev.meta['y_beam']:.2f}   2R/gamma = {kinematics.contracted_thickness(RA, a.energy):.4f} fm   crossing = {kinematics.crossing_time(RA, a.energy):.4f} fm/c")
print(f"  b = {ev.b:.2f} fm   N_part = {ev.npart}   N_coll = {ev.ncoll}   N_spec = {ev.n_spectators}   S = {ev.area_fm2:.1f} fm^2")
print(f"  eps2 = {ev.eps[2]:.3f}  eps3 = {ev.eps[3]:.3f}  eps4 = {ev.eps[4]:.3f}   Psi2 = {ev.psi[2]:.2f} rad")
row = glauber.table_row(a.system[0], a.system[1], a.energy, *(c or (None, None))) if c else None
if row:
    print(f"  LKD18 table for this class: <N_part> = {row['Npart']}, <N_coll> = {row['Ncoll']}, eps2 = {row['eps2']}, eps3 = {row['eps3']}")

if a.full:
    import json, time
    from hic_core.event import Event, EventParams
    from hic_core.cache import write_cache
    t0 = time.time()
    ep = EventParams(A=a.system[0], B=a.system[1], sqrt_snn=a.energy, centrality=tuple(int(x) for x in (c or (0, 100))), b=a.b,
                     seed=a.seed, profile=a.profile, mult_scale=a.mult_scale, n_pre_frames=a.frames[0], n_post_frames=a.frames[1],
                     orientation=_orientation, trento_file=a.trento)
    e = Event(ep).run()
    if a.preset:
        e.info["look"] = _pr.look(a.preset); e.info["preset"] = a.preset
    i = e.info
    print(f"  fireball: T0 = {i['T0_MeV']:.0f} MeV, T(1 fm/c) = {i['T_at_1fm_MeV']:.0f} MeV, QGP until tau = {i['tau_QGP_end']:.1f} fm/c, "
          f"median freeze-out tau = {i['tau_f_median']:.1f} fm/c, T_kin = {i['T_kin']:.0f} MeV, <beta_T> = {i['beta_T']:.3f}")
    print(f"  hadrons: {i['N_hadrons_generated']} generated (full event {i['N_hadrons_full']:.0f}); dN_ch/deta target {i['dNch_deta_target']:.0f}, generated {i['dNch_deta_generated']:.0f}")
    print(f"  <pT> pi/K/p = {i['mean_pt_mid']['pi']:.3f}/{i['mean_pt_mid']['K']:.3f}/{i['mean_pt_mid']['p']:.3f} GeV/c;  v2/v3/v4 target = "
          f"{i['vn_target'][2]:.3f}/{i['vn_target'][3]:.3f}/{i['vn_target'][4]:.3f}, calibrated = {i['vn_calibrated'][2]:.3f}/{i['vn_calibrated'][3]:.3f}/{i['vn_calibrated'][4]:.3f} (this event's sample: {i['vn_generated'][2]:.3f}/{i['vn_generated'][3]:.3f}/{i['vn_generated'][4]:.3f})")
    meta = write_cache(e, a.full, write_volume=not a.no_volume, progress=lambda m: print("   ", m))
    print(f"  cache written to {a.full} ({len(e.times)} frames, {e.n_particles()} particles) in {time.time()-t0:.1f}s")
