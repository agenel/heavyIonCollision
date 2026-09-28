# Catalogue of measured multinucleon-transfer (MNT) and deep-inelastic heavy-ion reactions (≈4–15 MeV/u)

*Compiled 2026-09-26 for validating the heavy-ion collision explorer.*

## Scope and method
- **Only peer-reviewed experimental papers are included.** A few conference proceedings appear where no journal paper exists; they are labelled as proceedings.
- **Theory papers are excluded**, with one exception: Yang 2025 is listed so that it is not mistaken for data.
- **How references were verified:**
  - Every DOI in the bibliography (§4) was resolved through the Crossref API. That check confirmed authors, title, journal, volume, page and year.
  - arXiv IDs come from INSPIRE-HEP.
  - Abstracts were read via Crossref, INSPIRE or OpenAlex.
  - Items that could not be verified are marked **[unverified]**, and numbers that could not be seen are marked **[not seen]**.
- **Where the numbers come from:**
  - EXFOR tables (fetched directly from the IAEA).
  - arXiv or author-archived full texts: Kozulin 2012, Barrett 2015, Szilner 2004 and 2007, Wuenschel 2018, Desai 2020, Niwase 2023, Devaraja 2015, and the IRB Zagreb PRISMA manuscripts.
  - The Vogt 2015 paper as reprinted in the author's PhD thesis.
  - Abstracts. These are flagged as such.
- **Quantities I derived myself (not quoted from a paper):**
  - E_cm values marked *c* are E_lab·A_T/(A_P+A_T), non-relativistic, using mass numbers.
  - "Sum of channels" rows are my own arithmetic.
- **Most APS, Springer, Elsevier and OSTI full texts were not reachable** from this environment. Where a number could only be seen in a figure, no value is given.
- **Completeness:**
  - The catalogue aims to be complete for modern (≥1994) MNT-product measurements at 4–15 MeV/u.
  - It is representative, not exhaustive, for the 1973–1992 deep-inelastic literature. That era has hundreds of papers; see the reviews [Vol78], [Sch78], [KLM15].
  - It excludes pure γ-spectroscopy papers that use MNT only as a production tool. Two representative ones are included: [Bir15], [Coc99].

**Reviews used as starting points:** [CPS09], [Cor13], [Mij22], [Mij25], [HD22], [Ada20], [Lov19], [KLM15], [PV23].

## Quick guide: best-documented datasets for validation
1. **136Xe+208Pb**
   - Barrett 2015: E_cm = 450 MeV, 235 yields, **EXFOR C2178**.
   - Kozulin 2012: mass–TKE, TKEL, angles and σ(damped) at three energies (Table I and figures), plus **EXFOR F1274**.
2. **136Xe+198Pt**
   - Watanabe 2015: 1085 MeV, θ_lab 24–34°, **EXFOR D0799**.
   - Desai 2019/2020: E_cm = 450 MeV, **EXFOR C2398 / C2922**.
   - Together these give an energy dependence.
3. **40Ar+208Pb** (**EXFOR D0816**), **40Ca+208Pb** (**D0845**) and **58Ni+208Pb** (**D0843**): absolute channel cross sections near the barrier from LNL.
4. **238U+238U** (Kratz 2013, **EXFOR D0776**) as the closest compiled proxy for **238U+248Cm**. The Schädel 1982 U+Cm isotope values are **not** in EXFOR (see §3.3).
5. **Heavy symmetric systems:** 204Hg+208Pb (**C2515**) and 160Gd+186W (**C1829**, **F1350**).
6. **48Ca+248Cm:** SHIP (**D8038**) and radiochemistry (**C2551, C2553**).

## Corrections to the seed list in the request (verified)
- **Vogt et al., PRC 92, 024619 (2015)** is **136Xe+238U**, not 136Xe+208Pb. It was measured with PRISMA+AGATA at LNL.
- **Barrett et al., PRC 91, 064615 (2015)** is **136Xe+208Pb**, not "208Pt".
- **Beliuskina et al., EPJ A 50, 161 (2014)** is **64Ni+207Pb** at 5.0 MeV/u at SHIP, not 136Xe+208Pb.
- **Watanabe et al., PRL 115, 172503 (2015)** (136Xe+198Pt) was measured at **GANIL with VAMOS++ and EXOGAM**, not at KISS. KISS papers are spectroscopy, mass and new-isotope studies that report rates, not cross sections.
- **Schädel et al., PRL 41, 469 (1978)** is **238U+238U**. Only PRL 48, 852 (1982) is 238U+248Cm.
- **Wilczyński, PLB 47, 484 (1973)**:
  - The correct DOI is 10.1016/0370-2693(73)90021-X.
  - The system is 40Ar+232Th. The 379 MeV energy comes from EXFOR A0015 (Artukh et al.). I could not confirm from the PLB text that this is the energy Wilczyński analysed.
  - A different Wilczyński paper, PLB 47, 124 (1973), is about the optimum Q-value.
- **Szilner et al., PRC 76, 024604 (2007)** covers **40Ca+96Zr and 90Zr+208Pb**. The 40Ca+208Pb data are in **Szilner PRC 71, 044610 (2005)** and EPJA 21, 87 (2004).
- **Corradi et al., PRC 66, 024606 (2002)** (58Ni+208Pb, 328.4 MeV) was measured with the LNL time-of-flight spectrometer, which predates PRISMA.
- **"Welsh et al. 238U+232Th"** does not exist. Welsh et al., PLB 771, 119 (2017) is **204Hg+198Pt**. The 238U+232Th paper is Wuenschel et al., PRC 97, 064602 (2018), from Texas A&M.
- **"Desai et al."** is three papers:
  - PRC 99, 044604 (2019): 136Xe+198Pt.
  - EPJ A 56, 150 (2020): 136Xe+198Pt re-examination.
  - PRC 101, 034612 (2020): 204Hg+208Pb.
- **Yang et al., PLB 862, 139318 (2025)** (238U+248Cm near 0°) is an **IQMD calculation**, not an experiment.
- **Not found:** INSPIRE and web searches turned up no MNT experiment by an author "Ravlić", and none by a first author "Tiwari".
  - "Jeong" (S.C. Jeong) is a co-author of the KISS and GANIL 136Xe+198Pt papers.
  - "Mayer, Montoya" matches W. Mayer et al., PLB 152, 162 (1985) (238U+110Pd, 124Sn, kinematic coincidence). No Montoya MNT paper was identified.
- **ANL N=126 Factory:** the only document is a 2026 facility paper (Valverde et al., arXiv:2603.12359, preprint). It reports commissioning with 136Xe on natPt, and **no cross sections** have been published yet.

## 1. Master table of measured reactions

**Columns**
- **E_lab**: the beam energy the paper gives; "(ctr)" means centre of target.
- **E_cm**: E_lab·A_T/(A_P+A_T), non-relativistic, with mass numbers. I computed these; they are marked *c* unless the paper states the value.
- **E/V_B**: shown only where the paper states it.
- **Data availability**:
  - **EXFOR ####** = IAEA EXFOR accession number (entry bibliography checked through the IAEA Dataexplorer API).
  - **Tab** = numbers tabulated in the paper.
  - **Fig** = figures only.
  - **Rel** = yields are relative or normalised to a model, not absolute.
- **Keys** point to the bibliography in §4.

### 1a. Heavy and very heavy systems (Z_P·Z_T ≳ 2500): damped collisions and actinide or N=126 production

| # | System | E_lab (MeV) | E_cm (MeV) | Facility / setup | Observables | Ref | Data |
|---|---|---|---|---|---|---|---|
| 1 | **136Xe+208Pb** | 700, 870, 1020 (plus a catcher run at 850) | 423, 526, 617 (paper); 1.00/1.25/1.46 V_B | FLNR Dubna U-400M, CORSET 2-arm TOF; catcher-foil α activity | Mass–TKE matrices, TKEL, primary mass yields, angular distributions, σ(damped); α-emitter σ | [Koz12] | Tab (Table I); **EXFOR F1274** (210Po, 222Rn, 224Ra) |
| 2 | **136Xe+208Pb** | 785 on a thick target; 743 (ctr) | 450 (paper) | ANL ATLAS, Gammasphere in-beam and off-line γ | 235 cumulative and independent PLF/TLF yields (Z=48–88), σ_R | [Bar15] | Tab (App. Tables I–II); **EXFOR C2178** |
| 3 | 136Xe+208Pb | 5.9 MeV/u ≈ 802 | 485 *c* | ΔE–E + TOF telescope (TU München group; accelerator site [unverified]) | Charge and mass transfer vs TKEL, σ(damped) | [Ess79] | Fig [full text not seen] |
| 4 | 136Xe+208Pb (+181Ta) | 1120 | 677 *c* | ΔE–E telescopes (Vandenbosch et al.; site [unverified]) | Energy, angle and Z distributions; QE+DIC | [Van76a] | Fig |
| 5 | 136Xe+208Pb | 870 | 526 *c* | LNL, PRISMA + TOF second arm | Preliminary primary masses | [Nov16, Que18] (proceedings) | Fig (preliminary) |
| 6 | 136Xe+natPb, +209Bi | 945 | ≈570 *c* (Pb) | JYFL IGISOL gas cell + α spectroscopy | 211Po isomeric ratio | [Kum24] | Tab (Table 1) |
| 7 | **136Xe+198Pt** | 1085 (7.98 MeV/u) | 643 *c* | GANIL, VAMOS++ + EXOGAM (not KISS) | Isotope σ for PLF (Z=50–58) and TLF (Z=74–80), integrated over θ_lab 24–34°; elastic/Rutherford | [Wat15] (+ [Wat13, Kim14]) | **EXFOR D0799** (174 pts) |
| 8 | **136Xe+198Pt** | 760.5 (ctr) | 450 (paper) | ANL ATLAS, off-line γ | 42 PLF/fission + 36 TLF yields | [Des19] | Tab; **EXFOR C2398** |
| 9 | **136Xe+198Pt** | same run | 450 | ANL, Gammasphere in-beam and between bursts | 171 nuclide yields | [Des20b] | Tab; **EXFOR C2922** |
| 10 | 136Xe+238U | 1000 | 636 *c* | LNL, PRISMA + AGATA demonstrator + DANTE | PLF A,Z yields (normalised to GRAZING +1n), transfer vs fission ToF, actinide x-rays | [Vog15] | Fig, Rel |
| 11 | 136Xe+238U | 1110 | 706 *c* | FLNR, CORSET | Primary and secondary PLF masses, TLF survival, sequential fission | [Koz24] | Fig [numbers from abstract] |
| 12 | 136Xe+238U | 1150 (thick target) | 732 *c* | LBL SuperHILAC, radiochemistry | 131 nuclide yields, mass-yield components | [Ott76, Ott77] | **EXFOR C2534** (Ott77) |
| 13 | 136Xe+natU | ≈1000 | – | JINR, radiochemistry | 70 element/mass σ | Bruchertzeifer et al., Yad. Fiz. 26, 26 (1977) [in EXFOR only; not verified in Crossref] | **EXFOR A0031** |
| 14 | 209Bi+238U | 1850 | 985 *c* | FLNR, CORSET | PLF/TLF masses and energies, sequential fission | [Vor25] | [not seen] |
| 15 | 136Xe+209Bi | 1130 / 940 / 1422 | 685 / 569 / 861 *c* | ΔE–E telescopes (Rochester–LBL collaboration; site [unverified]) | Classic DIC: Wilczyński diagrams, Z distributions vs TKEL | [Sch78], [Wil80], [Wol81] | Fig |
| 16 | 129,132,136Xe+197Au | 761–787 (thick target) | ≈460 *c* | radiochemistry (Mainz group) | N/Z of fragments, charge-equilibration time | [Kra79] | Fig |
| 17 | **238U+248Cm** | ≈7.4 MeV/u (thick target) | ≈899 *c* | GSI UNILAC, radiochemistry | Heavy-actinide isotope σ (Cf–Md) | [Sch82] | [numbers not seen]; not in EXFOR |
| 18 | 238U+248Cm | thick target, 6.06–8.30 MeV/u intervals | – | GSI, radiochemistry (re-analysis) | σ(Z) below target vs energy, TKEL(Z), threshold behaviour | [Kra13] | Tab; **EXFOR D0776** (U+U part only) |
| 19 | 238U+238U, 238U+248Cm | 7.5 MeV/u | – | GSI, 3-body kinematic coincidence | Sequential fission | [Gla79] | Fig |
| 20 | 238U+238U | 1785 (7.5 MeV/u, thick target) | 893 *c* | GSI, radiochemistry | Isotope distributions, actinide σ | [Sch78b] | Fig; later numbers in [Kra13] / EXFOR D0776 |
| 21 | 238U+238U | 7.42 MeV/u | 883 *c* | GSI, counter telescopes | Z, TKE, angle distributions | [Hil77], [Fre79] | Fig |
| 22 | 238U+238U | 6.09, 6.49, 6.91, 7.10, 7.35 MeV/u | 725–875 *c* | GANIL, VAMOS | TKE vs transfer; long-lived dinuclear system | [Gol10] | [not seen] |
| 23 | 238U+238U | 6.765, 7.193 MeV/u | 805, 856 *c* | GANIL, VAMOS++ + AGATA + ID-Fix | Status report; ±1n only | [Ute23] (proceedings) | – |
| 24 | 238U+232Th | 7.5→6.1 MeV/u (thick target) | 881 *c* (entrance) | Texas A&M K500, YAP + IC–Si | α-decay energies and half-lives of heavy products (no isotope identification) | [Wue18] | Fig |
| 25 | 238U+198Pt | 10.75 MeV/u | 1162 *c* | RIKEN KISS (gas cell + MRTOF) | New isotope 241U, masses (rates only) | [Niw23] | Tab (masses) |
| 26 | 204Hg+198Pt | 1360 (1257 in a later paper [unverified]) | 670 *c* | ANL, off-line γ | PLF/TLF yields | [Wel17] | [not seen] |
| 27 | 204Hg+208Pb | 977 and 1143 (effective) | 493, 577 *c* | ANL, Gammasphere + off-line γ | Cumulative and independent yields, Au–Bi | [Des20a] | Tab; **EXFOR C2515** |
| 28 | 160Gd+186W | 859 | 461.9 (paper) | LBL-88 / ANL radiochemistry + catcher foils | Angular distributions, TLF σ, Pb chemistry | [Lov11] | **EXFOR C1829** |
| 29 | 156,160Gd+186W | 878; 860, 935 | 478; 462, 503 *c* | FLNR, CORSET | Mass–TKE, "inverse quasifission" | [Koz17] | **EXFOR F1350** |
| 30 | 88Sr+176Yb | E_cm/E_Bass = 1.03 | – | JYFL K130, CORSET | Mass–TKE, shell effects near Z=82 | [Koz14] | Fig |
| 31 | 136Xe+248Cm, 86Kr+248Cm, 18O+248Cm | 624–808 (Xe) | 403–522 *c* | LBL, radiochemistry | Actinide σ, Z=91–100 | [Moo86] | **EXFOR C2552** |
| 32 | 129,132Xe+248Cm | 769–817 | – | LBL, radiochemistry | Actinide σ, Np–Fm | [Wel87] | **EXFOR C2556** |
| 33 | 238U+110Pd, 124Sn | 5.70–6.02 MeV/u | – | kinematic coincidence with position-sensitive gas detectors [site unverified] | Structure effects; periodic proton-pair transfer | [May85], [Wag87] | Fig |
| 34 | 58,64Ni+238U | 8.5 MeV/u | 396, 429 *c* | damped-collision nuclide distributions [site unverified] | N/Z equilibration vs TKEL | [Pla88] | Fig |
| 35 | 56Fe+238U; 84Kr+238U; 40Ar+238U | 538; –; – | – | GSI / LBL, radiochemistry | Mass-yield components (QE transfer 810±160 mb for Fe+U) | [Reu77], [Kra74], [Kra76] | **EXFOR C2531** (Kr+U, 605 MeV), **C2533** (Ar+U, 288 MeV) |
| 36 | 136Xe+232Th | – | – | Gammasphere thick target | Spectroscopy only (no σ) | [Coc99] | – |
| 37 | 136Xe+249Cf | 1.02, 1.09, 1.16 V_B (EXFOR: 749–813) | – | LBL, radiochemistry | Actinide σ (above/below target) | [Gre87] | **EXFOR C2558** |
| 38 | 136Xe+244Pu | 965 | 623 *c* | radiochemistry | U, Np, Pu isotope σ | Jae et al., J. Korean Nucl. Soc. 13(3), 139 (1981) [from EXFOR only; not verified in Crossref] | **EXFOR C2035** |

