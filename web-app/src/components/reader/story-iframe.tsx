import { useCallback, useEffect, useRef, useState } from 'react'
import type { StoryEntry } from '@/types/story'
import { ReaderFallback } from './reader-fallback'

function IframeLoadingSpinner() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white rounded-[10px]">
      <div className="w-11 h-11 border-4 border-brand-border border-t-brand-primary rounded-full animate-spin" />
      <p className="font-heading text-sm font-semibold text-brand-muted">
        Đang mở sách...
      </p>
    </div>
  )
}

// Builds a CSS string that scales all .phrase variants proportionally.
// The original clamp values come from the shared story-book-template.html.
function buildFontScaleCSS(scale: number): string {
  if (scale === 1) return ''
  const s = scale
  return `
    .phrase { font-size: calc(clamp(22px, 3.8vmin, 40px) * ${s}) !important; }
    .page.has-long-text .phrase { font-size: calc(clamp(19px, 3.2vmin, 34px) * ${s}) !important; }
    .page.has-extra-long-text .phrase { font-size: calc(clamp(17px, 2.7vmin, 28px) * ${s}) !important; }
    .page.is-cover .phrase { font-size: calc(clamp(26px, 5.2vmin, 60px) * ${s}) !important; }
  `
}

interface Props {
  story: StoryEntry
  onBack: () => void
  fontScale: number
}

export function StoryIframe({ story, onBack, fontScale }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyFontScale = useCallback((scale: number) => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return

    let styleEl = doc.getElementById('font-scale-override') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = doc.createElement('style')
      styleEl.id = 'font-scale-override'
      doc.head?.appendChild(styleEl)
    }
    styleEl.textContent = buildFontScaleCSS(scale)
  }, [])

  useEffect(() => {
    setLoaded(false)
    setTimedOut(false)

    if (!story.hasHtmlBook) return

    timeoutRef.current = setTimeout(() => setTimedOut(true), 8000)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [story.slug, story.hasHtmlBook])

  // Apply scale whenever it changes (iframe must already be loaded)
  useEffect(() => {
    if (loaded) applyFontScale(fontScale)
  }, [fontScale, loaded, applyFontScale])

  const handleLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setLoaded(true)
    applyFontScale(fontScale)
  }

  if (!story.hasHtmlBook || timedOut) {
    return (
      <ReaderFallback
        story={story}
        reason={timedOut ? 'timeout' : 'not-ready'}
        onBack={onBack}
      />
    )
  }

  const src = `/generated-story-books/${story.slug}/index.html`

  return (
    <div className="relative w-full h-full">
      {!loaded && <IframeLoadingSpinner />}
      <iframe
        ref={iframeRef}
        src={src}
        title={story.title}
        className="w-full h-full border-none block rounded-[10px]"
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleLoad}
      />
    </div>
  )
}
