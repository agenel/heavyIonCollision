// Calibration and validation of the multi-nucleon-transfer model against EXFOR data.
//
//   node scripts/mnt_validate.mjs                 # validate with the parameters in web/mnt/data/calibration.json
//   node scripts/mnt_validate.mjs --calibrate     # grid-search the global parameters on the TRAINING datasets, then validate
//   node scripts/mnt_validate.mjs --only C2178    # restrict to datasets whose id starts with a prefix
//
// Writes web/mnt/data/calibration.json (with --calibrate), web/mnt/data/validation.json and docs/mnt/validation.md.
// Training datasets are used for the fit only; every other usable dataset is a held-out test.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Nuclides } from "../web/mnt/src/physics/nuclides.js";
import { MNTModel, DEFAULTS } from "../web/mnt/src/physics/model.js";
import { Potential } from "../web/mnt/src/physics/potential.js";
import { datasetEnergies, compareDataset, usableSets, windowFor } from "../web/mnt/src/physics/compare.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const J = (p) => JSON.parse(readFileSync(join(ROOT, p)));
const nuc = new Nuclides(J("web/mnt/data/nuclides.json"));
const X = J("web/mnt/data/exfor.json");
const model = new MNTModel(nuc);
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

// fit set: one heavy damped system and the three best absolute near-barrier datasets (docs/mnt/PLAN.md §6)
export const TRAIN = ["C2178.002.2", "D0816.004.0", "D0843.003.0", "D0845.003.0@249"];
const CAL_PATH = "web/mnt/data/calibration.json";

const cache = new Map();
function runAt(P, T, Ecm, params) {
  const key = `${P.Z},${P.A},${T.Z},${T.A},${Ecm.toFixed(2)},${JSON.stringify(params)}`;
  if (!cache.has(key)) cache.set(key, model.run(P, T, Ecm, params).final);
  return cache.get(key);
}

function evaluate(ds, params) {
  const [Zp, Ap] = ds.projectile, [Zt, At] = ds.target;
  const P = { Z: Zp, A: Ap }, T = { Z: Zt, A: At };
  const B = new Potential(P, T, "bass80").barrier()?.B;
  const Es = datasetEnergies(ds, B);
  if (!Es.length) return null;
  const final = new Map();
  const win = windowFor(ds);
  for (const { Ecm, w } of Es) {
    for (const [k, v] of runAt(P, T, Ecm, win ? { ...params, window: win } : params)) final.set(k, (final.get(k) ?? 0) + w * v);
  }
  return { ...compareDataset(ds, final), Ecm: Es.map((e) => e.Ecm) };
}

function objective(params) {
  const r = TRAIN.map((id) => evaluate(X.sets.find((s) => s.id === id), params));
  return { score: r.reduce((a, x) => a + x.rms, 0) / r.length, parts: r.map((x) => `${x.id} rms ${x.rms.toFixed(2)} mean ${x.mean.toFixed(2)}`) };
}

let params = existsSync(join(ROOT, CAL_PATH)) ? J(CAL_PATH).params : {};
// first pass (2026-09-26): Kr0 {0.5,1,2}e-23 x DNN0 {0.06,0.12,0.25} x sC {2,3} x aC {0.6,0.9} x Tmin {0.7,1.5,2.5} -> best at
// Tmin = 2.5 (edge), DNN0 = 0.06 (edge), Kr0 = 2e-23 (edge), sC = 2, aC = 0.6; the second pass refines around it
const GRID = process.env.MNT_GRID ? JSON.parse(process.env.MNT_GRID)
  : { Kr0: [1e-23, 2e-23, 4e-23], DNN0: [0.03, 0.06], sC: [1.5, 2.0], aC: [0.6], Tmin: [2.5, 3.5, 5.0] };
function* combos(grid) {
  const keys = Object.keys(grid), idx = keys.map(() => 0);
  for (;;) {
    yield Object.fromEntries(keys.map((k, i) => [k, grid[k][idx[i]]]));
    let i = 0;
    while (i < keys.length && ++idx[i] >= grid[keys[i]].length) { idx[i] = 0; i++; }
    if (i === keys.length) return;
  }
}
// --part i/n: evaluate every n-th grid point (for parallel runs), print JSON lines and exit
if (args.includes("--part")) {
  const [i, n] = args[args.indexOf("--part") + 1].split("/").map(Number);
  let k = 0;
  for (const p of combos(GRID)) {
    if (k++ % n !== i) continue;
    const o = objective(p); cache.clear();
    console.log(JSON.stringify({ params: p, score: o.score, parts: o.parts }));
  }
  process.exit(0);
}
// --collect FILE: take the best grid point from the JSON lines of the parallel parts and write calibration.json
if (args.includes("--collect")) {
  const lines = readFileSync(args[args.indexOf("--collect") + 1], "utf8").split("\n").filter((l) => l.startsWith("{")).map((l) => JSON.parse(l));
  const best = lines.reduce((a, b) => (b.score < a.score ? b : a));
  params = best.params;
  writeFileSync(join(ROOT, CAL_PATH), JSON.stringify({ params, score: best.score, train: TRAIN, grid: GRID, evaluated: lines.length,
    parts: best.parts, note: "Global parameters fitted by scripts/mnt_calibrate.sh (grid search; minimum mean rms of log10(model/data) over the training datasets). Not tuned per system.",
    date: new Date().toISOString().slice(0, 10) }, null, 1));
  console.log(`best of ${lines.length}: ${best.score.toFixed(3)} ${JSON.stringify(params)}\n  ${best.parts.join("\n  ")}`);
  const sorted = [...lines].sort((a, b) => a.score - b.score).slice(0, 8);
  for (const l of sorted) console.log(`  ${l.score.toFixed(3)} ${JSON.stringify(l.params)}`);
}

