# Space-time evolution of a relativistic heavy-ion collision (t > 0)

Reference for a physically accurate Blender animation. Every number is cited; values derived from cited inputs are marked **[derived]**; values not verified are marked **[not verified]**. Units: 1 fm/c = 3.34 x 10^-24 s; hbar c = 0.19733 GeV fm.

## 1. Stages and timescales

| Stage | What happens | RHIC Au-Au 200 GeV | LHC Pb-Pb 2.76 / 5.02 TeV | Source |
|---|---|---|---|---|
| 0. Overlap | Two Lorentz-contracted discs cross; t = 0 at full overlap. Crossing time ~ 2R/gamma: gamma ~ 107 (RHIC), ~ 1470 (2.76 TeV), ~ 2680 (5.02 TeV) **[derived]** | ~0.1 fm/c | < 0.01 fm/c | kinematics |
| 1. Glasma / pre-equilibrium | Longitudinal colour fields (CGC), decohere on timescale ~ 1/Q_s; "bottom-up" kinetic stages | tau ~ 0.1-0.4 fm/c | same | Schlichting & Teaney, Ann. Rev. Nucl. Part. Sci. 69 (2019) 447, arXiv:1908.02113 |
| 2. Hydrodynamization tau_0 | T^{mu nu} handed to viscous hydro | 0.2-0.4 fm/c (Heinz & Snellings); tau_switch = 0.4 fm/c (IP-Glasma+MUSIC); "tau_hydro ~ 1 fm/c" (Schlichting-Teaney) | same | Heinz & Snellings, Ann. Rev. Nucl. Part. Sci. 63 (2013) 123, arXiv:1301.2826; Schenke, Shen, Tribedy, PRC 102 (2020) 044905, arXiv:2005.14682 |
| 3. QGP hydrodynamic expansion | Viscous hydro "describes the main part of the fireball evolution (the next 5-10 fm/c, depending on collision energy and geometry)" | ~5 fm/c | ~10 fm/c | Heinz & Snellings arXiv:1301.2826 |
| 4. Hadronization / crossover | T_c = 156.5 +/- 1.5 MeV (HotQCD); crossover region 145-163 MeV, epsilon_c = 0.18-0.5 GeV/fm^3 | | | HotQCD, PLB 795 (2019) 15, arXiv:1812.08235; HotQCD PRD 90 (2014) 094503, arXiv:1407.6387 |
| 5. Chemical freeze-out | Hadron abundances fixed: T_CF = 156.5 +/- 1.5 MeV, mu_B = 0.7 +/- 3.8 MeV, V = 5280 +/- 410 fm^3 per unit rapidity (central Pb-Pb 2.76 TeV) | T_chem = 159.3 +/- 5.8 MeV, mu_B = 21.9 +/- 4.5 MeV (0-5%) | as left | Andronic, Braun-Munzinger, Redlich, Stachel, Nature 561 (2018) 321, arXiv:1710.09425; STAR PRC 79 (2009) 034909, arXiv:0808.2041 (Table X) |
| 6. Hadronic rescattering | Elastic/resonant scattering, decays | hybrid model: hadronic phase lasts ~10-20 fm/c; last-interaction times peak at 20-30 fm/c (vs ~10 fm/c without rescattering) | ALICE K*(892)0/K: chemical -> kinetic freeze-out duration ~4-7 fm/c (central) | Nonaka & Bass, arXiv:nucl-th/0607018 (PRC 75 (2007) 014902); ALICE PLB 802 (2020) 135225, arXiv:1910.14419 |
| 7. Kinetic freeze-out | Momenta fixed; blast-wave T_kin, <beta_T> | T_kin = 89 +/- 12 MeV, <beta> = 0.592 +/- 0.051 (0-5%) | T_kin = 95 +/- 4 +/- 10 MeV, <beta_T> = 0.651 +/- 0.004 +/- 0.020 (0-5%, 2.76 TeV) | STAR arXiv:0808.2041; ALICE PRC 88 (2013) 044910, arXiv:1303.0737 |
| 8. Decoupling time (HBT) | Pion emission ends | ~7-8 fm/c **[derived: LHC value / 1.4]** | tau_f = 10-11 fm/c, "40% larger than at RHIC" | ALICE PLB 696 (2011) 328, arXiv:1012.4035 |
| 9. Free streaming | Hadrons fly to detector; weak decays (K0s, Lambda, ...) on cm scales | | | |

