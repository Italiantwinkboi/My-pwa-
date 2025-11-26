const CACHE='pwa-v2';
const PRECACHE=[
  '/My-pwa-/', '/My-pwa-/index.html','/My-pwa-/styles.css','/My-pwa-/app.js',
  '/My-pwa-/manifest.webmanifest','/My-pwa-/offline.html','/My-pwa-/icon-192.png','/My-pwa-/icon-512.png'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode==='navigate' || (req.method==='GET' && req.headers.get('accept')?.includes('text/html'))){
    e.respondWith(fetch(req).then(r=>{ let copy=r.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return r }).catch(()=>caches.match('/My-pwa-/offline.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{ let copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res })).catch(()=>{/*image fallback*/}));
});