import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            router.replace('/');
        } catch (e) {
            console.error(e);
        }
    };

    const handleAdminAccess = () => {
        Alert.alert(
            'Modo Dios',
            '¿Entrar al Panel Administrativo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Entrar',
                    onPress: () => router.push('/(app)/admin')
                }
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-slate-50">
            {/* Header / Cover */}
            <View className="bg-blue-600 h-40 items-center justify-center">
                <Text className="text-white font-bold text-2xl">Mi Perfil</Text>
            </View>

            {/* Avatar & Info */}
            <View className="px-6 -mt-12 mb-6">
                <View className="bg-white p-6 rounded-2xl shadow-sm items-center">
                    <View className="w-24 h-24 bg-gray-200 rounded-full mb-4 items-center justify-center border-4 border-white shadow-sm">
                        <Ionicons name="person" size={48} color="#9CA3AF" />
                    </View>
                    <Text className="text-xl font-bold text-gray-800">{user?.email || 'Usuario'}</Text>
                    <View className="bg-blue-100 px-3 py-1 rounded-full mt-2">
                        <Text className="text-blue-700 font-bold text-xs">Técnico Nivel 1</Text>
                    </View>
                </View>
            </View>

            {/* Actions */}
            <View className="px-6 mb-8">
                <TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-100 mb-3 flex-row items-center">
                    <Ionicons name="settings-outline" size={24} color="#4B5563" />
                    <Text className="ml-3 text-gray-700 font-bold flex-1">Configuración</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-100 mb-3 flex-row items-center">
                    <Ionicons name="card-outline" size={24} color="#4B5563" />
                    <Text className="ml-3 text-gray-700 font-bold flex-1">Suscripción PRO</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 p-4 rounded-xl border border-red-100 mb-3 flex-row items-center mt-4"
                >
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text className="ml-3 text-red-600 font-bold flex-1">Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>

            {/* Version & Admin Access */}
            <View className="items-center mb-10">
                <TouchableOpacity onLongPress={handleAdminAccess} delayLongPress={2000}>
                    <Text className="text-gray-400 text-xs">Versión 1.0.0 (Build 2025)</Text>
                    <Text className="text-gray-300 text-[10px] text-center mt-1">Mr. Frío © 2025</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
