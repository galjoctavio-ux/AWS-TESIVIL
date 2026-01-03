import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMarketTrends, getTrendDisplay, getCategoryIcon } from '../../../../services/price-intelligence-service';
import type { MarketTrend } from '../../../../services/supabase-client';

export default function TrendsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [trends, setTrends] = useState<MarketTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const data = await getMarketTrends();
            setTrends(data);
        } catch (error) {
            console.error('Error loading trends:', error);
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

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#14B8A6" />
                <Text className="text-gray-500 mt-4">Cargando tendencias...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-teal-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-xl font-bold">📊 Tendencias de Mercado</Text>
                        <Text className="text-teal-200 text-sm">¿Cómo está el mercado hoy?</Text>
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
                        tintColor="#14B8A6"
                    />
                }
            >
                <View className="px-4 pt-4">
                    <Text className="text-gray-500 text-sm mb-4">
                        Comparamos precios vs. ayer para mostrarte la dirección del mercado
                    </Text>

                    {trends.length === 0 ? (
                        <View className="items-center py-16">
                            <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                                <Ionicons name="cloud-offline" size={40} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-800 font-bold text-lg text-center mb-2">
                                Sin datos disponibles
                            </Text>
                            <Text className="text-gray-500 text-center text-sm">
                                No pudimos obtener datos de mercado. Intenta más tarde.
                            </Text>
                        </View>
                    ) : (
                        trends.map((trend, index) => {
                            const display = getTrendDisplay(trend.variacion_mercado_promedio);
                            const categoryIcon = getCategoryIcon(trend.grupo_especializado);

                            return (
                                <View key={index} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1">
                                            <View className={`${display.bgColor} w-14 h-14 rounded-xl items-center justify-center mr-4`}>
                                                <Ionicons name={categoryIcon as any} size={28} color={display.color} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-800 font-bold text-lg">{trend.grupo_especializado}</Text>
                                                <Text className="text-gray-500 text-sm">Tendencia del día</Text>
                                            </View>
                                        </View>
                                        <View className={`${display.bgColor} px-4 py-2 rounded-xl flex-row items-center`}>
                                            <Ionicons name={display.icon as any} size={20} color={display.color} />
                                            <Text className="font-bold ml-2" style={{ color: display.color }}>
                                                {display.label}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}



                    {/* Info card */}
                    <View className="bg-teal-50 rounded-xl p-4 mt-4 border border-teal-100">
                        <Text className="text-teal-800 font-bold mb-1">¿Cómo interpretar las tendencias?</Text>
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="trending-up" size={16} color="#EF4444" />
                            <Text className="text-teal-700 text-sm ml-2">Subió = Precios más altos que ayer</Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="trending-down" size={16} color="#22C55E" />
                            <Text className="text-teal-700 text-sm ml-2">Bajó = Precios más bajos (buen momento para comprar)</Text>
                        </View>
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="remove" size={16} color="#6B7280" />
                            <Text className="text-teal-700 text-sm ml-2">Igual = Precios estables</Text>
                        </View>
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
