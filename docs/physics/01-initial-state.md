# Initial-State Geometry Reference for Relativistic Heavy-Ion Collisions (t ≤ 0)

Scope: nuclear density, Glauber MC procedure, Lorentz contraction, eccentricities, TRENTo. All numbers carry a source tag; anything not verified is marked **[unverified]**.

## 1. Nuclear density

**2pF / 3pF (Woods-Saxon) form** [Miller07, PHOBOS14]:

```
rho(r) = rho0 * (1 + w (r/R)^2) / (1 + exp((r - R)/a))
```
R = half-density radius, a = skin (diffuseness), w = 0 for 2pF.

**Deformed nuclei** [PHOBOS14, STAR22]:
```
rho(r,theta) = rho0 / (1 + exp((r - R(theta))/a)),
R(theta) = R [1 + beta2 Y20(theta) + beta4 Y40(theta)]
Y20 = sqrt(5/16pi) (3cos^2 theta - 1),  Y40 = (3/(16 sqrt(pi))) (35 cos^4 theta - 30 cos^2 theta + 3)
```
The orientation of each deformed nucleus is sampled uniformly in polar/azimuthal angle event-by-event [PHOBOS14].

### 1.1 Parameter table (fm, dimensionless β)

| Nucleus | R | a | w | β2 | β4 | Notes / source |
|---|---|---|---|---|---|---|
| p | exp(−r/R), R = 0.234 | – | – | – | – | Exponential from proton rms charge radius [PHOBOS14 Tab. I] |
| d | Hulthén: a = 0.228 fm⁻¹, b = 1.18 fm⁻¹ | – | – | – | – | φ(r_pn) ∝ (e^{−a r} − e^{−b r})/r; neutron placed opposite to proton [Miller07 Eq. 2; PHOBOS14] |
| ³He | GFMC configurations (AV18+UIX) | – | – | – | – | Tabulated 3-body configurations, not a WS form [PHOBOS14, Nagle et al. PRL 113 112301] |
| ¹⁶O | 2.608 | 0.513 | −0.051 | – | – | 3pF (ADNDT). Alternative HO: a = 1.833 fm, α = 1.544 [LKD25 Tab. 1; PHOBOS14 Tab. I prints w = −0.51 — likely typographic; ADNDT value is −0.051] |
| ²⁰Ne | 2.805 | 0.571 | 0 | 0.721 ("NeTr2") | – | 2pF (ADNDT). β2 = 0.721 quoted from search-extracted Table 1 of [LKD25] **[unverified row]**; ab-initio (NLEFT/PGCM) "bowling-pin" α+¹⁶O configurations are the current ALICE standard [ALICE25] |
| ⁶³Cu | 4.20 ± 0.02 | 0.596 ± 0.008 | 0 | 0.162 | −0.006 | [PHOBOS14 Tab. I/II; LKD18 Tab. VI/VIII; Miller07: R = 4.20641, a = 0.5977] |
| ⁹⁶Ru | 5.085 | 0.46 | 0 | 0.158 (Case-1) / 0.053 (Case-2) | – | STAR isobar Tab. II [STAR22]; Case-3 (DFT, spherical): R = 5.067, a = 0.500 |
| ⁹⁶Zr | 5.02 | 0.46 | 0 | 0.08 (Case-1) / 0.217 (Case-2) | – | [STAR22 Tab. II]; Case-3 (DFT, spherical): R = 4.965, a = 0.556 (thicker neutron skin, "halo-type") |
| ¹²⁹Xe | 5.36 ± 0.10 (ALICE quotes 5.4 ± 0.1) | 0.59 ± 0.07 | 0 | 0.18 ± 0.02 | 0 | Scaled from ¹³²Xe by (129/132)^{1/3}; β2 interpolated between even-A Xe isotopes [ALICE18 Xe; LKD18 Tab. VI/VIII; PHOBOS14 "Xe2a": β2 = 0.161, β4 = −0.003] |
| ¹⁹⁷Au | 6.38 ± 0.06 | 0.535 ± 0.027 | 0 | −0.131 | −0.031 | Oblate [PHOBOS14 Tab. II; LKD18 Tab. VI/VIII; Miller07]. Shou et al. re-fit: R = 6.42, a = 0.41, β2 = −0.13 [Shou15] |
| ²⁰⁷/²⁰⁸Pb | 6.62 ± 0.06 (²⁰⁷Pb charge) / 6.624 ± 0.035 (²⁰⁸Pb) | 0.546 ± 0.010 / 0.549 ± 0.008 | 0 | 0 | 0 | Doubly magic, spherical [LKD18 Tab. IV; ALICE16] |
| ²⁰⁸Pb point p / n | 6.68 ± 0.02 / 6.69 ± 0.03 | 0.447 ± 0.01 / 0.560 ± 0.03 | 0 | 0 | 0 | "D2pF": 82 protons and 126 neutrons drawn from separate 2pF [LKD18 Tab. IV] |
| ²³⁸U | 6.67 | 0.44 | 0 | 0.28 | 0.093 | Prolate [PHOBOS14 Tab. II, β from Möller et al.]. Shou et al.: old (6.8054, 0.605, 0.2863) → new (6.86, 0.42, 0.265) [Shou15 Tab. 1] |

