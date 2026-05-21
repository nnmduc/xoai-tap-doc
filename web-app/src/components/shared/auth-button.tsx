import { useAuth } from '@/context/auth-context'
import { isFirebaseConfigured } from '@/firebase'

function UserIcon({ dimmed }: { dimmed?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={dimmed ? 'rgba(255,255,255,0.55)' : 'white'}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function AuthButton() {
  const { user, authLoading, signIn, signOut } = useAuth()

  if (!isFirebaseConfigured || authLoading) return null

  if (user) {
    return (
      <button
        onClick={() => signOut()}
        aria-label="Đăng xuất"
        title={`Đăng xuất (${user.displayName ?? user.email})`}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                   rounded-[12px] border-2 transition-all duration-150
                   active:scale-90 outline-none overflow-hidden
                   focus-visible:ring-2 focus-visible:ring-white"
        style={{
          background: 'rgba(255,255,255,0.25)',
          borderColor: 'rgba(255,255,255,0.45)',
        }}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'avatar'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <UserIcon />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={() => signIn()}
      aria-label="Đăng nhập với Google"
      title="Đăng nhập"
      className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                 rounded-[12px] border-2 transition-all duration-150
                 active:scale-90 outline-none
                 focus-visible:ring-2 focus-visible:ring-white"
      style={{
        background: 'rgba(0,0,0,0.18)',
        borderColor: 'rgba(255,255,255,0.2)',
      }}
    >
      <UserIcon dimmed />
    </button>
  )
}
