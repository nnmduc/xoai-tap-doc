import { motion } from 'framer-motion'
import type { StoryEntry } from '@/types/story'
import { ReaderTopBar } from './reader-top-bar'
import { WoodenFrame } from './wooden-frame'
import { StoryIframe } from './story-iframe'

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
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-brand-bg"
      variants={screenVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <ReaderTopBar title={story.title} onBack={onBack} />
      <WoodenFrame>
        <StoryIframe story={story} onBack={onBack} />
      </WoodenFrame>
    </motion.div>
  )
}
