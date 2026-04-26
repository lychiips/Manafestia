"use client"

import { useState, useCallback } from "react"

type MenuItem = "music" | "language" | "start"

interface MenuButton {
  id: MenuItem
  src: string
  label: string
}

// Each PNG is the same canvas size as the background GIF so they
// stack perfectly with inset-0 + object-contain + same preserveAspectRatio.
// Swap src values once you provide the LANGUAGE and START PNGs.
const menuButtons: MenuButton[] = [
  { id: "music",    src: "/images/btn-music.png",    label: "Music" },
  { id: "language", src: "/images/btn-language.png", label: "Language" },
  { id: "start",    src: "/images/btn-start.png",    label: "Start" },
]

export default function MenuPage() {
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null)

  const handleClick = useCallback((item: MenuItem) => {
    switch (item) {
      case "music":
        // Add music toggle logic here
        break
      case "language":
        // Add language selection logic here
        break
      case "start":
        window.location.href = "/main"
        break
    }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      {/* Background GIF — rendered first so buttons layer above it */}
      <img
        src="/images/menu-background.gif"
        alt="Menu background — hand-drawn room with stick figure"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Button PNGs — same canvas size as the GIF so they align automatically */}
      {menuButtons.map((btn) => (
        <button
          key={btn.id}
          type="button"
          aria-label={btn.label}
          onClick={() => handleClick(btn.id)}
          onMouseEnter={() => setHoveredItem(btn.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className="absolute inset-0 w-full h-full bg-transparent border-0 p-0 cursor-pointer"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <img
            src={btn.src}
            alt={btn.label}
            className="w-full h-full object-contain transition-all duration-200"
            style={{
              // On hover: invert the ink colour to give a cyan-tinted highlight
              filter:
                hoveredItem === btn.id
                  ? "invert(1) sepia(1) saturate(3) hue-rotate(160deg)"
                  : "none",
            }}
          />
        </button>
      ))}
    </div>
  )
}
