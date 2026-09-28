// Custom nuclei (any mass number A) and the optical-Glauber centrality they need.
// - Radius R = 1.12 A^(1/3) - 0.86 A^(-1/3) fm, diffuseness a = 0.54 fm, spherical Woods-Saxon
//   (the parametrisation quoted in Miller, Reygers, Sanders, Steinberg, Ann. Rev. Nucl. Part. Sci. 57 (2007) 205,
//   nucl-ex/0701025, for nuclei without a measured charge density).
// - Z on the valley of beta stability, Z = A / (1.98 + 0.0155 A^(2/3)) (semi-empirical mass formula).
// - Centrality c(b) from the optical Glauber model: P_inel(b) = 1 - (1 - sigma T_AB(b)/(A B))^(A B)
//   (same review, eq. 5); c(b) = int_0^b P 2 pi b' db' / sigma_inel. Checked against the Monte Carlo curve for
//   Pb-Pb in web/test/physics.test.mjs.
import { sigmaNN } from "./glauber.js";

export function customNucleus(A) {
  const R = 1.12 * Math.cbrt(A) - 0.86 / Math.cbrt(A);
  const Z = Math.round(A / (1.98 + 0.0155 * A ** (2 / 3)));
  return { A, Z, kind: "ws", R, a: 0.54, w: 0, beta2: 0, beta4: 0,
    source: "R = 1.12 A^1/3 - 0.86 A^-1/3 fm, a = 0.54 fm (Miller et al. 2007); Z from the stability line" };
}

/** Register a custom nucleus "X<A>" in D.nuclei (idempotent); returns its name. */
export function ensureCustom(D, A) {
  const name = `X${A}`;
  if (!D.nuclei[name]) D.nuclei[name] = customNucleus(A);
  return name;
}

/** Nuclear thickness T(s) (fm^-2) on a radial grid, normalised to A. */
function thicknessTable(P, ds = 0.1) {
  const rMax = P.R + 10 * P.a, n = Math.ceil(rMax / ds) + 2;
  const T = new Float64Array(n);
  const dz = 0.05, nz = Math.ceil(rMax / dz);
  for (let i = 0; i < n; i++) {
    const s = i * ds; let sum = 0;
    for (let k = 0; k < nz; k++) { const z = (k + 0.5) * dz, r = Math.hypot(s, z); sum += 1 / (1 + Math.exp((r - P.R) / P.a)); }
    T[i] = 2 * sum * dz;
  }
  // normalise: int T 2 pi s ds = A
  let norm = 0;
  for (let i = 0; i < n; i++) norm += T[i] * 2 * Math.PI * (i * ds) * ds;
  for (let i = 0; i < n; i++) T[i] *= P.A / norm;
  return { T, ds, rMax };
}
function tAt(tab, s) {
  const x = s / tab.ds, i = Math.floor(x);
  if (i >= tab.T.length - 1) return 0;
  return tab.T[i] + (x - i) * (tab.T[i + 1] - tab.T[i]);
}

/** Optical-Glauber centrality curve {b: [], c: []} for nuclei PA, PB at sqrt(s_NN). */
export function opticalCofB(D, PA, PB, sqrtS, db = 0.25) {
  const sig = sigmaNN(D, sqrtS) * 0.1;                    // fm^2
  const tA = thicknessTable(PA), tB = thicknessTable(PB);
  const bMax = PA.R + PB.R + 12 * Math.max(PA.a, PB.a) + 6;
  const h = 0.25, L = Math.max(tA.rMax, 1);
  const AB = PA.A * PB.A;
  const bs = [], P = [];
  for (let b = 0; b <= bMax + 1e-9; b += db) {
    let TAB = 0;
    for (let x = -L; x <= L; x += h) for (let y = -L; y <= L; y += h) {
      const ta = tAt(tA, Math.hypot(x, y)); if (ta === 0) continue;
      TAB += ta * tAt(tB, Math.hypot(x - b, y));
    }
    TAB *= h * h;
    bs.push(+b.toFixed(3)); P.push(1 - Math.pow(Math.max(1 - (sig * TAB) / AB, 0), AB));
  }
  const cum = [0];
  for (let i = 1; i < bs.length; i++) cum.push(cum[i - 1] + 0.5 * (P[i] * bs[i] + P[i - 1] * bs[i - 1]) * 2 * Math.PI * db);
  const tot = cum[cum.length - 1];
  return { b: bs, c: cum.map((v) => (100 * v) / tot), sigma_b: tot / 100 };
}
