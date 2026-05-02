'use client'

import { useEffect, useRef } from 'react'

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Set audio properties
    audio.loop = true
    audio.volume = 0.3 // Set volume to 30%

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
  }, [])

  return (
    <audio
      ref={audioRef}
      src="/audios/Karma.mp3"
      aria-label="Background music"
    />
  )
}
