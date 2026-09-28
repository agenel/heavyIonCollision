// 2D cards: orbit map (the classic impact-parameter sketch, computed), nuclide chart, deflection / Wilczyński / data plots.
const AMBER = "#ffb14a", ICE = "#7cc4ff", RED = "#ff7a66", MUTED = "#8d97a9", TEXT = "#e6eaf1", GREY = "#5b6476", LINE = "rgba(150,172,205,0.2)";
const font = (px, w = 400, fam = "IBM Plex Mono") => `${w} ${px}px "${fam}", ui-monospace, monospace`;
const DEG = 180 / Math.PI;

export function outcome(w, sC = 2) {
  if (w.pCapture > 0.5) return "captured";
  if (!(w.minS < sC + 1.5)) return "rutherford";
  return w.TKEL > 15 ? "dic" : "qe";
}
const OUT_COL = { rutherford: GREY, qe: ICE, dic: AMBER, captured: RED };

// ------------------------------------------------------------------ orbit map
export class OrbitMap {
  constructor(canvas, onPick) {
    this.c = canvas; this.ctx = canvas.getContext("2d"); this.W = canvas.width; this.H = canvas.height;
    let drag = false;
    const pick = (e) => {
      if (!this.k) return;
      const r = canvas.getBoundingClientRect(), y = ((e.clientY - r.top) / r.height) * this.H;
      const b = Math.max(0, (this.cy - y) / this.s);
      onPick(Math.round(b * this.k));
    };
    canvas.addEventListener("pointerdown", (e) => { drag = true; canvas.setPointerCapture(e.pointerId); pick(e); });
    canvas.addEventListener("pointermove", (e) => drag && pick(e));
    canvas.addEventListener("pointerup", () => (drag = false));
  }
  /** sys: {orbits, waves, k, col, P, T}; l: selected; labels: {P, T} */
  draw(sys, l, labels) {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    if (!sys) return;
    this.k = sys.k;
    const bMax = (sys.waves[sys.waves.length - 1]?.l ?? 1) / sys.k;
    const span = Math.max(bMax * 1.35, 25);
    this.s = (H - 30) / (2 * span) * 1.55; const s = this.s;
    this.cx = W * 0.52; this.cy = H * 0.62;
    const X = (x) => this.cx + x * s, Y = (y) => this.cy - y * s;
    // beam axis
    ctx.strokeStyle = "rgba(255,177,74,0.55)"; ctx.setLineDash([10, 7]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(W, Y(0)); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
    // target nucleus with the touching distance
    const Rt = sys.col.C2, Rc = sys.col.C1 + sys.col.C2;
    const g = ctx.createRadialGradient(X(0), Y(0), 0, X(0), Y(0), Rt * s * 1.2);
    g.addColorStop(0, "rgba(124,196,255,0.9)"); g.addColorStop(0.8, "rgba(124,196,255,0.55)"); g.addColorStop(1, "rgba(124,196,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(0), Y(0), Rt * s * 1.2, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = "rgba(255,122,102,0.35)"; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(X(0), Y(0), Rc * s, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    // orbits
    const drawOrbit = (o, w, hi) => {
      const kind = outcome(w, 2);
      ctx.strokeStyle = OUT_COL[kind]; ctx.globalAlpha = hi ? 1 : 0.45; ctx.lineWidth = hi ? 2.6 : 1;
      ctx.beginPath();
      const b = o.l / sys.k;
      ctx.moveTo(X(-span * 2), Y(b));
      let last = null, lastPhi = 0;
      for (const [r, sw, surv] of o.path) {
        const phi = Math.PI - o.tailIn - sw;
        const x = r * Math.cos(phi), y = r * Math.sin(phi);
        ctx.lineTo(X(x), Y(y)); last = [x, y]; lastPhi = phi;
        if (kind === "captured" && surv < 0.5) break;
      }
      if (last && kind !== "captured" && isFinite(o.theta)) {
        ctx.lineTo(X(last[0] + 60 * Math.cos(o.theta)), Y(last[1] + 60 * Math.sin(o.theta)));
      }
      ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 1;
    };
    const sel = sys.orbits.reduce((a, o) => (Math.abs(o.l - l) < Math.abs(a.l - l) ? o : a), sys.orbits[0]);
    sys.orbits.forEach((o, i) => { if (o !== sel) drawOrbit(o, sys.waves[i], false); });
    drawOrbit(sel, sys.waves[sys.orbits.indexOf(sel)], true);
    // projectile at the start of the selected orbit + b arrow
    const b = sel.l / sys.k;
    const xs = 18;
    ctx.strokeStyle = "#ff8b6b"; ctx.fillStyle = "#ff8b6b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xs, Y(0)); ctx.lineTo(xs, Y(b)); ctx.stroke(); ctx.lineWidth = 1;
    ctx.font = font(22, 600, "IBM Plex Sans"); ctx.fillText("b", xs + 6, (Y(0) + Y(b)) / 2 + 7);
    const Rp = sys.col.C1;
    const gp = ctx.createRadialGradient(X(-span * 1.05), Y(b), 0, X(-span * 1.05), Y(b), Rp * s * 1.2);
    gp.addColorStop(0, "rgba(255,177,74,0.95)"); gp.addColorStop(1, "rgba(255,177,74,0)");
    ctx.fillStyle = gp; ctx.beginPath(); ctx.arc(X(-span * 1.05), Y(b), Rp * s * 1.2, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = AMBER; ctx.font = font(19); ctx.fillText(labels.P, X(-span * 1.05) - 20, Y(b) - Rp * s - 8);
    ctx.fillStyle = ICE; ctx.fillText(labels.T, X(0) - 26, Y(0) + Rt * s + 26);
    // scale bar
    ctx.strokeStyle = MUTED; ctx.fillStyle = MUTED; ctx.font = font(17);
    ctx.beginPath(); ctx.moveTo(W - 20 - 10 * s, H - 14); ctx.lineTo(W - 20, H - 14); ctx.stroke();
    ctx.fillText("10 fm", W - 20 - 10 * s, H - 20);
    return { b, kind: outcome(sys.waves[sys.orbits.indexOf(sel)]) };
  }
}

// ------------------------------------------------------------------ nuclide chart
const MAGIC = [8, 20, 28, 50, 82, 126];
function heat(u) {            // u in [0,1] -> colour (dark violet -> amber -> white), perceptually ordered
  const stops = [[0, [40, 24, 72]], [0.3, [120, 40, 110]], [0.55, [214, 76, 80]], [0.78, [255, 170, 70]], [1, [255, 245, 215]]];
  u = Math.max(0, Math.min(1, u));
  for (let i = 1; i < stops.length; i++) if (u <= stops[i][0]) {
    const [a, ca] = stops[i - 1], [b, cb] = stops[i], f = (u - a) / (b - a);
    return `rgb(${ca.map((v, k) => Math.round(v + f * (cb[k] - v))).join(",")})`;
  }
  return "rgb(255,245,215)";
}
export const LOGMIN = -6, LOGMAX = 3;
export function heatLegend() { return Array.from({ length: 10 }, (_, i) => heat(i / 9)); }

export class NuclideChart {
  constructor(canvas, tip) {
    this.c = canvas; this.ctx = canvas.getContext("2d"); this.W = canvas.width; this.H = canvas.height; this.tip = tip;
    canvas.addEventListener("pointermove", (e) => this.hover(e));
    canvas.addEventListener("pointerleave", () => (tip.hidden = true));
  }
  /** sys result, nuc table, stage 'final'|'primary', data: [{Z, A, data, err, model, tef, set}] */
  draw(sys, nuc, stage, data) {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    if (!sys) return;
    this.sys = sys; this.nuc = nuc; this.stage = stage; this.data = data;
    const map = new Map(sys[stage]);
    this.map = map; this.other = new Map(sys[stage === "final" ? "primary" : "final"]);
    let zmin = 1e9, zmax = 0, nmin = 1e9, nmax = 0;
    for (const [k, v] of map) { if (v < 10 ** LOGMIN) continue; const Z = Math.floor(k / 1000), N = (k % 1000) - Z; zmin = Math.min(zmin, Z); zmax = Math.max(zmax, Z); nmin = Math.min(nmin, N); nmax = Math.max(nmax, N); }
    for (const d of data) { zmin = Math.min(zmin, d.Z); zmax = Math.max(zmax, d.Z); nmin = Math.min(nmin, d.A - d.Z); nmax = Math.max(nmax, d.A - d.Z); }
    zmin -= 2; zmax += 2; nmin -= 3; nmax += 3;
    const padL = 44, padB = 34, padT = 10, padR = 10;
    const cw = Math.min((W - padL - padR) / (nmax - nmin + 1), (H - padB - padT) / (zmax - zmin + 1));
    this.g = { zmin, zmax, nmin, nmax, cw, padL, padT, H, padB };
    const X = (N) => padL + (N - nmin) * cw, Y = (Z) => H - padB - (Z - zmin + 1) * cw;
    // bound nuclides (table) and measured masses as background
    for (let Z = zmin; Z <= zmax; Z++) for (let N = nmin; N <= nmax; N++) {
      const r = nuc.get(Z, N); if (!r) continue;
      ctx.fillStyle = r.src === 2 ? "rgba(150,172,205,0.13)" : "rgba(150,172,205,0.05)";
      ctx.fillRect(X(N), Y(Z), cw - 0.5, cw - 0.5);
    }
    // model cross sections
    for (const [k, v] of map) {
      if (v < 10 ** LOGMIN) continue;
      const Z = Math.floor(k / 1000), N = (k % 1000) - Z;
      ctx.fillStyle = heat((Math.log10(v) - LOGMIN) / (LOGMAX - LOGMIN));
      ctx.fillRect(X(N), Y(Z), cw - 0.5, cw - 0.5);
    }
    // magic numbers
    ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.setLineDash([4, 4]);
    for (const m of MAGIC) {
      if (m >= nmin && m <= nmax) { ctx.beginPath(); ctx.moveTo(X(m) + cw / 2, padT); ctx.lineTo(X(m) + cw / 2, H - padB); ctx.stroke(); }
      if (m >= zmin && m <= zmax) { ctx.beginPath(); ctx.moveTo(padL, Y(m) + cw / 2); ctx.lineTo(W - padR, Y(m) + cw / 2); ctx.stroke(); }
    }
    ctx.setLineDash([]);
    // measured points (rings coloured by model/data)
    for (const d of data) {
      const t = d.tef, col = !isFinite(t) ? MUTED : Math.abs(t) < Math.log10(3) ? "#7fd6a4" : t > 0 ? "#ff8b7b" : "#7cb4ff";
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.2, cw * 0.18);
      ctx.beginPath(); ctx.arc(X(d.A - d.Z) + cw / 2, Y(d.Z) + cw / 2, Math.max(2, cw * 0.42), 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.lineWidth = 1;
    // projectile and target marks
    for (const [n, c] of [[sys.P, AMBER], [sys.T, ICE]]) {
      ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.strokeRect(X(n.A - n.Z) - 1, Y(n.Z) - 1, cw + 1, cw + 1); ctx.lineWidth = 1;
    }
    // axes
    ctx.fillStyle = MUTED; ctx.font = font(15);
    const stepN = cw < 6 ? 20 : 10;
    for (let N = Math.ceil(nmin / stepN) * stepN; N <= nmax; N += stepN) ctx.fillText(String(N), X(N) - 6, H - padB + 18);
    for (let Z = Math.ceil(zmin / 10) * 10; Z <= zmax; Z += 10) ctx.fillText(String(Z), 8, Y(Z) + cw);
    ctx.fillText("N →", W - 46, H - 6); ctx.fillText("Z", 10, padT + 12);
  }
  hover(e) {
    if (!this.g) return;
    const r = this.c.getBoundingClientRect(), sx = this.W / r.width, x = (e.clientX - r.left) * sx, y = (e.clientY - r.top) * sx;
    const { nmin, zmin, cw, padL, H, padB } = this.g;
    const N = Math.floor((x - padL) / cw) + nmin, Z = Math.floor((H - padB - y) / cw) + zmin;
    const A = Z + N, key = Z * 1000 + A;
    const m = this.map.get(key), o = this.other.get(key);
    const d = this.data.filter((q) => q.Z === Z && q.A === A);
    if (!m && !d.length) { this.tip.hidden = true; return; }
    const f = (v) => (v == null ? "–" : v < 1e-3 ? v.toExponential(1) : v.toPrecision(2));
    const lines = [`<b>${A}${this.nuc.zToSym[Z] ?? "?"}</b> (Z ${Z}, N ${N})`,
      `model ${this.stage === "final" ? "final" : "primary"}: ${f(m)} mb`, `model ${this.stage === "final" ? "primary" : "final"}: ${f(o)} mb`];
    for (const q of d) lines.push(`data ${f(q.data)}${q.err ? " ± " + f(q.err) : ""} mb <span style="color:#8d97a9">${q.set}</span>`);
    this.tip.innerHTML = lines.join("<br>"); this.tip.hidden = false;
    this.tip.style.left = `${e.clientX + 14}px`; this.tip.style.top = `${e.clientY + 12}px`;
  }
}

// ------------------------------------------------------------------ deflection / Wilczyński / data
export class DeflPlot {
  constructor(canvas) { this.c = canvas; this.ctx = canvas.getContext("2d"); this.W = canvas.width; this.H = canvas.height; }
  axes(x0, x1, y0, y1, xl, yl, xt, yt) {
    const { ctx, W, H } = this, L = 70, R = W - 52, T = 14, B = H - 40;
    const X = (x) => L + ((x - x0) / (x1 - x0)) * (R - L), Y = (y) => B - ((y - y0) / (y1 - y0)) * (B - T);
    ctx.strokeStyle = LINE; ctx.fillStyle = MUTED; ctx.font = font(15);
    for (const x of xt) { ctx.beginPath(); ctx.moveTo(X(x), T); ctx.lineTo(X(x), B); ctx.stroke(); ctx.fillText(String(x), X(x) - 10, B + 18); }
    for (const y of yt) { ctx.beginPath(); ctx.moveTo(L, Y(y)); ctx.lineTo(R, Y(y)); ctx.stroke(); const sy = String(Math.round(y * 100) / 100); ctx.fillText(sy, L - 8 - ctx.measureText(sy).width, Y(y) + 5); }
    ctx.fillText(xl, R - ctx.measureText(xl).width, B + 34);
    ctx.save(); ctx.translate(13, (T + B) / 2 + ctx.measureText(yl).width / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(yl, 0, 0); ctx.restore();
    return { X, Y, L, R, T, B };
  }
  draw(mode, sys, l, compare) {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    if (!sys) return;
    if (mode === "defl") return this.defl(sys, l);
    if (mode === "wil") return this.wil(sys);
    return this.dataPlot(compare);
  }
  defl(sys, l) {
    const { ctx } = this, ws = sys.waves, lmax = ws[ws.length - 1].l;
    const tick = lmax > 200 ? 50 : lmax > 80 ? 20 : 10;
    const tk = Math.max(20, Math.ceil(Math.max(...ws.map((w) => (isFinite(w.TKEL) ? w.TKEL : 0))) / 50) * 50);
    const ax = this.axes(0, lmax, -180, 180, "ℓ (ħ)", "Θ (deg)", Array.from({ length: Math.floor(lmax / tick) + 1 }, (_, i) => i * tick), [-180, -90, 0, 90, 180]);
    const YT = (e) => ax.B - (e / tk) * (ax.B - ax.T);
    // outcome band
    for (let i = 0; i < ws.length; i++) {
      const w = ws[i], x0 = ax.X(w.l - (i ? (w.l - ws[i - 1].l) / 2 : 0)), x1 = ax.X(i + 1 < ws.length ? (w.l + ws[i + 1].l) / 2 : w.l);
      ctx.fillStyle = { rutherford: "rgba(91,100,118,0.12)", qe: "rgba(124,196,255,0.10)", dic: "rgba(255,177,74,0.10)", captured: "rgba(255,122,102,0.14)" }[outcome(w)];
      ctx.fillRect(x0, ax.T, x1 - x0, ax.B - ax.T);
    }
    // TKEL (right axis)
    ctx.strokeStyle = AMBER; ctx.lineWidth = 2; ctx.beginPath();
    ws.forEach((w, i) => { const y = YT(isFinite(w.TKEL) ? w.TKEL : 0); i ? ctx.lineTo(ax.X(w.l), y) : ctx.moveTo(ax.X(w.l), y); });
    ctx.stroke();
    ctx.fillStyle = AMBER; ctx.font = font(15);
    for (let e = 0; e <= tk; e += tk / 4) ctx.fillText(String(e), ax.R + 6, YT(e) + 5);
    ctx.fillText("TKEL (MeV)", ax.R - 90, ax.T + 14);
    // deflection function
    ctx.strokeStyle = TEXT; ctx.lineWidth = 2; ctx.beginPath(); let started = false;
    let prevTh = null;
    for (const w of ws) {
      if (!isFinite(w.theta) || w.pCapture > 0.99) { started = false; continue; }
      let th = w.theta * DEG; while (th > 180) th -= 360; while (th <= -180) th += 360;
      if (prevTh !== null && Math.abs(th - prevTh) > 180) started = false;       // wrapped past +-180: new segment
      const x = ax.X(w.l), y = ax.Y(th); started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true; prevTh = th;
    }
    ctx.stroke(); ctx.lineWidth = 1;
    ctx.strokeStyle = "#ff8b6b"; ctx.beginPath(); ctx.moveTo(ax.X(l), ax.T); ctx.lineTo(ax.X(l), ax.B); ctx.stroke();
    ctx.fillStyle = TEXT; ctx.fillText("Θ(ℓ)", ax.L + 8, ax.T + 14);
  }
  wil(sys) {
    const { ctx } = this;
    const ex = sys.exits.filter((e) => isFinite(e.theta));
    const tk = Math.max(20, Math.ceil(Math.max(...ex.map((e) => e.TKEL), 10) / 50) * 50);
    const ax = this.axes(0, 180, 0, tk, "θ_cm (deg)", "TKEL (MeV)", [0, 30, 60, 90, 120, 150, 180], Array.from({ length: 5 }, (_, i) => (i * tk) / 4));
    const nx = 90, ny = 60, grid = new Float64Array(nx * ny);
    for (const e of ex) {
      const chi = Math.acos(Math.cos(e.theta)) * DEG;
      const sT = 3 + 0.04 * chi, sE = 3 + 0.08 * e.TKEL;              // smearing for display (V)
      for (let i = 0; i < nx; i++) {
        const th = (i + 0.5) * (180 / nx), gx = Math.exp(-(((th - chi) / sT) ** 2) / 2);
        if (gx < 1e-3) continue;
        for (let j = 0; j < ny; j++) {
          const en = (j + 0.5) * (tk / ny), gy = Math.exp(-(((en - e.TKEL) / sE) ** 2) / 2);
          grid[j * nx + i] += e.sigma * gx * gy / (sT * sE * Math.sin(Math.max(th, 1) / DEG));
        }
      }
    }
    const mx = Math.max(...grid);
    const cw = (ax.R - ax.L) / nx, ch = (ax.B - ax.T) / ny;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const v = grid[j * nx + i] / mx;
      if (v < 1e-3) continue;
      ctx.fillStyle = heat(0.15 + 0.85 * (Math.log10(v) + 3) / 3);
      ctx.fillRect(ax.L + i * cw, ax.B - (j + 1) * ch, cw + 0.5, ch + 0.5);
    }
    ctx.fillStyle = MUTED; ctx.font = font(15); ctx.fillText("d²σ/dΩ dE (log scale)", ax.L + 8, ax.T + 14);
  }
  dataPlot(cmp) {
    const { ctx, W, H } = this;
    if (!cmp || !cmp.length) { ctx.fillStyle = MUTED; ctx.font = font(17); ctx.fillText("No measured cross sections for this reaction", 40, H / 2 - 10); ctx.fillText("at this beam energy.", 40, H / 2 + 16); return; }
    const pts = cmp.flatMap((c) => c.points.map((p) => ({ ...p, dz: p.dz })));
    const dzs = pts.map((p) => p.dz), d0 = Math.min(...dzs, -4), d1 = Math.max(...dzs, 4);
    const ax = this.axes(d0 - 0.5, d1 + 0.5, -3, 3, "ΔZ from projectile or target", "log₁₀(model/data)", Array.from({ length: d1 - d0 + 1 }, (_, i) => d0 + i).filter((v) => v % 2 === 0), [-3, -2, -1, 0, 1, 2, 3]);
    ctx.fillStyle = "rgba(127,214,164,0.12)"; ctx.fillRect(ax.L, ax.Y(0.477), ax.R - ax.L, ax.Y(-0.477) - ax.Y(0.477));
    for (const p of pts) {
      const t = Math.max(-3, Math.min(3, p.tef));
      ctx.fillStyle = Math.abs(p.tef) < 0.477 ? "#7fd6a4" : p.tef > 0 ? "#ff8b7b" : "#7cb4ff";
      ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(ax.X(p.dz + (Math.random() - 0.5) * 0.5), ax.Y(t), 3.4, 0, 2 * Math.PI); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = MUTED; ctx.font = font(15);
    ctx.fillText("band: within a factor 3", ax.L + 8, ax.T + 14);
  }
}
