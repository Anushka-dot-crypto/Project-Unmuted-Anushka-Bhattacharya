import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PasscodeMode } from '../types';
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  logOutFirebase,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
  db,
  doc,
  setDoc,
  getDoc,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

interface StoredAccount extends User {
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isFirebaseConnected: boolean;
  isAuthenticated: boolean;
  isVaultLocked: boolean;
  isDecoyMode: boolean;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  signup: (email: string, password: string, name: string) => { success: boolean; error?: string };
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => void;
  sendVerificationEmail: (emailToVerify?: string) => { success: boolean; message: string; token?: string };
  verifyEmailToken: (token: string) => { success: boolean; error?: string };
  resetPasswordRequest: (email: string) => { success: boolean; code?: string; error?: string };
  resetPasswordConfirm: (email: string, code: string, newPassword: string) => { success: boolean; error?: string };
  setupSecurityCredentials: (pattern: string, pin: string) => void;
  verifySecurityCredentials: (pattern: string, pin: string) => boolean;
  verifyPasscode: (params: { pin?: string; pattern?: string; fourLetterCode?: string; sixDigitPasscode?: string; passcode?: string }) => { success: boolean; isDecoy?: boolean; error?: string };
  updatePasscodeSettings: (params: { mode?: PasscodeMode; pin?: string; pattern?: string; decoyPin?: string; fourLetterCode?: string; decoyFourLetterCode?: string; sixDigitPasscode?: string; decoySixDigitPasscode?: string; faceBiometricRegistered?: boolean }) => void;
  requestSecurityRecoveryCode: (email: string) => { success: boolean; code?: string; error?: string };
  recoverSecurityCredentials: (email: string, code: string, newPattern: string, newPin: string) => boolean;
  resetFourLetterCodeViaEmail: (email: string, recoveryCode: string, newCode: string) => { success: boolean; error?: string };
  resetPasscodeViaEmail: (email: string, recoveryCode: string, newPasscode: string) => { success: boolean; error?: string };
  lockVault: () => void;
  unlockVault: () => void;
  exitDecoyMode: () => void;
  updateUserPreferences: (prefs: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'unmuted_user_session';
const ACCOUNTS_STORAGE_KEY = 'unmuted_registered_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved user', e);
    }
    return {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      name: 'Guest User',
      email: '',
      isGuest: true,
      language: 'en',
      region: 'IN-ALL',
      theme: 'light',
    };
  });

  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(true);
  const [isDecoyMode, setIsDecoyMode] = useState<boolean>(false);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          await fbUser.getIdToken(false);
        } catch (tokenErr: any) {
          const msg = tokenErr?.message || '';
          if (
            msg.includes('token-service-api') ||
            msg.includes('securetoken') ||
            tokenErr?.code === 'auth/token-service-api-has-not-been-used'
          ) {
            console.warn('Signing out user due to token service unavailability:', msg);
            await signOut(auth).catch(() => {});
            setFirebaseUser(null);
            return;
          }
        }
      }

      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsFirebaseConnected(true);
        const path = `users/${fbUser.uid}`;
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            setUser({
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Google User',
              email: fbUser.email || '',
              isGuest: false,
              language: data.language || 'en',
              region: data.region || 'IN-ALL',
              theme: data.theme || 'light',
              passcodeMode: data.passcodeMode || 'code_only',
              sixDigitPasscode: data.sixDigitPasscode || '123456',
              decoySixDigitPasscode: data.decoySixDigitPasscode || '999999',
            });
          } else {
            const initialUserData = {
              id: fbUser.uid,
              name: (fbUser.displayName || 'Google User').slice(0, 100),
              email: (fbUser.email || '').slice(0, 150),
              isGuest: false,
              language: 'en',
              region: 'IN-ALL',
              theme: 'light',
              passcodeMode: 'code_only',
              sixDigitPasscode: '123456',
              decoySixDigitPasscode: '999999',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialUserData);
            setUser({
              id: fbUser.uid,
              name: initialUserData.name,
              email: initialUserData.email,
              isGuest: false,
              language: 'en',
              region: 'IN-ALL',
              theme: 'light',
              passcodeMode: 'code_only',
              sixDigitPasscode: '123456',
              decoySixDigitPasscode: '999999',
            });
          }
        } catch (error) {
          console.warn('Firestore user fetch notice:', error);
          // Fallback to local profile with fbUser details
          setUser((prev) => ({
            id: fbUser.uid,
            name: fbUser.displayName || prev?.name || 'Google User',
            email: fbUser.email || '',
            isGuest: false,
            language: prev?.language || 'en',
            region: prev?.region || 'IN-ALL',
            theme: prev?.theme || 'light',
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const getRegisteredAccounts = (): StoredAccount[] => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredAccounts = (accounts: StoredAccount[]) => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  };

  const login = (email: string, password?: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();
    const match = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);

    if (!match) {
      // If account doesn't exist yet, create or give feedback
      if (!password || password.length < 4) {
        return { success: false, error: 'Account not found. Please sign up or check email.' };
      }
      // Auto-register for smooth UX
      const newAcc: StoredAccount = {
        id: 'usr-' + Date.now(),
        name: email.split('@')[0] || 'User',
        email: trimmedEmail,
        isGuest: false,
        language: 'en',
        region: 'IN-ALL',
        theme: 'light',
        passwordHash: password,
      };
      saveRegisteredAccounts([...accounts, newAcc]);
      setUser(newAcc);
      return { success: true };
    }

    if (password && match.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setUser(match);
    return { success: true };
  };

  const signup = (email: string, password: string, name: string): { success: boolean; error?: string } => {
    if (!email || !password) return { success: false, error: 'Email and password are required.' };
    if (password.length < 4) return { success: false, error: 'Password must be at least 4 characters.' };

    const trimmedEmail = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);

    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const verificationToken = 'verify_' + Math.random().toString(36).substring(2, 10);
    const newAcc: StoredAccount = {
      id: 'usr-' + Date.now(),
      name: name.trim() || email.split('@')[0] || 'User',
      email: trimmedEmail,
      isGuest: false,
      isEmailVerified: false,
      verificationToken,
      verificationSentAt: Date.now(),
      language: 'en',
      region: 'IN-ALL',
      theme: 'light',
      passwordHash: password,
    };

    saveRegisteredAccounts([...accounts, newAcc]);
    setUser(newAcc);
    return { success: true };
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fbSignInWithGoogle();
      if (res.error) {
        return { success: false, error: res.error };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to sign in with Google' };
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      name: 'Guest User',
      email: '',
      isGuest: true,
      isEmailVerified: false,
      language: user?.language || 'en',
      region: user?.region || 'IN-ALL',
      theme: user?.theme || 'light',
    };
    setUser(guestUser);
  };

  const logout = () => {
    logOutFirebase().catch((err) => console.warn('Firebase logout notice:', err));
    loginAsGuest();
    setIsVaultLocked(true);
  };

  const sendVerificationEmail = (emailToVerify?: string) => {
    const target = (emailToVerify || user?.email || '').trim().toLowerCase();
    if (!target) return { success: false, message: 'Email address is required.' };

    const token = 'verify_' + Math.random().toString(36).substring(2, 10);
    const sentAt = Date.now();

    if (user && (user.email.toLowerCase() === target || user.isGuest)) {
      const updatedUser: User = {
        ...user,
        email: target,
        verificationToken: token,
        verificationSentAt: sentAt,
      };
      setUser(updatedUser);
      if (!user.isGuest) {
        const accounts = getRegisteredAccounts();
        const updated = accounts.map((a) =>
          a.email.toLowerCase() === target
            ? { ...a, verificationToken: token, verificationSentAt: sentAt }
            : a
        );
        saveRegisteredAccounts(updated);
      }
    }

    return {
      success: true,
      message: `Verification email sent to ${target}. Please click the link inside to verify.`,
      token,
    };
  };

  const verifyEmailToken = (token: string) => {
    if (!token) return { success: false, error: 'Invalid verification token.' };

    const accounts = getRegisteredAccounts();
    const accountMatch = accounts.find((a) => a.verificationToken === token);

    if (user && user.verificationToken === token) {
      const updatedUser: User = {
        ...user,
        isEmailVerified: true,
        verificationToken: undefined,
      };
      setUser(updatedUser);
      if (!user.isGuest) {
        const updated = accounts.map((a) =>
          a.email.toLowerCase() === user.email.toLowerCase()
            ? { ...a, isEmailVerified: true, verificationToken: undefined }
            : a
        );
        saveRegisteredAccounts(updated);
      }
      return { success: true };
    }

    if (accountMatch) {
      const updated = accounts.map((a) =>
        a.id === accountMatch.id ? { ...a, isEmailVerified: true, verificationToken: undefined } : a
      );
      saveRegisteredAccounts(updated);
      if (user && user.email.toLowerCase() === accountMatch.email.toLowerCase()) {
        setUser({ ...user, isEmailVerified: true, verificationToken: undefined });
      }
      return { success: true };
    }

    return { success: false, error: 'Verification link expired or invalid.' };
  };

  const resetPasswordRequest = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();
    const match = accounts.find((a) => a.email.toLowerCase() === trimmed);
    if (!match) {
      return { success: false, error: 'No registered account found with that email address.' };
    }
    return { success: true, code: '749201' };
  };

  const resetPasswordConfirm = (email: string, code: string, newPassword: string) => {
    if (code !== '749201') {
      return { success: false, error: 'Invalid verification code.' };
    }
    const trimmed = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();
    const updated = accounts.map((a) => (a.email.toLowerCase() === trimmed ? { ...a, passwordHash: newPassword } : a));
    saveRegisteredAccounts(updated);
    return { success: true };
  };

  const setupSecurityCredentials = (pattern: string, pin: string) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      patternCode: pattern,
      pinCode: pin,
      passcodeMode: user.passcodeMode || 'duo',
    };
    setUser(updatedUser);

    if (!user.isGuest) {
      const accounts = getRegisteredAccounts();
      const updated = accounts.map((a) => (a.email.toLowerCase() === user.email.toLowerCase() ? { ...a, patternCode: pattern, pinCode: pin } : a));
      saveRegisteredAccounts(updated);
    }
  };

  const updatePasscodeSettings = (params: {
    mode?: PasscodeMode;
    pin?: string;
    pattern?: string;
    decoyPin?: string;
    fourLetterCode?: string;
    decoyFourLetterCode?: string;
    sixDigitPasscode?: string;
    decoySixDigitPasscode?: string;
    faceBiometricRegistered?: boolean;
  }) => {
    if (!user) return;
    const cleanSixCode = params.sixDigitPasscode ? params.sixDigitPasscode.replace(/\D/g, '').slice(0, 6) : (user.sixDigitPasscode || '123456');
    const cleanDecoySix = params.decoySixDigitPasscode ? params.decoySixDigitPasscode.replace(/\D/g, '').slice(0, 6) : (user.decoySixDigitPasscode || '999999');
    const cleanFourCode = params.fourLetterCode ? params.fourLetterCode.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) : user.fourLetterCode || 'VALT';
    const cleanDecoyFour = params.decoyFourLetterCode ? params.decoyFourLetterCode.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) : user.decoyFourLetterCode || 'AWAY';
    
    const updatedUser: User = {
      ...user,
      passcodeMode: params.mode || user.passcodeMode || 'code_only',
      sixDigitPasscode: cleanSixCode,
      decoySixDigitPasscode: cleanDecoySix,
      fourLetterCode: cleanFourCode,
      decoyFourLetterCode: cleanDecoyFour,
      pinCode: params.pin || user.pinCode || '1234',
      patternCode: params.pattern || user.patternCode || '1-2-3-6-9',
      decoyPinCode: params.decoyPin || user.decoyPinCode || '9999',
      faceBiometricRegistered: params.faceBiometricRegistered !== undefined ? params.faceBiometricRegistered : (user.faceBiometricRegistered ?? true),
    };
    setUser(updatedUser);

    if (!user.isGuest) {
      const accounts = getRegisteredAccounts();
      const updated = accounts.map((a) =>
        a.email.toLowerCase() === user.email.toLowerCase()
          ? {
              ...a,
              passcodeMode: params.mode || a.passcodeMode || 'code_only',
              sixDigitPasscode: cleanSixCode,
              decoySixDigitPasscode: cleanDecoySix,
              fourLetterCode: cleanFourCode,
              decoyFourLetterCode: cleanDecoyFour,
              pinCode: params.pin || a.pinCode,
              patternCode: params.pattern || a.patternCode,
              decoyPinCode: params.decoyPin || a.decoyPinCode,
              faceBiometricRegistered: params.faceBiometricRegistered !== undefined ? params.faceBiometricRegistered : a.faceBiometricRegistered,
            }
          : a
      );
      saveRegisteredAccounts(updated);
    }
  };

  const verifyPasscode = (params: {
    pin?: string;
    pattern?: string;
    fourLetterCode?: string;
    sixDigitPasscode?: string;
    passcode?: string;
  }): { success: boolean; isDecoy?: boolean; error?: string } => {
    if (!user) return { success: false, error: 'User session not found' };

    const expectedSixCode = (user.sixDigitPasscode || '123456').trim();
    const decoySixCode = (user.decoySixDigitPasscode || '999999').trim();
    const expectedCode = (user.fourLetterCode || 'VALT').toUpperCase().trim();
    const decoyCode = (user.decoyFourLetterCode || 'AWAY').toUpperCase().trim();
    const expectedPin = user.pinCode || '1234';
    const expectedPattern = user.patternCode || '1-2-3-6-9';
    const decoyPin = user.decoyPinCode || '9999';

    // 1) 6-digit passcode check
    const sixInput = params.sixDigitPasscode || params.passcode;
    if (sixInput !== undefined) {
      const cleanDigits = sixInput.replace(/\D/g, '').trim();
      if (cleanDigits === decoySixCode) {
        setIsDecoyMode(true);
        setIsVaultLocked(false);
        return { success: true, isDecoy: true };
      }
      if (cleanDigits === expectedSixCode) {
        setIsDecoyMode(false);
        setIsVaultLocked(false);
        return { success: true, isDecoy: false };
      }
      return { success: false, error: 'Incorrect 6-digit passcode. Default is "123456".' };
    }

    // 2) 4-Letter Security Code fallback check
    if (params.fourLetterCode !== undefined) {
      const inputCode = params.fourLetterCode.trim();
      if (inputCode === decoyCode || inputCode === decoySixCode) {
        setIsDecoyMode(true);
        setIsVaultLocked(false);
        return { success: true, isDecoy: true };
      }
      if (inputCode === expectedCode || inputCode === expectedSixCode) {
        setIsDecoyMode(false);
        setIsVaultLocked(false);
        return { success: true, isDecoy: false };
      }
      return { success: false, error: 'Incorrect passcode. Default is "123456".' };
    }

    // PIN check
    if (params.pin) {
      if (params.pin === decoyPin || params.pin === decoySixCode) {
        setIsDecoyMode(true);
        setIsVaultLocked(false);
        return { success: true, isDecoy: true };
      }
      if (params.pin === expectedPin || params.pin === expectedSixCode) {
        setIsDecoyMode(false);
        setIsVaultLocked(false);
        return { success: true, isDecoy: false };
      }
      return { success: false, error: 'Incorrect PIN passcode' };
    }

    if (params.pattern) {
      if (params.pattern === expectedPattern) {
        setIsDecoyMode(false);
        setIsVaultLocked(false);
        return { success: true, isDecoy: false };
      }
      return { success: false, error: 'Incorrect Pattern password' };
    }

    return { success: false, error: 'Passcode required' };
  };

  const verifySecurityCredentials = (pattern: string, pin: string): boolean => {
    const res = verifyPasscode({ pattern, pin });
    return res.success;
  };

  const exitDecoyMode = () => {
    setIsDecoyMode(false);
    setIsVaultLocked(true);
  };

  const requestSecurityRecoveryCode = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();
    const match = accounts.find((a) => a.email.toLowerCase() === trimmed);
    if (!match && (!user || (user.email && user.email.toLowerCase() !== trimmed))) {
      return { success: false, error: 'No registered account found with that email address.' };
    }
    return { success: true, code: '749201' };
  };

  const recoverSecurityCredentials = (email: string, code: string, newPattern: string, newPin: string): boolean => {
    if (code !== '749201') return false;
    setupSecurityCredentials(newPattern, newPin);
    setIsVaultLocked(false);
    return true;
  };

  const resetPasscodeViaEmail = (email: string, recoveryCode: string, newPasscode: string): { success: boolean; error?: string } => {
    if (recoveryCode.trim() !== '749201') {
      return { success: false, error: 'Invalid 6-digit email confirmation code. Check your inbox.' };
    }
    const clean = newPasscode.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) {
      return { success: false, error: 'New passcode must be exactly 6 digits (0-9).' };
    }

    if (user) {
      const updatedUser: User = {
        ...user,
        sixDigitPasscode: clean,
      };
      setUser(updatedUser);

      if (!user.isGuest) {
        const accounts = getRegisteredAccounts();
        const updated = accounts.map((a) =>
          a.email.toLowerCase() === user.email.toLowerCase()
            ? { ...a, sixDigitPasscode: clean }
            : a
        );
        saveRegisteredAccounts(updated);
      }
    }
    setIsVaultLocked(false);
    setIsDecoyMode(false);
    return { success: true };
  };

  const resetFourLetterCodeViaEmail = (email: string, recoveryCode: string, newFourLetterCode: string): { success: boolean; error?: string } => {
    return resetPasscodeViaEmail(email, recoveryCode, newFourLetterCode);
  };

  const lockVault = () => setIsVaultLocked(true);
  const unlockVault = () => setIsVaultLocked(false);

  const updateUserPreferences = (prefs: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...prefs } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isFirebaseConnected,
        isAuthenticated: !!user && !user.isGuest,
        isVaultLocked,
        isDecoyMode,
        login,
        signup,
        signInWithGoogle,
        loginAsGuest,
        logout,
        sendVerificationEmail,
        verifyEmailToken,
        resetPasswordRequest,
        resetPasswordConfirm,
        setupSecurityCredentials,
        verifySecurityCredentials,
        verifyPasscode,
        updatePasscodeSettings,
        requestSecurityRecoveryCode,
        recoverSecurityCredentials,
        resetFourLetterCodeViaEmail,
        resetPasscodeViaEmail,
        lockVault,
        unlockVault,
        exitDecoyMode,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
