"""Field readers (docs/physics/04-simulation-formats.md §3-5) and a common HydroGrid container.

HydroGrid holds T(tau, x, y, eta_s) in MeV on a regular grid (Milne coordinates, as all hydro codes use) and samples
it at lab-frame points (t, x, y, z) with tau = sqrt(t^2 - z^2), eta_s = atanh(z/t): linear in tau, trilinear in
(x, y, eta_s). 2+1D (boost-invariant) grids have a single eta_s slice and are applied for |eta_s| < eta_window.
"""
import glob, os, re, struct
from dataclasses import dataclass, field
import numpy as np

HBARC = 0.19733


# ----------------------------------------------------------------------------------------------- TRENTo
def read_trento(path):
    """TRENTo text event: returns (header dict, grid[ix, iy] in fm^-2, cell-centre coordinates x (== y))."""
    header, rows = {}, []
    for line in open(path):
        if line.startswith("#"):
            body = line[1:].strip()
            if "=" in body:
                k, v = (s.strip() for s in body.split("=", 1)); header[k] = float(v)
            elif body.startswith("event"):
                header["event"] = int(body.split()[1])
        elif line.strip():
            rows.append([float(v) for v in line.split()])
    g = np.array(rows)          # stored [iy][ix]
    n = g.shape[0]
    step = header.get("grid_step")
    if step is None:            # recover the step from mult = step^2 * sum(grid) when present
        step = float(np.sqrt(header["mult"] / g.sum())) if "mult" in header and g.sum() > 0 else 0.2
    x = (np.arange(n) + 0.5) * step - n * step / 2
    return header, g.T.copy(), x


# ----------------------------------------------------------------------------------------------- legacy VTK (vHLLE)
def read_vtk(path):
    """Legacy ASCII STRUCTURED_POINTS file. Returns dict(name, dims (nx,ny,nz), spacing, origin, data) with data
    shaped (nx, ny, nz) for scalars or (nx, ny, nz, 3) for vectors (file order: x fastest, then y, then z)."""
    txt = open(path).read().split("\n")
    out = {"name": txt[1].strip()}
    i = 0
    while i < len(txt):
        tok = txt[i].split()
        if not tok:
            i += 1; continue
        if tok[0] == "DIMENSIONS": out["dims"] = tuple(int(v) for v in tok[1:4])
        elif tok[0] == "SPACING": out["spacing"] = tuple(float(v) for v in tok[1:4])
        elif tok[0] == "ORIGIN": out["origin"] = tuple(float(v) for v in tok[1:4])
        elif tok[0] in ("SCALARS", "VECTORS"):
            ncomp = 3 if tok[0] == "VECTORS" else (int(tok[3]) if len(tok) > 3 else 1)
            start = i + (2 if tok[0] == "SCALARS" else 1)       # skip LOOKUP_TABLE for scalars
            vals = np.array(" ".join(txt[start:]).split(), dtype=float)
            nx, ny, nz = out["dims"]
            vals = vals[:nx * ny * nz * ncomp]
            arr = vals.reshape(nz, ny, nx, ncomp) if ncomp > 1 else vals.reshape(nz, ny, nx)
            out["data"] = np.transpose(arr, (2, 1, 0, 3) if ncomp > 1 else (2, 1, 0)).copy()
            break
        i += 1
    return out


