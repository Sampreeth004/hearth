"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-slide-up flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="animate-float relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-glass-subtle shadow-[0_6px_16px_rgba(51,39,42,0.07)]">
        <Icon className="h-7 w-7 text-accent-text" />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-accent-soft opacity-60"
        />
      </div>
      <h3 className="mb-1 text-lg font-bold text-ink">{title}</h3>
      <p className="font-dm mb-5 max-w-xs text-sm text-ink-muted">{description}</p>
      {action && (
        <Button type="button" size="sm" onClick={action.onClick} className="px-5">
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-danger-line bg-danger-soft">
        <svg className="h-8 w-8 text-danger-strong" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-bold text-ink">{title}</h3>
      <p className="mb-4 text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button type="button" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} />;
}
