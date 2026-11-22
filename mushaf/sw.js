const C='mushaf-v2';
const CORE=['./','./index.html','./data.json','./manifest.json','./logo.svg','./icon-192.png','./hafs.otf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.endsWith('everyayah.com'))return;
  const fonts=/fonts\.(googleapis|gstatic)\.com/.test(u.hostname);
  if(u.origin===location.origin||fonts){
    e.respondWith(caches.match(e.request).then(r=>{
      const net=fetch(e.request).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl));}return res;}).catch(()=>r);
      return r||net;
    }));
  }
});
