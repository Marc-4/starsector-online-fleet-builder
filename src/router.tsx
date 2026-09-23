import { createRouter as createTanStackRouter, Link } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

function DefaultNotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-cyan-200">Page not found</h1>
        <p className="mt-6">
          <Link to="/" className="text-cyan-300 underline">
            Back to the fleet builder
          </Link>
        </p>
      </main>
    </div>
  )
}

function DefaultError({ error }: { error: unknown }) {
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

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: DefaultNotFound,
    defaultErrorComponent: DefaultError,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
