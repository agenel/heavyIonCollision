// The three 2D cards: impact-parameter map (side view, draggable), beam's-eye view, detector azimuth histogram.
import { cssBlackbody } from "../scene/blackbody.js";

const AMBER = "#ffb14a", ICE = "#7cc4ff", MUTED = "#8d97a9", TEXT = "#e6eaf1", LINE = "rgba(150,172,205,0.22)";

function setup(canvas) {
  const ctx = canvas.getContext("2d");
  return { ctx, W: canvas.width, H: canvas.height };
}
const font = (px, w = 400, fam = "IBM Plex Mono") => `${w} ${px}px "${fam}", ui-monospace, monospace`;

/** Zones of the impact parameter, in the ultra-relativistic picture (centrality classes of the inelastic cross section). */
export function zonesFor(D, sysId, bOfC, bEdge) {
  return [
    { id: "central", name: "Central", c: [0, 10], b: [0, bOfC(10)] },
    { id: "mid", name: "Mid-central", c: [10, 40], b: [bOfC(10), bOfC(40)] },
    { id: "peripheral", name: "Peripheral", c: [40, 80], b: [bOfC(40), bOfC(80)] },
    { id: "grazing", name: "Grazing", c: [80, 100], b: [bOfC(80), bEdge] },
    { id: "upc", name: "Ultra-peripheral", c: null, b: [bEdge, Infinity] },
  ];
}

