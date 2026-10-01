"use client";

import { useEffect } from "react";
import { updatePresence } from "@/services/authService";

const HEARTBEAT_MS = 45 * 1000;

export function usePresence(uid: string | undefined) {
  useEffect(() => {
    if (!uid) return;

    let disposed = false;

    const report = (isOnline: boolean) => {
      if (disposed) return;
      updatePresence(uid, isOnline).catch((error) => {
        console.error("Failed to update presence", error);
      });
    };

    report(true);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        report(true);
      }
    }, HEARTBEAT_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        report(true);
      } else {
        report(false);
      }
    };

    const handlePageHide = () => {
      report(false);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    };
  }, [uid]);
}
