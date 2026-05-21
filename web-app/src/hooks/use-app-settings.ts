import { useState } from 'react'

const STORAGE_KEY = 'xoai-audio-enabled'

function readAudioEnabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

export function useAppSettings() {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(readAudioEnabled)

  const toggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch { /* ignore */ }
      return next
    })
  }

  return { audioEnabled, toggleAudio }
}
