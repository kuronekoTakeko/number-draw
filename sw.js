const CACHE_NAME = "number-draw-v2";

const APP_ASSETS = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


/* =========================
   INSTALL
========================= */

self.addEventListener("install", (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_ASSETS);
    })
  );

  self.skipWaiting();

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.keys().then((cacheNames) => {

      return Promise.all(

        cacheNames
          .filter((name) => {
            return (
              name.startsWith("number-draw-") &&
              name !== CACHE_NAME
            );
          })

          .map((name) => {
            return caches.delete(name);
          })

      );

    })
  );

  self.clients.claim();

});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", (event) => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }


  /* ページ本体 */
  if (request.mode === "navigate") {

    event.respondWith(

      fetch(request)

        .then((response) => {

          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put("./index.html", copy);
          });

          return response;

        })

        .catch(() => {

          return caches.match("./index.html");

        })

    );

    return;
  }


  /* CSS・JS・画像など */
  event.respondWith(

    fetch(request)

      .then((response) => {

        const copy = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, copy);
        });

        return response;

      })

      .catch(() => {

        return caches.match(request);

      })

  );

});