Notes: "kinetic freeze-out" is species- and position-dependent, continuous, not a single surface (Nonaka & Bass). 5.02 TeV timescales are not separately measured in the sources above; use the 2.76 TeV values (v_n grow only 3-10%, see Sec. 3).

## 2. Bjorken model (longitudinal boost-invariant expansion)

Milne coordinates (proper time, space-time rapidity):
```
tau = sqrt(t^2 - z^2),   eta_s = (1/2) ln[(t+z)/(t-z)]
t = tau cosh(eta_s),      z = tau sinh(eta_s),   v_z = z/t = tanh(eta_s)
ds^2 = dtau^2 - dx^2 - dy^2 - tau^2 deta_s^2
```
Boost invariance: all fields depend on tau only (not on eta_s) near midrapidity. Ideal-fluid Bjorken equation and its conformal (p = epsilon/3) solution:
```
d(epsilon)/d(tau) = -(epsilon + p)/tau
epsilon ∝ tau^(-4/3),   T ∝ tau^(-1/3),   s·tau = const
```
(Bjorken, PRD 27 (1983) 140.)

Bjorken energy-density estimate (Bjorken 1983, as used by PHENIX/ALICE):
```
epsilon_Bj = (1/(tau_0 · A_T)) · dE_T/dy
```
A_T = transverse overlap area (Glauber), tau_0 = formation time (conventionally 1 fm/c).

| System | dE_T/deta (0-5%) | epsilon_Bj · tau_0 | Source |
|---|---|---|---|
| Au-Au 200 GeV | (see paper tables) | 5.4 +/- 0.6 GeV/(fm^2 c) | PHENIX PRC 71 (2005) 034908, arXiv:nucl-ex/0409015 |
| Au-Au 130 GeV | | 4.7 +/- 0.5 GeV/(fm^2 c) | same |
| Pb-Pb 2.76 TeV | 1737 +/- 6 +/- 97 GeV | 12.3 +/- 1.0 GeV/(fm^2 c) | ALICE PRC 94 (2016) 034903, arXiv:1603.04775 |
| Pb-Pb 5.02 TeV | **[not verified in this pass]** | | |

Initial temperature (mapping epsilon to T with the HotQCD table in Sec. 4) **[derived]**:
- LHC 2.76 TeV: epsilon = 12.3 GeV/fm^3 at tau = 1 fm/c -> T ≈ 300 MeV; at tau = 0.4 fm/c, epsilon ≈ 31 GeV/fm^3 -> T ≈ 365 MeV.
- RHIC 200 GeV: 5.4 GeV/fm^3 at 1 fm/c -> T ≈ 250 MeV; at 0.4 fm/c, 13.5 GeV/fm^3 -> T ≈ 305 MeV.
- Bjorken epsilon is a lower bound (ignores work done during expansion).

Independent constraints from direct photons: PHENIX inverse slope 221 +/- 19 +/- 19 MeV; hydro models with "initial temperatures ranging from 300-600 MeV at times of ~0.6-0.15 fm/c" agree with data (PHENIX PRL 104 (2010) 132301, arXiv:0804.4168). ALICE Pb-Pb 2.76 TeV 0-20%: inverse slope 297 +/- 12 +/- 41 MeV (PLB 754 (2016) 235, arXiv:1509.07324). Since photons are emitted throughout, T_0 exceeds these; T_0 ~ 300-500 MeV is the consistent range.

