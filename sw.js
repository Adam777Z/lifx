const cacheName = 'lifx-store';

self.addEventListener('install', (event) => {
	event.waitUntil((() => {
		caches.open(cacheName).then((cache) => cache.addAll([
			'/lifx/',
			'/lifx/index.html',
			'/lifx/package.json',
			'/lifx/manifest.json',
			'/lifx/assets/images/icon.png',
			'/lifx/assets/images/icon-192x192.png',
			'/lifx/assets/css/bootstrap.min.css',
			'/lifx/assets/css/bootstrap-icons.css',
			'/lifx/assets/css/fonts/bootstrap-icons.woff2',
			'/lifx/assets/css/style.min.css',
			'/lifx/assets/js/bootstrap.bundle.min.js',
			'/lifx/assets/js/script.min.js',
		]));
	})());
});

self.addEventListener('fetch', (event) => {
	event.respondWith((async () => {
		let response = await caches.match(event.request);
		return response ? response : await fetch(event.request);
	})());
});