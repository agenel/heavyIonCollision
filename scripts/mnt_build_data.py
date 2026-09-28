"""Build the data files of the multi-nucleon-transfer explorer (web/mnt/data/) from the raw downloads.

    scripts/mnt_fetch.sh                  # once: tables + EXFOR entries into data/raw/mnt (not committed)
    python3 scripts/mnt_build_data.py

Outputs (every file carries a "meta" block with sources and SHA-256 of the raw inputs):
- nuclides.json   one row per (Z, N): mass excess (AME2020 measured/extrapolated, else FRDM2012), WS4 mass excess,
                  FRDM2012 beta2/beta4 and microscopic energy, WS4 fission barrier, measured charge radius.
- exfor.json      measured cross sections of the catalogued reactions, normalised to mb, with bibliography.
- catalogue.json  all measured reactions of docs/mnt/02-measured-reactions.md §1 (one row per paper and energy),
                  expanded into concrete projectile-target pairs, plus the verified bibliography of §4.
"""
import hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw", "mnt")
OUT = os.path.join(ROOT, "web", "mnt", "data")
CAT_MD = os.path.join(ROOT, "docs", "mnt", "02-measured-reactions.md")


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def fnum(s):
    s = s.strip()
    return float(s) if s else None


# ------------------------------------------------------------------ nuclides
def read_ripl_masses(path, with_beta=True):
    """RIPL-4 masses/mass-*.dat, format (2i4,1x,a2,1x,i1,4f10.3,4f8.3):
    Z A symbol flag Mexp Err Mth Emic beta2 beta3 beta4 beta6 (flag 2 measured, 1 AME extrapolated, 0 theory only)."""
    rows = {}
    for line in open(path):
        if line.startswith("#") or len(line) < 13:
            continue
        Z, A = int(line[0:4]), int(line[4:8])
        sym, flag = line[9:11].strip(), int(line[12:13] or 0)
        mexp, err, mth, emic = (fnum(line[13 + 10 * i:23 + 10 * i]) for i in range(4))
        betas = [fnum(line[53 + 8 * i:61 + 8 * i]) for i in range(4)] if with_beta else [None] * 4
        rows[(Z, A)] = dict(sym=sym, flag=flag, mexp=mexp, err=err, mth=mth, emic=emic, b2=betas[0], b4=betas[2])
    return rows


def read_bf(path):
    out = {}
    for line in open(path):
        p = line.split()
        if len(p) == 4 and p[0].isdigit():
            A, Z = int(p[0]), int(p[1])
            out[(Z, A)] = float(p[3])          # BF_WS4+DB (includes the deformation/shell term)
    return out


def read_radii(path):
    out = {}
    for i, line in enumerate(open(path)):
        if i == 0:
            continue
        p = line.strip().split(",")
        if len(p) >= 5 and p[4]:
            out[(int(p[0]), int(p[3]))] = float(p[4])
    return out