### 1.2 Neutron skin
- ²⁰⁸Pb: PREX-II R_n − R_p = 0.283 ± 0.071 fm [PREX21]. From LHC Pb-Pb flow/multiplicity global analysis: Δr_np = 0.217 ± 0.058 fm [GNvdS23]. In Glauber, the skin is implemented through the neutron diffuseness a_n − a_p ≈ 0.1 fm with R_n ≈ R_p ≈ 6.7 fm [LKD18; dEL20].
- ⁹⁶Ru/⁹⁶Zr: DFT "Case-3" parameters above encode the skin difference; a recent extraction from STAR isobar data gives a relative skin-thickness difference (Zr−Ru) of 0.278 ± 0.018 fm [arXiv:2608.13935 — **[not independently verified]**].
- ALICE 5.02 TeV Pb-Pb: total hadronic cross section 7.67 ± 0.25 b vs Glauber prediction 7.62 ± 0.15 b using R ≈ 6.7 fm, a_p ≈ 0.45 fm, a_n ≈ 0.56 fm, σ_NN ≈ 67 mb [ALICE22 lumi].

## 2. Glauber Monte Carlo procedure

**Sampling nucleons** [PHOBOS14, LKD18]: draw r from 4πr²ρ(r), angles uniform; reject and resample if any pair in the same nucleus is closer than **d_min = 0.4 fm** (PHOBOS default; ALICE and LKD18 quote 0.4 ± 0.4 fm, i.e. varied 0–0.8 fm for systematics). LKD18's improved model uses a lattice "node distance" d_node = 0.4 ± 0.4 fm plus recentering of each nucleus to (0,0,0) with reweighting. PHENIX studied a 0.8 fm hard core [Miller07].

**Impact parameter**: dN/db ∝ b (i.e. dσ/db = 2πb) up to b_max ≃ 20 fm > 2R_A; nuclei shifted to (∓b/2, 0, 0); nucleons travel straight along z (eikonal); longitudinal coordinate plays no role [PHOBOS14, Miller07].

**Collision criterion** (black disk): nucleons i∈A, j∈B collide if transverse distance d < D = sqrt(σ_NN/π) [Miller07 Eq. (3), PHOBOS14 Eq. (5), LKD18 Eq. (11)]. σ_NN = 42 mb → D = 1.16 fm; 67.6 mb → D = 1.47 fm.

**Gaussian (soft) profile** [LKD18 App. B]: replace Θ(D − b_NN) by
```
P(b_NN) = Gamma(1/omega, b_NN^2/(D^2 omega)) / Gamma(1/omega)
```
ω = 0 → hard sphere, ω = 1 → Gaussian; ω ≈ 0.4 is suggested for LHC energies (raises N_coll by ~5% in central Pb-Pb). LKD25 use ω = 0.3 for O-O/Ne-Ne. TRENTo instead uses P_coll = 1 − exp[−σ_gg ∫T_A T_B] with σ_gg tuned to reproduce σ_NN [TRENTo15 Eq. 7].

**Definitions**: N_part = nucleons with ≥ 1 collision (wounded); N_coll = number of colliding pairs; T_AB = N_coll/σ_NN. σ_AB = 2π∫ b [1 − exp(−σ_NN T_AB(b))] db [LKD18 Eq. 8]; MC: σ_AB = (fraction of events with N_coll ≥ 1) × π b_max².

### 2.1 σ_NN^inel vs √s_NN

