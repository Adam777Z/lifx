const cacheName = 'lifx-cache';
const cacheVersion = '1.1.0'; // Needed for service worker auto update

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.delete(cacheName).then((deleted) => {
			caches.open(cacheName).then((cache) => cache.addAll([
				'/lifx/',
				'/lifx/package.json',
				'/lifx/manifest.json',
				'/lifx/assets/images/icon.png',
				'/lifx/assets/images/icon-192x192.png',
				'/lifx/assets/css/bootstrap.min.css',
				'/lifx/assets/css/bootstrap-icons.min.css',
				'/lifx/assets/css/fonts/bootstrap-icons.woff2',
				'/lifx/assets/css/style.min.css',
				'/lifx/assets/js/bootstrap.bundle.min.js',
				'/lifx/assets/js/script.min.js',
			]));
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(caches.open(cacheName).then((cache) => cache.match(event.request).then((response) => response || fetch(event.request))));
});