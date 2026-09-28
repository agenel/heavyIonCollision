// Classical trajectory with surface friction (Gross & Kalinowski, Phys. Rep. 45 (1978) 175, in the form of
// Abe & Bouriquet, Acta Phys. Pol. B 34 (2003) 1927):
//   dr/dt = p/mu,  dp/dt = -dV/dr + L^2/(mu r^3) - K_r(r) dr/dt,  dtheta/dt = L/(mu r^2),
//   dL/dt = -(K_phi(r)/mu) (L - L_st),  K_r = K_r0 (dV_N/dr)^2,  K_phi = K_phi0 (dV_N/dr)^2 (1 + x),
// rolling limit L_st = L0 x/(1+x) with x = (5/2) (r/(C1+C2))^2 for rigid spheres (sticking optional).
// Elongation d of the dinuclear system relaxes toward the scission elongation with tau_d (Li et al. J. Phys. G 32
// (2006) 1143: deformation relaxation ~4 zs), weighted by the quasi-fission propensity g(x_m) of the mean fissility
// (du Rietz et al. PRC 88 (2013) 054618); the scission elongation is set by Viola systematics TKE = 0.755 Z1Z2/(A1^1/3+A2^1/3)
// + 7.3 MeV (Viola, Kwiatkowski, Walker PRC 31 (1985) 1550) times the calibrated factor fV. See docs/mnt/PLAN.md §3.
// Units: fm, fm/c, MeV (c = 1); L in MeV fm (= l * hbar c).
import { Potential, E2, HBARC } from "./potential.js";

export const U = 931.49410242;
export const FMC_PER_ZS = 299.792458;           // 1 zs = 1e-21 s = 299.79 fm/c
export const FMC_PER_S = 2.99792458e23;

export const DEFAULT_TRAJ = {
  potential: "prox77",   // Prox 77 has the pocket systematics right (pocket for Ca+Pb, none for Xe+Pb, U+Cm)
  Kr0: 1.0e-23,          // s/MeV (calibrated; Gross-Kalinowski 4e-23 with Prox77)
  Kphi0: 0.01e-23,       // s/MeV (Gross-Kalinowski)
  limit: "rolling",      // or "sticking"
  tauD_zs: 4.0,          // elongation relaxation time (zs)
  fV: 1.0,               // scale of the Viola scission elongation (calibrated)
  xQF: 0.79, wQF: 0.02,  // quasi-fission propensity g(x_m) = logistic((x_m - xQF)/wQF) (du Rietz 2013 onset; calibrated)
  sC: 2.0,               // surface separation below which the nuclei are "in contact" (fm), transfer onset (Saiko-Karpov)
  aC: 0.6,               // diffuseness of the contact form factor (fm)
  r0: 60,                // start/stop radius (fm)
  tMax_zs: 15,           // dinuclear systems still together after this time count as captured (long-lived quasi-fission
                         // goes to mass-symmetric splits, far from the transfer channels)
};

/** Mean fissility x_m = 0.75 x_eff + 0.25 x_CN (du Rietz et al. 2013; Świątecki). */
export function meanFissility(P, T) {
  const Z = P.Z + T.Z, A = P.A + T.A, I = (A - 2 * Z) / A;
  const xz = 50.883 * (1 - 1.7826 * I * I);
  const a1 = Math.cbrt(P.A), a2 = Math.cbrt(T.A);
  const xeff = (4 * P.Z * T.Z) / (a1 * a2 * (a1 + a2)) / xz;
  const xcn = (Z * Z) / A / xz;
  return 0.75 * xeff + 0.25 * xcn;
}

export class Collision {
  constructor(P, T, Ecm, opts = {}) {
    this.o = { ...DEFAULT_TRAJ, ...opts };
    Object.assign(this, { P, T, Ecm });
    this.pot = new Potential(P, T, this.o.potential, { dR1: this.o.dR1 ?? 0, dR2: this.o.dR2 ?? 0 });
    this.mu = (U * P.A * T.A) / (P.A + T.A);
    const m1 = U * P.A, m2 = U * T.A, C1 = this.pot.C1, C2 = this.pot.C2;
    this.J = 0.4 * (m1 * C1 * C1 + m2 * C2 * C2);                     // rigid spheres, MeV fm^2
    this.Kr0 = this.o.Kr0 * FMC_PER_S;                                // (fm/c)/MeV
    this.Kphi0 = this.o.Kphi0 * FMC_PER_S;
    this.xm = meanFissility(P, T);
    this.gQF = 1 / (1 + Math.exp(-(this.xm - this.o.xQF) / this.o.wQF));
    const rsc = (E2 * (Math.cbrt(P.A) + Math.cbrt(T.A))) / 0.755;     // Viola scission distance (centres)
    this.dSc = Math.max(0.5, rsc - (C1 + C2));                        // elongation at which the neck breaks
    this.pot.dSc = this.dSc;
    this.dEq = Math.min(this.dSc, this.o.fV * this.gQF * this.dSc);   // elongation the dinuclear system relaxes toward
    this.tauD = this.o.tauD_zs * FMC_PER_ZS;
    this.k = 2 * this.mu * Ecm / (HBARC * HBARC);                     // k^2 (fm^-2)
    this.lGrazing = this.grazingL();
  }

