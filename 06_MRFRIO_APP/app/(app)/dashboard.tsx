import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, ScrollView, Animated, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import { getClients } from '../../services/clients-service';
import { getUserProfile, UserProfile, UserRank } from '../../services/user-service';
import { Ionicons } from '@expo/vector-icons';

// Helper to get rank display info
const getRankInfo = (rank: UserRank | undefined) => {
    switch (rank) {
        case 'Pro':
            return { icon: '🥇', label: 'Especialista Certificado', color: 'bg-gradient-to-r from-yellow-400 to-amber-500', textColor: 'text-yellow-700' };
        case 'Técnico':
            return { icon: '🛡️', label: 'Técnico Profesional', color: 'bg-blue-500', textColor: 'text-blue-700' };
        default:
            return { icon: '✅', label: 'Miembro Verificado', color: 'bg-gray-500', textColor: 'text-gray-600' };
    }
};

// Module definitions for the grid
const MODULES = [
    // Row 1: Primary Actions
    { id: 'new-service', icon: 'construct', label: 'Nuevo Servicio', route: '/(app)/services/new', color: 'bg-blue-600', iconBg: 'bg-blue-500' },
    { id: 'quotes', icon: 'document-text', label: 'Cotizador Pro', route: '/(app)/quotes', color: 'bg-green-600', iconBg: 'bg-green-500' },
    { id: 'cotizador-free', icon: 'create', label: 'Cotizador Free', route: '/(app)/cotizador', color: 'bg-emerald-500', iconBg: 'bg-emerald-400' },
    // Row 2: Tools
    { id: 'btu', icon: 'calculator', label: 'Calc BTU', route: '/(app)/tools/btu-calculator', color: 'bg-purple-600', iconBg: 'bg-purple-500' },
    { id: 'cables', icon: 'flash', label: 'Guía Cables', route: '/(app)/tools/cable-guide', color: 'bg-yellow-500', iconBg: 'bg-yellow-400' },
    { id: 'pt-table', icon: 'thermometer', label: 'Tabla P-T', route: '/(app)/tools/pt-table', color: 'bg-cyan-600', iconBg: 'bg-cyan-500' },
    { id: 'errors', icon: 'warning', label: 'Códigos Error', route: '/(app)/library', color: 'bg-red-500', iconBg: 'bg-red-400' },
    // Row 3: Business
    { id: 'scanner', icon: 'qr-code', label: 'Escanear QR', route: '/(app)/scanner', color: 'bg-indigo-600', iconBg: 'bg-indigo-500' },
    { id: 'store', icon: 'storefront', label: 'Tienda', route: '/(app)/store', color: 'bg-pink-600', iconBg: 'bg-pink-500' },
];

