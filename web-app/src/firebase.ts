import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence, type Auth } from 'firebase/auth'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  databaseURL: import.meta.env.VITE_FIREBASE_RTDB_URL as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

const isConfigured = !!(cfg.apiKey && cfg.authDomain)

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
const googleProvider: GoogleAuthProvider | null = isConfigured ? new GoogleAuthProvider() : null

if (isConfigured) {
  firebaseApp = getApps().length === 0
    ? initializeApp(cfg as Record<string, string>)
    : getApps()[0]
  firebaseAuth = getAuth(firebaseApp)
  setPersistence(firebaseAuth, browserLocalPersistence)
}

export { firebaseApp, firebaseAuth, googleProvider, isConfigured as isFirebaseConfigured }
