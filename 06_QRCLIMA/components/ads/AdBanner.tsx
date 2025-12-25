import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ADS_CONFIG } from '../../config/ads-config';
import { shouldShowAds, getBannerAdUnitId, logAdEvent } from '../../services/ad-service';
import { UserProfile } from '../../services/user-service';

interface AdBannerProps {
    /** User profile to check PRO status */
    profile: UserProfile | null;
    /** Position of the banner */
    position?: 'top' | 'bottom' | 'inline';
    /** Size of the banner */
    size?: 'banner' | 'largeBanner' | 'mediumRectangle';
    /** Custom style overrides */
    style?: object;
}

/**
 * AdBanner Component
 * 
 * Displays a banner ad for FREE users.
 * Automatically hides for PRO users or when ads are disabled.
 * 
 * Usage:
 * <AdBanner profile={userProfile} position="bottom" />
 */
export const AdBanner: React.FC<AdBannerProps> = ({
    profile,
    position = 'bottom',
    size = 'banner',
    style,
}) => {
    // Don't render anything if ads shouldn't be shown
    if (!shouldShowAds(profile)) {
        return null;
    }

    // When react-native-google-mobile-ads is installed, use:
    // import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

    const adUnitId = getBannerAdUnitId();

    // Placeholder - will be replaced with actual BannerAd component
    // For now, renders nothing since ADS_CONFIG.ENABLED is false
    if (!ADS_CONFIG.ENABLED) {
        return null;
    }

    return (
        <View style={[styles.container, styles[position], style]}>
            {/* 
            <BannerAd
                unitId={adUnitId}
                size={getBannerSize(size)}
                onAdLoaded={() => logAdEvent('impression', 'banner')}
                onAdFailedToLoad={(error) => logAdEvent('error', 'banner', { error: error.message })}
            />
            */}
        </View>
    );
};

// Helper to convert size prop to BannerAdSize enum
// const getBannerSize = (size: string) => {
//     switch (size) {
//         case 'largeBanner': return BannerAdSize.LARGE_BANNER;
//         case 'mediumRectangle': return BannerAdSize.MEDIUM_RECTANGLE;
//         default: return BannerAdSize.BANNER;
//     }
// };

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    top: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    bottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    inline: {
        // No positioning, flows with content
    },
});

export default AdBanner;
