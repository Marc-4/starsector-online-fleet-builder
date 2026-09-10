import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import svgr from "vite-plugin-svgr"

const REPO_NAME = "starsector-online-fleet-builder"

export default defineConfig(({ command }) => {
  const isGithubPages =
    command === "build" && process.env.GITHUB_PAGES === "true"
  const base = isGithubPages ? `/${REPO_NAME}/` : "/"

  return {
    base,
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
  }
})
