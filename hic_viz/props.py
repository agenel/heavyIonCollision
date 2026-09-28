"""Scene-level parameter group exposed in the N-panel. Defaults are the published values (see docs/physics)."""
import bpy
from bpy.props import (FloatProperty, IntProperty, EnumProperty, BoolProperty, StringProperty)
from .hic_core import nuclei, presets as _presets

NUCLEI = [(k, k, v.get("source", "")[:60]) for k, v in nuclei.TABLE.items()]
ENERGIES = [("7.7", "7.7 GeV (RHIC BES)", ""), ("19.6", "19.6 GeV (RHIC BES)", ""), ("39", "39 GeV (RHIC BES)", ""),
            ("62.4", "62.4 GeV (RHIC)", ""), ("130", "130 GeV (RHIC)", ""), ("200", "200 GeV (RHIC top)", ""),
            ("2760", "2.76 TeV (LHC Run 1)", ""), ("5020", "5.02 TeV (LHC Run 2)", ""), ("5360", "5.36 TeV (LHC Run 3)", ""),
            ("5440", "5.44 TeV (Xe-Xe)", ""), ("CUSTOM", "Custom", "use the custom energy field")]
CENTRALITIES = [(f"{a}-{b}", f"{a}-{b}%", "") for a, b in [(0, 5), (5, 10), (10, 20), (20, 30), (30, 40), (40, 50), (50, 60), (60, 70), (70, 80), (80, 90)]] + [("B", "Impact parameter", "use the b field")]


PRESETS = [(k, v["label"], v["description"]) for k, v in _presets.load().items()]


