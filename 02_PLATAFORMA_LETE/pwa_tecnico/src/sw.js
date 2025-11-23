import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

// 1. Configuración básica de PWA (Para que funcione offline)
self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()

// Esta línea es mágica: Vite inyectará aquí la lista de archivos a cachear
precacheAndRoute(self.__WB_MANIFEST)

// -----------------------------------------------------------------
// 2. LÓGICA DE NOTIFICACIONES PUSH (Lo nuevo)
// -----------------------------------------------------------------

// A) Recibir la notificación desde el servidor
self.addEventListener('push', (event) => {
    let data = { title: 'Nueva Notificación', body: 'Tienes un mensaje nuevo', url: '/' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            console.log('La notificación no es un JSON válido, usando texto plano');
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/logo-192.png', // Asegúrate de que este archivo exista en public
        badge: '/logo-192.png',
        vibrate: [100, 50, 100], // Patrón de vibración
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// B) Qué pasa cuando el técnico le da clic a la notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Abrir la App en la URL específica
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Si ya hay una ventana abierta, úsala
            for (const client of clientList) {
                if (client.url.includes(event.notification.data.url) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no, abre una nueva
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});