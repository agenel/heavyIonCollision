"""Event orchestration: parameters -> Glauber -> fireball -> hadrons -> per-frame positions and fields.

All positions in fm, times in fm/c (lab frame = collider centre-of-mass frame), beam along z,
nucleus A moving in +z, impact parameter along +x. 1 Blender unit = 1 fm downstream.
"""
from dataclasses import dataclass, field, asdict
import numpy as np
from . import glauber, kinematics, nuclei, eos, freezeout as fz
from .fireball import Fireball, T_of_s, MISC, trento_reduced_thickness, trento_grid
import json as _json, os as _os
with open(_os.path.join(_os.path.dirname(__file__), 'data', 'trento_norm.json')) as _f:
    TRENTO_NORM = _json.load(_f)

# particle "state" codes per frame
HIDDEN, NUCLEON, SPECTATOR, HADRON_GAS, FREE, QGP_TRACER = 0, 1, 2, 3, 4, 5


@dataclass
class EventParams:
    A: str = "Pb"
    B: str = "Pb"
    sqrt_snn: float = 5020.0
    centrality: tuple = (30, 40)
    b: float = None
    seed: int = 1
    # Glauber
    d_min: float = 0.4
    profile: str = "disk"
    omega: float = 0.4
    neutron_skin: bool = True
    orientation: str = "random"
    # initial state / fireball
    tau_0: float = 0.4
    tau_acc: float = 2.5
    trento_p: float = 0.0
    nucleon_width: float = 0.96
    fluct_k: float = 1.23
    S_per_ch: float = None
    T_kin_override: float = None
    trento_file: str = None        # use a TRENTo event file (text grid) as the initial entropy profile
    tau_had: float = None          # hadronic-phase duration (fm/c) between T_c and kinetic freeze-out; None = data default
    beta_T_override: float = None
    n_override: float = None
    v2_override: float = None
    v3_override: float = None
    v4_override: float = None
    grid_cells: int = 96
    grid_L: float = 16.0
    tau_end: float = 25.0
    diffusion: float = 0.15
    # final state
    mult_scale: float = 1.0
    include_neutral: bool = True
    include_spectators: bool = True
    show_hadrons: bool = True      # False: cache only nucleons + fireball (hadrons still computed for flow calibration)
    fermi_momentum: float = None
    calibrate_flow: bool = True
    # time mapping
    fps: int = 30
    t_approach: float = 8.0
    n_pre_frames: int = 60
    n_post_frames: int = 540
    t_end: float = 25.0
    warp_power: float = 1.0
    pancake_floor_fm: float = 1.0   # visual minimum thickness of the contracted nuclei/nucleons (true value 2R/gamma)
    # volume
    vol_nx: int = 48
    vol_nz: int = 84
    vol_voxel_fm: float = 0.6
    vol_every: int = 1


