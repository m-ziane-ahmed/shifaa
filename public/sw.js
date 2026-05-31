const CACHE_NAME = "shifaa-v2";
const STATIC_ASSETS = [
  "/",
  "/boutique",
  "/offline",
  "/manifest.json",
];

// Installation : mise en cache des assets statiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie : Network First pour les API, Cache First pour les assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes Supabase ou externes
  if (!url.origin.includes("shifaa") && !url.pathname.startsWith("/")) return;

  // Pages et assets : Stale While Revalidate
  if (request.mode === "navigate" || request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((res) => {
            if (res.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
            }
            return res;
          })
          .catch(() => cached ?? caches.match("/offline"));
        return cached ?? fetchPromise;
      })
    );
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Shifaa", {
      body: data.body ?? "",
      icon: "/brand-icon.svg",
      badge: "/brand-icon.svg",
      tag: data.tag ?? "shifaa-notif",
      data: { url: data.url ?? "/" },
      actions: data.actions ?? [],
    })
  );
});

// Clic sur notification → ouvrir la page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url === url && "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
