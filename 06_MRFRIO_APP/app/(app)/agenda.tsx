import { View, Text, TouchableOpacity, FlatList, TextInput, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getClients } from '../../services/clients-service';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'services' | 'clients';

export default function AgendaScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('services');
    const [clients, setClients] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!user) return;
        try {
            const [clientsData, servicesData] = await Promise.all([
                getClients(user.uid),
                import('../../services/services-service').then(mod => mod.getLastServices(user.uid, 50))
            ]);
            setClients(clientsData);
            setServices(servicesData);
        } catch (err) {
            console.error("Error loading data:", err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadData().finally(() => setLoading(false));
        }, [user])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Filter based on search
    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    );

    const filteredServices = services.filter(s =>
        s.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderClient = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(app)/clients/${item.id}`)}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 flex-row items-center"
        >
            <View className="bg-blue-100 w-12 h-12 rounded-2xl justify-center items-center mr-4">
                <Text className="text-blue-600 font-bold text-lg">{item.name?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                {item.phone && <Text className="text-gray-500 text-sm">📞 {item.phone}</Text>}
                {item.address && <Text className="text-gray-400 text-xs" numberOfLines={1}>📍 {item.address}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    const renderService = ({ item }: { item: any }) => {
        const statusColor = item.status === 'Terminado' ? 'bg-green-500' : 'bg-orange-400';
        return (
            <TouchableOpacity
                onPress={() => router.push(`/(app)/services/${item.id}`)}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            >
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center">
                        <View className={`w-2.5 h-2.5 rounded-full ${statusColor} mr-2`} />
                        <Text className="font-bold text-gray-800">{item.type}</Text>
                    </View>
                    <Text className="text-gray-400 text-xs">
                        {item.date?.toDate ?
                            item.date.toDate().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                            : 'Sin fecha'
                        }
                    </Text>
                </View>
                <Text className="text-gray-600 text-sm mb-1">
                    Cliente: {clients.find(c => c.id === item.clientId)?.name || item.clientName || 'N/A'}
                </Text>
                {item.diagnosis?.errorCode && (
                    <View className="bg-red-50 self-start px-2 py-1 rounded-lg mt-1">
                        <Text className="text-red-600 text-xs font-medium">Error: {item.diagnosis.errorCode}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-5 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-800 mb-4">Agenda</Text>

                {/* Search Bar */}
                <View className="flex-row bg-gray-100 rounded-xl px-4 py-3 items-center mb-4">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-800"
                        placeholder={activeTab === 'clients' ? 'Buscar cliente...' : 'Buscar servicio...'}
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tab Switcher */}
                <View className="flex-row bg-gray-100 p-1 rounded-xl">
                    <TouchableOpacity
                        onPress={() => setActiveTab('services')}
                        className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'services' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={activeTab === 'services' ? 'font-bold text-gray-800' : 'text-gray-500'}>
                            Servicios ({services.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('clients')}
                        className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'clients' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={activeTab === 'clients' ? 'font-bold text-gray-800' : 'text-gray-500'}>
                            Clientes ({clients.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 px-4 pt-4">
                {activeTab === 'services' ? (
                    <FlatList
                        data={filteredServices}
                        keyExtractor={item => item.id}
                        renderItem={renderService}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center py-16">
                                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                                <Text className="text-gray-400 text-lg mt-3">No hay servicios</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/(app)/services/new')}
                                    className="bg-blue-600 px-6 py-3 rounded-full mt-4"
                                >
                                    <Text className="text-white font-bold">Crear Servicio</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                ) : (
                    <FlatList
                        data={filteredClients}
                        keyExtractor={item => item.id}
                        renderItem={renderClient}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center py-16">
                                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                                <Text className="text-gray-400 text-lg mt-3">No hay clientes</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/(app)/clients/add')}
                                    className="bg-blue-600 px-6 py-3 rounded-full mt-4 flex-row items-center"
                                >
                                    <Ionicons name="person-add" size={18} color="white" />
                                    <Text className="text-white font-bold ml-2">Agregar Cliente</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </View>

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg"
                onPress={() => router.push(activeTab === 'clients' ? '/(app)/clients/add' : '/(app)/services/new')}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}
