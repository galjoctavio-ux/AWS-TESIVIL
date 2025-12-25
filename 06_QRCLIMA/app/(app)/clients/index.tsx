import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useState, useCallback, useMemo } from 'react';
import { getClientsWithStats, ClientWithStats } from '../../../services/clients-service';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../../../components/BottomNav';

type SortOption = 'name' | 'lastService' | 'equipments';
type FilterOption = 'all' | 'active' | 'inactive';

export default function ClientsScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const router = useRouter();

    const [clients, setClients] = useState<ClientWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [showFilters, setShowFilters] = useState(false);

    const loadClients = async () => {
        if (!user) return;
        try {
            const data = await getClientsWithStats(user.uid);
            setClients(data);
        } catch (err) {
            console.error('Error loading clients:', err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadClients().finally(() => setLoading(false));
        }, [user])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadClients();
        setRefreshing(false);
    };

    // Filter and sort clients
    const filteredClients = useMemo(() => {
        let result = [...clients];

        // Search filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase().trim();
            result = result.filter(client =>
                client.name?.toLowerCase().includes(lowerQuery) ||
                client.phone?.toLowerCase().includes(lowerQuery) ||
                client.address?.toLowerCase().includes(lowerQuery)
            );
        }

        // Activity filter
        if (filterBy === 'active') {
            result = result.filter(c => c.stats.activeInLast30Days);
        } else if (filterBy === 'inactive') {
            result = result.filter(c => !c.stats.activeInLast30Days);
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'lastService':
                    const dateA = a.stats.lastServiceDate?.getTime() || 0;
                    const dateB = b.stats.lastServiceDate?.getTime() || 0;
                    return dateB - dateA; // Most recent first
                case 'equipments':
                    return b.stats.totalEquipments - a.stats.totalEquipments;
                default:
                    return 0;
            }
        });

        return result;
    }, [clients, searchQuery, sortBy, filterBy]);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Sin servicios';
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const activeCount = clients.filter(c => c.stats.activeInLast30Days).length;
    const inactiveCount = clients.length - activeCount;

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
            >
                {/* ========================================== */}
                {/* HEADER */}
                {/* ========================================== */}
                <View className="bg-blue-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-blue-200 text-sm">Gestión de</Text>
                            <Text className="text-white text-2xl font-bold">Mis Clientes</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="bg-white/20 px-3 py-1 rounded-full mr-3">
                                <Text className="text-white font-bold">{clients.length}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/(app)/clients/add')}
                                className="bg-white w-10 h-10 rounded-full items-center justify-center"
                            >
                                <Ionicons name="add" size={24} color="#2563EB" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="bg-white/10 rounded-xl flex-row items-center px-4 py-3">
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                        <TextInput
                            className="flex-1 ml-3 text-white"
                            placeholder="Buscar por nombre, teléfono..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ========================================== */}
                {/* FILTER SECTION */}
                {/* ========================================== */}
                <View className="px-4 pt-4">
                    {/* Filter Toggle Button */}
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        className="flex-row items-center justify-between mb-3"
                    >
                        <Text className="text-gray-700 font-bold text-base">
                            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
                            {filterBy !== 'all' && (
                                <Text className="text-gray-400 font-normal">
                                    {' '}• {filterBy === 'active' ? 'Activos' : 'Inactivos'}
                                </Text>
                            )}
                        </Text>
                        <View className="flex-row items-center">
                            <Ionicons
                                name={showFilters ? "chevron-up" : "options-outline"}
                                size={20}
                                color="#6B7280"
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Collapsible Filters */}
                    {showFilters && (
                        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                            {/* Sort By */}
                            <View className="mb-4">
                                <Text className="text-gray-500 text-xs font-bold mb-2">ORDENAR POR</Text>
                                <View className="flex-row gap-2">
                                    {[
                                        { key: 'name', label: 'Nombre', icon: 'text' },
                                        { key: 'lastService', label: 'Último Servicio', icon: 'time' },
                                        { key: 'equipments', label: 'Equipos', icon: 'snow' },
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.key}
                                            onPress={() => setSortBy(option.key as SortOption)}
                                            className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg ${sortBy === option.key ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}
                                        >
                                            <Ionicons
                                                name={option.icon as any}
                                                size={16}
                                                color={sortBy === option.key ? '#2563EB' : '#6B7280'}
                                            />
                                            <Text
                                                className={`ml-1 text-xs font-medium ${sortBy === option.key ? 'text-blue-600' : 'text-gray-600'
                                                    }`}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Filter By Activity */}
                            <View>
                                <Text className="text-gray-500 text-xs font-bold mb-2">FILTRAR POR ACTIVIDAD</Text>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => setFilterBy('all')}
                                        className={`flex-1 py-2 rounded-lg ${filterBy === 'all' ? 'bg-gray-800' : 'bg-gray-100'
                                            }`}
                                    >
                                        <Text className={`text-center text-sm font-medium ${filterBy === 'all' ? 'text-white' : 'text-gray-600'
                                            }`}>
                                            Todos ({clients.length})
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setFilterBy('active')}
                                        className={`flex-1 py-2 rounded-lg ${filterBy === 'active' ? 'bg-green-600' : 'bg-gray-100'
                                            }`}
                                    >
                                        <Text className={`text-center text-sm font-medium ${filterBy === 'active' ? 'text-white' : 'text-gray-600'
                                            }`}>
                                            Activos ({activeCount})
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setFilterBy('inactive')}
                                        className={`flex-1 py-2 rounded-lg ${filterBy === 'inactive' ? 'bg-amber-500' : 'bg-gray-100'
                                            }`}
                                    >
                                        <Text className={`text-center text-sm font-medium ${filterBy === 'inactive' ? 'text-white' : 'text-gray-600'
                                            }`}>
                                            Inactivos ({inactiveCount})
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* ========================================== */}
                {/* CLIENTS LIST */}
                {/* ========================================== */}
                <View className="px-4 pb-32">
                    {loading ? (
                        <View className="items-center py-16">
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text className="text-gray-400 mt-3">Cargando clientes...</Text>
                        </View>
                    ) : filteredClients.length === 0 ? (
                        <View className="items-center py-16 bg-white rounded-2xl border border-gray-100">
                            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                            <Text className="text-gray-500 text-lg font-medium mt-3">
                                {searchQuery ? 'Sin resultados' : 'Sin clientes'}
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mt-1 px-8">
                                {searchQuery
                                    ? `No se encontraron clientes para "${searchQuery}"`
                                    : 'Agrega tu primer cliente para comenzar a gestionar sus equipos y servicios'
                                }
                            </Text>
                            {!searchQuery && (
                                <TouchableOpacity
                                    onPress={() => router.push('/(app)/clients/add')}
                                    className="bg-blue-600 px-6 py-3 rounded-xl mt-4"
                                >
                                    <Text className="text-white font-bold">Agregar Cliente</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        filteredClients.map((client) => (
                            <TouchableOpacity
                                key={client.id}
                                onPress={() => router.push(`/(app)/clients/${client.id}`)}
                                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
                            >
                                <View className="flex-row items-start">
                                    {/* Avatar */}
                                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${client.stats.activeInLast30Days ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                        <Text className="text-lg font-bold text-gray-600">
                                            {client.name?.charAt(0)?.toUpperCase() || '?'}
                                        </Text>
                                    </View>

                                    {/* Info */}
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-gray-800 font-bold text-base" numberOfLines={1}>
                                                {client.name}
                                            </Text>
                                            {client.stats.activeInLast30Days && (
                                                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                                                    <Text className="text-green-700 text-xs font-medium">🔥 Activo</Text>
                                                </View>
                                            )}
                                        </View>

                                        {client.phone && (
                                            <Text className="text-gray-500 text-sm mt-0.5">{client.phone}</Text>
                                        )}

                                        {client.address && (
                                            <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                                                📍 {client.address}
                                            </Text>
                                        )}

                                        {/* Stats Row */}
                                        <View className="flex-row items-center mt-2 gap-3">
                                            {/* Services Count */}
                                            <View className="flex-row items-center">
                                                <View className="bg-blue-100 w-6 h-6 rounded-full items-center justify-center">
                                                    <Ionicons name="construct" size={12} color="#2563EB" />
                                                </View>
                                                <Text className="text-gray-600 text-xs ml-1">
                                                    {client.stats.totalServices} servicio{client.stats.totalServices !== 1 ? 's' : ''}
                                                </Text>
                                            </View>

                                            {/* Equipments Count */}
                                            <View className="flex-row items-center">
                                                <View className="bg-purple-100 w-6 h-6 rounded-full items-center justify-center">
                                                    <Ionicons name="snow" size={12} color="#7C3AED" />
                                                </View>
                                                <Text className="text-gray-600 text-xs ml-1">
                                                    {client.stats.totalEquipments} QR{client.stats.totalEquipments !== 1 ? 's' : ''}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Last Service */}
                                        {client.stats.lastServiceDate && (
                                            <Text className="text-gray-400 text-xs mt-2">
                                                Último: {client.stats.lastServiceType} • {formatDate(client.stats.lastServiceDate)}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Chevron */}
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* FAB - Add Client */}
            <TouchableOpacity
                onPress={() => router.push('/(app)/clients/add')}
                className="absolute right-4 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{
                    bottom: Math.max(insets.bottom, 12) + 100,
                    elevation: 5
                }}
            >
                <Ionicons name="person-add" size={24} color="white" />
            </TouchableOpacity>

            {/* Bottom Navigation */}
            <BottomNav />
        </View>
    );
}
