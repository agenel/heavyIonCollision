import os, numpy as np, pytest
from hic_core.importers import oscar, grids, convert, pdg
FIX = os.path.join(os.path.dirname(__file__), "fixtures")
F = lambda n: os.path.join(FIX, n)


@pytest.mark.parametrize("name,first_event", [("smash_oscar2013_3.4.oscar", 0), ("smash_oscar2013_2.1.oscar", 0), ("smash_oscar2013_1.8.oscar", 1)])
def test_smash_ascii_all_versions(name, first_event):
    blocks, infos = oscar.read_particles(F(name))
    assert [b.kind for b in blocks] == ["in", "out"]
    assert blocks[0].t == -5 and blocks[1].t == 1
    assert list(blocks[1].data["pdg"]) == [2212, 2112] and blocks[1].data["px"][0] == pytest.approx(0.1)
    info = list(infos.values())[0]
    assert info.event == first_event and info.impact == pytest.approx(2.4) and info.interacted is True


def test_smash_binary_v10():
    blocks, infos = oscar.read_particles(F("particles_oscar2013.bin"))
    assert len(blocks) == 1 and blocks[0].t == 1 and list(blocks[0].data["ID"]) == [0, 1]
    assert infos[(0, 0)].impact == pytest.approx(2.4) and infos[(0, 0)].interacted


def test_urqmd_f19_and_f20():
    b19, i19 = oscar.read_particles(F("urqmd_f19.oscar"))
    assert b19[0].kind == "freezeout" and list(b19[0].data["pdg"]) == [2212, 211] and b19[0].data["t"][1] == pytest.approx(3.0)
    b20, i20 = oscar.read_particles(F("urqmd_f20.oscar"))
    assert b20[0].kind == "freezeout" and b20[0].data["x"][0] == pytest.approx(1.3) and i20[(1, 0)].impact == pytest.approx(2.5)


def test_trento_grid_orientation():
    h, g, x = grids.read_trento(F("trento_0.dat"))
    assert h["b"] == 2.5 and h["npart"] == 12
    assert g.shape == (4, 4) and np.allclose(x, [-0.3, -0.1, 0.1, 0.3])
    # file row 2 (y = +0.1), column 2 (x = +0.1) holds 1.2 -> g[ix=2, iy=2]; row 1 col 2 (x=+0.1, y=-0.1) holds 0.7
    assert g[2, 2] == 1.2 and g[2, 1] == 0.7 and g[1, 2] == 0.6
    assert g.sum() * 0.2**2 == pytest.approx(h["mult"])


def test_vtk_reader_orientation():
    v = grids.read_vtk(F("T_taustep00000.vtk"))
    assert v["dims"] == (3, 2, 1) and v["data"].shape == (3, 2, 1)
    assert v["data"][1, 0, 0] == 0.25 and v["data"][2, 1, 0] == 0.125


def test_vhlle_series_tau_and_resize(tmp_path):
    base = open(F("T_taustep00000.vtk")).read()
    (tmp_path / "T_taustep00000.vtk").write_text(base)
    (tmp_path / "T_taustep00010.vtk").write_text(base.replace("SPACING 0.2 0.2 0.05", "SPACING 0.4 0.4 0.05"))
    g = grids.read_vhlle_vtk_series(str(tmp_path), "T", tau0=0.6, dtau=0.05)
    assert np.allclose(g.taus, [0.6, 0.6 + 10 * 0.05 * 2])
    assert g.T.max() == pytest.approx(250.0)      # GeV -> MeV


def test_music_binary_reader():
    g = grids.read_music_evolution(F("evolution_all_xyeta.dat"))
    assert g.T.shape == (2, 3, 3, 1) and np.allclose(g.taus, [0.4, 0.5])
    assert g.T[0, 1, 1, 0] == pytest.approx(300.0) and g.T[1, 1, 1, 0] == pytest.approx(220.0)
    assert g.boost_invariant and g.sample_milne(0.45, 0.0, 0.0, 0.0) == pytest.approx(260.0)


def test_pdg_mapping():
    assert list(pdg.species_of([211, -211, 2212, -2212, 3334, 113, 22])) == [0, 1, 6, 7, 14, 19, 20]


