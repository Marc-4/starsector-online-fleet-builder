#!/usr/bin/env node
import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const shipDataDir = path.resolve(__dirname, "../src/shipData")
const skinsDir = path.join(shipDataDir, "skins")
const outFile = path.join(shipDataDir, "manifest.json")

async function collect(dir, ext) {
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(ext))
    .map((e) => path.basename(e.name, ext))
}

const ships = await collect(shipDataDir, ".ship")
const skins = await collect(skinsDir, ".skin").catch(() => [])

const all = [...ships, ...skins].sort((a, b) => a.localeCompare(b))

await writeFile(outFile, JSON.stringify(all, null, 2) + "\n", "utf8")
console.log(`Wrote ${all.length} entries (${ships.length} ships + ${skins.length} skins) to ${path.relative(process.cwd(), outFile)}`)
