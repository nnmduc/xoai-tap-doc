import type { StoryEntry } from '@/types/story'

interface Props {
  story: StoryEntry
  reason: 'not-ready' | 'timeout'
  onBack: () => void
}

export function ReaderFallback({ story, reason, onBack }: Props) {
  const message =
    reason === 'timeout'
      ? 'Không thể tải sách. Vui lòng thử lại sau nhé!'
      : 'Cuốn sách này chưa được tạo xong. Hãy quay lại sau nhé!'

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-brand-bg to-[#FFF0D8]">
      <div className="w-18 h-18 flex items-center justify-center rounded-[20px] bg-brand-primary/10 border-[3px] border-brand-primary/20">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4A90D9"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>

      <div className="text-center">
        <h2 className="font-heading text-xl font-extrabold text-brand-text mb-2">
          Sách chưa sẵn sàng
        </h2>
        <p className="font-body text-[15px] text-brand-body leading-relaxed max-w-[240px]">
          {message}
        </p>
        {story.title && (
          <p className="mt-1 font-body text-sm text-brand-muted">
            "{story.title}"
          </p>
        )}
      </div>

      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 bg-brand-primary border-[3px] border-brand-primary-dark
                   rounded-full px-6 py-3 font-heading text-[15px] font-bold text-white
                   shadow-clay-btn cursor-pointer
                   hover:-translate-y-0.5 hover:shadow-lg
                   active:scale-95 transition-all duration-150"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Quay lại thư viện
      </button>
    </div>
  )
}
