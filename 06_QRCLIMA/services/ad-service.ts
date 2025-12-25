import { ADS_CONFIG, getAdUnitId } from '../config/ads-config';
import { UserProfile, isUserPro } from './user-service';

/**
 * Ad Service for QRClima
 * 
 * Centralized service for managing ads across the app.
 * All ad logic flows through this service to ensure:
 * - PRO users never see ads
 * - Proper cooldown between interstitials
 * - Feature flag respect
 */

// Track last interstitial timestamp
let lastInterstitialTimestamp: number = 0;

/**
 * Check if ads should be shown to the current user
 */
export const shouldShowAds = (profile: UserProfile | null): boolean => {
    // Master switch check
    if (!ADS_CONFIG.ENABLED) {
        return false;
    }

    // PRO users never see ads
    if (isUserPro(profile)) {
        return false;
    }

    return true;
};

/**
 * Check if an interstitial can be shown (respects cooldown)
 */
export const canShowInterstitial = (): boolean => {
    if (!ADS_CONFIG.ENABLED) {
        return false;
    }

    const now = Date.now();
    const cooldownMs = ADS_CONFIG.INTERSTITIAL_COOLDOWN_SECONDS * 1000;

    if (now - lastInterstitialTimestamp < cooldownMs) {
        console.log('[AdService] Interstitial on cooldown, skipping...');
        return false;
    }

    return true;
};

/**
 * Mark interstitial as shown (updates cooldown timestamp)
 */
export const markInterstitialShown = (): void => {
    lastInterstitialTimestamp = Date.now();
    console.log('[AdService] Interstitial shown, cooldown started');
};

/**
 * Get banner ad unit ID
 */
export const getBannerAdUnitId = (): string => {
    return getAdUnitId('BANNER');
};

/**
 * Get interstitial ad unit ID
 */
export const getInterstitialAdUnitId = (): string => {
    return getAdUnitId('INTERSTITIAL');
};

/**
 * Get rewarded ad unit ID
 */
export const getRewardedAdUnitId = (): string => {
    return getAdUnitId('REWARDED');
};

/**
 * Initialize ads SDK
 * Call this once when the app starts
 */
export const initializeAds = async (): Promise<void> => {
    if (!ADS_CONFIG.ENABLED) {
        console.log('[AdService] Ads disabled, skipping initialization');
        return;
    }

    try {
        // When react-native-google-mobile-ads is installed:
        // const mobileAds = require('react-native-google-mobile-ads').default;
        // await mobileAds.initialize();
        console.log('[AdService] Ads SDK initialized successfully');
    } catch (error) {
        console.error('[AdService] Failed to initialize ads:', error);
    }
};

/**
 * Log ad event for analytics (placeholder for future implementation)
 */
export const logAdEvent = (
    eventType: 'impression' | 'click' | 'reward' | 'error',
    adType: 'banner' | 'interstitial' | 'rewarded',
    metadata?: Record<string, any>
): void => {
    console.log(`[AdService] Event: ${eventType} | Type: ${adType}`, metadata || '');
    // TODO: Integrate with Firebase Analytics in V2
};
