// Darren Finance service worker — offline cache. Content is encrypted; this only caches the encrypted shell.
const CACHE='darren-finance-v2-autolock-da364eaf4848';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const isPage=req.mode==='navigate'||/\/(index\.html)?$/.test(new URL(req.url).pathname);
  if(isPage){ // network-first so updates arrive; fall back to cache offline
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));
  } else {
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{const c=n.clone();caches.open(CACHE).then(x=>x.put(req,c));return n})));
  }
});
