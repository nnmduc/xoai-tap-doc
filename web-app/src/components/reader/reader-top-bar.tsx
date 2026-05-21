interface Props {
  title: string
  onBack: () => void
  onDecreaseFontSize: () => void
  onIncreaseFontSize: () => void
  canDecrease: boolean
  canIncrease: boolean
  audioEnabled: boolean
  onToggleAudio: () => void
}

export function ReaderTopBar({
  title,
  onBack,
  onDecreaseFontSize,
  onIncreaseFontSize,
  canDecrease,
  canIncrease,
  audioEnabled,
  onToggleAudio,
}: Props) {
  return (
    <header className="h-[60px] flex-shrink-0 flex items-center gap-3 px-3 bg-white border-b-2 border-brand-border shadow-sm z-10">
      <button
        onClick={onBack}
        aria-label="Quay lại thư viện"
        className="flex-shrink-0 w-11 h-11 flex items-center justify-center
                   bg-brand-bg border-[2.5px] border-brand-border rounded-[13px]
                   shadow-clay-btn cursor-pointer
                   hover:bg-blue-50 hover:border-brand-primary
                   active:scale-95 transition-all duration-150 outline-none
                   focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4A90D9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <p className="font-body text-[10px] font-bold text-brand-muted uppercase tracking-[0.6px]">
          Thư Viện Sách
        </p>
        <h1 className="font-heading font-bold text-[16px] text-brand-text leading-tight truncate">
          {title}
        </h1>
      </div>

      {/* Controls — right-aligned */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        <button
          onClick={onDecreaseFontSize}
          disabled={!canDecrease}
          aria-label="Chữ nhỏ hơn"
          className="w-9 h-9 flex items-center justify-center
                     bg-brand-bg border-[2px] border-brand-border rounded-[10px]
                     cursor-pointer transition-all duration-150 outline-none
                     hover:bg-blue-50 hover:border-brand-primary
                     active:scale-95
                     disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100
                     focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <span className="font-heading font-bold text-brand-primary leading-none select-none"
                style={{ fontSize: '11px' }}>A−</span>
        </button>

        <button
          onClick={onIncreaseFontSize}
          disabled={!canIncrease}
          aria-label="Chữ to hơn"
          className="w-9 h-9 flex items-center justify-center
                     bg-brand-bg border-[2px] border-brand-border rounded-[10px]
                     cursor-pointer transition-all duration-150 outline-none
                     hover:bg-blue-50 hover:border-brand-primary
                     active:scale-95
                     disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100
                     focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <span className="font-heading font-bold text-brand-primary leading-none select-none"
                style={{ fontSize: '14px' }}>A+</span>
        </button>

        <button
          onClick={onToggleAudio}
          aria-label={audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          aria-pressed={audioEnabled}
          className="w-9 h-9 flex items-center justify-center
                     bg-brand-bg border-[2px] border-brand-border rounded-[10px]
                     cursor-pointer transition-all duration-150 outline-none
                     hover:bg-blue-50 hover:border-brand-primary
                     active:scale-95
                     focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {audioEnabled ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
