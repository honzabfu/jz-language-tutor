const CACHE = 'langtutor-v25';
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
'./app.js',
'./manifest.json',
'./icons/icon-192.png',
'./icons/icon-512.png'
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

if (e.request.method !== 'GET') {
return;
}

// Network-first for same-origin assets. cache:'no-cache' revalidates against the
// server (ETag) and bypasses the HTTP cache TTL (GitHub Pages: max-age=600), so a
// deploy can never mix old and new ES modules; offline falls back to the SW cache.
e.respondWith(
fetch(e.request.url, { cache: 'no-cache' }).then(resp => {
if (resp.status === 200) {
caches.open(CACHE).then(cache => cache.put(e.request, resp.clone()));
}
return resp;
}).catch(() => caches.match(e.request))
);
});
