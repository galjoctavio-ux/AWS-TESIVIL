import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { getClientById, updateClient, getClientServices, getClientEquipments, ClientData } from '../../../services/clients-service';
import { ServiceData } from '../../../services/services-service';
import { EquipmentData } from '../../../services/equipment-service';
import { Ionicons } from '@expo/vector-icons';

export default function ClientProfile() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();

    const [client, setClient] = useState<(ClientData & { id: string }) | null>(null);
    const [services, setServices] = useState<(ServiceData & { id: string })[]>([]);
    const [equipments, setEquipments] = useState<(EquipmentData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editNotes, setEditNotes] = useState('');

    // Active tab
    const [activeTab, setActiveTab] = useState<'info' | 'history' | 'equipments'>('info');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id || !user) return;
        setLoading(true);
        try {
            const [clientData, servicesData, equipmentsData] = await Promise.all([
                getClientById(id),
                getClientServices(id, user.uid),
                getClientEquipments(id)
            ]);

            if (clientData) {
                setClient(clientData);
                setEditName(clientData.name);
                setEditPhone(clientData.phone || '');
                setEditAddress(clientData.address || '');
                setEditNotes(clientData.notes || '');
            }
            setServices(servicesData as (ServiceData & { id: string })[]);
            setEquipments(equipmentsData as (EquipmentData & { id: string })[]);
        } catch (error) {
            console.error('Error loading client:', error);
            Alert.alert('Error', 'No se pudo cargar el cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!client || !editName.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        setSaving(true);
        try {
            await updateClient(client.id, {
                name: editName,
                phone: editPhone,
                address: editAddress,
                notes: editNotes,
            });
            setClient({
                ...client,
                name: editName,
                phone: editPhone,
                address: editAddress,
                notes: editNotes,
            });
            setIsEditing(false);
            Alert.alert('Éxito', 'Cliente actualizado correctamente');
        } catch (error) {
            console.error('Error saving client:', error);
            Alert.alert('Error', 'No se pudo guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleCall = () => {
        if (client?.phone) {
            Linking.openURL(`tel:${client.phone}`);
        }
    };

    const handleWhatsApp = () => {
        if (client?.phone) {
            const cleanPhone = client.phone.replace(/\D/g, '');
            Linking.openURL(`whatsapp://send?phone=52${cleanPhone}`);
        }
    };

    const handleMaps = () => {
        if (client?.address) {
            const encodedAddress = encodeURIComponent(client.address);
            Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'Fecha desconocida';
        if (date.toDate) return date.toDate().toLocaleDateString('es-MX');
        return new Date(date).toLocaleDateString('es-MX');
    };

    const getServiceTypeColor = (type: string) => {
        switch (type) {
            case 'Reparación': return 'border-red-500';
            case 'Mantenimiento': return 'border-blue-500';
            case 'Instalación': return 'border-green-500';
            default: return 'border-gray-500';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!client) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center p-6">
                <Ionicons name="person-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg mt-4">Cliente no encontrado</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-blue-600 px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-[30px]">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-blue-100 text-sm">Expediente del Cliente</Text>
                        <Text className="text-2xl font-bold text-white">{client.name}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsEditing(!isEditing)}
                        className="bg-blue-500/50 p-2 rounded-full"
                    >
                        <Ionicons name={isEditing ? "close" : "create-outline"} size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={handleCall}
                        disabled={!client.phone}
                        className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${client.phone ? 'bg-white' : 'bg-blue-400'}`}
                    >
                        <Ionicons name="call" size={20} color={client.phone ? "#2563EB" : "#93C5FD"} />
                        <Text className={`ml-2 font-bold ${client.phone ? 'text-blue-600' : 'text-blue-300'}`}>Llamar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleWhatsApp}
                        disabled={!client.phone}
                        className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${client.phone ? 'bg-white' : 'bg-blue-400'}`}
                    >
                        <Ionicons name="logo-whatsapp" size={20} color={client.phone ? "#16A34A" : "#93C5FD"} />
                        <Text className={`ml-2 font-bold ${client.phone ? 'text-green-600' : 'text-blue-300'}`}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleMaps}
                        disabled={!client.address}
                        className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${client.address ? 'bg-white' : 'bg-blue-400'}`}
                    >
                        <Ionicons name="map" size={20} color={client.address ? "#EA580C" : "#93C5FD"} />
                        <Text className={`ml-2 font-bold ${client.address ? 'text-orange-600' : 'text-blue-300'}`}>Mapa</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row px-6 pt-4">
                <TouchableOpacity
                    onPress={() => setActiveTab('info')}
                    className={`flex-1 py-2 rounded-t-xl ${activeTab === 'info' ? 'bg-white' : 'bg-gray-200'}`}
                >
                    <Text className={`text-center font-bold text-xs ${activeTab === 'info' ? 'text-blue-600' : 'text-gray-500'}`}>
                        Datos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('history')}
                    className={`flex-1 py-2 rounded-t-xl ${activeTab === 'history' ? 'bg-white' : 'bg-gray-200'}`}
                >
                    <Text className={`text-center font-bold text-xs ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500'}`}>
                        Servicios ({services.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('equipments')}
                    className={`flex-1 py-2 rounded-t-xl ${activeTab === 'equipments' ? 'bg-white' : 'bg-gray-200'}`}
                >
                    <Text className={`text-center font-bold text-xs ${activeTab === 'equipments' ? 'text-purple-600' : 'text-gray-500'}`}>
                        Equipos ({equipments.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-6 bg-white mx-6 rounded-b-xl mb-24" showsVerticalScrollIndicator={false}>
                {activeTab === 'info' ? (
                    <View className="py-4">
                        {isEditing ? (
                            // Edit Form
                            <View className="space-y-4">
                                <View>
                                    <Text className="text-sm font-bold text-gray-700 mb-2">Nombre *</Text>
                                    <TextInput
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
                                        value={editName}
                                        onChangeText={setEditName}
                                    />
                                </View>
                                <View className="mt-4">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">Teléfono</Text>
                                    <TextInput
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
                                        value={editPhone}
                                        onChangeText={setEditPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                <View className="mt-4">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">Dirección</Text>
                                    <TextInput
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 h-20"
                                        value={editAddress}
                                        onChangeText={setEditAddress}
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>
                                <View className="mt-4">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">Notas Fijas</Text>
                                    <TextInput
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 h-24"
                                        value={editNotes}
                                        onChangeText={setEditNotes}
                                        multiline
                                        textAlignVertical="top"
                                        placeholder="Ej: Timbre no sirve, Cliente exigente..."
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={saving}
                                    className={`mt-6 w-full py-4 rounded-xl ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white text-center font-bold text-lg">Guardar Cambios</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // View Mode
                            <View className="space-y-4">
                                <View className="flex-row items-center py-3 border-b border-gray-100">
                                    <View className="bg-blue-100 p-2 rounded-full mr-3">
                                        <Ionicons name="person" size={20} color="#2563EB" />
                                    </View>
                                    <View>
                                        <Text className="text-xs text-gray-500">Nombre</Text>
                                        <Text className="text-lg font-bold text-gray-800">{client.name}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center py-3 border-b border-gray-100">
                                    <View className="bg-green-100 p-2 rounded-full mr-3">
                                        <Ionicons name="call" size={20} color="#16A34A" />
                                    </View>
                                    <View>
                                        <Text className="text-xs text-gray-500">Teléfono</Text>
                                        <Text className="text-lg text-gray-800">{client.phone || 'No registrado'}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center py-3 border-b border-gray-100">
                                    <View className="bg-orange-100 p-2 rounded-full mr-3">
                                        <Ionicons name="location" size={20} color="#EA580C" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs text-gray-500">Dirección</Text>
                                        <Text className="text-lg text-gray-800">{client.address || 'No registrada'}</Text>
                                    </View>
                                </View>

                                {client.notes && (
                                    <View className="py-3 bg-yellow-50 rounded-xl p-4 mt-2">
                                        <View className="flex-row items-center mb-2">
                                            <Ionicons name="alert-circle" size={18} color="#CA8A04" />
                                            <Text className="text-sm font-bold text-yellow-700 ml-2">Notas Importantes</Text>
                                        </View>
                                        <Text className="text-gray-700">{client.notes}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                ) : activeTab === 'history' ? (
                    // History Tab
                    <View className="py-4">
                        {services.length === 0 ? (
                            <View className="items-center py-10">
                                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">Sin servicios registrados</Text>
                                <Text className="text-gray-400 text-sm">Los servicios para este cliente aparecerán aquí</Text>
                            </View>
                        ) : (
                            services.map((service) => (
                                <TouchableOpacity
                                    key={service.id}
                                    onPress={() => router.push(`/(app)/services/${service.id}`)}
                                    className={`bg-gray-50 p-4 rounded-xl mb-3 border-l-4 ${getServiceTypeColor(service.type)}`}
                                >
                                    <View className="flex-row justify-between items-start mb-2">
                                        <Text className="text-lg font-bold text-gray-800">{service.type}</Text>
                                        <Text className={`text-xs px-2 py-1 rounded-full ${service.status === 'Terminado'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {service.status}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-sm">{formatDate(service.date || service.createdAt)}</Text>
                                    {service.diagnosis && (
                                        <View className="mt-2 bg-red-50 p-2 rounded-lg">
                                            <Text className="text-red-600 text-sm font-medium">
                                                Error: {service.diagnosis.errorCode}
                                            </Text>
                                            <Text className="text-red-500 text-xs" numberOfLines={2}>
                                                {service.diagnosis.description}
                                            </Text>
                                        </View>
                                    )}
                                    {service.notes && (
                                        <Text className="text-gray-500 text-sm mt-2 italic" numberOfLines={2}>
                                            "{service.notes}"
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                ) : (
                    // Equipments Tab
                    <View className="py-4">
                        {equipments.length === 0 ? (
                            <View className="items-center py-10">
                                <Ionicons name="snow-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">Sin equipos registrados</Text>
                                <Text className="text-gray-400 text-sm text-center px-4">
                                    Los equipos con QR activo para este cliente aparecerán aquí
                                </Text>
                            </View>
                        ) : (
                            equipments.map((equipment) => (
                                <TouchableOpacity
                                    key={equipment.id}
                                    onPress={() => router.push(`/(app)/equipment/${equipment.id}`)}
                                    className="bg-gray-50 p-4 rounded-xl mb-3 border-l-4 border-purple-500"
                                >
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View className="flex-1">
                                            <Text className="text-lg font-bold text-gray-800">{equipment.brand}</Text>
                                            <Text className="text-gray-600 text-sm">{equipment.model}</Text>
                                        </View>
                                        <View className="bg-purple-100 px-2 py-1 rounded-full">
                                            <Text className="text-purple-700 text-xs font-bold">
                                                🔗 {equipment.token}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center gap-4 mt-2">
                                        {equipment.btu && (
                                            <View className="flex-row items-center">
                                                <Ionicons name="thermometer" size={14} color="#6B7280" />
                                                <Text className="text-gray-500 text-xs ml-1">{equipment.btu} BTU</Text>
                                            </View>
                                        )}
                                        {equipment.location && (
                                            <View className="flex-row items-center flex-1">
                                                <Ionicons name="location" size={14} color="#6B7280" />
                                                <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>{equipment.location}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {equipment.lastServiceDate && (
                                        <Text className="text-gray-400 text-xs mt-2">
                                            Último servicio: {formatDate(equipment.lastServiceDate)}
                                        </Text>
                                    )}

                                    {equipment.warrantyExpirationDate && (
                                        <View className="mt-2 bg-green-50 p-2 rounded-lg flex-row items-center">
                                            <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
                                            <Text className="text-green-600 text-xs ml-1">
                                                Garantía hasta: {formatDate(equipment.warrantyExpirationDate)}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button - New Service */}
            <TouchableOpacity
                onPress={() => router.push({ pathname: '/(app)/services/new', params: { clientId: client.id } })}
                className="absolute bottom-8 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg"
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}
