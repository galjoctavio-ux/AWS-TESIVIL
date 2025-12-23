import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { getErrorsByModel, searchErrorsInModel, ErrorCodeData, getModelById, ModelData } from '../../../services/database-service';
import { Ionicons } from '@expo/vector-icons';

export default function ErrorsScreen() {
    const router = useRouter();
    const { modelId, modelName, highlightCode } = useLocalSearchParams<{
        modelId: string;
        modelName?: string;
        highlightCode?: string;
    }>();

    const [model, setModel] = useState<ModelData | null>(null);
    const [errors, setErrors] = useState<ErrorCodeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredErrors, setFilteredErrors] = useState<ErrorCodeData[]>([]);
    const [selectedError, setSelectedError] = useState<ErrorCodeData | null>(null);

    useEffect(() => {
        if (modelId) {
            loadData();
        }
    }, [modelId]);

    useEffect(() => {
        if (searchQuery.length > 0) {
            const filtered = errors.filter(e =>
                e.code.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredErrors(filtered);
        } else {
            setFilteredErrors(errors);
        }
    }, [searchQuery, errors]);

    useEffect(() => {
        // Auto-select highlighted error if provided
        if (highlightCode && errors.length > 0) {
            const found = errors.find(e => e.code === highlightCode);
            if (found) {
                setSelectedError(found);
            }
        }
    }, [highlightCode, errors]);

    const loadData = async () => {
        try {
            const [modelData, errorsData] = await Promise.all([
                getModelById(parseInt(modelId!)),
                getErrorsByModel(parseInt(modelId!))
            ]);
            setModel(modelData);
            setErrors(errorsData);
            setFilteredErrors(errorsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatSolution = (solution: string) => {
        if (!solution) return [];
        // Split by bullet points or new lines
        return solution
            .split(/[•\n]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    };

    const renderErrorChip = ({ item }: { item: ErrorCodeData }) => {
        const isSelected = selectedError?.id === item.id;
        return (
            <TouchableOpacity
                onPress={() => setSelectedError(item)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${isSelected
                    ? 'bg-red-500'
                    : 'bg-white border border-gray-200'
                    }`}
            >
                <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                    {item.code}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-gradient-to-br from-red-500 to-orange-600 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg" style={{ backgroundColor: '#EF4444' }}>
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-sm text-red-200">Códigos de Error</Text>
                        <Text className="text-2xl font-bold text-white" numberOfLines={1}>
                            {modelName || model?.name || 'Modelo'}
                        </Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-white rounded-xl flex-row items-center px-4 py-2">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Buscar código (ej: E1, F2)..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-gray-800"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#EF4444" />
                    <Text className="text-gray-500 mt-4">Cargando códigos de error...</Text>
                </View>
            ) : (
                <View className="flex-1 p-4">
                    {/* Error Code Chips */}
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-gray-600 mb-2">
                            {filteredErrors.length} códigos encontrados
                        </Text>
                        <FlatList
                            data={filteredErrors}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderErrorChip}
                            contentContainerStyle={{ paddingBottom: 8 }}
                        />
                    </View>

                    {/* Selected Error Detail Card */}
                    {selectedError ? (
                        <ScrollView
                            className="flex-1"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Error Code Header */}
                            <View className="bg-red-500 rounded-t-2xl p-4">
                                <View className="flex-row items-center">
                                    <View className="bg-white px-4 py-2 rounded-full mr-4">
                                        <Text className="text-red-500 font-bold text-2xl">
                                            {selectedError.code}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-bold text-lg">Código de Error</Text>
                                        <Text className="text-red-100 text-sm">{model?.name}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Description */}
                            <View className="bg-white p-5 border-b border-gray-100">
                                <View className="flex-row items-center mb-3">
                                    <View className="bg-amber-100 p-2 rounded-full mr-3">
                                        <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                                    </View>
                                    <Text className="text-lg font-bold text-gray-800">Descripción</Text>
                                </View>
                                <Text className="text-gray-700 leading-6">
                                    {selectedError.description}
                                </Text>
                            </View>

                            {/* Solution */}
                            <View className="bg-white p-5 rounded-b-2xl shadow-sm">
                                <View className="flex-row items-center mb-4">
                                    <View className="bg-green-100 p-2 rounded-full mr-3">
                                        <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                                    </View>
                                    <Text className="text-lg font-bold text-gray-800">Solución</Text>
                                </View>

                                {formatSolution(selectedError.solution).map((step, index) => (
                                    <View key={index} className="flex-row mb-3">
                                        <View className="bg-green-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                                            <Text className="text-white text-xs font-bold">{index + 1}</Text>
                                        </View>
                                        <Text className="text-gray-700 flex-1 leading-6">{step}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Spacer */}
                            <View className="h-6" />
                        </ScrollView>
                    ) : (
                        <View className="flex-1 justify-center items-center">
                            <View className="bg-gray-100 p-6 rounded-full mb-4">
                                <Ionicons name="hand-left-outline" size={48} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-500 text-lg font-medium">Selecciona un código</Text>
                            <Text className="text-gray-400 text-center mt-2 px-8">
                                Toca uno de los códigos de arriba para ver la descripción y solución
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}
