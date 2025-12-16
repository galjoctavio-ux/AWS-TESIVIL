import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

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

export default function BTUCalculator() {
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('2.5'); // Default ceiling height
    const [zone, setZone] = useState<ClimateZone>('calida');
    const [result, setResult] = useState<{
        btu: number;
        recommendation: { tonnage: string; btuCommercial: number };
        area: number;
    } | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced inputs
    const [occupants, setOccupants] = useState('2');
    const [hasKitchen, setHasKitchen] = useState(false);
    const [windowArea, setWindowArea] = useState('');
    const [sunExposure, setSunExposure] = useState<'low' | 'medium' | 'high'>('medium');

    const calculateBTU = () => {
        const l = parseFloat(length);
        const w = parseFloat(width);
        const h = parseFloat(height);

        if (!l || !w || l <= 0 || w <= 0) {
            Alert.alert('Error', 'Ingresa las dimensiones del espacio');
            return;
        }

        const area = l * w;
        let baseBTU = area * CLIMATE_FACTORS[zone].factor;

        // Advanced calculations
        if (showAdvanced) {
            // Volume factor (for high ceilings)
            if (h > 2.7) {
                baseBTU *= 1 + ((h - 2.7) * 0.1);
            }

            // Occupants (400 BTU per person beyond 2)
            const numOccupants = parseInt(occupants) || 2;
            if (numOccupants > 2) {
                baseBTU += (numOccupants - 2) * 400;
            }

            // Kitchen heat load
            if (hasKitchen) {
                baseBTU += 4000;
            }

            // Window solar gain
            const windowSqm = parseFloat(windowArea) || 0;
            const sunFactors = { low: 500, medium: 800, high: 1200 };
            baseBTU += windowSqm * sunFactors[sunExposure];
        }

        const recommendation = getTonnageRecommendation(baseBTU);
        setResult({ btu: Math.round(baseBTU), recommendation, area });
    };

    const clearForm = () => {
        setLength('');
        setWidth('');
        setHeight('2.5');
        setZone('calida');
        setResult(null);
        setOccupants('2');
        setHasKitchen(false);
        setWindowArea('');
        setSunExposure('medium');
    };

    return (
        <ScrollView className="flex-1 bg-slate-50">
            <View className="p-6">
                {/* Header Info */}
                <View className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="information-circle" size={20} color="#2563EB" />
                        <Text className="text-blue-700 font-bold ml-2">¿Cómo funciona?</Text>
                    </View>
                    <Text className="text-blue-600 text-sm">
                        Calcula los BTU necesarios según el área y la zona climática. El resultado te sugiere el tonelaje comercial más adecuado.
                    </Text>
                </View>

                {/* Dimensions */}
                <Text className="text-lg font-bold text-gray-800 mb-3">📐 Dimensiones del Espacio</Text>

                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Largo (m)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 text-lg"
                            placeholder="Ej: 5"
                            keyboardType="numeric"
                            value={length}
                            onChangeText={setLength}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-gray-600 mb-1">Ancho (m)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 text-lg"
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

                {/* Advanced Options Toggle */}
                <TouchableOpacity
                    onPress={() => setShowAdvanced(!showAdvanced)}
                    className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-4"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="settings" size={20} color="#6B7280" />
                        <Text className="text-gray-700 font-medium ml-2">Cálculo Avanzado (PRO)</Text>
                    </View>
                    <Ionicons
                        name={showAdvanced ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#6B7280"
                    />
                </TouchableOpacity>

                {/* Advanced Options */}
                {showAdvanced && (
                    <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                        <View className="mb-4">
                            <Text className="text-sm text-gray-600 mb-1">Altura del techo (m)</Text>
                            <TextInput
                                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                placeholder="2.5"
                                keyboardType="numeric"
                                value={height}
                                onChangeText={setHeight}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm text-gray-600 mb-1">Ocupantes habituales</Text>
                            <TextInput
                                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                placeholder="2"
                                keyboardType="numeric"
                                value={occupants}
                                onChangeText={setOccupants}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => setHasKitchen(!hasKitchen)}
                            className={`flex-row items-center p-3 rounded-lg mb-4 ${hasKitchen ? 'bg-orange-100' : 'bg-gray-50'}`}
                        >
                            <Ionicons
                                name={hasKitchen ? "checkbox" : "square-outline"}
                                size={24}
                                color={hasKitchen ? "#EA580C" : "#9CA3AF"}
                            />
                            <Text className={`ml-2 ${hasKitchen ? 'text-orange-700' : 'text-gray-600'}`}>
                                Incluye cocina/estufa
                            </Text>
                        </TouchableOpacity>

                        <View className="mb-4">
                            <Text className="text-sm text-gray-600 mb-1">Área de ventanas (m²)</Text>
                            <TextInput
                                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                placeholder="Opcional"
                                keyboardType="numeric"
                                value={windowArea}
                                onChangeText={setWindowArea}
                            />
                        </View>

                        <Text className="text-sm text-gray-600 mb-2">Exposición solar</Text>
                        <View className="flex-row gap-2">
                            {(['low', 'medium', 'high'] as const).map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => setSunExposure(level)}
                                    className={`flex-1 p-2 rounded-lg ${sunExposure === level ? 'bg-yellow-400' : 'bg-gray-100'
                                        }`}
                                >
                                    <Text className={`text-center text-sm ${sunExposure === level ? 'text-yellow-900 font-bold' : 'text-gray-600'
                                        }`}>
                                        {level === 'low' ? '🌙 Baja' : level === 'medium' ? '⛅ Media' : '☀️ Alta'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Calculate Button */}
                <TouchableOpacity
                    onPress={calculateBTU}
                    className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center shadow-lg mb-4"
                >
                    <Ionicons name="calculator" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Calcular BTU</Text>
                </TouchableOpacity>

                {/* Result */}
                {result && (
                    <View className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-xl">
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
                            <View className="flex-row items-baseline">
                                <Text className="text-white font-bold text-2xl">
                                    {result.recommendation.tonnage} Tonelada{result.recommendation.tonnage !== '1' ? 's' : ''}
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
                )}

                {/* Tips */}
                <View className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <Text className="text-yellow-800 font-bold mb-2">💡 Tips Profesionales</Text>
                    <Text className="text-yellow-700 text-sm leading-5">
                        • Siempre redondea al tonelaje comercial superior{'\n'}
                        • En zonas muy calientes, considera un 10-15% extra{'\n'}
                        • Equipos Inverter ofrecen mejor eficiencia en cargas variables
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