### 1b. 48Ca / 40Ca / light-heavy-ion induced actinide transfer (radiochemistry and separators)

| # | System | E_lab (MeV) | Facility / setup | Observables | Ref | Data |
|---|---|---|---|---|---|---|
| 39 | **48Ca+248Cm** | 270 (mid-target) | GSI, SHIP velocity filter at 0°±2° | About 100 TLF (Z=82–100); new isotopes 216U, 219Np, 223Am, 229Am, 233Bk at ~5 nb | [Dev15], [Hei16] | [tables not seen] |
| 40 | 48Ca+248Cm | 270.2 | GSI SHIP | Z ≥ 98 products (e.g. 260No, tentative) | [Dev19] | **EXFOR D8038** (projectile mis-coded as 40Ca; see §3) |
| 41 | 48Ca+248Cm | 262 (ctr), stacked foils | GSI, radiochemistry | Kinematics: angles, ranges, TKEL of Fm isotopes | [Got17] | [not seen] (open manuscript: OSTI 1465269) |
| 42 | 48Ca+248Cm | 248–263 (1.04–1.10 V_B) | GSI / PSI, radiochemistry | Cold TLF Rn–Pu (about 1–2 mb per element) | [Gag86] | **EXFOR C2553** |
| 43 | 40,48Ca+248Cm | 234–294 / 239–318 | LBL, radiochemistry | Excitation functions for Bk–Fm | [Hof85] | **EXFOR C2551** |
| 44 | 40,44Ca+248Cm | 230–323 | LBL / PSI | Th–Fm excitation functions | [Tur92] | [not seen] |
| 45 | 40Ar+248Cm; 31P+248Cm | 207–286; 174/239 | LBL | Bk–Fm excitation functions | [Ley90], [Ley91] | [not seen] |
| 46 | 16,18O, 20,22Ne+248Cm; 18O+249Cf | near barrier | LBL | Bk–No production | [Lee82], [Lee83] | **EXFOR A0173** (Lee82) |
| 47 | Heavy ions + 254Es | – | radiochemistry | Transfer σ (e.g. 13C+254Es: total transfer 58 mb) | [Sch86], [Moo90] | [not seen] |
| 48 | 48Ca+254Es; 48Ca+248Cm | 240–249; 267 | LBL/LLNL, superheavy searches with radiochemistry | Actinide transfer-product σ reported alongside the SHE limits | [Lou85], [Hul77] | **EXFOR C2550**, **C2537** |
| 49 | 20,22Ne+232Th | 114, 129 | radiochemistry | Pa, U, Np isotope σ | [Tan84] | **EXFOR C2547** |
| 50 | 48Ca+238U | near barrier | GSI SHIP | About 90 nuclides Tl–Am, σ(A) | [Dev20] | [not seen] |
| 51 | 48Ca+208Pb, 50Ti+208Pb, 40Ar+209Bi | near barrier | FLNR, SHELS velocity filter | Above-target nuclides (up to +8p) | [Dev25] | [not seen] |
| 52 | 48Ca, 54Cr+243Am; 54Cr+238U | near barrier | IMP Lanzhou CAFE2, SHANS2 gas-filled separator | 58 isotopes via α decay | [Xie26] | [not seen] |
| 53 | 58,64Ni+207Pb | 5.0 MeV/u (≈290 / 320) | GSI SHIP | TLF transfer σ (N=126 region); rotating dinuclear systems | [Bel14], [Com12], [Com13] | [not seen] |
| 54 | 64Ni+207Pb, 132Xe+208Pb, 238U+238U | Coulomb barrier | GSI SHIP | Velocity spectra, time delay | [Hei15] | Fig |
| 55 | 48Ca+197Au | 300 | FLNR (activation + γ) | Au-isotope σ (neutron transfer) | [Azh23] | **EXFOR F1541** |
| 56 | 48Ca+197Au | 400 | FLNR (MAVR / fragment separator) | PLF Z=12–28, QE and DIC components | [Luk26] | [not seen] |

### 1c. Near-barrier quasi-elastic / MNT with spectrometers (LNL PRISMA and predecessors, ANL, others)

| # | System | E_lab (MeV) | E_cm *c* | Facility / setup | Observables | Ref | Data |
|---|---|---|---|---|---|---|---|
| 57 | **40Ca+208Pb** | 235, 249 (plus 225, 236, 250 in EPJA 2004) | 197, 209 | LNL, PISOLO-type TOF spectrometer | A,Z yields, σ(θ), TKEL, total σ per channel | [Szi05], [Szi04] | **EXFOR D0845** |
| 58 | 40Ca+208Pb | E_cm 189.0–230.5 (12 energies) | – | LNL, PRISMA at 115° (backward reflected flux) | Reflected-flux composition, ⟨E_x⟩ | [Coo23] | Fig / suppl. |
| 59 | **58Ni+208Pb** | 328.4 | 257 | LNL TOF spectrometer + MWPPC kinematic coincidence | A,Z yields, σ(θ), TKEL, fission survival of TLF | [Cor02], [Cor04] | **EXFOR D0843** |
| 60 | 58Ni+208Pb | 345 (thick target) | 270 | thick-target γγ coincidences + target activity | Product yields via γγ | [Kro10] | **EXFOR D0620** |
| 61 | 58Ni+208Pb | 6.65 MeV/u (inverse kinematics) | – | neutron–fragment coincidence [site unverified] | Excitation-energy partition | [Cha91] | Fig |
| 62 | 64Ni+208Pb | 350 | 268 | thick-target γγ + activity | Yield distribution, N/Z equilibration | [Kro03] | **EXFOR D0635** |
| 63 | 64Ni+208Pb, 80Se+208Pb | slightly above barrier | – | ANL, Enge split-pole + gas detector | 1n/2n transfer systematics | [Reh90] | [not seen] |
| 64 | 46,48,50Ti+208Pb | E_cm 243 | – | ANL, magnetic spectrograph | QE→DIC transition, Wilczyński plots per channel | [Reh88] | Fig |
| 65 | **40Ar+208Pb** | 255 (6.4 MeV/u) | 214 | LNL, PRISMA (3 settings, 41–62°) + CLARA | Absolute σ per channel, TKEL, σ(θ) | [Mij16a], [Mij16b], [Mij15], [Szi11], [Col17] | **EXFOR D0816** |
| 66 | 64Ni+238U | 390 | 307 | LNL TOF spectrometer | σ(θ), Q distributions up to +6n and −6p | [Cor99] | Fig |
| 67 | 40Ca+124Sn | 170 | 128 | LNL TOF spectrometer; GASP γ–particle | A,Z yields, σ, TKEL; state-resolved σ | [Cor96], [Cor00] | **EXFOR O1046** |
| 68 | 48Ca+124Sn | 174 | 125 | LNL TOF spectrometer | ±2p yields (pair / α modes) | [Cor97] | Fig |
| 69 | 32S+208Pb | 173.4 | 150 | LNL TOF | Q-value spectra, σ(θ) | [Cor94] | Fig |
| 70 | 32S+208Pb | E_cm 140.9, 153.1, 165.2 | – | LNL PRISMA at 102°; ANU capture | Reflected flux vs capture | [Coo25] | Fig |
| 71 | 62Ni+206Pb | 3 energies near barrier | – | LNL TOF | Multi-neutron transfer, odd–even staggering | [Cor01] | Fig |
| 72 | 40Ca+90,96Zr | 134–152 | – | LNL TOF | σ per channel | [Mon97], [Mon02] | **EXFOR O1043, O1049** |
| 73 | 40Ca+96Zr; 90Zr+208Pb | 152; 560 | 107; 391 | LNL PRISMA+CLARA | A,Z yields (normalised to GRAZING +1n), TKEL, γ | [Szi07], [VP15] | Fig, Rel |
| 74 | 96Zr+40Ca | ≤330, down to 25 % below the barrier | ≤97 | LNL PRISMA (inverse kinematics) | P_tr(D) for 1n and 2n | [Cor11] | Fig |
| 75 | 60Ni+116Sn / 116Sn+60Ni | 245 (60Ni); 428–482 (116Sn) | 161; 146–164 | LNL PRISMA (+AGATA) | P_tr(D) for 1n, 2n, 1p, 2p; γ strength | [Mon14], [Mon16], [Cor22] | Tab (PRC 93 Table I) / Fig |
| 76 | 48Ca+64Ni; 48Ca+208Pb | 282; ≈6 MeV/u | 161 | LNL PRISMA+CLARA | Inelastic and ±1n/±1p σ; γ spectroscopy | [Mon11], [Mon12] | **EXFOR A0909** (Ni) |
| 77 | 197Au+130Te | 1070 | 425 | LNL PRISMA + NOSE second arm | Light–heavy mass correlation, neutron-transfer σ | [Gal18] | Fig |
| 78 | 206Pb+118Sn | 1200 (plus 1090, 1035) | 437 (397, 377) | LNL PRISMA | Q distributions QE→DIC, σ (normalised to GRAZING +1n) | [Dik23], [Szi24] | **EXFOR D8060**, Rel |
| 79 | 92Mo+54Fe | 343–370 | 127–137 | LNL PRISMA (inverse kinematics) | Absolute σ for n, p, 2p, 2p2n near/below barrier | [Mij26] | **EXFOR D8119** |
| 80 | 94Rb+208Pb (RIB) | 575 (6.2 MeV/u) | 396 | CERN HIE-ISOLDE, MINIBALL + DSSSD | Pb-isotope σ via γ | [Col20] | Fig |
| 81 | 58Ni+124Sn | 4 energies near barrier | – | ANL, split-pole | Multineutron σ, P_tr(D) | [Jia98] | Fig |
| 82 | 76,82Se+192,198Pt | 487.7, 499.0 | – | magnetic spectrometer [site unverified] | Elastic + QE transfer (at most 30 % of σ_R) | [Wol92] | Fig |
| 83 | 136Xe+64Ni; 124Xe+58Ni | ~5 % above barrier | – | ANL, particle–γ | QE transfer, DIC | [San97], [Geh97] | Fig |
| 84 | 58Ni+60Ni | near barrier | – | ANU, CUBE | DIC / fusion-fission, TDHF comparison | [Wil18] | Fig |
| 85 | 144Sm+88Sr | 4.7 MeV/u | – | HMI Berlin | Pairing effects in transfer | [Kun90] | – |
| 86 | Medium-heavy systems (4p transfer) | near barrier | – | HMI Berlin, kinematic coincidence | "Cold" multiproton transfer | [Wlp95] | – |
| 87 | 36S+144,154Sm | near barrier | – | TOF + ionization chamber | Transfer probabilities | [FN92] | Fig |
| 88 | 70Zn+64Ni | 1050 (15 MeV/u) | 502 | LNS Catania, MAGNEX | PLF momentum and angular distributions, σ | [Kou23] | **EXFOR D8068** |
| 89 | 86Kr+64,58Ni, 124,112Sn | 15 MeV/u | – | Texas A&M K500, MARS separator | PLF isotope σ (up to +6n pick-up) | [Sou11] | **EXFOR C1901** |
| 90 | 16,18O+90Zr | – | – | BARC-TIFR Mumbai | MNT channel σ | [Jha04] | **EXFOR A0678** |

### 1d. Classic deep-inelastic landmark data (Wilczyński-plot era), included for qualitative validation

| # | System | E_lab (MeV) | Setup | What it shows | Ref |
|---|---|---|---|---|---|
| 91 | **40Ar+232Th** | 379 (EXFOR A0015; the energy analysed in the Wilczyński PLB [not confirmed from the PLB text]); 297 and 388 (Artukh 1973) | JINR Dubna, ΔE–E telescopes | The original Wilczyński (energy–angle) diagram: focusing, then orbiting to negative angles; element σ in **EXFOR A0015** (Artukh et al., Sov. J. Nucl. Phys. 23, 136 (1976)) | [Wil73], [Art73a] |
| 92 | 22Ne+232Th | 174 | JINR | MNT systematics for Z=3–12 | [Art73b] |
| 93 | 40Ar+197Au; 20Ne+197Au | 220; 110 | JINR | Element σ (Artukh et al., Sov. J. Nucl. Phys. 27, 14 (1978); 28, 594 (1978)) [EXFOR only] | **EXFOR A0023, A0046** |
| 94 | 84Kr+209Bi | 600; 525 | (Wolf et al.; Hanappe et al.) | Strongly damped collisions; "quasifission" | [Wolf74], [Han74] |
| 95 | 84Kr+208Pb | 494, 510, 718 | (Vandenbosch et al.) | DIC energy spectra and angular distributions | [Van76b] |
| 96 | 40Ar,40Ca+58,64Ni | – | Orsay | N/Z equilibration | [Gat75] |
| 97 | 136Xe+56Fe | 5.9 MeV/u | GSI magnetic spectrometer | Drift along the potential-energy surface | [Sch81] |
| 98 | N, O … Cu on 209Bi | near barrier | Orsay, radiochemistry | QE 1–3p transfer ranges / angles | [Gar80] |

### 1e. Light-projectile MNT and MNT-induced fission (outside the "heavy ion" core but in range)

| # | System | E_lab | Setup | Ref |
|---|---|---|---|---|
| 99 | 18O+238U | 8.5 MeV/u | GANIL LISE, 0° | [Ste18] |
| 100 | 18O+232Th; 18O+237Np | near barrier [energies not extracted] | JAEA tandem, MNT-induced fission | [Leg16], [Ver20], [Tan22] |
| 101 | 18O+206Pb | 139 | BARC-TIFR Mumbai | [Son15] |
| 102 | 18O+Hg, Tl, Pb | 5–10 MeV/u | radiochemistry, neutron-rich Bi | [Esk84] (**EXFOR C2417**) |
| 103 | 28Si+232Th | 340 | – | [Sax02] |
| 104 | 28Si+90,94Zr | near barrier | IUAC New Delhi, HIRA | [Kal21] |
| 105 | 16O+154Sm | near and above barrier | Mumbai | [Roy22] (**EXFOR D6429**) |

