import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// TEMPORARILY DISABLED: Push notifications don't work in Expo Go SDK 53+
// When ready for production, uncomment the import below and the function body
// import * as Notifications from 'expo-notifications';

/*
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});
*/

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    // TEMPORARILY DISABLED: Return early for Expo Go testing
    console.log('[Notifications] Temporarily disabled for Expo Go testing');
    return null;

    /* PRODUCTION CODE - Uncomment when building APK/AAB
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

    try {
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId,
        })).data;

        console.log('Expo Push Token:', token);
        return token;
    } catch (e) {
        console.error('Error getting push token', e);
        return null;
    }
    */
}
