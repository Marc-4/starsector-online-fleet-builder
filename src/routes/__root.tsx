import { createRootRoute, HeadContent, Link, Scripts } from '@tanstack/react-router'

import appCss from '../styles.css?url'

const SITE_URL = "https://marc-4.github.io/starsector-online-fleet-builder"
const SITE_NAME = "Starsector Fleet Builder"
const SITE_DESCRIPTION =
  "Free online Starsector fleet builder and ship builder. Plan loadouts, weapons, vents, capacitors and hullmods in your browser and share your fleet via URL."
const OG_IMAGE = `${SITE_URL}/og-image.png`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "Starsector Fleet Builder & Ship Builder – Free Online Refit Tool"
      },
      {
        name: "description",
        content: SITE_DESCRIPTION
      },
      {
        name: "keywords",
        content:
          "starsector fleet builder, starsector ship builder, starsector loadout planner, starsector refit screen online, starsector variant editor, starsector build planner"
      },
      { name: "author", content: "Marc-4" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#09090b" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      {
        property: "og:title",
        content: "Starsector Fleet Builder & Ship Builder – Free Online Refit Tool"
      },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Starsector Fleet Builder & Ship Builder – Free Online Refit Tool"
      },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "canonical",
        href: `${SITE_URL}/`
      },
      {
        rel: "icon",
        type: "image/webp",
        href: `${import.meta.env.BASE_URL}favicon.webp`
      },
      {
        rel: "manifest",
        href: `${import.meta.env.BASE_URL}manifest.webmanifest`
      }
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: SITE_NAME,
          alternateName: "Starsector Ship Builder",
          url: `${SITE_URL}/`,
          description: SITE_DESCRIPTION,
          applicationCategory: "GameApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          author: { "@type": "Person", name: "Marc-4" }
        })
      }
    ]
  }),
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
  errorComponent: RootError,
})

function RootNotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-cyan-200">Page not found</h1>
        <p className="mt-4 text-gray-300">
          This page does not exist. Your fleet link may be malformed.
        </p>
        <p className="mt-6">
          <Link to="/" className="text-cyan-300 underline">
            Back to the fleet builder
          </Link>
        </p>
      </main>
    </div>
  )
}

function RootError({ error }: { error: unknown }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-300">Something went wrong</h1>
        <p className="mt-4 text-gray-300">
          {error instanceof Error ? error.message : "Failed to load this page."}
        </p>
        <p className="mt-6">
          <Link to="/" className="text-cyan-300 underline">
            Back to the fleet builder
          </Link>
        </p>
      </main>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