**Count.** The tables list **105 rows** (one per system/energy/paper group), covering roughly **100 distinct projectile–target combinations** once isotopic variants are counted. Rows in §1a–1c are MNT or quasi-elastic transfer experiments at about 4–15 MeV/u.

## 2. Key numbers for the priority systems

Every number below is given with its source table, figure or EXFOR subentry. *c* marks my own E_cm arithmetic.

### 2.1 136Xe + 208Pb (priority)

**Barrier.** Kozulin 2012 uses V_B = 421.5 MeV (c.m., Bass/NRV), quoted in the text.
**Energy conversion.** E_cm = E_lab × 208/344.

**(a) Kozulin et al., PRC 86, 044611 (2012). CORSET, U-400M, FLNR Dubna.**
- **Target and detector.** 200 µg/cm² 208Pb on C. Two-arm TOF with θ_lab 25–70° (θ_cm 40–140°). Mass resolution 7 u, energy resolution 25 MeV.
- **Table I (the only tabulated data in the paper):**

| E_lab (MeV) | E_cm (MeV) | E_cm/V_B | θ_gr (c.m.) | θ_gr (lab) | L_gr (ħ) | σ_R (b) | seq. fission of TLF | σ(damped, TLF A=200–216) (b) |
|---|---|---|---|---|---|---|---|---|
| 700±14 | 423 | 1.00 | 148° | 110° | 87 | 0.21 | <5 % | 0.2±0.1 |
| 870±17 | 526 | 1.25 | 81° | 51° | 320 | 1.7 | 33±10 % | 1.1±0.4 |
| 1020±20 | 617 | 1.46 | 61° | 38° | 432 | 2.6 | 55±10 % | 1.3±0.4 |

- **Angular distributions (Fig. 8).** The measured maxima are at 46±2° (PLF) and 50±2° (TLF) at 870 MeV, and 32±2° (PLF) and 62±2° (TLF) at 1020 MeV. The FWHM is about 4° at 870 MeV and about 10° at 1020 MeV.
- **Mass–TKE matrices (Fig. 3).** Damped events are mostly at TKEL > 40 MeV (Fig. 6). The largest TKEL is about 200 MeV at E_cm = 423 MeV and about 350 MeV at 617 MeV. Mean E* for TKEL > 40 MeV is about 50, 70 and 120 MeV at the three energies.
- **Primary mass distribution for TKEL > 40 MeV (Fig. 6).**
  - It is two-humped at all energies.
  - More than 60 % of damped events lie within A = 136±8.
  - At E_cm = 526 MeV there is a tail to A ≈ 238 at a σ of about 0.1 mb, which corresponds to about 20 nucleons transferred.
  - The shape is a shoulder or enhancement towards the 208Pb/N=126 region, not a single Gaussian drift.
- **Model comparison.** The Zagrebaev–Greiner Langevin model at 526 MeV had to be scaled by about 0.4. It then agrees within about a factor of 2 where Q_gg ≈ 0 and underestimates the super-asymmetric tail.
- **Catcher-foil α activities (Fig. 10).** Measured at E_lab = 850 MeV with Al catchers at 45–55°:

| Product | σ |
|---|---|
| 210Po | 200±100 µb |
| 222Rn | 17±14 µb |
| 224Ra | 2.5±2 µb |

  These values are in EXFOR F1274.

**(b) Barrett et al., PRC 91, 064615 (2015), arXiv:1505.00257. ATLAS + Gammasphere (ANL), Loveland group.**
- **Beam and target.** 785 MeV 136Xe on a thick 49 mg/cm² 208Pb target. The centre-of-target energy is E_lab = 743 MeV (E_cm = 450 MeV, E_cm/V_B ≈ 1.07). The effective (above-barrier) thickness is 3.113 mg/cm².
- **Yields.** There are 235 cumulative and independent yields, from about 2 µb to about 75 mb. PLF cover Z = 48–68 and TLF cover Z = 70–88.
- **Total cross sections.** σ_R(measured) = 359±90 mb. The Bass value is 568 mb.
- **Selected independent yields (Appendix Tables I–II), in mb:**

| Group | Nucleus | σ (mb) |
|---|---|---|
| PLF | 136Xe | 30.4±6.1 |
| PLF | 135Xe | 64±13 |
| PLF | 137Xe | 1.46±0.29 |
| PLF | 138Xe | 3.26±0.65 |
| PLF | 130Te | 1.83±0.37 |
| PLF | 138Ba | 6.0±1.2 |
| TLF | 196Pt | 4.21±0.84 |
| TLF | 200Pt | 0.73±0.15 |
| TLF | 202Pt | 0.178±0.036 |
| TLF | 200Hg | 6.07±1.21 |
| TLF | 204Hg | 6.75±1.35 |
| TLF | 206Hg | 0.0093±0.0019 |
| TLF | 208Hg | 0.0341±0.0068 |
| TLF | 208Pb | 20.6±4.1 |
| TLF | 210Pb | 0.312±0.062 |
| TLF | 208Po | 4.58±0.92 |
| TLF | 210Po | 1.19±0.24 |
| TLF | 214Po | 0.0754±0.0151 |
| TLF | 212Rn | 0.515±0.103 |
| TLF | 218Rn | 0.0191±0.0038 |
| TLF | 214Ra | 0.0033±0.0007 |

- **N = 126 TLFs.** From 206Hg to 214Ra the yields range from 9 µb down to 3 µb and peak at Z = 84. Neutron-rich N = 126 yields are about 2 orders of magnitude below the Zagrebaev–Greiner prediction.
- **N = 82 PLFs.** From 134Te to 143Pm the yields range from 261 µb to 16 µb.
- **Model metric.** The theory evaluation factor is tef = ⟨log10(σ_th/σ_exp)⟩:
  - GRAZING: tef(Pt) = −5.0±0.9, tef(Rn) = −3.3±0.6. GRAZING describes only near-target and near-projectile yields.
  - Zagrebaev–Greiner: tef(Pt) = +0.54±0.15, tef(Rn) = −0.69±0.14.
- **Data availability.** Everything is tabulated, and the full table is in **EXFOR C2178** (235 CUM + 235 IND points, E_cm = 450 MeV).

**(c) Other 136Xe + 208Pb data (supplementary).**
- **Essel et al., Z. Phys. A 289, 265 (1979).**
  - 5.9 MeV/u, which gives E_lab ≈ 802 MeV and E_cm ≈ 485 MeV (calculated).
  - Uses a ΔE–E TOF telescope and measures charge and mass transfer versus TKEL.
  - The abstract-level figures are σ(strongly damped) ≈ 510 mb and an upper limit of 1 µb for very large mass transfer [numbers from abstract only].
- **Vandenbosch et al., NPA 269, 210 (1976).** 1120 MeV 136Xe on 181Ta and 208Pb, with energy, angular and Z distributions. The QE and DIC components are both sideways peaked.
- **Novikov et al., JPCS 703, 012020 (2016) and Quero et al., JPCS 1014, 012015 (2018).**
  - 136Xe + 208Pb at E_lab = 870 MeV with PRISMA and a second arm at LNL.
  - These are proceedings only and give only a preliminary two-humped primary mass distribution. No final journal paper was found.
- **Kumar et al., PLB 853, 138654 (2024).**
  - 945 MeV 136Xe on natPb and 209Bi at the IGISOL gas cell (Jyväskylä).
  - Measures 211Po isomeric ratios: IR = 4.0–4.8 for natPb and 2.3–2.7 for 209Bi (Table 1).
- **Not a Xe+Pb paper:** Beliuskina et al., EPJ A 50, 161 (2014) is 64Ni+207Pb (see the list of corrections).

### 2.2 136Xe + 238U (related heavy asymmetric system; same beam)
- **Vogt et al., PRC 92, 024619 (2015).**
  - Setup: E_lab = 1 GeV (E_cm ≈ 636 MeV, calculated) at PIAVE-ALPI, LNL. PRISMA at θ_lab = 50°, the grazing angle. Also used: the AGATA demonstrator and DANTE, a set of MCP detectors at 58° that catches the target-like partner in kinematic coincidence.
  - Resolution: A/ΔA ≈ 298 (Ba) and 262 (Te).
  - **No absolute cross sections.** Yields are normalised to the GRAZING +1n channel.
  - Relative to 136Xe: 140Xe is 0.4 % and 128Xe (−8n) is 5.6 %.
  - The +2p (Ba) channel is underpredicted by GRAZING by more than 10×.
  - No sizeable actinide yield was seen beyond Z = 93.
  - Figures only; no EXFOR entry.
- **Kozulin et al., PRC 109, 034616 (2024).**
  - Setup: E_lab = 1.11 GeV at CORSET, with PLFs at 27.2–32.8°.
  - The heaviest TLF has A = 265, with σ of a few hundred µb.
  - TLF survival probability falls from about 0.7 (A = 240) to about 1.8×10⁻³ (A = 255).
  - Abstract-level numbers only.
- **Otto et al., PRL 36, 135 (1976).**
  - Setup: 1150 MeV on a thick 238U target at the LBL SuperHILAC, radiochemistry.
  - Measured 131 nuclide yields and found six mass-yield components. The fusion–fission upper limit is 20 mb.
  - EXFOR C2534 (from Otto et al., Radiochim. Acta 24, 3 (1977)) holds σ(211Rn) = 0.7±0.2 mb.
- **Bruchertzeifer et al., Yad. Fiz. 26, 26 (1977)** [reference as given in EXFOR, not checked against Crossref].
  - Setup: about 1 GeV 136Xe on natU at JINR.
  - EXFOR A0031 holds 70 cross sections, for example 237U 73.8±14.8 mb.
- **Birkenbach et al., PRC 92, 044319 (2015).** Spectroscopy of 240U, using 70Zn+238U and 136Xe+238U with PRISMA–CLARA/AGATA. No cross sections.

### 2.3 136Xe + 198Pt (priority)

**(a) Watanabe et al., PRL 115, 172503 (2015). GANIL, VAMOS++ + EXOGAM.**
- **Where it was measured.** GANIL, not KISS. The 2012 GANIL run was a feasibility study for KISS; preliminary figures appeared in [Wat13] and [Kim14].
- **Beam and target.** E = 7.98 MeV/u, i.e. E_lab = 1085 MeV and E_cm ≈ 643 MeV (my calculation). The 198Pt target (91.6 %) was 1.3 mg/cm².
- **What was measured.** Isotopically identified PLFs (Z = 50–58). TLF (Z = 74–80) isotopic distributions come via the binary partner, with evaporation handled in the analysis [method not seen in full text].
- **Critical caveat.** All values are cross sections integrated over θ_lab = 24–34° only, and are not angle-integrated totals (EXFOR D0799 labels them as such). A model must be filtered to this angular window before comparison.
- **Elastic/Rutherford ratio (D0799002).** It is 1.0 at 29°, 0.15 at 33° and 0.043 at 34°, so the grazing angle is near θ_lab ≈ 31–32°. This last value is my inference from the curve, not a number stated in the paper.
- **Uncertainties.** Acceptance 11–18 %; charge-state extrapolation 1–22 %; normalisation +17/−21 %.
- **Selected values (EXFOR D0799003), in mb:**

| Group | Nuclide | σ (mb) |
|---|---|---|
| N=126 isotones | 204Pt | 0.90±0.26 |
| N=126 isotones | 203Ir | 0.23 (−0.073/+0.066) |
| N=126 isotones | 202Os | 7.8e-2 (±0.022) |
| N=126 isotones | 201Re | 2.0e-2 (±0.0057) |
| N=126 isotones | 200W | 5.1e-3 (−1.4/+1.7 e-3) |
| Os chain | 190Os | 15 |
| Os chain | 204Os | 3.3e-2 |
| Os chain | 206Os | 7.7e-3 |
| Hg | 198Hg | 14 |
| Hg | 204Hg | 0.67 |
| Hg | 207Hg | 2.3e-2 |
| PLF | 135Xe | 430 |
| PLF | 137Xe | 270 |
| PLF | 134Xe | 110 |
| PLF | 136Ba | 29 |
| PLF | 131Te | 9.0 |

- **Physics message.** The N=126 isotones with Z<78 are formed mainly in events with small kinetic-energy dissipation. MNT gives larger cross sections than fragmentation for these isotones.

**(b) Desai et al., PRC 99, 044604 (2019) and EPJ A 56, 150 (2020). ANL ATLAS, Loveland group.**
- **Beam and target.** Thin-target stack: 3.2 + 4.0 mg/cm² 198Pt plus a 24 mg/cm² Au catcher. E_lab = 760.5 MeV at the centre of the target (5.59 MeV/u), E_cm = 450 MeV (451 in EXFOR).
- **Yields measured.**
  - 2019: 42 PLF/fission yields and 36 TLF yields, off-line γ. EXFOR C2398.
  - 2020: extended to 171 nuclides with Gammasphere in-beam and between-burst γγγ. EXFOR C2922.
  - Independent yields carry an extra 30 % systematic uncertainty.
- **Selected independent yields (C2398), in mb:**

| Nuclide | σ_IY (mb) |
|---|---|
| 199Au | 168.8±16.9 |
| 196mAu | 115.3±11.5 |
| 198Au | 16.5±1.5 |
| 203Hg | 17.5±1.7 |
| 197Hg | 5.82±0.65 |
| 195mPt | 20±4.3 |
| 191Pt | 4.5±0.45 |
| 195mIr | 17.8±1.9 |
| 189Re | 14.8±1.4 |
| 204Bi | 0.66±0.07 |
| 135Xe | 164.5±16.5 |

- **Selected in-beam independent yields (C2922), in mb:**

| Nuclide | σ (mb) |
|---|---|
| 192Os | 32.1±3.2 |
| 190Os | 11.9±1.2 |
| 198Pt | 51.6±5.2 |
| 196Pt | 29.4±3.3 |
| 200Pt | 10.4±1.0 |
| 196Ir | 22.9±2.2 |

- **Energy dependence (key validation point).** At E_cm = 450 MeV the TLF and PLF yields are substantially smaller than at 1085 MeV [Wat15].
- **Model comparison.** GRAZING and DNS fail at this energy, while ImQMD describes the yields adequately (abstract).

**(c) KISS (RIKEN) results for this system.**
- These are β/γ spectroscopy, laser spectroscopy and MRTOF mass papers (see [Wat25] for an overview).
- They report yields or rates, not cross sections.
- KISS efficiency is about 0.1 % (KISS-II design report, arXiv:2209.12649, not peer-reviewed). Use them only as existence and relative-rate checks.

### 2.4 238U + 248Cm (priority), 238U + 238U and 238U + 232Th

