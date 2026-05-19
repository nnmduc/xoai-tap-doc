---
phase: 5
title: "Reader Screen"
status: pending
priority: P1
effort: "45m"
dependencies: [3]
---

# Phase 5: Reader Screen

## Overview
Build the `ReaderScreen` component: top bar with back button + title, CSS wooden frame border, iframe loading the existing swipe-only HTML book, loading spinner, and fallback for books without rendered HTML. Reference wireframe: `docs/wireframe/reader-screen.html`.

## Requirements
- Functional: Loads HTML book in iframe; shows spinner while loading; shows fallback if `hasHtmlBook: false` or timeout; back button returns to library
- Non-functional: Slide-up entrance animation; wooden frame CSS (no images); iframe `sandbox` attr; `lang="vi"` title updates

## Architecture
```
src/components/reader/
├── ReaderScreen.tsx        ← screen with slide-up animation + layout
├── ReaderTopBar.tsx        ← back button + title bar
├── WoodenFrame.tsx         ← CSS wooden border wrapper
├── StoryIframe.tsx         ← iframe + loading overlay + fallback
└── ReaderFallback.tsx      ← "book not ready" message + back button
```

### Props
```ts
interface ReaderScreenProps {
  story: StoryEntry
  onBack: () => void
}
```

### Wooden Frame CSS Strategy
Pure CSS — no images. Layers:
1. Outer div: `bg-[#8B5E3C]` + `shadow-wood-frame` (from design system)
2. `::before` pseudo: `repeating-linear-gradient` for grain lines + bevel highlights
3. Inner div: `bg-white` with `rounded-[10px] overflow-hidden` — the actual mat
4. Corner ornaments: inline SVG circles

### Slide-up Animation (Framer Motion)
```ts
const screenVariants = {
  hidden: { y: '100%', opacity: 0 },
  show:   { y: 0,      opacity: 1,
            transition: { type: 'spring', stiffness: 280, damping: 30 } },
  exit:   { y: '100%', opacity: 0,
            transition: { duration: 0.35, ease: 'easeIn' } }
}
```
Wrap in `AnimatePresence` in App.tsx.

## Related Code Files
- Create: `web-app/src/components/reader/ReaderScreen.tsx`
- Create: `web-app/src/components/reader/ReaderTopBar.tsx`
- Create: `web-app/src/components/reader/WoodenFrame.tsx`
- Create: `web-app/src/components/reader/StoryIframe.tsx`
- Create: `web-app/src/components/reader/ReaderFallback.tsx`

## Implementation Steps

1. **`ReaderTopBar.tsx`**:
   - Height: `h-[60px]`, `bg-white border-b-2 border-brand-border`
   - Back button: 44×44px, `bg-brand-bg border-[2.5px] border-brand-border rounded-[13px]`
     `shadow-clay-btn`, hover: `border-brand-primary bg-blue-50`
   - Title section: `font-heading font-bold text-[16px]` with label "Thư Viện Sách" above
   - Back button `aria-label="Quay lại thư viện"`

