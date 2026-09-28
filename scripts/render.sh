#!/usr/bin/env bash
# Full pipeline: event cache -> Blender scene -> Cycles (Metal) frames -> MP4.
#   scripts/render.sh PRESET [--res 1920x1080] [--samples 32] [--frames PRE POST] [--seed N] [--start S --end E]
# Outputs: cache/<PRESET>/, renders/<PRESET>/<PRESET>.blend, renders/<PRESET>/frames/f_####.png, renders/<PRESET>/<PRESET>.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
PRESET="$1"; shift
RES=1920x1080; SAMPLES=32; PRE=60; POST=540; SEED=1; START=""; END=""
while [[ $# -gt 0 ]]; do case "$1" in
  --res) RES="$2"; shift 2;; --samples) SAMPLES="$2"; shift 2;; --seed) SEED="$2"; shift 2;;
  --frames) PRE="$2"; POST="$3"; shift 3;; --start) START="$2"; shift 2;; --end) END="$2"; shift 2;;
  *) echo "unknown option $1"; exit 1;; esac; done
CACHE="cache/$PRESET"; OUT="renders/$PRESET"; mkdir -p "$OUT/frames"
if [[ ! -f "$CACHE/meta.json" ]]; then
  .venv/bin/python scripts/run_event.py --preset "$PRESET" --seed "$SEED" --full "$CACHE" --frames "$PRE" "$POST"
fi
"$BLENDER" -b --python scripts/build_scene.py -- "$CACHE" "$OUT/$PRESET.blend" 2>&1 | grep -E "Traceback|Error|scene saved" || true
ARGS=(--out "$OUT/frames" --engine CYCLES --samples "$SAMPLES" --res "$RES")
[[ -n "$START" ]] && ARGS+=(--start "$START"); [[ -n "$END" ]] && ARGS+=(--end "$END")
"$BLENDER" -b "$OUT/$PRESET.blend" --python scripts/render_setup.py -- "${ARGS[@]}" 2>&1 | grep --line-buffered -E "Traceback|Error|render_setup"
FPS=$(python3 -c "import json;print(json.load(open('$CACHE/meta.json')).get('fps',30))")
ffmpeg -y -loglevel error -framerate "$FPS" -start_number "${START:-1}" -i "$OUT/frames/f_%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 "$OUT/$PRESET.mp4"
echo "video: $OUT/$PRESET.mp4"
