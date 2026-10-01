"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Skeleton } from "@/components/ui/EmptyState";
import { UserProfileModal } from "@/components/users/UserProfileModal";
import { useMessages } from "@/hooks/useMessages";
import { useTyping, useTypingSignal } from "@/hooks/useTyping";
import {
  markMessagesAsRead,
  sendMessage,
  toggleReaction,
} from "@/services/chatService";
import { notifyReceiver } from "@/services/notifyService";
import { useToast } from "@/context/ToastContext";
import { getFriendlyErrorMessage } from "@/lib/utils";
import type { Message, UserProfile } from "@/types";

interface ChatAreaProps {
  conversationId: string;
  otherUserId: string;
  otherUser: UserProfile | null;
  currentUserId: string;
  onBack: () => void;
  onStartChat?: () => void;
}

function messagePreview(message: Message): string {
  if (message.messageType === "gif") return "GIF";
  if (message.messageType === "image") return "Photo";
  return message.text;
}

function ChatHeaderSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="glass-icon-btn h-9 w-9 lg:hidden"
      >
        &larr;
      </button>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="mb-1 h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ChatArea({
  conversationId,
  otherUserId,
  otherUser,
  currentUserId,
  onBack,
  onStartChat,
}: ChatAreaProps) {
  const { messages, loading, hasMore, loadMore, freshIds } =
    useMessages(conversationId);
  const { isOtherTyping } = useTyping(conversationId, otherUserId);
  const { notifyTyping, stopTyping } = useTypingSignal(
    conversationId,
    currentUserId
  );
  const { addToast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);

  const hasUnread = useMemo(
    () => messages.some((m) => m.receiverId === currentUserId && !m.read),
    [messages, currentUserId]
  );

  useEffect(() => {
    if (!hasUnread) return;
    markMessagesAsRead(conversationId, currentUserId).catch((error) => {
      console.error("Failed to mark messages as read", error);
    });
  }, [hasUnread, conversationId, currentUserId]);

  const buildReplyReference = useCallback(() => {
    if (!replyTarget) return undefined;
    return {
      messageId: replyTarget.id,
      senderName:
        replyTarget.senderId === currentUserId
          ? "You"
          : otherUser?.displayName ?? "",
      preview: messagePreview(replyTarget).slice(0, 120),
    };
  }, [replyTarget, currentUserId, otherUser]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!otherUser) return;
      try {
        await sendMessage(conversationId, currentUserId, otherUser.uid, {
          text,
          replyTo: buildReplyReference(),
        });
        setReplyTarget(null);
        stopTyping();
        notifyReceiver({
          conversationId,
          receiverId: otherUser.uid,
          preview: text.slice(0, 120),
        });
      } catch (error) {
        console.error("Failed to send message", error);
        addToast(getFriendlyErrorMessage(error), "error");
      }
    },
    [conversationId, currentUserId, otherUser, addToast, stopTyping, buildReplyReference]
  );

  const handleSendGif = useCallback(
    async (gifUrl: string) => {
      if (!otherUser) return;
      try {
        await sendMessage(conversationId, currentUserId, otherUser.uid, {
          gifUrl,
          replyTo: buildReplyReference(),
        });
        setReplyTarget(null);
        stopTyping();
        notifyReceiver({
          conversationId,
          receiverId: otherUser.uid,
          preview: "GIF",
        });
      } catch (error) {
        console.error("Failed to send GIF", error);
        addToast(getFriendlyErrorMessage(error), "error");
      }
    },
    [conversationId, currentUserId, otherUser, addToast, stopTyping, buildReplyReference]
  );

  const handleSendImage = useCallback(
    async (imageUrl: string) => {
      if (!otherUser) return;
      try {
        await sendMessage(conversationId, currentUserId, otherUser.uid, {
          imageUrl,
          replyTo: buildReplyReference(),
        });
        setReplyTarget(null);
        stopTyping();
        notifyReceiver({
          conversationId,
          receiverId: otherUser.uid,
          preview: "Photo",
        });
      } catch (error) {
        console.error("Failed to send photo", error);
        addToast(getFriendlyErrorMessage(error), "error");
        throw error;
      }
    },
    [conversationId, currentUserId, otherUser, addToast, stopTyping, buildReplyReference]
  );

  const handleReply = useCallback((message: Message) => {
    setReplyTarget(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  const handleToggleReaction = useCallback(
    async (message: Message, emoji: string) => {
      try {
        await toggleReaction(conversationId, message.id, currentUserId, emoji);
      } catch (error) {
        console.error("Failed to toggle reaction", error);
        addToast(getFriendlyErrorMessage(error), "error");
      }
    },
    [conversationId, currentUserId, addToast]
  );

  const handleLoadMore = useCallback(() => {
    loadMore().catch((error) => {
      console.error("Failed to load older messages", error);
    });
  }, [loadMore]);

  const handleOpenProfile = useCallback(() => {
    setProfileOpen(true);
  }, []);

  const replyPreview = replyTarget
    ? {
        senderName:
          replyTarget.senderId === currentUserId
            ? "You"
            : otherUser?.displayName ?? "",
        preview: messagePreview(replyTarget).slice(0, 120),
      }
    : null;

  if (!otherUser) {
    return (
      <div className="flex h-full flex-col">
        <ChatHeaderSkeleton onBack={onBack} />
        <MessageList
          messages={[]}
          currentUserId={currentUserId}
          loading
          hasMore={false}
          onLoadMore={() => {}}
          freshIds={freshIds}
          isOtherTyping={false}
          onReply={handleReply}
          onToggleReaction={handleToggleReaction}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          user={otherUser}
          onBack={onBack}
          isTyping={isOtherTyping}
          onOpenProfile={handleOpenProfile}
        />
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          freshIds={freshIds}
          isOtherTyping={isOtherTyping}
          onReply={handleReply}
          onToggleReaction={handleToggleReaction}
          onStartChat={onStartChat}
        />
        <MessageInput
          onSend={handleSend}
          onSendGif={handleSendGif}
          onSendImage={handleSendImage}
          onTyping={notifyTyping}
          replyTo={replyPreview}
          onCancelReply={handleCancelReply}
        />
      </div>

      {profileOpen && (
        <UserProfileModal
          user={otherUser}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
