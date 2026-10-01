import { memo } from "react";
import twemoji from "@twemoji/api";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function parseEmoji(text: string): string {
  return twemoji.parse(escapeHtml(text), {
    base: "/twemoji/",
    folder: "svg",
    ext: ".svg",
    className: "hearth-emoji",
    attributes: () => ({ draggable: "false", loading: "lazy", decoding: "async" }),
  });
}

/**
 * True when the text contains at least one emoji and nothing else besides
 * whitespace. Used to render emoji-only messages without a bubble.
 */
export function isEmojiOnly(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && twemoji.replace(trimmed, "").trim().length === 0;
}

interface EmojiTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with every unicode emoji swapped for a bundled Twemoji SVG, so
 * emojis look identical on every platform while users keep typing them from
 * their own keyboard. The text is HTML-escaped before parsing, so the
 * generated markup is safe.
 */
export const EmojiText = memo(function EmojiText({
  text,
  className,
}: EmojiTextProps) {
  if (!text) return null;
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: parseEmoji(text) }}
    />
  );
});
