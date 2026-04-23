"use client"

import { ReactNode } from "react"
import Link from "next/link"

interface GameLayoutProps {
  /** The title displayed at the top of the game page */
  title: string
  /** A short description or instructions for the game */
  description: string
  /** The main game content that will be centered on the page */
  children: ReactNode
  /** Optional accent color for the title gradient (defaults to blue) */
  accentColor?: "blue" | "green" | "red" | "purple" | "orange"
  /** Optional back link text (defaults to "Back to Menu") */
  backLinkText?: string
  /** Optional back link href (defaults to "/main") */
  backLinkHref?: string
  /** Optional custom width for the game container */
  containerWidth?: string
  /** Optional additional content below the game container (e.g., controls, scores) */
  footer?: ReactNode
  /** Optional header content between title and game container (e.g., scores) */
  header?: ReactNode
}

const accentColors = {
  blue: {
    gradient: "linear-gradient(90deg, #60a5fa, #3b82f6)",
    glow: "rgba(96, 165, 250, 0.4)",
  },
  green: {
    gradient: "linear-gradient(90deg, #4ade80, #22c55e)",
    glow: "rgba(74, 222, 128, 0.4)",
  },
  red: {
    gradient: "linear-gradient(90deg, #f87171, #ef4444)",
    glow: "rgba(248, 113, 113, 0.4)",
  },
  purple: {
    gradient: "linear-gradient(90deg, #c084fc, #a855f7)",
    glow: "rgba(192, 132, 252, 0.4)",
  },
  orange: {
    gradient: "linear-gradient(90deg, #fb923c, #f97316)",
    glow: "rgba(251, 146, 60, 0.4)",
  },
}

export default function GameLayout({
  title,
  description,
  children,
  accentColor = "blue",
  backLinkText = "← Back to Menu",
  backLinkHref = "/main",
  containerWidth = "auto",
  footer,
  header,
}: GameLayoutProps) {
  const colors = accentColors[accentColor]

  return (
    <div
      className="min-h-screen flex flex-col items-center text-white p-4"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundImage: "url('/images/manafestiagamebg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
        // background:
        //   "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      {/* Title and Description */}
      <div className="text-center mb-4">
        <h1
          className="text-3xl mb-2 font-bold"
          style={{
            background: colors.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h1>
        <p className="text-[#000000] text-sm max-w-md">{description}</p>
      </div>

      {/* Optional Header (e.g., scores) */}
      {header && <div className="mb-4">{header}</div>}

      {/* Game Container */}
      <div
        className="relative p-4 rounded-[15px]"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          width: containerWidth,
        }}
      >
        <div className="flex items-center justify-center">{children}</div>
      </div>

      {/* Optional Footer (e.g., controls) */}
      {footer && <div className="mt-4">{footer}</div>}

      {/* Back Link */}
      <Link
        href={backLinkHref}
        className="mt-6 text-[#000000] no-underline transition-colors duration-300 hover:text-white"
      >
        {backLinkText}
      </Link>
    </div>
  )
}

/**
 * A styled button component that matches the game layout theme
 */
interface GameButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "outline"
  accentColor?: "blue" | "green" | "red" | "purple" | "orange"
  className?: string
}

export function GameButton({
  children,
  onClick,
  variant = "primary",
  accentColor = "blue",
  className = "",
}: GameButtonProps) {
  const colors = accentColors[accentColor]

  if (variant === "outline") {
    return (
      <button
        onClick={onClick}
        className={`px-8 py-3 text-base bg-transparent border-2 text-white rounded-full cursor-pointer uppercase tracking-wider font-bold transition-all duration-300 hover:opacity-90 ${className}`}
        style={{
          borderColor: accentColor === "blue" ? "#60a5fa" : 
                       accentColor === "green" ? "#4ade80" : 
                       accentColor === "red" ? "#f87171" : 
                       accentColor === "purple" ? "#c084fc" : "#fb923c",
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 text-base border-none text-white rounded-full cursor-pointer uppercase tracking-wider font-bold transition-all duration-300 hover:-translate-y-0.5 ${className}`}
      style={{
        background: colors.gradient,
        boxShadow: `0 4px 15px ${colors.glow}`,
      }}
    >
      {children}
    </button>
  )
}

/**
 * A score display component for showing game scores
 */
interface ScoreDisplayProps {
  label: string
  score: number | string
  color?: string
}

export function ScoreDisplay({ label, score, color = "#4ade80" }: ScoreDisplayProps) {
  return (
    <div
      className="px-6 py-3 rounded-[10px] text-center"
      style={{ background: "rgba(255, 255, 255, 0.1)" }}
    >
      <div className="text-sm text-[#000000] mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>
        {score}
      </div>
    </div>
  )
}

/**
 * An overlay component for game states (start, pause, game over)
 */
interface GameOverlayProps {
  children: ReactNode
  visible: boolean
}

export function GameOverlay({ children, visible }: GameOverlayProps) {
  if (!visible) return null

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center items-center gap-4 rounded-[15px]"
      style={{ background: "rgba(0, 0, 0, 0.8)" }}
    >
      {children}
    </div>
  )
}
