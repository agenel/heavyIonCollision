#!/usr/bin/env python3
"""Validation report: generated observables vs the measured/tabulated values in hic_core/data (docs/physics).
   python scripts/validate.py [--events 3] [--mult 0.3] [--out docs/validation.md]
"""
import argparse, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import numpy as np
from hic_core.event import Event, EventParams
from hic_core import glauber, kinematics
from hic_core import freezeout as fz

p = argparse.ArgumentParser()
p.add_argument("--events", type=int, default=2); p.add_argument("--mult", type=float, default=1.0)
p.add_argument("--glauber-events", type=int, default=150)
p.add_argument("--out", default="docs/validation.md"); p.add_argument("--quick", action="store_true")
a = p.parse_args()

CASES = [("Pb", "Pb", 5020, (0, 5)), ("Pb", "Pb", 5020, (30, 40)), ("Pb", "Pb", 5020, (60, 70)),
         ("Au", "Au", 200, (0, 5)), ("Au", "Au", 200, (30, 40))]
if not a.quick:
    CASES += [("Pb", "Pb", 2760, (0, 5)), ("Xe", "Xe", 5440, (0, 5)), ("O", "O", 5360, (0, 5)), ("Ne", "Ne", 5360, (0, 5)),
              ("Au", "Au", 62.4, (0, 5)), ("Au", "Au", 19.6, (0, 5)), ("p", "Pb", 5020, (0, 5)), ("d", "Au", 200, (0, 5))]

rows = []; t_start = time.time()
for A, B, e, c in CASES:
    infos = []
    for k in range(a.events):
        ev = Event(EventParams(A=A, B=B, sqrt_snn=e, centrality=c, seed=100 + k, mult_scale=a.mult, n_pre_frames=1, n_post_frames=2,
                               grid_cells=64, vol_nx=8, vol_nz=8)).run()
        infos.append(ev.info)
    m = lambda key: float(np.mean([i[key] for i in infos]))
    rng = np.random.default_rng(5)
    gl = [glauber.run_event(A, B, e, centrality=c, rng=rng) for _ in range(a.glauber_events)]
    G = dict(npart=np.mean([g.npart for g in gl]), ncoll=np.mean([g.ncoll for g in gl]), eps2=np.mean([g.eps[2] for g in gl]), eps3=np.mean([g.eps[3] for g in gl]))
    row = glauber.table_row(A, B, e, *c) or {}
    key = glauber.system_key(A, B, e)
    bw = fz.blastwave_params(A, B, e, 0.5 * sum(c))
    ykey = infos[0]["yield_source"]; Y = fz.YIELDS[ykey]; cm = Y["centrality_mid"]
    mpt = infos[0]["mean_pt_target"]
    r = dict(system=f"{A}+{B} {e:g} GeV {c[0]}-{c[1]}%",
             npart=(G["npart"], row.get("Npart")), ncoll=(G["ncoll"], row.get("Ncoll")),
             eps2=(G["eps2"], row.get("eps2")), eps3=(G["eps3"], row.get("eps3")),
             dNch=(m("dNch_deta_generated"), m("dNch_deta_target")),
             pt_pi=(float(np.mean([i["mean_pt_mid"]["pi"] for i in infos])), mpt["pi"]),
             pt_K=(float(np.mean([i["mean_pt_mid"]["K"] for i in infos])), mpt["K"]),
             pt_p=(float(np.mean([i["mean_pt_mid"]["p"] for i in infos])), mpt["p"]),
             v2=(float(np.mean([i["vn_calibrated"][2] for i in infos])), float(np.mean([i["vn_target"][2] for i in infos]))),
             v3=(float(np.mean([i["vn_calibrated"][3] for i in infos])), float(np.mean([i["vn_target"][3] for i in infos]))),
             T0=m("T0_MeV"), T1=m("T_at_1fm_MeV"), tqgp=m("tau_QGP_end"), tf=m("tau_f_median"),
             gamma=infos[0]["gamma"], ybeam=infos[0]["y_beam"], sources=f"mult {infos[0]['mult_source']}, yields {ykey}, flow {infos[0]['flow_source']}")
    rows.append(r); print(r["system"], "done")

def fmt(pair, nd=3):
    g, t = pair
    if t is None or t == 0: return f"{g:.{nd}f} / –"
    d = 100 * (g - t) / t
    return f"{g:.{nd}f} / {t:.{nd}f} ({d:+.0f}%)"

