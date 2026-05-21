import { motion, useReducedMotion } from 'framer-motion'
import type { StoryEntry } from '@/types/story'
import { BookCoverImage } from '@/components/shared/book-cover-image'
import { HeartButton } from '@/components/shared/heart-button'

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

interface Props {
  story: StoryEntry
  onClick: () => void
}

export function BookCard({ story, onClick }: Props) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      variants={prefersReduced ? undefined : cardVariants}
      whileHover={prefersReduced ? undefined : { y: -6, scale: 1.03 }}
      whileTap={prefersReduced ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`Đọc truyện ${story.title}`}
      className="bg-white rounded-card border-[3px] border-brand-border shadow-clay
                 cursor-pointer overflow-hidden flex flex-col select-none outline-none
                 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-blue-50">
        <BookCoverImage
          src={story.coverPath}
          alt={`Bìa sách: ${story.title}`}
          className="w-full h-full object-cover"
        />
        {!story.hasHtmlBook && (
          <span className="absolute top-2 right-2 bg-brand-accent/90 text-white text-[10px] font-heading font-bold px-2 py-0.5 rounded-full border-2 border-white/50">
            Sắp có
          </span>
        )}
        {story.hasAudio && (
          <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[11px] px-1.5 py-0.5 rounded-full border border-white/20 leading-none select-none">
            🔊
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pb-3 pt-2 border-t-2 border-brand-border">
        <p className="font-heading font-bold text-[15px] text-brand-text leading-snug line-clamp-2 mb-1.5">
          {story.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full px-2 py-0.5 font-body text-[11px] font-bold text-brand-primary-dark">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {story.readingLevel ?? 'Lớp 1'}
          </span>
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <HeartButton slug={story.slug} size="sm" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
