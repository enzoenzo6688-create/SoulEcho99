const CACHE='se-v11';
const ASSETS=['/','/index.html','/app.js','/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.url.includes('firebase')||e.request.url.includes('googleapis'))return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r&&r.status===200&&!e.request.url.startsWith('chrome')){const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl));}return r;})));});
