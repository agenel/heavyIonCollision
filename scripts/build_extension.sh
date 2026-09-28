#!/usr/bin/env bash
# Build the installable Blender extension zip (hic_viz with hic_core bundled inside) into dist/.
#   scripts/build_extension.sh [--install]
set -euo pipefail
cd "$(dirname "$0")/.."
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
STAGE="$(mktemp -d)/hic_viz"; mkdir -p "$STAGE" dist
rsync -a --exclude "__pycache__" --exclude "hic_core" hic_viz/ "$STAGE/"
rsync -a --exclude "__pycache__" hic_core/ "$STAGE/hic_core/"     # real copy (the repo uses a symlink)
( cd "$STAGE" && "$BLENDER" --command extension validate . && "$BLENDER" --command extension build --output-dir "$OLDPWD/dist" )
ls -la dist/
if [[ "${1:-}" == "--install" ]]; then
  "$BLENDER" --command extension install-file -r user_default -e dist/hic_viz-*.zip
fi
