import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { getClients, ClientData } from '../../services/clients-service';
import { getUserProfile, UserProfile, UserRank } from '../../services/user-service';
import { getRecentServices, getTotalServicesCount } from '../../services/services-service';
import { getOrderedQuickActions, trackActionUsage, QuickAction } from '../../services/quick-actions-service';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../../components/BottomNav';
import QuickActionsEditor from '../../components/QuickActionsEditor';

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
    const [servicesCount, setServicesCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Quick Actions - Dynamic hybrid system
    const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
    const [showActionsEditor, setShowActionsEditor] = useState(false);

    const loadQuickActions = async () => {
        const actions = await getOrderedQuickActions();
        setQuickActions(actions);
    };

    const loadData = async () => {
        if (!user) return;
        try {
            const [profileData, upcomingData, recentData, clientsData, totalServices] = await Promise.all([
                getUserProfile(user.uid),
                import('../../services/services-service').then(mod => mod.getUpcomingServices(user.uid)),
                getRecentServices(user.uid, 5),
                getClients(user.uid),
                getTotalServicesCount(user.uid)
            ]);
            setProfile(profileData);
            setUpcomingServices(upcomingData);
            setRecentServices(recentData);
            setClients(clientsData);
            setServicesCount(totalServices);
        } catch (err) {
            console.error("Error loading data:", err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            Promise.all([loadData(), loadQuickActions()]).finally(() => setLoading(false));
        }, [user])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadData(), loadQuickActions()]);
        setRefreshing(false);
    };

    const handleQuickAction = async (action: QuickAction) => {
        // Track usage for auto-ordering
        await trackActionUsage(action.id);
        router.push(action.route as any);
    };

    const displayName = profile?.alias || profile?.businessName || 'Técnico';
    const tokenBalance = profile?.tokenBalance || 0;
    const rankInfo = getRankLabel(profile?.rank);

    // Filter for truly upcoming services (future date and pending status)
    const nextService = useMemo(() => {
        const now = new Date();
        return upcomingServices.find(service => {
            // Check if service is pending
            if (service.status === 'Terminado' || service.status === 'Finalizado') return false;

            // Check if date is in the future
            const serviceDate = service.date?.toDate ? service.date.toDate() : new Date(service.date);
            return serviceDate > now;
        });
    }, [upcomingServices]);

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
                            // Has upcoming service - tappable to go to agenda
                            <TouchableOpacity
                                onPress={() => router.push(`/(app)/agenda?selectEvent=${nextService.id}`)}
                                className="mb-4"
                            >
                                <View className="flex-row items-center mb-2">
                                    <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                                    <Text className="text-gray-500 text-sm font-medium">Próximo Servicio</Text>
                                    <View className="ml-auto">
                                        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                                    </View>
                                </View>
                                <Text className="text-xl font-bold text-gray-800 mb-1">
                                    {nextService.date?.toDate ? (() => {
                                        const d = nextService.date.toDate();
                                        const today = new Date();
                                        const isToday = d.toDateString() === today.toDateString();
                                        const tomorrow = new Date(today);
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        const isTomorrow = d.toDateString() === tomorrow.toDateString();

                                        const timeStr = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                                        if (isToday) return `Hoy ${timeStr}`;
                                        if (isTomorrow) return `Mañana ${timeStr}`;
                                        return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }) + ` ${timeStr}`;
                                    })() : 'Próximamente'} - {nextService.type}
                                </Text>
                                <Text className="text-gray-500">Cliente: {nextService.clientName || 'Ver detalles'}</Text>
                            </TouchableOpacity>
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
                {/* QUICK ACTIONS - Hybrid Dynamic System */}
                {/* ========================================== */}
                <View className="px-4 mt-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-800 font-bold text-lg">Accesos Rápidos</Text>
                        <TouchableOpacity
                            onPress={() => setShowActionsEditor(true)}
                            className="bg-gray-100 p-2 rounded-full"
                        >
                            <Ionicons name="pencil" size={16} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-between">
                        {quickActions.map(action => (
                            <TouchableOpacity
                                key={action.id}
                                onPress={() => handleQuickAction(action)}
                                className="items-center flex-1"
                            >
                                <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${action.primary ? 'bg-blue-600' :
                                    action.alert ? 'bg-red-500' :
                                        action.color || 'bg-gray-100'
                                    }`}>
                                    <Ionicons
                                        name={action.icon as any}
                                        size={26}
                                        color={action.primary || action.alert || action.color ? 'white' : '#374151'}
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
                            onPress={() => router.push('/(app)/tools/btu-calculator-free')}
                            className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center"
                        >
                            <View className="bg-purple-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="calculator" size={20} color="#7C3AED" />
                            </View>
                            <View>
                                <Text className="text-gray-800 font-semibold">Calculadora BTU</Text>
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
                                <Text className="text-gray-400 text-xs">{servicesCount} servicios realizados</Text>
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

            {/* Quick Actions Editor Modal */}
            <QuickActionsEditor
                visible={showActionsEditor}
                onClose={() => setShowActionsEditor(false)}
                onSave={loadQuickActions}
            />
        </View>
    );
}
