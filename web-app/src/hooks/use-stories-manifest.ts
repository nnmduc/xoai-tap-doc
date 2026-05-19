import { useState, useEffect } from 'react'
import type { StoriesManifest } from '@/types/story'

type State =
  | { status: 'loading' }
  | { status: 'success'; data: StoriesManifest }
  | { status: 'error'; message: string }

export function useStoriesManifest() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetch('/stories-manifest.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<StoriesManifest>
      })
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data })
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
      })
    return () => { cancelled = true }
  }, [])

  return state
}
