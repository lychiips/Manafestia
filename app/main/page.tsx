"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function MainPage() {
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage") || "en"
    loadTranslations(savedLang)
  }, [])

  const loadTranslations = async (lang: string) => {
    try {
      const response = await fetch(`/locales/${lang}.json`)
      const data = await response.json()
      const flatTranslations: Record<string, string> = {}
      
      const flatten = (obj: Record<string, unknown>, prefix = "") => {
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key
          if (typeof obj[key] === "object" && obj[key] !== null) {
            flatten(obj[key] as Record<string, unknown>, fullKey)
          } else {
            flatTranslations[fullKey] = obj[key] as string
          }
        }
      }
      
      flatten(data)
      setTranslations(flatTranslations)
      // Add a 5-second delay before hiding the loading screen
      setTimeout(() => setLoading(false), 1000)
    } catch (error) {
      console.error("Failed to load translations:", error)
      setLoading(false)
    }
  }

  const t = (key: string, fallback: string) => translations[key] || fallback

  if (loading) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center text-white p-8"
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
        }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">Loading...</div>
          <div className="text-3xl mb-4">Insert transition gif here</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex justify-center items-center text-white p-8"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}
    >
      <div className="text-center max-w-[800px] w-full">
        <h1> The theme/design of this page is being decided by a vote in the Discord! </h1>
        <h1 
          className="text-4xl mb-2"
          style={{
            background: "linear-gradient(90deg, #65d1ff, #8ce6ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          {t("mainpage.title", "Game Selection")}
        </h1>
        <p className="text-[#a0a0a0] mb-12 text-xl">
          {t("mainpage.subtitle", "Choose a game to play")}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Link 
            href="/snake" 
            className="block p-8 rounded-[20px] text-white no-underline border-2 border-transparent transition-all duration-300 hover:-translate-y-2.5 hover:border-[#45a5e9] hover:shadow-[0_6px_20px_rgba(69,121,233,0.6)]"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div className="text-6xl mb-4 text-[#4ade80]">🐍</div>
            <h2 className="text-2xl mb-2 text-[#54c7fd]">{t("mainpage.snake", "Snake")}</h2>
            <p className="text-[#a0a0a0] text-sm">{t("mainpage.snakeDesc", "Example game 1!")}</p>
          </Link>
          
          <Link 
            href="/pong" 
            className="block p-8 rounded-[20px] text-white no-underline border-2 border-transparent transition-all duration-300 hover:-translate-y-2.5 hover:border-[#45a5e9] hover:shadow-[0_6px_20px_rgba(69,121,233,0.6)]"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div className="text-6xl mb-4 text-[#60a5fa]">🏓</div>
            <h2 className="text-2xl mb-2 text-[#54c7fd]">{t("mainpage.pong", "Pong")}</h2>
            <p className="text-[#a0a0a0] text-sm">{t("mainpage.pongDesc", "Example game 2!")}</p>
          </Link>
          
          <Link 
            href="/cookbook" 
            className="block p-8 rounded-[20px] text-white no-underline border-2 border-transparent transition-all duration-300 hover:-translate-y-2.5 hover:border-[#45a5e9] hover:shadow-[0_6px_20px_rgba(69,121,233,0.6)]"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div className="text-6xl mb-4 text-[#f97316]">📖</div>
            <h2 className="text-2xl mb-2 text-[#54c7fd]">{t("mainpage.cookbook", "Cookbook")}</h2>
            <p className="text-[#a0a0a0] text-sm">{t("mainpage.cookbookDesc", "Cookbook description!")}</p>
          </Link>
          
          <Link 
            href="/oshikatsu" 
            className="block p-8 rounded-[20px] text-white no-underline border-2 border-transparent transition-all duration-300 hover:-translate-y-2.5 hover:border-[#45a5e9] hover:shadow-[0_6px_20px_rgba(69,121,233,0.6)]"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div className="text-6xl mb-4 text-[#f472b6]">⭐</div>
            <h2 className="text-2xl mb-2 text-[#54c7fd]">{t("mainpage.oshikatsu", "Oshikatsu")}</h2>
            <p className="text-[#a0a0a0] text-sm">{t("mainpage.oshikatsuDesc", "Mana around the world!")}</p>
          </Link>
        </div>
        
        <Link 
          href="/" 
          className="inline-block px-8 py-3 bg-transparent border-2 border-[#54c7fd] text-white rounded-full cursor-pointer text-base transition-all duration-300 no-underline hover:bg-[#54c7fd]"
        >
          {t("mainpage.backButton", "Back to Home")}
        </Link>
      </div>
    </div>
  )
}
