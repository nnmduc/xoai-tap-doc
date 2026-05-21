const FIREBASE_URL = import.meta.env.VITE_FIREBASE_RTDB_URL as string | undefined
const CACHE_TTL_MS = 5 * 60 * 1000

let counts: Record<string, number> = {}
let loadedAt = 0
let loadPromise: Promise<void> | null = null
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((fn) => fn())
}

export async function ensureLoaded(): Promise<void> {
  if (Date.now() - loadedAt < CACHE_TTL_MS) return
  if (loadPromise) return loadPromise

  if (!FIREBASE_URL) {
    if (import.meta.env.DEV) console.warn('[hearts] VITE_FIREBASE_RTDB_URL is not set')
    loadedAt = Date.now()
    return
  }

  loadPromise = fetch(`${FIREBASE_URL}/hearts.json`)
    .then((r) => r.json())
    .then((data) => {
      counts = data && typeof data === 'object' ? data : {}
      loadedAt = Date.now()
    })
    .catch(() => {
      loadedAt = Date.now()
    })
    .finally(() => {
      loadPromise = null
    })
  return loadPromise
}

export function getCount(slug: string): number {
  const v = counts[slug]
  return typeof v === 'number' ? v : 0
}

export function incrementHeart(slug: string): void {
  counts[slug] = (counts[slug] ?? 0) + 1
  notify()

  if (!FIREBASE_URL) return

  const newVal = counts[slug]
  fetch(`${FIREBASE_URL}/hearts/${slug}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newVal),
  }).catch(() => {})
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
