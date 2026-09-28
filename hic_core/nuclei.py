"""Nucleon position samplers for the Glauber Monte Carlo.

Woods-Saxon (2pF/3pF) with optional axial deformation (beta2, beta4), Hulthen
deuteron, Gaussian He-3 approximation, and a point proton. Follows the PHOBOS
TGlauberMC procedure (arXiv:1408.2549): sample r from 4 pi r^2 rho(r), reject a
nucleon closer than d_min to an already placed one, recentre to the centre of
mass, and rotate deformed nuclei by a uniformly random orientation.
"""
import json, os
import numpy as np

_DATA = os.path.join(os.path.dirname(__file__), "data")
with open(os.path.join(_DATA, "nuclei.json")) as f:
    TABLE = {k: v for k, v in json.load(f).items() if not k.startswith("_")}

ALIASES = {"Pb": "Pb208", "Au": "Au197", "Xe": "Xe129", "Cu": "Cu63", "U": "U238", "Ru": "Ru96",
           "Zr": "Zr96", "O": "O16", "Ne": "Ne20", "He3": "He3", "d": "d", "p": "p"}


def resolve(name):
    return ALIASES.get(name, name)


def params(name):
    return dict(TABLE[resolve(name)])


def _y20(cos_t):
    return np.sqrt(5.0 / (16.0 * np.pi)) * (3.0 * cos_t**2 - 1.0)


def _y40(cos_t):
    return (3.0 / (16.0 * np.sqrt(np.pi))) * (35.0 * cos_t**4 - 30.0 * cos_t**2 + 3.0)


def woods_saxon(r, cos_t, R, a, w=0.0, beta2=0.0, beta4=0.0):
    """rho(r, theta)/rho0 for the (deformed) 2pF/3pF profile."""
    R_th = R * (1.0 + beta2 * _y20(cos_t) + beta4 * _y40(cos_t))
    return (1.0 + w * (r / R) ** 2) / (1.0 + np.exp((r - R_th) / a))


def _random_rotation(rng):
    """Uniform random rotation matrix (via random unit quaternion)."""
    q = rng.normal(size=4); q /= np.linalg.norm(q)
    w, x, y, z = q
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ])


def _sample_ws_positions(n, rng, R, a, w, beta2, beta4, d_min, max_tries=10000):
    r_max = R * (1.0 + abs(beta2) * 0.7 + abs(beta4) * 0.4) + 10.0 * a
    # envelope for rejection sampling: max of r^2 rho over a grid
    rg = np.linspace(0, r_max, 400); cg = np.linspace(-1, 1, 41)
    RR, CC = np.meshgrid(rg, cg, indexing="ij")
    f_max = (RR**2 * woods_saxon(RR, CC, R, a, w, beta2, beta4)).max() * 1.05
    pos = np.empty((n, 3))
    k = 0
    tries = 0
    while k < n:
        tries += 1
        if tries > max_tries * n:
            raise RuntimeError("nucleon placement failed; reduce d_min")
        m = 64
        r = rng.uniform(0, r_max, m); c = rng.uniform(-1, 1, m); u = rng.uniform(0, f_max, m)
        acc = u < r**2 * woods_saxon(r, c, R, a, w, beta2, beta4)
        if not acc.any():
            continue
        r, c = r[acc][0], c[acc][0]
        phi = rng.uniform(0, 2 * np.pi); s = np.sqrt(1 - c * c)
        p = np.array([r * s * np.cos(phi), r * s * np.sin(phi), r * c])
        if k > 0 and d_min > 0:
            if np.min(np.linalg.norm(pos[:k] - p, axis=1)) < d_min:
                continue
        pos[k] = p; k += 1
    return pos


ORIENTATIONS = ("random", "tip-tip", "body-body", "body-body-x")


