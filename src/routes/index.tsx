import { createFileRoute } from "@tanstack/react-router"
import Screen from "#/components/screen"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <Screen>
      <div className="absolute bottom-0 text-xs right-1 ">{"made with ❤️ from 🇵🇭"}</div>
    </Screen>
  )
}
