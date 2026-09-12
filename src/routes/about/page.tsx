import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/about/page")({
  component: About,
  head: () => ({
    meta: [
      { title: "About – Starsector Fleet Builder & Ship Builder" },
      {
        name: "description",
        content:
          "About this free online Starsector fleet builder and ship builder: plan refits, weapons, vents, capacitors and hullmods in your browser and share fleets via URL."
      }
    ]
  })
})

const FAQS = [
  {
    q: "What is this Starsector fleet builder?",
    a: "A free, browser-based recreation of the Starsector refit screen. Add ships to a fleet, fit weapons to slots, allocate vents and capacitors, and (soon) add fighters, hullmods and officers — then share the whole fleet with a single URL."
  },
  {
    q: "Do I need to install anything or own mods?",
    a: "No. It runs entirely in your browser using unmodified vanilla game data parsed from the game files. Nothing is uploaded; your fleet lives in the shareable URL."
  },
  {
    q: "How do I share my fleet?",
    a: "Build your fleet in the app and copy the page URL — the fleet is encoded in it. Anyone opening that link sees the same ships and loadouts."
  },
  {
    q: "Is this affiliated with Fractal Softworks?",
    a: "No. Starsector is made by Fractal Softworks. This is an unofficial fan-made planning tool."
  }
]

function About() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
    <main className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
      <h1>About the Starsector Fleet Builder</h1>
      <p>
        This is an <strong>online Starsector fleet builder and ship builder</strong> — a recreation of
        the in-game refit screen. Plan ship loadouts, compare weapons, allocate
        vents and capacitors, and share theory-crafted fleets via the URL.
      </p>
      <h2>What you can do</h2>
      <ul>
        <li>Add ships to a fleet from vanilla game data</li>
        <li>Fit weapons into ship slots and inspect weapon details</li>
        <li>Allocate vents and capacitors</li>
        <li>Share your whole fleet with a single URL</li>
      </ul>
      <h2>On the roadmap</h2>
      <ul>
        <li>Fighters, hullmods, officers and weapon groups</li>
        <li>Autofit variants and modded ship support</li>
      </ul>
      <h2>Frequently asked questions</h2>
      {FAQS.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </main>
    </div>
  )
}
