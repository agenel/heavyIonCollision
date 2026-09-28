"""Export Level-A events in the formats of real codes (for round-trip tests and for use in other tools).

- write_oscar2013: SMASH >= 3.2 OSCAR2013 particle_lists with `out` blocks at the given times (hadrons that exist at
  that time: in the hadron gas or free streaming). Momenta are the kinetic freeze-out momenta at every time.
- fireball_grid: the Level-A temperature field T(tau, x, y, eta_s) as a HydroGrid (3+1D, eta_s from -eta_max..eta_max).
"""
import numpy as np
from .event import FREE, HADRON_GAS
from .fireball import T_of_s
from .importers.pdg import species_to_pdg
from .importers.grids import HydroGrid


def write_oscar2013(event, path, times):
    inv = species_to_pdg()
    Nn = len(event.nuc_pos0)
    pdg = np.array([inv[int(s)] for s in event.species]); mass = event.mass; charge = event.charge
    with open(path, "w") as f:
        f.write("#!OSCAR2013 particle_lists t x y z mass p0 px py pz pdg ID charge\n")
        f.write("# Units: fm fm fm fm GeV GeV GeV GeV GeV none none e\n")
        f.write("# hic_core-0.1 Level-A export\n")
        for t in times:
            pos, st = event.frame_particles(float(t))
            sel = np.where(np.isin(st[Nn:], (FREE, HADRON_GAS)))[0]
            f.write(f"# event 0 ensemble 0 out {len(sel)}\n")
            for i in sel:
                x, y, z = pos[Nn + i]; E, px, py, pz = event.p4[i]
                f.write(f"{t:g} {x:g} {y:g} {z:g} {mass[i]:g} {E:.9g} {px:.9g} {py:.9g} {pz:.9g} {pdg[i]} {i} {charge[i]}\n")
        f.write(f"# event 0 ensemble 0 end 0 impact {event.glauber.b:7.3f} scattering_projectile_target yes\n")


def fireball_grid(event, eta_max=4.0, deta=0.25):
    fb = event.fb
    eta = np.arange(-eta_max, eta_max + 1e-9, deta)
    fe = fb.f_eta(eta)
    T = np.stack([np.stack([T_of_s(f * s) for f in fe], axis=-1) for s in fb.snap_s]).astype(np.float32)
    return HydroGrid(fb.snap_tau.copy(), fb.x.copy(), fb.x.copy(), eta, T, source="hic_core Level-A fireball")
