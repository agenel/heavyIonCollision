"""Export the data bundle, calibration tables and cross-check references for the web explorer (web/).

    .venv/bin/python scripts/export_web.py            # data bundle + calibration + references (~5-10 min)
    .venv/bin/python scripts/export_web.py --quick    # data bundle only, reuse existing calibration

Outputs
- web/data/web_data.json : every input number the browser uses (copied from hic_core/data, no new numbers),
  the centrality-vs-b curves, and the per-system flow calibration (flow_gain, a_n vs b) produced by the full
  Python event loop (two-stage calibration against pion <pT> and v_n, see docs/formulas.tex §9).
- web/test/refs.json      : Python reference values for web/test/physics.test.mjs (Glauber statistics, lookup
  outputs, and two deterministic fireball evolutions from identical initial entropy grids).
"""
import argparse, json, os, sys, time
from multiprocessing import Pool
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from hic_core import glauber, nuclei, kinematics, eos, freezeout as fz            # noqa: E402
from hic_core.event import Event, EventParams, TRENTO_NORM                     # noqa: E402
from hic_core.fireball import MISC, T_of_s                                     # noqa: E402
from hic_core.constants import HBARC, M_NUCLEON                                # noqa: E402

WEB = os.path.join(ROOT, "web")

SYSTEMS = [
    dict(id="PbPb_5020", label="Pb–Pb", energy="5.02 TeV", collider="LHC", A="Pb208", B="Pb208", sqrt_snn=5020.0,
         orientation="random", note="LHC Run 2. The largest, hottest and longest-lived droplet of QGP."),
    dict(id="AuAu_200", label="Au–Au", energy="200 GeV", collider="RHIC", A="Au197", B="Au197", sqrt_snn=200.0,
         orientation="random", note="RHIC top energy. Thicker pancakes (γ ≈ 107), a cooler and shorter QGP."),
    dict(id="XeXe_5440", label="Xe–Xe", energy="5.44 TeV", collider="LHC", A="Xe129", B="Xe129", sqrt_snn=5440.0,
         orientation="random", note="Deformed Xe-129 (β₂ = 0.18), randomly oriented."),
    dict(id="UU_193_tip", label="U–U tip–tip", energy="193 GeV", collider="RHIC", A="U238", B="U238", sqrt_snn=193.0,
         orientation="tip-tip", note="Cigar-shaped U-238 with both long axes along the beam: a round overlap."),
    dict(id="UU_193_body", label="U–U body–body", energy="193 GeV", collider="RHIC", A="U238", B="U238", sqrt_snn=193.0,
         orientation="body-body", note="Long axes side by side: an elongated overlap even at b = 0."),
    dict(id="CuAu_200", label="Cu–Au", energy="200 GeV", collider="RHIC", A="Cu63", B="Au197", sqrt_snn=200.0,
         orientation="random", note="A small nucleus on a large one: the overlap is lopsided."),
    dict(id="OO_5360", label="O–O", energy="5.36 TeV", collider="LHC", A="O16", B="O16", sqrt_snn=5360.0,
         orientation="random", note="LHC 2025 light-ion run: 16 + 16 nucleons."),
]
SEEDS = (1, 2, 3)

SOURCES = [
    ("Glauber Monte Carlo (TGlauberMC)", "Loizides, Kamin, d'Enterria, PRC 97 (2018) 054910", "1710.07098"),
    ("Glauber review", "Miller, Reygers, Sanders, Steinberg, Ann. Rev. Nucl. Part. Sci. 57 (2007) 205", "nucl-ex/0701025"),
    ("σ_NN(√s) fit", "d'Enterria, Loizides, Ann. Rev. Nucl. Part. Sci. 71 (2021) 315", "2011.14909"),
    ("TRENTo initial conditions", "Moreland, Bernhard, Bass, PRC 92 (2015) 011901", "1412.4708"),
    ("Entropy per charged hadron", "Hanus, Mazeliauskas, Reygers, PRC 100 (2019) 064903", "1908.02792"),
    ("Lattice QCD equation of state", "HotQCD, PRD 90 (2014) 094503", "1407.6387"),
    ("Chiral crossover T_c = 156.5 MeV", "HotQCD, PLB 795 (2019) 15", "1812.08235"),
    ("Pb–Pb 5.02 TeV multiplicity", "ALICE, PRL 116 (2016) 222302", "1512.06104"),
    ("Pb–Pb 5.02 TeV flow v_n", "ALICE, JHEP 07 (2018) 103", "1804.02944"),
    ("Pb–Pb 5.02 TeV spectra, blast wave", "ALICE, PRC 101 (2020) 044907", "1910.07678"),
    ("Au–Au 200 GeV spectra, blast wave", "STAR, PRC 79 (2009) 034909", "0808.2041"),
    ("Hadronic phase lifetime (K*/K)", "ALICE, PLB 802 (2020) 135225", "1910.14419"),
    ("Blast-wave model", "Schnedermann, Sollfrank, Heinz, PRC 48 (1993) 2462", "nucl-th/9307020"),
    ("U+U orientations", "STAR, PRL 115 (2015) 222301", "1505.07812"),
    ("Ultra-peripheral collisions", "Baltz et al., Phys. Rept. 458 (2008) 1", "0706.3356"),
]


