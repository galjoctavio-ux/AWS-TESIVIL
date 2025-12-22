import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { SPACING, RADIUS } from '@/constants/config';

interface Props {
    source?: 'engine_banner' | 'showcase_card' | 'direct';
    onSuccess?: () => void;
    compact?: boolean; // Versión compacta para banners
}

export default function AcademyLeadCapture({ source = 'direct', onSuccess, compact = false }: Props) {
    const { colors } = useTheme();
    const [contactType, setContactType] = useState<'email' | 'whatsapp'>('whatsapp');
    const [contactValue, setContactValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [joined, setJoined] = useState(false);

    const styles = createStyles(colors, compact);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

    const handleJoin = async () => {
        const trimmed = contactValue.trim();

        if (!trimmed) {
            Alert.alert('Error', contactType === 'email'
                ? 'Por favor ingresa tu correo electrónico'
                : 'Por favor ingresa tu número de WhatsApp');
            return;
        }

        // Validación básica
        if (contactType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmed)) {
                Alert.alert('Error', 'Por favor ingresa un correo válido');
                return;
            }
        } else {
            const cleaned = trimmed.replace(/\D/g, '');
            if (cleaned.length < 10) {
                Alert.alert('Error', 'Por favor ingresa un número de WhatsApp válido (mínimo 10 dígitos)');
                return;
            }
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/academy/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contactType,
                    contactValue: trimmed.toLowerCase(),
                    source,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar');
            }

            setJoined(true);
            onSuccess?.();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'No pudimos registrarte. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Estado de éxito
    if (joined) {
        return (
            <View style={styles.successContainer}>
                <View style={styles.successRow}>
                    <Ionicons name="checkmark-circle" size={compact ? 24 : 32} color="#22c55e" />
                    <View style={styles.successContent}>
                        <Text style={styles.successTitle}>¡Estás en la lista! 🎉</Text>
                        <Text style={styles.successDesc}>Te avisaremos cuando abramos inscripciones.</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header con cronómetro */}
            <View style={styles.headerRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name="timer-outline" size={compact ? 20 : 24} color={colors.academy} />
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>El Método de las 30 Horas</Text>
                    {!compact && (
                        <Text style={styles.headerSubtitle}>Capacitación Intensiva con IA</Text>
                    )}
                </View>
            </View>

            {/* Copy persuasivo */}
            {!compact && (
                <Text style={styles.copyText}>
                    ¿Sabías que esta app se diseñó y programó en menos de 30 horas?{' '}
                    <Text style={styles.copyHighlight}>
                        Estoy preparando una capacitación para enseñarte mi flujo de trabajo exacto.
                    </Text>
                </Text>
            )}

            {compact && (
                <Text style={styles.compactCopy}>
                    Aprende a construir apps con IA en tiempo récord.
                </Text>
            )}

            {/* Selector de tipo de contacto */}
            <View style={styles.contactTypeRow}>
                <TouchableOpacity
                    onPress={() => setContactType('whatsapp')}
                    style={[
                        styles.contactTypeButton,
                        contactType === 'whatsapp' && styles.contactTypeButtonActiveWhatsapp
                    ]}
                >
                    <Ionicons
                        name="logo-whatsapp"
                        size={18}
                        color={contactType === 'whatsapp' ? '#22c55e' : colors.textMuted}
                    />
                    <Text style={[
                        styles.contactTypeLabel,
                        contactType === 'whatsapp' && styles.contactTypeLabelActiveWhatsapp
                    ]}>
                        WhatsApp
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setContactType('email')}
                    style={[
                        styles.contactTypeButton,
                        contactType === 'email' && styles.contactTypeButtonActiveEmail
                    ]}
                >
                    <Ionicons
                        name="mail-outline"
                        size={18}
                        color={contactType === 'email' ? '#3b82f6' : colors.textMuted}
                    />
                    <Text style={[
                        styles.contactTypeLabel,
                        contactType === 'email' && styles.contactTypeLabelActiveEmail
                    ]}>
                        Correo
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Input de contacto */}
            <TextInput
                style={styles.input}
                placeholder={contactType === 'email' ? 'tu@correo.com' : '+52 55 1234 5678'}
                placeholderTextColor={colors.textMuted}
                value={contactValue}
                onChangeText={setContactValue}
                keyboardType={contactType === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Botón de acción */}
            <TouchableOpacity
                onPress={handleJoin}
                disabled={loading}
                style={[styles.joinButton, loading && styles.joinButtonDisabled]}
            >
                {loading ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <>
                        <Ionicons name="rocket-outline" size={18} color="white" />
                        <Text style={styles.joinButtonText}>Unirme a la Lista</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.footer}>Sin spam. Solo actualizaciones del curso.</Text>
        </View>
    );
}

const createStyles = (colors: ThemeColors, compact: boolean) => StyleSheet.create({
    container: {
        backgroundColor: `${colors.academy}15`,
        borderRadius: RADIUS.xl,
        padding: compact ? SPACING.md : SPACING.lg,
        borderWidth: 1,
        borderColor: `${colors.academy}40`,
    },
    successContainer: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderRadius: RADIUS.xl,
        padding: compact ? SPACING.md : SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    successRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    successContent: {
        flex: 1,
    },
    successTitle: {
        color: colors.textPrimary,
        fontWeight: '700',
        fontSize: compact ? 16 : 18,
    },
    successDesc: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    iconContainer: {
        width: compact ? 40 : 48,
        height: compact ? 40 : 48,
        borderRadius: compact ? 20 : 24,
        backgroundColor: `${colors.academy}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontWeight: '700',
        fontSize: compact ? 16 : 18,
    },
    headerSubtitle: {
        color: colors.academy,
        fontSize: 14,
    },
    copyText: {
        color: colors.textSecondary,
        marginBottom: SPACING.md,
        lineHeight: 22,
    },
    copyHighlight: {
        color: colors.textPrimary,
        fontWeight: '600',
    },
    compactCopy: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: SPACING.sm,
    },
    contactTypeRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    contactTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        backgroundColor: colors.surface,
        borderColor: colors.surfaceBorder,
    },
    contactTypeButtonActiveWhatsapp: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.5)',
    },
    contactTypeButtonActiveEmail: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
    },
    contactTypeLabel: {
        color: colors.textMuted,
        fontWeight: '500',
    },
    contactTypeLabelActiveWhatsapp: {
        color: '#22c55e',
    },
    contactTypeLabelActiveEmail: {
        color: '#3b82f6',
    },
    input: {
        backgroundColor: colors.surface,
        color: colors.textPrimary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 4,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        marginBottom: SPACING.sm,
        fontSize: 15,
    },
    joinButton: {
        backgroundColor: colors.academy,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    joinButtonDisabled: {
        opacity: 0.7,
    },
    joinButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    footer: {
        color: colors.textMuted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
});
