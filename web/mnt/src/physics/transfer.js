// Nucleon exchange: master equation for the probability P(Z1, N1, t) of the projectile-like fragment, single-nucleon
// steps with detailed-balance rates  W(i -> j) = 2D / (1 + exp((U_j - U_i) / T))  (bounded "Glauber" form: same detailed
// balance W(i->j)/W(j->i) = exp(-(U_j-U_i)/T) and, for |dU| << T, the same drift -D dU/T as D exp(-dU/2T), whose
// continuum limit is the Fokker-Planck transport
// of Ayik et al., PRC 97 (2018) 054618; DNS form of Feng et al. PRC 80 (2009) 067601 and Zhu, Feng & Zhang,
// J. Phys. G 42 (2015) 085102). D = D0 F(s(t)) with the contact form factor F; D_ZZ = D_NN/2 (Ayik et al.).
// Driving potential U(Z1,N1) = M(Z1,N1) + M(Z2,N2) - M(P) - M(T) + [V_C + E_rot](contact) - same for the entrance channel,
// with the shell + pairing part of the masses (FRDM2012 microscopic energy E_mic of each fragment) damped with temperature
// by phi(T) = tau/sinh(tau), tau = 2 pi^2 T / hbar omega_0, hbar omega_0 = 41 A^(-1/3) MeV (Bohr & Mottelson, Nuclear
// Structure Vol. II; Ignatyuk et al. Sov. J. Nucl. Phys. 21 (1975) 255): shells matter in quasi-elastic transfer and wash
// out in damped collisions (T ~ 2 MeV).
import { HBARC, E2, proxCentral } from "./potential.js";
import { U as AMU } from "./trajectory.js";

export const DEFAULT_TRANSFER = {
  DNN0: 0.06,          // (fm/c)^-1, Ayik et al. 2018 order of magnitude (calibrated)
  ratioZ: 0.5,         // D_ZZ / D_NN
  Tmin: 0.7,           // MeV, floor of the temperature in the rates (cold quasi-elastic stage; model choice)
  dZ: 22, dN: 34,      // half-widths of the (Z1, N1) grid around the projectile
  neck: 1.0,           // fm added to C1 + C2 for the contact distance of the Coulomb/rotational terms
};

export class Transfer {
  constructor(nuc, P, T, opts = {}) {
    this.o = { ...DEFAULT_TRANSFER, ...opts };
    Object.assign(this, { nuc, P, T });
    this.Zp = P.Z; this.Np = P.A - P.Z; this.Zt = T.Z; this.Nt = T.A - T.Z;
    this.Ztot = P.Z + T.Z; this.Ntot = this.Np + this.Nt;
    const { dZ, dN } = this.o;
    this.nz = 2 * dZ + 1; this.nn = 2 * dN + 1; this.size = this.nz * this.nn;
    this.Z0 = this.Zp - dZ; this.N0 = this.Np - dN;
    this.Mp = nuc.massExcess(this.Zp, this.Np); this.Mt = nuc.massExcess(this.Zt, this.Nt);
    this.valid = new Uint8Array(this.size);
    this.Umass = new Float64Array(this.size).fill(Infinity);
    this.sh1 = new Float64Array(this.size); this.sh2 = new Float64Array(this.size);
    this.A1c = new Float64Array(this.size);
    const emic = (Z, N) => nuc.get(Z, N)?.emic ?? 0;
    this.shIn = emic(this.Zp, this.Np) + emic(this.Zt, this.Nt);
    this.Q = new Float64Array(this.size).fill(NaN);
    for (let i = 0; i < this.nz; i++) for (let j = 0; j < this.nn; j++) {
      const Z1 = this.Z0 + i, N1 = this.N0 + j, Z2 = this.Ztot - Z1, N2 = this.Ntot - N1, k = i * this.nn + j;
      if (Z1 < 1 || N1 < 1 || Z2 < 1 || N2 < 1) continue;
      const m1 = nuc.massExcess(Z1, N1), m2 = nuc.massExcess(Z2, N2);
      if (m1 === null || m2 === null) continue;
      this.valid[k] = 1;
      this.Q[k] = this.Mp + this.Mt - m1 - m2;                     // ground-state Q value
      const A1 = Z1 + N1, A2 = Z2 + N2, R = proxCentral(A1) + proxCentral(A2) + this.o.neck;
      this.Umass[k] = -this.Q[k] + (Z1 * Z2 * E2) / R;
      this.sh1[k] = emic(Z1, N1); this.sh2[k] = emic(Z2, N2); this.A1c[k] = A1;
    }
    this.kIn = this.idx(this.Zp, this.Np);
    this.P = new Float64Array(this.size); this.Pn = new Float64Array(this.size);
    this.rates = new Float64Array(4 * this.size);
  }
  idx(Z1, N1) { return (Z1 - this.Z0) * this.nn + (N1 - this.N0); }

