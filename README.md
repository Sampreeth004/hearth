# Hearth

Where friends gather. A modern, responsive real-time chat application built with Next.js, Firebase, and Tailwind CSS.

## Features

- Google authentication via Firebase Auth
- Automatic user profile creation on first sign-in
- User search by name, username, or email (debounced, prefix queries)
- Friend requests: send, accept, decline, cancel, re-send after rejection
- Friends list with live online/offline presence
- Real-time one-to-one messaging with read receipts
- Photo messages: client-side compressed (1280px JPEG, fits the 1 MiB doc cap) with a fullscreen lightbox
- Typing indicators (throttled writes, auto-decay, never stuck)
- Emoji reactions and swipe-to-reply style quoting on messages
- Web push notifications (VAPID) that skip you when you're already online
- Installable PWA â€” home screen icon, unread app badge, Android share-sheet target
- Installable PWA â€” Android/iOS home screen, offline shell, in-app install button
- GIF messages: search via GIPHY (free key) or paste any GIF link
- Conversation history with pagination ("Load older messages")
- Unread message counts per conversation (live)
- Presence heartbeat with last-seen fallback
- Profile management: photo upload (compressed Base64 stored in Firestore), display name, username, bio
- No Cloud Storage or paid plan required â€” runs fully on the Firebase Spark plan
- Dark mode: light / dark / system, persisted
- Fully responsive: bottom navigation on mobile, sidebar on desktop
- Skeleton loaders, empty states, friendly error handling, toast notifications
- Accessible: semantic landmarks, ARIA labels, keyboard support, focus states

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Backend:** Firebase (Authentication, Cloud Firestore)
- **Icons:** Lucide React
- **State:** React Context + hooks + Firestore real-time listeners (no Redux)

## Prerequisites

- Node.js 18+
- npm
- A Firebase project (Spark plan is sufficient)

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. **Authentication** â†’ Sign-in method â†’ enable **Google**.
   - Under Authentication â†’ Settings â†’ Authorized domains, `localhost` is already allowed. Add your production domain after deploying.
3. **Firestore Database** â†’ Create database â†’ start in production mode.
4. **Project settings** â†’ General â†’ Your apps â†’ Web app â†’ copy the SDK config values.
5. Deploy the security rules and indexes (see below).

