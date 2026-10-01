"use client";

import { MessageCircle, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmojiText } from "@/components/ui/EmojiText";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { formatLastSeen, isUserOnline } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface FriendsListProps {
  friends: UserProfile[];
  loading: boolean;
  onMessage: (friend: UserProfile) => void;
  onFindFriends: () => void;
  searching?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function FriendsList({
  friends,
  loading,
  onMessage,
  onFindFriends,
  searching = false,
  emptyTitle,
  emptyDescription,
}: FriendsListProps) {
  if (loading) {
    return (
      <div className="glass-tint overflow-hidden rounded-3xl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-0"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={emptyTitle ?? (searching ? "No friends found" : "No friends yet")}
        description={
          emptyDescription ??
          (searching
            ? "Try a different name or username."
            : "Find people and start building your network.")
        }
        action={
          searching ? undefined : { label: "Find people", onClick: onFindFriends }
        }
      />
    );
  }

  return (
    <div className="glass-tint overflow-hidden rounded-3xl">
      {friends.map((friend) => {
        const online = isUserOnline(friend);
        const secondary = friend.bio || `@${friend.username}`;
        return (
          <div
            key={friend.uid}
            className="glass-hover flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-0"
          >
            <Avatar
              src={friend.photoURL}
              name={friend.displayName}
              size="md"
              showOnline
              isOnline={online}
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-ink">
                {friend.displayName}
              </h3>
              <p
                className={`truncate text-xs ${
                  online ? "font-medium text-online" : "text-ink-muted"
                }`}
              >
                {online ? (
                  "Online"
                ) : searching ? (
                  <EmojiText text={secondary} />
                ) : (
                  `Last seen ${formatLastSeen(friend.lastSeen)}`
                )}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onMessage(friend)}
              aria-label={`Message ${friend.displayName}`}
              className="shrink-0 gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Message</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
