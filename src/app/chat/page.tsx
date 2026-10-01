"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";

export default function ChatPage() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (initializing || user) return;

    // Hard redirect on sign-out: closing the in-app back layers schedules a
    // history traversal, and a client-side replace would race with it (Next
    // would sync back to /chat). A full navigation resets history cleanly.
    const goToLogin = () => window.location.replace("/login");
    goToLogin();
    // If a lingering history traversal cancels the first attempt, retry on
    // the next history/page event so the user is never stranded.
    window.addEventListener("popstate", goToLogin);
    window.addEventListener("pageshow", goToLogin);
    return () => {
      window.removeEventListener("popstate", goToLogin);
      window.removeEventListener("pageshow", goToLogin);
    };
  }, [user, initializing]);

  if (initializing || !user) {
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

  return <AppShell />;
}
