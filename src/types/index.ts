export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  username: string;
  bio: string;
  isOnline: boolean;
  lastSeen: string | null;
  createdAt: string | null;
}

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string | null;
}

export interface Friendship {
  id: string;
  users: string[];
  createdAt: string | null;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string | null;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>;
}

export type MessageType = "text" | "gif" | "image";

export interface ReplyReference {
  messageId: string;
  senderName: string;
  preview: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  messageType: MessageType;
  gifUrl: string | null;
  imageUrl: string | null;
  reactions: Record<string, string>;
  replyTo: ReplyReference | null;
  createdAt: string | null;
  createdAtMillis: number | null;
  read: boolean;
}

export interface GifResult {
  id: string;
  title: string;
  previewUrl: string;
  fullUrl: string;
  width: number;
  height: number;
}

export type RelationshipStatus = "none" | "friends" | "requested" | "incoming";