| √s_NN | σ_NN^inel (mb) | Source |
|---|---|---|
| 7.7 GeV | 31.2 | PHENIX Tab. IV [PHENIX16] |
| 19.6 GeV | 32.5 (PHENIX) / 32.3 (Miller07) | [PHENIX16; Miller07] |
| 39 GeV | 34.3 | [PHENIX16] |
| 62.4 GeV | 36.0 (PHENIX) / 35.6 (Miller07) | [PHENIX16; Miller07] |
| 130 GeV | 39.6 (PHENIX) / 40 (Miller07) | [PHENIX16; Miller07] |
| 200 GeV | 42.3 (PHENIX); 42 ± 3 (traditional); 41.6 ± 0.6 (fit) | [PHENIX16; PHOBOS14; LKD18 Tab. II] |
| 2.76 TeV | 61.8 ± 0.9 (traditional 64 ± 5) | [LKD18] |
| 5.02 TeV | 67.6 ± 0.6 (traditional 70 ± 5) | [LKD18; ALICE16] |
| 5.36 TeV | 68.0 ± 1.2 | [LKD25] |
| 5.44 TeV | 68.4 ± 0.5 | [LKD18; ALICE18 Xe] |
| 5.5 TeV | 68.5 ± 0.5 | [LKD18] |

Parameterization: σ_NN(s) = a + b ln^n(s), s in GeV²; a = 28.84 ± 0.52 mb, b = 0.0458 ± 0.0167 mb, n = 2.374 ± 0.123 [dEL20] (LKD18 fit: 29.8 ± 4.7, 0.038 ± 0.060, 2.43 ± 0.50).

### 2.2 Centrality
Experiments order events by multiplicity (e.g. ALICE V0M) and define percentiles of the hadronic cross section; the same cut is applied to the NBD-Glauber-simulated distribution (sources = f N_part + (1−f) N_coll, f ≈ 0.8) to obtain ⟨N_part⟩, ⟨N_coll⟩ [Miller07 §3.1.3; ALICE16]. In pure geometry, percentile c ≈ πb²/σ_AB for b ≲ 2R, so a Glauber table sliced in b gives the b-ranges below.

**Pb-Pb 5.02 TeV** (LKD18 Tab. X, improved MCG, b-sliced; ALICE PRL 116 222302 ⟨N_part⟩ in last column):

| Cent. | b_min–b_max (fm) | ⟨N_coll⟩ | ⟨N_part⟩ | ε2 | ε3 | ALICE ⟨N_part⟩ |
|---|---|---|---|---|---|---|
| 0–5% | 0–3.49 | 1762 ± 147 | 384.3 ± 16.6 | 0.072 | 0.084 | 398 ± 2 (0–2.5), 372 ± 3 (2.5–5) |
| 5–10% | 3.49–4.93 | 1380 ± 113 | 331.2 ± 17.7 | 0.112 | 0.112 | 346 ± 4 (5–7.5), 320 ± 4 (7.5–10) |
| 10–20% | 4.93–6.98 | 1088 / 855 | 283 / 241 | 0.158 / 0.202 | 0.134 / 0.154 | 263 ± 4 |
| 20–30% | 6.98–8.55 | 668 / 516 | 204 / 172 | 0.243 / 0.282 | 0.173 / 0.192 | 188 ± 3 |
| 30–40% | 8.55–9.87 | 393 / 295 | 143 / 118 | 0.318 / 0.352 | 0.212 / 0.234 | 131 ± 2 |
| 40–50% | 9.87–11.0 | 216 / 156 | 96.5 / 77.5 | 0.385 / 0.418 | 0.257 / 0.281 | 86.3 ± 1.7 |
| 50–60% | 11.0–12.1 | 109 / 74.7 | 61.2 / 47.3 | 0.450 / 0.484 | 0.307 / 0.335 | 53.6 ± 1.2 |
| 60–70% | 12.1–13.1 | 49.9 / 32.4 | 35.7 / 26.3 | 0.520 / 0.557 | 0.362 / 0.385 | 30.4 ± 0.8 |
| 70–80% | 13.1–14.0 | 20.5 / 12.9 | 18.8 / 13.1 | 0.596 / 0.634 | 0.402 / 0.409 | 15.6 ± 0.5 |
| 80–90% | 14.0–14.9 | 8.0 / 5.1 | 9.0 / 6.3 | 0.672 / 0.715 | 0.407 / 0.390 | – |
| 90–100% | 14.9–20 | 3.3 / 2.0 | 4.5 / 3.1 | 0.766 / 0.844 | 0.349 / 0.255 | – |

