import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { StoryEntry } from '@/types/story'
import { ReaderTopBar } from './reader-top-bar'
import { NativeBookReader } from './native-book-reader'
import { useAuth } from '@/context/auth-context'

const FONT_SCALE_MIN = 0.8
const FONT_SCALE_MAX = 1.4
const FONT_SCALE_STEP = 0.1

const screenVariants = {
  hidden: { y: '100%', opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 30 },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.35, ease: 'easeIn' as const },
  },
}

interface Props {
  story: StoryEntry
  onBack: () => void
  audioEnabled: boolean
  onToggleAudio: () => void
}

export function ReaderScreen({ story, onBack, audioEnabled, onToggleAudio }: Props) {
  const [fontScale, setFontScale] = useState(1.0)
  const { finishedSlugs, toggleFinished } = useAuth()

  const handleDecrease = () =>
    setFontScale((s) => Math.max(FONT_SCALE_MIN, +(s - FONT_SCALE_STEP).toFixed(1)))

  const handleIncrease = () =>
    setFontScale((s) => Math.min(FONT_SCALE_MAX, +(s + FONT_SCALE_STEP).toFixed(1)))

  // Mark as finished on first reach of last page; no-op if already finished.
  // finishedSlugs guard is necessary — toggleFinished is a toggle (removes if present).
  const handleReachLastPage = useCallback(() => {
    if (!finishedSlugs.has(story.slug)) {
      toggleFinished(story.slug)
    }
  }, [story.slug, finishedSlugs, toggleFinished])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-[#09071e]"
      variants={screenVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <ReaderTopBar
        title={story.title}
        onBack={onBack}
        onDecreaseFontSize={handleDecrease}
        onIncreaseFontSize={handleIncrease}
        canDecrease={fontScale > FONT_SCALE_MIN}
        canIncrease={fontScale < FONT_SCALE_MAX}
        audioEnabled={audioEnabled}
        onToggleAudio={onToggleAudio}
      />
      <div className="flex-1 min-h-0">
        <NativeBookReader
          story={story}
          fontScale={fontScale}
          audioEnabled={audioEnabled}
          onReachLastPage={handleReachLastPage}
          onBack={onBack}
        />
      </div>
    </motion.div>
  )
}
