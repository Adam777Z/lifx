const cacheName = 'lifx-cache';

self.addEventListener('install', (event) => {
	event.waitUntil((() => {
		caches.open(cacheName).then((cache) => cache.addAll([
			'/lifx/',
			'/lifx/package.json',
			'/lifx/manifest.json',
			'/lifx/assets/images/icon-192x192.png',
			'/lifx/assets/images/icon-512x512.png',
			'/lifx/assets/css/bootstrap.min.css',
			'/lifx/assets/css/bootstrap-icons.min.css',
			'/lifx/assets/css/fonts/bootstrap-icons.woff2',
			'/lifx/assets/css/style.min.css',
			'/lifx/assets/js/bootstrap.bundle.min.js',
			'/lifx/assets/js/script.min.js',
		]));
	})());
});

self.addEventListener('fetch', (event) => {
	event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});