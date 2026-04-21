"use client"

import Link from "next/link"

export default function OshikatsuPage() {
  return (
    <div 
      className="min-h-screen flex justify-center items-center text-white p-8"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}
    >
      <div 
        className="text-center max-w-[800px] w-full p-12 rounded-[20px]"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}
      >
        <h1 
          className="text-4xl mb-8"
          style={{
            background: "linear-gradient(90deg, #f472b6, #f9a8d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Oshikatsu
        </h1>
        <p className="text-[#a0a0a0] text-2xl mb-8">TBD</p>
        <Link 
          href="/main"
          className="inline-block px-8 py-3 bg-transparent border-2 border-[#54c7fd] text-white rounded-full cursor-pointer text-base transition-all duration-300 no-underline hover:bg-[#54c7fd]"
        >
          Back to Games
        </Link>
      </div>
    </div>
  )
}