(Pairs "x / y" are the two 5% sub-bins.) Total σ_PbPb = 7.66 ± 0.03 b [LKD18 Tab. V]; ALICE's official note is ALICE-PUBLIC-2018-011 (CDS 2636623).

**Au-Au 200 GeV** (LKD18 Tab. XX, deformed Au, σ_NN = 41.6 mb; PHENIX PRC 69 034910 values with σ_NN = 42 mb in last two columns):

| Cent. | b (fm) | ⟨N_coll⟩ | ⟨N_part⟩ | ε2 | ε3 | PHENIX ⟨N_coll⟩ | PHENIX ⟨N_part⟩ |
|---|---|---|---|---|---|---|---|
| 0–5% | 0–3.31 | 1053 ± 92 | 351 ± 18 | 0.099 | 0.094 | 1065 ± 105.5 | 351.4 ± 2.9 |
| 5–10% | 3.31–4.68 | 831 | 298 | 0.140 | 0.122 | 854.4 ± 82.1 | 299 ± 3.8 |
| 10–20% | 4.68–6.61 | 660 / 523 | 253 / 214 | 0.186 / 0.231 | 0.144 / 0.164 | 602.6 ± 59.3 | 234.6 ± 4.7 |
| 20–30% | 6.61–8.10 | 412 / 321 | 180 / 151 | 0.273 / 0.313 | 0.184 / 0.205 | 373.8 ± 39.6 | 166.6 ± 5.4 |
| 30–40% | 8.10–9.35 | 247 / 188 | 125 / 103 | 0.349 / 0.384 | 0.227 / 0.251 | 219.8 ± 22.6 | 114.2 ± 4.4 |
| 40–50% | 9.35–10.5 | 140 / 102 | 83.4 / 66.7 | 0.418 / 0.452 | 0.277 / 0.305 | 120.3 ± 13.7 | 74.4 ± 3.8 |
| 50–60% | 10.5–11.5 | 73.4 / 51.5 | 52.4 / 40.4 | 0.485 / 0.522 | 0.337 / 0.367 | 61.0 ± 9.9 | 45.5 ± 3.3 |
| 60–70% | 11.5–12.4 | 35.3 / 23.7 | 30.5 / 22.5 | 0.560 / 0.603 | 0.397 / 0.420 | 28.5 ± 7.6 | 25.7 ± 3.8 |
| 70–80% | 12.4–13.2 | 15.6 / 10.2 | 16.2 / 11.6 | 0.646 / 0.688 | 0.431 / 0.427 | 12.4 ± 4.2 | 13.4 ± 3.0 |
| 80–92% | 13.2–14.2+ | 6.7 / 4.4 | 8.2 / 5.9 | 0.728 / 0.767 | 0.410 / 0.378 | 4.9 ± 1.2 | 6.3 ± 1.2 |

σ_AuAu = 6.80 ± 0.03 b (LKD18) / 6.9 b (PHENIX). Other systems: Xe-Xe 5.44 TeV 0–5% ⟨N_part⟩ = 236 ± 2, σ = 5.67 b [ALICE18 Xe; LKD18]; O-O 5.36 TeV 0–5% ⟨N_part⟩ = 27.2, ⟨N_coll⟩ = 48.0, σ_OO = 1.36 ± 0.09 b, σ_NeNe = 1.73 ± 0.08 b [LKD25].

## 3. Lorentz contraction

In the collider CM frame each nucleon has E = √s_NN/2, so
```
gamma = sqrt(s_NN) / (2 m_N),   m_N = 0.9389 GeV
L_z = 2R/gamma  (longitudinal thickness of the half-density diameter)
t_cross = 2R/(gamma c)
```
(R_Pb = 6.62 fm, R_Au = 6.38 fm)

