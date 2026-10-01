"use client";

import { Check, AlertTriangle, Info, X } from "lucide-react";
import { useToast, type ToastType } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

const icons: Record<ToastType, typeof Check> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
};

const iconStyles: Record<ToastType, string> = {
  success: "bg-success text-ink shadow-[0_8px_20px_rgba(62,142,90,0.25)]",
  error: "bg-danger text-ink shadow-[0_8px_20px_rgba(179,86,74,0.25)]",
  info: "bg-accent-gradient text-ink glow-accent",
};

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className="glass-menu animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3"
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                iconStyles[toast.type]
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{toast.message}</p>
              {toast.description && (
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="glass-icon-btn h-7 w-7"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
