"""Physical constants and PDG masses (GeV). PDG 2024 values."""
HBARC = 0.1973269804        # GeV fm
M_P = 0.93827208943         # proton mass, GeV
M_N = 0.93956542194         # neutron mass, GeV
M_NUCLEON = 0.5 * (M_P + M_N)
FM_PER_C_IN_S = 3.33564e-24  # 1 fm/c in seconds

# hadron masses (GeV), PDG 2024
MASS = {
    "pi+": 0.13957039, "pi-": 0.13957039, "pi0": 0.1349768,
    "K+": 0.493677, "K-": 0.493677, "K0": 0.497611, "K0S": 0.497611,
    "p": M_P, "pbar": M_P, "n": M_N, "nbar": M_N,
    "Lambda": 1.115683, "Xi-": 1.32171, "Omega-": 1.67245, "phi": 1.019461,
    "Kstar0": 0.89555, "rho0": 0.77526, "d": 1.87561294, "gamma": 0.0,
}
CHARGE = {"pi+": 1, "pi-": -1, "pi0": 0, "K+": 1, "K-": -1, "K0": 0, "K0S": 0, "p": 1, "pbar": -1,
          "n": 0, "nbar": 0, "Lambda": 0, "Xi-": -1, "Omega-": -1, "phi": 0, "Kstar0": 0, "rho0": 0,
          "d": 1, "gamma": 0}
