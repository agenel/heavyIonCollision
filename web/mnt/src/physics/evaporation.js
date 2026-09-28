// De-excitation of the primary fragments: neutron-evaporation cascade with fission competition (Z >= 88).
// - Neutron kinetic energy spectrum ∝ eps exp(-eps/T), T = sqrt(E*/a), a = A/12 MeV^-1 (Fermi gas; DNS convention,
//   Feng et al. 2009); emission while E* > S_n, gamma decay to the ground state below (S_n from the mass table).
// - Gamma_n/Gamma_f from the Weisskopf/Bohr-Wheeler ratio as used by Yanez & Loveland PRC 91 (2015) 044608:
//   Gamma_n/Gamma_f = 4 A^(2/3) a_f (E*-B_n) / (K0 a_n [2 sqrt(a_f (E*-B_f)) - 1]) exp[2 sqrt(a_n(E*-B_n)) - 2 sqrt(a_f(E*-B_f))],
//   K0 = hbar^2/(2 m r0^2) = 14.4 MeV (r0 = 1.2 fm), a_n = a_f = A/12, B_f from the WS4 barrier table with its shell part
//   damped by the excitation energy, B_f(E*) = B_LD + (B_f - B_LD) exp(-E*/E_d), E_d = 18.5 MeV; B_LD is the liquid-drop
//   barrier of the Myers-Swiatecki / Cohen-Plasil-Swiatecki systematics: 0.38 (0.75 - x) E_s for x < 2/3,
//   0.83 (1 - x)^3 E_s above, with E_s = 17.9439 (1 - 1.7826 I^2) A^(2/3) MeV and x = (Z^2/A) / (50.883 (1 - 1.7826 I^2)).
// - Charged-particle emission is neglected (stated in the page): fine for neutron-rich heavy fragments, not for
//   neutron-deficient light partners.
// The cascade is solved deterministically on an excitation-energy grid (dynamic programming over (N, E* bin)).
const DE = 1.0;          // MeV bin
const EMAX = 360;        // MeV
const NB = Math.round(EMAX / DE) + 1;

export class Evaporation {
  constructor(nuc, { K0 = 14.4 } = {}) { this.nuc = nuc; this.K0 = K0; this.cache = new Map(); }

  /** Probability that nucleus (Z, N) with E* emits a neutron rather than fissioning (1 below B_f or for Z < 88). */
  static barrierLD(Z, N) {
    const A = Z + N, I = (N - Z) / A, k = 1 - 1.7826 * I * I;
    const Es = 17.9439 * k * A ** (2 / 3), x = (Z * Z) / A / (50.883 * k);
    if (x >= 1) return 0;
    return x < 2 / 3 ? 0.38 * (0.75 - x) * Es : 0.83 * (1 - x) ** 3 * Es;
  }
  pNeutron(Z, N, E, Sn) {
    if (Z < 88) return 1;
    const r = this.nuc.get(Z, N), Bf0 = r?.bf;
    if (Bf0 == null) return 1;
    const BLD = Evaporation.barrierLD(Z, N);
    const Bf = Bf0 > BLD ? BLD + (Bf0 - BLD) * Math.exp(-E / 18.5) : Bf0;
    if (E <= Bf) return 1;
    const A = Z + N, a = A / 12, x = E - Sn, y = E - Bf;
    if (x <= 0) return 0;
    const ratio = ((4 * A ** (2 / 3) * a * x) / (this.K0 * a * Math.max(2 * Math.sqrt(a * y) - 1, 0.1))) *
      Math.exp(2 * Math.sqrt(a * x) - 2 * Math.sqrt(a * y));
    return ratio / (1 + ratio);
  }

  /**
   * Evaporate a primary population of one element Z. pop: Map N -> Float64Array(NB) of probability per E* bin.
   * Returns {final: Map N -> probability, fission: probability}.
   */
  cascade(Z, pop) {
    const nuc = this.nuc;
    const Ns = [...pop.keys()].sort((a, b) => b - a);
    const Nmin = Math.max(1, Ns[Ns.length - 1] - 40);
    const work = new Map(); for (const [N, arr] of pop) work.set(N, Float64Array.from(arr));
    const final = new Map(); let fission = 0;
    for (let N = Ns[0]; N >= Nmin; N--) {
      const arr = work.get(N);
      if (!arr) continue;
      const Sn = nuc.Sn(Z, N);
      const A = Z + N, a = A / 12;
      let fin = 0;
      for (let b = 0; b < NB; b++) {
        const p = arr[b];
        if (p < 1e-30) continue;
        const E = (b + 0.5) * DE;
        if (Sn === null || !(E > Sn)) { fin += p; continue; }         // below S_n (or unbound table edge): gamma decay
        const pn = this.pNeutron(Z, N, E, Sn);
        fission += p * (1 - pn);
        const pe = p * pn;
        if (pe <= 0) continue;
        // neutron energy spectrum eps exp(-eps/T) on [0, E - Sn]
        const Eres = E - Sn, T = Math.sqrt(Math.max(E, 0.1) / a);
        const nbin = Math.max(1, Math.floor(Eres / DE));
        let norm = 0;
        const w = new Float64Array(nbin);
        for (let q = 0; q < nbin; q++) { const eps = (q + 0.5) * DE; w[q] = eps * Math.exp(-eps / T); norm += w[q]; }
        let dst = work.get(N - 1);
        if (!dst) { dst = new Float64Array(NB); work.set(N - 1, dst); }
        for (let q = 0; q < nbin; q++) {
          const Enew = Eres - (q + 0.5) * DE;
          dst[Math.max(0, Math.min(NB - 1, Math.floor(Enew / DE)))] += (pe * w[q]) / norm;
        }
      }
      if (fin > 0) final.set(N, (final.get(N) ?? 0) + fin);
    }
    return { final, fission };
  }
}

export const EBIN = DE, NEBIN = NB;
