import { useEffect, useRef, useState } from 'react'
import type { BookPage } from '@/types/story'
import { HeartButton } from '@/components/shared/heart-button'

const PAPER = '#fff8ed'
const INK = '#3e2208'

function phraseStyle(text: string, isCover: boolean, fontScale: number): React.CSSProperties {
  if (isCover) {
    return {
      fontSize: `calc(clamp(26px, 5.2vmin, 60px) * ${fontScale})`,
      lineHeight: 1.2,
      textAlign: 'center',
      textShadow: '0 2px 16px rgba(0,0,0,.65), 0 1px 3px rgba(0,0,0,.90)',
      color: PAPER,
      background: 'transparent',
    }
  }
  const len = text.length
  if (len > 120) {
    return {
      fontSize: `calc(clamp(17px, 2.7vmin, 28px) * ${fontScale})`,
      lineHeight: 1.52,
      textAlign: 'left',
      color: INK,
      background: PAPER,
    }
  }
  if (len > 70) {
    return {
      fontSize: `calc(clamp(19px, 3.2vmin, 34px) * ${fontScale})`,
      lineHeight: 1.46,
      textAlign: 'center',
      color: INK,
      background: PAPER,
    }
  }
  return {
    fontSize: `calc(clamp(22px, 3.8vmin, 40px) * ${fontScale})`,
    lineHeight: 1.42,
    textAlign: 'center',
    color: INK,
    background: PAPER,
  }
}

interface Props {
  page: BookPage
  isActive: boolean
  translateX: number
  fontScale: number
  audioEnabled: boolean
  slug: string
}

export function NativeBookPage({ page, isActive, translateX, fontScale, audioEnabled, slug }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const isCover = page.kind === 'cover'

  useEffect(() => {
    if (!audioRef.current) return
    if (!isActive || !audioEnabled) {
      audioRef.current.pause()
      setPlaying(false)
    }
    // Pause on unmount (page leaves the ±1 render window)
    return () => { audioRef.current?.pause() }
  }, [isActive, audioEnabled])

  const toggleAudio = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    // Prevent the synthetic click that follows touchend on mobile
    if ('touches' in e || e.type === 'touchend') e.preventDefault()
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play().catch(() => {})
      setPlaying(true)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: isCover ? '#09071e' : PAPER,
        transform: `translateX(${translateX}%)`,
        transition: 'transform 0.35s ease',
        willChange: 'transform',
        pointerEvents: isActive ? 'auto' : 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Picture */}
      <div
        style={{
          flex: isCover ? 'none' : 1,
          minHeight: 0,
          position: isCover ? 'absolute' : 'relative',
          ...(isCover ? { inset: 0 } : {}),
          overflow: 'hidden',
          background: isCover ? '#09071e' : PAPER,
        }}
      >
        <img
          src={page.image}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            objectPosition: 'center',
            pointerEvents: 'none',
          }}
        />
        {/* Fade gradient blending image into text */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: isCover ? '58%' : 96,
            background: isCover
              ? 'linear-gradient(to bottom, transparent 0%, rgba(6,4,20,.12) 22%, rgba(6,4,20,.60) 58%, rgba(6,4,20,.92) 100%)'
              : `linear-gradient(to bottom, transparent 0%, rgba(255,248,237,.65) 52%, ${PAPER} 100%)`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Phrase */}
      <div
        style={{
          ...(isCover ? { position: 'absolute', bottom: 0, left: 0, right: 0 } : {}),
          padding: isCover
            ? `clamp(12px, 2vmin, 20px) clamp(16px, 3.8vmin, 38px) calc(env(safe-area-inset-bottom, 0px) + 80px)`
            : `2px clamp(16px, 3.8vmin, 38px) calc(env(safe-area-inset-bottom, 0px) + 80px)`,
          fontFamily: '"Baloo 2", ui-rounded, system-ui, sans-serif',
          fontWeight: 800,
          overflowWrap: 'anywhere',
          letterSpacing: '-0.01em',
          ...phraseStyle(page.text, isCover, fontScale),
        }}
      >
        {page.text}
      </div>

      {/* Heart button — bottom-left */}
      <div
        style={{ position: 'absolute', bottom: 18, left: 16, zIndex: 10 }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <HeartButton slug={slug} size="md" variant="dark" />
      </div>

      {/* Audio play button — bottom-right */}
      {page.audio && audioEnabled && (
        <>
          <button
            onClick={toggleAudio}
            onTouchEnd={toggleAudio}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label={playing ? 'Dừng đọc' : 'Nghe đọc'}
            aria-pressed={playing}
            style={{
              position: 'absolute',
              bottom: 18,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.35)',
              background: playing ? 'rgba(74,144,217,0.85)' : 'rgba(0,0,0,0.50)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'background 0.2s ease',
              outline: 'none',
            }}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
          <audio ref={audioRef} src={page.audio} onEnded={() => setPlaying(false)} />
        </>
      )}
    </div>
  )
}