# ----------------------------------------------------------------------------------------------- container
@dataclass
class HydroGrid:
    taus: np.ndarray          # (K,)
    x: np.ndarray             # (nx,)
    y: np.ndarray             # (ny,)
    eta: np.ndarray           # (neta,) ; single value for 2+1D
    T: np.ndarray             # (K, nx, ny, neta) MeV
    e: np.ndarray = None      # (K, nx, ny, neta) GeV/fm^3 (optional)
    source: str = ""
    eta_window: float = 2.0   # 2+1D only: boost-invariant slice applied for |eta_s| < eta_window
    meta: dict = field(default_factory=dict)

    @property
    def boost_invariant(self):
        return len(self.eta) == 1

    def _idx(self, axis, v):
        """Fractional index and validity mask for a regular axis."""
        if len(axis) == 1:
            return np.zeros_like(v), np.ones(v.shape, bool)
        d = axis[1] - axis[0]
        f = (v - axis[0]) / d
        return f, (f >= 0) & (f <= len(axis) - 1)

    def _trilinear(self, G, fx, fy, fe):
        nx, ny, ne = G.shape
        def split(f, n):
            f = np.clip(f, 0, n - 1); i0 = np.floor(f).astype(int); i1 = np.minimum(i0 + 1, n - 1)
            return i0, i1, f - i0
        x0, x1, wx = split(fx, nx); y0, y1, wy = split(fy, ny); e0, e1, we = split(fe, ne)
        c = 0.0
        for xi, ax in ((x0, 1 - wx), (x1, wx)):
            for yi, ay in ((y0, 1 - wy), (y1, wy)):
                for ei, ae in ((e0, 1 - we), (e1, we)):
                    c = c + ax * ay * ae * G[xi, yi, ei]
        return c

    def sample_milne(self, tau, x, y, eta, field_="T"):
        """Field at Milne points (arrays of equal shape); 0 outside the grid or before the first snapshot."""
        G = self.T if field_ == "T" else self.e
        tau = np.asarray(tau, float); x = np.asarray(x, float); y = np.asarray(y, float); eta = np.asarray(eta, float)
        fx, okx = self._idx(self.x, x); fy, oky = self._idx(self.y, y)
        if self.boost_invariant:
            fe = np.zeros_like(eta); oke = np.abs(eta) < self.eta_window
        else:
            fe, oke = self._idx(self.eta, eta)
        ok = okx & oky & oke & (tau >= self.taus[0]) & (tau <= self.taus[-1])
        out = np.zeros(x.shape, float)
        if not ok.any():
            return out
        # linear in tau between neighbouring snapshots
        k = np.clip(np.searchsorted(self.taus, tau[ok]) - 1, 0, len(self.taus) - 2) if len(self.taus) > 1 else np.zeros(ok.sum(), int)
        w = np.clip((tau[ok] - self.taus[k]) / np.maximum(self.taus[np.minimum(k + 1, len(self.taus) - 1)] - self.taus[k], 1e-12), 0, 1) \
            if len(self.taus) > 1 else np.zeros(ok.sum())
        vals = np.zeros(ok.sum())
        for kk in np.unique(k):
            sel = k == kk
            a = self._trilinear(G[kk], fx[ok][sel], fy[ok][sel], fe[ok][sel])
            b = self._trilinear(G[min(kk + 1, len(self.taus) - 1)], fx[ok][sel], fy[ok][sel], fe[ok][sel])
            vals[sel] = (1 - w[sel]) * a + w[sel] * b
        out[ok] = vals
        return out

    def sample_lab(self, t, X, Y, Z):
        """T (MeV) at lab time t on points X, Y, Z (arrays); 0 outside the forward light cone."""
        Z = np.asarray(Z, float)
        inside = np.abs(Z) < t
        tau = np.where(inside, np.sqrt(np.maximum(t * t - Z * Z, 0.0)), 0.0)
        eta = np.where(inside, np.arctanh(np.clip(Z / max(t, 1e-9), -0.999999, 0.999999)), 0.0)
        return np.where(inside, self.sample_milne(tau, X, Y, eta), 0.0)


# ----------------------------------------------------------------------------------------------- vHLLE
def read_vhlle_vtk_series(directory, quantity="T", tau0=None, dtau=None, T_in_GeV=True):
    """vHLLE VTK snapshots `<quantity>_taustep%05d.vtk`. tau is not stored in the files: tau_k is rebuilt from tau0 and
    dtau (vHLLE parameters). After the grid resize at tauResize, vHLLE doubles dx, dy and dtau and leaves ORIGIN stale
    (source bug): the origin is recomputed as -(n-1)*spacing/2 and the time step doubled from that snapshot on."""
    if tau0 is None or dtau is None:
        raise ValueError("vHLLE VTK files do not store tau: pass tau0 and dtau from the vHLLE parameter file")
    files = sorted(glob.glob(os.path.join(directory, f"{quantity}_taustep*.vtk")),
                   key=lambda p: int(re.search(r"taustep(\d+)", p).group(1)))
    if not files:
        raise FileNotFoundError(f"no {quantity}_taustep*.vtk in {directory}")
    first = read_vtk(files[0]); sp0 = first["spacing"]; dims0 = first["dims"]
    taus, frames = [], []
    tau = float(tau0); prev_step = None
    for p in files:
        step = int(re.search(r"taustep(\d+)", p).group(1))
        v = read_vtk(p)
        if prev_step is not None:
            factor = v["spacing"][0] / sp0[0]
            tau += (step - prev_step) * dtau * (2.0 if factor > 1.5 else 1.0)
        prev_step = step
        if v["dims"] != dims0:
            raise ValueError("grid dimensions changed between snapshots (only the 2x spacing resize is supported)")
        taus.append(tau); frames.append(v)
    # common grid: use the finest spacing and resample coarser (post-resize) snapshots onto it
    nx, ny, nz = dims0
    def axes(v):
        sx, sy, sz = v["spacing"]
        if v["spacing"][0] > sp0[0] * 1.5:
            ox, oy = -(nx - 1) * sx / 2, -(ny - 1) * sy / 2; oz = v["origin"][2]
        else:
            ox, oy, oz = v["origin"]
        return (ox + np.arange(nx) * sx, oy + np.arange(ny) * sy, oz + np.arange(nz) * sz)
    xs, ys, zs = axes(frames[-1])            # the largest extent covers everything
    step_x = sp0[0]; step_y = sp0[1]
    x = np.arange(xs[0], xs[-1] + 1e-9, step_x); y = np.arange(ys[0], ys[-1] + 1e-9, step_y); eta = zs
    T = np.zeros((len(frames), len(x), len(y), len(eta)))
    for k, v in enumerate(frames):
        ax, ay, az = axes(v)
        G = HydroGrid(np.array([0.0]), ax, ay, az if nz > 1 else np.array([0.0]), v["data"][None])
        XX, YY, EE = np.meshgrid(x, y, eta if nz > 1 else np.array([0.0]), indexing="ij")
        T[k] = G.sample_milne(np.zeros(XX.shape), XX, YY, EE).reshape(len(x), len(y), -1)
    if T_in_GeV:
        T = T * 1000.0
    return HydroGrid(np.array(taus), x, y, eta if nz > 1 else np.array([0.0]), T, source=f"vHLLE VTK ({directory})")


