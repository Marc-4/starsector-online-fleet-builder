#!/usr/bin/env node
// Runs the TS bench inside vite SSR so path aliases (?raw, #/) resolve.
// Usage: npm run bench:hash
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const { createServer } = await import("vite")

const server = await createServer({
  root,
  configFile: false,
  resolve: { alias: { "#": path.join(root, "src") } },
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent"
})
try {
  const mod = await server.ssrLoadModule(path.join(root, "scripts/benchFleetHashImpl.ts"))
  await mod.run()
} finally {
  await server.close()
}
