import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ensureLoaded } from '@/store/hearts-store'
import { useAuth } from '@/context/auth-context'
import { normalizeVI } from '@/utils/normalize-vi-text'
import type { StoryEntry } from '@/types/story'
import { LibraryHeader } from './library-header'
import { BookCard } from './book-card'
import { SearchBar } from './search-bar'
import { AboutPopup } from './about-popup'

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const LEVEL_ORDER: Record<string, number> = {
  'Mầm non': 0,
  'Lớp 1': 1,
  'Lớp 2': 2,
  'Lớp 3': 3,
  'Lớp 4': 4,
  'Lớp 5': 5,
}

type ActiveFilter = string | null | 'favourites' | 'finished' | 'hidden'

type UserFilter = 'favourites' | 'finished' | 'hidden'

interface Props {
  stories: StoryEntry[]
  onSelectStory: (story: StoryEntry) => void
  audioEnabled: boolean
  onToggleAudio: () => void
}

export function LibraryScreen({ stories, onSelectStory, audioEnabled, onToggleAudio }: Props) {
  const prefersReduced = useReducedMotion()
  const { user, heartedSlugs, hiddenSlugs, pinnedSlugs, finishedSlugs } = useAuth()
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [aboutOpen, setAboutOpen] = useState(false)

  // Dynamically compute grade filters based on existing stories
  const gradeFilters = (() => {
    const levels = Array.from(
      new Set(stories.map((s) => s.readingLevel ?? 'Lớp 1'))
    ).sort((a, b) => {
      const oa = LEVEL_ORDER[a] ?? 999
      const ob = LEVEL_ORDER[b] ?? 999
      if (oa !== ob) return oa - ob
      return a.localeCompare(b, 'vi')
    })
    return [
      { label: 'Tất cả', value: null },
      ...levels.map((lvl) => ({ label: lvl, value: lvl })),
    ]
  })()

  useEffect(() => { ensureLoaded() }, [])

  // Reset user-only filters on sign-out
  useEffect(() => {
    if (!user && (activeFilter === 'favourites' || activeFilter === 'finished' || activeFilter === 'hidden')) {
      setActiveFilter(null)
    }
  }, [user, activeFilter])

  const visibleStories = (() => {
    let base = stories

    if (activeFilter === 'hidden') {
      // Hidden-only view: show hidden stories so user can unhide them
      base = base.filter((s) => hiddenSlugs.has(s.slug))
    } else {
      // All other views: exclude hidden stories
      base = base.filter((s) => !hiddenSlugs.has(s.slug))

      if (activeFilter === 'favourites') base = base.filter((s) => heartedSlugs.has(s.slug))
      else if (activeFilter === 'finished') base = base.filter((s) => finishedSlugs.has(s.slug))
      else if (activeFilter !== null) base = base.filter((s) => (s.readingLevel ?? 'Lớp 1') === activeFilter)

      // Pinned stories float to the top
      if (user && pinnedSlugs.size > 0) {
        base = [...base].sort((a, b) => {
          const ap = pinnedSlugs.has(a.slug) ? 0 : 1
          const bp = pinnedSlugs.has(b.slug) ? 0 : 1
          return ap - bp
        })
      }
    }

    if (!searchQuery.trim()) return base
    const q = normalizeVI(searchQuery)
    return base.filter(
      (s) =>
        normalizeVI(s.title).includes(q) ||
        (s.summary && normalizeVI(s.summary).includes(q)) ||
        s.themes.some((t) => normalizeVI(t).includes(q)),
    )
  })()

  const sectionLabel = (() => {
    if (activeFilter === 'favourites') return 'Yêu thích'
    if (activeFilter === 'finished') return 'Đã đọc xong'
    if (activeFilter === 'hidden') return 'Truyện đã ẩn'
    if (activeFilter === null) return 'Tất cả sách'
    return `Khối ${activeFilter}`
  })()

  const emptyMessage = (() => {
    if (searchQuery.trim()) return `Không tìm thấy truyện nào cho "${searchQuery}"`
    if (activeFilter === 'favourites') return 'Chưa có sách yêu thích. Hãy bấm ❤️ để thêm!'
    if (activeFilter === 'finished') return 'Chưa có sách nào được đánh dấu xong.'
    if (activeFilter === 'hidden') return 'Chưa có sách nào bị ẩn.'
    return `Chưa có sách cho ${activeFilter}`
  })()

  return (
    <div className="flex flex-col min-h-dvh bg-brand-bg">
      <LibraryHeader
        storyCount={visibleStories.length}
        audioEnabled={audioEnabled}
        onToggleAudio={onToggleAudio}
        activeFilter={activeFilter}
        onSelectUserFilter={(f: UserFilter) => setActiveFilter((prev) => prev === f ? null : f)}
      />

      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-8">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Filter chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {gradeFilters.map(({ label, value }) => {
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
        </div>

        <p className="text-[13px] font-heading font-bold text-brand-muted uppercase tracking-wide mb-3 pl-0.5">
          {sectionLabel}
        </p>

        {visibleStories.length === 0 ? (
          <p className="text-center text-brand-muted font-body py-10">{emptyMessage}</p>
        ) : (
          <motion.div
            key={`${activeFilter ?? 'all'}-${searchQuery}`}
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
          <button
            onClick={() => setAboutOpen(true)}
            className="font-semibold text-brand-primary underline decoration-2 underline-offset-2 hover:brightness-110 transition-all"
          >
            Father
          </button>{' '}
          for Xoài with Love ❤️
        </p>
      </div>

      <AboutPopup open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
