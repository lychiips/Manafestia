'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'

interface MusicContextType {
  volume: number
  setVolume: (volume: number) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function useBackgroundMusic() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useBackgroundMusic must be used within MusicProvider')
  }
  return context
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [volume, setVolume] = useState(0.3)

  useEffect(() => {
    const savedVolume = localStorage.getItem('musicVolume')
    if (savedVolume) {
      const vol = parseFloat(savedVolume)
      setVolume(vol)
      if (audioRef.current) {
        audioRef.current.volume = vol
      }
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Set audio properties
    audio.loop = true
    audio.volume = volume
    localStorage.setItem('musicVolume', volume.toString())

    // Attempt to play on mount
    const playAudio = () => {
      audio.play().catch((error) => {
        console.log('[v0] Audio autoplay prevented:', error.message)
      })
    }

    // Try to play immediately
    playAudio()

    // Add event listeners for user interaction to enable autoplay
    const handleUserInteraction = () => {
      audio.play().catch((error) => {
        console.log('[v0] Audio play error:', error.message)
      })
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [volume])

  return (
    <MusicContext.Provider value={{ volume, setVolume, audioRef }}>
      <audio
        ref={audioRef}
        src="/audios/Karma.mp3"
        aria-label="Background music"
      />
      {children}
    </MusicContext.Provider>
  )
}
