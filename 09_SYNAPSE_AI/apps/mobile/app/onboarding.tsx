import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { SPACING, RADIUS } from '@/constants/config';
import { PaletteIcon, FeedIcon, TrophyIcon, RocketIcon } from '@/components/OnboardingIcons';
import { LegalDocumentModal } from '@/components/LegalDocumentModal';

const ONBOARDING_COMPLETE_KEY = '@synapse_onboarding_complete';

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

    const styles = createStyles(colors);
    const canContinue = termsAccepted && privacyAccepted;

    // Dynamic gradient colors based on theme
    const gradientColors: [string, string] = isDark
        ? ['#1a1a2e', '#0B0E14']
        : [colors.surfaceLight, colors.background];

    const handleAccept = async () => {
        if (!canContinue) return;

        try {
            await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Use replace to prevent going back to onboarding
            // Small delay to ensure AsyncStorage write is complete before navigation
            setTimeout(() => {
                router.replace('/(tabs)/engine');
            }, 100);
        } catch (error) {
            console.error('Error saving onboarding state:', error);
        }
    };

    const handleOpenTerms = () => {
        setLegalModalType('terms');
    };

    const handleOpenPrivacy = () => {
        setLegalModalType('privacy');
    };

    const handleCloseLegalModal = () => {
        setLegalModalType(null);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={gradientColors}
                style={styles.gradient}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo/Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/placeholder-logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>SYNAPSE AI</Text>
                        <Text style={styles.subtitle}>
                            Tu asistente de prompts inteligente
                        </Text>
                    </View>

                    {/* Features */}
                    <View style={styles.features}>
                        <View style={styles.feature}>
                            <View style={styles.featureIconContainer}>
                                <PaletteIcon size={28} color={colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Generador de Prompts</Text>
                                <Text style={styles.featureDesc}>
                                    Crea prompts profesionales para IA de imágenes
                                </Text>
                            </View>
                        </View>
                        <View style={styles.feature}>
                            <View style={styles.featureIconContainer}>
                                <FeedIcon size={28} color={colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Noticias de IA</Text>
                                <Text style={styles.featureDesc}>
                                    Mantente al día con las últimas noticias
                                </Text>
                            </View>
                        </View>
                        <View style={styles.feature}>
                            <View style={styles.featureIconContainer}>
                                <TrophyIcon size={28} color={colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Ranking de Modelos</Text>
                                <Text style={styles.featureDesc}>
                                    Descubre y compara los mejores modelos de IA
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Terms & Conditions */}
                    <View style={styles.termsSection}>
                        <Text style={styles.termsTitle}>Para continuar, acepta:</Text>

                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setTermsAccepted(!termsAccepted)}
                        >
                            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                Acepto los{' '}
                                <Text style={styles.link} onPress={handleOpenTerms}>
                                    Términos y Condiciones
                                </Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setPrivacyAccepted(!privacyAccepted)}
                        >
                            <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]}>
                                {privacyAccepted && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                Acepto la{' '}
                                <Text style={styles.link} onPress={handleOpenPrivacy}>
                                    Política de Privacidad
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* CTA Button */}
                <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                    <TouchableOpacity
                        style={[styles.button, !canContinue && styles.buttonDisabled]}
                        onPress={handleAccept}
                        disabled={!canContinue}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={canContinue ? ['#8B5CF6', '#6D28D9'] : ['#4B5563', '#374151']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Comenzar</Text>
                                <RocketIcon size={22} color="#FFFFFF" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Legal Document Modal */}
            {legalModalType && (
                <LegalDocumentModal
                    visible={true}
                    onClose={handleCloseLegalModal}
                    type={legalModalType}
                />
            )}
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 8,
    },
    features: {
        marginBottom: 40,
        gap: 16,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${colors.primary}15`,
        padding: 16,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: `${colors.primary}30`,
        gap: 12,
    },
    featureIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: `${colors.primary}25`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    termsSection: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    termsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    link: {
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: `${colors.background}E6`,
    },
    button: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