Toy check for the animation **[derived, ideal 1D Bjorken]**: T ∝ tau^(-1/3) from 365 MeV at 0.4 fm/c reaches 155 MeV at tau ≈ 5 fm/c (LHC); from 305 MeV: tau ≈ 3 fm/c (RHIC). Transverse expansion cools faster in 3D, so the real QGP phase is of order this or slightly longer at LHC (~5-10 fm/c, Heinz & Snellings).

## 3. Hydrodynamic expansion, flow, viscosity

Transverse (radial) flow at kinetic freeze-out, blast-wave fits (ALICE arXiv:1303.0737, Table 5; Pb-Pb 2.76 TeV):

| Centrality | <beta_T> | T_kin (GeV) | n |
|---|---|---|---|
| 0-5% | 0.651 +/- 0.004 +/- 0.020 | 0.095 +/- 0.004 +/- 0.010 | 0.712 |
| 20-30% | 0.625 +/- 0.004 +/- 0.025 | 0.101 +/- 0.004 +/- 0.012 | 0.779 |
| 40-50% | 0.574 +/- 0.005 +/- 0.016 | 0.112 +/- 0.004 +/- 0.013 | 0.944 |
| 60-70% | 0.489 +/- 0.008 +/- 0.024 | 0.129 +/- 0.005 +/- 0.017 | 1.292 |
| 80-90% | 0.357 +/- 0.016 +/- 0.084 | 0.151 +/- 0.006 +/- 0.044 | 2.262 |

"About 10% stronger radial flow than at RHIC" (ALICE). STAR Au-Au 200 GeV (arXiv:0808.2041, Table X): 0-5%: T_kin = 89 +/- 12 MeV, <beta> = 0.592 +/- 0.051, n = 0.82; 70-80%: T_kin = 129 +/- 14 MeV, <beta> = 0.358 +/- 0.084. The surface velocity is beta_s = <beta>(2+n)/2 -> beta_s ≈ 0.88 (LHC central) **[derived]**.

Size: HBT homogeneity radii at low k_T (these are lengths of homogeneity, smaller than the full source):
- Pb-Pb 2.76 TeV central, k_T = 0.26 GeV/c: R_out = 6.92 +/- 0.12 +/- 0.61 fm, R_side = 6.36 +/- 0.12 +/- 0.54 fm, R_long = 8.03 +/- 0.15 +/- 0.42 fm; R_out R_side R_long is 2x the RHIC value (ALICE arXiv:1012.4035).
- Au-Au 200 GeV 0-5%, k_T = 0.15-0.25 GeV/c: R_out = 6.16, R_side = 5.39, R_long = 6.64 fm (stat. errors 0.01-0.02) (STAR PRC 71 (2005) 044906, arXiv:nucl-ex/0411036).
- Initial size: Pb Woods-Saxon radius ~6.6 fm, so the overlap of a central collision has R ~ 6-7 fm. Its growth to ~10-14 fm at freeze-out (as in blast-wave reconstructions of the full source) is **[not verified in this pass]**; a safe, consistent animation rule is R(tau) ≈ R_0 + <beta_T>·(tau - tau_0) with <beta_T> ~ 0.6, giving ~ +6 fm over 10 fm/c **[derived]**.

Shear viscosity:
- KSS bound eta/s >= 1/(4 pi) ≈ 0.08 (Kovtun, Son, Starinets, PRL 94 (2005) 111601, arXiv:hep-th/0405231).
- Heinz & Snellings 2013: (eta/s)_QGP ≈ 0.2 = 2.5/(4 pi) at LHC temperatures, "perhaps a bit smaller at RHIC"; ~50% systematic uncertainty.
- JETSCAPE Bayesian (PRL 126 (2021) 242301, arXiv:2010.03928; PRC 103 (2021) 054904, arXiv:2011.01430): "most likely values for eta/s are of order 0.1" at T ~ 150-250 MeV; zeta/s ~ 0.05-0.1 with a peak near the crossover; no constraint above ~250 MeV.
- IP-Glasma+MUSIC+UrQMD global fit uses eta/s = 0.12 and a Gaussian zeta/s peaked at T = 160 MeV (height 0.13) (Schenke, Shen, Tribedy arXiv:2005.14682).
- Bernhard, Moreland, Bass, Nature Phys. 15 (2019) 1113 (DOI 10.1038/s41567-019-0611-8): temperature-dependent eta/s, zeta/s posteriors; specific numbers **[not verified here]**.

