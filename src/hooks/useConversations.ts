"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { mapConversation } from "@/services/mappers";
import type { Conversation } from "@/types";

// Typing indicators and read receipts update the conversation document every
// couple of seconds. Re-rendering the whole app shell for changes that are not
// visible in the list would make animations stutter, so only accept snapshots
// that actually change something the list renders.
function isSameConversationList(
  previous: Conversation[],
  next: Conversation[]
): boolean {
  if (previous.length !== next.length) return false;
  for (let i = 0; i < previous.length; i++) {
    const a = previous[i];
    const b = next[i];
    if (
      a.id !== b.id ||
      a.lastMessage !== b.lastMessage ||
      a.lastMessageAt !== b.lastMessageAt ||
      a.lastMessageSenderId !== b.lastMessageSenderId
    ) {
      return false;
    }
    const aKeys = Object.keys(a.unreadCount);
    const bKeys = Object.keys(b.unreadCount);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (a.unreadCount[key] !== b.unreadCount[key]) return false;
    }
  }
  return true;
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !db) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setConversations((prev) => {
          const next = snap.docs.map((d) => mapConversation(d.id, d.data()));
          return isSameConversationList(prev, next) ? prev : next;
        });
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to conversations", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const getTotalUnread = useCallback(() => {
    if (!userId) return 0;
    return conversations.reduce(
      (sum, c) => sum + (c.unreadCount?.[userId] ?? 0),
      0
    );
  }, [conversations, userId]);

  return { conversations, loading, getTotalUnread };
}
