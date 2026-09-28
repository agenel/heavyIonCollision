#!/bin/bash
# Download the raw inputs of the multi-nucleon-transfer explorer into data/raw/mnt (not committed).
# Sources and licences: docs/mnt/03-nuclear-inputs.md §6 and docs/mnt/02-measured-reactions.md §3.2.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data/raw/mnt/exfor
cd data/raw/mnt
# existing files are kept (re-run is cheap); a failed download leaves no partial file
get() { [ -s "$1" ] && { echo "  $1 (cached)"; return 0; }
        curl -sSL -A "curl/8" --fail --retry 3 -o "$1.part" "$2" && mv "$1.part" "$1" && echo "  $1 $(wc -c < "$1") B" || { rm -f "$1.part"; echo "  $1 FAILED"; }; }

echo "nuclear tables"
get mass-frdm12.dat   https://raw.githubusercontent.com/IAEA-NDS/RIPL-4/main/masses/mass-frdm12.dat   # AME2020 + FRDM2012
get mass-ws4.dat      https://raw.githubusercontent.com/IAEA-NDS/RIPL-4/main/masses/mass-ws4.dat      # WS4
get charge_radii.csv  https://www-nds.iaea.org/radii/charge_radii.csv                                 # Angeli-Marinova
get BFWS4.txt         http://www.imqmd.com/mass/BFWS4.txt                                            # WS4 fission barriers

echo "EXFOR entries (IAEA Dataexplorer API)"
for id in C2178 F1274 D0799 C2398 C2922 C2534 A0031 C2035 C2558 C2552 C2556 D0776 C2515 C1829 F1350 D8038 \
          D0845 D0843 D0816 O1046 O1042 O1043 O1049 A0909 D8060 D8119 C1901 C2531 C2533 A0015 A0023 A0046; do
  get "exfor/$id.json" "https://nds.iaea.org/dataexplorer/api/exfor/entry/$id"
done
shasum -a 256 *.dat *.csv *.txt > SHA256SUMS
