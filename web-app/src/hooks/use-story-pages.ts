import { useState, useEffect } from 'react'
import type { BookPage } from '@/types/story'

interface StoryImageManifest {
  title: string
  story_slug: string
  cover: { output_path: string }
  scenes: Array<{ index: number; content: string; output_path: string }>
}

function toWebPath(p: string): string {
  return p.startsWith('assets/') ? '/' + p.slice(7) : '/' + p
}

export function useStoryPages(slug: string, hasAudio: boolean) {
  const [pages, setPages] = useState<BookPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    setPages([])
    setLoading(true)
    setError(false)

    fetch(`/generated-story-images/${slug}/story-image-manifest.json`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<StoryImageManifest>
      })
      .then((manifest) => {
        if (cancelled) return
        const built: BookPage[] = []

        built.push({
          kind: 'cover',
          image: toWebPath(manifest.cover.output_path),
          text: manifest.title,
          audio: hasAudio ? `/generated-story-audio/${slug}/page-00.mp3` : undefined,
        })

        manifest.scenes.forEach((scene, i) => {
          built.push({
            kind: 'story',
            image: toWebPath(scene.output_path),
            text: scene.content,
            audio: hasAudio
              ? `/generated-story-audio/${slug}/page-${String(i + 1).padStart(2, '0')}.mp3`
              : undefined,
          })
        })

        setPages(built)
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof Error && err.name === 'AbortError')) return
        setError(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [slug, hasAudio])

  return { pages, loading, error }
}
