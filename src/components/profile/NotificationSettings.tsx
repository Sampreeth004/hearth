"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import {
  disablePushNotifications,
  enablePushNotifications,
  isPushEnabled,
  isPushSupported,
} from "@/services/pushService";
import { getFriendlyErrorMessage } from "@/lib/utils";

type PushStatus = "loading" | "unsupported" | "default" | "enabled" | "denied";

export function NotificationSettings({ uid }: { uid: string }) {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [busy, setBusy] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!isPushSupported()) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const enabled = await isPushEnabled();
      setStatus(enabled ? "enabled" : "default");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setBusy(true);
    try {
      await enablePushNotifications(uid);
      setStatus("enabled");
      addToast("Notifications enabled");
    } catch (error) {
      console.error("Failed to enable notifications", error);
      addToast(getFriendlyErrorMessage(error), "error");
      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        setStatus("denied");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      await disablePushNotifications(uid);
      setStatus("default");
      addToast("Notifications disabled", "info");
    } catch (error) {
      console.error("Failed to disable notifications", error);
      addToast(getFriendlyErrorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading" || status === "unsupported") return null;

  return (
    <div className="glass-tint rounded-3xl px-5 py-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">
        Notifications
      </h3>
      {status === "denied" ? (
        <p className="font-dm text-xs text-ink-muted">
          Notifications are blocked for Hearth. Allow them in your browser or
          system settings to get message alerts.
        </p>
      ) : status === "enabled" ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleDisable()}
          loading={busy}
          className="w-full"
        >
          <BellOff className="h-4 w-4" />
          Turn off notifications
        </Button>
      ) : (
        <>
          <Button
            type="button"
            onClick={() => void handleEnable()}
            loading={busy}
            className="w-full"
          >
            <Bell className="h-4 w-4" />
            Enable notifications
          </Button>
          <p className="font-dm mt-2 text-xs text-ink-muted">
            Get alerted about new messages when Hearth is closed.
          </p>
        </>
      )}
    </div>
  );
}
