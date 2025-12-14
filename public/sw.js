const CACHE_NAME = "slurp-pwa-v1";
const APP_SHELL = ["/", "/leaderboard", "/profile", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((keys) =>
                Promise.all(
                    keys.map((
                        key,
                    ) => (key === CACHE_NAME ? null : caches.delete(key))),
                )
            ),
        ]),
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") return;

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request)
                .then((response) => {
                    const isSameOrigin =
                        new URL(request.url).origin === self.location.origin;
                    if (isSameOrigin && response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) =>
                            cache.put(request, clone)
                        );
                    }
                    return response;
                })
                .catch(() => caches.match("/"));
        }),
    );
});
