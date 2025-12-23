import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { getUserCotizadorQuotes, CotizadorQuote, formatCurrency } from '../../../services/cotizador-service';

export default function CotizadorIndex() {
    const router = useRouter();
    const { user } = useAuth();
    const [quotes, setQuotes] = useState<CotizadorQuote[]>([]);
    const [loading, setLoading] = useState(true);

    const loadQuotes = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const loaded = await getUserCotizadorQuotes(user.uid);
            setQuotes(loaded);
        } catch (e) {
            console.error('Error loading quotes:', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadQuotes();
        }, [user])
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Sent': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const renderQuote = ({ item }: { item: CotizadorQuote }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm"
            onPress={() => router.push({
                pathname: '/(app)/cotizador/quote-summary',
                params: { quoteId: item.id }
            })}
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="font-bold text-gray-800 text-lg">{item.clientName}</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                        {item.items.length} concepto{item.items.length !== 1 ? 's' : ''} • {
                            item.createdAt?.seconds
                                ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('es-MX')
                                : 'Fecha pendiente'
                        }
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-green-600 font-bold text-lg">{formatCurrency(item.total)}</Text>
                    <View className={`px-2 py-0.5 rounded mt-1 ${getStatusColor(item.status).split(' ')[0]}`}>
                        <Text className={`text-[10px] uppercase font-medium ${getStatusColor(item.status).split(' ')[1]}`}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Cotizador Free</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/cotizador/concepts')}>
                    <Ionicons name="settings-outline" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View className="px-4 pt-4">
                <TouchableOpacity
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-center"
                    onPress={() => router.push('/(app)/cotizador/concepts')}
                >
                    <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                        <Ionicons name="construct" size={24} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-blue-800 text-base">Gestionar Conceptos</Text>
                        <Text className="text-blue-600 text-xs">Agrega tus conceptos de MO y Materiales</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#2563EB" />
                </TouchableOpacity>
            </View>

            {/* Quotes List */}
            <View className="flex-1 px-4 pt-4">
                <Text className="text-gray-500 font-medium text-sm mb-3">COTIZACIONES RECIENTES</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
                ) : (
                    <FlatList
                        data={quotes}
                        keyExtractor={item => item.id || Math.random().toString()}
                        renderItem={renderQuote}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-16 opacity-60">
                                <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-4 text-center font-medium">
                                    No tienes cotizaciones aún
                                </Text>
                                <Text className="text-gray-400 text-xs text-center mt-1">
                                    Primero carga tus conceptos y luego crea una cotización
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* FAB - Nueva Cotización */}
            <TouchableOpacity
                onPress={() => router.push('/(app)/cotizador/new-quote')}
                className="absolute bottom-8 right-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{ elevation: 5 }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
