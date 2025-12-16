import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
    const { user, signOut } = useAuth();

    return (
        <View className="flex-1 justify-center items-center bg-gray-50 p-6">
            <View className="bg-white p-8 rounded-2xl w-full shadow-lg items-center">
                <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl">❄️</Text>
                </View>

                <Text className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido!</Text>
                <Text className="text-gray-500 mb-8 text-center">
                    Técnico ID: {user?.uid?.slice(0, 8)}...
                </Text>

                <TouchableOpacity
                    className="w-full bg-red-500 py-3 rounded-lg active:bg-red-600"
                    onPress={signOut}
                >
                    <Text className="text-white text-center font-bold">Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
