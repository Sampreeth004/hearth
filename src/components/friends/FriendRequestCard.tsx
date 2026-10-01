"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { isUserOnline } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface FriendRequestCardProps {
  sender: UserProfile;
  onAccept: () => void;
  onReject: () => void;
  loading?: boolean;
}

export function FriendRequestCard({
  sender,
  onAccept,
  onReject,
  loading,
}: FriendRequestCardProps) {
  return (
    <div className="glass-tint rounded-3xl p-4">
      <div className="flex items-center gap-3">
        <Avatar
          src={sender.photoURL}
          name={sender.displayName}
          size="md"
          showOnline
          isOnline={isUserOnline(sender)}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink">
            {sender.displayName}
          </h3>
          <p className="truncate text-xs text-ink-muted">
            Wants to be your friend
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onAccept}
          loading={loading}
          className="flex-1"
        >
          Accept
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onReject}
          loading={loading}
          className="flex-1"
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
