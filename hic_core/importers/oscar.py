"""Particle-list readers (docs/physics/04-simulation-formats.md §1-2).

Every reader returns a list of `Block`s. A block is a set of particles at one lab time (`kind` = 'in'/'out'), or
a set of particles each at its own freeze-out point (`kind` = 'freezeout', UrQMD final lists). Coordinates are
Cartesian lab/computational frame: t, x, y, z in fm, momenta in GeV.
"""
import re, struct
from dataclasses import dataclass, field
import numpy as np


@dataclass
class Block:
    event: int
    kind: str                      # 'in' | 'out' | 'freezeout'
    t: float                       # block time (fm/c); for 'freezeout' the latest freeze-out time
    data: dict                     # column name -> array (t, x, y, z, mass, p0, px, py, pz, pdg, ID, charge, ...)
    ensemble: int = 0
    meta: dict = field(default_factory=dict)

    def __len__(self):
        return len(self.data["x"])


@dataclass
class EventInfo:
    event: int
    impact: float = None
    interacted: bool = None
    ensemble: int = 0


_EVENT_RE = re.compile(r"^#\s*event\s+(\d+)(?:\s+ensemble\s+(\d+))?\s+(in|out|end|start)\b(.*)$")
_INT_COLS = {"pdg", "ID", "charge", "ncoll", "proc_id_origin", "proc_type_origin", "pdg_mother1", "pdg_mother2",
             "baryon_number", "strangeness"}


def _columns_from_header(line):
    tok = line.split()
    if not tok[0].startswith(("#!OSCAR2013", "#!ASCII")):
        raise ValueError(f"not an OSCAR2013 / SMASH ASCII particle file: {line[:60]!r}")
    return tok[2:] if len(tok) > 1 and tok[1] == "particle_lists" else tok[1:]


def read_smash_oscar2013(path, events=None):
    """SMASH ASCII particle output (OSCAR2013, OSCAR2013Extended or ASCII custom columns), all versions 1.8 - 3.4.
    Returns (blocks, event_infos). `events`: optional set of event numbers to keep."""
    with open(path) as f:
        lines = f.read().splitlines()
    cols = _columns_from_header(lines[0])
    blocks, infos = [], {}
    i = 1
    while i < len(lines):
        m = _EVENT_RE.match(lines[i])
        if not m:
            i += 1
            continue
        ev, ens, kind, rest = int(m.group(1)), int(m.group(2) or 0), m.group(3), m.group(4)
        if kind in ("in", "out"):
            n = int(rest.split()[0])
            rows = lines[i + 1:i + 1 + n]
            i += 1 + n
            if events is not None and ev not in events:
                continue
            arr = np.array(" ".join(rows).split(), dtype=float).reshape(n, -1) if n else np.zeros((0, len(cols)))
            if arr.shape[1] != len(cols):
                raise ValueError(f"event {ev}: {arr.shape[1]} columns but header lists {len(cols)}")
            data = {c: (arr[:, k].astype(np.int64) if c in _INT_COLS else arr[:, k]) for k, c in enumerate(cols)}
            t = float(np.median(data["t"])) if n else float("nan")
            blocks.append(Block(ev, kind, t, data, ens))
        else:   # end line: "end 0 impact   2.400 scattering_projectile_target yes" (or "empty no" in 1.8)
            info = EventInfo(ev, ensemble=ens)
            mi = re.search(r"impact\s+([-\d.eE+]+)", rest)
            if mi:
                info.impact = float(mi.group(1))
            ms = re.search(r"scattering_projectile_target\s+(yes|no)", rest)
            me = re.search(r"empty\s+(yes|no)", rest)
            if ms:
                info.interacted = ms.group(1) == "yes"
            elif me:
                info.interacted = me.group(1) == "no"
            infos[(ev, ens)] = info
            i += 1
    return blocks, infos


def read_smash_binary(path, events=None):
    """SMASH binary particle output, format version 10, variant 0 (OSCAR2013 columns). Returns (blocks, infos)."""
    raw = open(path, "rb").read()
    if raw[:4] != b"SMSH":
        raise ValueError("not a SMASH binary file")
    version, variant, ln = struct.unpack_from("<HHI", raw, 4)
    if version != 10 or variant != 0:
        raise NotImplementedError(f"SMASH binary version {version} variant {variant}: only version 10 variant 0 is verified")
    pos = 12 + ln
    rec = np.dtype([("r", "<f8", 4), ("mass", "<f8"), ("p", "<f8", 4), ("pdg", "<i4"), ("ID", "<i4"), ("charge", "<i4")])
    blocks, infos = [], {}
    while pos < len(raw):
        tag = raw[pos:pos + 1]; pos += 1
        if tag == b"p":
            ev, ens, n = struct.unpack_from("<iiI", raw, pos); pos += 12
            a = np.frombuffer(raw, dtype=rec, count=n, offset=pos); pos += n * rec.itemsize
            if events is not None and ev not in events:
                continue
            data = dict(t=a["r"][:, 0].copy(), x=a["r"][:, 1].copy(), y=a["r"][:, 2].copy(), z=a["r"][:, 3].copy(),
                        mass=a["mass"].copy(), p0=a["p"][:, 0].copy(), px=a["p"][:, 1].copy(), py=a["p"][:, 2].copy(),
                        pz=a["p"][:, 3].copy(), pdg=a["pdg"].astype(np.int64), ID=a["ID"].astype(np.int64),
                        charge=a["charge"].astype(np.int64))
            kind = "in" if not any(b.event == ev and b.ensemble == ens for b in blocks) else "out"
            blocks.append(Block(ev, kind, float(np.median(data["t"])) if n else float("nan"), data, ens))
        elif tag == b"f":
            ev, ens, b_imp, empty = struct.unpack_from("<iidb", raw, pos); pos += 17
            infos[(ev, ens)] = EventInfo(ev, b_imp, not bool(empty), ens)
        else:
            raise ValueError(f"unexpected block tag {tag!r} at byte {pos - 1}")
    return blocks, infos


