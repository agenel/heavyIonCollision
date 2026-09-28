"""Imported simulation output -> scene cache (same layout as hic_core.cache.write_cache).

Particles between two output times move on straight lines with v = p/E (exact for free streaming, an interpolation
while the particle is still scattering); a particle is shown from the first block that contains it until the first
later block that does not. UrQMD final lists ('freezeout' blocks) are shown from each particle's own freeze-out point.
Fields are mapped to the lab frame with tau = sqrt(t^2 - z^2), eta_s = atanh(z/t).
"""
import json, os
import numpy as np
from .. import kinematics, eos, nuclei
from ..cache import write_volume_frames
from ..event import Event, EventParams, NUCLEON, SPECTATOR, HIDDEN, FREE
from ..fireball import s_of_T
from .pdg import species_of

T_C = eos.T_C_MEV


class ParticleTrack:
    """Per-particle kinematics from time blocks or freeze-out lists, queried at arbitrary lab times."""

    def __init__(self, blocks):
        self.time_blocks = sorted([b for b in blocks if b.kind in ("in", "out") and len(b)], key=lambda b: b.t)
        fo = [b for b in blocks if b.kind == "freezeout" and len(b)]
        ids = []
        for b in self.time_blocks:
            ids.append(b.data["ID"])
        self.fo = fo[0] if fo else None
        if self.fo is not None:
            ids.append(self.fo.data["ID"] + (10**9 if self.time_blocks else 0))
        self.uid = np.unique(np.concatenate(ids)) if ids else np.zeros(0, np.int64)
        self.N = len(self.uid)
        self.index = {int(u): i for i, u in enumerate(self.uid)}
        self.pdg = np.zeros(self.N, np.int64); self.mass = np.zeros(self.N); self.charge = np.zeros(self.N, np.int64)
        self.p4 = np.zeros((self.N, 4))
        for b in self.time_blocks + ([self.fo] if self.fo is not None else []):
            off = 10**9 if (b is self.fo and self.time_blocks) else 0
            ii = np.array([self.index[int(u) + off] for u in b.data["ID"]])
            self.pdg[ii] = b.data["pdg"]; self.mass[ii] = b.data["mass"]; self.charge[ii] = b.data.get("charge", 0)
            self.p4[ii] = np.column_stack([b.data["p0"], b.data["px"], b.data["py"], b.data["pz"]])   # last seen momentum
        self._rows = []
        for b in self.time_blocks:
            ii = np.array([self.index[int(u)] for u in b.data["ID"]])
            v = np.column_stack([b.data["px"], b.data["py"], b.data["pz"]]) / np.maximum(b.data["p0"], 1e-12)[:, None]
            x = np.column_stack([b.data["x"], b.data["y"], b.data["z"]])
            self._rows.append((b.t, ii, x, v))

    def at(self, t):
        pos = np.zeros((self.N, 3), np.float32); vis = np.zeros(self.N, bool)
        if self._rows:
            k = None
            for j, (tb, *_ ) in enumerate(self._rows):
                if tb <= t + 1e-9:
                    k = j
            if k is not None:
                tb, ii, x, v = self._rows[k]
                pos[ii] = x + v * (t - tb); vis[ii] = True
        if self.fo is not None:
            d = self.fo.data; off = 10**9 if self.time_blocks else 0
            ii = np.array([self.index[int(u) + off] for u in d["ID"]])
            v = np.column_stack([d["px"], d["py"], d["pz"]]) / np.maximum(d["p0"], 1e-12)[:, None]
            x = np.column_stack([d["x"], d["y"], d["z"]]); tf = d["t"]
            show = t >= tf
            pos[ii[show]] = x[show] + v[show] * (t - tf[show])[:, None]; vis[ii[show]] = True
        return pos, vis

    def t_range(self):
        ts = [r[0] for r in self._rows]
        if self.fo is not None:
            ts += [float(self.fo.data["t"].min()), float(self.fo.data["t"].max())]
        return (min(ts), max(ts)) if ts else (0.0, 0.0)


