# Heavy-ion final-state reference data (for the animation's emitted particles)

Everything below was read from the cited arXiv PDFs/HTML or official pages. Values not verified are flagged. INSPIRE record numbers (`insNNNN`) are the HEPData record keys.

## 1. Collision systems, energies, beam parameters

**Rapidity/geometry per energy** (computed: y_beam = acosh(√s_NN/2m_N), γ = √s_NN/2m_N, m_N = 0.938 GeV):

| √s_NN | E/nucleon | y_beam | γ | Spectator Fermi angle pF/(γ m_N), pF=0.26 GeV/c |
|---|---|---|---|---|
| 7.7 GeV | 3.85 GeV | 2.09 | 4.1 | 68 mrad |
| 19.6 GeV | 9.8 GeV | 3.04 | 10.4 | 27 mrad |
| 62.4 GeV | 31.2 GeV | 4.20 | 33 | 8.3 mrad |
| 200 GeV | 100 GeV | 5.36 | 107 | 2.6 mrad |
| 2.76 TeV | 1.38 TeV | 7.99 | 1471 | 0.19 mrad |
| 5.02 TeV | 2.51 TeV | 8.58 | 2675 | 0.10 mrad |
| 5.36 TeV | 2.68 TeV | 8.65 | 2856 | 0.10 mrad |

(PHOBOS quotes y_beam = 3.036 / 4.196 / 4.930 / 5.361 for 19.6/62.4/130/200 GeV, PRC 83 024913; ALICE uses y_beam = 8.6 at 5.02 TeV, PLB 772 567.)

**RHIC (BNL run overview, rhichome.bnl.gov/RHIC/Runs):** Au+Au √s_NN = 7.7 … 200 GeV plus fixed-target Au (√s_NN 3–13.7 GeV, STAR arXiv:2405.20928); d+Au 200/62.4/39/19.6 GeV; ³He+Au 200 GeV; p+Au 200 GeV; Cu+Cu 200/62.4/22.4 GeV; Cu+Au 200 GeV; U+U 193 GeV (STAR arXiv:1405.5510); Ru+Ru and Zr+Zr 200 GeV (Run-18); O+O 200 GeV (Run-21 and Feb 2026).

**LHC:** Run 1 Pb–Pb 2.76 TeV; Run 2 Pb–Pb 5.02 TeV (2018: 733 bunches, 75 ns spacing, peak L = 6.1×10²⁷ cm⁻²s⁻¹, Bruce et al. arXiv:2107.09560); Xe–Xe 5.44 TeV (2017); p–Pb 5.02/8.16 TeV; Run 3 Pb–Pb 5.36 TeV (2024: 1240 bunches, 50 ns); O–O and Ne–Ne 5.36 TeV (July 2025: ATLAS arXiv:2606.20257; CMS arXiv:2606.02285); pp reference at 2.76, 5.02, 5.36 TeV. Hadronic Pb–Pb cross section σ = 7.64 ± 0.22 b at 2.76 TeV (ALICE arXiv:1301.4361), 7.67 ± 0.25 b at 5.02 TeV (ALICE arXiv:2209.04250).

## 2. Charged-particle multiplicity

**Pb–Pb 5.02 TeV, |η|<0.5** (ALICE arXiv:1512.06104, PRL 116 222302, Table 1; HEPData ins1410589):

| Centrality | ⟨dN_ch/dη⟩ | ⟨N_part⟩ |
|---|---|---|
| 0–5% | 1943 ± 54 | (0–2.5%: 398, 2.5–5%: 372) |
| 5–10% | 1587 ± 47* | (346, 320) |
| 10–20% | 1180 ± 31 | 263 ± 4 |
| 20–30% | 786 ± 20 | 188 ± 3 |
| 30–40% | 512 ± 15 | 131 ± 2 |
| 40–50% | 318 ± 12 | 86.3 ± 1.7 |
| 50–60% | 183 ± 8 | 53.6 ± 1.2 |
| 60–70% | 96.3 ± 5.8 | 30.4 ± 0.8 |
| 70–80% | 44.9 ± 3.4 | 15.6 ± 0.5 |
| 80–90% | 17.5 ± 1.8 | 7.3 ± 0.1 |

