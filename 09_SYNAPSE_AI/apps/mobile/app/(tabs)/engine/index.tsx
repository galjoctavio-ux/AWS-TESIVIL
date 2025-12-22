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
    Alert,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';
import {
    SPACING,
    RADIUS,
    ASPECT_RATIOS,
    TARGET_ENGINES,
    ENGINE_STYLES,
    STYLES_CONFIG,
    LENSES,
    TECHNIQUES,
    LIGHTINGS,
    StyleId,
} from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { MidjourneyIcon, DalleIcon, StableDiffusionIcon, FluxIcon } from '@/components/EngineIcons';
import { incrementStat } from '@/lib/userStats';

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
    minimalismo: require('@/assets/prompts/styles/style_minimalismo.webp'),
    arquitectura: require('@/assets/prompts/styles/style_arquitectura.webp'),
};

// Param images mapping - with fallback to icon-only if image doesn't load
const LENS_IMAGES: Record<string, any> = {
    wide: require('@/assets/prompts/params/param_lens_wide.webp'),
    macro: require('@/assets/prompts/params/param_lens_macro.webp'),
    bokeh: require('@/assets/prompts/params/param_lens_bokeh.webp'),
    drone: require('@/assets/prompts/params/param_lens_drone.webp'),
};

const LIGHTING_IMAGES: Record<string, any> = {
    natural: require('@/assets/prompts/params/param_light_natural.webp'),
    studio: require('@/assets/prompts/params/param_light_studio.webp'),
    golden: require('@/assets/prompts/params/param_light_golden.webp'),
    dramatic: require('@/assets/prompts/params/param_light_dramatic.webp'),
    soft: require('@/assets/prompts/params/param_light_soft.webp'),
    neon: require('@/assets/prompts/params/param_light_neon.webp'),
};

const TECHNIQUE_IMAGES: Record<string, any> = {
    fine_lines: require('@/assets/prompts/params/param_tech_fine_lines.webp'),
    vibrant: require('@/assets/prompts/params/param_tech_vibrant.webp'),
    thick_lines: require('@/assets/prompts/params/param_tech_thick_lines.webp'),
    glow: require('@/assets/prompts/params/param_tech_glow.webp'),
};

