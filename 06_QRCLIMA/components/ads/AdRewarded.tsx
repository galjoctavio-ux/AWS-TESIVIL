import { useCallback, useEffect, useState, useRef } from 'react';
import { ADS_CONFIG } from '../../config/ads-config';
import {
    shouldShowAds,
    getRewardedAdUnitId,
    logAdEvent,
} from '../../services/ad-service';
import { UserProfile } from '../../services/user-service';

interface RewardItem {
    type: string;
    amount: number;
}

interface UseRewardedAdOptions {
    /** User profile to check PRO status */
    profile: UserProfile | null;
    /** Callback when user earns reward */
    onReward?: (reward: RewardItem) => void;
    /** Callback when ad closes */
    onAdClosed?: () => void;
    /** Callback when ad fails to load */
    onAdFailedToLoad?: (error: Error) => void;
}

interface UseRewardedAdReturn {
    /** Whether the ad is loaded and ready */
    isLoaded: boolean;
    /** Whether the ad is currently showing */
    isShowing: boolean;
    /** The reward earned (if any) */
    reward: RewardItem | null;
    /** Show the rewarded ad */
    showAd: () => Promise<boolean>;
    /** Manually load a new ad */
    loadAd: () => void;
}

/**
 * useRewardedAd Hook
 * 
 * Hook for showing rewarded video ads (e.g., to earn tokens or unlock features).
 * User must watch the full ad to receive the reward.
 * 
 * Usage:
 * const { showAd, isLoaded, reward } = useRewardedAd({
 *   profile: userProfile,
 *   onReward: (reward) => addTokens(userId, reward.amount)
 * });
 * 
 * // When user clicks "Watch ad for tokens":
 * if (isLoaded) {
 *   await showAd();
 * }
 */
export const useRewardedAd = (options: UseRewardedAdOptions): UseRewardedAdReturn => {
    const { profile, onReward, onAdClosed, onAdFailedToLoad } = options;
    const [isLoaded, setIsLoaded] = useState(false);
    const [isShowing, setIsShowing] = useState(false);
    const [reward, setReward] = useState<RewardItem | null>(null);
    const adRef = useRef<any>(null);

    // Load ad on mount if ads are enabled
    const loadAd = useCallback(() => {
        if (!ADS_CONFIG.ENABLED || !shouldShowAds(profile)) {
            return;
        }

        try {
            // When react-native-google-mobile-ads is installed:
            // const { RewardedAd, RewardedAdEventType, AdEventType } = require('react-native-google-mobile-ads');
            // const adUnitId = getRewardedAdUnitId();
            // const ad = RewardedAd.createForAdRequest(adUnitId);
            // 
            // ad.addAdEventListener(RewardedAdEventType.LOADED, () => setIsLoaded(true));
            // ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (rewardItem) => {
            //     setReward(rewardItem);
            //     onReward?.(rewardItem);
            //     logAdEvent('reward', 'rewarded', { amount: rewardItem.amount });
            // });
            // ad.addAdEventListener(AdEventType.CLOSED, () => {
            //     setIsShowing(false);
            //     onAdClosed?.();
            //     loadAd(); // Preload next ad
            // });
            // ad.addAdEventListener(AdEventType.ERROR, (error) => {
            //     onAdFailedToLoad?.(error);
            //     logAdEvent('error', 'rewarded', { error: error.message });
            // });
            // 
            // ad.load();
            // adRef.current = ad;

            console.log('[RewardedAd] Would load ad here when enabled');
        } catch (error) {
            console.error('[RewardedAd] Failed to load:', error);
        }
    }, [profile, onReward, onAdClosed, onAdFailedToLoad]);

    // Load on mount
    useEffect(() => {
        loadAd();
    }, [loadAd]);

    // Show the rewarded ad
    const showAd = useCallback(async (): Promise<boolean> => {
        // Check if we should show ads at all
        if (!ADS_CONFIG.ENABLED) {
            console.log('[RewardedAd] Ads disabled, skipping');
            return false;
        }

        if (!shouldShowAds(profile)) {
            console.log('[RewardedAd] User is PRO, skipping');
            return false;
        }

        if (!isLoaded) {
            console.log('[RewardedAd] Not loaded yet');
            return false;
        }

        try {
            // When enabled:
            // await adRef.current?.show();
            // setIsShowing(true);
            // logAdEvent('impression', 'rewarded');

            console.log('[RewardedAd] Would show ad here when enabled');
            return true;
        } catch (error) {
            console.error('[RewardedAd] Failed to show:', error);
            return false;
        }
    }, [profile, isLoaded]);

    return {
        isLoaded,
        isShowing,
        reward,
        showAd,
        loadAd,
    };
};

export default useRewardedAd;
