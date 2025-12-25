import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThreads, searchThreads, SOSThread } from '../../../services/community-service';
import { useAuth } from '../../../context/AuthContext';
import { formatTimeAgo } from '../../../utils/date-utils';
import { UserRank } from '../../../services/user-service';

// Componente de Insignia según Rango
const RankBadge = ({ rank, isPro = false }: { rank: UserRank; isPro?: boolean }) => {
    const getBadgeConfig = () => {
        if (isPro) {
            return {
                icon: 'star' as const,
                label: 'PRO',
                bgColor: 'bg-amber-500',
                textColor: 'text-white',
                iconColor: '#FFFFFF',
            };
        }
        switch (rank) {
            case 'Experto':
                return {
                    icon: 'shield-checkmark' as const,
                    label: 'Experto',
                    bgColor: 'bg-purple-600',
                    textColor: 'text-white',
                    iconColor: '#FFFFFF',
                };
            case 'Técnico':
                return {
                    icon: 'construct' as const,
                    label: 'Técnico',
                    bgColor: 'bg-blue-500',
                    textColor: 'text-white',
                    iconColor: '#FFFFFF',
                };
            case 'Novato':
            default:
                return {
                    icon: 'leaf' as const,
                    label: 'Novato',
                    bgColor: 'bg-green-500',
                    textColor: 'text-white',
                    iconColor: '#FFFFFF',
                };
        }
    };

    const config = getBadgeConfig();

    return (
        <View className={`flex-row items-center px-2 py-0.5 rounded-full ${config.bgColor} ml-1`}>
            <Ionicons name={config.icon} size={10} color={config.iconColor} />
            <Text className={`text-[10px] font-bold ml-0.5 ${config.textColor}`}>{config.label}</Text>
        </View>
    );
};

export default function CommunityFeed() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [threads, setThreads] = useState<SOSThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'recent' | 'solved'>('recent');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SOSThread[]>([]);
    const [searching, setSearching] = useState(false);

    // Debounced search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        const timer = setTimeout(async () => {
            const results = await searchThreads(searchQuery);
            setSearchResults(results);
            setSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadThreads = async (page: number = 1) => {
        try {
            setLoading(true);
            const result = await getThreads(filter, page);
            setThreads(result.threads);
            setCurrentPage(result.currentPage);
            setTotalPages(result.totalPages);
        } catch (error) {
            console.error('Error loading threads:', error);
            setThreads([]);
        } finally {
            setLoading(false);
        }
    };



    // Refresh when screen comes into focus and when filter changes
    useFocusEffect(
        useCallback(() => {
            loadThreads(1);
        }, [filter])
    );

    const renderThread = ({ item }: { item: SOSThread }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/(app)/community/[id]', params: { id: item.id } })}
            className={`bg-white p-4 rounded-xl mb-3 shadow-sm ${item.isPinned
                ? 'border-2 border-amber-400'
                : 'border border-gray-100'
                }`}
        >
            {/* Pinned Badge */}
            {item.isPinned && (
                <View className="flex-row items-center mb-2 bg-amber-100 self-start px-2 py-1 rounded-full">
                    <Ionicons name="pin" size={12} color="#D97706" />
                    <Text className="text-amber-700 text-[10px] font-bold ml-1">Fijado</Text>
                </View>
            )}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center">
                    {item.authorPhotoURL ? (
                        <Image
                            source={{ uri: item.authorPhotoURL }}
                            className="w-8 h-8 rounded-full mr-2"
                        />
                    ) : (
                        <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${item.authorRank === 'Experto' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                            <Text className="text-xs font-bold">
                                {item.authorName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View>
                        <View className="flex-row items-center">
                            <Text className="text-xs text-gray-500 font-medium">{item.authorName}</Text>
                            <RankBadge rank={item.authorRank} isPro={item.authorIsPro} />
                        </View>
                        <Text className="text-[10px] text-gray-400">{item.brand} • {item.model}</Text>
                    </View>
                </View>
                {item.status === 'Resuelto' && (
                    <View className="bg-green-100 px-2 py-0.5 rounded flex-row items-center">
                        <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                        <Text className="text-green-700 text-[10px] ml-1 font-bold">Resuelto</Text>
                    </View>
                )}
            </View>

            <Text className="font-bold text-gray-800 text-base mb-1">{item.title}</Text>
            <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                {item.content}
            </Text>

            {/* Thread Image Thumbnail */}
            {item.imageUrl && (
                <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-32 rounded-lg mb-3"
                    resizeMode="cover"
                />
            )}

            <View className="flex-row items-center justify-between border-t border-gray-50 pt-2">
                <View className="flex-row items-center">
                    <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">{item.commentCount} respuestas</Text>
                </View>
                <Text className="text-gray-300 text-xs">{formatTimeAgo(item.createdAt)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pb-4 px-4 shadow-sm z-10" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Comunidad SOS</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mb-3">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-700"
                        placeholder="Buscar casos (marca, error, síntoma...)"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Tabs - only show when not searching */}
                {searchQuery.length < 2 && (
                    <View className="flex-row bg-gray-100 p-1 rounded-xl">
                        <TouchableOpacity
                            onPress={() => setFilter('recent')}
                            className={`flex-1 py-2 rounded-lg items-center ${filter === 'recent' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`font-medium ${filter === 'recent' ? 'text-blue-600' : 'text-gray-500'}`}>Recientes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilter('solved')}
                            className={`flex-1 py-2 rounded-lg items-center ${filter === 'solved' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`font-medium ${filter === 'solved' ? 'text-green-600' : 'text-gray-500'}`}>Resueltos</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Search Results Header */}
            {searchQuery.length >= 2 && (
                <View className="px-4 pt-2">
                    <Text className="text-gray-500 text-sm">
                        {searching ? 'Buscando...' : `${searchResults.length} resultados para "${searchQuery}"`}
                    </Text>
                </View>
            )}

            {/* List */}
            {loading || searching ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={searchQuery.length >= 2 ? searchResults : threads}
                    keyExtractor={item => item.id || Math.random().toString()}
                    renderItem={renderThread}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Ionicons name={searchQuery.length >= 2 ? "search-outline" : "people-outline"} size={64} color="#CBD5E1" />
                            <Text className="text-gray-400 mt-4 text-center px-10">
                                {searchQuery.length >= 2
                                    ? 'No se encontraron casos. ¡Crea uno nuevo!'
                                    : 'Sé el primero en preguntar. La comunidad está lista para ayudar.'}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        searchQuery.length < 2 && totalPages > 1 ? (
                            <View className="flex-row items-center justify-center py-4 mb-10">
                                <TouchableOpacity
                                    onPress={() => loadThreads(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className={`px-4 py-2 rounded-lg mr-2 ${currentPage <= 1 ? 'bg-gray-200' : 'bg-blue-500'}`}
                                >
                                    <Ionicons name="chevron-back" size={20} color={currentPage <= 1 ? '#9CA3AF' : '#FFFFFF'} />
                                </TouchableOpacity>

                                <Text className="text-gray-600 font-medium mx-4">
                                    Página {currentPage} de {totalPages}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => loadThreads(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                    className={`px-4 py-2 rounded-lg ml-2 ${currentPage >= totalPages ? 'bg-gray-200' : 'bg-blue-500'}`}
                                >
                                    <Ionicons name="chevron-forward" size={20} color={currentPage >= totalPages ? '#9CA3AF' : '#FFFFFF'} />
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                onPress={() => router.push('/(app)/community/new')}
                className="absolute right-6 bg-red-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{ bottom: insets.bottom + 24 }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