export default function EngineScreen() {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'webs' | 'apps'>('images');
    const [step, setStep] = useState(1);
    const [rawInput, setRawInput] = useState('');
    const [enrichedInput, setEnrichedInput] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<StyleId | null>(null);
    const [selectedRatio, setSelectedRatio] = useState('1:1');
    const [selectedEngine, setSelectedEngine] = useState('midjourney');
    const [selectedLighting, setSelectedLighting] = useState<string | null>(null);
    const [selectedLensOrTechnique, setSelectedLensOrTechnique] = useState<string | null>(null);
    const [finalPrompt, setFinalPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [copied, setCopied] = useState(false);

    const styles = createStyles(colors);

    // Tab configuration
    const CONTENT_TABS = [
        { id: 'images' as const, label: 'Imágenes', icon: '🖼️', active: true },
        { id: 'videos' as const, label: 'Videos', icon: '🎬', active: false },
        { id: 'webs' as const, label: 'Webs', icon: '🌐', active: false },
        { id: 'apps' as const, label: 'Apps', icon: '📱', active: false },
    ];

    // Get available params based on selected style
    const getStyleConfig = () => {
        if (!selectedStyle) return null;
        return STYLES_CONFIG[selectedStyle];
    };

    const styleConfig = getStyleConfig();
    const isRouteA = styleConfig?.route === 'A';
    const availableLenses = isRouteA ? LENSES.filter(l => styleConfig?.lenses?.includes(l.id)) : [];
    const availableTechniques = !isRouteA ? TECHNIQUES.filter(t => styleConfig?.techniques?.includes(t.id)) : [];
    const availableLightings = LIGHTINGS.filter(l => styleConfig?.lighting?.includes(l.id));

    // Mutations
    const refineMutation = useMutation({
        mutationFn: (input: string) => refinePrompt(input),
        onSuccess: (response: any) => {
            if (response.success && response.data) {
                setEnrichedInput(response.data.enriched);
                setStep(2);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Alert.alert('Error', response.error || 'Error al procesar prompt');
            }
        },
        onError: (error) => {
            Alert.alert('Error', error.message);
        },
    });

    const generateMutation = useMutation({
        mutationFn: () =>
            generatePrompt({
                description: enrichedInput || rawInput,
                style: selectedStyle || 'fotorealismo',
                lighting: selectedLighting || 'natural',
                lensOrTechnique: selectedLensOrTechnique || undefined,
                aspectRatio: selectedRatio,
                targetEngine: selectedEngine,
            }),
        onSuccess: (response: any) => {
            if (response.success && response.data) {
                setFinalPrompt(response.data.prompt);
                setNegativePrompt(response.data.negativePrompt || '');
                setStep(4);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // Increment stats
                incrementStat('promptsGenerated');
            } else {
                Alert.alert('Error', response.error || 'Error al generar prompt');
            }
        },
        onError: (error) => {
            Alert.alert('Error', error.message);
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
        setSelectedLighting(null);
        setSelectedLensOrTechnique(null);
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
                colors={isDark ? ['#1a1a2e', '#0F0F23'] : [colors.surfaceLight, colors.background]}
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
                        <Text style={styles.title}>✨ Prompt+</Text>
                        <Text style={styles.subtitle}>Generador de Prompts IA</Text>
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

            {/* Content Type Tabs */}
            <View style={styles.contentTabs}>
                {CONTENT_TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.contentTab,
                            activeTab === tab.id && styles.contentTabActive,
                            !tab.active && styles.contentTabDisabled,
                        ]}
                        onPress={() => {
                            if (tab.active) {
                                setActiveTab(tab.id);
                            } else {
                                setActiveTab(tab.id);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            }
                        }}
                    >
                        <Text style={styles.contentTabIcon}>{tab.icon}</Text>
                        <Text style={[
                            styles.contentTabLabel,
                            activeTab === tab.id && styles.contentTabLabelActive,
                        ]}>
                            {tab.label}
                        </Text>
                        {!tab.active && (
                            <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>Pronto</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Coming Soon Content for Videos, Webs, Apps */}
            {activeTab !== 'images' && (
                <View style={styles.comingSoonContainer}>
                    <View style={styles.comingSoonContent}>
                        <Text style={styles.comingSoonEmoji}>
                            {activeTab === 'videos' ? '🎬' : activeTab === 'webs' ? '🌐' : '📱'}
                        </Text>
                        <Text style={styles.comingSoonTitle}>
                            {activeTab === 'videos' ? 'Prompts para Videos' :
                                activeTab === 'webs' ? 'Prompts para Páginas Web' :
                                    'Prompts para Aplicaciones'}
                        </Text>
                        <Text style={styles.comingSoonSubtitle}>Próximamente</Text>

                        {/* Academia Banner */}
                        <View style={styles.academiaBanner}>
                            <Text style={styles.academiaBannerEmoji}>🎓</Text>
                            <View style={styles.academiaBannerContent}>
                                <Text style={styles.academiaBannerTitle}>
                                    ¿Sabías que esta app se desarrolló en 30 horas?
                                </Text>
                                <Text style={styles.academiaBannerText}>
                                    Estoy desarrollando un sistema para que tú también puedas hacerlo.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Main Content - Only show for Images tab */}
            {activeTab === 'images' && (
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
                                    placeholderTextColor={colors.textMuted}
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
                                        <Text style={styles.buttonText}>Siguiente →</Text>
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
                                    Ajusta los parámetros técnicos para obtener el mejor resultado.
                                </Text>
                            </View>

                            {/* Dynamic Lens/Technique based on route */}
                            {isRouteA && availableLenses.length > 0 && (
                                <View style={styles.paramSection}>
                                    <Text style={styles.paramLabel}>📷 Tipo de Lente</Text>
                                    <View style={styles.paramGrid}>
                                        {availableLenses.map((lens) => (
                                            <TouchableOpacity
                                                key={lens.id}
                                                style={[
                                                    styles.paramCard,
                                                    selectedLensOrTechnique === lens.id && styles.paramCardSelected,
                                                ]}
                                                onPress={() => {
                                                    setSelectedLensOrTechnique(lens.id);
                                                    Haptics.selectionAsync();
                                                }}
                                            >
                                                {LENS_IMAGES[lens.id] && (
                                                    <Image
                                                        source={LENS_IMAGES[lens.id]}
                                                        style={styles.paramImage}
                                                        resizeMode="cover"
                                                    />
                                                )}
                                                <View style={styles.paramOverlay}>
                                                    <Text style={styles.paramIcon}>{lens.icon}</Text>
                                                    <Text style={styles.paramLabel2}>{lens.label}</Text>
                                                </View>
                                                {selectedLensOrTechnique === lens.id && (
                                                    <View style={styles.paramCheck}>
                                                        <Text style={styles.paramCheckText}>✓</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {!isRouteA && availableTechniques.length > 0 && (
                                <View style={styles.paramSection}>
                                    <Text style={styles.paramLabel}>🎨 Técnica Artística</Text>
                                    <View style={styles.paramGrid}>
                                        {availableTechniques.map((tech) => (
                                            <TouchableOpacity
                                                key={tech.id}
                                                style={[
                                                    styles.paramCard,
                                                    selectedLensOrTechnique === tech.id && styles.paramCardSelected,
                                                ]}
                                                onPress={() => {
                                                    setSelectedLensOrTechnique(tech.id);
                                                    Haptics.selectionAsync();
                                                }}
                                            >
                                                {TECHNIQUE_IMAGES[tech.id] && (
                                                    <Image
                                                        source={TECHNIQUE_IMAGES[tech.id]}
                                                        style={styles.paramImage}
                                                        resizeMode="cover"
                                                    />
                                                )}
                                                <View style={styles.paramOverlay}>
                                                    <Text style={styles.paramIcon}>{tech.icon}</Text>
                                                    <Text style={styles.paramLabel2}>{tech.label}</Text>
                                                </View>
                                                {selectedLensOrTechnique === tech.id && (
                                                    <View style={styles.paramCheck}>
                                                        <Text style={styles.paramCheckText}>✓</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Lighting - Always visible */}
                            {availableLightings.length > 0 && (
                                <View style={styles.paramSection}>
                                    <Text style={styles.paramLabel}>💡 Iluminación</Text>
                                    <View style={styles.paramGrid}>
                                        {availableLightings.map((light) => (
                                            <TouchableOpacity
                                                key={light.id}
                                                style={[
                                                    styles.paramCard,
                                                    selectedLighting === light.id && styles.paramCardSelected,
                                                ]}
                                                onPress={() => {
                                                    setSelectedLighting(light.id);
                                                    Haptics.selectionAsync();
                                                }}
                                            >
                                                {LIGHTING_IMAGES[light.id] && (
                                                    <Image
                                                        source={LIGHTING_IMAGES[light.id]}
                                                        style={styles.paramImage}
                                                        resizeMode="cover"
                                                    />
                                                )}
                                                <View style={styles.paramOverlay}>
                                                    <Text style={styles.paramIcon}>{light.icon}</Text>
                                                    <Text style={styles.paramLabel2}>{light.label}</Text>
                                                </View>
                                                {selectedLighting === light.id && (
                                                    <View style={styles.paramCheck}>
                                                        <Text style={styles.paramCheckText}>✓</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

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
                                            <View style={styles.engineIconContainer}>
                                                {engine.id === 'midjourney' && <MidjourneyIcon size={32} color={selectedEngine === engine.id ? colors.engine : '#6B7280'} />}
                                                {engine.id === 'dalle' && <DalleIcon size={32} color={selectedEngine === engine.id ? colors.engine : '#6B7280'} />}
                                                {engine.id === 'stable_diffusion' && <StableDiffusionIcon size={32} color={selectedEngine === engine.id ? colors.engine : '#6B7280'} />}
                                                {engine.id === 'flux' && <FluxIcon size={32} color={selectedEngine === engine.id ? colors.engine : '#6B7280'} />}
                                            </View>
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

                            {/* Abrir app del motor seleccionado */}
                            <TouchableOpacity
                                style={styles.openAppButton}
                                onPress={() => {
                                    const ENGINE_URLS: Record<string, string> = {
                                        midjourney: 'https://www.midjourney.com/app/',
                                        dalle: 'https://chat.openai.com/?hints=search&ref=ext&model=gpt-4',
                                        stable_diffusion: 'https://dreamstudio.ai/',
                                        flux: 'https://blackforestlabs.ai/',
                                    };
                                    const url = ENGINE_URLS[selectedEngine] || ENGINE_URLS.midjourney;
                                    Linking.openURL(url);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.openAppButtonText}>
                                    🚀 Abrir {TARGET_ENGINES.find(e => e.id === selectedEngine)?.label || 'App'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 20,
        color: colors.textPrimary,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textSecondary,
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
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.surfaceBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepDotCompleted: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    stepDotCurrent: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    stepCheck: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    stepNumber: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    stepLabel: {
        fontSize: 11,
        color: colors.textMuted,
    },
    stepLabelActive: {
        color: colors.primary,
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
        color: colors.textPrimary,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.success,
    },
    stepDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        padding: SPACING.md,
        paddingTop: SPACING.md,
        color: colors.textPrimary,
        fontSize: 16,
        minHeight: 140,
        lineHeight: 24,
    },
    charCount: {
        position: 'absolute',
        bottom: SPACING.sm,
        right: SPACING.md,
        fontSize: 12,
        color: colors.textMuted,
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
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    enrichedLabel: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    enrichedText: {
        fontSize: 14,
        color: colors.textPrimary,
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
        borderColor: colors.primary,
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
        backgroundColor: colors.primary,
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
        color: colors.textPrimary,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        backgroundColor: colors.surface,
        paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: colors.surfaceBorder,
        alignItems: 'center',
        gap: 2,
    },
    chipSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}15`,
    },
    chipIcon: {
        fontSize: 18,
    },
    chipText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: colors.textPrimary,
    },
    chipRatio: {
        color: colors.textMuted,
        fontSize: 10,
    },
    // New param card styles for lens/technique/lighting with images
    paramGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    paramCard: {
        width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 2) / 3,
        height: 100,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: colors.surface,
    },
    paramCardSelected: {
        borderColor: colors.primary,
    },
    paramImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    paramOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xs,
    },
    paramIcon: {
        fontSize: 24,
        marginBottom: 2,
    },
    paramLabel2: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    paramCheck: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paramCheckText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    engineRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    engineCard: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: colors.surfaceBorder,
        alignItems: 'center',
        gap: 4,
    },
    engineCardSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}15`,
    },
    engineIconContainer: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    engineLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    engineLabelSelected: {
        color: colors.textPrimary,
    },
    resultCard: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: colors.primary,
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
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    copyButton: {
        backgroundColor: colors.primary,
        paddingVertical: 6,
        paddingHorizontal: SPACING.sm,
        borderRadius: RADIUS.md,
    },
    copyButtonSuccess: {
        backgroundColor: colors.success,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    resultText: {
        fontSize: 15,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    negativeCard: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
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
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tapToCopy: {
        fontSize: 10,
        color: colors.textMuted,
    },
    negativeText: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    secondaryButton: {
        backgroundColor: colors.surface,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    openAppButton: {
        marginTop: SPACING.md,
        backgroundColor: colors.surface,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.engine,
    },
    openAppButtonText: {
        color: colors.engine,
        fontSize: 15,
        fontWeight: '600',
    },
    // Content type tabs
    contentTabs: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: colors.surface,
        gap: SPACING.xs,
    },
    contentTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xs,
        borderRadius: RADIUS.md,
        backgroundColor: colors.background,
        gap: 4,
    },
    contentTabActive: {
        backgroundColor: colors.engine,
    },
    contentTabDisabled: {
        opacity: 0.7,
    },
    contentTabIcon: {
        fontSize: 14,
    },
    contentTabLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    contentTabLabelActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    comingSoonBadge: {
        backgroundColor: colors.warning,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: RADIUS.xs,
        marginLeft: 2,
    },
    comingSoonText: {
        color: '#000',
        fontSize: 8,
        fontWeight: '700',
    },
    // Coming soon screen
    comingSoonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    comingSoonContent: {
        alignItems: 'center',
        maxWidth: 300,
    },
    comingSoonEmoji: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    comingSoonTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    comingSoonSubtitle: {
        fontSize: 16,
        color: colors.engine,
        fontWeight: '600',
        marginBottom: SPACING.xl,
    },
    // Academia banner
    academiaBanner: {
        flexDirection: 'row',
        backgroundColor: `${colors.academy}15`,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: `${colors.academy}40`,
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    academiaBannerEmoji: {
        fontSize: 32,
    },
    academiaBannerContent: {
        flex: 1,
    },
    academiaBannerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.academy,
        marginBottom: 4,
    },
    academiaBannerText: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 18,
    },
});
