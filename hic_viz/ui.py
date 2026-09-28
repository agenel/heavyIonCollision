import bpy


class HIC_PT_base:
    bl_space_type = 'VIEW_3D'; bl_region_type = 'UI'; bl_category = "Heavy Ion"


class HIC_PT_main(HIC_PT_base, bpy.types.Panel):
    bl_label = "Heavy-Ion Collision"; bl_idname = "HIC_PT_main"

    def draw(self, context):
        p = context.scene.hic; L = self.layout
        row = L.row(align=True); row.prop(p, "preset", text=""); row.operator("hic.load_preset", text="Load", icon='IMPORT')
        col = L.column(align=True)
        col.prop(p, "nucleus_a"); col.prop(p, "nucleus_b"); col.prop(p, "energy")
        if p.energy == "CUSTOM": col.prop(p, "energy_custom")
        col.prop(p, "centrality")
        if p.centrality == "B": col.prop(p, "impact_b")
        col.prop(p, "seed"); col.prop(p, "mult_scale")
        L.prop(p, "cache_dir")
        row = L.row(align=True); row.scale_y = 1.4
        row.operator("hic.run_event", icon='PLAY')
        L.operator("hic.build_scene", icon='FILE_REFRESH')
        box = L.box(); box.label(text=f"Status: {p.status}"); box.prop(p, "progress", text="")
        L.operator("hic.render_animation", icon='RENDER_ANIMATION')


class HIC_PT_physics(HIC_PT_base, bpy.types.Panel):
    bl_label = "Physics parameters"; bl_idname = "HIC_PT_physics"; bl_parent_id = "HIC_PT_main"; bl_options = {'DEFAULT_CLOSED'}

    def draw(self, context):
        p = context.scene.hic; L = self.layout
        L.label(text="Glauber (initial geometry)", icon='MESH_UVSPHERE')
        c = L.column(align=True); c.prop(p, "d_min"); c.prop(p, "profile")
        if p.profile == "gauss": c.prop(p, "omega")
        c.prop(p, "neutron_skin"); c.prop(p, "orientation")
        L.label(text="Initial state / QGP", icon='LIGHT_SUN')
        c = L.column(align=True); c.prop(p, "trento_file"); c.prop(p, "tau_0"); c.prop(p, "tau_acc"); c.prop(p, "nucleon_width"); c.prop(p, "fluct_k"); c.prop(p, "trento_p"); c.prop(p, "S_per_ch")
        L.label(text="Freeze-out (blast wave)", icon='PARTICLES')
        c = L.column(align=True); c.prop(p, "T_kin"); c.prop(p, "beta_T"); c.prop(p, "tau_had"); c.prop(p, "v2"); c.prop(p, "v3"); c.prop(p, "calibrate_flow")
        c.prop(p, "include_neutral"); c.prop(p, "include_spectators")


class HIC_PT_time(HIC_PT_base, bpy.types.Panel):
    bl_label = "Time & frames"; bl_idname = "HIC_PT_time"; bl_parent_id = "HIC_PT_main"; bl_options = {'DEFAULT_CLOSED'}

    def draw(self, context):
        p = context.scene.hic; c = self.layout.column(align=True)
        c.prop(p, "fps"); c.prop(p, "n_pre"); c.prop(p, "t_approach"); c.prop(p, "n_post"); c.prop(p, "t_end"); c.prop(p, "warp_power"); c.prop(p, "pancake_floor")
        c.label(text=f"post-collision: {p.t_end / max(p.n_post, 1):.3f} fm/c per frame (linear)")


class HIC_PT_look(HIC_PT_base, bpy.types.Panel):
    bl_label = "Look & render"; bl_idname = "HIC_PT_look"; bl_parent_id = "HIC_PT_main"; bl_options = {'DEFAULT_CLOSED'}

    def draw(self, context):
        p = context.scene.hic; L = self.layout; c = L.column(align=True)
        c.prop(p, "vol_voxel"); c.prop(p, "vol_nx"); c.prop(p, "vol_nz")
        c.separator(); c.prop(p, "radius_scale"); c.prop(p, "T_scale"); c.prop(p, "density_gain"); c.prop(p, "emission_gain")
        c.prop(p, "camera"); c.prop(p, "camera_move"); c.prop(p, "engine")
        L.operator("hic.apply_look", icon='MATERIAL')


classes = (HIC_PT_main, HIC_PT_physics, HIC_PT_time, HIC_PT_look)