Anisotropic flow: v_n arise from initial-state eccentricities epsilon_n converted by pressure gradients; v2 ∝ epsilon_2 (elliptic geometry) and v3 from fluctuations.
- Pb-Pb 5.02 TeV: v2{2,|Δeta|>1} reaches a maximum of 0.104 +/- 0.001 +/- 0.002 in 40-50%; v2, v3, v4 increase by (3.0 +/- 0.6)%, (4.3 +/- 1.4)%, (10.2 +/- 3.8)% vs 2.76 TeV (0-50%) (ALICE PRL 116 (2016) 132302, arXiv:1602.01119). The centrality shape: small in 0-5%, rising to the 40-50% maximum, then falling (values for other bins are in the figures, not verified numerically).
- Pb-Pb 2.76 TeV: integrated v2 = 0.087 +/- 0.002 +/- 0.004 in 40-50%, "about 30%" above RHIC 200 GeV (ALICE PRL 105 (2010) 252302, arXiv:1011.3914).
- Au-Au 200 GeV: hence v2 (40-50%) ≈ 0.067 **[derived]**; STAR's full centrality dependence is in PRC 72 (2005) 014904, arXiv:nucl-ex/0409033 (Fig. 29; numbers not extracted).

## 4. Equation of state (lattice QCD, 2+1 flavours)

T_c: HotQCD 156.5 +/- 1.5 MeV (arXiv:1812.08235). Wuppertal-Budapest (JHEP 09 (2010) 073, arXiv:1005.3508), continuum, physical masses: chiral condensate 155(3)(3) MeV, chiral susceptibility 147(2)(3) MeV, strange susceptibility 165(5)(3) MeV — the spread reflects the broad crossover. WB EoS (PLB 730 (2014) 99, arXiv:1309.5258): trace anomaly peaks slightly above 4 near T ≈ 200-215 MeV; perfect HRG agreement below T_c.

HotQCD EoS (PRD 90 (2014) 094503, arXiv:1407.6387, Table 1; last two columns **[derived]** via epsilon = (epsilon/T^4)·T^4/(hbar c)^3):

| T (MeV) | p/T^4 | epsilon/T^4 | s/T^3 | c_s^2 | epsilon (GeV/fm^3) | p (GeV/fm^3) |
|---|---|---|---|---|---|---|
| 130 | 0.439 | 2.33 | 2.77 | 0.168 | 0.087 | 0.016 |
| 140 | 0.529 | 3.05 | 3.58 | 0.146 | 0.15 | 0.026 |
| 150 | 0.651 | 4.05 | 4.70 | 0.144 | 0.27 | 0.043 |
| 155 | 0.726 | 4.61 | 5.34 | 0.148 | 0.35 | 0.055 |
| 160 | 0.808 | 5.19 | 6.00 | 0.153 | 0.44 | 0.069 |
| 170 | 0.994 | 6.32 | 7.32 | 0.167 | 0.69 | 0.11 |
| 180 | 1.197 | 7.33 | 8.53 | 0.185 | 1.00 | 0.16 |
| 200 | 1.613 | 8.89 | 10.50 | 0.218 | 1.85 | 0.34 |
| 250 | 2.476 | 10.99 | 13.47 | 0.261 | 5.6 | 1.26 |
| 300 | 3.072 | 12.18 | 15.25 | 0.282 | 12.8 | 3.2 |
| 400 | 3.782 | 13.34 | 17.12 | 0.304 | 44 | 12.6 |

