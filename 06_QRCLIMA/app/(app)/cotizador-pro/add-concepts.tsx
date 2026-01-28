import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getConcepts, CotizadorConcept, CotizadorQuoteItem } from '../../../services/cotizador-service';
import {
    getEssentialProducts,
    searchCatalogProducts,
    formatPrice,
    PRICE_DISCLAIMER
} from '../../../services/price-intelligence-service';
import type { EssentialProduct, CatalogProduct } from '../../../services/supabase-client';

export default function AddConceptsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams<{
        clientId: string;
        clientName: string;
        clientPhone: string;
        clientAddress: string;
    }>();

    // Local concepts from Firebase
    const [concepts, setConcepts] = useState<CotizadorConcept[]>([]);
    const [loadingConcepts, setLoadingConcepts] = useState(true);

    // Market suggestions from Supabase
    const [essentials, setEssentials] = useState<EssentialProduct[]>([]);
    const [loadingEssentials, setLoadingEssentials] = useState(true);

    // Catalog search
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CatalogProduct[]>([]);
    const [searching, setSearching] = useState(false);

    // Selected items for quote
    const [selectedItems, setSelectedItems] = useState<CotizadorQuoteItem[]>([]);

    // Custom price input modal
    const [priceModalVisible, setPriceModalVisible] = useState(false);
    const [pendingItem, setPendingItem] = useState<{
        name: string;
        suggestedPrice: number;
        source: 'essential' | 'catalog';
        url?: string;
    } | null>(null);
    const [customPrice, setCustomPrice] = useState('');

    // Load local concepts
    useFocusEffect(
        useCallback(() => {
            const loadConcepts = async () => {
                if (!user) return;
                try {
                    const loaded = await getConcepts(user.uid);
                    setConcepts(loaded);
                } catch (error) {
                    console.error('Error loading concepts:', error);
                }
                setLoadingConcepts(false);
            };
            loadConcepts();
        }, [user])
    );

    // Load market suggestions
    useEffect(() => {
        const loadEssentials = async () => {
            try {
                const data = await getEssentialProducts();
                setEssentials(data);
            } catch (error) {
                console.error('Error loading essentials:', error);
            }
            setLoadingEssentials(false);
        };
        loadEssentials();
    }, []);

    // Debounced catalog search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearching(true);
                try {
                    const results = await searchCatalogProducts(searchQuery);
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

    // Add local concept directly
    const addLocalConcept = (concept: CotizadorConcept) => {
        const newItem: CotizadorQuoteItem = {
            conceptId: concept.id || '',
            code: concept.code,
            description: concept.description,
            type: concept.type,
            unitPrice: concept.unitPrice,
            quantity: 1,
            total: concept.unitPrice
        };
        setSelectedItems([...selectedItems, newItem]);
    };

    // Show price input modal for market items
    const handleMarketItemSelect = (item: EssentialProduct | CatalogProduct, source: 'essential' | 'catalog') => {
        const name = item.display_name;
        const price = 'mejor_precio' in item ? item.mejor_precio : 0;
        const url = 'url_reference' in item ? item.url_reference : undefined;

        setPendingItem({ name, suggestedPrice: price, source, url });
        setCustomPrice(price.toString());
        setPriceModalVisible(true);
    };

    // Confirm custom price
    const confirmCustomPrice = () => {
        if (!pendingItem) return;

        const price = parseFloat(customPrice);
        if (isNaN(price) || price <= 0) {
            Alert.alert('Error', 'Ingresa un precio válido');
            return;
        }

        const newItem: CotizadorQuoteItem = {
            conceptId: `market-${Date.now()}`,
            code: pendingItem.source === 'essential' ? 'MKT' : 'CAT',
            description: pendingItem.name,
            type: 'MT',
            unitPrice: price,
            quantity: 1,
            total: price
        };

        setSelectedItems([...selectedItems, newItem]);
        setPriceModalVisible(false);
        setPendingItem(null);
        setCustomPrice('');
        setSearchModalVisible(false);
    };

    // Update item quantity
    const updateQuantity = (index: number, delta: number) => {
        const updated = [...selectedItems];
        const newQty = Math.max(1, updated[index].quantity + delta);
        updated[index].quantity = newQty;
        updated[index].total = updated[index].unitPrice * newQty;
        setSelectedItems(updated);
    };

    // Remove item
    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    // Calculate total
    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => sum + item.total, 0);
    };

    // Continue to summary
    const handleContinue = () => {
        if (selectedItems.length === 0) {
            Alert.alert('Sin Conceptos', 'Agrega al menos un concepto para continuar');
            return;
        }

        router.push({
            pathname: '/(app)/cotizador-pro/summary',
            params: {
                clientId: params.clientId,
                clientName: params.clientName,
                clientPhone: params.clientPhone || '',
                clientAddress: params.clientAddress || '',
                items: JSON.stringify(selectedItems),
                total: calculateTotal().toString()
            }
        });
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pb-4 px-4" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-xl font-bold text-white">Agregar Conceptos</Text>
                            <Text className="text-blue-200 text-xs">{params.clientName}</Text>
                        </View>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                        <Text className="text-white font-bold text-sm">PRO</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Catalog Search Button */}
                <TouchableOpacity
                    onPress={() => setSearchModalVisible(true)}
                    className="mx-4 mt-4 bg-white rounded-xl p-4 border border-gray-200 flex-row items-center"
                >
                    <View className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Ionicons name="search" size={20} color="#7C3AED" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-800 font-medium">Buscar en catálogo de proveedores</Text>
                        <Text className="text-gray-400 text-xs">Encuentra productos con precios de referencia</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Selected Items */}
                {selectedItems.length > 0 && (
                    <View className="px-4 pt-4">
                        <Text className="text-gray-500 font-medium text-sm mb-3">
                            📋 CONCEPTOS AGREGADOS ({selectedItems.length})
                        </Text>
                        {selectedItems.map((item, index) => (
                            <View key={index} className="bg-white rounded-xl p-3 mb-2 border border-gray-100">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-medium" numberOfLines={1}>{item.description}</Text>
                                        <Text className="text-gray-400 text-xs">{item.code}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <TouchableOpacity onPress={() => updateQuantity(index, -1)} className="p-2">
                                            <Ionicons name="remove-circle" size={24} color="#9CA3AF" />
                                        </TouchableOpacity>
                                        <Text className="font-bold text-gray-800 mx-2">{item.quantity}</Text>
                                        <TouchableOpacity onPress={() => updateQuantity(index, 1)} className="p-2">
                                            <Ionicons name="add-circle" size={24} color="#2563EB" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeItem(index)} className="p-2 ml-2">
                                            <Ionicons name="trash" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text className="text-green-600 font-bold text-right">{formatPrice(item.total)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* My Concepts Section */}
                <View className="px-4 pt-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-500 font-medium text-sm">📦 MIS CONCEPTOS</Text>
                        <TouchableOpacity onPress={() => router.push('/(app)/cotizador/add-concept')}>
                            <Text className="text-blue-600 text-sm font-medium">+ Nuevo</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingConcepts ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                    ) : concepts.length === 0 ? (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <Text className="text-gray-400 text-sm">No tienes conceptos guardados</Text>
                        </View>
                    ) : (
                        concepts.map((concept, index) => (
                            <TouchableOpacity
                                key={concept.id}
                                onPress={() => addLocalConcept(concept)}
                                className="bg-white rounded-xl p-3 mb-2 border border-gray-100 flex-row items-center justify-between"
                            >
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium">{concept.description}</Text>
                                    <Text className="text-gray-400 text-xs">{concept.code} • {concept.type}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-green-600 font-bold mr-2">{formatPrice(concept.unitPrice)}</Text>
                                    <Ionicons name="add-circle" size={24} color="#2563EB" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Market Suggestions Section */}
                <View className="px-4 pt-4">
                    <Text className="text-gray-500 font-medium text-sm mb-1">💡 SUGERENCIAS DE MERCADO</Text>
                    <View className="bg-amber-50 rounded-lg p-2 mb-3 border border-amber-100">
                        <Text className="text-amber-700 text-xs">
                            ⚠️ Precios referenciales - Define tu precio final
                        </Text>
                    </View>

                    {loadingEssentials ? (
                        <ActivityIndicator size="small" color="#7C3AED" />
                    ) : essentials.length === 0 ? (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <Text className="text-gray-400 text-sm">Sin sugerencias disponibles</Text>
                        </View>
                    ) : (
                        essentials.slice(0, 4).map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleMarketItemSelect(item, 'essential')}
                                className="bg-white rounded-xl p-3 mb-2 border border-purple-100"
                            >
                                <Text className="text-gray-800 font-medium" numberOfLines={1}>{item.display_name}</Text>
                                <View className="flex-row items-center justify-between mt-1">
                                    <Text className="text-gray-400 text-xs">📍 {item.en_tienda}</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-purple-600 font-bold mr-2">Ref: {formatPrice(item.mejor_precio)}</Text>
                                        <Ionicons name="add-circle" size={22} color="#7C3AED" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Disclaimer */}
                <View className="px-4 py-4">
                    <View className="bg-gray-100 rounded-xl p-3">
                        <Text className="text-gray-500 text-xs">
                            📄 {PRICE_DISCLAIMER}
                        </Text>
                    </View>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Bottom Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4" style={{ paddingBottom: insets.bottom + 16 }}>
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-500">Total:</Text>
                    <Text className="text-2xl font-bold text-green-600">{formatPrice(calculateTotal())}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={selectedItems.length === 0}
                    className={`py-4 rounded-xl ${selectedItems.length === 0 ? 'bg-gray-300' : 'bg-blue-600'}`}
                >
                    <Text className="text-white text-center font-bold text-lg">
                        Continuar a Resumen
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Catalog Search Modal */}
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
                            <ActivityIndicator size="large" color="#7C3AED" className="mt-8" />
                        ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                            <View className="items-center py-8">
                                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">No se encontraron productos</Text>
                            </View>
                        ) : (
                            searchResults.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => handleMarketItemSelect(item, 'catalog')}
                                    className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
                                >
                                    <Text className="text-gray-800 font-medium">{item.display_name}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">{item.brand} • {item.en_tienda}</Text>
                                    <View className="flex-row items-center justify-between mt-2">
                                        <Text className="text-purple-600 font-bold">Ref: {formatPrice(item.mejor_precio)}</Text>
                                        <Ionicons name="add-circle" size={24} color="#7C3AED" />
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

            {/* Custom Price Modal */}
            <Modal visible={priceModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-lg font-bold text-gray-800 mb-2">Define tu precio</Text>
                        <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>
                            {pendingItem?.name}
                        </Text>

                        <View className="bg-purple-50 rounded-xl p-3 mb-4">
                            <Text className="text-purple-600 text-sm">
                                Precio de referencia: {formatPrice(pendingItem?.suggestedPrice || 0)}
                            </Text>
                        </View>

                        <Text className="text-gray-600 font-medium mb-2">Tu precio final:</Text>
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
                                    setPriceModalVisible(false);
                                    setPendingItem(null);
                                }}
                                className="flex-1 py-3 bg-gray-100 rounded-xl"
                            >
                                <Text className="text-gray-600 text-center font-medium">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmCustomPrice}
                                className="flex-1 py-3 bg-blue-600 rounded-xl"
                            >
                                <Text className="text-white text-center font-bold">Agregar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
