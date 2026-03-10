import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Next.js only inlines NEXT_PUBLIC_* vars when accessed as static literals —
// dynamic access (process.env[varName]) is never replaced by the bundler.
if (
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
) {
  throw new Error(
    "Missing required Firebase environment variables. Check your .env.local file " +
      "(NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID).",
  )
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
