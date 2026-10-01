"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  onAuthChange,
  signInWithGoogle,
  signInWithGoogleRedirect,
  completeRedirectSignIn,
  signOut as firebaseSignOut,
  updatePresence,
} from "@/services/authService";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { isPermissionDenied } from "@/lib/firebase/reads";
import { usePresence } from "@/hooks/usePresence";

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  signingIn: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signInWithRedirect: () => Promise<void>;
  logOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthChange((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
  }, []);

  // Completes a pending redirect sign-in (popup-blocked fallback) on load.
  useEffect(() => {
    completeRedirectSignIn().catch((err) => {
      console.error("Redirect sign-in failed", err);
      setError(getFriendlyErrorMessage(err));
    });
  }, []);

  usePresence(user?.uid);

  const signIn = useCallback(async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in failed", err);
      setError(getFriendlyErrorMessage(err));
      setSigningIn(false);
    }
    // On success with a popup the auth listener updates state; with a redirect
    // the page navigates away, so signingIn stays true until then.
  }, []);

  const signInWithRedirect = useCallback(async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogleRedirect();
    } catch (err) {
      console.error("Redirect sign-in failed", err);
      setError(getFriendlyErrorMessage(err));
      setSigningIn(false);
    }
  }, []);

  const logOut = useCallback(async () => {
    setError(null);
    try {
      if (user) {
        // Fire and forget: a queued/offline presence write must never block
        // signing out (Firestore retries those indefinitely). The write can
        // legitimately be denied when sign-out revokes the session first.
        updatePresence(user.uid, false).catch((err) => {
          if (!isPermissionDenied(err)) {
            console.error("Failed to update presence on sign out", err);
          }
        });
      }
      await firebaseSignOut();
      // The auth listener normally clears this, but the UI must never stay
      // signed-in just because a listener was slow.
      setUser(null);
      setInitializing(false);
    } catch (err) {
      console.error("Sign out failed", err);
      setError(getFriendlyErrorMessage(err));
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      signingIn,
      error,
      signIn,
      signInWithRedirect,
      logOut,
      clearError,
    }),
    [user, initializing, signingIn, error, signIn, signInWithRedirect, logOut, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
