"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"

interface Position {
  x: number
  y: number
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start")
  const [finalScore, setFinalScore] = useState(0)
  const [translationsLoaded, setTranslationsLoaded] = useState(false)

  const gameRef = useRef<{
    snake: Position[]
    direction: Position
    nextDirection: Position
    food: Position
    score: number
    gameLoop: number | null
  }>({
    snake: [{ x: 10, y: 10 }],
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    food: { x: 15, y: 15 },
    score: 0,
    gameLoop: null
  })

  const gridSize = 20
  const tileCount = 20

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage") || "en"
    loadTranslations(savedLang)
    setHighScore(parseInt(localStorage.getItem("snakeHighScore") || "0"))
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
      // Fallback to English if loading fails
      setTranslationsLoaded(true)
    }
  }

  const t = (key: string, fallback: string) => translations[key] || fallback

  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
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

    // Draw grid
    ctx.strokeStyle = "#2a2a4e"
    for (let i = 0; i < tileCount; i++) {
      ctx.beginPath()
      ctx.moveTo(i * gridSize, 0)
      ctx.lineTo(i * gridSize, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * gridSize)
      ctx.lineTo(canvas.width, i * gridSize)
      ctx.stroke()
    }

    // Draw snake
    game.snake.forEach((segment, index) => {
      const gradient = ctx.createRadialGradient(
        segment.x * gridSize + gridSize / 2,
        segment.y * gridSize + gridSize / 2,
        0,
        segment.x * gridSize + gridSize / 2,
        segment.y * gridSize + gridSize / 2,
        gridSize / 2
      )
      
      if (index === 0) {
        gradient.addColorStop(0, "#4ade80")
        gradient.addColorStop(1, "#22c55e")
      } else {
        gradient.addColorStop(0, "#22c55e")
        gradient.addColorStop(1, "#16a34a")
      }
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2,
        4
      )
      ctx.fill()
    })

    // Draw food
    ctx.fillStyle = "#e94560"
    ctx.beginPath()
    ctx.arc(
      game.food.x * gridSize + gridSize / 2,
      game.food.y * gridSize + gridSize / 2,
      gridSize / 2 - 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }, [])

  const endGame = useCallback(() => {
    const game = gameRef.current
    if (game.gameLoop) {
      clearInterval(game.gameLoop)
      game.gameLoop = null
    }
    
    const currentHighScore = parseInt(localStorage.getItem("snakeHighScore") || "0")
    if (game.score > currentHighScore) {
      localStorage.setItem("snakeHighScore", game.score.toString())
      setHighScore(game.score)
    }
    
    setFinalScore(game.score)
    setGameState("gameover")
  }, [])

  const update = useCallback(() => {
    const game = gameRef.current

    game.direction = { ...game.nextDirection }
    
    const head = {
      x: game.snake[0].x + game.direction.x,
      y: game.snake[0].y + game.direction.y
    }

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      endGame()
      return
    }

    // Check self collision
    if (game.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      endGame()
      return
    }

    game.snake.unshift(head)

    // Check food collision
    if (head.x === game.food.x && head.y === game.food.y) {
      game.score += 10
      setScore(game.score)
      game.food = generateFood(game.snake)
    } else {
      game.snake.pop()
    }

    draw()
  }, [draw, endGame, generateFood])

  const startGame = useCallback(() => {
    const game = gameRef.current
    
    if (game.gameLoop) {
      clearInterval(game.gameLoop)
    }
    
    game.snake = [{ x: 10, y: 10 }]
    game.direction = { x: 1, y: 0 }
    game.nextDirection = { x: 1, y: 0 }
    game.food = generateFood([{ x: 10, y: 10 }])
    game.score = 0
    
    setScore(0)
    setGameState("playing")
    
    game.gameLoop = window.setInterval(update, 100)
  }, [generateFood, update])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return
      
      const game = gameRef.current
      
      switch(e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          if (game.direction.y !== 1) {
            game.nextDirection = { x: 0, y: -1 }
          }
          break
        case "arrowdown":
        case "s":
          if (game.direction.y !== -1) {
            game.nextDirection = { x: 0, y: 1 }
          }
          break
        case "arrowleft":
        case "a":
          if (game.direction.x !== 1) {
            game.nextDirection = { x: -1, y: 0 }
          }
          break
        case "arrowright":
        case "d":
          if (game.direction.x !== -1) {
            game.nextDirection = { x: 1, y: 0 }
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    return () => {
      const game = gameRef.current
      if (game.gameLoop) {
        clearInterval(game.gameLoop)
      }
    }
  }, [])

  if (!translationsLoaded) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center text-white p-4"
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-[#a0a0a0]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center text-white p-4"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}
    >
      <div className="text-center mb-4">
        <h1 
          className="text-3xl mb-2"
          style={{
            background: "linear-gradient(90deg, #4ade80, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          {t("snake.title", "Snake Game")}
        </h1>
        <p className="text-[#a0a0a0] text-sm">
          {t("snake.instructions", "Use arrow keys or WASD to move")}
        </p>
      </div>
      
      <div className="flex gap-8 mb-4">
        <div 
          className="px-6 py-3 rounded-[10px] text-center"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        >
          <div className="text-sm text-[#a0a0a0] mb-1">{t("snake.score", "Score")}</div>
          <div className="text-2xl font-bold text-[#4ade80]">{score}</div>
        </div>
        <div 
          className="px-6 py-3 rounded-[10px] text-center"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        >
          <div className="text-sm text-[#a0a0a0] mb-1">{t("snake.highScore", "High Score")}</div>
          <div className="text-2xl font-bold text-[#4ade80]">{highScore}</div>
        </div>
      </div>
      
      <div 
        className="relative p-4 rounded-[15px]"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}
      >
        <canvas 
          ref={canvasRef}
          width={400}
          height={400}
          className="block rounded-[10px]"
        />
        
        {gameState === "start" && (
          <div 
            className="absolute inset-0 flex flex-col justify-center items-center gap-4 rounded-[15px]"
            style={{ background: "rgba(0, 0, 0, 0.8)" }}
          >
            <h2 className="text-3xl text-[#4ade80]">{t("snake.title", "Snake Game")}</h2>
            <button 
              onClick={startGame}
              className="px-8 py-3 text-base bg-gradient-to-r from-[#4ade80] to-[#22c55e] border-none text-white rounded-full cursor-pointer uppercase tracking-wider font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(74,222,128,0.4)]"
            >
              {t("snake.startGame", "Start Game")}
            </button>
          </div>
        )}
        
        {gameState === "gameover" && (
          <div 
            className="absolute inset-0 flex flex-col justify-center items-center gap-4 rounded-[15px]"
            style={{ background: "rgba(0, 0, 0, 0.8)" }}
          >
            <h2 className="text-3xl text-[#e94560]">{t("snake.gameOver", "Game Over!")}</h2>
            <p className="text-xl">{t("snake.score", "Score")}: {finalScore}</p>
            <button 
              onClick={startGame}
              className="px-8 py-3 text-base bg-gradient-to-r from-[#4ade80] to-[#22c55e] border-none text-white rounded-full cursor-pointer uppercase tracking-wider font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(74,222,128,0.4)]"
            >
              {t("snake.playAgain", "Play Again")}
            </button>
            <Link 
              href="/main"
              className="px-8 py-3 text-base bg-transparent border-2 border-[#4ade80] text-white rounded-full cursor-pointer uppercase tracking-wider font-bold transition-all duration-300 no-underline hover:bg-[#4ade80]"
            >
              {t("snake.backToMenu", "Back to Menu")}
            </Link>
          </div>
        )}
      </div>
      
      <Link 
        href="/main"
        className="mt-6 text-[#a0a0a0] no-underline transition-colors duration-300 hover:text-white"
      >
        {t("snake.backToMenu", "← Back to Menu")}
      </Link>
    </div>
  )
}
