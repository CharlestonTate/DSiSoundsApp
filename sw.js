const V = "dsi-sound-v1";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then((hit) => {
      const net = fetch(r).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); }
        return res;
      });
      if (hit) { net.catch(() => {}); return hit; }
      return net.catch(() => (r.mode === "navigate" ? caches.match("index.html") : Response.error()));
    }),
  );
});
