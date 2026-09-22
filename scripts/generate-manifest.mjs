#!/usr/bin/env node
// Collects game data filenames into public/data/*-manifest.json.
// Served as static files and fetched at runtime (TanStack Start dev does
// not serve /src/* module URLs, so data must live outside the module graph).
import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, "../public/data")
const shipsDir = path.join(dataDir, "ships")
const skinsDir = path.join(dataDir, "skins")
const weaponsDir = path.join(dataDir, "weapons")
const projDir = path.join(dataDir, "proj")

async function collect(dir, ext) {
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(ext))
    .map((e) => path.basename(e.name, ext))
}

// ships + skins
const ships = await collect(shipsDir, ".ship")
const skins = await collect(skinsDir, ".skin").catch(() => [])

const allShips = [...ships, ...skins].sort((a, b) => a.localeCompare(b))

await writeFile(path.join(dataDir, "ship-manifest.json"), JSON.stringify(allShips, null, 2) + "\n", "utf8")
console.log(`Wrote ${allShips.length} entries (${ships.length} ships + ${skins.length} skins) to public/data/ship-manifest.json`)

// skins only (shipParser needs the skin subset for getAllShipSkins)
const sortedSkins = [...skins].sort((a, b) => a.localeCompare(b))
await writeFile(path.join(dataDir, "skin-manifest.json"), JSON.stringify(sortedSkins, null, 2) + "\n", "utf8")
console.log(`Wrote ${sortedSkins.length} skins to public/data/skin-manifest.json`)

// weapons
const weapons = await collect(weaponsDir, ".wpn").catch(() => [])
const sortedWeapons = weapons.sort((a, b) => a.localeCompare(b))
await writeFile(path.join(dataDir, "weapon-manifest.json"), JSON.stringify(sortedWeapons, null, 2) + "\n", "utf8")
console.log(`Wrote ${sortedWeapons.length} weapons to public/data/weapon-manifest.json`)

// projectiles (stems; parsed id may differ, see projectileParser index scan)
const projs = await collect(projDir, ".proj").catch(() => [])
const sortedProjs = projs.sort((a, b) => a.localeCompare(b))
await writeFile(path.join(dataDir, "proj-manifest.json"), JSON.stringify(sortedProjs, null, 2) + "\n", "utf8")
console.log(`Wrote ${sortedProjs.length} projectiles to public/data/proj-manifest.json`)