(*0–5% and 5–10% as quoted in ALICE arXiv:1910.07678 Table 5; 80–90% from arXiv:1612.08966.) Glauber: R = 6.62 fm, a = 0.546 fm, σ_NN^inel = 70 ± 5 mb.

**Total N_ch (all η):** Pb–Pb 5.02 TeV 0–5%: **21 400 ± 1300**, 80–90%: 230 ± 38 (ALICE arXiv:1612.08966, PLB 772 567; ins1507090). Pb–Pb 2.76 TeV: 0–5% 17 165 ± 772, 5–10% 14 099, 10–20% 10 581, 20–30% 7278 (ALICE arXiv:1304.0347, PLB 726 610; ins1225979). Including neutrals (π⁰ ≈ ½(π⁺+π⁻), K⁰, n, Λ…) the total hadron count is ≈1.5×N_ch, i.e. roughly 30 000 hadrons for central 5.02 TeV Pb–Pb (isospin estimate, not a measurement), plus ~2 photons per π⁰.

**Other systems, midrapidity, most central:**
- Pb–Pb 2.76 TeV 0–5%: 1584 ± 4 ± 76, = 8.3 ± 0.4 per participant pair (ALICE arXiv:1011.3916; ins877821). Centrality dependence: arXiv:1012.1657 (ins880049).
- Pb–Pb 5.36 TeV 0–5%: 2010 ± 53, N_part 383.6; 20–30%: 836; 50–60%: 203; 80–90%: 21.5 (ALICE arXiv:2504.02505, Table 2; ins2907584).
- Xe–Xe 5.44 TeV (ALICE arXiv:1805.04432, PLB 790 35, Table 1; ins1672756): 0–5%: 1167 ± 26, N_part 236, total N_ch 13 230 ± 280; 20–30%: 478, total 5670; 50–60%: 118; 80–90%: 13.3.
- O–O 5.36 TeV (CMS arXiv:2606.02285, |η|<0.5): 0–5%: **135.0 ± 4.0**, N_part 26.3 ± 0.6; 0–100%: 41.8 ± 1.1. ATLAS N_part: O–O 0–1% 27.9, Ne–Ne 0–1% 34.7 (arXiv:2606.20257 Table 1).
- Au–Au 200 GeV (PHOBOS arXiv:1011.1940, PRC 83 024913, Table V, |η|<1; ins876609): 0–3%: 691 ± 52 (N_part 361); 3–6%: 619; 10–15%: 465; 20–25%: 313; 30–35%: 208; 40–45%: 133; 50–55%: 73; 60–65%: 38. Per pair: 3.76 ± 0.33 (0–6%). Total N_ch 0–6%: **5060 ± 250** at 200 GeV, 4170 ± 210 at 130 GeV, 1680 ± 100 at 19.6 GeV (PHOBOS nucl-ex/0210015, PRL 91 052303; ins599315).
- Au–Au 62.4 GeV 0–3%: 492 ± 36, total N_ch 2988 ± 149; 19.6 GeV 0–3%: 331 ± 24; Cu–Cu 200 GeV 0–3%: 198 ± 15 (PHOBOS 1011.1940).

**dN/dη shape:** ALICE fits 2.76 TeV 0–5% with a difference of two Gaussians A₁e^{−η²/2σ₁²} − A₂e^{−η²/2σ₂²}, A₁ = 2102 ± 105, A₂ = 485 ± 99, σ₁ = 3.7 ± 0.1, σ₂ = 1.2 ± 0.2 (arXiv:1304.0347); dN/dy ≈ single Gaussian σ = 3.86. At RHIC the FWHM of dN/dη is 7.1 (130 GeV), 6.5 (62.4), 4.8 (19.6 GeV) units for 0–3% (PHOBOS 1011.1940 Table VII); "limiting fragmentation": dN/dη′ per participant pair with η′ = η − y_beam is energy-independent near beam rapidity (nucl-ex/0210015). Unmeasured |η| > 3.5–5 holds ≈30% of N_ch at the LHC (1612.08966).

