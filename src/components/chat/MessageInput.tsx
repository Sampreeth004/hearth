"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import { GifPicker } from "./GifPicker";
import { EmojiText } from "@/components/ui/EmojiText";
import { useToast } from "@/context/ToastContext";
import { fileToChatImageDataUrl } from "@/services/imageService";
import { getFriendlyErrorMessage } from "@/lib/utils";

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onSendGif: (gifUrl: string) => Promise<void>;
  onSendImage: (imageUrl: string) => Promise<void>;
  onTyping?: () => void;
  replyTo?: { senderName: string; preview: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onSendGif,
  onSendImage,
  onTyping,
  replyTo,
  onCancelReply,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [preparingImage, setPreparingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSend = async () => {
    const value = text.trim();
    if (!value || sending || disabled) return;

    setSending(true);
    try {
      await onSend(value);
      setText("");
      requestAnimationFrame(resize);
      // Keep the mobile keyboard open: tapping the send button can move focus
      // off the textarea (and disabling the button then collapses the
      // keyboard), so restore focus after the message goes out.
      textareaRef.current?.focus();
    } catch {
      // Errors are surfaced by the caller via toast.
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleSendGif = async (gifUrl: string) => {
    await onSendGif(gifUrl);
  };

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPreparingImage(true);
    try {
      const dataUrl = await fileToChatImageDataUrl(file);
      setPendingImage(dataUrl);
    } catch (error) {
      console.error("Failed to prepare photo", error);
      addToast(getFriendlyErrorMessage(error), "error");
    } finally {
      setPreparingImage(false);
    }
  };

  const handleSendImage = async () => {
    if (!pendingImage || sending || disabled) return;
    setSending(true);
    try {
      await onSendImage(pendingImage);
      setPendingImage(null);
    } catch {
      // Errors are surfaced by the caller via toast.
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative px-3 pb-3 pt-1">
      {gifPickerOpen && (
        <GifPicker onSelect={handleSendGif} onClose={() => setGifPickerOpen(false)} />
      )}

      {replyTo && (
        <div className="glass-tint animate-fade-slide-up mb-2 flex items-center gap-2 rounded-2xl border-l-2 border-l-accent px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-accent-text">
              Replying to {replyTo.senderName}
            </p>
            <p className="font-dm truncate text-xs text-ink-muted">
              <EmojiText text={replyTo.preview} />
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="glass-icon-btn h-7 w-7"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {(pendingImage || preparingImage) && (
        <div className="glass-tint animate-fade-slide-up mb-2 flex items-center gap-3 rounded-2xl p-2.5">
          {preparingImage ? (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-glass-subtle">
              <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pendingImage ?? ""}
              alt="Ready to send"
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink">Photo</p>
            <p className="text-[11px] text-ink-muted">
              {preparingImage ? "Preparing..." : "Ready to send"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSendImage()}
            disabled={!pendingImage || sending}
            aria-label="Send photo"
            className="bg-accent-gradient glow-accent flex h-9 w-9 items-center justify-center rounded-full transition-all hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            aria-label="Remove photo"
            className="glass-icon-btn h-7 w-7"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="glass-composer flex items-end gap-1 rounded-[26px] p-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || preparingImage}
          aria-label="Attach photo"
          className="glass-icon-btn h-9 w-9 shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Paperclip className="h-[18px] w-[18px]" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => {
            const value = event.target.value;
            setText(value);
            resize();
            if (value.trim() && onTyping) onTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          aria-label="Message"
          rows={1}
          disabled={disabled}
          className="font-dm max-h-[120px] min-h-[36px] flex-1 resize-none self-center bg-transparent px-2 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() => setGifPickerOpen((open) => !open)}
          disabled={disabled}
          aria-label="Choose a GIF"
          aria-expanded={gifPickerOpen}
          className={`glass-icon-btn h-9 shrink-0 px-2.5 text-[11px] font-extrabold tracking-wide disabled:cursor-not-allowed disabled:opacity-50 ${
            gifPickerOpen ? "is-active" : ""
          }`}
        >
          GIF
        </button>

        <button
          type="button"
          onClick={handleSend}
          // Don't let the send button take focus on touch devices - that is
          // what closes the mobile keyboard between messages.
          onPointerDown={(event) => event.preventDefault()}
          disabled={!text.trim() || sending || disabled}
          aria-label="Send message"
          className="bg-accent-gradient glow-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {sending ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Send className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
}
