import { NextResponse } from "next/server";
import webpush from "web-push";

export const runtime = "nodejs";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:noreply@example.com";

interface FirestoreValue {
  stringValue?: string;
  booleanValue?: boolean;
  timestampValue?: string;
  arrayValue?: { values?: Array<{ stringValue?: string }> };
  mapValue?: { fields?: Record<string, FirestoreValue> };
}

interface FirestoreDoc {
  fields?: Record<string, FirestoreValue>;
}

const DOCS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function verifyIdToken(idToken: string): Promise<string | null> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    users?: Array<{ localId?: string }>;
  };
  return data.users?.[0]?.localId ?? null;
}

async function getDocument(
  path: string,
  token: string
): Promise<FirestoreDoc | null> {
  const response = await fetch(`${DOCS_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as FirestoreDoc;
}

export async function POST(request: Request) {
  try {
    if (!PROJECT_ID || !API_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json({ skipped: "not-configured" });
    }

    const authorization = request.headers.get("authorization") ?? "";
    const idToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";
    if (!idToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const senderId = await verifyIdToken(idToken);
    if (!senderId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      conversationId?: unknown;
      receiverId?: unknown;
      preview?: unknown;
      senderName?: unknown;
    } | null;

    const conversationId =
      typeof body?.conversationId === "string" ? body.conversationId : "";
    const receiverId =
      typeof body?.receiverId === "string" ? body.receiverId : "";

    if (
      !/^[A-Za-z0-9_-]{1,128}$/.test(conversationId) ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(receiverId)
    ) {
      return NextResponse.json({ error: "invalid-request" }, { status: 400 });
    }

    // The caller may only notify someone they actually have a conversation
    // with (reads are evaluated with the caller's own credentials).
    const conversation = await getDocument(
      `conversations/${conversationId}`,
      idToken
    );
    const participants = (
      conversation?.fields?.participants?.arrayValue?.values ?? []
    )
      .map((value) => value.stringValue)
      .filter((value): value is string => Boolean(value));

    if (
      !participants.includes(senderId) ||
      !participants.includes(receiverId)
    ) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Skip the push when the receiver is actively using Hearth.
    const receiver = await getDocument(`users/${receiverId}`, idToken);
    const isOnline = receiver?.fields?.isOnline?.booleanValue === true;
    const lastSeen = receiver?.fields?.lastSeen?.timestampValue
      ? Date.parse(receiver.fields.lastSeen.timestampValue)
      : 0;
    if (isOnline && Date.now() - lastSeen < 90_000) {
      return NextResponse.json({ skipped: "receiver-active" });
    }

    const subscriptionDoc = await getDocument(
      `pushSubscriptions/${receiverId}`,
      idToken
    );
    const subscriptionFields =
      subscriptionDoc?.fields?.subscription?.mapValue?.fields;
    const endpoint = subscriptionFields?.endpoint?.stringValue;
    const p256dh =
      subscriptionFields?.keys?.mapValue?.fields?.p256dh?.stringValue;
    const authKey = subscriptionFields?.keys?.mapValue?.fields?.auth?.stringValue;

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json({ skipped: "no-subscription" });
    }

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const preview =
      typeof body?.preview === "string" && body.preview
        ? body.preview.slice(0, 160)
        : "New message";
    const senderName =
      typeof body?.senderName === "string" && body.senderName
        ? body.senderName.slice(0, 80)
        : "Hearth";

    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth: authKey } },
      JSON.stringify({
        title: senderName,
        body: preview,
        url: "/chat",
        tag: conversationId,
      })
    );

    return NextResponse.json({ sent: true });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      return NextResponse.json({ skipped: "subscription-expired" });
    }
    console.error("Push notification failed", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
