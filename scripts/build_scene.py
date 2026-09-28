"""Build the Blender scene from an event cache directory (run inside Blender).

  blender --background --python scripts/build_scene.py -- CACHE_DIR OUT.blend [--preview N] [--engine EEVEE|CYCLES]

Creates: nucleon/hadron point cloud streamed per frame, QGP volume (OpenVDB sequence; .npy volumes are
converted with Blender's bundled openvdb), species materials, camera rig, HUD text, and frame handlers.
1 Blender unit = 1 fm. Handlers are re-registered by hic_viz or scripts/render_setup.py at render time.
"""
import bpy, sys, os, json, math
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))
from hic_viz import scene as hs  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) < 2:
    raise SystemExit("usage: build_scene.py -- CACHE_DIR OUT.blend [--preview N] [--engine EEVEE|CYCLES] [--res WxH] [--camera side|front|beam|iso] [--move static|follow|orbit] [--frame-b FM] [--overlays hud,tkey,skey|none] [--compact]")
cache_dir, out_blend = os.path.abspath(argv[0]), os.path.abspath(argv[1])
preview = int(argv[argv.index("--preview") + 1]) if "--preview" in argv else 0
engine = argv[argv.index("--engine") + 1] if "--engine" in argv else "EEVEE"
res = argv[argv.index("--res") + 1] if "--res" in argv else "960x540"

hs.reset_scene()
_look = json.load(open(os.path.join(cache_dir, "meta.json"))).get("look", {})   # preset defaults, if any
_opt = lambda k, d=None: argv[argv.index(k) + 1] if k in argv else d
ctx = hs.build_from_cache(cache_dir, camera=_opt("--camera", _look.get("camera", "side")),
                          camera_move=_opt("--move", _look.get("move", "follow")),
                          resolution=tuple(int(v) for v in res.split("x")),
                          frame_b=float(_opt("--frame-b")) if _opt("--frame-b") else None,
                          overlays=tuple(_opt("--overlays", "hud,tkey,skey").split(",")) if _opt("--overlays") != "none" else (),
                          compact_hud="--compact" in argv, tilt_deg=float(_opt("--tilt", 0)))
hs.setup_render(engine=engine, resolution=tuple(int(v) for v in res.split("x")))
bpy.ops.wm.save_as_mainfile(filepath=out_blend)
print("scene saved:", out_blend)
if preview:
    sc = bpy.context.scene
    frames = sorted(set(int(round(f)) for f in np.linspace(sc.frame_start, sc.frame_end, preview)))
    out_dir = os.path.join(os.path.dirname(out_blend), os.path.splitext(os.path.basename(out_blend))[0] + "_preview")
    os.makedirs(out_dir, exist_ok=True)
    for f in frames:
        sc.frame_set(f)
        sc.render.filepath = os.path.join(out_dir, f"preview_{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print("rendered", sc.render.filepath)
