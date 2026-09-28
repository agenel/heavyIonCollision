import numpy as np
from hic_core import nuclei

def test_pb_rms_radius_matches_woods_saxon():
    R, a = 6.62, 0.546
    expected = np.sqrt(0.6 * R**2 + 1.4 * np.pi**2 * a**2)   # analytic rms of a 2pF (a<<R)
    rng = np.random.default_rng(1)
    got = nuclei.rms_radius("Pb", n_samples=60, rng=rng)
    assert abs(got - expected) / expected < 0.03, (got, expected)

def test_dmin_enforced():
    rng = np.random.default_rng(2)
    pos, isp = nuclei.sample_nucleus("Au", rng, d_min=0.4)
    d = np.linalg.norm(pos[:, None] - pos[None], axis=-1); np.fill_diagonal(d, 9)
    assert d.min() >= 0.4
    assert pos.shape == (197, 3) and isp.sum() == 79

def test_pb_has_neutron_skin_proton_neutron_split():
    rng = np.random.default_rng(3)
    pos, isp = nuclei.sample_nucleus("Pb", rng)
    assert isp.sum() == 82 and (~isp).sum() == 126

def test_deuteron_hulthen_separation():
    rng = np.random.default_rng(4)
    seps = []
    for _ in range(400):
        pos, _ = nuclei.sample_nucleus("d", rng)
        seps.append(np.linalg.norm(pos[0] - pos[1]))
    rms = np.sqrt(np.mean(np.square(seps)))
    assert 3.0 < rms < 4.8   # deuteron rms matter radius ~1.97 fm -> r_pn rms ~3.9 fm

def test_deformed_nucleus_random_orientation_changes_shape():
    rng = np.random.default_rng(5)
    pos, _ = nuclei.sample_nucleus("U", rng, orientation="fixed")
    var = pos.var(axis=0)
    assert var[2] > var[0] * 1.1   # prolate: longer along symmetry axis z when unrotated

def test_named_orientations_for_uranium():
    rng = np.random.default_rng(7)
    tip = np.mean([nuclei.sample_nucleus("U", rng, orientation="tip-tip")[0].var(axis=0) for _ in range(20)], axis=0)
    body = np.mean([nuclei.sample_nucleus("U", rng, orientation="body-body")[0].var(axis=0) for _ in range(20)], axis=0)
    assert tip[2] > 1.1 * tip[1]      # long axis along the beam
    assert body[1] > 1.1 * body[2]    # long axis along y


def test_body_body_central_uu_has_larger_eps2_than_tip_tip():
    from hic_core import glauber
    rng = np.random.default_rng(8)
    e_tip = np.mean([glauber.run_event("U", "U", 193, b=0.5, rng=rng, orientation="tip-tip").eps[2] for _ in range(30)])
    e_body = np.mean([glauber.run_event("U", "U", 193, b=0.5, rng=rng, orientation="body-body").eps[2] for _ in range(30)])
    assert e_body > 2 * e_tip, (e_tip, e_body)