## 3. Identified-particle composition at midrapidity (|y|<0.5)

**Pb–Pb 2.76 TeV, dN/dy (ALICE arXiv:1303.0737, PRC 88 044910, Tables 3–5; ins1222333):**

| Cent. | π⁺ | K⁺ | p | ⟨pT⟩ π/K/p (GeV/c) | ⟨β_T⟩ | T_kin (GeV) | n |
|---|---|---|---|---|---|---|---|
| 0–5% | 733 ± 54 | 109 ± 9 | 34 ± 3 | 0.517 / 0.876 / 1.333 | 0.651 ± 0.020 | 0.095 ± 0.010 | 0.712 |
| 10–20% | 455 ± 31 | 68 ± 5 | 21.0 ± 1.7 | 0.517 / 0.871 / 1.311 | 0.639 | 0.099 | 0.738 |
| 20–30% | 307 ± 20 | 46 ± 4 | 14.4 ± 1.2 | 0.512 / 0.860 / 1.281 | 0.625 | 0.101 | 0.779 |
| 40–50% | 124 ± 8 | 18.3 ± 1.4 | 6.1 ± 0.5 | 0.492 / 0.818 / 1.178 | 0.574 | 0.112 | 0.944 |
| 60–70% | 37 ± 2 | 5.1 ± 0.4 | 1.9 ± 0.2 | 0.465 / 0.760 / 1.050 | 0.489 | 0.129 | 1.292 |
| 80–90% | 6.6 ± 0.4 | 0.85 ± 0.08 | 0.36 ± 0.04 | 0.434 / 0.711 / 0.905 | 0.357 | 0.151 | 2.262 |

π⁻, K⁻, p̄ equal π⁺, K⁺, p within errors. Ratios (0–5%, computed from the table): K/π = 0.149, p/π = 0.046; both nearly centrality-independent. Blast-wave fit ranges 0.5–1 / 0.2–1.5 / 0.3–3 GeV/c (π/K/p); BW formula: dN/(p_T dp_T) ∝ ∫₀^R r dr m_T I₀(p_T sinhρ/T_kin) K₁(m_T coshρ/T_kin), ρ = tanh⁻¹β_T, β_T(r) = β_s (r/R)ⁿ.

**Pb–Pb 5.02 TeV** (ALICE arXiv:1910.07678, PRC 101 044907, Tables 4–5; ins1759506), 0–5%: (π⁺+π⁻) 1700 ± 117, (K⁺+K⁻) 273 ± 12, (p+p̄) 74.6 ± 3.8; ⟨pT⟩ = 0.568 / 0.918 / 1.448 GeV/c; ⟨β_T⟩ = 0.663 ± 0.003, T_kin = 0.090 ± 0.003 GeV, n = 0.735; 80–90%: β_T 0.355, T_kin 0.161, n 2.42. pp 5.02 TeV: π 4.13, K 0.534, p 0.233 per unit y.

**Strange, resonances, nuclei, Pb–Pb 2.76 TeV:** Ξ⁻ 3.34 ± 0.06 ± 0.24, Ω⁻ 0.58 ± 0.04 ± 0.09 for 0–10% (Ξ⁻+Ξ̄⁺ = 6.67, Ω⁻+Ω̄⁺ = 1.19); 60–80%: Ξ⁻ 0.124, Ω⁻ 0.015 (ALICE arXiv:1307.5543, PLB 728 216; ins1243865). φ: 13.8 ± 0.5 ± 1.7 (0–5%), ⟨pT⟩ 1.31 GeV/c, φ/K⁻ = 0.127; K*⁰ 16.6 (0–20%) (ALICE arXiv:1404.0495; ins1288320). Deuterons: 0–10% dN/dy = (9.82 ± 1.58)×10⁻², ⟨pT⟩ 2.12 GeV/c, d/p ≈ 3.6×10⁻³; ³He 0–20%: 2.76×10⁻⁴ (ALICE arXiv:1506.08951; ins1380491). Λ, K⁰_S: ALICE arXiv:1307.5530 (PRL 111 222301) — yields not extracted here (get from HEPData).

