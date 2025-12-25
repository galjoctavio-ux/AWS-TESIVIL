/**
 * QRclima Notification Service
 * 
 * Servicio para manejar notificaciones push:
 * - Registro de FCM token
 * - Programación de notificaciones locales
 * - Preferencias de notificaciones
 * - Silencio nocturno (10pm - 8am)
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface NotificationPreferences {
    maintenanceReminders: boolean;  // Recordatorios de mantenimiento (PRO)
    appointmentReminders: boolean;  // Recordatorios de citas
    sosReplies: boolean;            // Respuestas en comunidad SOS
    walletUpdates: boolean;         // Actualizaciones de wallet/suscripción
    storeOrders: boolean;           // Estado de pedidos
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
    maintenanceReminders: true,
    appointmentReminders: true,
    sosReplies: true,
    walletUpdates: true,
    storeOrders: true,
};

// Configuración de horario de silencio (10pm - 8am)
const QUIET_HOURS = {
    start: 22, // 10pm
    end: 8,    // 8am
};

// ============================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ============================================

// Configurar cómo se manejan las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ============================================
// REGISTRO DE FCM TOKEN
// ============================================

/**
 * Registra el dispositivo para recibir notificaciones push
 * y guarda el FCM token en Firestore
 */
export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
    try {
        // Verificar si es un dispositivo físico
        if (!Device.isDevice) {
            console.log('⚠️ Las notificaciones push requieren un dispositivo físico');
            return null;
        }

        // Verificar permisos existentes
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Solicitar permisos si no están otorgados
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('❌ Permiso de notificaciones denegado');
            return null;
        }

        // Obtener el token de Expo Push (compatible con FCM)
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: 'qrclima', // Debe coincidir con el proyecto de Expo
        });

        const token = tokenData.data;
        console.log('✅ Push token obtenido:', token);

        // Guardar token en Firestore
        await saveFCMToken(userId, token);

        // Configurar canal de notificaciones en Android
        if (Platform.OS === 'android') {
            await setupAndroidNotificationChannel();
        }

        return token;
    } catch (error) {
        console.error('Error registrando para push notifications:', error);
        return null;
    }
};

/**
 * Guarda el FCM token en el perfil del usuario en Firestore
 */
const saveFCMToken = async (userId: string, token: string): Promise<boolean> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            fcmToken: token,
            fcmTokenUpdatedAt: new Date(),
        });
        console.log('✅ FCM token guardado en Firestore');
        return true;
    } catch (error) {
        console.error('Error guardando FCM token:', error);
        return false;
    }
};

/**
 * Configura el canal de notificaciones para Android
 */
const setupAndroidNotificationChannel = async (): Promise<void> => {
    await Notifications.setNotificationChannelAsync('default', {
        name: 'QRclima',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        sound: 'default',
    });

    // Canal para recordatorios (menos intrusivo)
    await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Recordatorios',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250],
        lightColor: '#10B981',
        sound: 'default',
    });

    // Canal para comunidad
    await Notifications.setNotificationChannelAsync('community', {
        name: 'Comunidad SOS',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 100],
        lightColor: '#8B5CF6',
    });
};

// ============================================
// SILENCIO NOCTURNO
// ============================================

/**
 * Verifica si estamos en horario de silencio nocturno (10pm - 8am)
 */
export const isQuietHours = (): boolean => {
    const now = new Date();
    const currentHour = now.getHours();

    // Entre las 10pm (22) y medianoche (24) O entre medianoche (0) y 8am
    return currentHour >= QUIET_HOURS.start || currentHour < QUIET_HOURS.end;
};

/**
 * Calcula el tiempo hasta que termine el horario de silencio
 * @returns Milisegundos hasta las 8am
 */
export const getTimeUntilQuietHoursEnd = (): number => {
    const now = new Date();
    const endTime = new Date();

    // Si es antes de las 8am, el fin es hoy a las 8am
    if (now.getHours() < QUIET_HOURS.end) {
        endTime.setHours(QUIET_HOURS.end, 0, 0, 0);
    } else {
        // Si es después de las 10pm, el fin es mañana a las 8am
        endTime.setDate(endTime.getDate() + 1);
        endTime.setHours(QUIET_HOURS.end, 0, 0, 0);
    }

    return endTime.getTime() - now.getTime();
};

// ============================================
// NOTIFICACIONES LOCALES
// ============================================

/**
 * Programa una notificación local
 * Respeta el horario de silencio nocturno
 */
export const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: Record<string, unknown>,
    triggerSeconds?: number,
    channelId: string = 'default'
): Promise<string | null> => {
    try {
        // Si estamos en horario de silencio, posponer hasta las 8am
        let trigger: Notifications.NotificationTriggerInput;

        if (triggerSeconds) {
            trigger = { seconds: triggerSeconds };
        } else if (isQuietHours()) {
            // Posponer hasta que termine el silencio nocturno
            const delayMs = getTimeUntilQuietHoursEnd();
            trigger = { seconds: Math.ceil(delayMs / 1000) };
            console.log(`🌙 Notificación pospuesta por silencio nocturno (${Math.round(delayMs / 60000)} minutos)`);
        } else {
            trigger = null; // Enviar inmediatamente
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data || {},
                sound: 'default',
            },
            trigger,
        });

        console.log(`📬 Notificación programada: ${notificationId}`);
        return notificationId;
    } catch (error) {
        console.error('Error programando notificación local:', error);
        return null;
    }
};

