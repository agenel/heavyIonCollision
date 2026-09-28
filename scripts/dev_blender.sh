#!/usr/bin/env bash
# Open Blender with the hic_viz panel loaded from this repo (N-panel > "Heavy Ion").
cd "$(dirname "$0")/.." && exec "${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}" --python scripts/dev_register.py "$@"
