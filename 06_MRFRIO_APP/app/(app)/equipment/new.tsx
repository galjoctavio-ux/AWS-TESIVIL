import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { addEquipment } from '../../../services/equipment-service';
import { getClients, ClientData } from '../../../services/clients-service';
import { Ionicons } from '@expo/vector-icons';

export default function NewEquipment() {
    const { qr_code } = useLocalSearchParams<{ qr_code?: string }>();
    const router = useRouter();
    const { user } = useAuth();

    const [clients, setClients] = useState<(ClientData & { id: string })[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showClientPicker, setShowClientPicker] = useState(false);

    // Form state
    const [selectedClient, setSelectedClient] = useState<(ClientData & { id: string }) | null>(null);
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [btu, setBtu] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        const loadClients = async () => {
            if (!user) return;

            try {
                setLoadingClients(true);
                const clientsData = await getClients(user.uid);
                setClients(clientsData as (ClientData & { id: string })[]);
            } catch (error) {
                console.error('Error loading clients:', error);
            } finally {
                setLoadingClients(false);
            }
        };

        loadClients();
    }, [user]);

    const handleSave = async () => {
        // Validation
        if (!selectedClient) {
            Alert.alert('Error', 'Selecciona un cliente');
            return;
        }
        if (!brand.trim()) {
            Alert.alert('Error', 'Ingresa la marca del equipo');
            return;
        }
        if (!model.trim()) {
            Alert.alert('Error', 'Ingresa el modelo del equipo');
            return;
        }

        try {
            setSaving(true);

            // addEquipment now returns {id, token} - token is the 6-char code for QR
            const { id: equipmentId, token } = await addEquipment({
                qrCode: qr_code || undefined, // Original scanned value (optional reference)
                clientId: selectedClient.id,
                brand: brand.trim(),
                model: model.trim(),
                btu: btu ? parseInt(btu, 10) : undefined,
                location: location.trim() || undefined,
                technicianId: user!.uid,
            });

            Alert.alert(
                '¡Equipo Registrado!',
                `Token QR: ${token.toUpperCase()}\n\nEste código aparecerá en las etiquetas QR del equipo.`,
                [
                    {
                        text: 'Ver Equipo',
                        onPress: () => router.replace(`/(app)/equipment/${equipmentId}`),
                    },
                ]
            );
        } catch (error) {
            console.error('Error saving equipment:', error);
            Alert.alert('Error', 'No se pudo guardar el equipo');
        } finally {
            setSaving(false);
        }
    };


    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white flex-1">Nuevo Equipo</Text>
                </View>
                <Text className="text-blue-100 ml-10">Registrar equipo desde código QR</Text>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                {/* QR Code Badge */}
                <View className="bg-purple-100 border border-purple-200 rounded-2xl p-4 mb-6">
                    <View className="flex-row items-center">
                        <View className="bg-purple-500 p-2 rounded-full mr-3">
                            <Ionicons name="qr-code" size={24} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-purple-800 font-bold">Código QR Detectado</Text>
                            <Text className="text-purple-600 text-sm" numberOfLines={1}>
                                {qr_code || 'No disponible'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Client Selector */}
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Cliente *</Text>
                <TouchableOpacity
                    onPress={() => setShowClientPicker(!showClientPicker)}
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex-row justify-between items-center"
                >
                    {loadingClients ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                    ) : selectedClient ? (
                        <View className="flex-row items-center flex-1">
                            <View className="bg-green-100 p-2 rounded-full mr-3">
                                <Ionicons name="person" size={16} color="#16A34A" />
                            </View>
                            <Text className="text-gray-800 font-medium">{selectedClient.name}</Text>
                        </View>
                    ) : (
                        <Text className="text-gray-400">Seleccionar cliente...</Text>
                    )}
                    <Ionicons
                        name={showClientPicker ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>

                {/* Client Picker Dropdown */}
                {showClientPicker && (
                    <View className="bg-white border border-gray-200 rounded-xl mb-4 max-h-48 overflow-hidden">
                        <ScrollView nestedScrollEnabled>
                            {clients.length === 0 ? (
                                <View className="p-4 items-center">
                                    <Text className="text-gray-400">No hay clientes</Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/(app)/clients/add')}
                                        className="mt-2"
                                    >
                                        <Text className="text-blue-600 font-medium">+ Agregar cliente</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                clients.map((client) => (
                                    <TouchableOpacity
                                        key={client.id}
                                        onPress={() => {
                                            setSelectedClient(client);
                                            setShowClientPicker(false);
                                        }}
                                        className={`p-4 border-b border-gray-100 ${selectedClient?.id === client.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <Text className="text-gray-800">{client.name}</Text>
                                        {client.address && (
                                            <Text className="text-gray-400 text-sm">{client.address}</Text>
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                )}

                {/* Brand */}
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Marca *</Text>
                <TextInput
                    value={brand}
                    onChangeText={setBrand}
                    placeholder="Ej: Carrier, LG, Mirage"
                    placeholderTextColor="#9CA3AF"
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                />

                {/* Model */}
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Modelo *</Text>
                <TextInput
                    value={model}
                    onChangeText={setModel}
                    placeholder="Ej: XPower Inverter"
                    placeholderTextColor="#9CA3AF"
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                />

                {/* BTU */}
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Capacidad (BTU)</Text>
                <TextInput
                    value={btu}
                    onChangeText={setBtu}
                    placeholder="Ej: 12000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                />

                {/* Location */}
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Ubicación</Text>
                <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Ej: Sala, Recámara, Oficina"
                    placeholderTextColor="#9CA3AF"
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-gray-800"
                />

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`bg-blue-600 flex-row items-center justify-center p-4 rounded-2xl shadow-lg mb-8 ${saving ? 'opacity-70' : ''}`}
                >
                    {saving ? (
                        <>
                            <ActivityIndicator color="white" size="small" />
                            <Text className="text-white font-bold text-lg ml-3">Guardando...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="save" size={24} color="white" />
                            <Text className="text-white font-bold text-lg ml-3">Guardar Equipo</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
