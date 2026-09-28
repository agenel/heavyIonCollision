// Ray-marched fireball. The shader evaluates exactly the Level-A field used in Blender (fireball.temperature_3d):
//   tau = sqrt(t^2 - z^2), eta_s = atanh(z/t), s = f(eta_s) * s_2D(x, y, tau), T = T(s) from the HotQCD EoS,
// with s_2D from the transverse snapshots (3D texture x, y, tau; linear in tau), pre-equilibrium dilution
// s0 * tau0/tau before tau0 and Bjorken dilution after the last snapshot.
// Visual mapping (V, as hic_viz.scene.volume_material): colour = blackbody(13 K/MeV * T),
// extinction = gain * sqrt(eps / 10 GeV fm^-3) * smoothstep(110, 150 MeV, T).
import * as THREE from "three";
import { blackbodyTable } from "./blackbody.js";

const vert = /* glsl */`
varying vec3 vObj;
void main() { vObj = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const frag = /* glsl */`
precision highp float; precision highp sampler3D;
uniform sampler3D sTex; uniform sampler2D eosTex; uniform sampler2D bbTex;
uniform vec3 camObj; uniform vec3 halfSize;
uniform float t, tau0, dTau, nSnap, depth, tauLast, L, sigmaEta, yBeam, logS0, logS1;
uniform float densGain, emisGain, fadeLo, fadeHi, bbT0, bbT1, steps, ready;
varying vec3 vObj;

