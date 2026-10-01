"use client";

import { cn, formatConversationTime, isUserOnline } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { EmojiText } from "@/components/ui/EmojiText";
import type { Conversation, UserProfile } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  otherUser: UserProfile;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  otherUser,
  isActive,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const unreadCount = conversation.unreadCount?.[currentUserId] ?? 0;
  const isOwnLastMessage = conversation.lastMessageSenderId === currentUserId;
  const preview = conversation.lastMessage
    ? `${isOwnLastMessage ? "You: " : ""}${conversation.lastMessage}`
    : "No messages yet";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open conversation with ${otherUser.displayName}`}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-200",
        isActive
          ? "glass-active"
          : "border-transparent hover:bg-glass-subtle active:scale-[0.99]"
      )}
    >
      <Avatar
        src={otherUser.photoURL}
        name={otherUser.displayName}
        size="md"
        showOnline
        isOnline={isUserOnline(otherUser)}
        className="transition-transform duration-150 group-hover:scale-105"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "truncate text-sm text-ink",
              isActive || unreadCount > 0 ? "font-semibold" : "font-medium"
            )}
          >
            {otherUser.displayName}
          </h3>
          {conversation.lastMessageAt && (
            <span
              className={cn(
                "shrink-0 text-[11px]",
                unreadCount > 0
                  ? "font-semibold text-accent-text"
                  : "text-ink-muted"
              )}
            >
              {formatConversationTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={cn(
              "font-dm truncate text-xs",
              unreadCount > 0 ? "font-medium text-ink" : "text-ink-muted"
            )}
          >
            <EmojiText text={preview} />
          </p>
          {unreadCount > 0 && (
            <span className="bg-accent-gradient flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-ink shadow-[0_3px_8px_rgba(51,39,42,0.12)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
