const CACHE_NAME = 'elitestate-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json'
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
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
      .then((response) => {
        if (response) {
          return response;
        }

        // Clonar la petición porque se puede usar solo una vez
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Verificar que tenemos una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // No cachear si no es GET
            if (event.request.method !== 'GET') {
              return response;
            }

            // Clonar la respuesta porque se puede usar solo una vez
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                if (isValidUrl(event.request.url)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // Aquí podrías devolver una respuesta fallback para offline
            return new Response('Offline');
          });
      })
  );
}); 