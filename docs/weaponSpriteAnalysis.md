# Weapon sprite rendering analysis

How the game turns a `.wpn` file + its PNGs into the weapon you see in combat,
and what every field observed in `data/weapons/*.wpn` in this installation does
to that picture. Goal: render each sprite pixel-perfectly.

Sources: all 156+ `.wpn` files in `data/weapons/`, the PNGs in
`graphics/weapons/`, `starfarer.api.zip` (`WeaponSpecAPI`, `BeamWeaponSpecAPI`,
`ProjectileWeaponSpecAPI`, `WeaponSlotAPI`), one `.ship` file (`wolf.ship`),
pixel-level measurement of vanilla sprites with PIL, and the community wiki
`.wpn` overview (used only to cross-check names).

---

## 1. Coordinate system and sprite orientation (the most important part)

1. **Sprites are drawn pointing UP in the PNG.** "Up" means toward the top row
   of the image (image `-Y`). The game rotates that "up" vector onto the
   weapon's facing direction (ship facing + weapon angle + turret rotation).
   - Evidence from this install: hardpoint sprites are systematically taller
     than wide (e.g. `hephaestus_hardpoint_base.png` is 36x68,
     `tactical_laser_hardpoint.png` is 16x28, hurricane hardpoint 34x68),
     which only makes sense for an up-facing weapon. Alpha-mass analysis:
     `hephaestus_hardpoint_base` opaque bbox y 15..66, centroid y 44.6 vs
     image center y 34 (mass hangs *below* pivot = breech/rear housing);
     `hephaestus_hardpoint_recoil` bbox y 1..40, centroid y 20.5 (barrels live
     *above* pivot = toward the muzzle). Turret sprites are square canvases
     (26x26, 68x68, 72x72) so they can rotate about their center without
     clipping.
2. **The rotation pivot is the exact center of the image**
   `(width/2, height/2)`. The pivot is placed on the weapon-slot position from
   the `.ship` file (`weaponSlots[].locations`). This is why the wiki warns
   that sprite centers should sit on half-pixels and odd-width sprites blur:
   a 1-px registration error is visible when the turret rotates.
3. **1 PNG pixel = 1 game unit.** Offsets, `visualRecoil`, and `width` are all
   in pixels. There is no scaling of weapon sprites in combat (missile `.proj`
   `size` scaling is a different system and does not apply here).
4. **Offset convention: `[forward, lateral]`.** `turretOffsets` /
   `hardpointOffsets` are flat arrays of pairs: first value = distance
   *forward* from the pivot along the weapon facing (toward the muzzle, i.e.
    toward image top), second = lateral (positive = one side, negative = the
    other; sign-to-left/right depends on facing, so just mirror it).
    Measured against tube openings in `resonator_turret_base.png`: for an
    up-facing preview, +lateral renders LEFT of the pivot
    (screen x = pivot_x − lateral), and per-barrel angle offsets are
    counterclockwise-positive (negate into CSS clockwise rotation).
   Example: hephag `"turretOffsets":[25,-3, 25,3]` = two barrels, each 25 px
   forward of pivot, +/-3 px to the sides. Tachyon lance uses a *negative*
   forward offset (`[-3,0]` / `[5,0]`): the beam origin sits ~at/behind the
   pivot, inside the sprite — legal and rendered as-is. Squall lists 5 pairs
   (5 tubes). Pairs count = `len/2`; there must be exactly that many entries
   in the matching `...AngleOffsets` array.
5. **Turret vs hardpoint.** The `.ship` slot's `mount` (`TURRET`, `HARDPOINT`,
   `HIDDEN`, plus `SystemSlot`/built-in/decorative flags) selects which sprite
   set is drawn: `turret*` keys for turret mounts, `hardpoint*` keys for
   hardpoint mounts. Turret sprites rotate within the slot `arc` around the
   slot `angle`; hardpoint sprites are drawn at the fixed slot angle (slot
   `arc` ~5). There are **no** `hidden*` sprite keys in any vanilla `.wpn`,
   so hidden/system slots have no dedicated mount art (they either draw
   nothing or fall back to the turret set depending on engine path — do not
   invent art for them).
6. **Square turret canvas rule.** Because the pivot is the image center and
   the sprite rotates, turret PNGs must be square with enough padding that no
   frame of rotation clips. Hardpoint PNGs do not rotate and can be
   non-square (usually narrow/tall).

