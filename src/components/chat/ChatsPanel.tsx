"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ConversationList } from "./ConversationList";
import { ChatArea } from "./ChatArea";
import { Button } from "@/components/ui/Button";
import { ChatBubblesArt } from "@/components/ui/ChatBubblesArt";
import { GlassInput } from "@/components/ui/GlassInput";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import type { ActiveConversation } from "@/components/layout/AppShell";
import type { Conversation } from "@/types";

interface ChatsPanelProps {
  currentUserId: string;
  conversations: Conversation[];
  conversationsLoading: boolean;
  activeConversation: ActiveConversation | null;
  onOpenConversation: (conversationId: string, otherUserId: string) => void;
  onCloseConversation: () => void;
  onFindFriends: () => void;
}

export function ChatsPanel({
  currentUserId,
  conversations,
  conversationsLoading,
  activeConversation,
  onOpenConversation,
  onCloseConversation,
  onFindFriends,
}: ChatsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const profileIds = useMemo(() => {
    const ids = conversations
      .map((conversation) =>
        conversation.participants.find((p) => p !== currentUserId)
      )
      .filter((id): id is string => Boolean(id));
    if (activeConversation) ids.push(activeConversation.otherUserId);
    return ids;
  }, [conversations, currentUserId, activeConversation]);

  const profiles = useUserProfiles(profileIds);
  const isChatOpen = Boolean(activeConversation);

  const filteredConversations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const otherId = conversation.participants.find(
        (p) => p !== currentUserId
      );
      const other = otherId ? profiles[otherId] : undefined;
      return (
        other?.displayName.toLowerCase().includes(query) ||
        other?.username.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query)
      );
    });
  }, [conversations, profiles, searchTerm, currentUserId]);

  return (
    <div className="flex h-full">
      <section
        aria-label="Conversations"
        className={`glass-fill ${
          isChatOpen ? "hidden lg:flex" : "flex"
        } w-full flex-col overflow-hidden lg:w-80 lg:shrink-0 lg:border-r lg:border-hairline`}
      >
        <header className="flex items-center justify-between px-4 pb-1 pt-4">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            Chats
          </h2>
          <button
            type="button"
            onClick={onFindFriends}
            aria-label="Start a new chat"
            className="glass-icon-btn h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </button>
        </header>

        <div className="px-4 pb-3 pt-2">
          <GlassInput
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search chats..."
            aria-label="Search chats"
            autoComplete="off"
            icon={Search}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          <ConversationList
            conversations={filteredConversations}
            profiles={profiles}
            loading={conversationsLoading}
            currentUserId={currentUserId}
            activeConversationId={activeConversation?.id ?? null}
            onSelect={onOpenConversation}
            onFindFriends={onFindFriends}
            searching={searchTerm.trim().length > 0}
          />
        </div>
      </section>

      <section
        aria-label="Chat"
        className={`glass-fill ${
          isChatOpen ? "flex" : "hidden lg:flex"
        } min-w-0 flex-1 flex-col overflow-hidden`}
      >
        {activeConversation ? (
          <ChatArea
            key={activeConversation.id}
            conversationId={activeConversation.id}
            otherUserId={activeConversation.otherUserId}
            otherUser={profiles[activeConversation.otherUserId] ?? null}
            currentUserId={currentUserId}
            onBack={onCloseConversation}
            onStartChat={onFindFriends}
          />
        ) : (
          <div className="chat-wallpaper flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ChatBubblesArt className="animate-float mb-6 h-36 w-44" />
            <h3 className="text-xl font-bold tracking-tight text-ink">
              No messages yet
            </h3>
            <p className="font-dm mt-1.5 max-w-xs text-sm text-ink-muted">
              Start a conversation with your friends to see them here.
            </p>
            <Button type="button" onClick={onFindFriends} className="mt-5 px-6">
              Start a chat
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
