import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { getUserProfile, isUserPro, BrandingConfig } from '../../../services/user-service';
import {
    BTUCalculatorState,
    BTUCalculationResult,
    WallConfig,
    WindowConfig,
    Orientation,
    WallMaterial,
    SunExposure,
    CeilingType,
    CeilingColor,
    GlassType,
    WindowProtection,
    ClimateZone,
    calculateBTU,
    createDefaultState,
    generateId,
    getSmartRecommendations,
    generateBTUReport,
    LABELS,
} from '../../../services/btu-calculator-service';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ============================================================================
// STEP INDICATOR COMPONENT
// ============================================================================

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { num: 1, label: 'Dimensiones' },
        { num: 2, label: 'Configuración' },
        { num: 3, label: 'Resultados' },
    ];

    return (
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
            {steps.map((step, idx) => (
                <View key={step.num} className="flex-1 flex-row items-center">
                    <View className="flex-1 items-center">
                        <View
                            className={`w-8 h-8 rounded-full items-center justify-center ${currentStep >= step.num ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            {currentStep > step.num ? (
                                <Ionicons name="checkmark" size={18} color="white" />
                            ) : (
                                <Text className={`font-bold ${currentStep >= step.num ? 'text-white' : 'text-gray-400'}`}>
                                    {step.num}
                                </Text>
                            )}
                        </View>
                        <Text className={`text-xs mt-1 ${currentStep >= step.num ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                            {step.label}
                        </Text>
                    </View>
                    {idx < steps.length - 1 && (
                        <View className={`h-0.5 flex-1 mx-1 ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                </View>
            ))}
        </View>
    );
};

// ============================================================================
// COMPASS SELECTOR COMPONENT
// ============================================================================

const CompassSelector = ({
    selected,
    onSelect,
}: {
    selected: Orientation | null;
    onSelect: (orientation: Orientation) => void;
}) => {
    const size = SCREEN_WIDTH - 80;
    const center = size / 2;
    const radius = size / 2 - 30;

    const orientations: { key: Orientation; angle: number }[] = [
        { key: 'N', angle: -90 },
        { key: 'NE', angle: -45 },
        { key: 'E', angle: 0 },
        { key: 'SE', angle: 45 },
        { key: 'S', angle: 90 },
        { key: 'SO', angle: 135 },
        { key: 'O', angle: 180 },
        { key: 'NO', angle: -135 },
    ];

    return (
        <View className="items-center my-4">
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle cx={center} cy={center} r={radius + 20} fill="#F1F5F9" />
                <Circle cx={center} cy={center} r={radius - 10} fill="white" stroke="#E2E8F0" strokeWidth={2} />

                {/* Orientation buttons */}
                {orientations.map(({ key, angle }) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = center + Math.cos(rad) * radius;
                    const y = center + Math.sin(rad) * radius;
                    const isSelected = selected === key;
                    const isPrimary = ['N', 'S', 'E', 'O'].includes(key);

                    return (
                        <G key={key} onPress={() => onSelect(key)}>
                            <Circle
                                cx={x}
                                cy={y}
                                r={isPrimary ? 24 : 18}
                                fill={isSelected ? '#2563EB' : isPrimary ? '#F8FAFC' : '#F1F5F9'}
                                stroke={isSelected ? '#1D4ED8' : '#CBD5E1'}
                                strokeWidth={isSelected ? 3 : 1}
                            />
                            <SvgText
                                x={x}
                                y={y + 5}
                                textAnchor="middle"
                                fontSize={isPrimary ? 14 : 11}
                                fontWeight={isPrimary ? 'bold' : 'normal'}
                                fill={isSelected ? 'white' : '#374151'}
                            >
                                {key}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Center icon */}
                <Circle cx={center} cy={center} r={25} fill="#EFF6FF" stroke="#BFDBFE" strokeWidth={2} />
                <SvgText x={center} y={center + 6} textAnchor="middle" fontSize={20}>
                    🏠
                </SvgText>
            </Svg>
            <Text className="text-gray-500 text-sm mt-2">
                Toca la dirección principal de tu espacio
            </Text>
        </View>
    );
};

// ============================================================================
// PIE CHART COMPONENT
// ============================================================================

const PieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
    const size = 180;
    const center = size / 2;
    const radius = size / 2 - 10;

    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    let currentAngle = -90;

    const slices = data.filter(item => item.value > 0).map((item) => {
        const percentage = item.value / total;
        const angle = percentage * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return { ...item, path, percentage };
    });

    return (
        <View className="items-center">
            <Svg width={size} height={size}>
                {slices.map((slice, idx) => (
                    <Path key={idx} d={slice.path} fill={slice.color} />
                ))}
                <Circle cx={center} cy={center} r={radius * 0.5} fill="white" />
            </Svg>
            <View className="flex-row flex-wrap justify-center mt-3 gap-2">
                {slices.map((slice, idx) => (
                    <View key={idx} className="flex-row items-center mr-3 mb-1">
                        <View style={{ backgroundColor: slice.color }} className="w-3 h-3 rounded-full mr-1" />
                        <Text className="text-xs text-gray-600">{slice.label} {Math.round(slice.percentage * 100)}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

// ============================================================================
// SELECTOR CHIPS
// ============================================================================

const ChipSelector = <T extends string>({
    options,
    selected,
    onSelect,
    labels,
}: {
    options: T[];
    selected: T;
    onSelect: (value: T) => void;
    labels: Record<T, string>;
}) => (
    <View className="flex-row flex-wrap gap-2">
        {options.map((option) => (
            <TouchableOpacity
                key={option}
                onPress={() => onSelect(option)}
                className={`px-3 py-2 rounded-lg border ${selected === option
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-200'
                    }`}
            >
                <Text className={`text-sm ${selected === option ? 'text-white font-medium' : 'text-gray-700'}`}>
                    {labels[option]}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BTUCalculatorPRO() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(1);
    const [state, setState] = useState<BTUCalculatorState>(createDefaultState());
    const [primaryOrientation, setPrimaryOrientation] = useState<Orientation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [userBranding, setUserBranding] = useState<BrandingConfig | undefined>(undefined);

    // ========================================================================
    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    // (React Rules of Hooks)
    // ========================================================================

    // Real-time calculation
    const result = useMemo<BTUCalculationResult | null>(() => {
        if (state.length <= 0 || state.width <= 0) return null;

        // Auto-update ceiling area based on room dimensions
        const updatedState = {
            ...state,
            ceiling: { ...state.ceiling, area: state.length * state.width },
            floor: { ...state.floor, area: state.length * state.width },
        };

        return calculateBTU(updatedState);
    }, [state]);

    const recommendations = useMemo(() => {
        if (!result) return [];
        return getSmartRecommendations(result);
    }, [result]);

    const updateState = useCallback((updates: Partial<BTUCalculatorState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const addWall = useCallback(() => {
        const newWall: WallConfig = {
            id: generateId(),
            orientacion: primaryOrientation || 'S',
            area: state.length > 0 ? state.length * state.height : 10,
            material: 'ladrillo',
            exposicion: 'sol_directo',
        };
        setState(prev => ({ ...prev, walls: [...prev.walls, newWall] }));
    }, [primaryOrientation, state.length, state.height]);

    const updateWall = useCallback((id: string, updates: Partial<WallConfig>) => {
        setState(prev => ({
            ...prev,
            walls: prev.walls.map(w => w.id === id ? { ...w, ...updates } : w),
        }));
    }, []);

    const removeWall = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            walls: prev.walls.filter(w => w.id !== id),
        }));
    }, []);

    const addWindow = useCallback(() => {
        const newWindow: WindowConfig = {
            id: generateId(),
            area: 2,
            tipo_vidrio: 'sencillo',
            proteccion: 'ninguno',
            orientacion: primaryOrientation || 'S',
        };
        setState(prev => ({ ...prev, windows: [...prev.windows, newWindow] }));
    }, [primaryOrientation]);

    const updateWindow = useCallback((id: string, updates: Partial<WindowConfig>) => {
        setState(prev => ({
            ...prev,
            windows: prev.windows.map(w => w.id === id ? { ...w, ...updates } : w),
        }));
    }, []);

    const removeWindow = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            windows: prev.windows.filter(w => w.id !== id),
        }));
    }, []);

    // Check subscription on mount
    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    router.replace('/(app)/tools/btu-calculator-free' as any);
                    return;
                }

                const profile = await getUserProfile(user.uid);
                if (isUserPro(profile)) {
                    setHasAccess(true);
                    setUserBranding(profile?.branding);
                } else {
                    // Offer subscription option
                    Alert.alert(
                        '🚀 Función PRO',
                        '¡Desbloquea la calculadora avanzada con QRclima Pro!',
                        [
                            { text: 'Ver Planes', onPress: () => router.push('/(app)/profile/subscription' as any) },
                            { text: 'Usar Básica', onPress: () => router.replace('/(app)/tools/btu-calculator-free' as any) }
                        ]
                    );
                }
            } catch (error) {
                console.error('Error checking subscription:', error);
                router.replace('/(app)/tools/btu-calculator-free' as any);
            } finally {
                setIsLoading(false);
            }
        };

        checkSubscription();
    }, []);

    // ========================================================================
    // CONDITIONAL RETURNS (after all hooks)
    // ========================================================================

    // Show loading while checking subscription
    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-4">Verificando acceso PRO...</Text>
            </View>
        );
    }

    // If no access, don't render (redirect will happen)
    if (!hasAccess) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <Ionicons name="lock-closed" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">Redirigiendo...</Text>
            </View>
        );
    }

    // ========================================================================
    // HANDLERS (non-hook functions)
    // ========================================================================

    const goToStep = (nextStep: number) => {
        if (nextStep === 2 && (state.length <= 0 || state.width <= 0)) {
            Alert.alert('Datos requeridos', 'Ingresa las dimensiones del espacio');
            return;
        }
        setStep(nextStep);
    };

    const resetCalculator = () => {
        setState(createDefaultState());
        setPrimaryOrientation(null);
        setStep(1);
    };

    // ========================================================================
    // STEP 1: DIMENSIONS & ORIENTATION
    // ========================================================================

    const renderStep1 = () => (
        <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
            <View className="p-4">
                {/* Info Box */}
                <View className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="calculator" size={20} color="#2563EB" />
                        <Text className="text-blue-700 font-bold ml-2">Calculadora BTU PRO</Text>
                    </View>
                    <Text className="text-blue-600 text-sm">
                        Calcula la carga térmica considerando muros, ventanas, techo y cargas internas para una recomendación precisa.
                    </Text>
                </View>

                {/* Dimensions */}
                <View className="flex-row items-center mb-3">
                    <Ionicons name="resize-outline" size={20} color="#374151" />
                    <Text className="text-lg font-bold text-gray-800 ml-2">Dimensiones del Espacio</Text>
                </View>

                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Largo (m)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 text-lg"
                            placeholder="Ej: 5.5"
                            keyboardType="decimal-pad"
                            value={state.length > 0 ? state.length.toString() : ''}
                            onChangeText={(text) => {
                                const cleaned = text.replace(',', '.');
                                // Allow empty string, or valid decimal patterns including trailing dot
                                if (cleaned === '' || cleaned === '.') {
                                    updateState({ length: 0 });
                                } else if (/^\d*\.?\d*$/.test(cleaned)) {
                                    const num = parseFloat(cleaned);
                                    updateState({ length: isNaN(num) ? 0 : num });
                                }
                            }}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Ancho (m)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 text-lg"
                            placeholder="Ej: 4.5"
                            keyboardType="decimal-pad"
                            value={state.width > 0 ? state.width.toString() : ''}
                            onChangeText={(text) => {
                                const cleaned = text.replace(',', '.');
                                if (cleaned === '' || cleaned === '.') {
                                    updateState({ width: 0 });
                                } else if (/^\d*\.?\d*$/.test(cleaned)) {
                                    const num = parseFloat(cleaned);
                                    updateState({ width: isNaN(num) ? 0 : num });
                                }
                            }}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Alto (m)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 text-lg"
                            placeholder="2.5"
                            keyboardType="decimal-pad"
                            value={state.height > 0 ? state.height.toString() : ''}
                            onChangeText={(text) => {
                                const cleaned = text.replace(',', '.');
                                if (cleaned === '' || cleaned === '.') {
                                    updateState({ height: 2.5 });
                                } else if (/^\d*\.?\d*$/.test(cleaned)) {
                                    const num = parseFloat(cleaned);
                                    updateState({ height: isNaN(num) ? 2.5 : num });
                                }
                            }}
                        />
                    </View>
                </View>

                {/* Climate Zone */}
                <View className="flex-row items-center mb-3 mt-2">
                    <Ionicons name="thermometer-outline" size={20} color="#374151" />
                    <Text className="text-lg font-bold text-gray-800 ml-2">Zona Climática</Text>
                </View>
                <View className="flex-row gap-2 mb-6">
                    {(['templada', 'calida', 'muy_calida'] as ClimateZone[]).map((zone) => (
                        <TouchableOpacity
                            key={zone}
                            onPress={() => updateState({ climateZone: zone })}
                            className={`flex-1 p-3 rounded-xl border-2 ${state.climateZone === zone
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`text-center font-bold ${state.climateZone === zone ? 'text-white' : 'text-gray-700'}`}>
                                {LABELS.climateZones[zone].label}
                            </Text>
                            <Text className={`text-center text-xs ${state.climateZone === zone ? 'text-blue-100' : 'text-gray-400'}`}>
                                {LABELS.climateZones[zone].description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Orientation Compass */}
                <View className="flex-row items-center mb-2">
                    <Ionicons name="compass-outline" size={20} color="#374151" />
                    <Text className="text-lg font-bold text-gray-800 ml-2">Orientación Principal</Text>
                </View>
                <Text className="text-gray-500 text-sm mb-2">
                    ¿Hacia dónde dan las paredes con más exposición al sol?
                </Text>
                <CompassSelector
                    selected={primaryOrientation}
                    onSelect={setPrimaryOrientation}
                />
            </View>

            {/* Continue Button */}
            <View className="p-4 pt-0">
                <TouchableOpacity
                    onPress={() => goToStep(2)}
                    className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center"
                >
                    <Text className="text-white font-bold text-lg mr-2">Continuar</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // ========================================================================
    // STEP 2: ROOM CONFIGURATION
    // ========================================================================

    const renderStep2 = () => (
        <View className="flex-1 bg-slate-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Walls Section */}
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <Ionicons name="layers-outline" size={20} color="#374151" />
                                <Text className="text-lg font-bold text-gray-800 ml-2">Muros Expuestos</Text>
                            </View>
                            <TouchableOpacity
                                onPress={addWall}
                                className="bg-blue-100 px-3 py-1 rounded-lg flex-row items-center"
                            >
                                <Ionicons name="add" size={18} color="#2563EB" />
                                <Text className="text-blue-600 font-medium ml-1">Agregar</Text>
                            </TouchableOpacity>
                        </View>

                        {state.walls.length === 0 && (
                            <View className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                                <Text className="text-gray-400 text-center">
                                    No hay muros configurados. Agrega los muros que dan al exterior.
                                </Text>
                            </View>
                        )}

                        {state.walls.map((wall, idx) => (
                            <View key={wall.id} className="bg-white p-4 rounded-xl border border-gray-200 mb-3">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="font-bold text-gray-700">Muro {idx + 1}</Text>
                                    <TouchableOpacity onPress={() => removeWall(wall.id)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row gap-3 mb-3">
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500 mb-1">Orientación</Text>
                                        <View className="flex-row flex-wrap gap-1">
                                            {(['N', 'S', 'E', 'O'] as Orientation[]).map((o) => (
                                                <TouchableOpacity
                                                    key={o}
                                                    onPress={() => updateWall(wall.id, { orientacion: o })}
                                                    className={`px-2 py-1 rounded ${wall.orientacion === o ? 'bg-blue-600' : 'bg-gray-100'
                                                        }`}
                                                >
                                                    <Text className={`text-xs ${wall.orientacion === o ? 'text-white' : 'text-gray-600'}`}>
                                                        {o}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500 mb-1">Área (m²)</Text>
                                        <TextInput
                                            className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-sm"
                                            keyboardType="numeric"
                                            value={wall.area.toString()}
                                            onChangeText={(t) => updateWall(wall.id, { area: parseFloat(t) || 0 })}
                                        />
                                    </View>
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500 mb-1">Material</Text>
                                        <ChipSelector
                                            options={['ladrillo', 'concreto', 'tablaroca', 'aislado'] as WallMaterial[]}
                                            selected={wall.material}
                                            onSelect={(m) => updateWall(wall.id, { material: m })}
                                            labels={LABELS.materials}
                                        />
                                    </View>
                                </View>

                                <View className="flex-row gap-2 mt-3">
                                    <TouchableOpacity
                                        onPress={() => updateWall(wall.id, { exposicion: 'sol_directo' })}
                                        className={`flex-1 p-2 rounded-lg flex-row items-center justify-center ${wall.exposicion === 'sol_directo' ? 'bg-yellow-100' : 'bg-gray-50'
                                            }`}
                                    >
                                        <Text className="mr-1">☀️</Text>
                                        <Text className={`text-sm ${wall.exposicion === 'sol_directo' ? 'text-yellow-700 font-medium' : 'text-gray-500'}`}>
                                            Sol
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => updateWall(wall.id, { exposicion: 'sombra' })}
                                        className={`flex-1 p-2 rounded-lg flex-row items-center justify-center ${wall.exposicion === 'sombra' ? 'bg-slate-200' : 'bg-gray-50'
                                            }`}
                                    >
                                        <Text className="mr-1">🌙</Text>
                                        <Text className={`text-sm ${wall.exposicion === 'sombra' ? 'text-slate-700 font-medium' : 'text-gray-500'}`}>
                                            Sombra
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Windows Section */}
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <Ionicons name="grid-outline" size={20} color="#374151" />
                                <Text className="text-lg font-bold text-gray-800 ml-2">Ventanas</Text>
                            </View>
                            <TouchableOpacity
                                onPress={addWindow}
                                className="bg-blue-100 px-3 py-1 rounded-lg flex-row items-center"
                            >
                                <Ionicons name="add" size={18} color="#2563EB" />
                                <Text className="text-blue-600 font-medium ml-1">Agregar</Text>
                            </TouchableOpacity>
                        </View>

                        {state.windows.length === 0 && (
                            <View className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                                <Text className="text-gray-400 text-center">
                                    No hay ventanas. Agrega las ventanas de tu espacio.
                                </Text>
                            </View>
                        )}

                        {state.windows.map((win, idx) => (
                            <View key={win.id} className="bg-white p-4 rounded-xl border border-gray-200 mb-3">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="font-bold text-gray-700">Ventana {idx + 1}</Text>
                                    <TouchableOpacity onPress={() => removeWindow(win.id)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row gap-3 mb-3">
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500 mb-1">Área (m²)</Text>
                                        <TextInput
                                            className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-sm"
                                            keyboardType="numeric"
                                            value={win.area.toString()}
                                            onChangeText={(t) => updateWindow(win.id, { area: parseFloat(t) || 0 })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500 mb-1">Orientación</Text>
                                        <View className="flex-row flex-wrap gap-1">
                                            {(['N', 'S', 'E', 'O'] as Orientation[]).map((o) => (
                                                <TouchableOpacity
                                                    key={o}
                                                    onPress={() => updateWindow(win.id, { orientacion: o })}
                                                    className={`px-2 py-1 rounded ${win.orientacion === o ? 'bg-blue-600' : 'bg-gray-100'
                                                        }`}
                                                >
                                                    <Text className={`text-xs ${win.orientacion === o ? 'text-white' : 'text-gray-600'}`}>
                                                        {o}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <Text className="text-xs text-gray-500 mb-1">Tipo de Vidrio</Text>
                                <ChipSelector
                                    options={['sencillo', 'doble', 'termico'] as GlassType[]}
                                    selected={win.tipo_vidrio}
                                    onSelect={(g) => updateWindow(win.id, { tipo_vidrio: g })}
                                    labels={LABELS.glassTypes}
                                />

                                <Text className="text-xs text-gray-500 mb-1 mt-3">Protección</Text>
                                <ChipSelector
                                    options={['ninguno', 'cortinas', 'persianas', 'toldo'] as WindowProtection[]}
                                    selected={win.proteccion}
                                    onSelect={(p) => updateWindow(win.id, { proteccion: p })}
                                    labels={LABELS.windowProtections}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Ceiling Section */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="home-outline" size={20} color="#374151" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">Techo</Text>
                        </View>
                        <View className="bg-white p-4 rounded-xl border border-gray-200">
                            <Text className="text-xs text-gray-500 mb-1">Tipo de Techo</Text>
                            <ChipSelector
                                options={['losa_concreto', 'techo_atico', 'lamina'] as CeilingType[]}
                                selected={state.ceiling.tipo}
                                onSelect={(t) => updateState({ ceiling: { ...state.ceiling, tipo: t } })}
                                labels={LABELS.ceilingTypes}
                            />

                            <Text className="text-xs text-gray-500 mb-1 mt-3">Color</Text>
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={() => updateState({ ceiling: { ...state.ceiling, color: 'claro' } })}
                                    className={`flex-1 p-3 rounded-lg border ${state.ceiling.color === 'claro' ? 'bg-gray-50 border-blue-500' : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Text className="text-center">⬜ Claro</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => updateState({ ceiling: { ...state.ceiling, color: 'oscuro' } })}
                                    className={`flex-1 p-3 rounded-lg border ${state.ceiling.color === 'oscuro' ? 'bg-gray-700 border-blue-500' : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Text className={`text-center ${state.ceiling.color === 'oscuro' ? 'text-white' : ''}`}>
                                        ⬛ Oscuro
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Internal Loads Section */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="flash-outline" size={20} color="#374151" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">Cargas Internas</Text>
                        </View>
                        <View className="bg-white p-4 rounded-xl border border-gray-200">
                            {/* Persons */}
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <Text className="text-2xl mr-2">👥</Text>
                                    <Text className="text-gray-700">Personas</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <TouchableOpacity
                                        onPress={() => updateState({
                                            internalLoads: {
                                                ...state.internalLoads,
                                                personas: Math.max(0, state.internalLoads.personas - 1),
                                            },
                                        })}
                                        className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                                    >
                                        <Ionicons name="remove" size={20} color="#374151" />
                                    </TouchableOpacity>
                                    <Text className="text-xl font-bold mx-4">{state.internalLoads.personas}</Text>
                                    <TouchableOpacity
                                        onPress={() => updateState({
                                            internalLoads: {
                                                ...state.internalLoads,
                                                personas: state.internalLoads.personas + 1,
                                            },
                                        })}
                                        className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center"
                                    >
                                        <Ionicons name="add" size={20} color="#2563EB" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Stove */}
                            <TouchableOpacity
                                onPress={() => updateState({
                                    internalLoads: {
                                        ...state.internalLoads,
                                        estufa: !state.internalLoads.estufa,
                                    },
                                })}
                                className={`flex-row items-center p-3 rounded-lg mb-4 ${state.internalLoads.estufa ? 'bg-orange-100' : 'bg-gray-50'
                                    }`}
                            >
                                <Ionicons
                                    name={state.internalLoads.estufa ? 'checkbox' : 'square-outline'}
                                    size={24}
                                    color={state.internalLoads.estufa ? '#EA580C' : '#9CA3AF'}
                                />
                                <Text className="text-2xl mx-2">🍳</Text>
                                <Text className={`${state.internalLoads.estufa ? 'text-orange-700' : 'text-gray-600'}`}>
                                    Incluye cocina/estufa (+8,000 BTU)
                                </Text>
                            </TouchableOpacity>

                            {/* Equipment Watts */}
                            <View className="mb-4">
                                <View className="flex-row items-center mb-1">
                                    <Text className="text-2xl mr-2">📺</Text>
                                    <Text className="text-gray-700">Equipos (Watts totales)</Text>
                                </View>
                                <TextInput
                                    className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                    placeholder="Ej: 500 (TV + PC + otros)"
                                    keyboardType="numeric"
                                    value={state.internalLoads.otros_equipos_watts > 0 ? state.internalLoads.otros_equipos_watts.toString() : ''}
                                    onChangeText={(t) => updateState({
                                        internalLoads: {
                                            ...state.internalLoads,
                                            otros_equipos_watts: parseInt(t) || 0,
                                        },
                                    })}
                                />
                            </View>

                            {/* Lighting Watts */}
                            <View>
                                <View className="flex-row items-center mb-1">
                                    <Text className="text-2xl mr-2">💡</Text>
                                    <Text className="text-gray-700">Iluminación (Watts)</Text>
                                </View>
                                <TextInput
                                    className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                    placeholder="Ej: 200"
                                    keyboardType="numeric"
                                    value={state.internalLoads.iluminacion_watts > 0 ? state.internalLoads.iluminacion_watts.toString() : ''}
                                    onChangeText={(t) => updateState({
                                        internalLoads: {
                                            ...state.internalLoads,
                                            iluminacion_watts: parseInt(t) || 0,
                                        },
                                    })}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer with Preview */}
            <View className="bg-white border-t border-gray-200 p-4">
                {result && (
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-500">BTU Estimado:</Text>
                        <Text className="text-2xl font-bold text-blue-600">
                            {result.totalBTU.toLocaleString()} BTU
                        </Text>
                    </View>
                )}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => goToStep(1)}
                        className="flex-1 bg-gray-100 p-4 rounded-xl flex-row items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                        <Text className="text-gray-700 font-medium ml-2">Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => goToStep(3)}
                        className="flex-1 bg-blue-600 p-4 rounded-xl flex-row items-center justify-center"
                    >
                        <Text className="text-white font-bold mr-2">Ver Resultados</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // ========================================================================
    // STEP 3: RESULTS
    // ========================================================================

    const renderStep3 = () => {
        if (!result) return null;

        const pieData = [
            { label: 'Conducción', value: result.breakdown.conduccion, color: '#EF4444' },
            { label: 'Radiación', value: result.breakdown.radiacion, color: '#F59E0B' },
            { label: 'Personas', value: result.breakdown.personas, color: '#10B981' },
            { label: 'Equipos', value: result.breakdown.equipos + result.breakdown.estufa, color: '#6366F1' },
            { label: 'Iluminación', value: result.breakdown.iluminacion, color: '#8B5CF6' },
            { label: 'Infiltración', value: result.breakdown.infiltracion, color: '#64748B' },
        ].filter(item => item.value > 0);

        return (
            <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Main Result Card */}
                    <View className="bg-blue-600 p-6 rounded-2xl mb-6">
                        <Text className="text-blue-200 text-sm mb-1">Carga Térmica Total</Text>
                        <View className="flex-row items-end mb-4">
                            <Text className="text-white text-5xl font-bold">
                                {result.totalBTU.toLocaleString()}
                            </Text>
                            <Text className="text-blue-200 text-xl ml-2 mb-1">BTU/h</Text>
                        </View>

                        <View className="bg-blue-500 p-4 rounded-xl mb-4">
                            <Text className="text-blue-200 text-sm">Área calculada</Text>
                            <Text className="text-white font-bold text-lg">{result.area.toFixed(1)} m²</Text>
                        </View>

                        <View className="bg-green-500 p-4 rounded-xl">
                            <Text className="text-green-100 text-sm">Recomendación Comercial</Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-white font-bold text-2xl">
                                    {result.recommendation.tonnage} Ton
                                </Text>
                                <Text className="text-green-100 ml-2">
                                    ({result.recommendation.btuCommercial.toLocaleString()} BTU)
                                </Text>
                            </View>
                            <Text className="text-green-200 text-sm mt-1">
                                {result.recommendation.equipmentType}
                            </Text>
                        </View>
                    </View>

                    {/* Pie Chart */}
                    <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                        <View className="flex-row items-center justify-center mb-4">
                            <Ionicons name="pie-chart" size={20} color="#374151" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">Distribución de Carga Térmica</Text>
                        </View>
                        <PieChart data={pieData} />
                    </View>

                    {/* Recommendations */}
                    <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="bulb" size={20} color="#A16207" />
                            <Text className="text-yellow-800 font-bold ml-2">Recomendaciones</Text>
                        </View>
                        {recommendations.map((rec, idx) => (
                            <Text key={idx} className="text-yellow-700 text-sm mb-2 leading-5">
                                {rec}
                            </Text>
                        ))}
                    </View>

                    {/* Breakdown Table */}
                    <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="list" size={20} color="#374151" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">Desglose Detallado</Text>
                        </View>
                        {[
                            { label: 'Conducción (Muros/Techo)', value: result.breakdown.conduccion, icon: 'layers-outline' },
                            { label: 'Radiación Solar (Ventanas)', value: result.breakdown.radiacion, icon: 'sunny-outline' },
                            { label: 'Personas', value: result.breakdown.personas, icon: 'people-outline' },
                            { label: 'Equipos Eléctricos', value: result.breakdown.equipos, icon: 'tv-outline' },
                            { label: 'Estufa/Cocina', value: result.breakdown.estufa, icon: 'flame-outline' },
                            { label: 'Iluminación', value: result.breakdown.iluminacion, icon: 'bulb-outline' },
                            { label: 'Infiltración', value: result.breakdown.infiltracion, icon: 'cloud-outline' },
                        ].filter(item => item.value > 0).map((item, idx) => (
                            <View key={idx} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                <View className="flex-row items-center">
                                    <Ionicons name={item.icon as any} size={16} color="#6B7280" />
                                    <Text className="text-gray-600 ml-2">{item.label}</Text>
                                </View>
                                <Text className="font-medium text-gray-800">{item.value.toLocaleString()} BTU</Text>
                            </View>
                        ))}
                        <View className="flex-row justify-between py-2 mt-2 bg-blue-50 -mx-4 px-4 rounded-lg">
                            <Text className="font-bold text-blue-700">TOTAL (con factor de seguridad 1.10)</Text>
                            <Text className="font-bold text-blue-700">{result.totalBTU.toLocaleString()} BTU</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="gap-3 mb-6">
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    await generateBTUReport(state, result, userBranding);
                                } catch (error) {
                                    Alert.alert('Error', 'No se pudo generar el PDF');
                                }
                            }}
                            className="bg-green-600 p-4 rounded-xl flex-row items-center justify-center"
                        >
                            <Ionicons name="document-text" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Exportar PDF</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={resetCalculator}
                            className="bg-gray-100 p-4 rounded-xl flex-row items-center justify-center"
                        >
                            <Ionicons name="refresh" size={20} color="#374151" />
                            <Text className="text-gray-700 font-medium ml-2">Nuevo Cálculo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => goToStep(2)}
                            className="bg-blue-100 p-4 rounded-xl flex-row items-center justify-center"
                        >
                            <Ionicons name="pencil" size={20} color="#2563EB" />
                            <Text className="text-blue-600 font-medium ml-2">Modificar Configuración</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom spacing for navigation */}
                    <View className="h-32" />
                </View>
            </ScrollView>
        );
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pb-4 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-blue-200 text-sm">Herramienta PRO</Text>
                        <Text className="text-white text-2xl font-bold">Calculadora BTU</Text>
                    </View>
                    <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center">
                        <Ionicons name="calculator" size={24} color="white" />
                    </View>
                </View>
            </View>

            <StepIndicator currentStep={step} />
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </View>
    );
}
