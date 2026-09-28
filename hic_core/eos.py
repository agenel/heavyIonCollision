"""Lattice QCD equation of state (HotQCD 2014) for temperature <-> energy density.

epsilon [GeV/fm^3] = (eps/T^4) * T^4 / (hbar c)^3 with T in GeV.
Below 130 MeV the table is extrapolated with a constant eps/T^4 = 2.33 (an
approximation used only to colour the cold periphery; flagged in docs).
"""
import json, os
import numpy as np
from .constants import HBARC

_DATA = os.path.join(os.path.dirname(__file__), "data")
with open(os.path.join(_DATA, "hotqcd_eos.json")) as f:
    _EOS = json.load(f)

T_C_MEV = _EOS["T_c_MeV"]
_T = np.array(_EOS["T"], float)              # MeV
_E_T4 = np.array(_EOS["e_T4"], float)
_P_T4 = np.array(_EOS["p_T4"], float)
_S_T3 = np.array(_EOS["s_T3"], float)
_CS2 = np.array(_EOS["cs2"], float)

# extended grid for interpolation (add low-T extrapolation points)
_T_ext = np.r_[50.0, 80.0, 100.0, 120.0, _T]
_E_T4_ext = np.r_[2.33, 2.33, 2.33, 2.33, _E_T4]


def _eps_from(T_mev, e_t4):
    T_gev = T_mev / 1000.0
    return e_t4 * T_gev**4 / HBARC**3


_EPS_ext = _eps_from(_T_ext, _E_T4_ext)   # GeV/fm^3, monotonic in T


def epsilon_of_T(T_mev):
    """Energy density GeV/fm^3 for temperature in MeV (log-log interpolation)."""
    T = np.clip(np.asarray(T_mev, float), _T_ext[0], 2000.0)
    e_t4 = np.interp(np.log(T), np.log(_T_ext), _E_T4_ext)  # above 400 MeV: hold 13.34 (SB limit ~ 15.6)
    return _eps_from(T, e_t4)


def T_of_epsilon(eps_gev_fm3):
    """Temperature in MeV for energy density in GeV/fm^3 (inverse of epsilon_of_T)."""
    e = np.clip(np.asarray(eps_gev_fm3, float), _EPS_ext[0] * 1e-6, None)
    # extend to high eps with the T^4 law using the last e/T^4
    T_hi = np.r_[_T_ext, 2000.0]
    E_hi = np.r_[_EPS_ext, _eps_from(2000.0, _E_T4_ext[-1])]
    return np.exp(np.interp(np.log(e), np.log(E_hi), np.log(T_hi)))


def pressure_of_T(T_mev):
    T = np.clip(np.asarray(T_mev, float), _T[0], _T[-1])
    return np.interp(T, _T, _P_T4) * (T / 1000.0) ** 4 / HBARC**3


def entropy_of_T(T_mev):
    """Entropy density in fm^-3."""
    T = np.clip(np.asarray(T_mev, float), _T[0], _T[-1])
    return np.interp(T, _T, _S_T3) * (T / 1000.0) ** 3 / HBARC**3


def cs2_of_T(T_mev):
    T = np.clip(np.asarray(T_mev, float), _T[0], _T[-1])
    return np.interp(T, _T, _CS2)


def phase(T_mev):
    """0 = hadron gas (T<145), 1 = crossover (145-163), 2 = QGP (>163). HotQCD crossover band."""
    T = np.asarray(T_mev, float)
    return np.where(T < 145.0, 0, np.where(T <= 163.0, 1, 2))
