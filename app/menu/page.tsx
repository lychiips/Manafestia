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
  container: HTMLElement,
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
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
}

/**
 * Visual layer only — no interaction, just renders the PNG with hover effect.
 */
function ButtonLayerVisual({ btn, hovered }: ButtonLayerProps) {
  return (
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
  )
}

/**
 * Unified interaction layer that checks all button canvases on mouse move/click.
 */
function InteractionOverlay({
  buttons,
  hoveredItem,
  onHoverChange,
  onClick,
}: {
  buttons: Array<{ btn: MenuButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }>
  hoveredItem: MenuItem | null
  onHoverChange: (id: MenuItem | null) => void
  onClick: (id: MenuItem) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wasHoveredRef = useRef<MenuItem | null>(null)

  const checkButtonAtCursor = useCallback(
    (clientX: number, clientY: number): MenuItem | null => {
      if (!containerRef.current) return null

      for (const { btn, canvas, size } of buttons) {
        if (!canvas) continue
        const alpha = sampleAlpha(containerRef.current, clientX, clientY, canvas, size.w, size.h)
        if (alpha > ALPHA_THRESHOLD) return btn.id
      }
      return null
    },
    [buttons],
  )

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "auto" }}
      onMouseMove={(e) => {
        const hoveredNow = checkButtonAtCursor(e.clientX, e.clientY)
        if (hoveredNow !== wasHoveredRef.current) {
          wasHoveredRef.current = hoveredNow
          onHoverChange(hoveredNow)
        }
      }}
      onMouseLeave={() => {
        wasHoveredRef.current = null
        onHoverChange(null)
      }}
      onClick={(e) => {
        const hoveredNow = checkButtonAtCursor(e.clientX, e.clientY)
        if (hoveredNow) onClick(hoveredNow)
      }}
    />
  )
}

export default function MenuPage() {
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null)
  const [buttonCanvases, setButtonCanvases] = useState<
    Array<{ btn: MenuButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }>
  >([])

  // Load all button PNGs into offscreen canvases once on mount
  useEffect(() => {
    let isMounted = true
    let loadedCount = 0
    const canvases: Array<{ btn: MenuButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }> = []

    menuButtons.forEach((btn) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      // Force cache bust by adding a timestamp query parameter
      img.src = `${btn.src}?t=${Date.now()}`
      img.onload = () => {
        if (!isMounted) return
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext("2d")?.drawImage(img, 0, 0)
        canvases.push({
          btn,
          canvas,
          size: { w: img.naturalWidth, h: img.naturalHeight },
        })
        loadedCount++
        if (loadedCount === menuButtons.length) {
          // Sort by button id order to ensure consistent ordering
          canvases.sort((a, b) => menuButtons.findIndex((b2) => b2.id === a.btn.id) - menuButtons.findIndex((b2) => b2.id === b.btn.id))
          if (isMounted) setButtonCanvases(canvases)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleClick = useCallback((item: MenuItem) => {
    switch (item) {
      case "music":
        window.location.href = "/snake"
        break
      case "language":
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

      {/* Visual layers for all buttons */}
      {menuButtons.map((btn) => (
        <ButtonLayerVisual key={btn.id} btn={btn} hovered={hoveredItem === btn.id} />
      ))}

      {/* Single unified interaction layer */}
      {buttonCanvases.length > 0 && (
        <InteractionOverlay
          buttons={buttonCanvases}
          hoveredItem={hoveredItem}
          onHoverChange={setHoveredItem}
          onClick={handleClick}
        />
      )}
    </div>
  )
}
