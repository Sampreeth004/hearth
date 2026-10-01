"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Send, Users, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { FlameMark } from "@/components/ui/HearthLogo";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { getOrCreateConversation, sendMessage } from "@/services/chatService";
import { notifyReceiver } from "@/services/notifyService";
import { useToast } from "@/context/ToastContext";
import { cn, getFriendlyErrorMessage } from "@/lib/utils";
import type { UserProfile } from "@/types";

function ShareContent() {
  const { user, initializing } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const sharedText = (
    searchParams.get("url") ||
    searchParams.get("text") ||
    searchParams.get("title") ||
    ""
  ).trim();

  const { friends, loading } = useFriends(user?.uid);
  const profiles = useUserProfiles(friends);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [comment, setComment] = useState("");
  const [sharing, setSharing] = useState(false);
  const [sentTo, setSentTo] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!initializing && !user) {
      window.location.replace("/login");
    }
  }, [initializing, user]);

  const handleShare = useCallback(async () => {
    if (!user || !selected || sharing) return;
    setSharing(true);
    try {
      const conversationId = await getOrCreateConversation(
        user.uid,
        selected.uid
      );
      const trimmedComment = comment.trim();
      const text = trimmedComment
        ? sharedText
          ? `${trimmedComment}\n\n${sharedText}`
          : trimmedComment
        : sharedText || "Shared from another app";
      await sendMessage(conversationId, user.uid, selected.uid, { text });
      notifyReceiver({
        conversationId,
        receiverId: selected.uid,
        preview: text.slice(0, 120),
      });
      setSentTo(selected);
      addToast("Message sent!", "success", "Your message has been delivered.");
    } catch (error) {
      console.error("Failed to share", error);
      addToast(getFriendlyErrorMessage(error), "error");
    } finally {
      setSharing(false);
    }
  }, [user, selected, sharing, comment, sharedText, addToast]);

  if (initializing || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div
          role="status"
          aria-label="Loading"
          className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-b-accent"
        />
      </div>
    );
  }

  const friendList = friends
    .map((id) => profiles[id])
    .filter((profile): profile is UserProfile => Boolean(profile));

  return (
    <main className="glass-fill min-h-dvh">
      <div className="animate-fade-slide-up mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5 py-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="bg-accent-gradient flex h-10 w-10 items-center justify-center rounded-2xl shadow-[0_6px_14px_rgba(51,39,42,0.12)]">
            <FlameMark className="h-5 w-5" monochrome="#ffffff" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold tracking-tight text-ink">
              Share to Hearth
            </h1>
            <p className="truncate text-xs text-ink-muted">
              Pick a friend to send this to
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/chat")}
            aria-label="Close"
            className="glass-icon-btn h-8 w-8"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sharedText && (
          <div className="glass-tint mb-4 rounded-2xl px-3.5 py-2.5">
            <p className="font-dm line-clamp-3 break-all text-xs text-ink-muted">
              {sharedText}
            </p>
          </div>
        )}

        {sentTo ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-ink shadow-[0_10px_26px_rgba(62,142,90,0.25)]">
              <Check className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">
                Sent to {sentTo.displayName}
              </p>
              <p className="font-dm mt-0.5 text-xs text-ink-muted">
                You can keep chatting in Hearth.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => router.push("/chat")}
              className="w-full"
            >
              Open Hearth
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : friendList.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No friends yet"
            description="Add friends in Hearth first, then share to them."
          />
        ) : (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
              Share to
            </p>
            <div className="-mx-2 max-h-64 overflow-y-auto">
              {friendList.map((friend) => {
                const isSelected = selected?.uid === friend.uid;
                return (
                  <button
                    key={friend.uid}
                    type="button"
                    onClick={() => setSelected(friend)}
                    aria-pressed={isSelected}
                    disabled={sharing}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-2 py-2.5 text-left transition-all duration-200 disabled:opacity-60",
                      isSelected
                        ? "glass-active"
                        : "border-transparent hover:bg-glass-subtle"
                    )}
                  >
                    <Avatar
                      src={friend.photoURL}
                      name={friend.displayName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {friend.displayName}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        @{friend.username}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isSelected
                          ? "border-transparent bg-accent-gradient"
                          : "border-hairline"
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Add a comment (optional...)"
              aria-label="Add a comment"
              className="font-dm mt-3 w-full resize-none rounded-2xl border border-hairline bg-glass-subtle px-3.5 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink-muted focus:border-accentline focus:bg-glass focus:ring-4 focus:ring-accent-soft"
            />

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/chat")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleShare()}
                disabled={!selected}
                loading={sharing}
                className="flex-1"
              >
                {!sharing && <Send className="h-4 w-4" />}
                Share
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div
            role="status"
            aria-label="Loading"
            className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-b-accent"
          />
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
