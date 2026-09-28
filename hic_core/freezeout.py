"""Hadron species composition and Cooper-Frye-like momentum sampling at kinetic freeze-out.

- Species fractions from measured dN/dy tables (yields.json); neutral partners from isospin.
- Momenta: in the local rest frame sample d^3p with weight E exp(-E/T_kin) (Cooper-Frye on an
  isochronous surface, Boltzmann statistics), then boost by the local transverse flow velocity and the
  longitudinal rapidity eta_s (Bjorken). This is the Schnedermann-Sollfrank-Heinz blast wave
  (PRC 48 (1993) 2462) evaluated by Monte Carlo.
- Anisotropic flow: the flow velocity magnitude is modulated by (1 + 2 sum a_n cos n(phi - Psi_n)); the
  amplitudes a_n are calibrated iteratively so that the charged-particle v_n{2} in the ALICE acceptance
  (|eta| < 0.8, 0.2 < pT < 5 GeV/c) match the target values.
"""
import json, os
import numpy as np
from .constants import MASS, CHARGE

_DATA = os.path.join(os.path.dirname(__file__), "data")
with open(os.path.join(_DATA, "yields.json")) as f:
    YIELDS = {k: v for k, v in json.load(f).items() if not k.startswith("_")}
with open(os.path.join(_DATA, "multiplicity.json")) as f:
    MULT = {k: v for k, v in json.load(f).items() if not k.startswith("_")}
with open(os.path.join(_DATA, "flow.json")) as f:
    FLOW = {k: v for k, v in json.load(f).items() if not k.startswith("_")}

SPECIES = ["pi+", "pi-", "pi0", "K+", "K-", "K0", "p", "pbar", "n", "nbar", "Lambda", "Lambdabar",
           "Xi-", "Xibar+", "Omega-", "Omegabar+", "phi", "d", "dbar"]
SPECIES_ID = {s: i for i, s in enumerate(SPECIES)}
_MASS = {**MASS, "Lambdabar": MASS["Lambda"], "Xibar+": MASS["Xi-"], "Omegabar+": MASS["Omega-"], "dbar": MASS["d"]}
_CHARGE = {**CHARGE, "Lambdabar": 0, "Xibar+": 1, "Omegabar+": 1, "dbar": -1}
MASS_ARR = np.array([_MASS[s] for s in SPECIES])
CHARGE_ARR = np.array([_CHARGE[s] for s in SPECIES])
BARYON_ARR = np.array([0, 0, 0, 0, 0, 0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0, 2, -2])
STRANGE_ARR = np.array([0, 0, 0, 1, -1, 0, 0, 0, 0, 0, -1, 1, -2, 2, -3, 3, 0, 0, 0])

# antibaryon/baryon ratio pbar/p vs sqrt(s_NN): 200 GeV 0.77, 62.4 GeV 0.47 (STAR 0808.2041);
# LHC ~1 (ALICE); lower BES energies approximate (STAR BES-I PRC 96 044904 order of magnitude) [flagged]
_PBAR_P = {"7.7": 0.01, "11.5": 0.03, "19.6": 0.11, "27": 0.18, "39": 0.30, "62.4": 0.47, "130": 0.71, "200": 0.77, "2760": 1.0, "5020": 1.0, "5360": 1.0, "5440": 1.0}


def pbar_over_p(sqrt_snn):
    e = np.array([float(k) for k in _PBAR_P]); r = np.array(list(_PBAR_P.values()))
    o = np.argsort(e)
    return float(np.interp(np.log(sqrt_snn), np.log(e[o]), r[o]))


def _closest_key(table, A, B, sqrt_snn):
    """Pick the best available reference system: same nuclei+energy, else same energy, else Pb-Pb/Au-Au by energy."""
    from .glauber import system_key
    key = system_key(A, B, sqrt_snn)
    if key in table:
        return key
    e = int(round(sqrt_snn))
    for k in table:
        if k.endswith(f"_{e}"):
            return k
    return "PbPb_5020" if sqrt_snn > 1000 else "AuAu_200"


def _interp_cent(xs, ys, c, log=True):
    xs = np.asarray(xs, float); ys = np.asarray(ys, float)
    if log:
        return float(np.exp(np.interp(c, xs, np.log(np.maximum(ys, 1e-12)))))
    return float(np.interp(c, xs, ys))


def dNch_deta_mid(A, B, sqrt_snn, c_mid, npart=None, npart_ref=None):
    """Measured dN_ch/deta at midrapidity for the centrality midpoint. For systems without a table the
    Pb-Pb (LHC) or Au-Au (RHIC) value at the same centrality is scaled by N_part (wounded-nucleon scaling)."""
    key = _closest_key(MULT, A, B, sqrt_snn)
    tab = MULT[key]
    val = _interp_cent(tab["centrality_mid"], tab["dNch_deta"], c_mid)
    from .glauber import system_key
    if key != system_key(A, B, sqrt_snn) and npart is not None and npart_ref:
        val *= npart / npart_ref
    return val, key


def blastwave_params(A, B, sqrt_snn, c_mid):
    key = _closest_key(YIELDS, A, B, sqrt_snn); bw = YIELDS[key]["blastwave"]
    return dict(beta_T=_interp_cent(bw["centrality_mid"], bw["beta_T"], c_mid, log=False),
                T_kin_MeV=_interp_cent(bw["centrality_mid"], bw["T_kin_MeV"], c_mid, log=False),
                n=_interp_cent(bw["centrality_mid"], bw["n"], c_mid, log=False), source=key)