  /** Driving potential for angular momentum l (hbar): mass + Coulomb + rotational energy (rigid dinuclear rotor). */
  setL(l) {
    const L2 = l * (l + 1) * HBARC * HBARC;
    this.U = new Float64Array(this.size).fill(Infinity);
    for (let i = 0; i < this.nz; i++) for (let j = 0; j < this.nn; j++) {
      const k = i * this.nn + j;
      if (!this.valid[k]) continue;
      const Z1 = this.Z0 + i, N1 = this.N0 + j, A1 = Z1 + N1, A2 = this.Ztot + this.Ntot - A1;
      const R = proxCentral(A1) + proxCentral(A2) + this.o.neck;
      const mu = (AMU * A1 * A2) / (A1 + A2);
      const Jrel = mu * R * R + 0.4 * AMU * (A1 * proxCentral(A1) ** 2 + A2 * proxCentral(A2) ** 2);   // sticking
      this.U[k] = this.Umass[k] + L2 / (2 * Jrel);
    }
    this.Ubase = Float64Array.from(this.U);
    this.applyShellDamping(0);
    this.P.fill(0); this.Pn.fill(0); this.P[this.kIn] = 1;
    this.lo = [this.idxZ(this.Zp), this.idxN(this.Np)]; this.hi = [...this.lo];
    this.T = -1; this.acc = new Float64Array(this.size); this.accW = 0; this._acc = 0; this._accF = 0;
  }
  /** phi(T) = tau / sinh(tau), tau = 2 pi^2 T / (41 A^-1/3) */
  static phi(T, A) { const tau = (2 * Math.PI * Math.PI * T) / (41 / Math.cbrt(A)); return tau < 1e-6 ? 1 : tau / Math.sinh(tau); }
  /** U(T): ground-state masses with the fragments' shell + pairing energies damped at temperature T. */
  applyShellDamping(T) {
    const Atot = this.Ztot + this.Ntot, phiIn1 = Transfer.phi(T, this.Zp + this.Np), phiIn2 = Transfer.phi(T, this.Zt + this.Nt);
    const eIn = this.nuc.get(this.Zp, this.Np)?.emic ?? 0, eIn2 = this.nuc.get(this.Zt, this.Nt)?.emic ?? 0;
    for (let k = 0; k < this.size; k++) {
      if (!isFinite(this.Ubase[k])) { this.U[k] = Infinity; continue; }
      const A1 = this.A1c[k], A2 = Atot - A1;
      // Ubase uses ground-state masses M = M_mac + E_mic; at temperature T the mass is M_mac + phi(T) E_mic
      this.U[k] = this.Ubase[k] - (1 - Transfer.phi(T, A1)) * this.sh1[k] - (1 - Transfer.phi(T, A2)) * this.sh2[k];
    }
    const u0 = this.Ubase[this.kIn] - (1 - phiIn1) * eIn - (1 - phiIn2) * eIn2;
    for (let k = 0; k < this.size; k++) this.U[k] -= u0;
    this.Tshell = T;
  }
  idxZ(Z) { return Z - this.Z0; } idxN(N) { return N - this.N0; }

  _updateRates(T) {
    if (Math.abs(T - (this.Tshell ?? -1)) > 0.05) this.applyShellDamping(T);
    const { nn, nz } = this, Te = Math.max(T, this.o.Tmin), R = this.rates;
    if (!this.Rtot) this.Rtot = new Float64Array(this.size);
    const DN = 1, DZ = this.o.ratioZ;
    const [i0, j0] = this.lo, [i1, j1] = this.hi;
    let rmax = 0;
    for (let i = Math.max(0, i0 - 2); i <= Math.min(nz - 1, i1 + 2); i++) for (let j = Math.max(0, j0 - 2); j <= Math.min(nn - 1, j1 + 2); j++) {
      const k = i * nn + j, u = this.U[k];
      if (!isFinite(u)) { R[4 * k] = R[4 * k + 1] = R[4 * k + 2] = R[4 * k + 3] = 0; this.Rtot[k] = 0; continue; }
      const f = (k2, D) => { const v = this.U[k2]; return isFinite(v) ? (2 * D) / (1 + Math.exp(Math.min(60, (v - u) / Te))) : 0; };
      const r0 = i + 1 < nz ? f(k + nn, DZ) : 0, r1 = i > 0 ? f(k - nn, DZ) : 0;       // Z1 +- 1
      const r2 = j + 1 < nn ? f(k + 1, DN) : 0, r3 = j > 0 ? f(k - 1, DN) : 0;          // N1 +- 1
      R[4 * k] = r0; R[4 * k + 1] = r1; R[4 * k + 2] = r2; R[4 * k + 3] = r3;
      const tot = r0 + r1 + r2 + r3; this.Rtot[k] = tot; if (tot > rmax) rmax = tot;
    }
    this.rmax = rmax;
    this.T = T;
  }

