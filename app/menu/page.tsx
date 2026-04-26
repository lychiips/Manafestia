"use client"

import { useState, useCallback, useRef, useEffect } from "react"

type MenuItem = "music" | "language" | "start"

interface MenuButton {
  id: MenuItem
  src: string
  label: string
}

const menuButtons: MenuButton[] = [
  { id: "music", src: "/images/btn-music.png", label: "Music" },
  { id: "language", src: "/images/btn-language.png", label: "Language" },
  { id: "start", src: "/images/btn-start.png", label: "Start" },
]

// Alpha threshold — pixels with alpha below this are treated as transparent
const ALPHA_THRESHOLD = 10

/**
 * Samples the alpha value of an offscreen canvas at the cursor position,
 * accounting for object-contain letterboxing inside the container element.
 */
function sampleAlpha(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  clientX: number,
  clientY: number,
  naturalWidth: number,
  naturalHeight: number,
): number {
  const rect = container.getBoundingClientRect()

  // Compute the rendered image rect inside the container (object-contain)
  const containerAspect = rect.width / rect.height
  const imageAspect = naturalWidth / naturalHeight
  let imgW: number, imgH: number, imgX: number, imgY: number

  if (imageAspect > containerAspect) {
    imgW = rect.width
    imgH = rect.width / imageAspect
    imgX = rect.left
    imgY = rect.top + (rect.height - imgH) / 2
  } else {
    imgH = rect.height
    imgW = rect.height * imageAspect
    imgX = rect.left + (rect.width - imgW) / 2
    imgY = rect.top
  }

  // Map cursor → image pixel coords
  const px = Math.round(((clientX - imgX) / imgW) * naturalWidth)
  const py = Math.round(((clientY - imgY) / imgH) * naturalHeight)

  if (px < 0 || py < 0 || px >= naturalWidth || py >= naturalHeight) return 0

  const ctx = canvas.getContext("2d")
  if (!ctx) return 0
  // alpha is index 3 in the RGBA array
  return ctx.getImageData(px, py, 1, 1).data[3]
}

interface ButtonLayerProps {
  btn: MenuButton
  hovered: boolean
  onHoverChange: (id: MenuItem | null) => void
  onClick: (id: MenuItem) => void
}

function ButtonLayer({ btn, hovered, onHoverChange, onClick }: ButtonLayerProps) {
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const naturalSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const wasHoveredRef = useRef(false)

  // Load the PNG into an offscreen canvas once so we can sample pixels
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = btn.src
    img.onload = () => {
      naturalSize.current = { w: img.naturalWidth, h: img.naturalHeight }
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext("2d")?.drawImage(img, 0, 0)
      offscreenRef.current = canvas
    }
  }, [btn.src])

  const isOpaque = useCallback(
    (e: React.MouseEvent): boolean => {
      if (!offscreenRef.current || !containerRef.current) return false
      const { w, h } = naturalSize.current
      const alpha = sampleAlpha(
        offscreenRef.current,
        containerRef.current,
        e.clientX,
        e.clientY,
        w,
        h,
      )
      return alpha > ALPHA_THRESHOLD
    },
    [],
  )

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    >
      {/* Visual layer — always rendered, pointer-events off so transparent areas pass through */}
      <img
        src={btn.src}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-contain transition-all duration-150"
        style={{
          mixBlendMode: "multiply",
          pointerEvents: "none",
          filter: hovered
            ? "invert(1) sepia(1) saturate(4) hue-rotate(160deg) brightness(0.85)"
            : "none",
        }}
      />

      {/* Interaction layer — full-size but only fires when cursor is over an opaque pixel */}
      <div
        role="button"
        tabIndex={0}
        aria-label={btn.label}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "auto", cursor: hovered ? "pointer" : "default" }}
        onMouseMove={(e) => {
          const isNowOpaque = isOpaque(e)
          if (isNowOpaque && !wasHoveredRef.current) {
            wasHoveredRef.current = true
            onHoverChange(btn.id)
          } else if (!isNowOpaque && wasHoveredRef.current) {
            wasHoveredRef.current = false
            onHoverChange(null)
          }
        }}
        onMouseLeave={() => {
          wasHoveredRef.current = false
          onHoverChange(null)
        }}
        onClick={(e) => {
          if (isOpaque(e)) onClick(btn.id)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick(btn.id)
        }}
      />
    </div>
  )
}

export default function MenuPage() {
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null)

  const handleClick = useCallback((item: MenuItem) => {
    switch (item) {
      case "music":
        // Add music toggle logic here
        window.location.href = "/snake"
        break
      case "language":
        // Add language selection logic here
        window.location.href = "/pong"
        break
      case "start":
        window.location.href = "/main"
        break
    }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      <img
        src="/images/menu-background.gif"
        alt="Menu background — hand-drawn room with stick figure"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {menuButtons.map((btn) => (
        <ButtonLayer
          key={btn.id}
          btn={btn}
          hovered={hoveredItem === btn.id}
          onHoverChange={setHoveredItem}
          onClick={handleClick}
        />
      ))}
    </div>
  )
}
