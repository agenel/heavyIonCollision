# Physics models for multinucleon transfer (MNT) in low-energy heavy-ion collisions
### Research report for a live browser model (JavaScript, < 1 s)

Scope: collisions near and above the Coulomb barrier (about 5–10 MeV/u). Reference systems are 136Xe+208Pb, 136Xe+198Pt, 238U+248Cm, 58Ni+208Pb and 40Ca+208Pb. The model must produce the trajectory, the deflection function, TKEL, the contact time and the N,Z distributions (primary and secondary).

**How the sources were checked.** Every citation was checked against Crossref metadata (DOI, journal, volume, page, authors). Where an arXiv version exists, its abstract page was also checked, including the journal reference that arXiv lists. Formulas and numbers marked with ✔ were read directly from the full text of the cited paper, or from its arXiv version. The label [unverified] means the item comes from memory or a secondary mention and still needs checking against the original. Quotes are kept under 15 words. Everything else is a summary.

Notation: $e^2 = 1.44$ MeV fm, $\hbar c = 197.327$ MeV fm, $m_u c^2 = 931.494$ MeV, 1 zs $=10^{-21}$ s $= 299.79$ fm/c. The reduced mass is $\mu = m_u A_1A_2/(A_1+A_2)$, and the surface separation is $s = r - C_1 - C_2$.

---

## 1. Classical dynamical (trajectory) models with friction

### 1.1 Equations of motion
The surface friction model (SFM) is written in the form used by Abe & Bouriquet [AB03] ✔, which reformulates Gross & Kalinowski [GK78]. The collective variables are the relative distance $r$, the orbital angle $\theta$ and the orbital angular momentum $L$. The fragment spins absorb $L_0-L$.

- $\dot r = p/\mu$
- $\dot p = -\partial_r\,[V_N(r)+V_C(r)] + L^2/(\mu r^3) - K_r(r)\,\dot r \;(+\text{random force})$
- $\dot\theta = L/(\mu r^2)$
- $\dot L = -(K_\phi(r)/\mu)\,(L-L_{st}) \;(+\text{random torque})$

with the following definitions ✔ [AB03, Eqs. 12–20]:

- $K_r = K_r^0\,\Psi(r)$ and $\Psi(r) = (dV_N/dr)^2$ (the SFM form factor of [GK78]).
- $K_\phi = K_\phi^0\,\Psi(r)\,[1 + x]$, where $x = \dfrac{\mu r^2}{(C_1+C_2)^2}\Big(\dfrac{C_1^2}{\mathcal J_1}+\dfrac{C_2^2}{\mathcal J_2}\Big)$.
- $L_{st} = L_0\,x/(1+x)$. With rigid spheres ($\mathcal J_i=\tfrac25 m_iC_i^2$) at $r = C_1+C_2$ this gives $x = 5/2$, so $L_{st} = \tfrac57 L_0$ (the **rolling limit**) and $K_\phi \simeq \tfrac72 K_\phi^0\Psi$.
- The **sticking limit** is $L_{st}=L_0\,\mu r^2/(\mu r^2+\mathcal J_1+\mathcal J_2)$. It follows from the same equations when the tangential relative velocity of the two surfaces vanishes [AB03] ✔.
- Constants from Gross–Kalinowski as quoted in [AB03] ✔: $K_r^0 = 4\times10^{-23}$ s MeV$^{-1}$ and $K_\phi^0 = 0.01\times10^{-23}$ s MeV$^{-1}$. $K$ has units of MeV s fm$^{-2}$, so $K\dot r$ is a force in MeV/fm.
- Fluctuation–dissipation (Einstein) relations for the Langevin version ✔ [AB03]: $\theta_r^2 = K_r T$ and $\theta_{11}^2 = r^2K_\phi T$. Here $T$ is the temperature of the composite system (Fermi gas, $T=\sqrt{E^*/a}$).

A Zagrebaev–Greiner style alternative for the phenomenological friction [ZG05], with values as used by Amano, Aritomo & Ohta [AAO22] ✔:
- $\gamma_R = \gamma_R^0 F(\xi)$ and $\gamma_{tan} = \gamma_t^0F(\xi)$, with $F(\xi)=[1+\exp((\xi-\rho_F)/a_F)]^{-1}$ and $\xi=R-R_1-R_2$.
- $\rho_F\approx 2$ fm and $a_F\approx0.6$ fm, determined in [ZG05].
- $\gamma_R^0 = 100\times10^{-22}$ MeV s fm$^{-2}$ and $\gamma_t^0 = 0.1\times10^{-22}$ MeV s fm$^{-2}$.

Cross-check (my arithmetic): at contact, $|dV_N/dr| \sim 15$–20 MeV/fm, which gives $K_r^0\Psi \approx 1$–$1.6\times10^{-20}$ MeV s fm$^{-2}$. This is the same order as $\gamma_R^0$, so the two parameterisations are consistent.

The **Chushnyakova–Gontchar trajectory model** [CG13, CG23] ✔ uses the same SFM form, $K_R\,(dU_n/dq)^2$, with an M3Y/Migdal double-folding potential. The friction strength that fits above-barrier fusion data was about 90 zs/GeV for C,O+C,O and about 15 zs/GeV for 16O+40Ca and 40Ca+40Ca. In the units used here, that is $0.9$–$9\times10^{-23}$ s/MeV. Their empirical systematics are $K_R = K_1\exp[(B_0-B_Z)/\Delta B]+K_0$, with $B_Z = Z_1Z_2/(A_1^{1/3}+A_2^{1/3})$ MeV, $K_0=10$ zs/GeV, $K_1=80$ zs/GeV, $B_0=7$ MeV and $\Delta B=8$ MeV [CG23] ✔. This gives an asymptotic value of about 1×10⁻²³ s/MeV for heavy systems.

**One-body (wall-and-window) dissipation.** This is the microscopic alternative [BBN78, RS80]:
- Wall formula: $\dot E = \rho_m\bar v\oint \dot n^2\,d\sigma$.
- Window formula: $\dot E = \tfrac14\rho_m\bar v\,\Delta\sigma\,(2\dot D_\parallel^2+\dot D_\perp^2)$.

Both expressions were read from secondary sources that cite [BBN78] ✔ ([CP02] and its companion work). It follows that the window friction along the axis, $\eta_{win}=\tfrac12\rho_m\bar v\Delta\sigma$ [CP02] ✔, is twice the tangential one. Numerically (my computation, with $\rho_0=0.16$ fm$^{-3}$ and $\bar v = \tfrac34 v_F \approx 0.21c$), $\tfrac14\rho_m\bar v \approx 2.7\times10^{-23}$ MeV s fm$^{-4}$. The often-quoted Randrup value $n_0=0.263\times10^{-22}$ MeV s fm$^{-4}$ matches this, but that exact number is [unverified]. Randrup's proximity friction [Ran78a] (Ann. Phys. 112, 356, title verified: "Nuclear one-body proximity friction") writes the window area through the proximity universal function. Its exact universal function $\Psi(\xi)$ is [unverified]. Adamian et al. [AJN97] derived microscopic radial and tangential friction coefficients. They compare them with the classical model of [GK78] and find that most of the kinetic energy is dissipated within about 0.4 zs ✔.

### 1.2 Nuclear potentials
All constants below were read from Dutt & Puri [DP10] ✔, except where noted.

