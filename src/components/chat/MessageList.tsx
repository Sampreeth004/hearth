"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingBubble } from "./TypingIndicator";
import { Button } from "@/components/ui/Button";
import { ChatBubblesArt } from "@/components/ui/ChatBubblesArt";
import { Skeleton } from "@/components/ui/EmptyState";
import { formatDateSeparator, isSameDay } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  freshIds: Set<string>;
  isOtherTyping: boolean;
  onReply: (message: Message) => void;
  onToggleReaction: (message: Message, emoji: string) => void;
  onStartChat?: () => void;
}

const GROUP_WINDOW_MS = 5 * 60 * 1000;

function isSameGroup(previous: Message | undefined, current: Message): boolean {
  if (!previous) return false;
  if (previous.senderId !== current.senderId) return false;
  if (!isSameDay(previous.createdAtMillis, current.createdAtMillis)) return false;
  const previousTime = previous.createdAtMillis ?? 0;
  const currentTime = current.createdAtMillis ?? 0;
  return Math.abs(currentTime - previousTime) < GROUP_WINDOW_MS;
}

export function MessageList({
  messages,
  currentUserId,
  loading,
  hasMore,
  onLoadMore,
  freshIds,
  isOtherTyping,
  onReply,
  onToggleReaction,
  onStartChat,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousLastIdRef = useRef<string | null>(null);
  const restoreScrollHeightRef = useRef<number | null>(null);
  const isNearBottomRef = useRef(true);
  const highlightTimeoutRef = useRef<number | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const lastId = messages.length > 0 ? messages[messages.length - 1].id : null;
  const firstId = messages.length > 0 ? messages[0].id : null;

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 120;
    setShowScrollButton(distanceFromBottom > 280);
  }, []);

  // Scroll only the message container - never the page. scrollIntoView would
  // also scroll ancestors, which makes Android pan the whole UI when the
  // keyboard is open and a message is sent.
  const scrollToLatest = useCallback((behavior: ScrollBehavior) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (loading || !lastId) return;
    if (previousLastIdRef.current === lastId) return;

    const isFirstRender = previousLastIdRef.current === null;
    const lastMessage = messages[messages.length - 1];
    const isOwnMessage = lastMessage?.senderId === currentUserId;

    if (isFirstRender || isNearBottomRef.current || isOwnMessage) {
      scrollToLatest(isFirstRender ? "auto" : "smooth");
    }

    previousLastIdRef.current = lastId;
  }, [messages, currentUserId, lastId, loading, scrollToLatest]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (restoreScrollHeightRef.current !== null) {
      container.scrollTop = container.scrollHeight - restoreScrollHeightRef.current;
      restoreScrollHeightRef.current = null;
    }
  }, [firstId]);

  useEffect(() => {
    if (isOtherTyping && isNearBottomRef.current) {
      scrollToLatest("smooth");
    }
  }, [isOtherTyping, scrollToLatest]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const jumpToMessage = useCallback(
    (messageId: string) => {
      const container = containerRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(
        `#message-${messageId}`
      );
      if (!target) return;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      container.scrollTop +=
        targetRect.top - containerRect.top - container.clientHeight / 2 + targetRect.height / 2;
      setHighlightId(messageId);
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = window.setTimeout(
        () => setHighlightId(null),
        1500
      );
    },
    []
  );

  const handleLoadMore = () => {
    const container = containerRef.current;
    if (container) restoreScrollHeightRef.current = container.scrollHeight;
    onLoadMore();
  };

  if (loading) {
    return (
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <div className="flex justify-start">
          <Skeleton className="h-12 w-40 rounded-3xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-12 w-52 rounded-3xl" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-16 w-64 rounded-3xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="chat-wallpaper flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <ChatBubblesArt className="animate-float mb-6 h-32 w-40" />
        <p className="text-lg font-bold text-ink">No messages yet</p>
        <p className="font-dm mt-1 max-w-xs text-sm text-ink-muted">
          Say hello to start the conversation.
        </p>
        {onStartChat && (
          <Button
            type="button"
            size="sm"
            onClick={onStartChat}
            className="mt-4 px-5"
          >
            Start a chat
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="chat-wallpaper h-full overflow-y-auto overflow-x-clip px-4 py-4"
      >
        {hasMore && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="glass-panel-subtle rounded-full px-3.5 py-1.5 text-xs font-semibold text-accent-text transition-colors hover:bg-glass-hover"
            >
              Load older messages
            </button>
          </div>
        )}

        {messages.map((message, index) => {
          const previous = index > 0 ? messages[index - 1] : null;
          const next = index < messages.length - 1 ? messages[index + 1] : null;
          const dateLabel = formatDateSeparator(message.createdAtMillis);
          const showDateSeparator =
            Boolean(dateLabel) &&
            (!previous ||
              !isSameDay(previous.createdAtMillis, message.createdAtMillis));
          const isGroupEnd = !next || !isSameGroup(message, next);

          return (
            <Fragment key={message.id}>
              {showDateSeparator && (
                <div className="animate-fade-in my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-hairline" />
                  <span className="glass-panel-subtle rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                    {dateLabel}
                  </span>
                  <div className="h-px flex-1 bg-hairline" />
                </div>
              )}
              <MessageBubble
                message={message}
                isOwn={message.senderId === currentUserId}
                isGroupEnd={isGroupEnd}
                isFresh={freshIds.has(message.id)}
                currentUserId={currentUserId}
                highlighted={highlightId === message.id}
                onReply={onReply}
                onToggleReaction={onToggleReaction}
                onJumpTo={jumpToMessage}
              />
            </Fragment>
          );
        })}
        {isOtherTyping && <TypingBubble />}
      </div>

      {showScrollButton && (
        <button
          type="button"
          onClick={() => scrollToLatest("smooth")}
          aria-label="Scroll to latest messages"
          className="glass-menu animate-pop-in absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-accent-text transition-transform hover:scale-105"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
