"""Operators: run the physics in a background thread (bpy is never touched from the thread), then build the scene."""
import bpy, os, threading, traceback, time
from . import scene as hs

_JOB = {}


def _run_job(params, cache_dir, job):
    try:
        from .hic_core.event import Event
        from .hic_core.cache import write_cache
        job["status"] = "Glauber + fireball + hadrons…"; job["progress"] = 0.05
        ev = Event(params).run()
        job["info"] = ev.info
        job["status"] = "writing cache…"; job["progress"] = 0.4
        F = len(ev.times)

        def prog(msg):
            job["status"] = msg
            if msg.startswith("particles"):
                job["progress"] = 0.4 + 0.2 * int(msg.split()[2].split("/")[0]) / F
            elif msg.startswith("volume"):
                job["progress"] = 0.6 + 0.4 * int(msg.split()[2].split("/")[0]) / F
        write_cache(ev, cache_dir, progress=prog)
        job["status"] = "done"; job["progress"] = 1.0
    except Exception:
        job["error"] = traceback.format_exc(); job["status"] = "error"
    finally:
        job["finished"] = True


def _abs_cache(context):
    return bpy.path.abspath(context.scene.hic.cache_dir)


class HIC_OT_run(bpy.types.Operator):
    bl_idname = "hic.run_event"; bl_label = "Compute event"
    bl_description = "Run the Glauber + fireball + freeze-out model with the panel parameters and build the scene"

    def execute(self, context):
        if _JOB and not _JOB.get("finished", True):
            self.report({'WARNING'}, "a job is already running"); return {'CANCELLED'}
        props = context.scene.hic
        params = props.to_event_params()
        cache_dir = _abs_cache(context)
        _JOB.clear(); _JOB.update(finished=False, status="starting", progress=0.0, cache_dir=cache_dir, t0=time.time())
        threading.Thread(target=_run_job, args=(params, cache_dir, _JOB), daemon=True).start()
        bpy.app.timers.register(_poll, first_interval=0.3)
        props.status = "running"; props.progress = 0.0
        return {'FINISHED'}


def _poll():
    sc = bpy.context.scene
    if sc is None or not _JOB:
        return None
    sc.hic.status = _JOB.get("status", ""); sc.hic.progress = float(_JOB.get("progress", 0.0))
    for area in bpy.context.screen.areas if bpy.context.screen else []:
        if area.type == 'VIEW_3D':
            area.tag_redraw()
    if not _JOB.get("finished"):
        return 0.3
    if _JOB.get("error"):
        print(_JOB["error"]); sc.hic.status = "error (see console)"
        return None
    try:
        bpy.ops.hic.build_scene()
        sc.hic.status = f"done in {time.time() - _JOB['t0']:.0f} s"
    except Exception:
        traceback.print_exc(); sc.hic.status = "scene build failed (see console)"
    return None


class HIC_OT_build(bpy.types.Operator):
    bl_idname = "hic.build_scene"; bl_label = "Build scene from cache"
    bl_description = "Rebuild the Blender scene from the cache directory"

    def execute(self, context):
        props = context.scene.hic; cache_dir = _abs_cache(context)
        if not os.path.exists(os.path.join(cache_dir, "meta.json")):
            self.report({'ERROR'}, f"no cache in {cache_dir}"); return {'CANCELLED'}
        hs.reset_scene()
        hs.build_from_cache(cache_dir, radius_scale=props.radius_scale, T_scale=props.T_scale,
                            density_gain=props.density_gain, emission_gain=props.emission_gain, camera=props.camera,
                            camera_move=props.camera_move)
        hs.setup_render(engine=props.engine, resolution=(context.scene.render.resolution_x, context.scene.render.resolution_y))
        return {'FINISHED'}


class HIC_OT_apply_look(bpy.types.Operator):
    bl_idname = "hic.apply_look"; bl_label = "Apply look"
    bl_description = "Apply particle size, volume gains and camera preset without recomputing"

    def execute(self, context):
        props = context.scene.hic
        hs.apply_look(radius_scale=props.radius_scale, T_scale=props.T_scale, density_gain=props.density_gain,
                      emission_gain=props.emission_gain, camera=props.camera)
        hs.setup_render(engine=props.engine, resolution=(context.scene.render.resolution_x, context.scene.render.resolution_y))
        context.scene.frame_set(context.scene.frame_current)
        return {'FINISHED'}


class HIC_OT_render(bpy.types.Operator):
    bl_idname = "hic.render_animation"; bl_label = "Render animation"

    def execute(self, context):
        props = context.scene.hic
        hs.setup_render(engine=props.engine, resolution=(context.scene.render.resolution_x, context.scene.render.resolution_y))
        bpy.ops.render.render('INVOKE_DEFAULT', animation=True)
        return {'FINISHED'}


class HIC_OT_load_preset(bpy.types.Operator):
    bl_idname = "hic.load_preset"; bl_label = "Load preset"
    bl_description = "Fill the panel with the selected preset (then press Compute event)"

    def execute(self, context):
        from .hic_core import presets
        p = context.scene.hic; P = presets.load()[p.preset]; par = P["params"]
        p.nucleus_a = par["A"]; p.nucleus_b = par["B"]
        e = str(par["sqrt_snn"]); e = e[:-2] if e.endswith(".0") else e
        valid = {i.identifier for i in p.bl_rna.properties["energy"].enum_items}
        if e in valid:
            p.energy = e
        else:
            p.energy = "CUSTOM"; p.energy_custom = float(par["sqrt_snn"])
        if "b" in par:
            p.centrality = "B"; p.impact_b = par["b"]
        else:
            c = "-".join(str(v) for v in par["centrality"])
            p.centrality = c if c in {i.identifier for i in p.bl_rna.properties["centrality"].enum_items} else "0-5"
        p.orientation = par.get("orientation", "random")
        look = P.get("look", {})
        p.camera = look.get("camera", "side"); p.camera_move = look.get("move", "follow")
        self.report({'INFO'}, f"preset {P['label']} loaded")
        return {'FINISHED'}


classes = (HIC_OT_run, HIC_OT_build, HIC_OT_apply_look, HIC_OT_render, HIC_OT_load_preset)
