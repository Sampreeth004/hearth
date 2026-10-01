"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { HearthLogo } from "@/components/ui/HearthLogo";
import { ChatsPanel } from "@/components/chat/ChatsPanel";
import { FriendsView } from "@/components/friends/FriendsView";
import { HomeView } from "@/components/home/HomeView";
import { UserSearch } from "@/components/users/UserSearch";
import { ProfileView } from "@/components/profile/ProfileView";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useBackLayer, useBackNavigation } from "@/context/BackNavigationContext";
import { useProfile } from "@/hooks/useProfile";
import { useConversations } from "@/hooks/useConversations";
import { useFriends } from "@/hooks/useFriends";
import { ensureUserDocument } from "@/services/authService";
import { getOrCreateConversation } from "@/services/chatService";
import { isUserOnline } from "@/lib/utils";
import type { UserProfile } from "@/types";

export type AppTab = "home" | "chats" | "friends" | "requests" | "search" | "profile";

export interface ActiveConversation {
  id: string;
  otherUserId: string;
}

const TAB_TITLES: Record<AppTab, string> = {
  home: "Home",
  chats: "Chats",
  friends: "Friends",
  requests: "Requests",
  search: "Search",
  profile: "Profile",
};

export function AppShell() {
  const { user, logOut } = useAuth();
  const uid = user?.uid;
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    retry: retryProfile,
  } = useProfile(uid);
  const { conversations, loading: conversationsLoading, getTotalUnread } =
    useConversations(uid);
  const friendsState = useFriends(uid);
  const { addToast } = useToast();
  const { reset: resetBackLayers } = useBackNavigation();

  const [activeTab, setActiveTab] = useState<AppTab>("chats");
  const [activeConversation, setActiveConversation] =
    useState<ActiveConversation | null>(null);
  const [healFailed, setHealFailed] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const healingRef = useRef(false);
  const fadeTimeoutRef = useRef<number | null>(null);

  // Self-heal: if sign-in created the auth user but the Firestore profile
  // document is missing or incomplete (e.g. only a presence stub exists),
  // backfill it now.
  const profileIncomplete =
    !profile ||
    !profile.displayName ||
    profile.displayName === "New User" ||
    !profile.username;

  useEffect(() => {
    if (!user || !uid) return;
    if (profileLoading || profileError || healFailed) return;
    if (!profileIncomplete) return;
    if (healingRef.current) return;

    healingRef.current = true;
    ensureUserDocument(user)
      .catch((error) => {
        console.error("Failed to create your profile document", error);
        setHealFailed(true);
      })
      .finally(() => {
        healingRef.current = false;
      });
  }, [user, uid, profileIncomplete, profileLoading, profileError, healFailed]);

  const openConversation = useCallback(
    (conversationId: string, otherUserId: string) => {
      setActiveConversation({ id: conversationId, otherUserId });
      setActiveTab("chats");
    },
    []
  );

  const closeConversation = useCallback(() => {
    setActiveConversation(null);
  }, []);

  const startChatWith = useCallback(
    async (friend: UserProfile) => {
      if (!uid) return;
      try {
        const conversationId = await getOrCreateConversation(uid, friend.uid);
        openConversation(conversationId, friend.uid);
      } catch (error) {
        console.error("Failed to open conversation", error);
        addToast("Unable to open the conversation. Please try again.", "error");
      }
    },
    [uid, openConversation, addToast]
  );

  const handleSignOut = useCallback(async () => {
    // Drop in-app history layers first: their unmount cleanup would otherwise
    // fire a history.go() that cancels the sign-out navigation, leaving the
    // app stuck on /chat with the signed-out loading screen.
    resetBackLayers();
    addToast("Signed out", "info");
    await logOut();
    window.location.replace("/login");
  }, [logOut, addToast, resetBackLayers]);

  const handleTabChange = useCallback(
    (tab: AppTab) => {
      if (tab === activeTab) return;
      // Quick cross-fade instead of remounting panels, so listeners and
      // scroll state survive the tab switch.
      setContentVisible(false);
      if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = window.setTimeout(() => {
        setActiveTab(tab);
        setContentVisible(true);
      }, 120);
    },
    [activeTab]
  );

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  // Android/browser back: leave the current tab first, then close an open
  // conversation, instead of exiting the app.
  useBackLayer("app-tab", activeTab !== "chats", () => {
    handleTabChange("chats");
  });
  useBackLayer(
    "conversation",
    activeTab === "chats" && Boolean(activeConversation),
    () => {
      setActiveConversation(null);
    }
  );

  const unreadCount = getTotalUnread();

  // Reflect unread messages on the installed app's icon badge.
  useEffect(() => {
    const nav = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (unreadCount > 0) {
      nav.setAppBadge?.(unreadCount).catch(() => {});
    } else {
      nav.clearAppBadge?.().catch(() => {});
    }
  }, [unreadCount]);

  if (!uid) return null;

  if (!profile || !profile.displayName || !profile.username) {
    if (profileError || healFailed) {
      return (
        <div className="glass-fill flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-danger-line bg-danger-soft">
            <AlertCircle className="h-8 w-8 text-danger-strong" />
          </div>
          <h1 className="text-lg font-bold text-ink">
            We couldn&apos;t load your profile
          </h1>
          <p className="max-w-sm text-sm text-ink-muted">
            There was a problem connecting to the database. Please check your
            connection and try again.
          </p>
          <Button
            type="button"
            onClick={() => {
              setHealFailed(false);
              retryProfile();
            }}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div
          role="status"
          aria-label="Loading your profile"
          className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-b-accent"
        />
      </div>
    );
  }

  const requestCount = friendsState.incomingRequests.length;
  const chatOpen = activeTab === "chats" && Boolean(activeConversation);

  return (
    <div className="relative flex h-dvh">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={profile}
        unreadCount={unreadCount}
        requestCount={requestCount}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        {!chatOpen && (
          <header className="glass-fill-strong flex items-center justify-between border-b border-hairline px-3 py-2 lg:hidden">
            <div className="flex min-w-0 items-center gap-2.5 pl-1">
              {activeTab === "chats" || activeTab === "home" ? (
                <HearthLogo size="sm" />
              ) : (
                <h1 className="truncate text-base font-bold tracking-tight text-ink">
                  {TAB_TITLES[activeTab]}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {activeTab !== "search" && (
                <button
                  type="button"
                  onClick={() => handleTabChange("search")}
                  aria-label="Search people"
                  className="glass-icon-btn h-9 w-9"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
              {activeTab !== "profile" && (
                <button
                  type="button"
                  onClick={() => handleTabChange("profile")}
                  aria-label="Open profile"
                  className="rounded-full"
                >
                  <Avatar
                    src={profile.photoURL}
                    name={profile.displayName}
                    size="sm"
                    showOnline
                    isOnline={isUserOnline(profile)}
                  />
                </button>
              )}
            </div>
          </header>
        )}

        <main
          className={`min-h-0 flex-1 transition-opacity duration-150 ${
            contentVisible ? "opacity-100" : "opacity-0"
          } ${
            chatOpen ? "" : "pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0"
          }`}
        >
          {activeTab === "home" && (
            <HomeView
              profile={profile}
              conversations={conversations}
              conversationsLoading={conversationsLoading}
              friendsState={friendsState}
              onOpenConversation={openConversation}
              onMessageFriend={startChatWith}
              onFindFriends={() => handleTabChange("search")}
              onOpenChats={() => handleTabChange("chats")}
            />
          )}

          {activeTab === "chats" && (
            <ChatsPanel
              currentUserId={uid}
              conversations={conversations}
              conversationsLoading={conversationsLoading}
              activeConversation={activeConversation}
              onOpenConversation={openConversation}
              onCloseConversation={closeConversation}
              onFindFriends={() => handleTabChange("search")}
            />
          )}

          {(activeTab === "friends" || activeTab === "requests") && (
            <FriendsView
              key={activeTab}
              initialTab={activeTab === "requests" ? "requests" : "friends"}
              friendsState={friendsState}
              onMessage={startChatWith}
              onFindFriends={() => handleTabChange("search")}
            />
          )}

          {activeTab === "search" && (
            <UserSearch
              currentUserId={uid}
              friendsState={friendsState}
              conversations={conversations}
              onOpenConversation={openConversation}
            />
          )}

          {activeTab === "profile" && (
            <ProfileView
              user={profile}
              friendsCount={friendsState.friends.length}
              chatsCount={conversations.length}
              onSignOut={handleSignOut}
            />
          )}
        </main>
      </div>

      {!chatOpen && (
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadCount={unreadCount}
          requestCount={requestCount}
        />
      )}
    </div>
  );
}