def _fortran_floats(s):
    return [float(v) for v in s.split()]


def read_urqmd_f19(path, events=None):
    """UrQMD OSC1997A (unit 19). Standard mode: one final block per event with freeze-out coordinates
    (kind 'freezeout', each particle at its own (x, y, z, t)). CTOption(55)=1 mode: one block per output time step
    (kind 'out'), current positions in columns 7-10. Returns (blocks, infos)."""
    with open(path) as f:
        lines = [l for l in f.read().splitlines() if l.strip()]
    if not lines[0].strip().startswith("OSC1997A"):
        raise ValueError("not an OSC1997A file")
    blocks, infos = [], {}
    i = 3
    while i < len(lines):
        head = lines[i].split()
        ev, n, b = int(head[0]), int(head[1]), float(head[2])
        timestep = len(head) >= 6
        rows = np.array([_fortran_floats(l) for l in lines[i + 1:i + 1 + n]]).reshape(n, -1) if n else np.zeros((0, 11))
        i += 1 + n
        infos[(ev, 0)] = EventInfo(ev, b, None)
        if events is not None and ev not in events:
            continue
        data = dict(pdg=rows[:, 1].astype(np.int64), px=rows[:, 2], py=rows[:, 3], pz=rows[:, 4], p0=rows[:, 5],
                    mass=rows[:, 6], x=rows[:, 7], y=rows[:, 8], z=rows[:, 9], t=rows[:, 10], ID=rows[:, 0].astype(np.int64))
        data["charge"] = np.zeros(n, np.int64)
        if timestep:
            blocks.append(Block(ev, "out", float(np.median(data["t"])) if n else float("nan"), data, meta=dict(step=int(head[5]))))
        else:
            blocks.append(Block(ev, "freezeout", float(data["t"].max()) if n else float("nan"), data))
    return blocks, infos


def read_urqmd_f20(path, events=None):
    """UrQMD OSC1999A full event history (unit 20). Returns the final list of each event as a 'freezeout' block
    (uid, pdg, momenta, freeze-out x, y, z, t); the collision history is counted in block.meta['n_collisions']."""
    with open(path) as f:
        lines = [l for l in f.read().splitlines() if l.strip() and not l.lstrip().startswith("#")]
    blocks, infos = [], {}
    i = 0; ev = None; ncoll = 0; b = None
    while i < len(lines):
        f_ = lines[i].split()
        if len(f_) == 12:          # stray particle row (should not happen at block level)
            i += 1; continue
        nin, nout = int(f_[0]), int(f_[1])
        if nin == 0 and nout == 0:                      # end of event
            i += 1; ev = None; continue
        if nin == 0 and len(f_) >= 5:                   # initial list: 0 Npart event b 0.0
            ev = int(f_[2]); b = float(f_[3]); ncoll = 0
            infos[(ev, 0)] = EventInfo(ev, b, None)
            i += 1 + nout; continue
        if nout == 0:                                   # final list: Npart 0
            n = nin
            rows = np.array([_fortran_floats(l) for l in lines[i + 1:i + 1 + n]]).reshape(n, -1)
            i += 1 + n
            if events is not None and ev not in events:
                continue
            data = dict(ID=rows[:, 0].astype(np.int64), pdg=rows[:, 1].astype(np.int64), px=rows[:, 3], py=rows[:, 4],
                        pz=rows[:, 5], p0=rows[:, 6], mass=rows[:, 7], x=rows[:, 8], y=rows[:, 9], z=rows[:, 10], t=rows[:, 11],
                        charge=np.zeros(n, np.int64))
            blocks.append(Block(ev, "freezeout", float(data["t"].max()), data, meta=dict(n_collisions=ncoll)))
            continue
        ncoll += 1                                      # collision / decay block
        i += 1 + nin + nout
    return blocks, infos


def read_particles(path, **kw):
    """Detect the format from the first bytes/line and dispatch."""
    with open(path, "rb") as f:
        head = f.read(64)
    if head[:4] == b"SMSH":
        return read_smash_binary(path, **kw)
    first = head.decode("latin-1").splitlines()[0].strip()
    if first.startswith(("#!OSCAR2013", "#!ASCII")):
        return read_smash_oscar2013(path, **kw)
    if first.startswith("OSC1997A"):
        return read_urqmd_f19(path, **kw)
    if first.startswith("# OSC1999A"):
        return read_urqmd_f20(path, **kw)
    raise ValueError(f"unrecognised particle file format: {first[:40]!r}")
