# Starsector Online Fleet Builder

## Done

- unmodified game data parsing
- add ships to fleet
- allocate vents & capacitors
- share whole fleet via url (partial)
- view ship details
- render weapon slots
- add weapons
- view weapon details
- add fighters
- view fighter details

## In Progress (in order of importance)

- add hullmods to ships
- view hullmod details
- assign officers to ships
- customize officer skills 
- customize weapon groups

## Roadmap

- autofit variants
- modded ships support

# development setup
- run these in order
  - `npm install`
  - `npm run generate:manifests`
  - `npm run generate:dicts`
  - `npm run dev`
- visit `localhost:3000` in browser

# data flow

State lives in `Screen` (`src/components/screen.tsx`). It owns the
`fleetEntry[]` fleet plus the `activeTile`, and every mutation flows back
through it and into the URL hash.

```
routes → Screen ─┬─ sidebar: SidebarShipTile[] + AddShipButton
                 │                │                    │
                 │                │                    └─ ShipSelectionModal ─┐
                 │                │                                           │
                 │                └─ onTileClick / removeOne                  ▼
                 │                                          decode → merge → hydrate → encode
                 ├─ ActiveShipPanel (activeTile + callbacks)
                 │     ├─ useLoadoutOp ── derived OP, modded stats, wouldExceed* guards
                 │     ├─ StatCluster ── caps/vents hold-to-repeat ─┐
                 │     ├─ ShipDisplay ── slots ── WeaponSelectionModal
                 │     ├─ FighterBay column ── FighterSelectionModal
                 │     ├─ HullmodRoster ── HullmodSelectionModal
                 │     ├─ ShipInfoCard / ShipName / ZoomControls / Strip btn
                 │     └─ hover tooltips (Weapon / Fighter / Hullmod)
                 └─ URL hash (#fleet=…) ── fleetCodec (v3 binary + v1/v2 readers)
```

## change propagatation

1. **User acts** in a leaf component (e.g. mounts a weapon in
   `WeaponSelectionModal`, holds `+` in `StatCluster`, picks a hullmod).
2. **Guard first**: the leaf or panel checks a `wouldExceed*` guard /
   `disabled` flag from `useLoadoutOp`, so illegal states never dispatch.
3. **Callback up**: the leaf calls its `onXChange` prop (`onWeaponsChange`,
   `onFightersChange`, `onHullmodsChange`, caps/vents handlers), owned by
   `Screen`.
4. **`Screen.updateEntry` / setters** patch the entry in both `fleet` and
   `activeTile`, then `syncHash(next)` re-encodes the fleet into
   `#fleet=…` via `encodeFleetToHash`.
5. **Re-render down**: new `activeTile` → `useLoadoutOp` recomputes spent OP,
   modded stats, guards → `StatCluster`, roster, bays, sidebar tile all
   reflect the new state. Caps/vents increments clamp inside the setter
   against weapons + fighters + hullmods OP, so holding `+` stops at the
   real ceiling.

## data parsers

- `lib/shipParser` / `weaponParser` / `projectileParser` — raw
  `.ship` / `.skin` / `.wpn` / `.proj` files (+ generated manifests).
- `lib/csvParser` — `ship_data` / `weapon_data` / `wing_data` /
  `hull_mods` stats, selectability, OP costs, mount compatibility context,
  hullmod installability (`isHullModSelectable`,
  `getHullModInapplicability`).
- `lib/weaponCompat` — mount fit rules including `mountTypeOverride`
  (Mining Blaster → HYBRID etc.).
- `lib/statModifier` + `lib/fluxLimits` — caps/vents bonuses, max
  caps/vents per hull size.
- `lib/fleetCodec` + `lib/fleetDicts` — share-link hash: v3 binary payload
  (dict-indexed hull/weapon/wing/hullmod ids with raw-string fallback) with
  v1/v2 decoders for old links. `hydrateFleet` rebuilds entries on load.
- `hullModData/` — per-hullmod registry: `apply` (flat stat mutation) +
  `describe` (`%s` hullmod description filling); `applyHullmods` chains them for the stat
  panel, `describeHullmod` feeds tooltips.
