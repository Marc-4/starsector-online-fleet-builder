import { createFileRoute } from "@tanstack/react-router"
import Screen from "#/components/screen"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <Screen>
    </Screen>
  )
}
