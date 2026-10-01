const CACHE_NAME = "hearth-static-v1";

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Hearth - Offline</title>
<style>
  body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#faeee7;color:#33272a;font-family:system-ui,sans-serif;text-align:center}
  .flame{width:56px;height:56px;margin:0 auto 16px;border-radius:16px;background:#fffffe;display:flex;align-items:center;justify-content:center;font-size:28px}
  h1{font-size:18px;margin:0 0 6px}
  p{color:#594a4e;font-size:14px;margin:0}
</style></head>
<body><div><div class="flame">&#128293;</div><h1>You're offline</h1><p>Hearth needs a connection to deliver messages.</p></div></body></html>`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("push", (event) => {
  let payload = { title: "Hearth", body: "New message", url: "/chat", tag: "hearth" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Fall back to the default payload.
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "Hearth", {
      body: payload.body || "New message",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: payload.tag || "hearth",
      renotify: true,
      data: { url: payload.url || "/chat" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/chat";
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientList) {
        if ("focus" in client) {
          await client.focus();
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network first, offline fallback page when unreachable.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
      )
    );
    return;
  }

  // Static assets: stale-while-revalidate so the shell loads fast.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/twemoji/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/apple-icon.png";

  if (!isStatic) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
