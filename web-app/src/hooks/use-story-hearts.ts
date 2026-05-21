import { useState, useEffect, useCallback } from 'react'
import * as heartsStore from '@/store/hearts-store'
import { useAuth } from '@/context/auth-context'

const LS_KEY = 'xoai-heart-counts'

function readMyCount(slug: string): number {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
    return (stored[slug] as number) ?? 0
  } catch {
    return 0
  }
}

function writeMyCount(slug: string, count: number): void {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
    stored[slug] = count
    localStorage.setItem(LS_KEY, JSON.stringify(stored))
  } catch {}
}

export function useStoryHearts(slug: string) {
  const { user, heartedSlugs, addUserHeart } = useAuth()
  const [total, setTotal] = useState<number | null>(null)
  const [myCount, setMyCount] = useState(() => readMyCount(slug))

  useEffect(() => {
    setMyCount(readMyCount(slug))

    const unsub = heartsStore.subscribe(() => {
      setTotal(heartsStore.getCount(slug))
    })

    heartsStore.ensureLoaded().then(() => {
      setTotal(heartsStore.getCount(slug))
    })

    return unsub
  }, [slug])

  const hasHearted = user ? heartedSlugs.has(slug) : myCount > 0

  const addHeart = useCallback(() => {
    heartsStore.incrementHeart(slug)
    if (user) {
      addUserHeart(slug)
    } else {
      setMyCount((prev) => {
        const next = prev + 1
        writeMyCount(slug, next)
        return next
      })
    }
  }, [slug, user, addUserHeart])

  return {
    total,
    myCount,
    hasHearted,
    addHeart,
  }
}
