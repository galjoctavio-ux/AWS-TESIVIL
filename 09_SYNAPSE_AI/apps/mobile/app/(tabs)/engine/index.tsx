import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Image,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';
import { COLORS, SPACING, RADIUS, ASPECT_RATIOS, TARGET_ENGINES } from '@/constants/config';

import { refinePrompt, generatePrompt } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2;

// Style images mapping
const STYLE_IMAGES: Record<string, any> = {
    fotorealismo: require('@/assets/prompts/styles/style_fotorealismo.webp'),
    anime: require('@/assets/prompts/styles/style_anime.webp'),
    '3d_pixar': require('@/assets/prompts/styles/style_3d_pixar.webp'),
    cyberpunk: require('@/assets/prompts/styles/style_cyberpunk.webp'),
    oleo: require('@/assets/prompts/styles/style_oleo.webp'),
    arte_digital: require('@/assets/prompts/styles/style_arte_digital.webp'),
    minimalista: require('@/assets/prompts/styles/style_minimalismo.webp'),
    arquitectura: require('@/assets/prompts/styles/style_arquitectura.webp'),
};

// Enhanced styles with descriptions
const ENGINE_STYLES = [
    { id: 'fotorealismo', label: 'Fotorealismo', description: 'Como una foto real' },
    { id: 'anime', label: 'Anime', description: 'Estilo japonés' },
    { id: '3d_pixar', label: '3D Pixar', description: 'Animación 3D' },
    { id: 'cyberpunk', label: 'Cyberpunk', description: 'Futurista neón' },
    { id: 'oleo', label: 'Óleo', description: 'Pintura clásica' },
    { id: 'arte_digital', label: 'Arte Digital', description: 'Ilustración moderna' },
    { id: 'minimalista', label: 'Minimalista', description: 'Simple y limpio' },
    { id: 'arquitectura', label: 'Arquitectura', description: 'Diseño espacial' },
] as const;

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
    const [copied, setCopied] = useState(false);

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
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyNegative = async () => {
        await Clipboard.setStringAsync(negativePrompt);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleReset = () => {
        setStep(1);
        setRawInput('');
        setEnrichedInput('');
        setSelectedStyle(null);
        setFinalPrompt('');
        setNegativePrompt('');
        setCopied(false);
    };

    const goBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header with gradient */}
            <LinearGradient
                colors={['#1a1a2e', '#0F0F23']}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {step > 1 && step < 4 && (
                            <TouchableOpacity onPress={goBack} style={styles.backButton}>
                                <Text style={styles.backButtonText}>←</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>✨ Engine</Text>
                        <Text style={styles.subtitle}>AI Prompt Generator</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>

                {/* Step Indicator */}
                <View style={styles.stepIndicator}>
                    {['Idea', 'Style', 'Config', 'Result'].map((label, i) => (
                        <View key={i} style={styles.stepItem}>
                            <View
                                style={[
                                    styles.stepDot,
                                    step > i && styles.stepDotCompleted,
                                    step === i + 1 && styles.stepDotCurrent,
                                ]}
                            >
                                {step > i + 1 && <Text style={styles.stepCheck}>✓</Text>}
                                {step === i + 1 && <Text style={styles.stepNumber}>{i + 1}</Text>}
                            </View>
                            <Text style={[styles.stepLabel, step === i + 1 && styles.stepLabelActive]}>
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Step 1: Input */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepTitle}>¿Qué quieres crear?</Text>
                            <Text style={styles.stepDescription}>
                                Describe tu idea en español o inglés. La IA la enriquecerá automáticamente.
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={rawInput}
                                onChangeText={setRawInput}
                                placeholder="Ej: Un gato astronauta flotando en el espacio con estrellas de colores..."
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />
                            <Text style={styles.charCount}>{rawInput.length}/500</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, !rawInput.trim() && styles.buttonDisabled]}
                            onPress={() => refineMutation.mutate(rawInput)}
                            disabled={!rawInput.trim() || refineMutation.isPending}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={rawInput.trim() ? ['#8B5CF6', '#6D28D9'] : ['#4B5563', '#374151']}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {refineMutation.isPending ? (
                                    <View style={styles.loadingRow}>
                                        <ActivityIndicator color="#fff" size="small" />
                                        <Text style={styles.buttonText}>Procesando...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.buttonText}>✨ Varita Mágica</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2: Select Style with Images */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepTitle}>Elige un estilo visual</Text>
                            <View style={styles.enrichedPreview}>
                                <Text style={styles.enrichedLabel}>Tu idea enriquecida:</Text>
                                <Text style={styles.enrichedText}>{enrichedInput}</Text>
                            </View>
                        </View>

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
                                    activeOpacity={0.9}
                                >
                                    <Image
                                        source={STYLE_IMAGES[style.id]}
                                        style={styles.styleImage}
                                        resizeMode="cover"
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.styleOverlay}
                                    >
                                        <Text style={styles.styleLabel}>{style.label}</Text>
                                        <Text style={styles.styleDescription}>{style.description}</Text>
                                    </LinearGradient>
                                    {selectedStyle === style.id && (
                                        <View style={styles.selectedBadge}>
                                            <Text style={styles.selectedBadgeText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, !selectedStyle && styles.buttonDisabled]}
                            onPress={() => setStep(3)}
                            disabled={!selectedStyle}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={selectedStyle ? ['#8B5CF6', '#6D28D9'] : ['#4B5563', '#374151']}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.buttonText}>Siguiente →</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 3: Parameters */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepTitle}>Configura tu prompt</Text>
                            <Text style={styles.stepDescription}>
                                Ajusta el formato y motor de IA para optimizar el resultado.
                            </Text>
                        </View>

                        {/* Aspect Ratio */}
                        <View style={styles.paramSection}>
                            <Text style={styles.paramLabel}>📐 Formato de imagen</Text>
                            <View style={styles.chipRow}>
                                {ASPECT_RATIOS.map((ratio) => (
                                    <TouchableOpacity
                                        key={ratio.id}
                                        style={[
                                            styles.chip,
                                            selectedRatio === ratio.id && styles.chipSelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedRatio(ratio.id);
                                            Haptics.selectionAsync();
                                        }}
                                    >
                                        <Text style={styles.chipIcon}>{ratio.icon}</Text>
                                        <Text style={[
                                            styles.chipText,
                                            selectedRatio === ratio.id && styles.chipTextSelected
                                        ]}>
                                            {ratio.label}
                                        </Text>
                                        <Text style={styles.chipRatio}>{ratio.id}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Target Engine */}
                        <View style={styles.paramSection}>
                            <Text style={styles.paramLabel}>🤖 Motor de IA</Text>
                            <View style={styles.engineRow}>
                                {TARGET_ENGINES.map((engine) => (
                                    <TouchableOpacity
                                        key={engine.id}
                                        style={[
                                            styles.engineCard,
                                            selectedEngine === engine.id && styles.engineCardSelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedEngine(engine.id);
                                            Haptics.selectionAsync();
                                        }}
                                    >
                                        <Text style={styles.engineIcon}>{engine.icon}</Text>
                                        <Text style={[
                                            styles.engineLabel,
                                            selectedEngine === engine.id && styles.engineLabelSelected
                                        ]}>
                                            {engine.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#6D28D9']}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {generateMutation.isPending ? (
                                    <View style={styles.loadingRow}>
                                        <ActivityIndicator color="#fff" size="small" />
                                        <Text style={styles.buttonText}>Generando...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.buttonText}>🎨 Generar Prompt</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 4: Result */}
                {step === 4 && (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.successTitle}>🎉 ¡Prompt listo!</Text>
                            <Text style={styles.stepDescription}>
                                Tu prompt está optimizado para {selectedEngine === 'midjourney' ? 'Midjourney' : selectedEngine}.
                            </Text>
                        </View>

                        <View style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultLabel}>Prompt Principal</Text>
                                <TouchableOpacity
                                    style={[styles.copyButton, copied && styles.copyButtonSuccess]}
                                    onPress={handleCopy}
                                >
                                    <Text style={styles.copyButtonText}>
                                        {copied ? '✓ Copiado' : '📋 Copiar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.resultText} selectable>{finalPrompt}</Text>
                        </View>

                        {negativePrompt && (
                            <TouchableOpacity style={styles.negativeCard} onPress={handleCopyNegative}>
                                <View style={styles.negativeHeader}>
                                    <Text style={styles.negativeLabel}>Negative Prompt</Text>
                                    <Text style={styles.tapToCopy}>Tap to copy</Text>
                                </View>
                                <Text style={styles.negativeText} selectable>{negativePrompt}</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.primaryButtonFlex}
                                onPress={handleCopy}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#8B5CF6', '#6D28D9']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.buttonText}>
                                        {copied ? '✓ Copiado!' : '📋 Copiar Prompt'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
                                <Text style={styles.secondaryButtonText}>🔄 Nuevo</Text>
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
    headerGradient: {
        paddingBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    headerLeft: {
        width: 40,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerRight: {
        width: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 20,
        color: COLORS.textPrimary,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: SPACING.lg,
        gap: SPACING.xl,
    },
    stepItem: {
        alignItems: 'center',
        gap: 6,
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.surfaceBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepDotCompleted: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    stepDotCurrent: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    stepCheck: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    stepNumber: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    stepLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    stepLabelActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl + 80,
        paddingTop: SPACING.lg,
    },
    stepContent: {
        gap: SPACING.lg,
    },
    stepHeader: {
        gap: SPACING.sm,
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.success,
    },
    stepDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        padding: SPACING.md,
        paddingTop: SPACING.md,
        color: COLORS.textPrimary,
        fontSize: 16,
        minHeight: 140,
        lineHeight: 24,
    },
    charCount: {
        position: 'absolute',
        bottom: SPACING.sm,
        right: SPACING.md,
        fontSize: 12,
        color: COLORS.textMuted,
    },
    primaryButton: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    primaryButtonFlex: {
        flex: 1,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: SPACING.md + 2,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    enrichedPreview: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    enrichedLabel: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    enrichedText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    styleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    styleCard: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.1,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    styleCardSelected: {
        borderColor: COLORS.primary,
    },
    styleImage: {
        width: '100%',
        height: '100%',
    },
    styleOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.sm,
        paddingTop: SPACING.xl,
    },
    styleLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    styleDescription: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    selectedBadge: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    paramSection: {
        gap: SPACING.sm,
    },
    paramLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.surfaceBorder,
        alignItems: 'center',
        gap: 2,
    },
    chipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}15`,
    },
    chipIcon: {
        fontSize: 18,
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: COLORS.textPrimary,
    },
    chipRatio: {
        color: COLORS.textMuted,
        fontSize: 10,
    },
    engineRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    engineCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.surfaceBorder,
        alignItems: 'center',
        gap: 4,
    },
    engineCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}15`,
    },
    engineIcon: {
        fontSize: 24,
    },
    engineLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    engineLabelSelected: {
        color: COLORS.textPrimary,
    },
    resultCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    resultLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    copyButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 6,
        paddingHorizontal: SPACING.sm,
        borderRadius: RADIUS.md,
    },
    copyButtonSuccess: {
        backgroundColor: COLORS.success,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    resultText: {
        fontSize: 15,
        color: COLORS.textPrimary,
        lineHeight: 24,
    },
    negativeCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
    },
    negativeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    negativeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tapToCopy: {
        fontSize: 10,
        color: COLORS.textMuted,
    },
    negativeText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    secondaryButton: {
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.xl,
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