**Au–Au 200 GeV, 0–5%, |y|<0.1** (STAR arXiv:0808.2041, PRC 79 034909, Tables VII–X; ins793126): π⁻ 327 ± 25, π⁺ 322, K⁻ 49.5 ± 6.2, K⁺ 51.3, p̄ 26.7 ± 3.4, p 34.7 ± 4.4; K⁻/π⁻ = 0.151, p̄/π⁻ = 0.082 (p/π⁺ = 0.108, p̄/p = 0.77 — baryon excess at RHIC); ⟨pT⟩ π 0.42, K 0.72, p 1.10 GeV/c; T_kin = 89 ± 12 MeV, ⟨β⟩ = 0.592 ± 0.051, n = 0.82; T_chem = 159 MeV, μ_B = 22 MeV. 62.4 GeV 0–5%: p̄/p = 0.47, T_kin ≈ 91–99 MeV.

**Photons:** decay photons ≈ 2 per π⁰ (π⁰ ≈ average charged pion by isospin); direct-photon excess over decay photons ≈ 10–15% for 0–20% Pb–Pb 2.76 TeV at low pT (ALICE arXiv:1509.07324, PLB 754 235; ins1394677).

## 4. Anisotropic flow

**Pb–Pb 5.02 TeV, |η|<0.8, 0.2<pT<5 GeV/c** (ALICE arXiv:1602.01119, PRL 116 132302; HEPData ins1419244, read via Rivet reference file ALICE_2016_I1419244; stat and syst errors ≲2%):

| Cent. | v₂{2,|Δη|>1} | v₂{4} | v₃{2} | v₄{2} |
|---|---|---|---|---|
| 0–5% | 0.0284 | – | 0.0207 | 0.0115 |
| 5–10% | 0.0457 | 0.0367 | 0.0232 | 0.0129 |
| 10–20% | 0.0655 | 0.0587 | 0.0280 | 0.0138 |
| 20–30% | 0.0871 | 0.0780 | 0.0309 | 0.0157 |
| 30–40% | 0.0991 | 0.0867 | 0.0331 | 0.0170 |
| 40–50% | 0.1041 | 0.0890 | 0.0323 | 0.0163 |
| 50–60% | 0.1029 | 0.0835 | 0.0271 | 0.0177 |
| 60–70% | 0.0975 | 0.0806 | 0.0277 | 0.0199 |
| 70–80% | 0.0888 | – | – | – |

Maximum v₂{2} = 0.104 ± 0.001 ± 0.002 in 40–50%; increases from 2.76 TeV: +3.0 ± 0.6% (v₂), +4.3 ± 1.4% (v₃), +10.2 ± 3.8% (v₄). pT-differential v_n of π, K, p, Λ, K⁰_S, φ at 5.02 TeV: ALICE arXiv:1805.04390 (JHEP 09 (2018) 006; ins1672822) — mass ordering (lighter particles have larger v₂ at a given pT) for pT < 3 GeV/c, baryon/meson grouping at 3–8 GeV/c.

**Au–Au 200 GeV** (STAR arXiv:0801.3466, PRC 77 054901, Table III; ins777954): pT-averaged v₂ of charged hadrons (event plane) = 0.0283 (0–10%), 0.0576 (10–40%), 0.0735 (40–80%); Λ 0.022/0.061/0.090; K⁰_S 0.021/0.051/0.071. Methods overview and v₁, v₄: STAR nucl-ex/0409033 (PRC 72 014904; ins660793), with N_part = 352 (0–5%), 165 (20–30%), 46 (50–60%), ⟨b⟩ = 2.3 / 7.6 / 11.3 fm.

**Directed flow:** at the LHC the rapidity-odd v₁ slope at midrapidity is ≈3× smaller than at top RHIC energy; v₁ is at the 10⁻³ level (ALICE arXiv:1306.4145, PRL 111 232302; ins1238980). Event plane: the "spectator plane" Ψ_SP is defined by the deflection of spectator nucleons measured in the ZDCs; the participant plane by v₂ of produced particles.

## 5. Jets and hard probes (optional toggle)

