import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Capacity = '1' | '1.5' | '2' | '3';
type Voltage = '110' | '220';
type Technology = 'std' | 'inverter';
type Distance = 'short' | 'long'; // short < 20m, long > 20m

export default function CableGuide() {
    const router = useRouter();

    // State
    const [capacity, setCapacity] = useState<Capacity>('1');
    const [voltage, setVoltage] = useState<Voltage>('220');
    const [tech, setTech] = useState<Technology>('std');
    const [distance, setDistance] = useState<Distance>('short');

    // Logic Matrix (Master Plan 3.5.1)
    const result = useMemo(() => {
        // Default fallback
        let wire = '12 AWG';
        let breaker = '2 x 15A';
        let note = '';

        if (capacity === '1') {
            if (voltage === '110') {
                breaker = '1 x 15A'; // Breaker monopolar para 110
                if (tech === 'std') {
                    wire = '12 AWG'; // Corto y Largo
                } else { // Inverter
                    if (distance === 'short') wire = '14 AWG';
                    else wire = '12 AWG';
                }
            } else { // 220V
                breaker = '2 x 10A';
                if (tech === 'std') {
                    if (distance === 'short') wire = '14 AWG';
                    else wire = '12 AWG';
                } else { // Inverter
                    if (distance === 'short') wire = '14 AWG';
                    else wire = '12 AWG';
                }
            }
        }
        else if (capacity === '1.5' || capacity === '2') {
            // Asumimos 220V mayormente para estas capacidades, pero validamos select
            if (voltage === '110') {
                // Caso raro/teórico en minisplits grandes, forzamos recomendación robusta
                wire = '10 AWG';
                breaker = '1 x 20A';
                note = 'Verificar disponibilidad de equipo 110V en esta capacidad.';
            } else {
                breaker = '2 x 15A';
                if (tech === 'std') {
                    wire = '12 AWG'; // Corto y Largo
                } else { // Inverter
                    if (distance === 'short') wire = '14 AWG';
                    else wire = '12 AWG';
                }
            }
        }
        else if (capacity === '3') {
            breaker = '2 x 20A';
            if (voltage === '110') {
                wire = '8 AWG'; // Muy raro
                breaker = '1 x 30A';
                note = 'Instalación 110V no recomendada para 3 Ton.';
            } else {
                // 220V
                if (tech === 'std') {
                    if (distance === 'short') wire = '12 AWG';
                    else wire = '10 AWG';
                } else { // Inverter
                    if (distance === 'short') wire = '12 AWG';
                    else wire = '10 AWG';
                }
            }
        }

        return { wire, breaker, note };
    }, [capacity, voltage, tech, distance]);

    const Selector = ({ label, options, current, onChange }: any) => (
        <View className="mb-6">
            <Text className="text-gray-700 font-bold mb-3">{label}</Text>
            <View className="flex-row flex-wrap gap-2">
                {options.map((opt: any) => (
                    <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        className={`px-4 py-3 rounded-xl border ${current === opt.value
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-200'
                            }`}
                    >
                        <Text className={`font-medium ${current === opt.value ? 'text-white' : 'text-gray-600'
                            }`}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg mb-6">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-blue-100 text-sm">Herramientas</Text>
                        <Text className="text-2xl font-bold text-white">Asistente Eléctrico</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6">

                {/* Inputs */}
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <Selector
                        label="Capacidad del Equipo"
                        current={capacity}
                        onChange={setCapacity}
                        options={[
                            { label: '1 Ton', value: '1' },
                            { label: '1.5 Ton', value: '1.5' },
                            { label: '2 Ton', value: '2' },
                            { label: '3 Ton', value: '3' },
                        ]}
                    />

                    <Selector
                        label="Voltaje"
                        current={voltage}
                        onChange={setVoltage}
                        options={[
                            { label: '220V', value: '220' },
                            { label: '110V', value: '110' },
                        ]}
                    />

                    <Selector
                        label="Tecnología"
                        current={tech}
                        onChange={setTech}
                        options={[
                            { label: 'Inverter', value: 'inverter' },
                            { label: 'Convencional (On/Off)', value: 'std' },
                        ]}
                    />

                    <Selector
                        label="Distancia Eléctrica"
                        current={distance}
                        onChange={setDistance}
                        options={[
                            { label: 'Corta (< 20m)', value: 'short' },
                            { label: 'Larga (20m - 50m)', value: 'long' },
                        ]}
                    />
                </View>

                {/* Result Card */}
                <View className="bg-gray-800 rounded-2xl p-6 shadow-xl mb-10">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="flash" size={24} color="#FBBF24" />
                        <Text className="text-white font-bold text-xl ml-2">Recomendación</Text>
                    </View>

                    <View className="flex-row justify-between mb-6">
                        <View className="items-center flex-1 border-r border-gray-600">
                            <Text className="text-gray-400 text-sm mb-1">Cable (Alimentación)</Text>
                            <Text className="text-3xl font-bold text-yellow-400">{result.wire}</Text>
                        </View>
                        <View className="items-center flex-1">
                            <Text className="text-gray-400 text-sm mb-1">Pastilla (Breaker)</Text>
                            <Text className="text-3xl font-bold text-blue-400">{result.breaker}</Text>
                        </View>
                    </View>

                    {result.note ? (
                        <View className="bg-red-500/20 p-3 rounded-lg flex-row items-center">
                            <Ionicons name="warning" size={20} color="#F87171" />
                            <Text className="text-red-200 ml-2 text-sm flex-1">{result.note}</Text>
                        </View>
                    ) : (
                        <View className="bg-green-500/20 p-3 rounded-lg flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
                            <Text className="text-green-200 ml-2 text-sm">Cálculo basado en normativa estándar.</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}
