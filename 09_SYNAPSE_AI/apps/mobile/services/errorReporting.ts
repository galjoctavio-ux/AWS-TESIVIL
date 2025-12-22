import * as Sentry from '@sentry/react-native';

// TODO: Replace with your actual Sentry DSN
export const SENTRY_DSN = 'https://af23afb4ed4e8d93d226ae8075209447@o4510577429250048.ingest.us.sentry.io/4510577462542336';

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
