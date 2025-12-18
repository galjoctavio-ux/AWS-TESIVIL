import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getBrands, BrandData, searchErrorsInModel, ErrorCodeData } from '../../../services/database-service';
import { Ionicons } from '@expo/vector-icons';

// Mapeo de logos de las 4 marcas principales
const brandLogos: { [key: string]: any } = {
    'MIRAGE': require('../../../assets/logos/Mirage-Logo.png'),  // Mirage flagship model as brand logo
    'YORK': require('../../../assets/logos/york_logo.png'),
    'LG': require('../../../assets/logos/logo_lg.png'),
    'CARRIER': require('../../../assets/logos/carrier_logo.png'),
};

// Colores por marca para un diseño visual distintivo
const brandColors: { [key: string]: string } = {
    'MIRAGE': '#3B82F6',   // Azul
    'YORK': '#10B981',     // Verde
    'LG': '#EF4444',       // Rojo
    'CARRIER': '#F97316',  // Naranja
};

// Fallback icon para marcas sin logo específico
const defaultBrandIcon = '❄️';

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

    const getBrandLogoSource = (name: string) => {
        // Direct lookup by brand name (uppercase)
        if (brandLogos[name]) {
            return brandLogos[name];
        }
        return null;
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
        // Use brand-specific color
        const bgColor = brandColors[item.name] || '#3B82F6';
        const logoSource = getBrandLogoSource(item.name);

        return (
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(app)/library/models',
                    params: { brandName: item.name }
                })}
                style={{
                    flex: 1,
                    margin: 8,
                    borderRadius: 20,
                    padding: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 160,
                    maxWidth: '46%',
                    backgroundColor: bgColor,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 5,
                }}
            >
                {logoSource ? (
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        padding: 8,
                        marginBottom: 8,
                        width: 60,
                        height: 60,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image
                            source={logoSource}
                            style={{ width: 44, height: 44 }}
                            resizeMode="contain"
                        />
                    </View>
                ) : (
                    <Text style={{ fontSize: 36, marginBottom: 8 }}>{getBrandIcon(item.name)}</Text>
                )}
                <Text
                    style={{
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: 16
                    }}
                    numberOfLines={2}
                >
                    {item.displayName || item.name}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 }}>
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
            style={{
                backgroundColor: 'white',
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                borderLeftWidth: 4,
                borderLeftColor: '#EF4444',
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                    backgroundColor: '#FEE2E2',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                    marginRight: 12,
                }}>
                    <Text style={{ color: '#DC2626', fontWeight: 'bold', fontSize: 18 }}>{item.code}</Text>
                </View>
            </View>
            <Text style={{ color: '#374151' }} numberOfLines={2}>{item.description}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#4F46E5',
                paddingTop: 48,
                paddingBottom: 24,
                paddingHorizontal: 24,
                borderBottomLeftRadius: 30,
                borderBottomRightRadius: 30,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Biblioteca de Errores</Text>
                        <Text style={{ color: '#A5B4FC' }}>Diagnóstico Offline</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setSearchMode(!searchMode)}
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: 10,
                            borderRadius: 20
                        }}
                    >
                        <Ionicons name={searchMode ? "grid" : "search"} size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                {searchMode && (
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 10
                    }}>
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Buscar código de error (ej: E1, F2)..."
                            placeholderTextColor="#9CA3AF"
                            style={{ flex: 1, marginLeft: 12, color: '#1F2937' }}
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
                    <View style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 16,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Ionicons name="airplane" size={20} color="#A5B4FC" />
                        <Text style={{ color: '#C7D2FE', marginLeft: 8, flex: 1 }}>
                            Funciona sin conexión a internet
                        </Text>
                        <View style={{ backgroundColor: '#22C55E', width: 8, height: 8, borderRadius: 4 }} />
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={{ flex: 1, padding: 16 }}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text style={{ color: '#6B7280', marginTop: 16 }}>Cargando marcas...</Text>
                    </View>
                ) : searchMode ? (
                    // Search Results
                    <View style={{ flex: 1 }}>
                        {searching ? (
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <ActivityIndicator size="small" color="#4F46E5" />
                                <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Buscando...</Text>
                            </View>
                        ) : searchQuery.length > 1 ? (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => `${item.model_id}-${item.code}`}
                                renderItem={renderSearchResult}
                                ListEmptyComponent={
                                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                                        <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                                        <Text style={{ color: '#9CA3AF', marginTop: 16 }}>No se encontraron resultados</Text>
                                    </View>
                                }
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        ) : (
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <Ionicons name="keypad-outline" size={48} color="#9CA3AF" />
                                <Text style={{ color: '#9CA3AF', marginTop: 16 }}>Escribe un código de error</Text>
                                <Text style={{ color: '#D1D5DB', fontSize: 12 }}>Ej: E1, E2, F3, H6...</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    // Brand Grid
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
                            Selecciona una marca
                        </Text>
                        <FlatList
                            data={brands}
                            numColumns={2}
                            keyExtractor={(item) => item.name}
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
