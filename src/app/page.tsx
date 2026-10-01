"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing) {
      router.replace(user ? "/chat" : "/login");
    }
  }, [user, initializing, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-b-accent"
      />
    </div>
  );
}