  contactFF(s) { return 1 / (1 + Math.exp((s - this.o.sC) / this.o.aC)); }

  deriv(y, L0) {
    const [r, p, , L, d] = y, mu = this.mu, pot = this.pot;
    const g = pot.dVN(r, d), Psi = g * g;
    const rdot = p / mu;
    const dV = g + pot.dVC(r);
    const x = 2.5 * ((r - d) / (pot.C1 + pot.C2)) ** 2;
    const Lst = this.o.limit === "sticking" ? (L0 * mu * r * r) / (mu * r * r + this.J) : (L0 * x) / (1 + x);
    const s = pot.s(r, d);
    return [
      rdot,
      -dV + (L * L) / (mu * r ** 3) - this.Kr0 * Psi * rdot,
      L / (mu * r * r),
      -((this.Kphi0 * Psi * (1 + x)) / mu) * (L - Lst),
      (this.contactFF(s) * (this.dEq - d)) / this.tauD,
    ];
  }

  energy(y, L0) {
    const [r, p, , L, d] = y;
    const Erel = (p * p) / (2 * this.mu) + (L * L) / (2 * this.mu * r * r) + this.pot.V(r, d);
    const Espin = ((L0 - L) ** 2) / (2 * this.J);
    return { Erel, Espin, Ediss: this.Ecm - Erel - Espin };
  }

  /** Angle swept on a repulsive Coulomb orbit from infinity to radius r (energy E, angular momentum L). */
  coulombTail(E, L, r) {
    const k = this.pot.ZZ, mu = this.mu;
    if (L <= 0) return 0;
    const eps = Math.sqrt(1 + (2 * E * L * L) / (mu * k * k)), pl = (L * L) / (mu * k);
    const c = Math.min(1, (pl / r + 1) / eps);
    return Math.acos(1 / eps) - Math.acos(c);
  }

  /** Outer barrier of V_eff = V(r', d) + L^2/(2 mu r'^2) for r' > r: {Vtop, rTop} or null if V_eff falls monotonically. */
  outerBarrier(r, d, L) {
    const mu = this.mu, Veff = (x) => this.pot.V(x, d) + (L * L) / (2 * mu * x * x);
    let best = -Infinity, rb = r;
    for (let x = r; x < r + 10; x += 0.1) { const v = Veff(x); if (v > best) { best = v; rb = x; } }
    return rb > r + 0.15 && rb < r + 9.9 ? { Vtop: best, rTop: rb } : null;
  }

  /**
   * Kramers quasi-fission decay rate (per fm/c) over a barrier Bqf at temperature T (DNS form, Zhu, Feng & Zhang
   * J. Phys. G 42 (2015) 085102: Gamma = 2.8 MeV, hbar omega_B = 2.0 MeV, hbar omega = 3.0 MeV).
   */
  kramers(Bqf, T) {
    const G = 2.8, wB = 2.0, w = 3.0;
    const pre = (w / (2 * Math.PI * wB)) * (Math.sqrt((G / 2) ** 2 + wB * wB) - G / 2) / HBARC;
    return pre * Math.exp(-Math.max(Bqf, 0) / Math.max(T, 0.3));
  }

