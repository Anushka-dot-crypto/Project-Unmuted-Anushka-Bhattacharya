import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL: Test connection to Firestore on initialization
export async function testConnection(): Promise<boolean> {
  try {
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady();
    }
    if (auth.currentUser) {
      try {
        await auth.currentUser.getIdToken(false);
      } catch (tokenErr: any) {
        const msg = tokenErr?.message || '';
        if (
          msg.includes('token-service-api') ||
          msg.includes('securetoken.googleapis.com') ||
          tokenErr?.code === 'auth/token-service-api-has-not-been-used'
        ) {
          console.warn('Signing out stale auth session with disabled token service:', msg);
          await signOut(auth).catch(() => {});
        }
      }
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (
      errMsg.includes('Fetching auth token failed') ||
      errMsg.includes('token-service-api') ||
      errMsg.includes('the client is offline')
    ) {
      try {
        await signOut(auth).catch(() => {});
        await getDocFromServer(doc(db, 'test', 'connection'));
        return true;
      } catch (retryError) {
        if (retryError instanceof Error && retryError.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
        return false;
      }
    }

    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

// Initial connection check trigger
testConnection().catch((err) => {
  console.warn('Initial Firebase connectivity test result:', err);
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    const msg = error?.message || '';
    if (msg.includes('token-service-api') || msg.includes('securetoken')) {
      await signOut(auth).catch(() => {});
      return {
        user: null,
        error:
          'Token service is currently disabled in this Google Cloud project. You can continue safely in Guest mode or using local passcodes.',
      };
    }
    return { user: null, error: error.message || 'Failed to sign in with Google' };
  }
};

export const logOutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out from Firebase:', error);
  }
};

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  onAuthStateChanged,
  signOut,
};
export type { FirebaseUser };