// ------------------------------------------------------------------ impact-parameter map
export class BMap {
  constructor(canvas, onDrag) {
    Object.assign(this, setup(canvas)); this.canvas = canvas;
    let drag = false;
    const toB = (e) => {
      const r = canvas.getBoundingClientRect(), y = ((e.clientY - r.top) / r.height) * this.H;
      return Math.max(0, Math.min(this.bMax, (this.cy - y) / this.s));
    };
    canvas.addEventListener("pointerdown", (e) => { drag = true; canvas.setPointerCapture(e.pointerId); onDrag(toB(e)); });
    canvas.addEventListener("pointermove", (e) => { if (drag) onDrag(toB(e)); });
    canvas.addEventListener("pointerup", () => { drag = false; });
    canvas.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") onDrag(Math.min(this.bMax, this.b + 0.25));
      if (e.key === "ArrowDown") onDrag(Math.max(0, this.b - 0.25));
    });
    canvas.tabIndex = 0;
  }
  draw({ b, RA, RB, aA, aB, zones, bMax, theta, labelA, labelB, zone }) {
    const { ctx, W, H } = this;
    this.b = b; this.bMax = bMax;
    const top = bMax + RA + 1, bottom = RB + 1.5;
    this.s = (H - 24) / (top + bottom); const s = this.s;
    this.cy = 12 + top * s; const cy = this.cy;
    const cxB = W * 0.56, cxA = W * 0.2;
    ctx.clearRect(0, 0, W, H);
    // zone bands (right strip) and guide lines
    const x0 = W * 0.77;
    for (const z of zones) {
      const y1 = cy - Math.min(z.b[1], bMax) * s, y0 = cy - z.b[0] * s;
      const on = z.id === zone;
      ctx.fillStyle = on ? "rgba(168,220,255,0.10)" : "rgba(255,255,255,0.025)";
      ctx.fillRect(x0, y1, W - x0, y0 - y1);
      ctx.strokeStyle = LINE; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(24, y0); ctx.lineTo(W, y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = on ? TEXT : MUTED; ctx.font = font(22, on ? 500 : 400, "IBM Plex Sans");
      const yc = Math.max(y1 + 16, Math.min(y0 - 6, (y0 + y1) / 2 + 5));
      if (y0 - y1 > 14) ctx.fillText(z.name, x0 + 8, yc);
    }
    // beam axis (dashed, amber) through the target centre
    ctx.strokeStyle = "rgba(255,177,74,0.75)"; ctx.lineWidth = 2; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(10, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
    // target nucleus B with its Woods-Saxon skin (density 90% -> 10% over 4.4 a)
    const disk = (x, y, R, a, col) => {
      const g = ctx.createRadialGradient(x, y, Math.max(R - 2.2 * a, 0) * s, x, y, (R + 2.2 * a) * s);
      g.addColorStop(0, col + "ee"); g.addColorStop(1, col + "00");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, (R + 2.2 * a) * s, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = col; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(x, y, R * s, 0, 2 * Math.PI); ctx.stroke(); ctx.globalAlpha = 1;
    };
    disk(cxB, cy, RB, aB, ICE);
    // projectile trajectory: straight (Coulomb deflection is microradians)
    const yA = cy - b * s;
    ctx.strokeStyle = TEXT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cxA, yA); ctx.lineTo(W * 0.74, yA); ctx.stroke();
    ctx.fillStyle = TEXT; ctx.beginPath(); ctx.moveTo(W * 0.74 + 12, yA); ctx.lineTo(W * 0.74, yA - 6); ctx.lineTo(W * 0.74, yA + 6); ctx.fill();
    ctx.lineWidth = 1;
    disk(cxA, yA, RA, aA, AMBER);
    // overlap of the two discs when they pass (drawn on the target)
    if (b < RA + RB) {
      ctx.save(); ctx.beginPath(); ctx.arc(cxB, cy, RB * s, 0, 2 * Math.PI); ctx.clip();
      ctx.fillStyle = "rgba(255,241,214,0.55)"; ctx.beginPath(); ctx.arc(cxB, yA, RA * s, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
      ctx.strokeStyle = "rgba(255,177,74,0.5)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cxB, yA, RA * s, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    }
    // b arrow
    const xb = 34;
    ctx.strokeStyle = "#ff8b6b"; ctx.fillStyle = "#ff8b6b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xb, cy); ctx.lineTo(xb, yA); ctx.stroke();
    if (b * s > 14) {
      for (const [y, d] of [[cy, 1], [yA, -1]]) { ctx.beginPath(); ctx.moveTo(xb, y); ctx.lineTo(xb - 6, y - d * 10); ctx.lineTo(xb + 6, y - d * 10); ctx.fill(); }
    }
    ctx.font = font(32, 600, "IBM Plex Sans"); ctx.fillText("b", xb + 9, (cy + yA) / 2 + 8);
    ctx.lineWidth = 1;
    // labels
    ctx.font = font(22); ctx.fillStyle = AMBER; ctx.fillText(labelA, Math.max(8, cxA - RA * s), yA - RA * s - 8);
    ctx.fillStyle = ICE; ctx.fillText(labelB, cxB - RB * s * 0.6, cy + RB * s + 18 > H - 4 ? cy + 18 : cy + RB * s + 18);
    ctx.fillStyle = MUTED; ctx.font = font(20);
    ctx.fillText(`deflection ${fmtAngle(theta)}`, W * 0.34, yA - 8);
    // scale bar
    ctx.strokeStyle = MUTED; ctx.beginPath(); ctx.moveTo(60, H - 12); ctx.lineTo(60 + 5 * s, H - 12); ctx.stroke();
    ctx.fillText("5 fm", 60, H - 20);
  }
}
function fmtAngle(th) {
  if (th < 1e-3) return `${(th * 1e6).toFixed(th < 1e-5 ? 1 : 0)} µrad`;
  return `${(th * 1e3).toFixed(1)} mrad`;
}

// ------------------------------------------------------------------ beam's-eye view
export class BeamsEye {
  constructor(canvas) { Object.assign(this, setup(canvas)); this.img = null; }
  draw({ model, col, t, fb, tau0, Tc }) {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    const RA = model.RA, RB = model.RB, b = col.b;
    const half = Math.max(RA, RB) + b / 2 + 2;
    const s = Math.min(W / (2 * half * 1.25), H / (2 * half)), cx = W / 2, cy = H / 2;
    // physics (x, y) -> canvas: x (impact-parameter direction) down, y to the right, matching the 3D side view
    // (projectile A at x = -b/2 on top)
    const P = (x, y) => [cx + y * s, cy + x * s];
    // temperature map at z = 0 (tau = t)
    let TmaxNow = 0;
    if (fb && t > 0) {
      const n = fb.n, tau = Math.max(t, 0.05), S = fb.s2d(tau);
      if (!this.img || this.img.width !== n) { this.off = new OffscreenCanvas(n, n); this.img = this.off.getContext("2d").createImageData(n, n); }
      const d = this.img.data;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const T = fb.eos.T_of_s(S[i * n + j]); TmaxNow = Math.max(TmaxNow, T);
        // image row = x (down), column = y
        const o = 4 * (i * n + j);
        if (T < 100) { d[o + 3] = 0; continue; }
        const rgb = bbCache(T);
        const a = Math.min(1, (T - 100) / 60);
        d[o] = rgb[0]; d[o + 1] = rgb[1]; d[o + 2] = rgb[2]; d[o + 3] = 255 * a * (T > Tc ? 1 : 0.55);
      }
      this.off.getContext("2d").putImageData(this.img, 0, 0);
      const L = fb.grid.L, [x0, y0] = P(-L, -L);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(this.off, x0, y0, 2 * L * s, 2 * L * s);
    }
    // nuclei outlines
    ctx.lineWidth = 1.5;
    for (const [xc, R, c] of [[-b / 2, RA, AMBER], [b / 2, RB, ICE]]) {
      const [px, py] = P(xc, 0);
      ctx.strokeStyle = c; ctx.globalAlpha = t > tau0 ? 0.35 : 0.8;
      ctx.beginPath(); ctx.arc(px, py, R * s, 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // nucleons
    const dot = (x, y, c, filled) => {
      const [px, py] = P(x, y);
      ctx.beginPath(); ctx.arc(px, py, filled ? 3.2 : 2.6, 0, 2 * Math.PI);
      if (filled) { ctx.fillStyle = c; ctx.fill(); } else { ctx.strokeStyle = c; ctx.stroke(); }
    };
    const showPart = t < tau0 + 0.3;
    ctx.lineWidth = 1;
    for (const [nuc, nc, shift, c] of [[model.nucA, col.ncollA, -b / 2, AMBER], [model.nucB, col.ncollB, b / 2, ICE]]) {
      for (let i = 0; i < nuc.A; i++) {
        const part = nc[i] > 0;
        if (part && !showPart) continue;
        ctx.globalAlpha = part ? 1 : (t > 0 ? 0.3 : 0.5);
        dot(nuc.pos[3 * i] + shift, nuc.pos[3 * i + 1], part ? (t > -0.5 ? "#fff1d6" : c) : c, part);
      }
    }
    ctx.globalAlpha = 1;
    // participant-plane axis Psi_2 (direction of the largest flow)
    if (col.npart > 2) {
      const ps = col.psi[2], r = half * 0.95;
      const [ax, ay] = P(r * Math.cos(ps), r * Math.sin(ps)), [bx, by] = P(-r * Math.cos(ps), -r * Math.sin(ps));
      ctx.strokeStyle = "rgba(168,220,255,0.55)"; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(168,220,255,0.85)"; ctx.font = font(20); ctx.fillText("Ψ₂", ax + 4, ay + 4);
    }
    // axes hint
    ctx.fillStyle = MUTED; ctx.font = font(19);
    ctx.fillText("↓ x (b)", 8, 16); ctx.fillText("y →", W - 30, H - 8);
    return TmaxNow;
  }
}
const _bb = new Map();
function bbCache(T) {
  const k = Math.round(T / 2);
  if (!_bb.has(k)) { const m = cssBlackbody(k * 2).match(/\d+/g).map(Number); _bb.set(k, m); }
  return _bb.get(k);
}

// ------------------------------------------------------------------ detector azimuth histogram
export class PhiHist {
  constructor(canvas) { Object.assign(this, setup(canvas)); }
  draw({ hits, psi2, v2in, total }) {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    const nb = 24, cnt = new Array(nb).fill(0);
    let c2 = 0;
    for (const h of hits) {
      let d = h.phi - psi2; d = Math.atan2(Math.sin(d), Math.cos(d));
      cnt[Math.min(nb - 1, Math.floor(((d + Math.PI) / (2 * Math.PI)) * nb))]++;
      c2 += Math.cos(2 * d);
    }
    const N = hits.length, mean = Math.max(total, 1) / nb;
    const top = mean * (1 + 2 * Math.max(v2in, 0) + 3 / Math.sqrt(Math.max(mean, 1)) + 0.25);
    const x0 = 42, x1 = W - 12, y0 = H - 34, y1 = 14;
    const X = (d) => x0 + ((d + Math.PI) / (2 * Math.PI)) * (x1 - x0), Y = (v) => y0 - (v / top) * (y0 - y1);
    // grid + axis labels
    ctx.strokeStyle = LINE; ctx.fillStyle = MUTED; ctx.font = font(19);
    for (const [d, lab] of [[-Math.PI, "−π"], [-Math.PI / 2, "−π/2"], [0, "0"], [Math.PI / 2, "π/2"], [Math.PI, "π"]]) {
      ctx.beginPath(); ctx.moveTo(X(d), y1); ctx.lineTo(X(d), y0); ctx.stroke();
      ctx.fillText(lab, X(d) - ctx.measureText(lab).width / 2, y0 + 18);
    }
    ctx.fillText("φ − Ψ₂", x1 - 56, y0 + 32 > H ? y0 + 18 : y0 + 32);
    ctx.save(); ctx.translate(14, (y0 + y1) / 2 + 30); ctx.rotate(-Math.PI / 2); ctx.fillText("hits / bin", 0, 0); ctx.restore();
    // bars
    const bw = (x1 - x0) / nb;
    for (let i = 0; i < nb; i++) {
      const d = -Math.PI + (i + 0.5) * (2 * Math.PI / nb);
      const inPlane = Math.cos(2 * d) > 0;
      ctx.fillStyle = inPlane ? "rgba(255,177,74,0.75)" : "rgba(124,196,255,0.6)";
      ctx.fillRect(X(-Math.PI) + i * bw + 1, Y(cnt[i]), bw - 2, y0 - Y(cnt[i]));
    }
    // expected shape for the final count: (N_total/nb)(1 + 2 v2 cos 2 dphi)
    if (total > 0) {
      ctx.strokeStyle = TEXT; ctx.lineWidth = 2; ctx.beginPath();
      for (let k = 0; k <= 120; k++) {
        const d = -Math.PI + (2 * Math.PI * k) / 120, v = mean * (1 + 2 * v2in * Math.cos(2 * d));
        k ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v));
      }
      ctx.stroke(); ctx.lineWidth = 1;
    }
    const v2 = N ? c2 / N : 0, err = N ? Math.sqrt(0.5 / N) : 0;
    return { N, v2, err };
  }
}
