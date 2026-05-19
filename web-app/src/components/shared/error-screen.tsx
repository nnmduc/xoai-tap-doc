interface Props {
  message: string
}

export function ErrorScreen({ message }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-brand-bg p-8">
      <div className="w-16 h-16 flex items-center justify-center rounded-[18px] bg-red-100 border-[3px] border-red-200">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="font-heading text-xl font-extrabold text-brand-text mb-2">Ối! Có lỗi rồi</h2>
        <p className="font-body text-[15px] text-brand-body leading-relaxed max-w-[260px]">
          Không thể tải danh sách sách. Thử tải lại trang nhé!
        </p>
        <p className="mt-2 font-body text-xs text-brand-muted">{message}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 bg-brand-primary border-[3px] border-brand-primary-dark
                   rounded-full px-6 py-3 font-heading text-[15px] font-bold text-white
                   shadow-clay-btn cursor-pointer
                   hover:-translate-y-0.5 hover:shadow-lg
                   active:scale-95 transition-all duration-150"
      >
        Tải lại trang
      </button>
    </div>
  )
}
