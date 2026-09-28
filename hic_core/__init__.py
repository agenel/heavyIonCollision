"""hic_core: numpy-only physics for heavy-ion collision visualization.

All quantities in natural units unless stated: lengths in fm, times in fm/c,
energies in GeV, temperatures in MeV where noted. Every table in hic_core/data
carries its literature source; see docs/physics/ for the full references.
"""
from . import constants, kinematics, nuclei, glauber, eos  # noqa: F401
__version__ = "0.1.0"
