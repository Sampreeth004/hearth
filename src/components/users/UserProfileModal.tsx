"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmojiText } from "@/components/ui/EmojiText";
import { useBackLayer } from "@/context/BackNavigationContext";
import { cn, formatLastSeen, formatMemberSince, isUserOnline } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface UserProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onMessage?: () => void;
}

export function UserProfileModal({ user, onClose, onMessage }: UserProfileModalProps) {
  const online = isUserOnline(user);
  const memberSince = formatMemberSince(user.createdAt);

  useBackLayer("user-profile", true, onClose);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${user.displayName} profile`}
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-[95] flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="glass-panel-strong animate-pop-in relative w-full max-w-sm rounded-t-[28px] px-6 pb-8 pt-6 sm:rounded-[28px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="glass-icon-btn absolute right-4 top-4 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center pt-2 text-center">
          <div className="rounded-full bg-accent p-[3px] shadow-[0_8px_20px_rgba(51,39,42,0.1)]">
            <div className="flex rounded-full bg-white p-[2px]">
              <Avatar src={user.photoURL} name={user.displayName} size="xl" />
            </div>
          </div>

          <h2 className="mt-4 text-lg font-bold text-ink">{user.displayName}</h2>
          <p className="text-sm text-ink-muted">@{user.username}</p>

          <span
            className={cn(
              "mt-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              online
                ? "border-success-line bg-success-soft text-success-strong"
                : "border-hairline bg-glass-subtle text-ink-muted"
            )}
          >
            {online ? "Online" : `Last seen ${formatLastSeen(user.lastSeen)}`}
          </span>

          {user.bio && (
            <p className="font-dm mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              <EmojiText text={user.bio} />
            </p>
          )}

          {memberSince && (
            <div className="glass-tint mt-6 w-full rounded-2xl px-4 py-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                On Hearth since
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {memberSince}
              </p>
            </div>
          )}

          {onMessage && (
            <Button type="button" onClick={onMessage} className="mt-6 w-full">
              Send a message
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
