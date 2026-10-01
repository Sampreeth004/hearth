"use client";

import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { TypingDots } from "./TypingIndicator";
import { cn, formatLastSeen, isUserOnline } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface ChatHeaderProps {
  user: UserProfile;
  onBack?: () => void;
  isTyping?: boolean;
  onOpenProfile?: () => void;
}

export function ChatHeader({
  user,
  onBack,
  isTyping,
  onOpenProfile,
}: ChatHeaderProps) {
  const online = isUserOnline(user);

  return (
    <header className="relative z-10 flex items-center gap-2 border-b border-hairline bg-glass-subtle px-3 py-2.5 sm:px-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="glass-icon-btn h-9 w-9 lg:hidden"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
      )}
      <button
        type="button"
        onClick={onOpenProfile}
        aria-label={`View ${user.displayName}'s profile`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left transition-colors hover:bg-glass-subtle active:scale-[0.995]"
      >
        <Avatar
          src={user.photoURL}
          name={user.displayName}
          size="md"
          showOnline
          isOnline={online}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-ink">
            {user.displayName}
          </h2>
          {isTyping ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-accent-text">
              typing
              <TypingDots />
            </span>
          ) : (
            <p
              className={cn(
                "text-xs font-medium",
                online ? "text-online" : "text-ink-muted"
              )}
            >
              {online ? "Online" : `Last seen ${formatLastSeen(user.lastSeen)}`}
            </p>
          )}
        </div>
      </button>
    </header>
  );
}
