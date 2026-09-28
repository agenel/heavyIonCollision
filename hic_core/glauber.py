"""Monte Carlo Glauber model (PHOBOS TGlauberMC procedure, arXiv:1408.2549; LKD18 arXiv:1710.07098).

Coordinates: beam along z; impact parameter along x; nucleus A shifted by -b/2, B by +b/2.
"""
import json, os
from dataclasses import dataclass, field
import numpy as np
from . import nuclei, kinematics
from .special import gammainc_upper_reg

_DATA = os.path.join(os.path.dirname(__file__), "data")
with open(os.path.join(_DATA, "centrality_tables.json")) as f:
    CENTRALITY_TABLES = {k: v for k, v in json.load(f).items() if not k.startswith("_")}

_B_CALIB_CACHE = {}


def system_key(A, B, sqrt_snn):
    a = nuclei.resolve(A); b = nuclei.resolve(B)
    short = {"Pb208": "Pb", "Au197": "Au", "Xe129": "Xe", "Cu63": "Cu", "U238": "U", "Ru96": "Ru",
             "Zr96": "Zr", "O16": "O", "Ne20": "Ne", "He3": "He3", "d": "d", "p": "p"}
    return f"{short.get(a, a)}{short.get(b, b)}_{int(round(sqrt_snn))}"


@dataclass
class GlauberEvent:
    A: str
    B: str
    sqrt_snn: float
    b: float
    sigma_nn_mb: float
    posA: np.ndarray            # (NA,3) fm, in the transverse plane after shift (z = rest-frame z)
    posB: np.ndarray
    isprotonA: np.ndarray
    isprotonB: np.ndarray
    ncoll_A: np.ndarray         # collisions per nucleon of A
    ncoll_B: np.ndarray
    pairs: np.ndarray           # (Ncoll, 2) indices (iA, iB) of colliding pairs
    npart: int = 0
    ncoll: int = 0
    eps: dict = field(default_factory=dict)   # {2: eps2, 3: eps3, 4: eps4}
    psi: dict = field(default_factory=dict)
    area_fm2: float = 0.0
    meta: dict = field(default_factory=dict)

    @property
    def partA(self):
        return self.ncoll_A > 0

    @property
    def partB(self):
        return self.ncoll_B > 0

    @property
    def participants_xy(self):
        return np.vstack([self.posA[self.partA][:, :2], self.posB[self.partB][:, :2]])

    @property
    def n_spectators(self):
        return int((~self.partA).sum() + (~self.partB).sum())


def sample_b(rng, b_max):
    """dN/db ∝ b on [0, b_max]."""
    return float(b_max * np.sqrt(rng.uniform()))


def eccentricities(xy, orders=(2, 3, 4, 5)):
    """Participant-plane eccentricities eps_n and angles Psi_n.
    eps_n = |<r^n exp(i n phi)>| / <r^n> (r^n weighting, the TGlauberMC/LKD18 convention; verified to
    reproduce LKD18 Tables X and XX. Alver & Roland arXiv:1003.0194 used r^2 weighting for eps_3, which
    gives ~20% smaller eps_3)."""
    if len(xy) < 2:
        return {n: 0.0 for n in orders}, {n: 0.0 for n in orders}
    c = xy - xy.mean(axis=0)
    r = np.hypot(c[:, 0], c[:, 1]); phi = np.arctan2(c[:, 1], c[:, 0])
    eps, psi = {}, {}
    for n in orders:
        rn = r**n
        cn = np.mean(rn * np.cos(n * phi)); sn = np.mean(rn * np.sin(n * phi))
        eps[n] = float(np.sqrt(cn**2 + sn**2) / np.mean(rn))
        psi[n] = float((np.arctan2(sn, cn) + np.pi) / n)
    return eps, psi


def overlap_area(xy):
    """Transverse overlap area S = 4 pi sqrt(sx^2 sy^2 - sxy^2) (PHOBOS TGlauberMC convention)."""
    if len(xy) < 3:
        return 0.0
    c = xy - xy.mean(axis=0)
    sx2 = np.mean(c[:, 0]**2); sy2 = np.mean(c[:, 1]**2); sxy = np.mean(c[:, 0] * c[:, 1])
    return float(4 * np.pi * np.sqrt(max(sx2 * sy2 - sxy**2, 0.0)))


