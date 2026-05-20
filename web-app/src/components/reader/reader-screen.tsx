import { useState } from 'react'
import { motion } from 'framer-motion'
import type { StoryEntry } from '@/types/story'
import { ReaderTopBar } from './reader-top-bar'
import { WoodenFrame } from './wooden-frame'
import { StoryIframe } from './story-iframe'

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
}

export function ReaderScreen({ story, onBack }: Props) {
  const [fontScale, setFontScale] = useState(1.0)

  const handleDecrease = () =>
    setFontScale((s) => Math.max(FONT_SCALE_MIN, +(s - FONT_SCALE_STEP).toFixed(1)))

  const handleIncrease = () =>
    setFontScale((s) => Math.min(FONT_SCALE_MAX, +(s + FONT_SCALE_STEP).toFixed(1)))

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-brand-bg"
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
      />
      <WoodenFrame>
        <StoryIframe story={story} onBack={onBack} fontScale={fontScale} />
      </WoodenFrame>
    </motion.div>
  )
}