class HIC_Props(bpy.types.PropertyGroup):
    preset: EnumProperty(name="Preset", items=PRESETS, default="PbPb_5020_midcentral")
    # --- collision
    nucleus_a: EnumProperty(name="Projectile", items=NUCLEI, default="Pb208")
    nucleus_b: EnumProperty(name="Target", items=NUCLEI, default="Pb208")
    energy: EnumProperty(name="√s_NN", items=ENERGIES, default="5020")
    energy_custom: FloatProperty(name="Custom √s_NN [GeV]", default=5020.0, min=2.0, max=20000.0)
    centrality: EnumProperty(name="Centrality", items=CENTRALITIES, default="30-40")
    impact_b: FloatProperty(name="b [fm]", default=9.0, min=0.0, max=20.0)
    seed: IntProperty(name="Seed", default=1, min=0)
    # --- Glauber
    d_min: FloatProperty(name="d_min [fm]", default=0.4, min=0.0, max=1.5, description="Minimum nucleon separation (PHOBOS 0.4)")
    profile: EnumProperty(name="NN profile", items=[("disk", "Black disk", ""), ("gauss", "Gaussian (ω)", "")], default="disk")
    omega: FloatProperty(name="ω", default=0.4, min=0.0, max=1.0)
    neutron_skin: BoolProperty(name="Neutron skin (Pb)", default=True)
    orientation: EnumProperty(name="Orientation (deformed)", default="random", items=[
        ("random", "Random", "uniformly random orientation of each nucleus (what the experiments sample)"),
        ("tip-tip", "Tip-tip", "symmetry axes along the beam"),
        ("body-body", "Body-body", "symmetry axes perpendicular to beam and impact parameter"),
        ("body-body-x", "Body-body (along b)", "symmetry axes along the impact parameter")])
    # --- fireball
    tau_0: FloatProperty(name="τ₀ [fm/c]", default=0.4, min=0.1, max=2.0, description="Hydrodynamization time")
    tau_acc: FloatProperty(name="τ_acc [fm/c]", default=2.5, min=0.5, max=10.0, description="Radial flow build-up time")
    nucleon_width: FloatProperty(name="Nucleon width w [fm]", default=0.96, min=0.3, max=1.5)
    fluct_k: FloatProperty(name="Fluctuation k", default=1.23, min=0.3, max=10.0)
    trento_file: StringProperty(name="TRENTo event file", subtype='FILE_PATH', default="",
                                description="Optional: TRENTo text output used as the initial entropy profile (its b overrides)")
    trento_p: FloatProperty(name="TRENTo p", default=0.0, min=-1.0, max=1.0)
    S_per_ch: FloatProperty(name="S / N_ch", default=6.7, min=4.0, max=10.0, description="Entropy per charged hadron (Hanus et al. 2019)")
    T_kin: FloatProperty(name="T_kin [MeV] (0 = data)", default=0.0, min=0.0, max=200.0)
    beta_T: FloatProperty(name="⟨β_T⟩ (0 = data)", default=0.0, min=0.0, max=0.9)
    tau_had: FloatProperty(name="Hadronic phase [fm/c]", default=4.5, min=0.0, max=15.0)
    v2: FloatProperty(name="v₂ (0 = data)", default=0.0, min=0.0, max=0.3)
    v3: FloatProperty(name="v₃ (0 = data)", default=0.0, min=0.0, max=0.1)
    calibrate_flow: BoolProperty(name="Calibrate flow to v_n", default=True)
    # --- final state
    mult_scale: FloatProperty(name="Multiplicity scale", default=1.0, min=0.01, max=1.0, description="1 = full measured multiplicity")
    include_neutral: BoolProperty(name="Neutral hadrons", default=True)
    include_spectators: BoolProperty(name="Spectators", default=True)
    # --- time
    fps: IntProperty(name="fps", default=30, min=1, max=120)
    n_pre: IntProperty(name="Approach frames", default=60, min=0, max=600)
    n_post: IntProperty(name="Collision frames", default=540, min=10, max=5000)
    t_approach: FloatProperty(name="Approach [fm/c]", default=8.0, min=1.0, max=50.0)
    t_end: FloatProperty(name="End time [fm/c]", default=25.0, min=5.0, max=100.0)
    warp_power: FloatProperty(name="Time warp power", default=1.0, min=0.3, max=3.0, description="frame^power mapping: >1 slows the early stages")
    pancake_floor: FloatProperty(name="Pancake thickness floor [fm]", default=1.0, min=0.0, max=5.0, description="Visual minimum nuclear thickness (0 = true Lorentz contraction)")
    # --- volume / look
    vol_voxel: FloatProperty(name="Voxel [fm]", default=0.6, min=0.2, max=2.0)
    vol_nx: IntProperty(name="Voxels xy", default=48, min=16, max=160)
    vol_nz: IntProperty(name="Voxels z", default=84, min=16, max=256)
    radius_scale: FloatProperty(name="Particle size", default=1.0, min=0.1, max=5.0)
    T_scale: FloatProperty(name="Blackbody K per MeV", default=13.0, min=3.0, max=200.0, description="Visual colour mapping: blackbody(T x scale) Kelvin")
    density_gain: FloatProperty(name="Volume density", default=0.15, min=0.0, max=2.0)
    emission_gain: FloatProperty(name="Volume emission", default=0.05, min=0.0, max=2.0, precision=3)
    camera: EnumProperty(name="Camera", items=[("side", "Side", ""), ("beam", "Along beam", ""), ("iso", "Isometric", "")], default="side")
    camera_move: EnumProperty(name="Camera move", default="follow", items=[
        ("static", "Static", "fixed framing of the final state"),
        ("follow", "Follow", "pull back as the matter expands"),
        ("orbit", "Orbit", "follow + swing towards the beam axis to show elliptic flow")])
    engine: EnumProperty(name="Engine", items=[("EEVEE", "EEVEE (preview)", ""), ("CYCLES", "Cycles (Metal)", "")], default="EEVEE")
    cache_dir: StringProperty(name="Cache dir", subtype='DIR_PATH', default="//hic_cache/")
    status: StringProperty(name="Status", default="idle")
    progress: FloatProperty(name="Progress", default=0.0, min=0.0, max=1.0, subtype='FACTOR')

    def to_event_params(self):
        from .hic_core.event import EventParams
        e = float(self.energy_custom) if self.energy == "CUSTOM" else float(self.energy)
        cen = (0, 100); b = None
        if self.centrality == "B":
            b = self.impact_b
        else:
            lo, hi = self.centrality.split("-"); cen = (int(lo), int(hi))
        return EventParams(A=self.nucleus_a, B=self.nucleus_b, sqrt_snn=e, centrality=cen, b=b, seed=self.seed,
                           d_min=self.d_min, profile=self.profile, omega=self.omega, neutron_skin=self.neutron_skin,
                           orientation=self.orientation,
                           trento_file=bpy.path.abspath(self.trento_file) if self.trento_file else None,
                           tau_0=self.tau_0, tau_acc=self.tau_acc, trento_p=self.trento_p, nucleon_width=self.nucleon_width,
                           fluct_k=self.fluct_k, S_per_ch=self.S_per_ch, T_kin_override=self.T_kin or None,
                           beta_T_override=self.beta_T or None, tau_had=self.tau_had, v2_override=self.v2 or None,
                           v3_override=self.v3 or None, calibrate_flow=self.calibrate_flow, mult_scale=self.mult_scale,
                           include_neutral=self.include_neutral, include_spectators=self.include_spectators,
                           fps=self.fps, t_approach=self.t_approach, n_pre_frames=self.n_pre, n_post_frames=self.n_post,
                           t_end=self.t_end, warp_power=self.warp_power, pancake_floor_fm=self.pancake_floor,
                           vol_nx=self.vol_nx, vol_nz=self.vol_nz, vol_voxel_fm=self.vol_voxel)


classes = (HIC_Props,)
