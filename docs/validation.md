# Validation report: Level-A model vs measurements

Generated 2026-09-23 20:14 with `scripts/validate.py --events 2 --mult 1.0`. Each cell: generated / reference (deviation). Glauber columns average 150 Glauber events; final-state columns average 2 full events at multiplicity scale 1.0.
References: Glauber = LKD18 arXiv:1710.07098; dN_ch/dη = ALICE/PHOBOS/CMS tables; ⟨p_T⟩ and blast wave = ALICE 1303.0737, 1910.07678, STAR 0808.2041; v_n = ALICE 1602.01119, STAR 0801.3466 (see docs/physics/03-final-state-data.md).
Note: v_n columns compare the calibration sample (80k bootstrapped emissions) with the target; single-event v_n fluctuate by ±0.02-0.04 at reduced multiplicity.

| System | N_part | N_coll | ε₂ | ε₃ | dN_ch/dη(0) | ⟨p_T⟩ π | ⟨p_T⟩ K | ⟨p_T⟩ p | v₂ | v₃ | T(τ₀) / T(1 fm/c) [MeV] | τ_QGP end / τ_f median [fm/c] |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Pb+Pb 5020 GeV 0-5% | 382 / 384 (-1%) | 1745 / 1762 (-1%) | 0.077 / 0.072 (+7%) | 0.088 / 0.084 (+5%) | 2013 / 1943 (+4%) | 0.577 / 0.568 (+2%) | 1.078 / 0.918 (+17%) | 1.671 / 1.448 (+15%) | 0.027 / 0.028 (-4%) | 0.020 / 0.021 (-6%) | 595 / 427 | 8.5 / 9.7 |
| Pb+Pb 5020 GeV 30-40% | 129 / 130 (-1%) | 333 / 344 (-3%) | 0.332 / 0.335 (-1%) | 0.234 / 0.223 (+5%) | 520 / 512 (+2%) | 0.552 / 0.518 (+7%) | 0.897 / 0.840 (+7%) | 1.397 / 1.240 (+13%) | 0.096 / 0.099 (-4%) | 0.031 / 0.033 (-6%) | 516 / 371 | 8.2 / 6.8 |
| Pb+Pb 5020 GeV 60-70% | 30 / 31 (-4%) | 39 / 41 (-6%) | 0.548 / 0.538 (+2%) | 0.381 / 0.373 (+2%) | 98 / 96 (+2%) | 0.475 / 0.471 (+1%) | 0.558 / 0.768 (-27%) | 0.847 / 1.048 (-19%) | 0.076 / 0.098 (-22%) | 0.011 / 0.028 (-62%) | 360 / 266 | 4.6 / 2.8 |
| Au+Au 200 GeV 0-5% | 352 / 351 (+0%) | 1081 / 1053 (+3%) | 0.101 / 0.099 (+2%) | 0.087 / 0.094 (-7%) | 676 / 666 (+2%) | 0.427 / 0.420 (+2%) | 0.648 / 0.720 (-10%) | 1.175 / 1.100 (+7%) | 0.027 / 0.028 (-3%) | 0.015 / 0.015 (-2%) | 424 / 315 | 6.0 / 8.0 |
| Au+Au 200 GeV 30-40% | 113 / 114 (-1%) | 220 / 218 (+1%) | 0.372 / 0.367 (+1%) | 0.240 / 0.239 (+0%) | 179 / 186 (-4%) | 0.366 / 0.402 (-9%) | 0.583 / 0.666 (-12%) | 0.849 / 0.988 (-14%) | 0.059 / 0.062 (-4%) | 0.019 / 0.021 (-6%) | 375 / 279 | 5.3 / 5.7 |
| Pb+Pb 2760 GeV 0-5% | 385 / – | 1634 / – | 0.075 / – | 0.086 / – | 1662 / 1601 (+4%) | 0.517 / 0.517 (-0%) | 0.856 / 0.876 (-2%) | 1.444 / 1.333 (+8%) | 0.027 / 0.028 (-0%) | 0.019 / 0.020 (-3%) | 592 / 424 | 8.3 / 9.5 |
| Xe+Xe 5440 GeV 0-5% | 233 / – | 912 / – | 0.113 / – | 0.112 / – | 1172 / 1167 (+0%) | 0.574 / 0.548 (+5%) | 0.912 / 0.887 (+3%) | 1.532 / 1.366 (+12%) | 0.035 / 0.036 (-3%) | 0.022 / 0.022 (-3%) | 589 / 422 | 8.5 / 8.1 |
| O+O 5360 GeV 0-5% | 28 / – | 47 / – | 0.292 / – | 0.314 / – | 134 / 135 (-1%) | 0.492 / 0.479 (+3%) | 0.752 / 0.781 (-4%) | 1.359 / 1.082 (+26%) | 0.072 / 0.080 (-10%) | 0.012 / 0.020 (-42%) | 432 / 313 | 5.8 / 3.7 |
| Ne+Ne 5360 GeV 0-5% | 32 / – | 52 / – | 0.352 / – | 0.315 / – | 162 / 155 (+5%) | 0.526 / 0.483 (+9%) | 0.636 / 0.786 (-19%) | 0.867 / 1.096 (-21%) | 0.103 / 0.110 (-6%) | 0.036 / 0.040 (-11%) | 423 / 305 | 5.7 / 3.9 |
| Au+Au 62.4 GeV 0-5% | 343 / – | 908 / – | 0.108 / – | 0.091 / – | 488 / 492 (-1%) | 0.407 / 0.415 (-2%) | 0.728 / 0.706 (+3%) | 1.005 / 1.071 (-6%) | 0.034 / 0.034 (-1%) | 0.008 / 0.010 (-17%) | 391 / 292 | 5.5 / 7.5 |
| Au+Au 19.6 GeV 0-5% | 339 / – | 821 / – | 0.110 / – | 0.093 / – | 314 / 331 (-5%) | 0.416 / 0.410 (+2%) | 0.607 / 0.689 (-12%) | 0.886 / 1.036 (-14%) | 0.030 / 0.032 (-5%) | 0.008 / 0.009 (-4%) | 360 / 269 | 4.9 / 6.8 |
| p+Pb 5020 GeV 0-5% | 14 / – | 13 / – | 0.287 / – | 0.315 / – | 44 / 45 (-3%) | 0.462 / 0.545 (-15%) | 0.783 / 0.937 (-16%) | 0.742 / 1.248 (-41%) | 0.059 / 0.060 (-2%) | 0.011 / 0.015 (-24%) | 365 / 254 | 2.9 / 2.2 |
| d+Au 200 GeV 0-5% | 17 / – | 17 / – | 0.682 / – | 0.293 / – | 22 / 21 (+3%) | 0.324 / 0.387 (-16%) | 0.466 / 0.621 (-25%) | 0.378 / 0.893 (-58%) | 0.021 / 0.112 (-81%) | -0.013 / 0.017 (-178%) | 268 / 205 | 2.7 / 2.7 |

