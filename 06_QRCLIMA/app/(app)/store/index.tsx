import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts, purchaseProduct, StoreProduct, canPurchaseProWeek } from '../../../services/store-service';
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
    const [proWeekBlocked, setProWeekBlocked] = useState<{ blocked: boolean; waitDays?: number }>({ blocked: false });

    const loadData = async () => {
        if (filter === 'MXN') return; // Skip for MXN - coming soon
        setLoading(true);
        const [prods, userProfile, proWeekStatus] = await Promise.all([
            getProducts(filter),
            getUserProfile(user!.uid),
            canPurchaseProWeek(user!.uid)
        ]);
        setProducts(prods);
        setBalance(userProfile?.tokenBalance || 0);
        setProWeekBlocked({ blocked: !proWeekStatus.canPurchase, waitDays: proWeekStatus.waitDays });
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            if (user && filter !== 'MXN') loadData();
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

    // Get icon based on product ID
    const getProductIcon = (productId: string): { name: keyof typeof Ionicons.glyphMap; color: string; bgColor: string } => {
        switch (productId) {
            case 'boost-pro-week':
                return { name: 'rocket', color: '#7C3AED', bgColor: '#F5F3FF' };
            case 'pdf-unlock-1':
                return { name: 'document-text', color: '#2563EB', bgColor: '#EFF6FF' };
            default:
                return { name: 'gift', color: '#6B7280', bgColor: '#F3F4F6' };
        }
    };

    const renderProduct = ({ item }: { item: StoreProduct }) => {
        const icon = getProductIcon(item.id);
        const isProWeek = item.id === 'boost-pro-week';
        const isBlocked = isProWeek && proWeekBlocked.blocked;
        const canBuy = balance >= item.price && !isBlocked;

        return (
            <View className="bg-white rounded-2xl mb-4 shadow-lg overflow-hidden border border-gray-100 flex-1 m-2">
                {/* Icon Header */}
                <View className="h-28 items-center justify-center" style={{ backgroundColor: icon.bgColor }}>
                    <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: icon.color + '20' }}>
                        <Ionicons name={icon.name} size={32} color={icon.color} />
                    </View>
                </View>

                {/* Content */}
                <View className="p-4">
                    <Text className="font-bold text-gray-800 text-base mb-1">{item.name}</Text>
                    <Text className="text-gray-500 text-xs mb-3" numberOfLines={2}>{item.description}</Text>

                    {/* Price */}
                    <View className="flex-row items-center mb-3">
                        <Text className="text-2xl">🪙</Text>
                        <Text className="font-bold text-xl text-yellow-600 ml-1">{item.price}</Text>
                        <Text className="text-gray-400 text-xs ml-1">tokens</Text>
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        onPress={() => handlePurchase(item)}
                        disabled={!!processingId || !canBuy}
                        className={`py-3 rounded-xl items-center ${canBuy ? 'bg-yellow-500' : 'bg-gray-300'} ${processingId ? 'opacity-50' : ''}`}
                    >
                        {processingId === item.id ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text className={`font-bold text-center ${canBuy ? 'text-white' : 'text-gray-500'}`}>
                                {isBlocked
                                    ? `Espera ${proWeekBlocked.waitDays} días`
                                    : balance >= item.price
                                        ? 'Canjear'
                                        : 'Tokens insuficientes'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

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
            {filter === 'MXN' ? (
                <View className="flex-1 justify-center items-center p-6">
                    <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
                        <View className="bg-green-100 p-4 rounded-full mb-4">
                            <Ionicons name="cart" size={48} color="#16A34A" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800 mb-2">Próximamente</Text>
                        <Text className="text-gray-500 text-center">
                            La tienda con productos en pesos mexicanos estará disponible muy pronto.
                        </Text>
                        <TouchableOpacity
                            onPress={() => setFilter('Tokens')}
                            className="mt-6 bg-yellow-500 px-6 py-3 rounded-xl"
                        >
                            <Text className="text-white font-bold">Ver productos con Tokens</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : loading ? (
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
