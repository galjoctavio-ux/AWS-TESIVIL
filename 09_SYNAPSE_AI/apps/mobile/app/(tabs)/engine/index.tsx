import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';
import { COLORS, SPACING, RADIUS, ENGINE_STYLES, ASPECT_RATIOS, TARGET_ENGINES } from '@/constants/config';

import { refinePrompt, generatePrompt } from '@/lib/api';

export default function EngineScreen() {
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(1);
    const [rawInput, setRawInput] = useState('');
    const [enrichedInput, setEnrichedInput] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedRatio, setSelectedRatio] = useState('1:1');
    const [selectedEngine, setSelectedEngine] = useState('midjourney');
    const [finalPrompt, setFinalPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');

    // Mutations
    const refineMutation = useMutation({
        mutationFn: (input: string) => refinePrompt(input),
        onSuccess: (response: any) => {
            if (response.success && response.data) {
                setEnrichedInput(response.data.enriched);
                setStep(2);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                alert(response.error || 'Failed to refine prompt');
            }
        },
        onError: (error) => {
            alert('Error: ' + error.message);
        },
    });

    const generateMutation = useMutation({
        mutationFn: () =>
            generatePrompt({
                description: enrichedInput || rawInput,
                style: selectedStyle || 'fotorealismo',
                lighting: 'natural',
                aspectRatio: selectedRatio,
                targetEngine: selectedEngine,
            }),
        onSuccess: (response: any) => {
            if (response.success && response.data) {
                setFinalPrompt(response.data.prompt);
                setNegativePrompt(response.data.negativePrompt || '');
                setStep(4);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                alert(response.error || 'Failed to generate prompt');
            }
        },
        onError: (error) => {
            alert('Error: ' + error.message);
        },
    });

    const handleCopy = async () => {
        await Clipboard.setStringAsync(finalPrompt);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // TODO: Show toast
    };

    const handleReset = () => {
        setStep(1);
        setRawInput('');
        setEnrichedInput('');
        setSelectedStyle(null);
        setFinalPrompt('');
        setNegativePrompt('');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>✨ Engine</Text>
                <Text style={styles.subtitle}>Generador de Prompts IA</Text>
            </View>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                {[1, 2, 3, 4].map((s) => (
                    <View
                        key={s}
                        style={[
                            styles.stepDot,
                            step >= s && styles.stepDotActive,
                            step === s && styles.stepDotCurrent,
                        ]}
                    />
                ))}
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Step 1: Input */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>¿Qué quieres crear?</Text>
                        <Text style={styles.stepDescription}>
                            Describe tu idea en español o inglés. La IA la enriquecerá.
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={rawInput}
                            onChangeText={setRawInput}
                            placeholder="Ej: Un gato astronauta flotando en el espacio..."
                            placeholderTextColor={COLORS.textMuted}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[styles.primaryButton, !rawInput.trim() && styles.buttonDisabled]}
                            onPress={() => refineMutation.mutate(rawInput)}
                            disabled={!rawInput.trim() || refineMutation.isPending}
                        >
                            {refineMutation.isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>✨ Varita Mágica</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2: Select Style */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Elige un estilo</Text>
                        <View style={styles.styleGrid}>
                            {ENGINE_STYLES.map((style) => (
                                <TouchableOpacity
                                    key={style.id}
                                    style={[
                                        styles.styleCard,
                                        selectedStyle === style.id && styles.styleCardSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedStyle(style.id);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                >
                                    <Text style={styles.styleLabel}>{style.label}</Text>
                                    <Text style={styles.styleRoute}>
                                        Ruta {style.route}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, !selectedStyle && styles.buttonDisabled]}
                            onPress={() => setStep(3)}
                            disabled={!selectedStyle}
                        >
                            <Text style={styles.buttonText}>Siguiente →</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 3: Parameters */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Ajusta los parámetros</Text>

                        {/* Aspect Ratio */}
                        <Text style={styles.paramLabel}>Formato</Text>
                        <View style={styles.chipRow}>
                            {ASPECT_RATIOS.map((ratio) => (
                                <TouchableOpacity
                                    key={ratio.id}
                                    style={[
                                        styles.chip,
                                        selectedRatio === ratio.id && styles.chipSelected,
                                    ]}
                                    onPress={() => setSelectedRatio(ratio.id)}
                                >
                                    <Text style={styles.chipText}>
                                        {ratio.icon} {ratio.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Target Engine */}
                        <Text style={styles.paramLabel}>Motor de IA</Text>
                        <View style={styles.chipRow}>
                            {TARGET_ENGINES.map((engine) => (
                                <TouchableOpacity
                                    key={engine.id}
                                    style={[
                                        styles.chip,
                                        selectedEngine === engine.id && styles.chipSelected,
                                    ]}
                                    onPress={() => setSelectedEngine(engine.id)}
                                >
                                    <Text style={styles.chipText}>
                                        {engine.icon} {engine.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                        >
                            {generateMutation.isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>🎨 Generar Prompt</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 4: Result */}
                {step === 4 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>¡Tu prompt está listo!</Text>

                        <View style={styles.resultBox}>
                            <Text style={styles.resultLabel}>Prompt Principal</Text>
                            <Text style={styles.resultText}>{finalPrompt}</Text>
                        </View>

                        {negativePrompt && (
                            <View style={styles.resultBox}>
                                <Text style={styles.resultLabel}>Negative Prompt</Text>
                                <Text style={styles.resultTextSecondary}>{negativePrompt}</Text>
                            </View>
                        )}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.primaryButton} onPress={handleCopy}>
                                <Text style={styles.buttonText}>📋 Copiar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
                                <Text style={styles.secondaryButtonText}>Nuevo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: SPACING.md,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.surfaceBorder,
    },
    stepDotActive: {
        backgroundColor: COLORS.primary,
    },
    stepDotCurrent: {
        width: 24,
        borderRadius: 4,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    stepContent: {
        gap: SPACING.md,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    stepDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        padding: SPACING.md,
        color: COLORS.textPrimary,
        fontSize: 16,
        minHeight: 120,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    styleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    styleCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    styleCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}20`,
    },
    styleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    styleRoute: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    paramLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
    },
    chipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}20`,
    },
    chipText: {
        color: COLORS.textPrimary,
        fontSize: 13,
    },
    resultBox: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
    },
    resultLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    resultText: {
        fontSize: 15,
        color: COLORS.textPrimary,
        lineHeight: 22,
    },
    resultTextSecondary: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
    },
    secondaryButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
});