def collide(posA, posB, sigma_nn_mb, rng, profile="disk", omega=0.4):
    """Return (ncoll_A, ncoll_B, pairs) for the black-disk or Gaussian (omega) NN profile."""
    D2 = kinematics.black_disk_diameter_fm(sigma_nn_mb) ** 2
    dx = posA[:, 0, None] - posB[None, :, 0]
    dy = posA[:, 1, None] - posB[None, :, 1]
    d2 = dx * dx + dy * dy
    if profile == "disk" or omega <= 0:
        hit = d2 < D2
    else:
        p = gammainc_upper_reg(1.0 / omega, d2 / (D2 * omega))
        hit = rng.uniform(size=d2.shape) < p
    pairs = np.argwhere(hit)
    return hit.sum(axis=1), hit.sum(axis=0), pairs


def run_event(A="Pb", B="Pb", sqrt_snn=5020.0, b=None, centrality=None, rng=None, d_min=0.4,
              sigma_nn_mb=None, profile="disk", omega=0.4, neutron_skin=True, orientation="random",
              require_inelastic=True, max_attempts=1000):
    """One Glauber event. Give either b (fm) or centrality=(c_lo, c_hi) in percent; if neither,
    b is drawn from dN/db ∝ b up to b_max and require_inelastic ensures N_coll >= 1."""
    rng = np.random.default_rng() if rng is None else rng
    sig = kinematics.sigma_nn_inel_mb(sqrt_snn) if sigma_nn_mb is None else sigma_nn_mb
    RA = nuclei.params(A).get("R", 1.0); RB = nuclei.params(B).get("R", 1.0)
    b_max = 1.2 * (RA + RB) + 6.0
    for _ in range(max_attempts):
        if b is not None:
            bb = float(b)
        elif centrality is not None:
            lo, hi = centrality_to_b_range(A, B, sqrt_snn, centrality[0], centrality[1], rng=rng,
                                           d_min=d_min, sigma_nn_mb=sig, profile=profile, omega=omega)
            bb = float(np.sqrt(rng.uniform(lo**2, hi**2)))
        else:
            bb = sample_b(rng, b_max)
        pA, ipA = nuclei.sample_nucleus(A, rng, d_min=d_min, neutron_skin=neutron_skin, orientation=orientation)
        pB, ipB = nuclei.sample_nucleus(B, rng, d_min=d_min, neutron_skin=neutron_skin, orientation=orientation)
        pA = pA.copy(); pB = pB.copy()
        pA[:, 0] -= bb / 2; pB[:, 0] += bb / 2
        nA, nB, pairs = collide(pA, pB, sig, rng, profile, omega)
        if len(pairs) > 0 or not require_inelastic or b is not None:
            break
    ev = GlauberEvent(A=nuclei.resolve(A), B=nuclei.resolve(B), sqrt_snn=sqrt_snn, b=bb, sigma_nn_mb=sig,
                      posA=pA, posB=pB, isprotonA=ipA, isprotonB=ipB, ncoll_A=nA, ncoll_B=nB, pairs=pairs)
    ev.npart = int((nA > 0).sum() + (nB > 0).sum()); ev.ncoll = int(len(pairs))
    ev.eps, ev.psi = eccentricities(ev.participants_xy)
    ev.area_fm2 = overlap_area(ev.participants_xy)
    ev.meta = dict(gamma=float(kinematics.gamma(sqrt_snn)), y_beam=float(kinematics.y_beam(sqrt_snn)),
                   profile=profile, omega=omega, d_min=d_min)
    return ev