vec2 boxHit(vec3 ro, vec3 rd, vec3 h) {
  vec3 inv = 1.0 / rd; vec3 t0 = (-h - ro) * inv, t1 = (h - ro) * inv;
  vec3 tmin = min(t0, t1), tmax = max(t0, t1);
  return vec2(max(max(tmin.x, tmin.y), tmin.z), min(min(tmax.x, tmax.y), tmax.z));
}
float s2d(vec3 p, float tau) {           // p: world-local (X = z_phys, Y = -x_phys, Z = y_phys)
  vec2 uv = vec2((p.z + L) / (2.0 * L), (-p.y + L) / (2.0 * L));
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0;
  float k = (tau - tau0) / dTau, f = 1.0;
  if (k < 0.0) { f = tau0 / max(tau, 0.05); k = 0.0; }
  else if (k > nSnap - 1.0) { f = tauLast / tau; k = nSnap - 1.0; }
  return f * texture(sTex, vec3(uv, (k + 0.5) / depth)).r;
}
void main() {
  vec3 ro = camObj, rd = normalize(vObj - camObj);
  vec2 h = boxHit(ro, rd, halfSize);
  if (h.x > h.y || ready < 0.5) discard;
  h.x = max(h.x, 0.0);
  float ds = (h.y - h.x) / steps;
  float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  vec3 col = vec3(0.0); float trans = 1.0;
  for (int i = 0; i < 160; i++) {
    if (float(i) >= steps) break;
    vec3 p = ro + rd * (h.x + (float(i) + jitter) * ds);
    float z = p.x;
    if (abs(z) >= t) continue;
    float tau = sqrt(t * t - z * z), eta = atanh(z / t);
    if (abs(eta) >= yBeam) continue;
    float s = exp(-eta * eta / (2.0 * sigmaEta * sigmaEta)) * s2d(p, tau);
    if (s <= 0.0) continue;
    float u = (log(s) - logS0) / (logS1 - logS0);
    if (u <= 0.0) continue;
    vec2 te = texture(eosTex, vec2(clamp(u, 0.0, 1.0), 0.5)).rg;   // T (MeV), eps (GeV/fm^3)
    float T = te.x, dens = densGain * sqrt(max(te.y, 0.0) / 10.0) * smoothstep(fadeLo, fadeHi, T);
    if (dens <= 0.0) continue;
    vec3 bb = texture(bbTex, vec2(clamp((T - bbT0) / (bbT1 - bbT0), 0.0, 1.0), 0.5)).rgb;
    float a = 1.0 - exp(-dens * ds);
    // emission scales with T^2 for a visible brightness contrast between core and edge (V)
    col += trans * a * bb * emisGain * pow(T / 250.0, 2.0);
    trans *= 1.0 - a;
    if (trans < 0.01) break;
  }
  float alpha = 1.0 - trans;
  if (alpha < 0.002) discard;
  gl_FragColor = vec4(col, alpha);
}`;

export class FireballVolume {
  constructor(scene, eos) {
    this.half = new THREE.Vector3(32, 16, 16);
    const tab = eos.table(1024);
    const eosData = new Float32Array(4 * 1024);
    for (let i = 0; i < 1024; i++) { eosData[4 * i] = tab.T[i]; eosData[4 * i + 1] = tab.eps[i]; }
    const eosTex = new THREE.DataTexture(eosData, 1024, 1, THREE.RGBAFormat, THREE.FloatType);
    eosTex.minFilter = eosTex.magFilter = THREE.NearestFilter; eosTex.needsUpdate = true;
    const bbTex = new THREE.DataTexture(blackbodyTable(100, 600, 256), 256, 1, THREE.RGBAFormat, THREE.FloatType);
    bbTex.minFilter = bbTex.magFilter = THREE.NearestFilter; bbTex.needsUpdate = true;
    this.uniforms = {
      sTex: { value: null }, eosTex: { value: eosTex }, bbTex: { value: bbTex },
      camObj: { value: new THREE.Vector3() }, halfSize: { value: this.half },
      t: { value: 0 }, tau0: { value: 0.4 }, dTau: { value: 0.1 }, nSnap: { value: 1 }, depth: { value: 1 }, tauLast: { value: 0.4 }, L: { value: 16 },
      sigmaEta: { value: 3.8 }, yBeam: { value: 8.6 }, logS0: { value: tab.logS0 }, logS1: { value: tab.logS1 },
      densGain: { value: 0.15 }, emisGain: { value: 1.6 }, fadeLo: { value: 110 }, fadeHi: { value: 150 },
      bbT0: { value: 100 }, bbT1: { value: 600 }, steps: { value: 110 }, ready: { value: 0 },
    };
    this.mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: this.uniforms,
      transparent: true, depthWrite: false, side: THREE.BackSide, premultipliedAlpha: true });
    this.mat.blending = THREE.CustomBlending;
    this.mat.blendSrc = THREE.OneFactor; this.mat.blendDst = THREE.OneMinusSrcAlphaFactor;
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2 * this.half.x, 2 * this.half.y, 2 * this.half.z), this.mat);
    this.mesh.renderOrder = 10; this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.tex = null; this.K = 0;
  }

  /** Allocate the snapshot texture for a fireball (n x n grid, up to Kmax snapshots). */
  begin(fb, Kmax) {
    const n = fb.n;
    if (this.tex) this.tex.dispose();
    this.data = new Uint16Array(n * n * Kmax);
    this.tex = new THREE.Data3DTexture(this.data, n, n, Kmax);
    this.tex.format = THREE.RedFormat; this.tex.type = THREE.HalfFloatType;
    this.tex.minFilter = this.tex.magFilter = THREE.LinearFilter;
    this.tex.wrapS = this.tex.wrapT = this.tex.wrapR = THREE.ClampToEdgeWrapping;
    this.tex.unpackAlignment = 1; this.tex.needsUpdate = true;
    this.n = n; this.Kmax = Kmax; this.K = 0; this.fb = fb;
    const U = this.uniforms;
    U.sTex.value = this.tex; U.L.value = fb.grid.L; U.tau0.value = fb.tau_0; U.sigmaEta.value = fb.sigma_eta; U.yBeam.value = fb.y_beam;
    U.ready.value = 0;
  }

  /** Copy snapshots [K, fb.snap.tau.length) into the texture. */
  sync() {
    const fb = this.fb; if (!fb || !fb.snap) return;
    const S = fb.snap.s, nn = this.n * this.n, to = THREE.DataUtils.toHalfFloat;
    const K1 = Math.min(S.length, this.Kmax);
    if (K1 === this.K) return;
    for (let k = this.K; k < K1; k++) { const src = S[k], off = k * nn; for (let i = 0; i < nn; i++) this.data[off + i] = to(src[i]); }
    this.K = K1;
    const U = this.uniforms;
    // the texture has depth Kmax; only the first K1 layers are valid (nSnap), later times use Bjorken dilution
    U.nSnap.value = K1; U.depth.value = this.Kmax; U.tauLast.value = fb.snap.tau[K1 - 1];
    U.dTau.value = K1 > 1 ? (fb.snap.tau[K1 - 1] - fb.snap.tau[0]) / (K1 - 1) : 0.1;
    this.validK = K1;
    this.tex.needsUpdate = true; U.ready.value = 1;
  }

  update(t, camera) {
    const U = this.uniforms;
    U.t.value = t;
    this.mesh.visible = t > 0 && this.K > 0;
    this.mesh.updateMatrixWorld();
    U.camObj.value.copy(camera.position).applyMatrix4(this.mesh.matrixWorld.clone().invert());
  }
}
