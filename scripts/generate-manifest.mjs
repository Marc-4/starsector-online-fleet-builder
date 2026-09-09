#!/usr/bin/env node
import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const shipDataDir = path.resolve(__dirname, "../src/shipData")
const skinsDir = path.join(shipDataDir, "skins")
const shipOutFile = path.join(shipDataDir, "manifest.json")
const weaponDataDir = path.resolve(__dirname, "../src/weaponData")
const weaponOutFile = path.join(weaponDataDir, "manifest.json")

async function collect(dir, ext) {
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(ext))
    .map((e) => path.basename(e.name, ext))
}

// ships + skins
const ships = await collect(shipDataDir, ".ship")
const skins = await collect(skinsDir, ".skin").catch(() => [])

const allShips = [...ships, ...skins].sort((a, b) => a.localeCompare(b))

await writeFile(shipOutFile, JSON.stringify(allShips, null, 2) + "\n", "utf8")
console.log(`Wrote ${allShips.length} entries (${ships.length} ships + ${skins.length} skins) to ${path.relative(process.cwd(), shipOutFile)}`)

// weapons
const weapons = await collect(weaponDataDir, ".wpn").catch(() => [])
const sortedWeapons = weapons.sort((a, b) => a.localeCompare(b))
await writeFile(weaponOutFile, JSON.stringify(sortedWeapons, null, 2) + "\n", "utf8")
console.log(`Wrote ${sortedWeapons.length} weapons to ${path.relative(process.cwd(), weaponOutFile)}`)
