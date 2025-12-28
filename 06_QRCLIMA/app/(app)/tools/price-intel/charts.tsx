import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPriceHistory, formatPrice } from '../../../../services/price-intelligence-service';
import type { PriceHistoryPoint } from '../../../../services/supabase-client';

const PERIODS = [
    { value: 30, label: '30 días' },
    { value: 60, label: '60 días' },
    { value: 90, label: '90 días' },
];

const CATEGORIES = [
    { value: 'Minisplit', label: 'Minisplits', icon: 'snow' },
    { value: 'Tubería', label: 'Tubería Cobre', icon: 'construct' },
    { value: 'Gas Refrigerante', label: 'Gas Refrigerante', icon: 'flask' },
];

const screenWidth = Dimensions.get('window').width;

// Simple line chart component (no external dependency)
const SimpleLineChart = ({ data }: { data: PriceHistoryPoint[] }) => {
    if (data.length === 0) return null;

    const prices = data.map(d => d.precio_promedio);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const range = maxPrice - minPrice || 1;
    const chartHeight = 180;
    const chartWidth = screenWidth - 80;

    // Normalize points to chart coordinates
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((d.precio_promedio - minPrice) / range) * (chartHeight - 40);
        return { x, y, precio: d.precio_promedio, fecha: d.fecha };
    });

    // Create SVG-like path using View components (simplified approach)
    return (
        <View className="relative" style={{ height: chartHeight, width: chartWidth }}>
            {/* Y-axis labels */}
            <View className="absolute left-0 top-0 bottom-0 justify-between" style={{ width: 60 }}>
                <Text className="text-gray-400 text-xs">{formatPrice(maxPrice)}</Text>
                <Text className="text-gray-400 text-xs">{formatPrice((maxPrice + minPrice) / 2)}</Text>
                <Text className="text-gray-400 text-xs">{formatPrice(minPrice)}</Text>
            </View>

            {/* Chart area */}
            <View className="absolute right-0" style={{ left: 60, height: chartHeight }}>
                {/* Grid lines */}
                <View className="absolute top-5 left-0 right-0 border-t border-gray-100" />
                <View className="absolute top-1/2 left-0 right-0 border-t border-gray-100" />
                <View className="absolute bottom-5 left-0 right-0 border-t border-gray-100" />

                {/* Data points */}
                {points.map((point, index) => (
                    <View
                        key={index}
                        className="absolute w-3 h-3 bg-purple-600 rounded-full"
                        style={{
                            left: point.x - 6,
                            top: point.y - 6,
                            transform: [{ scale: index === points.length - 1 ? 1.3 : 1 }]
                        }}
                    />
                ))}

                {/* Connect dots with lines (simplified - just show dots) */}
            </View>

            {/* X-axis labels */}
            <View className="absolute bottom-0 left-16 right-0 flex-row justify-between">
                {data.length > 0 && (
                    <>
                        <Text className="text-gray-400 text-xs">
                            {new Date(data[0].fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </Text>
                        {data.length > 2 && (
                            <Text className="text-gray-400 text-xs">
                                {new Date(data[Math.floor(data.length / 2)].fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </Text>
                        )}
                        <Text className="text-gray-400 text-xs">
                            {new Date(data[data.length - 1].fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
};

export default function ChartsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [selectedCategory, setSelectedCategory] = useState('Minisplit');
    const [data, setData] = useState<PriceHistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const historyData = await getPriceHistory(selectedCategory, null, selectedPeriod);
            setData(historyData);
        } catch (error) {
            console.error('Error loading price history:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedPeriod]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Calculate stats from data
    const calculateStats = () => {
        if (data.length === 0) return { avg: 0, change: 0, trend: 'igual' };

        const avg = data.reduce((sum, d) => sum + d.precio_promedio, 0) / data.length;
        const first = data[0]?.precio_promedio || 0;
        const last = data[data.length - 1]?.precio_promedio || 0;
        const change = first > 0 ? ((last - first) / first) * 100 : 0;
        const trend = change > 1 ? 'subio' : change < -1 ? 'bajo' : 'igual';

        return { avg, change, trend };
    };

    const stats = calculateStats();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-purple-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-xl font-bold">📈 Historial de Precios</Text>
                        <Text className="text-purple-200 text-sm">Tendencias por categoría</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Period Selector */}
                <View className="px-4 pt-4">
                    <Text className="text-gray-500 text-sm mb-2">Período</Text>
                    <View className="flex-row">
                        {PERIODS.map(period => (
                            <TouchableOpacity
                                key={period.value}
                                onPress={() => setSelectedPeriod(period.value)}
                                className={`px-4 py-2 rounded-full mr-2 ${selectedPeriod === period.value ? 'bg-purple-600' : 'bg-gray-100'
                                    }`}
                            >
                                <Text className={`font-medium ${selectedPeriod === period.value ? 'text-white' : 'text-gray-600'
                                    }`}>
                                    {period.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Category Selector */}
                <View className="px-4 pt-4">
                    <Text className="text-gray-500 text-sm mb-2">Categoría</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.value}
                                onPress={() => setSelectedCategory(cat.value)}
                                className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${selectedCategory === cat.value ? 'bg-purple-600' : 'bg-white border border-gray-200'
                                    }`}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={16}
                                    color={selectedCategory === cat.value ? 'white' : '#6B7280'}
                                />
                                <Text className={`ml-2 font-medium ${selectedCategory === cat.value ? 'text-white' : 'text-gray-600'
                                    }`}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Chart */}
                <View className="px-4 pt-6">
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        {loading ? (
                            <View className="items-center py-16">
                                <ActivityIndicator size="large" color="#7C3AED" />
                                <Text className="text-gray-500 mt-4">Cargando gráfica...</Text>
                            </View>
                        ) : data.length === 0 ? (
                            <View className="items-center py-16">
                                <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">Sin datos para este período</Text>
                            </View>
                        ) : (
                            <>
                                <SimpleLineChart data={data} />

                                {/* Stats */}
                                <View className="flex-row justify-around pt-4 border-t border-gray-100 mt-4">
                                    <View className="items-center">
                                        <Text className="text-gray-400 text-xs">Promedio</Text>
                                        <Text className="text-gray-800 font-bold text-lg">
                                            {formatPrice(stats.avg)}
                                        </Text>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-gray-400 text-xs">Variación</Text>
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name={stats.change >= 0 ? 'trending-up' : 'trending-down'}
                                                size={16}
                                                color={stats.change >= 0 ? '#EF4444' : '#22C55E'}
                                            />
                                            <Text className={`font-bold text-lg ml-1 ${stats.change >= 0 ? 'text-red-500' : 'text-green-500'
                                                }`}>
                                                {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Data table (alternative to complex chart) */}
                {!loading && data.length > 0 && (
                    <View className="px-4 pt-4">
                        <Text className="text-gray-500 text-sm mb-2">Datos recientes</Text>
                        <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            {data.slice(-5).reverse().map((point, index) => (
                                <View key={index} className={`flex-row justify-between p-3 ${index > 0 ? 'border-t border-gray-50' : ''}`}>
                                    <Text className="text-gray-600">
                                        {new Date(point.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </Text>
                                    <Text className="text-gray-800 font-medium">
                                        {formatPrice(point.precio_promedio)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Future Feature Teaser */}
                <View className="px-4 pt-4">
                    <View className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <View className="flex-row items-center">
                            <Ionicons name="sparkles" size={20} color="#7C3AED" />
                            <Text className="text-purple-700 font-medium ml-2">Próximamente</Text>
                        </View>
                        <Text className="text-purple-600 text-sm mt-1">
                            Vista comparativa: Mirage vs York en la misma gráfica
                        </Text>
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
