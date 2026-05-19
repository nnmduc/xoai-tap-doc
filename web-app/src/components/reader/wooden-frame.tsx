import type { ReactNode } from 'react'

type CornerPos = 'tl' | 'tr' | 'bl' | 'br'

const CORNER_CLASSES: Record<CornerPos, string> = {
  tl: 'top-[5px] left-[5px]',
  tr: 'top-[5px] right-[5px] scale-x-[-1]',
  bl: 'bottom-[5px] left-[5px] scale-y-[-1]',
  br: 'bottom-[5px] right-[5px] scale-[-1]',
}

function CornerOrnament({ position }: { position: CornerPos }) {
  return (
    <div className={`absolute z-[5] pointer-events-none ${CORNER_CLASSES[position]}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="4" cy="4" r="3"
          fill="rgba(255,255,255,.55)"
          stroke="rgba(255,255,255,.35)"
          strokeWidth="1"
        />
        <line x1="7" y1="4" x2="18" y2="4" stroke="rgba(255,255,255,.30)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="7" x2="4" y2="18" stroke="rgba(255,255,255,.30)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

interface Props {
  children: ReactNode
}

export function WoodenFrame({ children }: Props) {
  return (
    <div className="flex-1 min-h-0 p-[14px] bg-brand-bg">
      {/* touch-action: none lets swipe events pass through to the iframe */}
      <div
        className="relative w-full h-full rounded-frame shadow-wood-frame overflow-hidden"
        style={{ background: '#8B5E3C', touchAction: 'none' }}
      >
        {/* Wood grain overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none rounded-frame"
          style={{
            background: `
              repeating-linear-gradient(
                180deg,
                transparent 0px, transparent 6px,
                rgba(101,62,30,.12) 6px, rgba(101,62,30,.12) 7px
              ),
              repeating-linear-gradient(
                175deg,
                transparent 0px, transparent 22px,
                rgba(196,135,74,.08) 22px, rgba(196,135,74,.08) 23px
              ),
              linear-gradient(180deg, rgba(255,255,255,.18) 0%, transparent 14px),
              linear-gradient(0deg, rgba(0,0,0,.18) 0%, transparent 14px),
              linear-gradient(90deg, rgba(255,255,255,.12) 0%, transparent 12px),
              linear-gradient(270deg, rgba(0,0,0,.12) 0%, transparent 12px)
            `,
          }}
        />

        {/* Inner border line */}
        <div className="absolute inset-[4px] z-[2] pointer-events-none rounded-[14px] border-2 border-white/15 shadow-[inset_0_0_0_1px_rgba(0,0,0,.10)]" />

        {/* White mat / inner content area */}
        <div className="absolute inset-[10px] z-[3] bg-white rounded-[10px] overflow-hidden shadow-[inset_0_0_12px_rgba(139,94,60,.15)]">
          {children}
        </div>

        {/* Corner ornaments */}
        {(['tl', 'tr', 'bl', 'br'] as CornerPos[]).map((pos) => (
          <CornerOrnament key={pos} position={pos} />
        ))}
      </div>
    </div>
  )
}
