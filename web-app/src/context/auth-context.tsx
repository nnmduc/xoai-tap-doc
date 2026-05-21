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
import { fetchUserSet, setUserEntry } from '@/store/user-prefs-store'

interface AuthContextValue {
  user: User | null
  authLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  heartedSlugs: Set<string>
  addUserHeart: (slug: string) => Promise<void>
  hiddenSlugs: Set<string>
  pinnedSlugs: Set<string>
  finishedSlugs: Set<string>
  toggleHidden: (slug: string) => Promise<void>
  togglePinned: (slug: string) => Promise<void>
  toggleFinished: (slug: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authLoading: false,
  signIn: async () => {},
  signOut: async () => {},
  heartedSlugs: new Set(),
  addUserHeart: async () => {},
  hiddenSlugs: new Set(),
  pinnedSlugs: new Set(),
  finishedSlugs: new Set(),
  toggleHidden: async () => {},
  togglePinned: async () => {},
  toggleFinished: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(!!firebaseAuth)
  const [heartedSlugs, setHeartedSlugs] = useState<Set<string>>(new Set())
  const [hiddenSlugs, setHiddenSlugs] = useState<Set<string>>(new Set())
  const [pinnedSlugs, setPinnedSlugs] = useState<Set<string>>(new Set())
  const [finishedSlugs, setFinishedSlugs] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!firebaseAuth) return
    return onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u)
      setAuthLoading(false)
      if (!u) {
        setHeartedSlugs(new Set())
        setHiddenSlugs(new Set())
        setPinnedSlugs(new Set())
        setFinishedSlugs(new Set())
        return
      }
      u.getIdToken()
        .then((token) =>
          Promise.all([
            fetchUserSet(u.uid, token, 'hearts'),
            fetchUserSet(u.uid, token, 'hidden'),
            fetchUserSet(u.uid, token, 'pinned'),
            fetchUserSet(u.uid, token, 'finished'),
          ]),
        )
        .then(([hearts, hidden, pinned, finished]) => {
          setHeartedSlugs(hearts)
          setHiddenSlugs(hidden)
          setPinnedSlugs(pinned)
          setFinishedSlugs(finished)
        })
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
      if (!user) return
      try {
        const token = await user.getIdToken()
        setUserEntry(user.uid, token, 'hearts', slug, true)
        setHeartedSlugs((prev) => new Set([...prev, slug]))
      } catch {}
    },
    [user],
  )

  const toggleHidden = useCallback(
    async (slug: string) => {
      if (!user) return
      try {
        const token = await user.getIdToken()
        setHiddenSlugs((prev) => {
          const next = new Set(prev)
          const toAdd = !prev.has(slug)
          toAdd ? next.add(slug) : next.delete(slug)
          setUserEntry(user.uid, token, 'hidden', slug, toAdd)
          return next
        })
      } catch {}
    },
    [user],
  )

  const togglePinned = useCallback(
    async (slug: string) => {
      if (!user) return
      try {
        const token = await user.getIdToken()
        setPinnedSlugs((prev) => {
          const next = new Set(prev)
          const toAdd = !prev.has(slug)
          toAdd ? next.add(slug) : next.delete(slug)
          setUserEntry(user.uid, token, 'pinned', slug, toAdd)
          return next
        })
      } catch {}
    },
    [user],
  )

  const toggleFinished = useCallback(
    async (slug: string) => {
      if (!user) return
      try {
        const token = await user.getIdToken()
        setFinishedSlugs((prev) => {
          const next = new Set(prev)
          const toAdd = !prev.has(slug)
          toAdd ? next.add(slug) : next.delete(slug)
          setUserEntry(user.uid, token, 'finished', slug, toAdd)
          return next
        })
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
        hiddenSlugs,
        pinnedSlugs,
        finishedSlugs,
        toggleHidden,
        togglePinned,
        toggleFinished,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
