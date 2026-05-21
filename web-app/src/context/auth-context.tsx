import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { firebaseAuth, googleProvider } from '@/firebase'

const RTDB_URL = import.meta.env.VITE_FIREBASE_RTDB_URL as string | undefined

interface AuthContextValue {
  user: User | null
  authLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  heartedSlugs: Set<string>
  addUserHeart: (slug: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authLoading: false,
  signIn: async () => {},
  signOut: async () => {},
  heartedSlugs: new Set(),
  addUserHeart: async () => {},
})

async function fetchUserHearts(uid: string, token: string): Promise<Set<string>> {
  if (!RTDB_URL) return new Set()
  try {
    const res = await fetch(`${RTDB_URL}/users/${uid}/hearts.json?auth=${token}`)
    const data = await res.json()
    if (data && typeof data === 'object') {
      return new Set(Object.keys(data).filter((k) => data[k] === true))
    }
  } catch {}
  return new Set()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(!!firebaseAuth)
  const [heartedSlugs, setHeartedSlugs] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!firebaseAuth) return
    return onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u)
      setAuthLoading(false)
      if (!u) {
        setHeartedSlugs(new Set())
        return
      }
      u.getIdToken()
        .then((token) => fetchUserHearts(u.uid, token))
        .then(setHeartedSlugs)
    })
  }, [])

  const handleSignIn = useCallback(async () => {
    if (!firebaseAuth || !googleProvider) return
    try {
      await signInWithPopup(firebaseAuth, googleProvider)
    } catch (err) {
      if ((err as { code?: string }).code !== 'auth/popup-closed-by-user') {
        console.error('[auth]', err)
      }
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    if (!firebaseAuth) return
    await signOut(firebaseAuth)
  }, [])

  const addUserHeart = useCallback(
    async (slug: string) => {
      if (!user || !RTDB_URL) return
      try {
        const token = await user.getIdToken()
        await fetch(`${RTDB_URL}/users/${user.uid}/hearts/${slug}.json?auth=${token}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: 'true',
        })
        setHeartedSlugs((prev) => new Set([...prev, slug]))
      } catch {}
    },
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        heartedSlugs,
        addUserHeart,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
