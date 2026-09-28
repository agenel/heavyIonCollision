// Model-versus-data comparison for EXFOR datasets (shared by the page and scripts/mnt_validate.mjs).
// Metric: theory-evaluation factor tef = log10(sigma_model / sigma_exp) per data point (Barrett et al. PRC 91 (2015)
// 064615 use the same metric), summarised per dataset.
import { ecmFromElab } from "./model.js";

/** Centre-of-mass energies (MeV) at which a dataset is evaluated, with weights. Thick targets: average over the range
 * (entrance energy down to the lower end, or to the Coulomb barrier when only the entrance energy is known). */
export function datasetEnergies(ds, barrier) {
  const [Zp, Ap] = ds.projectile, [Zt, At] = ds.target;
  const P = { Z: Zp, A: Ap }, T = { Z: Zt, A: At };
  const cm = (Elab) => ecmFromElab(P, T, Elab);
  let E = ds.E;
  if (E == null) return [];
  if (ds.E_kind?.endsWith("_per_u")) E *= Ap;
  const kind = ds.E_kind?.replace("_per_u", "");
  if (kind === "cm") return [{ Ecm: E, w: 1 }];
  if (ds.E_range) {
    const [a, b] = ds.E_range.map(cm);
    return [0.25, 0.5, 0.75].map((f) => ({ Ecm: a + f * (b - a), w: 1 / 3 }));
  }
  if (kind === "lab_max" && ds.thick_target) {
    const top = cm(E), bottom = Math.max(barrier ?? 0.9 * top, 0.8 * top);
    return [0.2, 0.5, 0.8].map((f) => ({ Ecm: bottom + f * (top - bottom), w: 1 / 3 }));
  }
  return [{ Ecm: cm(E), w: 1 }];
}

/** Model sigma (mb) for a data point: final (post-evaporation) products; Z-only or A-only data are summed. */
export function modelSigma(final, Z, A, product) {
  if (product === "ZA") return final.get(Z * 1000 + A) ?? 0;
  let s = 0;
  for (const [k, v] of final) {
    const z = Math.floor(k / 1000), a = k % 1000;
    if ((product === "Z" && z === Z) || (product === "A" && a === A)) s += v;
  }
  return s;
}

export const FLOOR_MB = 1e-7;

/** Detector windows for datasets that are integrated over a lab-angle range of the projectile-like fragment. */
export const WINDOWS = { D0799: [24, 34], D8119: [16, 28] };
export function windowFor(ds) { return WINDOWS[ds.entry] ?? null; }

/**
 * Is a measured product inside the model's reach? The master equation covers |dZ| <= 22 and |dN| <= 34 around the
 * projectile or target, and evaporation removes up to ~20 more neutrons; fission fragments of heavy products and
 * mass-symmetric quasi-fission fragments are not modelled. Element- or mass-only data are always compared.
 */
export function inScope(ds, Z, A) {
  if (ds.product !== "ZA") return true;
  const near = (Z0, A0) => Math.abs(Z - Z0) <= 22 && A - Z - (A0 - Z0) <= 34 && A - Z - (A0 - Z0) >= -54;
  return near(ds.projectile[0], ds.projectile[1]) || near(ds.target[0], ds.target[1]);
}

/** Compare one dataset with the (energy-averaged) model final distribution. */
export function compareDataset(ds, final) {
  const pts = [], out = [];
  for (const [Z, A, s, e] of ds.points) {
    if (!(s > 0)) continue;
    const m = modelSigma(final, Z, A, ds.product);
    const p = { Z, A, data: s, err: e, model: m, tef: Math.log10(Math.max(m, FLOOR_MB) / s) };
    (inScope(ds, Z, A) ? pts : out).push(p);
  }
  const t = pts.map((p) => p.tef), n = t.length;
  const mean = n ? t.reduce((a, b) => a + b, 0) / n : NaN;
  const sd = n > 1 ? Math.sqrt(t.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
  const rms = n ? Math.sqrt(t.reduce((a, b) => a + b * b, 0) / n) : NaN;
  return { id: ds.id, n, mean, sd, rms, within3: t.filter((x) => Math.abs(x) < Math.log10(3)).length,
    within10: t.filter((x) => Math.abs(x) < 1).length, points: pts, outside: out };
}

/** Datasets usable for comparison: absolute cross sections with an energy, no upper limits; independent yields are
 * preferred over cumulative ones from the same entry. */
export function usableSets(sets) {
  const hasInd = new Set(sets.filter((s) => s.modifier !== "CUM").map((s) => s.entry + ":" + s.E));
  return sets.filter((s) => s.E != null && !s.upper_limits && s.points.length > 0 && s.target[1] > 0 &&
    !(s.product === "A" && s.points.length === 1) &&                 // single 'A > A_min' sums (quasi-fission tails)
    (s.modifier !== "CUM" || !hasInd.has(s.entry + ":" + s.E)));
}
