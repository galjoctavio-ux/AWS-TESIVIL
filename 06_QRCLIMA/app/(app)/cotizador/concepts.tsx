import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import {
    getConcepts,
    deleteConcept,
    addConcept,
    CotizadorConcept,
    ConceptType,
    formatCurrency,
    getConceptTypeName
} from '../../../services/cotizador-service';
import {
    getCatalogProRecommendations,
    searchBestOffers,
    formatPrice,
    PRICE_DISCLAIMER
} from '../../../services/price-intelligence-service';
import type { CatalogProItem, BestOffer } from '../../../services/supabase-client';

// Sort options for recommendations
type SortOption = 'name-asc' | 'name-desc' | 'price-asc';

export default function ConceptsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [concepts, setConcepts] = useState<CotizadorConcept[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ConceptType>('MO');

    // Recommendations from v_catalogo_tecnicos_pro
    const [recommendations, setRecommendations] = useState<CatalogProItem[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('name-asc');

    // Search modal state (v_mejores_ofertas)
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BestOffer[]>([]);
    const [searching, setSearching] = useState(false);

    // Import modal state
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<BestOffer | CatalogProItem | null>(null);
    const [customPrice, setCustomPrice] = useState('');
    const [importing, setImporting] = useState(false);

    const loadConcepts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const loaded = await getConcepts(user.uid, activeTab);
            setConcepts(loaded);
        } catch (e) {
            console.error('Error loading concepts:', e);
        } finally {
            setLoading(false);
        }
    };

    // Load recommendations when MT tab is active
    const loadRecommendations = async () => {
        setLoadingRecommendations(true);
        try {
            const data = await getCatalogProRecommendations();
            setRecommendations(data);
        } catch (e) {
            console.error('Error loading recommendations:', e);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    // Sort recommendations based on selected option
    const sortedRecommendations = useMemo(() => {
        const sorted = [...recommendations];
        switch (sortOption) {
            case 'name-asc':
                return sorted.sort((a, b) => a.nombre_estandarizado.localeCompare(b.nombre_estandarizado));
            case 'name-desc':
                return sorted.sort((a, b) => b.nombre_estandarizado.localeCompare(a.nombre_estandarizado));
            case 'price-asc':
                return sorted.sort((a, b) => a.mejor_precio - b.mejor_precio);
            default:
                return sorted;
        }
    }, [recommendations, sortOption]);

    useFocusEffect(
        useCallback(() => {
            loadConcepts();
        }, [user, activeTab])
    );

    // Load recommendations when switching to MT tab
    useEffect(() => {
        if (activeTab === 'MT' && recommendations.length === 0) {
            loadRecommendations();
        }
    }, [activeTab]);

    // Debounced search for v_mejores_ofertas
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

    const handleDelete = (concept: CotizadorConcept) => {
        Alert.alert(
            'Eliminar Concepto',
            `¿Estás seguro de eliminar "${concept.description}"?\n\nCódigo: ${concept.code}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        if (concept.id) {
                            const success = await deleteConcept(concept.id);
                            if (success) {
                                loadConcepts();
                            } else {
                                Alert.alert('Error', 'No se pudo eliminar el concepto');
                            }
                        }
                    }
                }
            ]
        );
    };

    // Handle selecting an offer to import
    const handleSelectOffer = (offer: BestOffer | CatalogProItem) => {
        setSelectedOffer(offer);
        setCustomPrice(offer.mejor_precio.toString());
        setImportModalVisible(true);
    };

    // Confirm import with custom price
    const confirmImport = async () => {
        if (!selectedOffer || !user) return;

        const price = parseFloat(customPrice);
        if (isNaN(price) || price <= 0) {
            Alert.alert('Error', 'Ingresa un precio válido');
            return;
        }

        setImporting(true);
        try {
            await addConcept({
                description: selectedOffer.nombre_estandarizado,
                type: 'MT',
                unitPrice: price,
                unit: 'pza',
                technicianId: user.uid
            });

            Alert.alert('✅ Agregado', `"${selectedOffer.nombre_estandarizado}" se agregó a tus materiales con precio $${price}`);
            setImportModalVisible(false);
            setSearchModalVisible(false);
            setSelectedOffer(null);
            setCustomPrice('');
            loadConcepts();
        } catch (error) {
            console.error('Error importing:', error);
            Alert.alert('Error', 'No se pudo agregar el concepto');
        } finally {
            setImporting(false);
        }
    };

    const renderConcept = ({ item }: { item: CotizadorConcept }) => (
        <View className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <View className={`px-2 py-0.5 rounded mr-2 ${activeTab === 'MO' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                            <Text className={`text-[10px] font-bold ${activeTab === 'MO' ? 'text-purple-700' : 'text-orange-700'}`}>
                                {item.code}
                            </Text>
                        </View>
                    </View>
                    <Text className="font-medium text-gray-800 text-base">{item.description}</Text>
                    {item.unit && (
                        <Text className="text-gray-400 text-xs mt-1">Unidad: {item.unit}</Text>
                    )}
                </View>
                <View className="items-end">
                    <Text className="text-green-600 font-bold text-lg">{formatCurrency(item.unitPrice)}</Text>
                    <View className="flex-row mt-2">
                        <TouchableOpacity
                            className="p-2 mr-1"
                            onPress={() => router.push({
                                pathname: '/(app)/cotizador/add-concept',
                                params: { editId: item.id }
                            })}
                        >
                            <Ionicons name="pencil" size={18} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => handleDelete(item)}
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    // Render sort buttons
    const renderSortButtons = () => (
        <View className="flex-row mb-3">
            <TouchableOpacity
                onPress={() => setSortOption('name-asc')}
                className={`px-3 py-1.5 rounded-l-lg border ${sortOption === 'name-asc' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
            >
                <Text className={`text-xs font-medium ${sortOption === 'name-asc' ? 'text-white' : 'text-gray-600'}`}>A-Z</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setSortOption('name-desc')}
                className={`px-3 py-1.5 border-t border-b ${sortOption === 'name-desc' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
            >
                <Text className={`text-xs font-medium ${sortOption === 'name-desc' ? 'text-white' : 'text-gray-600'}`}>Z-A</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setSortOption('price-asc')}
                className={`px-3 py-1.5 rounded-r-lg border ${sortOption === 'price-asc' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
            >
                <Text className={`text-xs font-medium ${sortOption === 'price-asc' ? 'text-white' : 'text-gray-600'}`}>$ ↑</Text>
            </TouchableOpacity>
        </View>
    );

    // Render recommendations section (only for MT tab)
    const renderRecommendations = () => {
        if (activeTab !== 'MT') return null;

        return (
            <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-400 font-medium text-sm px-1">💡 RECOMENDACIONES DE MERCADO</Text>
                    {recommendations.length > 0 && (
                        <Text className="text-gray-400 text-xs">{recommendations.length} productos</Text>
                    )}
                </View>

                <View className="bg-amber-50 rounded-lg p-2 mb-3 border border-amber-100">
                    <Text className="text-amber-700 text-xs">
                        ⚠️ Precios directos de mercado - Define tu precio con tu ganancia
                    </Text>
                </View>

                {/* Sort Buttons */}
                {recommendations.length > 0 && renderSortButtons()}

                {loadingRecommendations ? (
                    <ActivityIndicator size="small" color="#F59E0B" className="my-4" />
                ) : recommendations.length === 0 ? (
                    <View className="bg-gray-50 rounded-xl p-4 items-center">
                        <Text className="text-gray-400 text-sm">Sin recomendaciones disponibles</Text>
                    </View>
                ) : (
                    sortedRecommendations.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleSelectOffer(item)}
                            className="bg-gray-50 rounded-xl p-3 mb-2 border border-gray-200"
                        >
                            <Text className="text-gray-600 font-medium" numberOfLines={1}>{item.nombre_estandarizado}</Text>
                            <View className="flex-row items-center justify-between mt-1">
                                <Text className="text-gray-400 text-xs">{item.marca} • {item.proveedor}</Text>
                                <View className="flex-row items-center">
                                    <View className="bg-amber-100 px-2 py-0.5 rounded mr-2">
                                        <Text className="text-amber-700 text-xs font-bold">MERCADO</Text>
                                    </View>
                                    <Text className="text-amber-600 font-bold">{formatPrice(item.mejor_precio)}</Text>
                                    <Ionicons name="add-circle" size={20} color="#F59E0B" style={{ marginLeft: 4 }} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pb-4 px-4 shadow-sm flex-row items-center justify-between" style={{ paddingTop: insets.top + 8 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Mis Conceptos</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View className="flex-row px-4 pt-4 pb-2">
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-l-xl border ${activeTab === 'MO' ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                    onPress={() => setActiveTab('MO')}
                >
                    <Text className={`text-center font-bold ${activeTab === 'MO' ? 'text-white' : 'text-gray-600'}`}>
                        🔧 Mano de Obra
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-r-xl border ${activeTab === 'MT' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
                    onPress={() => setActiveTab('MT')}
                >
                    <Text className={`text-center font-bold ${activeTab === 'MT' ? 'text-white' : 'text-gray-600'}`}>
                        📦 Materiales
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Concepts List + Recommendations */}
            <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
                ) : (
                    <>
                        {concepts.length === 0 ? (
                            <View className="items-center justify-center mt-16 opacity-60">
                                <Ionicons
                                    name={activeTab === 'MO' ? 'construct-outline' : 'cube-outline'}
                                    size={64}
                                    color="#9CA3AF"
                                />
                                <Text className="text-gray-500 mt-4 text-center font-medium">
                                    No tienes conceptos de {getConceptTypeName(activeTab)}
                                </Text>
                                <Text className="text-gray-400 text-xs text-center mt-1">
                                    Usa el botón + para agregar uno
                                </Text>
                            </View>
                        ) : (
                            concepts.map((concept) => (
                                <View key={concept.id || concept.code}>
                                    {renderConcept({ item: concept })}
                                </View>
                            ))
                        )}

                        {/* Recommendations Section (MT only) */}
                        {renderRecommendations()}

                        <View className="h-32" />
                    </>
                )}
            </ScrollView>

            {/* FAB - Add Concept */}
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(app)/cotizador/add-concept',
                    params: { defaultType: activeTab }
                })}
                className={`absolute bottom-20 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg ${activeTab === 'MO' ? 'bg-purple-600' : 'bg-orange-500'}`}
                style={{ elevation: 5 }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            {/* FAB - Search Prices (only for MT) */}
            {activeTab === 'MT' && (
                <TouchableOpacity
                    onPress={() => setSearchModalVisible(true)}
                    className="absolute bottom-20 right-24 w-14 h-14 rounded-full items-center justify-center shadow-lg bg-teal-600"
                    style={{ elevation: 5 }}
                >
                    <Ionicons name="search" size={28} color="white" />
                </TouchableOpacity>
            )}

            {/* Search Modal */}
            <Modal visible={searchModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
                    <View className="bg-white p-4 border-b border-gray-200">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-800">🔍 Buscar Precios</Text>
                            <TouchableOpacity onPress={() => { setSearchModalVisible(false); setSearchQuery(''); setSearchResults([]); }}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-2 text-gray-800"
                                placeholder="Buscar (ej: Gas R410, Tubo cobre...)"
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>
                    </View>

                    <ScrollView className="flex-1 p-4">
                        {searching ? (
                            <ActivityIndicator size="large" color="#14B8A6" className="mt-8" />
                        ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                            <View className="items-center py-8">
                                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">No se encontraron productos</Text>
                            </View>
                        ) : (
                            searchResults.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleSelectOffer(item)}
                                    className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
                                >
                                    <Text className="text-gray-800 font-medium" numberOfLines={2}>{item.nombre_estandarizado}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">{item.marca} • {item.proveedor}</Text>
                                    <View className="flex-row items-center justify-between mt-2">
                                        <View className="flex-row items-center">
                                            <View className="bg-amber-100 px-2 py-0.5 rounded mr-2">
                                                <Text className="text-amber-700 text-xs font-bold">MERCADO</Text>
                                            </View>
                                            <Text className="text-green-600 font-bold">{formatPrice(item.mejor_precio)}</Text>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color="#14B8A6" />
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}

                        <View className="bg-amber-50 rounded-xl p-3 mt-4 border border-amber-100">
                            <Text className="text-amber-700 text-xs">{PRICE_DISCLAIMER}</Text>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Import Price Modal */}
            <Modal visible={importModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-lg font-bold text-gray-800 mb-2">Define tu precio</Text>
                        <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>
                            {selectedOffer?.nombre_estandarizado}
                        </Text>

                        <View className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-100">
                            <View className="flex-row items-center mb-1">
                                <View className="bg-amber-200 px-2 py-0.5 rounded mr-2">
                                    <Text className="text-amber-800 text-xs font-bold">PRECIO DE MERCADO</Text>
                                </View>
                            </View>
                            <Text className="text-amber-700 font-bold text-lg">
                                {formatPrice(selectedOffer?.mejor_precio || 0)}
                            </Text>
                            <Text className="text-amber-600 text-xs mt-1">
                                💡 {formatPrice(selectedOffer?.mejor_precio || 0)} + tu utilidad
                            </Text>
                        </View>

                        <Text className="text-gray-600 font-medium mb-2">Tu precio final (con ganancia):</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl text-gray-800 text-lg font-bold"
                            placeholder="$0"
                            keyboardType="numeric"
                            value={customPrice}
                            onChangeText={setCustomPrice}
                            autoFocus
                        />

                        <View className="flex-row gap-3 mt-6">
                            <TouchableOpacity
                                onPress={() => {
                                    setImportModalVisible(false);
                                    setSelectedOffer(null);
                                }}
                                className="flex-1 py-3 bg-gray-100 rounded-xl"
                            >
                                <Text className="text-gray-600 text-center font-medium">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmImport}
                                disabled={importing}
                                className="flex-1 py-3 bg-orange-500 rounded-xl"
                            >
                                {importing ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-center font-bold">Agregar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
