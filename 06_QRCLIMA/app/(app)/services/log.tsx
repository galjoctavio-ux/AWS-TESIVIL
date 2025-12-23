import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { getRecentServices } from '../../../services/services-service';
import { getClients, ClientData } from '../../../services/clients-service';

export default function ServiceLogScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [recentServices, setRecentServices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [filterDate, setFilterDate] = useState<Date | null>(null);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [recentData, clientsData] = await Promise.all([
                getRecentServices(user.uid, 50), // Limit 50
                getClients(user.uid)
            ]);
            setRecentServices(recentData);
            setClients(clientsData);
        } catch (err) {
            console.error("Error loading service log:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = useMemo(() => {
        let result = [...recentServices];

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(service => {
                const client = clients.find(c => c.id === service.clientId);
                const clientName = client?.name?.toLowerCase() || '';
                const address = client?.address?.toLowerCase() || '';
                const phone = client?.phone?.toString() || '';

                return clientName.includes(query) || address.includes(query) || phone.includes(query);
            });
        }

        // Date Filter
        if (filterDate) {
            result = result.filter(service => {
                // Handle various date formats (Timestamp or string)
                let dateVal = new Date();
                if (service.createdAt?.toDate) dateVal = service.createdAt.toDate();
                else if (service.date?.toDate) dateVal = service.date.toDate();
                else if (service.date) dateVal = new Date(service.date);

                return dateVal.getDate() === filterDate.getDate() &&
                    dateVal.getMonth() === filterDate.getMonth() &&
                    dateVal.getFullYear() === filterDate.getFullYear();
            });
        }

        // Sort
        result.sort((a, b) => {
            // Handle sort by createdAt
            let dateA = 0;
            let dateB = 0;

            if (a.createdAt?.seconds) dateA = a.createdAt.seconds;
            else if (a.createdAt) dateA = new Date(a.createdAt).getTime();

            if (b.createdAt?.seconds) dateB = b.createdAt.seconds;
            else if (b.createdAt) dateB = new Date(b.createdAt).getTime();

            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [recentServices, clients, searchQuery, sortOrder, filterDate]);

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Bitácora de Servicios</Text>
                </View>
            </View>

            <View className="flex-1 px-4 pt-4">
                {/* Search Bar */}
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-3 py-2 mb-3">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-800"
                        placeholder="Buscar cliente, dirección..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters */}
                <View className="flex-row mb-4 space-x-2">
                    <TouchableOpacity
                        onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 mr-2"
                    >
                        <Ionicons name="swap-vertical" size={16} color="#4B5563" />
                        <Text className="text-gray-600 text-xs font-medium ml-1">
                            {sortOrder === 'desc' ? 'Recientes' : 'Antiguos'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowDatePicker(!showDatePicker)}
                        className={`flex-row items-center border rounded-lg px-3 py-1.5 mr-2 ${filterDate ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                    >
                        <Ionicons name="calendar" size={16} color={filterDate ? '#2563EB' : '#4B5563'} />
                        <Text className={`${filterDate ? 'text-blue-600' : 'text-gray-600'} text-xs font-medium ml-1`}>
                            {filterDate ? filterDate.toLocaleDateString() : 'Fecha'}
                        </Text>
                        {filterDate && (
                            <TouchableOpacity onPress={() => setFilterDate(null)} className="ml-1">
                                <Ionicons name="close" size={14} color="#2563EB" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Simple Date Picker (if active) */}
                {showDatePicker && (
                    <View className="flex-row bg-gray-50 p-2 rounded-lg mb-3 flex-wrap">
                        <TouchableOpacity onPress={() => { setFilterDate(new Date()); setShowDatePicker(false); }} className="bg-white border border-gray-200 px-3 py-1 rounded-md mr-2 mb-2">
                            <Text className="text-gray-600 text-xs">Hoy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const d = new Date(); d.setDate(d.getDate() - 1);
                            setFilterDate(d); setShowDatePicker(false);
                        }} className="bg-white border border-gray-200 px-3 py-1 rounded-md mr-2 mb-2">
                            <Text className="text-gray-600 text-xs">Ayer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* List */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {filteredServices.map(service => {
                        const client = clients.find(c => c.id === service.clientId);
                        const infoDate = service.createdAt?.toDate ? service.createdAt.toDate() : new Date(service.createdAt || new Date());

                        return (
                            <TouchableOpacity
                                key={service.id}
                                onPress={() => router.push(`/(app)/services/${service.id}`)}
                                className="bg-white rounded-xl p-3 border border-gray-100 flex-row items-center mb-3 shadow-sm"
                            >
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${service.status === 'Terminado' ? 'bg-green-100' : 'bg-amber-100'}`}>
                                    <Ionicons name={service.type === 'Instalación' ? 'construct' : 'build'} size={20} color={service.status === 'Terminado' ? '#16A34A' : '#D97706'} />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between">
                                        <Text className="font-bold text-gray-800 text-sm">{client?.name || 'Cliente desconocido'}</Text>
                                        <Text className="text-xs text-gray-400">{infoDate.toLocaleDateString()}</Text>
                                    </View>
                                    <Text className="text-xs text-gray-500">{service.type} • {service.status}</Text>
                                    {client?.address && (
                                        <Text className="text-gray-400 text-[10px]" numberOfLines={1}>{client.address}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )
                    })}

                    {filteredServices.length === 0 && (
                        <View className="items-center py-10">
                            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-2">No se encontraron servicios</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