def test_oscar_roundtrip_from_level_a(tmp_path):
    """Export a Level-A event as OSCAR2013, import it, and compare the free-streaming positions."""
    from hic_core.event import Event, EventParams, FREE, HADRON_GAS
    from hic_core.exporters import write_oscar2013
    e = Event(EventParams(centrality=(30, 40), seed=4, mult_scale=0.05, n_pre_frames=2, n_post_frames=10, grid_cells=48,
                          calibrate_flow=False)).run()
    times = [4.0, 8.0, 12.0, 16.0, 20.0]
    write_oscar2013(e, str(tmp_path / "a.oscar"), times)
    blocks, _ = oscar.read_particles(str(tmp_path / "a.oscar"))
    tr = convert.ParticleTrack(blocks)
    Nn = len(e.nuc_pos0)
    pos_ref, st = e.frame_particles(20.0)
    pos, vis = tr.at(20.0)
    alive = np.where(np.isin(st[Nn:], (FREE, HADRON_GAS)))[0]
    idx = [tr.index[int(i)] for i in alive]
    assert vis[idx].all()
    assert np.allclose(pos[idx], pos_ref[Nn + alive], atol=2e-3 * np.abs(pos_ref[Nn + alive]).max())
    # between output times, free particles are propagated on straight lines
    pos_ref, st = e.frame_particles(18.0)
    free = np.where(st[Nn:] == FREE)[0]
    free = [i for i in free if e.t_f[i] < 16.0]
    p, v = tr.at(18.0)
    assert np.allclose(p[[tr.index[i] for i in free]], pos_ref[Nn + np.array(free)], atol=1e-2)


def test_music_roundtrip_and_cache(tmp_path):
    """Level-A fireball -> MUSIC binary -> HydroGrid -> cache; lab-frame temperatures must agree with the fireball."""
    from hic_core.event import Event, EventParams
    from hic_core.exporters import fireball_grid
    e = Event(EventParams(centrality=(0, 5), seed=5, mult_scale=0.05, n_pre_frames=2, n_post_frames=10, grid_cells=48,
                          calibrate_flow=False)).run()
    g0 = fireball_grid(e)
    grids.write_music_evolution(str(tmp_path / "evo.dat"), g0, e_cut=0.0)
    g = grids.read_music_evolution(str(tmp_path / "evo.dat"))
    assert g.T.shape == g0.T.shape and np.allclose(g.T, g0.T, rtol=1e-5, atol=1e-2)
    x = np.array([0.0, 2.0, 4.0]); z = np.array([0.0, 1.0, 2.5]); t = 5.0
    ref = e.fb.temperature_3d(t, z, *np.meshgrid(x, x, indexing="ij"))            # (nz, nx, ny)
    X, Y, Z = np.meshgrid(x, x, z, indexing="ij")
    got = g.sample_lab(t, X, Y, Z)
    assert np.allclose(np.transpose(got, (2, 0, 1)), ref, rtol=0.05, atol=3.0)
    meta = convert.build_cache(str(tmp_path / "cache"), grid=g, approach=dict(A="Pb", B="Pb", sqrt_snn=5020, b=e.glauber.b, seed=5),
                               n_pre=4, n_post=8, t_end=10.0, vol_nx=12, vol_nz=16, vol_voxel_fm=2.0, source="test")
    assert os.path.exists(tmp_path / "cache" / "meta.json") and meta["hud"][-1]["T_max_MeV"] > 0


def test_trento_file_as_initial_condition(tmp_path):
    """A TRENTo-format file written from a Glauber event drives the Level-A fireball; eps_n come from the header."""
    from hic_core import glauber
    from hic_core.fireball import trento_reduced_thickness, trento_grid
    from hic_core.event import Event, EventParams
    rng = np.random.default_rng(3)
    ev = glauber.run_event("Pb", "Pb", 5020, b=8.0, rng=rng)
    X, Y, dx = trento_grid(10.0, 100)          # TRENTo defaults: grid-max 10 fm, step 0.2 fm
    TR = trento_reduced_thickness(ev, X, Y, 0.0, 0.96, 1.23, rng)
    lines = ["# event 0", "# b     = 8.0", f"# npart = {ev.npart}", f"# mult  = {TR.sum() * dx * dx}",
             "# e2    = 0.3", "# e3    = 0.2", "# e4    = 0.1", "# e5    = 0.05"]
    lines += [" ".join(f"{v:.6g}" for v in row) for row in TR.T]           # TRENTo stores [iy][ix]
    (tmp_path / "0.dat").write_text("\n".join(lines) + "\n")
    e = Event(EventParams(centrality=(20, 30), trento_file=str(tmp_path / "0.dat"), mult_scale=0.1, n_pre_frames=2,
                          n_post_frames=5, grid_cells=64, calibrate_flow=False)).run()
    assert e.glauber.b == 8.0 and e.info["eps2"] == 0.3
    # the fireball's initial profile is the file's profile (normalised): compare centroids and shapes
    s0 = e.fb.s0; fx = (s0 * e.fb.X).sum() / s0.sum()
    Xt, Yt, _ = trento_grid(10.0, 100); tx = (TR * Xt).sum() / TR.sum()
    assert abs(fx - tx) < 0.3
