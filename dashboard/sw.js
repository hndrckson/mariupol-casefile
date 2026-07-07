const CACHE_NAME = "mariupol-casefile-v0-20260707-mapleads2";

const SHELL_ASSETS = [
  "./",
  "index.html",
  "styles.css?v=casefile-v0-20260707-mapleads2",
  "casefile-data.js?v=casefile-v0-20260707-mapleads2",
  "casefile-extra-data.js?v=casefile-v0-20260707-mapleads2",
  "casefile-map-index.js?v=casefile-v0-20260707-mapleads2",
  "app.js?v=casefile-v0-20260707-mapleads2",
  "manifest.webmanifest",
  "vendor/leaflet/leaflet.css",
  "vendor/leaflet/leaflet.js",
  "vendor/lucide/lucide.min.js",
  "data/targets.json?v=casefile-v0-20260703",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("index.html")))
  );
});
