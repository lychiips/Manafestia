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

      {/* Button PNGs — same canvas + object-contain as the GIF so they align pixel-perfectly.
          mix-blend-mode:multiply makes the white canvas invisible, leaving only the ink.
          The img itself is the interactive element so no wrapper can skew its rendered size. */}
      {menuButtons.map((btn) => (
        <img
          key={btn.id}
          src={btn.src}
          alt={btn.label}
          role="button"
          tabIndex={0}
          onClick={() => handleClick(btn.id)}
          onMouseEnter={() => setHoveredItem(btn.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClick(btn.id)
          }}
          className="absolute inset-0 w-full h-full object-contain cursor-pointer transition-all duration-200"
          style={{
            mixBlendMode: "multiply",
            filter:
              hoveredItem === btn.id
                ? "invert(1) sepia(1) saturate(4) hue-rotate(160deg) brightness(0.85)"
                : "none",
          }}
        />
      ))}
    </div>
  )
}
