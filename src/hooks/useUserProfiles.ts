"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { mapUser, placeholderUser } from "@/services/mappers";
import type { UserProfile } from "@/types";

export function useUserProfiles(uids: string[]) {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

  const key = useMemo(
    () => [...new Set(uids.filter(Boolean))].sort().join(","),
    [uids]
  );

  useEffect(() => {
    const firestore = db;
    if (!firestore || !key) return;

    const ids = key.split(",");
    const unsubscribes = ids.map((id) =>
      onSnapshot(
        doc(firestore, "users", id),
        (snap) => {
          // A missing profile document (e.g. the account never finished
          // onboarding) must not hide conversations, so show a placeholder
          // until the real document appears.
          const profile = snap.exists()
            ? mapUser(snap.id, snap.data())
            : placeholderUser(id);
          setProfiles((prev) => ({ ...prev, [id]: profile }));
        },
        (error) => {
          console.error("Failed to subscribe to user profile", id, error);
        }
      )
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [key]);

  return profiles;
}
