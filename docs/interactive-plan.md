# Interactive explorer — "The Little Bang, opened up"

Goal: a toy you *play with*, in the spirit of sael.net/plane-of-focus, where every
number on screen still comes from the cited physics in `hic_core` (formulas in
`docs/formulas.tex`).

## 1. What the reference does (and why it works)

Examined 2026-09-26. Single HTML page, ~90 KB inline JS, three.js r183, no
downloaded models: all geometry is procedural (RoundedBox, SimplexNoise). Post:
UnrealBloom + GTAO ambient occlusion + tone-mapped output pass.

| Ingredient | In the reference | Why it matters |
|---|---|---|
| One hero object, cut open | Lens on an optical bench, "Exploded / Assembled" | You see the mechanism, not just the result |
| One main control | Focus ring (drag it; also a slider and three presets) | Cause is obvious, response is instant |
| Second control that changes the rules | Aperture f/2, f/5.6, f/16 | Invites comparison |
| Live readouts | Focus 54 cm, Aperture, Sharp zone 1.5 cm | Real numbers, mono font, units |
| Narrative card that rewrites itself | "Only the cabin sits on the plane… Sharp zone 1.5 cm" | Explains *this* state in one sentence, key words colour-coded |
| Labels pinned to 3D parts | "Focus group", "Iris f/2", "Plane of focus 54 cm" | Vocabulary taught in place |
| The effect made visible | Glowing sheet through the diorama, ray fans, blur discs on the glass | The invisible concept becomes an object |
| Payoff screens | Film strip of photos + upside-down image on the ground glass | Links the mechanism to what you actually get |
| "?" explainer | Four short sections, plain language | Depth for those who want it |
| Look | Dark showroom, warm/cool accents, bloom on glass, soft AO, reflections | Premium, calm, readable |

## 2. Translation to a heavy-ion collision

| Reference | Heavy-ion explorer |
|---|---|
| Lens on optical bench | Beam line through a cut-away detector (barrel layers, ALICE/STAR-like, stylised) on a dark stage |
| Focus ring | **Impact parameter b** (drag the ring on the beam pipe, slider, presets Central / Mid-central / Peripheral) |
| Aperture | **Collision system** (Pb–Pb 5.02 TeV, Au–Au 200 GeV, Xe–Xe, U–U tip-tip/body-body, O–O) |
| Assembled / Exploded | **Time**: scrubber from approach → impact → QGP → hadronisation → freeze-out, play/pause; plus **"True scale"** toggle (γ ≈ 2700: the pancakes really are 0.005 fm thick) |
| Plane of focus sheet | **Reaction plane** sheet + the almond-shaped overlap zone lit up in the beam's-eye view |
| Ray fans | Pressure-gradient arrows on the fireball: longer in-plane than out-of-plane (why v₂ exists) |
| Blur discs on glass | **Detector screen**: dN/dφ histogram filling up, cos 2φ fit drawn on top → v₂ appears |
| Film strip | Strip of five b values (0, 4, 7, 10, 13 fm) with thumbnails of the overlap; click to jump |
| Readouts | b, centrality %, N_part, N_coll, ε₂, T_max, QGP lifetime, dN_ch/dη |
| Narrative card | "At b = 7 fm, 236 of 416 nucleons collide. The overlap is an almond (ε₂ = 0.27): pressure pushes harder along x, so particles come out preferentially in-plane (v₂ ≈ 0.09)." |
| 3D labels | Spectators, Participants, Reaction plane, QGP 310 MeV, Hadron gas, Beam pipe |

Participants glow and fuse into the fireball; spectators fly on untouched. The
fireball colour is blackbody from T (same 13 K/MeV map as Blender), bloom does the
rest. Hadron tracks are **off by default** (per the "no hundreds of particles"
direction) — the detector shows the distribution as a histogram; tracks are an
optional toggle.

## 3. Technology decision

**three.js single page (recommended), not Unity.**

- Matches the reference exactly: runs in any browser, shareable link, loads in a
  second, no install.
- I can iterate and verify it myself in the browser pane (screenshots, console);
  Unity 6000.6 work goes through the Editor GUI and 10–30 MB WebGL builds.
- The physics is small: `hic_core` is ~1000 lines of numpy; the parts needed live
  (Woods–Saxon sampling, Glauber, TRENTo grid, EoS table, Level-A fireball) port
  to ~800 lines of JS and run in milliseconds (208×208 nucleon pair test ≈ 43k
  distance checks).
- Unity would win for a native/VR app or HDRP cinematic quality. Blender stays
  the tool for offline cinematic renders.

## 4. Keeping it scientifically honest

- **Same data files:** the page is built from `hic_core/data/*.json` (nuclei,
  σ_NN, HotQCD EoS, multiplicity, centrality tables, flow). No new numbers.
- **Expensive steps pre-computed in Python:** the flow-gain / a_n calibration
  (which needs hadron sampling) is tabulated per system vs centrality by a new
  `scripts/export_web.py` and looked up in JS.
