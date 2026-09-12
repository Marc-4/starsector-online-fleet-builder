import { createFileRoute } from "@tanstack/react-router"
import Screen from "#/components/screen"

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      {
        title: "Starsector Fleet Builder & Ship Builder – Free Online Refit Tool"
      },
      {
        name: "description",
        content:
          "Free online Starsector fleet builder and ship builder. Plan loadouts, weapons, vents, capacitors and hullmods in your browser and share your fleet via URL."
      },
      { property: "og:url", content: "https://marc-4.github.io/starsector-online-fleet-builder/" }
    ]
  })
})

function Home() {
  return (
    <Screen>
      <div className="sr-only">
        <h1>Starsector Fleet Builder and Ship Builder</h1>
        <p>
          Online Starsector fleet builder and ship builder. Recreate the in-game refit screen in your
          browser: add ships to your fleet, fit weapons, allocate vents and capacitors, and share your
          whole fleet with a URL.
        </p>
      </div>
      <noscript>
        <div style={{ padding: 24, textAlign: "center" }}>
          <h1>Starsector Fleet Builder and Ship Builder</h1>
          <p>
            This online Starsector fleet builder needs JavaScript enabled. Once enabled you can plan
            ship loadouts, weapons, vents, capacitors and hullmods, then share your fleet via URL.
          </p>
          <p>
            Learn more on the <a href="/about">about page</a>.
          </p>
        </div>
      </noscript>
      <div className="absolute bottom-0 text-xs right-1 ">{"made with 🩵 from 🇵🇭"}</div>
    </Screen>
  )
}
