"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { SettingsPopup } from "@/components/settings-popup"

type MainButtonId = "cookbook" | "fanart" | "letters" | "world" | "games" | "settings" | "home"

interface MainButton {
  id: MainButtonId
  src: string
  hoverSrc: string
  href?: string
  alt: string
}

const mainButtons: MainButton[] = [
  {
    id: "cookbook",
    src: "/images/mainpage/btn-cookbook.png",
    hoverSrc: "/images/mainpage/btn-cookbook-hover.png",
    href: "/cookbook",
    alt: "Cookbook",
  },
  {
    id: "fanart",
    src: "/images/mainpage/btn-fanart.png",
    hoverSrc: "/images/mainpage/btn-fanart-hover.png",
    href: "/oshikatsu",
    alt: "Fanart",
  },
  {
    id: "letters",
    src: "/images/mainpage/btn-letters.png",
    hoverSrc: "/images/mainpage/btn-letters-hover.png",
    href: "/oshikatsu",
    alt: "Letters",
  },
  {
    id: "world",
    src: "/images/mainpage/btn-world.png",
    hoverSrc: "/images/mainpage/btn-world-hover.png",
    href: "/oshikatsu",
    alt: "World",
  },
  {
    id: "settings",
    src: "/images/mainpage/btn-settings.png",
    hoverSrc: "/images/mainpage/btn-settings-hover.png",
    alt: "Settings",
  },
  {
    id: "home",
    src: "/images/mainpage/btn-home.png",
    hoverSrc: "/images/mainpage/btn-home-hover.png",
    href: "/",
    alt: "Home",
  },
  {
    id: "games",
    src: "/images/mainpage/btn-games.png",
    hoverSrc: "/images/mainpage/btn-games-hover.png",
    href: "/gameselect",
    alt: "Game select",
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
  const scale = Math.max(rect.width / naturalWidth, rect.height / naturalHeight)
  const imgW = naturalWidth * scale
  const imgH = naturalHeight * scale
  const imgX = rect.left + (rect.width - imgW) / 2
  const imgY = rect.top + (rect.height - imgH) / 2

  const px = Math.round(((clientX - imgX) / imgW) * naturalWidth)
  const py = Math.round(((clientY - imgY) / imgH) * naturalHeight)

  if (px < 0 || py < 0 || px >= naturalWidth || py >= naturalHeight) return 0

  const ctx = canvas.getContext("2d")
  if (!ctx) return 0
  return ctx.getImageData(px, py, 1, 1).data[3]
}

interface ButtonLayerProps {
  btn: MainButton
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
  buttons: Array<{ btn: MainButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }>
  onHoverChange: (id: MainButtonId | null) => void
  onClick: (id: MainButtonId) => void
  hoveredItem: MainButtonId | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wasHoveredRef = useRef<MainButtonId | null>(null)

  const checkButtonAtCursor = useCallback(
    (clientX: number, clientY: number): MainButtonId | null => {
      if (!containerRef.current) return null

      for (let i = buttons.length - 1; i >= 0; i -= 1) {
        const { btn, canvas, size } = buttons[i]
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
      onClick={() => {
        const hoveredNow = wasHoveredRef.current
        if (hoveredNow) onClick(hoveredNow)
      }}
    />
  )
}

export default function MainPage() {
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = useState<MainButtonId | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [buttonCanvases, setButtonCanvases] = useState<
    Array<{ btn: MainButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }>
  >([])

  useEffect(() => {
    let isMounted = true
    let loadedCount = 0
    const canvases: Array<{ btn: MainButton; canvas: HTMLCanvasElement | null; size: { w: number; h: number } }> = []

    mainButtons.forEach((btn) => {
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
        loadedCount += 1
        if (loadedCount === mainButtons.length) {
          if (isMounted) setButtonCanvases(canvases)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleClick = useCallback(
    (item: MainButtonId) => {
      if (item === "settings") {
        setIsSettingsOpen(true)
        return
      }
      const button = mainButtons.find((btn) => btn.id === item)
      if (button?.href) router.push(button.href)
    },
    [router],
  )

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <img
        src="/images/mainpage/mainpagebackground.png"
        alt="Main page background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {mainButtons.map((btn) => (
        <ButtonLayerVisual key={btn.id} btn={btn} hovered={hoveredItem === btn.id} />
      ))}

      {buttonCanvases.length > 0 && (
        <InteractionOverlay
          buttons={buttonCanvases}
          onHoverChange={setHoveredItem}
          onClick={handleClick}
          hoveredItem={hoveredItem}
        />
      )}
    </div>
  )
}