| Potential | Formula | Constants |
|---|---|---|
| **Prox 77** [BRST77] | $V_N = 4\pi\gamma b\bar R\,\Phi(\xi)$, $\xi=(r-C_1-C_2)/b$ | $\bar R=C_1C_2/(C_1+C_2)$; $C_i=R_i[1-(b/R_i)^2]$; $R_i=1.28A_i^{1/3}-0.76+0.8A_i^{-1/3}$ fm; $b=1$ fm; $\gamma=\gamma_0[1-k_s((N-Z)/A)^2]$ with $N,Z,A$ of the whole system; $\gamma_0=0.9517$ MeV fm$^{-2}$, $k_s=1.7826$ |
| | universal function | $\Phi=-\tfrac12(\xi-2.54)^2-0.0852(\xi-2.54)^3$ for $\xi\le1.2511$; $\Phi=-3.437\,e^{-\xi/0.75}$ for $\xi\ge1.2511$ |
| **Prox 88** | as Prox 77 | $\gamma_0=1.2496$ MeV fm$^{-2}$, $k_s=2.3$ |
| **Prox 2000** [MS00] | droplet-model radii with neutron skin | $\Phi=-0.1353+\sum_{n=0}^{5}[c_n/(n+1)](2.5-\xi)^{n+1}$ for $0<\xi\le2.5$; $-0.09551\,e^{(2.75-\xi)/0.7176}$ for $\xi\ge2.5$; $c_{0..5}=-0.1886,-0.2628,-0.15216,-0.04562,0.069136,-0.011454$ |
| **Bass 77** [Bas77] | $V_N=-\dfrac{R_1R_2}{R_1+R_2}\,\Phi(s)$, $\Phi(s)=[A e^{s/d_1}+Be^{s/d_2}]^{-1}$ | $R_i=1.16A_i^{1/3}-1.39A_i^{-1/3}$ fm; $A=0.0300$ MeV$^{-1}$fm; $B=0.0061$ MeV$^{-1}$fm; $d_1=3.30$ fm; $d_2=0.65$ fm |
| **Bass 80** | as Bass 77 | $\Phi=[0.033e^{s/3.5}+0.007e^{s/0.65}]^{-1}$; $R_i=R_s(1-0.98/R_s^2)$ with $R_s$ from the Prox 77 formula |
| **Broglia–Winther 91** | $V_N=-V_0/(1+e^{(r-R_0)/a})$, $V_0=16\pi\gamma a\,\bar R$ | $a=0.63$ fm; $R_0=R_1+R_2+0.29$; $R_i=1.233A_i^{1/3}-0.98A_i^{-1/3}$; $\gamma=0.95[1-1.8\frac{(N_p-Z_p)(N_t-Z_t)}{A_pA_t}]$ MeV fm$^{-2}$ |
| **Akyüz–Winther (AW 95)** [Win95 via DP10] | as BW91 | $a^{-1}=1.17[1+0.53(A_1^{-1/3}+A_2^{-1/3})]$ fm$^{-1}$; $R_i=1.20A_i^{1/3}-0.09$ fm; $R_0=R_1+R_2$. This is the potential used by GRAZING |
| **Morse (DNS)** [Li06] | $U_N=D\{e^{-2\alpha(R-R_0)/R_0}-2e^{-\alpha(R-R_0)/R_0}\}$ | $D=2\pi a_1a_2R_{12}(10.96-0.8R_{12})$ MeV; $\alpha=11.47+2.069R_{12}-17.32a_1a_2$; $R_{12}=R_1R_2/R_0$; $a_i\approx0.54$–0.59 ✔ |
| **Double folding** (M3Y, Migdal, São Paulo) | $V_N=\iint\rho_1\rho_2 v_{NN}$ | used in [CG23] and in the diabatic potential of [KS17, SK19]. Too expensive for live use unless tabulated |

Dutt & Puri report that all 12 proximity-type potentials reproduce fusion barrier heights within about ±10 % on average ✔.

**Warning about Prox 77.** For $\xi\lesssim-2$ the cubic form of $\Phi$ turns over and becomes repulsive (an artefact). Clamp it, or stop the calculation at $\xi\approx-1$.

### 1.3 Observables from the trajectory
- **Deflection function.** $\Theta(\ell) = \pi - \theta(t\to\infty)$. Integrate out to $r\approx 50$–60 fm, then add the analytic Rutherford tail. For a repulsive Coulomb orbit, $\varepsilon=\sqrt{1+2E_fL^2/(\mu k^2)}$ with $k=Z_1Z_2e^2$, and the remaining angle is $\arccos(1/\varepsilon)-\arccos[(p/r+1)/\varepsilon]$ with $p=L^2/(\mu k)$. Negative-angle ("orbiting") branches appear when $\Theta$ passes through 0.
- **TKEL.** $\mathrm{TKEL}(\ell)=E_{cm} - E_{kin}(\infty)$ for the entrance mass partition. For a product channel, $\mathrm{TKE}=E_{cm}+Q_{gg}-E_{diss}$ with $Q_{gg}=M_P+M_T-M_{PLF}-M_{TLF}$ [CNZF20] ✔.
- **Contact / interaction time.** The time spent at $s<s_c$. Transfer and dissipation start at about 2 fm surface separation [SK19] ✔, so $s_c \approx 2$ fm, which is also the form-factor radius $\rho_F$ [ZG05, AAO22]. The historical experimental "clock" converts the rotation angle into a time [SHB77].
- **Wilczyński plot** [Wil73]. The double-differential cross section $d^2\sigma/d\theta\,d\mathrm{TKEL}$ is plotted in the ($\theta_{cm}$, TKEL) plane. It shows quasi-elastic events near the grazing angle $\theta_{gr}$ and the focusing or orbiting of damped events to smaller or negative angles. The model gives it by weighting each $\ell$ with $(2\ell+1)$ and spreading the points with Langevin noise or a Gaussian.

### 1.4 Parameterised deflection-function / relaxation approach (used by DNS codes)
This lighter alternative to integrating the equations of motion is taken from Chen, Niu, Zuo & Feng [CNZF20] ✔, following Wolschin & Nörenberg [WN78] and Li et al. [Li03, Li06].

- $\Theta(\ell)=\Theta_C(\ell)+\Theta_N(\ell)$, with $\Theta_C$ the Rutherford function.
- $\Theta_N=\beta\,\Theta_C^{gr}\,\frac{\ell}{\ell_{gr}}(\delta/\beta)^{\ell/\ell_{gr}}$.
- $\ell_{gr}=0.22R_{int}[A_{red}(E_{cm}-V(R_{int}))]^{1/2}$.
- $\beta=75f(\eta)+15$ for $\eta<375$, and $36\exp(-2.17\times10^{-3}\eta)$ for $\eta\ge375$.
- $\delta=0.07f(\eta)+0.11$ for $\eta<375$, and $0.117\exp(-1.34\times10^{-4}\eta)$ for $\eta\ge375$.
- $f(\eta)=[1+\exp((\eta-235)/32)]^{-1}$ and $\eta = Z_1Z_2e^2/v$ with $v=\sqrt{2(E_{cm}-V(R_{int}))/A_{red}}$.

The garbled PDF text makes it unclear whether it is $(\delta/\beta)$ or $(\delta/\beta)^{\ell/\ell_{gr}}$ that multiplies. The form shown matches the standard Wolschin–Nörenberg parameterisation but should be re-read in the typeset paper.

Relaxation of energy and angular momentum [CNZF20] ✔:
- $E_{diss}(t)=E_{cm}-B-\langle J\rangle(\langle J\rangle+1)\hbar^2/2\zeta-\langle E_{rad}\rangle$.
- $\langle E_{rad}(t)\rangle=E_{rad}(0)e^{-t/\tau_r}$ with $\tau_r=5\times10^{-22}$ s.
- $\langle J(t)\rangle=J_{st}+(J_i-J_{st})e^{-t/\tau_J}$ with $\tau_J=15\times10^{-22}$ s and $J_{st}=J_i\zeta_{rel}/\zeta_{tot}$ (sticking).

