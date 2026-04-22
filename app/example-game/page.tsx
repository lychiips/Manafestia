"use client"

import { useState, useCallback } from "react"
import GameLayout, {
  GameButton,
  ScoreDisplay,
  GameOverlay,
} from "@/components/game-layout"

/**
 * Example Game - Click Counter
 * 
 * This is a simple example game demonstrating how to use the GameLayout component.
 * It shows how to:
 * - Use the layout with title and description
 * - Add header content (scores)
 * - Use the GameOverlay for start/game over screens
 * - Use GameButton for styled buttons
 * - Handle game state
 */

type GameState = "start" | "playing" | "gameover"

export default function ExampleGamePage() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [highScore, setHighScore] = useState(0)
  const [timerRef, setTimerRef] = useState<NodeJS.Timeout | null>(null)

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(10)
    setGameState("playing")

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameState("gameover")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setTimerRef(timer)
  }, [])

  const handleClick = useCallback(() => {
    if (gameState !== "playing") return
    setScore((prev) => {
      const newScore = prev + 1
      if (newScore > highScore) {
        setHighScore(newScore)
      }
      return newScore
    })
  }, [gameState, highScore])

  const resetGame = useCallback(() => {
    if (timerRef) {
      clearInterval(timerRef)
    }
    setGameState("start")
    setScore(0)
    setTimeLeft(10)
  }, [timerRef])

  return (
    <GameLayout
      title="Click Counter"
      description="Click as many times as you can in 10 seconds! A simple example game using the GameLayout component."
      accentColor="orange"
      header={
        <div className="flex gap-8">
          <ScoreDisplay label="Score" score={score} color="#fb923c" />
          <ScoreDisplay label="Time" score={`${timeLeft}s`} color="#60a5fa" />
          <ScoreDisplay label="High Score" score={highScore} color="#4ade80" />
        </div>
      }
      containerWidth="400px"
    >
      {/* Game Area */}
      <div className="relative w-[368px] h-[300px] flex items-center justify-center">
        {gameState === "playing" && (
          <button
            onClick={handleClick}
            className="w-48 h-48 rounded-full text-6xl font-bold text-white transition-all duration-100 active:scale-95 hover:scale-105 cursor-pointer border-none"
            style={{
              background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
              boxShadow: "0 8px 32px rgba(251, 146, 60, 0.4)",
            }}
          >
            {score}
          </button>
        )}

        {/* Start Screen Overlay */}
        <GameOverlay visible={gameState === "start"}>
          <h2 className="text-3xl text-[#fb923c]">Click Counter</h2>
          <p className="text-white text-center max-w-xs">
            Click the button as fast as you can!
          </p>
          <GameButton onClick={startGame} accentColor="orange">
            Start Game
          </GameButton>
        </GameOverlay>

        {/* Game Over Overlay */}
        <GameOverlay visible={gameState === "gameover"}>
          <h2 className="text-3xl text-[#f87171]">{"Time's Up!"}</h2>
          <p className="text-xl text-white">
            Final Score: <span className="text-[#fb923c] font-bold">{score}</span>
          </p>
          {score === highScore && score > 0 && (
            <p className="text-[#4ade80] text-sm">New High Score!</p>
          )}
          <div className="flex gap-4">
            <GameButton onClick={startGame} accentColor="orange">
              Play Again
            </GameButton>
            <GameButton
              onClick={resetGame}
              variant="outline"
              accentColor="orange"
            >
              Reset
            </GameButton>
          </div>
        </GameOverlay>
      </div>
    </GameLayout>
  )
}
