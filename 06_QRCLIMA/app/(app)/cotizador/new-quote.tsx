import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { getClients, addClient, ClientData } from '../../../services/clients-service';

export default function NewQuoteScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [clients, setClients] = useState<(ClientData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // New client form
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [newClientAddress, setNewClientAddress] = useState('');
    const [saving, setSaving] = useState(false);

    const loadClients = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const loaded = await getClients(user.uid);
            setClients(loaded as (ClientData & { id: string })[]);
        } catch (e) {
            console.error('Error loading clients:', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadClients();
        }, [user])
    );

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.phone && client.phone.includes(searchQuery)) ||
        (client.address && client.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelectClient = (client: ClientData & { id: string }) => {
        router.push({
            pathname: '/(app)/cotizador/select-concepts',
            params: {
                clientId: client.id,
                clientName: client.name,
                clientPhone: client.phone || '',
                clientAddress: client.address || ''
            }
        });
    };

    const handleAddClient = async () => {
        if (!user) return;

        if (!newClientName.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        setSaving(true);
        try {
            const newId = await addClient({
                name: newClientName.trim(),
                phone: newClientPhone.trim() || undefined,
                address: newClientAddress.trim() || undefined,
                technicianId: user.uid
            });

            // Navigate with new client
            router.push({
                pathname: '/(app)/cotizador/select-concepts',
                params: {
                    clientId: newId,
                    clientName: newClientName.trim(),
                    clientPhone: newClientPhone.trim(),
                    clientAddress: newClientAddress.trim()
                }
            });

            setShowAddModal(false);
            // Reset form
            setNewClientName('');
            setNewClientPhone('');
            setNewClientAddress('');
        } catch (error) {
            console.error('Error adding client:', error);
            Alert.alert('Error', 'No se pudo agregar el cliente');
        } finally {
            setSaving(false);
        }
    };

    const renderClient = ({ item }: { item: ClientData & { id: string } }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm flex-row items-center"
            onPress={() => handleSelectClient(item)}
        >
            <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold text-lg">
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View className="flex-1">
                <Text className="font-bold text-gray-800 text-base">{item.name}</Text>
                {item.phone && (
                    <Text className="text-gray-500 text-xs">📞 {item.phone}</Text>
                )}
                {item.address && (
                    <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                        📍 {item.address}
                    </Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Seleccionar Cliente</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-800"
                        placeholder="Buscar cliente..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Quick Add Button */}
            <TouchableOpacity
                className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex-row items-center"
                onPress={() => setShowAddModal(true)}
            >
                <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person-add" size={20} color="#16A34A" />
                </View>
                <Text className="font-bold text-green-700 flex-1">Agregar Cliente Nuevo</Text>
                <Ionicons name="add-circle" size={24} color="#16A34A" />
            </TouchableOpacity>

            {/* Clients List */}
            <View className="flex-1 px-4 pt-4">
                <Text className="text-gray-500 font-medium text-sm mb-3">
                    {filteredClients.length} CLIENTE{filteredClients.length !== 1 ? 'S' : ''}
                    {searchQuery.length > 0 && ' ENCONTRADOS'}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
                ) : (
                    <FlatList
                        data={filteredClients}
                        keyExtractor={item => item.id}
                        renderItem={renderClient}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-16 opacity-60">
                                <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-4 text-center font-medium">
                                    {searchQuery.length > 0
                                        ? 'No se encontraron clientes'
                                        : 'No tienes clientes registrados'
                                    }
                                </Text>
                                <Text className="text-gray-400 text-xs text-center mt-1">
                                    {searchQuery.length === 0 && 'Agrega tu primer cliente para crear una cotización'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Add Client Modal */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-gray-800">Nuevo Cliente</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-600 font-medium mb-2">Nombre *</Text>
                            <TextInput
                                className="bg-gray-100 p-4 rounded-xl text-gray-800"
                                placeholder="Nombre del cliente"
                                value={newClientName}
                                onChangeText={setNewClientName}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-600 font-medium mb-2">Teléfono</Text>
                            <TextInput
                                className="bg-gray-100 p-4 rounded-xl text-gray-800"
                                placeholder="10 dígitos"
                                value={newClientPhone}
                                onChangeText={setNewClientPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-gray-600 font-medium mb-2">Dirección</Text>
                            <TextInput
                                className="bg-gray-100 p-4 rounded-xl text-gray-800"
                                placeholder="Calle, número, colonia..."
                                value={newClientAddress}
                                onChangeText={setNewClientAddress}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleAddClient}
                            disabled={saving}
                            className={`py-4 rounded-xl ${saving ? 'bg-gray-400' : 'bg-green-600'}`}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg">
                                    Agregar y Continuar
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