2. **`WoodenFrame.tsx`** — CSS wooden border with inline `CornerOrnament`:
   ```tsx
   type CornerPos = 'tl' | 'tr' | 'bl' | 'br'
   const CORNER_STYLES: Record<CornerPos, string> = {
     tl: 'top-[5px] left-[5px]',
     tr: 'top-[5px] right-[5px] scale-x-[-1]',
     bl: 'bottom-[5px] left-[5px] scale-y-[-1]',
     br: 'bottom-[5px] right-[5px] scale-[-1]',
   }
   function CornerOrnament({ position }: { position: CornerPos }) {
     return (
       <div className={`absolute z-[5] pointer-events-none ${CORNER_STYLES[position]}`}>
         <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
           <circle cx="4" cy="4" r="3" fill="rgba(255,255,255,.55)"
                   stroke="rgba(255,255,255,.35)" strokeWidth="1"/>
           <line x1="7" y1="4" x2="18" y2="4"
                 stroke="rgba(255,255,255,.30)" strokeWidth="1.5" strokeLinecap="round"/>
           <line x1="4" y1="7" x2="4" y2="18"
                 stroke="rgba(255,255,255,.30)" strokeWidth="1.5" strokeLinecap="round"/>
         </svg>
       </div>
     )
   }

   export function WoodenFrame({ children }: { children: React.ReactNode }) {
     return (
       <div className="flex-1 min-h-0 p-[14px] bg-brand-bg">
         {/* touch-action: none on outer container prevents iOS Safari from hijacking swipe */}
         <div
           className="relative w-full h-full rounded-frame shadow-wood-frame overflow-hidden"
           style={{ background: '#8B5E3C', touchAction: 'none' }}
         >
           {/* Grain overlay */}
           <div
             className="absolute inset-0 z-[1] pointer-events-none rounded-frame"
             style={{
               background: `
                 repeating-linear-gradient(180deg,transparent 0px,transparent 6px,
                   rgba(101,62,30,.12) 6px,rgba(101,62,30,.12) 7px),
                 linear-gradient(180deg,rgba(255,255,255,.18) 0%,transparent 14px),
                 linear-gradient(0deg,rgba(0,0,0,.18) 0%,transparent 14px)
               `
             }}
           />
           {/* Inner white mat */}
           <div className="absolute inset-[10px] z-[3] bg-white rounded-[10px] overflow-hidden
                           shadow-[inset_0_0_12px_rgba(139,94,60,.15)]">
             {children}
           </div>
           {(['tl','tr','bl','br'] as CornerPos[]).map(pos => (
             <CornerOrnament key={pos} position={pos} />
           ))}
         </div>
       </div>
     )
   }
   ```

3. **`StoryIframe.tsx`** — iframe + loading + fallback:

   > **Race condition fix**: clear the timeout ref inside `onLoad` so a late-firing load
   > event doesn't show the fallback after a successful load.

   ```tsx
   export function StoryIframe({ story }: { story: StoryEntry }) {
     const [loaded, setLoaded] = useState(false)
     const [timedOut, setTimedOut] = useState(false)
     const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

     useEffect(() => {
       if (!story.hasHtmlBook) return
       timeoutRef.current = setTimeout(() => setTimedOut(true), 8000)
       return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
     }, [story.slug, story.hasHtmlBook])

     const handleLoad = () => {
       if (timeoutRef.current) clearTimeout(timeoutRef.current)
       setLoaded(true)
     }

     if (!story.hasHtmlBook || timedOut) {
       return <ReaderFallback story={story} reason={timedOut ? 'timeout' : 'not-ready'} />
     }
     const src = `/generated-story-books/${story.slug}/index.html`
     return (
       <div className="relative w-full h-full">
         {!loaded && <IframeLoadingSpinner />}
         <iframe
           src={src}
           title={story.title}
           className="w-full h-full border-none block rounded-[10px]"
           sandbox="allow-scripts allow-same-origin"
           onLoad={handleLoad}
         />
       </div>
     )
   }
   ```

4. **`ReaderFallback.tsx`** — friendly error card (see wireframe for design).

5. **`ReaderScreen.tsx`** — compose all parts:
   ```tsx
   export function ReaderScreen({ story, onBack }: ReaderScreenProps) {
     return (
       <motion.div
         className="fixed inset-0 z-50 flex flex-col bg-brand-bg"
         variants={screenVariants}
         initial="hidden" animate="show" exit="exit"
       >
         <ReaderTopBar title={story.title} onBack={onBack} />
         <WoodenFrame>
           <StoryIframe story={story} />
         </WoodenFrame>
       </motion.div>
     )
   }
   ```

## Success Criteria
- [ ] Slide-up animation on open; slide-down on back
- [ ] Wooden frame renders with grain texture (no images used)
- [ ] iframe loads `canh-cua-trong-tu-sach` HTML book; swipe-pages work inside iframe
- [ ] Loading spinner shows while iframe loads, hides on `onLoad`
- [ ] `ban-do-trong-san-truong` shows fallback ("Sách chưa sẵn sàng")
- [ ] Back button returns to library with `onBack()`
- [ ] `aria-label` on back button reads "Quay lại thư viện"
- [ ] No layout shift during loading → loaded transition

## Risk Assessment
- iframe `file://` in dev: must be served by Vite (localhost) — verified by researcher. Works correctly.
- iOS Safari iframe: `allow-same-origin` + `allow-scripts` sandbox is sufficient for swipe events inside iframe
- Wooden frame `position: absolute inset-[10px]`: Tailwind's `inset-[10px]` uses arbitrary value — confirm version supports it (Tailwind v3 ✅)
