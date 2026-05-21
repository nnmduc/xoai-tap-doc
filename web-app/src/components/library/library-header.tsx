import { AuthButton } from '@/components/shared/auth-button'

type UserFilter = 'favourites' | 'finished' | 'hidden'

interface Props {
  storyCount: number
  audioEnabled: boolean
  onToggleAudio: () => void
  activeFilter?: string | null
  onSelectUserFilter?: (filter: UserFilter) => void
}

export function LibraryHeader({ storyCount, audioEnabled, onToggleAudio, activeFilter, onSelectUserFilter }: Props) {
  return (
    <header className="relative overflow-hidden flex-shrink-0 rounded-b-[28px] px-6 pt-7 pb-5 bg-gradient-to-br from-[#4A90D9] via-[#5BA8F0] to-[#67B8F5] shadow-lg">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-5 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-10 -left-8 w-24 h-24 rounded-full bg-white/7 pointer-events-none" />

      {/* Cloud decorations */}
      <div className="absolute top-3 right-4 flex items-start gap-1.5 pointer-events-none">
        <div className="w-7 h-4 mt-2 rounded-full bg-white/20 border border-white/30" />
        <div className="w-10 h-[22px] rounded-full bg-white/20 border border-white/30" />
        <div className="w-8 h-[18px] mt-1 rounded-full bg-white/20 border border-white/30" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] bg-white/22 border-2 border-white/35">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h1 className="font-heading text-[28px] font-extrabold text-white leading-tight tracking-tight">
                Thư Viện Sách
              </h1>
            </div>
            <p className="mt-1.5 font-body text-sm text-white/90">
              Chọn một cuốn sách để đọc nhé!
            </p>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
          <AuthButton activeFilter={activeFilter} onSelectFilter={onSelectUserFilter} />
          {/* Audio toggle */}
          <button
            onClick={onToggleAudio}
            aria-label={audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            aria-pressed={audioEnabled}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                       rounded-[12px] border-2 transition-all duration-150
                       active:scale-90 outline-none
                       focus-visible:ring-2 focus-visible:ring-white"
            style={{
              background: audioEnabled ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)',
              borderColor: audioEnabled ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
            }}
          >
            {audioEnabled ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
          </div>
        </div>

        <div className="mt-2.5 inline-flex items-center gap-1 bg-white/20 border border-white/30 rounded-full px-3 py-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-heading text-xs font-semibold text-white/95">
            {storyCount} câu chuyện
          </span>
        </div>
      </div>
    </header>
  )
}