def build_cache(out_dir, blocks=None, grid=None, approach=None, n_pre=60, n_post=540, t_approach=8.0, t_end=None,
                fps=30, vol_nx=48, vol_nz=84, vol_voxel_fm=0.6, label=None, sqrt_snn=None, impact=None, source="",
                progress=None):
    """approach: dict(A, B, sqrt_snn, b, seed, include_spectators, pancake_floor_fm) to add Glauber nuclei for the
    approach phase and the spectators (the imported codes usually start after the collision). Returns meta."""
    os.makedirs(out_dir, exist_ok=True)
    tracks = ParticleTrack(blocks) if blocks else None
    warnings = [f"imported: {source}"] if source else []
    # ---- time axis
    if t_end is None:
        cands = []
        if tracks is not None and tracks.N:
            cands.append(tracks.t_range()[1])
        if grid is not None:
            cands.append(float(grid.taus[-1]))
        t_end = max(cands) if cands else 25.0
    pre = -t_approach * (1 - np.arange(n_pre) / n_pre) if (approach and n_pre > 0) else np.zeros(0)
    post = t_end * np.arange(n_post + 1) / n_post
    times = np.concatenate([pre, post])
    # ---- nucleons (optional Glauber approach)
    nuc = None
    if approach:
        ap = dict(approach)
        ep = EventParams(A=ap["A"], B=ap["B"], sqrt_snn=ap["sqrt_snn"], b=ap.get("b", impact), seed=ap.get("seed", 1),
                         include_spectators=ap.get("include_spectators", True), pancake_floor_fm=ap.get("pancake_floor_fm", 1.0),
                         orientation=ap.get("orientation", "random"))
        nuc = Event.approach_only(ep)
        sqrt_snn = sqrt_snn or ap["sqrt_snn"]; impact = nuc.glauber.b
        warnings.append("incoming nuclei and spectators are a Glauber sample with the same b, not the imported event's own nucleons")
    Nn = len(nuc.nuc_pos0) if nuc else 0
    Nh = tracks.N if tracks else 0
    F = len(times); N = Nn + Nh
    pos = np.zeros((F, N, 3), np.float32); state = np.zeros((F, N), np.uint8)
    hud = []
    for i, t in enumerate(times):
        t = float(t)
        if nuc:
            pos[i, :Nn], state[i, :Nn] = nuc.frame_nucleons(t)
        n_free = 0
        if tracks:
            p_, vis = tracks.at(t)
            pos[i, Nn:] = p_; state[i, Nn:] = np.where(vis, FREE, HIDDEN); n_free = int(vis.sum())
        h = dict(t=t, T_max_MeV=0.0, qgp_fraction=0.0, phase="approach" if t < 0 else "imported evolution", R_fm=0.0, n_free=n_free)
        if grid is not None and t > 0:
            XX, YY = np.meshgrid(grid.x, grid.y, indexing="ij")
            Tm = grid.sample_milne(np.full(XX.shape, t), XX, YY, np.zeros(XX.shape))
            s = s_of_T(Tm); tot = s.sum()
            h["T_max_MeV"] = float(Tm.max())
            h["qgp_fraction"] = float((s * (Tm > T_C)).sum() / tot) if tot > 0 else 0.0
            h["phase"] = "QGP" if h["qgp_fraction"] > 0.10 else ("crossover / hadronization" if h["qgp_fraction"] > 0.005 else
                                                                  ("hadron gas / free streaming" if n_free else "hydro ended"))
        elif t > 0 and n_free:
            h["phase"] = "hadronic transport / free streaming"
        hud.append(h)
        if progress and i % 50 == 0:
            progress(f"particles frame {i}/{F}")
    species = np.r_[np.where(nuc.nuc_isproton, 6, 8).astype(np.int16) if nuc else np.zeros(0, np.int16),
                    species_of(tracks.pdg) if tracks else np.zeros(0, np.int16)]
    charge = np.r_[np.where(nuc.nuc_isproton, 1, 0) if nuc else np.zeros(0), tracks.charge if tracks else np.zeros(0)].astype(np.int8)
    mass = np.r_[np.where(nuc.nuc_isproton, 0.938272, 0.939565) if nuc else np.zeros(0), tracks.mass if tracks else np.zeros(0)].astype(np.float32)
    p4 = np.vstack([np.zeros((Nn, 4)), tracks.p4 if tracks else np.zeros((0, 4))]).astype(np.float32)
    np.savez_compressed(os.path.join(out_dir, "particles.npz"), pos=pos, state=state, species=species, charge=charge, mass=mass,
                        is_nucleon=np.r_[np.ones(Nn, bool), np.zeros(Nh, bool)],
                        nucleus=np.r_[np.zeros(len(nuc.glauber.posA), np.int8), np.ones(len(nuc.glauber.posB), np.int8)] if nuc else np.zeros(0, np.int8),
                        participant=np.r_[nuc.nuc_part if nuc else np.zeros(0, bool), np.zeros(Nh, bool)],
                        p4=p4, tau_f=np.zeros(N, np.float32), eta_s=np.zeros(N, np.float32))
    np.save(os.path.join(out_dir, "frames.npy"), times.astype(np.float32))
    # ---- metadata expected by the scene
    e = sqrt_snn or 0.0
    meta = dict(system=label or (f"{nuc.glauber.A}+{nuc.glauber.B}" if nuc else "imported event"), sqrt_snn=e,
                centrality=None, b=impact, npart=nuc.glauber.npart if nuc else None, ncoll=nuc.glauber.ncoll if nuc else None,
                gamma=float(kinematics.gamma(e)) if e else 1.0, y_beam=float(kinematics.y_beam(e)) if e else 0.0,
                R_A=float(nuclei.params(approach["A"]).get("R", 7.0)) if approach else 7.0,
                R_B=float(nuclei.params(approach["B"]).get("R", 7.0)) if approach else 7.0,
                params=dict(pancake_floor_fm=(approach or {}).get("pancake_floor_fm", 1.0)), fps=fps, frame_of_collision=len(pre),
                warnings=warnings, hud=hud, n_nucleons=int(Nn), n_hadrons=int(Nh), source=source, imported=True,
                species_names=None)
    if grid is not None:
        x = (np.arange(vol_nx) + 0.5 - vol_nx / 2) * vol_voxel_fm; z = (np.arange(vol_nz) + 0.5 - vol_nz / 2) * vol_voxel_fm
        X3, Y3, Z3 = np.meshgrid(x, x, z, indexing="ij")

        def frame_volume(t):
            if t <= 0:
                T = np.zeros(X3.shape, np.float32)
            else:
                T = grid.sample_lab(t, X3, Y3, Z3).astype(np.float32)
            E = np.where(T > 0, eos.epsilon_of_T(np.maximum(T, 1.0)), 0.0).astype(np.float32)
            return T, E
        origin = [float(x[0] - vol_voxel_fm / 2)] * 2 + [float(z[0] - vol_voxel_fm / 2)]
        fmt = write_volume_frames(out_dir, times, frame_volume, vol_voxel_fm, origin, progress, hud=hud)
        meta["volume"] = dict(nx=vol_nx, ny=vol_nx, nz=vol_nz, voxel_fm=vol_voxel_fm, every=1, origin=origin, format=fmt)
        if grid.boost_invariant:
            warnings.append(f"2+1D (boost-invariant) hydro shown for |eta_s| < {grid.eta_window:g}")
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(meta, f, indent=1, default=lambda o: float(o) if isinstance(o, (np.floating, np.integer)) else str(o))
    return meta
