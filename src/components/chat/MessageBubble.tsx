"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, CheckCheck, Reply, SmilePlus } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { EmojiText, isEmojiOnly } from "@/components/ui/EmojiText";
import { ImageLightbox } from "./ImageLightbox";
import type { Message } from "@/types";

const QUICK_REACTIONS = ["\u{1F44D}", "\u{2764}\u{FE0F}", "\u{1F602}", "\u{1F62E}", "\u{1F622}", "\u{1F525}"];

// Swipe-to-reply (Instagram-style): slide a bubble to the right to reveal the
// reply affordance; releasing past the trigger opens the composer's reply bar.
const SWIPE_TRIGGER_PX = 56;
const SWIPE_DEAD_ZONE_PX = 8;

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isGroupEnd: boolean;
  isFresh: boolean;
  currentUserId: string;
  highlighted: boolean;
  onReply: (message: Message) => void;
  onToggleReaction: (message: Message, emoji: string) => void;
  onJumpTo: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  isGroupEnd,
  isFresh,
  currentUserId,
  highlighted,
  onReply,
  onToggleReaction,
  onJumpTo,
}: MessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pressTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const suppressTapUntilRef = useRef(0);
  const swipeRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    axis: "x" | "y" | null;
    offset: number;
  } | null>(null);

  const isGif = message.messageType === "gif" && Boolean(message.gifUrl);
  const isImage = message.messageType === "image" && Boolean(message.imageUrl);
  const isPending = !message.createdAtMillis;
  const isMedia = isGif || isImage;
  const myReaction = message.reactions[currentUserId];

  const reactionCounts = Object.values(message.reactions).reduce<
    Record<string, number>
  >((counts, emoji) => {
    counts[emoji] = (counts[emoji] ?? 0) + 1;
    return counts;
  }, {});
  const hasReactions = Object.keys(reactionCounts).length > 0;

  const startPress = () => {
    if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    pressTimerRef.current = window.setTimeout(() => {
      // A long press should open the menu without also firing the tap action
      // underneath (for example the photo viewer).
      suppressClickRef.current = true;
      setMenuOpen(true);
    }, 450);
  };

  const shouldHandleTap = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return false;
    }
    return performance.now() >= suppressTapUntilRef.current;
  };
  const cancelPress = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const endSwipe = () => {
    swipeRef.current = null;
    setDragging(false);
    setDragX(0);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    startPress();
    // Swiping is a touch affordance; mouse/pen keep the hover menu and
    // native text interactions.
    if (event.pointerType === "mouse") return;
    swipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis: null,
      offset: 0,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId) return;

    const dx = event.clientX - swipe.startX;
    const dy = event.clientY - swipe.startY;

    if (swipe.axis === null) {
      if (
        Math.abs(dx) < SWIPE_DEAD_ZONE_PX &&
        Math.abs(dy) < SWIPE_DEAD_ZONE_PX
      ) {
        return;
      }
      // Clearly vertical: hand the gesture back to the scroll container.
      if (Math.abs(dy) >= Math.abs(dx)) {
        swipe.axis = "y";
        cancelPress();
        return;
      }
      swipe.axis = "x";
      cancelPress();
      setDragging(true);
    }

    if (swipe.axis !== "x") return;

    // Rightward only, with light resistance past the trigger point.
    const pulled = Math.max(0, dx);
    const offset =
      pulled <= SWIPE_TRIGGER_PX
        ? pulled
        : SWIPE_TRIGGER_PX + (pulled - SWIPE_TRIGGER_PX) * 0.35;

    swipe.offset = offset;
    suppressTapUntilRef.current = performance.now() + 400;
    setDragX(offset);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    cancelPress();
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId) return;

    const shouldReply =
      swipe.axis === "x" && swipe.offset >= SWIPE_TRIGGER_PX;
    endSwipe();
    if (shouldReply) {
      suppressClickRef.current = false;
      onReply(message);
    }
  };

  const handlePointerCancel = () => {
    cancelPress();
    endSwipe();
  };

  const replyProgress = Math.min(1, dragX / SWIPE_TRIGGER_PX);
  const swipeCommitted = dragX >= SWIPE_TRIGGER_PX;

  const previewText = message.replyTo?.preview ?? "";

  // Emoji-only messages skip the bubble and render the emojis large. Replies
  // keep the bubble so the quoted message stays legible.
  const emojiOnly =
    !isMedia && !message.replyTo && Boolean(message.text) && isEmojiOnly(message.text);

  const reactionPills = (className: string) => (
    <div className={className}>
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onToggleReaction(message, emoji)}
          aria-label={`React with ${emoji}`}
          className={cn(
            "glass-tint flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] shadow-[0_2px_6px_rgba(51,39,42,0.10)] transition-transform active:scale-95",
            myReaction === emoji && "border-accentline ring-1 ring-accent"
          )}
        >
          <EmojiText text={emoji} />
          {count > 1 && (
            <span className="text-[9px] font-semibold">{count}</span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div
      id={`message-${message.id}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={cancelPress}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(event) => {
        event.preventDefault();
        setMenuOpen(true);
      }}
      className={cn(
        "group relative flex touch-pan-y",
        isOwn
          ? "animate-bubble-in-right justify-end"
          : "animate-bubble-in-left justify-start",
        isGroupEnd ? "mb-2.5" : "mb-0.5",
        // Reactions straddle the bubble's bottom edge, so keep clear of the
        // next message (emoji-only messages render them in flow instead).
        hasReactions && !emojiOnly && "mb-4"
      )}
    >
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            aria-label="Message actions"
            className={cn(
              "glass-menu animate-pop-in absolute -top-12 z-30 flex items-center gap-0.5 rounded-full px-1.5 py-1",
              isOwn ? "right-0" : "left-0"
            )}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onToggleReaction(message, emoji);
                  setMenuOpen(false);
                }}
                aria-label={`React with ${emoji}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-lg transition-transform hover:scale-125 active:scale-95",
                  myReaction === emoji && "bg-accent-soft"
                )}
              >
                <EmojiText text={emoji} />
              </button>
            ))}
            <span className="mx-0.5 h-6 w-px bg-hairline" />
            <button
              type="button"
              onClick={() => {
                onReply(message);
                setMenuOpen(false);
              }}
              aria-label="Reply"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-glass-subtle hover:text-ink"
            >
              <Reply className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      <div
        className={cn(
          "relative max-w-[80%] sm:max-w-[70%]",
          !dragging && "transition-transform duration-200 ease-out"
        )}
        style={{
          transform: dragX ? `translate3d(${dragX}px, 0, 0)` : undefined,
        }}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -left-11 top-1/2 flex h-9 w-9 items-center justify-center rounded-full shadow-[0_3px_10px_rgba(51,39,42,0.08)]",
            swipeCommitted
              ? "bg-accent text-white"
              : "bg-accent-soft text-accent-text"
          )}
          style={{
            opacity: dragX > 4 ? replyProgress : 0,
            transform: `translateY(-50%) scale(${0.5 + 0.5 * replyProgress})`,
          }}
        >
          <Reply className="h-4 w-4" />
        </span>

        <div
          className={cn(
            "relative w-fit max-w-full",
            !emojiOnly && "rounded-3xl transition-[box-shadow] duration-150",
            !emojiOnly && (isMedia ? "p-1.5" : "px-4 py-2.5"),
            !emojiOnly && (isOwn ? "bubble-out text-ink" : "bubble-in text-ink"),
            !emojiOnly &&
              (isOwn
                ? isGroupEnd
                  ? "rounded-br-lg"
                  : ""
                : isGroupEnd
                  ? "rounded-bl-lg"
                  : ""),
            isOwn && isFresh && "animate-ignite",
            isPending && "animate-bubble-pending",
            highlighted && (emojiOnly ? "rounded-2xl ring-2 ring-accent" : "ring-2 ring-accent")
          )}
        >
        <button
          type="button"
          aria-label="Message actions"
          onClick={() => setMenuOpen(true)}
          className={cn(
            "glass-menu absolute top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 md:flex",
            isOwn ? "-left-9" : "-right-9"
          )}
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>

        {!emojiOnly && message.replyTo && (
          <button
            type="button"
            onClick={() => onJumpTo(message.replyTo!.messageId)}
            className="mb-1.5 block w-full rounded-xl border-l-2 border-accent bg-white px-2.5 py-1.5 text-left"
          >
            <span className="block text-[10px] font-bold text-accent-text">
              {message.replyTo.senderName || "Message"}
            </span>
            <span className="font-dm line-clamp-2 block text-[11px] text-ink-muted">
              <EmojiText text={previewText} />
            </span>
          </button>
        )}

        {emojiOnly ? (
          <EmojiText
            text={message.text}
            className={cn(
              "flex max-w-full flex-wrap items-center gap-1 text-4xl leading-none",
              isOwn ? "justify-end" : "justify-start"
            )}
          />
        ) : isImage ? (
          <button
            type="button"
            aria-label="View photo"
            onClick={() => {
              if (shouldHandleTap()) setLightboxOpen(true);
            }}
            className="block overflow-hidden rounded-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl ?? ""}
              alt="Photo"
              loading="lazy"
              className="max-h-64 w-auto max-w-full object-cover"
            />
          </button>
        ) : isGif ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.gifUrl ?? ""}
            alt="GIF"
            loading="lazy"
            className="max-h-64 w-auto max-w-full rounded-2xl"
          />
        ) : message.text ? (
          <p className="font-dm whitespace-pre-wrap break-words text-sm leading-[1.55]">
            <EmojiText text={message.text} />
          </p>
        ) : (
          // Unknown message content (for example a message type added after
          // this device last updated) should never render as an invisible
          // bubble.
          <p className="font-dm text-sm italic opacity-60">
            Update Hearth to see this message
          </p>
        )}

        {hasReactions &&
          (emojiOnly
            ? // No bubble to straddle: keep the pills in flow below the emojis.
              reactionPills(
                cn(
                  "mt-1.5 flex flex-wrap gap-1",
                  isOwn ? "justify-end" : "justify-start"
                )
              )
            : // Straddle the bubble's bottom border: the border line crosses the
              // middle of the reaction pills (WhatsApp-style).
              reactionPills(
                cn(
                  "absolute bottom-0 z-10 flex translate-y-1/2 flex-wrap gap-1",
                  isOwn ? "right-2 justify-end" : "left-2 justify-start"
                )
              ))}

        {isGroupEnd && (
          <div
            className={cn(
              "flex items-center gap-1",
              isMedia ? "mt-1 px-1 pb-0.5" : emojiOnly ? "mt-1" : "mt-0.5",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            {!isPending && (
              <span className="text-[10px] tabular-nums text-ink-muted">
                {formatTime(message.createdAt)}
              </span>
            )}
            {isOwn &&
              (message.read ? (
                <CheckCheck
                  className="animate-check-pop h-3 w-3 text-accent-text"
                  aria-label="Read"
                />
              ) : (
                <Check
                  className="animate-check-pop h-3 w-3 text-ink-muted"
                  aria-label={isPending ? "Sending" : "Sent"}
                />
              ))}
          </div>
        )}
        </div>
      </div>

      {lightboxOpen && message.imageUrl && (
        <ImageLightbox
          src={message.imageUrl}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
