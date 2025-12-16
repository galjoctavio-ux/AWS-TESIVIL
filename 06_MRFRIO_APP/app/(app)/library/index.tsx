import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getBrands, BrandData, searchErrorsInModel, ErrorCodeData } from '../../../services/database-service';
import { Ionicons } from '@expo/vector-icons';

export default function LibraryIndex() {
    const router = useRouter();
    const [brands, setBrands] = useState<BrandData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ErrorCodeData[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadBrands();
    }, []);

    useEffect(() => {
        if (searchQuery.length > 1) {
            setSearching(true);
            searchErrorsInModel(searchQuery).then((results) => {
                setSearchResults(results);
                setSearching(false);
            });
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const loadBrands = async () => {
        try {
            const data = await getBrands();
            setBrands(data);
        } catch (error) {
            console.error('Error loading brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatBrandName = (name: string) => {
        // Capitalize and clean the brand name
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getBrandIcon = (name: string) => {
        // Return an icon based on brand name patterns
        const lowerName = name.toLowerCase();
        if (lowerName.includes('mirage') || lowerName.includes('magnum')) return '❄️';
        if (lowerName.includes('carrier')) return '🏢';
        if (lowerName.includes('lg')) return '📺';
        if (lowerName.includes('samsung')) return '📱';
        if (lowerName.includes('york')) return '🏭';
        if (lowerName.includes('inverter')) return '⚡';
        return '🌀';
    };

    const renderBrandItem = ({ item, index }: { item: BrandData; index: number }) => {
        const colors = [
            'bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500',
            'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ];
        const bgColor = colors[index % colors.length];

        return (
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(app)/library/models',
                    params: { logoUrl: item.logo_url, brandName: formatBrandName(item.name) }
                })}
                className={`flex-1 m-1.5 rounded-2xl p-4 items-center justify-center min-h-[120px] ${bgColor}`}
                style={{ maxWidth: '31%' }}
            >
                <Text className="text-4xl mb-2">{getBrandIcon(item.name)}</Text>
                <Text className="text-white font-bold text-center text-sm" numberOfLines={2}>
                    {formatBrandName(item.name)}
                </Text>
                <Text className="text-white/70 text-xs mt-1">
                    {item.model_count} modelos
                </Text>
            </TouchableOpacity>
        );
    };

    const renderSearchResult = ({ item }: { item: ErrorCodeData }) => (
        <TouchableOpacity
            onPress={() => router.push({
                pathname: '/(app)/library/errors',
                params: { modelId: item.model_id, highlightCode: item.code }
            })}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border-l-4 border-red-500"
        >
            <View className="flex-row items-center mb-2">
                <View className="bg-red-100 px-3 py-1 rounded-full mr-3">
                    <Text className="text-red-600 font-bold text-lg">{item.code}</Text>
                </View>
            </View>
            <Text className="text-gray-700" numberOfLines={2}>{item.description}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg" style={{ backgroundColor: '#4F46E5' }}>
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-white">Biblioteca de Errores</Text>
                        <Text className="text-indigo-200">Diagnóstico Offline</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setSearchMode(!searchMode)}
                        className="bg-white/20 p-2 rounded-full"
                    >
                        <Ionicons name={searchMode ? "grid" : "search"} size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                {searchMode && (
                    <View className="bg-white rounded-xl flex-row items-center px-4 py-2">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Buscar código de error (ej: E1, F2)..."
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 ml-3 text-gray-800"
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {!searchMode && (
                    <View className="bg-white/10 rounded-xl p-3 flex-row items-center">
                        <Ionicons name="airplane" size={20} color="#A5B4FC" />
                        <Text className="text-indigo-200 ml-2 flex-1">
                            Funciona sin conexión a internet
                        </Text>
                        <View className="bg-green-500 w-2 h-2 rounded-full" />
                    </View>
                )}
            </View>

            {/* Content */}
            <View className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text className="text-gray-500 mt-4">Cargando marcas...</Text>
                    </View>
                ) : searchMode ? (
                    // Search Results
                    <View className="flex-1">
                        {searching ? (
                            <View className="items-center mt-10">
                                <ActivityIndicator size="small" color="#4F46E5" />
                                <Text className="text-gray-400 mt-2">Buscando...</Text>
                            </View>
                        ) : searchQuery.length > 1 ? (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => `${item.model_id}-${item.code}`}
                                renderItem={renderSearchResult}
                                ListEmptyComponent={
                                    <View className="items-center mt-10">
                                        <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                                        <Text className="text-gray-400 mt-4">No se encontraron resultados</Text>
                                    </View>
                                }
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        ) : (
                            <View className="items-center mt-10">
                                <Ionicons name="keypad-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-400 mt-4">Escribe un código de error</Text>
                                <Text className="text-gray-300 text-sm">Ej: E1, E2, F3, H6...</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    // Brand Grid
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-3">
                            Selecciona una marca
                        </Text>
                        <FlatList
                            data={brands}
                            numColumns={3}
                            keyExtractor={(item) => item.logo_url}
                            renderItem={renderBrandItem}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}
