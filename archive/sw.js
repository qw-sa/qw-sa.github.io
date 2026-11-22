/* أرشيفي — service worker: receives Android share-sheet posts */
var DB='arsheefy', VER=1;
function openDB(){
  return new Promise(function(res,rej){
    var r=indexedDB.open(DB,VER);
    r.onupgradeneeded=function(){
      var d=r.result;
      if(!d.objectStoreNames.contains('items')) d.createObjectStore('items',{keyPath:'id'});
      if(!d.objectStoreNames.contains('inbox')) d.createObjectStore('inbox',{autoIncrement:true});
    };
    r.onsuccess=function(){res(r.result);}; r.onerror=function(){rej(r.error);};
  });
}
self.addEventListener('install',function(){ self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);
  if(e.request.method==='POST' && u.pathname==='/archive/share'){
    e.respondWith((async function(){
      try{
        var fd=await e.request.formData();
        var data={title:fd.get('title')||'',text:fd.get('text')||'',url:fd.get('url')||'',files:[],at:Date.now()};
        fd.getAll('files').forEach(function(f){ if(f && f.size) data.files.push({name:f.name,type:f.type,size:f.size,blob:f}); });
        var db=await openDB();
        await new Promise(function(res,rej){ var t=db.transaction('inbox','readwrite'); t.objectStore('inbox').add(data); t.oncomplete=res; t.onerror=function(){rej(t.error);}; });
      }catch(err){}
      return Response.redirect(new URL('./?share=1', self.registration.scope).href, 303);
    })());
  }
});
