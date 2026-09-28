"""Write an Event to disk: meta.json, particles.npz, frames.npy and a volume sequence
(OpenVDB if the `openvdb` module is importable, e.g. inside Blender; otherwise float16 .npy per frame)."""
import json, os
import numpy as np
from . import freezeout as fz


def write_cache(event, out_dir, write_volume=True, progress=None):
    os.makedirs(out_dir, exist_ok=True)
    F = len(event.times); N = event.n_particles()
    pos = np.zeros((F, N, 3), np.float32); state = np.zeros((F, N), np.uint8)
    for i, t in enumerate(event.times):
        pos[i], state[i] = event.frame_particles(float(t))
        if progress and i % 50 == 0:
            progress(f"particles frame {i}/{F}")
    Nn = len(event.nuc_pos0)
    if not getattr(event.p, "show_hadrons", True):     # nucleons + fireball only
        N = Nn; pos = pos[:, :Nn]; state = state[:, :Nn]
    keep = slice(0, N - Nn)
    np.savez_compressed(os.path.join(out_dir, "particles.npz"), pos=pos, state=state,
                        species=np.r_[np.where(event.nuc_isproton, 6, 8).astype(np.int16), event.species[keep]],
                        charge=np.r_[np.where(event.nuc_isproton, 1, 0).astype(np.int8), event.charge.astype(np.int8)[keep]],
                        mass=np.r_[np.where(event.nuc_isproton, 0.938272, 0.939565), event.mass[keep]].astype(np.float32),
                        is_nucleon=np.r_[np.ones(Nn, bool), np.zeros(N - Nn, bool)],
                        nucleus=np.r_[np.zeros(len(event.glauber.posA), np.int8), np.ones(len(event.glauber.posB), np.int8), np.full(N - Nn, -1, np.int8)],
                        participant=np.r_[event.nuc_part, np.zeros(N - Nn, bool)],
                        p4=np.vstack([np.zeros((Nn, 4), np.float32), event.p4.astype(np.float32)[keep]]),
                        tau_f=np.r_[np.zeros(Nn), event.tau_f[keep]].astype(np.float32),
                        eta_s=np.r_[np.zeros(Nn), event.eta_s[keep]].astype(np.float32))
    np.save(os.path.join(out_dir, "frames.npy"), event.times.astype(np.float32))
    hud = [event.hud(float(t)) for t in event.times]
    meta = dict(event.info); meta["hud"] = hud; meta["species_names"] = fz.SPECIES
    meta["show_hadrons"] = bool(getattr(event.p, "show_hadrons", True))
    meta["n_nucleons"] = int(Nn); meta["n_hadrons"] = int(N - Nn)
    x, y, z = event.volume_grid_axes()
    meta["volume"] = dict(nx=len(x), ny=len(y), nz=len(z), voxel_fm=event.p.vol_voxel_fm, every=event.p.vol_every,
                          origin=[float(x[0] - event.p.vol_voxel_fm / 2), float(y[0] - event.p.vol_voxel_fm / 2), float(z[0] - event.p.vol_voxel_fm / 2)])
    vol_dir = os.path.join(out_dir, "volume")
    if write_volume:
        os.makedirs(vol_dir, exist_ok=True)
        try:
            import openvdb
        except ImportError:
            openvdb = None
        meta["volume"]["format"] = "vdb" if openvdb else "npy"
        for i, t in enumerate(event.times):
            if i % event.p.vol_every:
                continue
            T, E = event.frame_volume(float(t))
            hud[i]["T_max_3d_MeV"] = float(T.max())
            if openvdb:
                gT = openvdb.FloatGrid(); gT.name = "temperature"; gT.copyFromArray(np.ascontiguousarray(T))
                gE = openvdb.FloatGrid(); gE.name = "energy"; gE.copyFromArray(np.ascontiguousarray(E))
                for g in (gT, gE):
                    xf = openvdb.createLinearTransform(voxelSize=event.p.vol_voxel_fm)
                    xf.postTranslate(tuple(meta["volume"]["origin"]))
                    g.transform = xf; g.gridClass = openvdb.GridClass.FOG_VOLUME
                openvdb.write(os.path.join(vol_dir, f"fireball_{i + 1:04d}.vdb"), grids=[gT, gE])
            else:
                np.save(os.path.join(vol_dir, f"T_{i + 1:04d}.npy"), T.astype(np.float16))
            if progress and i % 50 == 0:
                progress(f"volume frame {i}/{F}")
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(meta, f, indent=1, default=lambda o: float(o) if isinstance(o, (np.floating, np.integer)) else str(o))
    return meta


def write_volume_frames(out_dir, times, frame_volume, voxel_fm, origin, progress=None, every=1, hud=None):
    """Write the per-frame temperature/energy volume (OpenVDB when available, else float16 .npy).
    frame_volume(t) -> (T[nx,ny,nz] MeV, E[nx,ny,nz] GeV/fm^3). Returns the format string."""
    vol_dir = os.path.join(out_dir, "volume"); os.makedirs(vol_dir, exist_ok=True)
    try:
        import openvdb
    except ImportError:
        openvdb = None
    F = len(times)
    for i, t in enumerate(times):
        if i % every:
            continue
        T, E = frame_volume(float(t))
        if hud is not None:
            hud[i]["T_max_3d_MeV"] = float(T.max())
        if openvdb:
            gT = openvdb.FloatGrid(); gT.name = "temperature"; gT.copyFromArray(np.ascontiguousarray(T, np.float32))
            gE = openvdb.FloatGrid(); gE.name = "energy"; gE.copyFromArray(np.ascontiguousarray(E, np.float32))
            for g in (gT, gE):
                xf = openvdb.createLinearTransform(voxelSize=voxel_fm); xf.postTranslate(tuple(origin))
                g.transform = xf; g.gridClass = openvdb.GridClass.FOG_VOLUME
            openvdb.write(os.path.join(vol_dir, f"fireball_{i + 1:04d}.vdb"), grids=[gT, gE])
        else:
            np.save(os.path.join(vol_dir, f"T_{i + 1:04d}.npy"), np.asarray(T, np.float16))
        if progress and i % 50 == 0:
            progress(f"volume frame {i}/{F}")
    return "vdb" if openvdb else "npy"