Uncertainties ~10% (see the paper). For colour coding: T < 130 MeV hadron gas; 145-163 MeV crossover band (epsilon ≈ 0.18-0.5 GeV/fm^3); T > 170 MeV QGP; c_s^2 minimum ≈ 0.14 at T ≈ 145-150 MeV (softest point).

## 5. Cooper-Frye freeze-out and the blast wave

Cooper & Frye, PRD 10 (1974) 186:
```
E dN/d^3p = g/(2 pi)^3 · ∫_Sigma f(x,p) p^mu d^3sigma_mu
f = 1/[exp((p·u(x) - mu)/T(x)) ∓ 1] + delta f     (- bosons, + fermions; delta f = viscous correction)
```
Sigma is the particlization hypersurface, in practice an isothermal (T_sw ≈ 150-160 MeV) or iso-energy-density surface (e.g. e_sw = 0.18 GeV/fm^3 in IP-Glasma+MUSIC+UrQMD, arXiv:2005.14682), found by Cornelius-type algorithms in MUSIC/vHLLE. Samplers (iSS, iS3D) draw hadrons from f on each surface element; negative contributions (p·dsigma < 0) are discarded or handled. Emission is thermal in the local rest frame, boosted by u^mu (x): this is why spectra harden with mass (radial flow).

Blast-wave parametrization (Schnedermann, Sollfrank, Heinz, PRC 48 (1993) 2462, arXiv:nucl-th/9307020), as used by STAR/ALICE:
```
dN/(m_T dm_T) ∝ ∫_0^R r dr  m_T  I_0( p_T sinh(rho)/T_kin )  K_1( m_T cosh(rho)/T_kin )
rho = atanh( beta_T(r) ),   beta_T(r) = beta_s (r/R)^n,   <beta_T> = 2 beta_s/(2+n)
```
Parameters in Sec. 3. For the animation: at freeze-out, emit each hadron with a thermal momentum (T_kin ≈ 90-100 MeV) in the local frame, then boost by beta_T(r) radially and by v_z = z/t longitudinally.

## 6. Hadronic rescattering stage

After particlization, hadrons scatter (UrQMD/SMASH afterburner). Duration: the 3D-hydro+UrQMD model (T_sw = 150 MeV, Au-Au 200 GeV) puts most last-interaction times at 20-30 fm/c, i.e. a hadronic phase of ~10-20 fm/c (Nonaka & Bass, arXiv:nucl-th/0607018). Experimentally, ALICE infers ~4-7 fm/c between chemical and kinetic freeze-out in central Pb-Pb from K*(892)0/K suppression (arXiv:1910.14419), so K*(892) (lifetime ~4 fm/c) decays and its daughters rescatter, while phi(1020) mostly survives. Freeze-out is continuous: heavy/strange hadrons decouple earlier than pions.

## 7. Open-source simulation codes (for real data in Blender)

