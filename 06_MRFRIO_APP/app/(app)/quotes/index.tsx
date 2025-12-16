import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import { Quote } from '../../../services/quotes-service';

export default function QuotesIndex() {
    const router = useRouter();
    const { user } = useAuth();
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadQuotes = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'quotes'),
                where('userId', '==', user.uid),
                // orderBy('createdAt', 'desc'), // Requires index, simplifying for now
                limit(20)
            );
            const snapshot = await getDocs(q);
            const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setQuotes(loaded);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadQuotes();
        }, [user])
    );

    const renderQuote = ({ item }: { item: any }) => (
        <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm flex-row justify-between items-center">
            <View>
                <Text className="font-bold text-gray-800 text-lg">{item.clientName}</Text>
                <Text className="text-gray-500 text-xs">
                    {item.items?.length || 0} items • {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
                </Text>
            </View>
            <View className="items-end">
                <Text className="text-green-600 font-bold text-lg">${item.total?.toFixed(2)}</Text>
                <View className="bg-gray-100 px-2 py-0.5 rounded">
                    <Text className="text-gray-500 text-[10px] uppercase">{item.status || 'Draft'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50 relative">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Cotizaciones</Text>
                <View style={{ width: 24 }} />
            </View>

            <View className="flex-1 p-4">
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
                ) : (
                    <FlatList
                        data={quotes}
                        keyExtractor={item => item.id}
                        renderItem={renderQuote}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20 opacity-50">
                                <Ionicons name="document-text-outline" size={64} color="gray" />
                                <Text className="text-gray-500 mt-4 text-center">No tienes cotizaciones.</Text>
                                <Text className="text-gray-400 text-xs text-center">Usa el botón + para crear una.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* FAB */}
            <TouchableOpacity
                onPress={() => router.push('/(app)/quotes/wizard')}
                className="absolute bottom-8 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg border-2 border-white/20"
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
