"""Beam kinematics, Lorentz contraction, Milne coordinates, sigma_NN(s).

Formulas: gamma = sqrt(s_NN)/(2 m_N); y_beam = acosh(gamma); L_z = 2R/gamma;
tau = sqrt(t^2 - z^2), eta_s = atanh(z/t). sigma_NN fit from d'Enterria & Loizides
arXiv:2011.14909 (a + b ln^n s, s in GeV^2).
"""
import json, os
import numpy as np
from .constants import M_NUCLEON

_DATA = os.path.join(os.path.dirname(__file__), "data")
with open(os.path.join(_DATA, "sigma_nn.json")) as f:
    _SNN = json.load(f)


def gamma(sqrt_snn_gev):
    return sqrt_snn_gev / (2.0 * M_NUCLEON)


def beta(sqrt_snn_gev):
    g = gamma(sqrt_snn_gev)
    return np.sqrt(1.0 - 1.0 / g**2)


def y_beam(sqrt_snn_gev):
    return np.arccosh(gamma(sqrt_snn_gev))


def energy_per_nucleon(sqrt_snn_gev):
    return sqrt_snn_gev / 2.0


def contracted_thickness(radius_fm, sqrt_snn_gev):
    """Longitudinal thickness 2R/gamma of the half-density diameter, fm."""
    return 2.0 * radius_fm / gamma(sqrt_snn_gev)


def crossing_time(radius_fm, sqrt_snn_gev):
    """Time for the two contracted discs to pass through each other, fm/c (v ~ c)."""
    return contracted_thickness(radius_fm, sqrt_snn_gev) / beta(sqrt_snn_gev)


def sigma_nn_inel_mb(sqrt_snn_gev, prefer_preset=True):
    """Inelastic NN cross section in mb. Uses the tabulated preset when the energy
    matches one within 1%, otherwise the dEL20 fit."""
    if prefer_preset:
        for k, v in _SNN["presets"].items():
            if abs(float(k) - sqrt_snn_gev) <= 0.01 * float(k):
                return float(v)
    a, b, n = _SNN["fit"]["a"], _SNN["fit"]["b"], _SNN["fit"]["n"]
    s = sqrt_snn_gev**2
    return a + b * np.log(s) ** n


def black_disk_diameter_fm(sigma_mb):
    """D = sqrt(sigma/pi); 1 mb = 0.1 fm^2."""
    return np.sqrt(sigma_mb * 0.1 / np.pi)


def milne(t, z):
    """(t, z) -> (tau, eta_s). Returns nan where |z| >= t."""
    t = np.asarray(t, float); z = np.asarray(z, float)
    with np.errstate(invalid="ignore", divide="ignore"):
        tau = np.sqrt(t * t - z * z)
        eta = np.arctanh(z / t)
    return tau, eta


def cartesian(tau, eta_s):
    return tau * np.cosh(eta_s), tau * np.sinh(eta_s)