| Code | Stage | Language / licence | Output formats | Reference |
|---|---|---|---|---|
| TRENTo | initial state | C++ / MIT | stdout per event (b, N_part, mult, e2-e5), text grids, HDF5 | Moreland, Bernhard, Bass, PRC 92 (2015) 011901, arXiv:1412.4708 |
| KoMPoST | pre-equilibrium | C++ / MIT | evolved T^{mu nu} grid; MUSIC-ready initial condition | Kurkela et al., PRL 122 (2019) 122302, arXiv:1805.01604 |
| MUSIC | 3+1D viscous hydro | C++ / GPL-2.0 | freeze-out hypersurface (Cornelius), evolution snapshots (T, epsilon, u^mu per cell) | Schenke, Jeon, Gale, PRC 82 (2010) 014903, arXiv:1004.1408 |
| vHLLE | 3+1D viscous hydro | C++17 / GPL-2.0 | ASCII evolution (tau, x, y, z, v, epsilon, T, n_B, pi^{mu nu}, Pi), Cornelius hypersurface; reads Glauber/Gubser/GLISSANDO/TRENTo/SMASH IC | Karpenko, Huovinen, Bleicher, CPC 185 (2014) 3016, arXiv:1312.4160 |
| iEBE-VISHNU | full hybrid chain (superMC -> VISHNew -> iSS -> osc2u -> UrQMD) | Python/Fortran/C++ / GPL-3.0 | SQLite (collected.db), text export; OSCAR between modules | Shen et al., CPC 199 (2016) 61, arXiv:1409.8164 |
| iS3D | Cooper-Frye sampler | C++/CUDA / MIT | particle lists (iEBE/OSCAR-compatible), smooth spectra | McNelis, Everett, Heinz, arXiv:1912.08271 |
| JETSCAPE (v4.0.2) | framework: TRENTo, MUSIC, iS3D, SMASH, MATTER, LBT, Pythia | C++ / GPL-3.0 | ASCII, gzipped ASCII, HepMC3 | Putschke et al., arXiv:1903.07706 |
| SMASH | hadronic transport / afterburner (List modus reads OSCAR2013) | C++17 / GPL-3.0+ (mixed) | ASCII/OSCAR1999/OSCAR2013, binary, ROOT, VTK (visualization!), HepMC3 ascii/ROOT, YODA; "Particles at regular time intervals" | Weil et al., PRC 94 (2016) 054905, arXiv:1606.06642 |
| UrQMD 3.x | hadronic transport / afterburner | Fortran / "UrQMD user licence" (cite, restricted redistribution; not OSI) | file13-16/19/20 ASCII, OSCAR 1997A/1999A/2013 | Bass et al., PPNP 41 (1998) 255, nucl-th/9803035; Bleicher et al., J. Phys. G 25 (1999) 1859, hep-ph/9909407 |
| AMPT | HIJING + parton cascade + coalescence + ART | Fortran 77 / no licence stated on site | parton & hadron freeze-out lists (ASCII) | Lin et al., PRC 72 (2005) 064901, nucl-th/0411110 |
| EPOS LHC / EPOS4 | full event generator with core-corona hydro | Fortran/C++; via CRMC (licence not stated in README) | HepMC/HepMC3, ROOT, LHE, Rivet (CRMC) | Pierog et al., PRC 92 (2015) 034906, arXiv:1306.0121; Werner arXiv:2301.12517 |
| HIJING 1.38 | minijet/string generator (no QGP) | Fortran; in CRMC (marked obsolete); licence **[not verified]** | via CRMC as above | Wang & Gyulassy, PRD 44 (1991) 3501 |
| Pythia 8.318 / Angantyr | pA/AA generator (no hydro) | C++ / GPL-2.0-or-later | HepMC2/HepMC3 (Pythia8ToHepMC3), native event record | Bierlich et al., JHEP 10 (2018) 134, arXiv:1806.10820 |

Practical pipeline for the animation: TRENTo (or IP-Glasma) grid -> MUSIC/vHLLE evolution snapshots (T(x,y,eta_s,tau) for volumetric colouring by the Sec. 4 table) -> hypersurface -> iS3D/iSS -> SMASH with Particles output at fixed time steps (VTK or OSCAR2013, columns t x y z p0 px py pz m pdg id charge) for per-hadron trajectories. Note SMASH output is in Cartesian t, not tau; convert with Sec. 2.

