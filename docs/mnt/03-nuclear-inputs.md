# Nuclear-structure inputs for a browser MNT model (Z ≈ 20–110)

Research date: 2026-09-26. No data files were downloaded. File sizes come from HTTP `HEAD` requests. File formats come from each file's own header, read as a ≤ 6 kB range preview, or from the official readme/landing page.

**Legend.** Each citation carries a tag:
- **[V]** — verified against Crossref metadata or the publisher's or IAEA's page.
- **[V-sec]** — verified only through a secondary open-access paper that quotes the value.
- **[unverified]** — could not be checked online.

---

## 0. Recommendation in one paragraph

Ship one compact, precomputed table of about 9,300 nuclides (O to A = 339), keyed by (Z, N). Build it offline with a Python/Node script from three sources:

- **AME2020** (`mass_1.mas20.txt`) for every nuclide that has a value. Keep the `#` flag that marks extrapolated values.
- **FRDM(2012)** (`ADNDT-FRDM2012-TABLE.dat`, or the RIPL-4 repackaging `mass-frdm12.dat`) as the fallback for masses. FRDM2012 is also the single source for β2/β4/β6 and the microscopic (shell + pairing) energy `Emic`. This keeps masses, deformations and shell corrections consistent with one another. It is also the table cited by current DNS MNT papers (e.g. Chen et al. 2022, arXiv:2208.12107, ref. [7]).
- **WS4** (`WS4.txt` / `mass-ws4.dat`) as an optional second mass model with a toggle. It has the smallest rms error: 0.295 MeV against AME2020, versus 0.606 MeV for FRDM2012 (RIPL-4 readmes).

Add the following alongside the mass table:
- measured charge radii (`charge_radii.csv`, IAEA);
- fission barriers from `BFWS4.txt`, which is openly downloadable and covers the heavy region;
- analytic formulas, not tables, for the potentials (Prox 77 / Bass 80 / Akyüz–Winther) and for the level density (Ignatyuk form).

For de-excitation, write a light JavaScript Weisskopf–Ewing + Bohr–Wheeler cascade (n, p, α, fission). This is what DNS/GRAZING-type MNT papers do. GEMINI++ is a C++ code for offline validation, not something to embed.

Size: about 9.3 k rows × about 10 numeric fields. That is roughly 0.4–0.6 MB as JSON (about 120–180 kB gzip), or about 0.37 MB as Float32 columns. This is my estimate.

---

## 1. Ground-state masses and binding energies

### 1.1 AME2020 (experimental and recommended)

**Citations** (all [V], Crossref; both papers are CC BY 3.0 per Crossref/IOP):
- W.J. Huang, M. Wang, F.G. Kondev, G. Audi, S. Naimi, *The AME 2020 atomic mass evaluation (I). Evaluation of input data, and adjustment procedures*, Chin. Phys. C **45** (2021) 030002, doi:10.1088/1674-1137/abddb0.
- M. Wang, W.J. Huang, F.G. Kondev, G. Audi, S. Naimi, *The AME 2020 atomic mass evaluation (II). Tables, graphs and references*, Chin. Phys. C **45** (2021) 030003, doi:10.1088/1674-1137/abddaf.
- F.G. Kondev, M. Wang, W.J. Huang, S. Naimi, G. Audi, *The NUBASE2020 evaluation of nuclear physics properties*, Chin. Phys. C **45** (2021) 030001, doi:10.1088/1674-1137/abddae.

> **Correction to the brief.** The AME2020 (II) author list is **Wang, Huang, Kondev, Audi, Naimi**. "Pfeiffer" and "Chin" are not authors.

**Where to get the files:**
- IAEA AMDC mirror: <https://www-nds.iaea.org/amdc/> (files in `/amdc/ame2020/`).
- The collaboration websites are at ANL and IMP Lanzhou. The IMP host `amdc.impcas.ac.cn` refused connections from here.
- ANL also mirrors the file: `https://www.anl.gov/sites/www/files/2021-04/mass_1.mas20.txt`.

| File | Content | Size (HEAD) |
|---|---|---|
| `mass_1.mas20.txt` | atomic masses, mass excess, B/A, β⁻ Q, atomic mass | 472,648 B |
| `massround.mas20.txt` | same values, rounded as published | 428,627 B |
| `rct1.mas20.txt` | S(2n), S(2p), Q(α), Q(2β⁻), Q(εp), Q(β⁻n) | 511,515 B |
| `rct2_1.mas20.txt` | S(n), S(p), Q(4β⁻), Q(d,α), Q(p,α), Q(n,α) | 510,935 B |
| `nubase_4.mas20.txt` | NUBASE2020: isomers, half-lives, Jπ, decay modes | 761,906 B |
| `covariance.mas20` (zip) | covariances of primary nuclides | — |

**Format of `mass_1.mas20.txt`**, from the file header. The Fortran format is
`a1,i3,i5,i5,i5,1x,a3,a4,1x,f14.6,f12.6,f13.5,1x,f10.5,1x,a2,f13.5,f11.5,1x,i3,1x,f13.6,f12.6`.
Column positions (1-based character positions) derived from that format:

| cols | field | unit |
|---|---|---|
| 1 | Fortran carriage control (`1` page feed, `0` line feed) | – |
| 2–4 | N − Z | – |
| 5–9 | N | – |
| 10–14 | Z | – |
| 15–19 | A | – |
| 21–23 | element symbol | – |
| 24–27 | origin flag (e.g. `-n`, `x`) | – |
| 29–42 | mass excess Δ | keV |
| 43–54 | σ(Δ) | keV |
| 55–67 | binding energy per nucleon B/A | keV |
| 69–78 | σ(B/A) | keV |
| 80–81 | literal `B-` | – |
| 82–94 | β⁻-decay energy | keV |
| 95–105 | its σ | keV |
| 107–109 | integer part of the atomic mass | u |
| 111–123 | fractional atomic mass | µu |
| 124–135 | its σ | µu |

Parsing notes:
- The file has about 36 header lines; data start after the `MASS LIST` block.
- A `#` in place of the decimal point marks an estimated (non-experimental, extrapolated) value. Replace `#` with `.` and store a flag.
- A `*` means the quantity cannot be calculated.
- The `rct` files use the format `a1,i3,1x,a3,i3,1x,6(f12.4,f10.4)` (A, element, Z, then 6 × (value, σ) in keV), with the same `#` and `*` conventions.
- Line count: the RIPL-4 repackaging `mass-ame20.dat` holds about 3,560 records (121,077 B ÷ 34 B per record). About 2,457 of these are measured masses with N, Z ≥ 8 (RIPL-4 readmes); the rest are AME "recommended" extrapolations.