| √s_NN | γ | 2R_Pb/γ (fm) | 2R_Au/γ (fm) | crossing time (fm/c) |
|---|---|---|---|---|
| 7.7 GeV | 4.10 | 3.23 | 3.11 | ≈ 3.1–3.2 |
| 19.6 GeV | 10.4 | 1.27 | 1.22 | ≈ 1.2–1.3 |
| 39 GeV | 20.8 | 0.64 | 0.61 | ≈ 0.6 |
| 62.4 GeV | 33.2 | 0.40 | 0.38 | ≈ 0.4 |
| 130 GeV | 69.2 | 0.19 | 0.18 | ≈ 0.19 |
| 200 GeV | 106.5 | 0.124 | 0.120 | ≈ 0.12 |
| 2.76 TeV | 1470 | 0.0090 | 0.0087 | ≈ 0.009 |
| 5.02 TeV | 2673 | 0.0050 | 0.0048 | ≈ 0.005 |
| 5.36 TeV | 2854 | 0.0046 | 0.0045 | ≈ 0.005 |
| 5.44 TeV | 2897 | 0.0046 | 0.0044 | ≈ 0.005 |
| 5.5 TeV | 2929 | 0.0045 | 0.0044 | ≈ 0.005 |

The Glauber MC is explicitly independent of the longitudinal coordinate [PHOBOS14]; contraction only matters for visualisation and for the free-streaming/hydro start time.

## 4. Eccentricities

Participant-plane definitions from the participant transverse positions, with ⟨x⟩ = ⟨y⟩ = 0 after recentering [PHOBOS14 Eqs. 7–8; Alver-Roland Eqs. 4, 7, 9]:
```
eps_RP   = (sigma_y^2 - sigma_x^2)/(sigma_y^2 + sigma_x^2)
eps_2    = sqrt((sigma_y^2 - sigma_x^2)^2 + 4 sigma_xy^2)/(sigma_y^2 + sigma_x^2)
         = sqrt(<r^2 cos 2phi>^2 + <r^2 sin 2phi>^2)/<r^2>
eps_3    = sqrt(<r^2 cos 3phi>^2 + <r^2 sin 3phi>^2)/<r^2>
Psi_n    = [atan2(<r^2 sin n phi>, <r^2 cos n phi>) + pi]/n
```
σ_xy = {xy} − {x}{y}. ε_3 is uncorrelated with the reaction plane and arises purely from fluctuations [Alver-Roland]. Typical values (LKD18 tables above): Pb-Pb 5.02 TeV ε2 rises from 0.07 (0–5%) to 0.24 (20–25%) and 0.45 (50–55%); ε3 from 0.08 to 0.17 and 0.31. Au-Au 200 GeV is slightly larger. The per-event rms spreads are ~50% of the mean (e.g. ε2 = 0.072 ± 0.039 in 0–5%). Deformation (U, Xe) raises central ε2 [PHOBOS14 Fig. 4].

## 5. TRENTo initial conditions

**Reduced thickness** [TRENTo15 Eq. 5]:
```
T_R(p; T_A, T_B) = ((T_A^p + T_B^p)/2)^(1/p)
p = +1: (T_A+T_B)/2  arithmetic  -> wounded-nucleon model
p =  0: sqrt(T_A T_B) geometric  -> mimics EKRT / IP-Glasma saturation models
p = -1: 2 T_A T_B/(T_A+T_B) harmonic; p -> ±inf: max/min(T_A,T_B)
```
Entropy density at τ₀: s ∝ T_R; ⟨N_ch⟩ ∝ ∫dx dy T_R. p ≈ 0 reproduces the multiplicity distributions of p+p, p+Pb, Pb+Pb and the IP-Glasma ε2/ε3 ratio [TRENTo15 Fig. 3].

**Nucleons**: positions from Woods-Saxon with the same d_min resampling; each participant gets a Gaussian thickness ∫dz ρ = exp(−(x²+y²)/2w²)/(2πw²) with w = 0.6 fm in the original paper [TRENTo15 Eq. 13], and a Γ-distributed weight of shape k (fluctuations; σ_fluct = 1/√k); original tuned k = 1.4 for p = 0 [TRENTo15 Tab. I]. Collisions use P_coll = 1 − exp(−σ_gg ∫T_A T_B) with σ_gg fixed by σ_NN.

**Bayesian calibration** (Pb-Pb 2.76 + 5.02 TeV; TRENTo + free-streaming + VISH2+1 + UrQMD; posterior median, 90% HPD) [Bernhard18 Tab. 5.8 = Nature Phys. 15 (2019) 1113]:

| Parameter | Value |
|---|---|
| Norm (2.76 / 5.02 TeV) | 13.9 +1.2/−1.1 / 18.5 +1.8/−1.7 |
| p | 0.006 +0.078/−0.078 |
| σ_fluct (=1/√k) | 0.90 +0.24/−0.27 |
| nucleon width w | 0.96 +0.04/−0.05 fm |
| d_min | 1.28 +0.42/−0.53 fm |
| τ_fs | 1.16 +0.29/−0.25 fm/c |
| (η/s)_min | 0.085 +0.026/−0.025 |

