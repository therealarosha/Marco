import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

export const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'arodisspj2006@gmail.com'
)
  .trim()
  .toLowerCase();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
);

let app = null;
let db = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
}

let cachedAuthBundle = null;

/**
 * Dynamically loads Firebase Auth only when visiting the CMS (#/admin),
 * keeping visitor mobile bundles light.
 */
export async function loadFirebaseAuth() {
  if (!isFirebaseConfigured || !app) return null;
  if (cachedAuthBundle) return cachedAuthBundle;

  const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  cachedAuthBundle = { auth, googleProvider };
  return cachedAuthBundle;
}

export { app, db };