# ----------------------------------------------------------------------------------------------- MUSIC
def read_music_evolution(path):
    """MUSIC binary evolution: `evolution_all_xyeta.dat` (output_evolution_data 2, 16-float header), the vorticity
    variant (12-float header, nVar = 35) or `evolution_for_movie_xyeta.dat` (output_movie_flag 1, 12-float header,
    nVar = 14). Sparse records are scattered into dense grids (cells not written are below MUSIC's cut: T = 0)."""
    raw = np.fromfile(path, dtype="<f4")
    if raw.size >= 16 and int(round(raw[15])) == 11 + 2 * int(round(raw[11])) + 5 * int(round(raw[12])) + int(round(raw[13])) + 3 * int(round(raw[14])) \
            and int(round(raw[11])) in (0, 1):
        h = raw[:16]; nvar = int(round(h[15])); body = raw[16:]; layout = "all"
    elif raw.size >= 12 and int(round(raw[11])) in (14, 35):
        h = raw[:12]; nvar = int(round(h[11])); body = raw[12:]; layout = "movie" if nvar == 14 else "vorticity"
    else:
        raise ValueError("unrecognised MUSIC evolution header")
    tau0, dtau, nx, dx, xmin, ny, dy, ymin, neta, deta, etamin = (float(v) for v in h[:11])
    if body.size % nvar:
        raise ValueError(f"file size not a multiple of the {nvar}-float record")
    rec = body.reshape(-1, nvar)
    it, ix, iy, ie = (np.rint(rec[:, k]).astype(int) for k in range(4))
    if layout == "all":
        e, T = rec[:, 4], rec[:, 6]
    elif layout == "movie":
        e, T = rec[:, 5], rec[:, 7]
    else:
        e, T = rec[:, 4], rec[:, 6]
    K = it.max() + 1; NX = max(ix.max() + 1, int(nx)); NY = max(iy.max() + 1, int(ny)); NE = max(ie.max() + 1, int(neta), 1)
    Tg = np.zeros((K, NX, NY, NE), np.float32); Eg = np.zeros_like(Tg)
    Tg[it, ix, iy, ie] = T * 1000.0; Eg[it, ix, iy, ie] = e
    x = xmin + np.arange(NX) * dx; y = ymin + np.arange(NY) * dy
    eta = (etamin + np.arange(NE) * deta) if NE > 1 else np.array([0.0])
    return HydroGrid(tau0 + np.arange(K) * dtau, x, y, eta, Tg, Eg, source=f"MUSIC {layout} ({os.path.basename(path)})",
                     meta=dict(layout=layout, nvar=nvar))


def write_music_evolution(path, grid, e_cut=0.15):
    """Write a HydroGrid as MUSIC `evolution_all_xyeta.dat` (ideal, no rhoB/shear/bulk/diffusion: nVar = 11), keeping
    cells with e >= e_cut GeV/fm^3 like MUSIC does. Used to round-trip Level-A events and in tests."""
    from ..eos import epsilon_of_T, pressure_of_T, cs2_of_T
    K, NX, NY, NE = grid.T.shape
    dtau = grid.taus[1] - grid.taus[0] if K > 1 else 0.1
    dx = grid.x[1] - grid.x[0]; dy = grid.y[1] - grid.y[0]; deta = grid.eta[1] - grid.eta[0] if NE > 1 else 0.1
    hdr = np.array([grid.taus[0], dtau, NX, dx, grid.x[0], NY, dy, grid.y[0], NE, deta, grid.eta[0], 0, 0, 0, 0, 11], "<f4")
    recs = []
    for k in range(K):
        T = grid.T[k]; e = epsilon_of_T(np.maximum(T, 1.0)) * (T > 0)
        ii = np.argwhere(e >= e_cut)
        if not len(ii):
            continue
        Tv = T[tuple(ii.T)] / 1000.0; ev = e[tuple(ii.T)]
        r = np.zeros((len(ii), 11), "<f4")
        r[:, 0] = k; r[:, 1:4] = ii; r[:, 4] = ev; r[:, 5] = pressure_of_T(Tv * 1000.0); r[:, 6] = Tv; r[:, 7] = cs2_of_T(Tv * 1000.0)
        recs.append(r)
    with open(path, "wb") as f:
        f.write(hdr.tobytes())
        for r in recs:
            f.write(r.tobytes())
