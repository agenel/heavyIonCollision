"""Collision presets (hic_core/data/presets.json) -> EventParams."""
import json, os
from dataclasses import fields

_PATH = os.path.join(os.path.dirname(__file__), "data", "presets.json")


def load():
    with open(_PATH) as f:
        return {k: v for k, v in json.load(f).items() if not k.startswith("_")}


def event_params(name, **overrides):
    from .event import EventParams
    P = load()
    if name not in P:
        raise KeyError(f"unknown preset {name!r}; available: {', '.join(P)}")
    kw = dict(P[name]["params"]); kw.update(overrides)
    if "centrality" in kw:
        kw["centrality"] = tuple(kw["centrality"])
    valid = {f.name for f in fields(EventParams)}
    return EventParams(**{k: v for k, v in kw.items() if k in valid})


def look(name):
    return dict(load()[name].get("look", {}))
