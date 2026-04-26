"use client"

import { useState, useCallback } from "react"

type MenuItem = "music" | "language" | "start"

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

  // Menu item configurations with positions relative to the GIF (1456x1024 viewBox)
  // These coordinates match the text positions in the hand-drawn menu
  const menuItems: { id: MenuItem; x: number; y: number; width: number; height: number }[] = [
    { id: "music", x: 145, y: 115, width: 280, height: 75 },
    { id: "language", x: 145, y: 195, width: 380, height: 85 },
    { id: "start", x: 145, y: 290, width: 240, height: 80 },
  ]

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      {/* Background GIF */}
      <img
        src="/images/menu-background.gif"
        alt="Menu background"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* SVG Overlay with clickable regions */}
      <svg
        viewBox="0 0 1456 1024"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        {menuItems.map((item) => (
          <g
            key={item.id}
            onClick={() => handleClick(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className="cursor-pointer pointer-events-auto"
            role="button"
            tabIndex={0}
            aria-label={item.id}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleClick(item.id)
              }
            }}
          >
            {/* Visible hover highlight */}
            <rect
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              rx="8"
              ry="8"
              fill={hoveredItem === item.id ? "rgba(111, 217, 255, 0.25)" : "transparent"}
              stroke={hoveredItem === item.id ? "rgba(111, 217, 255, 0.7)" : "transparent"}
              strokeWidth="3"
              className="transition-all duration-200"
            />
          </g>
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