def data_bundle():
    load = lambda n: {k: v for k, v in json.load(open(os.path.join(ROOT, "hic_core", "data", n))).items() if not k.startswith("_")}
    E = json.load(open(os.path.join(ROOT, "hic_core", "data", "hotqcd_eos.json")))
    yields = {k: dict(centrality_mid=v["centrality_mid"], blastwave=v["blastwave"], mean_pt=v["mean_pt"])
              for k, v in fz.YIELDS.items()}
    mult = {k: dict(centrality_mid=v["centrality_mid"], dNch_deta=v["dNch_deta"], shape=v["shape"]) for k, v in fz.MULT.items()}
    return dict(
        constants=dict(HBARC=HBARC, M_NUCLEON=M_NUCLEON),
        nuclei=nuclei.TABLE, aliases=nuclei.ALIASES,
        sigma_nn=load("sigma_nn.json"),
        eos=dict(T=E["T"], e_T4=E["e_T4"], p_T4=E["p_T4"], s_T3=E["s_T3"], cs2=E["cs2"], T_c_MeV=E["T_c_MeV"]),
        multiplicity=mult, flow=fz.FLOW, yields=yields, centrality_tables=glauber.CENTRALITY_TABLES,
        trento_norm={k: v for k, v in TRENTO_NORM.items() if not k.startswith("_")},
        misc={k: v["value"] for k, v in MISC.items() if isinstance(v, dict) and "value" in v},
        sources=[dict(what=a, ref=b, arxiv=c) for a, b, c in SOURCES],
    )


def b_edge(s):
    RA = nuclei.params(s["A"]).get("R", 1.0); RB = nuclei.params(s["B"]).get("R", 1.0)
    return RA + RB


def c_of_b_curve(s):
    bmax = b_edge(s) + 6.0
    bs = np.round(np.arange(0.0, bmax + 1e-9, 0.25), 3)
    cs = [glauber.centrality_of_b(s["A"], s["B"], s["sqrt_snn"], float(b)) for b in bs]
    # b beyond which fewer than 0.5% of events at that b are inelastic (for the ultra-peripheral zone)
    return dict(b=bs.tolist(), c=[round(c, 3) for c in cs])


def calib_b_grid(s):
    edge = b_edge(s)
    return [float(b) for b in np.round(np.arange(0.0, edge + 0.01, 1.0 if edge > 9 else 0.5), 2)]


def _calib_job(args):
    sid, b, seed = args
    s = next(x for x in SYSTEMS if x["id"] == sid)
    try:
        e = Event(EventParams(A=s["A"], B=s["B"], sqrt_snn=s["sqrt_snn"], b=b, seed=seed, orientation=s["orientation"],
                              show_hadrons=False, mult_scale=0.3)).run()
    except Exception as exc:        # e.g. no participants at the edge
        return sid, b, seed, None, repr(exc)
    i = e.info
    if i["npart"] < 2:
        return sid, b, seed, None, "npart<2"
    return sid, b, seed, dict(gain=i["flow_gain"], a=[i["a_n"][n] for n in (2, 3, 4)],
                              vt=[i["vn_target"][n] for n in (2, 3, 4)], vc=[i["vn_calibrated"][n] for n in (2, 3, 4)],
                              pt=i["pt_pi_calibrated"], pt_t=i["mean_pt_target"]["pi"], npart=i["npart"],
                              dNch=i["dNch_deta_target"], T0=i["T0_MeV"], tqgp=i["tau_QGP_end"]), None


