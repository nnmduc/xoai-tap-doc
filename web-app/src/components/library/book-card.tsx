import { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { StoryEntry } from '@/types/story'
import { BookCoverImage } from '@/components/shared/book-cover-image'
import { HeartButton } from '@/components/shared/heart-button'
import { useAuth } from '@/context/auth-context'

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

interface MenuItemProps {
  icon: string
  title: string
  desc: string
  onClick: () => void
  danger?: boolean
}

function MenuItem({ icon, title, desc, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-brand-bg ${danger ? 'hover:bg-red-50' : ''}`}
    >
      <span className="text-base leading-none mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className={`font-heading font-bold text-[13px] leading-tight ${danger ? 'text-red-600' : 'text-brand-text'}`}>
          {title}
        </p>
        <p className="font-body text-[11px] text-brand-muted leading-tight mt-0.5">{desc}</p>
      </div>
    </button>
  )
}

interface Props {
  story: StoryEntry
  onClick: () => void
}

export function BookCard({ story, onClick }: Props) {
  const prefersReduced = useReducedMotion()
  const { user, pinnedSlugs, finishedSlugs, hiddenSlugs, togglePinned, toggleHidden } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isPinned = user != null && pinnedSlugs.has(story.slug)
  const isFinished = user != null && finishedSlugs.has(story.slug)
  const isHidden = user != null && hiddenSlugs.has(story.slug)

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

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
      style={{ zIndex: menuOpen ? 10 : undefined }}
      className="relative bg-white rounded-card border-[3px] border-brand-border shadow-clay
                 cursor-pointer flex flex-col select-none outline-none
                 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      {/* Cover — overflow-hidden here clips the image to rounded top corners */}
      <div className="relative aspect-[3/4] overflow-hidden bg-blue-50 rounded-t-[17px]">
        <BookCoverImage
          src={story.coverPath}
          alt={`Bìa sách: ${story.title}`}
          className="w-full h-full object-cover"
        />

        {/* Status badges — top-left stack */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isPinned && (
            <span className="bg-blue-500/90 text-white text-[10px] font-heading font-bold px-1.5 py-0.5 rounded-full border-2 border-white/50 leading-none">
              📌
            </span>
          )}
          {isFinished && (
            <span className="bg-green-500/90 text-white text-[10px] font-heading font-bold px-1.5 py-0.5 rounded-full border-2 border-white/50 leading-none">
              ✓
            </span>
          )}
        </div>

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

      {/* Three-dot menu — absolute on outer card, overlays top-right of cover */}
      {user && (
        <div
          ref={menuRef}
          className="absolute top-2 right-2 z-20"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Tùy chọn"
            className="w-7 h-7 flex items-center justify-center
                       bg-black/30 backdrop-blur-sm text-white rounded-full
                       text-[18px] font-bold leading-none
                       hover:bg-black/50 active:bg-black/60 transition-colors"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 w-48 bg-white rounded-2xl border-2 border-brand-border shadow-clay overflow-hidden">
              <MenuItem
                icon={isPinned ? '📌' : '📌'}
                title={isPinned ? 'Bỏ ghim' : 'Ghim truyện'}
                desc={isPinned ? 'Xóa khỏi đầu danh sách' : 'Luôn hiển thị trên đầu'}
                onClick={() => { togglePinned(story.slug); setMenuOpen(false) }}
              />
              <div className="mx-3 h-px bg-brand-border/60" />
              <MenuItem
                icon={isHidden ? '👁' : '🙈'}
                title={isHidden ? 'Hiện lại truyện' : 'Ẩn truyện'}
                desc={isHidden ? 'Đưa truyện về thư viện' : 'Không hiển thị trong thư viện'}
                onClick={() => { toggleHidden(story.slug); setMenuOpen(false) }}
                danger={!isHidden}
              />
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
