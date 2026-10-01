import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { isPermissionDenied } from "@/lib/firebase/reads";
import { generateUsername } from "@/lib/utils";
import { mapUser } from "@/services/mappers";
import type { UserProfile } from "@/types";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const POPUP_FALLBACK_ERROR_CODES = [
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
];

function isPopupFallbackError(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  return POPUP_FALLBACK_ERROR_CODES.includes(code);
}

/**
 * Tries popup sign-in (keeps the user on the page) and automatically falls
 * back to a full-page redirect when the browser blocks popups (Brave, Safari
 * strict mode, popup-blocker extensions, most mobile browsers). Returns the
 * signed-in user, or null when a redirect was started instead.
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!auth || !db) throw new Error("Firebase is not configured");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(result.user);
    return result.user;
  } catch (error) {
    if (isPopupFallbackError(error)) {
      console.warn("Sign-in popup was blocked; falling back to redirect sign-in.");
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function signInWithGoogleRedirect(): Promise<void> {
  if (!auth || !db) throw new Error("Firebase is not configured");
  await signInWithRedirect(auth, googleProvider);
}

/**
 * Must run on every app load; completes a pending redirect sign-in and
 * ensures the Firestore profile exists.
 */
export async function completeRedirectSignIn(): Promise<User | null> {
  if (!auth || !db) return null;
  const result = await getRedirectResult(auth);
  if (result?.user) {
    await ensureUserDocument(result.user);
    return result.user;
  }
  return null;
}

export async function signOut(): Promise<void> {
  if (!auth) return;
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

function buildSearchableFields(displayName: string, username: string, email: string) {
  return {
    displayNameLower: displayName.trim().toLowerCase(),
    usernameLower: username.trim().toLowerCase(),
    emailLower: email.trim().toLowerCase(),
  };
}

export async function ensureUserDocument(user: User): Promise<UserProfile> {
  if (!db) throw new Error("Firestore is not configured");
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const displayName = user.displayName ?? "New User";
    const email = user.email ?? "";
    const username = generateUsername(email);
    await setDoc(userRef, {
      displayName,
      email,
      photoURL: user.photoURL ?? "",
      username,
      bio: "",
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
      ...buildSearchableFields(displayName, username, email),
    });
    const created = await getDoc(userRef);
    return mapUser(created.id, created.data() ?? {});
  }

  const data = snap.data();
  const googleName = user.displayName?.trim() || "New User";
  const storedName =
    typeof data.displayName === "string" ? data.displayName.trim() : "";
  // Heal documents created before the Google name was available (presence
  // stub race) so users see their real name instead of "New User".
  const displayName =
    storedName && storedName !== "New User" ? storedName : googleName;
  const email = typeof data.email === "string" ? data.email : user.email ?? "";
  const username =
    typeof data.username === "string" && data.username ? data.username : generateUsername(email);

  await setDoc(
    userRef,
    {
      displayName,
      email,
      photoURL:
        typeof data.photoURL === "string" && data.photoURL
          ? data.photoURL
          : user.photoURL ?? "",
      username,
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: data.createdAt ?? serverTimestamp(),
      ...buildSearchableFields(displayName, username, email),
    },
    { merge: true }
  );

  return mapUser(snap.id, { ...data, displayName, email, username });
}

export async function updatePresence(uid: string, isOnline: boolean): Promise<void> {
  if (!db || !auth) return;
  const store = db;

  // Auth may still be restoring the persisted session when the first
  // presence heartbeat fires. Wait for it, then verify the write will be
  // sent as this user; an unauthenticated write is rejected by the rules
  // with "Missing or insufficient permissions".
  await auth.authStateReady();
  if (auth.currentUser?.uid !== uid) return;

  // merge:true so a heartbeat that fires before the profile document exists
  // creates a stub instead of throwing "No document to update". The profile
  // fields are backfilled by ensureUserDocument / the app's self-heal.
  const write = () =>
    setDoc(
      doc(store, "users", uid),
      { isOnline, lastSeen: serverTimestamp() },
      { merge: true }
    );

  try {
    await write();
  } catch (error) {
    // A token refresh (or a concurrent sign-out) can invalidate a write that
    // was already in flight. Retry once while the same user is still signed in.
    if (!isPermissionDenied(error) || auth.currentUser?.uid !== uid) throw error;
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (auth.currentUser?.uid !== uid) return;
    await write();
  }
}
