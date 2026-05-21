import { useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useStoryHearts } from '@/hooks/use-story-hearts'

interface Particle {
  id: number
  x: number
  y: number
}

interface Props {
  slug: string
  size?: 'sm' | 'md'
  className?: string
}

function HeartIcon({ filled, size }: { filled: boolean; size: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 16 : 20
  return filled ? (
    <svg width={dim} height={dim} viewBox="0 0 24 24" fill="#FF6B8A">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ) : (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF6B8A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export function HeartButton({ slug, size = 'md', className }: Props) {
  const { total, hasHearted, addHeart } = useStoryHearts(slug)
  const prefersReduced = useReducedMotion()
  const [particles, setParticles] = useState<Particle[]>([])
  const nextId = useRef(0)

  const handleTap = () => {
    addHeart()
    if (prefersReduced) return
    const burst: Particle[] = Array.from({ length: 4 }, () => ({
      id: nextId.current++,
      x: Math.random() * 28 - 14,
      y: -(Math.random() * 30 + 40),
    }))
    setParticles((p) => [...p, ...burst])
  }

  const removeParticle = (id: number) =>
    setParticles((p) => p.filter((pt) => pt.id !== id))

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      <div className="relative">
        <motion.button
          onClick={handleTap}
          whileTap={prefersReduced ? undefined : { scale: 1.35 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          aria-label="Thêm tim cho câu chuyện này"
          className={`flex items-center justify-center
            bg-white border-[2px] border-brand-border shadow-clay-btn
            hover:bg-pink-50 hover:border-pink-300
            transition-all duration-150 outline-none cursor-pointer
            focus-visible:ring-2 focus-visible:ring-pink-400
            ${size === 'sm' ? 'w-8 h-8 rounded-[10px]' : 'w-10 h-10 rounded-[12px]'}`}
        >
          <HeartIcon filled={hasHearted} size={size} />
        </motion.button>

        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.2 }}
              exit={{}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onAnimationComplete={() => removeParticle(p.id)}
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{ zIndex: 20 }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#FF6B8A">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {total !== null ? (
        <span className="font-body text-[12px] font-bold text-brand-muted tabular-nums">
          {total.toLocaleString()}
        </span>
      ) : (
        <span className="font-body text-[11px] text-brand-muted/40">—</span>
      )}
    </div>
  )
}