/**
 * Programa un recordatorio de cita
 * @param appointmentDate Fecha de la cita
 * @param clientName Nombre del cliente
 * @param address Dirección del servicio
 * @param hoursBefore Horas antes de la cita para notificar (default: 24)
 */
export const scheduleAppointmentReminder = async (
    appointmentId: string,
    appointmentDate: Date,
    clientName: string,
    address: string,
    hoursBefore: number = 24
): Promise<string | null> => {
    try {
        const triggerDate = new Date(appointmentDate);
        triggerDate.setHours(triggerDate.getHours() - hoursBefore);

        // Si la fecha de trigger ya pasó, no programar
        if (triggerDate <= new Date()) {
            console.log('⏰ Recordatorio no programado: la fecha ya pasó');
            return null;
        }

        const secondsUntilTrigger = Math.floor((triggerDate.getTime() - Date.now()) / 1000);

        const title = hoursBefore >= 24
            ? '📅 Mañana tienes una cita'
            : `⏰ En ${hoursBefore} horas: Cita de servicio`;

        const body = `${clientName} - ${address}`;

        return scheduleLocalNotification(
            title,
            body,
            { type: 'appointment_reminder', appointmentId },
            secondsUntilTrigger,
            'reminders'
        );
    } catch (error) {
        console.error('Error programando recordatorio de cita:', error);
        return null;
    }
};

/**
 * Cancela una notificación programada
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`🗑️ Notificación cancelada: ${notificationId}`);
    } catch (error) {
        console.error('Error cancelando notificación:', error);
    }
};

/**
 * Cancela todas las notificaciones programadas
 */
export const cancelAllNotifications = async (): Promise<void> => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('🗑️ Todas las notificaciones canceladas');
    } catch (error) {
        console.error('Error cancelando notificaciones:', error);
    }
};

// ============================================
// PREFERENCIAS DE NOTIFICACIONES
// ============================================

/**
 * Obtiene las preferencias de notificaciones del usuario
 */
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return data.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
        }

        return DEFAULT_NOTIFICATION_PREFERENCES;
    } catch (error) {
        console.error('Error obteniendo preferencias de notificaciones:', error);
        return DEFAULT_NOTIFICATION_PREFERENCES;
    }
};

/**
 * Actualiza las preferencias de notificaciones del usuario
 */
export const updateNotificationPreferences = async (
    userId: string,
    preferences: Partial<NotificationPreferences>
): Promise<boolean> => {
    try {
        const userRef = doc(db, 'users', userId);
        const currentPrefs = await getNotificationPreferences(userId);

        await updateDoc(userRef, {
            notificationPreferences: {
                ...currentPrefs,
                ...preferences,
            },
        });

        console.log('✅ Preferencias de notificaciones actualizadas');
        return true;
    } catch (error) {
        console.error('Error actualizando preferencias de notificaciones:', error);
        return false;
    }
};

// ============================================
// LISTENERS DE NOTIFICACIONES
// ============================================

/**
 * Configura listeners para cuando el usuario interactúa con una notificación
 * Llamar esto en el _layout.tsx principal
 */
export const setupNotificationListeners = (
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void => {
    // Listener para notificaciones recibidas mientras la app está abierta
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
        console.log('📩 Notificación recibida:', notification);
        onNotificationReceived?.(notification);
    });

    // Listener para cuando el usuario toca una notificación
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👆 Usuario interactuó con notificación:', response);
        onNotificationResponse?.(response);

        // Manejar navegación basada en el tipo de notificación
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
    });

    // Retornar función para limpiar listeners
    return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
    };
};

/**
 * Maneja la navegación cuando el usuario toca una notificación
 */
const handleNotificationNavigation = (data: Record<string, unknown>): void => {
    const type = data?.type as string;

    switch (type) {
        case 'appointment_reminder':
            // Navegar a agenda
            console.log('Navegar a agenda:', data.appointmentId);
            break;
        case 'maintenance_reminder':
            // Navegar a servicios
            console.log('Navegar a servicios');
            break;
        case 'sos_reply':
            // Navegar al hilo SOS
            console.log('Navegar a hilo SOS:', data.threadId);
            break;
        case 'subscription_expired':
            // Navegar a wallet
            console.log('Navegar a wallet');
            break;
        case 'order_status':
            // Navegar a tienda/pedidos
            console.log('Navegar a pedidos:', data.orderId);
            break;
        default:
            console.log('Tipo de notificación desconocido:', type);
    }
};
