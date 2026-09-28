// Port of hic_core/nuclei.py: Woods-Saxon (2pF/3pF) with beta2/beta4 deformation, Hulthen deuteron,
// Gaussian He-3, point proton. PHOBOS TGlauberMC procedure (arXiv:1408.2549): sample r from 4 pi r^2 rho(r),
// reject a nucleon closer than d_min to an already placed one, recentre, rotate deformed nuclei.

export function resolve(D, name) { return D.aliases[name] ?? name; }
export function params(D, name) { return D.nuclei[resolve(D, name)]; }

const Y20 = (c) => Math.sqrt(5 / (16 * Math.PI)) * (3 * c * c - 1);
const Y40 = (c) => (3 / (16 * Math.sqrt(Math.PI))) * (35 * c ** 4 - 30 * c * c + 3);

export function woodsSaxon(r, cosT, R, a, w = 0, b2 = 0, b4 = 0) {
  const Rth = R * (1 + b2 * Y20(cosT) + b4 * Y40(cosT));
  return (1 + w * (r / R) ** 2) / (1 + Math.exp((r - Rth) / a));
}

function sampleWS(n, rng, R, a, w, b2, b4, dMin) {
  const rMax = R * (1 + Math.abs(b2) * 0.7 + Math.abs(b4) * 0.4) + 10 * a;
  let fMax = 0;
  for (let i = 0; i < 400; i++) {
    const r = (rMax * i) / 399;
    for (let j = 0; j < 41; j++) fMax = Math.max(fMax, r * r * woodsSaxon(r, -1 + j / 20, R, a, w, b2, b4));
  }
  fMax *= 1.05;
  const pos = new Float64Array(3 * n);
  const d2min = dMin * dMin;
  let k = 0, tries = 0;
  while (k < n) {
    if (++tries > 10000 * n * 64) throw new Error("nucleon placement failed; reduce d_min");
    const r = rng.uniform(0, rMax), c = rng.uniform(-1, 1), u = rng.uniform(0, fMax);
    if (u >= r * r * woodsSaxon(r, c, R, a, w, b2, b4)) continue;
    const phi = rng.uniform(0, 2 * Math.PI), s = Math.sqrt(1 - c * c);
    const x = r * s * Math.cos(phi), y = r * s * Math.sin(phi), z = r * c;
    let ok = true;
    if (dMin > 0) {
      for (let q = 0; q < k; q++) {
        const dx = pos[3 * q] - x, dy = pos[3 * q + 1] - y, dz = pos[3 * q + 2] - z;
        if (dx * dx + dy * dy + dz * dz < d2min) { ok = false; break; }
      }
    }
    if (!ok) continue;
    pos[3 * k] = x; pos[3 * k + 1] = y; pos[3 * k + 2] = z; k++;
  }
  return pos;
}

function randomRotation(rng) {
  let q = [rng.normal(), rng.normal(), rng.normal(), rng.normal()];
  const nq = Math.hypot(...q); q = q.map((v) => v / nq);
  const [w, x, y, z] = q;
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
    [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
    [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
  ];
}

export function orientationMatrix(o, rng) {
  if (o === "random") return randomRotation(rng);
  if (o == null || o === "fixed" || o === "tip-tip") return null;
  if (o === "body-body") return [[1, 0, 0], [0, 0, 1], [0, -1, 0]];
  if (o === "body-body-x") return [[0, 0, 1], [0, 1, 0], [-1, 0, 0]];
  throw new Error(`unknown orientation ${o}`);
}

/** Returns {pos: Float64Array(3A) fm (rest frame), isProton: Uint8Array(A), A}. */
export function sampleNucleus(D, name, rng, { dMin = 0.4, neutronSkin = true, orientation = "random" } = {}) {
  const P = params(D, name);
  const A = P.A, Z = P.Z;
  if (P.kind === "point") return { pos: new Float64Array(3), isProton: Uint8Array.of(1), A: 1 };
  if (P.kind === "hulthen") {
    const a = P.hulthen_a, b = P.hulthen_b;
    let fmax = 0;
    for (let i = 0; i < 2000; i++) { const r = (20 * i) / 1999; fmax = Math.max(fmax, (Math.exp(-a * r) - Math.exp(-b * r)) ** 2); }
    let r;
    for (;;) { r = rng.uniform(0, 20); if (rng.uniform(0, fmax) < (Math.exp(-a * r) - Math.exp(-b * r)) ** 2) break; }
    let v = [rng.normal(), rng.normal(), rng.normal()]; const nv = Math.hypot(...v); v = v.map((c) => c / nv);
    return { pos: Float64Array.of(0.5 * r * v[0], 0.5 * r * v[1], 0.5 * r * v[2], -0.5 * r * v[0], -0.5 * r * v[1], -0.5 * r * v[2]),
      isProton: Uint8Array.of(1, 0), A: 2 };
  }
  let pos, isProton = new Uint8Array(A);
  if (P.kind === "gauss_approx") {
    const sigma = P.rms_radius / Math.sqrt(3);
    pos = new Float64Array(3 * A);
    for (let i = 0; i < 3 * A; i++) pos[i] = rng.normal(0, sigma);
    shuffledProtons(isProton, Z, rng);
    recenter(pos, A);
    return { pos, isProton, A };
  }
  const w = P.w ?? 0, b2 = P.beta2 ?? 0, b4 = P.beta4 ?? 0;
  if (neutronSkin && P.proton && P.neutron) {
    const pp = sampleWS(Z, rng, P.proton.R, P.proton.a, w, b2, b4, dMin);
    const pn = sampleWS(A - Z, rng, P.neutron.R, P.neutron.a, w, b2, b4, dMin);
    pos = new Float64Array(3 * A); pos.set(pp, 0); pos.set(pn, 3 * Z);
    for (let i = 0; i < Z; i++) isProton[i] = 1;
  } else {
    pos = sampleWS(A, rng, P.R, P.a, w, b2, b4, dMin);
    shuffledProtons(isProton, Z, rng);
  }
  recenter(pos, A);
  if (b2 !== 0 || b4 !== 0) {
    const R = orientationMatrix(orientation, rng);
    if (R) {
      for (let i = 0; i < A; i++) {
        const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2];
        pos[3 * i] = R[0][0] * x + R[0][1] * y + R[0][2] * z;
        pos[3 * i + 1] = R[1][0] * x + R[1][1] * y + R[1][2] * z;
        pos[3 * i + 2] = R[2][0] * x + R[2][1] * y + R[2][2] * z;
      }
    }
  }
  return { pos, isProton, A };
}

function recenter(pos, A) {
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < A; i++) { cx += pos[3 * i]; cy += pos[3 * i + 1]; cz += pos[3 * i + 2]; }
  cx /= A; cy /= A; cz /= A;
  for (let i = 0; i < A; i++) { pos[3 * i] -= cx; pos[3 * i + 1] -= cy; pos[3 * i + 2] -= cz; }
}

function shuffledProtons(isProton, Z, rng) {
  for (let i = 0; i < Z; i++) isProton[i] = 1;
  for (let i = isProton.length - 1; i > 0; i--) {
    const j = Math.floor(rng.uniform() * (i + 1));
    const t = isProton[i]; isProton[i] = isProton[j]; isProton[j] = t;
  }
}