def build_nuclides():
    frdm = read_ripl_masses(os.path.join(RAW, "mass-frdm12.dat"))
    ws4 = read_ripl_masses(os.path.join(RAW, "mass-ws4.dat"), with_beta=False)
    bf = read_bf(os.path.join(RAW, "BFWS4.txt"))
    rch = read_radii(os.path.join(RAW, "charge_radii.csv"))
    cols = {k: [] for k in ("Z", "N", "dm", "src", "dmWS4", "b2", "b4", "emic", "bf", "rch")}
    sym = {}
    for (Z, A), r in sorted(frdm.items()):
        if Z < 1:
            continue
        dm = r["mexp"] if r["flag"] >= 1 and r["mexp"] is not None else r["mth"]
        if dm is None:
            continue
        w = ws4.get((Z, A), {})
        wdm = w.get("mth") if w.get("mth") is not None else w.get("mexp")
        cols["Z"].append(Z); cols["N"].append(A - Z); cols["dm"].append(round(dm, 3))
        cols["src"].append(r["flag"] if r["mexp"] is not None and r["flag"] >= 1 else 0)
        cols["dmWS4"].append(None if wdm is None else round(wdm, 3))
        cols["b2"].append(r["b2"]); cols["b4"].append(r["b4"])
        cols["emic"].append(r["emic"]); cols["bf"].append(bf.get((Z, A))); cols["rch"].append(rch.get((Z, A)))
        sym[Z] = r["sym"]
    meta = dict(
        columns=dict(dm="mass excess (MeV): AME2020 where measured (src 2) or AME-extrapolated (src 1), else FRDM2012 (src 0)",
                     dmWS4="WS4 mass excess (MeV)", b2="FRDM2012 beta2", b4="FRDM2012 beta4",
                     emic="FRDM2012 microscopic (shell + pairing) energy (MeV)", bf="WS4 fission barrier incl. deformation term (MeV)",
                     rch="measured rms charge radius (fm)"),
        sources=["M. Wang, W.J. Huang, F.G. Kondev, G. Audi, S. Naimi, Chin. Phys. C 45, 030003 (2021) (AME2020)",
                 "P. Möller, A.J. Sierk, T. Ichikawa, H. Sagawa, At. Data Nucl. Data Tables 109-110, 1 (2016) (FRDM2012)",
                 "N. Wang, M. Liu, X. Wu, J. Meng, Phys. Lett. B 734, 215 (2014) (WS4)",
                 "N. Wang, M. Liu, Chin. Phys. C 48, 094103 (2024) (WS4 fission barriers)",
                 "I. Angeli, K.P. Marinova, At. Data Nucl. Data Tables 99, 69 (2013) (charge radii)",
                 "IAEA RIPL-4 masses/mass-frdm12.dat, masses/mass-ws4.dat (github.com/IAEA-NDS/RIPL-4)"],
        sha256={f: sha(os.path.join(RAW, f)) for f in ("mass-frdm12.dat", "mass-ws4.dat", "BFWS4.txt", "charge_radii.csv")})
    return dict(meta=meta, symbols={str(z): s for z, s in sorted(sym.items())}, **cols)


# ------------------------------------------------------------------ EXFOR
UNIT_MB = {"MB": 1.0, "B": 1e3, "MICRO-B": 1e-3, "NB": 1e-6, "PB": 1e-9}
NUC = re.compile(r"(\d+)-([A-Z]+)-(\d+)")


def parse_x4(code):
    """'(82-PB-208(54-XE-136,X)ELEM/MASS,CUM,SIG)' -> dict(target, projectile, product, modifier, quantity)."""
    m = re.match(r"\((\d+-[A-Z]+-\d+)\((\d+-[A-Z]+-\d+),([^)]*)\)([^,]*),([^,]*),([^,)]*)", code)
    if not m:
        return None
    t, p, proc, prod, mod, qty = m.groups()
    za = lambda s: tuple(int(x) for x in NUC.match(s).group(1, 3))
    return dict(target=za(t), projectile=za(p), process=proc, product=prod, modifier=mod, quantity=qty)


# known coding issues (docs/mnt/02-measured-reactions.md §3.4)
PROJECTILE_FIX = {"D8038": (20, 48)}       # coded as 40Ca, the paper is 48Ca+248Cm
THICK = {"C2178", "C2398", "C2922", "D0776", "C2534", "A0031", "C2552", "C2556", "C2558", "C2035", "C2515"}
# energies missing from the EXFOR tables, from the papers (docs/mnt/02-measured-reactions.md §1): (E, kind)
ENERGY_FIX = {"D0816": (255.0, "lab"), "D0843": (328.4, "lab"), "O1046": (170.0, "lab"), "A0015": (379.0, "lab"),
              "A0023": (220.0, "lab"), "A0046": (110.0, "lab"), "C1829": (859.0, "lab"), "C2531": (605.0, "lab"),
              "C2533": (288.0, "lab"), "C1901": (15.0 * 86, "lab"), "D8060": (1200.0, "lab"), "A0031": (1000.0, "lab"),
              "C2035": (965.0, "lab"), "D0799": (1085.0, "lab"), "D8038": (270.2, "lab")}
