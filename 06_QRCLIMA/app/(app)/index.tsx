import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { getClients, ClientData } from '../../services/clients-service';
import { getUserProfile, UserProfile, UserRank } from '../../services/user-service';
import { getRecentServices } from '../../services/services-service';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../../components/BottomNav';

// Rank display helper
const getRankLabel = (rank: UserRank | undefined) => {
    switch (rank) {
        case 'Experto': return { icon: '🥇', label: 'Experto' };
        case 'Técnico': return { icon: '🛡️', label: 'Técnico Pro' };
        default: return { icon: '🌱', label: 'Novato' };
    }
};

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [upcomingServices, setUpcomingServices] = useState<any[]>([]);
    const [recentServices, setRecentServices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!user) return;
        try {
            const [profileData, upcomingData, recentData, clientsData] = await Promise.all([
                getUserProfile(user.uid),
                import('../../services/services-service').then(mod => mod.getUpcomingServices(user.uid)),
                getRecentServices(user.uid, 5),
                getClients(user.uid)
            ]);
            setProfile(profileData);
            setUpcomingServices(upcomingData);
            setRecentServices(recentData);
            setClients(clientsData);
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

    const displayName = profile?.alias || profile?.businessName || 'Técnico';
    const tokenBalance = profile?.tokenBalance || 0;
    const rankInfo = getRankLabel(profile?.rank);
    const nextService = upcomingServices[0];

    // Quick actions - reduced to 4 main actions
    const quickActions = [
        { id: 'service', icon: 'add-circle', label: 'Nuevo Servicio', route: '/(app)/scanner?mode=service', primary: true },
        { id: 'quote', icon: 'document-text', label: 'Cotizar', route: '/(app)/quotes/wizard', accent: true },
        { id: 'scan', icon: 'qr-code', label: 'Escanear QR', route: '/(app)/scanner' },
        { id: 'sos', icon: 'help-buoy', label: 'SOS', route: '/(app)/community', alert: true },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
            >
                {/* ========================================== */}
                {/* HEADER - Clean & Minimal */}
                {/* ========================================== */}
                <View className="bg-blue-600 pb-24 px-5" style={{ paddingTop: insets.top + 8 }}>
                    <View className="flex-row justify-between items-center">
                        {/* Greeting */}
                        <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
                            <Text className="text-blue-200 text-sm">Bienvenido</Text>
                            <Text className="text-white text-2xl font-bold">{displayName}</Text>
                        </TouchableOpacity>

                        {/* Tokens Badge */}
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/wallet')}
                            className="bg-white/20 px-4 py-2 rounded-full flex-row items-center"
                        >
                            <Text className="text-yellow-300 text-lg mr-1">🪙</Text>
                            <Text className="text-white font-bold text-lg">{tokenBalance}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ========================================== */}
                {/* HERO SECTION - Floating Card */}
                {/* ========================================== */}
                <View className="px-4 -mt-16">
                    <View className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
                        {nextService ? (
                            // Has upcoming service
                            <View
                                className="mb-4"
                            >
                                <View className="flex-row items-center mb-2">
                                    <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                                    <Text className="text-gray-500 text-sm font-medium">Próximo Servicio</Text>
                                </View>
                                <Text className="text-xl font-bold text-gray-800 mb-1">
                                    {nextService.date?.toDate ?
                                        nextService.date.toDate().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                                        : 'Hoy'
                                    } - {nextService.type}
                                </Text>
                                <Text className="text-gray-500">Cliente: {nextService.clientName || 'Ver detalles'}</Text>
                            </View>
                        ) : (
                            // No services
                            <View className="items-center py-2 mb-4">
                                <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                                    <Ionicons name="sunny-outline" size={32} color="#9CA3AF" />
                                </View>
                                <Text className="text-gray-800 font-bold text-lg">Sin servicios pendientes</Text>
                                <Text className="text-gray-400 text-sm text-center">Tu agenda está libre. Es buen momento para conseguir clientes.</Text>
                            </View>
                        )}

                        {/* Primary CTA Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/scanner?mode=service')}
                            className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center"
                        >
                            <Ionicons name="add-circle" size={24} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">Nuevo Servicio</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ========================================== */}
                {/* QUICK ACTIONS - 4 Clean Icons */}
                {/* ========================================== */}
                <View className="px-4 mt-6">
                    <Text className="text-gray-800 font-bold text-lg mb-3">Accesos Rápidos</Text>
                    <View className="flex-row justify-between">
                        {quickActions.map(action => (
                            <TouchableOpacity
                                key={action.id}
                                onPress={() => router.push(action.route as any)}
                                className="items-center flex-1"
                            >
                                <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${action.primary ? 'bg-blue-600' :
                                    action.accent ? 'bg-green-600' :
                                        action.alert ? 'bg-red-500' :
                                            'bg-gray-100'
                                    }`}>
                                    <Ionicons
                                        name={action.icon as any}
                                        size={26}
                                        color={action.primary || action.accent || action.alert ? 'white' : '#374151'}
                                    />
                                </View>
                                <Text className="text-gray-600 text-xs font-medium text-center">{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ========================================== */}
                {/* LAST TOOLS USED - Compact */}
                {/* ========================================== */}
                <View className="px-4 mt-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-800 font-bold text-lg">Herramientas</Text>
                        <TouchableOpacity onPress={() => router.push('/(app)/tools')}>
                            <Text className="text-blue-600 text-sm font-medium">Ver todas →</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/library')}
                            className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center"
                        >
                            <View className="bg-red-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="warning" size={20} color="#EF4444" />
                            </View>
                            <View>
                                <Text className="text-gray-800 font-semibold">Códigos Error</Text>
                                <Text className="text-gray-400 text-xs">Diagnóstico rápido</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/(app)/tools/btu-calculator')}
                            className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center"
                        >
                            <View className="bg-purple-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="calculator" size={20} color="#7C3AED" />
                            </View>
                            <View>
                                <Text className="text-gray-800 font-semibold">Calc BTU</Text>
                                <Text className="text-gray-400 text-xs">Carga térmica</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ========================================== */}
                {/* SERVICE HISTORY - Search & Filters */}
                {/* ========================================== */}
                {/* ========================================== */}
                {/* LATEST SERVICE - Summary */}
                {/* ========================================== */}
                <View className="px-4 mt-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-800 font-bold text-lg">Último Servicio</Text>
                        <TouchableOpacity onPress={() => router.push('/(app)/services/log')}>
                            <Text className="text-blue-600 text-sm font-medium">Ver Bitácora →</Text>
                        </TouchableOpacity>
                    </View>

                    {recentServices.length > 0 ? (() => {
                        const service = recentServices[0];
                        const client = clients.find(c => c.id === service.clientId);
                        const infoDate = service.createdAt?.toDate ? service.createdAt.toDate() : new Date(service.createdAt || new Date());

                        return (
                            <TouchableOpacity
                                onPress={() => router.push(`/(app)/services/${service.id}`)}
                                className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center shadow-sm"
                            >
                                <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${service.status === 'Terminado' ? 'bg-green-100' : 'bg-amber-100'}`}>
                                    <Ionicons name={service.type === 'Instalación' ? 'construct' : 'build'} size={24} color={service.status === 'Terminado' ? '#16A34A' : '#D97706'} />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between">
                                        <Text className="font-bold text-gray-800 text-base">{client?.name || 'Cliente desconocido'}</Text>
                                        <Text className="text-xs text-gray-400">{infoDate.toLocaleDateString()}</Text>
                                    </View>
                                    <Text className="text-gray-600 text-sm">{service.type}</Text>
                                    {client?.address && (
                                        <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{client.address}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })() : (
                        <View className="bg-gray-50 rounded-2xl p-6 items-center border border-gray-100">
                            <Text className="text-gray-400">Sin servicios recientes</Text>
                        </View>
                    )}
                </View>

                {/* ========================================== */}
                {/* STATUS BAR - Compact Stats */}
                {/* ========================================== */}
                <View className="px-4 mt-6 mb-32">
                    <View className="bg-gray-900 rounded-2xl p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Text className="text-2xl mr-2">{rankInfo.icon}</Text>
                            <View>
                                <Text className="text-white font-semibold">{rankInfo.label}</Text>
                                <Text className="text-gray-400 text-xs">{profile?.stats?.servicesCount || 0} servicios realizados</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/store')}
                            className="bg-white/10 px-4 py-2 rounded-xl flex-row items-center"
                        >
                            <Ionicons name="storefront-outline" size={18} color="white" />
                            <Text className="text-white font-medium ml-2">Tienda</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="h-40" />
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNav />
        </View>
    );
}
