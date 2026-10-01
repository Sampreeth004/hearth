import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatConversationTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  if (isSameDay(date.getTime(), now.getTime())) return formatTime(iso);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date.getTime(), yesterday.getTime())) return "Yesterday";

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

export function formatLastSeen(iso: string | null): string {
  if (!iso) return "offline";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "offline";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function formatMemberSince(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatDateSeparator(millis: number | null): string {
  if (millis === null) return "";
  const date = new Date(millis);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  if (isSameDay(millis, now.getTime())) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(millis, yesterday.getTime())) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export function isSameDay(aMillis: number | null, bMillis: number | null): boolean {
  if (aMillis === null || bMillis === null) return aMillis === bMillis;
  const a = new Date(aMillis);
  const b = new Date(bMillis);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export function isUserOnline(
  profile: Pick<UserProfileLike, "isOnline" | "lastSeen"> | null | undefined
): boolean {
  if (!profile || !profile.isOnline) return false;
  if (!profile.lastSeen) return true;
  const last = Date.parse(profile.lastSeen);
  if (Number.isNaN(last)) return true;
  return Date.now() - last < ONLINE_WINDOW_MS;
}

interface UserProfileLike {
  isOnline: boolean;
  lastSeen: string | null;
}

export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateUsername(email: string): string {
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9._]/g, "")
    .toLowerCase();
  return base || `user${Math.floor(Math.random() * 10000)}`;
}

const GIF_HOSTS = [
  "giphy.com",
  "tenor.com",
  "klipy.com",
];

export function isGifUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  if (path.endsWith(".gif")) return true;

  const isKnownGifHost = GIF_HOSTS.some(
    (gifHost) => host === gifHost || host.endsWith(`.${gifHost}`)
  );
  if (!isKnownGifHost) return false;

  return (
    path.endsWith(".gif") ||
    path.includes("/media/") ||
    path.startsWith("/gifs/") ||
    url.searchParams.has("gif")
  );
}

export function getFriendlyErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked. Please allow popups and try again.";
    case "auth/cancelled-popup-request":
      return "Sign-in was interrupted. Please try again.";
    case "auth/internal-error":
      return "Sign-in could not complete because your browser blocked third-party access. Try the redirect sign-in below.";
    case "auth/configuration-not-found":
      return "Google sign-in is not enabled for this Firebase project.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in in the Firebase console.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "permission-denied":
      return "You do not have permission to do that.";
    case "unavailable":
      return "Could not reach the server. Check your connection.";
    case "already-exists":
      return "That already exists.";
    default:
      if (error instanceof Error && error.message && !code) return error.message;
      return "Something went wrong. Please try again.";
  }
}
