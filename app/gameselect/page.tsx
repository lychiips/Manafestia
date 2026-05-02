"use client"

import { useState } from "react"
import Link from "next/link"
import GameLayout, { GameButton } from "@/components/game-layout"
import { SettingsPopup } from "@/components/settings-popup"

export default function GameSelectPage() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <GameLayout
      title="Game Select"
      description="Choose a game to play!"
      backLinkText="← Back to Main"
      backLinkHref="/main"
    >
      <div className="flex flex-col gap-4 items-center">
        <Link href="/pong">
          <GameButton accentColor="blue">
            Play Pong
          </GameButton>
        </Link>

        <Link href="/snake">
          <GameButton accentColor="green">
            Play Snake
          </GameButton>
        </Link>

        <GameButton
          accentColor="purple"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </GameButton>

        <Link href="/main">
          <GameButton accentColor="orange" variant="outline">
            Back to Main
          </GameButton>
        </Link>
      </div>

      <SettingsPopup
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </GameLayout>
  )
}