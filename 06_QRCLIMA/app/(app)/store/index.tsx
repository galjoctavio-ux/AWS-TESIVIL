import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts, purchaseProduct, StoreProduct } from '../../../services/store-service';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile } from '../../../services/user-service';

export default function StoreCatalog() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [filter, setFilter] = useState<'Tokens' | 'MXN'>('Tokens');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        const [prods, userProfile] = await Promise.all([
            getProducts(filter),
            getUserProfile(user!.uid)
        ]);
        setProducts(prods);
        setBalance(userProfile?.tokenBalance || 0);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            if (user) loadData();
        }, [user, filter])
    );

    const handlePurchase = async (product: StoreProduct) => {
        // For MXN products (physical items), go to checkout
        if (product.currency === 'MXN') {
            router.push({
                pathname: '/store/checkout',
                params: {
                    productId: product.id,
                    productName: product.name,
                    productPrice: product.price.toString(),
                    isPhysical: (product.category === 'Merch' || product.category === 'Herramientas').toString(),
                }
            });
            return;
        }

        // For Token products, show confirmation alert
        Alert.alert(
            'Confirmar Canje',
            `¿Canjear ${product.name} por ${product.price} Tokens?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            setProcessingId(product.id);
                            const result = await purchaseProduct(user!.uid, product.id);
                            Alert.alert('¡Éxito!', result.message);
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        } finally {
                            setProcessingId(null);
                        }
                    }
                }
            ]
        );
    };

    const renderProduct = ({ item }: { item: StoreProduct }) => (
        <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden border border-gray-100 flex-1 m-1">
            <View className="h-32 bg-gray-100 items-center justify-center p-4">
                {/* Placeholder Icon logic since we don't have real images yet */}
                <Ionicons
                    name={item.category === 'Merch' ? 'shirt' : item.category === 'Digital' ? 'phone-portrait' : 'hammer'}
                    size={48}
                    color="#CBD5E1"
                />
            </View>
            <View className="p-3">
                <Text className="font-bold text-gray-800 text-sm mb-1 h-10" numberOfLines={2}>{item.name}</Text>

                <View className="flex-row items-center justify-between mt-2">
                    <Text className={`font-bold text-lg ${item.currency === 'Tokens' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {item.currency === 'Tokens' ? '🪙 ' : '$'}{item.price}
                    </Text>
                    {item.currency === 'MXN' && <Text className="text-gray-400 text-xs">MXN</Text>}
                </View>

                <TouchableOpacity
                    onPress={() => handlePurchase(item)}
                    disabled={!!processingId}
                    className={`mt-3 py-2 rounded-lg items-center ${item.currency === 'Tokens' ? 'bg-yellow-500' : 'bg-green-600'
                        } ${processingId ? 'opacity-50' : ''}`}
                >
                    {processingId === item.id ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text className="text-white font-bold text-xs uppercase">
                            {item.currency === 'Tokens' ? 'Canjear' : 'Comprar'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-indigo-900 pb-6 px-4 rounded-b-[30px] shadow-lg" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white">Tienda QRclima</Text>
                    <View className="bg-white/10 px-3 py-1 rounded-full flex-row items-center">
                        <Text className="text-yellow-400 mr-2">🪙</Text>
                        <Text className="text-white font-bold">{balance}</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View className="flex-row bg-indigo-800 p-1 rounded-xl">
                    <TouchableOpacity
                        onPress={() => setFilter('Tokens')}
                        className={`flex-1 py-2 rounded-lg items-center ${filter === 'Tokens' ? 'bg-yellow-500 shadow-md' : ''}`}
                    >
                        <Text className={`font-bold ${filter === 'Tokens' ? 'text-white' : 'text-indigo-300'}`}>Canjear (Tokens)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('MXN')}
                        className={`flex-1 py-2 rounded-lg items-center ${filter === 'MXN' ? 'bg-green-600 shadow-md' : ''}`}
                    >
                        <Text className={`font-bold ${filter === 'MXN' ? 'text-white' : 'text-indigo-300'}`}>Comprar (MXN)</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={item => item.id}
                    renderItem={renderProduct}
                    numColumns={2}
                    contentContainerStyle={{ padding: 16 }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-400 mt-10">No hay productos disponibles.</Text>
                    }
                />
            )}
        </View>
    );
}
