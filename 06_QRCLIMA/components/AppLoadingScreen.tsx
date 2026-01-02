import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

interface AppLoadingScreenProps {
    status?: string;
    showUpdateCheck?: boolean;
}

/**
 * Professional loading screen with app version and update status
 */
export default function AppLoadingScreen({ status = 'Cargando...', showUpdateCheck = true }: AppLoadingScreenProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // App version from app.json
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const updateId = Updates.updateId ? `(${Updates.updateId.slice(0, 8)})` : '';

    useEffect(() => {
        // Pulsing animation for the logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Rotating animation for the loader ring
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            {/* Background gradient effect */}
            <View style={styles.gradientOverlay} />

            {/* Logo area with animations */}
            <View style={styles.logoContainer}>
                <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}>
                    {/* Rotating ring */}
                    <Animated.View style={[styles.rotatingRing, { transform: [{ rotate: spin }] }]}>
                        <View style={styles.ringDot} />
                    </Animated.View>

                    {/* Logo Icon */}
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>❄️</Text>
                    </View>
                </Animated.View>

                {/* App Name */}
                <Text style={styles.appName}>QRclima</Text>
                <Text style={styles.tagline}>Bitácora Inteligente para HVAC</Text>
            </View>

            {/* Status text */}
            <View style={styles.statusContainer}>
                <View style={styles.dotsContainer}>
                    {[0, 1, 2].map((i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    opacity: pulseAnim.interpolate({
                                        inputRange: [1, 1.05],
                                        outputRange: i === 0 ? [0.4, 1] : i === 1 ? [0.7, 0.4] : [1, 0.7],
                                    }),
                                },
                            ]}
                        />
                    ))}
                </View>
                <Text style={styles.statusText}>{status}</Text>
            </View>

            {/* Version footer */}
            <View style={styles.footer}>
                <Text style={styles.versionText}>
                    v{appVersion} {updateId}
                </Text>
                <Text style={styles.copyrightText}>© 2025 TESIVIL</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D9488', // Teal-600
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        // Simulated gradient effect with opacity
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoWrapper: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    rotatingRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderTopColor: 'rgba(255, 255, 255, 0.8)',
    },
    ringDot: {
        position: 'absolute',
        top: -4,
        left: '50%',
        marginLeft: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    logoEmoji: {
        fontSize: 42,
    },
    appName: {
        fontSize: 36,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 6,
        letterSpacing: 0.5,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginRight: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
        marginHorizontal: 3,
    },
    statusText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
    },
    copyrightText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4,
    },
});
