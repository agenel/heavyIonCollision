import numpy as np
from hic_core import kinematics as k

def test_gamma_and_ybeam():
    assert abs(k.gamma(200) - 106.5) < 0.5
    assert abs(k.gamma(5020) - 2673) < 5
    assert abs(k.y_beam(200) - 5.36) < 0.01
    assert abs(k.y_beam(5020) - 8.58) < 0.01

def test_contraction_and_crossing():
    assert abs(k.contracted_thickness(6.62, 5020) - 0.0050) < 0.0003
    assert abs(k.crossing_time(6.38, 200) - 0.12) < 0.01
    assert abs(k.crossing_time(6.62, 7.7) - 3.2) < 0.15

def test_sigma_nn():
    assert k.sigma_nn_inel_mb(200) == 42.3
    assert k.sigma_nn_inel_mb(5020) == 67.6
    fit = k.sigma_nn_inel_mb(200, prefer_preset=False)
    assert 40 < fit < 43
    fit_lhc = k.sigma_nn_inel_mb(5020, prefer_preset=False)
    assert 64 < fit_lhc < 71

def test_milne_roundtrip():
    tau, eta = k.milne(5.0, 3.0)
    t, z = k.cartesian(tau, eta)
    assert np.allclose([t, z], [5.0, 3.0])