- **Cross-check test:** `web/test/` (Node, no browser) runs the JS physics for
  fixed b and compares against Python reference values exported by the same
  script: ⟨N_part⟩(b), ⟨N_coll⟩(b), ⟨ε₂⟩(b), T_max, QGP lifetime. Tolerance =
  statistical error (different RNGs, so compare means over 200 events).
- Visual-only choices stay marked (V) as in `formulas.tex`; the "?" panel lists
  sources with arXiv links.

## 5. Architecture

```
web/
  index.html              single-page app (three.js from jsdelivr, ES modules inlined at build)
  src/physics/            rng, nuclei, glauber, trento, eos, fireball  (ports of hic_core)
  src/scene/              stage, detector, beam line, nucleons (InstancedMesh),
                          fireball (ray-marched 3D texture), labels, screens, post-FX
  src/ui/                 controls, readouts, narrative, explainer, film strip
  data/web_data.json      generated by scripts/export_web.py
  test/physics.test.mjs   Node cross-check vs Python refs
scripts/export_web.py     data bundle + calibration tables + reference values
scripts/build_web.sh      inline everything into dist/little-bang.html
```

Event pipeline on each b/system change (Web Worker, target < 150 ms):
Glauber event (same seed → same nuclei, like `compare_b`) → TRENTo s(x,y) on 64²
→ Level-A fireball evolved to freeze-out, stored as T(x,y,τ) frames → main thread
only interpolates in time while scrubbing.

## 6. Milestones

| # | Deliverable | Done when |
|---|---|---|
| W1 | JS physics port + `export_web.py` + Node cross-check | All cross-checks within statistical error |
| W2 | Stage & look: detector hall, beam line, nucleons, fireball volume, bloom/AO, camera orbit | 60 fps on the M4 at 1440p; screenshot review |
| W3 | Interaction: b ring/slider/presets, system picker, time scrubber, readouts, narrative card, 3D labels | Every control changes the scene in < 150 ms |
| W4 | Payoff: beam's-eye overlap screen, detector dN/dφ + v₂ fit, film strip, "?" explainer with sources, true-scale toggle | Narrative numbers match readouts match Python |
| W5 | Polish & ship: phone layout, reduced motion, light/dark, single-file build, publish as a private claude.ai link | Works on phone and desktop; link shared |

Open choices (sensible defaults chosen, can change): stylised generic detector
(not a real experiment's branding); hadron tracks off by default; English text.

## 7. Status (2026-09-26): built

`web/` implements W1–W5. What changed from the plan while building:

- **Layout.** Two overlay columns (story, readouts, b-map on the left; controls and beam's-eye view on the right), the
  detector histogram floating bottom-centre, the timeline at the bottom; the camera is offset so the collision sits in the
  free space between the columns. Phones get one column with the 3D view right after the title.
- **Impact-parameter map** (after the user's reference picture, HQP 2008 Dubna): side view, dashed beam axis, projectile
  dragged vertically, zones central / mid-central / peripheral / grazing / ultra-peripheral from the centrality curve, and
  the Coulomb deflection θ = 2 Z_A Z_B αħc / (b p β) printed on the path (µrad at RHIC/LHC, so paths are straight).
  At b beyond the inelastic edge no nucleons collide and the story switches to the ultra-peripheral (photon) picture.
- **Nucleus shape** control: Rest frame (no contraction), Pancake (default: nuclei flattened to ≥ 1 fm, nucleons drawn
  round) and True γ (everything contracted by 1/γ). Requested by the user: nucleons should look spherical.
- **Custom nucleus**: any A from 10 to 260, spherical Woods–Saxon with R = 1.12A^⅓ − 0.86A^−⅓ fm, a = 0.54 fm,
  Z on the stability line; centrality from the optical Glauber model (checked against the Monte Carlo curve: ≤ 2 %
  absolute for Pb/Au up to 80 %, ≤ 5 % for O); flow calibration borrowed from the nearest calibrated system at equal
  centrality (stated in the page).
- **Particles drawn**: the viewer picks how many of the N = 1.6 dN_ch/dη particles in |η| < 0.8 are drawn flying to the
  detector; the histogram and the measured v₂ ± √(1/2N) use the drawn ones.
- **Centrality for fixed b** is now continuous in Python too (`glauber.centrality_of_b`): table bins interpolated in b²,
  Monte Carlo calibration for untabled systems. The old fallback used σ = 700 fm² for every untabled system (O–O at b = 2 fm
  came out 1.8 % instead of 8.6 %).
- **Fireball** runs live on the main thread in ~7 ms slices during the approach (0.3–0.5 s total with Δτ = 0.05 fm/c; the
  Python step 0.02 fm/c changes T_max by < 0.1 %).

Cross-check (`node web/test/physics.test.mjs`): 279 checks pass — Glauber ⟨N_part⟩, ⟨N_coll⟩, ⟨ε₂⟩, ⟨ε₃⟩ for 7 systems × 3 b
within 4σ; TRENTo integral; the data lookup exactly (dN_ch/dη, blast-wave, v_n targets); the fireball evolution from the
same initial grid (T_max, R, ε₂ at 7 times and the QGP end time) to < 0.2 %; optical vs Monte Carlo centrality.
