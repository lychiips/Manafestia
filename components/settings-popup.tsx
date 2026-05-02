'use client'

import { useState, useEffect } from 'react'
import { useBackgroundMusic } from './background-music'

interface SettingsPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPopup({ isOpen, onClose }: SettingsPopupProps) {
  const { volume, setVolume } = useBackgroundMusic()
  const [currentLang, setCurrentLang] = useState('en')
  const [tempVolume, setTempVolume] = useState(volume)
  const [translations, setTranslations] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en'
    setCurrentLang(savedLang)
  }, [])

  useEffect(() => {
    setTempVolume(volume)
  }, [isOpen, volume])

  const loadTranslations = async (lang: string) => {
    try {
      const response = await fetch(`/locales/${lang}.json`)
      const data = await response.json()
      const flatTranslations: Record<string, string> = {}

      const flatten = (obj: Record<string, unknown>, prefix = '') => {
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            flatten(obj[key] as Record<string, unknown>, fullKey)
          } else {
            flatTranslations[fullKey] = obj[key] as string
          }
        }
      }

      flatten(data)
      setTranslations(flatTranslations)
    } catch (error) {
      console.error('Failed to load translations:', error)
      setTranslations({})
    }
  }

  useEffect(() => {
    loadTranslations(currentLang)
  }, [currentLang])

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang)
    localStorage.setItem('selectedLanguage', lang)
    // Reload the page to reflect language changes immediately
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const handleVolumeChange = (newVolume: number) => {
    setTempVolume(newVolume)
    setVolume(newVolume)
  }

  const t = (key: string, fallback: string) => translations[key] || fallback

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md p-8 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #6fd9ff, #6fd9ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('settings.title', 'Settings')}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-[#ccc] hover:text-white transition-colors duration-200"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Language Selection */}
        <div className="mb-8">
          <label className="block mb-4 text-[#ccc] font-semibold">
            {t('landing.selectLanguage', 'Select Language')}
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 px-4 py-3 border-2 border-[#6fd9ff] rounded-lg text-white cursor-pointer transition-all duration-300 ${
                currentLang === 'en'
                  ? 'bg-[#6fd9ff] text-black font-semibold'
                  : 'bg-transparent hover:bg-[rgba(111, 217, 255, 0.2)]'
              }`}
            >
              {t('landing.english', 'English')}
            </button>
            <button
              onClick={() => handleLanguageChange('jp')}
              className={`flex-1 px-4 py-3 border-2 border-[#6fd9ff] rounded-lg text-white cursor-pointer transition-all duration-300 ${
                currentLang === 'jp'
                  ? 'bg-[#6fd9ff] text-black font-semibold'
                  : 'bg-transparent hover:bg-[rgba(111, 217, 255, 0.2)]'
              }`}
            >
              {t('landing.japanese', 'Japanese')}
            </button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="mb-6">
          <label className="block mb-4 text-[#ccc] font-semibold">
            {t('settings.musicVolume', 'Music Volume')}
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={tempVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-[rgba(111, 217, 255, 0.2)] rounded-lg appearance-none cursor-pointer accent-[#6fd9ff]"
              aria-label="Music volume"
            />
            <span className="text-[#ccc] min-w-[3rem] text-right">
              {Math.round(tempVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 text-lg font-bold text-white border-none rounded-lg cursor-pointer transition-all duration-300"
          style={{
            background: 'linear-gradient(90deg, #6fd9ff, #6fd9ff)',
            boxShadow: '0 4px 15px rgba(111, 217, 255, 0.4)',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = '0 6px 20px rgba(111, 217, 255, 0.6)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = '0 4px 15px rgba(111, 217, 255, 0.4)')
          }
        >
          {t('settings.close', 'Close')}
        </button>
      </div>
    </>
  )
}
