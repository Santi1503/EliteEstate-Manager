const CACHE_NAME = 'elite-estate-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/assets/index.css',
  '/assets/index.js',
  '/assets/vendor.js',
  '/assets/logo.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// Función para verificar si una URL es válida para cachear
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptación de peticiones
self.addEventListener('fetch', event => {
  // Ignorar peticiones no HTTP/HTTPS
  if (!isValidUrl(event.request.url)) {
    return;
  }

  // Ignorar peticiones a la API de Firebase y otros servicios externos
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// Sincronización periódica
self.addEventListener('sync', event => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkReminders());
  }
});

// Función para verificar recordatorios
async function checkReminders() {
  try {
    const response = await fetch('/api/reminders/check');
    const reminders = await response.json();
    
    for (const reminder of reminders) {
      await showNotification(reminder);
    }
  } catch (error) {
    console.error('Error al verificar recordatorios:', error);
  }
}

// Función para mostrar notificaciones
async function showNotification(reminder) {
  const options = {
    body: reminder.description,
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: reminder.url
    }
  };

  await self.registration.showNotification(reminder.title, options);
}

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 