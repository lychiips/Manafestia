"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import GameLayout, { GameButton, GameOverlay } from "@/components/game-layout"

export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start")
  const [isPaused, setIsPaused] = useState(false)
  const [winner, setWinner] = useState<1 | 2 | null>(null)
  const [translationsLoaded, setTranslationsLoaded] = useState(false)

  const gameRef = useRef<{
    player1: { y: number; score: number }
    player2: { y: number; score: number }
    ball: { x: number; y: number; speedX: number; speedY: number }
    keys: Record<string, boolean>
    paused: boolean
    gameOver: boolean
    animationId: number | null
  }>({
    player1: { y: 160, score: 0 },
    player2: { y: 160, score: 0 },
    ball: { x: 300, y: 200, speedX: 5, speedY: 3 },
    keys: {},
    paused: false,
    gameOver: false,
    animationId: null
  })

  const paddleWidth = 10
  const paddleHeight = 80
  const ballSize = 10
  const winScore = 5
  const canvasWidth = 600
  const canvasHeight = 400

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage") || "en"
    loadTranslations(savedLang)
  }, [])

  const loadTranslations = async (lang: string) => {
    try {
      const response = await fetch(`/locales/${lang}.json`)
      const data = await response.json()
      const flatTranslations: Record<string, string> = {}
      
      const flatten = (obj: Record<string, unknown>, prefix = "") => {
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key
          if (typeof obj[key] === "object" && obj[key] !== null) {
            flatten(obj[key] as Record<string, unknown>, fullKey)
          } else {
            flatTranslations[fullKey] = obj[key] as string
          }
        }
      }
      
      flatten(data)
      setTranslations(flatTranslations)
      setTranslationsLoaded(true)
    } catch (error) {
      console.error("Failed to load translations:", error)
      setTranslationsLoaded(true)
    }
  }

  const t = (key: string, fallback: string) => translations[key] || fallback

  const resetBall = useCallback(() => {
    const game = gameRef.current
    game.ball.x = canvasWidth / 2
    game.ball.y = canvasHeight / 2
    game.ball.speedX = -game.ball.speedX
    game.ball.speedY = (Math.random() - 0.5) * 6
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const game = gameRef.current

    // Clear canvas
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw center line
    ctx.strokeStyle = "#2a2a4e"
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Draw paddles
    ctx.fillStyle = "#e94560"
    ctx.beginPath()
    ctx.roundRect(20, game.player1.y, paddleWidth, paddleHeight, 5)
    ctx.fill()
    
    ctx.fillStyle = "#60a5fa"
    ctx.beginPath()
    ctx.roundRect(canvas.width - paddleWidth - 20, game.player2.y, paddleWidth, paddleHeight, 5)
    ctx.fill()
    
    // Draw ball
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(
      game.ball.x + ballSize / 2,
      game.ball.y + ballSize / 2,
      ballSize / 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
    
    // Draw pause indicator
    if (game.paused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = "#fff"
      ctx.font = "48px Arial"
      ctx.textAlign = "center"
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2)
    }
  }, [])

  const endGame = useCallback((winnerNum: 1 | 2) => {
    const game = gameRef.current
    game.gameOver = true
    if (game.animationId) {
      cancelAnimationFrame(game.animationId)
      game.animationId = null
    }
    setWinner(winnerNum)
    setGameState("gameover")
  }, [])

  const update = useCallback(() => {
    const game = gameRef.current

    // Player 1 movement (W/S keys)
    if (game.keys["w"] && game.player1.y > 0) {
      game.player1.y -= 7
    }
    if (game.keys["s"] && game.player1.y < canvasHeight - paddleHeight) {
      game.player1.y += 7
    }
    
    // AI for Player 2
    const aiSpeed = 4
    const aiTarget = game.ball.y - paddleHeight / 2
    if (game.player2.y < aiTarget && game.player2.y < canvasHeight - paddleHeight) {
      game.player2.y += aiSpeed
    }
    if (game.player2.y > aiTarget && game.player2.y > 0) {
      game.player2.y -= aiSpeed
    }
    
    // Ball movement
    game.ball.x += game.ball.speedX
    game.ball.y += game.ball.speedY
    
    // Ball collision with top/bottom walls
    if (game.ball.y <= 0 || game.ball.y >= canvasHeight - ballSize) {
      game.ball.speedY = -game.ball.speedY
    }
    
    // Ball collision with player 1 paddle
    if (
      game.ball.x <= paddleWidth + 20 &&
      game.ball.x >= 20 &&
      game.ball.y >= game.player1.y &&
      game.ball.y <= game.player1.y + paddleHeight
    ) {
      game.ball.speedX = Math.abs(game.ball.speedX) * 1.05
      const hitPos = (game.ball.y - game.player1.y) / paddleHeight
      game.ball.speedY = (hitPos - 0.5) * 10
    }
    
    // Ball collision with player 2 paddle
    if (
      game.ball.x >= canvasWidth - paddleWidth - 20 - ballSize &&
      game.ball.x <= canvasWidth - 20 &&
      game.ball.y >= game.player2.y &&
      game.ball.y <= game.player2.y + paddleHeight
    ) {
      game.ball.speedX = -Math.abs(game.ball.speedX) * 1.05
      const hitPos = (game.ball.y - game.player2.y) / paddleHeight
      game.ball.speedY = (hitPos - 0.5) * 10
    }
    
    // Limit ball speed
    const maxSpeed = 15
    game.ball.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, game.ball.speedX))
    game.ball.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, game.ball.speedY))
    
    // Score points
    if (game.ball.x <= 0) {
      game.player2.score++
      setPlayer2Score(game.player2.score)
      if (game.player2.score >= winScore) {
        endGame(2)
        return
      } else {
        resetBall()
      }
    }
    
    if (game.ball.x >= canvasWidth) {
      game.player1.score++
      setPlayer1Score(game.player1.score)
      if (game.player1.score >= winScore) {
        endGame(1)
        return
      } else {
        resetBall()
      }
    }
  }, [endGame, resetBall])

  const gameLoop = useCallback(() => {
    const game = gameRef.current
    if (game.gameOver) return
    
    if (!game.paused) {
      update()
    }
    draw()
    
    game.animationId = requestAnimationFrame(gameLoop)
  }, [draw, update])

  const startGame = useCallback(() => {
    const game = gameRef.current
    
    if (game.animationId) {
      cancelAnimationFrame(game.animationId)
    }
    
    game.player1 = { y: canvasHeight / 2 - paddleHeight / 2, score: 0 }
    game.player2 = { y: canvasHeight / 2 - paddleHeight / 2, score: 0 }
    game.ball = { x: canvasWidth / 2, y: canvasHeight / 2, speedX: 5, speedY: 3 }
    game.paused = false
    game.gameOver = false
    
    setPlayer1Score(0)
    setPlayer2Score(0)
    setIsPaused(false)
    setGameState("playing")
    
    game.animationId = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  const togglePause = useCallback(() => {
    const game = gameRef.current
    game.paused = !game.paused
    setIsPaused(game.paused)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current
      game.keys[e.key.toLowerCase()] = true
      
      if (e.key === " " && gameState === "playing" && !game.gameOver) {
        togglePause()
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const game = gameRef.current
      game.keys[e.key.toLowerCase()] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gameState, togglePause])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    return () => {
      const game = gameRef.current
      if (game.animationId) {
        cancelAnimationFrame(game.animationId)
      }
    }
  }, [])

  if (!translationsLoaded) {
    return (
      <GameLayout
        title="..."
        description="Loading..."
        accentColor="blue"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-[#a0a0a0]">Loading...</p>
        </div>
      </GameLayout>
    )
  }

  return (
    <GameLayout
      title={t("pong.title", "Pong Game")}
      description={t("pong.instructions", "Use W/S keys to move your paddle")}
      accentColor="blue"
      backLinkText={t("pong.backToMenu", "← Back to Menu")}
      header={
        <div className="flex gap-12 items-center">
          <div className="text-center">
            <div className="text-sm text-[#e94560] mb-1">{t("pong.player1", "Player 1")}</div>
            <div className="text-4xl font-bold text-[#e94560]">{player1Score}</div>
          </div>
          <div className="text-xl text-[#666]">VS</div>
          <div className="text-center">
            <div className="text-sm text-[#60a5fa] mb-1">{t("pong.player2", "Player 2 (AI)")}</div>
            <div className="text-4xl font-bold text-[#60a5fa]">{player2Score}</div>
          </div>
        </div>
      }
      footer={
        gameState === "playing" ? (
          <GameButton onClick={togglePause} accentColor="blue" className="text-sm px-6 py-2">
            {isPaused ? t("pong.resume", "Resume") : t("pong.pause", "Pause")}
          </GameButton>
        ) : null
      }
    >
      <div className="relative">
        <canvas 
          ref={canvasRef}
          width={600}
          height={400}
          className="block rounded-[10px]"
        />
        
        <GameOverlay visible={gameState === "start"}>
          <h2 className="text-3xl text-[#60a5fa]">{t("pong.title", "Pong Game")}</h2>
          <p className="text-white">{t("pong.instructions", "Use W/S keys to move your paddle")}</p>
          <GameButton onClick={startGame} accentColor="blue">
            {t("pong.startGame", "Start Game")}
          </GameButton>
        </GameOverlay>
        
        <GameOverlay visible={gameState === "gameover"}>
          <h2 className="text-3xl text-[#60a5fa]">{t("pong.gameOver", "Game Over!")}</h2>
          <p className="text-xl">
            {t("pong.winner", "Winner")}: <span className="text-[#4ade80] font-bold">
              {winner === 1 ? t("pong.player1", "Player 1") : t("pong.player2", "Player 2 (AI)")}
            </span>
          </p>
          <GameButton onClick={startGame} accentColor="blue">
            {t("pong.playAgain", "Play Again")}
          </GameButton>
          <Link 
            href="/main"
            className="px-8 py-3 text-base bg-transparent border-2 border-[#60a5fa] text-white rounded-full cursor-pointer uppercase tracking-wider font-bold transition-all duration-300 no-underline hover:bg-[#60a5fa]"
          >
            {t("pong.backToMenu", "Back to Menu")}
          </Link>
        </GameOverlay>
      </div>
    </GameLayout>
  )
}
