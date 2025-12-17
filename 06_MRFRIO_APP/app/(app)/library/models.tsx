import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { getModelsByBrand, ModelData } from '../../../services/database-service';
import { Ionicons } from '@expo/vector-icons';

// Mapeo de imágenes de modelos/equipos
const modelImages: { [key: string]: any } = {
    'absolutv': require('../../../assets/equipos/absolutv.png'),
    'abtx': require('../../../assets/equipos/abtx.png'),
    'abtx36': require('../../../assets/equipos/abtx36.png'),
    'bluplus': require('../../../assets/equipos/bluplus.png'),
    'ciseries': require('../../../assets/equipos/ciseries.png'),
    'flex': require('../../../assets/equipos/flex.png'),
    'flux': require('../../../assets/equipos/flux.png'),
    'flux_electric': require('../../../assets/equipos/flux_electric.png'),
    'i17': require('../../../assets/equipos/i17.png'),
    'inverter_v32': require('../../../assets/equipos/inverter_v32.png'),
    'inverter_x32': require('../../../assets/equipos/inverter_x32.png'),
    'inverterq17': require('../../../assets/equipos/inverterq17.png'),
    'inverterx': require('../../../assets/equipos/inverterx.png'),
    'life12': require('../../../assets/equipos/life12.png'),
    'life12_plus': require('../../../assets/equipos/life12_plus.png'),
    'lifeplus': require('../../../assets/equipos/lifeplus.png'),
    'live': require('../../../assets/equipos/live.png'),
    'm19_platinum': require('../../../assets/equipos/m19_platinum.png'),
    'm900xeries': require('../../../assets/equipos/m900xeries.png'),
    'magnum13': require('../../../assets/equipos/magnum13.png'),
    'magnum15': require('../../../assets/equipos/magnum15.png'),
    'magnum16': require('../../../assets/equipos/magnum16.png'),
    'magnum17': require('../../../assets/equipos/magnum17.png'),
    'magnum18': require('../../../assets/equipos/magnum18.png'),
    'magnum19': require('../../../assets/equipos/magnum19.png'),
    'magnum20': require('../../../assets/equipos/magnum20.png'),
    'magnum21': require('../../../assets/equipos/magnum21.png'),
    'magnum21_platinum': require('../../../assets/equipos/magnum21_platinum.png'),
    'magnum22': require('../../../assets/equipos/magnum22.png'),
    'magnum30': require('../../../assets/equipos/magnum30.png'),
    'magnum32': require('../../../assets/equipos/magnum32.png'),
    'matt17': require('../../../assets/equipos/matt17.png'),
    'max053': require('../../../assets/equipos/max053.png'),
    'mpt-indoor': require('../../../assets/equipos/mpt-indoor.png'),
    'mpt-outdoor': require('../../../assets/equipos/mpt-outdoor.png'),
    'neo': require('../../../assets/equipos/neo.png'),
    'nex': require('../../../assets/equipos/nex.png'),
    'smart': require('../../../assets/equipos/smart.png'),
    'titanium2': require('../../../assets/equipos/titanium2.png'),
    'titanium5': require('../../../assets/equipos/titanium5.png'),
    'titanium7': require('../../../assets/equipos/titanium7.png'),
    'titanium8': require('../../../assets/equipos/titanium8.png'),
    'titanium9': require('../../../assets/equipos/titanium9.png'),
    'turboflux': require('../../../assets/equipos/turboflux.png'),
    'uvc': require('../../../assets/equipos/uvc.png'),
    'vluseries': require('../../../assets/equipos/vluseries.png'),
    'vox': require('../../../assets/equipos/vox.png'),
    'x2': require('../../../assets/equipos/x2.png'),
    'x3': require('../../../assets/equipos/x3.png'),
    'xlife': require('../../../assets/equipos/xlife.png'),
    'xmart': require('../../../assets/equipos/xmart.png'),
    'xmax': require('../../../assets/equipos/xmax.png'),
    'xone': require('../../../assets/equipos/xone.png'),
    'xplus': require('../../../assets/equipos/xplus.png'),
    'xr': require('../../../assets/equipos/xr.png'),
    'xtra_multinverter': require('../../../assets/equipos/xtra_multinverter.png'),
};

