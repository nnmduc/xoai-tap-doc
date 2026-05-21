import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ensureLoaded } from '@/store/hearts-store'
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

interface Props {
  stories: StoryEntry[]
  onSelectStory: (story: StoryEntry) => void
  audioEnabled: boolean
  onToggleAudio: () => void
}

export function LibraryScreen({ stories, onSelectStory, audioEnabled, onToggleAudio }: Props) {
  const prefersReduced = useReducedMotion()
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>(null)

  useEffect(() => { ensureLoaded() }, [])

  const visibleStories =
    gradeFilter === null
      ? stories
      : stories.filter((s) => (s.readingLevel ?? 'Lớp 1') === gradeFilter)

  const sectionLabel =
    gradeFilter === null ? 'Tất cả sách' : `Khối ${gradeFilter}`

  return (
    <div className="flex flex-col min-h-dvh bg-brand-bg">
      <LibraryHeader
        storyCount={visibleStories.length}
        audioEnabled={audioEnabled}
        onToggleAudio={onToggleAudio}
      />

      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-8">
        {/* Grade filter chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {GRADE_FILTERS.map(({ label, value }) => {
            const active = gradeFilter === value
            return (
              <button
                key={value ?? 'all'}
                onClick={() => setGradeFilter(value)}
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
        </div>

        <p className="text-[13px] font-heading font-bold text-brand-muted uppercase tracking-wide mb-3 pl-0.5">
          {sectionLabel}
        </p>

        {visibleStories.length === 0 ? (
          <p className="text-center text-brand-muted font-body py-10">
            Chưa có sách cho {gradeFilter}
          </p>
        ) : (
          <motion.div
            key={gradeFilter ?? 'all'}
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