### Perfect-render recipe (static mount)

```
img = load(PNG)                       # RGBA, drawn pointing up
pivot = (img.w/2, img.h/2)
worldAngle = shipFacing + slot.angle + turretRotation + perBarrelAngleOffset
draw img centered on slotWorldPos, rotated by (worldAngle + 90°)
   # +90° maps image-up to facing-0°-is-+X; verify sign against tachyon/heph
   # using the muzzle positions below
muzzle_i = slotWorldPos + rotate((lateral_i, -forward_i), worldAngle)
   # note y-flip: forward+ in .wpn = image -Y
```

Calibrate the rotation sign with hephag: hardpoint muzzle must land ~6 px
beyond the top edge of the 68-tall sprite (offset 40 vs half-height 34), and
tachyon's beam origin must land ~3 px behind the turret pivot.

---

## 2. Layer stack (back to front) for one weapon mount

From rearmost to frontmost, as composed in combat:

1. Ship hull sprite (and `renderBelowAllWeapons` weapons go under *all*
   weapon layers but still above the hull — e.g. `lights_hound`,
   `sensordish`, blinkers).
2. `turretUnderSprite` / `hardpointUnderSprite` (rare: mjolnir, squall,
   arbalest has them commented out). Static, rotates with the mount.
3. `turretSprite` / `hardpointSprite` — the base. Static except for
   `numFrames` animation and recoil translation of the *gun* layer only.
4. `turretGunSprite` / `hardpointGunSprite` — the recoiling barrel layer,
   **only if `visualRecoil` is non-zero** (vanilla comment is explicit:
   "the gun sprites are only used if this is non-0"). Slides backward
   (toward breech, image +Y) by up to `visualRecoil` px on firing, then
   springs back. `RENDER_BARREL_BELOW` puts this layer *under* the base
   (vulcan, hephag, arbalest, mjolnir, lightac…); default is above the base.
   `separateRecoilForLinkedBarrels` (1 vanilla user) recoils each linked
   barrel independently.
5. `turretGlowSprite` / `hardpointGlowSprite` — additive-blended glow overlay,
   same canvas size/registration as the base (must share the pivot or it will
   swim during rotation). Tinted/pulsed per `glowColor` + `animationType`.
6. Loaded-missile overlay — only with `RENDER_LOADED_MISSILES` (52 vanilla
   missile weapons: hurricane, squall, terminator…): draws one ready-missile
   sprite per loaded tube/ammo at the barrel positions, on top of the mount.
   Fired/expended tubes render empty (compare hurricane full vs empty).
   `RENDER_LOADED_MISSILES_UNLESS_HIDDEN` (wiki-listed) is the same but
   suppressed for hidden mounts.
7. `muzzleFlashSpec` particles + `smokeSpec` clouds/blowback, emitted at the
   firing barrel's muzzle point along weapon facing (purely transient —
   part of the "fired" look; needed for a perfect *firing* render).
8. Beam quad (beam weapons only), drawn from the firing offset outward along
   weapon facing, under/over glow per engine order (see §5).

Global order modifiers: `renderBelowAllWeapons:true` (decorative lights,
dishes, blinkers) forces the whole mount under other weapons;
`renderAboveAllWeapons` (in API; no vanilla `.wpn` user found) forces it
above. `RENDER_ADDITIVE` (blinkers, lights) draws the base sprite itself
additive instead of alpha-normal. `RENDER_IN_CAMPAIGN` /
`NEVER_RENDER_IN_CAMPAIGN` (1 vanilla user) control campaign-map rendering
only. Empty mounts in refit draw a tech-style `cover_*` sprite from
`graphics/weapons/covers/` (not referenced by `.wpn`).

---

## 3. Every `.wpn` field observed in this install, and its rendering effect

Counts are over `data/weapons/*.wpn` here. "Render" = changes pixels;
"Logic" = no pixel effect (listed so you know to ignore it for rendering).

### 3a. Sprite selection (render — the core of this document)

