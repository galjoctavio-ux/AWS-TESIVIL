import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
    initializeTrainingData,
    getModulesByBlock,
    getOverallProgress,
    TrainingModule
} from '../../../services/training-service';
import { useAuth } from '../../../context/AuthContext';
import { getModulesByCategory } from '../../../services/training-service';

// Categorías disponibles
const CATEGORIES = [
    { id: 'all', label: 'Todos', icon: 'apps-outline' },
    { id: 'HVAC', label: 'HVAC', icon: 'snow-outline' },
    { id: 'Electricidad', label: 'Eléctrico', icon: 'flash-outline' },
    { id: 'Seguridad', label: 'Seguridad', icon: 'shield-outline' },
    { id: 'Negocio', label: 'Negocio', icon: 'briefcase-outline' },
    { id: 'Herramientas', label: 'Herramientas', icon: 'construct-outline' },
];

// Colores por nivel
const LEVEL_COLORS = {
    'Básico': { bg: 'bg-green-100', text: 'text-green-700', icon: '#16A34A' },
    'Intermedio': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '#CA8A04' },
    'Avanzado': { bg: 'bg-red-100', text: 'text-red-700', icon: '#DC2626' },
};

// Nombres de bloques
const BLOCK_NAMES: { [key: number]: string } = {
    1: 'Tendencias y Tecnología',
    2: 'Herramientas y Documentación',
    3: 'Termodinámica y Diagnóstico',
    4: 'Componentes y Fallas',
    5: 'Sistemas Inverter',
    6: 'Electrónica de Potencia',
    7: 'Electricidad Básica',
    8: 'Calidad de Energía',
};

interface BlockData {
    block: number;
    name: string;
    modules: TrainingModule[];
}

