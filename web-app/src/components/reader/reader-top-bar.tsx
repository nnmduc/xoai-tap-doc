interface Props {
  title: string
  onBack: () => void
}

export function ReaderTopBar({ title, onBack }: Props) {
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
    </header>
  )
}
