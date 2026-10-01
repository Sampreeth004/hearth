import {
  doc,
  getDocs,
  collection,
  query,
  where,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getDocIfAllowed, isPermissionDenied } from "@/lib/firebase/reads";
import { mapFriendRequest } from "@/services/mappers";
import type { FriendRequest } from "@/types";

export function getPairId(userA: string, userB: string): string {
  return [userA, userB].sort().join("_");
}

export async function areFriends(userA: string, userB: string): Promise<boolean> {
  if (!db) return false;
  const snap = await getDocIfAllowed(doc(db, "friendships", getPairId(userA, userB)));
  return snap?.exists() ?? false;
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string
): Promise<void> {
  if (!db) throw new Error("Firestore is not configured");
  if (senderId === receiverId) {
    throw new Error("You cannot send a friend request to yourself.");
  }
  if (await areFriends(senderId, receiverId)) {
    throw new Error("You are already friends.");
  }

  const requestId = getPairId(senderId, receiverId);
  const requestRef = doc(db, "friendRequests", requestId);
  const snap = await getDocIfAllowed(requestRef);

  if (snap?.exists()) {
    const existing = mapFriendRequest(snap.id, snap.data());

    if (existing.status === "accepted") {
      throw new Error("You are already friends.");
    }

    if (existing.status === "pending") {
      if (existing.receiverId === senderId) {
        await acceptFriendRequest(requestId);
        return;
      }
      throw new Error("A friend request is already pending.");
    }

    await deleteDoc(requestRef);
  }

  await setDoc(requestRef, {
    senderId,
    receiverId,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  if (!db) throw new Error("Firestore is not configured");

  const requestRef = doc(db, "friendRequests", requestId);
  const snap = await getDocIfAllowed(requestRef);
  if (!snap?.exists()) throw new Error("This request no longer exists.");

  const request = snap.data();
  if (request.status !== "pending") {
    throw new Error("This request has already been handled.");
  }

  await updateDoc(requestRef, { status: "accepted" });

  const friendshipRef = doc(db, "friendships", requestId);
  const existingFriendship = await getDocIfAllowed(friendshipRef);
  if (existingFriendship?.exists()) return;

  try {
    await setDoc(friendshipRef, {
      users: [request.senderId, request.receiverId].sort(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
  }
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  if (!db) throw new Error("Firestore is not configured");
  const requestRef = doc(db, "friendRequests", requestId);
  const snap = await getDocIfAllowed(requestRef);
  if (!snap?.exists()) throw new Error("This request no longer exists.");
  await updateDoc(requestRef, { status: "rejected" });
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  if (!db) throw new Error("Firestore is not configured");
  await deleteDoc(doc(db, "friendRequests", requestId));
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  if (!db) throw new Error("Firestore is not configured");
  await deleteDoc(doc(db, "friendships", getPairId(userId, friendId)));
}

export async function getFriendRequests(
  userId: string
): Promise<FriendRequest[]> {
  if (!db) return [];
  const requestsRef = collection(db, "friendRequests");
  const [sent, received] = await Promise.all([
    getDocs(
      query(
        requestsRef,
        where("senderId", "==", userId),
        where("status", "==", "pending"),
        limit(50)
      )
    ),
    getDocs(
      query(
        requestsRef,
        where("receiverId", "==", userId),
        where("status", "==", "pending"),
        limit(50)
      )
    ),
  ]);

  const results = new Map<string, FriendRequest>();
  for (const snap of [sent, received]) {
    for (const docSnap of snap.docs) {
      results.set(docSnap.id, mapFriendRequest(docSnap.id, docSnap.data()));
    }
  }
  return [...results.values()];
}

export async function getFriends(userId: string): Promise<string[]> {
  if (!db) return [];
  const snap = await getDocs(
    query(collection(db, "friendships"), where("users", "array-contains", userId))
  );
  return snap.docs
    .map((d) => {
      const users = d.data().users as string[];
      return users.find((u) => u !== userId);
    })
    .filter((id): id is string => Boolean(id));
}
