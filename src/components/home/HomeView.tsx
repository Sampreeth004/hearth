"use client";

import { useMemo } from "react";
import { ChevronRight, MessageCircle, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { isUserOnline } from "@/lib/utils";
import type { FriendsState } from "@/hooks/useFriends";
import type { Conversation, UserProfile } from "@/types";

interface HomeViewProps {
  profile: UserProfile;
  conversations: Conversation[];
  conversationsLoading: boolean;
  friendsState: FriendsState;
  onOpenConversation: (conversationId: string, otherUserId: string) => void;
  onMessageFriend: (friend: UserProfile) => void;
  onFindFriends: () => void;
  onOpenChats?: () => void;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeView({
  profile,
  conversations,
  conversationsLoading,
  friendsState,
  onOpenConversation,
  onMessageFriend,
  onFindFriends,
  onOpenChats,
}: HomeViewProps) {
  const { friends } = friendsState;

  const profileIds = useMemo(() => {
    const ids = conversations
      .map((conversation) =>
        conversation.participants.find((p) => p !== profile.uid)
      )
      .filter((id): id is string => Boolean(id));
    return [...ids, ...friends];
  }, [conversations, friends, profile.uid]);

  const profiles = useUserProfiles(profileIds);

  const recentChats = useMemo(
    () =>
      conversations
        .map((conversation) => ({
          conversation,
          other: profiles[
            conversation.participants.find((p) => p !== profile.uid) ?? ""
          ],
        }))
        .filter(
          (entry): entry is { conversation: Conversation; other: UserProfile } =>
            Boolean(entry.other)
        )
        .slice(0, 4),
    [conversations, profiles, profile.uid]
  );

  const onlineFriends = useMemo(
    () =>
      friends
        .map((id) => profiles[id])
        .filter(
          (friend): friend is UserProfile =>
            Boolean(friend) && isUserOnline(friend)
        )
        .slice(0, 12),
    [friends, profiles]
  );

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (sum, conversation) =>
          sum + (conversation.unreadCount?.[profile.uid] ?? 0),
        0
      ),
    [conversations, profile.uid]
  );

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const firstName = profile.displayName.split(" ")[0];

  return (
    <div className="glass-fill h-full overflow-y-auto">
      <div className="animate-fade-in mx-auto max-w-2xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
        <header>
          <p className="text-sm text-ink-muted">{today}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink">
            {greeting()}, {firstName}
          </h1>
        </header>

        <section className="bg-accent-gradient relative overflow-hidden rounded-3xl p-6 shadow-[0_10px_28px_rgba(51,39,42,0.08)]">
          <div className="relative z-10">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              Welcome back to Hearth
            </h2>
            <p className="font-dm mt-1 max-w-sm text-sm leading-relaxed text-ink/85">
              Your conversations are waiting — calm, warm, and close at hand.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onFindFriends}
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-accent-text shadow-[0_10px_24px_rgba(51,39,42,0.12)] transition-transform hover:scale-[1.02] active:scale-95"
              >
                Start a chat
              </button>
              {totalUnread > 0 && (
                <span className="rounded-full border border-white bg-white px-3.5 py-1.5 text-xs font-semibold text-ink">
                  {totalUnread} unread {totalUnread === 1 ? "message" : "messages"}
                </span>
              )}
            </div>
          </div>
        </section>

        <section aria-label="Recent chats">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
              Recent chats
            </h2>
            {recentChats.length > 0 && onOpenChats && (
              <button
                type="button"
                onClick={onOpenChats}
                className="flex items-center gap-0.5 text-xs font-semibold text-accent-text transition-colors hover:opacity-80"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {conversationsLoading ? (
            <div className="glass-tint space-y-3 rounded-3xl p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentChats.length === 0 ? (
            <div className="glass-tint rounded-3xl">
              <EmptyState
                icon={MessageCircle}
                title="No chats yet"
                description="Find a friend and start your first conversation."
                action={{ label: "Find friends", onClick: onFindFriends }}
              />
            </div>
          ) : (
            <div className="glass-tint space-y-1 rounded-3xl p-1.5">
              {recentChats.map(({ conversation, other }) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  otherUser={other}
                  isActive={false}
                  currentUserId={profile.uid}
                  onClick={() => onOpenConversation(conversation.id, other.uid)}
                />
              ))}
            </div>
          )}
        </section>

        <section aria-label="Friends online">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
              Friends online
            </h2>
            <button
              type="button"
              onClick={onFindFriends}
              className="flex items-center gap-1 text-xs font-semibold text-accent-text transition-colors hover:opacity-80"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add friends
            </button>
          </div>

          {onlineFriends.length === 0 ? (
            <div className="glass-tint rounded-3xl px-4 py-5 text-sm text-ink-muted">
              <span className="font-dm">
                No friends online right now. Send someone a message anyway.
              </span>
            </div>
          ) : (
            <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {onlineFriends.map((friend) => (
                <button
                  key={friend.uid}
                  type="button"
                  onClick={() => onMessageFriend(friend)}
                  className="glass-tint glass-hover flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl px-2 py-3 hover:-translate-y-0.5"
                >
                  <Avatar
                    src={friend.photoURL}
                    name={friend.displayName}
                    size="md"
                    showOnline
                    isOnline
                  />
                  <span className="w-full truncate text-center text-[11px] font-semibold text-ink">
                    {friend.displayName.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
