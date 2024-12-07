// public/service-worker.ts

/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// Precache all assets during installation
precacheAndRoute(self.__WB_MANIFEST);

// API calls cache strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Static assets cache strategy
registerRoute(
  ({ request }) => request.destination === 'image' ||
                   request.destination === 'style' ||
                   request.destination === 'script' ||
                   request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Background sync for offline functionality
const bgSyncPlugin = new BackgroundSyncPlugin('offlineQueue', {
  maxRetentionTime: 24 * 60 // Retry for 24 Hours (specified in minutes)
});

// Offline form submissions
registerRoute(
  ({ url }) => url.pathname.includes('/api/form'),
  new NetworkFirst({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      clickUrl: data.clickUrl
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data.clickUrl)
    );
  }
});

// Periodic sync for background updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  // Implementation for updating cache
}
