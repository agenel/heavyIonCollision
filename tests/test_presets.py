import pytest
from hic_core import presets
from hic_core.event import Event


def test_every_preset_builds_params():
    for name in presets.load():
        p = presets.event_params(name)
        assert p.A and p.B and p.sqrt_snn > 0


@pytest.mark.parametrize("name", ["pPb_5020_central", "UU_193_bodybody", "CuAu_200_central"])
def test_selected_presets_run(name):
    e = Event(presets.event_params(name, mult_scale=0.1, n_pre_frames=2, n_post_frames=5, grid_cells=48, calibrate_flow=False)).run()
    i = e.info
    assert i["dNch_deta_target"] > 5 and i["npart"] >= 2 and len(e.times) == 8
