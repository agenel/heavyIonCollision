// Produced charged particles flying to the detector.
// Physics: N = dN_ch/deta * 1.6 charged particles in |eta| < 0.8 (the ALICE flow acceptance), azimuths drawn from
// dN/dphi ∝ 1 + 2 sum v_n cos n(phi - Psi_n) with this event's v_n (the targets the Level-A flow is calibrated to)
// and participant-plane angles Psi_n. A barrel at radius r sees a particle of pseudorapidity eta at z = r sinh(eta).
// Visual (V): the viewer chooses how many of the N are drawn; they leave the fireball edge around the kinetic
// freeze-out time and take 3 fm/c to reach the barrel, which is drawn ~10^15 times too small.
import * as THREE from "three";
import { DET } from "./stage.js";

const R_HIT = DET.rOut, FLIGHT = 3.0;

export function sampleHits(rng, { dNch, vn, psi, tFo }) {
  const N = Math.min(Math.round(1.6 * dNch), 6000);
  const vmax = 1 + 2 * (Math.abs(vn[2]) + Math.abs(vn[3]) + Math.abs(vn[4]));
  const out = [];
  for (let i = 0; i < N; i++) {
    let phi;
    for (;;) {
      phi = rng.uniform(-Math.PI, Math.PI);
      const w = 1 + 2 * (vn[2] * Math.cos(2 * (phi - psi[2])) + vn[3] * Math.cos(3 * (phi - psi[3])) + vn[4] * Math.cos(4 * (phi - psi[4])));
      if (rng.uniform(0, vmax) < w) break;
    }
    const te = tFo - 1.5 + 2.0 * rng.uniform();
    out.push({ phi, eta: rng.uniform(-0.8, 0.8), q: rng.uniform() < 0.5 ? 1 : -1, te, t: te + FLIGHT });
  }
  return out;
}

export class Hits {
  constructor(scene, stage) {
    this.stage = stage;
    this.max = 6000;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(3 * this.max); this.col = new Float32Array(3 * this.max);
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    this.points = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    this.points.frustumCulled = false; scene.add(this.points);
    const tg = new THREE.BufferGeometry();
    this.tpos = new Float32Array(6 * this.max); this.tcol = new Float32Array(6 * this.max);
    tg.setAttribute("position", new THREE.BufferAttribute(this.tpos, 3));
    tg.setAttribute("color", new THREE.BufferAttribute(this.tcol, 3));
    this.tracks = new THREE.LineSegments(tg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false }));
    this.tracks.frustumCulled = false; scene.add(this.tracks);
    this.list = []; this.showTracks = false; this.nDraw = 0;
  }

  setHits(list, Rfo, nDraw) {
    this.list = list; this.Rfo = Rfo; this.nDraw = Math.min(nDraw ?? list.length, list.length, this.max);
    this.tower = list.map((h) => this.stage.towerIndex(h.phi, R_HIT * Math.sinh(h.eta)));
  }
  setCount(nDraw) { this.nDraw = Math.min(nDraw, this.list.length, this.max); }

  /** Draws the particles at lab time t; returns the drawn particles that have reached the detector. */
  update(t) {
    const L = this.list, n = this.nDraw, r0 = this.Rfo;
    let k = 0, kt = 0;
    const heat = this.stage.towers.heat.array; heat.fill(0);
    const arrived = [];
    for (let i = 0; i < n; i++) {
      const h = L[i];
      if (t < h.te) continue;
      const cy = -Math.cos(h.phi), cz = Math.sin(h.phi);            // world Y = -x_phys, Z = y_phys
      const c = h.q > 0 ? [1.0, 0.72, 0.36] : [0.52, 0.8, 1.0];
      const zEnd = R_HIT * Math.sinh(h.eta);
      let r, f, a;
      if (t >= h.t) {
        arrived.push(h);
        r = R_HIT; f = 1; a = Math.max(0.35, 1.6 * Math.exp(-(t - h.t) / 1.2));
        if (this.tower[i] >= 0) heat[this.tower[i]] += 0.03;
      } else {
        f = (t - h.te) / FLIGHT; r = r0 + f * (R_HIT - r0); a = 1.25;
      }
      this.pos[3 * k] = f * zEnd; this.pos[3 * k + 1] = r * cy; this.pos[3 * k + 2] = r * cz;
      this.col[3 * k] = c[0] * a; this.col[3 * k + 1] = c[1] * a; this.col[3 * k + 2] = c[2] * a; k++;
      if (this.showTracks && t < h.t + 2.5) {
        // straight track from the fireball edge (no magnetic field is drawn)
        const fade = t > h.t ? Math.exp(-(t - h.t) / 0.8) : 1;
        this.tpos.set([0, r0 * cy, r0 * cz, f * zEnd, r * cy, r * cz], 6 * kt);
        this.tcol.set([0, 0, 0, c[0] * fade, c[1] * fade, c[2] * fade], 6 * kt); kt++;
      }
    }
    for (let i = 0; i < heat.length; i++) heat[i] = Math.min(heat[i] * Math.max(1, 1500 / Math.max(n, 1)) ** 0.5, 1.3);
    this.stage.towers.heat.needsUpdate = true;
    const g = this.points.geometry; g.setDrawRange(0, k); g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true;
    const tg = this.tracks.geometry; tg.setDrawRange(0, 2 * kt); tg.attributes.position.needsUpdate = true; tg.attributes.color.needsUpdate = true;
    return arrived;
  }
}
