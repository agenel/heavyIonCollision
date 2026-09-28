// Seeded random numbers: xoshiro128** core, Box-Muller normals, Marsaglia-Tsang gamma.
// The streams differ from numpy's PCG64, so JS and Python agree statistically, not event by event.

export class RNG {
  constructor(seed = 1) {
    // splitmix32 to expand the seed into 128 bits of state
    let s = seed >>> 0;
    const next = () => {
      s = (s + 0x9e3779b9) >>> 0;
      let z = s;
      z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
      z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
      return (z ^ (z >>> 16)) >>> 0;
    };
    this.a = next(); this.b = next(); this.c = next(); this.d = next();
    this._spare = null;
  }
  u32() {
    const r = Math.imul(rotl(Math.imul(this.b, 5), 7), 9) >>> 0;
    const t = this.b << 9;
    this.c ^= this.a; this.d ^= this.b; this.b ^= this.c; this.a ^= this.d;
    this.c ^= t; this.d = rotl(this.d, 11);
    return r;
  }
  /** uniform in [0, 1) with 53-bit resolution */
  uniform(lo = 0, hi = 1) {
    const x = (this.u32() >>> 5) * 67108864 + (this.u32() >>> 6);
    return lo + (hi - lo) * (x / 9007199254740992);
  }
  normal(mu = 0, sigma = 1) {
    if (this._spare !== null) { const v = this._spare; this._spare = null; return mu + sigma * v; }
    let u, v, s;
    do { u = 2 * this.uniform() - 1; v = 2 * this.uniform() - 1; s = u * u + v * v; } while (s >= 1 || s === 0);
    const f = Math.sqrt(-2 * Math.log(s) / s);
    this._spare = v * f;
    return mu + sigma * u * f;
  }
  /** Gamma(shape k, scale theta) — Marsaglia & Tsang (2000); boost for k < 1 */
  gamma(k, theta = 1) {
    if (k < 1) return this.gamma(k + 1, theta) * Math.pow(this.uniform(), 1 / k);
    const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
      let x, v;
      do { x = this.normal(); v = 1 + c * x; } while (v <= 0);
      v = v * v * v;
      const u = this.uniform();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v * theta;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * theta;
    }
  }
}

function rotl(x, k) { return ((x << k) | (x >>> (32 - k))) >>> 0; }