**238U + 248Cm**
- **Schädel et al., PRL 48, 852 (1982).**
  - Thick-target radiochemistry at GSI UNILAC, at about 7.4 MeV/u (E_cm ≈ 899 MeV, my calculation). The energy is [partially verified] via secondary sources; the ≈7.4 MeV/u figure is not quoted from the PRL itself.
  - Measured cross sections for heavy actinides (Cf, Es, Fm, Md), compared with lighter projectiles on 248Cm.
  - Finding (abstract): yields of a given isotope are similar for different projectiles. Larger mass transfer with heavier projectiles is balanced by a lower survival probability at higher excitation.
  - **The isotope cross-section values were not accessible here and are not in EXFOR.** This is the main remaining gap for the priority list.
- **Kratz, Schädel, Gäggeler, PRC 88, 054615 (2013).** Re-analysis of the U+U and U+Cm thick-target data (abstract):
  - σ(Z) below the target is consistent with a diffusion model in the 7.65–8.30 and 6.06–7.50 MeV/u intervals.
  - In the 6.06–6.49 MeV/u interval it is about 5× below the model, i.e. a threshold for massive transfer close to the barrier.
  - Surviving Cf/Es/Fm come from the low-excitation tail, with E* ≲ 35 MeV (3n–4n channels).
  - EXFOR **D0776** compiles the 238U + 238U part (Table IV) only.
- **Glässel et al., PRL 43, 1483 (1979).** 7.5 MeV/u U+U and U+Cm three-body exit channels, i.e. sequential fission with scission-to-scission times ≳10⁻²⁰ s.
- **Kratz et al., PRC 33, 504 (1986)** [Kra86]. Superheavy-element search in U+Cm damped collisions (negative result). Gäggeler et al. [Gag80] did the corresponding U+U search and set limits of 10⁻³²–10⁻³⁵ cm².
- **Kratz, Loveland, Moody, NPA 944, 117 (2015).** Review with compiled cross sections for transuranium production in MNT [tables not seen; accepted manuscript at OSTI 1542116].
- **Yang et al., PLB 862, 139318 (2025)** [Yan25] is **theory (IQMD), not an experiment**. It is useful only for its predicted angular distribution: at E_cm = 800 MeV the heavy actinides are pushed towards 0°.

**238U + 238U: EXFOR D0776 (Kratz 2013, Table IV)**
- These are thick-target integrals from the incident energy down to the barrier. Independent cross sections in nb:

| E (MeV/u) | Nuclide | σ (nb) |
|---|---|---|
| 7.50 | 248Cf | 135±25 |
| 7.50 | 250Cf | 150±100 |
| 7.50 | 252Cf | 25±20 |
| 7.50 | 254Cf | 1.15±0.3 |
| 7.50 | 252Es | 6±4 |
| 7.50 | 254mEs | 1.05±0.35 |
| 7.50 | 252Fm | 0.49±0.15 |
| 7.50 | 254Fm | 1.25±0.75 |
| 7.50 | 256Fm | <0.32 |
| 6.84 | 252Cf | 33.5±8 |
| 6.84 | 256Fm | 1.2±1.0 |
| 6.49 | 256Fm | 1.0±0.7 |
| 8.65 | 250Cf | 120±50 |

- Cumulative: σ(253Es) = 4.5±2.0 nb at 7.50 MeV/u.
- Other U+U measurements:
  - Freiesleben et al. [Fre79] and Hildenbrand et al. [Hil77], 7.42 MeV/u: thin-target counter experiments giving Z, TKE and angle distributions. Fission of one or both partners dominates.
  - Golabek et al. [Gol10], VAMOS, 6.09–7.35 MeV/u: for transfers of more than 10 nucleons the TKE becomes independent of beam energy and lies far below the Coulomb energy of touching spheres.

**238U + 232Th**
- **Wuenschel et al., PRC 97, 064602 (2018), arXiv:1802.03091, Texas A&M.**
  - 7.5 MeV/u 238U on an 11 mg/cm² 232Th target, thick target down to 6.1 MeV/u.
  - In-beam α detection with a YAP active catcher at 7–60°. α energies reach about 12 MeV; Table I lists correlated α–α pairs.
  - **No isotope identification and no isotopic cross sections.** This is only a qualitative check.

### 2.5 40Ca + 208Pb (priority, lighter quasi-elastic)
- **Szilner et al., PRC 71, 044610 (2005)** plus **EPJ A 21, 87 (2004)**, arXiv:nucl-ex/0312004.
  - Setup: LNL time-of-flight spectrometer (PISOLO); Q-value resolution about 2 MeV.
  - Energies: E_lab = 235 and 249 MeV (E_cm ≈ 197/209 MeV). The 2004 paper also has 225, 236 and 250 MeV.
  - Differential cross sections span θ_cm ≈ 49–125°. The bell-shaped distributions peak at θ_cm ≈ 91–95° at 235 MeV, which is the grazing angle.
  - The PRC 76 (2007) PRISMA paper does **not** contain 40Ca+208Pb. It covers 40Ca+96Zr and 90Zr+208Pb.
- **Total cross sections (EXFOR D0845003), in mb:**

| Channel (light fragment) | 235 MeV | 249 MeV |
|---|---|---|
| +1n (41Ca) | 136±14 | 120±20 |
| +2n (42Ca) | 50±5 | 55±9 |
| +3n | 11±2 | 13±3 |
| +4n | 4±1 | 5±1 |
| −1p (39K) | 47±5 | 49±9 |
| −1p+1n (40K) | 25±3 | 35±7 |
| −2p (38Ar) | 42±4 | 42±8 |
| −2p+2n (40Ar) | 14±2 | 14±3 |
| Sum of all tabulated transfer channels (my arithmetic) | ≈464 | ≈505 |

- **Features a model must reproduce:**
  - Neutron pick-up yields follow a Poisson-like fall-off with mean ≈1.1 at 236 MeV.
  - The +2n channel concentrates at E_x ≈ 6 MeV, the pairing-vibration 0⁺ region of 42Ca.
  - Pure successive single-nucleon transfer under-predicts the ±2p and 2n channels, so direct pair transfer is needed.
  - The −2p and −2p+2n channels are strong (charged-pair stripping).
- **Reflected-flux measurement (Cook et al., Nat. Commun. 14, 7988 (2023)).**
  - PRISMA at 115°, 12 energies from E_cm = 189.0 to 230.5 MeV.
  - Elastic survival is 11.6±0.1 % at R_min − R_B = 0.46 fm.
  - Mean E_x of the reflected flux is 19.4 MeV (29.5 MeV for MNT).
  - At E/V_B = 0.91, 34 % of the flux remains 40Ca.

### 2.6 58Ni + 208Pb (priority, lighter quasi-elastic)
- **Corradi et al., PRC 66, 024606 (2002)** and NPA 734, 237 (2004).
  - E_lab = 328.4 MeV, E_cm ≈ 257 MeV (my calculation).
  - Light fragments identified in the LNL TOF spectrometer. Heavy partners detected in an MWPPC, giving the fission-survival probability of the heavy fragments.
  - Differential cross sections at θ_cm ≈ 85–125°.
- **Totals (EXFOR D0843003, no uncertainties given), in mb:**

| Channel (light fragment) | σ (mb) |
|---|---|
| +1n (59Ni) | 183.2 |
| +2n | 59.6 |
| +3n | 14.3 |
| −1p (57Co) | 30.7 |
| −1p+1n | 23.9 |
| −2p (56Fe) | 19.9 |
| −2p+1n | 17.7 |
| Sum of 60 channels (my arithmetic) | ≈472 |

- **Model requirement.** The data need a proton-pair transfer mode in addition to the one-particle transfers.
- **Supplementary 58Ni+208Pb data:**
  - Królas et al. [Kro10]: 345 MeV thick target, γγ yield map, EXFOR D0620.
  - Chatterjee et al. [Cha91]: 6.65 MeV/u, neutron-coincidence excitation-energy partition in damped collisions.

### 2.7 40Ar + 208Pb (best-documented PRISMA absolute dataset)
- **Mijatović et al., PRC 94, 064616 (2016)**, EPJ A 52, 113 (2016) and APPB 46, 439 (2015).
  - E_lab = 255 MeV (6.4 MeV/u), about 25 % above the barrier; E_cm ≈ 214 MeV (my calculation).
  - Grazing angle θ_lab = 54°.
  - Three PRISMA settings (46°, 54°, 59°) cover 41–62°, with the spectrometer response function unfolded.
  - Absolute scale from Rutherford scattering at forward angles; systematic uncertainty up to about 20 %.
- **Totals (EXFOR D0816004), in mb:**

| Channel (light fragment) | σ (mb) |
|---|---|
| +1n | 221±9 |
| +2n | 43±1 |
| +3n | 5.2±0.2 |
| −1n | 46±2 |
| −2n | 6.2±0.4 |
| −1p | 48.0±1.0 |
| −1p+1n | 19.3±0.5 |
| −1p−1n | 22.7±0.6 |
| −2p | 17.4±0.6 |
| −2p−2n | 20.8±0.5 |
| +1p (41K) | 8.2±0.4 |
| +1p+1n | 10.4±0.4 |
| +1p+2n | 11.1±0.4 |
| Sum of 61 channels (my arithmetic) | ≈572 |

- **Elastic/Rutherford (D0816002).** Drops to 0.45 at 56°.
- **Physics message.** The neutron-rich 40Ar projectile opens proton pick-up channels. Deep-inelastic contributions, visible as TKEL tails, are significant for proton channels, and GRAZING underestimates them.

### 2.8 Other well-tabulated systems useful for validation
- **206Pb+118Sn at 1200 MeV (EXFOR D8060).**
  - Totals in mb: +1n 188±53, −1n 127±22, +2n 61±11, −2n 41.9±4.1, +1p 38.5±3.2, −1p 46.8±8.0, −2p 10.3±1.0.
  - The absolute scale is normalised to GRAZING +1n. Use it for shape and relative checks only.
  - Q distributions extend to about 150 MeV energy loss.
- **92Mo+54Fe at 369.74 MeV (EXFOR D8119).** Absolute cross sections normalised to Rutherford, integrated over 16–28°, in mb:

| Channel | σ (mb) |
|---|---|
| +1n | 31.7±3.9 |
| −1n | 10.7±2.3 |
| +2n | 5.36±0.31 |
| −1p | 13.0±0.8 |
| +1p | 6.64±1.02 |
| −2p | 2.89±0.19 |
| +2p | 0.78±0.08 |

- **40Ca+124Sn at 170 MeV (EXFOR O1046), in mb:**

| Channel | σ (mb) |
|---|---|
| +1n | 75 (17 %) |
| +2n | 25 (16 %) |
| +3n | 4.2 |
| −1p | 52 (15 %) |
| −2p | 29 (17 %) |

- **204Hg+208Pb (EXFOR C2515).** Selected independent yields in mb:

| Nuclide | 977 MeV | 1143 MeV |
|---|---|---|
| 203Hg | 31.2±3.1 | 17.5±1.7 |
| 203Pb | 4.45±0.05 | 1.24±0.20 |
| 211Rn | 0.43±0.07 | 0.28±0.07 |

  - The arXiv tables repeat identical values for several Au/Pb isotopes. Check them against the published version.
- **48Ca+248Cm (SHIP; EXFOR D8038).**
  - At 270.2 MeV: σ(260No) = 1.7±1.0 nb (tentative, 3 events); cumulative σ(254Fm) = 0.90±0.07 nb; cumulative σ(256Fm) = 39±14 nb.
  - New isotopes 216U, 219Np, 223Am, 229Am and 233Bk at about 5 nb each, uncertain by a factor of 5–10 because of SHIP's model-dependent angular acceptance [Dev15].
  - Radiochemical kinematics (TKEL of Fm isotopes vs angle) in [Got17].
  - 1–2 mb per element for cold Rn–U target-like fragments in [Gag86].

### 2.9 Checklist: what to reproduce, and how to compare fairly
1. **Angle windows.**
   - Watanabe 2015: 24–34° lab.
   - PRISMA: the setting-dependent acceptance, unless the paper unfolds it (40Ar+208Pb does).
   - CORSET: 25–70°.
   - SHIP/SHELS: about 0°±2°.
   - Filter the model before comparing.
2. **Thick-target integrals** (radiochemistry, Barrett, Desai, Kratz). These are integrated over energy from E_in down to the barrier. Fold the model with the energy loss, and use cumulative vs independent yields correctly.
3. **Primary vs secondary distributions.**
   - Kozulin gives primary masses from 2-body kinematics.
   - All isotope-identified data are post-evaporation.
   - Neutron evaporation shifts TLF centroids by several mass units (e.g. about 11 neutrons unaccounted for in 128Te–205Po pairs, Barrett 2015).
4. **Normalisation provenance.** Vogt 2015, Szilner 2007 and Diklić 2023 are normalised to GRAZING. Čolović 2020 is normalised to DWBA. Weight these lower for absolute tests.
5. **Global features:**
   - Two-humped primary mass distributions with a quasi-elastic peak holding more than 60 % of damped yield (Xe+Pb).
   - TKEL tails to about 200–350 MeV (Xe+Pb).
   - Angular focusing near grazing that broadens with energy.
   - Sequential fission of heavy TLFs rising from about 0 to 55 % with energy (Xe+Pb).
   - An energy threshold for massive transfer near the barrier (U+U, Kratz 2013).

## 3. Numerical data availability

### 3.1 How EXFOR was searched
- **Two routes.**
  - The IAEA Dataexplorer REST API: `https://nds.iaea.org/dataexplorer/api/reactions/xs?target_elem=Pb&target_mass=208&reaction=54-XE-136,x`, with each entry checked through `.../api/exfor/entry/<ID>/bib`.
  - The classic X4 servlet (`https://www-nds.iaea.org/exfor/servlet/X4sSearch5`).
