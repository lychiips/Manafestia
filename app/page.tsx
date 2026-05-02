"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { SettingsPopup } from "@/components/settings-popup"

type LandingButtonId = "language" | "music" | "start"

interface LandingButton {
  id: LandingButtonId
  src: string
  hoverSrc: string
  alt: string
}

const landingButtons: LandingButton[] = [
  {
    id: "language",
    src: "/images/landinglang.png",
    hoverSrc: "/images/landinglanghover.png",
    alt: "Open language settings",
  },
  {
    id: "music",
    src: "/images/landingmusic.png",
    hoverSrc: "/images/landingmusichover.png",
    alt: "Open music settings",
  },
  {
    id: "start",
    src: "/images/landingstart.png",
    hoverSrc: "/images/landingstarthover.png",
    alt: "Start the experience",
  },
]

const ALPHA_THRESHOLD = 10

function sampleAlpha(
  container: HTMLElement,
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  naturalWidth: number,
  naturalHeight: number,
): number {
  const rect = container.getBoundingClientRect()
  const containerAspect = rect.width / rect.height
  const imageAspect = naturalWidth / naturalHeight
  let imgW: number, imgH: number, imgX: number, imgY: number
  let scaleX: number, scaleY: number, offsetX: number, offsetY: number

  if (imageAspect > containerAspect) {
    // Image is wider than container - crop sides
    imgH = rect.height
    imgW = rect.height * imageAspect
    imgX = rect.left - (imgW - rect.width) / 2
    imgY = rect.top
    scaleX = imgW / naturalWidth
    scaleY = rect.height / naturalHeight
    offsetX = (imgW - rect.width) / 2 / scaleX
    offsetY = 0
  } else {
    // Image is taller than container - crop top/bottom
    imgW = rect.width
    imgH = rect.width / imageAspect
    imgX = rect.left
    imgY = rect.top - (imgH - rect.height) / 2
    scaleX = rect.width / naturalWidth
    scaleY = imgH / naturalHeight
    offsetX = 0
    offsetY = (imgH - rect.height) / 2 / scaleY
  }

  const px = Math.round((((clientX - rect.left) / imgW) * naturalWidth) + offsetX)
  const py = Math.round((((clientY - rect.top) / imgH) * naturalHeight) + offsetY)

  if (px < 0 || py < 0 || px >= naturalWidth || py >= naturalHeight) return 0

  const ctx = canvas.getContext("2d")
  if (!ctx) return 0
  return ctx.getImageData(px, py, 1, 1).data[3]
}

interface ButtonLayerProps {
  btn: LandingButton
  hovered: boolean
}

function ButtonLayerVisual({ btn, hovered }: ButtonLayerProps) {
  return (
    <img
      src={hovered ? btn.hoverSrc : btn.src}
      alt=""
      aria-hidden
      className="absolute inset-0 w-full h-full object-cover transition-all duration-150"
      style={{
        pointerEvents: "none",
      }}
    />
  )
}

function InteractionOverlay({
  buttons,
  onHoverChange,
  onClick,
  hoveredItem,
}: {
  buttons: Array<{ btn: LandingButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }>
  onHoverChange: (id: LandingButtonId | null) => void
  onClick: (id: LandingButtonId) => void
  hoveredItem: LandingButtonId | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wasHoveredRef = useRef<LandingButtonId | null>(null)

  const checkButtonAtCursor = useCallback(
    (clientX: number, clientY: number): LandingButtonId | null => {
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
      style={{ pointerEvents: "auto", cursor: hoveredItem ? 'grab' : 'auto' }}
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

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<LandingButtonId | null>(null)
  const [buttonCanvases, setButtonCanvases] = useState<
    Array<{ btn: LandingButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }>
  >([])

  useEffect(() => {
    let isMounted = true
    let loadedCount = 0
    const canvases: Array<{ btn: LandingButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }> = []

    landingButtons.forEach((btn) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
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
        if (loadedCount === landingButtons.length) {
          canvases.sort(
            (a, b) => landingButtons.findIndex((entry) => entry.id === a.btn.id) - landingButtons.findIndex((entry) => entry.id === b.btn.id),
          )
          if (isMounted) setButtonCanvases(canvases)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleClick = useCallback((item: LandingButtonId) => {
    if (item === "start") {
      window.location.href = "/main"
      return
    }
    setIsSettingsOpen(true)
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <img
        src="/images/landingbackground.png"
        alt="Landing background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {landingButtons.map((btn) => (
        <ButtonLayerVisual key={btn.id} btn={btn} hovered={hoveredItem === btn.id} />
      ))}

      {buttonCanvases.length > 0 && (
        <InteractionOverlay buttons={buttonCanvases} onHoverChange={setHoveredItem} onClick={handleClick} hoveredItem={hoveredItem} />
      )}
    </div>
  )
}