  /** Advance by dt (fm/c) with diffusion strength D = DNN0 * ff and temperature T (MeV). */
  step(dt, ff, T) {
    const D = this.o.DNN0 * ff;
    if (D * dt < 1e-7) return;
    if (this.T < 0 || Math.abs(T - this.T) > 0.03 * this.T + 0.02) this._updateRates(T);
    const { nn, nz, rates: R, Rtot } = this;
    const nsub = Math.max(1, Math.ceil((this.rmax * D * dt) / 0.5)), h = (D * dt) / nsub;
    const thr = 1e-13;
    for (let s = 0; s < nsub; s++) {
      let [i0, j0] = this.lo, [i1, j1] = this.hi;
      const P = this.P, Pn = this.Pn;
      const a0 = Math.max(0, i0 - 1), a1 = Math.min(nz - 1, i1 + 1), b0 = Math.max(0, j0 - 1), b1 = Math.min(nn - 1, j1 + 1);
      // gather: Pn = P - out + in, over the box grown by one cell (everything outside is zero in both arrays)
      for (let i = a0; i <= a1; i++) {
        const row = i * nn;
        for (let j = b0; j <= b1; j++) {
          const k = row + j;
          let v = P[k] * (1 - h * Rtot[k]);
          if (i > 0) v += h * R[4 * (k - nn)] * P[k - nn];           // from Z1-1 via +1
          if (i + 1 < nz) v += h * R[4 * (k + nn) + 1] * P[k + nn];  // from Z1+1 via -1
          if (j > 0) v += h * R[4 * (k - 1) + 2] * P[k - 1];         // from N1-1 via +1
          if (j + 1 < nn) v += h * R[4 * (k + 1) + 3] * P[k + 1];    // from N1+1 via -1
          Pn[k] = v;
        }
      }
      this.P = Pn; this.Pn = P;
      // grow the active box where probability arrived
      const Q = this.P;
      const rowHas = (i) => { for (let j = b0; j <= b1; j++) if (Q[i * nn + j] > thr) return true; return false; };
      const colHas = (j) => { for (let i = a0; i <= a1; i++) if (Q[i * nn + j] > thr) return true; return false; };
      if (a0 < i0 && rowHas(a0)) i0 = a0; if (a1 > i1 && rowHas(a1)) i1 = a1;
      if (b0 < j0 && colHas(b0)) j0 = b0; if (b1 > j1 && colHas(b1)) j1 = b1;
      if (i0 !== this.lo[0] || i1 !== this.hi[0] || j0 !== this.lo[1] || j1 !== this.hi[1]) {
        this.lo = [i0, j0]; this.hi = [i1, j1]; this._updateRates(this.T);
      }
    }
  }

  /** Accumulate trajectory steps and advance in chunks of ~2 fm/c with the form factor averaged over the chunk. */
  feed(dt, ff, T, chunk = 2) {
    this._acc = (this._acc ?? 0) + dt; this._accF = (this._accF ?? 0) + ff * dt; this._T = T;
    if (this._acc >= chunk) this.flushSteps();
  }
  flushSteps() {
    if (this._acc > 0) this.step(this._acc, this._accF / this._acc, this._T);
    this._acc = 0; this._accF = 0;
  }

  /** Add w * P(t) to the accumulated exit distribution. */
  exit(w) {
    this.flushSteps();
    const { nn } = this, [i0, j0] = this.lo, [i1, j1] = this.hi;
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) this.acc[i * nn + j] += w * this.P[i * nn + j];
    this.accW += w;
  }

  /** Mean and variances of (Z1, N1) of the current distribution. */
  moments(P = this.P) {
    let s = 0, mz = 0, mn = 0, vz = 0, vn = 0;
    for (let k = 0; k < this.size; k++) {
      if (!P[k]) continue;
      const Z1 = this.Z0 + Math.floor(k / this.nn), N1 = this.N0 + (k % this.nn);
      s += P[k]; mz += P[k] * Z1; mn += P[k] * N1; vz += P[k] * Z1 * Z1; vn += P[k] * N1 * N1;
    }
    mz /= s; mn /= s;
    return { norm: s, Z1: mz, N1: mn, varZ: vz / s - mz * mz, varN: vn / s - mn * mn };
  }
}