Earlier calibration to 2.76 TeV only [Bernhard18 Tab. 5.5; arXiv:1704.04462]: p = −0.02 +0.16/−0.18, k ≈ 1.6–1.7, w modes ≈ 0.43–0.49 fm. The width w sets the initial-state granularity (hot-spot size); larger w smooths the profile, lowers ε3 and ⟨p_T⟩, and is degenerate with viscosity.

## Practical recipe for the animation
1. Sample nucleons per §1 (2pF/deformed WS, d_min = 0.4 fm, random Euler angles for Au/U/Xe/Ru/Zr; ³He/d from Hulthén/GFMC).
2. Choose b from the target centrality via the b-tables (§2.2).
3. Contract each nucleus along z by 1/γ (§3) and translate toward each other at v ≈ c; at t = 0 flag participants with the D = √(σ_NN/π) criterion (or ω = 0.4 Gaussian).
4. For the deposited energy at τ₀, use Gaussian blobs of width w ≈ 0.5–1 fm (w = 0.96 fm Bayesian) with T_R at p ≈ 0.

## References
- [Miller07] M. L. Miller, K. Reygers, S. J. Sanders, P. Steinberg, Ann. Rev. Nucl. Part. Sci. 57 (2007) 205, arXiv:nucl-ex/0701025.
- [PHOBOS14] C. Loizides, J. Nagle, P. Steinberg, SoftwareX 1–2 (2015) 13, arXiv:1408.2549 (TGlauberMC 2.7).
- [LKD18] C. Loizides, J. Kamin, D. d'Enterria, Phys. Rev. C 97 (2018) 054910 [Erratum: 99 (2019) 019901], arXiv:1710.07098.
- [dEL20] D. d'Enterria, C. Loizides, Ann. Rev. Nucl. Part. Sci. 71 (2021) 315, arXiv:2011.14909.
- [LKD25] C. Loizides et al., "Glauber predictions for oxygen and neon collisions at LHC", arXiv:2507.05853 (TGlauberMC v3.3).
- [ALICE16] ALICE, Phys. Rev. Lett. 116 (2016) 222302, arXiv:1512.06104.
- [ALICE18 Xe] ALICE, Phys. Lett. B 790 (2019) 35, arXiv:1805.04432.
- [ALICE22 lumi] ALICE, arXiv:2204.10148.
- [ALICE25] ALICE, CERN-EP-2025-203, arXiv:2509.06428 (O-O, Ne-Ne 5.36 TeV flow).
- [PHENIX04] PHENIX, Phys. Rev. C 69 (2004) 034910, arXiv:nucl-ex/0308006.
- [PHENIX16] PHENIX, Phys. Rev. C 93 (2016) 024901, arXiv:1509.06727.
- [STAR22] STAR, Phys. Rev. C 105 (2022) 014901, arXiv:2109.00131.
- [Shou15] Q. Y. Shou et al., Phys. Lett. B 749 (2015) 215, arXiv:1409.8375.
- [PREX21] D. Adhikari et al. (PREX), Phys. Rev. Lett. 126 (2021) 172502, arXiv:2102.10767.
- [GNvdS23] G. Giacalone, G. Nijs, W. van der Schee, Phys. Rev. Lett. 131 (2023) 202302.
- [Alver-Roland] B. Alver, G. Roland, Phys. Rev. C 81 (2010) 054905, arXiv:1003.0194.
- [TRENTo15] J. S. Moreland, J. E. Bernhard, S. A. Bass, Phys. Rev. C 92 (2015) 011901, arXiv:1412.4708.
- [Bernhard18] J. E. Bernhard, PhD thesis (Duke), arXiv:1804.06469; Bernhard, Moreland, Bass, Nature Phys. 15 (2019) 1113; arXiv:1704.04462.
- PDG: m_p = 938.272 MeV, m_n = 939.565 MeV.

**Not verified / caveats**: the Ne-20 β2 = 0.721 row and the Ru/Zr skin difference 0.278 fm came only from search-engine extracts; the exact KLN p-value; the ALICE-PUBLIC-2018-011 table (blocked) — the LKD18 Table X used instead is the same model/parameter set ALICE adopts.
