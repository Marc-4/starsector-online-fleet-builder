import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"

import { tanstackStart } from "@tanstack/react-start/plugin/vite"

import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import svgr from "vite-plugin-svgr"

const REPO_NAME = "starsector-online-fleet-builder"

const config = defineConfig({
  base: `/${REPO_NAME}/`,
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      static: true,
      prerender: {
        crawlLinks: true,
        routes: ["/"]
      },
      rollupConfig: { external: [/^@sentry\//] }
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    svgr()
  ]
})

export default config
