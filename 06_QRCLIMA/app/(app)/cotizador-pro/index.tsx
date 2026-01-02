import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, isUserPro } from '../../../services/user-service';
import { getUserCotizadorQuotes, CotizadorQuote, formatCurrency } from '../../../services/cotizador-service';

export default function CotizadorProIndex() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [quotes, setQuotes] = useState<CotizadorQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState<boolean | null>(null);

    // Check PRO status
    useEffect(() => {
        const checkProStatus = async () => {
            if (!user) return;
            try {
                const profile = await getUserProfile(user.uid);
                setIsPro(isUserPro(profile));
            } catch (error) {
                console.error('Error checking PRO status:', error);
                setIsPro(false);
            }
        };
        checkProStatus();
    }, [user]);

    const loadQuotes = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const loaded = await getUserCotizadorQuotes(user.uid);
            setQuotes(loaded);
        } catch (e) {
            console.error('Error loading quotes:', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (isPro) loadQuotes();
        }, [user, isPro])
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Sent': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // PRO Lock Screen
    if (isPro === false) {
        return (
            <View className="flex-1 bg-slate-50">
                <View className="bg-blue-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-white text-2xl font-bold">Cotizador PRO</Text>
                            <Text className="text-blue-200 text-sm">Función Premium</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-1 items-center justify-center px-8">
                    <View className="bg-blue-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                        <Ionicons name="document-text" size={48} color="#2563EB" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
                        Cotizador PRO
                    </Text>
                    <Text className="text-gray-500 text-center mb-6">
                        Genera cotizaciones profesionales con tu marca, sugerencias de precios del mercado y PDFs sin watermark.
                    </Text>
                    <View className="bg-white rounded-2xl p-4 w-full mb-6 border border-gray-100">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                            <Text className="text-gray-700 ml-2">PDF con tu logo y colores</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                            <Text className="text-gray-700 ml-2">Sugerencias de precios de mercado</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                            <Text className="text-gray-700 ml-2">Buscador de catálogo proveedores</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                            <Text className="text-gray-700 ml-2">Sin marca "QRclima" en PDF</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/profile/subscription')}
                        className="bg-blue-600 py-4 px-8 rounded-2xl w-full"
                    >
                        <Text className="text-white font-bold text-lg text-center">Activar PRO</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Loading
    if (isPro === null || loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-4">Cargando...</Text>
            </View>
        );
    }

    const renderQuote = ({ item }: { item: CotizadorQuote }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm"
            onPress={() => router.push({
                pathname: '/(app)/cotizador/quote-summary',
                params: { quoteId: item.id }
            })}
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="font-bold text-gray-800 text-lg">{item.clientName}</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                        {item.items.length} concepto{item.items.length !== 1 ? 's' : ''} • {
                            item.createdAt?.seconds
                                ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('es-MX')
                                : 'Fecha pendiente'
                        }
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-green-600 font-bold text-lg">{formatCurrency(item.total)}</Text>
                    <View className={`px-2 py-0.5 rounded mt-1 ${getStatusColor(item.status).split(' ')[0]}`}>
                        <Text className={`text-[10px] uppercase font-medium ${getStatusColor(item.status).split(' ')[1]}`}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pb-4 px-4 flex-row items-center justify-between" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-white">Cotizador PRO</Text>
                        <Text className="text-blue-200 text-xs">Con tu marca</Text>
                    </View>
                </View>
                <View className="flex-row">
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/profile/branding')}
                        className="bg-white/20 p-2 rounded-lg mr-2"
                    >
                        <Ionicons name="color-palette" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/cotizador-pro/concepts')}
                        className="bg-white/20 p-2 rounded-lg"
                    >
                        <Ionicons name="settings-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* PRO Badge */}
            <View className="px-4 pt-4">
                <View className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 flex-row items-center">
                    <View className="bg-white/20 p-2 rounded-lg mr-3">
                        <Ionicons name="star" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold">Funciones PRO Activas</Text>
                        <Text className="text-white/80 text-xs">PDFs con tu marca + sugerencias de mercado</Text>
                    </View>
                </View>
            </View>

            {/* Quotes List */}
            <View className="flex-1 px-4 pt-4">
                <Text className="text-gray-500 font-medium text-sm mb-3">COTIZACIONES RECIENTES</Text>

                <FlatList
                    data={quotes}
                    keyExtractor={item => item.id || Math.random().toString()}
                    renderItem={renderQuote}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-16 opacity-60">
                            <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
                            <Text className="text-gray-500 mt-4 text-center font-medium">
                                No tienes cotizaciones PRO aún
                            </Text>
                            <Text className="text-gray-400 text-xs text-center mt-1">
                                Crea tu primera cotización profesional
                            </Text>
                        </View>
                    }
                />
            </View>

            {/* FAB */}
            <TouchableOpacity
                onPress={() => router.push('/(app)/cotizador-pro/new')}
                className="absolute bottom-8 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{ elevation: 5 }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
