"""Scene construction and per-frame streaming for the heavy-ion collision cache (Blender 5.2 API).

Visual conventions (all physical, see docs/physics):
- 1 BU = 1 fm; beam along z; impact parameter along x.
- Nucleons: protons light, neutrons dark grey; participants tinted at t = 0.
- Hadrons coloured by species (pions, kaons, protons/neutrons, strange baryons, phi, deuterons, photons)
  with radii ∝ mass^(1/3) scaled by a user factor (visual only).
- QGP: OpenVDB 'temperature' (MeV) and 'energy' (GeV/fm^3) grids; emission colour = Blackbody(T * k_scale),
  density ∝ energy density.
"""
import bpy, os, json, math
import numpy as np
from bpy.app.handlers import persistent

HIDDEN, NUCLEON, SPECTATOR, HADRON_GAS, FREE, QGP_TRACER = 0, 1, 2, 3, 4, 5
STATE_RADIUS = {HIDDEN: 0.0, NUCLEON: 0.8, SPECTATOR: 0.8, HADRON_GAS: 0.15, FREE: 0.25, QGP_TRACER: 0.0}
# species id -> (colour RGBA, radius scale) ; ids follow hic_core.freezeout.SPECIES
SPECIES_STYLE = {
    0: ((1.0, 0.85, 0.2, 1), 0.8), 1: ((1.0, 0.85, 0.2, 1), 0.8), 2: ((1.0, 0.95, 0.6, 1), 0.8),      # pions
    3: ((0.2, 0.9, 0.4, 1), 0.9), 4: ((0.2, 0.9, 0.4, 1), 0.9), 5: ((0.5, 0.95, 0.6, 1), 0.9),      # kaons
    6: ((0.3, 0.55, 1.0, 1), 1.0), 7: ((0.9, 0.3, 0.3, 1), 1.0), 8: ((0.35, 0.35, 0.45, 1), 1.0), 9: ((0.7, 0.3, 0.3, 1), 1.0),  # p, pbar, n, nbar
    10: ((0.8, 0.4, 1.0, 1), 1.05), 11: ((0.8, 0.4, 1.0, 1), 1.05), 12: ((0.9, 0.3, 0.9, 1), 1.1), 13: ((0.9, 0.3, 0.9, 1), 1.1),
    14: ((1.0, 0.2, 0.8, 1), 1.15), 15: ((1.0, 0.2, 0.8, 1), 1.15), 16: ((0.2, 0.9, 0.9, 1), 1.0),
    17: ((0.4, 0.8, 1.0, 1), 1.25), 18: ((0.4, 0.8, 1.0, 1), 1.25),
}
_CTX = {}
# view settings shared by framing, overlays and the HUD (set by build_from_cache, restored by load_post)
VIEW = dict(aspect=16 / 9, frame_b=None, overlays=("hud", "tkey", "skey"), compact_hud=False, T_lo=150.0,
            fade_T=(156.5, 172.0), show_hadrons=True, tilt_deg=0.0)


def _half_extents(d):
    """Screen half-width and half-height at distance d for the 40 mm lens / 36 mm sensor (AUTO fit: the sensor
    spans the larger image dimension)."""
    a = VIEW["aspect"]
    return (0.45 * d, 0.45 * d / a) if a >= 1 else (0.45 * d * a, 0.45 * d)


def reset_scene():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.pointclouds, bpy.data.volumes, bpy.data.materials, bpy.data.curves, bpy.data.cameras, bpy.data.lights):
        for x in list(coll):
            if x.users == 0:
                coll.remove(x)


def load_cache(cache_dir):
    cache_dir = os.path.abspath(cache_dir)
    with open(os.path.join(cache_dir, "meta.json")) as f:
        meta = json.load(f)
    d = np.load(os.path.join(cache_dir, "particles.npz"))
    data = {k: d[k] for k in d.files}
    data["times"] = np.load(os.path.join(cache_dir, "frames.npy"))
    return meta, data