NOTES = {
    "D0799": "integrated over theta_lab = 24-34 deg only (not 4 pi)",
    "D0843": "no uncertainties given",
    "D8060": "normalised to GRAZING (+1n channel)",
    "C2178": "thick target: yields integrated from E_cm = 450 MeV down to the barrier (centre-of-target energy quoted)",
    "D0776": "thick target, energy-integrated",
}


def col(t, name):
    if name in t["heads"]:
        i = t["heads"].index(name)
        return t["data"][i], t["units"][i]
    return None, None


def build_exfor():
    sets = []
    edir = os.path.join(RAW, "exfor")
    for f in sorted(os.listdir(edir)):
        d = json.load(open(os.path.join(edir, f)))
        entry = d["entry"]; b = d["bib_record"]
        ref = (b.get("references") or [{}])[0]
        for sub, rx in d["reactions"].items():
            tab = d["data_tables"].get(sub) or {}
            if not tab.get("data"):
                continue
            T = tab["data"]; C = tab.get("common") or {"heads": [], "units": [], "data": []}
            common = {h: (u, v[0]) for h, u, v in zip(C.get("heads", []), C.get("units", []), C.get("data", []))}
            for ptr, r in rx.items():
                x = parse_x4(r["x4_code"])
                if not x or x["quantity"] not in ("SIG", "IPA"):
                    continue                          # angle-integrated cross sections only (angular data: later)
                if x["process"] not in ("X", "F"):
                    continue
                suffix = f"  {ptr}" if f"DATA      {ptr}" in T["heads"] else ""
                dname = f"DATA      {ptr}" if suffix else "DATA"
                data, unit = col(T, dname)
                if data is None:
                    data, unit = col(T, "DATA-MAX")
                    upper = True
                else:
                    upper = False
                if data is None or unit not in UNIT_MB:
                    continue
                err, eunit = col(T, f"DATA-ERR  {ptr}" if suffix else "DATA-ERR")
                if err is None:
                    for alt in ("ERR-T", "ERR-S", "+ERR-T", "-ERR-T"):
                        err, eunit = col(T, alt)
                        if err is not None:
                            break
                n = len(data)
                Zc, _ = col(T, "ELEMENT"); Ac, _ = col(T, "MASS")
                Ecol, Eu = None, None
                for h in ("EN", "EN-CM", "EN-MAX"):
                    Ecol, Eu = col(T, h)
                    if Ecol is not None:
                        Ekind_col = {"EN": "lab", "EN-CM": "cm", "EN-MAX": "lab_max"}[h] + ("_per_u" if Eu == "MEV/A" else "")
                        break
                prodZA = NUC.match(x["product"])
                pts = []
                for i in range(n):
                    if data[i] is None:
                        continue
                    s_ = data[i] * UNIT_MB[unit]
                    e = None
                    if err is not None and err[i] is not None:
                        e = s_ * err[i] / 100.0 if eunit == "PER-CENT" else err[i] * UNIT_MB.get(eunit, 1.0)
                    if prodZA:
                        Z, A = int(prodZA.group(1)), int(prodZA.group(3))
                    else:
                        Z = int(Zc[i]) if Zc and Zc[i] is not None else None
                        A = int(Ac[i]) if Ac and Ac[i] is not None else None
                    pts.append([Z, A, s_, e, Ecol[i] if Ecol is not None else None])
                if not pts:
                    continue
                # energy: common block or first row of an energy column
                E = kind = None; Erange = None
                if "EN-MIN" in common and "EN-MAX" in common:
                    Erange = [common["EN-MIN"][1], common["EN-MAX"][1]]
                for h, k in (("EN", "lab"), ("EN-CM", "cm"), ("EN-MAX", "lab_max"), ("EN-MIN", "lab_min")):
                    if h in common:
                        E, kind = common[h][1], k; unitE = common[h][0]
                        break
                    c, u = col(T, h)
                    if c is not None:
                        E, kind, unitE = c[0], k, u
                        break
                if Erange:
                    E, kind = 0.5 * (Erange[0] + Erange[1]), "lab_mid"
                if E is not None and unitE == "MEV/A":
                    kind += "_per_u"
                proj = PROJECTILE_FIX.get(entry, x["projectile"])
                prodtype = "ZA" if (prodZA or (Zc and Ac)) else ("Z" if Zc else "A")
                if E is None and entry in ENERGY_FIX:
                    E, kind = ENERGY_FIX[entry]
                # one dataset per beam energy when the table lists several
                groups = {}
                for p_ in pts:
                    key_ = p_[4] if Ecol is not None else None
                    groups.setdefault(key_, []).append(p_[:4])
                for gE, gpts in groups.items():
                    EE, KK = (gE, Ekind_col) if gE is not None else (E, kind)
                    sets.append(dict(
                        id=f"{entry}.{sub}.{ptr}" + (f"@{gE:g}" if len(groups) > 1 else ""), entry=entry,
                        projectile=list(proj), target=list(x["target"]),
                        E=EE, E_kind=KK, modifier=x["modifier"] or "", quantity=x["quantity"], product=prodtype,
                        upper_limits=upper, thick_target=entry in THICK, note=NOTES.get(entry, ""), E_range=Erange,
                        ref=ref.get("x4_code", ""), year=ref.get("publication_year"), title=b.get("title", ""),
                        authors=[a["name"] for a in b.get("authors", [])[:3]], points=gpts))
    return dict(meta=dict(source="IAEA EXFOR via the Dataexplorer API (nds.iaea.org/dataexplorer/api/exfor/entry/<ID>); "
                                 "cross sections converted to mb; points are [Z, A, sigma_mb, err_mb]",
                          notes="See docs/mnt/02-measured-reactions.md §3.4 for data-quality flags."), sets=sets)


