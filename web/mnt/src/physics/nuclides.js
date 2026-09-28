// Nuclide table: AME2020 masses where measured, FRDM2012 beyond (IAEA RIPL-4 merge), WS4 alternative,
// FRDM2012 deformations, WS4 fission barriers. Built by scripts/mnt_build_data.py.
export const U_MEV = 931.49410242;     // atomic mass unit (MeV), CODATA 2018
export const M_N = 8.0713181;          // neutron mass excess (MeV), AME2020
export const M_H = 7.28897061;         // 1H mass excess (MeV), AME2020

export class Nuclides {
  constructor(J, { model = "frdm" } = {}) {
    this.meta = J.meta; this.symbols = J.symbols; this.model = model;
    this.map = new Map();
    for (let i = 0; i < J.Z.length; i++) {
      this.map.set(J.Z[i] * 1000 + J.N[i], {
        Z: J.Z[i], N: J.N[i], dm: J.dm[i], src: J.src[i], dmWS4: J.dmWS4[i], b2: J.b2[i], b4: J.b4[i],
        emic: J.emic[i], bf: J.bf[i], rch: J.rch[i],
      });
    }
    this.zToSym = Object.fromEntries(Object.entries(J.symbols).map(([z, s]) => [+z, s]));
    this.symToZ = Object.fromEntries(Object.entries(J.symbols).map(([z, s]) => [s, +z]));
  }
  get(Z, N) { return this.map.get(Z * 1000 + N); }
  has(Z, N) { return this.map.has(Z * 1000 + N); }
  /** Mass excess (MeV); AME2020 (measured or extrapolated) else FRDM2012, or WS4 in "ws4" mode. null if unbound/unknown. */
  massExcess(Z, N) {
    const r = this.get(Z, N);
    if (!r) return null;
    if (this.model === "ws4") return r.src >= 1 ? r.dm : (r.dmWS4 ?? r.dm);
    return r.dm;
  }
  /** Binding energy (MeV, positive). */
  binding(Z, N) {
    const d = this.massExcess(Z, N);
    return d === null ? null : Z * M_H + N * M_N - d;
  }
  /** Neutron separation energy S_n (MeV). */
  Sn(Z, N) {
    const a = this.binding(Z, N), b = this.binding(Z, N - 1);
    return a === null || b === null ? null : a - b;
  }
  Sp(Z, N) {
    const a = this.binding(Z, N), b = this.binding(Z - 1, N);
    return a === null || b === null ? null : a - b;
  }
  /** Ground-state Q value of the binary channel (Zp,Np)+(Zt,Nt) -> (Z1,N1)+(Z2,N2), MeV. */
  Qgg(Zp, Np, Zt, Nt, Z1, N1) {
    const Z2 = Zp + Zt - Z1, N2 = Np + Nt - N1;
    const a = this.massExcess(Zp, Np), b = this.massExcess(Zt, Nt), c = this.massExcess(Z1, N1), d = this.massExcess(Z2, N2);
    return [a, b, c, d].some((v) => v === null) ? null : a + b - c - d;
  }
  /** Nuclear mass (MeV). */
  mass(Z, N) { const d = this.massExcess(Z, N); return d === null ? null : (Z + N) * U_MEV + d; }
  label(Z, A) { return `${A}${this.zToSym[Z] ?? "?"}`; }
  /** "136Xe" -> {Z, A} */
  parse(s) {
    const m = /^(\d+)([A-Z][a-z]?)$/.exec(s.trim());
    if (!m) return null;
    const Z = this.symToZ[m[2]];
    return Z ? { Z, A: +m[1] } : null;
  }
}
