import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getArbitrageDeals, formatPrice } from '../../../../services/price-intelligence-service';
import type { ArbitrageDeal } from '../../../../services/supabase-client';

export default function DealsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [deals, setDeals] = useState<ArbitrageDeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const data = await getArbitrageDeals();
            setDeals(data);
        } catch (error) {
            console.error('Error loading deals:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const openUrl = (url?: string) => {
        if (url) {
            Linking.openURL(url);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="text-gray-500 mt-4">Buscando gangas...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-red-500 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">🔥 Gangas del Día</Text>
                        <Text className="text-red-200 text-sm">Productos 30%+ abajo del promedio</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#EF4444"
                    />
                }
            >
                <View className="px-4 pt-4">
                    {deals.length === 0 ? (
                        <View className="items-center py-16">
                            <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                                <Ionicons name="pricetag-outline" size={40} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-800 font-bold text-lg text-center mb-2">
                                Sin gangas hoy
                            </Text>
                            <Text className="text-gray-500 text-center text-sm">
                                No encontramos productos con descuentos significativos. Vuelve a revisar mañana.
                            </Text>
                        </View>
                    ) : (
                        deals.map((deal, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => openUrl(deal.url_reference)}
                                className="bg-white rounded-2xl p-4 mb-3 border border-red-100 shadow-sm"
                            >
                                {/* Discount Badge */}
                                <View className="absolute -top-2 -right-2 bg-red-500 px-3 py-1 rounded-full z-10">
                                    <Text className="text-white font-bold text-sm">
                                        -{deal.porcentaje_ahorro}%
                                    </Text>
                                </View>

                                <View className="flex-row items-start">
                                    <View className="bg-red-100 w-12 h-12 rounded-xl items-center justify-center mr-3">
                                        <Ionicons name="flame" size={24} color="#EF4444" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-bold text-base pr-8" numberOfLines={2}>
                                            {deal.display_name}
                                        </Text>
                                        {deal.en_tienda && (
                                            <Text className="text-gray-400 text-sm mt-1">
                                                📍 {deal.en_tienda}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                    <View>
                                        <Text className="text-red-600 font-bold text-2xl">
                                            {formatPrice(deal.precio_ganga)}
                                        </Text>
                                        <Text className="text-gray-400 text-sm line-through">
                                            {formatPrice(deal.precio_promedio)} (promedio)
                                        </Text>
                                    </View>
                                    <View className="bg-red-500 px-4 py-2 rounded-xl flex-row items-center">
                                        <Text className="text-white font-bold mr-1">Ver oferta</Text>
                                        <Ionicons name="open-outline" size={16} color="white" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    {deals.length > 0 && (
                        <View className="bg-amber-50 rounded-xl p-3 mt-2 border border-amber-100">
                            <View className="flex-row">
                                <Ionicons name="warning" size={16} color="#D97706" />
                                <Text className="text-amber-700 text-xs ml-2 flex-1">
                                    Ofertas limitadas - verifica stock y disponibilidad directamente con el proveedor.
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