| Field | N | Effect |
|---|---|---|
| `turretSprite` / `hardpointSprite` | 165/165 | Base mount image. Turret set used on turret slots, hardpoint set on hardpoint slots. Turret canvas must be square, pivot = image center. Missing/empty string (terminator has them commented out in a variant) = draw nothing for that layer. |
| `turretGunSprite` / `hardpointGunSprite` | 29/29 | Recoiling barrel layer. **Ignored unless `visualRecoil != 0`.** Same size/registration as base; slides toward breech on fire. |
| `turretUnderSprite` / `hardpointUnderSprite` | 3/3 | Static layer behind the base (mjolnir, squall, arbalest-commented). Rotates with mount. |
| `turretGlowSprite` / `hardpointGlowSprite` | 69/68 | Additive glow overlay, same registration as base. Opacity/pulse driven by `animationType` + `glowColor`. Energy weapons (shockrepeater, gauss, taclaser, ionpulser…) and beams. |
| `numFrames` / `frameRate` | 6 | Simple frame animation of the *base* sprite while firing (chaingun, multineedler, shredder, ionpulser dir, blinkers). `turretSprite`/`hardpointSprite` name the `…00.png` first frame; engine appends `01…` zero-padded in the same folder, advancing at `frameRate` fps while firing (see wiki "Simple weapon animation"). Multineedler: 4 frames @30fps; chaingun: 4@20; ionpulser: 9@20; blinkers: 2@1. |
| `alwaysAnimate` | 3 | `"true"` keeps cycling `numFrames` even when not firing (decorative blinkers comment it in/out; vanilla uses `"false"`). String-valued boolean in file. |

### 3b. Geometry: where things come out (render)

| Field | N | Effect |
|---|---|---|
| `turretOffsets` / `hardpointOffsets` | 168/166 | Muzzle positions in px, flat `[fwd,lat,…]` pairs (§1.4). Also the projectile spawn point, beam origin, and muzzle-flash/smoke emitter. Length/2 barrels. Use the turret *or* hardpoint array matching the slot mount. |
| `turretAngleOffsets` / `hardpointAngleOffsets` | 168/166 | Per-barrel angular bias in degrees, `0` = straight forward. One entry per barrel; added to weapon facing for spawn direction, beam direction, and flash orientation. Squall: five `0`s. |

### 3c. Firing look: recoil, flash, smoke, glow (render)

| Field | N | Effect |
|---|---|---|
| `visualRecoil` | 29 | Peak rearward travel of the gun layer in px (hephag 10, mjolnir 10, vulcan 3, arbalest 6, lightac 7, multineedler 2). `0`/absent = gun sprites unused, no recoil motion. |
| `barrelMode` | 122 | `ALTERNATING` (117), `LINKED` (3), `ALTERNATING_BURST` (2). Firing *sequence* only, but it selects *which* muzzle flashes / which missile tube empties / which barrel recoils per shot — required to render multi-barrel fire correctly. |
| `animationType` | 136 | Built-in firing animation: `SMOKE` (49, missiles/minelayers), `MUZZLE_FLASH` (28), `GLOW_AND_FLASH` (29, gauss/ionpulser/miningblaster…), `GLOW` (21, shockrepeater…), `NONE` (9). Selects whether the glow sprite pulses and whether `muzzleFlashSpec`/`smokeSpec` particles emit. |
| `muzzleFlashSpec` (+`length`,`spread`,`particleSizeMin`,`particleSizeRange`,`particleDuration`,`particleCount`,`particleColor`) | 52 | Particle jet emitted at the firing muzzle along facing on each shot. `length`/`spread` = jet shape in px/degrees; size/duration/count/color self-explanatory. Rendered only for `MUZZLE_FLASH`/`GLOW_AND_FLASH`. |
| `smokeSpec` (+`particleSizeMin/Range`,`cloudParticleCount`,`cloudDuration`,`cloudRadius`,`blowbackParticleCount`,`blowbackDuration`,`blowbackLength`,`blowbackSpread`,`particleColor`) | 50 | Launch smoke: lingering cloud (`cloud*`) + directional blowback (`blowback*`) at the muzzle. Rendered for `SMOKE`. |
| `glowColor` `[r,g,b,a]` | 96 | Tint + alpha of the glow-sprite overlay (and beam hit-glow when `useGlowColorForHitGlow`). E.g. taclaser `[155,255,155,255]`, gauss `[100,100,255,255]`. |
| `separateRecoilForLinkedBarrels` | 1 | `LINKED` barrels recoil independently instead of as one layer. |
| `specialWeaponGlowWidth` / `specialWeaponGlowHeight` | 6 | Extra glow quad size (px) for a few small ballistics (lightac family: 12x30). Rendered as an additive glow at the muzzle/mount on fire. |

