// numpy.interp semantics: clamps to the end values outside [xs[0], xs[n-1]]; xs ascending.
export function interp(x, xs, ys) {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (xs[m] <= x) lo = m; else hi = m; }
  const w = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] + w * (ys[hi] - ys[lo]);
}

/** freezeout._interp_cent: interpolation in centrality, optionally of log(y). */
export function interpCent(xs, ys, c, log = true) {
  if (log) return Math.exp(interp(c, xs, ys.map((y) => Math.log(Math.max(y, 1e-12)))));
  return interp(c, xs, ys);
}

export const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
