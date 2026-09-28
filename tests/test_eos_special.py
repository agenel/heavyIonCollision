import math, numpy as np
from hic_core import eos, special

def test_eos_roundtrip_and_anchor_values():
    for T in (140, 155, 200, 300, 380):
        assert abs(eos.T_of_epsilon(eos.epsilon_of_T(T)) - T) < 0.5
    assert abs(eos.epsilon_of_T(155) - 0.35) < 0.02
    assert abs(eos.epsilon_of_T(300) - 12.8) < 0.4
    assert eos.T_C_MEV == 156.5

def test_bessel_against_known_values():
    assert abs(special.bessel_i0(1.0) - 1.2660658777) < 2e-6
    assert abs(special.bessel_i0(5.0) - 27.239871823) < 27.24 * 3e-7 * 10
    assert abs(special.bessel_k1(1.0) - 0.6019072302) < 2e-6
    assert abs(special.bessel_k1(3.0) - 0.0401564311) < 2e-7
    assert abs(special.bessel_i1(2.0) - 1.5906368546) < 3e-6

def test_gammainc_upper():
    # Q(1, x) = exp(-x); Q(2, x) = (1+x) exp(-x)
    x = np.array([0.1, 0.5, 1.0, 2.5, 6.0])
    assert np.allclose(special.gammainc_upper_reg(1.0, x), np.exp(-x), atol=1e-8)
    assert np.allclose(special.gammainc_upper_reg(2.0, x), (1 + x) * np.exp(-x), atol=1e-8)
    assert np.allclose(special.gammainc_upper_reg(2.5, np.array([0.0])), 1.0, atol=1e-8)
