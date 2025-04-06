// Nombre del caché
const CACHE_NAME = 'elite-estate-v1';

// Archivos a cachear
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver evento',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Recordatorio de Evento', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/agenda')
    );
  }
});

// Verificar recordatorios pendientes periódicamente
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkPendingReminders());
  }
});

async function checkPendingReminders() {
  try {
    const now = new Date();
    const response = await fetch('/api/reminders/pending');
    const reminders = await response.json();

    for (const reminder of reminders) {
      const reminderTime = new Date(reminder.reminderTime);
      if (reminderTime <= now) {
        // Enviar notificación
        self.registration.showNotification(`Recordatorio: ${reminder.eventTitle}`, {
          body: `El evento "${reminder.eventTitle}" comienza en ${formatReminderTime(reminder.reminderMinutes)}`,
          icon: '/favicon.ico',
          tag: `event-${reminder.eventId}-${reminder.reminderMinutes}`,
          renotify: true,
          actions: [
            {
              action: 'explore',
              title: 'Ver evento',
              icon: '/favicon.ico'
            }
          ]
        });

        // Marcar recordatorio como enviado
        await fetch(`/api/reminders/${reminder.id}/sent`, {
          method: 'PUT'
        });
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

function formatReminderTime(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? "1 hora" : `${hours} horas`;
  } else {
    return `${minutes} minutos`;
  }
} 