// ------------------------------------------------------------------ validation of every usable dataset
const sets = usableSets(X.sets).filter((s) => !only || s.id.startsWith(only));
const rows = [];
for (const ds of sets) {
  const t0 = Date.now();
  const r = evaluate(ds, params);
  if (!r || !r.n) continue;
  rows.push({ ...r, train: TRAIN.includes(ds.id), system: `${ds.projectile[1]}${nuc.zToSym[ds.projectile[0]]}+${ds.target[1]}${nuc.zToSym[ds.target[0]]}`,
    E: ds.E, E_kind: ds.E_kind, product: ds.product, modifier: ds.modifier, ref: ds.ref, note: ds.note, ms: Date.now() - t0 });
  const x = rows[rows.length - 1];
  console.log(`${x.train ? "TRAIN" : "test "} ${x.id.padEnd(18)} ${x.system.padEnd(14)} n ${String(x.n).padStart(4)}${x.outside.length ? ` (+${x.outside.length} out)` : ""}  mean ${x.mean.toFixed(2).padStart(6)}  sd ${x.sd.toFixed(2)}  x3 ${x.within3}/${x.n}  x10 ${x.within10}/${x.n}  (${x.ms} ms)`);
}
const agg = (rs) => {
  const t = rs.flatMap((r) => r.points.map((p) => p.tef));
  const m = t.reduce((a, b) => a + b, 0) / t.length;
  return { n: t.length, mean: m, sd: Math.sqrt(t.reduce((a, b) => a + (b - m) ** 2, 0) / t.length),
    x3: t.filter((v) => Math.abs(v) < Math.log10(3)).length / t.length, x10: t.filter((v) => Math.abs(v) < 1).length / t.length };
};
const A = agg(rows.filter((r) => r.train)), B = agg(rows.filter((r) => !r.train));
console.log(`\nTRAIN ${A.n} points: mean tef ${A.mean.toFixed(2)} sd ${A.sd.toFixed(2)} within x3 ${(100 * A.x3).toFixed(0)}% x10 ${(100 * A.x10).toFixed(0)}%`);
console.log(`TEST  ${B.n} points: mean tef ${B.mean.toFixed(2)} sd ${B.sd.toFixed(2)} within x3 ${(100 * B.x3).toFixed(0)}% x10 ${(100 * B.x10).toFixed(0)}%`);

if (!only) {
  writeFileSync(join(ROOT, "web/mnt/data/validation.json"), JSON.stringify({ params, train: TRAIN, summary: { train: A, test: B },
    rows: rows.map(({ points, outside, ...r }) => ({ ...r, nOutside: outside.length, points: points.map((p) => [p.Z, p.A, p.data, p.model, +p.tef.toFixed(3)]) })) }));
  const md = [
    "# Validation of the multi-nucleon-transfer model", "",
    "Generated by `node scripts/mnt_validate.mjs`. Metric: tef = log10(σ_model/σ_exp) per measured nuclide (final, post-evaporation",
    "products; element- or mass-only data are compared with the model summed over the other variable). Training datasets were",
    "used to fit the global parameters; all others are held-out tests. Thick-target data are averaged over the energy range.", "",
    `Parameters: \`${JSON.stringify({ ...params })}\` (other defaults in \`web/mnt/src/physics/*.js\`).`, "",
    `| | points | mean tef | spread | within ×3 | within ×10 |`, `|---|---|---|---|---|---|`,
    `| training | ${A.n} | ${A.mean.toFixed(2)} | ${A.sd.toFixed(2)} | ${(100 * A.x3).toFixed(0)} % | ${(100 * A.x10).toFixed(0)} % |`,
    `| held-out | ${B.n} | ${B.mean.toFixed(2)} | ${B.sd.toFixed(2)} | ${(100 * B.x3).toFixed(0)} % | ${(100 * B.x10).toFixed(0)} % |`, "",
    "| dataset | system | E | set | n (outside) | mean tef | spread | ×3 | ×10 | reference / note |", "|---|---|---|---|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.id} | ${r.system} | ${r.E} ${r.E_kind} | ${r.train ? "train" : "test"} | ${r.n}${r.outside.length ? ` (${r.outside.length})` : ""} | ${r.mean.toFixed(2)} | ${r.sd.toFixed(2)} | ${r.within3} | ${r.within10} | ${r.ref} ${r.note} |`),
    "", "Outside: measured products the model cannot make (fission fragments, mass-symmetric quasi-fission fragments beyond",
    "|ΔZ| = 22 from projectile and target); listed but not counted.",
    "", "Reading: mean tef = −1 means the model is 10× below the data on average; spread is the standard deviation over nuclides.",
    "Published models reach |tef| ≲ 0.3–0.7 near the target and fail by orders of magnitude far from it (Barrett et al. 2015).",
  ].join("\n");
  writeFileSync(join(ROOT, "docs/mnt/validation.md"), md + "\n");
  console.log("wrote docs/mnt/validation.md and web/mnt/data/validation.json");
}