**Licence and terms:**
- The AMDC page asks users to cite the papers, not the electronic files.
- The papers are CC BY 3.0.
- The IAEA site links to the general IAEA Terms of Use (<https://www.iaea.org/about/terms-of-use>). That page is bot-protected and could not be read here. Search-engine summaries say the IAEA "encourages the use, reproduction and dissemination" of its data with attribution [V-sec].
- There is no explicit open-data licence on the ASCII files themselves. See §7 for the redistribution caveat.

**Useful constants from the file itself [V]:**
- Δ(n) = 8071.31806(44) keV
- Δ(¹H) = 7288.971064(13) keV

**Derived quantities** (atomic mass excesses; electron masses cancel in Q-values):
- Total binding energy: B(Z,N) = Z·Δ(¹H) + N·Δ(n) − Δ(Z,N)
- S_n(Z,N) = Δ(Z,N−1) + Δ(n) − Δ(Z,N)
- S_p(Z,N) = Δ(Z−1,N) + Δ(¹H) − Δ(Z,N)
- S_2n(Z,N) = Δ(Z,N−2) + 2Δ(n) − Δ(Z,N)
- Q_α = Δ(Z,N) − Δ(Z−2,N−2) − Δ(⁴He), with Δ(⁴He) = 2424.91587 keV [V, file]
- MNT ground-state Q-value: Q_gg = Δ_P + Δ_T − Δ_PLF − Δ_TLF

Compute S_n on the fly from the merged mass table rather than shipping `rct2`. This keeps the AME and theoretical regions consistent.

### 1.2 Theoretical mass tables (for nuclides beyond AME2020)

| Model | Citation | rms vs AME2020 (RIPL-4 readme) | Coverage | Other quantities in the table |
|---|---|---|---|---|
| **FRDM(2012)** | P. Möller, A.J. Sierk, T. Ichikawa, H. Sagawa, ADNDT **109–110** (2016) 1–204, doi:10.1016/j.adt.2015.10.002; arXiv:1508.06294 [V] | 0.606 MeV (2,457 nuclei) | 9,318 nuclei, ¹⁶O to A = 339 [V, arXiv abstract] | ε2–ε6, β2, β3, β4, β6, E_s+p, E_mic, E_bind, M_th, M_exp (AME2003), σ_exp, E_mic^FL, M_th^FL |
| **WS4** | N. Wang, M. Liu, X. Wu, J. Meng, Phys. Lett. B **734** (2014) 215–219, doi:10.1016/j.physletb.2014.05.049; arXiv:1405.2616 [V] | 0.295 MeV; the paper quotes 298 keV against the data it used | about 10 k nuclei, O and heavier | β2, β4, β6, E_sh, E_def, E_th, M_exp, M_th |
| **HFB-24** | S. Goriely, N. Chamel, J.M. Pearson, PRC **88** (2013) 024308, doi:10.1103/PhysRevC.88.024308 [V] | about 0.55 MeV [unverified number] | drip line to drip line, Z ≤ 110 [unverified] | β2, β4, R_ch, E_def, S_n, S_p, Q_β, M_cal, J, π |
| Myers–Świątecki LDM | W.D. Myers, W.J. Świątecki, Nucl. Phys. **81** (1966) 1–60, doi:10.1016/0029-5582(66)90639-0 [V]; the parameter refit is in Ark. Fys. **36** (1967) 343 [unverified] | several MeV without shell correction | analytic | – |

**Download locations and formats:**

- **FRDM2012 original.** Page: <https://t2.lanl.gov/nis/molleretal/publications/ADNDT-FRDM2012.html>. File: `ADNDT-FRDM2012-TABLE.dat`, 1,639,968 B.
  - The LANL host returned 403 / TLS errors from here. Page content and size were read from the Internet Archive copy of the same URL (archived 2021; original Last-Modified 2015-08-21).
  - Fortran format `(3I5,4F10.2,4F10.3,5F10.2,F10.3,2F10.2)`: 19 columns, 176 B per line. 1,639,968 / 176 = 9,318 lines exactly, so the file has no header.
  - Column order, from the paper's "Explanation of Table", p. 67: Z, N, A, ε2, ε3, ε4, ε6, β2, β3, β4, β6, E_s+p, E_mic, E_bind, M_th, M_exp, σ_exp, E_mic^FL, M_th^FL (energies in MeV).
  - E_bind is the total binding energy. M_th is the atomic mass excess.
  - E_mic is (calculated mass excess) − (spherical macroscopic energy). This is the "shell + pairing + deformation" microscopic energy normally used as the shell correction in level-density and fission-barrier formulas.
  - M_exp is taken from AME2003. Replace it with AME2020.

- **FRDM2012 repackaged in RIPL-4** (IAEA, released May 2026). URL: <https://github.com/IAEA-NDS/RIPL-4/tree/main/masses>, file `mass-frdm12.dat`, 805,090 B.
  - Format `(2i4,1x,a2,1x,i1,4f10.3,4f8.3)`: Z, A, symbol, flag (0 no exp, 1 AME2020 recommended, 2 AME2020 measured), M_exp(AME2020), σ, M_th, E_mic, β2, β3, β4, β6 [V, readme].
  - **This is the most convenient single file.** It already merges AME2020 with FRDM2012 masses, E_mic and β.
  - The sibling files `mass-ws4.dat` (802,212 B), `mass-hfb27.dat` (695,573 B), `mass-bskg3.dat`, `mass-d1m.dat` and `mass-ame20.dat` share the same leading columns.

- **WS4 original.** Page: <http://www.imqmd.com/mass/>. Files:
  - `WS4.txt` (1,260,631 B): a text header with the model parameters, then the columns A, Z, β2, β4, β6, E_sh, E_def, E_exp, E_th, M_exp, M_th (MeV). E_exp = 0 means no experimental value.
  - `WS4_RBF.txt` (461,260 B): WS4 plus the radial-basis-function correction.
  - Header previews [V].

- **HFB-24.** Directory: <https://www.astro.ulb.ac.be/bruslib/nucdata/>, file `hfb24-dat`, 847,895 B.
  - Header [V]: Z, A, bet2, bet4, Rch, Edef, Sn, Sp, Qbet, Mcal, Mexp−Mcal, Jexp, Jth, Pexp, Pth.
  - 999.99 means "undefined".
  - It is the only mass table that also gives a **predicted charge radius** for every nuclide.

**Which table MNT models use:**
- **DNS models.** They take experimental masses where known and Möller-type FRDM otherwise. Older DNS papers cite FRDM(1995) (Möller, Nix, Myers, Świątecki, ADNDT **59** (1995) 185, doi:10.1006/adnd.1995.1002 [V]). Recent ones cite FRDM(2012): Chen et al., arXiv:2208.12107, cite Möller et al. 2016 for fragment excitation energies [V, text]. FRDM is the de facto standard. The ground-state β2 in the DNS driving potential also comes from Möller's table.
- **WS4.** Used by the Guangxi group (Wang, Liu) and in ImQMD-type work.
- **HFB.** Rarely used in MNT.
- **Recommendation:** AME2020 → FRDM2012 as the default, with WS4 as an optional switch.

**Liquid-drop fallback** (Myers–Świątecki 1966/67, "MS-LD"). All values below are MeV, except r0 in fm:

M(Z,N) = Z·M_H + N·M_n − 0.00001433·Z^2.39 + b_vol(1 − κ I²)A + b_surf(1 − κ I²)A^{2/3} + (3e²/5r0)·Z²/A^{1/3} − C4·Z²/A + E_pair + E_shell

with I = (N−Z)/A.

| Parameter | Value |
|---|---|
| b_vol | −15.677 |
| b_surf | 18.56 |
| κ | 1.79 (both volume and surface) |
| r0 | 1.2049 fm, so 3e²/5r0 = 0.7171 |
| C4 | 1.21129 |

Verification and caveats for these values:
- [V-sec]: Pomorski & Dudek, PRC **67** (2003) 044316, arXiv:nucl-th/0205011, Eq. 3.4–3.5, list these as the "old" MS values.
- They print b_vol as **−15.667**. Most other sources give 15.677. **Check against the original before use.**
- With these constants and Möller–Nix microscopic terms the rms is about 4.5 MeV. The Pomorski–Dudek refit (b_vol = −15.8484, b_surf = 19.3859, κ_vol = 1.8475, κ_surf = 1.9830, r0ch = 1.18995 fm, C4 = 1.19949) gives 0.73 MeV.
- **Use the LDM only as a last-resort fallback, or for the "smooth" part in the Ignatyuk shell correction** (δW = M_exp − M_LD; §5).

---

## 2. Deformations and shell corrections

### 2.1 Theoretical, for all nuclides

- **FRDM2012** β2, β3, β4, β6 and E_mic (see §1.2).
  - The β are spherical-harmonic expansion coefficients (paper Eq. 38). The ε are Nilsson parameters.
  - The table's deformations are for the axially symmetric minimum. Energies include axial-asymmetry effects [V, paper p. 67].
  - **This is the standard source for β2 in DNS/Langevin MNT models.**
- **WS4:** β2, β4, β6 and E_sh.
- **Myers–Świątecki shell corrections** (RIPL). File: `densities/shellcor-ms.dat` in RIPL-4 (287,020 B; same file in RIPL-3). Format `(2i4,1x,a2,2(1x,f8.3),2(f6.3))`: Z, A, El, Shell, Dcor, bet2, bet4.
  - Shell = M_exp − M_LD(spherical, MS parameters).
  - Dcor is the LD deformation energy for Möller–Nix β2, β4 [V, readme].
  - **Use this if you adopt the Ignatyuk level density with the original MS-based ã.**

### 2.2 Experimental β2 from B(E2)

- S. Raman, C.W. Nestor Jr., P. Tikkanen, *Transition probability from the ground to the first-excited 2⁺ state of even–even nuclides*, ADNDT **78** (2001) 1–128, doi:10.1006/adnd.2001.0858 [V].
- **Superseded by** B. Pritychenko, M. Birch, B. Singh, M. Horoi, *Tables of E2 transition probabilities from the first 2⁺ states in even–even nuclei*, ADNDT **107** (2016) 1–139, doi:10.1016/j.adt.2015.10.001 [V]; erratum ADNDT **114** (2017) 371, doi:10.1016/j.adt.2016.08.002 [V].
- Web database, searchable by Z/N/A (adopted, experimental, predicted): <https://www.nndc.bnl.gov/be2/> (NNDC/BNL) [V].
- Ready-made file: RIPL-4 `masses/gs-deformations-exp.dat` (9,625 B, 328 even–even β2 from Raman 2001). Format `(2i4,1x,a2,1x,2f8.4)`: Z, A, El, β2, Δβ2 [V].

**Conversion** (Raman et al., uniform sharp charge distribution):

β2 = (4π / (3 Z R0²)) · [B(E2; 0⁺→2⁺↑) / e²]^{1/2}, with R0 = 1.2 A^{1/3} fm. B(E2) is in e²·fm² (1 e²b² = 10⁴ e²fm⁴).

> The RIPL readme prints the exponent as `^2`. That is a typo; it must be `^(1/2)`.

The Raman β2 is model-dependent and always positive. Use it only to override FRDM β2 for the magnitude in the entrance channel (projectile and target). Keep FRDM for the products.

---

## 3. Nuclear radii

### 3.1 Measured charge radii

- I. Angeli, K.P. Marinova, *Table of experimental nuclear ground state charge radii: An update*, ADNDT **99** (2013) 69–95, doi:10.1016/j.adt.2011.12.006 [V].
  - It covers **909 isotopes of 92 elements, ¹H to ⁹⁶Cm** [V, IAEA page].
  - The IAEA page adds "preliminary" values from later laser-spectroscopy work.
- Page: <https://www-nds.iaea.org/radii/>; file `charge_radii.csv` (28,869 B, last modified 2024-02-21).
  - CSV header [V]: `z,symbol,n,a,radius_val,radius_unc,radius_preliminary_val,radius_preliminary_unc`, with the rms radius in fm.
- Update: T. Li, Y. Luo, N. Wang, *Compilation of recent nuclear ground state charge radius measurements and tests for models*, ADNDT **140** (2021) 101440, doi:10.1016/j.adt.2021.101440 [V].
- Model tables for all nuclides:
  - HFB-24 `Rch` column;
  - `WS_rch.txt` (141,546 B): Wang & Li, PRC **88** (2013) 011301(R);
  - `Rch_RBFlr.txt` (22,040 B): Li, Liu, Wang, Chin. Phys. C **50** (2026) 054102.
  - The last two are on <http://www.imqmd.com/mass/> [V, page listing; the citations were not individually checked].

### 3.2 Radius parametrisations used by the potentials

All radii in fm; I = (N−Z)/A.

| Name | Formula | Used in |
|---|---|---|
| Prox 77 effective sharp radius | R = 1.28 A^{1/3} − 0.76 + 0.8 A^{−1/3}; central radius C = R[1 − (b/R)²], b = 1 fm | Błocki et al. 1977; Bass 80 |
| Bass 77 | R = 1.16 A^{1/3} − 1.39 A^{−1/3} | Bass 1977 |
| Bass 80 | R = R_s(1 − 0.98/R_s²), with R_s the Prox 77 R | Bass 1980 |
| Christensen–Winther / Broglia–Winther | R = 1.233 A^{1/3} − 0.978 A^{−1/3} (CW 76); 1.233 A^{1/3} − 0.98 A^{−1/3} (BW 91) | CW 1976, BW 1991 |
| Akyüz–Winther (AW 95) | R = 1.20 A^{1/3} − 0.09 | GRAZING-type calculations |
| Prox 2000 charge radius | R00 = 1.240 A^{1/3}(1 + 1.646/A − 0.191 I); half-density radius c = R00(1 − (7/2)b²/R00² − (49/8)b⁴/R00⁴) | Myers & Świątecki 2000 |
| Royer–Rousseau | R00 = 1.2332 A^{1/3}(1 + 2.348443/A − 0.151541 I) | Royer & Rousseau, EPJA **42** (2009) 541, doi:10.1140/epja/i2008-10745-8 [V] |
| rms → equivalent sharp radius | R_sharp = √(5/3)·⟨r²⟩^{1/2} | general |

Formulas are [V-sec]. They were read from Dutt & Puri, PRC **81** (2010) 064609 / arXiv:1005.5213 and PRC **81** (2010) 064608 / arXiv:1004.0493. The original books and proceedings were not accessible.

Deformed surfaces: R(θ) = R0[1 + β2 Y20(θ) + β4 Y40(θ)] with FRDM β.

---

## 4. Nucleus–nucleus potentials and Coulomb barriers

V(r) = V_C(r) + V_N(r). For spherical nuclei beyond touching, V_C = Z1 Z2 e²/r with **e² = 1.439964 MeV·fm**.

For deformed nuclei, use the Wong / multipole Coulomb expansion with the FRDM β: C.Y. Wong, PRL **31** (1973) 766 [unverified; cited in DNS papers].

### 4.1 Proximity potential 1977 (Prox 77)

Citation: J. Błocki, J. Randrup, W.J. Świątecki, C.F. Tsang, *Proximity forces*, Ann. Phys. (N.Y.) **105** (1977) 427–462, doi:10.1016/0003-4916(77)90249-4 [V].

- V_N(r) = 4π γ b R̄ Φ(ξ), with ξ = (r − C1 − C2)/b
- R̄ = C1C2/(C1+C2); C_i = R_i[1 − (b/R_i)²]; R_i = 1.28A_i^{1/3} − 0.76 + 0.8A_i^{−1/3} fm; b ≈ 1 fm
- γ = γ0[1 − k_s I²], with γ0 = **0.9517 MeV/fm²**, k_s = **1.7826**, and I = (N−Z)/A of the combined system
- Universal function:
  - Φ(ξ) = −½(ξ − 2.54)² − 0.0852(ξ − 2.54)³ for ξ ≤ 1.2511
  - Φ(ξ) = −3.437 exp(−ξ/0.75) for ξ ≥ 1.2511

Variant **Prox 88** (Reisdorf, Möller–Nix constants): γ0 = 1.2496 MeV/fm², k_s = 2.3.

Variant **Prox 2000**: Myers & Świątecki, PRC **62** (2000) 044610, doi:10.1103/PhysRevC.62.044610 [V].
- Surface energy: γ = [18.63 MeV − Q(t1² + t2²)/(2r0²)]/(4π r0²).
- Neutron skin: t_i = (3/2)r0[J I_i − (1/12)c1 Z_i A_i^{−1/3}]/[Q + (9/4)J A_i^{−1/3}], with r0 = 1.14 fm, J = 32.65 MeV, c1 = 0.757895 MeV, Q = 35.4 MeV.
- Universal function:
  - Φ(ξ) = −0.1353 + Σ_{n=0..5}[c_n/(n+1)](2.5 − ξ)^{n+1} for 0 < ξ ≤ 2.5
  - Φ(ξ) = −0.09551 exp[(2.75 − ξ)/0.7176] for ξ ≥ 2.5
  - c0..c5 = −0.1886, −0.2628, −0.15216, −0.04562, 0.069136, −0.011454.
- [V-sec, Dutt & Puri]. The HTML extraction cut off the exponential branch. The −0.09551 and 0.7176 are from memory, so they are **[unverified]**.

All Prox 77 constants above are [V-sec, Dutt & Puri 2010, Eqs. 1–6].

### 4.2 Bass potential

Citations [V]:
- R. Bass, Nucl. Phys. A **231** (1974) 45, doi:10.1016/0375-9474(74)90292-9 (Bass 73/74)
- R. Bass, PRL **39** (1977) 265, doi:10.1103/PhysRevLett.39.265 (Bass 77)
- R. Bass, *Nuclear Reactions with Heavy Ions* (Springer, 1980); the book's existence was confirmed via a Physics Today review, doi:10.1063/1.2914343
- R. Bass, Lecture Notes in Physics **117** (1980) 281, doi:10.1007/3-540-09965-4_23 (Bass 80)

Formulas:
- **Bass 77:** V_N = −[R1R2/(R1+R2)]·Φ(s), with s = r − R1 − R2 and Φ(s) = [A e^{s/d1} + B e^{s/d2}]^{−1} MeV/fm.
  - A = 0.0300 MeV⁻¹fm, B = 0.0061 MeV⁻¹fm, d1 = 3.30 fm, d2 = 0.65 fm; R_i = 1.16A^{1/3} − 1.39A^{−1/3}.
- **Bass 80:** Φ(s) = [0.033 e^{s/3.5} + 0.007 e^{s/0.65}]^{−1} MeV/fm, with R_i = R_s(1 − 0.98/R_s²) and R_s as in Prox 77. This is the version Dutt & Puri find best, together with AW 95 and Denisov.

Formulas are [V-sec, Dutt & Puri 2010, Eqs. 16–21].

### 4.3 Akyüz–Winther (AW 95), the potential used in GRAZING-type calculations

Citations:
- Ö. Akyüz, Å. Winther, in *Nuclear Structure and Heavy-Ion Physics*, Proc. Int. School "Enrico Fermi", Course LXXVII (Varenna 1979), eds. R.A. Broglia, R.A. Ricci (North-Holland, 1981). The page is given as 491 in some sources and 492 in others [unverified].
- Å. Winther, Nucl. Phys. A **594** (1995) 203, doi:10.1016/0375-9474(95)00374-A [V].
- Å. Winther, Nucl. Phys. A **572** (1994) 191, doi:10.1016/0375-9474(94)90430-8 (GRAZING) [V].

Formulas:
- V_N = −V0 / {1 + exp[(r − R1 − R2)/a]}
- V0 = 16π γ a R1R2/(R1+R2)
- a = 1/{1.17[1 + 0.53(A1^{−1/3} + A2^{−1/3})]} fm
- R_i = 1.20A_i^{1/3} − 0.09 fm
- γ = 0.95[1 − 1.8 I1 I2] MeV/fm² (the Broglia–Winther form, with I_i = (N_i−Z_i)/A_i)

[V-sec, Dutt & Puri Eqs. 25–31.] Earlier form BW 91: a = 0.63 fm, R0 = R1 + R2 + 0.29 fm, R_i = 1.233A^{1/3} − 0.98A^{−1/3}.

### 4.4 Empirical barrier systematics (fusion-by-diffusion family)

Primary citations [V]:
- W.J. Świątecki, K. Siwek-Wilczyńska, J. Wilczyński, *Fusion by diffusion. II. Synthesis of transfermium elements in cold fusion reactions*, PRC **71** (2005) 014602, doi:10.1103/PhysRevC.71.014602.
- K. Siwek-Wilczyńska, J. Wilczyński, PRC **69** (2004) 024611, doi:10.1103/PhysRevC.69.024611, for the Gaussian barrier distribution.
- The mean-barrier formula below is as quoted by Hagino, PRC **98** (2018) 014607 (arXiv:1803.02036, Eq. 37). He attributes it to T. Cap, K. Siwek-Wilczyńska, J. Wilczyński, PRC **83** (2011) 054602, doi:10.1103/PhysRevC.83.054602 [V-sec].

The formula:

B0 = 0.853315 z + 0.0011695 z² − 0.000001544 z³ MeV, with z = Z1Z2/(A1^{1/3} + A2^{1/3}).

The fusion-by-diffusion approach also uses a Gaussian barrier distribution of width ω, which is folded with a classical cross section. The fitted range of z is roughly that of Ca…Zn + Pb/Bi and actinide targets. **Do not extrapolate to actinide–actinide systems.**

### 4.5 Sanity check

This is my own computation using the formulas above. The barrier is the outermost maximum of V_N + Z1Z2e²/r.

| System | Z1Z2 | Prox 77 | Bass 80 | AW 95 | B0 (formula 4.4) |
|---|---|---|---|---|---|
| ⁴⁸Ca+²⁰⁸Pb | 1640 | 181.1 MeV @ 12.24 fm | 174.3 @ 12.63 | 176.7 @ 12.49 | 173.0 |
| ⁵⁸Ni+²⁰⁸Pb | 2296 | 251.3 @ 12.36 | 243.2 @ 12.55 | 245.5 @ 12.53 | 244.4 |
| ¹³⁶Xe+²⁰⁸Pb | 4428 | no maximum (shoulder ≈ 438 MeV near 13.5 fm) | 426.8 @ 13.52 | no maximum | 429.7 |
| ²³⁸U+²⁴⁸Cm | 8832 | none | spurious inner max | none | out of fit range |

**Implication for MNT (important).** For Z1Z2 ≳ 4000 the static frozen-density potential has **no pocket or barrier**. Models of Xe+Pb and U+Cm therefore do something else:
- use the potential at a contact distance, R1 + R2 + ~0.5–1 fm, with deformation and orientation;
- use a Bass-type barrier for the entrance-channel threshold;
- or use dynamical (Langevin / TDHF) approaches.

The browser model should expose "contact-point energy" and "Bass barrier" as parameters instead of relying on a proximity pocket. Prox 77 is about 4% high for light systems, which is consistent with the motivation for Prox 2000.

---

## 5. De-excitation inputs

### 5.1 Level density

Fermi gas: ρ(U) ∝ exp(2√(aU)) / (a^{1/4}U^{5/4}). Excitation energies are back-shifted by pairing Δ (e.g. 12/√A per unpaired-nucleon pair), and T = √(U/a).

1. **Simplest option:** a = A/8 to A/12 MeV⁻¹. A/10 is used in many Langevin/HIVAP-type estimates (e.g. arXiv:nucl-th/0411005, Sec. 3). Treat this range as a user parameter.

2. **Ignatyuk shell damping.** A.V. Ignatyuk, G.N. Smirenkin, A.S. Tishin, Yad. Fiz. **21** (1975) 485 [Sov. J. Nucl. Phys. **21** (1975) 255] [unverified, no DOI].

   a(U) = ã [1 + (δW/U)(1 − e^{−U/E_D})]

   δW is the shell correction, taken as M_exp − M_LD or the FRDM E_mic. Choose the shell-correction source consistently with ã. Parameter sets:

   | Parameter set | ã | Damping | Status |
   |---|---|---|---|
   | Ignatyuk (as used by Fröbrich) | 0.073A + 0.095B_s A^{2/3} MeV⁻¹ (B_s = 1 for a sphere) | E_D = 18.5 MeV | [V-sec, arXiv:nucl-th/0411005 Eq. 2.13–2.14] |
   | "Ignatyuk" set in RIPL-style fission codes (Tudora, arXiv:1410.4386) | 0.073A + 0.115A^{2/3} | γ = 0.4A^{−1/3} MeV⁻¹ | [V-sec] |
   | Same source, MS shell corrections | 0.0959A + 0.1468A^{2/3} | γ = 0.325A^{−1/3} | [V-sec] |
   | Egidy–Bucurescu | A(0.127 − 9.05×10⁻⁵A) | – | [V-sec] |

   The damping energy **E_D = 18.5 MeV** is used by the fusion-by-diffusion model (Hagino 2018, Eq. A28, citing Reisdorf 1981) [V-sec]. It is equivalent to γ = 1/E_D ≈ 0.054 MeV⁻¹.

3. **Reisdorf.** W. Reisdorf, Z. Phys. A **300** (1981) 227, doi:10.1007/BF01412298 [V].

   ã = 0.04543 r0³A + 0.1355 r0²A^{2/3}B_s + 0.1426 r0A^{1/3}B_k, with r0 = 1.153 fm. This is common in superheavy/HIVAP work.
   - [V-sec: coefficients via arXiv:2506.02322 search snippet]
   - For the saddle point use a_f/a_n = B_s(saddle)… or simply a_f/a_n ≈ 1.0–1.1 as a user parameter.

4. **Tabulated empirical values.** RIPL-4 `densities/total/level-densities-egsm.dat` (40,247 B): a at B_n, fitted to s-wave D0. Useful only for validation.

### 5.2 Separation energies

Compute them from the merged mass table (§1.1): S_n, S_p, S_α (= −Q_α) and S_2n.

### 5.3 Fission barriers for heavy products

- **Möller et al. 2009.** P. Möller, A.J. Sierk, T. Ichikawa, A. Iwamoto, R. Bengtsson, H. Uhrenholt, S. Åberg, *Heavy-element fission barriers*, PRC **79** (2009) 064304, doi:10.1103/PhysRevC.79.064304 [V].
  - Barriers for **1,585 nuclei, Z = 78–125**, from FRLDM(2002) [V, APS abstract].
- **Möller et al. 2015.** P. Möller, A.J. Sierk, T. Ichikawa, A. Iwamoto, M. Mumpower, *Fission barriers at the end of the chart of the nuclides*, PRC **91** (2015) 024310, doi:10.1103/PhysRevC.91.024310 [V].
  - Barriers for **5,239 nuclides, 171 ≤ A ≤ 330**, drip line to drip line.
  - The APS page shows the data as "Supplemental Material (subscription required)" [V].
  - **This is the most complete FRLDM table, but check its licence and access before shipping it.**
- **WS4 barriers (openly downloadable).** N. Wang, M. Liu, *Fission barriers with the Weizsäcker–Skyrme mass model*, Chin. Phys. C **48** (2024) 094103, doi:10.1088/1674-1137/ad53b8 [V]; arXiv:2404.14014.
  - File `http://www.imqmd.com/mass/BFWS4.txt` (139,025 B), tab-separated: A, Z, BF_WS4, BF_WS4+DB (MeV). It starts at Sb (Z = 51) [V, preview].
  - **Recommended default:** open, compact, and consistent with the WS4 masses.
- **Sierk rotating liquid drop (BARFIT).** A.J. Sierk, *Macroscopic model of rotating nuclei*, PRC **33** (1986) 2039, doi:10.1103/PhysRevC.33.2039 [V].
  - Fortran subroutine `fis-barrier-liquiddrop.for` (15 kB), RIPL-3 `fission/` directory.
  - It gives B_LD(Z, A, ℓ) and ℓ_max for Z = 20–110. It is a 7th-order fit to 638 barriers, rms 0.1 MeV [V, readme].
  - Standard usage: **B_f(ℓ) = B_LD(ℓ) − δW_gs**, where the ground-state shell correction is taken with the sign convention that δW_gs < 0 raises the barrier. Optionally, shell damping is applied with the same E_D as the level density.
  - Porting the fit coefficients to JavaScript is straightforward, and gives ℓ-dependent barriers for all products.
- **Empirical actinide barriers.** RIPL-4 `fission/empirical-barriers-ripl4.dat` (4,049 B): inner and outer heights and curvatures. For validation only.

### 5.4 Decay widths: what is standard

- **Neutron width.** Weisskopf, PR **52** (1937) 295, doi:10.1103/PhysRev.52.295 [V]; the Weisskopf–Ewing form:

  Γ_n(E*) = [(2s+1) μ_n / (π²ħ² ρ_C(E*))] ∫₀^{E*−S_n} ε σ_inv(ε) ρ_D(E* − S_n − ε) dε

  σ_inv can be taken as geometric, πR², R = 1.2 A^{1/3} fm. Analogous forms apply for p and α, which add Coulomb barriers.
- **Fission width.** Bohr–Wheeler, PR **56** (1939) 426, doi:10.1103/PhysRev.56.426 [V]:

  Γ_f = [1/(2π ρ_C(E*))] ∫₀^{E*−B_f} ρ_sd(E* − B_f − ε) dε

- **Closed-form approximation** for a fast browser cascade (Vandenbosch & Huizenga, *Nuclear Fission*, 1973) [unverified, from memory]:

  Γ_n/Γ_f ≈ [4A^{2/3} a_f (E* − S_n) / (K0 a_n (2√(a_f(E* − B_f)) − 1))] · exp[2√(a_n(E* − S_n)) − 2√(a_f(E* − B_f))], with K0 ≈ 9.8 MeV.

- **What published MNT models do:**
  - DNS MNT papers (e.g. Chen et al. 2022, arXiv:2208.12107, Eqs. 17–18) use exactly this kind of cascade: n/p/α/γ widths plus fission, with E*_{s+1} = E*_s − B − 2T per emitted particle [V, text].
  - Other DNS papers (e.g. arXiv:2207.05253) instead pipe primary fragments through **GEMINI++** [V, text].
- **GEMINI++ references:**
  - R.J. Charity et al., Nucl. Phys. A **483** (1988) 371, doi:10.1016/0375-9474(88)90542-8 (GEMINI) [V].
  - D. Mancusi, R.J. Charity, J. Cugnon, PRC **82** (2010) 044610, doi:10.1103/PhysRevC.82.044610 (GEMINI++ fission description) [V].
  - R.J. Charity, IAEA report INDC(NDS)-0530 (2008) [V, INIS record].
- **GEMINI++ availability:** C++ source from Charity's WashU Box folder, per the README of the GitHub mirror <https://github.com/jdfrankland/gemini>, which has no licence file. It is too heavy to port. Use it offline to validate the JavaScript cascade on a few fragments, e.g. ²⁰⁴Pt*, ²⁰⁷Hg*, ²⁴⁰U*.

---

## 6. Files to obtain

| # | File | URL | Size | Format | Licence / terms |
|---|---|---|---|---|---|
| 1 | `mass_1.mas20.txt` (AME2020) | https://www-nds.iaea.org/amdc/ame2020/mass_1.mas20.txt | 472,648 B | fixed-width Fortran (see §1.1), `#` = estimated | cite CPC 45 030002/030003 (CC BY 3.0); IAEA Terms of Use; no file licence |
| 2 | `rct1.mas20.txt`, `rct2_1.mas20.txt` (optional) | https://www-nds.iaea.org/amdc/ame2020/ | 511,515 / 510,935 B | `a1,i3,1x,a3,i3,1x,6(f12.4,f10.4)` | as 1 |
| 3 | `nubase_4.mas20.txt` (optional: half-lives, Jπ for labels) | https://www-nds.iaea.org/amdc/ame2020/nubase_4.mas20.txt | 761,906 B | fixed-width | cite CPC 45 030001 |
| 4 | `ADNDT-FRDM2012-TABLE.dat` | https://t2.lanl.gov/nis/molleretal/publications/ADNDT-FRDM2012-TABLE.dat (was 403 from here; Internet Archive copy exists) | 1,639,968 B | `(3I5,4F10.2,4F10.3,5F10.2,F10.3,2F10.2)`, 9,318 lines, no header | no licence stated; cite ADNDT 109–110 (2016) 1 |
| 4′ | `mass-frdm12.dat` (**preferred**: AME2020 + FRDM2012 merged) | https://raw.githubusercontent.com/IAEA-NDS/RIPL-4/main/masses/mass-frdm12.dat | 805,090 B | `(2i4,1x,a2,1x,i1,4f10.3,4f8.3)` | RIPL-4 / IAEA Terms of Use; repo has no LICENSE file; cite RIPL + Möller 2016 + Wang 2021 |
| 5 | `mass-ws4.dat` (RIPL-4) or `WS4.txt` (original) | https://raw.githubusercontent.com/IAEA-NDS/RIPL-4/main/masses/mass-ws4.dat · http://www.imqmd.com/mass/WS4.txt | 802,212 B / 1,260,631 B | `(2i4,1x,a2,1x,i1,4f10.3,3f8.3)` / whitespace columns | no licence stated; cite PLB 734 (2014) 215 |
| 6 | `hfb24-dat` (optional, gives R_ch) | https://www.astro.ulb.ac.be/bruslib/nucdata/hfb24-dat | 847,895 B | whitespace columns (Z A bet2 bet4 Rch …) | BRUSLIB, no licence stated [unverified]; cite PRC 88 024308 |
| 7 | `charge_radii.csv` | https://www-nds.iaea.org/radii/charge_radii.csv | 28,869 B | CSV | IAEA Terms of Use; cite ADNDT 99 (2013) 69 |
| 8 | `gs-deformations-exp.dat` | https://raw.githubusercontent.com/IAEA-NDS/RIPL-4/main/masses/gs-deformations-exp.dat | 9,625 B | `(2i4,1x,a2,1x,2f8.4)` | RIPL; cite Raman 2001 (or use the NNDC B(E2) web tool for Pritychenko 2016) |
| 9 | `shellcor-ms.dat` (if Ignatyuk with MS shell corrections) | https://raw.githubusercontent.com/IAEA-NDS/RIPL-4/main/densities/shellcor-ms.dat | 287,020 B | `(2i4,1x,a2,2(1x,f8.3),2(f6.3))` | RIPL |
| 10 | `BFWS4.txt` (fission barriers) | http://www.imqmd.com/mass/BFWS4.txt | 139,025 B | TSV: A, Z, BF_WS4, BF_WS4+DB | no licence stated; cite CPC 48 (2024) 094103 |
| 11 | `fis-barrier-liquiddrop.for` (Sierk BARFIT) | https://www-nds.iaea.org/RIPL-3/fission/fis-barrier-liquiddrop.for | 15 kB | Fortran source | RIPL; cite PRC 33 (1986) 2039 |
| 12 | `empirical-barriers-ripl4.dat` (validation) | https://raw.githubusercontent.com/IAEA-NDS/RIPL-4/main/fission/empirical-barriers-ripl4.dat | 4,049 B | `(2i4,1x,a2,2x,2(2x,a2,f8.2,f3.1,f5.2,f4.2))` | RIPL |
| 13 | Möller 2015 barrier table (optional) | APS supplemental material to PRC 91 024310 | ? | ? | subscription; check terms before redistribution |

---

## 7. Browser implementation notes

**Build step (offline, Python).** Parse files 4′ (which already contains AME2020), 5, 7, 8 and 10 into one `nuclides.json`. One row per (Z, N), with the columns:
- `dm` — mass excess in keV;
- `dmSrc` — 0 FRDM, 1 AME-extrapolated, 2 AME-measured;
- `dmWS4`;
- `b2`, `b4` (FRDM);
- `emic` (FRDM);
- `rch` (measured, else null);
- `bfWS4`.

Add a `meta` block holding the citations and file hashes.

**Encoding:**
- Store the data columnar, e.g. `{Z:[…], N:[…], dm:[…], …}`. Alternatively, pack it as base64 Float32Array.
- About 9.3 k rows × 8 floats is about 300 kB in binary, or about 120–180 kB gzipped as JSON (estimate).
- Restricting to Z = 20–110 saves roughly 15%.

**Runtime.** Compute these on demand from `dm`: S_n, S_p, S_2n, Q_gg and B/A.

The following are analytic functions, not tables:
- the potentials (Prox 77 default; Bass 80 and AW 95 as options);
- level density;
- Sierk BARFIT, for ℓ-dependent LD barriers.

**Attribution.** Put an "About the data" panel in the app listing items [1]–[20] below. The AMDC explicitly asks for the papers to be cited, not the files.

**Licence caveat.** None of the data files carries an explicit open licence; the papers are CC BY (AME) or publisher-copyright. Shipping derived numeric columns with full attribution is the norm in the field. However, the user is in the EU, where the sui generis database right can apply to the extraction of a substantial part of a database. If the app will be public, send a short courtesy e-mail to the AMDC (IAEA NDS) and to N. Wang (WS4). This is not legal advice.

---

## 8. Bibliography

| # | Reference | DOI / link | Status |
|---|---|---|---|
| 1 | W.J. Huang, M. Wang, F.G. Kondev, G. Audi, S. Naimi, Chin. Phys. C 45 (2021) 030002 (AME2020 I) | 10.1088/1674-1137/abddb0 | [V] |
| 2 | M. Wang, W.J. Huang, F.G. Kondev, G. Audi, S. Naimi, Chin. Phys. C 45 (2021) 030003 (AME2020 II) | 10.1088/1674-1137/abddaf | [V] |
| 3 | F.G. Kondev, M. Wang, W.J. Huang, S. Naimi, G. Audi, Chin. Phys. C 45 (2021) 030001 (NUBASE2020) | 10.1088/1674-1137/abddae | [V] |
| 4 | P. Möller, A.J. Sierk, T. Ichikawa, H. Sagawa, ADNDT 109–110 (2016) 1–204 (FRDM2012) | 10.1016/j.adt.2015.10.002; arXiv:1508.06294 | [V] |
| 5 | P. Möller, J.R. Nix, W.D. Myers, W.J. Świątecki, ADNDT 59 (1995) 185 (FRDM1992/95) | 10.1006/adnd.1995.1002 | [V] |
| 6 | N. Wang, M. Liu, X. Wu, J. Meng, Phys. Lett. B 734 (2014) 215 (WS4) | 10.1016/j.physletb.2014.05.049; arXiv:1405.2616 | [V] |
| 7 | S. Goriely, N. Chamel, J.M. Pearson, PRC 88 (2013) 024308 (HFB-24) | 10.1103/PhysRevC.88.024308 | [V] |
| 8 | W.D. Myers, W.J. Świątecki, Nucl. Phys. 81 (1966) 1 | 10.1016/0029-5582(66)90639-0 | [V] |
| 9 | W.D. Myers, W.J. Świątecki, Ark. Fys. 36 (1967) 343 | – | [unverified] |
| 10 | K. Pomorski, J. Dudek, PRC 67 (2003) 044316 (MS-LD constants, refit) | 10.1103/PhysRevC.67.044316 | [V] |
| 11 | S. Raman, C.W. Nestor Jr., P. Tikkanen, ADNDT 78 (2001) 1 | 10.1006/adnd.2001.0858 | [V] |
| 12 | B. Pritychenko, M. Birch, B. Singh, M. Horoi, ADNDT 107 (2016) 1; erratum 114 (2017) 371 | 10.1016/j.adt.2015.10.001; 10.1016/j.adt.2016.08.002 | [V] |
| 13 | I. Angeli, K.P. Marinova, ADNDT 99 (2013) 69 | 10.1016/j.adt.2011.12.006 | [V] |
| 14 | T. Li, Y. Luo, N. Wang, ADNDT 140 (2021) 101440 | 10.1016/j.adt.2021.101440 | [V] |
| 15 | G. Royer, R. Rousseau, EPJA 42 (2009) 541 | 10.1140/epja/i2008-10745-8 | [V] |
| 16 | J. Błocki, J. Randrup, W.J. Świątecki, C.F. Tsang, Ann. Phys. 105 (1977) 427 | 10.1016/0003-4916(77)90249-4 | [V] |
| 17 | W.D. Myers, W.J. Świątecki, PRC 62 (2000) 044610 (Prox 2000) | 10.1103/PhysRevC.62.044610 | [V] |
| 18 | R. Bass, Nucl. Phys. A 231 (1974) 45 | 10.1016/0375-9474(74)90292-9 | [V] |
| 19 | R. Bass, PRL 39 (1977) 265 | 10.1103/PhysRevLett.39.265 | [V] |
| 20 | R. Bass, *Nuclear Reactions with Heavy Ions*, Springer 1980; Lect. Notes Phys. 117 (1980) 281 | 10.1007/3-540-09965-4_23 | [V] |
| 21 | Ö. Akyüz, Å. Winther, Proc. Int. School "Enrico Fermi" Course LXXVII, North-Holland 1981, p. 491/492 | – | [unverified page] |
| 22 | Å. Winther, Nucl. Phys. A 572 (1994) 191; A 594 (1995) 203 | 10.1016/0375-9474(94)90430-8; 10.1016/0375-9474(95)00374-A | [V] |
| 23 | I. Dutt, R.K. Puri, PRC 81 (2010) 064609 and 064608 (formula compendium) | arXiv:1005.5213; arXiv:1004.0493 | [V] (arXiv read) |
| 24 | W.J. Świątecki, K. Siwek-Wilczyńska, J. Wilczyński, PRC 71 (2005) 014602 | 10.1103/PhysRevC.71.014602 | [V] |
| 25 | K. Siwek-Wilczyńska, J. Wilczyński, PRC 69 (2004) 024611 | 10.1103/PhysRevC.69.024611 | [V] |
| 26 | T. Cap, K. Siwek-Wilczyńska, J. Wilczyński, PRC 83 (2011) 054602 | 10.1103/PhysRevC.83.054602 | [V] |
| 27 | K. Hagino, PRC 98 (2018) 014607 | 10.1103/PhysRevC.98.014607; arXiv:1803.02036 | [V] |
| 28 | P. Möller et al., PRC 79 (2009) 064304 | 10.1103/PhysRevC.79.064304 | [V] |
| 29 | P. Möller et al., PRC 91 (2015) 024310 | 10.1103/PhysRevC.91.024310 | [V] |
| 30 | N. Wang, M. Liu, Chin. Phys. C 48 (2024) 094103 (WS4 barriers) | 10.1088/1674-1137/ad53b8; arXiv:2404.14014 | [V] |
| 31 | A.J. Sierk, PRC 33 (1986) 2039 | 10.1103/PhysRevC.33.2039 | [V] |
| 32 | A.V. Ignatyuk, G.N. Smirenkin, A.S. Tishin, Yad. Fiz. 21 (1975) 485 [Sov. J. Nucl. Phys. 21 (1975) 255] | – | [unverified] |
| 33 | W. Reisdorf, Z. Phys. A 300 (1981) 227 | 10.1007/BF01412298 | [V] |
| 34 | R. Capote et al., Nucl. Data Sheets 110 (2009) 3107 (RIPL-3); RIPL-4 (IAEA, 2026) | 10.1016/j.nds.2009.10.004; github.com/IAEA-NDS/RIPL-4 | [V] |
| 35 | V. Weisskopf, Phys. Rev. 52 (1937) 295 | 10.1103/PhysRev.52.295 | [V] |
| 36 | N. Bohr, J.A. Wheeler, Phys. Rev. 56 (1939) 426 | 10.1103/PhysRev.56.426 | [V] |
| 37 | R.J. Charity et al., Nucl. Phys. A 483 (1988) 371 (GEMINI) | 10.1016/0375-9474(88)90542-8 | [V] |
| 38 | D. Mancusi, R.J. Charity, J. Cugnon, PRC 82 (2010) 044610 (GEMINI++) | 10.1103/PhysRevC.82.044610 | [V] |
| 39 | V. Zagrebaev, W. Greiner, PRL 101 (2008) 122701; PRC 87 (2013) 034608 (Langevin MNT) | 10.1103/PhysRevLett.101.122701; 10.1103/PhysRevC.87.034608 | [V] |
| 40 | P.-H. Chen et al., arXiv:2208.12107 (DNS MNT; uses FRDM2012 and a Weisskopf cascade) | arXiv:2208.12107 | [V] (arXiv read) |

## 9. Open issues and discrepancies flagged

1. **AME2020 author list.** The correct list is Wang, Huang, Kondev, Audi, Naimi. The brief's "Pfeiffer, Chin" is wrong.
2. **FRDM2012 file host.** The LANL host (t2.lanl.gov) was unreachable (CloudFront 403 / TLS). Use the RIPL-4 GitHub copy, `mass-frdm12.dat`, which is maintained by the IAEA.
3. **Myers–Świątecki volume coefficient.** The value is 15.677 MeV in most sources, but Pomorski–Dudek print 15.667. Verify against Ark. Fys. 36 (1967) 343.
4. **Raman β2 formula.** The RIPL readme's formula has a typo (exponent 2 instead of ½).
5. **Prox 2000 exponential tail.** The constants (−0.09551, 0.7176) are from memory. Check them against Myers & Świątecki PRC 62 044610, Eq. 17.
6. **Ignatyuk 1975 original ã constants.** These could not be verified online. Use the RIPL/secondary sets in §5.1.
7. **HFB-24 accuracy.** The rms (about 0.55 MeV) was not verified.
8. **Möller 2015 barrier table.** It is behind APS subscription. Clarify the terms before redistributing it.
9. **Potentials for very heavy systems.** For Z1Z2 ≳ 4000 (Xe+Pb, U+Cm) the static potentials show no barrier (§4.5). The model needs an explicit contact-point prescription.
