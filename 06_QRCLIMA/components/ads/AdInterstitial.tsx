import { useCallback, useEffect, useState, useRef } from 'react';
import { ADS_CONFIG } from '../../config/ads-config';
import {
    shouldShowAds,
    canShowInterstitial,
    markInterstitialShown,
    getInterstitialAdUnitId,
    logAdEvent,
} from '../../services/ad-service';
import { UserProfile } from '../../services/user-service';

interface UseInterstitialAdOptions {
    /** User profile to check PRO status */
    profile: UserProfile | null;
    /** Callback when ad closes */
    onAdClosed?: () => void;
    /** Callback when ad fails to load */
    onAdFailedToLoad?: (error: Error) => void;
}

interface UseInterstitialAdReturn {
    /** Whether the ad is loaded and ready */
    isLoaded: boolean;
    /** Whether the ad is currently showing */
    isShowing: boolean;
    /** Show the interstitial ad */
    showAd: () => Promise<boolean>;
    /** Manually load a new ad */
    loadAd: () => void;
}

/**
 * useInterstitialAd Hook
 * 
 * Hook for showing interstitial ads at key moments (PDF generation, results, etc.)
 * Automatically respects PRO status and cooldown between ads.
 * 
 * Usage:
 * const { showAd, isLoaded } = useInterstitialAd({ profile: userProfile });
 * 
 * // After generating PDF:
 * await showAd();
 */
export const useInterstitialAd = (options: UseInterstitialAdOptions): UseInterstitialAdReturn => {
    const { profile, onAdClosed, onAdFailedToLoad } = options;
    const [isLoaded, setIsLoaded] = useState(false);
    const [isShowing, setIsShowing] = useState(false);
    const adRef = useRef<any>(null);

    // Load ad on mount if ads are enabled
    const loadAd = useCallback(() => {
        if (!ADS_CONFIG.ENABLED || !shouldShowAds(profile)) {
            return;
        }

        try {
            // When react-native-google-mobile-ads is installed:
            // const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');
            // const adUnitId = getInterstitialAdUnitId();
            // const ad = InterstitialAd.createForAdRequest(adUnitId);
            // 
            // ad.addAdEventListener(AdEventType.LOADED, () => setIsLoaded(true));
            // ad.addAdEventListener(AdEventType.CLOSED, () => {
            //     setIsShowing(false);
            //     onAdClosed?.();
            //     loadAd(); // Preload next ad
            // });
            // ad.addAdEventListener(AdEventType.ERROR, (error) => {
            //     onAdFailedToLoad?.(error);
            //     logAdEvent('error', 'interstitial', { error: error.message });
            // });
            // 
            // ad.load();
            // adRef.current = ad;

            console.log('[Interstitial] Would load ad here when enabled');
        } catch (error) {
            console.error('[Interstitial] Failed to load:', error);
        }
    }, [profile, onAdClosed, onAdFailedToLoad]);

    // Load on mount
    useEffect(() => {
        loadAd();
    }, [loadAd]);

    // Show the interstitial
    const showAd = useCallback(async (): Promise<boolean> => {
        // Check if we should show ads at all
        if (!ADS_CONFIG.ENABLED) {
            console.log('[Interstitial] Ads disabled, skipping');
            return false;
        }

        if (!shouldShowAds(profile)) {
            console.log('[Interstitial] User is PRO, skipping');
            return false;
        }

        if (!canShowInterstitial()) {
            console.log('[Interstitial] On cooldown, skipping');
            return false;
        }

        if (!isLoaded) {
            console.log('[Interstitial] Not loaded yet');
            return false;
        }

        try {
            // When enabled:
            // await adRef.current?.show();
            // markInterstitialShown();
            // setIsShowing(true);
            // logAdEvent('impression', 'interstitial');

            console.log('[Interstitial] Would show ad here when enabled');
            return true;
        } catch (error) {
            console.error('[Interstitial] Failed to show:', error);
            return false;
        }
    }, [profile, isLoaded]);

    return {
        isLoaded,
        isShowing,
        showAd,
        loadAd,
    };
};

export default useInterstitialAd;