const BOTTOM_MODULES = [
    { id: 'community', icon: 'people', label: 'Comunidad SOS', sublabel: 'Pide ayuda a otros técnicos', route: '/(app)/community', gradient: ['#6366F1', '#8B5CF6'] },
    { id: 'training', icon: 'school', label: 'Capacitación', sublabel: 'Aprende y gana tokens', route: '/(app)/training', gradient: ['#059669', '#10B981'] },
];

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [upcomingServices, setUpcomingServices] = useState<any[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'clients'>('overview');

    // Animation
    const scrollY = useRef(new Animated.Value(0)).current;

    const loadData = async () => {
        if (!user) return;

        try {
            const [clientsData, servicesData, upcomingData, profileData] = await Promise.all([
                getClients(user.uid),
                import('../../services/services-service').then(mod => mod.getLastServices(user.uid)),
                import('../../services/services-service').then(mod => mod.getUpcomingServices(user.uid)),
                getUserProfile(user.uid)
            ]);
            setClients(clientsData);
            setServices(servicesData);
            setUpcomingServices(upcomingData);
            setProfile(profileData);
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

    const rankInfo = getRankInfo(profile?.rank);
    const displayName = profile?.alias || profile?.businessName || 'Técnico';
    const completenessScore = profile?.profileCompletenessScore || 0;
    const tokenBalance = profile?.tokenBalance || 0;

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Render Functions
    const renderModuleCard = (mod: typeof MODULES[0], index: number) => (
        <TouchableOpacity
            key={mod.id}
            onPress={() => router.push(mod.route as any)}
            className={`${mod.color} rounded-2xl p-4 flex-1 mx-1 min-w-[100px] shadow-md active:opacity-90`}
            style={{ minHeight: 90 }}
        >
            <View className={`${mod.iconBg} w-10 h-10 rounded-xl items-center justify-center mb-2`}>
                <Ionicons name={mod.icon as any} size={22} color="white" />
            </View>
            <Text className="text-white font-semibold text-xs" numberOfLines={2}>{mod.label}</Text>
        </TouchableOpacity>
    );

    const renderUpcomingService = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(app)/services/${item.id}`)}
            className="bg-white rounded-2xl p-4 mr-3 w-72 shadow-sm border border-gray-100"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-2 ${item.status === 'Terminado' ? 'bg-green-500' : 'bg-orange-400'}`} />
                    <Text className="font-bold text-gray-800">{item.type}</Text>
                </View>
                <Text className="text-xs text-gray-400">
                    {item.date?.toDate ? item.date.toDate().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : 'Sin fecha'}
                </Text>
            </View>
            <Text className="text-gray-600 text-sm mb-1" numberOfLines={1}>
                {clients.find(c => c.id === item.clientId)?.name || 'Cliente'}
            </Text>
            {item.diagnosis && (
                <View className="bg-red-50 px-2 py-1 rounded-lg mt-2 self-start">
                    <Text className="text-xs text-red-600 font-medium">Error: {item.diagnosis.errorCode}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderClient = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(app)/clients/${item.id}`)}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50 flex-row items-center"
        >
            <View className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-2xl justify-center items-center mr-4 shadow-sm">
                <Text className="text-white font-bold text-lg">{item.name?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View className="flex-1">
                <Text className="font-bold text-lg text-gray-800">{item.name}</Text>
                {item.phone && <Text className="text-gray-500 text-sm">📞 {item.phone}</Text>}
                {item.address && <Text className="text-gray-400 text-xs" numberOfLines={1}>📍 {item.address}</Text>}
            </View>
            <View className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-400 mt-4">Cargando tu taller...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
            >
                {/* Premium Header */}
                <View className="bg-blue-600 pt-12 pb-8 px-5">
                    {/* Top Bar */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-blue-200 text-sm">Bienvenido de vuelta</Text>
                            <Text className="text-white text-2xl font-bold">{displayName}</Text>
                        </View>
                        <View className="flex-row items-center">
                            {/* Wallet Button */}
                            <TouchableOpacity
                                onPress={() => router.push('/(app)/wallet')}
                                className="bg-white/20 px-4 py-2 rounded-full flex-row items-center mr-3"
                            >
                                <Text className="text-yellow-300 mr-1">🪙</Text>
                                <Text className="text-white font-bold">{tokenBalance}</Text>
                            </TouchableOpacity>
                            {/* Profile */}
                            <TouchableOpacity
                                onPress={() => router.push('/(app)/profile')}
                                className="bg-blue-500 w-12 h-12 rounded-full items-center justify-center border-2 border-white/30"
                            >
                                <Text className="text-white text-lg font-bold">{displayName.charAt(0).toUpperCase()}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Rank & Progress Card */}
                    <View className="bg-white/10 rounded-2xl p-4 mb-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <Text className="text-2xl mr-2">{rankInfo.icon}</Text>
                                <View>
                                    <Text className="text-white font-semibold">{rankInfo.label}</Text>
                                    <Text className="text-blue-200 text-xs">Perfil {completenessScore}% completo</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={signOut}
                                className="bg-white/10 p-2 rounded-full"
                            >
                                <Ionicons name="log-out-outline" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                        {/* Progress Bar */}
                        <View className="mt-3 h-2 bg-blue-400/30 rounded-full overflow-hidden">
                            <View className="h-full bg-white rounded-full" style={{ width: `${completenessScore}%` }} />
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
                            <Text className="text-white text-2xl font-bold">{profile?.stats?.servicesCount || services.length}</Text>
                            <Text className="text-blue-200 text-xs">Servicios</Text>
                        </View>
                        <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
                            <Text className="text-white text-2xl font-bold">{clients.length}</Text>
                            <Text className="text-blue-200 text-xs">Clientes</Text>
                        </View>
                        <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
                            <Text className="text-white text-2xl font-bold">{profile?.stats?.qrsActive || 0}</Text>
                            <Text className="text-blue-200 text-xs">QRs Activos</Text>
                        </View>
                    </View>
                </View>

                {/* Modules Grid - Overlapping Header */}
                <View className="px-4 -mt-4">
                    {/* Primary Actions Row - 3 items */}
                    <View className="flex-row mb-3">
                        {MODULES.slice(0, 3).map((mod, i) => renderModuleCard(mod, i))}
                    </View>
                    {/* Tools Row */}
                    <View className="flex-row mb-3">
                        {MODULES.slice(3, 7).map((mod, i) => renderModuleCard(mod, i))}
                    </View>
                    {/* Business Row */}
                    <View className="flex-row mb-4">
                        {MODULES.slice(7, 9).map((mod, i) => renderModuleCard(mod, i))}
                    </View>
                </View>

                {/* Special Modules (Community & Training) */}
                <View className="px-4 mb-4">
                    {BOTTOM_MODULES.map(mod => (
                        <TouchableOpacity
                            key={mod.id}
                            onPress={() => router.push(mod.route as any)}
                            className="rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
                            style={{ backgroundColor: mod.gradient[0] }}
                        >
                            <View className="bg-white/20 p-3 rounded-xl mr-4">
                                <Ionicons name={mod.icon as any} size={28} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-lg">{mod.label}</Text>
                                <Text className="text-white/70 text-sm">{mod.sublabel}</Text>
                            </View>
                            <View className="bg-white/20 p-2 rounded-full">
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Switcher */}
                <View className="px-4 mb-3">
                    <View className="flex-row bg-gray-100 p-1 rounded-xl">
                        <TouchableOpacity
                            onPress={() => setActiveTab('overview')}
                            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'overview' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={activeTab === 'overview' ? 'font-bold text-gray-800' : 'text-gray-500'}>
                                Resumen
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

                {activeTab === 'overview' ? (
                    <View className="px-4 pb-24">
                        {/* Upcoming Services */}
                        <View className="mb-6">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-lg font-bold text-gray-800">Agenda</Text>
                                <TouchableOpacity>
                                    <Text className="text-blue-600 text-sm font-medium">Ver todo</Text>
                                </TouchableOpacity>
                            </View>
                            {upcomingServices.length > 0 ? (
                                <FlatList
                                    data={upcomingServices}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.id}
                                    renderItem={renderUpcomingService}
                                />
                            ) : (
                                <View className="bg-white p-6 rounded-2xl items-center border border-gray-100">
                                    <Ionicons name="calendar-outline" size={36} color="#D1D5DB" />
                                    <Text className="text-gray-400 mt-2 text-center">No tienes servicios pendientes</Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/(app)/services/new')}
                                        className="bg-blue-600 px-5 py-2 rounded-full mt-4"
                                    >
                                        <Text className="text-white font-medium">Crear Servicio</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Recent Services */}
                        {services.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-lg font-bold text-gray-800 mb-3">Historial Reciente</Text>
                                <FlatList
                                    data={services.slice(0, 5)}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.id}
                                    renderItem={renderUpcomingService}
                                />
                            </View>
                        )}

                        {/* Recent Clients Quick View */}
                        <View>
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-lg font-bold text-gray-800">Clientes Recientes</Text>
                                <TouchableOpacity onPress={() => setActiveTab('clients')}>
                                    <Text className="text-blue-600 text-sm font-medium">Ver todos</Text>
                                </TouchableOpacity>
                            </View>
                            {clients.slice(0, 3).map(client => (
                                <View key={client.id}>{renderClient({ item: client })}</View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="px-4 pb-24">
                        {/* Search Bar */}
                        <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-3 items-center mb-4">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-2 text-gray-800"
                                placeholder="Buscar por nombre o dirección..."
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

                        {/* Clients List */}
                        {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                                <View key={client.id}>{renderClient({ item: client })}</View>
                            ))
                        ) : (
                            <View className="items-center py-10">
                                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                                <Text className="text-gray-400 text-lg mt-3">No se encontraron clientes</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/(app)/clients/add')}
                                    className="bg-blue-600 px-6 py-3 rounded-full mt-4 flex-row items-center"
                                >
                                    <Ionicons name="person-add" size={18} color="white" />
                                    <Text className="text-white font-bold ml-2">Agregar Cliente</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-16 h-16 rounded-full justify-center items-center shadow-xl"
                style={{ elevation: 8 }}
                onPress={() => router.push('/(app)/services/new')}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