### 3d. Beam look (beam `specClass` only — render)

| Field | N | Effect |
|---|---|---|
| `width` | 39 | Full beam width in px (taclaser 13, phasebeam 20, tachyon 25, HIL 30). The quad runs from the firing offset to the impact/pierce endpoint. |
| `fringeColor` / `coreColor` `[r,g,b,a]` | 49/47 | Beam gradient colors. Without `darkCore`, fringe tints the whole beam; with `darkCore:true`, core and fringe stay separate (core drawn with `coreColor`, halo with `fringeColor`). |
| `darkCore` | 7 | Boolean split of core vs fringe coloring (see above). |
| `coreWidthMult` | 3 | Core fraction of total `width` (default ~ engine default when absent). |
| `textureType` | 51 | Beam surface texture: presets `ROUGH` (27), `LASER` (8), `SMOOTH` (7), `CHUNKY` (1), or a custom `["fringeTex","coreTex"]` pair (8 vanilla users, e.g. emp_arcs, beam_chunky). Controls the streaky look tiled along the beam. |
| `textureScrollSpeed` | 37 | Texture scroll in px/s along the beam (taclaser 72, HIL/tachyon 292). Sign flips direction (`fringeScrollSpeedMult` can be negative, commented out in HIL). |
| `fringeScrollSpeedMult` | 2 | Multiplier on fringe-layer scroll relative to core. |
| `pixelsPerTexel` | 36 | Tiling scale: game px per texture texel (vanilla almost always 5.0). Bigger = more stretched texture. |
| `randomizeTextureOffset` | 1 | Randomize texture phase per shot (avoids uniform look). |
| `hitGlowRadius` / `hitGlowBrightenDuration` | 10/11 | Impact glow sprite size (px) and brighten time on hit. |
| `useGlowColorForHitGlow` | 1 | Tint impact glow with `glowColor`. |
| `convergeOnPoint` | 1 | Multiple beams from one weapon converge visually/mechanically on the aim point. |
| `pierceSet` | 33 | Which collision classes the beam passes through vs stops on (`PROJECTILE_FF/NO_FF/FIGHTER`, `MISSILE_FF/NO_FF`, `FIGHTER`, `ASTEROID`). Pure combat logic, but it *decides the rendered beam endpoint and where impact glows appear*, so a renderer must implement it to get beam length right. |
| `collisionClass` / `collisionClassByFighter` | 19/18 | Same endpoint/impact-glow consequence as `pierceSet` (e.g. `RAY` for irautolance). |
| `beamEffect` | 9 | Java plugin id (e.g. `TachyonLanceEffect`). Logic/FX hook; may add arcs/particles — treat named vanilla effects as extra transient FX, not mount geometry. |
| `beamFireOnlyOnFullCharge` | 3 | Beam visual appears only at full charge (HIL). Affects *when* the beam quad renders. |
| `skipIdleFrameIfZeroBurstDelay` | 1 | Skip one idle animation frame for zero-delay burst beams (irautolance) — 1-frame timing nuance. |

### 3e. Layering / visibility switches (render)

| Field | N | Effect |
|---|---|---|
| `renderHints` | 87 | `RENDER_BARREL_BELOW` (29: gun layer under base), `RENDER_LOADED_MISSILES` (52: draw ready ammo on launcher), `RENDER_ADDITIVE` (4: decorative blinkers/lights drawn additive), `RENDER_IN_CAMPAIGN`/`NEVER_RENDER_IN_CAMPAIGN` (1: campaign-map visibility). Wiki also lists `RENDER_LOADED_MISSILES_UNLESS_HIDDEN` and `SUSPEND_RECOIL`; absent in vanilla here but handle them if present in mods. |
| `renderBelowAllWeapons` | 10 | Whole mount draws beneath every other weapon (decorative lights, dishes). |
| `showDamageWhenDecorative` | 10 | Whether a `DECORATIVE` weapon shows a damage readout — tooltip only, no combat pixels. Listed to avoid confusion. |
| `everyFrameEffect` | 23 | Per-frame script (e.g. `LightsEffect`, `BlinkerEffect`, `SensorDishRotationEffect`). For blinkers/dishes this *is* the animation driver (rotates dish, blinks light) — render-relevant via code, not via static fields. |
| `displayArcRadius` | 36 | **Refit-screen only**: radius of the firing-arc preview circle. No combat render effect. |
| `size` (`SMALL/MEDIUM/LARGE`) | 156 | Slot-fit + cover-sprite selection + icon scale. Does not rescale the combat sprite itself. |
| `type` (`BALLISTIC/ENERGY/MISSILE/DECORATIVE`) | 157 | Slot-fit, autofit grouping, and default render path (notably `DECORATIVE` + `renderBelowAllWeapons` for lights/dishes/blinkers). |

