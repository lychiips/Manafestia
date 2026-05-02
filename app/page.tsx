"use client"

import { useEffect, useState } from "react"
import { SettingsPopup } from "@/components/settings-popup"
import { useLanguage } from "@/components/language-context"

export default function Home() {
  const { currentLang } = useLanguage()
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [translationsLoaded, setTranslationsLoaded] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    loadTranslations(currentLang)
  }, [currentLang])

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
      setTranslationsLoaded(true)
    } catch (error) {
      console.error("Failed to load translations:", error)
      // Fallback to English if loading fails
      setTranslations({
        "landing.title": "Hibachi Mana 2026 Birthday",
        "landing.subtitle": "Happy birthday!",
        "landing.startButton": "Start!"
      })
      setTranslationsLoaded(true)
    }
  }

  const t = (key: string, fallback: string) => translations[key] || fallback

  if (!translationsLoaded) {
    return null
  }

  return (
    <div className="min-h-screen flex justify-center items-center text-white font-sans"
         style={{ 
           backgroundImage: "url('/images/manafestialoadingpage.png')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           backgroundRepeat: "no-repeat",
           backgroundAttachment: "fixed"
         }}>
      
      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-6 right-6 z-30 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 hover:scale-110"
        style={{
          background: "linear-gradient(90deg, #6fd9ff, #6fd9ff)",
          boxShadow: "0 4px 15px rgba(111, 217, 255, 0.4)",
          color: "black"
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(111, 217, 255, 0.6)"}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 15px rgba(111, 217, 255, 0.4)"}
        aria-label="Open settings"
      >
        ⚙️
      </button>

      {/* Settings Popup */}
      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Decorative circles */}
      <div className="fixed w-[200px] h-[200px] rounded-full -top-[100px] -left-[100px] -z-10"
           style={{ background: "rgba(233, 69, 96, 0.1)" }} />
      <div className="fixed w-[200px] h-[200px] rounded-full -bottom-[100px] -right-[100px] -z-10"
           style={{ background: "rgba(15, 52, 96, 0.3)" }} />
      
      <div className="text-center p-8 rounded-[20px] max-w-[500px] w-[90%]"
           style={{ 
             background: "rgba(255, 255, 255, 0.1)", 
             backdropFilter: "blur(10px)",
             boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
           }}>
        
        <h1 className="text-4xl font-bold mb-2"
            style={{ 
              background: "linear-gradient(90deg, #6fd9ff, #6fd9ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
          {t("landing.title", "")}
        </h1>
        
        <p className="text-[#a0a0a0] mb-8 text-lg">
          {t("landing.subtitle", "")}
        </p>
        
        <button
          onClick={() => window.location.href = "/main"}
          className="px-12 py-4 text-xl font-bold text-white border-none rounded-full cursor-pointer uppercase tracking-widest transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "linear-gradient(90deg, #6fd9ff, #6fd9ff)",
            boxShadow: "0 4px 15px rgba(80, 69, 233, 0.4)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(80, 69, 233, 0.6)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 15px rgba(80, 69, 233, 0.4)"}
        >
          {t("landing.startButton", "")}
        </button>
      </div>
    </div>
  )
}
