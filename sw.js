const CACHE="pwa-v1";
const OFFLINE="offline.html";
const PRECACHE=[
  "./","index.html","styles.css","app.js","offline.html",
  "notes.html","tasks.html","settings.html","icon-192.png","icon-512.png"
];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match(OFFLINE)))))}); 