/* Modo offline: abre na hora pela cópia guardada e atualiza em segundo plano. */
const CACHE='listas-v6';
const FILES=['./','./index.html','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const key=req.mode==='navigate'?'./index.html':req;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(key,{ignoreSearch:true});
    const net=fetch(req,{cache:'no-store'}).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r;}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    const r=await net;return r||new Response('Sem internet',{status:503});
  }));
});
