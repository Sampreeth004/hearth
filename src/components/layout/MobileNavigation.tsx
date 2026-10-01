"use client";

import { House, MessageCircle, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppTab } from "./AppShell";

interface MobileNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  unreadCount: number;
  requestCount: number;
}

const TABS: { id: AppTab; icon: typeof MessageCircle; label: string }[] = [
  { id: "home", icon: House, label: "Home" },
  { id: "chats", icon: MessageCircle, label: "Chat" },
  { id: "friends", icon: Users, label: "Friends" },
  { id: "profile", icon: User, label: "Profile" },
];

export function MobileNavigation({
  activeTab,
  onTabChange,
  unreadCount,
  requestCount,
}: MobileNavigationProps) {
  const badges: Partial<Record<AppTab, number>> = {
    chats: unreadCount,
    friends: requestCount,
  };

  // The Requests tab is represented by the Friends tab on mobile.
  const currentTab: AppTab = activeTab === "requests" ? "friends" : activeTab;

  return (
    <nav
      aria-label="Main navigation"
      className="glass-fill-strong fixed inset-x-0 bottom-0 z-50 border-t border-hairline pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex min-h-[4.5rem] items-center justify-around px-2 py-1">
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = currentTab === id;
          const badge = badges[id] ?? 0;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-w-[56px] flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all duration-200",
                isActive
                  ? "bg-accent-soft text-accent-text"
                  : "text-ink-muted active:scale-95"
              )}
            >
              <span className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "-translate-y-0.5 scale-110"
                  )}
                />
                {badge > 0 && (
                  <span className="bg-accent-gradient absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-ink shadow-[0_3px_8px_rgba(51,39,42,0.12)]">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px]",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
