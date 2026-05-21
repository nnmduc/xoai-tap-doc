import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
}

export function AboutPopup({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Header band */}
            <div className="bg-gradient-to-r from-[#4A90D9] to-[#67B8F5] px-6 pt-6 pb-5">
              <button
                onClick={onClose}
                aria-label="Đóng"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 transition-colors text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <p className="font-heading text-[22px] font-extrabold text-white leading-snug">
                Ba "sáng tác" truyện<br />cho con 📚
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 text-[14px] font-body text-brand-body leading-relaxed">
              <p>
                Xoài sắp lên lớp Hai nhưng đọc vẫn còn chậm. Nhân dịp con về quê nghỉ hè, Ba giao nhiệm vụ mỗi ngày đọc một câu chuyện — không cần đem sách nặng, dùng ipad của Ngoại là đủ.
              </p>
              <p>
                Thế là Ba dùng AI dựng cả một thư viện truyện thiếu nhi tiếng Việt dành riêng cho các bạn nhỏ: viết truyện, tạo hình nhân vật, sinh tranh minh hoạ, rồi đóng gói thành sách HTML đọc thẳng trên ipad, điện thoại.
              </p>
              <p>
                Điểm hay nhất là Ba có thể kể ý tưởng rất đời thường theo đúng sở thích của con. Xoài thích cắm trại, thích phiêu lưu — thì Ba nhờ AI viết đúng kiểu đó, kèm hình dễ thương để con có thêm hứng đọc.
              </p>

              <div className="bg-brand-bg rounded-2xl px-4 py-3 space-y-1.5 text-[13px]">
                <p className="font-heading font-bold text-brand-primary text-xs uppercase tracking-wide mb-2">Muốn thử?</p>
                <p>
                  🛠️ <span className="font-semibold">Rành IT</span> (Claude / Cursor / Copilot) →{' '}
                  <a
                    href="https://github.com/nnmduc/xoai-tap-doc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary underline"
                  >
                    Repo trên GitHub
                  </a>{' '}
                  hoặc nhắn mình hướng dẫn.
                </p>
                <p>
                  💬 <span className="font-semibold">Chưa rành</span> → Nhắn mình ý tưởng, nhân vật mong muốn, mình sẽ viết và publish lên đây.
                </p>
              </div>
            </div>

            {/* Footer action */}
            <div className="px-6 pb-6">
              <a
                href="https://www.facebook.com/socthaovat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-brand-primary text-white font-heading font-bold text-[15px] hover:opacity-90 transition-opacity"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Nhắn tin cho Ba Xoài
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
