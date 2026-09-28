"""PDG Monte Carlo particle codes (PDG RPP 2024, 'Monte Carlo particle numbering scheme') -> scene species index.
Indices 0-18 follow hic_core.freezeout.SPECIES; 19 = other hadron / resonance, 20 = photon, 21 = lepton / other."""
import numpy as np

PDG_TO_SPECIES = {
    211: 0, -211: 1, 111: 2, 321: 3, -321: 4, 311: 5, -311: 5, 310: 5, 130: 5,
    2212: 6, -2212: 7, 2112: 8, -2112: 9, 3122: 10, -3122: 11, 3312: 12, -3312: 13, 3334: 14, -3334: 15,
    333: 16, 1000010020: 17, -1000010020: 18, 22: 20,
}
OTHER_HADRON, PHOTON, OTHER = 19, 20, 21
LEPTONS = {11, -11, 13, -13, 12, -12, 14, -14, 16, -16}


def species_of(pdg):
    pdg = np.asarray(pdg, dtype=np.int64)
    out = np.full(pdg.shape, OTHER_HADRON, np.int16)
    for code, sid in PDG_TO_SPECIES.items():
        out[pdg == code] = sid
    for code in LEPTONS:
        out[pdg == code] = OTHER
    return out


def species_to_pdg():
    """Inverse map (first code per species) used by the OSCAR exporter."""
    inv = {}
    for code, sid in PDG_TO_SPECIES.items():
        inv.setdefault(sid, code)
    inv[5] = 311
    return inv
