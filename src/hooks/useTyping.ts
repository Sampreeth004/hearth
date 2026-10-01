"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { setTyping } from "@/services/chatService";

const TYPING_WINDOW_MS = 4500;
const TYPING_THROTTLE_MS = 2000;
const TYPING_IDLE_MS = 3000;

interface TypingEntry {
  toMillis?: () => number;
}

/**
 * Subscribes to the conversation's ephemeral `typing` map and reports
 * whether the other participant is currently typing. The timestamp decays
 * client-side so a stale flag can never get stuck on.
 */
export function useTyping(
  conversationId: string | null,
  otherUserId: string | null
) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  useEffect(() => {
    const firestore = db;
    if (!firestore || !conversationId || !otherUserId) return;

    let lastTypingAt: number | null = null;

    const evaluate = () => {
      const active =
        lastTypingAt !== null && Date.now() - lastTypingAt < TYPING_WINDOW_MS;
      setIsOtherTyping((prev) => (prev === active ? prev : active));
    };

    const unsubscribe = onSnapshot(
      doc(firestore, "conversations", conversationId),
      (snap) => {
        const typing = snap.data()?.typing as
          | Record<string, TypingEntry | null>
          | undefined;
        const entry = typing?.[otherUserId];
        lastTypingAt =
          entry && typeof entry.toMillis === "function" ? entry.toMillis() : null;
        evaluate();
      },
      (error) => {
        console.error("Failed to subscribe to typing state", error);
      }
    );

    const interval = window.setInterval(evaluate, 1500);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [conversationId, otherUserId]);

  return { isOtherTyping };
}

/**
 * Throttles writing our own typing state to Firestore (at most once every
 * 2s) and clears it after 3s of inactivity or when sending.
 */
export function useTypingSignal(conversationId: string | null, userId: string) {
  const lastSentRef = useRef(0);
  const idleTimerRef = useRef<number | null>(null);

  const stopTyping = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (lastSentRef.current !== 0 && conversationId) {
      lastSentRef.current = 0;
      setTyping(conversationId, userId, false).catch((error) => {
        console.error("Failed to clear typing state", error);
      });
    }
  }, [conversationId, userId]);

  const notifyTyping = useCallback(() => {
    if (!conversationId) return;

    const now = Date.now();
    if (now - lastSentRef.current > TYPING_THROTTLE_MS) {
      lastSentRef.current = now;
      setTyping(conversationId, userId, true).catch((error) => {
        console.error("Failed to set typing state", error);
      });
    }

    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = null;
      stopTyping();
    }, TYPING_IDLE_MS);
  }, [conversationId, userId, stopTyping]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (lastSentRef.current !== 0 && conversationId) {
        lastSentRef.current = 0;
        setTyping(conversationId, userId, false).catch(() => {
          // Best-effort cleanup; the timestamp decays anyway.
        });
      }
    };
  }, [conversationId, userId]);

  return { notifyTyping, stopTyping };
}
