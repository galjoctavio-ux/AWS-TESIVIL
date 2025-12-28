import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Linking, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../../context/AuthContext';
import { getUserProfile, isUserPro } from '../../../../services/user-service';
import {
    getMarketTrends,
    getTrendDisplay,
    getCategoryIcon,
    getArbitrageDeals,
    searchBestOffers,
    formatPrice,
    PRICE_DISCLAIMER
} from '../../../../services/price-intelligence-service';
import type { MarketTrend, ArbitrageDeal, BestOffer } from '../../../../services/supabase-client';

// Tab definitions
const TABS = [
    { id: 'trends', label: 'Tendencias', icon: 'trending-up' },
    { id: 'search', label: 'Buscar', icon: 'search' },
    { id: 'deals', label: 'Gangas', icon: 'flame' },
];

export default function PriceIntelIndex() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();

    const [isPro, setIsPro] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('trends');

    // Trends data (v_tendencias_mercado)
    const [trends, setTrends] = useState<MarketTrend[]>([]);

    // Deals data (v_gangas_detectadas)
    const [deals, setDeals] = useState<ArbitrageDeal[]>([]);
    const [dealsLoading, setDealsLoading] = useState(false);

    // Search data (v_mejores_ofertas)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BestOffer[]>([]);
    const [searching, setSearching] = useState(false);

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

    // Load trends
    const loadTrends = useCallback(async () => {
        try {
            const trendsData = await getMarketTrends();
            setTrends(trendsData);
        } catch (error) {
            console.error('Error loading trends:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load deals
    const loadDeals = useCallback(async () => {
        setDealsLoading(true);
        try {
            const data = await getArbitrageDeals();
            setDeals(data);
        } catch (error) {
            console.error('Error loading deals:', error);
        } finally {
            setDealsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isPro) {
            loadTrends();
        } else {
            setLoading(false);
        }
    }, [isPro, loadTrends]);

    // Load deals when switching to deals tab
    useEffect(() => {
        if (activeTab === 'deals' && deals.length === 0 && isPro) {
            loadDeals();
        }
    }, [activeTab, isPro]);

    // Search products with debounce (v_mejores_ofertas)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearching(true);
                try {
                    const results = await searchBestOffers(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error('Search error:', error);
                }
                setSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab === 'trends') await loadTrends();
        if (activeTab === 'deals') await loadDeals();
        setRefreshing(false);
    };

    const openUrl = (url?: string) => {
        if (url) Linking.openURL(url);
    };

    // PRO Lock Screen
    if (isPro === false) {
        return (
            <View className="flex-1 bg-slate-50">
                <View className="bg-teal-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-white text-2xl font-bold">Radar de Precios</Text>
                            <Text className="text-teal-200 text-sm">Función PRO</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-1 items-center justify-center px-8">
                    <View className="bg-teal-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                        <Ionicons name="analytics" size={48} color="#14B8A6" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
                        Radar de Precios PRO
                    </Text>
                    <Text className="text-gray-500 text-center mb-6">
                        Monitorea precios, compara proveedores y encuentra ofertas.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/profile/subscription')}
                        className="bg-teal-600 py-4 px-8 rounded-2xl w-full"
                    >
                        <Text className="text-white font-bold text-lg text-center">Activar PRO</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Loading state
    if (isPro === null || loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#14B8A6" />
                <Text className="text-gray-500 mt-4">Cargando datos de mercado...</Text>
            </View>
        );
    }

    // Render Trends Tab (v_tendencias_mercado)
    const renderTrendsTab = () => (
        <View className="px-4 pt-4">
            <Text className="text-gray-800 font-bold text-lg mb-1">📢 ¿Cómo está el mercado hoy?</Text>
            <Text className="text-gray-500 text-sm mb-4">Variación de precios vs. promedio histórico</Text>

            {trends.length === 0 ? (
                <View className="bg-gray-50 rounded-2xl p-6 items-center">
                    <Ionicons name="cloud-offline" size={48} color="#9CA3AF" />
                    <Text className="text-gray-500 mt-3">Sin datos de tendencias disponibles</Text>
                </View>
            ) : (
                trends.map((trend, index) => {
                    const display = getTrendDisplay(trend.variacion_porcentual);
                    const categoryIcon = getCategoryIcon(trend.grupo_especializado);
                    return (
                        <View key={index} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className={`${display.bgColor} w-12 h-12 rounded-xl items-center justify-center mr-3`}>
                                        <Ionicons name={categoryIcon as any} size={24} color={display.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-bold text-base">{trend.grupo_especializado}</Text>
                                        <Text className="text-gray-500 text-sm">vs. promedio histórico</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name={display.icon as any} size={24} color={display.color} />
                                    <Text className="font-bold ml-1" style={{ color: display.color }}>
                                        {display.label}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );

    // Render Search Tab (v_mejores_ofertas)
    const renderSearchTab = () => (
        <View className="px-4 pt-4 flex-1">
            <Text className="text-gray-800 font-bold text-lg mb-1">🔎 Buscar Producto</Text>
            <Text className="text-gray-500 text-sm mb-4">Encuentra el mejor precio entre proveedores</Text>

            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200 mb-4">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    className="flex-1 ml-2 text-gray-800"
                    placeholder="Buscar (ej: Mirage, York, Gas R410...)"
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

            {searching && <ActivityIndicator color="#14B8A6" className="my-4" />}

            {searchResults.length > 0 && (
                <View>
                    <Text className="text-gray-500 text-sm mb-2">{searchResults.length} resultados</Text>
                    {searchResults.map((offer, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => openUrl(offer.url)}
                            className="bg-white rounded-xl p-4 mb-2 border border-gray-100"
                        >
                            <Text className="text-gray-800 font-bold" numberOfLines={2}>{offer.nombre_estandarizado}</Text>
                            <Text className="text-gray-400 text-sm mt-1">{offer.marca} • {offer.proveedor}</Text>
                            <View className="flex-row items-center justify-between mt-2">
                                <Text className="text-green-600 font-bold text-lg">
                                    {formatPrice(offer.mejor_precio)}
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className="text-teal-600 font-medium mr-1">Ver oferta</Text>
                                    <Ionicons name="open-outline" size={16} color="#14B8A6" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {!searching && searchResults.length === 0 && searchQuery.length < 2 && (
                <View className="items-center py-8">
                    <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-3">Escribe al menos 2 caracteres para buscar</Text>
                </View>
            )}

            {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                <View className="items-center py-8">
                    <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-3">No se encontraron resultados</Text>
                </View>
            )}

            {/* Disclaimer */}
            <View className="bg-amber-50 rounded-xl p-3 mt-4 border border-amber-100">
                <Text className="text-amber-700 text-xs">{PRICE_DISCLAIMER}</Text>
            </View>
        </View>
    );

    // Render Deals Tab (v_gangas_detectadas)
    const renderDealsTab = () => (
        <View className="px-4 pt-4">
            <Text className="text-gray-800 font-bold text-lg mb-1">🔥 Gangas del Día</Text>
            <Text className="text-gray-500 text-sm mb-4">Productos con descuentos significativos (10%+ bajo promedio)</Text>

            {dealsLoading ? (
                <ActivityIndicator color="#EF4444" className="my-8" />
            ) : deals.length === 0 ? (
                <View className="items-center py-16">
                    <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                        <Ionicons name="pricetag-outline" size={40} color="#9CA3AF" />
                    </View>
                    <Text className="text-gray-800 font-bold text-lg text-center mb-2">Sin gangas hoy</Text>
                    <Text className="text-gray-500 text-center text-sm">
                        No encontramos productos con descuentos significativos.
                    </Text>
                </View>
            ) : (
                deals.map((deal, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => openUrl(deal.url)}
                        className="bg-white rounded-2xl p-4 mb-3 border border-red-100 shadow-sm"
                    >
                        <View className="absolute -top-2 -right-2 bg-red-500 px-3 py-1 rounded-full z-10">
                            <Text className="text-white font-bold text-sm">-{Math.round(deal.porcentaje_descuento)}%</Text>
                        </View>

                        <View className="flex-row items-start">
                            <View className="bg-red-100 w-12 h-12 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="flame" size={24} color="#EF4444" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-bold text-base pr-8" numberOfLines={2}>
                                    {deal.nombre_estandarizado}
                                </Text>
                                <Text className="text-gray-400 text-sm mt-1">📍 {deal.proveedor}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <View>
                                <Text className="text-red-600 font-bold text-2xl">
                                    {formatPrice(deal.mejor_precio)}
                                </Text>
                                <Text className="text-gray-400 text-sm line-through">
                                    {formatPrice(deal.promedio_historico)} (promedio)
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
        </View>
    );

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'trends': return renderTrendsTab();
            case 'search': return renderSearchTab();
            case 'deals': return renderDealsTab();
            default: return null;
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-teal-600 pb-4 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-white text-2xl font-bold">Radar de Precios</Text>
                            <Text className="text-teal-200 text-sm">Inteligencia de mercado HVAC</Text>
                        </View>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                        <Text className="text-white font-bold text-xs">PRO</Text>
                    </View>
                </View>
            </View>

            {/* Tab Bar */}
            <View className="bg-white border-b border-gray-100 px-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            className={`flex-row items-center px-4 py-2 mx-1 rounded-full ${activeTab === tab.id ? 'bg-teal-600' : 'bg-gray-100'
                                }`}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={16}
                                color={activeTab === tab.id ? 'white' : '#6B7280'}
                            />
                            <Text className={`ml-2 font-medium ${activeTab === tab.id ? 'text-white' : 'text-gray-600'
                                }`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
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
                {renderTabContent()}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
