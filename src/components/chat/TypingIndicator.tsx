"use client";

import { cn } from "@/lib/utils";

export function TypingBubble() {
  return (
    <div className="animate-bubble-in-left mb-2.5 flex justify-start">
      <div
        role="status"
        aria-label="Typing"
        className="bubble-in flex items-center gap-1.5 rounded-3xl rounded-bl-lg px-4 py-3.5"
      >
        <span className="typing-dot h-2 w-2 rounded-full bg-ink-muted" />
        <span className="typing-dot h-2 w-2 rounded-full bg-ink-muted" />
        <span className="typing-dot h-2 w-2 rounded-full bg-accent" />
      </div>
    </div>
  );
}

export function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
    </span>
  );
}
