"""Render a hic .blend frame by frame (background mode). Re-attaches the per-frame streaming (handlers are not stored
in .blend files) and loops frame_set + still render, skipping frames that already exist (resumable).

Why not `blender -a`: in Blender 5.2 an animation render of a *reloaded* file does not pick up point-cloud attribute
changes made in frame_change_pre handlers (meshes are fine); frame_set + write_still does (tested 2026-09-23).

   blender -b scene.blend --python scripts/render_setup.py -- --out DIR [--start S] [--end E]
           [--engine CYCLES] [--samples 32] [--res 1920x1080] [--overwrite]
"""
import os, sys, time
import bpy
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, ROOT)
from hic_viz import scene as hs  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
opt = lambda k, d: argv[argv.index(k) + 1] if k in argv else d
hs.load_post()
if not hs._CTX:
    raise SystemExit("render_setup: no hic cache attached to this .blend (scene['hic_cache_dir'] missing or moved)")
res = tuple(int(v) for v in opt("--res", "1920x1080").split("x"))
hs.setup_render(engine=opt("--engine", "CYCLES"), resolution=res, samples=int(opt("--samples", "32")))
sc = bpy.context.scene
if sc.render.engine == 'CYCLES':
    sc.cycles.use_denoising = True
out = os.path.abspath(opt("--out", os.path.join(os.path.dirname(bpy.data.filepath), "frames")))
os.makedirs(out, exist_ok=True)
start, end = int(opt("--start", sc.frame_start)), int(opt("--end", sc.frame_end))
print(f"render_setup: frames {start}-{end}, {res[0]}x{res[1]}, {sc.render.engine} -> {out}", flush=True)
t0 = time.time(); done = 0
for f in range(start, end + 1):
    path = os.path.join(out, f"f_{f:04d}.png")
    if os.path.exists(path) and "--overwrite" not in argv:
        continue
    sc.frame_set(f); sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    done += 1
    if done % 10 == 1:
        el = time.time() - t0
        print(f"render_setup: frame {f} ({done} rendered, {el/done:.1f} s/frame, ~{el/done*(end-f)/60:.0f} min left)", flush=True)
print(f"render_setup: finished {done} frames in {(time.time()-t0)/60:.1f} min", flush=True)