  /**
   * Integrate one partial wave. The trajectory runs classically; whenever the dinuclear system is trapped behind the
   * outer barrier of its effective potential it decays with the Kramers rate. Returns the exit channels
   * {w, t, theta, TKEL, Ediss, Lf} (weights sum to 1 - P_capture), the contact time and an optional history.
   */
  run(l, { history = false, onStep = null } = {}) {
    const L0 = l * HBARC, mu = this.mu, r0 = this.o.r0;
    const Vin = this.pot.VC(r0) + (L0 * L0) / (2 * mu * r0 * r0);
    const res = { l, exits: [], pCapture: 0, tContact: 0, minS: Infinity, hist: history ? [] : null };
    if (this.Ecm <= Vin) return this._rutherford(res, L0);
    let y = [r0, -Math.sqrt(2 * mu * (this.Ecm - Vin)), 0, L0, 0];
    let t = 0, swept = 0, hLast = -1e9, surv = 1, nextCheck = 0, trap = null;
    const tMax = this.o.tMax_zs * FMC_PER_ZS, aLev = (this.P.A + this.T.A) / 12;
    const tailIn = this.coulombTail(this.Ecm, L0, r0);
    const rk = (yy, h) => {
      const k1 = this.deriv(yy, L0);
      const k2 = this.deriv(yy.map((v, i) => v + 0.5 * h * k1[i]), L0);
      const k3 = this.deriv(yy.map((v, i) => v + 0.5 * h * k2[i]), L0);
      const k4 = this.deriv(yy.map((v, i) => v + h * k3[i]), L0);
      return yy.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    };
    let turned = false;
    for (;;) {
      const s = this.pot.s(y[0], y[4]);
      const h = s > 12 ? 2.0 : s > 5 ? 1.0 : 0.5;
      const yn = rk(y, h);
      t += h; swept += yn[2] - y[2];
      const sn = this.pot.s(yn[0], yn[4]);
      res.minS = Math.min(res.minS, sn);
      const ff = this.contactFF(sn);
      res.tContact += ff * h * surv;                          // mean contact time of the surviving system
      if (yn[1] > 0) turned = true;
      y = yn;
      // trapped? (energy of relative motion below the outer barrier of the effective potential)
      if (sn < this.o.sC + 1 && t >= nextCheck) {
        nextCheck = t + 4;
        const e = this.energy(y, L0);
        const ob = this.outerBarrier(y[0], y[4], y[3]);
        const since = trap?.since;
        trap = ob && e.Erel < ob.Vtop ? { ...ob, Ediss: e.Ediss, Espin: e.Espin, since } : null;
        // first capture: the fraction 1 - g(x_m) of the captured flux fuses (compound nucleus), the rest stays a
        // dinuclear system that decays by quasi-fission (mean-fissility systematics, du Rietz et al. 2013)
        if (trap && !res.fused) { res.fused = true; res.pCapture += surv * (1 - this.gQF); surv *= this.gQF; }
      }
      if (trap && surv > 0) {
        const T = Math.sqrt(Math.max(trap.Ediss, 0) / aLev);
        const Bqf = trap.Vtop - this.energy(y, L0).Erel;
        const lam = this.kramers(Bqf, T);
        const dP = surv * (1 - Math.exp(-lam * h));
        // deep in a pocket: the escape probability over the remaining time is negligible -> capture (fusion)
        trap.since = trap.since ?? t;
        if (t - trap.since > 300 && surv * lam * (tMax - t) < 1e-3) { res.pCapture += surv; surv = 0; }
        if (dP > 0) {
          // leaves over the barrier top with zero radial speed: TKE (at infinity) = V_top
          const Lf = y[3], TKE = trap.Vtop, Ediss = this.Ecm - TKE - ((L0 - Lf) ** 2) / (2 * this.J);
          const tailOut = this.coulombTail(TKE, Lf, trap.rTop);
          this._addExit(res, dP, t, Math.PI - (tailIn + swept + tailOut), this.Ecm - TKE, Ediss, Lf / HBARC);
          surv -= dP;
        }
      }
      if (onStep) onStep(t, y, ff, h, surv);
      if (history && t - hLast >= 4) { hLast = t; const e = this.energy(y, L0); res.hist.push([t, y[0], y[2], y[4], e.Ediss, y[3] / HBARC, ff, surv]); }
      if (turned && y[0] >= r0) break;
      if (surv < 1e-3 || t > tMax) break;
    }
    res.t = t;
    if (surv < 1e-3) res.pCapture += Math.max(surv, 0);           // captured (fusion) or fully decayed
    else if (turned && y[0] >= r0 && surv > 0) {
      const e = this.energy(y, L0), TKEL = Math.max(0, e.Ediss + e.Espin);
      const tailOut = this.coulombTail(this.Ecm - TKEL, y[3], r0);
      this._addExit(res, surv, t, Math.PI - (tailIn + swept + tailOut), TKEL, Math.max(0, e.Ediss), y[3] / HBARC);
    } else if (surv >= 1e-3) res.pCapture += surv;
    this._summarise(res);
    return res;
  }

  _addExit(res, w, t, theta, TKEL, Ediss, Lf) {
    const e = { w, t, theta, TKEL, Ediss, Lf };
    res.exits.push(e);
    if (this.onExit) this.onExit(e);
  }

  /** Probability-weighted means over the exit channels. */
  _summarise(res) {
    const W = res.exits.reduce((a, e) => a + e.w, 0);
    res.pExit = W;
    const m = (f) => (W > 0 ? res.exits.reduce((a, e) => a + e.w * f(e), 0) / W : NaN);
    res.theta = m((e) => e.theta); res.TKEL = m((e) => e.TKEL); res.Ediss = m((e) => e.Ediss); res.Lf = m((e) => e.Lf);
    res.tExit = m((e) => e.t);
    res.captured = res.pCapture > 0.5;
  }

  _rutherford(res, L0) {
    const k = this.pot.ZZ, eps = Math.sqrt(1 + (2 * this.Ecm * L0 * L0) / (this.mu * k * k));
    res.rutherford = true; res.t = 0;
    this._addExit(res, 1, 0, 2 * Math.asin(1 / eps), 0, 0, L0 / HBARC);
    this._summarise(res);
    return res;
  }

  /** Grazing angular momentum: largest l whose frictionless orbit reaches the contact separation sC. */
  grazingL() {
    let lo = 0, hi = Math.ceil(Math.sqrt(this.k) * (this.pot.C1 + this.pot.C2 + 10)) + 50;
    const reaches = (l) => {
      const L = l * HBARC;
      for (let r = 40; r > this.pot.C1 + this.pot.C2 - 2; r -= 0.05) {
        if (this.pot.V(r) + (L * L) / (2 * this.mu * r * r) > this.Ecm) return false;
        if (this.pot.s(r) <= this.o.sC) return true;
      }
      return true;
    };
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (reaches(m)) lo = m; else hi = m; }
    return lo;
  }
}
