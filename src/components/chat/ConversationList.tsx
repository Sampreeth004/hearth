"use client";

import { MessageCircle } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import type { Conversation, UserProfile } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  profiles: Record<string, UserProfile>;
  loading: boolean;
  currentUserId: string;
  activeConversationId: string | null;
  onSelect: (conversationId: string, otherUserId: string) => void;
  onFindFriends: () => void;
  searching?: boolean;
}

export function ConversationList({
  conversations,
  profiles,
  loading,
  currentUserId,
  activeConversationId,
  onSelect,
  onFindFriends,
  searching = false,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="space-y-4 px-3 py-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title={searching ? "No chats found" : "No conversations"}
        description={
          searching
            ? "Try a different name or message."
            : "Start chatting with one of your friends."
        }
        action={
          searching
            ? undefined
            : { label: "Start a chat", onClick: onFindFriends }
        }
      />
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const otherUserId = conversation.participants.find(
          (p) => p !== currentUserId
        );
        const profile = otherUserId ? profiles[otherUserId] : undefined;
        if (!profile) return null;

        return (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            otherUser={profile}
            isActive={conversation.id === activeConversationId}
            currentUserId={currentUserId}
            onClick={() => onSelect(conversation.id, profile.uid)}
          />
        );
      })}
    </div>
  );
}
