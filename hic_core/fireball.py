"""Level-A fireball: boost-invariant, entropy-conserving transverse expansion with a prescribed flow field.

Physics:
- Initial entropy density at tau_0 from the TRENTo reduced thickness of Gaussian participant nucleons
  (Moreland, Bernhard, Bass PRC 92 (2015) 011901): T_R = ((T_A^p + T_B^p)/2)^(1/p), width w, gamma-distributed
  nucleon weights with shape k.  Normalization: tau_0 * integral s dxdy = dS/deta = S_per_ch * dN_ch/deta(0)
  (Hanus, Mazeliauskas, Reygers PRC 100 (2019) 064903: dS/deta = 6.7 dN_ch/deta).
- Evolution: ideal-fluid entropy conservation in Milne coordinates,
      d(tau s gamma)/dtau + div_T(tau s gamma v) = 0,
  with a prescribed radial velocity field v(r, tau) = v_s(tau) * min(r/R(tau), 1)^n r_hat,
  v_s(tau) = beta_s tanh((tau - tau_0)/tau_acc), R(tau) = R_0 + int v_s dtau. beta_s and n are the
  blast-wave surface velocity and profile exponent measured at kinetic freeze-out (ALICE 1303.0737, STAR 0808.2041).
  This reproduces Bjorken cooling T ~ tau^(-1/3) at early times and the measured radial flow at freeze-out;
  it is not a solution of the hydrodynamic equations (no pressure feedback, no viscosity) — see PLAN.md §1.
- Temperature from entropy density via the HotQCD lattice EoS (eos.py).
- Longitudinal profile f(eta_s): Gaussian in space-time rapidity with width set from the measured dN/deta
  shape; s(x, y, eta_s, tau) = f(eta_s) * s_2D(x, y, tau) exactly (the advection is linear in s).
"""
import json, os
import numpy as np
from . import eos, kinematics
from .constants import HBARC

_DATA = os.path.join(os.path.dirname(__file__), "data")
with open(os.path.join(_DATA, "misc.json")) as f:
    MISC = json.load(f)

# entropy density table s(T) [fm^-3] for inversion
_T_grid = np.linspace(20.0, 1200.0, 2000)
_s_grid = np.array([_v for _v in eos.entropy_of_T(_T_grid)])
# eos.entropy_of_T clamps T to [130,400] for s/T^3; extend with T^3 scaling explicitly
_s_T3 = np.interp(np.clip(_T_grid, 130, 400), np.array(eos._T), np.array(eos._S_T3))
_s_grid = _s_T3 * (_T_grid / 1000.0) ** 3 / HBARC**3


def T_of_s(s):
    """Temperature (MeV) from entropy density (fm^-3); monotonic interpolation, 0 for s <= 0."""
    s = np.asarray(s, float)
    T = np.interp(np.log(np.maximum(s, 1e-12)), np.log(_s_grid), _T_grid, left=0.0)
    return np.where(s <= _s_grid[0], 0.0, T)


def s_of_T(T):
    return np.interp(np.asarray(T, float), _T_grid, _s_grid, left=0.0)


def long_profile_sigma(shape):
    """Space-time-rapidity Gaussian width from the measured dN/deta shape (thermal smearing ~0.8 removed)."""
    if shape["type"] == "double_gauss":
        sigma_eta = 3.86       # ALICE 1304.0347: dN/dy Gaussian sigma
    elif shape["type"] == "fwhm_gauss":
        sigma_eta = shape["fwhm"] / 2.3548
    else:
        sigma_eta = 3.0
    return float(np.sqrt(max(sigma_eta**2 - 0.8**2, 1.0)))


def trento_reduced_thickness(ev, X, Y, p=0.0, w=0.96, k=1.23, rng=None):
    """TRENTo reduced thickness T_R(x, y) (Moreland, Bernhard, Bass PRC 92 (2015) 011901) on the grid X, Y
    from the participants of a Glauber event: Gaussian nucleons of width w with Gamma(k, 1/k) weights.
    The rng call order (A then B) is fixed so the same seed reproduces the same fluctuations."""
    rng = np.random.default_rng() if rng is None else rng

    def thickness(xy):
        T = np.zeros_like(X)
        wts = rng.gamma(k, 1.0 / k, size=len(xy))
        for (x0, y0), g in zip(xy, wts):
            T += g * np.exp(-((X - x0) ** 2 + (Y - y0) ** 2) / (2 * w * w)) / (2 * np.pi * w * w)
        return T
    TA = thickness(ev.posA[ev.partA][:, :2]); TB = thickness(ev.posB[ev.partB][:, :2])
    if abs(p) < 1e-6:
        TR = np.sqrt(TA * TB)
    else:
        with np.errstate(divide="ignore", invalid="ignore"):
            TR = ((TA**p + TB**p) / 2.0) ** (1.0 / p)
    return np.nan_to_num(TR)


