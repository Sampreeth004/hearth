"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { mapUser } from "@/services/mappers";
import type { UserProfile } from "@/types";

export function useProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const firestore = db;
    if (!uid || !firestore) return;

    const unsubscribe = onSnapshot(
      doc(firestore, "users", uid),
      (snap) => {
        setProfile(snap.exists() ? mapUser(snap.id, snap.data()) : null);
        setLoading(false);
      },
      (snapshotError) => {
        console.error(
          "Failed to load your profile. Make sure the Firestore security rules from firestore.rules are deployed.",
          snapshotError
        );
        setError(snapshotError);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setAttempt((value) => value + 1);
  }, []);

  return { profile, loading, error, retry };
}
