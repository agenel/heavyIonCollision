# Output formats of heavy-ion simulation codes (Level-B importers)

Verified on 2026-09-23 against the codes' source (default branches) and user guides. Items marked **[unverified]** could not be confirmed in source. Parsers: `hic_core/importers/`.

## 1. SMASH — OSCAR2013 "Particles" output (`particle_lists.oscar`)
Sources: smash-transport/smash `src/oscaroutput.cc`, `src/include/smash/outputformatter.h`, `outputparameters.h`, `src/tests/oscar2013output.cc`, `src/binaryoutput.cc` (tags 1.8 … 3.4.1 and main); user guide https://theory.gsi.de/~smash/userguide/current/doxypage_input_conf_output.html

Header (3 lines):
```
#!OSCAR2013 particle_lists t x y z mass p0 px py pz pdg ID charge
# Units: fm fm fm fm GeV GeV GeV GeV GeV none none e
# SMASH-3.4
```
- `#!OSCAR2013Extended` adds `ncoll form_time xsecfac proc_id_origin proc_type_origin time_last_coll pdg_mother1 pdg_mother2 [baryon_number] [strangeness]` (20 / 21 / 22 columns for ≤2.2 / 3.0 / ≥3.1). From 3.2 with `Format: ASCII` the header starts `#!ASCII` and columns are user-chosen. **Always take column names from line 1.**
- Block markers:

| Version | start | intermediate / final | end |
|---|---|---|---|
| ≤1.8 | `# event N in M` (N 1-based) | `# event N out M` | `# event N end 0 impact %7.3f empty yes/no` |
| 2.0–3.1 | `# event N in M` (0-based) | `# event N out M` | `# event N end 0 impact %7.3f scattering_projectile_target yes/no` |
| ≥3.2 | `# event N ensemble E in M` | `# event N ensemble E out M` | `# event N ensemble E end 0 impact %7.3f scattering_projectile_target yes/no` |

- `in` = particles after initialisation; `out` = particles at an output time (every `Output_Interval` when `Only_Final: No`) or the final state; M = number of rows that follow. `Only_Final` is `Yes` (default, one final `out`), `IfNotEmpty` or `No`.
- The block header carries no time: read `t` from the rows **[same t for all rows of a block: expected, unverified]**. Rows: t x y z mass p0 px py pz in fm/GeV (Cartesian lab frame, real time t, not τ), pdg ID charge integers.
- Binary (`particles_oscar2013.bin`, format version 10): `b"SMSH"`, uint16 version, uint16 variant, uint32 len + version string; blocks `'p'` + int32 event + int32 ensemble + uint32 n + n × (9 f8 + 3 i4 = 84 bytes) and `'f'` + int32 event + int32 ensemble + f8 impact + char empty. Older versions **[unverified]**.

## 2. UrQMD — OSCAR 1997A (file19) / 1999A (file20)
Sources: UrQMD 3.4 `urqmd/output.f` (GitHub mirror jbernhard/urqmd-afterburner), UrQMD 4.0 user guide §6.6. UrQMD has no OSCAR2013 writer **[not found]**.
- **OSC1997A**: 3 header lines (`OSC1997A`, `final_id_p_x`, model/version/(A,Z)+(A,Z)/frame/E_beam/testparticles); per event `event npart b 0`, then npart rows `counter pdg px py pz E m x y z t` (Fortran E format). Positions are freeze-out (last interaction) points, not a common time. `CTOption(55)=1` writes a block per output step with header `event npart b 0 nsteps step` and 17-field rows (`… x y z t tform xfr yfr zfr tfr ncoll`).
- **OSC1999A** (full history): 4 `#` header lines; blocks start with `Nin Nout …`: initial list `0 Npart event b 0.0`, collisions `Nin Nout proc counter t sqrt(s) sigtot sigpart rhoB` (fixed widths 7,2,7,2,7,2,7,8,12,12,12,12), final `Npart 0`, end of event `0 0`. Rows: `uid pdg 0 px py pz E m x y z t`.