- **Scan coverage.** A scan of 43 projectiles (16O to 238U) × 44 targets found every entry listed below.
- **Scan limitation.** The `xs` endpoint only returns SIG-type data, so entries coded differently (e.g. Barrett's CUM/IND yields in C2178) were found through the servlet.
- **Fetching the data.** Any entry can be downloaded as X4 or JSON via `https://nds.iaea.org/dataexplorer/api/exfor/entry/<ID>`. From Python, send a curl-like User-Agent; the default urllib agent gets HTTP 403.

### 3.2 EXFOR accession numbers (all checked against the entry's bibliography)

| EXFOR | System | Content | Paper |
|---|---|---|---|
| **C2178** | 136Xe+208Pb, E_cm=450 MeV | 235 cumulative + 235 independent PLF/TLF yields | Barrett 2015 |
| **F1274** | 136Xe+208Pb, 850 MeV | σ(210Po, 222Rn, 224Ra) | Kozulin 2012 |
| **D0799** | 136Xe+198Pt, 1085 MeV | 174 isotope σ (θ_lab 24–34°), elastic/Rutherford | Watanabe 2015 |
| **C2398** | 136Xe+198Pt, E_cm=450 MeV | PLF/TLF cumulative and independent yields | Desai 2019 |
| **C2922** | 136Xe+198Pt, E_cm=451 MeV | 171 nuclide yields | Desai 2020 (EPJA) |
| **C2534** | 136Xe+238U, 1150 MeV; 136Xe+natGd | σ(211Rn); upper limits | Otto 1977 |
| **A0031** | 136Xe+natU, ≈1 GeV | 70 σ plus fission mass distribution | Bruchertzeifer 1977 |
| **C2035** | 136Xe+244Pu, 965 MeV | U/Np/Pu σ | Jae 1981 |
| **C2558** | 136Xe+249Cf | Actinide σ | Gregorich 1987 |
| **C2552** | 18O, 86Kr, 136Xe + 248Cm | Actinide σ | Moody 1986 |
| **C2556** | 129,132Xe+248Cm | Actinide σ | Welch 1987 |
| **D0776** | 238U+238U, 6.49–8.65 MeV/u (thick target) | Cf/Es/Fm σ (nb). The U+Cm data are **not** compiled | Kratz 2013 |
| **C2515** | 204Hg+208Pb, 977 and 1143 MeV | Yields | Desai 2020 (PRC) |
| **C1829** | 160Gd+186W, 859 MeV | Mass-yield curve | Loveland 2011 |
| **F1350** | 156,160Gd+186W | Mass/TKE data | Kozulin 2017 |
| **D8038** | 48Ca+248Cm, 270.2 MeV | σ for Z≥98 (e.g. 260No, 254,256Fm) | Devaraja 2019 |
| **C2551, C2553, C2537, A0173, C2550, A0358** | 40,48Ca / O / Ne + 248Cm, 254Es | Radiochemical actinide σ | Hoffman 1985; Gäggeler 1986; Hulet 1977; Lee 1982; Lougheed 1985; Schädel 1986 |
| **C2531, C2533** | 84Kr+238U (605 MeV); 40Ar+238U (288 MeV) | Mass / element–mass yields | Kratz 1974, 1976 |
| **A0015, A0023, A0046** | 40Ar+232Th (379 MeV); 40Ar, 20Ne + 197Au | Element σ | Artukh 1976–78 |
| **C2547** | 20,22Ne+232Th | Pa/U/Np σ | Tanaka 1984 |
| **D0845** | 40Ca+208Pb, 235 and 249 MeV | Total and differential σ per channel | Szilner 2005 |
| **D0843** | 58Ni+208Pb, 328.4 MeV | Total σ per channel (no errors) | Corradi 2002 |
| **D0816** | 40Ar+208Pb, 255 MeV | Total σ per channel, elastic/Rutherford | Mijatović 2016 |
| **D0620, D0635** | 58Ni+208Pb (345), 64Ni+130Te (275), 64Ni+208Pb (350) | γγ-based product yields | Królas 2010, 2003 |
| **O1046, O1042** | 40Ca+124Sn, 170 MeV (and sub-barrier) | Total σ per channel | Corradi 1996; Stefanini 1998 |
| **O1043, O1049** | 40Ca+90,96Zr | σ per channel | Montagnoli 1997, 2002 |
| **A0909** | 48Ca+64Ni, 282 MeV | Inelastic and ±1n/±1p differential σ | Montanari 2011 |
| **D8060** | 206Pb+118Sn, 1200 MeV | σ per channel (normalised to GRAZING +1n) | Diklić 2023 |
| **D8119** | 92Mo+54Fe, 343–370 MeV | Absolute σ, n/p/2p/2p2n channels | Mijatović 2026 |
| **C1901** | 86Kr (15 MeV/u) + 58,64Ni, 112,124Sn | PLF isotope σ | Souliotis 2011 |
| **D8068** | 70Zn (15 MeV/u) + 64Ni | PLF σ | Koulouris 2023 |
| **F1541** | 48Ca+197Au | Au isotope σ | Azhibekov 2023 |
| **D6429, A0678, C2417** | 16O+154Sm; 16,18O+90Zr; 18O+Hg/Tl/Pb | Light-projectile MNT σ | Roy 2022; Jha 2004; Eskola 1984 |

### 3.3 Priority or important papers with no EXFOR entry found
- **136Xe+238U:** Vogt 2015 (figures only, relative) and Kozulin 2024.
- **238U+248Cm:** Schädel 1982. This is the largest gap: the isotopic cross sections exist only in the PRL figures and in the Kratz–Loveland–Moody 2015 review, whose accepted manuscript is at OSTI 1542116.
- **LNL / PRISMA systems:**
  - 64Ni+238U (Corradi 1999)
  - 48Ca+124Sn (1997)
  - 32S+208Pb (1994)
  - 96Zr+40Ca (2011)
  - 60Ni+116Sn (2014/2016)
  - 197Au+130Te (2018)
  - 90Zr+208Pb (2007/2015)
  - 94Rb+208Pb (2020)
- **Other heavy systems:**
  - Welsh 2017 (204Hg+198Pt)
  - Golabek 2010 (U+U, VAMOS)
  - Wuenschel 2018 (U+Th)
  - Devaraja 2015/2020/2025 and Heinz 2016 (SHIP/SHELS tables)
- **Classic DIC:** Essel 1979 and Schröder 1978.
- **Other routes to numbers.**
  - Open full texts exist for some of these: arXiv (Szilner 2007, Barrett 2015, Wuenschel 2018, Desai 2020 PRC, Williams 2018, Kumar 2024), the IRB Zagreb repository fulir.irb.hr (several PRISMA papers), and the JYX self-archive (Kozulin 2012).
  - A HEPData keyword search ("multinucleon transfer", "136Xe 208Pb") returned no relevant low-energy MNT records.
  - No numerical supplemental material was found for the papers inspected (paywalled supplements could not be checked).

### 3.4 Data-quality flags
1. **D0799 (Watanabe 2015)** is integrated over θ_lab = 24–34°, not over 4π.
2. **D8038** codes the projectile as 20-CA-40, but the paper is 48Ca+248Cm. Also check the relative size of the 256Fm and 254Fm values against the paper.
3. **D0843** gives no uncertainties.
4. **D0845** differential data carry an error column that looks relative; check the entry's header.
5. **Normalised to GRAZING or DWBA, not independently absolute:** D8060, Szilner 2007, Vogt 2015, Čolović 2020.
6. **Desai 2020 (arXiv:2007.07837)** repeats identical yields for several Au and Pb isotopes. Use the journal version or EXFOR C2515.
7. **Thick-target radiochemical σ are energy-integrated.** This applies to D0776, C2534, A0031, C2178 and C2398/C2922 (centre of target).
8. **Welsh 2017 beam energy** is given as 1360 MeV there but as 1257 MeV in Desai 2020 [unresolved].

## 4. Verified bibliography

Every entry below was resolved via its DOI through the Crossref API; arXiv IDs come from INSPIRE-HEP. Keys match the tables above. Titles are reproduced from Crossref metadata; spacing lost in MathML rendering was repaired.

### Reviews

- **[CPS09]** L. Corradi, G. Pollarolo, S. Szilner, "Multinucleon transfer processes in heavy-ion reactions", J. Phys. G: Nucl. Part. Phys. **36**, 113101 (2009). doi:[10.1088/0954-3899/36/11/113101](https://doi.org/10.1088/0954-3899/36/11/113101)
- **[Cor13]** L. Corradi, S. Szilner, G. Pollarolo et al., "Multinucleon transfer reactions: Present status and perspectives", Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms **317**, 743-751 (2013). doi:[10.1016/j.nimb.2013.04.093](https://doi.org/10.1016/j.nimb.2013.04.093)
- **[Mij22]** T. Mijatović, "Multinucleon transfer reactions: a mini-review of recent advances", Front. Phys. **10**, 965198 (2022). doi:[10.3389/fphy.2022.965198](https://doi.org/10.3389/fphy.2022.965198)
- **[Mij25]** T. Mijatović, S. Szilner, L. Corradi et al., "Multinucleon Transfer Reactions: Recent Insights from Experiments at LNL-INFN", EPJ Web Conf. **324**, 00004 (2025). doi:[10.1051/epjconf/202532400004](https://doi.org/10.1051/epjconf/202532400004)
- **[HD22]** S. Heinz, H. M. Devaraja, "Nucleosynthesis in multinucleon transfer reactions", Eur. Phys. J. A **58**, 114 (2022). doi:[10.1140/epja/s10050-022-00771-1](https://doi.org/10.1140/epja/s10050-022-00771-1)
- **[Ada20]** G. G. Adamian, N. V. Antonenko, A. Diaz-Torres et al., "How to extend the chart of nuclides?", Eur. Phys. J. A **56**, 47 (2020). doi:[10.1140/epja/s10050-020-00046-7](https://doi.org/10.1140/epja/s10050-020-00046-7)
- **[Lov19]** W. D. Loveland, "The Synthesis of New Neutron-Rich Heavy Nuclei", Front. Phys. **7**, 23 (2019). doi:[10.3389/fphy.2019.00023](https://doi.org/10.3389/fphy.2019.00023)
- **[KLM15]** J. Kratz, W. Loveland, K. Moody, "Syntheses of transuranium isotopes with atomic numbers Z≤ 103 in multi-nucleon transfer reactions", Nuclear Physics A **944**, 117-157 (2015). doi:[10.1016/j.nuclphysa.2015.06.004](https://doi.org/10.1016/j.nuclphysa.2015.06.004)
- **[PV23]** R. M. Pérez-Vidal, F. Galtarossa, T. Mijatović et al., "Nuclear structure advancements with multi-nucleon transfer reactions", Eur. Phys. J. A **59**, 114 (2023). doi:[10.1140/epja/s10050-023-01027-2](https://doi.org/10.1140/epja/s10050-023-01027-2)
- **[Vol78]** V. Volkov, "Deep inelastic transfer reactions — The new type of reactions between complex nuclei", Physics Reports **44**, 93-157 (1978). doi:[10.1016/0370-1573(78)90200-4](https://doi.org/10.1016/0370-1573(78)90200-4)

### 136Xe + 208Pb / 238U / 209Bi and related

- **[Koz12]** E. M. Kozulin, E. Vardaci, G. N. Knyazheva et al., "Mass distributions of the system 136Xe+208Pb at laboratory energies around the Coulomb barrier: A candidate reaction for the production of neutron-rich nuclei at N=126", Phys. Rev. C **86**, 044611 (2012). doi:[10.1103/physrevc.86.044611](https://doi.org/10.1103/physrevc.86.044611)
- **[Bar15]** J. S. Barrett, W. Loveland, R. Yanez et al., "Xe136+Pb208 reaction: A test of models of multinucleon transfer reactions", Phys. Rev. C **91**, 064615 (2015). doi:[10.1103/physrevc.91.064615](https://doi.org/10.1103/physrevc.91.064615); arXiv:[1505.00257](https://arxiv.org/abs/1505.00257)
- **[Ess79]** H. Essel, K. Hartel, W. Henning et al., "Charge and mass transfer in the reaction 136Xe+208Pb at energies close to the coulomb barrier", Z Physik A **289**, 265-271 (1979). doi:[10.1007/bf01415787](https://doi.org/10.1007/bf01415787)
- **[Van76a]** R. Vandenbosch, M. Webb, T. Thomas et al., "Energy, angular and charge distributions for deeply inelastic scattering of Xe by Ta and Pb", Nuclear Physics A **269**, 210-222 (1976). doi:[10.1016/0375-9474(76)90407-3](https://doi.org/10.1016/0375-9474(76)90407-3)
- **[Nov16]** K. Novikov, I. Harca, E. Kozulin et al., "The study of neutron-rich nuclei production in the region of the closed shell N=126 in the multi-nucleon transfer reaction 136Xe+208Pb", J. Phys.: Conf. Ser. **703**, 012020 (2016). doi:[10.1088/1742-6596/703/1/012020](https://doi.org/10.1088/1742-6596/703/1/012020)
- **[Que18]** D. Quero, E. Vardaci, E. M. Kozulin et al., "Production of n-rich Nuclei along the Closed Shell N=126 in the collision 136Xe + 208Pb @E lab =870 MeV", J. Phys.: Conf. Ser. **1014**, 012015 (2018). doi:[10.1088/1742-6596/1014/1/012015](https://doi.org/10.1088/1742-6596/1014/1/012015)
- **[Kum24]** D. Kumar, T. Dickel, A. Zadvornaya et al., "First investigation on the isomeric ratio in multinucleon transfer reactions: Entrance channel effects on the spin distribution", Physics Letters B **853**, 138654 (2024). doi:[10.1016/j.physletb.2024.138654](https://doi.org/10.1016/j.physletb.2024.138654); arXiv:[2401.06206](https://arxiv.org/abs/2401.06206)
- **[Vog15]** A. Vogt, B. Birkenbach, P. Reiter et al., "Light and heavy transfer products in Xe136+U238 multinucleon transfer reactions", Phys. Rev. C **92**, 024619 (2015). doi:[10.1103/physrevc.92.024619](https://doi.org/10.1103/physrevc.92.024619)
- **[Koz24]** E. M. Kozulin, G. N. Knyazheva, A. V. Karpov et al., "Detailed study of multinucleon transfer features in the Xe136+U238 reaction", Phys. Rev. C **109**, 034616 (2024). doi:[10.1103/physrevc.109.034616](https://doi.org/10.1103/physrevc.109.034616)
- **[Ott76]** R. J. Otto, M. M. Fowler, D. Lee et al., "Mass Yield Distributions in the Reaction of Xe136 Ions with U238", Phys. Rev. Lett. **36**, 135-138 (1976). doi:[10.1103/physrevlett.36.135](https://doi.org/10.1103/physrevlett.36.135)
- **[Ott77]** R. J. Otto, A. Ghiorso, D. Lee et al., "Search of Superheavy Elements Produced in the 136Xe + 238U Reaction and an Upper Limit Cross Section for the natGd(136Xe, X)212Pb Reaction", Radiochimica Acta **24**, 3-7 (1977). doi:[10.1524/ract.1977.24.1.3](https://doi.org/10.1524/ract.1977.24.1.3)
- **[Bir15]** B. Birkenbach, A. Vogt, K. Geibel et al., "Spectroscopy of the neutron-rich actinide nucleus U240 following multinucleon-transfer reactions", Phys. Rev. C **92**, 044319 (2015). doi:[10.1103/physrevc.92.044319](https://doi.org/10.1103/physrevc.92.044319)
- **[Vor25]** I. V. Vorobiev, E. M. Kozulin, G. N. Knyazheva et al., "Multinucleon-transfer fragments formed in the Bi 209 + U 238 reaction", Phys. Rev. C **112**, 014625 (2025). doi:[10.1103/tgv9-d1vf](https://doi.org/10.1103/tgv9-d1vf)
- **[Sch78]** W. Schröder, J. Birkelund, J. Huizenga et al., "Mechanisms of very heavy-ion collisions: The 209Bi + 136Xe reaction at ELab = 1130 MeV", Physics Reports **45**, 301-343 (1978). doi:[10.1016/0370-1573(78)90110-2](https://doi.org/10.1016/0370-1573(78)90110-2)
- **[Wil80]** W. W. Wilcke, J. R. Birkelund, A. D. Hoover et al., "Bombarding-energy dependence of the Bi209+Xe136 reaction", Phys. Rev. C **22**, 128-147 (1980). doi:[10.1103/physrevc.22.128](https://doi.org/10.1103/physrevc.22.128)
- **[Wol81]** H. J. Wollersheim, W. W. Wilcke, J. R. Birkelund et al., "Bi209+Xe136 reaction at Elab=1422MeV", Phys. Rev. C **24**, 2114-2126 (1981). doi:[10.1103/physrevc.24.2114](https://doi.org/10.1103/physrevc.24.2114)
- **[Kra79]** J. Kratz, W. Brüchle, G. Franz et al., "Study of the NZ ratios of light and heavy fragments from collisions of 129Xe, 132Xe and 132Xe with 197Au near the interaction barrier", Nuclear Physics A **332**, 477-500 (1979). doi:[10.1016/0375-9474(79)90014-9](https://doi.org/10.1016/0375-9474(79)90014-9)
- **[Coc99]** J. Cocks, D. Hawcroft, N. Amzal et al., "Spectroscopy of Rn, Ra and Th isotopes using multi-nucleon transfer reactions", Nuclear Physics A **645**, 61-91 (1999). doi:[10.1016/s0375-9474(98)00586-7](https://doi.org/10.1016/s0375-9474(98)00586-7)
- **[Gre87]** K. E. Gregorich, K. J. Moody, D. Lee et al., "Actinide production in Xe136 bombardments of Cf249", Phys. Rev. C **35**, 2117-2124 (1987). doi:[10.1103/physrevc.35.2117](https://doi.org/10.1103/physrevc.35.2117)

### 136Xe + 198Pt

- **[Wat15]** Y. X. Watanabe, Y. H. Kim, S. C. Jeong et al., "Pathway for the Production of Neutron-Rich Isotopes around the N = 126 Shell Closure", Phys. Rev. Lett. **115**, 172503 (2015). doi:[10.1103/physrevlett.115.172503](https://doi.org/10.1103/physrevlett.115.172503)
- **[Wat13]** Y. Watanabe, Y. Hirayama, N. Imai et al., "Study of collisions of 136Xe +198Pt for the KEK isotope separator", Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms **317**, 752-755 (2013). doi:[10.1016/j.nimb.2013.04.036](https://doi.org/10.1016/j.nimb.2013.04.036)
- **[Kim14]** Y. H. Kim, Y. X. Watanabe, Y. Hirayama et al., "Study of the multi-nucleon transfer reactions of 136Xe +198Pt for producing exotic heavy nuclei", EPJ Web of Conferences **66**, 03044 (2014). doi:[10.1051/epjconf/20146603044](https://doi.org/10.1051/epjconf/20146603044)
- **[Des19]** V. V. Desai, W. Loveland, K. McCaleb et al., "The Xe136+Pt198 reaction: A test of models of multi-nucleon transfer reactions", Phys. Rev. C **99**, 044604 (2019). doi:[10.1103/physrevc.99.044604](https://doi.org/10.1103/physrevc.99.044604)
- **[Des20b]** V. V. Desai, W. Loveland, R. Yanez et al., "The $$^{136}\hbox {Xe} + ^{198}\hbox {Pt}$$ reaction: a detailed re-examination", Eur. Phys. J. A **56**, 150 (2020). doi:[10.1140/epja/s10050-020-00154-4](https://doi.org/10.1140/epja/s10050-020-00154-4)
- **[Wat25]** Y. Watanabe, Y. Hirayama, M. Mukai et al., "Spectroscopy of neutron-rich nuclei produced in multinucleon transfer reactions at KISS", Nuclear Physics A **1061**, 123140 (2025). doi:[10.1016/j.nuclphysa.2025.123140](https://doi.org/10.1016/j.nuclphysa.2025.123140)
- **[Niw23]** T. Niwase, Y. X. Watanabe, Y. Hirayama et al., "Discovery of New Isotope U241 and Systematic High-Precision Atomic Mass Measurements of Neutron-Rich Pa-Pu Nuclei Produced via Multinucleon Transfer Reactions", Phys. Rev. Lett. **130**, 132502 (2023). doi:[10.1103/physrevlett.130.132502](https://doi.org/10.1103/physrevlett.130.132502)

### Actinide / U-induced damped collisions

- **[Sch82]** M. Schädel, W. Brüchle, H. Gäggeler et al., "Actinide Production in Collisions of U238 with Cm248", Phys. Rev. Lett. **48**, 852-855 (1982). doi:[10.1103/physrevlett.48.852](https://doi.org/10.1103/physrevlett.48.852)
- **[Sch78b]** M. Schädel, J. V. Kratz, H. Ahrens et al., "Isotope Distributions in the Reaction of U238 with U238", Phys. Rev. Lett. **41**, 469-472 (1978). doi:[10.1103/physrevlett.41.469](https://doi.org/10.1103/physrevlett.41.469)
- **[Kra13]** J. V. Kratz, M. Schädel, H. W. Gäggeler, "Reexamining the heavy-ion reactions 238U+238U and 238U+248Cm and actinide production close to the barrier", Phys. Rev. C **88**, 054615 (2013). doi:[10.1103/physrevc.88.054615](https://doi.org/10.1103/physrevc.88.054615)
- **[Gla79]** P. Glässel, D. v. Harrach, Y. Civelekoglu et al., "Three-Particle Exclusive Measurements of the Reactions U238+U238 and U238+Cm248", Phys. Rev. Lett. **43**, 1483-1486 (1979). doi:[10.1103/physrevlett.43.1483](https://doi.org/10.1103/physrevlett.43.1483)
- **[Kra86]** J. V. Kratz, W. Brüchle, H. Folger et al., "Search for superheavy elements in damped collisions between U238 and Cm248", Phys. Rev. C **33**, 504-508 (1986). doi:[10.1103/physrevc.33.504](https://doi.org/10.1103/physrevc.33.504)
- **[Hil77]** K. D. Hildenbrand, H. Freiesleben, F. Pühlhofer et al., "Reaction between U238 and U238 at 7.42 MeV/Nucleon", Phys. Rev. Lett. **39**, 1065-1068 (1977). doi:[10.1103/physrevlett.39.1065](https://doi.org/10.1103/physrevlett.39.1065)
- **[Fre79]** H. Freiesleben, K. D. Hildenbrand, F. Pühlhofer et al., "The reaction 238U +238U at 7.42MeV/u", Z Physik A **292**, 171-189 (1979). doi:[10.1007/bf01441624](https://doi.org/10.1007/bf01441624)
- **[Gag80]** H. Gäggeler, N. Trautmann, W. Brüchle et al., "Search for Superheavy Elements in the U238+U238 Reaction", Phys. Rev. Lett. **45**, 1824-1827 (1980). doi:[10.1103/physrevlett.45.1824](https://doi.org/10.1103/physrevlett.45.1824)
- **[Gol10]** C. Golabek, S. Heinz, W. Mittig et al., "Investigation of deep inelastic reactions in 238U + 238U at Coulomb barrier energies", Eur. Phys. J. A **43**, 251-259 (2010). doi:[10.1140/epja/i2010-10911-5](https://doi.org/10.1140/epja/i2010-10911-5)
- **[Ute23]** A. Utepov, D. Ackermann, C. Stodel et al., "Multinucleon Transfer Reactions in the \(^{238}\mathrm {U}+{^{238}}\)U System Studied with the VAMOS\(+\)AGATA\(+\)ID-Fix", Acta Phys. Pol. B Proc. Suppl. **16**, 1 (2023). doi:[10.5506/aphyspolbsupp.16.4-a11](https://doi.org/10.5506/aphyspolbsupp.16.4-a11)
- **[Wue18]** S. Wuenschel, K. Hagel, M. Barbui et al., "Experimental survey of the production of α -decaying heavy elements in U238+Th232 reactions at 7.5–6.1 MeV/nucleon", Phys. Rev. C **97**, 064602 (2018). doi:[10.1103/physrevc.97.064602](https://doi.org/10.1103/physrevc.97.064602); arXiv:[1802.03091](https://arxiv.org/abs/1802.03091)
- **[Yan25]** Y. Yang, L. Zhu, Z. Liao et al., "Production of actinide isotopes near θ = 0∘ in multinucleon transfer reaction 238U + 248Cm", Physics Letters B **862**, 139318 (2025). doi:[10.1016/j.physletb.2025.139318](https://doi.org/10.1016/j.physletb.2025.139318)
- **[May85]** W. Mayer, G. Beier, J. Friese et al., "Structure effects in 238U-induced dissipative collisions", Physics Letters B **152**, 162-166 (1985). doi:[10.1016/0370-2693(85)91161-x](https://doi.org/10.1016/0370-2693(85)91161-x)
- **[Wag87]** W. Wagner, W. Mayer, G. Beier et al., "Periodic multi-proton transfer strength in collisions between heavy nuclei", Physics Letters B **196**, 117-121 (1987). doi:[10.1016/0370-2693(87)90589-2](https://doi.org/10.1016/0370-2693(87)90589-2)
- **[Pla88]** R. Planeta, S. H. Zhou, K. Kwiatkowski et al., "N/Z equilibration in damped collisions induced by E/A=8.5 MeV Ni58 and Ni64 on U238", Phys. Rev. C **38**, 195-209 (1988). doi:[10.1103/physrevc.38.195](https://doi.org/10.1103/physrevc.38.195)
- **[Reu77]** U. Reus, A. M. H. Wätzig, R. A. Esterlund et al., "Mass-Yield Distributions in the Reaction of Fe56 Ions with U238", Phys. Rev. Lett. **39**, 171-174 (1977). doi:[10.1103/physrevlett.39.171](https://doi.org/10.1103/physrevlett.39.171)
- **[Kra74]** J. V. Kratz, A. E. Norris, G. T. Seaborg, "Mass-Yield Distributions in the Reaction of Kr 84 Ions with U 238", Phys. Rev. Lett. **33**, 502-505 (1974). doi:[10.1103/physrevlett.33.502](https://doi.org/10.1103/physrevlett.33.502)
- **[Kra76]** J. V. Kratz (Crossref metadata misspells "Kartz"), J. O. Liljenzin, A. E. Norris et al., "Charge and mass distributions in the reaction of Ar40 ions with U238", Phys. Rev. C **13**, 2347-2365 (1976). doi:[10.1103/physrevc.13.2347](https://doi.org/10.1103/physrevc.13.2347)

### Symmetric heavy systems (Loveland group, Dubna)

- **[Wel17]** T. Welsh, W. Loveland, R. Yanez et al., "Modeling multi-nucleon transfer in symmetric collisions of massive nuclei", Physics Letters B **771**, 119-124 (2017). doi:[10.1016/j.physletb.2017.05.044](https://doi.org/10.1016/j.physletb.2017.05.044)
- **[Des20a]** V. V. Desai, A. Pica, W. Loveland et al., "Multinucleon transfer in the interaction of 977 MeV and 1143 MeV Hg204 with Pb208", Phys. Rev. C **101**, 034612 (2020). doi:[10.1103/physrevc.101.034612](https://doi.org/10.1103/physrevc.101.034612); arXiv:[2007.07837](https://arxiv.org/abs/2007.07837)
- **[Lov11]** W. Loveland, A. M. Vinodkumar, D. Peterson et al., "Synthesis of heavy nuclei using damped collisions: A test", Phys. Rev. C **83**, 044610 (2011). doi:[10.1103/physrevc.83.044610](https://doi.org/10.1103/physrevc.83.044610)
- **[Koz17]** E. M. Kozulin, V. I. Zagrebaev, G. N. Knyazheva et al., "Inverse quasifission in the reactions Gd156,160+W186", Phys. Rev. C **96**, 064621 (2017). doi:[10.1103/physrevc.96.064621](https://doi.org/10.1103/physrevc.96.064621)
- **[Koz14]** E. M. Kozulin, G. N. Knyazheva, S. N. Dmitriev et al., "Shell effects in damped collisions of Sr88 with Yb176 at the Coulomb barrier energy", Phys. Rev. C **89**, 014614 (2014). doi:[10.1103/physrevc.89.014614](https://doi.org/10.1103/physrevc.89.014614)

### 248Cm / 254Es targets, 48Ca-induced MNT, separators

- **[Dev15]** H. Devaraja, S. Heinz, O. Beliuskina et al., "Observation of new neutron-deficient isotopes with Z≥92in multinucleon transfer reactions", Physics Letters B **748**, 199-203 (2015). doi:[10.1016/j.physletb.2015.07.006](https://doi.org/10.1016/j.physletb.2015.07.006)
- **[Hei16]** S. Heinz, H. M. Devaraja, O. Beliuskina et al., "Synthesis of new transuranium isotopes in multinucleon transfer reactions using a velocity filter", Eur. Phys. J. A **52**, 278 (2016). doi:[10.1140/epja/i2016-16278-7](https://doi.org/10.1140/epja/i2016-16278-7)
- **[Dev19]** H. M. Devaraja, S. Heinz, O. Beliuskina et al., "Population of nuclides with $Z \geq 98$ in multi-nucleon transfer reactions of 48Ca + 248Cm", Eur. Phys. J. A **55**, 25 (2019). doi:[10.1140/epja/i2019-12696-3](https://doi.org/10.1140/epja/i2019-12696-3)
- **[Dev20]** H. M. Devaraja, S. Heinz, D. Ackermann et al., "New studies and a short review of heavy neutron-rich transfer products", Eur. Phys. J. A **56**, 224 (2020). doi:[10.1140/epja/s10050-020-00229-2](https://doi.org/10.1140/epja/s10050-020-00229-2)
- **[Dev25]** H. Devaraja, A. Yeremin, M. Chelnokov et al., "Systematic studies to produce heavy above-target nuclides in multinucleon transfer reactions", Physics Letters B **862**, 139353 (2025). doi:[10.1016/j.physletb.2025.139353](https://doi.org/10.1016/j.physletb.2025.139353)
- **[Got17]** M. Götz, S. Götz, J. Kratz et al., "Radiochemical study of the kinematics of multi-nucleon transfer reactions in 48Ca + 248Cm collisions 10% above the Coulomb barrier", Nuclear Physics A **961**, 1-21 (2017). doi:[10.1016/j.nuclphysa.2017.02.006](https://doi.org/10.1016/j.nuclphysa.2017.02.006)
- **[Gag86]** H. Gäggeler, W. Brüchle, M. Brügger et al., "Production of cold target-like fragments in the reaction of Ca 48 + 248 Cm", Phys. Rev. C **33**, 1983-1987 (1986). doi:[10.1103/physrevc.33.1983](https://doi.org/10.1103/physrevc.33.1983)
- **[Hof85]** D. C. Hoffman, M. M. Fowler, W. R. Daniels et al., "Excitation functions for production of heavy actinides from interactions of Ca40 and Ca48 ions with Cm248", Phys. Rev. C **31**, 1763-1769 (1985). doi:[10.1103/physrevc.31.1763](https://doi.org/10.1103/physrevc.31.1763)
- **[Tur92]** A. Türler, H. R. von Gunten, J. D. Leyba et al., "Actinide production from the interactions of Ca40 and Ca44 with Cm248 and a comparison with the Ca48+248Cm system", Phys. Rev. C **46**, 1364-1382 (1992). doi:[10.1103/physrevc.46.1364](https://doi.org/10.1103/physrevc.46.1364)
- **[Ley90]** J. D. Leyba, R. A. Henderson, H. L. Hall et al., "Heavy actinide production from the interactions of Ar40 with Cm248 and a comparison with the 44Ca+248Cm system" (isotope label partly garbled in Crossref metadata), Phys. Rev. C **41**, 2092-2102 (1990). doi:[10.1103/physrevc.41.2092](https://doi.org/10.1103/physrevc.41.2092)
- **[Ley91]** J. D. Leyba, R. A. Henderson, H. L. Hall et al., "Excitation functions for actinides produced in the interactions of P31 with Cm248", Phys. Rev. C **44**, 1850-1861 (1991). doi:[10.1103/physrevc.44.1850](https://doi.org/10.1103/physrevc.44.1850)
- **[Lee82]** D. Lee, H. von Gunten, B. Jacak et al., "Production of heavy actinides from interactions of O16,O18,Ne20, and Ne22 with Cm248", Phys. Rev. C **25**, 286-292 (1982). doi:[10.1103/physrevc.25.286](https://doi.org/10.1103/physrevc.25.286)
- **[Lee83]** D. Lee, K. J. Moody, M. J. Nurmia et al., "Excitation functions for production of heavy actinides from interactions of O18 with Cm248 and Cf249", Phys. Rev. C **27**, 2656-2665 (1983). doi:[10.1103/physrevc.27.2656](https://doi.org/10.1103/physrevc.27.2656)
- **[Moo86]** K. J. Moody, D. Lee, R. B. Welch et al., "Actinide production in reactions of heavy ions with Cm248", Phys. Rev. C **33**, 1315-1324 (1986). doi:[10.1103/physrevc.33.1315](https://doi.org/10.1103/physrevc.33.1315)
- **[Wel87]** R. B. Welch, K. J. Moody, K. E. Gregorich et al., "Dependence of actinide production on the mass number of the projectile: Xe+248Cm", Phys. Rev. C **35**, 204-212 (1987). doi:[10.1103/physrevc.35.204](https://doi.org/10.1103/physrevc.35.204)
- **[Sch86]** M. Schadel, W. Brüchle, M. Brügger et al., "Transfer cross sections from reactions with Es254 as a target", Phys. Rev. C **33**, 1547-1550 (1986). doi:[10.1103/physrevc.33.1547](https://doi.org/10.1103/physrevc.33.1547)
- **[Moo90]** K. J. Moody, R. W. Lougheed, R. J. Dougan et al., "Actinide cross sections from the reaction of C13 with Esg254", Phys. Rev. C **41**, 152-159 (1990). doi:[10.1103/physrevc.41.152](https://doi.org/10.1103/physrevc.41.152)
- **[Lou85]** R. W. Lougheed, J. H. Landrum, E. K. Hulet et al., "Search for superheavy elements using the Ca48+254Esg reaction", Phys. Rev. C **32**, 1760-1763 (1985). doi:[10.1103/physrevc.32.1760](https://doi.org/10.1103/physrevc.32.1760)
- **[Hul77]** E. K. Hulet, R. W. Lougheed, J. F. Wild et al., "Search for Superheavy Elements in the Bombardment of Cm248 with Ca48", Phys. Rev. Lett. **39**, 385-389 (1977). doi:[10.1103/physrevlett.39.385](https://doi.org/10.1103/physrevlett.39.385)
- **[Tan84]** S. Tanaka, K. J. Moody, G. T. Seaborg, "Transfer reaction cross sections from the interactions of Ne20 and Ne22 with Th232", Phys. Rev. C **30**, 911-915 (1984). doi:[10.1103/physrevc.30.911](https://doi.org/10.1103/physrevc.30.911)
- **[Xie26]** G. Xie, Z. Y. Zhang, J. G. Wang et al., "Multinucleon transfer products in 48Ca, 54Cr+243Am and 54Cr+238U reactions", Chinese Phys. C **50**, 064001 (2026). doi:[10.1088/1674-1137/ae4bab](https://doi.org/10.1088/1674-1137/ae4bab)
- **[Bel14]** O. Beliuskina, S. Heinz, V. Zagrebaev et al., "On the synthesis of neutron-rich isotopes along the N = 126 shell in multinucleon transfer reactions", Eur. Phys. J. A **50**, 161 (2014). doi:[10.1140/epja/i2014-14161-3](https://doi.org/10.1140/epja/i2014-14161-3)
- **[Com12]** V. Comas, S. Heinz, S. Hofmann et al., "Observation of rotating nuclear molecules and determination of their lifetimes", Eur. Phys. J. A **48**, 180 (2012). doi:[10.1140/epja/i2012-12180-8](https://doi.org/10.1140/epja/i2012-12180-8)
- **[Com13]** V. F. Comas, S. Heinz, S. Hofmann et al., "Study of multi-nucleon transfer reactions in 58, 64Ni + 207Pb collisions at the velocity filter SHIP", Eur. Phys. J. A **49**, 112 (2013). doi:[10.1140/epja/i2013-13112-x](https://doi.org/10.1140/epja/i2013-13112-x)
- **[Hei15]** S. Heinz, O. Beliuskina, V. Comas et al., "Nuclear molecule formation and time delay in collisions of nuclei with Z1 + Z2 $ \geq$ 110", Eur. Phys. J. A **51**, 140 (2015). doi:[10.1140/epja/i2015-15140-x](https://doi.org/10.1140/epja/i2015-15140-x)
- **[Azh23]** A. K. Azhibekov, S. M. Lukyanov, A. V. Shakhov et al., "Neutron transfer in the 48Ca + 197Au reaction", Eur. Phys. J. A **59**, 278 (2023). doi:[10.1140/epja/s10050-023-01192-4](https://doi.org/10.1140/epja/s10050-023-01192-4)
- **[Luk26]** S. M. Lukyanov, A. K. Azhibekov, V. A. Maslov et al., "Proton pickup and stripping in the $$^{48}{\textrm{Ca}} + {}^{197}{\textrm{Au}}$$ reaction at 400 MeV", Eur. Phys. J. A **62**, 158 (2026). doi:[10.1140/epja/s10050-026-01933-1](https://doi.org/10.1140/epja/s10050-026-01933-1)

### LNL (PRISMA and TOF spectrometer) and other near-barrier transfer

- **[Szi05]** S. Szilner, L. Corradi, G. Pollarolo et al., "Multinucleon transfer processes in Ca40+Pb208", Phys. Rev. C **71**, 044610 (2005). doi:[10.1103/physrevc.71.044610](https://doi.org/10.1103/physrevc.71.044610)
- **[Szi04]** S. Szilner, L. Corradi, F. Haas et al., "Search for pairing-vibration states of even Ca isotopes in 40Ca + 208Pb transfer reactions", Eur. Phys. J. A **21**, 87-91 (2004). doi:[10.1140/epja/i2003-10187-x](https://doi.org/10.1140/epja/i2003-10187-x); arXiv:[nucl-ex/0312004](https://arxiv.org/abs/nucl-ex/0312004)
- **[Szi07]** S. Szilner, C. A. Ur, L. Corradi et al., "Multinucleon transfer reactions in closed-shell nuclei", Phys. Rev. C **76**, 024604 (2007). doi:[10.1103/physrevc.76.024604](https://doi.org/10.1103/physrevc.76.024604); arXiv:[0707.0426](https://arxiv.org/abs/0707.0426)
- **[Coo23]** K. J. Cook, D. C. Rafferty, D. J. Hinde et al., "Colliding heavy nuclei take multiple identities on the path to fusion", Nat Commun **14**, 7988 (2023). doi:[10.1038/s41467-023-43817-8](https://doi.org/10.1038/s41467-023-43817-8)
- **[Coo25]** K. Cook, E. Simpson, D. Rafferty et al., "Quantitatively relating multinucleon transfer and fusion", Physics Letters B **865**, 139465 (2025). doi:[10.1016/j.physletb.2025.139465](https://doi.org/10.1016/j.physletb.2025.139465)
- **[Cor02]** L. Corradi, A. M. Vinodkumar, A. M. Stefanini et al., "Light and heavy transfer products in 58Ni+208Pb at the Coulomb barrier", Phys. Rev. C **66**, 024606 (2002). doi:[10.1103/physrevc.66.024606](https://doi.org/10.1103/physrevc.66.024606)
- **[Cor04]** L. Corradi, A. Vinodkumar, A. Stefanini et al., "Population of nuclei far from stability via multinucleon transfer: the 58Ni+208Pb case", Nuclear Physics A **734**, 237-240 (2004). doi:[10.1016/j.nuclphysa.2004.01.043](https://doi.org/10.1016/j.nuclphysa.2004.01.043)
- **[Kro10]** W. Królas, R. Broda, B. Fornal et al., "Dynamical deformation of nuclei in deep-inelastic collisions: A gamma coincidence study of 130Te+275 MeV 64Ni and 208Pb+345 MeV 58Ni heavy ion reactions", Nuclear Physics A **832**, 170-197 (2010). doi:[10.1016/j.nuclphysa.2009.10.159](https://doi.org/10.1016/j.nuclphysa.2009.10.159)
- **[Kro03]** W. Królas, R. Broda, B. Fornal et al., "Gamma coincidence study of 208Pb+350 MeV 64Ni collisions", Nuclear Physics A **724**, 289-312 (2003). doi:[10.1016/s0375-9474(03)01544-6](https://doi.org/10.1016/s0375-9474(03)01544-6)
- **[Cha91]** M. B. Chatterjee, S. P. Baldwin, J. R. Huizenga et al., "Energy partition in near-barrier strongly damped collisions Ni58+208Pb", Phys. Rev. C **44**, R2249-R2252 (1991). doi:[10.1103/physrevc.44.r2249](https://doi.org/10.1103/physrevc.44.r2249)
- **[Reh90]** K. E. Rehm, C. Beck, A. van den Berg et al., "Systematic behavior of one- and two-nucleon transfer reactions induced by medium-weight projectiles", Phys. Rev. C **42**, 2497-2507 (1990). doi:[10.1103/physrevc.42.2497](https://doi.org/10.1103/physrevc.42.2497)
- **[Reh88]** K. E. Rehm, A. M. van den Berg, J. J. Kolata et al., "Transition from quasi-elastic to deep-inelastic reactions in the 48Ti+208Pb system", Phys. Rev. C **37**, 2629-2646 (1988). doi:[10.1103/physrevc.37.2629](https://doi.org/10.1103/physrevc.37.2629)
- **[Mij16a]** T. Mijatović, S. Szilner, L. Corradi et al., "Multinucleon transfer reactions in the Ar40+Pb208 system", Phys. Rev. C **94**, 064616 (2016). doi:[10.1103/physrevc.94.064616](https://doi.org/10.1103/physrevc.94.064616)
- **[Mij16b]** T. Mijatović, S. Szilner, L. Corradi et al., "Study of the cross section determination with the PRISMA spectrometer: The 40Ar + 208Pb case", Eur. Phys. J. A **52**, 113 (2016). doi:[10.1140/epja/i2016-16113-3](https://doi.org/10.1140/epja/i2016-16113-3)
- **[Mij15]** T. Mijatović, S. Szilner, L. Corradi et al., "Pairing Correlation Study in the $^{40}$Ar$\,+\,^{208}$Pb Multinucleon Transfer Reaction", Acta Phys. Pol. B **46**, 439 (2015). doi:[10.5506/aphyspolb.46.439](https://doi.org/10.5506/aphyspolb.46.439)
- **[Szi11]** S. Szilner, L. Corradi, F. Haas et al., "Interplay between single-particle and collective excitations in argon isotopes populated by transfer reactions", Phys. Rev. C **84**, 014325 (2011). doi:[10.1103/physrevc.84.014325](https://doi.org/10.1103/physrevc.84.014325)
- **[Col17]** P. Čolović, S. Szilner, L. Corradi et al., "Stretched configuration of states as inferred from $ \gamma$ γ -ray angular distributions in 40Ar + 208Pb neutron transfer reactions", Eur. Phys. J. A **53**, 166 (2017). doi:[10.1140/epja/i2017-12358-6](https://doi.org/10.1140/epja/i2017-12358-6)
- **[Cor99]** L. Corradi, A. M. Stefanini, C. J. Lin et al., "Multinucleon transfer processes in 64Ni+238U", Phys. Rev. C **59**, 261-268 (1999). doi:[10.1103/physrevc.59.261](https://doi.org/10.1103/physrevc.59.261)
- **[Cor96]** L. Corradi, J. H. He, D. Ackermann et al., "Multinucleon transfer reactions in Ca40+124Sn", Phys. Rev. C **54**, 201-205 (1996). doi:[10.1103/physrevc.54.201](https://doi.org/10.1103/physrevc.54.201)
- **[Cor00]** L. Corradi, G. de Angelis, A. Gadea et al., "Multinucleon transfer reactions in the 40Ca+124Sn system studied viaγ−particle coincidences", Phys. Rev. C **61**, 024609 (2000). doi:[10.1103/physrevc.61.024609](https://doi.org/10.1103/physrevc.61.024609)
- **[Cor97]** L. Corradi, A. M. Stefanini, J. H. He et al., "Evidence of complex degrees of freedom in multinucleon transfer reactions of 48Ca+124Sn", Phys. Rev. C **56**, 938-941 (1997). doi:[10.1103/physrevc.56.938](https://doi.org/10.1103/physrevc.56.938)
- **[Cor94]** L. Corradi, A. M. Stefanini, D. Ackermann et al., "Multinucleon transfer reactions in S32+208Pb close to the Coulomb barrier", Phys. Rev. C **49**, R2875-R2879 (1994). doi:[10.1103/physrevc.49.r2875](https://doi.org/10.1103/physrevc.49.r2875)
- **[Cor01]** L. Corradi, A. M. Vinodkumar, A. M. Stefanini et al., "Multi-neutron transfer in 62Ni+206Pb:A search for neutron pair transfer modes", Phys. Rev. C **63**, 021601 (2001). doi:[10.1103/physrevc.63.021601](https://doi.org/10.1103/physrevc.63.021601)
- **[Mon97]** G. Montagnoli, S. Beghini, F. Scarlassara et al., "Multinucleon transfer reactions of", J. Phys. G: Nucl. Part. Phys. **23**, 1431-1437 (1997). doi:[10.1088/0954-3899/23/10/033](https://doi.org/10.1088/0954-3899/23/10/033)
- **[Mon02]** G. Montagnoli, S. Beghini, F. Scarlassara et al., "Transfer reactions and sub-barrier fusion in 40Ca + 90, 96Zr", Eur Phys J A **15**, 351-356 (2002). doi:[10.1140/epja/i2002-10034-8](https://doi.org/10.1140/epja/i2002-10034-8)
- **[VP15]** M. Varga Pajtler, S. Szilner, L. Corradi et al., "Selective properties of neutron transfer reactions in the 90Zr + 208Pb system for the population of excited states in zirconium isotopes", Nuclear Physics A **941**, 273-292 (2015). doi:[10.1016/j.nuclphysa.2015.07.007](https://doi.org/10.1016/j.nuclphysa.2015.07.007)
- **[Cor11]** L. Corradi, S. Szilner, G. Pollarolo et al., "Single and pair neutron transfers at sub-barrier energies", Phys. Rev. C **84**, 034603 (2011). doi:[10.1103/physrevc.84.034603](https://doi.org/10.1103/physrevc.84.034603)
- **[Mon14]** D. Montanari, L. Corradi, S. Szilner et al., "Neutron Pair Transfer in Ni60+Sn116 Far below the Coulomb Barrier", Phys. Rev. Lett. **113**, 052501 (2014). doi:[10.1103/physrevlett.113.052501](https://doi.org/10.1103/physrevlett.113.052501)
- **[Mon16]** D. Montanari, L. Corradi, S. Szilner et al., "Pair neutron transfer in Ni 60 + Sn 116 probed via γ -particle coincidences", Phys. Rev. C **93**, 054623 (2016). doi:[10.1103/physrevc.93.054623](https://doi.org/10.1103/physrevc.93.054623)
- **[Cor22]** L. Corradi, S. Szilner, G. Pollarolo et al., "Evidence of proton-proton correlations in the 116Sn+60Ni transfer reactions", Physics Letters B **834**, 137477 (2022). doi:[10.1016/j.physletb.2022.137477](https://doi.org/10.1016/j.physletb.2022.137477)
- **[Mon11]** D. Montanari, S. Leoni, L. Corradi et al., "Elastic, inelastic, and one-nucleon transfer processes in 48Ca+64Ni", Phys. Rev. C **84**, 054613 (2011). doi:[10.1103/physrevc.84.054613](https://doi.org/10.1103/physrevc.84.054613)
- **[Mon12]** D. Montanari, S. Leoni, D. Mengoni et al., "γspectroscopy of calcium nuclei around doubly magic48Ca using heavy-ion transfer reactions", Phys. Rev. C **85**, 044301 (2012). doi:[10.1103/physrevc.85.044301](https://doi.org/10.1103/physrevc.85.044301)
- **[Gal18]** F. Galtarossa, L. Corradi, S. Szilner et al., "Mass correlation between light and heavy reaction products in multinucleon transfer Au197+Te130 collisions", Phys. Rev. C **97**, 054606 (2018). doi:[10.1103/physrevc.97.054606](https://doi.org/10.1103/physrevc.97.054606)
- **[Dik23]** J. Diklić, S. Szilner, L. Corradi et al., "Transfer reactions in Pb206+Sn118 : From quasielastic to deep-inelastic processes", Phys. Rev. C **107**, 014619 (2023). doi:[10.1103/physrevc.107.014619](https://doi.org/10.1103/physrevc.107.014619)
- **[Szi24]** S. Szilner, L. Corradi, J. Diklić et al., "Quest for Cooper Pair Transfer in Heavy-Ion Reactions: The Pb 206 + Sn 118 Case", Phys. Rev. Lett. **133**, 202501 (2024). doi:[10.1103/physrevlett.133.202501](https://doi.org/10.1103/physrevlett.133.202501)
- **[Mij26]** T. Mijatović, S. Szilner, L. Corradi et al., "Revealing nucleon-nucleon correlation effects through sub-Coulomb transfer reactions in 92Mo+54Fe", Physics Letters B **872**, 140085 (2026). doi:[10.1016/j.physletb.2025.140085](https://doi.org/10.1016/j.physletb.2025.140085)
- **[Col20]** P. Čolović, S. Szilner, A. Illana et al., "Population of lead isotopes in binary reactions using a Rb94 radioactive beam", Phys. Rev. C **102**, 054609 (2020). doi:[10.1103/physrevc.102.054609](https://doi.org/10.1103/physrevc.102.054609)
- **[Jia98]** C. L. Jiang, K. E. Rehm, H. Esbensen et al., "Multineutron transfer in 58Ni+124Sn collisions at sub-barrier energies", Phys. Rev. C **57**, 2393-2400 (1998). doi:[10.1103/physrevc.57.2393](https://doi.org/10.1103/physrevc.57.2393)
- **[Wol92]** F. L. H. Wolfs, K. E. Rehm, W. C. Ma et al., "Elastic scattering and quasielastic transfer in the system Se76,82+192,198Pt", Phys. Rev. C **45**, 2283-2289 (1992). doi:[10.1103/physrevc.45.2283](https://doi.org/10.1103/physrevc.45.2283)
- **[San97]** S. J. Sanders, A. K. Dummer, K. A. Farrar et al., "Quasielastic transfer in the 136Xe+64Ni reaction", Phys. Rev. C **55**, 2541-2555 (1997). doi:[10.1103/physrevc.55.2541](https://doi.org/10.1103/physrevc.55.2541)
- **[Geh97]** J. Gehring, B. B. Back, K. C. Chan et al., "Deep-inelastic scattering in 124,136Xe+58,64Ni at energies near the Coulomb barrier", Phys. Rev. C **55**, 2959-2964 (1997). doi:[10.1103/physrevc.55.2959](https://doi.org/10.1103/physrevc.55.2959)
- **[Wil18]** E. Williams, K. Sekizawa, D. J. Hinde et al., "Exploring Zeptosecond Quantum Equilibration Dynamics: From Deep-Inelastic to Fusion-Fission Outcomes in Ni58+Ni60 Reactions", Phys. Rev. Lett. **120**, 022501 (2018). doi:[10.1103/physrevlett.120.022501](https://doi.org/10.1103/physrevlett.120.022501); arXiv:[1712.09191](https://arxiv.org/abs/1712.09191)
- **[Kun90]** R. Künkel, W. Oertzen, H. G. Bohlen et al., "Pairing effects in nucleon transfer reactions in the system 144Sm+88Sr at 4.7 MeV/u", Z. Physik A - Atomic Nuclei **336**, 71-89 (1990). doi:[10.1007/bf01904165](https://doi.org/10.1007/bf01904165)
- **[Wlp95]** M. Wilpert, B. Gebauer, T. Wilpert et al., "Cold multinucleon transfer and formation of a dinuclear complex", Phys. Rev. C **51**, 680-694 (1995). doi:[10.1103/physrevc.51.680](https://doi.org/10.1103/physrevc.51.680)
- **[FN92]** J. O. Fernández Niello, J. E. Testoni, M. di Tada et al., "Near-barrier transfer reactions in the S36+144,154Sm systems", Phys. Rev. C **45**, 748-758 (1992). doi:[10.1103/physrevc.45.748](https://doi.org/10.1103/physrevc.45.748)
- **[Kou23]** S. Koulouris, G. A. Souliotis, F. Cappuzzello et al., "Multinucleon transfer channels from Zn70 (15 MeV/nucleon) + Ni64 collisions", Phys. Rev. C **108**, 044612 (2023). doi:[10.1103/physrevc.108.044612](https://doi.org/10.1103/physrevc.108.044612)
- **[Sou11]** G. A. Souliotis, M. Veselsky, S. Galanopoulos et al., "Approaching neutron-rich nuclei toward the r -process path in peripheral heavy-ion collisions at 15 MeV/nucleon", Phys. Rev. C **84**, 064607 (2011). doi:[10.1103/physrevc.84.064607](https://doi.org/10.1103/physrevc.84.064607)
- **[Jha04]** V. Jha, B. J. Roy, A. Chatterjee et al., "Studies of multi-nucleon transfer reactions in 90Zr(18O,X) and 90Zr(16O,X)", Eur. Phys. J. A **19**, 347-354 (2004). doi:[10.1140/epja/i2002-10310-7](https://doi.org/10.1140/epja/i2002-10310-7)

### Classic deep-inelastic landmarks

- **[Wil73]** J. Wilczyński, "Nuclear molecules and nuclear friction", Physics Letters B **47**, 484-486 (1973). doi:[10.1016/0370-2693(73)90021-x](https://doi.org/10.1016/0370-2693(73)90021-x)
- **[Art73a]** A. Artukh, G. Gridnev, V. Mikheev et al., "Transfer reactions in the interaction of 40Ar with 232Th", Nuclear Physics A **215**, 91-108 (1973). doi:[10.1016/0375-9474(73)90104-8](https://doi.org/10.1016/0375-9474(73)90104-8)
- **[Art73b]** A. Artukh, G. Gridnev, V. Mikheev et al., "Multinucleon transfer reactions in the 232Th+22Ne system", Nuclear Physics A **211**, 299-309 (1973). doi:[10.1016/0375-9474(73)90721-5](https://doi.org/10.1016/0375-9474(73)90721-5)
- **[Wolf74]** K. L. Wolf, J. P. Unik, J. R. Huizenga et al., "Study of Strongly Damped Collisions in the Reaction of 600-MeV Kr84 on a Bi209Target", Phys. Rev. Lett. **33**, 1105-1108 (1974). doi:[10.1103/physrevlett.33.1105](https://doi.org/10.1103/physrevlett.33.1105)
- **[Han74]** F. Hanappe, M. Lefort, C. Ngô et al., "Cross Section and Angular Distribution of Products in "Quasifission" Reactions Induced by 525-MeV Kr84 Ions on a Bi209Target", Phys. Rev. Lett. **32**, 738-741 (1974). doi:[10.1103/physrevlett.32.738](https://doi.org/10.1103/physrevlett.32.738)
- **[Van76b]** R. Vandenbosch, M. P. Webb, T. D. Thomas, "Deeply inelastic scattering of Kr84 from Pb208", Phys. Rev. C **14**, 143-151 (1976). doi:[10.1103/physrevc.14.143](https://doi.org/10.1103/physrevc.14.143)
- **[Gat75]** B. Gatty, D. Guerreau, M. Lefort et al., "Evidence for the temporary existence of a ?composite? system in deep inelastic nuclear interactions", Z Physik A **273**, 65-68 (1975). doi:[10.1007/bf01435759](https://doi.org/10.1007/bf01435759)
- **[Sch81]** D. Schüll, W. Shen, H. Freiesleben et al., "The influence of the potential energy surface on neutron excess and mass equilibration in the 136Xe + 56Fe system", Physics Letters B **102**, 116-120 (1981). doi:[10.1016/0370-2693(81)91043-1](https://doi.org/10.1016/0370-2693(81)91043-1)
- **[Gar80]** D. Gardes, R. Bimbot, J. Maison et al., "Angular distributions and ranges of heavy products from quasi-elastic transfer reactions induced by heavy ions in Bi209", Phys. Rev. C **21**, 2447-2466 (1980). doi:[10.1103/physrevc.21.2447](https://doi.org/10.1103/physrevc.21.2447)

### Light-projectile MNT / MNT-induced fission

- **[Ste18]** I. Stefan, B. Fornal, S. Leoni et al., "Neutron-rich nuclei produced at zero degrees in damped collisions induced by a beam of 18O on a 238U target", Physics Letters B **779**, 456-459 (2018). doi:[10.1016/j.physletb.2018.02.037](https://doi.org/10.1016/j.physletb.2018.02.037)
- **[Leg16]** R. Léguillon, K. Nishio, K. Hirose et al., "Fission fragments mass distributions of nuclei populated by the multinucleon transfer channels of the 18O +232Th reaction", Physics Letters B **761**, 125-130 (2016). doi:[10.1016/j.physletb.2016.08.010](https://doi.org/10.1016/j.physletb.2016.08.010)
- **[Ver20]** M. J. Vermeulen, K. Nishio, K. Hirose et al., "Measurement of fission-fragment mass distributions in the multinucleon transfer channels of the O 18 + Np 237 reaction", Phys. Rev. C **102**, 054610 (2020). doi:[10.1103/physrevc.102.054610](https://doi.org/10.1103/physrevc.102.054610)
- **[Tan22]** S. Tanaka, K. Hirose, K. Nishio et al., "Angular momentum transfer in multinucleon transfer channels of O 18 + Np 237", Phys. Rev. C **105**, L021602 (2022). doi:[10.1103/physrevc.105.l021602](https://doi.org/10.1103/physrevc.105.l021602)
- **[Son15]** Sonika, B. J. Roy, A. Parmar et al., "Multinucleon transfer study in Pb206(O18,x)at energies above the Coulomb barrier", Phys. Rev. C **92**, 024603 (2015). doi:[10.1103/physrevc.92.024603](https://doi.org/10.1103/physrevc.92.024603)
- **[Esk84]** K. Eskola, P. Eskola, M. M. Fowler et al., "Production of neutron-rich Bi isotopes by transfer reactions", Phys. Rev. C **29**, 2160-2168 (1984). doi:[10.1103/physrevc.29.2160](https://doi.org/10.1103/physrevc.29.2160)
- **[Sax02]** A. Saxena, D. Fabris, G. Prete et al., "Fission of targetlike fragments populated in the multinucleon transfer reactions of 340 MeV 28Si on 232Th", Phys. Rev. C **65**, 064601 (2002). doi:[10.1103/physrevc.65.064601](https://doi.org/10.1103/physrevc.65.064601)
- **[Kal21]** S. Kalkal, S. Mandal, N. Madhavan et al., "Ground state and excited state multinucleon transfer channels in interactions of 28Si with 90,94Zr in near barrier region", Int. J. Mod. Phys. E **30**, 2150053 (2021). doi:[10.1142/s0218301321500531](https://doi.org/10.1142/s0218301321500531)
- **[Roy22]** B. J. Roy, S. Santra, A. Pal et al., "Reaction mechanism study for multinucleon transfer processes in collisions of spherical and deformed nuclei at energies near and above the Coulomb barrier: The O16+Sm154 reaction", Phys. Rev. C **105**, 044611 (2022). doi:[10.1103/physrevc.105.044611](https://doi.org/10.1103/physrevc.105.044611); arXiv:[2109.00674](https://arxiv.org/abs/2109.00674)
### References without a Crossref DOI (taken from EXFOR or arXiv; not Crossref-verified)
- Kh. Bruchertzeifer et al., "Experimental investigation of the nuclear reaction U-238+Xe-136", Yad. Fiz. **26**, 26 (1977) [Sov. J. Nucl. Phys. 26, 12]. EXFOR A0031. [unverified beyond EXFOR]
- W. M. Jae et al., "Studies of plutonium, neptunium, and uranium produced in the 244Pu+136Xe reaction", J. Korean Nucl. Soc. **13**(3), 139 (1981). EXFOR C2035. [unverified beyond EXFOR]
- A. G. Artukh et al., Sov. J. Nucl. Phys. **23**, 136 (1976) (40Ar+232Th proton pick-up); **27**, 14 (1978) (220 MeV 40Ar+197Au); **28**, 594 (1978) (110 MeV 20Ne+197Au). EXFOR A0015, A0023, A0046. [unverified beyond EXFOR]
- A. A. Valverde et al., "The N=126 Factory: A New Multi-Nucleon Transfer Reaction Facility", arXiv:[2603.12359](https://arxiv.org/abs/2603.12359) (2026). Preprint; INSPIRE-listed.
- KISS-II design report, arXiv:[2209.12649](https://arxiv.org/abs/2209.12649). Not peer-reviewed; cited only for the KISS efficiency and energy context.
