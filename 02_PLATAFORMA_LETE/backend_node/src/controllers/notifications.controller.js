import webpush from 'web-push';
import pool from '../services/eaDatabase.js';

// Configurar web-push con las llaves del .env
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:test@test.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// 1. Guardar la suscripción del usuario
export const subscribeUser = async (req, res) => {
    const { subscription } = req.body;
    const userEmail = req.user.email; // Viene del auth middleware

    try {
        // Buscar ID numérico del usuario
        const [users] = await pool.query('SELECT id FROM ea_users WHERE email = ?', [userEmail]);
        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const userId = users[0].id;

        // Guardar en BD (Evitamos duplicados borrando el anterior si existe para ese endpoint)
        // Ojo: Un usuario puede tener varios dispositivos, así que validamos por endpoint
        const checkQuery = 'SELECT id FROM ea_push_subscriptions WHERE endpoint = ?';
        const [existing] = await pool.query(checkQuery, [subscription.endpoint]);

        if (existing.length === 0) {
            const insertQuery = `
        INSERT INTO ea_push_subscriptions (user_id, endpoint, p256dh, auth)
        VALUES (?, ?, ?, ?)
      `;
            await pool.query(insertQuery, [
                userId,
                subscription.endpoint,
                subscription.keys.p256dh,
                subscription.keys.auth
            ]);
        }

        res.status(201).json({ message: 'Notificaciones activadas correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al suscribir usuario.' });
    }
};

// 2. Función auxiliar para ENVIAR notificación (para usarla desde otros controladores)
export const sendNotificationToUser = async (userId, payload) => {
    try {
        // Buscar todas las suscripciones de ese usuario (celular, tablet, laptop)
        const [subs] = await pool.query('SELECT * FROM ea_push_subscriptions WHERE user_id = ?', [userId]);

        const notifications = subs.map(sub => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: { auth: sub.auth, p256dh: sub.p256dh }
            };
            // Enviar y capturar error si la suscripción ya no existe (usuario borró caché)
            return webpush.sendNotification(pushConfig, JSON.stringify(payload))
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Borrar suscripción inválida
                        pool.query('DELETE FROM ea_push_subscriptions WHERE id = ?', [sub.id]);
                    }
                });
        });

        await Promise.all(notifications);
    } catch (error) {
        console.error("Error enviando push:", error);
    }
};