## 3. vHLLE
Sources: yukarpenko/vhlle `src/fld.cpp`, `src/vtk.cpp`, `src/main.cpp`, `src/fld.h`, `src/cll.cpp`, `README.txt`. Milne coordinates (τ, x, y, η_s); `dx = (xmax-xmin)/(nx-1)`, cell ix at `xmin + ix*dx`; e GeV/fm³, T GeV.
- `outx.dat`/`outy.dat`/`outz.dat` (1-D cuts through the centre, blank line between time steps): `tau x vx vy e nb T mub pi00..pi33 (10) Pi cutflag` (outy: y, vy, vx; outz: η_s, flow rapidity Y, vx). `outdiag.dat` writes two lines per cell (README is wrong).
- **Full grid = VTK output** (`VTK_output_values eps,T,v`): `<q>_taustep%05d.vtk`, legacy ASCII STRUCTURED_POINTS (`DIMENSIONS nx ny nz`, `SPACING dx dy deta`, `ORIGIN xmin ymin etamin`, `SCALARS q double 1`, `LOOKUP_TABLE default`, values x fastest then y then η, 3 decimals). τ is not stored: τ_k = τ0 + k·dtau. After `tauResize` (default 4 fm/c) dx, dy, dtau double and ORIGIN is stale (source bug): use origin = −(n−1)·spacing/2.
- `freezeout.dat`: `tau x y eta dsig0..3 u0..3 T muB muQ muS pi(10, index44 order: 00 01 11 02 12 22 03 13 23 33) Pi [e nb]` (27 or 29 columns, Cartesian dΣ_μ with τ Jacobian).

## 4. MUSIC
Sources: MUSIC-fluid/MUSIC (`public_stable`) `src/grid_info.cpp`, `src/evolve.cpp`, `src/read_in_parameters.cpp`, `src/util.h`; iSS `src/readindata.cpp`. Loops: η outermost, then y, x fastest; raw native float32; `x(ix) = -x_size/2 + ix*dx`.
- **`output_evolution_data 2` → `evolution_all_xyeta.dat`**: header 16 float32 `[tau0, dtau_out, nx, dx, xmin, ny, dy, ymin, neta, deta, etamin, rhob, shear, bulk, diff, nVar]`, `nVar = 11 + 2 rhob + 5 shear + bulk + 3 diff`; records `itau ix iy ieta e[GeV/fm³] P T[GeV] cs2 ux uy uz [rhoB muB] [5 W/(e+P)] [Pi/(e+P)] [3 q]`. Sparse: only cells with e ≥ `output_evolution_e_cut` (0.15 GeV/fm³). uz is Cartesian u^z. Allocate max(index)+1.
- `output_evolution_data 4` (vorticity): 12-float header with nVar = 35 (`hdr[11] == 35` distinguishes it).
- `output_movie_flag 1` → `evolution_for_movie_xyeta.dat`: 12-float header, nVar = 14: `itau ix iy ieta volume e rhoB T muB ux uy tau*u^eta T^{tau t} J_B^tau`, T ≥ `output_evolution_T_cut`.
- `output_evolution_data 1` → `evolution_xyeta.dat` (ASCII, no header, no coordinates): `T muB vx vy vz` per strided cell, frames appended.
- Hypersurface `surface_eps_<e>_<thread>.dat` (binary by default, 34 float32 per element): `tau x y eta dΣ(4, without τ Jacobian) u^τ u^x u^y τu^η eFO T muB muS muQ (e+P)/T W(10) Pi rhoB q(4)` in fm⁻¹ units (×0.19733 to GeV).

## 5. TRENTo
Sources: Duke-QCD/trento `src/output.cxx`, `src/event.cxx`, `src/trento.cxx`, `src/collider.cxx`, `src/nucleus.cxx`.
- `-o DIR` → `DIR/<num>.dat` (zero-padded). Header lines `# event N`, `# b = …`, `# npart = …`, [`# ncoll = …`], `# mult = …`, `# e2 … e5`; body: nsteps × nsteps matrix of norm·T_R (fm⁻²), stored **[iy][ix]** (row = y, column = x, row 0 = most negative y); `nsteps = ceil(2 grid_max / grid_step)`, cell centres `(i+0.5)·step − xymax`, `xymax = nsteps·step/2`; impact parameter along x; `mult = step² Σ grid`.
- HDF5 output needs h5py (not available in Blender); use the text output.

## Known source-vs-documentation discrepancies
1. SMASH end line: `scattering_projectile_target yes` when an interaction happened (guide still says `empty yes_or_no`). 2. SMASH `ensemble` token since 3.2; events 1-based in ≤1.8. 3. vHLLE `outdiag.dat` two lines per cell; VTK ORIGIN stale after resize. 4. MUSIC surface dΣ lacks the τ factor; `uz` is Cartesian. 5. UrQMD 1999A initial-list positions may be zero.
