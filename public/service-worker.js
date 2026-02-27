// This service worker unregisters itself and clears all caches
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
    // Clear ALL caches
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    // Unregister self
    await self.registration.unregister();
});