[Li06] ✔ quotes $\tau_R\simeq0.3$ zs, $\tau_J\simeq1.5$ zs and a deformation relaxation time $\tau_\epsilon\simeq4$ zs. DNS papers report the interaction time as "a few $10^{-20}$ s" [FJL09] ✔, or reaching equilibrium around $40\times10^{-22}$ s for Xe+Pb [ZFZ15] ✔.

### 1.5 Prototype check (my own computation, not literature)
I wrote a CPython prototype with Prox 77, a Coulomb term (uniform sphere inside $1.2(A_1^{1/3}+A_2^{1/3})$), SFM friction as in §1.1 and RK4 with dt = 0.5 fm/c. It ran 50 values of ℓ per system in about 0.5 s, so a JavaScript version should take roughly 10–50 ms.

| System, $E_{cm}$ (MeV) | Prox77 barrier $B$ | Head-on TKEL, $K_r^0=4\times10^{-23}$ | Head-on contact time ($s<3$ fm) |
|---|---|---|---|
| 136Xe+208Pb, 526 | 443 MeV at 12.1 fm | 103 MeV | 1.6 zs |
| 58Ni+208Pb, 256.8 | 251 MeV | 13 MeV | 0.65 zs |
| 40Ca+208Pb, 208 | 186 MeV | no capture | — |

What this shows:
1. With the Gross–Kalinowski $K_r^0$ and Prox 77, head-on 40Ca+208Pb at 208 MeV (22 MeV above the barrier) is **not captured**, although capture is known experimentally. With $K_r^0=1\times10^{-23}$ s/MeV, $\ell\le60$ is captured. **Therefore $K_r^0$ must be calibrated for each potential choice**; the published values only transfer together with the potential they were fitted with.
2. With spherical fragments, TKEL can never exceed $E_{cm}-V(\text{exit})$. Fully damped Xe+Pb data need a deformation or neck coordinate, as in the friction model with deformation and in Zagrebaev–Greiner [ZG05, KS17]. A cheap substitute is to limit fully relaxed events to a Viola-type TKE, $\mathrm{TKE}\approx0.1189Z^2/A^{1/3}+7.3$ MeV [VKW85]. These constants are [unverified in text], and for asymmetric splits the $Z_1Z_2/(A_1^{1/3}+A_2^{1/3})$ generalisation is also [unverified].

---

## 2. Nucleon exchange and transport models

### 2a. Dinuclear system (DNS) master equation
Sources: Adamian, Antonenko, Scheid, Volkov [AAS98, AAS03]; Li et al. [Li06] ✔; Feng, Jin, Li (Scheid) [FJLS09, FJL09] ✔; Zhu, Feng, Zhang [ZFZ15] ✔; Chen et al. [CNZF20] ✔; Zhang et al. review [ZLZW18] ✔; Liao, Zhu, Su, Li ("DNS-sysu") [LZSL23] ✔.

