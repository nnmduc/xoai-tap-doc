import { useCallback, useEffect, useRef, useState } from 'react'
import type { StoryEntry } from '@/types/story'
import { useStoryPages } from '@/hooks/use-story-pages'
import { NativeBookPage } from './native-book-page'
import { ReaderFallback } from './reader-fallback'

const STAGE_BG = [
  'radial-gradient(1.5px 1.5px at 8% 12%, rgba(255,255,255,.9), transparent)',
  'radial-gradient(1px 1px at 23% 6%, rgba(255,255,255,.7), transparent)',
  'radial-gradient(2px 2px at 38% 19%, rgba(255,255,210,.8), transparent)',
  'radial-gradient(1px 1px at 55% 8%, rgba(255,255,255,.6), transparent)',
  'radial-gradient(1.5px 1.5px at 72% 14%, rgba(255,255,255,.85), transparent)',
  'radial-gradient(1px 1px at 88% 7%, rgba(210,190,255,.7), transparent)',
  'radial-gradient(1px 1px at 14% 44%, rgba(255,255,255,.5), transparent)',
  'radial-gradient(2px 2px at 31% 68%, rgba(255,255,210,.55), transparent)',
  'radial-gradient(1px 1px at 49% 81%, rgba(255,255,255,.45), transparent)',
  'radial-gradient(1.5px 1.5px at 67% 75%, rgba(190,255,255,.6), transparent)',
  'radial-gradient(1px 1px at 83% 57%, rgba(255,255,255,.38), transparent)',
  'linear-gradient(155deg, #0b0620 0%, #180b3d 38%, #0e1a48 65%, #080f20 100%)',
].join(', ')

function LoadingSpinner() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4"
         style={{ background: STAGE_BG }}>
      <style>{`@keyframes nbr-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '4px solid rgba(255,255,255,.15)',
        borderTopColor: 'rgba(255,255,255,.8)',
        animation: 'nbr-spin 0.8s linear infinite',
      }} />
      <p style={{ fontFamily: '"Baloo 2", sans-serif', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,.65)' }}>
        Đang mở sách...
      </p>
    </div>
  )
}

interface Props {
  story: StoryEntry
  fontScale: number
  audioEnabled: boolean
  onReachLastPage?: () => void
  onBack: () => void
}

export function NativeBookReader({ story, fontScale, audioEnabled, onReachLastPage, onBack }: Props) {
  const { pages, loading, error } = useStoryPages(story.slug, story.hasAudio ?? false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hudVisible, setHudVisible] = useState(true)
  const [isLandscape, setIsLandscape] = useState(
    () => window.matchMedia('(orientation: landscape)').matches
  )

  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const mouseStartRef = useRef<{ x: number; y: number } | null>(null)
  const reachedLastRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentPage(0)
    reachedLastRef.current = false
  }, [story.slug])

  const showHud = useCallback(() => {
    setHudVisible(true)
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current)
    hudTimerRef.current = setTimeout(() => setHudVisible(false), 3000)
  }, [])

  useEffect(() => {
    showHud()
    return () => { if (hudTimerRef.current) clearTimeout(hudTimerRef.current) }
  }, [showHud])

  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)')
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Fire finished callback when last page is reached
  useEffect(() => {
    if (pages.length > 0 && currentPage === pages.length - 1 && !reachedLastRef.current) {
      reachedLastRef.current = true
      onReachLastPage?.()
    }
  }, [currentPage, pages.length, onReachLastPage])

  const goNext = useCallback(() => {
    setCurrentPage((prev) => (prev < pages.length - 1 ? prev + 1 : prev))
    showHud()
  }, [pages.length, showHud])

  const goPrev = useCallback(() => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev))
    showHud()
  }, [showHud])

  const handleTap = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const relX = (clientX - rect.left) / rect.width
    if (relX < 0.33) goPrev()
    else if (relX > 0.67) goNext()
    else showHud()
  }, [goNext, goPrev, showHud])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 0.8) {
      dx < 0 ? goNext() : goPrev()
    } else if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      handleTap(e.changedTouches[0].clientX)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    mouseStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseStartRef.current) return
    const dx = e.clientX - mouseStartRef.current.x
    const dy = e.clientY - mouseStartRef.current.y
    mouseStartRef.current = null
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 0.8) {
      dx < 0 ? goNext() : goPrev()
    } else if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      handleTap(e.clientX)
    }
  }

  if (error) return <ReaderFallback story={story} reason="not-ready" onBack={onBack} />
  if (loading || pages.length === 0) return <LoadingSpinner />

  const prevDisabled = currentPage === 0
  const nextDisabled = currentPage === pages.length - 1

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: isLandscape ? 'stretch' : 'center',
        justifyContent: 'center',
        background: STAGE_BG,
        touchAction: 'none',
        cursor: 'default',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Book */}
      <div
        style={{
          position: 'relative',
          width: isLandscape ? '100%' : 'min(92vw, 800px)',
          height: isLandscape ? '100%' : 'min(calc(100% - 16px), 1040px)',
          overflow: 'hidden',
        }}
      >
        {pages.map((page, i) => {
          if (Math.abs(i - currentPage) > 1) return null
          return (
            <NativeBookPage
              key={i}
              page={page}
              isActive={i === currentPage}
              translateX={(i - currentPage) * 100}
              fontScale={fontScale}
              audioEnabled={audioEnabled}
              slug={story.slug}
            />
          )
        })}
      </div>

      {/* Bottom HUD */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          zIndex: 100,
          opacity: hudVisible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: hudVisible ? 'auto' : 'none',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          disabled={prevDisabled}
          aria-label="Trang trước"
          style={{
            width: 46, height: 46, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,.25)',
            background: 'rgba(0,0,0,0.60)',
            color: 'rgba(255,255,255,.92)',
            fontSize: 22,
            cursor: prevDisabled ? 'default' : 'pointer',
            display: 'grid', placeItems: 'center',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            opacity: prevDisabled ? 0.3 : 1,
            transition: 'opacity 0.2s ease',
            outline: 'none',
          }}
        >
          ‹
        </button>

        <div
          style={{
            fontFamily: '"Baloo 2", ui-rounded, sans-serif',
            fontWeight: 700,
            color: 'rgba(255,255,255,.92)',
            fontSize: 12,
            letterSpacing: '0.12em',
            background: 'rgba(0,0,0,0.60)',
            padding: '10px 18px',
            borderRadius: 999,
            border: '2px solid rgba(255,255,255,.25)',
            minWidth: 110,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            whiteSpace: 'nowrap',
          }}
        >
          {currentPage + 1} / {pages.length}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          disabled={nextDisabled}
          aria-label="Trang sau"
          style={{
            width: 46, height: 46, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,.25)',
            background: 'rgba(0,0,0,0.60)',
            color: 'rgba(255,255,255,.92)',
            fontSize: 22,
            cursor: nextDisabled ? 'default' : 'pointer',
            display: 'grid', placeItems: 'center',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            opacity: nextDisabled ? 0.3 : 1,
            transition: 'opacity 0.2s ease',
            outline: 'none',
          }}
        >
          ›
        </button>
      </div>
    </div>
  )
}
