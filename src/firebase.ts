import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Persist auth across reloads/closes — important for mobile + PWA-style use
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const isMobile = () =>
  typeof window !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const loginWithGoogle = async () => {
  // On mobile, popups are unreliable — use redirect by default.
  if (isMobile()) {
    return signInWithRedirect(auth, googleProvider);
  }
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw err;
  }
};

export const handleGoogleRedirect = () => getRedirectResult(auth);
export const logout = () => signOut(auth);
