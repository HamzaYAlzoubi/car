const CACHE_NAME = "car-app-v2";
const ASSETS = ["index.html", "manifest.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // Force activate new SW immediately
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  // Delete old caches
  e.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  // Network first, fallback to cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache the new response
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request)),
  );
});
