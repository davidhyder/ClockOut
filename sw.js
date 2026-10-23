// Offline support for the home-screen app. The page is fetched from the
// network first (so updates show up), with the saved copy used when offline.
var CACHE = "clockout-v1";
var FILES = ["./", "index.html", "install.html", "manifest.json", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res.ok && new URL(e.request.url).origin === location.origin){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(e.request, {ignoreSearch: true}).then(function(hit){
        return hit || caches.match("index.html");
      });
    })
  );
});
