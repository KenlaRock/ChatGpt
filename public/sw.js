const CACHE_NAME = "nsr-deck-v1";
const APP_SHELL = ["/", "/index.html", "/offline.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const acceptsHtml = event.request.headers.get("accept")?.includes("text/html");
  const isHtmlRequest =
    event.request.mode === "navigate" || event.request.destination === "document" || acceptsHtml;

  event.respondWith(
    (async () => {
      if (isHtmlRequest) {
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        } catch {
          return (
            (await caches.match(event.request)) ||
            (await caches.match("/index.html")) ||
            caches.match("/offline.html")
          );
        }
      }

      const cached = await caches.match(event.request);
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => new Response("Offline", { status: 503, statusText: "Offline" }));
    })()
  );
});