def flow_targets(A, B, sqrt_snn, c_mid, eps=None):
    """Target v2, v3, v4. Uses the measured table when the system has one; otherwise scales the reference
    system's v_n by eps_n/eps_n(ref) (linear response)."""
    key = _closest_key(FLOW, A, B, sqrt_snn); tab = FLOW[key]
    v = {n: _interp_cent(tab["centrality_mid"], tab[f"v{n}"], c_mid, log=False) for n in (2, 3, 4)}
    return v, key


def species_fractions(A, B, sqrt_snn, c_mid):
    """Relative multiplicities of SPECIES at midrapidity (sum = 1) and the charged fraction."""
    key = _closest_key(YIELDS, A, B, sqrt_snn); Y = YIELDS[key]; cm = Y["centrality_mid"]
    g = lambda s: _interp_cent(cm, Y[s], c_mid) if s in Y else None
    pip = g("pi+"); pim = g("pi-") or pip
    kp = g("K+"); km = g("K-") or kp
    p = g("p"); r = pbar_over_p(sqrt_snn); pbar = g("pbar") or p * r
    lam = Y["Lambda_over_pi"] * pip; lamb = lam * r ** (2.0 / 3.0)
    xi = g("Xi-"); xib = xi * r ** (1.0 / 3.0)
    om = g("Omega-"); omb = om * r ** 0.0   # Omega+/Omega- ~ 1 already at RHIC
    phi = g("phi"); d = g("d"); db = d * r**2
    n = {"pi+": pip, "pi-": pim, "pi0": 0.5 * (pip + pim), "K+": kp, "K-": km, "K0": kp + km,
         "p": p, "pbar": pbar, "n": p, "nbar": pbar, "Lambda": lam, "Lambdabar": lamb,
         "Xi-": xi, "Xibar+": xib, "Omega-": om, "Omegabar+": omb, "phi": phi, "d": d, "dbar": db}
    arr = np.array([n[s] for s in SPECIES]); frac = arr / arr.sum()
    charged = frac[CHARGE_ARR != 0].sum()
    return frac, float(charged), key


# ---------- momentum sampling ----------
def sample_lrf_momentum(mass, T_gev, rng):
    """|p| for N particles of given masses (array) with weight p^2 E exp(-E/T) d p (Cooper-Frye on an
    isochronous surface, Boltzmann statistics). Sampled in energy: f(E) dE = E sqrt(E^2-m^2) e^{-E/T} dE
    with envelope g(E) = E^2 e^{-E/T} on E >= m, i.e. K = E - m from the mixture
    m^2 T Gamma(1) + 2 m T^2 Gamma(2) + 2 T^3 Gamma(3); accept with probability p/E <= 1."""
    N = len(mass)
    out = np.empty(N)
    todo = np.arange(N)
    while todo.size:
        m = mass[todo]; n = todo.size
        w = np.column_stack([m * m * T_gev, 2 * m * T_gev**2, np.full(n, 2 * T_gev**3)])
        w /= w.sum(axis=1, keepdims=True)
        u = rng.uniform(size=n); comp = (u > w[:, 0]).astype(int) + (u > w[:, 0] + w[:, 1]).astype(int)
        K = np.where(comp == 0, rng.gamma(1.0, T_gev, n), np.where(comp == 1, rng.gamma(2.0, T_gev, n), rng.gamma(3.0, T_gev, n)))
        E = m + K; p = np.sqrt(np.maximum(E * E - m * m, 0.0))
        acc = rng.uniform(size=n) < p / E
        out[todo[acc]] = p[acc]; todo = todo[~acc]
    return out


def isotropic_dirs(N, rng):
    c = rng.uniform(-1, 1, N); ph = rng.uniform(0, 2 * np.pi, N); s = np.sqrt(1 - c * c)
    return np.stack([s * np.cos(ph), s * np.sin(ph), c], axis=1)


def boost(p4, beta):
    """Lorentz boost of 4-momenta p4 (N,4)=(E,px,py,pz) by velocity beta (N,3) (frame moving with +beta)."""
    b2 = (beta**2).sum(axis=1); g = 1.0 / np.sqrt(np.maximum(1 - b2, 1e-12))
    bp = (beta * p4[:, 1:]).sum(axis=1)
    E = g * (p4[:, 0] + bp)
    coef = np.where(b2 > 0, (g - 1) * bp / np.maximum(b2, 1e-30), 0.0) + g * p4[:, 0]
    p = p4[:, 1:] + coef[:, None] * beta
    return np.column_stack([E, p])


def emit(mass, T_kin_mev, vT, eta_s, rng):
    """Thermal emission: mass (N,), T_kin (MeV), vT (N,2) transverse flow velocity, eta_s (N,) -> p4 (N,4)."""
    T = T_kin_mev / 1000.0
    pmag = sample_lrf_momentum(mass, T, rng)
    dirs = isotropic_dirs(len(mass), rng)
    p = pmag[:, None] * dirs; E = np.sqrt(pmag**2 + mass**2)
    p4 = np.column_stack([E, p])
    p4 = boost(p4, np.column_stack([vT, np.zeros(len(mass))]))
    p4 = boost(p4, np.column_stack([np.zeros((len(mass), 2)), np.tanh(eta_s)]))
    return p4


def vn_observed(p4, charge, psi, n, eta_cut=0.8, pt_range=(0.2, 5.0)):
    pt = np.hypot(p4[:, 1], p4[:, 2]); pz = p4[:, 3]; pm = np.sqrt(pt**2 + pz**2)
    eta = np.arctanh(np.clip(pz / np.maximum(pm, 1e-12), -0.999999, 0.999999))
    sel = (charge != 0) & (np.abs(eta) < eta_cut) & (pt > pt_range[0]) & (pt < pt_range[1])
    if sel.sum() < 10:
        return 0.0
    phi = np.arctan2(p4[sel, 2], p4[sel, 1])
    return float(np.mean(np.cos(n * (phi - psi))))
