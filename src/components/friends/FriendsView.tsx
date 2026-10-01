"use client";

import { useMemo, useState } from "react";
import { Clock, Search, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FriendsList } from "./FriendsList";
import { FriendRequestCard } from "./FriendRequestCard";
import { Avatar } from "@/components/ui/Avatar";
import { GlassInput } from "@/components/ui/GlassInput";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { isUserOnline } from "@/lib/utils";
import type { FriendsState } from "@/hooks/useFriends";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from "@/services/friendService";
import { useToast } from "@/context/ToastContext";
import { getFriendlyErrorMessage } from "@/lib/utils";
import type { UserProfile } from "@/types";

type FriendsTab = "all" | "online" | "requests" | "sent";

interface FriendsViewProps {
  friendsState: FriendsState;
  onMessage: (friend: UserProfile) => void;
  onFindFriends: () => void;
  initialTab?: "friends" | "requests" | "sent";
}

function toTab(initialTab: FriendsViewProps["initialTab"]): FriendsTab {
  if (initialTab === "requests") return "requests";
  if (initialTab === "sent") return "sent";
  return "all";
}

export function FriendsView({
  friendsState,
  onMessage,
  onFindFriends,
  initialTab = "friends",
}: FriendsViewProps) {
  const [activeTab, setActiveTab] = useState<FriendsTab>(() => toTab(initialTab));
  const [searchTerm, setSearchTerm] = useState("");
  const { friends, incomingRequests, outgoingRequests, loading } = friendsState;
  const [actionId, setActionId] = useState<string | null>(null);
  const { addToast } = useToast();

  const requestUserIds = [
    ...incomingRequests.map((r) => r.senderId),
    ...outgoingRequests.map((r) => r.receiverId),
  ];
  const profiles = useUserProfiles([...friends, ...requestUserIds]);
  const requestProfiles = useUserProfiles(requestUserIds);

  const friendList = useMemo(
    () =>
      friends
        .map((id) => profiles[id])
        .filter((p): p is UserProfile => Boolean(p)),
    [friends, profiles]
  );

  const query = searchTerm.trim().toLowerCase();

  const matchesQuery = (profile: UserProfile) =>
    !query ||
    profile.displayName.toLowerCase().includes(query) ||
    profile.username.toLowerCase().includes(query) ||
    profile.bio.toLowerCase().includes(query);

  const visibleFriends = useMemo(
    () =>
      friendList.filter(
        (friend) =>
          matchesQuery(friend) &&
          (activeTab !== "online" || isUserOnline(friend))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [friendList, activeTab, query]
  );

  const visibleIncoming = useMemo(
    () =>
      incomingRequests.filter((request) => {
        const sender = requestProfiles[request.senderId];
        return sender ? matchesQuery(sender) : false;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [incomingRequests, requestProfiles, query]
  );

  const visibleOutgoing = useMemo(
    () =>
      outgoingRequests.filter((request) => {
        const receiver = requestProfiles[request.receiverId];
        return receiver ? matchesQuery(receiver) : false;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outgoingRequests, requestProfiles, query]
  );

  const onlineCount = friendList.filter((friend) => isUserOnline(friend)).length;

  const handleAccept = async (requestId: string, senderName: string) => {
    setActionId(requestId);
    try {
      await acceptFriendRequest(requestId);
      addToast(`${senderName} is now your friend`);
    } catch (err) {
      console.error("Failed to accept friend request", err);
      addToast(getFriendlyErrorMessage(err), "error");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionId(requestId);
    try {
      await rejectFriendRequest(requestId);
      addToast("Friend request declined", "info");
    } catch (err) {
      console.error("Failed to decline friend request", err);
      addToast(getFriendlyErrorMessage(err), "error");
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    setActionId(requestId);
    try {
      await cancelFriendRequest(requestId);
      addToast("Request cancelled", "info");
    } catch (err) {
      console.error("Failed to cancel friend request", err);
      addToast(getFriendlyErrorMessage(err), "error");
    } finally {
      setActionId(null);
    }
  };

  const tabs: { id: FriendsTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: friendList.length },
    { id: "online", label: "Online", count: onlineCount },
    { id: "requests", label: "Requests", count: incomingRequests.length },
    { id: "sent", label: "Sent", count: outgoingRequests.length },
  ];

  return (
    <div className="glass-fill flex h-full flex-col overflow-hidden">
      <div className="border-b border-hairline px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <GlassInput
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search friends..."
            aria-label="Search friends"
            autoComplete="off"
            icon={Search}
            wrapperClassName="flex-1"
          />
          <button
            type="button"
            onClick={onFindFriends}
            aria-label="Find people"
            className="glass-icon-btn h-10 w-10 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Friends sections"
          className="no-scrollbar mt-3 flex gap-2 overflow-x-auto"
        >
          {tabs.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200",
                activeTab === id
                  ? "bg-accent-gradient text-ink shadow-[0_4px_12px_rgba(51,39,42,0.1)]"
                  : "glass-tint text-ink-muted hover:bg-glass-hover hover:text-ink"
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                    activeTab === id
                      ? "bg-white text-ink"
                      : "bg-glass-subtle text-ink-muted"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 lg:p-4">
        {(activeTab === "all" || activeTab === "online") && (
          <FriendsList
            friends={visibleFriends}
            loading={loading}
            onMessage={onMessage}
            onFindFriends={onFindFriends}
            searching={query.length > 0}
            emptyTitle={activeTab === "online" ? "Nobody online" : undefined}
            emptyDescription={
              activeTab === "online"
                ? "None of your friends are online right now."
                : undefined
            }
          />
        )}

        {activeTab === "requests" &&
          (loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="glass-tint rounded-3xl p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : visibleIncoming.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title={query ? "No matching requests" : "No requests"}
              description={
                query
                  ? "No pending requests match your search."
                  : "You have no pending friend requests."
              }
              action={
                query ? undefined : { label: "Find people", onClick: onFindFriends }
              }
            />
          ) : (
            <div className="space-y-3">
              {visibleIncoming.map((request) => {
                const sender = requestProfiles[request.senderId];
                if (!sender) return null;
                return (
                  <FriendRequestCard
                    key={request.id}
                    sender={sender}
                    onAccept={() => handleAccept(request.id, sender.displayName)}
                    onReject={() => handleReject(request.id)}
                    loading={actionId === request.id}
                  />
                );
              })}
            </div>
          ))}

        {activeTab === "sent" &&
          (loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="glass-tint rounded-3xl p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : visibleOutgoing.length === 0 ? (
            <EmptyState
              icon={Clock}
              title={query ? "No matching requests" : "No sent requests"}
              description={
                query
                  ? "No sent requests match your search."
                  : "Friend requests you send will appear here."
              }
              action={
                query ? undefined : { label: "Find people", onClick: onFindFriends }
              }
            />
          ) : (
            <div className="glass-tint overflow-hidden rounded-3xl">
              {visibleOutgoing.map((request) => {
                const receiver = requestProfiles[request.receiverId];
                if (!receiver) return null;
                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-0"
                  >
                    <Avatar
                      src={receiver.photoURL}
                      name={receiver.displayName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-ink">
                        {receiver.displayName}
                      </h3>
                      <p className="text-xs text-ink-muted">Request pending</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancel(request.id)}
                      disabled={actionId === request.id}
                      className="flex items-center gap-1 rounded-full border border-danger-line bg-danger-soft px-3 py-1.5 text-xs font-semibold text-danger-strong transition-colors hover:bg-danger/25 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
}