### 3f. Logic-only fields (no pixels; ignore for sprite rendering)

`id`, `specClass` (`beam` vs `projectile` — well, this *does* pick the beam
vs gun render path, so honor it as a switch), `projectileSpecId`,
`fireSoundOne`/`fireSoundTwo` (+`stopPreviousFireSound`,
`playFullFireSoundOne`, `fadePreviousFireSound`), `interruptibleBurst`,
`autocharge`, `requiresFullCharge`, `mountTypeOverride` (e.g. miningblaster
`HYBRID` — fit logic), `restrictToSpecifiedMountType`,
`noImpactSounds`/`noShieldImpactSounds`/`noNonShieldImpactSounds`,
`unaffectedByProjectileSpeedBonuses`, `hitGlowBrightenDuration` timing
beyond the glow itself. Balance numbers (damage, range, OP cost…) live in
`weapon_data.csv`-equivalents, not in `.wpn`, and never touch the sprite.

---

## 4. Worked examples (this install)

- **Hephag (`hephag.wpn`)**: base + gun + `RENDER_BARREL_BELOW`,
  `visualRecoil 10`, 2 barrels `[25,∓3]` turret / `[40,∓3]` hardpoint,
  `MUZZLE_FLASH` jet (len 54, 32 particles). Render: base static, gun layer
  *under* base sliding ≤10 px rearward alternating per barrel, flash jet at
  the firing muzzle. Hardpoint muzzle sits 6 px past the sprite canvas —
  do not clamp emitters to the canvas.
- **Taclaser (`taclaser.wpn`)**: base + glow sprites, single offset
  `[10,0]`/`[15,0]`, beam `width 13`, `ROUGH`, scroll 72, ppt 5,
  green fringe/white core. Render: glow overlay pulsing with fire cycle,
  beam quad from muzzle with scrolling rough texture, endpoint from
  `pierceSet`.
- **Tachyon lance**: offsets `[-3,0]`/`[5,0]` — beam starts at/behind pivot;
  render origin inside the sprite, not at its edge.
- **Hurricane / squall / terminator**: `RENDER_LOADED_MISSILES` + `SMOKE`.
  Render N mini-missile sprites on the rack (one per live tube), remove as
  ammo depletes; smoke cloud + blowback per launch.
- **Mjolnir / squall / arbalest**: add the `*UnderSprite` layer behind base.
- **Chaingun / multineedler / ionpulser / shredder / blinkers**:
  `numFrames`+`frameRate` animation (`…00.png` → `…01.png` … in the same
  folder); blinkers additionally `RENDER_ADDITIVE` + `BlinkerEffect`.
- **Sensor dish / hound & buffalo lights**: `DECORATIVE` + beam spec with
  1-px width + `renderBelowAllWeapons` (+ rotation/blink script). Never a
  combat muzzle; draw under everything.

---

## 5. Checklist for a perfect renderer

1. Parse the loose JSON (allow `#`/`//` comments, unquoted enums like
   `ROUGH`, `[RENDER_X]` hint arrays — vanilla files are not strict JSON).
2. Pick sprite set by slot mount (turret vs hardpoint); pivot = image center;
   sprites point up; 1 px = 1 unit.
3. Compose layers §2 in order, honoring `RENDER_BARREL_BELOW`,
   `renderBelowAllWeapons`, `RENDER_ADDITIVE`, `glowColor`.
4. Place muzzles from the matching offsets + angle offsets (allow negative
   forward and off-canvas points).
5. Animate: recoil slide (≤`visualRecoil`, alternating/linked per
   `barrelMode`), `numFrames` cycling, glow pulse, flash/smoke particles,
   missile-tube depletion, beam quad with scroll (`textureScrollSpeed`,
   `pixelsPerTexel`), impact glows at pierce-determined endpoints.
6. Ignore §3f for pixels. Use `displayArcRadius` only for a refit-screen arc
   preview, and `covers/` art only for empty slots (never from `.wpn`).