def calibration(workers):
    jobs = [(s["id"], b, seed) for s in SYSTEMS for b in calib_b_grid(s) for seed in SEEDS]
    t0 = time.time(); out = {}
    with Pool(workers) as pool:
        for k, (sid, b, seed, res, err) in enumerate(pool.imap_unordered(_calib_job, jobs)):
            out.setdefault(sid, {}).setdefault(b, []).append(res)
            if (k + 1) % 20 == 0:
                print(f"  calibration {k + 1}/{len(jobs)}  {time.time() - t0:.0f}s", flush=True)
    table = {}
    for s in SYSTEMS:
        rows = dict(b=[], gain=[], a2=[], a3=[], a4=[], v2=[], v3=[], v4=[], n=[])
        for b in sorted(out[s["id"]]):
            good = [r for r in out[s["id"]][b] if r is not None]
            if not good:
                continue
            med = lambda f: float(np.median([f(r) for r in good]))
            rows["b"].append(b); rows["gain"].append(round(med(lambda r: r["gain"]), 4)); rows["n"].append(len(good))
            for j, n in enumerate((2, 3, 4)):
                rows[f"a{n}"].append(round(med(lambda r: r["a"][j]), 4))
                rows[f"v{n}"].append(round(med(lambda r: r["vt"][j]), 5))
        table[s["id"]] = rows
    return table, out


# ------------------------------------------------------------------ references for the JS cross-check
def glauber_refs(n_events=300):
    refs = []
    for s in SYSTEMS:
        edge = b_edge(s)
        for b in (0.0, round(0.55 * edge, 2), round(0.85 * edge, 2)):
            rng = np.random.default_rng(4242)
            vals = dict(npart=[], ncoll=[], eps2=[], eps3=[])
            for _ in range(n_events):
                ev = glauber.run_event(s["A"], s["B"], s["sqrt_snn"], b=b, rng=rng, orientation=s["orientation"])
                vals["npart"].append(ev.npart); vals["ncoll"].append(ev.ncoll)
                vals["eps2"].append(ev.eps[2] if ev.npart > 2 else np.nan); vals["eps3"].append(ev.eps[3] if ev.npart > 2 else np.nan)
            row = dict(system=s["id"], b=b, n=n_events)
            for k, v in vals.items():
                v = np.asarray(v, float); v = v[np.isfinite(v)]
                row[k] = dict(mean=float(v.mean()), sem=float(v.std(ddof=1) / np.sqrt(len(v))))
            refs.append(row)
    return refs


def trento_refs(n_events=60):
    """Mean TRENTo integral I (fm^2) per system at two b values (statistical reference)."""
    from hic_core.fireball import trento_reduced_thickness, trento_grid
    X, Y, dx = trento_grid(16.0, 96)
    refs = []
    for s in SYSTEMS:
        for b in (0.0, round(0.55 * b_edge(s), 2)):
            rng = np.random.default_rng(99)
            I = []
            for _ in range(n_events):
                ev = glauber.run_event(s["A"], s["B"], s["sqrt_snn"], b=b, rng=rng, orientation=s["orientation"])
                I.append(float(trento_reduced_thickness(ev, X, Y, rng=rng).sum() * dx * dx))
            I = np.asarray(I)
            refs.append(dict(system=s["id"], b=b, n=n_events, I=dict(mean=float(I.mean()), sem=float(I.std(ddof=1) / np.sqrt(len(I))))))
    return refs