- Charged hadrons, Pb–Pb 5.02 TeV 0–5%: R_AA minimum "suppressed by more than a factor of 7" (R_AA < 0.15) at pT ≈ 6–7 GeV/c, rising toward 30–50 GeV/c (ALICE arXiv:1802.09145, JHEP 11 (2018) 013; ins1657384).
- Jets (anti-k_t R = 0.4, 40–1000 GeV, |y|<2.8): R_AA rises with pT to ≈0.6 at 1 TeV in central collisions; at 2.76 TeV central jets are suppressed ×2 (ATLAS arXiv:1805.05635, PLB 790 108; ins1673184). ⟨T_AA⟩: 10–20% 14.33 mb⁻¹, 20–30% 8.63, 30–40% 4.94, 40–50% 2.63 (Table 1).
- **Rate of jets above a threshold per central event — not verified from a paper text.** Compute as N_jet/event = ⟨T_AA⟩ × σ_pp(pT > threshold) × R_AA using the pp cross section tables of ins1673184; order-of-magnitude expectation ~10⁻³ per 0–10% event for pT > 100 GeV (unverified). A dijet at >100 GeV is a rare event and should be an explicit toggle, not default.
- J/ψ (2.5<y<4, pT<12 GeV/c): R_AA(5.02)/R_AA(2.76) = 1.17 ± 0.04 ± 0.20 in central collisions (ALICE arXiv:1606.08197, PLB 766 212; ins1472319).

## 6. Spectators

Glauber, Pb–Pb 2.76 TeV (ALICE arXiv:1301.4361, PRC 88 044909, Table 1; ins1215085; σ_NN = 64 ± 5 mb): N_spec = 416 − N_part:

| Cent. | b (fm) | ⟨N_part⟩ | ⟨N_coll⟩ | N_spec (both nuclei) |
|---|---|---|---|---|
| 0–1% | 0–1.57 | 403.8 | 1861 | ≈12 |
| 0–5% (avg) | 0–3.5 | ≈383 | ≈1690 | ≈33 |
| 20–25% | 7.0–7.8 | 202 | 630 | 214 |
| 40–45% | 9.9–10.5 | 94 | 199 | 322 |
| 60–65% | 12.1–12.6 | 34 | 46 | 382 |
| 80–85% | 14.0–14.4 | 8.8 | 7.7 | 407 |

Spectators continue at beam rapidity (y = ±y_beam, pz = ±E_beam/nucleon) with a transverse momentum smear of order the Fermi momentum, pF ≈ 260 MeV/c for Ni–Pb (Moniz et al. 1971, PRL 26 445); rms per transverse component in a Fermi gas is pF/√5 ≈ 115 MeV/c, so the angular spread is θ ≈ pF/(γ m_N): 0.1 mrad at the LHC, 2.6 mrad at 200 GeV, 68 mrad at 7.7 GeV. Free spectator neutrons are measured in the ZDCs (ALICE ZDC at ±112.5 m); protons are bent out by the dipoles; bound fragments with Z/A ≈ 1/2 stay inside the beam pipe (ALICE 1301.4361). Spectator "bounce-off" defines Ψ_SP and the directed-flow sign convention (1306.4145).

## 7. Electromagnetic/ultra-peripheral effects (optional)

- EMD of Pb at 2.76 TeV: σ_single EMD (with neutron emission) = 187.4 ± 0.2 (+13.2/−11.2) b, σ_mutual = 5.7 ± 0.1 ± 0.4 b — 25× the hadronic cross section (ALICE arXiv:1203.2436, PRL 109 252302; ins1093519). At 5.02 TeV the 1n–5n EMD sum is 151.5 ± 0.2 ± 4.7 b (ALICE arXiv:2209.04250; ins2666398).
- Photonuclear: coherent J/ψ at 2.76 TeV, dσ/dy incoherent = 0.98 (+0.19/−0.17) mb, coherent ≈ 2.4 mb (verify) (ALICE arXiv:1305.1467; ins1232206).
- Light-by-light: σ_fid = 70 ± 24 ± 17 nb (ATLAS arXiv:1702.01625, Nat. Phys. 13 852; ins1512305).

## 8. HEPData programmatic access

