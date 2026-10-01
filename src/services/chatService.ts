import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  startAfter,
  writeBatch,
  increment,
  deleteField,
  setDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getDocIfAllowed } from "@/lib/firebase/reads";
import { mapConversation, mapMessage } from "@/services/mappers";
import { isGifUrl } from "@/lib/utils";
import type { Conversation, Message, ReplyReference } from "@/types";

export const MESSAGES_PAGE_SIZE = 30;

export type MessageCursor = QueryDocumentSnapshot<DocumentData>;

export function getConversationId(userA: string, userB: string): string {
  return [userA, userB].sort().join("_");
}

export async function getOrCreateConversation(
  userA: string,
  userB: string
): Promise<string> {
  if (!db) throw new Error("Firestore is not configured");

  const conversationId = getConversationId(userA, userB);
  const conversationRef = doc(db, "conversations", conversationId);

  const snap = await getDocIfAllowed(conversationRef);
  if (snap?.exists()) return conversationId;

  const participants = [userA, userB].sort();
  await setDoc(conversationRef, {
    participants,
    lastMessage: "",
    lastMessageAt: null,
    lastMessageSenderId: "",
    unreadCount: { [participants[0]]: 0, [participants[1]]: 0 },
    createdAt: serverTimestamp(),
  });

  return conversationId;
}

export async function getUserConversations(
  userId: string,
  maxResults = 50
): Promise<Conversation[]> {
  if (!db) return [];
  const snap = await getDocs(
    query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc"),
      limit(maxResults)
    )
  );
  return snap.docs.map((d) => mapConversation(d.id, d.data()));
}

export interface MessagePayload {
  text?: string;
  gifUrl?: string;
  imageUrl?: string;
  replyTo?: ReplyReference;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  payload: MessagePayload
): Promise<string> {
  if (!db) throw new Error("Firestore is not configured");

  const text = (payload.text ?? "").trim();
  const explicitGif = (payload.gifUrl ?? "").trim();
  const imageUrl = (payload.imageUrl ?? "").trim() || null;
  const gifUrl = explicitGif
    ? explicitGif
    : isGifUrl(text)
      ? text
      : null;

  if (imageUrl && !imageUrl.startsWith("data:image/")) {
    throw new Error("That photo could not be sent.");
  }
  if (gifUrl && !isGifUrl(gifUrl)) {
    throw new Error("That does not look like a valid GIF link.");
  }
  if (!gifUrl && !imageUrl && !text) {
    throw new Error("Message cannot be empty.");
  }

  const isMediaMessage = Boolean(imageUrl);
  const messageDoc: Record<string, unknown> = {
    senderId,
    receiverId,
    text: gifUrl || isMediaMessage ? "" : text,
    messageType: gifUrl ? "gif" : isMediaMessage ? "image" : "text",
    createdAt: serverTimestamp(),
    read: false,
  };
  if (gifUrl) {
    messageDoc.gifUrl = gifUrl;
  }
  if (imageUrl) {
    messageDoc.imageUrl = imageUrl;
  }
  if (payload.replyTo) {
    messageDoc.replyTo = {
      messageId: payload.replyTo.messageId.slice(0, 64),
      senderName: payload.replyTo.senderName.slice(0, 100),
      preview: payload.replyTo.preview.slice(0, 200),
    };
  }

  const messageRef = await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    messageDoc
  );

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: gifUrl ? "GIF" : isMediaMessage ? "Photo" : text,
    lastMessageAt: serverTimestamp(),
    lastMessageSenderId: senderId,
    [`unreadCount.${receiverId}`]: increment(1),
  });

  return messageRef.id;
}

export async function toggleReaction(
  conversationId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> {
  if (!db) throw new Error("Firestore is not configured");
  const messageRef = doc(db, "conversations", conversationId, "messages", messageId);
  const snap = await getDoc(messageRef);
  const reactions = (snap.data()?.reactions ?? {}) as Record<string, string>;
  const current = reactions[userId];
  await updateDoc(messageRef, {
    [`reactions.${userId}`]: current === emoji ? deleteField() : emoji,
  });
}

export async function setTyping(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "conversations", conversationId), {
    [`typing.${userId}`]: isTyping ? serverTimestamp() : null,
  });
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  if (!db) return;

  const conversationRef = doc(db, "conversations", conversationId);
  const unreadSnap = await getDocs(
    query(
      collection(db, "conversations", conversationId, "messages"),
      where("receiverId", "==", userId),
      where("read", "==", false),
      limit(500)
    )
  );

  await updateDoc(conversationRef, { [`unreadCount.${userId}`]: 0 });

  if (unreadSnap.empty) return;

  const docs = unreadSnap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    for (const docSnap of docs.slice(i, i + 400)) {
      batch.update(docSnap.ref, { read: true });
    }
    await batch.commit();
  }
}

export async function getMessages(
  conversationId: string,
  pageSize = MESSAGES_PAGE_SIZE,
  cursor?: MessageCursor | null
): Promise<{ messages: Message[]; cursor: MessageCursor | null; hasMore: boolean }> {
  if (!db) return { messages: [], cursor: null, hasMore: false };

  const q = cursor
    ? query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize)
      )
    : query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );

  const snap = await getDocs(q);
  const messages = snap.docs.map((d) => mapMessage(d.id, d.data())).reverse();
  return {
    messages,
    cursor: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    hasMore: snap.docs.length === pageSize,
  };
}
