import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ClimateZone = 'templada' | 'calida' | 'muy_calida';

const CLIMATE_FACTORS: Record<ClimateZone, { factor: number; label: string; description: string }> = {
    templada: { factor: 500, label: 'Templada', description: '15-25°C promedio' },
    calida: { factor: 600, label: 'Cálida', description: '25-35°C promedio' },
    muy_calida: { factor: 700, label: 'Muy Cálida', description: '>35°C promedio' },
};

// Tonnage recommendations based on BTU
const getTonnageRecommendation = (btu: number): { tonnage: string; btuCommercial: number } => {
    if (btu <= 9000) return { tonnage: '0.75', btuCommercial: 9000 };
    if (btu <= 12000) return { tonnage: '1', btuCommercial: 12000 };
    if (btu <= 18000) return { tonnage: '1.5', btuCommercial: 18000 };
    if (btu <= 24000) return { tonnage: '2', btuCommercial: 24000 };
    if (btu <= 36000) return { tonnage: '3', btuCommercial: 36000 };
    if (btu <= 48000) return { tonnage: '4', btuCommercial: 48000 };
    return { tonnage: '5+', btuCommercial: 60000 };
};

export default function BTUCalculatorFree() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [zone, setZone] = useState<ClimateZone>('calida');
    const [result, setResult] = useState<{
        btu: number;
        recommendation: { tonnage: string; btuCommercial: number };
        area: number;
    } | null>(null);

    const calculateBTU = () => {
        const l = parseFloat(length);
        const w = parseFloat(width);

        if (!l || !w || l <= 0 || w <= 0) {
            Alert.alert('Error', 'Ingresa las dimensiones del espacio');
            return;
        }

        const area = l * w;
        const baseBTU = area * CLIMATE_FACTORS[zone].factor;
        const recommendation = getTonnageRecommendation(baseBTU);
        setResult({ btu: Math.round(baseBTU), recommendation, area });
    };

    const clearForm = () => {
        setLength('');
        setWidth('');
        setZone('calida');
        setResult(null);
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={{
                backgroundColor: '#2563EB',
                paddingTop: insets.top + 10,
                paddingBottom: 20,
                paddingHorizontal: 20,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
                zIndex: 10
            }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-white/20 p-2 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-xl font-bold">Calculadora BTU</Text>
                        <Text className="text-blue-200 text-xs">Herramienta Gratuita</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>

                {/* Dimensions */}
                <Text className="text-lg font-bold text-gray-800 mb-3">📐 Dimensiones del Espacio</Text>

                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Largo (m)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 text-lg shadow-sm"
                            placeholder="Ej: 5"
                            keyboardType="numeric"
                            value={length}
                            onChangeText={setLength}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Ancho (m)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 text-lg shadow-sm"
                            placeholder="Ej: 4"
                            keyboardType="numeric"
                            value={width}
                            onChangeText={setWidth}
                        />
                    </View>
                </View>

                {/* Climate Zone */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">🌡️ Zona Climática</Text>
                <View className="flex-row gap-2 mb-6">
                    {(Object.keys(CLIMATE_FACTORS) as ClimateZone[]).map((key) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => setZone(key)}
                            className={`flex-1 p-3 rounded-xl border-2 ${zone === key
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`text-center font-bold ${zone === key ? 'text-white' : 'text-gray-700'}`}>
                                {CLIMATE_FACTORS[key].label}
                            </Text>
                            <Text className={`text-center text-xs ${zone === key ? 'text-blue-100' : 'text-gray-400'}`}>
                                {CLIMATE_FACTORS[key].description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Calculate Button */}
                <TouchableOpacity
                    onPress={calculateBTU}
                    className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center shadow-lg mb-4 active:bg-blue-700"
                >
                    <Ionicons name="calculator" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Calcular BTU</Text>
                </TouchableOpacity>

                {/* Result */}
                {result && (
                    <View className="relative mt-4">
                        {/* Result Card - Solid Background for Contrast */}
                        <View style={{ backgroundColor: '#2563EB', padding: 24, borderRadius: 16 }} className="shadow-xl">
                            <Text className="text-blue-100 text-sm mb-1">Resultado del Cálculo</Text>

                            <View className="flex-row items-end mb-4">
                                <Text className="text-white text-5xl font-bold">
                                    {result.btu.toLocaleString()}
                                </Text>
                                <Text className="text-blue-200 text-xl ml-2 mb-1">BTU</Text>
                            </View>

                            <View className="bg-white/20 p-4 rounded-xl mb-4">
                                <Text className="text-blue-100 text-sm">Área calculada</Text>
                                <Text className="text-white font-bold text-lg">{result.area.toFixed(1)} m²</Text>
                            </View>

                            <View className="bg-green-500 p-4 rounded-xl">
                                <Text className="text-green-100 text-sm">Recomendación Comercial</Text>
                                <View className="flex-row items-baseline flex-wrap">
                                    <Text className="text-white font-bold text-2xl">
                                        {result.recommendation.tonnage} Ton
                                    </Text>
                                    <Text className="text-green-100 ml-2">
                                        ({result.recommendation.btuCommercial.toLocaleString()} BTU)
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={clearForm}
                                className="mt-4 p-3 border border-white/30 rounded-xl"
                            >
                                <Text className="text-white text-center font-medium">Nuevo Cálculo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* PRO Upgrade CTA */}
                <TouchableOpacity
                    onPress={() => router.push('/(app)/tools/btu-calculator-pro' as any)}
                    className="mt-8 bg-gradient-to-r from-purple-600 to-purple-800 p-4 rounded-xl border border-purple-400"
                    style={{ backgroundColor: '#7C3AED' }} // Fallback for gradient
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="bg-white/20 p-2 rounded-lg mr-3">
                                <Ionicons name="star" size={24} color="#FCD34D" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">Calculadora PRO</Text>
                                <Text className="text-purple-200 text-sm">Cálculo profesional</Text>
                            </View>
                        </View>
                        <View className="bg-yellow-400 px-3 py-1 rounded-full">
                            <Text className="text-purple-900 font-bold text-xs">PRO</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Tips */}
                <View className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-8">
                    <Text className="text-yellow-800 font-bold mb-2">💡 Tips Profesionales</Text>
                    <Text className="text-yellow-700 text-sm leading-5">
                        • Siempre redondea al tonelaje comercial superior{'\n'}
                        • En zonas muy calientes, considera un 10-15% extra
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