export default function ModelsScreen() {
    const router = useRouter();
    const { brandName } = useLocalSearchParams<{ brandName: string }>();
    const [models, setModels] = useState<ModelData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (brandName) {
            loadModels();
        }
    }, [brandName]);

    const loadModels = async () => {
        try {
            const data = await getModelsByBrand(brandName!);
            setModels(data);
        } catch (error) {
            console.error('Error loading models:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        if (!type) return { bg: '#F3F4F6', text: '#4B5563' };
        const lowerType = type.toLowerCase();
        if (lowerType.includes('inverter')) return { bg: '#DCFCE7', text: '#15803D' };
        if (lowerType.includes('muro') || lowerType.includes('wall')) return { bg: '#DBEAFE', text: '#1D4ED8' };
        if (lowerType.includes('piso') || lowerType.includes('floor')) return { bg: '#FFEDD5', text: '#C2410C' };
        if (lowerType.includes('cassette')) return { bg: '#F3E8FF', text: '#7C3AED' };
        return { bg: '#F3F4F6', text: '#4B5563' };
    };

    const getModelImageSource = (name: string, imageUrl?: string) => {
        // Normalize the name for lookup
        const normalizedName = name.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/-/g, '')
            .replace(/_/g, '');

        // Try direct match first
        if (modelImages[normalizedName]) {
            return modelImages[normalizedName];
        }

        // Try with underscores
        const underscoreName = name.toLowerCase().replace(/\s+/g, '_');
        if (modelImages[underscoreName]) {
            return modelImages[underscoreName];
        }

        // Try partial match for common patterns
        for (const key of Object.keys(modelImages)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                return modelImages[key];
            }
        }

        return null;
    };

    const getModelIcon = (name: string, type: string) => {
        const lowerName = name.toLowerCase();
        const lowerType = (type || '').toLowerCase();

        if (lowerType.includes('inverter') || lowerName.includes('inverter')) return '⚡';
        if (lowerName.includes('magnum')) return '💪';
        if (lowerName.includes('titanium')) return '🛡️';
        if (lowerName.includes('life')) return '🌿';
        if (lowerName.includes('smart')) return '🤖';
        if (lowerName.includes('neo') || lowerName.includes('nex')) return '🔮';
        if (lowerName.includes('flux') || lowerName.includes('turbo')) return '🌪️';
        return '❄️';
    };

    const renderModelItem = ({ item, index }: { item: ModelData; index: number }) => {
        const colors = [
            '#3B82F6', '#8B5CF6', '#06B6D4', '#10B981',
            '#F97316', '#EC4899', '#6366F1', '#14B8A6'
        ];
        const borderColor = colors[index % colors.length];
        const typeColors = getTypeColor(item.type);
        const imageSource = getModelImageSource(item.name, item.image_url);

        return (
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(app)/library/errors',
                    params: { modelId: item.id, modelName: item.name }
                })}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                    borderLeftWidth: 4,
                    borderLeftColor: borderColor,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Image or Icon */}
                    <View style={{
                        backgroundColor: '#F1F5F9',
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16
                    }}>
                        {imageSource ? (
                            <Image
                                source={imageSource}
                                style={{ width: 52, height: 52 }}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text style={{ fontSize: 32 }}>{getModelIcon(item.name, item.type)}</Text>
                        )}
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1F2937' }}>{item.name}</Text>
                        {item.type && (
                            <View style={{
                                alignSelf: 'flex-start',
                                paddingHorizontal: 10,
                                paddingVertical: 3,
                                borderRadius: 16,
                                marginTop: 6,
                                backgroundColor: typeColors.bg,
                            }}>
                                <Text style={{ fontSize: 11, fontWeight: '500', color: typeColors.text }}>
                                    {item.type}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Arrow */}
                    <View style={{
                        backgroundColor: '#EEF2FF',
                        padding: 10,
                        borderRadius: 20
                    }}>
                        <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#7C3AED',
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
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: '#DDD6FE' }}>Marca</Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{brandName || 'Modelos'}</Text>
                    </View>
                </View>

                <View style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                }}>
                    <Ionicons name="cube-outline" size={20} color="#C4B5FD" />
                    <Text style={{ color: '#DDD6FE', marginLeft: 8 }}>
                        {models.length} modelos disponibles
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View style={{ flex: 1, padding: 16 }}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#7C3AED" />
                        <Text style={{ color: '#6B7280', marginTop: 16 }}>Cargando modelos...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={models}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderModelItem}
                        ListHeaderComponent={
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
                                Selecciona un modelo
                            </Text>
                        }
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                                <Text style={{ color: '#9CA3AF', marginTop: 16 }}>No hay modelos disponibles</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}
