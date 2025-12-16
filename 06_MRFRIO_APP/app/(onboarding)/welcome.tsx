import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Welcome() {
    const router = useRouter();
    const { user } = useAuth();

    const handleContinue = () => {
        router.push('/(onboarding)/profile');
    };

    return (
        <View className="flex-1 bg-blue-600 justify-center items-center p-8">
            {/* Logo / Icon */}
            <View className="bg-white/20 rounded-full p-8 mb-8">
                <Ionicons name="snow" size={80} color="white" />
            </View>

            {/* Título */}
            <Text className="text-4xl font-bold text-white text-center mb-4">
                ¡Bienvenido a Mr. Frío!
            </Text>

            {/* Mensaje personalizado */}
            <Text className="text-lg text-blue-100 text-center mb-2">
                Hola, {user?.email?.split('@')[0] || 'Técnico'}
            </Text>

            {/* Descripción */}
            <View className="bg-white/10 rounded-2xl p-6 mb-10">
                <Text className="text-white text-center leading-6">
                    Tu asistente inteligente para la{'\n'}
                    gestión de servicios de aire acondicionado.{'\n\n'}
                    📋 Registra servicios en segundos{'\n'}
                    🔧 Diagnostica fallas sin internet{'\n'}
                    💼 Genera cotizaciones profesionales
                </Text>
            </View>

            {/* Indicador de pasos */}
            <View className="flex-row mb-8">
                <View className="w-8 h-2 bg-white rounded-full mx-1" />
                <View className="w-8 h-2 bg-white/30 rounded-full mx-1" />
                <View className="w-8 h-2 bg-white/30 rounded-full mx-1" />
            </View>

            {/* Botón Continuar */}
            <TouchableOpacity
                className="bg-white w-full py-4 rounded-2xl shadow-lg flex-row justify-center items-center"
                onPress={handleContinue}
            >
                <Text className="text-blue-600 font-bold text-lg mr-2">
                    Comenzar
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#2563eb" />
            </TouchableOpacity>

            {/* Tiempo estimado */}
            <Text className="text-blue-200 text-sm mt-4">
                Solo tomará 1 minuto configurar tu perfil
            </Text>
        </View>
    );
}
