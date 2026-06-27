const CACHE_NAME = 'audiolivreur-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/tts/edgeTts.js',
  './js/parsers/fileParser.js',
  './js/app.js',
  './manifest.json',
  './assets/app_icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network first for WebSocket and API, Cache first for static assets
  if (event.request.url.includes('speech.platform.bing.com') || event.request.url.includes('cdnjs.cloudflare.com')) {
    return fetch(event.request);
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
