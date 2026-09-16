# Starsector Online Fleet Builder
React SPA for creating starsector fleets: assign weapons, hullmods, fighters, and officers.

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
- view hullmod details 
- add hullmods to ships

## In Progress (in order of importance)

- build in hullmods
- assign officers to ships
- customize officer skills 
- autofit variants

## Roadmap

- customize weapon groups
- modded ships support

## Development setup
- run these in order
  - `npm install`
  - `npm run generate:manifests`
  - `npm run generate:dicts`
  - `npm run dev`
- visit `localhost:3000` in browser

## Component architecture

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
                 └─ URL hash param ── fleetCodec
```

## Data propagatation

1. **User acts** in a component (e.g. mounts a weapon, adds vents/caps, picks a hullmod).
2. **Guard first**: the component checks a `wouldExceed*` guard /
   `disabled` flag from `useLoadoutOp`, so illegal states dont dispatch.
3. **Callback up**: the component calls its `onXChange` prop (`onWeaponsChange`,
   `onFightersChange`, `onHullmodsChange`, caps/vents handlers), owned by
   `Screen`.
4. **Setters** patch the entry in both `fleet` and
   `activeTile`, then `syncHash(next)` re-encodes the fleet into url param
   `#fleet=…` via `encodeFleetToHash`.
5. **Re-render down**: new `activeTile` → `useLoadoutOp` recomputes spent OP,
   modded stats, guards → `StatCluster`, roster, bays, sidebar tile all
   reflect the new state.

## Data parsers

- `lib/shipParser` / `weaponParser` / `projectileParser` — raw
  `.ship` / `.skin` / `.wpn` / `.proj` files (+ generated manifests).
- `lib/csvParser` — `ship_data` / `weapon_data` / `wing_data` /
  `hull_mods` stats, selectability, OP costs, mount compatibility context,
  hullmod installability (`isHullModSelectable`,
  `getHullModInapplicability`).

### Game Data
_Files_

- data/hullmods/hull_mods.csv - src/hullModData
- data/hulls - src/shipData
- data/weapons - src/weaponData

_Images_ 

- grahpics/hullmods - public/hullmods (converted to .webp)
- graphics/missiles - public/missiles (converted to .webp)
- graphics/ships - public/ships (converted to .webp)
- grapics/weapons - public/weapons (stays as pngs)
