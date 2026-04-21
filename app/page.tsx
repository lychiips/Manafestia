"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [currentLang, setCurrentLang] = useState("en")
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage") || "en"
    setCurrentLang(savedLang)
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
      setTimeout(() => setLoading(false), 1500)
    } catch (error) {
      console.error("Failed to load translations:", error)
      setLoading(false)
    }
  }

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang)
    localStorage.setItem("selectedLanguage", lang)
    loadTranslations(lang)
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
          <div className="text-4xl mb-4">Loading in animation</div>
          <div className="text-3xl mb-4">Insert load in gif here</div>
        </div>
      </div>
    )
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
          {t("landing.title", "Mini Games Arcade")}
        </h1>
        
        <p className="text-[#a0a0a0] mb-8 text-lg">
          {t("landing.subtitle", "Choose your language and start playing!")}
        </p>
        
        <div className="mb-8">
          <label className="block mb-4 text-[#ccc]">
            {t("landing.selectLanguage", "Select Language")}
          </label>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-6 py-3 border-2 border-[#6fd9ff] rounded-[10px] text-white cursor-pointer transition-all duration-300 ${
                currentLang === "en" ? "bg-[#6fd9ff]" : "bg-transparent hover:bg-[rgba(111, 217, 255, 0.2)]"
              }`}
            >
              {t("landing.english", "English")}
            </button>
            <button
              onClick={() => handleLanguageChange("jp")}
              className={`px-6 py-3 border-2 border-[#6fd9ff] rounded-[10px] text-white cursor-pointer transition-all duration-300 ${
                currentLang === "jp" ? "bg-[#6fd9ff]" : "bg-transparent hover:bg-[rgba(111, 217, 255, 0.2)]"
              }`}
            >
              {t("landing.japanese", "Japanese")}
            </button>
          </div>
        </div>
        
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
          {t("landing.startButton", "Start Playing")}
        </button>
      </div>
    </div>
  )
}
