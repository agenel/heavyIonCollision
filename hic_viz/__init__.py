"""hic_viz: Blender extension for the heavy-ion collision animation (GUI panel, physics job, scene builder).

Dev loading (from the repo):  blender --python scripts/dev_register.py
Extension build:              scripts/build_extension.sh  (bundles hic_core via the hic_viz/hic_core symlink)
"""
import bpy
from . import props, ops, ui, scene  # noqa: F401

classes = props.classes + ops.classes + ui.classes


def register():
    for c in classes:
        bpy.utils.register_class(c)
    bpy.types.Scene.hic = bpy.props.PointerProperty(type=props.HIC_Props)
    scene.install_handlers()
    if scene.load_post not in bpy.app.handlers.load_post:
        bpy.app.handlers.load_post.append(scene.load_post)


def unregister():
    if scene.load_post in bpy.app.handlers.load_post:
        bpy.app.handlers.load_post.remove(scene.load_post)
    del bpy.types.Scene.hic
    for c in reversed(classes):
        bpy.utils.unregister_class(c)
