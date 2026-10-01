import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { mapUser } from "@/services/mappers";
import type { UserProfile } from "@/types";

const SEARCH_FIELDS = ["usernameLower", "displayNameLower", "emailLower"] as const;

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return mapUser(snap.id, snap.data());
}

export async function getUserProfiles(uids: string[]): Promise<UserProfile[]> {
  if (!db || uids.length === 0) return [];
  const uniqueUids = [...new Set(uids)];
  const profiles = await Promise.all(uniqueUids.map(getUserProfile));
  return profiles.filter((p): p is UserProfile => p !== null);
}

export async function searchUsers(
  searchTerm: string,
  currentUserId: string,
  maxResults = 20
): Promise<UserProfile[]> {
  if (!db) throw new Error("Firestore is not configured");

  const term = searchTerm.trim().toLowerCase().replace(/^@/, "");
  if (!term) return [];

  const usersRef = collection(db, "users");
  const snapshots = await Promise.all(
    SEARCH_FIELDS.map((field) =>
      getDocs(
        query(
          usersRef,
          where(field, ">=", term),
          where(field, "<=", term + "\uf8ff"),
          limit(maxResults)
        )
      )
    )
  );

  const results = new Map<string, UserProfile>();
  for (const snap of snapshots) {
    for (const docSnap of snap.docs) {
      if (docSnap.id === currentUserId || results.has(docSnap.id)) continue;
      results.set(docSnap.id, mapUser(docSnap.id, docSnap.data()));
    }
  }

  return [...results.values()]
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .slice(0, maxResults);
}

export interface ProfileUpdate {
  displayName?: string;
  username?: string;
  bio?: string;
  photoURL?: string;
}

export async function updateUserProfile(
  uid: string,
  data: ProfileUpdate
): Promise<void> {
  if (!db) throw new Error("Firestore is not configured");

  const payload: Record<string, unknown> = { lastSeen: serverTimestamp() };

  if (data.displayName !== undefined) {
    const displayName = data.displayName.trim();
    payload.displayName = displayName;
    payload.displayNameLower = displayName.toLowerCase();
  }
  if (data.username !== undefined) {
    const username = data.username.trim().toLowerCase();
    payload.username = username;
    payload.usernameLower = username;
  }
  if (data.bio !== undefined) {
    payload.bio = data.bio.trim();
  }
  if (data.photoURL !== undefined) {
    payload.photoURL = data.photoURL;
  }

  await updateDoc(doc(db, "users", uid), payload);
}

export async function isUsernameAvailable(
  username: string,
  currentUid: string
): Promise<boolean> {
  if (!db) return false;
  const usersRef = collection(db, "users");
  const snap = await getDocs(
    query(usersRef, where("usernameLower", "==", username.trim().toLowerCase()), limit(5))
  );
  return snap.docs.every((d) => d.id === currentUid);
}
