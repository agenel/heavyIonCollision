import numpy as np
from hic_core.event import Event, EventParams, FREE, SPECTATOR, NUCLEON

def _run(**kw):
    kw.setdefault("mult_scale", 0.15)
    p = EventParams(n_pre_frames=5, n_post_frames=25, vol_nx=16, vol_nz=16, vol_voxel_fm=1.5, grid_cells=64, **kw)
    return Event(p).run()

def test_pbpb_midcentral_matches_data():
    e = _run(centrality=(30, 40), seed=3, mult_scale=0.5)
    i = e.info
    assert abs(i["dNch_deta_generated"] - i["dNch_deta_target"]) / i["dNch_deta_target"] < 0.15
    assert abs(i["pt_pi_calibrated"] - i["mean_pt_target"]["pi"]) < 0.10 * i["mean_pt_target"]["pi"]
    assert 0.6 < i["mean_pt_mid"]["K"] / i["mean_pt_target"]["K"] < 1.5 and 0.5 < i["mean_pt_mid"]["p"] / i["mean_pt_target"]["p"] < 1.7
    for n in (2, 3):
        assert abs(i["vn_calibrated"][n] - i["vn_target"][n]) < 0.006, (n, i["vn_calibrated"][n], i["vn_target"][n])
    assert 250 < i["T0_MeV"] < 650 and 3 < i["tau_QGP_end"] < 13
    assert 5 < i["tau_f_median"] < 16

def test_frames_and_states():
    e = _run(centrality=(0, 5), seed=1)
    pos, st = e.frame_particles(-2.0)
    assert (st[: len(e.nuc_pos0)] == NUCLEON).all() and np.isfinite(pos).all()
    pos, st = e.frame_particles(40.0)
    assert (st == FREE).sum() > 0.3 * len(e.species)   # forward hadrons (large eta_s) freeze late in lab time
    assert (st == SPECTATOR).sum() == e.glauber.n_spectators
    assert np.isfinite(pos).all()
    T, E = e.frame_volume(3.0)
    assert T.max() > 150 and E.max() > 0.3

def test_auau_and_small_system_run():
    e = _run(A="Au", B="Au", sqrt_snn=200, centrality=(20, 30), seed=2)
    assert e.info["dNch_deta_target"] > 200
    e2 = _run(A="O", B="O", sqrt_snn=5360, centrality=(0, 5), seed=2)
    assert 80 < e2.info["dNch_deta_target"] < 200
