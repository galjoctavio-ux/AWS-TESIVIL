import * as Sentry from '@sentry/react-native';

export const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const initSentry = () => {
    Sentry.init({
        dsn: SENTRY_DSN,
        debug: !process.env.NODE_ENV || process.env.NODE_ENV === 'development', // Enable debug in development
    });
};

export const captureError = (error: any, context?: any) => {
    if (__DEV__) {
        console.error('[Sentry] Captured Error:', error);
    }
    Sentry.captureException(error, {
        extra: context,
    });
};
