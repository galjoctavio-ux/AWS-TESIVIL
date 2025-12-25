import { Platform } from 'react-native';

/**
 * Ads Configuration for QRClima
 * 
 * IMPORTANT: Set ENABLED to true only when ready to show ads in V2.
 * All IDs below are test IDs - replace with production IDs before release.
 */
export const ADS_CONFIG = {
    // ========================
    // FEATURE FLAGS
    // ========================

    /** Master switch for all ads - set to true in V2 */
    ENABLED: false,

    /** Never show ads to PRO users */
    SHOW_TO_PRO_USERS: false,

    /** Minimum seconds between interstitials */
    INTERSTITIAL_COOLDOWN_SECONDS: 180, // 3 minutes

    // ========================
    // ADMOB UNIT IDS - PRODUCTION
    // ========================
    // TODO: Replace these with your actual AdMob unit IDs

    ANDROID: {
        BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    },

    IOS: {
        BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
        REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    },

    // ========================
    // TEST IDS (Google's official test IDs)
    // ========================
    TEST: {
        BANNER: 'ca-app-pub-3940256099942544/6300978111',
        INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
        REWARDED: 'ca-app-pub-3940256099942544/5224354917',
    },
};

/**
 * Get the appropriate ad unit ID based on platform and type
 * Uses test IDs in development mode
 */
export const getAdUnitId = (type: 'BANNER' | 'INTERSTITIAL' | 'REWARDED'): string => {
    // Always use test IDs in development
    if (__DEV__) {
        return ADS_CONFIG.TEST[type];
    }

    // Production IDs
    const platformConfig = Platform.OS === 'ios' ? ADS_CONFIG.IOS : ADS_CONFIG.ANDROID;
    return platformConfig[type];
};
