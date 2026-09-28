// TRENTo reduced thickness (Moreland, Bernhard, Bass PRC 92 (2015) 011901), port of
// fireball.trento_reduced_thickness: Gaussian participant nucleons of width w with Gamma(k, 1/k) weights,
// T_R = ((T_A^p + T_B^p)/2)^(1/p), p = 0 -> sqrt(T_A T_B). Grid index = i*n + j with i along x, j along y.

export function makeGrid(L = 16, n = 96) {
  const dx = (2 * L) / n;
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = (i + 0.5) * dx - L;
  return { L, n, dx, x };
}

/** Fluctuation weights, one per nucleon, fixed for a given nucleus sample (so changing b keeps them). */
export function nucleonWeights(A, k, rng) {
  const w = new Float64Array(A);
  for (let i = 0; i < A; i++) w[i] = rng.gamma(k, 1 / k);
  return w;
}

function addThickness(T, grid, xs, ys, wts, w) {
  const { n, dx, x, L } = grid;
  const inv2w2 = 1 / (2 * w * w), norm = 1 / (2 * Math.PI * w * w);
  const cut = 6 * w;                      // exp(-18) truncation, far below the float precision of the sum
  const ex = new Float64Array(n);
  for (let p = 0; p < xs.length; p++) {
    const x0 = xs[p], y0 = ys[p], g = wts[p] * norm;
    const i0 = Math.max(0, Math.floor((x0 - cut + L) / dx)), i1 = Math.min(n - 1, Math.ceil((x0 + cut + L) / dx));
    const j0 = Math.max(0, Math.floor((y0 - cut + L) / dx)), j1 = Math.min(n - 1, Math.ceil((y0 + cut + L) / dx));
    for (let j = j0; j <= j1; j++) { const d = x[j] - y0; ex[j] = Math.exp(-d * d * inv2w2); }
    for (let i = i0; i <= i1; i++) {
      const d = x[i] - x0, gi = g * Math.exp(-d * d * inv2w2), row = i * n;
      for (let j = j0; j <= j1; j++) T[row + j] += gi * ex[j];
    }
  }
}

/**
 * Reduced thickness for the participants of a collision.
 * nuc: {A: sampleNucleus result, B: ...}, col: collide() result, wA/wB: nucleon weights.
 */
export function reducedThickness(grid, nucA, nucB, col, wA, wB, { p = 0, w = 0.96 } = {}) {
  const n = grid.n, b = col.b;
  const TA = new Float64Array(n * n), TB = new Float64Array(n * n);
  const pick = (nuc, ncoll, wts, shift) => {
    const xs = [], ys = [], ws = [];
    for (let i = 0; i < nuc.A; i++) if (ncoll[i] > 0) { xs.push(nuc.pos[3 * i] + shift); ys.push(nuc.pos[3 * i + 1]); ws.push(wts[i]); }
    return [xs, ys, ws];
  };
  addThickness(TA, grid, ...pick(nucA, col.ncollA, wA, -b / 2), w);
  addThickness(TB, grid, ...pick(nucB, col.ncollB, wB, +b / 2), w);
  const TR = new Float64Array(n * n);
  if (Math.abs(p) < 1e-6) for (let i = 0; i < n * n; i++) TR[i] = Math.sqrt(TA[i] * TB[i]);
  else for (let i = 0; i < n * n; i++) { const v = ((TA[i] ** p + TB[i] ** p) / 2) ** (1 / p); TR[i] = Number.isFinite(v) ? v : 0; }
  return TR;
}

export function integral(grid, F) {
  let s = 0;
  for (let i = 0; i < F.length; i++) s += F[i];
  return s * grid.dx * grid.dx;
}
