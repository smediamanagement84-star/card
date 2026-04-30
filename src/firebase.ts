import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    // Fall back to redirect when popup is blocked
    if (err.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw err;
  }
};

export const handleGoogleRedirect = () => getRedirectResult(auth);
export const logout = () => signOut(auth);

export { signInWithPhoneNumber, RecaptchaVerifier };
