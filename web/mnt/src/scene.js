// 3D stage: the reaction plane (world X right = beam, Y up = impact-parameter side), both nuclei as nucleon clusters in
// the centre-of-mass frame, the neck during contact, nucleons crossing, and the orbit trail. 1 unit = 1 fm.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const C_PROTON = new THREE.Color(0xff7a66), C_NEUTRON = new THREE.Color(0xb9c6d8);
const C_A = new THREE.Color(0xffb14a), C_B = new THREE.Color(0x7cc4ff);
const R_NUC = 0.85;

export class Stage {
  constructor(container) {
    this.container = container;
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(r.domElement);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07090d);
    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;
    this.camera = new THREE.PerspectiveCamera(30, 1, 1, 2000);
    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.enableDamping = true; this.controls.enablePan = false;
    this.controls.minDistance = 40; this.controls.maxDistance = 600;
    this.composer = new EffectComposer(r);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.4, 0.85);
    this.composer.addPass(this.bloom); this.composer.addPass(new OutputPass());
    const key = new THREE.DirectionalLight(0xdbe8ff, 1.1); key.position.set(-40, 60, 90); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xffc68a, 0.5); rim.position.set(60, -20, -60); this.scene.add(rim);
    this.scene.add(new THREE.AmbientLight(0x404a5c, 0.4));
    this._buildPlane();
    this.geo = new THREE.SphereGeometry(1, 16, 12);
    this.mat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05, emissive: 0xffffff, emissiveIntensity: 1 });
    this.mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vGlow;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance = mix(diffuseColor.rgb, vec3(1.0, 0.55, 0.25), 0.5) * vGlow;");
    };
    // neck: a glowing capsule between the two surfaces
    this.neck = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    this.scene.add(this.neck);
    // orbit trail of the projectile relative to the CM
    this.trailGeo = new THREE.BufferGeometry();
    this.trail = new THREE.Line(this.trailGeo, new THREE.LineBasicMaterial({ color: 0xffb14a, transparent: true, opacity: 0.55 }));
    this.trailB = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x7cc4ff, transparent: true, opacity: 0.45 }));
    this.scene.add(this.trail, this.trailB);
    this.mesh = null;
    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();
    this.setView(true);
  }

  _buildPlane() {
    // reaction plane: faint polar grid around the centre of mass (circles every 10 fm) and the beam axis
    const g = new THREE.Group();
    const m = new THREE.LineBasicMaterial({ color: 0x2a3446, transparent: true, opacity: 0.55 });
    for (let R = 10; R <= 60; R += 10) {
      const pts = []; for (let i = 0; i <= 128; i++) { const a = (i / 128) * 2 * Math.PI; pts.push(new THREE.Vector3(R * Math.cos(a), R * Math.sin(a), 0)); }
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m));
    }
    const ax = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-75, 0, 0), new THREE.Vector3(75, 0, 0)]),
      new THREE.LineDashedMaterial({ color: 0xffb14a, dashSize: 2.5, gapSize: 1.8, transparent: true, opacity: 0.5 }));
    ax.computeLineDistances(); g.add(ax);
    const plane = new THREE.Mesh(new THREE.CircleGeometry(66, 96), new THREE.MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.018, depthWrite: false }));
    g.add(plane);
    this.scene.add(g);
  }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.composer.setSize(w, h); this.bloom.setSize(w, h);
    this.w = w; this.h = h; this.wide = w > 1100;
    this.camera.aspect = w / h; this.camera.fov = w / h < 1 ? 46 : 30;
    if (this.wide) {
      const left = 18 + 372 + 10, right = 18 + 392 + 10, bottom = 90;
      const cx = (left + (w - right)) / 2, cy = (16 + (h - bottom)) / 2;
      this.camera.setViewOffset(w, h, w / 2 - cx, h / 2 - cy, w, h);
    } else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  setView(instant = false) {
    const d = this.wide ? 250 : this.w / this.h < 1 ? 230 : 200;
    this.camera.position.set(0, -0.28 * d, 0.96 * d);
    this.camera.up.set(0, 1, 0);
    this.controls.target.set(0, 0, 0); this.controls.update();
  }

  /** Nucleon clusters for projectile P and target T: positions inside spheres of radius 1.12 A^1/3 (hard core 1.5 fm). */
  setNuclei(P, T, rng = Math.random) {
    if (this.mesh) { this.scene.remove(this.mesh); this.mesh.dispose(); }
    const sample = (A) => {
      const R = 1.12 * Math.cbrt(A), pts = [];
      let tries = 0;
      while (pts.length < A && tries < 200000) {
        tries++;
        const v = new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).multiplyScalar(R);
        if (v.length() > R) continue;
        if (pts.some((p) => p.distanceToSquared(v) < (tries < 100000 ? 2.25 : 1.2))) continue;
        pts.push(v);
      }
      while (pts.length < A) pts.push(new THREE.Vector3().randomDirection().multiplyScalar(R * Math.cbrt(rng())));
      return pts;
    };
    const shuffleFlags = (A, Z) => { const f = Array.from({ length: A }, (_, i) => i < Z); for (let i = A - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [f[i], f[j]] = [f[j], f[i]]; } return f; };
    this.nA = P.A; this.nB = T.A; const N = P.A + T.A;
    this.local = [...sample(P.A), ...sample(T.A)];            // position relative to the owning nucleus centre
    this.home = this.local.map((v) => v.clone());
    this.isP = [...shuffleFlags(P.A, P.Z), ...shuffleFlags(T.A, T.Z)];
    this.owner = Array.from({ length: N }, (_, i) => (i < P.A ? 0 : 1));   // 0 projectile-like, 1 target-like
    this.flight = new Array(N).fill(null);
    this.mesh = new THREE.InstancedMesh(this.geo, this.mat, N);
    this.glow = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
    this.geo.setAttribute("aGlow", this.glow);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) { c.copy(this.isP[i] ? C_PROTON : C_NEUTRON); this.mesh.setColorAt(i, c); }
    this.scene.add(this.mesh);
    this.P = P; this.T = T;
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = new THREE.Vector3(); this._v = new THREE.Vector3();
  }

  /** Set the orbit trail (relative coordinate samples -> projectile and target CM positions). */
  setTrail(ptsA, ptsB) {
    this.trailGeo.setFromPoints(ptsA.map((p) => new THREE.Vector3(p[0], p[1], 0)));
    this.trailB.geometry.setFromPoints(ptsB.map((p) => new THREE.Vector3(p[0], p[1], 0)));
  }

  /**
   * Frame update. cA, cB: nucleus centres (x, y); wantZ1/wantN1: current integer (Z, N) of the projectile-like fragment;
   * ff: contact form factor (neck); heat: 0..1 glow; t: time (fm/c) for the crossing animation.
   */
  update({ cA, cB, wantZ1, wantN1, ff, heat, t, chatter }) {
    const N = this.local.length, RA = 1.12 * Math.cbrt(this.P.A), RB = 1.12 * Math.cbrt(this.T.A);
    // move nucleons between the clusters until the projectile-like fragment has (wantZ1, wantN1)
    let Z1 = 0, N1 = 0;
    for (let i = 0; i < N; i++) if (this.owner[i] === 0) { if (this.isP[i]) Z1++; else N1++; }
    const dir = new THREE.Vector3(cB[0] - cA[0], cB[1] - cA[1], 0).normalize();
    const move = (proton, from, to) => {
      const cand = [];
      for (let i = 0; i < N; i++) if (this.owner[i] === from && this.isP[i] === proton && !this.flight[i]) cand.push(i);
      if (!cand.length) return false;
      // take the nucleon closest to the neck
      const toward = from === 0 ? dir : dir.clone().negate();
      cand.sort((a, b) => this.local[b].dot(toward) - this.local[a].dot(toward));
      const i = cand[0];
      const Rto = to === 0 ? RA : RB, back = to === 0 ? dir.clone().negate() : dir.clone();
      const dest = back.clone().multiplyScalar(Rto * 0.75).add(new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3));
      this.flight[i] = { t0: t, from: this.local[i].clone(), fromOwner: from, dest };
      this.owner[i] = to;
      return true;
    };
    for (let k = 0; k < 3 && Z1 < wantZ1; k++, Z1++) move(true, 1, 0);
    for (let k = 0; k < 3 && Z1 > wantZ1; k++, Z1--) move(true, 0, 1);
    for (let k = 0; k < 3 && N1 < wantN1; k++, N1++) move(false, 1, 0);
    for (let k = 0; k < 3 && N1 > wantN1; k++, N1--) move(false, 0, 1);
    // chatter: pairs of nucleons swapping both ways while in contact (visual cue for the exchange rate, V)
    if (chatter > 0 && Math.random() < chatter) { const p = Math.random() < 0.4; if (move(p, 0, 1)) move(p, 1, 0); }
    const FLY = 25;             // fm/c for a crossing (visual)
    for (let i = 0; i < N; i++) {
      const own = this.owner[i], c = own === 0 ? cA : cB;
      let x, y, z;
      const f = this.flight[i];
      if (f) {
        const u = Math.min(1, (t - f.t0) / FLY), e = u * u * (3 - 2 * u);
        const cf = f.fromOwner === 0 ? cA : cB;
        const a = this._v.set(cf[0] + f.from.x, cf[1] + f.from.y, f.from.z);
        const bx = c[0] + f.dest.x, by = c[1] + f.dest.y, bz = f.dest.z;
        x = a.x + (bx - a.x) * e; y = a.y + (by - a.y) * e; z = a.z + (bz - a.z) * e;
        if (u >= 1 || t < f.t0) { this.local[i].copy(f.dest); this.flight[i] = null; }
        this.glow.array[i] = 0.9;
      } else {
        const l = this.local[i];
        x = c[0] + l.x; y = c[1] + l.y; z = l.z;
        this.glow.array[i] = 0.04 + 0.28 * heat;
      }
      this._m.compose(this._v.set(x, y, z), this._q, this._s.set(R_NUC, R_NUC, R_NUC));
      this.mesh.setMatrixAt(i, this._m);
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.glow.needsUpdate = true;
    // neck between the surfaces
    const d = Math.hypot(cB[0] - cA[0], cB[1] - cA[1]);
    const gap = d - RA - RB;
    this.neck.visible = ff > 0.05;
    if (this.neck.visible) {
      const mid = [cA[0] + dir.x * (RA + gap / 2), cA[1] + dir.y * (RA + gap / 2)];
      this.neck.position.set(mid[0], mid[1], 0);
      this.neck.scale.set(0.8 + 2.6 * ff, Math.max(gap + 2.5, 1.5), 0.8 + 2.6 * ff);
      this.neck.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      this.neck.material.opacity = 0.18 + 0.35 * ff * (0.4 + heat);
    }
  }

  /** Reset crossing state (new wave or scrubbing backwards): all nucleons return to their original nucleus. */
  resetOwners() {
    const N = this.local.length;
    for (let i = 0; i < N; i++) { this.owner[i] = i < this.nA ? 0 : 1; this.flight[i] = null; this.local[i].copy(this.home[i]); }
  }

  tick() { this.controls.update(); }
  render() { this.composer.render(); }
  project(v) {
    const p = v.clone().project(this.camera);
    if (p.z > 1) return null;
    return [(p.x * 0.5 + 0.5) * this.w, (-p.y * 0.5 + 0.5) * this.h];
  }
}
