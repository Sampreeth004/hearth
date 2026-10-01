"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { mapMessage } from "@/services/mappers";
import {
  getMessages,
  MESSAGES_PAGE_SIZE,
  type MessageCursor,
} from "@/services/chatService";
import type { Message } from "@/types";

function sortByTime(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => messageTime(a) - messageTime(b));
}

// Messages with a pending server timestamp are the newest; sort them last.
function messageTime(message: Message): number {
  return message.createdAtMillis ?? Number.MAX_SAFE_INTEGER;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const cursorRef = useRef<MessageCursor | null>(null);
  const cursorInitializedRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const seenIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!conversationId || !db) return;

    cursorRef.current = null;
    cursorInitializedRef.current = false;
    loadingMoreRef.current = false;
    seenIdsRef.current = null;

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "desc"),
      limit(MESSAGES_PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const latest = snap.docs.map((d) => mapMessage(d.id, d.data())).reverse();

        // Track which messages arrived while this conversation is open, so
        // only genuinely new bubbles play the "ignite" animation. The first
        // snapshot (history) marks everything as already seen.
        const seen = seenIdsRef.current;
        if (seen === null) {
          seenIdsRef.current = new Set(latest.map((m) => m.id));
        } else {
          const newIds = latest
            .filter((m) => !seen.has(m.id))
            .map((m) => m.id);
          if (newIds.length > 0) {
            newIds.forEach((id) => seen.add(id));
            setFreshIds((prev) => {
              const next = new Set(prev);
              newIds.forEach((id) => next.add(id));
              return next;
            });
          }
        }

        setMessages((prev) => {
          const latestIds = new Set(latest.map((m) => m.id));
          const older = prev.filter((m) => !latestIds.has(m.id));
          return sortByTime([...older, ...latest]);
        });

        if (!cursorInitializedRef.current) {
          cursorRef.current =
            snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
          setHasMore(snap.docs.length === MESSAGES_PAGE_SIZE);
          cursorInitializedRef.current = true;
        }

        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to messages", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [conversationId]);

  const loadMore = useCallback(async () => {
    if (!conversationId || !cursorRef.current || !hasMore || loadingMoreRef.current) {
      return;
    }
    loadingMoreRef.current = true;
    try {
      const result = await getMessages(
        conversationId,
        MESSAGES_PAGE_SIZE,
        cursorRef.current
      );
      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id));
        const older = result.messages.filter((m) => !existing.has(m.id));
        return sortByTime([...older, ...prev]);
      });
      cursorRef.current = result.cursor ?? cursorRef.current;
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load older messages", error);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [conversationId, hasMore]);

  return { messages, loading, hasMore, loadMore, freshIds };
}
