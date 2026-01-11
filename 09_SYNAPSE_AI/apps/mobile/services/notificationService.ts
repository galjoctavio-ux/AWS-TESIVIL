import { Platform, Alert, Linking } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { registerPushToken } from '@/lib/api';

// Wrap in try-catch to prevent crash if notifications are not properly configured
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
} catch (e) {
    console.warn('[Notifications] Failed to set notification handler:', e);
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return null;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

        console.log('[Notifications] Using projectId:', projectId);

        // Get Expo Push Token
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId,
        })).data;

        console.log('[Notifications] Expo Push Token:', token);

        // Also log the native device token for debugging
        try {
            const deviceToken = await Notifications.getDevicePushTokenAsync();
            console.log('[Notifications] Native FCM Token:', deviceToken.data);
        } catch (e) {
            console.log('[Notifications] Could not get native token:', e);
        }

        // Register token with backend API
        try {
            const result = await registerPushToken(token);
            if (result.success) {
                console.log('[Notifications] Push token registered with backend');
            } else {
                console.warn('[Notifications] Failed to register token with backend:', result.error);
            }
        } catch (backendError) {
            console.warn('[Notifications] Error registering token with backend:', backendError);
        }

        return token;
    } catch (e) {
        console.error('[Notifications] Error registering for push notifications:', e);
        return null;
    }
}

/**
 * Checks if notifications are enabled and prompts user to enable them
 * Should be called when app comes to foreground
 * @param showPrompt - Whether to show an alert prompting user to enable notifications
 */
export async function checkNotificationStatus(showPrompt: boolean = true): Promise<boolean> {
    try {
        if (!Device.isDevice) {
            return false;
        }

        const { status } = await Notifications.getPermissionsAsync();

        if (status === 'granted') {
            return true;
        }

        if (status === 'denied' && showPrompt) {
            // Notifications are denied, prompt user to enable in settings
            Alert.alert(
                'Notificaciones Desactivadas',
                'Para recibir alertas de noticias importantes y actualizaciones, activa las notificaciones en la configuración.',
                [
                    {
                        text: 'Ahora no',
                        style: 'cancel',
                    },
                    {
                        text: 'Ir a Configuración',
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            } else {
                                Linking.openSettings();
                            }
                        },
                    },
                ]
            );
        } else if (status === 'undetermined' && showPrompt) {
            // First time, request permissions
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            return newStatus === 'granted';
        }

        return false;
    } catch (e) {
        console.error('[Notifications] Error checking notification status:', e);
        return false;
    }
}
