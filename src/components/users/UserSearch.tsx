"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { UserCard } from "./UserCard";
import { Avatar } from "@/components/ui/Avatar";
import { EmojiText } from "@/components/ui/EmojiText";
import { GlassInput } from "@/components/ui/GlassInput";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { useSearch } from "@/hooks/useSearch";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { sendFriendRequest, acceptFriendRequest } from "@/services/friendService";
import { useToast } from "@/context/ToastContext";
import { cn, formatConversationTime, getFriendlyErrorMessage } from "@/lib/utils";
import type { FriendsState } from "@/hooks/useFriends";
import type {
  Conversation,
  RelationshipStatus,
  UserProfile,
} from "@/types";

type SearchFilter = "all" | "people" | "chats";

interface UserSearchProps {
  currentUserId: string;
  friendsState: FriendsState;
  conversations?: Conversation[];
  onOpenConversation?: (conversationId: string, otherUserId: string) => void;
}

export function UserSearch({
  currentUserId,
  friendsState,
  conversations = [],
  onOpenConversation,
}: UserSearchProps) {
  const { searchTerm, setSearchTerm, results, loading, error } =
    useSearch(currentUserId);
  const { friends, incomingRequests, outgoingRequests } = friendsState;
  const { addToast } = useToast();
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SearchFilter>("all");

  const partnerIds = useMemo(
    () =>
      conversations
        .map((conversation) =>
          conversation.participants.find((p) => p !== currentUserId)
        )
        .filter((id): id is string => Boolean(id)),
    [conversations, currentUserId]
  );
  const profiles = useUserProfiles(partnerIds);

  const query = searchTerm.trim().toLowerCase();

  const matchingChats = useMemo(
    () =>
      conversations.filter((conversation) => {
        if (!query) return true;
        const otherId = conversation.participants.find(
          (p) => p !== currentUserId
        );
        const other = otherId ? profiles[otherId] : undefined;
        return (
          other?.displayName.toLowerCase().includes(query) ||
          other?.username.toLowerCase().includes(query) ||
          conversation.lastMessage.toLowerCase().includes(query)
        );
      }),
    [conversations, profiles, query, currentUserId]
  );

  const getRelationshipStatus = (userId: string): RelationshipStatus => {
    if (friends.includes(userId)) return "friends";
    if (outgoingRequests.some((r) => r.receiverId === userId)) return "requested";
    if (incomingRequests.some((r) => r.senderId === userId)) return "incoming";
    return "none";
  };

  const handleAdd = async (user: UserProfile) => {
    setActionId(user.uid);
    try {
      await sendFriendRequest(currentUserId, user.uid);
      addToast("Friend request sent", "success", `Waiting for ${user.displayName}`);
    } catch (err) {
      console.error("Failed to send friend request", err);
      addToast(getFriendlyErrorMessage(err), "error");
    } finally {
      setActionId(null);
    }
  };

  const handleAccept = async (userId: string) => {
    const request = incomingRequests.find((r) => r.senderId === userId);
    if (!request) return;

    setActionId(userId);
    try {
      await acceptFriendRequest(request.id);
      addToast("Friend request accepted");
    } catch (err) {
      console.error("Failed to accept friend request", err);
      addToast(getFriendlyErrorMessage(err), "error");
    } finally {
      setActionId(null);
    }
  };

  const isSearching = query.length > 0;
  const showPeople = filter === "all" || filter === "people";
  const showChats = filter === "all" || filter === "chats";

  const filters: { id: SearchFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "people", label: "People" },
    { id: "chats", label: "Chats" },
  ];

  const peopleEmpty =
    showPeople && !loading && !error && isSearching && results.length === 0;
  const chatsEmpty = showChats && matchingChats.length === 0;
  const peopleVisible = showPeople && results.length > 0;
  const chatsVisible = showChats && matchingChats.length > 0;

  return (
    <div className="glass-fill flex h-full flex-col overflow-hidden">
      <div className="border-b border-hairline px-4 pb-3 pt-5">
        <h2 className="hidden text-lg font-bold tracking-tight text-ink lg:block">
          Search
        </h2>
        <div className="mt-0 lg:mt-3">
          <GlassInput
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, username, or email"
            aria-label="Search users"
            autoComplete="off"
            icon={Search}
          />
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200",
                filter === id
                  ? "bg-accent-gradient text-ink shadow-[0_4px_12px_rgba(51,39,42,0.1)]"
                  : "glass-tint text-ink-muted hover:bg-glass-hover hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 lg:p-4">
        {loading && showPeople && (
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
        )}

        {!loading && error && showPeople && (
          <EmptyState icon={Search} title="Search failed" description={error} />
        )}

        {peopleVisible && (
          <section aria-label="People results" className="mb-4">
            {filter === "all" && (
              <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink-muted">
                People
              </h3>
            )}
            <div className="glass-tint overflow-hidden rounded-3xl">
              {results.map((user) => (
                <UserCard
                  key={user.uid}
                  user={user}
                  status={getRelationshipStatus(user.uid)}
                  actionLoading={actionId === user.uid}
                  onAdd={() => handleAdd(user)}
                  onAccept={() => handleAccept(user.uid)}
                />
              ))}
            </div>
          </section>
        )}

        {chatsVisible && (
          <section aria-label="Chat results">
            <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink-muted">
              Messages
            </h3>
            <div className="glass-tint overflow-hidden rounded-3xl">
              {matchingChats.map((conversation) => {
                const otherId = conversation.participants.find(
                  (p) => p !== currentUserId
                );
                const other = otherId ? profiles[otherId] : undefined;
                if (!other) return null;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => onOpenConversation?.(conversation.id, other.uid)}
                    className="glass-hover flex w-full items-center gap-3 border-b border-hairline px-4 py-3 text-left last:border-0"
                  >
                    <Avatar
                      src={other.photoURL}
                      name={other.displayName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-sm font-semibold text-ink">
                          {other.displayName}
                        </h4>
                        {conversation.lastMessageAt && (
                          <span className="shrink-0 text-[11px] text-ink-muted">
                            {formatConversationTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <p className="font-dm truncate text-xs text-ink-muted">
                        <EmojiText
                          text={`${
                            conversation.lastMessageSenderId === currentUserId
                              ? "You: "
                              : ""
                          }${conversation.lastMessage || "No messages yet"}`}
                        />
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {peopleEmpty && (
          <EmptyState
            icon={Search}
            title="No people found"
            description="Try searching with a different name, username, or email."
          />
        )}

        {chatsEmpty && filter === "chats" && (
          <EmptyState
            icon={MessageCircle}
            title="No chats found"
            description={
              isSearching
                ? "No conversations match your search."
                : "Start a conversation with a friend to see it here."
            }
          />
        )}

        {!loading && !error && !isSearching && filter !== "chats" && (
          <EmptyState
            icon={Search}
            title="Search people and chats"
            description="Find people by name, username, or email, or jump back into a conversation."
          />
        )}
      </div>
    </div>
  );
}