## Timescale references

| Quantity | Model (Pb-Pb 5.02 TeV 0-5%) | Literature |
|---|---|---|
| QGP lifetime (entropy fraction above T_c < 10%) | 8.5 fm/c | 5-10 fm/c (Heinz & Snellings 2013) |
| median kinetic freeze-out τ | 9.7 fm/c | decoupling 10-11 fm/c (ALICE HBT, 1012.4035) |
| T at τ = 1 fm/c (hottest cell) | 427 MeV | 300-500 MeV (ε_Bj lower bound 300 MeV at 2.76 TeV; direct photons) |
| γ, y_beam | 2673, 8.58 | 2673, 8.58 (kinematics) |

## Data sources per case

- Pb+Pb 5020 GeV 0-5%: mult PbPb_5020, yields PbPb_5020, flow PbPb_5020
- Pb+Pb 5020 GeV 30-40%: mult PbPb_5020, yields PbPb_5020, flow PbPb_5020
- Pb+Pb 5020 GeV 60-70%: mult PbPb_5020, yields PbPb_5020, flow PbPb_5020
- Au+Au 200 GeV 0-5%: mult AuAu_200, yields AuAu_200, flow AuAu_200
- Au+Au 200 GeV 30-40%: mult AuAu_200, yields AuAu_200, flow AuAu_200
- Pb+Pb 2760 GeV 0-5%: mult PbPb_2760, yields PbPb_2760, flow PbPb_2760
- Xe+Xe 5440 GeV 0-5%: mult XeXe_5440, yields PbPb_5020, flow PbPb_5020
- O+O 5360 GeV 0-5%: mult OO_5360, yields PbPb_5020, flow PbPb_5020
- Ne+Ne 5360 GeV 0-5%: mult NeNe_5360, yields PbPb_5020, flow PbPb_5020
- Au+Au 62.4 GeV 0-5%: mult AuAu_62, yields AuAu_200, flow AuAu_200
- Au+Au 19.6 GeV 0-5%: mult AuAu_20, yields AuAu_200, flow AuAu_200
- p+Pb 5020 GeV 0-5%: mult pPb_5020, yields pPb_5020, flow pPb_5020
- d+Au 200 GeV 0-5%: mult dAu_200, yields AuAu_200, flow AuAu_200

