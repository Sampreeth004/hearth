"use client";

import { House, MessageCircle, Search, User, UserPlus, Users } from "lucide-react";
import { cn, isUserOnline } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { HearthLogo } from "@/components/ui/HearthLogo";
import type { AppTab } from "./AppShell";
import type { UserProfile } from "@/types";

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  user: UserProfile | null;
  unreadCount: number;
  requestCount: number;
}

const NAV_ITEMS: { id: AppTab; icon: typeof MessageCircle; label: string }[] = [
  { id: "home", icon: House, label: "Home" },
  { id: "chats", icon: MessageCircle, label: "Chat" },
  { id: "friends", icon: Users, label: "Friends" },
  { id: "requests", icon: UserPlus, label: "Requests" },
  { id: "profile", icon: User, label: "Profile" },
];

export function Sidebar({
  activeTab,
  onTabChange,
  user,
  unreadCount,
  requestCount,
}: SidebarProps) {
  const badges: Partial<Record<AppTab, number>> = {
    chats: unreadCount,
    requests: requestCount,
  };

  return (
    <aside className="glass-fill hidden w-60 flex-col border-r border-hairline lg:flex">
      <div className="px-5 pb-4 pt-5">
        <HearthLogo size="md" />
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const badge = badges[id] ?? 0;
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.99]",
                isActive
                  ? "glass-active text-ink"
                  : "border-transparent text-ink-muted hover:bg-glass-subtle hover:text-ink"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive
                    ? "scale-110 text-accent-text"
                    : "text-current group-hover:scale-105"
                )}
              />
              {label}
              {badge > 0 && (
                <span className="bg-accent-gradient ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-ink shadow-[0_3px_8px_rgba(51,39,42,0.12)]">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="mb-2.5 flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => onTabChange("search")}
            aria-label="Search people"
            className="glass-icon-btn h-9 w-9"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {user && (
          <button
            type="button"
            onClick={() => onTabChange("profile")}
            className="glass-tint glass-hover flex w-full items-center gap-3 rounded-2xl p-2.5 text-left"
          >
            <Avatar
              src={user.photoURL}
              name={user.displayName}
              size="md"
              showOnline
              isOnline={isUserOnline(user)}
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-ink">
                {user.displayName}
              </h2>
              <p className="truncate text-xs text-ink-muted">@{user.username}</p>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
