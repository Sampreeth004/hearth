import { auth } from "@/lib/firebase/config";

interface NotifyParams {
  conversationId: string;
  receiverId: string;
  preview: string;
}

/**
 * Asks the server to deliver a web push to the receiver. Fire-and-forget:
 * if it fails (offline, no subscription, missing VAPID keys) the message was
 * still delivered over Firestore, so nothing user-facing should break.
 */
export function notifyReceiver({ conversationId, receiverId, preview }: NotifyParams): void {
  void (async () => {
    try {
      const authUser = auth?.currentUser;
      if (!authUser) return;
      const token = await authUser.getIdToken();
      await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          receiverId,
          preview: preview.slice(0, 160),
          senderName: authUser.displayName ?? "Hearth",
        }),
      });
    } catch (error) {
      console.error("Failed to send push notification", error);
    }
  })();
}
