// Nucleons as instanced spheres: the two Lorentz-contracted nuclei before the collision, the spectators after it,
// and the participants, which glow at impact and shrink until tau_0 + 0.3 fm/c (their energy is now the fireball).
// Kinematics as hic_core/event.py frame_nucleons; nucleon radius 0.8 fm (visual, as in Blender).
import * as THREE from "three";

const COL_A = new THREE.Color(0xffb14a), COL_B = new THREE.Color(0x7cc4ff), COL_HOT = new THREE.Color(0xfff1d6);
const R_NUC = 0.8;

export class Nucleons {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.geo = new THREE.SphereGeometry(1, 20, 14);
    this.mat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05, emissive: 0xffffff, emissiveIntensity: 1 });
    this.mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vGlow;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance = diffuseColor.rgb * vGlow;");
    };
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = new THREE.Vector3(); this._p = new THREE.Vector3();
  }

  /** model: CollisionModel (fixed nuclei). Rebuild when the nuclei change. */
  setModel(model, rng) {
    if (this.mesh) { this.scene.remove(this.mesh); this.mesh.dispose(); }
    const nA = model.nucA.A, nB = model.nucB.A, N = nA + nB;
    this.model = model; this.nA = nA; this.N = N;
    this.mesh = new THREE.InstancedMesh(this.geo, this.mat, N);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.glow = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
    this.glow.setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute("aGlow", this.glow);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    // Fermi motion of spectators: p_T ~ N(0, p_F/sqrt(5)) per component, v_T = p_T / E with E = gamma m
    const pF = model.D.misc.fermi_momentum_GeV, E = model.gamma * model.D.constants.M_NUCLEON;
    this.vT = new Float32Array(2 * N);
    for (let i = 0; i < 2 * N; i++) this.vT[i] = rng.normal(0, pF / Math.sqrt(5)) / E;
    this.part = new Uint8Array(N);
    this.setColors();
  }

  setColors() {
    const c = new THREE.Color();
    for (let i = 0; i < this.N; i++) {
      const isA = i < this.nA;
      const nuc = isA ? this.model.nucA : this.model.nucB, k = isA ? i : i - this.nA;
      c.copy(isA ? COL_A : COL_B);
      if (!nuc.isProton[k]) c.multiplyScalar(0.72);        // neutrons a shade darker
      this.mesh.setColorAt(i, c);
    }
    this.mesh.instanceColor.needsUpdate = true;
  }

  setGeometry(col) {
    this.col = col;
    for (let i = 0; i < this.nA; i++) this.part[i] = col.ncollA[i] > 0 ? 1 : 0;
    for (let j = 0; j < this.N - this.nA; j++) this.part[this.nA + j] = col.ncollB[j] > 0 ? 1 : 0;
  }

  /**
   * t: lab time fm/c. shape: "rest" (no contraction, a visual aid), "pancake" (nuclei squashed to at least 1 fm
   * thick, nucleons drawn round; default, V) or "true" (everything contracted by 1/gamma, as in the lab).
   */
  update(t, { shape = "pancake", tau0 = 0.4 } = {}) {
    const M = this.model, b = this.col.b, beta = M.beta;
    const zPos = (R) => shape === "rest" ? 1 : shape === "true" ? 1 / M.gamma : Math.max(1 / M.gamma, 1 / (2 * R));
    const zsA = zPos(M.RA), zsB = zPos(M.RB), zShape = shape === "true" ? 1 / M.gamma : 1;
    const tOff = tau0 + 0.3;
    for (let i = 0; i < this.N; i++) {
      const isA = i < this.nA, k = isA ? i : i - this.nA, nuc = isA ? M.nucA : M.nucB;
      const dir = isA ? 1 : -1, zs = isA ? zsA : zsB;
      const px = nuc.pos[3 * k] + (isA ? -b / 2 : b / 2), py = nuc.pos[3 * k + 1], pz = nuc.pos[3 * k + 2] * zs;
      const part = this.part[i];
      let X = pz + dir * beta * t, Y = -px, Z = py, size = R_NUC, glow = part ? 0.18 : 0.05;
      if (t > 0 && !part) { Y -= this.vT[2 * i] * t; Z += this.vT[2 * i + 1] * t; }
      if (part) {
        if (t >= tOff) size = 0;
        else if (t > 0) { const f = 1 - t / tOff; size = R_NUC * f; glow = 3.2 * f + 0.4; }
        else if (t > -0.5) glow = 0.18 + 3.0 * (1 + t / 0.5);
      }
      this._p.set(X, Y, Z);
      this._s.set(size * zShape, size, size);
      this._m.compose(this._p, this._q, this._s);
      this.mesh.setMatrixAt(i, this._m);
      this.glow.array[i] = glow;
      if (part && t > -0.5 && t < tOff) this.mesh.setColorAt(i, COL_HOT);
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.glow.needsUpdate = true;
    if (t > -0.5 && t < tOff) this.mesh.instanceColor.needsUpdate = true;
    else if (this._hot !== false) { this.setColors(); }
    this._hot = t > -0.5 && t < tOff;
  }
}
