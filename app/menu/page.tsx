"use client"

import { useState, useCallback } from "react"

type MenuItem = "music" | "language" | "start"

interface MenuPath {
  id: MenuItem
  // Hand-drawn path coordinates tracing around each word
  path: string
}

export default function MenuPage() {
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null)

  const handleClick = useCallback((item: MenuItem) => {
    switch (item) {
      case "music":
        console.log("Music clicked")
        // Add music toggle logic here
        break
      case "language":
        console.log("Language clicked")
        // Add language selection logic here
        break
      case "start":
        console.log("Start clicked")
        window.location.href = "/main"
        break
    }
  }, [])

  // Hand-drawn polygon paths tracing around each menu text
  // Coordinates are relative to GIF dimensions (1456x1024 viewBox)
  // Path format: series of x,y points forming a closed polygon around each word
  const menuPaths: MenuPath[] = [
    {
      id: "music",
      // Traces around "MUSIC" text including the diamond bullet
      path: `
        M 132 118
        L 148 108
        L 175 112
        L 220 105
        L 280 108
        L 340 102
        L 400 108
        L 418 115
        L 425 135
        L 420 160
        L 415 178
        L 380 185
        L 320 182
        L 260 188
        L 200 185
        L 160 182
        L 135 175
        L 128 155
        L 130 135
        Z
      `,
    },
    {
      id: "language",
      // Traces around "LANGUAGE" text including the diamond bullet
      path: `
        M 132 198
        L 150 188
        L 190 192
        L 250 186
        L 320 190
        L 400 185
        L 480 188
        L 530 192
        L 545 205
        L 548 225
        L 545 250
        L 535 268
        L 490 275
        L 420 272
        L 350 278
        L 280 275
        L 210 272
        L 160 268
        L 138 258
        L 130 238
        L 128 218
        Z
      `,
    },
    {
      id: "start",
      // Traces around "START" text including the diamond bullet
      path: `
        M 132 295
        L 150 285
        L 185 288
        L 230 282
        L 285 285
        L 340 280
        L 378 285
        L 392 295
        L 398 315
        L 395 340
        L 388 358
        L 350 365
        L 290 362
        L 230 368
        L 175 365
        L 145 358
        L 132 345
        L 128 322
        Z
      `,
    },
  ]

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      {/* Background GIF */}
      <img
        src="/images/menu-background.gif"
        alt="Menu background"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* SVG Overlay with hand-drawn clickable paths */}
      <svg
        viewBox="0 0 1456 1024"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        {menuPaths.map((item) => (
          <path
            key={item.id}
            d={item.path}
            onClick={() => handleClick(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className="cursor-pointer pointer-events-auto transition-all duration-200"
            role="button"
            tabIndex={0}
            aria-label={item.id}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleClick(item.id)
              }
            }}
            fill={hoveredItem === item.id ? "rgba(111, 217, 255, 0.25)" : "transparent"}
            stroke={hoveredItem === item.id ? "rgba(111, 217, 255, 0.7)" : "transparent"}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* Debug overlay - uncomment to help position hitboxes */}
      {/* 
      <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm font-mono z-10">
        Hovered: {hoveredItem || "none"}
      </div>
      */}
    </div>
  )
}
