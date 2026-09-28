// Renderer, camera rig, post-processing and the static set: floor, beam axis, reaction plane, cut-away detector.
// World axes: X = beam (physics z), Y = -physics x (so the projectile A, at x = -b/2, is above the axis as in the
// classic impact-parameter sketch), Z = physics y. 1 unit = 1 fm.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export const DET = { rIn: 20, rOut: 23, rCal0: 25.5, rCal1: 30, halfLen: 34 };

export class Stage {
  constructor(container) {
    this.container = container;
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    container.appendChild(r.domElement);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07090d);
    this.scene.fog = new THREE.Fog(0x07090d, 170, 330);
    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.35;

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.5, 900);
    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.enableDamping = true; this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 30; this.controls.maxDistance = 320; this.controls.enablePan = false;
    this.controls.target.set(0, 0, 0);

    this.composer = new EffectComposer(r);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.62);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this._buildSet();
    this.viewTween = null;
    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();
    this.setView("side", true);
  }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
    this.w = w; this.h = h;
    this.wide = w > 980;
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 1 ? 44 : 32;
    // on wide screens the overlay columns cover the sides: shift the image so the collision sits in the free
    // space between them (and above the timeline)
    if (this.wide) {
      const left = 18 + 360 + 10, right = 18 + 352 + 10, bottom = 90;
      const cx = (left + (w - right)) / 2, cy = (16 + (h - bottom)) / 2;
      this.camera.setViewOffset(w, h, w / 2 - cx, h / 2 - cy, w, h);
    } else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    if (this.view) this.setView(this.view, true);
  }

  /** Named camera positions; tweened. Side: beam horizontal, b vertical (as in the classic sketch). */
  setView(name, instant = false) {
    this.view = name;
    const d = this.wide ? 112 : this.w / this.h < 1 ? 92 : 100;
    const P = {
      side: [0, 0.27 * d, 0.96 * d],
      beam: [d * 0.98, 4, 0.01],
      orbit: [d * 0.62, d * 0.36, d * 0.72],
    }[name];
    const to = new THREE.Vector3(...P);
    this.autoOrbit = name === "orbit";
    if (instant) { this.viewTween = null; this.camera.position.copy(to); this.controls.update(); return; }
    this.viewTween = { from: this.camera.position.clone(), to, t: 0 };
  }

  _buildSet() {
    const S = this.scene;
    // key/rim lights for the metal parts (the fireball is self-luminous)
    const key = new THREE.DirectionalLight(0xcfe3ff, 0.9); key.position.set(-60, 90, 80); S.add(key);
    const rim = new THREE.DirectionalLight(0xffc68a, 0.5); rim.position.set(80, 20, -90); S.add(rim);
    S.add(new THREE.AmbientLight(0x404a5c, 0.35));

    // floor
    const floor = new THREE.Mesh(new THREE.CircleGeometry(260, 96),
      new THREE.MeshStandardMaterial({ color: 0x0b0e14, roughness: 0.42, metalness: 0.55 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -DET.rCal1 - 7; S.add(floor);
    const grid = new THREE.GridHelper(420, 42, 0x2a3446, 0x151b26);
    grid.position.y = floor.position.y + 0.02; grid.material.transparent = true; grid.material.opacity = 0.5; S.add(grid);
    this.floorY = floor.position.y;

    // beam axis: dashed line, as in the classic impact-parameter sketch
    const axGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-120, 0, 0), new THREE.Vector3(120, 0, 0)]);
    const axis = new THREE.Line(axGeo, new THREE.LineDashedMaterial({ color: 0xffb14a, dashSize: 2.2, gapSize: 1.6, transparent: true, opacity: 0.45 }));
    axis.computeLineDistances(); S.add(axis);

    // reaction plane (beam + impact parameter): a faint glass sheet
    const rp = new THREE.Mesh(new THREE.PlaneGeometry(76, 50),
      new THREE.MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.035, side: THREE.DoubleSide, depthWrite: false }));
    S.add(rp); this.reactionPlane = rp;
    const rpEdge = new THREE.LineSegments(new THREE.EdgesGeometry(rp.geometry),
      new THREE.LineBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.16 }));
    rp.add(rpEdge);

    this._buildDetector();
  }

  /** A generic cut-away barrel detector (back half only): two tracking layers and a segmented calorimeter. */
  _buildDetector() {
    const g = (this.detector = new THREE.Group());
    const L = DET.halfLen;
    // tracker layers as line cages
    const cage = new THREE.LineBasicMaterial({ color: 0x6f8fb6, transparent: true, opacity: 0.11 });
    for (const r of [DET.rIn, DET.rOut]) {
      const pts = [];
      const nPhi = 48;
      for (let k = 0; k <= 10; k++) {          // hoops
        const x = -L + (2 * L * k) / 10;
        for (let i = 0; i < nPhi; i++) {
          const a0 = Math.PI + (Math.PI * i) / nPhi, a1 = Math.PI + (Math.PI * (i + 1)) / nPhi;
          pts.push(new THREE.Vector3(x, r * Math.cos(a0), r * Math.sin(a0)), new THREE.Vector3(x, r * Math.cos(a1), r * Math.sin(a1)));
        }
      }
      for (let i = 0; i <= 24; i++) {          // staves
        const a = Math.PI + (Math.PI * i) / 24;
        pts.push(new THREE.Vector3(-L, r * Math.cos(a), r * Math.sin(a)), new THREE.Vector3(L, r * Math.cos(a), r * Math.sin(a)));
      }
      g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), cage));
    }
    // calorimeter towers (instanced boxes), back half
    const nPhi = 28, nX = 16;
    const box = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x121823, roughness: 0.45, metalness: 0.6, emissive: 0xffffff, emissiveIntensity: 0 });
    mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aHeat;\nvarying float vHeat;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvHeat = aHeat;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vHeat;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance = vec3(1.0, 0.62, 0.25) * vHeat;");
    };
    const towers = new THREE.InstancedMesh(box, mat, nPhi * nX);
    const heat = new THREE.InstancedBufferAttribute(new Float32Array(nPhi * nX), 1);
    box.setAttribute("aHeat", heat);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
    const dPhi = Math.PI / nPhi, rc = 0.5 * (DET.rCal0 + DET.rCal1), dx = (2 * L) / nX;
    let k = 0;
    for (let i = 0; i < nPhi; i++) for (let j = 0; j < nX; j++) {
      const a = Math.PI + (i + 0.5) * dPhi;
      pos.set(-L + (j + 0.5) * dx, rc * Math.cos(a), rc * Math.sin(a));
      q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);
      sc.set(dx * 0.92, DET.rCal1 - DET.rCal0, rc * dPhi * 0.9);
      m.compose(pos, q, sc); towers.setMatrixAt(k++, m);
    }
    this.towers = { mesh: towers, heat, nPhi, nX, dPhi, dx, L };
    g.add(towers);
    // end rings
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x2a3446, roughness: 0.3, metalness: 0.85 });
    for (const x of [-L - 1.2, L + 1.2]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(DET.rIn - 1, DET.rCal1 + 1, 64, 1, Math.PI, Math.PI), ringMat);
      ring.rotation.y = Math.PI / 2; ring.position.x = x;
      // RingGeometry lies in XY; rotate so its normal is the beam axis, then orient the half ring to the back
      ring.rotation.set(0, Math.PI / 2, Math.PI / 2);
      ring.material.side = THREE.DoubleSide; g.add(ring);
    }
    this.scene.add(g);
  }

  /** Deposit energy in the calorimeter tower hit at azimuth phi (physics) and pseudorapidity eta. */
  towerIndex(phi, xAlongBeam) {
    const T = this.towers;
    // physics phi -> world angle a with (Y, Z) = (cos a, sin a); Y = -x_phys, Z = y_phys  =>  a = pi - phi
    let a = Math.PI - phi; a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (a < Math.PI) return -1;                     // front half is cut away
    const i = Math.floor((a - Math.PI) / T.dPhi), j = Math.floor((xAlongBeam + T.L) / T.dx);
    if (i < 0 || i >= T.nPhi || j < 0 || j >= T.nX) return -1;
    return i * T.nX + j;
  }

  tick(dt) {
    if (this.viewTween) {
      const tw = this.viewTween; tw.t = Math.min(1, tw.t + dt / 0.9);
      const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
      this.camera.position.lerpVectors(tw.from, tw.to, e);
      if (tw.t >= 1) this.viewTween = null;
    } else if (this.autoOrbit) {
      const p = this.camera.position, a = 0.06 * dt;
      p.set(p.x * Math.cos(a) - p.z * Math.sin(a), p.y, p.x * Math.sin(a) + p.z * Math.cos(a));
    }
    this.controls.update();
  }

  render() { this.composer.render(); }

  /** screen position of a world point (px), or null if behind the camera */
  project(v) {
    const p = v.clone().project(this.camera);
    if (p.z > 1) return null;
    return [(p.x * 0.5 + 0.5) * this.w, (-p.y * 0.5 + 0.5) * this.h];
  }
}