## Predictions vs measurements that are not model inputs

These systems have no multiplicity/flow table in the model: N_part is pure Glauber, dN_ch/dη comes from the TRENTo entropy integral normalised on Au-Au / Pb-Pb (scripts/calibrate_trento_norm.py), v₂ from the flow response at equal multiplicity.

| Case | Quantity | Model | Measured | Source |
|---|---|---|---|---|
| UU_193_0_5 | N_part | 430.5 | 418.8 ± 5.0 | PHENIX PRC 93 (2016) 024901 arXiv:1509.06727 Table XXX |
| UU_193_0_5 | dN_ch/dη (TRENTo route) | 803 | 830.4 ± 67.8 | PHENIX PRC 93 (2016) 024901 arXiv:1509.06727 Table XXX |
| UU_193_top1_v2 | v₂ (random orientations) | 0.0329 | 0.0272 ± 0.001 | STAR PRL 115 (2015) 222301 arXiv:1505.07812, v2{2} at Mult/<Mult>=1 in the top 1% ZDC class, |eta|<1, 0.2<pT<2 GeV/c |
| CuAu_200_0_5 | N_part | 188.1 | 189.0 ± 5.2 | PHENIX arXiv:1509.06727 Table XXVIII |
| CuAu_200_0_5 | dN_ch/dη (TRENTo route) | 343 | 333.5 ± 25.0 | PHENIX arXiv:1509.06727 Table XXVIII |
| RuRu_200_0_5 | N_part | 167.8 | 166.8 ± 0.1 | STAR PRC 105 (2022) 014901 arXiv:2109.00131 Table III |
| ZrZr_200_0_5 | N_part | 166.1 | 165.9 ± 0.1 | STAR arXiv:2109.00131 Table III |
| dAu_200_0_5 | N_part | 16.9 | 17.8 ± 1.2 | PHENIX arXiv:1509.06727 Table XXXII |
| He3Au_200_0_5 | N_part | 24.1 | 25.0 ± 2.0 | PHENIX arXiv:1509.06727 Table XXXIV |
| pPb_5020_0_5 | N_part | 15.0 | 15.7 ± – | ALICE PRC 91 (2015) 064905 arXiv:1412.6828 Table 2 (V0A, Glauber-NBD) |
| NeNe_5360_0_5 | N_part | 33.0 | 32.97 ± 0.5 | ATLAS arXiv:2606.20257 App. Table 1 (average of the 1% bins) |
