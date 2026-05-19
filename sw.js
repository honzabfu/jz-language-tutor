const CACHE = 'langtutor-v19';
const ASSETS = [
'./',
'./index.html',
'./style.css',
'./i18n.js',
'./constants.js',
'./state.js',
'./dom.js',
'./llm.js',
'./vocab.js',
'./tips.js',
'./updates.js',
'./flashcard.js',
'./quiz.js',
'./chat.js',
'./settings.js',
'./nav.js',
'./app.js'
];

self.addEventListener('install', e => {
e.waitUntil(
caches.open(CACHE)
.then(c => c.addAll(ASSETS))
.then(() => self.skipWaiting())
);
});

self.addEventListener('activate', e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
).then(() => self.clients.claim())
);
});

self.addEventListener('fetch', e => {
const url = new URL(e.request.url);

const apiHosts = [
'api.anthropic.com',
'api.openai.com',
'generativelanguage.googleapis.com'
];
if (apiHosts.some(h => url.hostname.includes(h)) || url.hostname === self.location.hostname && url.port !== '') {
e.respondWith(fetch(e.request));
return;
}

if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
e.respondWith(fetch(e.request).catch(() => new Response('Ollama nedostupny', { status: 503 })));
return;
}

if (url.origin !== self.location.origin) {
e.respondWith(fetch(e.request));
return;
}

// Network-first for same-origin assets: always serve fresh from network, fall back to cache when offline
e.respondWith(
fetch(e.request).then(resp => {
if (e.request.method === 'GET' && resp.status === 200) {
caches.open(CACHE).then(cache => cache.put(e.request, resp.clone()));
}
return resp;
}).catch(() => caches.match(e.request))
);
});
