# Missile ↔ rack alignment

How to place each loaded-missile sprite exactly where the game puts it on its
launcher rack. Companion to `weaponSpriteAnalysis.md` (mount frames, pivots,
layer stack); this file covers only the missile-on-rack part.

Sources: every `data/weapons/*.wpn` with `RENDER_LOADED_MISSILES`
(52 weapons), their `projectileSpecId` targets in `data/weapons/proj/*.proj`,
the art in `graphics/missiles/` + `graphics/weapons/`, pixel measurement with
PIL, and forum/wiki cross-checks.

---

## 1. Rule in one sentence

For each tube `i`, draw the `.proj` missile sprite **once, above the rack
art, nose pointing along the weapon facing (plus that tube's angle offset),
with the missile's `center` point sitting exactly on the tube's fire offset.**
Draw nothing for empty/expended tubes. No engine flame, no contrail, no
scaling beyond the `.proj` `size` box.

This is the same anchor the engine uses when the missile actually fires: a
missile entity's location *is* its center, spawned at the fire offset — so
center-anchoring is also what guarantees no visible "pop" between the racked
missile on frame N and the live missile on frame N+1.

---

## 2. Data chain (where each number lives)

```
.wpn  turretOffsets / hardpointOffsets   -> tube positions (pick by slot mount)
.wpn  turretAngleOffsets / hardpointAngleOffsets -> per-tube facing bias
.wpn  projectileSpecId                   -> data/weapons/proj/<id>.proj
.proj sprite                             -> graphics/missiles/*.png
.proj size  [sw, sh]                     -> display box the PNG is fit into
.proj center [cx, cy]                    -> the anchor point, in box units
```

Offsets are flat `[forward, lateral, …]` pairs in px, same mount frame as gun
muzzles (forward = image-up in the sprite file, 1 px = 1 unit). Keep full
float precision — vanilla uses fractional laterals (amsrm, neutron_torpedo:
`[7, -0.5]`).

---

## 3. Missile art frame

- Missiles are drawn **nose-up** in the PNG, exactly like weapon sprites.
  Verified: harpoon rows go 4–6 px wide at the top (nose) → 8–10 px at the
  bottom (bus/engine); MIRV 4–5 px top → 14 px bottom; atropos/squall/LRM the
  same taper. Wide end = tail = bottom.
- `size: [sw, sh]` is the display box in game px. The PNG (`W×H` px) is
  stretched to fit it — **non-uniformly if needed**. Examples:
  - harpoon: file 12×26 → box [10,22] (uniform ×0.83)
  - MIRV: file 14×30 → box [12,28] (×0.857 / ×0.933 — NOT uniform)
  - squall: file 6×20 → box [6,20] (1:1)
  - reaper torpedo: file 20×32 → box [16,28]
- `center: [cx, cy]` is Cartesian (origin bottom-left, y up, nose = +Y) inside
  that box. Nearly all vanilla missiles center it (`[6,14]` in `[12,28]`);
  asymmetric examples that prove the field is honored, not assumed:
  - harpoon `[5,12]` in `[10,22]` (1 px nose-ward of middle)
  - terminator drone `[9,8]` in `[18,21]` (2.5 px tail-ward; its "missile" is
    a drone sprite, `graphics/ships/drones/drone_terminatorB.png`)
  - rift torpedo `[7,8]` in `[14,16]`, atropos `[5,10.5]` in `[10,21]`
- Box→image mapping (image y grows down, box y grows up):
  `ix = bx · (W/sw)`, `iy = H − by · (H/sh)`.
- Nose protrusion past the tube point (useful sanity check):
  `protrusion = sh − cy` forward px; tail bury behind it: `cy` px. E.g. reaper
  `[8,14]` in `[16,28]`: nose 14 fwd of tube, tail 14 behind.

Quirk to be aware of (flight only, ignore for racks): `.proj` `engineSlots`
`loc`s use an x-forward physics frame (MIRV engine at `[-14,0]` =
half-length 14 behind center; squall `[-9,0]` vs half-length 10; harpoon
`[-13,0]` vs half-length 11; exhaust `angle: 180`), *not* the nose-up art
frame. Racked missiles render no engine output, so this never affects rack
alignment — documented here only so you don't try to reconcile the two
frames via the engine slots.

---

## 4. Worked anchor checks (this install, hardpoint mounts, fwd = up)

Pivot = image center; image-y of a tube = `pivotY − fwd`.

- **Reaper** (`reaper.wpn` → `reaper_torp`): tube `[10,0]`; rack
  `light_reaper_launcher_hardpoint_base` 16×24, pivot y 12 → tube y 2;
  missile box [16,28] centered → spans fwd −4…24. Nose (24) protrudes 12 px
  past the art's front edge (y 0 = fwd 12); tail (fwd −4) hides inside the
  housing (rear at fwd −12). Classic torpedo-on-a-rail look. A nose- or
  tail-anchor would either bury the nose inside the mouth or float the whole
  body off the canvas — center is the only anchor that matches the art.
- **Harpoon** (→ `harpoon_mrm` [10,22] c. [5,12]): 3 tubes
  `[15,−6],[15,6],[15,0]`, fire order lateral-outside-in then middle
  (offset order). Each missile: nose 10 fwd of its tube, tail 12 behind.
- **Hurricane** (→ `type_1_mirv` [12,28] c. [6,14]): single tube `[23,0]`
  hardpoint / `[17,0]` turret. Turret art (70×70) mouth at fwd 34: nose at
  17+14 = 31, i.e. recessed 3 px inside the domed housing — the MIRV sits
  *in* the launcher, unlike the protruding reaper. Same math, different art.
- **Squall** (→ `squall_rocket` [6,20] c. [3,10]): 5 tubes, hardpoint
  `[26,9],[26,5],[26,1],[26,−3],[26,−7]` — constant forward, 4 px lateral
  pitch for a 6 px-wide missile, so neighbors overlap 2 px (drawn as a packed
  slab, in offset order). Missile spans fwd 16…36; rack mouth at fwd 14:
  tail 2 px proud of the mouth, nose 22 px out. The `*under` layer
  (y 34…69) is all rear housing — nothing fills the nose gap, nor needs to,
  since the missile quad is drawn over it.
- **Terminator** (→ drone sprite [18,21] c. [9,8]): single tube `[12,0]`
  hardpoint on `missile_rack_open_s_1x_hardpoint_base` (16×26). Off-center
  `cy = 8` shifts the whole drone 2.5 px nose-ward vs a naive middle anchor —
  include it or the drone visibly mis-seats on the rails.

---

## 5. Which tubes show a missile

- **Full rack (refit/codex/pre-combat): draw one missile per offset pair.**
  Tube count = `len(offsets)/2`: squall 5, harpoon 3, hammerrack 4
  (`[8,±8],[8,±3]` turret), atropos/hammer 2, reaper/hurricane/typhoon 1,
  gazerpod 4, breachpod 5, pilum 3, jackhammer 3, cyclone 2.
- **In combat**, tube `i` is drawn while it still holds a round; fired tubes
  draw nothing (bare cells — there is no "empty missile" art;
  `missile_MIRV_empty.png` / `missile_sabot_empty.png` exist but the
  `emptySpec` references are commented out in every vanilla `.proj`).
  Depletion follows the fire sequence: `ALTERNATING` cycles tubes in offset
  order, `LINKED` fires all loaded tubes together, `ALTERNATING_BURST` per
  burst. Rounds-per-tube ≈ ammo ÷ tubes: harpoon 3/3, atropos 2/2, hammer
  2/2, reaper 1/1 (one round each — each shot visibly empties a cell);
  cyclone 14/2, hammerrack 20/4, pilum 30/3, breachpod 50/5 (cells stay
  loaded for many shots); squall 160/5 (effectively always full until dry).
  Exact per-tube bookkeeping is engine-internal — for static renders just
  draw all tubes loaded.
- **Per-tube facing**: add `angleOffsets[i]` to the weapon facing for that
  missile's quad. Usually all `0`; the fan only matters for spawn direction
  on hint-less weapons (annihilator's commented-out `±7°` fan) and for racked
  quads where present. Staggered *positions* with zero angles are common and
  fully visible: breach hardpoint `[10,−6],[12,0],[10,6]` (middle tube 2 px
  proud), jackhammer `[11,5],[12,0],[11,−5]`, resonanator-style offsets.
- **Draw order**: missiles render **above** the rack base sprite
  (forum-confirmed: the hint "will always render the loaded missile image
  ABOVE the missile sprite"). Suggested: base → under/base → missiles in
  offset order → glow → flash/smoke. Squall additionally has `*under` layers
  (rear housing, behind everything of the mount).

## 6. When the hint is absent — painted tubes, spawn-only offsets

`RENDER_LOADED_MISSILES` is what turns offsets into visible missiles. Without
it, offsets still set projectile spawn points/directions but draw nothing:
- **Annihilator** (5 tubes + `±7°/±3.5°` fan, ammo 50/burst 5): tubes are
  painted into `launcher_annihilator_*` art; no dynamic missile quads.
- **Locust, swarm launchers, swarmer(_fighter), vortex_launcher, rift*
  minelayers**: same — painted cells or nothing; minelayer/phase-charge
  weapons (`minelayer1/2`, `phasecl`) show an empty projector housing.
- **Fragment/swarm payloads** (`seeker_fragment`, `unstable_fragment`,
  `kinetic_fragments`, `devouring_swarm` with its hint commented out):
  offsets are `[0,0]` stacks at the pivot and the "missiles" are invisible
  (`graphics/fx/empty.png`) or script-spawned — draw the mount only.
- **Bombs/mines** with real offsets (`bomb`, `fragbomb`, `clusterbomb`
  `[11,±4],[3,±6],[3,0]`…) follow the same anchor math when the hint is
  present; `[0,0]` ones sit centered on the pivot.

Hint variants: `RENDER_LOADED_MISSILES_UNLESS_HIDDEN` (no vanilla user in this
install, standard in mods) suppresses the quads in hidden slots — the fix
recommended on the forums for ammo sprites leaking onto hidden hardpoints.
`NEVER_RENDER_IN_CAMPAIGN` hides rack + missiles on the campaign map.

## 7. Render recipe (per mount, per frame)

```
spec  = wpn projectileSpecId -> proj {sprite, size:[sw,sh], center:[cx,cy]}
tubes = (slot.mount == HARDPOINT ? hardpointOffsets : turretOffsets)  # [fwd,lat]*
angs  = matching angleOffsets
for i, (fwd, lat) in enumerate(tubes):
    if tube i expended: continue
    pos   = mountPivot + R(weaponAngle) * (lat, -fwd)   # px; fwd = image-up
    angle = weaponAngle + angs[i]                        # nose direction
    quad  = sw x sh box, nose (+Y box edge) along angle,
            box-point (cx,cy) pinned exactly on pos
    draw quad (sprite fit to box, possibly non-uniform) above rack base
```

Calibration points: reaper nose 14 px ahead of tube / tail 14 behind;
hurricane turret nose 3 px inside housing mouth; squall slab 5 quads at 4 px
pitch overlapping 2 px; terminator shifted by asymmetric `cy = 8`.
