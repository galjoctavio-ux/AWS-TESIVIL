import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { completeOnboarding, UserRank } from '../../services/user-service';

interface ExperienceOption {
    id: string;
    label: string;
    description: string;
    years: number;
    rank: UserRank;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
    {
        id: 'novice',
        label: 'Menos de 2 años',
        description: 'Estoy comenzando en el mundo del aire acondicionado',
        years: 1,
        rank: 'Novato',
        icon: 'leaf',
        color: 'bg-green-500',
    },
    {
        id: 'intermediate',
        label: '2 a 5 años',
        description: 'Tengo experiencia sólida en el campo',
        years: 3,
        rank: 'Técnico',
        icon: 'construct',
        color: 'bg-blue-500',
    },
    {
        id: 'expert',
        label: 'Más de 5 años',
        description: 'Soy un profesional experimentado',
        years: 6,
        rank: 'Técnico',
        icon: 'medal',
        color: 'bg-purple-500',
    },
];

export default function ExperienceSelection() {
    const router = useRouter();
    const { user, refreshOnboardingStatus } = useAuth();
    const params = useLocalSearchParams<{ alias: string; city: string; businessName?: string }>();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleContinue = () => {
        if (!selectedOption) {
            Alert.alert('Error', 'Por favor selecciona tu nivel de experiencia');
            return;
        }

        const option = EXPERIENCE_OPTIONS.find(o => o.id === selectedOption);
        if (!option) return;

        // Navegar al siguiente paso: Permisos
        router.push({
            pathname: '/(onboarding)/permissions',
            params: {
                alias: params.alias,
                city: params.city,
                businessName: params.businessName,
                experienceYears: option.years.toString()
            }
        });
    };

    return (
        <View className="flex-1 bg-gray-50 p-6 pt-16">
            {/* Header */}
            <TouchableOpacity onPress={handleBack} className="mb-6">
                <Ionicons name="arrow-back" size={28} color="#374151" />
            </TouchableOpacity>

            {/* Indicador de pasos */}
            <View className="flex-row mb-6">
                <View className="w-8 h-2 bg-blue-600 rounded-full mx-1" />
                <View className="w-8 h-2 bg-blue-600 rounded-full mx-1" />
                <View className="w-8 h-2 bg-blue-600 rounded-full mx-1" />
            </View>

            {/* Título */}
            <Text className="text-3xl font-bold text-gray-800 mb-2">
                Tu Experiencia
            </Text>
            <Text className="text-gray-500 mb-8">
                Esto nos ayuda a personalizar tu experiencia y asignarte un rango inicial
            </Text>

            {/* Opciones de experiencia */}
            <View className="space-y-4">
                {EXPERIENCE_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        className={`bg-white rounded-2xl p-5 border-2 flex-row items-center ${selectedOption === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        onPress={() => setSelectedOption(option.id)}
                    >
                        {/* Icono */}
                        <View className={`${option.color} w-14 h-14 rounded-full justify-center items-center mr-4`}>
                            <Ionicons name={option.icon} size={28} color="white" />
                        </View>

                        {/* Texto */}
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-800">
                                {option.label}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                {option.description}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <Text className="text-xs text-gray-400">Rango inicial: </Text>
                                <Text className={`text-xs font-semibold ${option.rank === 'Novato' ? 'text-green-600' : 'text-blue-600'
                                    }`}>
                                    {option.rank}
                                </Text>
                            </View>
                        </View>

                        {/* Check */}
                        {selectedOption === option.id && (
                            <View className="bg-blue-500 w-8 h-8 rounded-full justify-center items-center">
                                <Ionicons name="checkmark" size={20} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Info sobre rangos */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
                <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={20} color="#d97706" />
                    <Text className="text-yellow-800 text-sm ml-2 flex-1">
                        El rango <Text className="font-bold">Pro</Text> se obtiene siendo suscriptor Premium
                        o alcanzando +50 soluciones en la comunidad.
                    </Text>
                </View>
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Resumen */}
            {selectedOption && params.alias && (
                <View className="bg-gray-100 rounded-xl p-4 mb-4">
                    <Text className="text-gray-600 text-sm">Tu perfil:</Text>
                    <Text className="text-gray-800 font-semibold">
                        {params.alias} • {params.city}
                    </Text>
                </View>
            )}

            {/* Botón Finalizar */}
            <TouchableOpacity
                className={`w-full py-4 rounded-xl flex-row justify-center items-center ${selectedOption && !loading ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                onPress={handleContinue}
                disabled={!selectedOption || loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Text className={`font-bold text-lg mr-2 ${selectedOption ? 'text-white' : 'text-gray-500'}`}>
                            Siguiente paso
                        </Text>
                        <Ionicons name="arrow-forward" size={24} color={selectedOption ? "white" : "#6b7280"} />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}
