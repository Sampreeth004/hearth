"use client";

import { Check, Clock, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { isUserOnline } from "@/lib/utils";
import type { RelationshipStatus, UserProfile } from "@/types";

interface UserCardProps {
  user: UserProfile;
  status: RelationshipStatus;
  actionLoading?: boolean;
  onAdd?: () => void;
  onAccept?: () => void;
}

export function UserCard({
  user,
  status,
  actionLoading,
  onAdd,
  onAccept,
}: UserCardProps) {
  return (
    <div className="glass-hover flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-0">
      <Avatar
        src={user.photoURL}
        name={user.displayName}
        size="md"
        showOnline
        isOnline={isUserOnline(user)}
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-ink">
          {user.displayName}
        </h3>
        <p className="truncate text-xs text-ink-muted">@{user.username}</p>
      </div>

      {status === "friends" && (
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-success-line bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-strong">
          <Check className="h-3.5 w-3.5" />
          Friends
        </span>
      )}

      {status === "requested" && (
        <span className="glass-tint flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-muted">
          <Clock className="h-3.5 w-3.5" />
          Requested
        </span>
      )}

      {status === "incoming" && (
        <Button
          type="button"
          size="sm"
          onClick={onAccept}
          loading={actionLoading}
          className="shrink-0"
        >
          Accept
        </Button>
      )}

      {status === "none" && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAdd}
          loading={actionLoading}
          className="shrink-0 gap-1.5"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add
        </Button>
      )}
    </div>
  );
}
