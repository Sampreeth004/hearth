import { Timestamp, type DocumentData } from "firebase/firestore";
import type {
  Conversation,
  FriendRequest,
  FriendRequestStatus,
  Message,
  UserProfile,
} from "@/types";

export function tsToISO(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

export function tsToMillis(value: unknown): number | null {
  const iso = tsToISO(value);
  if (!iso) return null;
  const millis = Date.parse(iso);
  return Number.isNaN(millis) ? null : millis;
}

export function mapUser(id: string, data: DocumentData): UserProfile {
  return {
    uid: id,
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    email: typeof data.email === "string" ? data.email : "",
    photoURL: typeof data.photoURL === "string" ? data.photoURL : "",
    username: typeof data.username === "string" ? data.username : "",
    bio: typeof data.bio === "string" ? data.bio : "",
    isOnline: data.isOnline === true,
    lastSeen: tsToISO(data.lastSeen),
    createdAt: tsToISO(data.createdAt),
  };
}

export function mapFriendRequest(id: string, data: DocumentData): FriendRequest {
  const status: FriendRequestStatus =
    data.status === "accepted" || data.status === "rejected" ? data.status : "pending";
  return {
    id,
    senderId: data.senderId,
    receiverId: data.receiverId,
    status,
    createdAt: tsToISO(data.createdAt),
  };
}

export function mapConversation(id: string, data: DocumentData): Conversation {
  return {
    id,
    participants: Array.isArray(data.participants) ? (data.participants as string[]) : [],
    lastMessage: typeof data.lastMessage === "string" ? data.lastMessage : "",
    lastMessageAt: tsToISO(data.lastMessageAt),
    lastMessageSenderId:
      typeof data.lastMessageSenderId === "string" ? data.lastMessageSenderId : "",
    unreadCount:
      data.unreadCount && typeof data.unreadCount === "object"
        ? (data.unreadCount as Record<string, number>)
        : {},
  };
}

export function mapMessage(id: string, data: DocumentData): Message {
  const gifUrl = typeof data.gifUrl === "string" && data.gifUrl ? data.gifUrl : null;
  const imageUrl =
    typeof data.imageUrl === "string" && data.imageUrl ? data.imageUrl : null;
  const reactions: Record<string, string> = {};
  if (data.reactions && typeof data.reactions === "object") {
    for (const [userId, emoji] of Object.entries(
      data.reactions as Record<string, unknown>
    )) {
      if (typeof emoji === "string" && emoji) reactions[userId] = emoji;
    }
  }

  const rawReply = data.replyTo;
  const replyTo =
    rawReply &&
    typeof rawReply === "object" &&
    typeof rawReply.messageId === "string" &&
    rawReply.messageId
      ? {
          messageId: rawReply.messageId,
          senderName:
            typeof rawReply.senderName === "string" ? rawReply.senderName : "",
          preview: typeof rawReply.preview === "string" ? rawReply.preview : "",
        }
      : null;

  const messageType: Message["messageType"] = gifUrl
    ? "gif"
    : imageUrl
      ? "image"
      : data.messageType === "gif"
        ? "gif"
        : "text";

  return {
    id,
    senderId: data.senderId,
    receiverId: data.receiverId,
    text: typeof data.text === "string" ? data.text : "",
    messageType,
    gifUrl,
    imageUrl,
    reactions,
    replyTo,
    createdAt: tsToISO(data.createdAt),
    createdAtMillis: tsToMillis(data.createdAt),
    read: data.read === true,
  };
}

export function placeholderUser(id: string): UserProfile {
  return {
    uid: id,
    displayName: "Unknown user",
    email: "",
    photoURL: "",
    username: "unknown",
    bio: "",
    isOnline: false,
    lastSeen: null,
    createdAt: null,
  };
}
