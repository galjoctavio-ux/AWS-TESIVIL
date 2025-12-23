import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/AuthContext';

export default function AdminPanel() {
    const router = useRouter();
    const { user } = useAuth();

    // Mock KPIs
    const kpis = {
        totalSales: 12450.00,
        activeUsers: 42,
        tokensInCirculation: 15400,
        pendingOrders: 3
    };

    const handleGrantTokens = async () => {
        try {
            const userRef = doc(db, 'users', user!.uid);
            await updateDoc(userRef, {
                token_balance: increment(100)
            });
            Alert.alert('God Mode', '+100 Tokens generados exitosamente.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleBanSimulation = () => {
        Alert.alert('Simulación', 'Usuario "JuanPerez" ha sido baneado por 24h.');
    };

    const renderMetricCard = (title: string, value: string | number, color: string, icon: any) => (
        <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-1 m-1 items-center">
            <View className={`p-2 rounded-full mb-2 ${color}`}>
                <Ionicons name={icon} size={20} color="white" />
            </View>
            <Text className="text-gray-500 text-xs font-bold uppercase text-center">{title}</Text>
            <Text className="text-xl font-bold text-gray-800 mt-1">{value}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-100">
            {/* Header */}
            <View className="bg-black pt-12 pb-6 px-4 shadow-lg">
                <View className="flex-row justify-between items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-red-500">GOD MODE • ADMIN</Text>
                    <View style={{ width: 24 }} />
                </View>
                <Text className="text-gray-400 text-center text-xs">
                    Panel de Administración Secreto
                </Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <Text className="font-bold text-gray-400 mb-3 uppercase text-xs">Business Intelligence (Mock)</Text>

                <View className="flex-row mb-2">
                    {renderMetricCard('Ventas Mes', '$12,450', 'bg-green-600', 'cash')}
                    {renderMetricCard('Usuarios Activos', '42', 'bg-blue-600', 'people')}
                </View>
                <View className="flex-row mb-6">
                    {renderMetricCard('Inflación Tokens', '15.4k', 'bg-yellow-500', 'wallet')}
                    {renderMetricCard('Pedidos Pendientes', '3', 'bg-red-500', 'cart')}
                </View>

                <Text className="font-bold text-gray-400 mb-3 uppercase text-xs">Acciones de Super Usuario</Text>

                <TouchableOpacity
                    onPress={handleGrantTokens}
                    className="bg-white p-4 rounded-xl mb-3 flex-row items-center border border-gray-200"
                >
                    <View className="bg-yellow-100 p-2 rounded-lg mr-3">
                        <Ionicons name="flash" size={24} color="#EAB308" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800">Generar Tokens (Self)</Text>
                        <Text className="text-gray-500 text-xs text-left">Abuso para pruebas. +100 Tokens.</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleBanSimulation}
                    className="bg-white p-4 rounded-xl mb-3 flex-row items-center border border-gray-200"
                >
                    <View className="bg-red-100 p-2 rounded-lg mr-3">
                        <Ionicons name="skull" size={24} color="#EF4444" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800">Simular Ban</Text>
                        <Text className="text-gray-500 text-xs text-left">Probar sistema de bloqueo de usuarios.</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white p-4 rounded-xl mb-3 flex-row items-center border border-gray-200 opacity-50"
                >
                    <View className="bg-gray-100 p-2 rounded-lg mr-3">
                        <Ionicons name="settings" size={24} color="gray" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800">Configuración Remota</Text>
                        <Text className="text-gray-500 text-xs text-left">Editar JSON de reglas (Próximamente).</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}
