import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { isFirebaseConfigured } from '@/firebase'

type UserFilter = 'favourites' | 'finished' | 'hidden'

interface Props {
  activeFilter?: string | null
  onSelectFilter?: (filter: UserFilter) => void
  audioEnabled?: boolean
  onToggleAudio?: () => void
}

function UserIcon({ dimmed }: { dimmed?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={dimmed ? 'rgba(255,255,255,0.55)' : 'white'}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="ml-auto shrink-0 text-brand-primary"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const USER_FILTER_ITEMS: { filter: UserFilter; icon: string; title: string; desc: string }[] = [
  { filter: 'favourites', icon: '❤️', title: 'Yêu thích',        desc: 'Những sách đã bấm tim' },
  { filter: 'finished',   icon: '✅', title: 'Đã đọc xong',      desc: 'Truyện đọc đến trang cuối' },
  { filter: 'hidden',     icon: '🙈', title: 'Truyện đã ẩn',     desc: 'Xem và quản lý sách đã ẩn' },
]

export function AuthButton({ activeFilter, onSelectFilter, audioEnabled, onToggleAudio }: Props) {
  const { user, authLoading, signIn, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (
        !dropdownRef.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  if (!isFirebaseConfigured || authLoading) return null

  if (!user) {
    return (
      <button
        onClick={() => signIn()}
        aria-label="Đăng nhập với Google"
        title="Đăng nhập"
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                   rounded-[12px] border-2 transition-all duration-150
                   active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-white"
        style={{ background: 'rgba(0,0,0,0.18)', borderColor: 'rgba(255,255,255,0.2)' }}
      >
        <UserIcon dimmed />
      </button>
    )
  }

  const handleOpenMenu = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setMenuOpen((o) => !o)
  }

  const handleSelectFilter = (filter: UserFilter) => {
    onSelectFilter?.(filter)
    setMenuOpen(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpenMenu}
        aria-label="Tài khoản"
        aria-expanded={menuOpen}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                   rounded-[12px] border-2 transition-all duration-150
                   active:scale-90 outline-none overflow-hidden
                   focus-visible:ring-2 focus-visible:ring-white"
        style={{ background: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.45)' }}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName ?? 'avatar'}
            className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <UserIcon />
        )}
      </button>

      {menuOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-56 bg-white rounded-2xl border-2 border-brand-border shadow-clay overflow-hidden"
          style={{ top: menuPos.top, right: menuPos.right }}
        >
          {/* User info */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 bg-brand-bg border-b-2 border-brand-border/60">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                <UserIcon />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-heading font-bold text-[13px] text-brand-text truncate">
                {user.displayName ?? 'Người dùng'}
              </p>
              <p className="font-body text-[11px] text-brand-muted truncate">{user.email}</p>
            </div>
          </div>

          {/* Filter shortcuts */}
          {USER_FILTER_ITEMS.map(({ filter, icon, title, desc }) => {
            const active = activeFilter === filter
            return (
              <button
                key={filter}
                onClick={() => handleSelectFilter(filter)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-brand-bg"
              >
                <span className="text-base leading-none shrink-0">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p className={`font-heading font-bold text-[13px] leading-tight ${active ? 'text-brand-primary' : 'text-brand-text'}`}>
                    {title}
                  </p>
                  <p className="font-body text-[11px] text-brand-muted leading-tight mt-0.5">{desc}</p>
                </div>
                {active && <CheckIcon />}
              </button>
            )
          })}

          <div className="mx-3.5 h-px bg-brand-border/60" />

          {/* Audio toggle */}
          {onToggleAudio && (
            <button
              onClick={() => { onToggleAudio(); setMenuOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-brand-bg"
            >
              <span className="text-base leading-none shrink-0">{audioEnabled ? '🔊' : '🔇'}</span>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-bold text-[13px] text-brand-text leading-tight">
                  {audioEnabled ? 'Tắt đọc truyện' : 'Bật đọc truyện'}
                </p>
                <p className="font-body text-[11px] text-brand-muted leading-tight mt-0.5">
                  {audioEnabled ? 'Đang bật — nhấn để tắt' : 'Đang tắt — nhấn để bật'}
                </p>
              </div>
              {audioEnabled && <CheckIcon />}
            </button>
          )}

          <div className="mx-3.5 h-px bg-brand-border/60" />

          {/* Sign out */}
          <button
            onClick={() => { signOut(); setMenuOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-red-50"
          >
            <span className="text-base leading-none shrink-0">🚪</span>
            <div className="min-w-0">
              <p className="font-heading font-bold text-[13px] text-red-600 leading-tight">Đăng xuất</p>
              <p className="font-body text-[11px] text-brand-muted leading-tight mt-0.5">Thoát tài khoản</p>
            </div>
          </button>
        </div>
      )}
    </>
  )
}