## References
1. Bjorken, PRD 27 (1983) 140. 10.1103/PhysRevD.27.140
2. Cooper & Frye, PRD 10 (1974) 186. 10.1103/PhysRevD.10.186
3. Schnedermann, Sollfrank, Heinz, PRC 48 (1993) 2462, nucl-th/9307020
4. HotQCD (Bazavov et al.), PLB 795 (2019) 15, arXiv:1812.08235
5. HotQCD (Bazavov et al.), PRD 90 (2014) 094503, arXiv:1407.6387
6. Borsanyi et al. (WB), JHEP 09 (2010) 073, arXiv:1005.3508
7. Borsanyi et al. (WB), PLB 730 (2014) 99, arXiv:1309.5258, 10.1016/j.physletb.2014.01.007
8. Andronic, Braun-Munzinger, Redlich, Stachel, Nature 561 (2018) 321, arXiv:1710.09425, 10.1038/s41586-018-0491-6
9. ALICE, PRC 88 (2013) 044910, arXiv:1303.0737
10. STAR, PRC 79 (2009) 034909, arXiv:0808.2041
11. STAR, PRC 96 (2017) 044904, arXiv:1701.07065 (BES freeze-out; 200 GeV values taken from ref. 10)
12. ALICE, PLB 696 (2011) 328, arXiv:1012.4035
13. STAR, PRC 71 (2005) 044906, arXiv:nucl-ex/0411036
14. PHENIX, PRC 71 (2005) 034908, arXiv:nucl-ex/0409015
15. ALICE, PRC 94 (2016) 034903, arXiv:1603.04775
16. PHENIX, PRL 104 (2010) 132301, arXiv:0804.4168
17. ALICE, PLB 754 (2016) 235, arXiv:1509.07324
18. ALICE, PRL 116 (2016) 132302, arXiv:1602.01119
19. ALICE, PRL 105 (2010) 252302, arXiv:1011.3914
20. STAR, PRC 72 (2005) 014904, arXiv:nucl-ex/0409033
21. Kovtun, Son, Starinets, PRL 94 (2005) 111601, hep-th/0405231
22. Heinz & Snellings, Ann. Rev. Nucl. Part. Sci. 63 (2013) 123, arXiv:1301.2826
23. Schlichting & Teaney, Ann. Rev. Nucl. Part. Sci. 69 (2019) 447, arXiv:1908.02113
24. Kurkela, Mazeliauskas, Paquet, Schlichting, Teaney, PRL 122 (2019) 122302, arXiv:1805.01604
25. Schenke, Shen, Tribedy, PRC 102 (2020) 044905, arXiv:2005.14682
26. JETSCAPE, PRL 126 (2021) 242301, arXiv:2010.03928; PRC 103 (2021) 054904, arXiv:2011.01430
27. Bernhard, Moreland, Bass, Nature Phys. 15 (2019) 1113, 10.1038/s41567-019-0611-8
28. Nonaka & Bass, PRC 75 (2007) 014902, nucl-th/0607018
29. ALICE, PLB 802 (2020) 135225, arXiv:1910.14419
30. Codes: Schenke, Jeon, Gale PRC 82 (2010) 014903, arXiv:1004.1408; Karpenko, Huovinen, Bleicher CPC 185 (2014) 3016, arXiv:1312.4160; Shen et al. CPC 199 (2016) 61, arXiv:1409.8164; McNelis, Everett, Heinz arXiv:1912.08271; Putschke et al. arXiv:1903.07706; Weil et al. PRC 94 (2016) 054905, arXiv:1606.06642; Bass et al. PPNP 41 (1998) 255, nucl-th/9803035; Bleicher et al. J. Phys. G 25 (1999) 1859, hep-ph/9909407; Moreland, Bernhard, Bass PRC 92 (2015) 011901, arXiv:1412.4708; Lin et al. PRC 72 (2005) 064901, nucl-th/0411110; Pierog et al. PRC 92 (2015) 034906, arXiv:1306.0121; Werner arXiv:2301.12517; Wang & Gyulassy PRD 44 (1991) 3501; Bierlich, Gustafson, Lönnblad, Shah JHEP 10 (2018) 134, arXiv:1806.10820.

Not verified in this pass: the 5.02 TeV Bjorken energy density, the full v2-vs-centrality tables for both energies, the "R grows to 10-14 fm" full-source radius, the Bernhard 2019 eta/s numbers, and the AMPT/HIJING/CRMC licences.
