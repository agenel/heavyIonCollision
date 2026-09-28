#!/usr/bin/env python3
"""Side-by-side comparison of ONE collision at several impact parameters: nucleons + fireball, no hadrons.

The same random seed is used for every panel, so the nuclei are identical and only b changes. Each panel is portrait
(beam vertical, impact parameter horizontal) and all panels share one spatial scale (framed for the largest b), so
fireball sizes are directly comparable. Panels are joined left to right into one video.

   python scripts/compare_b.py [--system Pb Pb] [--energy 5020] [--b 0 7 12] [--seed 1]
                               [--panel 640x1080] [--samples 24] [--frames 75 375] [--t-end 15] [--out renders/compare_b]
"""
import argparse, os, subprocess, sys, time
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
from hic_core.event import Event, EventParams
from hic_core.cache import write_cache

ap = argparse.ArgumentParser()
ap.add_argument("--system", nargs=2, default=["Pb", "Pb"]); ap.add_argument("--energy", type=float, default=5020.0)
ap.add_argument("--b", type=float, nargs="+", default=[0.0, 7.0, 12.0]); ap.add_argument("--seed", type=int, default=1)
ap.add_argument("--panel", default="640x1080"); ap.add_argument("--samples", type=int, default=24)
ap.add_argument("--frames", type=int, nargs=2, default=[75, 375]); ap.add_argument("--t-end", type=float, default=15.0)
ap.add_argument("--tilt", type=float, default=30.0, help="camera elevation (deg) so the nuclei are seen as discs")
ap.add_argument("--t-approach", type=float, default=8.0); ap.add_argument("--warp", type=float, default=1.3)
ap.add_argument("--out", default=os.path.join(ROOT, "renders", "compare_b"))
ap.add_argument("--preview", type=int, default=0, help="only render N evenly spaced frames per panel (quick check)")
a = ap.parse_args()
BL = os.environ.get("BLENDER", "/Applications/Blender.app/Contents/MacOS/Blender")
os.makedirs(a.out, exist_ok=True)
t0 = time.time()
panels = []
for k, b in enumerate(a.b):
    tag = f"b{b:g}".replace(".", "p")
    cache = os.path.join(ROOT, "cache", "compare_b", tag)
    ep = EventParams(A=a.system[0], B=a.system[1], sqrt_snn=a.energy, b=b, seed=a.seed, show_hadrons=False,
                     n_pre_frames=a.frames[0], n_post_frames=a.frames[1], t_end=a.t_end, t_approach=a.t_approach,
                     warp_power=a.warp, vol_nx=64)
    ev = Event(ep).run()
    write_cache(ev, cache)
    i = ev.info
    print(f"b = {b:4.1f} fm: N_part {i['npart']:3d}, N_coll {i['ncoll']:4d}, eps2 {i['eps2']:.2f}, T0 {i['T0_MeV']:.0f} MeV, "
          f"QGP until {i['tau_QGP_end']:.1f} fm/c", flush=True)
    overlays = ["hud"] + (["skey"] if k == 0 else []) + (["tkey"] if k == len(a.b) - 1 else [])
    blend = os.path.join(a.out, f"{tag}.blend")
    subprocess.run([BL, "-b", "--python", os.path.join(ROOT, "scripts", "build_scene.py"), "--", cache, blend,
                    "--camera", "front", "--move", "follow", "--frame-b", str(max(a.b)), "--overlays", ",".join(overlays),
                    "--compact", "--res", a.panel, "--tilt", str(a.tilt)], check=True, capture_output=True)
    panels.append((tag, blend))
nF = a.frames[0] + a.frames[1] + 1
rng = [] if not a.preview else ["--start", "1", "--end", str(nF)]
for tag, blend in panels:
    frames_dir = os.path.join(a.out, tag)
    cmd = [BL, "-b", blend, "--python", os.path.join(ROOT, "scripts", "render_setup.py"), "--",
           "--out", frames_dir, "--engine", "CYCLES", "--samples", str(a.samples), "--res", a.panel]
    if a.preview:
        for f in sorted({int(round(1 + j * (nF - 1) / (a.preview - 1))) for j in range(a.preview)}):
            subprocess.run(cmd + ["--start", str(f), "--end", str(f)], check=True, capture_output=True)
    else:
        subprocess.run(cmd, check=True)
    print(f"rendered {tag} ({(time.time() - t0) / 60:.1f} min)", flush=True)
if a.preview:
    print("preview frames in", a.out); sys.exit()
# join panels left to right with a 4 px dark divider
inputs = []
for tag, _ in panels:
    inputs += ["-framerate", "30", "-i", os.path.join(a.out, tag, "f_%04d.png")]
n = len(panels)
flt = "".join(f"[{j}:v]pad=iw+{4 if j < n - 1 else 0}:ih:0:0:color=0x101014[p{j}];" for j in range(n)) + \
      "".join(f"[p{j}]" for j in range(n)) + f"hstack=inputs={n},scale=trunc(iw/2)*2:trunc(ih/2)*2[v]"
out = os.path.join(a.out, "compare_b.mp4")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", flt, "-map", "[v]", "-c:v", "libx264",
                "-pix_fmt", "yuv420p", "-crf", "18", out], check=True)
print(f"video: {out} ({(time.time() - t0) / 60:.1f} min total)")
