const CACHE = "mytodo-v1";

const DATEIEN = [
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];

// App installieren & Dateien cachen
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(DATEIEN))
    );
});

// Anfragen abfangen — offline zuerst Cache nutzen
self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(antwort => {
            return antwort || fetch(e.request);
        })
    );
});

// Alten Cache löschen bei Update
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE).map(k => caches.delete(k))
            )
        )
    );
});