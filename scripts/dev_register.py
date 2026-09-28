"""Load the hic_viz extension straight from the repository (development mode).
   blender --python scripts/dev_register.py            (GUI)
"""
import sys, os, importlib
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
import addon_utils
for m in addon_utils.modules():          # an installed copy of the extension would register the same classes
    if m.__name__.endswith(".hic_viz") and addon_utils.check(m.__name__)[1]:
        addon_utils.disable(m.__name__)
        print("dev_register: disabled installed", m.__name__, "for this session")
import hic_viz
importlib.reload(hic_viz)
try:
    hic_viz.unregister()
except Exception:
    pass
hic_viz.register()
hic_viz.scene.load_post()   # re-attach streaming if a hic .blend is already open
print("hic_viz registered (dev mode) from", ROOT)
