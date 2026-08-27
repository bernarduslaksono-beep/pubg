const CACHE_NAME = 'uc-pubg-tl-v1';
const ADMIN_URL = '/painel-admin-x29k7';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handler — presiza atu browser konsidera site ne'e "installable"
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Simu Web Push notification husi server (Edge Function notify-push)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Loja-Game', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Loja-Game';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { orderId: data.orderId, url: ADMIN_URL },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Bainhira klik iha notification, loke/foka pajina admin
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || ADMIN_URL;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