class Event:
    def __init__(self, params: EventParams):
        self.p = params
        self.rng = np.random.default_rng(params.seed)
        self.info = {}

    # ------------------------------------------------------------ pipeline
    def run(self):
        p = self.p
        self.trento = None
        if p.trento_file:
            from .importers.grids import read_trento
            h, g, x = read_trento(p.trento_file)
            self.trento = dict(header=h, grid=g, x=x)
            p.b = float(h["b"])      # the Glauber nuclei shown for the approach phase use the TRENTo impact parameter
        self.glauber = glauber.run_event(p.A, p.B, p.sqrt_snn, b=p.b, centrality=None if p.b is not None else tuple(p.centrality),
                                         rng=self.rng, d_min=p.d_min, profile=p.profile, omega=p.omega,
                                         neutron_skin=p.neutron_skin, orientation=p.orientation)
        ev = self.glauber
        if self.trento is not None:
            h = self.trento["header"]
            for n in (2, 3, 4, 5):
                if f"e{n}" in h:
                    ev.eps[n] = float(h[f"e{n}"])
            # event-plane angles from the TRENTo field itself (entropy-weighted, same convention as glauber.eccentricities)
            g = self.trento["grid"]; xg = self.trento["x"]; XX, YY = np.meshgrid(xg, xg, indexing="ij")
            tot = g.sum(); cx = (g * XX).sum() / tot; cy = (g * YY).sum() / tot
            r = np.hypot(XX - cx, YY - cy); ph = np.arctan2(YY - cy, XX - cx)
            for n in (2, 3, 4, 5):
                cn = (g * r**n * np.cos(n * ph)).sum(); sn = (g * r**n * np.sin(n * ph)).sum()
                ev.psi[n] = float((np.arctan2(sn, cn) + np.pi) / n)
            ev.meta["trento_file"] = p.trento_file
        self.c_mid = 0.5 * (p.centrality[0] + p.centrality[1]) if p.b is None else self._centrality_from_b(ev.b)
        self._lookup_data()
        a = {2: 0.0, 3: 0.0, 4: 0.0}
        gain = 1.0
        self.vn_calib = {}
        if p.calibrate_flow:
            # stage 1: isotropic flow strength -> measured midrapidity pion <pT> (damped multiplicative updates,
            # <pT> grows like gamma*beta so the response is steep)
            lo = hi = None   # bracket [gain_lo (pt too low), gain_hi (pt too high)] then bisect
            best = (None, 1e9)
            for it in range(12):
                self._build_fireball(a, gain); self._spawn_and_track_hadrons()
                obs, pt_pi = self._measure_vn(); self.pt_pi_calib = pt_pi
                err = abs(pt_pi - self.pt_pi_target) / self.pt_pi_target
                if err < best[1]:
                    best = (gain, err)
                if err <= 0.03:
                    break
                if pt_pi < self.pt_pi_target:
                    lo = gain
                else:
                    hi = gain
                if lo is not None and hi is not None:
                    gain = 0.5 * (lo + hi)
                else:
                    gain = float(np.clip(gain * (self.pt_pi_target / max(pt_pi, 0.05)) ** 0.5, 0.3, 3.0))
            if best[0] is not None and abs(best[0] - gain) > 1e-9 and best[1] < err:
                gain = best[0]
            # stage 2: azimuthal modulation -> measured v_n (gain fixed, bounded amplitudes)
            a = {2: 0.8 * self.vn_target[2], 3: 0.8 * self.vn_target[3], 4: 0.5 * self.vn_target[4]}
            for it in range(8):
                self._build_fireball(a, gain); self._spawn_and_track_hadrons()
                obs, pt_pi = self._measure_vn(); self.vn_calib = obs; self.pt_pi_calib = pt_pi
                done = True
                for n in (2, 3, 4):
                    tgt = self.vn_target[n]
                    if abs(obs[n] - tgt) > max(0.003, 0.05 * abs(tgt)):
                        done = False; a[n] = float(np.clip(a[n] + 0.7 * (tgt - obs[n]), -0.8, 0.8))
                if done:
                    break
        else:
            self._build_fireball(a, gain); self._spawn_and_track_hadrons()
        self.beta_T_emitted = float(np.hypot(self.vT_f[:, 0], self.vT_f[:, 1])[np.abs(self.eta_s) < 1.0].mean())
        self.a_n = a; self.flow_gain = gain
        self._emit()
        self._frame_times()
        self._nucleon_kinematics()
        self._summary()
        return self

    def _centrality_from_b(self, b):
        """Continuous centrality for a fixed impact parameter (glauber.centrality_of_b); capped at 99.5% so the
        data tables are still interpolated for events past the inelastic edge."""
        p = self.p
        return min(glauber.centrality_of_b(p.A, p.B, p.sqrt_snn, b, d_min=p.d_min, profile=p.profile, omega=p.omega), 99.5)

    # ------------------------------------------------------------ data lookup
    def _initial_TR_from_file(self):
        """TRENTo file grid resampled (bilinear) onto the fireball grid."""
        from .importers.grids import HydroGrid
        p = self.p; tr = self.trento
        X, Y, dx = trento_grid(p.grid_L, p.grid_cells)
        G = HydroGrid(np.array([0.0]), tr["x"], tr["x"], np.array([0.0]), tr["grid"][None, :, :, None])
        return G.sample_milne(np.zeros(X.shape), X, Y, np.zeros(X.shape))

    def _trento_integral(self):
        """Integral of the TRENTo reduced thickness for this event, with exactly the fluctuations the fireball uses."""
        p = self.p
        if self.trento is not None:
            X, Y, dx = trento_grid(p.grid_L, p.grid_cells)
            return float(self._initial_TR_from_file().sum() * dx * dx)
        X, Y, dx = trento_grid(p.grid_L, p.grid_cells)
        TR = trento_reduced_thickness(self.glauber, X, Y, p.trento_p, p.nucleon_width, p.fluct_k, np.random.default_rng(p.seed + 7))
        return float(TR.sum() * dx * dx)

    def _c_equiv(self, ref_key):
        """Centrality of the reference system (multiplicity table ref_key) with the same dN_ch/deta as this event."""
        tab = fz.MULT[ref_key]
        c = np.asarray(tab["centrality_mid"], float); d = np.asarray(tab["dNch_deta"], float)
        o = np.argsort(d)
        return float(np.interp(np.log(self.dNch), np.log(d[o]), c[o]))   # clamps to the table ends

    def _lookup_data(self):
        """Inputs from data. Systems with their own tables use them at their centrality. Otherwise:
        - multiplicity: dN_ch/deta = N * I with I the TRENTo entropy integral of this event and N calibrated on
          the closest-energy reference (scripts/calibrate_trento_norm.py), scaled by (sqrt s / sqrt s_ref)^0.31
          (ALICE PRL 116 (2016) 222302: dN_ch/deta per participant pair ~ s^0.155);
        - freeze-out, yields, <pT> and the flow response kappa_n = v_n/eps_n are taken from the reference system at the
          centrality with the same multiplicity (c_eq), and v_n = kappa_n(c_eq) * eps_n(this event)."""
        p, ev = self.p, self.glauber
        key = glauber.system_key(p.A, p.B, p.sqrt_snn)
        self.I_trento = self._trento_integral()
        if key in fz.MULT:
            self.dNch = fz._interp_cent(fz.MULT[key]["centrality_mid"], fz.MULT[key]["dNch_deta"], self.c_mid)
            mult_key, self.mult_method = key, "table"
        else:
            refs = {k: v for k, v in TRENTO_NORM.items() if not k.startswith("_") and k != "trento"}
            mult_key = min(refs, key=lambda k: abs(np.log(refs[k]["sqrt_snn"] / p.sqrt_snn)))
            rows = [r for r in refs[mult_key]["bins"] if r["c"][1] <= 60]
            norm = float(np.mean([r["norm"] for r in rows])) * (p.sqrt_snn / refs[mult_key]["sqrt_snn"]) ** 0.31
            self.dNch = norm * self.I_trento
            self.mult_method = f"TRENTo integral x norm({mult_key})"
        self.shape = fz.MULT[mult_key]["shape"]

        # blast wave, yields and <pT>
        ykey = fz._closest_key(fz.YIELDS, p.A, p.B, p.sqrt_snn)
        c_y = self.c_mid if ykey == key else self._c_equiv(ykey)
        self.bw = fz.blastwave_params(p.A, p.B, p.sqrt_snn, c_y)
        if p.T_kin_override: self.bw["T_kin_MeV"] = p.T_kin_override
        if p.beta_T_override: self.bw["beta_T"] = p.beta_T_override
        if p.n_override: self.bw["n"] = p.n_override
        self.frac, self.f_charged, self.yield_key = fz.species_fractions(p.A, p.B, p.sqrt_snn, c_y)
        Y = fz.YIELDS[self.yield_key]
        cmp = Y["mean_pt"].get("centrality_mid", Y["centrality_mid"])
        self.pt_target = {k: float(np.interp(c_y, cmp, Y["mean_pt"][k])) for k in ("pi", "K", "p")}
        self.pt_pi_target = self.pt_target["pi"]

        # anisotropic flow
        fkey = fz._closest_key(fz.FLOW, p.A, p.B, p.sqrt_snn)
        if fkey == key:
            self.vn_target, _ = fz.flow_targets(p.A, p.B, p.sqrt_snn, self.c_mid); c_f = self.c_mid
        else:
            mref = fkey if fkey in fz.MULT else mult_key
            c_f = self._c_equiv(mref)
            tab = fz.FLOW[fkey]
            self.vn_target = {n: fz._interp_cent(tab["centrality_mid"], tab[f"v{n}"], c_f, log=False) for n in (2, 3, 4)}
            gkey = fkey if fkey in glauber.CENTRALITY_TABLES else ("PbPb_5020" if p.sqrt_snn > 1000 else "AuAu_200")
            gt = glauber.CENTRALITY_TABLES[gkey]["bins"]; cm = [0.5 * (r["c"][0] + r["c"][1]) for r in gt]
            for n in (2, 3):
                eref = float(np.interp(c_f, cm, [r[f"eps{n}"] for r in gt]))
                self.vn_target[n] *= ev.eps[n] / max(eref, 1e-6)
        for n in (2, 3, 4):
            ov = getattr(p, f"v{n}_override")
            if ov is not None:
                self.vn_target[n] = ov
        self.c_equiv = dict(yields=c_y, flow=c_f)
        # validity: the Level-A model assumes boost invariance, fast crossing (2R/gamma << tau_0) and mu_B ~ 0
        self.warnings = []
        from .kinematics import crossing_time
        tc = crossing_time(max(nuclei.params(p.A).get("R", 1.0), nuclei.params(p.B).get("R", 1.0)), p.sqrt_snn)
        if tc > p.tau_0:
            self.warnings.append(f"nuclei take {tc:.2f} fm/c to cross (> tau_0 = {p.tau_0} fm/c): boost-invariant initial state is approximate")
        if p.sqrt_snn < 39:
            self.warnings.append("baryon-rich matter (mu_B > 100 MeV) at this energy: the mu_B = 0 lattice EoS and Bjorken flow are approximate")
        if self.dNch < 60:
            self.warnings.append("small system: hydrodynamic description of the droplet is debated")
        self.info["warnings"] = self.warnings
        self.info.update(mult_source=mult_key, mult_method=self.mult_method, I_trento=self.I_trento,
                         blastwave_source=self.bw["source"], flow_source=fkey, yield_source=self.yield_key, c_equiv=self.c_equiv)

    def _build_fireball(self, a_n=None, flow_gain=1.0):
        p = self.p
        self.fb = Fireball(self.glauber, self.dNch, self.shape, self.bw, S_per_ch=p.S_per_ch, p=p.trento_p,
                           w=p.nucleon_width, k=p.fluct_k, tau_0=p.tau_0, tau_acc=p.tau_acc, L=p.grid_L,
                           n_cells=p.grid_cells, rng=np.random.default_rng(p.seed + 7), a_n=a_n, flow_gain=flow_gain,
                           initial_TR=self._initial_TR_from_file() if self.trento is not None else None)
        self.fb.evolve(tau_end=p.tau_end, diffusion=p.diffusion)

    def _spawn_and_track_hadrons(self):
        """Fluid-element tracers carrying constant entropy; they become hadrons at T_c and freeze at T_kin."""
        p, fb = self.p, self.fb
        rng = np.random.default_rng(p.seed + 11)
        kappa = fb.S_per_ch * self.f_charged               # entropy per hadron (all species)
        int_f = float(np.trapezoid(fb.f_eta(np.linspace(-fb.y_beam, fb.y_beam, 2001)), np.linspace(-fb.y_beam, fb.y_beam, 2001)))
        N_total = fb.dS_deta * int_f / kappa
        self.jacobian = self._eta_jacobian()
        N_total /= self.jacobian
        N = int(round(N_total * p.mult_scale))
        self.N_hadrons_full = N_total
        # species
        frac = self.frac.copy()
        if not p.include_neutral:
            frac[fz.CHARGE_ARR == 0] = 0; frac /= frac.sum()
        self.species = rng.choice(len(fz.SPECIES), size=N, p=frac).astype(np.int16)
        # transverse position ∝ s0
        w = fb.s0.ravel() / fb.s0.sum()
        cells = rng.choice(w.size, size=N, p=w)
        ix, iy = np.unravel_index(cells, fb.s0.shape)
        xy = np.column_stack([fb.x[ix] + rng.uniform(-0.5, 0.5, N) * fb.dx, fb.x[iy] + rng.uniform(-0.5, 0.5, N) * fb.dx])
        # eta_s ∝ f(eta)
        eta = rng.normal(0, fb.sigma_eta, size=N)
        bad = np.abs(eta) >= fb.y_beam
        while bad.any():
            eta[bad] = rng.normal(0, fb.sigma_eta, size=bad.sum()); bad = np.abs(eta) >= fb.y_beam
        self.eta_s = eta
        fe = fb.f_eta(eta)
        # advect along the flow; record history and the first crossings of T_c and T_kin
        taus = fb.snap_tau; K = len(taus)
        hist = np.empty((K, N, 2), np.float32)
        tau_c = np.full(N, np.inf); tau_f = np.full(N, np.inf)
        pos = xy.copy()
        for k in range(K):
            hist[k] = pos
            s = fb.sample_points(fb.snap_s[k], pos)
            T = T_of_s(fe * s)
            newly_c = np.isinf(tau_c) & (T < fb.T_c); tau_c[newly_c] = taus[k]
            newly_f = np.isinf(tau_f) & (T < fb.T_kin); tau_f[newly_f] = taus[k]
            if k + 1 < K:
                dt = taus[k + 1] - taus[k]
                vx, vy = fb.velocity(taus[k], pos[:, 0], pos[:, 1])
                mid = pos + 0.5 * dt * np.column_stack([vx, vy])
                vx2, vy2 = fb.velocity(taus[k] + 0.5 * dt, mid[:, 0], mid[:, 1])
                moving = np.isinf(tau_f)[:, None]
                step = dt * np.column_stack([vx2, vy2])
                if fb.diffusion > 0:   # same diffusion as the entropy field (Fokker-Planck <-> random walk)
                    step += rng.normal(0.0, np.sqrt(2 * fb.diffusion * dt), size=step.shape)
                pos = pos + np.where(moving, step, 0.0)
        tau_c[np.isinf(tau_c)] = taus[-1]
        # kinetic freeze-out: hadrons formed at T_c keep flowing with the fluid (rescattering) for tau_had
        # (ALICE K*(892)/K: 4-7 fm/c in central Pb-Pb, arXiv:1910.14419), unless the fluid cools below T_kin first.
        # the hadronic phase shortens with system size (ALICE 1910.14419: K*/K suppression vanishes in peripheral
        # collisions); scale the central value by the fireball radius R_0 / 6.5 fm, floor 0.5 fm/c
        tau_had = MISC["hadronic_phase_fm"]["value"] if p.tau_had is None else p.tau_had
        tau_had = max(tau_had * min(fb.R_0 / 6.5, 1.0), 0.5)
        tau_f = np.minimum(np.where(np.isinf(tau_f), np.inf, tau_f), tau_c + tau_had)
        tau_f = np.minimum(tau_f, taus[-1])
        tau_f = np.maximum(tau_f, tau_c)
        self.tau_had = tau_had
        self.hist, self.tau_c, self.tau_f = hist, tau_c, tau_f
        # freeze-out position and local flow
        kf = np.clip(np.searchsorted(taus, tau_f), 0, K - 1)
        self.xy_f = hist[kf, np.arange(N)]
        vx, vy = fb.flow_at(tau_f, self.xy_f[:, 0], self.xy_f[:, 1])
        self.vT_f = np.column_stack([vx, vy])
        self.phi_f = np.arctan2(self.xy_f[:, 1], self.xy_f[:, 0])

    def _eta_jacobian(self, M=20000):
        """Ratio dN_ch/deta(0) / dN_ch/deta_s(0) from a blast-wave pre-sample (pseudorapidity vs rapidity)."""
        fb, rng = self.fb, np.random.default_rng(self.p.seed + 99)
        sp = rng.choice(len(fz.SPECIES), size=M, p=self.frac); mass = fz.MASS_ARR[sp]; ch = fz.CHARGE_ARR[sp] != 0
        r = np.sqrt(rng.uniform(size=M)); phi = rng.uniform(0, 2 * np.pi, M)
        v = fb.beta_s * r ** fb.n_prof
        vT = np.column_stack([v * np.cos(phi), v * np.sin(phi)])
        eta_s = rng.uniform(-1.5, 1.5, M)
        p4 = fz.emit(mass, fb.T_kin, vT, eta_s, rng)
        pt = np.hypot(p4[:, 1], p4[:, 2]); pm = np.sqrt(pt**2 + p4[:, 3]**2)
        eta = np.arctanh(np.clip(p4[:, 3] / np.maximum(pm, 1e-12), -0.999999, 0.999999))
        return float(((np.abs(eta) < 0.5) & ch).sum() / max(((np.abs(eta_s) < 0.5) & ch).sum(), 1))

    def _measure_vn(self, M=80000):
        """v_n{2} of charged hadrons in the ALICE acceptance and the midrapidity pion <pT>, from a bootstrapped emission sample."""
        N = len(self.species); rep = max(1, int(np.ceil(M / N))); idx = np.tile(np.arange(N), rep)
        sp = self.species[idx]; mass = fz.MASS_ARR[sp]; charge = fz.CHARGE_ARR[sp]
        p4 = fz.emit(mass, self.fb.T_kin, self.vT_f[idx], self.eta_s[idx], np.random.default_rng(self.p.seed + 23))
        y = 0.5 * np.log((p4[:, 0] + p4[:, 3]) / np.maximum(p4[:, 0] - p4[:, 3], 1e-12))
        sel = (np.abs(y) < 0.5) & np.isin(sp, (0, 1))
        pt_pi = float(np.hypot(p4[sel, 1], p4[sel, 2]).mean()) if sel.any() else 0.0
        return {n: fz.vn_observed(p4, charge, self.glauber.psi[n], n) for n in (2, 3, 4)}, pt_pi

    def _emit(self):
        p, fb, rng = self.p, self.fb, self.rng
        mass = fz.MASS_ARR[self.species]; charge = fz.CHARGE_ARR[self.species]
        p4 = fz.emit(mass, fb.T_kin, self.vT_f, self.eta_s, np.random.default_rng(p.seed + 31))
        self.p4 = p4
        self.vn_obs = {n: fz.vn_observed(p4, charge, self.glauber.psi[n], n) for n in (2, 3, 4)}
        if not p.calibrate_flow:
            self.vn_calib = dict(self.vn_obs)
        self.mass = mass; self.charge = charge
        self.t_f = self.tau_f * np.cosh(self.eta_s); self.z_f = self.tau_f * np.sinh(self.eta_s)
        self.vel = p4[:, 1:] / p4[:, [0]]

    def _frame_times(self):
        p = self.p
        pre = -p.t_approach * (1 - np.arange(p.n_pre_frames) / p.n_pre_frames) if p.n_pre_frames > 0 else np.zeros(0)
        u = np.arange(p.n_post_frames + 1) / p.n_post_frames
        post = p.t_end * u ** p.warp_power
        self.times = np.concatenate([pre, post])
        self.frame_of_collision = p.n_pre_frames

    def _nucleon_kinematics(self):
        p, ev = self.p, self.glauber
        beta = float(kinematics.beta(p.sqrt_snn)); g = ev.meta["gamma"]
        RA = nuclei.params(p.A).get("R", 1.0); RB = nuclei.params(p.B).get("R", 1.0)
        zsA = max(1.0 / g, p.pancake_floor_fm / (2 * RA)); zsB = max(1.0 / g, p.pancake_floor_fm / (2 * RB))
        self.nuc_pos0 = np.vstack([ev.posA, ev.posB]).astype(np.float64)
        self.nuc_zscale = np.r_[np.full(len(ev.posA), zsA), np.full(len(ev.posB), zsB)]
        self.nuc_dir = np.r_[np.ones(len(ev.posA)), -np.ones(len(ev.posB))]
        self.nuc_isproton = np.r_[ev.isprotonA, ev.isprotonB]
        self.nuc_part = np.r_[ev.partA, ev.partB]
        self.nuc_beta = beta
        pF = MISC["fermi_momentum_GeV"]["value"] if p.fermi_momentum is None else p.fermi_momentum
        m = np.where(self.nuc_isproton, 0.938272, 0.939565)
        pz = self.nuc_dir * g * beta * m
        pxy = self.rng.normal(0, pF / np.sqrt(5.0), size=(len(m), 2))
        E = np.sqrt(pz**2 + (pxy**2).sum(1) + m**2)
        self.spec_vel = np.column_stack([pxy / E[:, None], pz / E])

    # ------------------------------------------------------------ per-frame queries
    def n_particles(self):
        return len(self.nuc_pos0) + len(self.species)

    def frame_nucleons(self, t):
        """Nucleons at lab time t: both (contracted) nuclei moving at beta before the collision; afterwards the
        spectators continue at beam rapidity with Fermi-motion smearing and participants are hidden."""
        Nn = len(self.nuc_pos0)
        pos = np.zeros((Nn, 3), np.float32); st = np.zeros(Nn, np.uint8)
        z_rest = self.nuc_pos0[:, 2] * self.nuc_zscale
        if t < 0:
            pos[:, :2] = self.nuc_pos0[:, :2]
            pos[:, 2] = z_rest + self.nuc_dir * self.nuc_beta * t
            st[:] = NUCLEON
        else:
            if self.p.include_spectators:
                pos[:, :2] = self.nuc_pos0[:, :2] + self.spec_vel[:, :2] * t
                pos[:, 2] = z_rest + self.spec_vel[:, 2] * t
                st[:] = np.where(~self.nuc_part, SPECTATOR, HIDDEN)
            # participants: shown passing through each other until the fireball has formed (t < tau_0 + 0.3 fm/c);
            # the scene shrinks them over that window (their energy has gone into the glasma / QGP)
            if t < self.p.tau_0 + 0.3:
                part = self.nuc_part
                pos[part, :2] = self.nuc_pos0[part, :2]
                pos[part, 2] = z_rest[part] + self.nuc_dir[part] * self.nuc_beta * t
                st[part] = NUCLEON
        return pos, st

    @classmethod
    def approach_only(cls, params):
        """Glauber nuclei only (no fireball / hadrons): used by the importers for the approach phase and spectators."""
        e = cls(params)
        e.glauber = glauber.run_event(params.A, params.B, params.sqrt_snn, b=params.b,
                                      centrality=None if params.b is not None else tuple(params.centrality), rng=e.rng,
                                      d_min=params.d_min, profile=params.profile, omega=params.omega,
                                      neutron_skin=params.neutron_skin, orientation=params.orientation)
        e._nucleon_kinematics()
        return e

    def frame_particles(self, t):
        """Positions (N,3) and state codes (N,) of nucleons + hadrons at lab time t."""
        Nn = len(self.nuc_pos0); Nh = len(self.species)
        pos = np.zeros((Nn + Nh, 3), np.float32); st = np.zeros(Nn + Nh, np.uint8)
        pos[:Nn], st[:Nn] = self.frame_nucleons(t)
        if t <= 0:
            return pos, st
        # hadrons
        eta = self.eta_s; tau_p = t / np.cosh(eta)
        taus = self.fb.snap_tau
        free = tau_p >= self.tau_f
        gas = (~free) & (tau_p >= self.tau_c)
        qgp = (~free) & (~gas) & (tau_p >= self.fb.tau_0)
        # hadron-gas phase: interpolate history
        idx = np.where(gas | qgp)[0]
        if idx.size:
            k = np.clip(np.searchsorted(taus, tau_p[idx]) - 1, 0, len(taus) - 2)
            w = np.clip((tau_p[idx] - taus[k]) / (taus[k + 1] - taus[k]), 0, 1)[:, None]
            xy = (1 - w) * self.hist[k, idx] + w * self.hist[k + 1, idx]
            pos[Nn + idx, :2] = xy; pos[Nn + idx, 2] = tau_p[idx] * np.sinh(eta[idx])
        st[Nn:][gas] = HADRON_GAS; st[Nn:][qgp] = QGP_TRACER
        idx = np.where(free)[0]
        if idx.size:
            dt = (t - self.t_f[idx])[:, None]
            pos[Nn + idx, 0] = self.xy_f[idx, 0] + self.vel[idx, 0] * dt[:, 0]
            pos[Nn + idx, 1] = self.xy_f[idx, 1] + self.vel[idx, 1] * dt[:, 0]
            pos[Nn + idx, 2] = self.z_f[idx] + self.vel[idx, 2] * dt[:, 0]
            st[Nn + idx] = FREE
        return pos, st

    def volume_grid_axes(self):
        p = self.p
        x = (np.arange(p.vol_nx) + 0.5 - p.vol_nx / 2) * p.vol_voxel_fm
        z = (np.arange(p.vol_nz) + 0.5 - p.vol_nz / 2) * p.vol_voxel_fm
        return x, x, z

    def frame_volume(self, t):
        """Temperature (MeV) and energy density (GeV/fm^3) grids (nx, ny, nz) at lab time t."""
        x, y, z = self.volume_grid_axes()
        X, Y = np.meshgrid(x, y, indexing="ij")
        T = self.fb.temperature_3d(t, z, X, Y)          # (nz, nx, ny)
        T = np.transpose(T, (1, 2, 0))
        E = np.where(T > 0, eos.epsilon_of_T(np.maximum(T, 1.0)), 0.0).astype(np.float32)
        return T.astype(np.float32), E

    def hud(self, t):
        fb = self.fb
        tau = max(t, 0.0)
        hot = 0.0
        if t < 0:
            phase, Tmax = "approach", 0.0
        elif tau < fb.tau_0:
            phase, Tmax = "pre-equilibrium (glasma)", float(T_of_s(fb.s2d(fb.tau_0)).max())
        else:
            Tmax = fb.T_max(tau); hot = fb.hot_fraction(tau)
            if hot > 0.10:
                phase = "QGP"
            elif hot > 0.005:
                phase = "crossover / hadronization"
            elif tau < np.median(self.tau_f):
                phase = "hadron gas"
            else:
                phase = "free streaming"
        n_free = int((tau / np.cosh(self.eta_s) >= self.tau_f).sum()) if t > 0 else 0
        return dict(t=float(t), T_max_MeV=Tmax, qgp_fraction=hot, phase=phase, R_fm=float(fb.radius(tau)) if t > 0 else 0.0,
                    n_free=n_free)

    def _summary(self):
        ev, fb = self.glauber, self.fb
        pt = np.hypot(self.p4[:, 1], self.p4[:, 2])
        y = 0.5 * np.log((self.p4[:, 0] + self.p4[:, 3]) / np.maximum(self.p4[:, 0] - self.p4[:, 3], 1e-12))
        mid = np.abs(y) < 0.5
        mean_pt = {}
        for name, sid in (("pi", (0, 1)), ("K", (3, 4)), ("p", (6, 7))):
            sel = mid & np.isin(self.species, sid)
            mean_pt[name] = float(pt[sel].mean()) if sel.any() else 0.0
        pz = self.p4[:, 3]; pm = np.sqrt(pt**2 + pz**2)
        etap = np.arctanh(np.clip(pz / np.maximum(pm, 1e-12), -0.999999, 0.999999))
        ch = self.charge != 0
        dNch_mid = float(((np.abs(etap) < 0.5) & ch).sum() / self.p.mult_scale)
        tauc = fb.qgp_end()
        self.info.update(dict(
            system=f"{ev.A}+{ev.B}", R_A=float(nuclei.params(self.p.A).get("R", 1.0)), R_B=float(nuclei.params(self.p.B).get("R", 1.0)),
            orientation=str(self.p.orientation), sqrt_snn=self.p.sqrt_snn, centrality=list(self.p.centrality), c_mid=self.c_mid,
            b=ev.b, npart=ev.npart, ncoll=ev.ncoll, nspec=ev.n_spectators, eps2=ev.eps[2], eps3=ev.eps[3],
            psi2=ev.psi[2], psi3=ev.psi[3], gamma=ev.meta["gamma"], y_beam=ev.meta["y_beam"], sigma_nn_mb=ev.sigma_nn_mb,
            dNch_deta_target=self.dNch, dNch_deta_generated=dNch_mid, N_hadrons_full=self.N_hadrons_full, N_hadrons_generated=len(self.species),
            T0_MeV=float(T_of_s(fb.s2d(fb.tau_0)).max()), T_at_1fm_MeV=fb.T_max(1.0), tau_QGP_end=float(tauc),
            tau_f_median=float(np.median(self.tau_f)), tau_f_max=float(self.tau_f.max()),
            T_kin=fb.T_kin, beta_T=fb.beta_T, beta_s=fb.beta_s, n_profile=fb.n_prof, sigma_eta=fb.sigma_eta, R0=fb.R_0,
            vn_target=self.vn_target, vn_generated=self.vn_obs, vn_calibrated=self.vn_calib, a_n=self.a_n,
            flow_gain=self.flow_gain, beta_T_emitted=getattr(self, "beta_T_emitted", None), mean_pt_target=self.pt_target,
            pt_pi_calibrated=getattr(self, "pt_pi_calib", None), mean_pt_mid=mean_pt, f_charged=self.f_charged,
            n_frames=len(self.times), fps=self.p.fps, frame_of_collision=self.frame_of_collision,
            params=asdict(self.p)))
        return self.info
