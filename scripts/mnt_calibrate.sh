#!/bin/bash
# Parallel grid-search calibration of the MNT model, then validation of all datasets.
set -euo pipefail
cd "$(dirname "$0")/.."
N=${1:-8}
OUT=$(mktemp -t mntcal)
for i in $(seq 0 $((N-1))); do node scripts/mnt_validate.mjs --part $i/$N >> "$OUT" & done
wait
node scripts/mnt_validate.mjs --collect "$OUT"
