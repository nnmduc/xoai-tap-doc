import { motion, useReducedMotion } from 'framer-motion'
import type { StoryEntry } from '@/types/story'
import { LibraryHeader } from './library-header'
import { BookCard } from './book-card'

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

interface Props {
  stories: StoryEntry[]
  onSelectStory: (story: StoryEntry) => void
}

export function LibraryScreen({ stories, onSelectStory }: Props) {
  const prefersReduced = useReducedMotion()

  return (
    <div className="flex flex-col min-h-dvh bg-brand-bg">
      <LibraryHeader storyCount={stories.length} />

      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-8">
        <p className="text-[13px] font-heading font-bold text-brand-muted uppercase tracking-wide mb-3 pl-0.5">
          Tất cả sách
        </p>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={prefersReduced ? undefined : containerVariants}
          initial={prefersReduced ? false : 'hidden'}
          animate="show"
        >
          {stories.map((story) => (
            <BookCard
              key={story.slug}
              story={story}
              onClick={() => onSelectStory(story)}
            />
          ))}
        </motion.div>
      </main>

      {/* Footer dots */}
      <div className="flex justify-center items-center gap-2 py-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i < stories.length ? 'bg-brand-primary/40' : 'bg-brand-border'}`}
          />
        ))}
      </div>
    </div>
  )
}
