import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"

import { tanstackStart } from "@tanstack/react-start/plugin/vite"

import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import svgr from "vite-plugin-svgr"

const REPO_NAME = "starsector-online-fleet-builder"

const isGithubPages = process.env.GITHUB_PAGES === "true"
const base = isGithubPages ? `/${REPO_NAME}/` : "/"

const config = defineConfig({
  base: base,
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] }
    }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true
      }
    }),
    viteReact(),
    svgr()
  ]
})

export default config
