const cacheName = 'lifx-cache';
const cacheVersion = '1.0.0'; // Needed for service worker auto updates

self.addEventListener('install', (event) => {
	event.waitUntil((() => {
		caches.delete(cacheName).then((deleted) => { // Delete all old files in the cache first
			caches.open(cacheName).then((cache) => cache.addAll([ // Cache all files of the app
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
		});
	})());
});

self.addEventListener('fetch', (event) => {
	event.respondWith(caches.open(cacheName).then((cache) => cache.match(event.request).then((response) => response || fetch(event.request))));
});

// function check_version() {
// 	fetch('package.json')
// 	.then((response) => response.ok ? response.json() : {})
// 	.then(async (data) => {
// 		let cachedData = await caches.open(cacheName).then((cache) => cache.match('package.json').then((response) => response.ok ? response.json() : {}));
// 		let cachedVersion = cachedData['version'];
// 		let version = data['version'];

// 		// Update files in the cache if version is not the same
// 		if (cachedVersion != version) {
// 			cache_files();
// 		}
// 	});
// }