// Web Worker: runs the multi-nucleon-transfer model off the main thread.
import { Nuclides } from "./physics/nuclides.js";
import { MNTModel, waveHistory, orientations } from "./physics/model.js";
import { Collision } from "./physics/trajectory.js";

let nuc = null, model = null;
const ready = fetch(new URL("../data/nuclides.json", import.meta.url)).then((r) => r.json()).then((J) => {
  nuc = new Nuclides(J); model = new MNTModel(nuc);
});

self.onmessage = async (ev) => {
  await ready;
  const m = ev.data;
  try {
    if (m.type === "system") {
      const { P, T, Ecm, params } = m;
      const r = model.run(P, T, Ecm, params);
      // orbit family for the trajectory map (trajectory only, sampled), middle orientation of deformed nuclei
      const ors = orientations(nuc, P, T, "fast"), q = ors[Math.floor(ors.length / 2)];
      const col = new Collision(P, T, Ecm, { ...params, dR1: q.dR1, dR2: q.dR2 });
      const orbits = r.waves.map((w) => {
        const h = col.run(w.l, { history: true });
        return { l: w.l, pCapture: h.pCapture, theta: h.theta, TKEL: h.TKEL, path: h.hist.filter((_, i) => i % 3 === 0).map((x) => [x[1], x[2], x[7]]),
          tailIn: col.coulombTail(Ecm, w.l * 197.3269804, col.o.r0) };
      });
      self.postMessage({ id: m.id, type: "system", result: {
        Ecm, P, T, col: r.col, waves: r.waves, exits: r.exits, sigCap: r.sigCap, sigTot: r.sigTot, sigFission: r.sigFission, ms: r.ms,
        primary: [...r.primary], final: [...r.final], orbits, mu: col.mu, k: Math.sqrt(col.k),
        deformed: ors.length > 1, orient: ors.map((o) => ({ c1: o.c1, c2: o.c2, w: o.w })) } });
    } else if (m.type === "wave") {
      const { P, T, Ecm, l, params } = m;
      const ors = orientations(nuc, P, T, "fast"), q = ors[Math.floor(ors.length / 2)];
      const w = waveHistory(nuc, P, T, Ecm, l, { ...params, dR1: q.dR1, dR2: q.dR2 });
      const col = w.col;
      self.postMessage({ id: m.id, type: "wave", result: { l, hist: w.hist, trapped: w.trapped, exitT: w.exitT,
        tailIn: col.coulombTail(Ecm, l * 197.3269804, col.o.r0), exits: w.res.exits, pCapture: w.res.pCapture,
        theta: w.res.theta, TKEL: w.res.TKEL, tContact: w.res.tContact, C1: col.pot.C1, C2: col.pot.C2, mu: col.mu } });
    }
  } catch (e) {
    self.postMessage({ id: m.id, type: "error", error: String(e && e.stack || e) });
  }
};
