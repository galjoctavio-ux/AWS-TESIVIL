import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { getEquipmentById, EquipmentData, getQrWebUrl } from '../../../services/equipment-service';
import { getClientById, ClientData } from '../../../services/clients-service';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function EquipmentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();

    const [equipment, setEquipment] = useState<(EquipmentData & { id: string }) | null>(null);
    const [client, setClient] = useState<(ClientData & { id: string }) | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!id || !user) return;

            try {
                setLoading(true);

                // Fetch equipment
                const equipmentData = await getEquipmentById(id);
                if (!equipmentData) {
                    Alert.alert('Error', 'Equipo no encontrado');
                    router.back();
                    return;
                }
                setEquipment(equipmentData);

                // Fetch client
                if (equipmentData.clientId) {
                    const clientData = await getClientById(equipmentData.clientId);
                    setClient(clientData);
                }
            } catch (error) {
                console.error('Error loading equipment details:', error);
                Alert.alert('Error', 'No se pudieron cargar los detalles');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, user]);

    const formatDate = (date: any) => {
        if (!date) return 'No especificado';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-4">Cargando equipo...</Text>
            </View>
        );
    }

    if (!equipment) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center p-6">
                <Ionicons name="alert-circle" size={64} color="#EF4444" />
                <Text className="text-gray-700 text-lg mt-4">No se encontró el equipo</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white flex-1">Detalle del Equipo</Text>
                </View>

                {/* Equipment Title */}
                <View className="bg-white/20 rounded-xl p-4">
                    <View className="flex-row items-center">
                        <View className="bg-cyan-500 p-3 rounded-full mr-4">
                            <Ionicons name="snow" size={28} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-xl">
                                {equipment.brand} {equipment.model}
                            </Text>
                            {equipment.btu && (
                                <Text className="text-blue-100">
                                    {equipment.btu.toLocaleString()} BTU
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                {/* QR Token Info - TESIVIL System */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <View className="bg-purple-100 p-2 rounded-full mr-3">
                                <Ionicons name="qr-code" size={20} color="#7C3AED" />
                            </View>
                            <Text className="text-lg font-bold text-gray-800">Hoja de Vida</Text>
                        </View>
                        {equipment.token && (
                            <View className="bg-purple-500 px-3 py-1 rounded-full">
                                <Text className="text-white font-bold text-xs">
                                    {equipment.token.toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Token and URL Display */}
                    {equipment.token ? (
                        <>
                            <TouchableOpacity
                                onPress={async () => {
                                    const url = getQrWebUrl(equipment.token);
                                    await Clipboard.setStringAsync(url);
                                    Alert.alert('Copiado', 'URL del QR copiada al portapapeles');
                                }}
                                className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4 rounded-xl mb-3"
                            >
                                <Text className="text-purple-800 font-mono text-sm text-center">
                                    {getQrWebUrl(equipment.token)}
                                </Text>
                                <Text className="text-purple-500 text-xs text-center mt-2">
                                    Toca para copiar 📋
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => Linking.openURL(getQrWebUrl(equipment.token))}
                                className="bg-purple-600 p-3 rounded-xl flex-row items-center justify-center"
                            >
                                <Ionicons name="open-outline" size={18} color="white" />
                                <Text className="text-white font-bold ml-2">Ver Vista Pública</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View className="bg-gray-100 p-3 rounded-xl">
                            <Text className="text-gray-500 text-sm text-center">
                                Este equipo no tiene token QR asignado
                            </Text>
                        </View>
                    )}
                </View>

                {/* Equipment Details */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-blue-100 p-2 rounded-full mr-3">
                            <Ionicons name="information-circle" size={20} color="#2563EB" />
                        </View>
                        <Text className="text-lg font-bold text-gray-800">Detalles</Text>
                    </View>

                    <View className="space-y-3">
                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-500">Marca</Text>
                            <Text className="font-semibold text-gray-800">{equipment.brand}</Text>
                        </View>
                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-500">Modelo</Text>
                            <Text className="font-semibold text-gray-800">{equipment.model}</Text>
                        </View>
                        {equipment.btu && (
                            <View className="flex-row justify-between py-2 border-b border-gray-100">
                                <Text className="text-gray-500">Capacidad</Text>
                                <Text className="font-semibold text-gray-800">
                                    {equipment.btu.toLocaleString()} BTU
                                </Text>
                            </View>
                        )}
                        {equipment.location && (
                            <View className="flex-row justify-between py-2 border-b border-gray-100">
                                <Text className="text-gray-500">Ubicación</Text>
                                <Text className="font-semibold text-gray-800">{equipment.location}</Text>
                            </View>
                        )}
                        {equipment.installDate && (
                            <View className="flex-row justify-between py-2">
                                <Text className="text-gray-500">Instalación</Text>
                                <Text className="font-semibold text-gray-800">
                                    {formatDate(equipment.installDate)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Client Info */}
                {client && (
                    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-green-100 p-2 rounded-full mr-3">
                                <Ionicons name="person" size={20} color="#16A34A" />
                            </View>
                            <Text className="text-lg font-bold text-gray-800">Cliente</Text>
                        </View>
                        <Text className="text-xl font-bold text-gray-900 mb-2">{client.name}</Text>
                        {client.phone && (
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="call" size={16} color="#6B7280" />
                                <Text className="text-gray-600 ml-2">{client.phone}</Text>
                            </View>
                        )}
                        {client.address && (
                            <View className="flex-row items-center">
                                <Ionicons name="location" size={16} color="#6B7280" />
                                <Text className="text-gray-600 ml-2">{client.address}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Spacer */}
                <View className="h-24" />
            </ScrollView>

            {/* Floating Action Button - New Service */}
            <TouchableOpacity
                onPress={() => router.push(`/(app)/services/new?equipmentId=${id}`)}
                className="absolute bottom-8 left-6 right-6 bg-blue-600 flex-row items-center justify-center p-4 rounded-2xl shadow-lg"
            >
                <Ionicons name="construct" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-3">Crear Servicio</Text>
            </TouchableOpacity>
        </View>
    );
}
