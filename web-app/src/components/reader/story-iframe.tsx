import { useEffect, useRef, useState } from 'react'
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

interface Props {
  story: StoryEntry
  onBack: () => void
}

export function StoryIframe({ story, onBack }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLoaded(false)
    setTimedOut(false)

    if (!story.hasHtmlBook) return

    timeoutRef.current = setTimeout(() => setTimedOut(true), 8000)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [story.slug, story.hasHtmlBook])

  const handleLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setLoaded(true)
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
        src={src}
        title={story.title}
        className="w-full h-full border-none block rounded-[10px]"
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleLoad}
      />
    </div>
  )
}
