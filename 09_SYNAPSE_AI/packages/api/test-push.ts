// Quick test script to send a push notification
// Run with: npx ts-node test-push.ts

import { Expo } from 'expo-server-sdk';

const expo = new Expo();

async function sendTestNotification() {
    // You'll need to get your token from Supabase profiles table
    // For now, this will query and send to all registered users

    const testToken = process.argv[2];

    if (!testToken) {
        console.log('Usage: npx ts-node test-push.ts <ExponentPushToken[...]>');
        console.log('');
        console.log('Get your token from Supabase:');
        console.log('SELECT expo_push_token FROM profiles WHERE expo_push_token IS NOT NULL;');
        return;
    }

    if (!Expo.isExpoPushToken(testToken)) {
        console.error('Invalid Expo push token:', testToken);
        return;
    }

    console.log('Sending test notification to:', testToken);

    try {
        const tickets = await expo.sendPushNotificationsAsync([
            {
                to: testToken,
                sound: 'default',
                title: '🎉 ¡Notificaciones funcionando!',
                body: 'Esta es una notificación de prueba de SYNAPSE AI',
                data: { type: 'test' },
            },
        ]);

        console.log('Result:', tickets);
    } catch (error) {
        console.error('Error:', error);
    }
}

sendTestNotification();
