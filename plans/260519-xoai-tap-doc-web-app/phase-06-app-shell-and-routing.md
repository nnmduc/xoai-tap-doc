---
phase: 6
title: "App Shell and Routing"
status: pending
priority: P1
effort: "30m"
dependencies: [4, 5]
---

# Phase 6: App Shell and Routing

## Overview
Wire up `App.tsx` with manifest fetch, hash-based routing (`#library` / `#reader/<slug>`), `AnimatePresence` for screen transitions, and loading/error states. This phase connects all components into a working app.

## Requirements
- Functional: App fetches manifest on load; hash URL controls which screen shows; browser back/forward works; deep-link to `#reader/canh-cua-trong-tu-sach` opens reader directly
- Non-functional: Loading skeleton; error fallback; `document.title` updates per screen

## Architecture
```
src/
├── App.tsx                   ← root: fetch + routing + AnimatePresence
├── hooks/
│   ├── use-hash-route.ts     ← hash routing hook
│   └── use-stories-manifest.ts  ← fetch hook with loading/error state
└── components/
    └── shared/
        ├── LoadingScreen.tsx ← full-screen spinner while manifest loads
        └── ErrorScreen.tsx   ← manifest fetch error with retry
```

### Hash Routing Convention
| Hash | Screen |
|---|---|
| `#library` (default) | `LibraryScreen` |
| `#reader/<slug>` | `ReaderScreen` for story with that slug |

### Routing Hook
```ts
// src/hooks/use-hash-route.ts
export function useHashRoute() {
  const [hash, setHash] = useState(() => location.hash.slice(1) || 'library')

  useEffect(() => {
    const handler = () => setHash(location.hash.slice(1) || 'library')
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = useCallback((route: string) => {
    location.hash = route
  }, [])

  return { hash, navigate }
}
```

### Manifest Fetch Hook
```ts
// src/hooks/use-stories-manifest.ts
export function useStoriesManifest() {
  const [manifest, setManifest] = useState<StoriesManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true); setError(null)
    fetch('/stories-manifest.json')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setManifest)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])
  return { manifest, loading, error, retry: load }
}
```

### App.tsx Routing Logic

> **Hooks-before-returns**: ALL hooks must be called before any early return (React rules of hooks).
> `useEffect` for `document.title` is moved above the `if (loading)` guards.

```tsx
export default function App() {
  const { manifest, loading, error, retry } = useStoriesManifest()
  const { hash, navigate } = useHashRoute()

  const stories = manifest?.stories ?? []
  const isReader = hash.startsWith('reader/')
  const readerSlug = isReader ? hash.slice('reader/'.length) : null
  const activeStory = readerSlug ? stories.find(s => s.slug === readerSlug) : undefined

  // ← useEffect BEFORE early returns (React rules of hooks)
  useEffect(() => {
    document.title = activeStory
      ? `${activeStory.title} — Xoài Tập Đọc`
      : 'Thư Viện Sách — Xoài Tập Đọc'
  }, [activeStory])

  if (loading) return <LoadingScreen />
  if (error || !manifest) return <ErrorScreen message={error} onRetry={retry} />

  return (
    <AnimatePresence mode="wait">
      {isReader && activeStory ? (
        <ReaderScreen
          key={`reader-${activeStory.slug}`}
          story={activeStory}
          onBack={() => navigate('library')}
        />
      ) : (
        <LibraryScreen
          key="library"
          stories={stories}
          onSelectStory={s => navigate(`reader/${s.slug}`)}
        />
      )}
    </AnimatePresence>
  )
}
```

## Related Code Files
- Modify: `web-app/src/App.tsx` (replace placeholder)
- Create: `web-app/src/hooks/use-hash-route.ts`
- Create: `web-app/src/hooks/use-stories-manifest.ts`
- Create: `web-app/src/components/shared/LoadingScreen.tsx`
- Create: `web-app/src/components/shared/ErrorScreen.tsx`

## Implementation Steps

1. **`use-hash-route.ts`** — implement as spec above.

2. **`use-stories-manifest.ts`** — implement as spec above.

3. **`LoadingScreen.tsx`** — full-screen cream bg + centered spinner + "Đang tải sách..." text (Baloo 2, muted color).

4. **`ErrorScreen.tsx`** — centered error card, retry button, Vietnamese error message "Không thể tải danh sách sách. Vui lòng thử lại."

5. **`App.tsx`** — implement routing logic as spec above.

6. **Verify deep-link**: navigate to `http://localhost:5173/#reader/canh-cua-trong-tu-sach` directly — should open reader without going through library first.

7. **Verify back navigation**: browser back button from reader should go back to library (hash change triggers hashchange event).

8. **Verify unknown slug**: `#reader/invalid-slug` — `activeStory` is undefined → falls back to library view.

## Success Criteria
- [ ] App shows `LoadingScreen` while fetching manifest
- [ ] After manifest loads, `LibraryScreen` renders with all 3 stories
- [ ] Clicking a card navigates to `#reader/<slug>` and shows `ReaderScreen`
- [ ] Back button navigates to `#library`
- [ ] Browser back/forward buttons work (hash-based, native history)
- [ ] Deep-link `#reader/canh-cua-trong-tu-sach` works on page load
- [ ] `document.title` updates per screen
- [ ] `AnimatePresence` plays library→reader slide-up, reader→library slide-down
- [ ] Unknown slug falls back to library silently
- [ ] Manifest fetch error shows `ErrorScreen` with retry

## Risk Assessment
- `AnimatePresence mode="wait"`: exit animation completes before enter starts — correct for screen transitions
- Hash routing vs browser back: `hashchange` event fires correctly when user presses back — tested pattern
- `stories.find` on unknown slug: returns `undefined`, handled by falling through to library view