def orientation_matrix(orientation, rng=None):
    """Rotation applied to a nucleus whose symmetry axis is along z (None = identity)."""
    if isinstance(orientation, np.ndarray):
        return orientation
    if orientation == "random":
        return _random_rotation(np.random.default_rng() if rng is None else rng)
    if orientation in (None, "fixed", "tip-tip"):
        return None
    if orientation == "body-body":      # z -> y : rotation by -90 deg about x
        return np.array([[1.0, 0, 0], [0, 0, 1.0], [0, -1.0, 0]])
    if orientation == "body-body-x":    # z -> x : rotation by +90 deg about y
        return np.array([[0, 0, 1.0], [0, 1.0, 0], [-1.0, 0, 0]])
    raise ValueError(f"unknown orientation {orientation!r}; use one of {ORIENTATIONS}")


def sample_nucleus(name, rng=None, d_min=0.4, neutron_skin=True, orientation="random", recenter=True):
    """Return (positions (A,3) fm in the nucleus rest frame, is_proton (A,) bool).

    orientation: 'random' (uniform), 'tip-tip' / 'fixed' / None (symmetry axis along the beam z),
                 'body-body' (symmetry axis along y, perpendicular to beam and impact parameter),
                 'body-body-x' (symmetry axis along the impact parameter x), or a 3x3 rotation matrix.
                 Named orientations follow the U+U convention of STAR PRL 115 (2015) 222301.
    neutron_skin: for nuclei with separate proton/neutron 2pF parameters (Pb-208), draw them separately.
    """
    rng = np.random.default_rng() if rng is None else rng
    P = params(name)
    A, Z, kind = P["A"], P["Z"], P["kind"]
    if kind == "point":
        return np.zeros((1, 3)), np.array([True])
    if kind == "hulthen":
        a, b = P["hulthen_a"], P["hulthen_b"]
        # r^2 |phi|^2 ∝ (e^{-a r} - e^{-b r})^2 ; rejection sample r in [0, 20] fm
        rg = np.linspace(0, 20, 2000); fmax = ((np.exp(-a * rg) - np.exp(-b * rg)) ** 2).max()
        while True:
            r = rng.uniform(0, 20); u = rng.uniform(0, fmax)
            if u < (np.exp(-a * r) - np.exp(-b * r)) ** 2:
                break
        v = rng.normal(size=3); v /= np.linalg.norm(v)
        pos = np.array([0.5 * r * v, -0.5 * r * v])
        return pos, np.array([True, False])
    if kind == "gauss_approx":
        sigma = P["rms_radius"] / np.sqrt(3.0)
        pos = rng.normal(scale=sigma, size=(A, 3))
        pos -= pos.mean(axis=0)
        isp = np.zeros(A, bool); isp[:Z] = True; rng.shuffle(isp)
        return pos, isp
    # Woods-Saxon
    w = P.get("w", 0.0); b2 = P.get("beta2", 0.0); b4 = P.get("beta4", 0.0)
    if neutron_skin and "proton" in P and "neutron" in P:
        pp = _sample_ws_positions(Z, rng, P["proton"]["R"], P["proton"]["a"], w, b2, b4, d_min)
        # neutrons must also respect d_min against protons: sample then reject/redo cheaply
        pn = _sample_ws_positions(A - Z, rng, P["neutron"]["R"], P["neutron"]["a"], w, b2, b4, d_min)
        pos = np.vstack([pp, pn]); isp = np.r_[np.ones(Z, bool), np.zeros(A - Z, bool)]
    else:
        pos = _sample_ws_positions(A, rng, P["R"], P["a"], w, b2, b4, d_min)
        isp = np.zeros(A, bool); isp[:Z] = True; rng.shuffle(isp)
    if recenter:
        pos -= pos.mean(axis=0)
    if (b2 != 0.0 or b4 != 0.0):
        R = orientation_matrix(orientation, rng)
        if R is not None:
            pos = pos @ R.T
    return pos, isp


def rms_radius(name, n_samples=200, rng=None):
    rng = np.random.default_rng(0) if rng is None else rng
    r2 = []
    for _ in range(n_samples):
        pos, _ = sample_nucleus(name, rng)
        r2.append((pos**2).sum(axis=1).mean())
    return float(np.sqrt(np.mean(r2)))
