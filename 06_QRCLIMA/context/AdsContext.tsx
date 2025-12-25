import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ADS_CONFIG } from '../config/ads-config';
import { shouldShowAds, initializeAds } from '../services/ad-service';
import { UserProfile, getUserProfile } from '../services/user-service';
import { useAuth } from './AuthContext';

interface AdsContextType {
    /** Whether ads are enabled globally */
    adsEnabled: boolean;
    /** Whether ads should be shown to current user (respects PRO status) */
    shouldShowAdsToUser: boolean;
    /** User profile for ad components */
    userProfile: UserProfile | null;
    /** Re-check ad eligibility (call after profile changes) */
    refreshAdStatus: () => Promise<void>;
}

const AdsContext = createContext<AdsContextType>({
    adsEnabled: false,
    shouldShowAdsToUser: false,
    userProfile: null,
    refreshAdStatus: async () => { },
});

/**
 * useAds Hook
 * 
 * Access ads context from any component.
 * 
 * Usage:
 * const { shouldShowAdsToUser, userProfile } = useAds();
 */
export const useAds = () => useContext(AdsContext);

interface AdsProviderProps {
    children: React.ReactNode;
}

/**
 * AdsProvider
 * 
 * Wrap your app with this provider to enable ads functionality.
 * Automatically manages user profile and ad eligibility.
 * 
 * Usage:
 * <AdsProvider>
 *   <App />
 * </AdsProvider>
 */
export function AdsProvider({ children }: AdsProviderProps) {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [shouldShowAdsToUser, setShouldShowAdsToUser] = useState(false);

    // Initialize ads SDK on mount
    useEffect(() => {
        if (ADS_CONFIG.ENABLED) {
            initializeAds();
        }
    }, []);

    // Fetch user profile and determine ad eligibility
    const refreshAdStatus = useCallback(async () => {
        if (!user) {
            setUserProfile(null);
            setShouldShowAdsToUser(ADS_CONFIG.ENABLED); // Show to logged out users
            return;
        }

        try {
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
            setShouldShowAdsToUser(shouldShowAds(profile));
        } catch (error) {
            console.error('[AdsContext] Error fetching profile:', error);
            setShouldShowAdsToUser(false);
        }
    }, [user]);

    // Refresh when user changes
    useEffect(() => {
        refreshAdStatus();
    }, [refreshAdStatus]);

    return (
        <AdsContext.Provider
            value={{
                adsEnabled: ADS_CONFIG.ENABLED,
                shouldShowAdsToUser,
                userProfile,
                refreshAdStatus,
            }}
        >
            {children}
        </AdsContext.Provider>
    );
}

export default AdsProvider;
