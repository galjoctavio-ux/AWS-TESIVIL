import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchProducts, getProductPrices, formatPrice } from '../../../../services/price-intelligence-service';
import type { ProductSearchResult, ProductPrice } from '../../../../services/supabase-client';

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<ProductSearchResult[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
    const [prices, setPrices] = useState<ProductPrice[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPrices, setLoadingPrices] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setLoading(true);
                try {
                    const results = await searchProducts(searchQuery);
                    setSuggestions(results);
                } catch (error) {
                    console.error('Search error:', error);
                }
                setLoading(false);
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load prices when product is selected
    const handleSelectProduct = async (product: ProductSearchResult) => {
        setSelectedProduct(product);
        setSuggestions([]);
        setSearchQuery(product.display_name);
        setLoadingPrices(true);

        try {
            const priceData = await getProductPrices(product.id);
            setPrices(priceData);
        } catch (error) {
            console.error('Error loading prices:', error);
        }
        setLoadingPrices(false);
    };

    const handleClear = () => {
        setSearchQuery('');
        setSuggestions([]);
        setSelectedProduct(null);
        setPrices([]);
    };

    const openUrl = (url: string) => {
        if (url) {
            Linking.openURL(url);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-teal-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-xl font-bold">Buscar y Comparar</Text>
                        <Text className="text-teal-200 text-sm">Encuentra el mejor precio</Text>
                    </View>
                </View>

                {/* Search Input */}
                <View className="bg-white rounded-2xl flex-row items-center px-4 py-3">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-gray-800 text-base"
                        placeholder="Buscar producto (ej: York, Mirage...)"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {(searchQuery.length > 0 || selectedProduct) && (
                        <TouchableOpacity onPress={handleClear}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Suggestions */}
                {suggestions.length > 0 && !selectedProduct && (
                    <View className="px-4 pt-4">
                        <Text className="text-gray-500 text-sm mb-2">Sugerencias</Text>
                        {suggestions.map((product, index) => (
                            <TouchableOpacity
                                key={product.id}
                                onPress={() => handleSelectProduct(product)}
                                className="bg-white rounded-xl p-4 mb-2 border border-gray-100 flex-row items-center"
                            >
                                <View className="bg-teal-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="cube" size={20} color="#14B8A6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium">{product.display_name}</Text>
                                    <Text className="text-gray-400 text-sm">{product.brand}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Loading */}
                {loading && (
                    <View className="items-center py-8">
                        <ActivityIndicator size="small" color="#14B8A6" />
                        <Text className="text-gray-500 mt-2">Buscando...</Text>
                    </View>
                )}

                {/* No results */}
                {searchQuery.length >= 2 && suggestions.length === 0 && !loading && !selectedProduct && (
                    <View className="items-center py-8 px-4">
                        <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-3 text-center">No se encontraron productos</Text>
                    </View>
                )}

                {/* Price Comparison */}
                {selectedProduct && (
                    <View className="px-4 pt-4">
                        <Text className="text-gray-800 font-bold text-lg mb-1">📊 Comparador de Precios</Text>
                        <Text className="text-gray-500 text-sm mb-4">{selectedProduct.display_name}</Text>

                        {loadingPrices ? (
                            <View className="items-center py-8">
                                <ActivityIndicator size="small" color="#14B8A6" />
                                <Text className="text-gray-500 mt-2">Cargando precios...</Text>
                            </View>
                        ) : prices.length === 0 ? (
                            <View className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <View className="flex-row items-center">
                                    <Ionicons name="alert-circle" size={24} color="#D97706" />
                                    <Text className="text-amber-700 ml-3">Producto sin stock hoy</Text>
                                </View>
                            </View>
                        ) : (
                            prices.map((price, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => openUrl(price.url)}
                                    className={`bg-white rounded-xl p-4 mb-2 border flex-row items-center ${index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-100'
                                        }`}
                                >
                                    <Text className="text-gray-400 font-bold w-6">{index + 1}.</Text>
                                    <View className="flex-1 ml-2">
                                        <Text className="text-gray-800 font-medium">{price.proveedor}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className={`font-bold text-lg ${index === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                            {formatPrice(price.precio)}
                                        </Text>
                                        {index === 0 && (
                                            <View className="bg-green-500 px-2 py-0.5 rounded-full ml-2">
                                                <Text className="text-white text-xs font-bold">★ Mejor</Text>
                                            </View>
                                        )}
                                        <Ionicons name="open-outline" size={16} color="#9CA3AF" className="ml-2" />
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}

                        {prices.length > 0 && (
                            <View className="bg-gray-50 rounded-xl p-3 mt-2">
                                <Text className="text-gray-400 text-xs text-center">
                                    ℹ️ Precios actualizados hoy. Toca un proveedor para ir a su tienda.
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Empty state initial */}
                {searchQuery.length < 2 && !selectedProduct && (
                    <View className="items-center py-16 px-8">
                        <View className="bg-teal-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                            <Ionicons name="search" size={40} color="#14B8A6" />
                        </View>
                        <Text className="text-gray-800 font-bold text-lg text-center mb-2">
                            Busca un producto
                        </Text>
                        <Text className="text-gray-500 text-center text-sm">
                            Escribe el nombre de un minisplit, marca o modelo para comparar precios entre proveedores.
                        </Text>
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