```
# record metadata (light=true omits data tables)
https://www.hepdata.net/record/ins1419244?format=json&light=true
# whole submission, one format: json | yaml | csv | root | yoda | yoda1 | yoda.h5 | original
https://www.hepdata.net/record/ins1419244?format=csv
https://www.hepdata.net/record/ins1419244?format=json&table=Table%201&version=1
# single table
https://www.hepdata.net/download/table/ins1410589/Table1/1/csv   # {inspire}/{table}/{version}/{fmt}
https://www.hepdata.net/download/submission/ins1410589/1/yaml
# search
https://www.hepdata.net/search/?q=arxiv:1512.06104&format=json&size=10
# CLI / Python
pip install hepdata-cli
hepdata-cli find 'arxiv:1512.06104' -i inspire
hepdata-cli download 1410589 -i inspire -f csv -d ./data
from hepdata_cli.api import Client; Client().download(['1410589'], 'json', 'inspire', None, 'data')
```

Caveat: hepdata.net may answer automated requests with a Cloudflare challenge. Fallback that worked: Rivet reference data, `https://gitlab.com/hepcedar/rivet/-/raw/release-4-0-x/analyses/pluginALICE/ALICE_2016_I1419244.yoda.gz` (YODA text). Records to ingest: ins1410589, ins1507090, ins1225979, ins877821, ins880049, ins2907584, ins1672756, ins599315, ins876609, ins1222333, ins1759506, ins1243865, ins1288320, ins1380491, ins793126, ins1419244, ins1672822, ins660793, ins777954, ins1657384, ins1673184, ins1472319, ins1215085, ins1238980, ins1093519, ins2666398, ins1512305, ins1232206, ins1394677, ins3166912 (CMS O–O), ins3170344 (ATLAS O–O/Ne–Ne), ins2967353 (ALICE O–O/Ne–Ne flow).

## References
1. ALICE, arXiv:1512.06104, PRL 116, 222302 (2016)
2. ALICE, arXiv:1612.08966, PLB 772, 567 (2017)
3. ALICE, arXiv:1011.3916, PRL 105, 252301 (2010); arXiv:1012.1657, PRL 106, 032301 (2011)
4. ALICE, arXiv:1304.0347, PLB 726, 610 (2013)
5. ALICE, arXiv:2504.02505 (Pb–Pb 5.36 TeV)
6. ALICE, arXiv:1805.04432, PLB 790, 35 (2019)
7. CMS, arXiv:2606.02285; ATLAS, arXiv:2606.20257; ALICE, arXiv:2509.06428 (O–O/Ne–Ne 5.36 TeV)
8. PHOBOS, nucl-ex/0210015, PRL 91, 052303 (2003); arXiv:1011.1940, PRC 83, 024913 (2011)
9. ALICE, arXiv:1303.0737, PRC 88, 044910 (2013); arXiv:1910.07678, PRC 101, 044907 (2020)
10. ALICE, arXiv:1307.5543; arXiv:1404.0495; arXiv:1506.08951; arXiv:1307.5530
11. STAR, arXiv:0808.2041, PRC 79, 034909 (2009)
12. ALICE, arXiv:1602.01119, PRL 116, 132302 (2016); arXiv:1805.04390, JHEP 09 (2018) 006
13. STAR, nucl-ex/0409033, PRC 72, 014904 (2005); arXiv:0801.3466, PRC 77, 054901 (2008)
14. ALICE, arXiv:1306.4145, PRL 111, 232302 (2013)
15. ALICE, arXiv:1802.09145; ATLAS, arXiv:1805.05635; ALICE, arXiv:1606.08197
16. ALICE, arXiv:1301.4361, PRC 88, 044909 (2013); Moniz et al., PRL 26, 445 (1971)
17. ALICE, arXiv:1203.2436; arXiv:2209.04250; arXiv:1305.1467; ATLAS, arXiv:1702.01625
18. ALICE, arXiv:1509.07324, PLB 754, 235 (2016)
19. Bruce et al., arXiv:2107.09560; arXiv:2508.19653; BNL RHIC Run Overview; STAR, arXiv:2405.20928
