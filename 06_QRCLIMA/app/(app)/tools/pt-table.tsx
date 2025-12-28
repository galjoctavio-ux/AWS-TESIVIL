import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';

// Datos de presión según master_plan.md - Sección 3.5.2
type GasType = 'R410A' | 'R32' | 'R22';

interface PressureData {
    temp: number;
    minPSI: number;
    maxPSI: number;
    minBar: number;
    maxBar: number;
}

const GAS_DATA: Record<GasType, {
    name: string;
    color: string;
    bgColor: string;
    pressures: PressureData[];
}> = {
    R410A: {
        name: 'R-410A',
        color: '#3B82F6', // blue-500
        bgColor: '#DBEAFE', // blue-100
        pressures: [
            { temp: 25, minPSI: 105, maxPSI: 125, minBar: 7.2, maxBar: 8.6 },
            { temp: 30, minPSI: 110, maxPSI: 130, minBar: 7.6, maxBar: 9.0 },
            { temp: 35, minPSI: 115, maxPSI: 135, minBar: 7.9, maxBar: 9.3 },
            { temp: 40, minPSI: 120, maxPSI: 145, minBar: 8.3, maxBar: 10.0 },
            { temp: 45, minPSI: 130, maxPSI: 160, minBar: 9.0, maxBar: 11.0 },
        ]
    },
    R32: {
        name: 'R-32',
        color: '#10B981', // emerald-500
        bgColor: '#D1FAE5', // emerald-100
        pressures: [
            { temp: 25, minPSI: 105, maxPSI: 130, minBar: 7.2, maxBar: 9.0 },
            { temp: 30, minPSI: 110, maxPSI: 135, minBar: 7.6, maxBar: 9.3 },
            { temp: 35, minPSI: 115, maxPSI: 140, minBar: 7.9, maxBar: 9.6 },
            { temp: 40, minPSI: 120, maxPSI: 150, minBar: 8.3, maxBar: 10.3 },
            { temp: 45, minPSI: 130, maxPSI: 165, minBar: 9.0, maxBar: 11.4 },
        ]
    },
    R22: {
        name: 'R-22',
        color: '#F59E0B', // amber-500
        bgColor: '#FEF3C7', // amber-100
        pressures: [
            { temp: 25, minPSI: 50, maxPSI: 70, minBar: 3.4, maxBar: 4.8 },
            { temp: 30, minPSI: 55, maxPSI: 75, minBar: 3.8, maxBar: 5.2 },
            { temp: 35, minPSI: 60, maxPSI: 80, minBar: 4.1, maxBar: 5.5 },
            { temp: 40, minPSI: 65, maxPSI: 90, minBar: 4.5, maxBar: 6.2 },
            { temp: 45, minPSI: 70, maxPSI: 100, minBar: 4.8, maxBar: 6.9 },
        ]
    }
};

// Interpolar presión para temperaturas intermedias
const interpolatePressure = (gasType: GasType, temp: number): { minPSI: number; maxPSI: number; minBar: number; maxBar: number } => {
    const data = GAS_DATA[gasType].pressures;

    // Encontrar los dos puntos más cercanos
    let lower = data[0];
    let upper = data[data.length - 1];

    for (let i = 0; i < data.length - 1; i++) {
        if (temp >= data[i].temp && temp <= data[i + 1].temp) {
            lower = data[i];
            upper = data[i + 1];
            break;
        }
    }

    // Si está fuera del rango, usar el extremo más cercano
    if (temp <= data[0].temp) return data[0];
    if (temp >= data[data.length - 1].temp) return data[data.length - 1];

    // Interpolación lineal
    const ratio = (temp - lower.temp) / (upper.temp - lower.temp);

    return {
        minPSI: Math.round(lower.minPSI + ratio * (upper.minPSI - lower.minPSI)),
        maxPSI: Math.round(lower.maxPSI + ratio * (upper.maxPSI - lower.maxPSI)),
        minBar: parseFloat((lower.minBar + ratio * (upper.minBar - lower.minBar)).toFixed(1)),
        maxBar: parseFloat((lower.maxBar + ratio * (upper.maxBar - lower.maxBar)).toFixed(1)),
    };
};