Profile photos do **not** require Cloud Storage: they are downscaled to 192px JPEG
on the client and stored as compressed Base64 inside the user document (kept well
under Firestore's 1 MiB document limit).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values from your Firebase web app config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional: enables GIF search in the composer
NEXT_PUBLIC_GIPHY_API_KEY=
```

These are public client identifiers, not secrets. Never commit service account keys.

## Web Push Notifications

Notifications are self-hosted with standard Web Push (no Firebase Cloud
Messaging required):

1. Generate a VAPID key pair: `npx web-push generate-vapid-keys --json`
2. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` in
   `.env.local` and in Vercel.
3. Users enable them from **Profile â†’ Notifications**.

Deliveries run through `src/app/api/notify/route.ts`: it verifies the sender's
Firebase ID token, checks the caller participates in the conversation, and skips
the push entirely when the receiver is actively online. Subscriptions live in
`pushSubscriptions/{uid}` and the service worker (`public/sw.js`) renders the
notification and focuses the app on tap.

## Install as an App (PWA)

Hearth is an installable Progressive Web App: it gets a home-screen icon, opens
full-screen without browser chrome, and keeps a lightweight offline shell.

- **Android (Chrome/Edge):** open the site â†’ an install banner may appear, or use
  **Profile â†’ App â†’ Install Hearth** to trigger the native install prompt at any time.
- **iOS (Safari):** open the site â†’ **Share â†’ Add to Home Screen** (Profile shows a
  hint button).
- **Desktop (Chrome/Edge):** install via the address-bar install icon or the
  Profile button.

The pieces live in `src/app/manifest.ts` (web manifest), `public/sw.js` (service
worker, production only) and `src/context/PWAContext.tsx` (install prompt + state).
Icons are generated from the brand SVG into `public/icons/`.

## GIF Support

The composer has a **GIF** button:

- **No configuration needed:** paste any GIF link directly into the picker's link field (or type a `.gif` URL into the message box) and it is sent as a GIF message.
- **Search + trending:** create a free API key at [developers.giphy.com](https://developers.giphy.com/) and set `NEXT_PUBLIC_GIPHY_API_KEY` in `.env.local`. The picker then shows trending GIFs and debounced search, with "Powered by GIPHY" attribution.

## Local Development

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and open the app in a second browser/incognito window with a different Google account to test friends and messaging.

## Deploying Rules and Indexes

Install the Firebase CLI (`npm i -g firebase-tools`), then:

```bash
firebase login
firebase use --add            # select your project
firebase deploy --only firestore:rules,firestore:indexes
```

`firebase.json` wires up `firestore.rules`, `firestore.indexes.json`, and the `auth` section.

## Same-Origin Authentication (custom auth domain)

To keep sign-in working in browsers that block third-party cookies (Chrome,
Safari, Brave, Firefox), the app serves Firebase's auth handler from its own
domain:

- `next.config.ts` rewrites `/__/auth/*` and `/__/firebase/*` to the Firebase
  auth domain, so popup and redirect sign-in are fully same-origin.
- Production uses `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-domain>`.
- Google must trust the new redirect URI. Register it in `firebase.json`:

```json
{
  "auth": {
    "providers": {
      "googleSignIn": {
        "oAuthBrandDisplayName": "Hearth",
        "supportEmail": "you@example.com",
        "authorizedRedirectUris": [
          "https://your-domain.com/__/auth/handler"
        ]
      }
    }
  }
}
```

Then run `firebase deploy --only auth`, and add the domain to Firebase Auth â†’
Settings â†’ Authorized domains.

## Firestore Data Model

### `users/{userId}`

```json
{
  "displayName": "John Doe",
  "email": "john@example.com",
  "photoURL": "https://...",
  "username": "johndoe",
  "usernameLower": "johndoe",
  "displayNameLower": "john doe",
  "emailLower": "john@example.com",
  "bio": "Hello!",
  "isOnline": true,
  "lastSeen": "<serverTimestamp>",
  "createdAt": "<serverTimestamp>"
}
```

The `*Lower` fields power case-insensitive prefix search without downloading the collection.

### `friendRequests/{sortedUidA_sortedUidB}`

Deterministic ID (sorted pair) makes duplicate requests impossible. A stale `rejected` request is deleted and recreated when either side sends again.

```json
{
  "senderId": "userA",
  "receiverId": "userB",
  "status": "pending | accepted | rejected",
  "createdAt": "<serverTimestamp>"
}
```

### `friendships/{sortedUidA_sortedUidB}`

Same deterministic pair ID as the accepted request, so a friendship is provably backed by an accepted request.

```json
{
  "users": ["userA", "userB"],
  "createdAt": "<serverTimestamp>"
}
```

The `users` array is kept so the schema can grow into group-adjacent features; conversations already use participant arrays.

### `conversations/{sortedUidA_sortedUidB}`

```json
{
  "participants": ["userA", "userB"],
  "lastMessage": "Hey!",
  "lastMessageAt": "<serverTimestamp>",
  "lastMessageSenderId": "userA",
  "unreadCount": { "userA": 0, "userB": 2 }
}
```

### `conversations/{conversationId}/messages/{messageId}`

```json
{
  "senderId": "userA",
  "receiverId": "userB",
  "text": "Hello!",
  "messageType": "text | gif",
  "gifUrl": "https://media.giphy.com/... (absent for text messages)",
  "createdAt": "<serverTimestamp>",
  "read": false
}
```

## Security Model

`firestore.rules` enforces:

- **Users:** signed-in users can read profiles (needed for search); only the owner can create/update their document, and the write is rejected if the Base64 `photoURL` or text fields exceed size limits (protects the 1 MiB document cap).
- **Friend requests:** only participants can read; the sender is fixed at creation; only the **receiver** can change `status` (`pending` â†’ `accepted`/`rejected`); delete is limited to the sender cancelling a pending/rejected request or the receiver cleaning up a rejected one.
- **Friendships:** readable by members; creatable **only** when the same-ID friend request exists with `status == "accepted"`, so nobody can fabricate a friendship.
- **Conversations:** readable/writable only by participants.
- **Messages:** readable by participants; creatable only by a participant whose `senderId == request.auth.uid`; the `read` flag can only be flipped to `true` by the intended receiver.

## Required Indexes

`firestore.indexes.json` contains the only composite index needed:

- `conversations`: `participants` (array-contains) + `lastMessageAt` (descending)

All other queries (prefix user search, friend requests, message pagination) are served by automatic single-field indexes.

## Project Structure

```
src/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ chat/                 # Protected chat route (renders AppShell)
â”‚   â”œâ”€â”€ login/                # Google sign-in page
â”‚   â”œâ”€â”€ layout.tsx            # Providers: theme, auth, toast + Toaster
â”‚   â””â”€â”€ page.tsx              # Redirects to /chat or /login
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ chat/                 # ChatsPanel, ConversationList/Item, ChatArea,
â”‚   â”‚                         # ChatHeader, MessageList/Bubble/Input
â”‚   â”œâ”€â”€ friends/              # FriendsView, FriendsList, FriendRequestCard
â”‚   â”œâ”€â”€ users/                # UserSearch, UserCard
â”‚   â”œâ”€â”€ profile/              # ProfileView
â”‚   â”œâ”€â”€ layout/               # AppShell, Sidebar, MobileNavigation
â”‚   â””â”€â”€ ui/                   # Avatar, Button, EmptyState, Toaster
â”œâ”€â”€ context/                  # AuthContext, ThemeContext, ToastContext
â”œâ”€â”€ hooks/                    # useProfile, useUserProfiles, useConversations,
â”‚                             # useMessages, useFriends, useSearch, usePresence
â”œâ”€â”€ lib/                      # Firebase config + utilities
â”œâ”€â”€ services/                 # authService, userService, friendService,
â”‚                             # chatService, imageService, mappers
â””â”€â”€ types/                    # Shared TypeScript types
```

Business logic lives in services; hooks expose live data; components stay presentational.

## Presence

While the app is open, `usePresence` writes `isOnline: true` with a fresh `lastSeen` every 45 seconds and on tab focus. It writes `isOnline: false` on tab hide and page hide. Because unload events are unreliable, the UI also treats a friend as online only if `lastSeen` is within the last 2 minutes â€” stale flags decay gracefully.

## Unread Messages

`unreadCount` on each conversation is incremented atomically with `increment(1)` on send and reset to `0` when the receiver opens the conversation (marking the messages `read` via batched writes). Counts update live via Firestore listeners.

## Deployment

### Vercel (recommended)

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the six `NEXT_PUBLIC_FIREBASE_*` environment variables (plus `NEXT_PUBLIC_GIPHY_API_KEY` if you want GIF search).
4. Deploy, then add your production domain to Firebase Auth â†’ Settings â†’ Authorized domains.
5. If you use the Vercel CLI instead, `vercel link && vercel env add ... && vercel --prod` works too â€” note that preview deployments have different domains and need their own entries in Firebase's authorized domains.

### Build locally

```bash
npm run build
npm start
```

## Verification Checklist

```text
Open app â†’ Google Login â†’ user document created â†’ Chat screen
Search user B â†’ send friend request â†’ B accepts â†’ both see each other
Open friend â†’ conversation created â†’ message sent â†’ appears instantly
Receiver sees unread badge â†’ opens chat â†’ badge clears â†’ read receipt shows
```

## Credits

Emoji artwork by [Twemoji](https://github.com/jdecked/twemoji), licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). The SVG assets in `public/twemoji/` come from the [`@twemoji/svg`](https://www.npmjs.com/package/@twemoji/svg) package and are rendered by [`@twemoji/api`](https://www.npmjs.com/package/@twemoji/api).