L = ["# Validation report: Level-A model vs measurements", "",
     f"Generated {time.strftime('%Y-%m-%d %H:%M')} with `scripts/validate.py --events {a.events} --mult {a.mult}`. Each cell: generated / reference (deviation). Glauber columns average {a.glauber_events} Glauber events; final-state columns average {a.events} full events at multiplicity scale {a.mult}.",
     "References: Glauber = LKD18 arXiv:1710.07098; dN_ch/dη = ALICE/PHOBOS/CMS tables; ⟨p_T⟩ and blast wave = ALICE 1303.0737, 1910.07678, STAR 0808.2041; v_n = ALICE 1602.01119, STAR 0801.3466 (see docs/physics/03-final-state-data.md).",
     "Note: v_n columns compare the calibration sample (80k bootstrapped emissions) with the target; single-event v_n fluctuate by ±0.02-0.04 at reduced multiplicity.", "",
     "| System | N_part | N_coll | ε₂ | ε₃ | dN_ch/dη(0) | ⟨p_T⟩ π | ⟨p_T⟩ K | ⟨p_T⟩ p | v₂ | v₃ | T(τ₀) / T(1 fm/c) [MeV] | τ_QGP end / τ_f median [fm/c] |",
     "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
for r in rows:
    L.append(f"| {r['system']} | {fmt(r['npart'],0)} | {fmt(r['ncoll'],0)} | {fmt(r['eps2'])} | {fmt(r['eps3'])} | {fmt(r['dNch'],0)} | {fmt(r['pt_pi'])} | {fmt(r['pt_K'])} | {fmt(r['pt_p'])} | {fmt(r['v2'])} | {fmt(r['v3'])} | {r['T0']:.0f} / {r['T1']:.0f} | {r['tqgp']:.1f} / {r['tf']:.1f} |")
L += ["", "## Timescale references", "",
      "| Quantity | Model (Pb-Pb 5.02 TeV 0-5%) | Literature |", "|---|---|---|",
      f"| QGP lifetime (entropy fraction above T_c < 10%) | {rows[0]['tqgp']:.1f} fm/c | 5-10 fm/c (Heinz & Snellings 2013) |",
      f"| median kinetic freeze-out τ | {rows[0]['tf']:.1f} fm/c | decoupling 10-11 fm/c (ALICE HBT, 1012.4035) |",
      f"| T at τ = 1 fm/c (hottest cell) | {rows[0]['T1']:.0f} MeV | 300-500 MeV (ε_Bj lower bound 300 MeV at 2.76 TeV; direct photons) |",
      f"| γ, y_beam | {rows[0]['gamma']:.0f}, {rows[0]['ybeam']:.2f} | 2673, 8.58 (kinematics) |",
      "", "## Data sources per case", ""] + [f"- {r['system']}: {r['sources']}" for r in rows]
# ---- validation-only measurements (not used as model inputs)
import json
refs = {k: v for k, v in json.load(open(os.path.join(os.path.dirname(__file__), "..", "hic_core", "data", "validation_refs.json"))).items() if not k.startswith("_")}
L += ["", "## Predictions vs measurements that are not model inputs", "",
      "These systems have no multiplicity/flow table in the model: N_part is pure Glauber, dN_ch/dη comes from the TRENTo entropy integral "
      "normalised on Au-Au / Pb-Pb (scripts/calibrate_trento_norm.py), v₂ from the flow response at equal multiplicity.", "",
      "| Case | Quantity | Model | Measured | Source |", "|---|---|---|---|---|"]
for name, r in refs.items():
    rng = np.random.default_rng(11)
    orient = "random"
    gl = [glauber.run_event(r["A"], r["B"], r["sqrt_snn"], centrality=tuple(r["centrality"]), rng=rng, orientation=orient) for _ in range(a.glauber_events)]
    if "Npart" in r:
        m = np.mean([g.npart for g in gl]); ref, err = r["Npart"]
        L.append(f"| {name} | N_part | {m:.1f} | {ref} ± {err if err is not None else '–'} | {r['source']} |")
    if "dNch_deta" in r or "v2" in r:
        infos = [Event(EventParams(A=r["A"], B=r["B"], sqrt_snn=r["sqrt_snn"], centrality=tuple(r["centrality"]), seed=200 + k,
                                   mult_scale=0.3, n_pre_frames=1, n_post_frames=2, grid_cells=64, vol_nx=8, vol_nz=8,
                                   calibrate_flow="v2" in r)).run().info for k in range(max(a.events, 3))]
        if "dNch_deta" in r:
            m = np.mean([i["dNch_deta_target"] for i in infos]); ref, err = r["dNch_deta"]
            L.append(f"| {name} | dN_ch/dη (TRENTo route) | {m:.0f} | {ref} ± {err} | {r['source']} |")
        if "v2" in r:
            m = np.mean([i["vn_target"][2] for i in infos]); ref, err = r["v2"]
            L.append(f"| {name} | v₂ (random orientations) | {m:.4f} | {ref} ± {err} | {r['source']} |")
    print(name, "done")
os.makedirs(os.path.dirname(a.out), exist_ok=True)
open(a.out, "w").write("\n".join(L) + "\n")
print(f"wrote {a.out} in {time.time() - t_start:.0f}s")