// Componente de medidor visual
const PressureGauge = ({ min, max, unit, color }: { min: number; max: number; unit: string; color: string }) => {
    const midpoint = (min + max) / 2;

    return (
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-gray-500 text-sm mb-2 text-center">Presión de Succión</Text>

            {/* Gauge Visual */}
            <View className="items-center mb-3">
                <View
                    className="w-40 h-20 rounded-t-full overflow-hidden"
                    style={{ backgroundColor: '#E5E7EB' }}
                >
                    <View
                        className="absolute bottom-0 left-0 right-0 h-full rounded-t-full"
                        style={{
                            backgroundColor: color,
                            opacity: 0.3,
                        }}
                    />
                    {/* Indicator Line */}
                    <View
                        className="absolute bottom-0 left-1/2 w-1 h-16 rounded-full"
                        style={{
                            backgroundColor: color,
                            transform: [{ translateX: -2 }]
                        }}
                    />
                </View>
            </View>

            {/* Values */}
            <View className="flex-row justify-between items-center px-2">
                <View className="items-center">
                    <Text className="text-gray-400 text-xs">MÍN</Text>
                    <Text className="text-xl font-bold" style={{ color }}>
                        {min}
                    </Text>
                </View>

                <View className="items-center bg-gray-100 px-4 py-2 rounded-xl">
                    <Text className="text-gray-500 text-xs">RANGO IDEAL</Text>
                    <Text className="text-2xl font-bold text-gray-800">
                        {min} - {max}
                    </Text>
                    <Text className="text-gray-500 text-sm">{unit}</Text>
                </View>

                <View className="items-center">
                    <Text className="text-gray-400 text-xs">MÁX</Text>
                    <Text className="text-xl font-bold" style={{ color }}>
                        {max}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default function PTTable() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [selectedGas, setSelectedGas] = useState<GasType>('R410A');
    const [temperature, setTemperature] = useState(30);
    const [showBar, setShowBar] = useState(false);

    const pressureData = interpolatePressure(selectedGas, temperature);
    const gasConfig = GAS_DATA[selectedGas];

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ========================================== */}
                {/* HEADER - Uniform with rest of app */}
                {/* ========================================== */}
                <View className="bg-blue-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-white text-2xl font-bold">Tabla P-T</Text>
                            <Text className="text-blue-200 text-sm">Presión-Temperatura por refrigerante</Text>
                        </View>
                        <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center">
                            <Ionicons name="thermometer" size={20} color="white" />
                        </View>
                    </View>
                </View>

                <View className="p-4">
                    {/* Info Card */}
                    <View className="bg-cyan-50 p-4 rounded-xl mb-6 border border-cyan-100">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="information-circle" size={20} color="#0891B2" />
                            <Text className="text-cyan-700 font-bold ml-2">Referencia Dinámica</Text>
                        </View>
                        <Text className="text-cyan-600 text-sm">
                            Presiones de succión según temperatura ambiente y tipo de refrigerante.
                        </Text>
                    </View>

                    {/* Gas Selector */}
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="flask" size={20} color="#374151" />
                        <Text className="text-lg font-bold text-gray-800 ml-2">Tipo de Refrigerante</Text>
                    </View>
                    <View className="flex-row gap-2 mb-6">
                        {(Object.keys(GAS_DATA) as GasType[]).map((gas) => (
                            <TouchableOpacity
                                key={gas}
                                onPress={() => setSelectedGas(gas)}
                                className={`flex-1 p-4 rounded-xl border-2`}
                                style={{
                                    backgroundColor: selectedGas === gas ? GAS_DATA[gas].bgColor : 'white',
                                    borderColor: selectedGas === gas ? GAS_DATA[gas].color : '#E5E7EB',
                                }}
                            >
                                <Text
                                    className={`text-center font-bold text-lg`}
                                    style={{ color: selectedGas === gas ? GAS_DATA[gas].color : '#6B7280' }}
                                >
                                    {GAS_DATA[gas].name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Temperature Slider */}
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="thermometer-outline" size={20} color="#374151" />
                        <Text className="text-lg font-bold text-gray-800 ml-2">Temperatura Ambiente</Text>
                    </View>
                    <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-gray-500">20°C</Text>
                            <View className="bg-gray-800 px-4 py-2 rounded-full">
                                <Text className="text-white font-bold text-xl">{temperature}°C</Text>
                            </View>
                            <Text className="text-gray-500">45°C</Text>
                        </View>

                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={20}
                            maximumValue={45}
                            step={1}
                            value={temperature}
                            onValueChange={setTemperature}
                            minimumTrackTintColor={gasConfig.color}
                            maximumTrackTintColor="#E5E7EB"
                            thumbTintColor={gasConfig.color}
                        />
                    </View>

                    {/* Unit Toggle */}
                    <View className="flex-row justify-center mb-4">
                        <TouchableOpacity
                            onPress={() => setShowBar(false)}
                            className={`px-6 py-2 rounded-l-xl ${!showBar ? 'bg-gray-800' : 'bg-gray-200'}`}
                        >
                            <Text className={`font-bold ${!showBar ? 'text-white' : 'text-gray-600'}`}>PSI</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowBar(true)}
                            className={`px-6 py-2 rounded-r-xl ${showBar ? 'bg-gray-800' : 'bg-gray-200'}`}
                        >
                            <Text className={`font-bold ${showBar ? 'text-white' : 'text-gray-600'}`}>Bar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Pressure Gauge */}
                    <PressureGauge
                        min={showBar ? pressureData.minBar : pressureData.minPSI}
                        max={showBar ? pressureData.maxBar : pressureData.maxPSI}
                        unit={showBar ? 'bar' : 'psig'}
                        color={gasConfig.color}
                    />

                    {/* Quick Reference Table */}
                    <View className="flex-row items-center mt-6 mb-3">
                        <Ionicons name="grid" size={20} color="#374151" />
                        <Text className="text-lg font-bold text-gray-800 ml-2">Tabla de Referencia - {gasConfig.name}</Text>
                    </View>
                    <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <View className="flex-row bg-gray-100 p-3">
                            <Text className="flex-1 font-bold text-gray-700 text-center">Temp °C</Text>
                            <Text className="flex-1 font-bold text-gray-700 text-center">PSI</Text>
                            <Text className="flex-1 font-bold text-gray-700 text-center">Bar</Text>
                        </View>

                        {/* Rows */}
                        {gasConfig.pressures.map((row, index) => (
                            <View
                                key={row.temp}
                                className={`flex-row p-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                style={{
                                    backgroundColor: row.temp === Math.round(temperature / 5) * 5
                                        ? gasConfig.bgColor
                                        : index % 2 === 0 ? 'white' : '#F9FAFB'
                                }}
                            >
                                <Text className="flex-1 text-center text-gray-700">{row.temp}°</Text>
                                <Text className="flex-1 text-center text-gray-700">{row.minPSI}-{row.maxPSI}</Text>
                                <Text className="flex-1 text-center text-gray-700">{row.minBar}-{row.maxBar}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Disclaimer */}
                    <View className="mt-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="warning" size={20} color="#D97706" />
                            <Text className="text-amber-700 font-bold ml-2">Importante</Text>
                        </View>
                        <Text className="text-amber-600 text-sm leading-5">
                            Estos valores son orientativos para presiones de succión (baja). La presión real puede variar según:{'\n'}
                            • Condiciones del equipo{'\n'}
                            • Carga de refrigerante{'\n'}
                            • Restricciones en el sistema{'\n'}
                            Siempre consulta el manual del fabricante.
                        </Text>
                    </View>

                    {/* Sources */}
                    <Text className="text-gray-400 text-xs text-center mt-4 mb-32">
                        Fuentes: FSW, Refrigerants Center Inc, Royal Refrigerants, Ace Services
                    </Text>
                </View>

                {/* Bottom spacing for navigation */}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
