// Life OS service worker — uygulamanın internet yokken de açılmasını sağlar.
// Strateji:
//   - /_next/static/* (adında sürüm olan dosyalar): önce önbellek (hiç değişmezler)
//   - Sayfalar: önce ağ, internet yoksa önbellekteki son sürüm
//   - Diğer kendi dosyalarımız (ikonlar vb.): önbellek varsa onu ver, arkada güncelle
// Başka sitelere giden istekler (ör. hava durumu) hiç önbelleğe alınmaz.
//
// Bu dosyayı değiştirince VERSION'ı artır: eski önbellek temizlenir.
const VERSION = "v1";
const CACHE = `life-os-${VERSION}`;
const PAGES = ["/", "/takvim", "/dersler", "/yapilacaklar", "/butce", "/rutin", "/ayarlar"];

// Kurulumda: tüm sayfaları VE her sayfanın kullandığı JS/CSS dosyalarını önceden kaydet.
// Böylece hiç açılmamış bir sekme bile internetsiz çalışır.
async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set();
  for (const page of PAGES) {
    const res = await fetch(page, { cache: "no-store" });
    if (!res.ok) continue;
    await cache.put(page, res.clone());
    const html = await res.text();
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assets.add(m[0]);
  }
  await Promise.all(
    [...assets].map((url) =>
      fetch(url)
        .then((r) => r.ok && cache.put(url, r))
        .catch(() => {}),
    ),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("life-os-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // başka siteler: dokunma

  // Sürümlü statik dosyalar: önce önbellek
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  // Sayfa geçişleri: önce ağ, olmazsa önbellek
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("/"))),
    );
    return;
  }

  // Diğerleri (RSC verisi, ikonlar...): önbellekteki varsa hemen ver, arkada tazele
  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => hit);
      return hit || network;
    }),
  );
});
