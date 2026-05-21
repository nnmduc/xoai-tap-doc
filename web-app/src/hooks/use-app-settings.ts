import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'

const STORAGE_KEY = 'xoai-audio-enabled'
const RTDB_URL = import.meta.env.VITE_FIREBASE_RTDB_URL as string | undefined

function readLocalAudio(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

async function fetchCloudAudio(uid: string, token: string): Promise<boolean | null> {
  if (!RTDB_URL) return null
  try {
    const res = await fetch(`${RTDB_URL}/users/${uid}/settings/audioEnabled.json?auth=${token}`)
    const data = await res.json()
    return typeof data === 'boolean' ? data : null
  } catch {
    return null
  }
}

function saveCloudAudio(uid: string, token: string, value: boolean): void {
  if (!RTDB_URL) return
  fetch(`${RTDB_URL}/users/${uid}/settings/audioEnabled.json?auth=${token}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  }).catch(() => {})
}

export function useAppSettings() {
  const { user } = useAuth()
  const [audioEnabled, setAudioEnabled] = useState<boolean>(readLocalAudio)
  const syncedForRef = useRef<string | null>(null)

  useEffect(() => {
    if (!user || syncedForRef.current === user.uid) return
    syncedForRef.current = user.uid
    user.getIdToken()
      .then((token) => fetchCloudAudio(user.uid, token))
      .then((cloudValue) => {
        if (cloudValue !== null) {
          setAudioEnabled(cloudValue)
          try { localStorage.setItem(STORAGE_KEY, String(cloudValue)) } catch {}
        }
      })
  }, [user])

  const toggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      if (user) {
        user.getIdToken().then((token) => saveCloudAudio(user.uid, token, next))
      }
      return next
    })
  }

  return { audioEnabled, toggleAudio }
}
