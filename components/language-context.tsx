'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface LanguageContextType {
  currentLang: string
  setCurrentLang: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState('en')

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
