import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getClients } from '../../services/clients-service';
import { getUserProfile, UserProfile, UserRank } from '../../services/user-service';
import { Ionicons } from '@expo/vector-icons';

// Helper to get rank display info
const getRankInfo = (rank: UserRank | undefined) => {
    switch (rank) {
        case 'Pro':
            return { icon: '🥇', label: 'Especialista', color: 'bg-yellow-100 text-yellow-700' };
        case 'Técnico':
            return { icon: '🛡️', label: 'Profesional', color: 'bg-blue-100 text-blue-700' };
        default:
            return { icon: '✅', label: 'Verificado', color: 'bg-gray-100 text-gray-600' };
    }
};

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [upcomingServices, setUpcomingServices] = useState<any[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            setLoading(true);

            // Parallel fetch: clients, services, upcoming, and user profile
            Promise.all([
                getClients(user.uid),
                import('../../services/services-service').then(mod => mod.getLastServices(user.uid)),
                import('../../services/services-service').then(mod => mod.getUpcomingServices(user.uid)),
                getUserProfile(user.uid)
            ])
                .then(([clientsData, servicesData, upcomingData, profileData]) => {
                    setClients(clientsData);
                    setServices(servicesData);
                    setUpcomingServices(upcomingData);
                    setProfile(profileData);
                })
                .catch(err => {
                    console.error("Error loading data:", err);
                })
                .finally(() => setLoading(false));
        }, [user])
    );

    const rankInfo = getRankInfo(profile?.rank);
    const displayName = profile?.alias || profile?.businessName || 'Técnico';
    const completenessScore = profile?.profileCompletenessScore || 0;

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderClient = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(app)/clients/${item.id}`)}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 active:bg-gray-50"
        >
            <View className="flex-row items-center">
                <View className="bg-blue-100 w-10 h-10 rounded-full justify-center items-center mr-3">
                    <Text className="text-blue-600 font-bold text-lg">{item.name?.charAt(0)?.toUpperCase()}</Text>
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-800">{item.name}</Text>
                    {item.phone && <Text className="text-gray-500 text-sm">📞 {item.phone}</Text>}
                    {item.address && <Text className="text-gray-400 text-xs" numberOfLines={1}>📍 {item.address}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    const renderService = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(app)/services/${item.id}`)}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border-l-4 border-blue-500 mr-3 w-72"
        >
            <View className="flex-row justify-between mb-1">
                <Text className="font-bold text-gray-800">{item.type}</Text>
                <Text className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'Terminado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.status}
                </Text>
            </View>
            <Text className="text-gray-500 text-sm mb-1">Cliente: {clients.find(c => c.id === item.clientId)?.name || 'Cargando...'}</Text>
            {item.diagnosis && (
                <Text className="text-xs text-red-500 font-medium">Error: {item.diagnosis.errorCode}</Text>
            )}
            <Text className="text-gray-400 text-xs mt-2">{item.date?.toDate ? item.date.toDate().toLocaleDateString() : 'Fecha desconocida'}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header with Professional Profile Widget */}
            <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg relative">

                {/* Logout Button (Top Right) */}
                <TouchableOpacity
                    onPress={signOut}
                    className="absolute top-12 right-6 bg-white/20 p-2 rounded-full z-10"
                >
                    <Ionicons name="log-out-outline" size={20} color="white" />
                </TouchableOpacity>

                {/* Profile Header */}
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                        <Text className="text-blue-100 font-medium">Mi Taller</Text>
                        <Text className="text-2xl font-bold text-white max-w-[80%]">Hola, {displayName}</Text>

                        {/* Rank Badge */}
                        <View className="flex-row items-center mt-2">
                            <View className={`flex-row items-center px-3 py-1 rounded-full ${rankInfo.color}`}>
                                <Text className="mr-1">{rankInfo.icon}</Text>
                                <Text className="text-xs font-medium">{rankInfo.label}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Profile Circle with Progress */}
                    <View className="items-center mr-8">
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/profile')}
                            className="bg-blue-500/50 w-14 h-14 rounded-full justify-center items-center border-2 border-white"
                        >
                            <Text className="text-white text-xl font-bold">{displayName.charAt(0).toUpperCase()}</Text>
                        </TouchableOpacity>
                        {/* Mini Progress Bar */}
                        <View className="mt-2 w-14 h-1.5 bg-blue-400 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${completenessScore}%` }}
                            />
                        </View>
                        <Text className="text-blue-200 text-xs mt-1">{completenessScore}%</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View className="flex-row bg-blue-500/30 rounded-xl p-3 mb-4">
                    <View className="flex-1 items-center">
                        <Text className="text-white text-xl font-bold">{profile?.stats?.servicesCount || services.length}</Text>
                        <Text className="text-blue-200 text-xs">Servicios</Text>
                    </View>
                    <View className="w-px bg-blue-400" />
                    <View className="flex-1 items-center">
                        <Text className="text-white text-xl font-bold">{clients.length}</Text>
                        <Text className="text-blue-200 text-xs">Clientes</Text>
                    </View>
                    <View className="w-px bg-blue-400" />
                    <View className="flex-1 items-center">
                        <Text className="text-white text-xl font-bold">{profile?.stats?.qrsActive || 0}</Text>
                        <Text className="text-blue-200 text-xs">QRs Activos</Text>
                    </View>
                </View>

                {/* Quick Actions: New Service & New Quote */}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/services/new')}
                        className="bg-white flex-1 flex-row items-center justify-center p-4 rounded-2xl shadow-lg"
                    >
                        <View className="bg-blue-100 p-2 rounded-full mr-2">
                            <Ionicons name="construct" size={20} color="#2563EB" />
                        </View>
                        <Text className="text-blue-600 font-bold">Servicio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/quotes')}
                        className="bg-white flex-1 flex-row items-center justify-center p-4 rounded-2xl shadow-lg"
                    >
                        <View className="bg-green-100 p-2 rounded-full mr-2">
                            <Ionicons name="document-text" size={20} color="#16A34A" />
                        </View>
                        <Text className="text-green-600 font-bold">Cotizaciones</Text>
                    </TouchableOpacity>
                </View>

                {/* Secondary Actions Row */}
                <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/tools/btu-calculator')}
                        className="bg-white/20 flex-1 flex-row items-center justify-center p-3 rounded-xl"
                    >
                        <Ionicons name="calculator" size={16} color="white" />
                        <Text className="text-white font-medium ml-1 text-xs">BTU</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/tools/cable-guide')}
                        className="bg-white/20 flex-1 flex-row items-center justify-center p-3 rounded-xl"
                    >
                        <Ionicons name="flash" size={16} color="white" />
                        <Text className="text-white font-medium ml-1 text-xs">Cables</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/library')}
                        className="bg-white/20 flex-1 flex-row items-center justify-center p-3 rounded-xl"
                    >
                        <Ionicons name="warning" size={16} color="white" />
                        <Text className="text-white font-medium ml-1 text-xs">Errores</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 p-6">

                {/* Active Agenda Section */}
                <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-800 mb-3">Agenda Activa</Text>
                    {upcomingServices.length > 0 ? (
                        <FlatList
                            data={upcomingServices}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            renderItem={renderService}
                        />
                    ) : (
                        <View className="bg-white p-4 rounded-xl border border-gray-100 flex-row items-center">
                            <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
                            <Text className="text-gray-400 ml-3">No tienes servicios programados hoy.</Text>
                        </View>
                    )}
                </View>

                {/* Training Widget */}
                <TouchableOpacity
                    onPress={() => router.push('/(app)/training')}
                    className="bg-indigo-600 rounded-xl p-4 mb-6 flex-row items-center shadow-md"
                >
                    <View className="bg-white/10 p-3 rounded-full mr-4">
                        <Ionicons name="school" size={32} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-lg">Capacitación Ligera</Text>
                        <Text className="text-indigo-100 text-sm">Mejora tus habilidades y gana tokens</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>

                {/* Active Services Section (Recent) */}
                {services.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-xl font-bold text-gray-800 mb-3">Historial Reciente</Text>
                        <FlatList
                            data={services}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            renderItem={renderService}
                        />
                    </View>
                )}

                <View className="mb-4">
                    <View className="flex-row justify-between items-baseline mb-2">
                        <Text className="text-xl font-bold text-gray-800">Mis Clientes</Text>
                        <Text className="text-sm text-gray-400">{filteredClients.length} Filtrados</Text>
                    </View>
                    {/* Search Bar */}
                    <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-3 items-center">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2 text-gray-800"
                            placeholder="Buscar por nombre o dirección..."
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

                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
                ) : (
                    <FlatList
                        data={filteredClients}
                        keyExtractor={item => item.id}
                        renderItem={renderClient}
                        ListEmptyComponent={
                            <View className="items-center mt-10">
                                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-400 text-lg mt-3">No se encontraron clientes</Text>
                                <Text className="text-gray-400 text-sm">Intenta otra búsqueda o agrega uno nuevo</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Floating Action Buttons */}
            <View className="absolute bottom-8 right-6 left-6 flex-row justify-between">
                {/* Scanner Button */}
                <TouchableOpacity
                    className="bg-cyan-500 w-14 h-14 rounded-full justify-center items-center shadow-lg"
                    onPress={() => router.push('/(app)/scanner')}
                >
                    <Ionicons name="qr-code" size={24} color="white" />
                </TouchableOpacity>

                {/* Add Client Button */}
                <TouchableOpacity
                    className="bg-gray-800 w-14 h-14 rounded-full justify-center items-center shadow-lg"
                    onPress={() => router.push('/(app)/clients/add')}
                >
                    <Ionicons name="person-add" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