def calibrate_b(A, B, sqrt_snn, rng=None, n_events=1500, d_min=0.4, sigma_nn_mb=None, profile="disk", omega=0.4):
    """Sample b ∝ b up to b_max, keep inelastic events, return sorted b of inelastic events and sigma_AB (b)."""
    rng = np.random.default_rng(12345) if rng is None else rng
    sig = kinematics.sigma_nn_inel_mb(sqrt_snn) if sigma_nn_mb is None else sigma_nn_mb
    RA = nuclei.params(A).get("R", 1.0); RB = nuclei.params(B).get("R", 1.0)
    b_max = 1.2 * (RA + RB) + 6.0
    bs = []
    for _ in range(n_events):
        bb = sample_b(rng, b_max)
        pA, _ = nuclei.sample_nucleus(A, rng, d_min=d_min); pB, _ = nuclei.sample_nucleus(B, rng, d_min=d_min)
        pA[:, 0] -= bb / 2; pB[:, 0] += bb / 2
        _, _, pairs = collide(pA, pB, sig, rng, profile, omega)
        if len(pairs) > 0:
            bs.append(bb)
    bs = np.sort(np.array(bs))
    sigma_AB_fm2 = np.pi * b_max**2 * len(bs) / n_events
    return bs, sigma_AB_fm2 / 100.0   # fm^2 -> barn (1 b = 100 fm^2)


def centrality_to_b_range(A, B, sqrt_snn, c_lo, c_hi, rng=None, use_table=True, **kw):
    """b range (fm) for a centrality class [c_lo, c_hi] in percent of the hadronic cross section.
    Uses the LKD18 tables for Pb-Pb 5.02 TeV and Au-Au 200 GeV when the class matches a table bin,
    otherwise a cached geometric Glauber calibration (percentiles of b among inelastic events)."""
    key = system_key(A, B, sqrt_snn)
    if use_table and key in CENTRALITY_TABLES:
        for row in CENTRALITY_TABLES[key]["bins"]:
            if row["c"][0] == c_lo and row["c"][1] == c_hi:
                return tuple(row["b"])
    ck = (key, kw.get("profile", "disk"), kw.get("omega", 0.4), kw.get("d_min", 0.4))
    if ck not in _B_CALIB_CACHE:
        _B_CALIB_CACHE[ck] = calibrate_b(A, B, sqrt_snn, rng=np.random.default_rng(777), **kw)
    bs, _ = _B_CALIB_CACHE[ck]
    lo = float(np.quantile(bs, c_lo / 100.0)) if c_lo > 0 else 0.0
    hi = float(np.quantile(bs, min(c_hi, 100) / 100.0))
    return lo, hi


def centrality_of_b(A, B, sqrt_snn, b, **kw):
    """Centrality (percent) of an event with impact parameter b: the fraction of the inelastic cross section
    with smaller b. Tabled systems (LKD18) interpolate linearly in b^2 inside each bin (exact where
    dsigma/db ∝ b); other systems use the cached geometric Glauber calibration (randomly oriented nuclei,
    as in an experiment's centrality selection). Returns 100 beyond the most peripheral inelastic event."""
    key = system_key(A, B, sqrt_snn)
    tab = CENTRALITY_TABLES.get(key)
    if tab:
        for row in tab["bins"]:
            b0, b1 = row["b"]
            if b0 <= b <= b1:
                f = (b * b - b0 * b0) / max(b1 * b1 - b0 * b0, 1e-12)
                return float(row["c"][0] + f * (row["c"][1] - row["c"][0]))
        if b < tab["bins"][0]["b"][0]:
            return 0.0
    ck = (key, kw.get("profile", "disk"), kw.get("omega", 0.4), kw.get("d_min", 0.4))
    if ck not in _B_CALIB_CACHE:
        _B_CALIB_CACHE[ck] = calibrate_b(A, B, sqrt_snn, rng=np.random.default_rng(777), **kw)
    bs, _ = _B_CALIB_CACHE[ck]
    return float(100.0 * np.searchsorted(bs, b) / len(bs))


def table_row(A, B, sqrt_snn, c_lo, c_hi):
    key = system_key(A, B, sqrt_snn)
    for row in CENTRALITY_TABLES.get(key, {}).get("bins", []):
        if row["c"][0] == c_lo and row["c"][1] == c_hi:
            return row
    return None