def lookup_refs():
    """Deterministic: given (system, b, eps_n, I_trento) the Python data lookup returns these inputs."""
    refs = []
    for s in SYSTEMS:
        for b in (0.0, round(0.4 * b_edge(s), 2), round(0.75 * b_edge(s), 2)):
            p = EventParams(A=s["A"], B=s["B"], sqrt_snn=s["sqrt_snn"], b=b, seed=5, orientation=s["orientation"])
            e = Event(p)
            e.trento = None
            e.glauber = glauber.run_event(p.A, p.B, p.sqrt_snn, b=b, rng=e.rng, orientation=p.orientation)
            if e.glauber.npart < 2:
                continue
            e.c_mid = e._centrality_from_b(b)
            e._lookup_data()
            refs.append(dict(system=s["id"], b=b, c_mid=e.c_mid, eps={str(n): e.glauber.eps[n] for n in (2, 3, 4, 5)},
                             I_trento=e.I_trento, dNch=e.dNch, bw=dict(beta_T=e.bw["beta_T"], n=e.bw["n"], T_kin_MeV=e.bw["T_kin_MeV"]),
                             vn_target={str(n): e.vn_target[n] for n in (2, 3, 4)}, pt_pi=e.pt_pi_target,
                             shape_type=e.shape["type"], c_equiv=e.c_equiv))
    return refs


def fireball_refs():
    """Two full Python events; the JS test rebuilds the fireball from the same s0 grid and parameters."""
    cases = [dict(A="Pb208", B="Pb208", sqrt_snn=5020.0, b=7.0, seed=3), dict(A="O16", B="O16", sqrt_snn=5360.0, b=2.0, seed=3)]
    refs = []
    for c in cases:
        e = Event(EventParams(**c, show_hadrons=False, mult_scale=0.3)).run()
        fb = e.fb
        taus = [0.4, 1.0, 2.0, 4.0, 6.0, 8.0, 10.0]
        out = dict(case=c, n=fb.n, L=fb.L, s0=[round(float(v), 6) for v in fb.s0.ravel()],
                   params=dict(dS_deta=fb.dS_deta, sigma_eta=fb.sigma_eta, y_beam=fb.y_beam, beta_T=fb.beta_T, n_prof=fb.n_prof,
                               T_kin=fb.T_kin, flow_gain=fb.flow_gain, a_n={str(k): v for k, v in fb.a_n.items()},
                               psi_n={str(k): float(v) for k, v in fb.psi_n.items()}, tau_0=fb.tau_0, tau_acc_ref=e.p.tau_acc,
                               diffusion=fb.diffusion, tau_end=e.p.tau_end),
                   expect=dict(R_0=fb.R_0, tau_acc=fb.tau_acc, beta_s=fb.beta_s, ecc_0=fb.ecc_0.tolist(), psi_0=fb.psi_0.tolist(),
                               taus=taus, T_max=[fb.T_max(t) for t in taus], R=[fb.radius(t) for t in taus],
                               eps2=[float(fb.ecc_at(t)[0][0]) for t in taus], hot=[fb.hot_fraction(t) for t in taus],
                               qgp_end=fb.qgp_end()))
        refs.append(out)
    return refs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true", help="skip calibration and references (reuse previous calibration)")
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    a = ap.parse_args()
    os.makedirs(os.path.join(WEB, "data"), exist_ok=True); os.makedirs(os.path.join(WEB, "test"), exist_ok=True)
    out_path = os.path.join(WEB, "data", "web_data.json")
    D = data_bundle()
    D["systems"] = SYSTEMS
    print("centrality curves ...", flush=True)
    D["c_of_b"] = {s["id"]: c_of_b_curve(s) for s in SYSTEMS}
    if a.quick and os.path.exists(out_path):
        D["calibration"] = json.load(open(out_path)).get("calibration", {})
    else:
        print("flow calibration (full Python event loop) ...", flush=True)
        D["calibration"], raw = calibration(a.workers)
        json.dump({k: {str(b): v for b, v in d.items()} for k, d in raw.items()},
                  open(os.path.join(WEB, "test", "calibration_raw.json"), "w"))
    D["calibration"]["_comment"] = ("Median over seeds %s of the flow gain and a_n from hic_core.event two-stage calibration "
                                    "at fixed b (mult_scale 0.3); v_n = the targets they were calibrated to." % (SEEDS,))
    json.dump(D, open(out_path, "w"), separators=(",", ":"))
    print("wrote", out_path, f"{os.path.getsize(out_path) / 1024:.0f} KB")
    if not a.quick:
        print("references ...", flush=True)
        R = dict(glauber=glauber_refs(), trento=trento_refs(), lookup=lookup_refs(), fireball=fireball_refs())
        json.dump(R, open(os.path.join(WEB, "test", "refs.json"), "w"))
        print("wrote web/test/refs.json")


if __name__ == "__main__":
    main()
