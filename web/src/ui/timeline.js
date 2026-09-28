// Time axis: lab time t (fm/c) <-> scrubber position u in [0, 1]. The approach is compressed, the first 2 fm/c
// (impact, pre-equilibrium, hottest QGP) get room, the rest is linear.
export const T_APPROACH = 40;
const SEG = [[-T_APPROACH, 0, 0.0, 0.2], [0, 2, 0.2, 0.42]];

export class TimeAxis {
  constructor(tEnd = 20) { this.setEnd(tEnd); }
  setEnd(tEnd) { this.tEnd = Math.max(tEnd, 4); this.seg = [...SEG, [2, this.tEnd, 0.42, 1]]; }
  tOf(u) {
    for (const [t0, t1, u0, u1] of this.seg) if (u <= u1) return t0 + ((Math.max(u, u0) - u0) / (u1 - u0)) * (t1 - t0);
    return this.tEnd;
  }
  uOf(t) {
    for (const [t0, t1, u0, u1] of this.seg) if (t <= t1) return u0 + ((Math.max(t, t0) - t0) / (t1 - t0)) * (u1 - u0);
    return 1;
  }
}

export function fmtTime(t) {
  const sec = Math.abs(t) * 3.33564e-24;
  const e = Math.floor(Math.log10(sec || 1e-30)), m = sec / 10 ** e;
  const sup = String(e).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  return { fm: `t = ${t < 0 ? "−" : ""}${Math.abs(t).toFixed(Math.abs(t) < 10 ? 2 : 1)} fm/c`, s: t === 0 ? "0 s" : `${t < 0 ? "−" : ""}${m.toFixed(1)}×10${sup} s` };
}
