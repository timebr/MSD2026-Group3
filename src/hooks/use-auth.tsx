import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authRepository } from '@/api';
import type { User } from '@/models/user';

interface AuthState {
  /** False until the saved session has been read on launch. */
  ready: boolean;
  user: User | null;
  /** Chose "Continue as guest" on the welcome screen during this app session. */
  isGuest: boolean;
  logIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  logOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Who is using the app. Guests can browse; placing a booking and seeing
 * bookings needs an account (S3). Logins persist across launches; the guest
 * choice doesn't, so a guest sees the welcome screen again on the next launch.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    authRepository
      .currentUser()
      .then(setUser)
      .finally(() => setReady(true));
  }, []);

  const logIn = useCallback(async (input: { email: string; password: string }) => {
    setUser(await authRepository.logIn(input));
  }, []);

  const signUp = useCallback(async (input: { name: string; email: string; password: string }) => {
    setUser(await authRepository.signUp(input));
  }, []);

  const logOut = useCallback(async () => {
    await authRepository.logOut();
    setUser(null);
    setIsGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => setIsGuest(true), []);

  const value = useMemo(
    () => ({ ready, user, isGuest, logIn, signUp, logOut, continueAsGuest }),
    [ready, user, isGuest, logIn, signUp, logOut, continueAsGuest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
