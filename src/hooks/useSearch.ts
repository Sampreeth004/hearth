"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchUsers } from "@/services/userService";
import { getFriendlyErrorMessage } from "@/lib/utils";
import type { UserProfile } from "@/types";

const DEBOUNCE_MS = 300;

export function useSearch(currentUserId: string | undefined) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const performSearch = useCallback(
    async (term: string) => {
      const requestId = ++requestIdRef.current;

      if (!currentUserId || !term.trim()) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const users = await searchUsers(term, currentUserId);
        if (requestId !== requestIdRef.current) return;
        setResults(users);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("User search failed", err);
        setError(getFriendlyErrorMessage(err));
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(searchTerm), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, performSearch]);

  return { searchTerm, setSearchTerm, results, loading, error };
}