export default function TrainingFeed() {
    const router = useRouter();
    const { user } = useAuth();

    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBlock, setExpandedBlock] = useState<number | null>(1);
    const [overallProgress, setOverallProgress] = useState({ completedModules: 0, totalModules: 40 });
    const [blockStats, setBlockStats] = useState<{ [key: number]: { completed: number; total: number } }>({});
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [filteredModules, setFilteredModules] = useState<TrainingModule[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Inicializar datos si es primera vez
            await initializeTrainingData();

            // Cargar módulos por bloque
            const blocksData = await getModulesByBlock();
            setBlocks(blocksData);

            // Cargar progreso si hay usuario
            if (user?.uid) {
                const progress = await getOverallProgress(user.uid);
                setOverallProgress({
                    completedModules: progress.completedModules,
                    totalModules: progress.totalModules
                });

                // Mapear stats por bloque
                const stats: { [key: number]: { completed: number; total: number } } = {};
                progress.blockStats.forEach(s => {
                    stats[s.block] = { completed: s.completed, total: s.total };
                });
                setBlockStats(stats);
            }
        } catch (error) {
            console.error('Error loading training data:', error);
        }
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [user?.uid])
    );

    // Filter blocks when category changes
    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredModules([]);
        } else {
            const filtered = blocks.flatMap(b =>
                b.modules.filter(m => m.category === selectedCategory)
            );
            setFilteredModules(filtered);
        }
    }, [selectedCategory, blocks]);

    const handleModulePress = (module: TrainingModule) => {
        router.push(`/training/module/${module.id}` as any);
    };

    const toggleBlock = (blockNum: number) => {
        setExpandedBlock(expandedBlock === blockNum ? null : blockNum);
    };

    const renderModule = ({ item }: { item: TrainingModule }) => {
        const levelStyle = LEVEL_COLORS[item.level] || LEVEL_COLORS['Básico'];
        const isCompleted = false; // TODO: check from progress

        return (
            <TouchableOpacity
                onPress={() => handleModulePress(item)}
                className={`bg-white rounded-xl mb-3 p-4 border flex-row items-center ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100 shadow-sm'}`}
            >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${levelStyle.bg}`}>
                    <Ionicons name="book-outline" size={20} color={levelStyle.icon} />
                </View>

                <View className="flex-1">
                    <Text className="font-bold text-gray-800 text-sm" numberOfLines={2}>{item.title}</Text>
                    <View className="flex-row items-center mt-1">
                        <View className={`px-2 py-0.5 rounded mr-2 ${levelStyle.bg}`}>
                            <Text className={`text-[10px] font-medium ${levelStyle.text}`}>{item.level}</Text>
                        </View>
                        <Text className="text-gray-400 text-[10px]">{item.estimated_time_minutes} min</Text>
                        <Text className="text-yellow-600 font-bold text-[10px] ml-2">+{item.token_reward} Tokens</Text>
                    </View>
                </View>

                {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                )}
            </TouchableOpacity>
        );
    };

    const renderBlock = (blockData: BlockData) => {
        const isExpanded = expandedBlock === blockData.block;
        const stats = blockStats[blockData.block] || { completed: 0, total: blockData.modules.length };
        const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

        return (
            <View key={blockData.block} className="mb-4">
                <TouchableOpacity
                    onPress={() => toggleBlock(blockData.block)}
                    className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-gray-100 shadow-sm"
                >
                    <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
                            <Text className="text-indigo-700 font-bold">{blockData.block}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800">{BLOCK_NAMES[blockData.block] || blockData.name}</Text>
                            <View className="flex-row items-center mt-1">
                                <View className="flex-1 h-1.5 bg-gray-200 rounded-full mr-2">
                                    <View
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    />
                                </View>
                                <Text className="text-gray-500 text-xs">{stats.completed}/{stats.total}</Text>
                            </View>
                        </View>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#6B7280"
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View className="mt-2 ml-4">
                        <FlatList
                            data={blockData.modules}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderModule}
                            scrollEnabled={false}
                        />
                    </View>
                )}
            </View>
        );
    };

    const totalProgress = overallProgress.totalModules > 0
        ? (overallProgress.completedModules / overallProgress.totalModules) * 100
        : 0;

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-indigo-900 pt-12 pb-6 px-4 shadow-lg rounded-b-[30px] z-10">
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white">Capacitación QRclima</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Progress Card */}
                <View className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-indigo-100 font-bold text-xs">TU PROGRESO</Text>
                        <Text className="text-yellow-400 font-bold text-xs">
                            {overallProgress.completedModules}/{overallProgress.totalModules} COMPLETADOS
                        </Text>
                    </View>
                    <View className="h-2 bg-indigo-900/50 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${totalProgress}%` }}
                        />
                    </View>
                    <Text className="text-indigo-200 text-[10px] mt-2">
                        🏆 Completa todos los módulos para obtener la Insignia "Técnico Certificado QRclima"
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4 -mx-4 px-4"
                >
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            className={`flex-row items-center px-4 py-2 mr-2 rounded-full ${selectedCategory === cat.id
                                ? 'bg-indigo-600'
                                : 'bg-white border border-gray-200'
                                }`}
                        >
                            <Ionicons
                                name={cat.icon as any}
                                size={16}
                                color={selectedCategory === cat.id ? 'white' : '#6B7280'}
                            />
                            <Text className={`ml-2 font-medium ${selectedCategory === cat.id ? 'text-white' : 'text-gray-600'
                                }`}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text className="font-bold text-gray-800 text-lg mb-4">
                    {selectedCategory === 'all' ? '8 Bloques de Conocimiento' : `Categoría: ${selectedCategory}`}
                </Text>

                {loading ? (
                    <View className="items-center py-10">
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text className="text-gray-500 mt-2">Cargando módulos...</Text>
                    </View>
                ) : selectedCategory === 'all' ? (
                    blocks.map(renderBlock)
                ) : (
                    <View>
                        {filteredModules.length === 0 ? (
                            <View className="items-center py-10">
                                <Ionicons name="search-outline" size={40} color="#D1D5DB" />
                                <Text className="text-gray-400 mt-2">No hay módulos en esta categoría</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredModules}
                                keyExtractor={item => item.id.toString()}
                                renderItem={renderModule}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
