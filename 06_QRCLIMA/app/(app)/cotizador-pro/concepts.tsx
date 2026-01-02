import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput, ScrollView, Modal, Linking } from 'react-native';
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
    searchCatalogProducts,
    getEssentialProducts,
    formatPrice,
    PRICE_DISCLAIMER
} from '../../../services/price-intelligence-service';
import type { CatalogProduct, EssentialProduct } from '../../../services/supabase-client';

export default function ConceptsProScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [concepts, setConcepts] = useState<CotizadorConcept[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ConceptType>('MO');

    // Market recommendations state
    const [recommendations, setRecommendations] = useState<CatalogProduct[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [sortOption, setSortOption] = useState<'A-Z' | 'Z-A' | '$↑' | '$↓'>('$↑');

    // Search modal
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
    const [searching, setSearching] = useState(false);

    // Import modal for adding market products to catalog
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
    const [customPrice, setCustomPrice] = useState('');
    const [savingProduct, setSavingProduct] = useState(false);

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

    // Load market recommendations for materials tab (from v_catalogo_tecnicos_pro)
    const loadRecommendations = async () => {
        if (activeTab !== 'MT') return;
        setLoadingRecommendations(true);
        try {
            // Get products from v_catalogo_tecnicos_pro view
            const data = await getEssentialProducts();
            // Map EssentialProduct to CatalogProduct format for compatibility
            const mapped: CatalogProduct[] = data.map((item, index) => ({
                id: `pro-${index}`,
                display_name: item.display_name,
                brand: '',
                mejor_precio: item.mejor_precio,
                en_tienda: item.en_tienda,
                url_reference: item.url_reference
            }));
            setRecommendations(mapped);
        } catch (e) {
            console.error('Error loading recommendations:', e);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadConcepts();
            loadRecommendations();
        }, [user, activeTab])
    );

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearching(true);
                try {
                    const results = await searchCatalogProducts(searchQuery, 50);
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

    // Sort recommendations
    const sortedRecommendations = useMemo(() => {
        const sorted = [...recommendations];
        switch (sortOption) {
            case 'A-Z':
                return sorted.sort((a, b) => a.display_name.localeCompare(b.display_name));
            case 'Z-A':
                return sorted.sort((a, b) => b.display_name.localeCompare(a.display_name));
            case '$↑':
                return sorted.sort((a, b) => a.mejor_precio - b.mejor_precio);
            case '$↓':
                return sorted.sort((a, b) => b.mejor_precio - a.mejor_precio);
            default:
                return sorted;
        }
    }, [recommendations, sortOption]);

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

    const openProductUrl = (url?: string) => {
        if (url) {
            Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
        }
    };

    // Handle product selection - show import modal
    const handleProductSelect = (item: CatalogProduct) => {
        setSelectedProduct(item);
        setCustomPrice(item.mejor_precio.toString());
        setImportModalVisible(true);
    };

    // Save product directly to user's catalog with custom price
    const handleAddToCatalog = async () => {
        if (!selectedProduct || !user) return;

        const price = parseFloat(customPrice);
        if (isNaN(price) || price <= 0) {
            Alert.alert('Error', 'Ingresa un precio válido');
            return;
        }

        setSavingProduct(true);
        try {
            await addConcept({
                description: selectedProduct.display_name,
                type: 'MT',
                unitPrice: price,
                unit: 'PZA',
                technicianId: user.uid
            });

            Alert.alert('✅ Agregado', `"${selectedProduct.display_name}" se guardó en tu catálogo de materiales.`);
            setImportModalVisible(false);
            setSearchModalVisible(false);
            setSelectedProduct(null);
            setCustomPrice('');
            // Reload concepts to show the new one
            loadConcepts();
        } catch (error) {
            console.error('Error saving product:', error);
            Alert.alert('Error', 'No se pudo guardar el producto. Intenta de nuevo.');
        } finally {
            setSavingProduct(false);
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
                                pathname: '/(app)/cotizador-pro/add-concept',
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

    const renderRecommendation = (item: CatalogProduct, index: number) => (
        <TouchableOpacity
            key={item.id || index}
            onPress={() => handleProductSelect(item)}
            className="bg-white p-3 rounded-xl mb-2 border border-gray-100"
        >
            <Text className="text-gray-800 font-medium" numberOfLines={2}>{item.display_name}</Text>
            <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-400 text-xs">{item.brand} • {item.en_tienda}</Text>
                <View className="flex-row items-center">
                    <View className="bg-orange-100 px-2 py-0.5 rounded mr-2">
                        <Text className="text-orange-600 text-xs font-medium">MERCADO</Text>
                    </View>
                    <Text className="text-green-600 font-bold">{formatPrice(item.mejor_precio)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pb-4 px-4 shadow-sm flex-row items-center justify-between" style={{ paddingTop: insets.top + 8 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Mis Conceptos</Text>
                <View className="bg-orange-500 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-bold">PRO</Text>
                </View>
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

                        {/* Market Recommendations - Only for Materials tab */}
                        {activeTab === 'MT' && (
                            <View className="mt-6">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <Text className="text-gray-500 font-medium text-sm">✨ RECOMENDACIONES DE MERCADO</Text>
                                        {recommendations.length > 0 && (
                                            <View className="bg-gray-200 px-2 py-0.5 rounded-full ml-2">
                                                <Text className="text-gray-600 text-xs">{recommendations.length} productos</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Price disclaimer */}
                                <TouchableOpacity
                                    onPress={() => Alert.alert('Aviso Legal', PRICE_DISCLAIMER)}
                                    className="bg-amber-50 rounded-lg p-2 mb-3 border border-amber-100 flex-row items-center"
                                >
                                    <Ionicons name="information-circle" size={16} color="#D97706" />
                                    <Text className="text-amber-700 text-xs ml-2 flex-1">
                                        Precios directos de mercado - Define tu precio con tu ganancia
                                    </Text>
                                </TouchableOpacity>

                                {/* Sort options */}
                                <View className="flex-row mb-3">
                                    {(['A-Z', 'Z-A', '$↑', '$↓'] as const).map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => setSortOption(option)}
                                            className={`px-3 py-1.5 rounded-lg mr-2 ${sortOption === option ? 'bg-orange-500' : 'bg-gray-100'}`}
                                        >
                                            <Text className={`text-sm font-medium ${sortOption === option ? 'text-white' : 'text-gray-600'}`}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Recommendations list */}
                                {loadingRecommendations ? (
                                    <ActivityIndicator size="small" color="#F97316" className="my-4" />
                                ) : sortedRecommendations.length === 0 ? (
                                    <View className="bg-gray-50 rounded-xl p-4 items-center">
                                        <Text className="text-gray-400 text-sm">Sin recomendaciones disponibles</Text>
                                    </View>
                                ) : (
                                    sortedRecommendations.slice(0, 20).map((item, index) => renderRecommendation(item, index))
                                )}

                                {sortedRecommendations.length > 20 && (
                                    <TouchableOpacity
                                        onPress={() => setSearchModalVisible(true)}
                                        className="bg-orange-50 rounded-xl p-3 items-center border border-orange-100"
                                    >
                                        <Text className="text-orange-600 font-medium">
                                            Ver {sortedRecommendations.length - 20} productos más...
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

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

            {/* Search FAB - Only for Materials */}
            {activeTab === 'MT' && (
                <TouchableOpacity
                    onPress={() => setSearchModalVisible(true)}
                    className="absolute bottom-20 right-24 w-14 h-14 rounded-full bg-gray-700 items-center justify-center shadow-lg"
                    style={{ elevation: 5 }}
                >
                    <Ionicons name="search" size={24} color="white" />
                </TouchableOpacity>
            )}

            {/* Search Modal */}
            <Modal visible={searchModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
                    <View className="bg-white p-4 border-b border-gray-200">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-800">Buscar en Catálogo</Text>
                            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-2 text-gray-800"
                                placeholder="Buscar producto (ej: York, Mirage...)"
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>
                    </View>

                    <ScrollView className="flex-1 p-4">
                        {searching ? (
                            <ActivityIndicator size="large" color="#F97316" className="mt-8" />
                        ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                            <View className="items-center py-8">
                                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">No se encontraron productos</Text>
                            </View>
                        ) : (
                            searchResults.map((item, index) => renderRecommendation(item, index))
                        )}

                        <View className="bg-amber-50 rounded-xl p-3 mt-4 border border-amber-100">
                            <Text className="text-amber-700 text-xs">{PRICE_DISCLAIMER}</Text>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Import Product Modal - Shows disclaimer and price input */}
            <Modal visible={importModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        {/* Header */}
                        <Text className="text-lg font-bold text-gray-800 text-center mb-2">
                            Agregar a Mi Catálogo
                        </Text>

                        {/* Product Info */}
                        <Text className="text-gray-600 text-center mb-4" numberOfLines={2}>
                            {selectedProduct?.display_name}
                        </Text>

                        {/* Reference Price */}
                        <View className="bg-gray-50 rounded-xl p-3 mb-4 items-center">
                            <Text className="text-gray-400 text-xs mb-1">Precio de referencia (mercado)</Text>
                            <Text className="text-gray-500 text-lg">
                                {formatPrice(selectedProduct?.mejor_precio || 0)}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                                📍 {selectedProduct?.en_tienda}
                            </Text>
                        </View>

                        {/* Custom Price Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium mb-2">💰 Tu precio (con utilidad):</Text>
                            <TextInput
                                className="bg-green-50 p-4 rounded-xl text-green-700 text-xl font-bold text-center border-2 border-green-200"
                                placeholder="$0"
                                keyboardType="numeric"
                                value={customPrice}
                                onChangeText={setCustomPrice}
                            />
                        </View>

                        {/* Disclaimer */}
                        <View className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-200">
                            <Text className="text-amber-700 text-xs leading-5">
                                ⚠️ El precio de referencia NO incluye tu utilidad. Agrega tu margen de ganancia antes de guardar.
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <TouchableOpacity
                            onPress={handleAddToCatalog}
                            disabled={savingProduct}
                            className={`py-3 rounded-xl mb-2 ${savingProduct ? 'bg-gray-300' : 'bg-orange-500'}`}
                        >
                            {savingProduct ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold">✅ Guardar en Mi Catálogo</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                openProductUrl(selectedProduct?.url_reference);
                            }}
                            className="bg-gray-100 py-3 rounded-xl mb-2"
                        >
                            <Text className="text-gray-700 text-center font-medium">🔗 Ver en Tienda</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setImportModalVisible(false);
                                setSelectedProduct(null);
                                setCustomPrice('');
                            }}
                            className="py-2"
                        >
                            <Text className="text-gray-400 text-center">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