def species_material(name="hic_species"):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.bl_idname != "ShaderNodeOutputMaterial":
            nt.nodes.remove(n)
    col = nt.nodes.new("ShaderNodeAttribute"); col.attribute_name = "col"
    glow = nt.nodes.new("ShaderNodeAttribute"); glow.attribute_name = "glow"
    em = nt.nodes.new("ShaderNodeEmission")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled"); bsdf.inputs["Roughness"].default_value = 0.6
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(col.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(col.outputs["Color"], em.inputs["Color"])
    nt.links.new(glow.outputs["Fac"], em.inputs["Strength"])
    nt.links.new(bsdf.outputs["BSDF"], mix.inputs[1]); nt.links.new(em.outputs["Emission"], mix.inputs[2])
    mix.inputs["Fac"].default_value = 0.5
    nt.links.new(mix.outputs["Shader"], nt.nodes["Material Output"].inputs["Surface"])
    return mat


def volume_material(name="hic_qgp", T_scale_K_per_MeV=13.0, density_gain=0.15, emission_gain=0.05,
                    fade_T=(156.5, 172.0), eps_ref=10.0):
    """Principled Volume for the fireball.
    - colour: blackbody of (T_MeV * T_scale) Kelvin, a documented visual mapping (the real temperatures are ~2e12 K):
      with the default 13 K/MeV, T_c = 156.5 MeV -> 2000 K deep orange, 300 MeV -> 3900 K yellow-orange,
      500 MeV -> 6500 K white. The same mapping drives the on-screen colour key;
    - density: gain * sqrt(energy / eps_ref) * smoothstep(T; fade_T) so the hadron gas below T_c fades out
      (hadrons are shown as particles there) and the QGP core does not saturate."""
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.bl_idname != "ShaderNodeOutputMaterial":
            nt.nodes.remove(n)
    pv = nt.nodes.new("ShaderNodeVolumePrincipled")
    pv.inputs["Density Attribute"].default_value = ""
    pv.inputs["Temperature Attribute"].default_value = "temperature"
    pv.inputs["Blackbody Intensity"].default_value = emission_gain
    pv.inputs["Temperature"].default_value = T_scale_K_per_MeV
    pv.inputs["Anisotropy"].default_value = 0.0
    pv.inputs["Color"].default_value = (0.6, 0.6, 0.6, 1)
    aE = nt.nodes.new("ShaderNodeAttribute"); aE.attribute_name = "energy"
    aT = nt.nodes.new("ShaderNodeAttribute"); aT.attribute_name = "temperature"
    div = nt.nodes.new("ShaderNodeMath"); div.operation = 'DIVIDE'; div.inputs[1].default_value = eps_ref
    sq = nt.nodes.new("ShaderNodeMath"); sq.operation = 'SQRT'
    fade = nt.nodes.new("ShaderNodeMapRange"); fade.interpolation_type = 'SMOOTHSTEP'; fade.clamp = True
    fade.inputs["From Min"].default_value = fade_T[0]; fade.inputs["From Max"].default_value = fade_T[1]
    m1 = nt.nodes.new("ShaderNodeMath"); m1.operation = 'MULTIPLY'
    m2 = nt.nodes.new("ShaderNodeMath"); m2.operation = 'MULTIPLY'; m2.inputs[1].default_value = density_gain; m2.label = "density_gain"
    nt.links.new(aE.outputs["Fac"], div.inputs[0]); nt.links.new(div.outputs["Value"], sq.inputs[0])
    nt.links.new(aT.outputs["Fac"], fade.inputs["Value"])
    nt.links.new(sq.outputs["Value"], m1.inputs[0]); nt.links.new(fade.outputs["Result"], m1.inputs[1])
    nt.links.new(m1.outputs["Value"], m2.inputs[0]); nt.links.new(m2.outputs["Value"], pv.inputs["Density"])
    nt.links.new(pv.outputs["Volume"], nt.nodes["Material Output"].inputs["Volume"])
    return mat


def ensure_vdb(cache_dir, meta):
    """Convert .npy temperature frames to .vdb with Blender's openvdb if the cache was written without it."""
    if "volume" not in meta:          # particle-only import
        return []
    vol = meta["volume"]; vdir = os.path.join(cache_dir, "volume")
    if vol.get("format") == "vdb":
        return sorted(f for f in os.listdir(vdir) if f.endswith(".vdb"))
    import openvdb
    from hic_core import eos
    out = []
    for f in sorted(os.listdir(vdir)):
        if not f.startswith("T_") or not f.endswith(".npy"):
            continue
        idx = int(f[2:6]); T = np.load(os.path.join(vdir, f)).astype(np.float32)
        E = np.where(T > 0, eos.epsilon_of_T(np.maximum(T, 1.0)), 0.0).astype(np.float32)
        gT = openvdb.FloatGrid(); gT.name = "temperature"; gT.copyFromArray(np.ascontiguousarray(T))
        gE = openvdb.FloatGrid(); gE.name = "energy"; gE.copyFromArray(np.ascontiguousarray(E))
        for g in (gT, gE):
            xf = openvdb.createLinearTransform(voxelSize=vol["voxel_fm"]); xf.postTranslate(tuple(vol["origin"]))
            g.transform = xf; g.gridClass = openvdb.GridClass.FOG_VOLUME
        path = os.path.join(vdir, f"fireball_{idx:04d}.vdb"); openvdb.write(path, grids=[gT, gE]); out.append(os.path.basename(path))
    vol["format"] = "vdb"
    return out


def nucleon_object(name, n, col, zscale, radius=0.8):
    """Nucleons as Geometry-Nodes sphere instances scaled by (1, 1, 1/gamma): the Lorentz contraction applies
    to the nucleons themselves, not only to the nucleus (a point cloud cannot be scaled per axis)."""
    me = bpy.data.meshes.new(name); me.vertices.add(n)
    me.attributes.new("col", 'FLOAT_COLOR', 'POINT'); me.attributes.new("glow", 'FLOAT', 'POINT')
    # NB: the attribute is called "size", not "radius": Mesh to Points creates its own built-in "radius" point
    # attribute (default 0.05) which would shadow a vertex attribute of the same name
    me.attributes.new("size", 'FLOAT', 'POINT'); me.attributes.new("zscale", 'FLOAT', 'POINT')
    me.attributes["col"].data.foreach_set("color", np.asarray(col, np.float32).ravel())
    me.attributes["size"].data.foreach_set("value", np.full(n, radius, np.float32))
    me.attributes["zscale"].data.foreach_set("value", np.asarray(zscale, np.float32))
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    ng = bpy.data.node_groups.new(name + "_gn", "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out='INPUT', socket_type='NodeSocketGeometry')
    ng.interface.new_socket("Geometry", in_out='OUTPUT', socket_type='NodeSocketGeometry')
    gi = ng.nodes.new("NodeGroupInput"); go = ng.nodes.new("NodeGroupOutput")
    m2p = ng.nodes.new("GeometryNodeMeshToPoints"); iop = ng.nodes.new("GeometryNodeInstanceOnPoints")
    sph = ng.nodes.new("GeometryNodeMeshUVSphere"); sph.inputs["Radius"].default_value = 1.0
    sph.inputs["Segments"].default_value = 16; sph.inputs["Rings"].default_value = 8
    sm = ng.nodes.new("GeometryNodeSetMaterial"); sm.inputs["Material"].default_value = species_material(name + "_mat")
    rad = ng.nodes.new("GeometryNodeInputNamedAttribute"); rad.data_type = 'FLOAT'; rad.inputs["Name"].default_value = "size"
    zs = ng.nodes.new("GeometryNodeInputNamedAttribute"); zs.data_type = 'FLOAT'; zs.inputs["Name"].default_value = "zscale"
    mul = ng.nodes.new("ShaderNodeMath"); mul.operation = 'MULTIPLY'
    comb = ng.nodes.new("ShaderNodeCombineXYZ")
    real = ng.nodes.new("GeometryNodeRealizeInstances")
    ng.links.new(gi.outputs[0], m2p.inputs["Mesh"]); ng.links.new(m2p.outputs["Points"], iop.inputs["Points"])
    ng.links.new(sph.outputs["Mesh"], sm.inputs["Geometry"]); ng.links.new(sm.outputs["Geometry"], iop.inputs["Instance"])
    ng.links.new(rad.outputs["Attribute"], comb.inputs["X"]); ng.links.new(rad.outputs["Attribute"], comb.inputs["Y"])
    ng.links.new(rad.outputs["Attribute"], mul.inputs[0]); ng.links.new(zs.outputs["Attribute"], mul.inputs[1]); ng.links.new(mul.outputs["Value"], comb.inputs["Z"])
    ng.links.new(comb.outputs["Vector"], iop.inputs["Scale"])
    ng.links.new(iop.outputs["Instances"], real.inputs["Geometry"]); ng.links.new(real.outputs["Geometry"], go.inputs[0])
    md = ob.modifiers.new("gn", "NODES"); md.node_group = ng
    return ob


def build_from_cache(cache_dir, radius_scale=1.0, T_scale=13.0, density_gain=0.15, emission_gain=0.05, camera="side",
                     camera_move="follow", resolution=None, frame_b=None, overlays=("hud", "tkey", "skey"), compact_hud=False,
                     tilt_deg=0.0):
    """resolution (w, h) sets the aspect used for framing and overlays; frame_b (fm) frames every panel of a comparison
    as if its impact parameter were frame_b (same fm-per-pixel scale); overlays: subset of hud / tkey / skey."""
    cache_dir = os.path.abspath(cache_dir)
    meta, data = load_cache(cache_dir)
    sc = bpy.context.scene
    if resolution:
        sc.render.resolution_x, sc.render.resolution_y = resolution
    show_h = bool(meta.get("show_hadrons", True))
    VIEW.update(aspect=sc.render.resolution_x / sc.render.resolution_y, frame_b=frame_b, overlays=tuple(overlays), tilt_deg=tilt_deg,
                compact_hud=compact_hud, show_hadrons=show_h,
                # without hadron particles the hadron-gas phase (T_kin < T < T_c) stays visible as a dim volume
                fade_T=(156.5, 172.0) if show_h else (110.0, 150.0), T_lo=150.0 if show_h else 110.0)
    sc.unit_settings.system = 'NONE'
    F, N = data["pos"].shape[:2]
    sc.frame_start = 1; sc.frame_end = F; sc.render.fps = int(meta.get("fps", 30))
    sp = data["species"].astype(int); isn = data["is_nucleon"]; Nn = int(isn.sum())
    col = np.array([SPECIES_STYLE.get(int(s), ((1, 1, 1, 1), 1))[0] for s in sp], np.float32)
    col[isn & (sp == 6)] = (0.85, 0.85, 0.95, 1); col[isn & (sp == 8)] = (0.35, 0.35, 0.4, 1)
    base_r = np.array([SPECIES_STYLE.get(int(s), ((1, 1, 1, 1), 1))[1] for s in sp], np.float32)
    # ---- nucleons: contracted sphere instances
    gamma = float(meta.get("gamma", 1.0)); floor = float(meta["params"].get("pancake_floor_fm", 0.0))
    zscale = max(1.0 / gamma, floor / 1.6)
    nuc_ob = nucleon_object("hic_nucleons", Nn, col[:Nn], np.full(Nn, zscale))
    # ---- hadrons: point cloud
    pc = bpy.data.pointclouds.new("hic_particles"); pc.resize(N - Nn)
    for name, typ in (("radius", 'FLOAT'), ("glow", 'FLOAT'), ("state", 'INT'), ("species", 'INT')):
        pc.attributes.new(name, typ, 'POINT')
    pc.attributes.new("col", 'FLOAT_COLOR', 'POINT')
    pc.attributes["col"].data.foreach_set("color", col[Nn:].ravel())
    pc.attributes["species"].data.foreach_set("value", sp[Nn:].astype(np.int32))
    ob = bpy.data.objects.new("hic_particles", pc); sc.collection.objects.link(ob)
    pc.materials.append(species_material())
    # ---- volume
    vdbs = ensure_vdb(cache_dir, meta)
    vol_ob = None
    if vdbs:
        vol = bpy.data.volumes.new("hic_qgp"); vol.filepath = os.path.join(cache_dir, "volume", vdbs[0])
        vol.is_sequence = True; vol.frame_start = 1; vol.frame_duration = F; vol.frame_offset = 0; vol.sequence_mode = 'CLIP'
        vol_ob = bpy.data.objects.new("hic_qgp", vol); sc.collection.objects.link(vol_ob)
        vol.materials.append(volume_material(T_scale_K_per_MeV=T_scale, density_gain=density_gain, emission_gain=emission_gain,
                                             fade_T=tuple(VIEW["fade_T"])))
    # ---- camera rig, overlays (HUD + legend), light, world
    cam = build_camera_rig(camera, meta, data["times"], move=camera_move)
    hud = build_overlays(cam, meta, T_scale)
    light = bpy.data.objects.new("hic_key", bpy.data.lights.new("hic_key", 'SUN')); sc.collection.objects.link(light)
    light.data.energy = 2.0; light.rotation_euler = (0.8, 0.3, 0.5)
    sc.world = sc.world or bpy.data.worlds.new("hic_world")
    sc.world.use_nodes = True
    bg = sc.world.node_tree.nodes.get("Background")
    if bg: bg.inputs["Color"].default_value = (0.01, 0.01, 0.015, 1); bg.inputs["Strength"].default_value = 1.0
    # ---- streaming state
    _CTX.clear()
    _CTX.update(meta=meta, data=data, pc_name=pc.name, nuc_name=nuc_ob.data.name, hud_name=hud.name, base_r=base_r,
                radius_scale=radius_scale, F=F, Nn=Nn, cache_dir=cache_dir)
    sc["hic_cache_dir"] = cache_dir
    sc["hic_look"] = json.dumps(dict(radius_scale=radius_scale, T_scale=T_scale, density_gain=density_gain,
                                     emission_gain=emission_gain, camera=camera, camera_move=camera_move, view=VIEW))
    install_handlers()
    sc.frame_set(1)
    return _CTX


def apply_look(radius_scale=None, T_scale=None, density_gain=None, emission_gain=None, camera=None):
    """Update visual parameters of an existing scene without recomputing physics."""
    if radius_scale is not None and _CTX:
        _CTX["radius_scale"] = radius_scale
    mat = bpy.data.materials.get("hic_qgp")
    if mat is not None:
        nt = mat.node_tree
        pv = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeVolumePrincipled"), None)
        if pv is not None:
            if T_scale is not None: pv.inputs["Temperature"].default_value = T_scale
            if emission_gain is not None: pv.inputs["Blackbody Intensity"].default_value = emission_gain
        gain = next((n for n in nt.nodes if n.label == "density_gain"), None)
        if gain is not None and density_gain is not None:
            gain.inputs[1].default_value = density_gain
    cam = bpy.data.objects.get("hic_camera")
    if cam is not None and camera is not None:
        set_camera_preset(cam, camera)
    sc = bpy.context.scene
    look = json.loads(sc.get("hic_look", "{}"))
    for k, v in dict(radius_scale=radius_scale, T_scale=T_scale, density_gain=density_gain, emission_gain=emission_gain, camera=camera).items():
        if v is not None:
            look[k] = v
    sc["hic_look"] = json.dumps(look)


@persistent
def load_post(dummy=None):
    """Re-attach streaming after a .blend is loaded (handlers are not saved in the file)."""
    sc = bpy.context.scene
    cache_dir = sc.get("hic_cache_dir") if sc else None
    if cache_dir and os.path.exists(os.path.join(cache_dir, "meta.json")) and bpy.data.pointclouds.get("hic_particles"):
        meta, data = load_cache(cache_dir)
        pc = bpy.data.pointclouds["hic_particles"]
        sp = data["species"].astype(int)
        base_r = np.array([SPECIES_STYLE.get(int(s), ((1, 1, 1, 1), 1))[1] for s in sp], np.float32)
        look = json.loads(sc.get("hic_look", "{}"))
        if "view" in look:
            VIEW.update({k: (tuple(v) if isinstance(v, list) else v) for k, v in look["view"].items()})
        _CTX.clear(); _CTX.update(meta=meta, data=data, pc_name=pc.name, nuc_name="hic_nucleons", hud_name="hic_hud", base_r=base_r,
                                  radius_scale=float(look.get("radius_scale", 1.0)), F=data["pos"].shape[0],
                                  Nn=int(data["is_nucleon"].sum()), cache_dir=cache_dir)
        install_handlers(); sc.frame_set(sc.frame_current)


D0 = 50.0          # camera distance from the pivot in pivot-local units; the pivot's uniform scale sets the real distance
OVERLAY_D = 5.0    # overlays sit this far in front of the lens (camera-local), so nothing in the scene can occlude them


def set_camera_preset(cam, preset="side", distance=D0):
    if preset == "front":      # looking along +y, beam axis (z) vertical, impact parameter (x) horizontal
        cam.location = (0, -distance, 0); cam.rotation_euler = (math.pi / 2, 0, 0)
    elif preset == "side":     # looking along +y, rolled so the beam axis (z) is horizontal and b (x) vertical
        cam.location = (0, -distance, 0); cam.rotation_euler = (math.pi / 2, math.pi / 2, 0)
    elif preset == "beam":     # looking along the beam axis
        cam.location = (0, 0, distance); cam.rotation_euler = (0, 0, 0)
    elif preset == "iso":
        # oblique view: side view rotated 35 deg about the vertical (x) axis and tilted 20 deg
        d = distance
        az, el = math.radians(35), math.radians(20)
        cam.location = (d * math.sin(el), -d * math.cos(el) * math.cos(az), d * math.cos(el) * math.sin(az))
        _look_at(cam, (0.0, 0.0, 0.0), up=(1.0, 0.0, 0.0))


def _look_at(cam, target, up=(0.0, 0.0, 1.0)):
    from mathutils import Vector
    direction = Vector(target) - cam.location
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    # roll so that `up` projects onto the camera's +Y
    import mathutils
    q = direction.to_track_quat('-Z', 'Y')
    cam_up = q @ Vector((0, 1, 0)); want = Vector(up) - Vector(up).project(direction)
    if want.length > 1e-6:
        ang = cam_up.angle(want); sign = 1 if direction.normalized().dot(cam_up.cross(want)) < 0 else -1
        cam.rotation_euler = (q @ mathutils.Quaternion((0, 0, 1), sign * ang)).to_euler()


def framing_extent(meta, t):
    """(longitudinal, transverse) half-sizes in fm that must stay in frame at lab time t.
    Before the collision: the approaching nuclei (radius + distance travelled; transverse radius + b/2).
    After: along the beam the fastest matter moves at ~c (Bjorken, z <= t); transversely the bulk expands
    at ~0.6c (the measured <beta_T>), the few hadrons faster than that are allowed to leave the frame."""
    RA = max(float(meta.get("R_A", 7.0)), float(meta.get("R_B", 7.0)), 3.0)
    b = float(VIEW["frame_b"]) if VIEW.get("frame_b") is not None else float(meta.get("b") or 0.0)
    trans0 = RA + 0.5 * b + 1.5
    if t < 0:
        return abs(t) + RA * 0.3 + 2.0, trans0
    return max(RA, 0.85 * t + 6.0), max(trans0, RA + 1.5 + 0.6 * t)


def _scale_for(preset, meta, t, swing=0.0):
    """Pivot scale so the extents fit: horizontal half-width 0.45 D0, vertical half-height 0.253 D0 (16:9), 85% margin.
    side: beam horizontal, transverse vertical; beam: both screen axes transverse; iso/orbit: blend by the swing angle."""
    L, T = framing_extent(meta, t)
    hw, hh = (v * 0.85 for v in _half_extents(D0))
    if preset == "front":
        return max(L / hh, T / hw, 0.3)
    side = max(L / hw, T / hh)
    beam = T / min(hw, hh)
    if preset == "beam":
        return beam
    if preset == "iso":
        swing = max(swing, 0.6)
    c = math.cos(swing)
    return max(side * c + beam * (1 - c), beam, 0.3)


def build_camera_rig(preset, meta, times, move="follow"):
    """Pivot empty at the origin with the camera as child. Moves:
    - 'static': fixed framing of the final state;
    - 'follow': pivot scale keyframed so the approach, the collision and the expansion stay framed
       (fast pull-back as hadrons stream out at ~c);
    - 'orbit' : 'follow' plus a 70 deg swing about the impact-parameter axis during the expansion, ending on the
       near-beam-axis view where the elliptic (almond) flow pattern is visible
       (70 deg rather than 90 so the spectators flying toward the lens do not hide it)."""
    sc = bpy.context.scene
    pivot = bpy.data.objects.new("hic_cam_pivot", None); sc.collection.objects.link(pivot)
    cam = bpy.data.objects.new("hic_camera", bpy.data.cameras.new("hic_camera")); sc.collection.objects.link(cam)
    cam.parent = pivot; cam.data.lens = 40; cam.data.clip_start = 0.05; cam.data.clip_end = 5000
    set_camera_preset(cam, preset)
    sc.camera = cam
    F = len(times)
    if VIEW.get("tilt_deg"):   # fixed elevation: camera raised towards +z so the flattened nuclei are seen as discs
        pivot.rotation_euler = (-math.radians(VIEW["tilt_deg"]), 0.0, 0.0)
    if move == "static":
        s_ = _scale_for(preset, meta, float(times[-1]))
        pivot.scale = (s_, s_, s_)
        return cam
    step = max(1, F // 60)
    prev = None
    for i in list(range(0, F, step)) + [F - 1]:
        t = float(times[i])
        swing = 0.0
        if move == "orbit":
            f0 = int(meta.get("frame_of_collision", 0))
            u = 0.0 if i <= f0 else min(1.0, (i - f0) / max(F - 1 - f0, 1))
            u = u * u * (3 - 2 * u)   # smoothstep
            swing = math.radians(70) * u
            pivot.rotation_euler = (-swing, 0.0, 0.0); pivot.keyframe_insert("rotation_euler", frame=i + 1)
        s_ = _scale_for(preset, meta, t, swing)
        pivot.scale = (s_, s_, s_); pivot.keyframe_insert("scale", frame=i + 1)
    return cam


LEGEND_SPECIES = [("π", (1.0, 0.85, 0.2, 1)), ("K", (0.2, 0.9, 0.4, 1)), ("p", (0.3, 0.55, 1.0, 1)), ("p̄", (0.9, 0.3, 0.3, 1)),
                  ("n", (0.35, 0.35, 0.45, 1)), ("Λ Ξ Ω", (0.85, 0.35, 0.95, 1)), ("φ", (0.2, 0.9, 0.9, 1)), ("d", (0.4, 0.8, 1.0, 1)),
                  ("nucleon (p / n)", (0.85, 0.85, 0.95, 1))]


def _emit_mat(name, rgba, strength=2.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgba
    b.inputs["Emission Color"].default_value = rgba; b.inputs["Emission Strength"].default_value = strength
    return m


def _text(name, body, parent, loc, size, mat, align='LEFT'):
    c = bpy.data.curves.new(name, 'FONT'); c.body = body; c.size = size; c.align_x = align; c.space_line = 1.15
    o = bpy.data.objects.new(name, c); bpy.context.scene.collection.objects.link(o)
    o.parent = parent; o.location = loc; c.materials.append(mat)
    return c, o


def build_overlays(cam, meta, T_scale):
    """HUD text (top left), temperature colour key (right) and species key (bottom left), all camera children at
    OVERLAY_D in front of the lens. Screen half-extent at distance d: 0.45 d horizontally, 0.253 d vertically (16:9)."""
    d = OVERLAY_D; hw, hh = _half_extents(d)
    white = _emit_mat("hic_hud", (1, 1, 1, 1), 3.0)
    hud, _ = _text("hic_hud", "", cam, (-hw + 0.1, hh - 0.15, -d), 0.085, white)
    if "hud" not in VIEW["overlays"]:
        hud.body = ""
    if "tkey" in VIEW["overlays"]:
        _temperature_key(cam, d, hw, hh, T_scale, white)
    if "skey" in VIEW["overlays"]:
        _species_key(cam, d, hw, hh, white)
    return hud


def _temperature_key(cam, d, hw, hh, T_scale, white):
    """blackbody(T * T_scale K/MeV) from T_lo to 500 MeV, the same mapping as the volume shader."""
    T_lo, T_hi = VIEW["T_lo"], 500.0
    if VIEW["aspect"] < 1:
        return _temperature_key_horizontal(cam, d, hw, hh, T_scale, white, T_lo, T_hi)
    bar_h = min(1.3 * hh, 2.0); x0 = hw - 0.5; y0 = -0.55 * hh
    me = bpy.data.meshes.new("hic_legend_bar")
    me.from_pydata([(0, 0, 0), (0.06, 0, 0), (0.06, bar_h, 0), (0, bar_h, 0)], [], [(0, 1, 2, 3)])
    bar = bpy.data.objects.new("hic_legend_bar", me); bpy.context.scene.collection.objects.link(bar)
    bar.parent = cam; bar.location = (x0, y0, -d)
    m = bpy.data.materials.new("hic_legend_bar"); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.bl_idname != "ShaderNodeOutputMaterial": nt.nodes.remove(n)
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = T_lo * T_scale; mr.inputs["To Max"].default_value = T_hi * T_scale
    bb = nt.nodes.new("ShaderNodeBlackbody"); em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 0.8
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"]); nt.links.new(sep.outputs["Y"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], bb.inputs["Temperature"]); nt.links.new(bb.outputs["Color"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], nt.nodes["Material Output"].inputs["Surface"])
    me.materials.append(m)
    ticks = [(500, "500 MeV"), (400, "400"), (300, "300"), (200, "200"), (156.5, "156.5  T_c")]
    if T_lo < 150:
        ticks.append((T_lo, f"{T_lo:.0f}  hadron gas"))
    for T, label in ticks:
        y = y0 + bar_h * (T - T_lo) / (T_hi - T_lo)
        _text(f"hic_legend_T{int(T)}", label, cam, (x0 + 0.09, y - 0.025, -d), 0.06, white)
    _text("hic_legend_title", "temperature", cam, (x0 + 0.03, y0 + bar_h + 0.08, -d), 0.06, white, align='CENTER')


def _blackbody_material(name, T_lo, T_hi, T_scale, axis="Y"):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.bl_idname != "ShaderNodeOutputMaterial": nt.nodes.remove(n)
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = T_lo * T_scale; mr.inputs["To Max"].default_value = T_hi * T_scale
    bb = nt.nodes.new("ShaderNodeBlackbody"); em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 0.8
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"]); nt.links.new(sep.outputs[axis], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], bb.inputs["Temperature"]); nt.links.new(bb.outputs["Color"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], nt.nodes["Material Output"].inputs["Surface"])
    return m


def _temperature_key_horizontal(cam, d, hw, hh, T_scale, white, T_lo, T_hi):
    """Portrait panels: horizontal colour bar along the (empty) bottom of the frame, labels below it."""
    bar_w = 1.6 * hw; x0 = -0.8 * hw; y0 = -0.8 * hh
    me = bpy.data.meshes.new("hic_legend_bar")
    me.from_pydata([(0, 0, 0), (bar_w, 0, 0), (bar_w, 0.06, 0), (0, 0.06, 0)], [], [(0, 1, 2, 3)])
    bar = bpy.data.objects.new("hic_legend_bar", me); bpy.context.scene.collection.objects.link(bar)
    bar.parent = cam; bar.location = (x0, y0, -d)
    me.materials.append(_blackbody_material("hic_legend_bar", T_lo, T_hi, T_scale, axis="X"))
    for T, label in ((T_lo, f"{T_lo:.0f}"), (156.5, "T_c"), (200, "200"), (300, "300"), (400, "400"), (500, "500 MeV")):
        x = x0 + bar_w * (T - T_lo) / (T_hi - T_lo)
        _text(f"hic_legend_T{int(T)}", label, cam, (x, y0 - 0.1, -d), 0.06, white, align='CENTER')
    _text("hic_legend_title", "temperature (colour = blackbody of T)", cam, (x0 + bar_w / 2, y0 + 0.1, -d), 0.06, white, align='CENTER')


LEGEND_NUCLEONS = [("proton", (0.85, 0.85, 0.95, 1)), ("neutron", (0.35, 0.35, 0.4, 1)),
                   ("flash: participant at impact", (1.0, 1.0, 1.0, 1))]


def _species_key(cam, d, hw, hh, white):
    entries = LEGEND_SPECIES if VIEW["show_hadrons"] else LEGEND_NUCLEONS
    sph = bpy.data.meshes.new("hic_legend_dot")
    import bmesh
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=8, radius=0.025); bm.to_mesh(sph); bm.free()
    for k, (label, rgba) in enumerate(entries):
        y = -hh + 0.15 + 0.1 * (len(entries) - 1 - k)
        dot = bpy.data.objects.new(f"hic_legend_dot{k}", sph.copy()); bpy.context.scene.collection.objects.link(dot)
        dot.parent = cam; dot.location = (-hw + 0.15, y + 0.02, -d); dot.data.materials.append(_emit_mat(f"hic_legend_c{k}", rgba, 2.0))
        _text(f"hic_legend_s{k}", label, cam, (-hw + 0.22, y, -d), 0.06, white)


def _cent_label(c):
    edges = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    for lo, hi in zip(edges[:-1], edges[1:]):
        if c <= hi:
            return f"{lo}-{hi}% centrality"
    return "ultra-peripheral"


def hud_text(meta, frame):
    if "hud" not in VIEW["overlays"]:
        return ""
    h = meta["hud"][max(0, min(frame - 1, len(meta["hud"]) - 1))]
    t = h["t"]
    if VIEW["compact_hud"]:
        c = meta.get("c_mid")
        lines = [f"b = {meta['b']:.1f} fm" + (f"   (~{_cent_label(c)})" if c is not None else ""),
                 f"N_part = {meta['npart']}   N_coll = {meta['ncoll']}" if meta.get("npart") is not None else "",
                 f"t = {t:+.2f} fm/c", f"{h['phase']}"]
        if t > 0 and h["T_max_MeV"] > 0:
            lines.append(f"T_max = {h['T_max_MeV']:.0f} MeV")
        return "\n".join(l for l in lines if l)
    e = meta.get("sqrt_snn") or 0
    energy = (f"√s_NN = {e/1000:.2f} TeV" if e >= 1000 else f"√s_NN = {e:.1f} GeV") if e else ""
    lines = [f"{meta['system']}  {energy}".rstrip()]
    geo = []
    if meta.get("centrality"):
        geo.append(f"centrality {meta['centrality'][0]:g}-{meta['centrality'][1]:g}%")
    if meta.get("b") is not None:
        geo.append(f"b = {meta['b']:.1f} fm")
    if meta.get("npart") is not None:
        geo.append(f"N_part = {meta['npart']}   N_coll = {meta['ncoll']}")
    if geo:
        lines.append("   ".join(geo))
    lines += [f"t = {t:+.2f} fm/c   ({t*3.336e-24:+.2e} s)", f"phase (midrapidity): {h['phase']}"]
    if t > 0 and h["T_max_MeV"] > 0:
        # midrapidity (eta_s = 0) value: consistent with the phase label; the lab-frame 3D maximum keeps rising
        # near the light cone (|z| -> t means proper time -> 0) and would be misleading here
        lines.append(f"T_max (midrapidity) = {h['T_max_MeV']:.0f} MeV   QGP entropy fraction = {100*h.get('qgp_fraction',0):.0f}%")
    floor = meta.get("params", {}).get("pancake_floor_fm", 0.0); gam = meta.get("gamma", 1.0) or 1.0
    if t <= 0.5 and floor > 0 and floor > 13.0 / gam:
        lines.append(f"nuclear thickness shown ≥ {floor:.1f} fm (true 2R/γ = {13.2/gam:.4f} fm)")
    if h.get("n_free", 0) > 0 and VIEW["show_hadrons"]:
        lines.append(f"free-streaming hadrons: {h['n_free']}")
    import textwrap
    for w in meta.get("warnings", []):
        lines += textwrap.wrap("note: " + w, width=72, subsequent_indent="      ")
    return "\n".join(lines)


@persistent
def _frame_handler(scene, depsgraph=None):
    if not _CTX:
        return
    data = _CTX["data"]; F = _CTX["F"]; Nn = _CTX["Nn"]
    f = int(np.clip(scene.frame_current - scene.frame_start, 0, F - 1))
    st_all = data["state"][f]; pos_all = data["pos"][f]; t = float(data["times"][f])
    me = bpy.data.meshes.get(_CTX["nuc_name"])
    if me is not None and Nn:
        st = st_all[:Nn]
        me.attributes["position"].data.foreach_set("vector", np.ascontiguousarray(pos_all[:Nn]).ravel())
        rad = np.where(st == HIDDEN, 0.0, 0.8 * _CTX["radius_scale"]).astype(np.float32)
        if t > 0:   # participants fade out while the fireball forms (see Event.frame_nucleons)
            t_fade = float(_CTX["meta"].get("params", {}).get("tau_0", 0.4)) + 0.3
            part = data["participant"][:Nn]
            rad[part] *= max(0.0, 1.0 - t / t_fade)
        me.attributes["size"].data.foreach_set("value", rad)
        glow = np.where(st == SPECTATOR, 0.3, 0.2).astype(np.float32)
        if t > -0.5:   # participants light up from just before the overlap until they have faded into the fireball
            glow[data["participant"][:Nn]] = 3.0
        me.attributes["glow"].data.foreach_set("value", glow)
        me.update()
    pc = bpy.data.pointclouds.get(_CTX["pc_name"])
    if pc is not None and len(pc.points) > 0:      # nucleons-only caches have an empty point cloud
        st = st_all[Nn:]
        pc.attributes["position"].data.foreach_set("vector", np.ascontiguousarray(pos_all[Nn:]).ravel())
        rad = np.zeros(len(st), np.float32)
        for s_val in np.unique(st):
            rad[st == s_val] = STATE_RADIUS[int(s_val)]
        rad *= _CTX["base_r"][Nn:] * _CTX["radius_scale"]
        pc.attributes["radius"].data.foreach_set("value", rad)
        glow = np.where(st == FREE, 1.5, np.where(st == HADRON_GAS, 0.8, 0.2)).astype(np.float32)
        pc.attributes["glow"].data.foreach_set("value", glow)
        pc.attributes["state"].data.foreach_set("value", st.astype(np.int32))
        pc.update_tag()
    hud = bpy.data.curves.get(_CTX["hud_name"])
    if hud is not None:
        hud.body = hud_text(_CTX["meta"], scene.frame_current)


def install_handlers():
    for h in list(bpy.app.handlers.frame_change_pre):
        if getattr(h, "__name__", "") == "_frame_handler":
            bpy.app.handlers.frame_change_pre.remove(h)
    bpy.app.handlers.frame_change_pre.append(_frame_handler)


def setup_render(engine="EEVEE", resolution=(1920, 1080), samples=None):
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = resolution
    sc.render.image_settings.file_format = 'PNG'
    if engine.upper() == "CYCLES":
        sc.render.engine = 'CYCLES'; sc.cycles.samples = samples or 64
        try:
            prefs = bpy.context.preferences.addons['cycles'].preferences
            prefs.compute_device_type = 'METAL'; prefs.get_devices()
            for d in prefs.devices: d.use = (d.type == 'METAL')
            sc.cycles.device = 'GPU'
        except Exception:
            pass
    else:
        sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = samples or 16
        sc.eevee.volumetric_tile_size = '4'; sc.eevee.volumetric_samples = 64
    sc.render.use_lock_interface = True
