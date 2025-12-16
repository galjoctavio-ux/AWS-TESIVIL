import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getThreads, SOSThread } from '../../../services/community-service';
import { useAuth } from '../../../context/AuthContext';

export default function CommunityFeed() {
    const router = useRouter();
    const { user } = useAuth();
    const [threads, setThreads] = useState<SOSThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'recent' | 'solved'>('recent');

    const loadThreads = async () => {
        setLoading(true);
        const data = await getThreads(filter);
        setThreads(data);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadThreads();
        }, [filter])
    );

    const renderThread = ({ item }: { item: SOSThread }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/(app)/community/[id]', params: { id: item.id } })}
            className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center">
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${item.authorRank === 'Pro' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                        <Text className="text-xs font-bold">
                            {item.authorName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-xs text-gray-500 font-medium">{item.authorName}</Text>
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

            <View className="flex-row items-center justify-between border-t border-gray-50 pt-2">
                <View className="flex-row items-center">
                    <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">{item.commentCount} respuestas</Text>
                </View>
                <Text className="text-gray-300 text-xs">Hace un momento</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10">
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Comunidad SOS</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Filter Tabs */}
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
            </View>

            {/* List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={threads}
                    keyExtractor={item => item.id}
                    renderItem={renderThread}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                            <Text className="text-gray-400 mt-4 text-center px-10">
                                Sé el primero en preguntar. La comunidad está lista para ayudar.
                            </Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                onPress={() => router.push('/(app)/community/new')}
                className="absolute bottom-6 right-6 bg-red-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