def trento_grid(L=16.0, n=96):
    dx = 2 * L / n; x = (np.arange(n) + 0.5) * dx - L
    X, Y = np.meshgrid(x, x, indexing="ij")
    return X, Y, dx


class Fireball:
    def __init__(self, ev, dNch_deta_mid, shape, blastwave, S_per_ch=None, p=0.0, w=0.96, k=1.23,
                 tau_0=0.4, tau_acc=2.5, L=16.0, n_cells=96, rng=None, T_kin=None, a_n=None, psi_n=None, flow_gain=1.0,
                 initial_TR=None):
        """ev: GlauberEvent. dNch_deta_mid: measured midrapidity density for this centrality.
        blastwave: dict(beta_T, n, T_kin_MeV) for this centrality."""
        self.ev = ev; self.rng = np.random.default_rng() if rng is None else rng
        self.tau_0 = float(tau_0); self.tau_acc = float(tau_acc)
        self.L = float(L); self.n = int(n_cells)
        self.dx = 2 * self.L / self.n
        self.x = (np.arange(self.n) + 0.5) * self.dx - self.L
        self.X, self.Y = np.meshgrid(self.x, self.x, indexing="ij")
        self.R_grid = np.hypot(self.X, self.Y); self.PHI = np.arctan2(self.Y, self.X)
        self.S_per_ch = MISC["entropy_per_charged_hadron"]["value"] if S_per_ch is None else S_per_ch
        self.dS_deta = self.S_per_ch * dNch_deta_mid
        self.sigma_eta = long_profile_sigma(shape)
        self.y_beam = float(kinematics.y_beam(ev.sqrt_snn))
        self.beta_T = float(blastwave["beta_T"]); self.n_prof = float(blastwave["n"])
        self.T_kin = float(blastwave["T_kin_MeV"]) if T_kin is None else float(T_kin)
        # flow_gain is calibrated by the event loop so that the emitted mean transverse velocity equals the
        # measured blast-wave <beta_T> (the tanh build-up and early freeze-out of the periphery reduce it otherwise)
        self.flow_gain = float(flow_gain)
        self.beta_s = min(self.beta_T * (2 + self.n_prof) / 2.0 * self.flow_gain, 0.97)
        self.T_c = eos.T_C_MEV
        # anisotropic pressure-gradient response: flow rapidity rho -> rho [1 + 2 sum_n a_n cos n(phi - Psi_n)]
        self.a_n = {2: 0.0, 3: 0.0, 4: 0.0} if a_n is None else dict(a_n)
        self.psi_n = {2: ev.psi[2], 3: ev.psi[3], 4: ev.psi[4]} if psi_n is None else dict(psi_n)
        self._initial_TR = initial_TR
        self.s0 = self._initial_entropy(p, w, k)
        self.R_0 = self._edge_radius(self.s0)
        self.ecc_0, self.psi_0 = self._field_ecc(self.s0)
        # flow build-up time shrinks with system size (pressure gradients ~ 1/R, sound-crossing time ~ R/c_s):
        # tau_acc is the value for a central Pb-Pb fireball (R_ref = 6.5 fm), scaled by (R_0/R_ref)^1.5 for
        # smaller systems; the exponent is empirical, chosen so peripheral Pb-Pb (60-70%) reaches the measured
        # <beta_T> before its early freeze-out (see docs/validation.md)
        self.tau_acc = float(tau_acc) * max(self.R_0 / 6.5, 0.2) ** 1.5
        self.snap_tau = None; self.snap_s = None; self.snap_v = None; self.snap_R = None
        self.diffusion = 0.0

    # ---------- initial state ----------
    def _thickness(self, xy, w, k):
        T = np.zeros_like(self.X)
        wts = self.rng.gamma(k, 1.0 / k, size=len(xy))
        for (x0, y0), g in zip(xy, wts):
            T += g * np.exp(-((self.X - x0) ** 2 + (self.Y - y0) ** 2) / (2 * w * w)) / (2 * np.pi * w * w)
        return T

    def _initial_entropy(self, p, w, k):
        if self._initial_TR is not None:
            TR = self._initial_TR          # externally supplied T_R (e.g. a TRENTo event file), already on this grid
        else:
            TR = trento_reduced_thickness(self.ev, self.X, self.Y, p, w, k, self.rng)
        norm = self.dS_deta / max(self.tau_0 * TR.sum() * self.dx**2, 1e-30)
        return norm * TR

    def f_eta(self, eta_s):
        eta_s = np.asarray(eta_s, float)
        return np.where(np.abs(eta_s) < self.y_beam, np.exp(-eta_s**2 / (2 * self.sigma_eta**2)), 0.0)

    # ---------- flow field ----------
    def v_s(self, tau):
        return self.beta_s * np.tanh(max(tau - self.tau_0, 0.0) / self.tau_acc)

    def _edge_radius(self, s):
        """Flow radius R from the current entropy field, defined so that the entropy-weighted mean of
        (r/R)^n equals the blast-wave uniform-disk value 2/(2+n): then the entropy-weighted mean flow
        velocity is exactly <beta_T> * v_s(tau)/beta_s, i.e. the measured <beta_T> once v_s saturates."""
        tot = s.sum()
        if tot <= 0:
            return self.R_0
        rn = (s * self.R_grid**self.n_prof).sum() / tot
        return float((rn * (2.0 + self.n_prof) / 2.0) ** (1.0 / self.n_prof))

    def _field_ecc(self, s):
        """Spatial eccentricities eps_2, eps_3 and angles Psi_2, Psi_3 of the entropy field
        (r^n weighting, Psi_n pointing along the short axis as in glauber.eccentricities)."""
        tot = s.sum()
        if tot <= 0:
            return np.zeros(2), np.zeros(2)
        cx = (s * self.X).sum() / tot; cy = (s * self.Y).sum() / tot
        x = self.X - cx; y = self.Y - cy; r = np.hypot(x, y); phi = np.arctan2(y, x)
        eps = np.zeros(2); psi = np.zeros(2)
        for i, n in enumerate((2, 3)):
            rn = r**n
            cn = (s * rn * np.cos(n * phi)).sum() / tot; sn = (s * rn * np.sin(n * phi)).sum() / tot
            eps[i] = np.sqrt(cn**2 + sn**2) / max((s * rn).sum() / tot, 1e-30)
            psi[i] = (np.arctan2(sn, cn) + np.pi) / n
        return eps, psi

    def radius(self, tau):
        """Flow radius R(tau) from the stored evolution (interpolated); R_0 before tau_0."""
        if self.snap_tau is None or tau <= self.tau_0:
            return self.R_0
        return float(np.interp(tau, self.snap_tau, self.snap_R))

    def ecc_at(self, tau):
        if self.snap_tau is None or (np.isscalar(tau) and tau <= self.tau_0):
            return self.ecc_0, self.psi_0
        tau = np.asarray(tau, float)
        eps = np.stack([np.interp(tau, self.snap_tau, self.snap_eps[:, i]) for i in range(2)], axis=-1)
        # interpolate angles via unit vectors of n*psi
        psi = np.stack([np.arctan2(np.interp(tau, self.snap_tau, np.sin(n * self.snap_psi[:, i])),
                                   np.interp(tau, self.snap_tau, np.cos(n * self.snap_psi[:, i]))) / n
                        for i, n in enumerate((2, 3))], axis=-1)
        return eps, psi

    def _R_phi(self, R, eps, psi, phi):
        """Anisotropic flow radius: R(phi) = R [1 - (eps_2/2) cos 2(phi-Psi_2) - (eps_3/2) cos 3(phi-Psi_3)]
        (for a uniform ellipse eps_2 = (b^2-a^2)/(a^2+b^2) gives semi-axes R(1 -/+ eps_2/2) to first order).
        A fluid element at the same fractional radius r/R(phi) gets the same velocity on the long and short
        axes, so the geometry alone gives v_n ~ 0; the pressure-gradient response is added by the a_n modulation."""
        eps = np.asarray(eps); psi = np.asarray(psi)
        return R * (1.0 - 0.5 * eps[..., 0] * np.cos(2 * (phi - psi[..., 0])) - 0.5 * eps[..., 1] * np.cos(3 * (phi - psi[..., 1])))

    def _modulate(self, vmag, phi):
        if not any(self.a_n.values()):
            return vmag
        mod = 1.0 + sum(2 * a * np.cos(n * (phi - self.psi_n[n])) for n, a in self.a_n.items())
        return np.tanh(np.arctanh(np.minimum(vmag, 0.99)) * np.clip(mod, 0.05, 3.0))

    def velocity(self, tau, X=None, Y=None, R=None, ecc=None):
        """Flow velocity at scalar proper time tau on points X, Y."""
        X = self.X if X is None else X; Y = self.Y if Y is None else Y
        r = np.hypot(X, Y); phi = np.arctan2(Y, X)
        R = self.radius(tau) if R is None else R
        eps, psi = self.ecc_at(tau) if ecc is None else ecc
        Rphi = self._R_phi(R, eps, psi, phi)
        vmag = self._modulate(self.v_s(tau) * np.minimum(r / Rphi, 1.0) ** self.n_prof, phi)
        with np.errstate(invalid="ignore", divide="ignore"):
            ux = np.where(r > 0, X / r, 0.0); uy = np.where(r > 0, Y / r, 0.0)
        return vmag * ux, vmag * uy

    def flow_at(self, tau, x, y):
        """Flow velocity for per-particle proper times tau (array) at positions x, y (arrays)."""
        tau = np.asarray(tau, float)
        R = np.interp(tau, self.snap_tau, self.snap_R)
        eps, psi = self.ecc_at(tau)
        r = np.hypot(x, y); phi = np.arctan2(y, x)
        Rphi = self._R_phi(R, eps, psi, phi)
        vs = self.beta_s * np.tanh(np.maximum(tau - self.tau_0, 0.0) / self.tau_acc)
        vmag = self._modulate(vs * np.minimum(r / Rphi, 1.0) ** self.n_prof, phi)
        with np.errstate(invalid="ignore", divide="ignore"):
            ux = np.where(r > 0, x / r, 0.0); uy = np.where(r > 0, y / r, 0.0)
        return vmag * ux, vmag * uy

    # ---------- evolution ----------
    def evolve(self, tau_end=25.0, dtau=0.02, snap_every=0.1, diffusion=0.15):
        """Upwind finite-volume advection of q = tau * s * gamma, plus an explicit diffusion term
        D (fm^2 per fm/c, default 0.15 ~ c_s^2 * tau_pi) that mimics the acoustic/viscous smoothing of
        sub-fm hot spots in hydrodynamics (Bjorken cooling and entropy conservation are unaffected).
        Stores snapshots of s, v, R and the field eccentricities."""
        n = self.n; dx = self.dx
        self.diffusion = float(diffusion)
        R = self.R_0; ecc = (self.ecc_0, self.psi_0)
        vx, vy = self.velocity(self.tau_0, R=R, ecc=ecc)
        gam = 1.0 / np.sqrt(1.0 - vx**2 - vy**2)
        q = self.tau_0 * self.s0 * gam
        tau = self.tau_0
        taus, ss, vs, Rs, es, ps = [], [], [], [], [], []
        next_snap = self.tau_0
        cfl = 0.9 * dx / max(self.beta_s, 1e-3)
        dtau = min(dtau, cfl)
        while tau <= tau_end + 1e-9:
            s_now = q / (tau * gam)
            R = self._edge_radius(s_now); ecc = self._field_ecc(s_now)
            vx, vy = self.velocity(tau, R=R, ecc=ecc)
            gam = 1.0 / np.sqrt(1.0 - vx**2 - vy**2)
            if tau >= next_snap - 1e-9:
                taus.append(tau); ss.append(s_now.astype(np.float32))
                vs.append(np.stack([vx, vy]).astype(np.float32)); Rs.append(R); es.append(ecc[0]); ps.append(ecc[1])
                next_snap += snap_every
            # fluxes (first-order upwind, donor cell); velocities at cell faces
            fx = 0.5 * (vx[:-1, :] + vx[1:, :]); fy = 0.5 * (vy[:, :-1] + vy[:, 1:])
            Fx = np.where(fx > 0, q[:-1, :] * fx, q[1:, :] * fx)
            Fy = np.where(fy > 0, q[:, :-1] * fy, q[:, 1:] * fy)
            dq = np.zeros_like(q)
            dq[:-1, :] -= Fx; dq[1:, :] += Fx
            dq[:, :-1] -= Fy; dq[:, 1:] += Fy
            if diffusion > 0:
                lap = np.zeros_like(q)
                lap[1:-1, 1:-1] = (q[2:, 1:-1] + q[:-2, 1:-1] + q[1:-1, 2:] + q[1:-1, :-2] - 4 * q[1:-1, 1:-1]) / (dx * dx)
                dq += diffusion * lap * dx
            q = q + dtau * dq / dx
            q[0, :] = q[-1, :] = q[:, 0] = q[:, -1] = 0.0   # open boundary: matter leaving the box is dropped
            tau += dtau
        self.snap_tau = np.array(taus); self.snap_s = np.array(ss); self.snap_v = np.array(vs); self.snap_R = np.array(Rs)
        self.snap_eps = np.array(es); self.snap_psi = np.array(ps)
        return self

    # ---------- queries ----------
    def s2d(self, tau):
        """Transverse entropy density (fm^-3, per unit eta_s at eta_s=0) at proper time tau (interpolated)."""
        if tau <= self.tau_0:
            return self.s0 * (self.tau_0 / max(tau, 0.05))       # pre-equilibrium: free-streaming dilution
        i = np.searchsorted(self.snap_tau, tau)
        if i >= len(self.snap_tau):
            return self.snap_s[-1] * (self.snap_tau[-1] / tau)
        i = max(i, 1); w = (tau - self.snap_tau[i - 1]) / (self.snap_tau[i] - self.snap_tau[i - 1])
        return (1 - w) * self.snap_s[i - 1] + w * self.snap_s[i]

    def temperature_3d(self, t, z, X=None, Y=None):
        """T(x, y, z) in MeV at lab time t for a set of z-planes (array); returns (nz, nx, ny)."""
        X = self.X if X is None else X; Y = self.Y if Y is None else Y
        z = np.asarray(z, float)
        out = np.zeros((len(z),) + X.shape, np.float32)
        if t <= 0:
            return out
        for iz, zz in enumerate(z):
            if abs(zz) >= t:
                continue
            tau = np.sqrt(t * t - zz * zz); eta = np.arctanh(zz / t)
            fe = float(self.f_eta(eta))
            if fe <= 0:
                continue
            s = self.s2d(tau)
            if X is not self.X:
                s = self._interp_grid(s, X, Y)
            out[iz] = T_of_s(fe * s)
        return out

    def _interp_grid(self, s, X, Y):
        ix = np.clip(((X + self.L) / self.dx - 0.5), 0, self.n - 1); iy = np.clip(((Y + self.L) / self.dx - 0.5), 0, self.n - 1)
        i0 = np.floor(ix).astype(int); j0 = np.floor(iy).astype(int)
        i1 = np.minimum(i0 + 1, self.n - 1); j1 = np.minimum(j0 + 1, self.n - 1)
        fx = ix - i0; fy = iy - j0
        return ((1 - fx) * (1 - fy) * s[i0, j0] + fx * (1 - fy) * s[i1, j0] + (1 - fx) * fy * s[i0, j1] + fx * fy * s[i1, j1])

    def sample_points(self, s, xy):
        """Bilinear sample of a grid field at points xy (N,2)."""
        return self._interp_grid(s, xy[:, 0], xy[:, 1])

    def T_max(self, tau):
        return float(T_of_s(self.s2d(tau)).max())

    def hot_fraction(self, tau, T_thr=None):
        """Fraction of the midrapidity entropy at temperature above T_thr (default T_c)."""
        T_thr = self.T_c if T_thr is None else T_thr
        s = self.s2d(tau); tot = s.sum()
        if tot <= 0:
            return 0.0
        return float((s * (T_of_s(s) > T_thr)).sum() / tot)

    def qgp_end(self, frac=0.1):
        """Proper time when less than `frac` of the entropy is still above T_c."""
        for tau in self.snap_tau:
            if self.hot_fraction(tau) < frac:
                return float(tau)
        return float(self.snap_tau[-1])