# ------------------------------------------------------------------ catalogue
SYM2Z = None


def expand_system(text, sym2z):
    """'129,132,136Xe+197Au' -> [(54,129,79,197), ...]. Parts are separated by ';' or ', ' (comma + space);
    a part without '+' reuses the previous projectile ('86Kr+64,58Ni, 124,112Sn'). Natural targets use the most
    abundant isotope."""
    NAT = {"Pb": 208, "U": 238, "Gd": 158, "Ni": 58}
    text = text.replace("*", "").replace("/", ";").strip()
    pairs, proj = [], None
    iso = r"([\d,]+|nat)([A-Z][a-z]?)"
    for part in re.split(r";\s*|,\s+(?=[\dn])", text):
        part = part.strip()
        m = re.match(rf"^{iso}\s*\+\s*{iso}", part)
        if m:
            proj = m.group(1, 2); targ = m.group(3, 4)
        else:
            m2 = re.match(rf"^{iso}$", part)
            if not (m2 and proj):
                continue
            targ = m2.group(1, 2)
        (pa, ps), (ta, ts) = proj, targ
        if ps not in sym2z or ts not in sym2z:
            continue
        pas = [NAT.get(ps)] if pa == "nat" else [int(a) for a in pa.split(",") if a]
        tas = [NAT.get(ts)] if ta == "nat" else [int(a) for a in ta.split(",") if a]
        for a in pas:
            for b in tas:
                if a and b:
                    pairs.append([sym2z[ps], a, sym2z[ts], b])
    return pairs


