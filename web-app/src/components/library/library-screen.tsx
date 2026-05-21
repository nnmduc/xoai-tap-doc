import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ensureLoaded } from '@/store/hearts-store'
import { useAuth } from '@/context/auth-context'
import type { StoryEntry } from '@/types/story'
import { LibraryHeader } from './library-header'
import { BookCard } from './book-card'

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const GRADE_FILTERS = [
  { label: 'Tất cả', value: null },
  { label: 'Mầm non', value: 'Mầm non' },
  { label: 'Lớp 1', value: 'Lớp 1' },
  { label: 'Lớp 2', value: 'Lớp 2' },
] as const

type GradeFilter = (typeof GRADE_FILTERS)[number]['value']
type ActiveFilter = GradeFilter | 'favourites'

interface Props {
  stories: StoryEntry[]
  onSelectStory: (story: StoryEntry) => void
  audioEnabled: boolean
  onToggleAudio: () => void
}

export function LibraryScreen({ stories, onSelectStory, audioEnabled, onToggleAudio }: Props) {
  const prefersReduced = useReducedMotion()
  const { user, heartedSlugs } = useAuth()
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null)

  useEffect(() => { ensureLoaded() }, [])

  // Reset favourites filter if user signs out
  useEffect(() => {
    if (!user && activeFilter === 'favourites') setActiveFilter(null)
  }, [user, activeFilter])

  const visibleStories = (() => {
    if (activeFilter === 'favourites') return stories.filter((s) => heartedSlugs.has(s.slug))
    if (activeFilter === null) return stories
    return stories.filter((s) => (s.readingLevel ?? 'Lớp 1') === activeFilter)
  })()

  const sectionLabel = (() => {
    if (activeFilter === 'favourites') return 'Yêu thích'
    if (activeFilter === null) return 'Tất cả sách'
    return `Khối ${activeFilter}`
  })()

  return (
    <div className="flex flex-col min-h-dvh bg-brand-bg">
      <LibraryHeader
        storyCount={visibleStories.length}
        audioEnabled={audioEnabled}
        onToggleAudio={onToggleAudio}
      />

      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-8">
        {/* Filter chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {GRADE_FILTERS.map(({ label, value }) => {
            const active = activeFilter === value
            return (
              <button
                key={value ?? 'all'}
                onClick={() => setActiveFilter(value)}
                className={`px-3 py-1.5 rounded-chip font-heading text-xs font-bold border-2 transition-colors ${
                  active
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white text-brand-body border-brand-border hover:border-brand-primary/50'
                }`}
              >
                {label}
              </button>
            )
          })}
          {user && (
            <button
              onClick={() => setActiveFilter(activeFilter === 'favourites' ? null : 'favourites')}
              className={`px-3 py-1.5 rounded-chip font-heading text-xs font-bold border-2 transition-colors ${
                activeFilter === 'favourites'
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-brand-body border-brand-border hover:border-pink-300'
              }`}
            >
              ❤️ Yêu thích
            </button>
          )}
        </div>

        <p className="text-[13px] font-heading font-bold text-brand-muted uppercase tracking-wide mb-3 pl-0.5">
          {sectionLabel}
        </p>

        {visibleStories.length === 0 ? (
          <p className="text-center text-brand-muted font-body py-10">
            {activeFilter === 'favourites'
              ? 'Chưa có sách yêu thích. Hãy bấm ❤️ để thêm!'
              : `Chưa có sách cho ${activeFilter}`}
          </p>
        ) : (
          <motion.div
            key={activeFilter ?? 'all'}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={prefersReduced ? undefined : containerVariants}
            initial={prefersReduced ? false : 'hidden'}
            animate="show"
          >
            {visibleStories.map((story) => (
              <BookCard
                key={story.slug}
                story={story}
                onClick={() => onSelectStory(story)}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="flex justify-center items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < visibleStories.length ? 'bg-brand-primary/40' : 'bg-brand-border'}`}
            />
          ))}
        </div>
        <p className="text-[11px] text-brand-muted font-body text-center">
          By{' '}
          <a
            href="https://www.facebook.com/socthaovat"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand-primary transition-colors"
          >
            Father
          </a>{' '}
          for Xoài with Love ❤️
        </p>
      </div>
    </div>
  )
}
