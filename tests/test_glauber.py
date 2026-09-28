import numpy as np, pytest
from hic_core import glauber

def _mean(A, B, e, c, n=120, seed=0):
    rng = np.random.default_rng(seed)
    evs = [glauber.run_event(A, B, e, centrality=c, rng=rng) for _ in range(n)]
    return (np.mean([x.npart for x in evs]), np.mean([x.ncoll for x in evs]),
            np.mean([x.eps[2] for x in evs]), np.mean([x.eps[3] for x in evs]))

@pytest.mark.parametrize("A,e,c", [("Pb", 5020, (0, 5)), ("Pb", 5020, (30, 40)), ("Au", 200, (0, 5)), ("Au", 200, (30, 40))])
def test_glauber_reproduces_lkd18_tables(A, e, c):
    row = glauber.table_row(A, A, e, *c)
    npart, ncoll, e2, e3 = _mean(A, A, e, c)
    assert abs(npart - row["Npart"]) / row["Npart"] < 0.06, (npart, row["Npart"])
    assert abs(ncoll - row["Ncoll"]) / row["Ncoll"] < 0.12, (ncoll, row["Ncoll"])
    assert abs(e2 - row["eps2"]) / row["eps2"] < 0.2, (e2, row["eps2"])
    assert abs(e3 - row["eps3"]) / row["eps3"] < 0.2, (e3, row["eps3"])

def test_calibration_cross_section_pbpb():
    bs, sigma_b = glauber.calibrate_b("Pb", "Pb", 5020, n_events=600)
    assert 7.2 < sigma_b < 8.1, sigma_b   # LKD18: 7.66 b
    lo, hi = glauber.centrality_to_b_range("Pb", "Pb", 5020, 30, 40, use_table=False, d_min=0.4)
    assert 8.0 < lo < 9.1 and 9.4 < hi < 10.4

def test_spectators_and_pairs_consistent():
    ev = glauber.run_event("Pb", "Pb", 5020, b=7.5, rng=np.random.default_rng(9))
    assert ev.n_spectators == 416 - ev.npart
    assert ev.ncoll == len(ev.pairs) == ev.ncoll_A.sum() == ev.ncoll_B.sum()

def test_small_systems_run():
    for A, B in [("p", "Pb"), ("d", "Au"), ("He3", "Au"), ("O", "O"), ("Ne", "Ne"), ("Xe", "Xe"), ("U", "U"), ("Ru", "Ru")]:
        ev = glauber.run_event(A, B, 200 if B == "Au" else 5360, rng=np.random.default_rng(1))
        assert ev.ncoll >= 1 and ev.npart >= 2
