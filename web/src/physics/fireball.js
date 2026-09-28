// Port of hic_core/fireball.py (Level-A fireball): boost-invariant, entropy-conserving transverse expansion
// with a prescribed flow field, d(tau s gamma)/dtau + div(tau s gamma v) = 0, first-order upwind + diffusion D.
// Identical scheme and constants; the per-cell angular factors are precomputed (same values, fewer trig calls).

export class Fireball {
  /**
   * o: {s0 (Float64Array n*n, fm^-3 at tau_0), grid {n, L, dx, x}, eos, sigma_eta, y_beam, beta_T, n_prof, T_kin,
   *     flow_gain, a_n {2,3,4}, psi_n {2,3,4}, tau_0, tau_acc (central Pb-Pb reference, 2.5), dS_deta}
   */
  constructor(o) {
    Object.assign(this, { tau_0: 0.4, tau_acc_ref: 2.5, flow_gain: 1, a_n: { 2: 0, 3: 0, 4: 0 } }, o);
    if (o.tau_acc !== undefined) this.tau_acc_ref = o.tau_acc;
    const { n, x } = this.grid;
    this.n = n; this.dx = this.grid.dx; this.T_c = this.eos.Tc;
    const N = n * n;
    this.r = new Float64Array(N); this.rn = new Float64Array(N);
    this.ux = new Float64Array(N); this.uy = new Float64Array(N);
    this.c2 = new Float64Array(N); this.s2 = new Float64Array(N); this.c3 = new Float64Array(N); this.s3 = new Float64Array(N);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const k = i * n + j, X = x[i], Y = x[j], r = Math.hypot(X, Y), ph = Math.atan2(Y, X);
      this.r[k] = r; this.rn[k] = r ** this.n_prof;
      this.ux[k] = r > 0 ? X / r : 0; this.uy[k] = r > 0 ? Y / r : 0;
      this.c2[k] = Math.cos(2 * ph); this.s2[k] = Math.sin(2 * ph); this.c3[k] = Math.cos(3 * ph); this.s3[k] = Math.sin(3 * ph);
    }
    this.beta_s = Math.min(((this.beta_T * (2 + this.n_prof)) / 2) * this.flow_gain, 0.97);
    // flow-rapidity modulation 1 + 2 sum a_n cos n(phi - Psi_n), clipped to [0.05, 3]; static per cell
    this.hasMod = [2, 3, 4].some((k) => (this.a_n[k] ?? 0) !== 0);
    this.mod = new Float64Array(N).fill(1);
    if (this.hasMod) {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const ph = Math.atan2(x[j], x[i]);
        let m = 1;
        for (const k of [2, 3, 4]) m += 2 * (this.a_n[k] ?? 0) * Math.cos(k * (ph - this.psi_n[k]));
        this.mod[i * n + j] = Math.min(Math.max(m, 0.05), 3);
      }
    }
    this.R_0 = this.edgeRadius(this.s0);
    [this.ecc_0, this.psi_0] = this.fieldEcc(this.s0);
    this.tau_acc = this.tau_acc_ref * Math.max(this.R_0 / 6.5, 0.2) ** 1.5;
    this.snap = null;
  }

  f_eta(eta) { return Math.abs(eta) < this.y_beam ? Math.exp(-(eta * eta) / (2 * this.sigma_eta ** 2)) : 0; }
  v_s(tau) { return this.beta_s * Math.tanh(Math.max(tau - this.tau_0, 0) / this.tau_acc); }

  edgeRadius(s) {
    let tot = 0, rn = 0;
    for (let k = 0; k < s.length; k++) { tot += s[k]; rn += s[k] * this.rn[k]; }
    if (tot <= 0) return this.R_0;
    return ((rn / tot) * (2 + this.n_prof) / 2) ** (1 / this.n_prof);
  }

  /** eps_2, eps_3 and Psi_2, Psi_3 of the field about its centroid (r^n weighting); z^n = r^n e^{i n phi}. */
  fieldEcc(s) {
    const { n, x } = this.grid;
    let tot = 0, cx = 0, cy = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = s[i * n + j]; tot += v; cx += v * x[i]; cy += v * x[j]; }
    if (tot <= 0) return [[0, 0], [0, 0]];
    cx /= tot; cy /= tot;
    let c2 = 0, s2 = 0, r2 = 0, c3 = 0, s3 = 0, r3 = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - cx;
      for (let j = 0; j < n; j++) {
        const v = s[i * n + j];
        if (v === 0) continue;
        const dy = x[j] - cy, rr = dx * dx + dy * dy;
        const a2 = dx * dx - dy * dy, b2 = 2 * dx * dy;
        c2 += v * a2; s2 += v * b2; r2 += v * rr;
        c3 += v * (a2 * dx - b2 * dy); s3 += v * (a2 * dy + b2 * dx); r3 += v * rr * Math.sqrt(rr);
      }
    }
    return [[Math.hypot(c2, s2) / Math.max(r2, 1e-300), Math.hypot(c3, s3) / Math.max(r3, 1e-300)],
      [(Math.atan2(s2, c2) + Math.PI) / 2, (Math.atan2(s3, c3) + Math.PI) / 3]];
  }

  /** Flow field at proper time tau into vx, vy (Float64Array) given R and field eccentricity. */
  velocity(tau, R, ecc, vx, vy) {
    const [[e2, e3], [p2, p3]] = ecc;
    const C2 = Math.cos(2 * p2), S2 = Math.sin(2 * p2), C3 = Math.cos(3 * p3), S3 = Math.sin(3 * p3);
    const vs = this.v_s(tau), np = this.n_prof;
    for (let k = 0; k < vx.length; k++) {
      const Rphi = R * (1 - 0.5 * e2 * (this.c2[k] * C2 + this.s2[k] * S2) - 0.5 * e3 * (this.c3[k] * C3 + this.s3[k] * S3));
      let v = vs * Math.min(this.r[k] / Rphi, 1) ** np;
      if (this.hasMod && v > 0) v = Math.tanh(Math.atanh(Math.min(v, 0.99)) * this.mod[k]);
      vx[k] = v * this.ux[k]; vy[k] = v * this.uy[k];
    }
  }

  /**
   * Evolve to tau_end with step dtau (Python default 0.02 fm/c), snapshots every snapEvery.
   * stopBelowT: stop early once the hottest cell is below this temperature (live display only).
   * Returns a generator so callers can time-slice; call .run() for a blocking evolution.
   */
  *evolveSteps({ tau_end = 25, dtau = 0.02, snapEvery = 0.1, diffusion = 0.15, stopBelowT = 0, stepsPerYield = 50 } = {}) {
    const n = this.n, dx = this.dx, N = n * n;
    this.diffusion = diffusion;
    const vx = new Float64Array(N), vy = new Float64Array(N), gam = new Float64Array(N);
    const q = new Float64Array(N), dq = new Float64Array(N), sNow = new Float64Array(N);
    let R = this.R_0, ecc = [this.ecc_0, this.psi_0];
    this.velocity(this.tau_0, R, ecc, vx, vy);
    for (let k = 0; k < N; k++) { gam[k] = 1 / Math.sqrt(1 - vx[k] ** 2 - vy[k] ** 2); q[k] = this.tau_0 * this.s0[k] * gam[k]; }
    let tau = this.tau_0, nextSnap = this.tau_0, step = 0;
    dtau = Math.min(dtau, (0.9 * dx) / Math.max(this.beta_s, 1e-3));
    const snap = { tau: [], s: [], R: [], eps: [], psi: [] };
    this.snap = snap;
    while (tau <= tau_end + 1e-9) {
      for (let k = 0; k < N; k++) sNow[k] = q[k] / (tau * gam[k]);
      R = this.edgeRadius(sNow); ecc = this.fieldEcc(sNow);
      this.velocity(tau, R, ecc, vx, vy);
      for (let k = 0; k < N; k++) gam[k] = 1 / Math.sqrt(1 - vx[k] * vx[k] - vy[k] * vy[k]);
      if (tau >= nextSnap - 1e-9) {
        snap.tau.push(tau); snap.s.push(Float32Array.from(sNow)); snap.R.push(R); snap.eps.push(ecc[0]); snap.psi.push(ecc[1]);
        nextSnap += snapEvery;
        if (stopBelowT > 0) {
          let smax = 0; for (let k = 0; k < N; k++) if (sNow[k] > smax) smax = sNow[k];
          if (this.eos.T_of_s(smax * this.f_eta(0)) < stopBelowT) break;
        }
      }
      dq.fill(0);
      for (let i = 0; i < n - 1; i++) for (let j = 0; j < n; j++) {      // x faces
        const a = i * n + j, b = a + n, f = 0.5 * (vx[a] + vx[b]);
        const F = f > 0 ? q[a] * f : q[b] * f;
        dq[a] -= F; dq[b] += F;
      }
      for (let i = 0; i < n; i++) for (let j = 0; j < n - 1; j++) {      // y faces
        const a = i * n + j, b = a + 1, f = 0.5 * (vy[a] + vy[b]);
        const F = f > 0 ? q[a] * f : q[b] * f;
        dq[a] -= F; dq[b] += F;
      }
      if (diffusion > 0) {
        const c = (diffusion * dx) / (dx * dx);
        for (let i = 1; i < n - 1; i++) for (let j = 1; j < n - 1; j++) {
          const k = i * n + j;
          dq[k] += c * (q[k + n] + q[k - n] + q[k + 1] + q[k - 1] - 4 * q[k]);
        }
      }
      for (let k = 0; k < N; k++) q[k] += (dtau * dq[k]) / dx;
      for (let i = 0; i < n; i++) { q[i] = 0; q[(n - 1) * n + i] = 0; q[i * n] = 0; q[i * n + n - 1] = 0; }
      tau += dtau;
      if (++step % stepsPerYield === 0) yield tau;
    }
    return this;
  }
  run(opts) { const g = this.evolveSteps(opts); while (!g.next().done); return this; }

  // ------------------------------------------------------------------ queries
  _bracket(tau) {
    const T = this.snap.tau;
    let lo = 0, hi = T.length - 1;
    if (tau >= T[hi]) return [hi, hi, 0];
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= tau) lo = m; else hi = m; }
    return [lo, hi, (tau - T[lo]) / (T[hi] - T[lo])];
  }
  /** Transverse entropy density at eta_s = 0 (fm^-3) into out. */
  s2d(tau, out = new Float64Array(this.n * this.n)) {
    const S = this.snap.s, T = this.snap.tau;
    if (tau <= this.tau_0) { const f = this.tau_0 / Math.max(tau, 0.05); for (let k = 0; k < out.length; k++) out[k] = this.s0[k] * f; return out; }
    if (tau >= T[T.length - 1]) { const f = T[T.length - 1] / tau, s = S[S.length - 1]; for (let k = 0; k < out.length; k++) out[k] = s[k] * f; return out; }
    const [a, b, w] = this._bracket(tau);
    for (let k = 0; k < out.length; k++) out[k] = (1 - w) * S[a][k] + w * S[b][k];
    return out;
  }
  radius(tau) {
    if (!this.snap || tau <= this.tau_0) return this.R_0;
    const [a, b, w] = this._bracket(tau); return (1 - w) * this.snap.R[a] + w * this.snap.R[b];
  }
  eccAt(tau) {
    if (!this.snap || tau <= this.tau_0) return [this.ecc_0, this.psi_0];
    const [a, b, w] = this._bracket(tau), E = this.snap.eps, P = this.snap.psi;
    const eps = [0, 1].map((i) => (1 - w) * E[a][i] + w * E[b][i]);
    const psi = [2, 3].map((m, i) => Math.atan2((1 - w) * Math.sin(m * P[a][i]) + w * Math.sin(m * P[b][i]),
      (1 - w) * Math.cos(m * P[a][i]) + w * Math.cos(m * P[b][i])) / m);
    return [eps, psi];
  }
  T_max(tau) {
    const s = this.s2d(tau); let m = 0;
    for (let k = 0; k < s.length; k++) if (s[k] > m) m = s[k];
    return this.eos.T_of_s(m);
  }
  hotFraction(tau, T_thr = this.T_c) {
    const s = this.s2d(tau); let tot = 0, hot = 0;
    for (let k = 0; k < s.length; k++) { tot += s[k]; if (this.eos.T_of_s(s[k]) > T_thr) hot += s[k]; }
    return tot > 0 ? hot / tot : 0;
  }
  qgpEnd(frac = 0.1) {
    for (const t of this.snap.tau) if (this.hotFraction(t) < frac) return t;
    return this.snap.tau[this.snap.tau.length - 1];
  }
}