def build_catalogue(sym2z):
    lines = open(CAT_MD).read().split("\n")
    start = next(i for i, l in enumerate(lines) if l.startswith("## 1. Master table"))
    end = next(i for i, l in enumerate(lines) if l.startswith("## 2. Key numbers"))
    rows, section, head = [], "", []
    FIELD = {"System": "system", "E_lab (MeV)": "E_lab", "E_lab": "E_lab", "E_cm (MeV)": "E_cm", "E_cm c": "E_cm",
             "Facility / setup": "facility", "Setup": "facility", "Observables": "observables", "What it shows": "observables",
             "Ref": "refs", "Data": "data"}
    for l in lines[start:end]:
        if l.startswith("### "):
            section = l[4:].strip()
        if l.startswith("| # |"):
            head = [FIELD.get(c.strip().replace("*", "").strip(), c.strip()) for c in l.strip().strip("|").split("|")][1:]
            continue
        m = re.match(r"^\|\s*(\d+)\s*\|(.*)\|\s*$", l)
        if not m or not head:
            continue
        cells = [c.strip() for c in m.group(2).split("|")]
        rec = dict(zip(head, cells))
        plain = re.sub(r"\*\*", "", rec.get("system", ""))
        data = re.sub(r"\*\*", "", rec.get("data", ""))
        rows.append(dict(n=int(m.group(1)), section=section, system=plain, pairs=expand_system(plain, sym2z),
                         E_lab=rec.get("E_lab", ""), E_cm=rec.get("E_cm", ""), facility=rec.get("facility", ""),
                         observables=rec.get("observables", ""), refs=re.findall(r"\[([A-Za-z]+\d+[a-z]?)\]", rec.get("refs", "")),
                         data=data, exfor=re.findall(r"\b([A-Z]\d{4})\b", data)))
    # bibliography
    bib = {}
    bstart = next(i for i, l in enumerate(lines) if l.startswith("## 4. Verified bibliography"))
    for l in lines[bstart:]:
        m = re.match(r"^- \*\*\[([A-Za-z]+\d+[a-z]?)\]\*\*\s*(.*)$", l)
        if m:
            txt = re.sub(r"\*\*", "", m.group(2))
            doi = re.search(r"doi:\[([^\]]+)\]", txt); arx = re.search(r"arXiv:\[([^\]]+)\]", txt)
            txt = re.sub(r"\s*doi:\[[^\]]+\]\([^)]+\)", "", txt)
            txt = re.sub(r";?\s*arXiv:\[[^\]]+\]\([^)]+\)", "", txt).strip().rstrip(".;")
            bib[m.group(1)] = dict(text=txt, doi=doi.group(1) if doi else None, arxiv=arx.group(1) if arx else None)
    return dict(meta=dict(source="docs/mnt/02-measured-reactions.md (catalogue compiled 2026-09-26, 152 DOIs resolved via Crossref)"),
                rows=rows, bibliography=bib)


def main():
    os.makedirs(OUT, exist_ok=True)
    N = build_nuclides()
    sym2z = {s: int(z) for z, s in N["symbols"].items()}
    X = build_exfor()
    C = build_catalogue(sym2z)
    for name, obj in (("nuclides.json", N), ("exfor.json", X), ("catalogue.json", C)):
        p = os.path.join(OUT, name)
        json.dump(obj, open(p, "w"), separators=(",", ":"), ensure_ascii=False)
        print(f"wrote {p}  {os.path.getsize(p) / 1024:.0f} kB")
    print(f"nuclides: {len(N['Z'])}  exfor datasets: {len(X['sets'])} ({sum(len(s['points']) for s in X['sets'])} points)  "
          f"catalogue rows: {len(C['rows'])} -> {sum(len(r['pairs']) for r in C['rows'])} pairs, {len(C['bibliography'])} references")
    unparsed = [r["system"] for r in C["rows"] if not r["pairs"]]
    if unparsed:
        print("catalogue rows without a parsed pair:", unparsed)


if __name__ == "__main__":
    main()
