import { useState, useEffect } from 'react'

export type Route =
  | { view: 'library' }
  | { view: 'reader'; slug: string }

function parseHash(hash: string): Route {
  const stripped = hash.replace(/^#\/?/, '')
  if (stripped.startsWith('reader/')) {
    const slug = stripped.slice('reader/'.length)
    if (slug && /^[a-z0-9-]+$/.test(slug)) return { view: 'reader', slug }
  }
  return { view: 'library' }
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = {
    toLibrary: () => { window.location.hash = '#library' },
    toReader: (slug: string) => { window.location.hash = `#reader/${slug}` },
  }

  return { route, navigate }
}