**Master equation** ✔ [FJL09, ZFZ15]:
$$\frac{dP(Z_1,N_1,E_1,t)}{dt}=\sum_{Z_1'}W_{Z_1N_1;Z_1'N_1}\big[d_{Z_1N_1}P(Z_1',N_1)-d_{Z_1'N_1}P(Z_1,N_1)\big]+\sum_{N_1'}(\ldots)_{N}-\Lambda^{qf}P.$$
Only single-nucleon steps are allowed ($Z_1'=Z_1\pm1$, $N_1'=N_1\pm1$), and $d$ is the microscopic dimension (number of channels) of the macrostate.

**Microscopic transition probability** ✔ [Li06, Eqs. 7–15], written there for $A_1$; the Feng/Zhu versions split it into Z and N:
- $W_{A_1A_1'}=\dfrac{\tau_{mem}}{\hbar^2 d_{A_1}d_{A_1'}}\sum_{ii'}|\langle A_1',i'|V|A_1,i\rangle|^2$
- $\tau_{mem}=\sqrt{2\pi}\,\hbar\,\{\langle V^2\rangle_{A_1}+\langle V^2\rangle_{A_1'}\}^{-1/2}$
- $\langle V_{kk'}V^\dagger_{kk'}\rangle=\tfrac14U_{kk'}^2g_kg_{k'}\Delta_{kk'}\Delta\varepsilon_k\Delta\varepsilon_{k'}\,[\Delta_{kk'}^2+\tfrac16(\Delta\varepsilon_k^2+\Delta\varepsilon_{k'}^2)]^{-1/2}$
- $U_{kk'}=\dfrac{g_1^{1/3}g_2^{1/3}}{g_1^{1/3}+g_2^{1/3}}\cdot\dfrac{2\gamma_{kk'}}{g_k^{1/3}g_{k'}^{1/3}}$
- $g_k=A_k/12$ MeV$^{-1}$, $\gamma_{kk'}=3$ (dimensionless) and $\Delta_{kk'}=2$ MeV
- Valence space: $\Delta\varepsilon_k=\sqrt{4\varepsilon_k^*/g_k}$, $\varepsilon_k^*=\varepsilon^*A_k/A$, $N_k=g_k\Delta\varepsilon_k$ states, $m_k=N_k/2$ valence nucleons, and $d(m_1,m_2)=\binom{N_1}{m_1}\binom{N_2}{m_2}$
- Time step 0.05–0.1×10⁻²² s ✔

The factors 1/4 and 1/6 were read from a garbled PDF extraction and should be re-checked in the typeset paper. [LZSL23] ✔ uses a memory time of $0.25\tau_0/A$ with $\tau_0=2\pi\hbar/(1\ \text{MeV})\approx4\times10^{-21}$ s.

**Local excitation energy** ✔ [Li06, ZFZ15]: $\varepsilon^*=E_{diss}-[U(Z_1,N_1)-U(Z_P,N_P)]-\frac{(J-M)^2}{2\zeta_{rel}}-\frac{M^2}{2\zeta_{int}}$, with $\zeta_{rel}=\mu R_m^2$.

**Temperature**: $\Theta=\sqrt{\varepsilon^*/a}$ with $a=A/12$ MeV$^{-1}$ ✔ [FJL09].

**Driving potential / PES** ✔ [FJL09, CNZF20, LZSL23]:
- $U=B(Z_1,N_1)+B(Z_2,N_2)-B(Z,N)+V_{rot}^{CN}+V(\{\alpha\})$, where the $B$ are negative binding energies with shell and pairing corrections included.
- DNS-sysu form: $U=\Delta(Z_1,N_1)+\Delta(Z_2,N_2)+V(R_{cont})+\tfrac12C_1\delta\beta_1^2+\tfrac12C_2\delta\beta_2^2$, with mass excesses Δ.
- $V=V_N+V_C+(J\hbar)^2/2\zeta_{rel}$, evaluated at the touching point or at the pocket minimum $R_m$, and orientation-dependent for deformed nuclei (tip–tip / side–side).

**Quasifission (Kramers) rate** ✔ [ZFZ15, Li06]:
- $\Lambda^{qf}=\frac{\omega}{2\pi\omega^{B_{qf}}}\Big[\sqrt{(\Gamma/2\hbar)^2+(\omega^{B_{qf}})^2}-\Gamma/2\hbar\Big]e^{-B_{qf}/\Theta}$
- $\Gamma=2.8$ MeV, $\hbar\omega^{B_{qf}}=2.0$ MeV and $\hbar\omega=3.0$ MeV.

**Cross sections** ✔ [FJL09, ZFZ15, CNZF20]:
- $\sigma_{pr}(Z_1,N_1)=\sum_J\sigma_{cap}(E,J)P(Z_1,N_1,\tau_{int}(J))$, with $\sigma_{cap}=\frac{\pi\hbar^2}{2\mu E}(2J+1)T(E,J)$.
- $T$ comes from Hill–Wheeler, and equals 1 above the contact potential for heavy systems without a pocket.
- $\sigma_{sur}=\sigma_{pr}\,W_{sur}$, with GEMINI or a statistical code for $W_{sur}$.
- Excitation energy is shared between fragments in proportion to mass ✔ [ZFZ15]. $J_{max}=200$ for U+U ✔ [FJL09].

**Simplified DNS rate (level-density ratio).** The Adamian-type and Zagrebaev-type rate $\lambda^{(\pm)}=\lambda_0\sqrt{\rho(E^*_{\pm})/\rho(E^*)}\approx\lambda_0\exp\{-[U(Z\pm1)-U(Z)]/2T\}$, with $\lambda_0\sim10^{22}$ s$^{-1}$, is **[unverified]**: I could not open a peer-reviewed full text that states it. The equivalent verified formulation is the Einstein-relation transport of §2f.

**Inputs**: $Z,A$ of both nuclei, $E_{cm}$, a mass table, deformations and orientation, an interaction potential, and the relaxation times or deflection-function parameters.
**Outputs**: primary and secondary $\sigma(Z,N)$, TKE–mass spectra and angles.

**Accuracy**:
- 136Xe+208Pb at 514 MeV: Po and Ra isotopes within error bars, 222Rn underestimated ✔ [ZFZ15].
- 58Ni+208Pb: good on the neutron-rich side, underestimates the neutron-deficient side ✔ [ZFZ15].
- 136Xe+198Pt at $E_{cm}=450$ MeV: "Neither the GRAZING nor the DNS model correctly describes" the yields ✔ [DLM19].
- DNS alone misses the direct (quasi-elastic) component. [ZLZW18] ✔ adds GRAZING cross sections to cover it.
- Typical accuracy is a factor of 2–10, worse for far-off channels.

**Browser feasibility: yes.** A grid of ±25 Z × ±35 N is about 3000 cells. An explicit Euler scheme needs a few hundred steps. With 20–40 ℓ bins this is about $10^7$–$10^8$ flops, i.e. 0.1–1 s in JS (use a Web Worker). $\log\binom{n}{m}$ via lgamma is cheap.

### 2b. Langevin model of Zagrebaev & Greiner
Sources: [ZG05, ZG07, ZG08a, ZG08b, ZG11]; the detailed implementation is by Karpov & Saiko [KS17, SK19] ✔.

- **Variables** ✔ [SK19]: $r$, deformations $\delta_1,\delta_2$ (two-center shell model, TCSM), mass asymmetry $\eta_A$ and charge asymmetry $\eta_Z$, plus the angles $\theta,\varphi_1,\varphi_2$. That is 8 coupled Langevin equations: $\dot q_i=\mu_{ij}p_j$ and $\dot p_i=T(\partial S/\partial q_i)-\gamma_{ij}\mu_{jk}p_k+\theta_{ij}\xi_j$, with $S=2\sqrt{aE^*}$ and $\theta\theta=\gamma T$.
- **Potential**: diabatic (double folding with Migdal forces) relaxes to adiabatic (extended macro-microscopic: finite-range liquid drop plus Strutinsky shell correction on the TCSM shape) as $e^{-t/\tau_{DA}}$ ✔ [SK19]. Axial-symmetry restoration time $\tau_{sym}=10^{-21}$ s ✔ [SK19]. Amano et al. use $\tau=10^{-22}$ s for the diabatic→adiabatic step ✔ [AAO22].
- **Transport coefficients**: Werner–Wheeler inertia, wall+window friction, and phenomenological form factors before contact ✔ [SK19]. The phenomenological values are in §1.1.
- **Key predictions**:
  - More than 50 unknown N=126 nuclei produced in 136Xe+208Pb with σ > 1 µb ✔ [ZG08a, PRL abstract].
  - Shell effects (the 208Pb valley) enhance transfer to superheavies in U+Cm; the model reproduced the Cf–Md yields of 238U+248Cm ✔ [ZG07, via secondary summary].
- **Accuracy vs data**: For 136Xe+208Pb (thick target, 450 MeV), the model predicts TLF magnitudes well for ΔZ = −8…+4. The mean theory-evaluation factor is tef = log10(σ_th/σ_exp) = −0.36 ± 0.15 for Pt (a factor of about 2) and −0.69 ± 0.14 for Rn (a factor of about 5). However, its N=126 yields exceed the measured ones "by two orders of magnitude" ✔ [BLY15].
- **Browser feasibility: no** for the full model: a multidimensional TCSM potential is needed, and thousands of stochastic trajectories per ℓ. A reduced 2–3D version with a tabulated potential might run in several seconds.

### 2c. GRAZING (Winther)
Sources: [Win94, Win95]; review [CPS09]; model descriptions in [BLY15, SCP07] ✔; GRAZING-F [YL15] ✔.

- **Physics** ✔: classical Coulomb plus nuclear (Akyüz–Winther) trajectories. Quantal amplitudes for surface vibrations and single-nucleon transfer use known form factors, which is an approximate solution of coupled-channel equations. Multinucleon transfer is a **multi-step sequence of independent single-nucleon** stripping and pickup steps. The code includes neutron evaporation.
- **Formula-level details** (independent-particle Poisson-like distributions, exponential form factors decaying with the binding energy, Q-value windows) are **[unverified]** here: [Win94, Win95] are paywalled and could not be read.
- **Inputs**: $Z,A$, $E$, and default level-density and form-factor parameters. **Outputs**: σ(Z,A), angular distributions, TKEL for quasi-elastic channels.
- **Accuracy**:
  - Adequate only for ΔZ = −1…+2 ✔ [BLY15].
  - For Xe+Pb it underestimates ΔZ = −4 (Pt) with tef = −5.0 ± 0.9 (a factor of about 10⁵) and ΔZ = +4 (Rn) with tef = −3.3 ± 0.6 ✔ [BLY15].
  - It fails for 136Xe+198Pt at 450 MeV ✔ [DLM19].
  - GRAZING-F (with fission competition) reproduces +1p to +3p but not larger transfers ✔ [YL15].
  - TDHF gives results "qualitatively similar" to GRAZING and complex WKB ✔ [SY13].
- **Browser feasibility**: probably yes (it is a semiclassical integral over ℓ), but reimplementing it needs the full formalism of [Win94, Win95].

### 2d. TDHF with particle-number projection
Sources: Simenel [Sim10]; Sekizawa & Yabana [SY13, SY14, SY16]; review [Sek19] ✔.

- **Projection** ✔ [SY13, Eq. 11]: $P_n=\frac1{2\pi}\int_0^{2\pi}d\theta\,e^{in\theta}\det\big[\langle\psi_i|\psi_j\rangle_{V_T}+e^{-i\theta}\langle\psi_i|\psi_j\rangle_{V_P}\big]$. Then $P_{Z,N}=P_Z^{(p)}P_N^{(n)}$ and $\sigma_{tr}(Z,N)=2\pi\int_{b_{min}}^\infty b\,P_{Z,N}(b)\,db$.
- **Numerics** ✔ [SY13]: 3D grid spacing 0.8 fm, 60×60×26 points, Δt = 0.2 fm/c, M = 200 θ points, impact parameters from $b_f$ up to 10 fm.
- **Physics** ✔:
  - Fast N/Z equilibration at large b.
  - Neck breaking at small b, which transfers many nucleons, especially for $Z_PZ_T\gtrsim1600$.
  - No adjustable parameters once the energy density functional (EDF) is chosen.
  - TKEL comes out naturally.
- **Accuracy** ✔ [SY13, Sek19]:
  - Few-nucleon channels are reasonable; accuracy drops as more nucleons are transferred.
  - Channels with many neutrons plus more than one proton are overestimated.
  - Evaporation must be added (TDHF+GEMINI improves agreement).
  - Widths of mass distributions are severely underestimated. TDRPA and stochastic mean-field (SMF) fix this.
- **Browser feasibility: no.** It needs hours of CPU time per impact parameter on HPC. It can, however, supply transport coefficients offline (see 2f).

### 2e. ImQMD and other approaches
- **ImQMD** [WLW02, ZLZ16]: nucleons are Gaussian wave packets with a Skyrme-type EDF, Coulomb, and stochastic two-body collisions ✔ (structure summarised in [LZSL23, ZLZW18]). It "describes these yields adequately" for 136Xe+198Pt at 450 MeV ✔ [DLM19]. Browser feasibility: **no** (many events × about $10^3$ nucleons).
- **Stochastic mean field / quantal diffusion** (Ayik, Yilmaz, Umar) [AYYU18, AYYU19] ✔: TDHF mean path plus Langevin/Fokker–Planck fluctuations. The diffusion coefficients come from TDHF currents across the window. See 2f.
- **Review** Corradi, Pollarolo, Szilner [CPS09] (verified bibliographically): experimental techniques (PRISMA-type spectrometers), transfer systematics and semiclassical theory near the barrier. Content beyond the abstract was not read. Also relevant: the experimentalist review [HD22] and the historical N/Z-equilibration review [FK84].

### 2f. Fokker–Planck / diffusion in (N, Z): the basis of the recommended transport
Verified from Ayik et al. [AYYU18] ✔:

- **Mean drift**: $\dot N_1=v_n$, $\dot Z_1=v_p$.
- **Einstein relations**: $v_n=-\frac{D_{NN}}{T}\frac{\partial U}{\partial N_1}$ and $v_z=-\frac{D_{ZZ}}{T}\frac{\partial U}{\partial Z_1}$. $T$ is absorbed into the curvatures.
- **Covariances**:
  - $\partial_t\sigma^2_{NN}=2\frac{\partial v_n}{\partial N_1}\sigma^2_{NN}+2\frac{\partial v_n}{\partial Z_1}\sigma^2_{NZ}+2D_{NN}$
  - $\partial_t\sigma^2_{ZZ}=2\frac{\partial v_p}{\partial Z_1}\sigma^2_{ZZ}+2\frac{\partial v_p}{\partial N_1}\sigma^2_{NZ}+2D_{ZZ}$
  - $\partial_t\sigma^2_{NZ}=\frac{\partial v_p}{\partial N_1}\sigma^2_{NN}+\frac{\partial v_n}{\partial Z_1}\sigma^2_{ZZ}+\sigma^2_{NZ}\big(\frac{\partial v_p}{\partial Z_1}+\frac{\partial v_n}{\partial N_1}\big)$
- **Result**: a correlated Gaussian $P_b(N,Z)$ for each impact parameter, with $\rho=\sigma^2_{NZ}/(\sigma_{NN}\sigma_{ZZ})$ and $\sigma^2_{AA}=\sigma^2_{NN}+\sigma^2_{ZZ}+2\sigma^2_{NZ}$.
- **Potential shape**: two parabolas, $U=\tfrac12\alpha(\tilde z\cos\phi-\tilde n\sin\phi)^2+\tfrac12\beta(z\sin\phi+n\cos\phi)^2$. α is stiff (perpendicular to the valley, i.e. N/Z equilibration) and β is soft (mass drift along the valley). For 48Ca+238U, φ ≈ 32°.
- **Magnitudes**:
  - For 48Ca+238U at 193 MeV, b = 2.8 fm: $D_{NN}$ is about twice $D_{ZZ}$. $D_{NN}$ is of order 0.05–0.1 (fm/c)⁻¹ (read from Fig. 4, approximate), i.e. roughly $1.5$–$3\times10^{22}$ s⁻¹.
  - Memory time ≈ 20–25 fm/c, which is much shorter than the interaction time (Markovian approximation justified).
  - Mean flow speed across the window ≈ 0.05c.
- This Gaussian model is the continuum limit of the DNS master equation. With detailed-balance rates $W_\pm = D\,e^{\mp\Delta U/2T}$ (my derivation), drift $=W_+-W_-\approx -D\,\partial U/T$ and diffusion $=(W_++W_-)/2\approx D$.
- **Historical Fokker–Planck roots**: [Nör75], [ASN76], [Ran78b, Ran79], [WN78].
- **Empirical anchor**: the variance $\sigma_Z^2$ grows linearly with energy loss [HBS76, SHB77b].

---

## 3. Recommended browser model: "SFM trajectory + detailed-balance master equation (N,Z) + evaporation"

### 3.1 Pipeline (all steps are cheap and run inside one Web Worker)

**Stage 0 — inputs**: $Z_P,A_P,Z_T,A_T$, $E_{lab}$ (so $E_{cm}=E_{lab}A_T/(A_P+A_T)$), an ℓ grid (or b), and switches for the potential, friction, noise and orientation.

**Stage 1 — entrance channel and trajectory** (§1.1–1.3)
1. $V(r)=V_N^{Prox77}(r)+V_C(r)+L^2/2\mu r^2$. Use $V_C=Z_1Z_2e^2/r$ outside $R_C$, and $\frac{Z_1Z_2e^2}{2R_C}(3-r^2/R_C^2)$ inside (standard).
2. Integrate §1.1 with RK4 (dt ≈ 0.5 fm/c) from r = 60 fm. Stop at $r>60$ fm on the way out, or at capture ($s<-1$ fm, or a time limit). Use the $K_r^0$ and $K_\phi^0$ defaults of Table 3.3.
3. Optional Langevin noise with $T(t)=\sqrt{E_{diss}(t)/a}$ and $a=A/12$, running 20–100 noise samples per ℓ. This broadens the Wilczyński ridge.
4. Record $\Theta(\ell)$ with the Rutherford tail, $\mathrm{TKEL}(\ell)$, $t_{cont}(\ell)$ (time with $s<2$ fm), the history $s(t)$, $E_{diss}(t)$ and $L(t)$.
5. **Deformation fix** (recommended): add one symmetric elongation coordinate, or cap fully damped events at Viola TKE [VKW85, unverified constants]. Without it, TKEL for Xe+Pb and U+Cm is badly underestimated (§1.5).

**Stage 2 — nucleon exchange along the trajectory**
1. **Driving potential**: $U(Z_1,N_1)=M(Z_1,N_1)+M(Z_2,N_2)-M(Z_P,N_P)-M(Z_T,N_T)+V_C(R_{c})+V_N(R_{c})+\hbar^2\ell(\ell+1)/2\zeta$, with $Z_2=Z_P+Z_T-Z_1$ and so on. Use mass excesses $M$ from AME2020 [AME20], and FRDM2012 [FRDM16] or WS4 [WS414] for unmeasured nuclei. Embed as a compact table of about 9000 nuclides.
2. **Rates**: $W(Z\to Z\pm1)=D_{ZZ}(t)\,e^{-[U(Z\pm1,N)-U(Z,N)]/2T(t)}$, and likewise for N.
   - $D_{\alpha\alpha}(t)=D_{\alpha\alpha}^0\,F(s(t))$ with the Woods–Saxon form factor ($\rho_F=2$ fm, $a_F=0.6$ fm).
   - $D_{NN}^0\approx0.06$ (fm/c)⁻¹ and $D_{ZZ}^0\approx0.03$ (fm/c)⁻¹. These are the order of magnitude from [AYYU18]; treat them as a GUI calibration parameter.
   - Alternative "microscopic DNS" mode: $W$ from §2a with $g=A/12$, γ = 3 and Δ = 2 MeV.
3. **Solver**: explicit or exponential-Euler integration of the master equation on a ±25×±35 grid, only while $s<s_c$. Take $T(t)$ from $E_{diss}(t)$.
   - Fast mode: the Ayik covariance ODEs (§2f) with $\alpha,\beta,\phi$ fitted to $U$ around the injection point. This is O(1) per ℓ.
4. Primary cross section: $\sigma_{pr}(Z,N)=\frac{\pi}{k^2}\sum_\ell(2\ell+1)P_\ell(Z,N)$ with $k^2=2\mu E_{cm}/\hbar^2$. Captured ℓ go to fusion or quasifission and are shown separately.
5. Product kinematics: $\mathrm{TKE}(Z,N)=E_{cm}+Q_{gg}-E_{diss}$ [CNZF20]. The angle is $\Theta(\ell)$, so the Wilczyński plot can be drawn per channel.

**Stage 3 — de-excitation (secondary fragments)**
1. $E^*_{tot}=E_{diss}$ (+ $Q_{gg}$ bookkeeping, consistent with 2.5), shared as $E_i^*=E^*A_i/A$ ✔ [ZFZ15].
2. Neutron evaporation cascade [YL15] ✔:
   - While $E^*>B_n$, emit a neutron with kinetic energy sampled as $\varepsilon=-T\ln(r_1r_2)$, $T=\sqrt{E^*/a}$. Then $A\to A-1$ and $E^*\to E^*-B_n-\varepsilon$.
   - The deterministic variant uses $\langle\varepsilon\rangle=2T$ and a Gaussian $E^*$ width.
   - $B_n$ comes from the same mass table.
3. For $Z\gtrsim88$ (U+Cm products), add fission competition:
   - $\Gamma_n/\Gamma_f=\frac{4A^{2/3}a_f(E^*-B_n)}{K_0a_n[2\sqrt{a_f(E^*-B_f)}-1]}\exp[2\sqrt{a_n(E^*-B_n)}-2\sqrt{a_f(E^*-B_f)}]$, with $K_0=\hbar^2/2mr_0^2$ ✔ [YL15].
   - Level density: $a(U)=\tilde a[1+(1-e^{-\lambda U})\delta W/U]$ and $\tilde a=\alpha A+\beta A^{2/3}\tilde s$, with α = 0.073, β = 0.095 and λ = 0.061 MeV⁻¹ ✔ [YL15].
   - $B_f$ = macroscopic barrier + shell correction. This needs a small table and is not verified here.
4. Charged-particle evaporation is neglected. That is acceptable for neutron-rich heavy fragments but not for neutron-deficient light partners.

### 3.2 Runtime estimate
- Trajectories: 40 ℓ × (1 + 50 noise samples) × about 2000 RK4 steps ≈ 4×10⁶ force evaluations, i.e. about 50–150 ms in JS.
- Master equation: 40 ℓ × 300 steps × 3000 cells × 4 neighbours ≈ 1.4×10⁸, i.e. about 0.3–0.6 s. Use about 15 ℓ bins or the Gaussian fast mode to stay well under 1 s.
- Evaporation: a deterministic ladder over about 3000 primaries × about 10 steps is negligible.

### 3.3 Parameter table

| Parameter | Value | Units | Source / status |
|---|---|---|---|
| $e^2$, $\hbar c$, $m_uc^2$ | 1.44, 197.327, 931.494 | MeV fm, MeV fm, MeV | standard |
| Prox77 $\gamma_0$, $k_s$ | 0.9517, 1.7826 | MeV fm⁻², – | [BRST77] via [DP10] ✔ |
| Prox77 $R_i$ | $1.28A^{1/3}-0.76+0.8A^{-1/3}$ | fm | [DP10] ✔ |
| Prox77 $b$ | 1 | fm | [DP10] ✔ |
| Φ breakpoint, constants | 1.2511; 2.54, 0.0852; 3.437, 0.75 | – | [DP10] ✔ |
| Bass77 A, B, d1, d2 | 0.0300, 0.0061, 3.30, 0.65 | MeV⁻¹fm, MeV⁻¹fm, fm, fm | [DP10] ✔ |
| AW95 $a^{-1}$, $R_i$ | $1.17[1+0.53(A_1^{-1/3}+A_2^{-1/3})]$, $1.20A^{1/3}-0.09$ | fm⁻¹, fm | [DP10] ✔ |
| SFM $K_r^0$ | 4×10⁻²³ (GK). With Prox77, calibrate in the range 0.4–4×10⁻²³; default 1×10⁻²³ | s MeV⁻¹ | [GK78] via [AB03] ✔; calibration: this work |
| SFM $K_\phi^0$ | 0.01×10⁻²³ | s MeV⁻¹ | [GK78] via [AB03] ✔ |
| SFM form factor | $\Psi=(dV_N/dr)^2$ | MeV² fm⁻² | [AB03] ✔ |
| Alternative $\gamma_R^0$, $\gamma_t^0$ | 100×10⁻²², 0.1×10⁻²² | MeV s fm⁻² | [AAO22] ✔ (from [ZG05]) |
| Form factor $\rho_F$, $a_F$ | 2, 0.6 | fm | [AAO22] ✔ |
| TM friction (fusion fits) | 10–90 | zs GeV⁻¹ | [CG23] ✔ |
| Rolling / sticking limits | $\tfrac57L_0$; $\mu r^2L_0/(\mu r^2+\mathcal J_1+\mathcal J_2)$ | ħ | [AB03] ✔ |
| Level density $a$ | A/12 | MeV⁻¹ | [FJL09, ZFZ15] ✔ |
| DNS $\gamma_{kk'}$, $\Delta_{kk'}$, $g_k$ | 3, 2, $A_k/12$ | –, MeV, MeV⁻¹ | [Li06] ✔ |
| DNS Kramers Γ, $\hbar\omega^{B_{qf}}$, $\hbar\omega$ | 2.8, 2.0, 3.0 | MeV | [ZFZ15] ✔ |
| Relaxation $\tau_r$, $\tau_J$ | 5×10⁻²², 15×10⁻²² (or 3×10⁻²², 1.5×10⁻²¹) | s | [CNZF20] ✔ / [Li06] ✔ |
| Deflection-function β, δ, f(η), $\ell_{gr}$ | see §1.4 | – | [CNZF20] ✔ |
| Diffusion $D_{NN}$ | about 0.05–0.1 (≈1.5–3×10²²) | (fm/c)⁻¹ (s⁻¹) | [AYYU18] ✔ (figure reading) |
| $D_{ZZ}/D_{NN}$ | about 1/2 | – | [AYYU18] ✔ |
| Transfer onset | $s\approx2$ | fm | [SK19] ✔ |
| Memory time | about 20–25 | fm/c | [AYYU18] ✔ |
| Neutron energy sampling | $-T\ln(r_1r_2)$ | MeV | [YL15] ✔ |
| Ignatyuk α, β, λ | 0.073, 0.095, 0.061 | MeV⁻¹ | [YL15] ✔ |
| Mass tables | AME2020; FRDM2012; WS4 | – | [AME20, FRDM16, WS414] ✔ |
| Viola TKE | $0.1189Z^2/A^{1/3}+7.3$ | MeV | [VKW85] (constants [unverified]) |
| $\lambda_0$ (level-density rate) | ~10²² | s⁻¹ | [unverified] |
| Randrup $n_0$ | 0.263×10⁻²² | MeV s fm⁻⁴ | [unverified]; my estimate is 2.7×10⁻²³ |

### 3.4 Validation targets (data)
- **136Xe+208Pb**:
  - Kozulin et al., $E_{lab}$ = 700, 870 and 1020 MeV. Mass-TKE distributions; up to about 16 nucleons transferred to Pb ✔ [Koz12].
  - Barrett et al., $E_{cm}$ = 450 MeV thick target. More than 200 PLF/TLF yields ✔ [BLY15].
- **136Xe+198Pt**:
  - Watanabe et al., about 8 MeV/u, N=126 isotopes (Z < 78) produced ✔ [Wat15].
  - Desai et al., $E_{cm}$ = 450 MeV ✔ [DLM19].
- **238U+248Cm**: Schädel et al. [Sch78]; re-examination by Kratz et al. [KSG13] ✔. Thick target with $E_{lab}$ = 1760 MeV at entry and about 1650 MeV mid-target ✔ [YL15].
- **58Ni+208Pb** ($E_{lab}$ = 328.4 MeV) and **40Ca+208Pb** ($E_{lab}$ = 235 and 249 MeV): transfer data compared in [SY13] ✔. The original experimental papers were not checked here.
- **Consistency check**: $\sigma_Z^2$ should be roughly linear in TKEL [HBS76].

### 3.5 Known shortcomings of the recommended model
1. Friction parameters are tied to the potential. $K_r^0$ must be calibrated against capture and fusion excitation functions and TKEL–θ data; the published values do not transfer as they are (§1.5).
2. Spherical fragments underestimate the maximum TKEL; add an elongation or deformation coordinate, or use a Viola cap.
3. There is no quantal tunnelling or direct transfer at $s>2$ fm, so ±1–2 nucleon channels at grazing ℓ are likely underestimated. A GRAZING-like component is missing (cf. the DNS+GRAZING fix [ZLZW18]).
4. Shell effects enter only through ground-state masses in $U$. There is no dynamical TCSM potential, no deformation or orientation averaging for actinides, and no quasifission from the pocket in the simplified mode.
5. The magnitude of the diffusion coefficient is a calibration parameter ($D$ from TDHF varies with system, b and time).
6. Coupling between transfer and trajectory is one-way: the trajectory uses entrance-channel potentials even after many nucleons have moved.
7. De-excitation uses neutron emission only, plus simple fission competition. There is no charged-particle or γ emission; the thermal-equilibrium split of $E^*$ ignores non-equilibrium sharing; and the fission barrier table is not verified.
8. The expected accuracy is at best a factor of about 2–5 for near-target channels and an order of magnitude or worse for far channels. That is similar to published DNS and Langevin performance. Note that Langevin models overpredicted N=126 yields by about 100× [BLY15].

---

## 4. Citation list

"Crossref" means the DOI and bibliographic data were confirmed through the Crossref API. "arXiv" means the arXiv abstract page and its listed journal reference were checked. "FT" means formulas or numbers were read from the full text of that version.

| Key | Reference | DOI / arXiv | Verified |
|---|---|---|---|
| AAO22 | S. Amano, Y. Aritomo, M. Ohta, PRC 106, 024610 (2022) | 10.1103/PhysRevC.106.024610; arXiv:2310.07210 | Crossref+arXiv+FT |
| AAS98 | G.G. Adamian, N.V. Antonenko, W. Scheid, V.V. Volkov, NPA 633, 409 (1998) | 10.1016/S0375-9474(98)00124-9 | Crossref |
| AAS03 | G.G. Adamian, N.V. Antonenko, W. Scheid, PRC 68, 034601 (2003) | 10.1103/PhysRevC.68.034601 | Crossref |
| AB03 | Y. Abe, B. Bouriquet, Acta Phys. Pol. B 34, 1927 (2003) | arXiv:nucl-th/0308018 | arXiv jref+FT |
| AJN97 | G.G. Adamian, R.V. Jolos, A.K. Nasirov, A.I. Muminov, PRC 56, 373 (1997) | 10.1103/PhysRevC.56.373; arXiv:nucl-th/9610002 | Crossref+arXiv+FT(partial) |
| AME20 | M. Wang et al., Chin. Phys. C 45, 030003 (2021) | 10.1088/1674-1137/abddaf | Crossref |
| ASN76 | S. Ayik, B. Schürmann, W. Nörenberg, Z. Phys. A 277, 299 (1976) | 10.1007/BF01415605 | Crossref |
| AYYU18 | S. Ayik, B. Yilmaz, O. Yilmaz, A.S. Umar, PRC 97, 054618 (2018) | 10.1103/PhysRevC.97.054618; arXiv:1802.05564 | Crossref+arXiv+FT |
| AYYU19 | S. Ayik et al., PRC 100, 014609 (2019) | 10.1103/PhysRevC.100.014609; arXiv:1904.09619 | Crossref+arXiv |
| Bas77 | R. Bass, PRL 39, 265 (1977) | 10.1103/PhysRevLett.39.265 | Crossref (formula via DP10) |
| BBN78 | J. Błocki et al., Ann. Phys. 113, 330 (1978) | 10.1016/0003-4916(78)90208-7 | Crossref (formula via CP02) |
| BLY15 | J.S. Barrett et al., PRC 91, 064615 (2015) | 10.1103/PhysRevC.91.064615; arXiv:1505.00257 | Crossref+arXiv+FT |
| BRST77 | J. Błocki, J. Randrup, W.J. Świątecki, C.F. Tsang, Ann. Phys. 105, 427 (1977) | 10.1016/0003-4916(77)90249-4 | Crossref (formula via DP10) |
| CG13 | M.V. Chushnyakova, I.I. Gontchar, PRC 87, 014614 (2013) | 10.1103/PhysRevC.87.014614 | Crossref |
| CG23 | I.I. Gontchar, M.V. Chushnyakova, Chin. Phys. C 47, 084104 (2023) [article no. unverified] | 10.1088/1674-1137/acd682; arXiv:2305.09915 | Crossref+arXiv+FT |
| CNZF20 | P.-H. Chen, F. Niu, W. Zuo, Z.-Q. Feng, PRC 101, 024610 (2020) | 10.1103/PhysRevC.101.024610; arXiv:1909.13431 | Crossref+arXiv+FT |
| CP02 | G. Chaudhuri, S. Pal, PRC 65, 054612 (2002) | 10.1103/PhysRevC.65.054612; arXiv:nucl-th/0105010 | Crossref+arXiv+FT |
| CPS09 | L. Corradi, G. Pollarolo, S. Szilner, J. Phys. G 36, 113101 (2009) | 10.1088/0954-3899/36/11/113101 | Crossref (content not read) |
| DLM19 | V.V. Desai, W. Loveland et al., PRC 99, 044604 (2019) | 10.1103/PhysRevC.99.044604 | Crossref + APS abstract |
| DP10 | I. Dutt, R.K. Puri, PRC 81, 064609 (2010) | 10.1103/PhysRevC.81.064609; arXiv:1005.5213 | Crossref+arXiv+FT |
| FJL09 | Z.-Q. Feng, G.-M. Jin, J.-Q. Li, PRC 80, 067601 (2009) | 10.1103/PhysRevC.80.067601; arXiv:1001.4847 | Crossref+arXiv+FT |
| FJLS09 | Z.-Q. Feng, G.-M. Jin, J.-Q. Li, W. Scheid, NPA 816, 33 (2009) | 10.1016/j.nuclphysa.2008.11.003 | Crossref |
| FK84 | H. Freiesleben, J.V. Kratz, Phys. Rep. 106, 1 (1984) | 10.1016/0370-1573(84)90092-9 | Crossref |
| FG98 | P. Fröbrich, I.I. Gontchar, Phys. Rep. 292, 131 (1998) | 10.1016/S0370-1573(97)00042-2 | Crossref |
| Frö84 | P. Fröbrich, Phys. Rep. 116, 337 (1984) | 10.1016/0370-1573(84)90162-5 | Crossref (content not read) |
| FRDM16 | P. Möller et al., ADNDT 109–110, 1 (2016) | 10.1016/j.adt.2015.10.002 | Crossref |
| GK78 | D.H.E. Gross, H. Kalinowski, Phys. Rep. 45, 175 (1978) | 10.1016/0370-1573(78)90031-5 | Crossref (constants via AB03) |
| HBS76 | J.R. Huizenga et al., PRL 37, 885 (1976) | 10.1103/PhysRevLett.37.885 | Crossref |
| HD22 | S. Heinz, H.M. Devaraja, EPJA 58, 114 (2022) | 10.1140/epja/s10050-022-00771-1 | Crossref |
| Koz12 | E.M. Kozulin et al., PRC 86, 044611 (2012) | 10.1103/PhysRevC.86.044611 | Crossref + APS abstract |
| KS17 | A.V. Karpov, V.V. Saiko, PRC 96, 024618 (2017) | 10.1103/PhysRevC.96.024618 | Crossref |
| KSG13 | J.V. Kratz, M. Schädel, H.W. Gäggeler, PRC 88, 054615 (2013) | 10.1103/PhysRevC.88.054615 | Crossref |
| Li03 | W. Li et al., Europhys. Lett. 64, 750 (2003) | 10.1209/epl/i2003-00622-0 | Crossref |
| Li06 | W. Li et al., J. Phys. G 32, 1143 (2006) | 10.1088/0954-3899/32/8/006; arXiv:nucl-th/0509053 | Crossref+arXiv+FT |
| LZSL23 | Z. Liao, L. Zhu, J. Su, C. Li, PRC 107, 014614 (2023) | 10.1103/PhysRevC.107.014614; arXiv:2207.05253 | Crossref+FT (arXiv title differs slightly) |
| MS00 | W.D. Myers, W.J. Świątecki, PRC 62, 044610 (2000) | 10.1103/PhysRevC.62.044610 | Crossref |
| Nör75 | W. Nörenberg, Z. Phys. A 274, 241 (1975) | 10.1007/BF01437736 | Crossref |
| Ran78a | J. Randrup, Ann. Phys. 112, 356 (1978), "Nuclear one-body proximity friction" | 10.1016/S0003-4916(78)80004-9 | Crossref (formula [unverified]) |
| Ran78b | J. Randrup, NPA 307, 319 (1978), "Mass transport in nuclear collisions" | 10.1016/0375-9474(78)90621-8 | Crossref |
| Ran79 | J. Randrup, NPA 327, 490 (1979) | 10.1016/0375-9474(79)90271-9 | Crossref |
| RS80 | J. Randrup, W.J. Świątecki, Ann. Phys. 125, 193 (1980) | 10.1016/0003-4916(80)90124-4 | Crossref |
| Sch78 | M. Schädel et al., PRL 41, 469 (1978) | 10.1103/PhysRevLett.41.469 | Crossref |
| SCP07 | S. Szilner et al., PRC 76, 024604 (2007) | arXiv:0707.0426 | FT; journal ref [unverified] |
| Sek19 | K. Sekizawa, Front. Phys. 7, 20 (2019) | 10.3389/fphy.2019.00020; arXiv:1902.01616 | arXiv+FT |
| SHB77 | W.U. Schröder et al., PRC 16, 623 (1977), interaction times | 10.1103/PhysRevC.16.623 | Crossref |
| SHB77b | W.U. Schröder et al., PLB 71, 283 (1977) | 10.1016/0370-2693(77)90216-7 | Crossref |
| Sim10 | C. Simenel, PRL 105, 192701 (2010) | 10.1103/PhysRevLett.105.192701 | Crossref |
| SK19 | V.V. Saiko, A.V. Karpov, PRC 99, 014613 (2019) | 10.1103/PhysRevC.99.014613; arXiv:1810.04025 | Crossref+arXiv+FT |
| SY13 | K. Sekizawa, K. Yabana, PRC 88, 014614 (2013); Erratum PRC 93, 029902(E) (2016) | 10.1103/PhysRevC.88.014614; arXiv:1303.0552 | Crossref+arXiv+FT |
| SY14 | K. Sekizawa, K. Yabana, PRC 90, 064614 (2014) | 10.1103/PhysRevC.90.064614; arXiv:1409.1083 | Crossref+arXiv |
| SY16 | K. Sekizawa, K. Yabana, PRC 93, 054616 (2016) | 10.1103/PhysRevC.93.054616; arXiv:1601.06656 | Crossref+arXiv |
| VKW85 | V.E. Viola, K. Kwiatkowski, M. Walker, PRC 31, 1550 (1985) | 10.1103/PhysRevC.31.1550 | Crossref (constants [unverified]) |
| Wat15 | Y.X. Watanabe et al., PRL 115, 172503 (2015) | 10.1103/PhysRevLett.115.172503 | Crossref + APS abstract |
| Wil73 | J. Wilczyński, PLB 47, 484 (1973) | 10.1016/0370-2693(73)90021-X | Crossref |
| Win94 | A. Winther, NPA 572, 191 (1994) | 10.1016/0375-9474(94)90430-8 | Crossref (content not read) |
| Win95 | A. Winther, NPA 594, 203 (1995) | 10.1016/0375-9474(95)00374-A | Crossref (content not read) |
| WLW02 | N. Wang, Z. Li, X. Wu, PRC 65, 064608 (2002) | 10.1103/PhysRevC.65.064608 | Crossref |
| WN78 | G. Wolschin, W. Nörenberg, Z. Phys. A 284, 209 (1978) | 10.1007/BF01411331 | Crossref |
| WS414 | N. Wang, M. Liu, X. Wu, J. Meng, PLB 734, 215 (2014) | 10.1016/j.physletb.2014.05.049 | Crossref |
| YL15 | R. Yanez, W. Loveland, PRC 91, 044608 (2015) | 10.1103/PhysRevC.91.044608; arXiv:1501.01568 | Crossref+FT |
| ZFZ15 | L. Zhu, Z.-Q. Feng, F.-S. Zhang, J. Phys. G 42, 085102 (2015) | 10.1088/0954-3899/42/8/085102; arXiv:1503.04421 | Crossref+FT |
| ZG05 | V. Zagrebaev, W. Greiner, J. Phys. G 31, 825 (2005) | 10.1088/0954-3899/31/7/024 | Crossref (content via AAO22, SK19) |
| ZG07 | V. Zagrebaev, W. Greiner, J. Phys. G 34, 2265 (2007) | 10.1088/0954-3899/34/11/004 | Crossref (abstract not opened; IOP bot wall) |
| ZG08a | V. Zagrebaev, W. Greiner, PRL 101, 122701 (2008) | 10.1103/PhysRevLett.101.122701 | Crossref + APS abstract |
| ZG08b | V. Zagrebaev, W. Greiner, PRC 78, 034610 (2008) | 10.1103/PhysRevC.78.034610; arXiv:0807.2537 | Crossref+arXiv |
| ZG11 | V. Zagrebaev, W. Greiner, PRC 83, 044618 (2011) | 10.1103/PhysRevC.83.044618 | Crossref |
| ZLZ16 | K. Zhao et al., PRC 94, 024601 (2016) | 10.1103/PhysRevC.94.024601 | Crossref |
| ZLZW18 | F.-S. Zhang, C. Li, L. Zhu, P. Wen, Front. Phys. 13, 132113 (2018) | 10.1007/s11467-018-0843-6; arXiv:1809.01775 | Crossref+FT |
| ZSXZ17 | L. Zhu, J. Su, W.-J. Xie, F.-S. Zhang, PLB 767, 437 (2017) | 10.1016/j.physletb.2017.01.082 | Crossref |

Items that are explicitly **[unverified]**:
- The Zagrebaev/Adamian level-density rate with $\lambda_0\sim10^{22}$ s⁻¹.
- Randrup's $n_0 = 0.263\times10^{-22}$ MeV s fm⁻⁴ and his proximity-friction universal function.
- GRAZING formula-level details.
- The Viola constants 0.1189 / 7.3 MeV and the asymmetric generalisation.
- Journal reference of SCP07.
- Whether Nörenberg PLB 53, 289 (1974) (cited by [Li06]) exists: it was not found in Crossref, so Nör75 is used instead.
- The 1/4 and 1/6 factors in the DNS ⟨VV†⟩ formula (garbled PDF extraction).
