import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { getModelsByBrand, ModelData } from '../../../services/database-service';
import { Ionicons } from '@expo/vector-icons';

export default function ModelsScreen() {
    const router = useRouter();
    const { logoUrl, brandName } = useLocalSearchParams<{ logoUrl: string; brandName: string }>();
    const [models, setModels] = useState<ModelData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (logoUrl) {
            loadModels();
        }
    }, [logoUrl]);

    const loadModels = async () => {
        try {
            const data = await getModelsByBrand(logoUrl!);
            setModels(data);
        } catch (error) {
            console.error('Error loading models:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        if (!type) return 'bg-gray-100 text-gray-600';
        const lowerType = type.toLowerCase();
        if (lowerType.includes('inverter')) return 'bg-green-100 text-green-700';
        if (lowerType.includes('muro') || lowerType.includes('wall')) return 'bg-blue-100 text-blue-700';
        if (lowerType.includes('piso') || lowerType.includes('floor')) return 'bg-orange-100 text-orange-700';
        if (lowerType.includes('cassette')) return 'bg-purple-100 text-purple-700';
        return 'bg-gray-100 text-gray-600';
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
            'border-blue-400', 'border-purple-400', 'border-cyan-400', 'border-emerald-400',
            'border-orange-400', 'border-pink-400', 'border-indigo-400', 'border-teal-400'
        ];
        const borderColor = colors[index % colors.length];

        return (
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(app)/library/errors',
                    params: { modelId: item.id, modelName: item.name }
                })}
                className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border-l-4 ${borderColor}`}
            >
                <View className="flex-row items-center">
                    {/* Icon */}
                    <View className="bg-slate-100 w-14 h-14 rounded-xl items-center justify-center mr-4">
                        <Text className="text-3xl">{getModelIcon(item.name, item.type)}</Text>
                    </View>

                    {/* Info */}
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                        {item.type && (
                            <View className={`self-start px-2 py-0.5 rounded-full mt-1 ${getTypeColor(item.type).split(' ')[0]}`}>
                                <Text className={`text-xs font-medium ${getTypeColor(item.type).split(' ')[1]}`}>
                                    {item.type}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Arrow */}
                    <View className="bg-indigo-100 p-2 rounded-full">
                        <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-600 to-indigo-700 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg" style={{ backgroundColor: '#7C3AED' }}>
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-sm text-purple-200">Marca</Text>
                        <Text className="text-2xl font-bold text-white">{brandName || 'Modelos'}</Text>
                    </View>
                </View>

                <View className="bg-white/10 rounded-xl p-3 flex-row items-center mt-2">
                    <Ionicons name="cube-outline" size={20} color="#C4B5FD" />
                    <Text className="text-purple-200 ml-2">
                        {models.length} modelos disponibles
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#7C3AED" />
                        <Text className="text-gray-500 mt-4">Cargando modelos...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={models}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderModelItem}
                        ListHeaderComponent={
                            <Text className="text-lg font-bold text-gray-800 mb-3">
                                Selecciona un modelo
                            </Text>
                        }
                        ListEmptyComponent={
                            <View className="items-center mt-10">
                                <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-400 mt-4">No hay modelos disponibles</Text>
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
