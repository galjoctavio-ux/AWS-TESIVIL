import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts, purchaseWithTokens, StoreProduct, canPurchaseProduct } from '../../../services/store-service';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile } from '../../../services/user-service';

export default function StoreCatalog() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [proDaysLeft, setProDaysLeft] = useState(0);
    const [boostDaysLeft, setBoostDaysLeft] = useState(0);
    const [pdfUnlocks, setPdfUnlocks] = useState(0);
    const [filter, setFilter] = useState<'Tokens' | 'MXN'>('Tokens');
    const [processingId, setProcessingId] = useState<string | null>(null);


    const loadData = async () => {
        setLoading(true);
        try {
            const [prods, userProfile] = await Promise.all([
                getProducts(filter),
                getUserProfile(user!.uid),
            ]);
            setProducts(prods);
            setBalance(userProfile?.tokenBalance || 0);

            // Calcular días PRO restantes
            if (userProfile?.subscriptionEndDate) {
                const endDate = userProfile.subscriptionEndDate.toDate
                    ? userProfile.subscriptionEndDate.toDate()
                    : new Date(userProfile.subscriptionEndDate);
                const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                setProDaysLeft(daysLeft);
            } else {
                setProDaysLeft(0);
            }

            // Calcular días de boost restantes
            if (userProfile?.tokenBoostExpiry && (userProfile?.tokenBoostMultiplier || 1) > 1) {
                const boostEnd = userProfile.tokenBoostExpiry.toDate
                    ? userProfile.tokenBoostExpiry.toDate()
                    : new Date(userProfile.tokenBoostExpiry);
                const boostDays = Math.max(0, Math.ceil((boostEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                setBoostDaysLeft(boostDays);
            } else {
                setBoostDaysLeft(0);
            }

            // PDF gratis restantes
            setPdfUnlocks(userProfile?.pdfUnlocksAvailable || 0);
        } catch (error) {
            console.error('Error loading store:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (user) loadData();
        }, [user, filter])
    );

    const handlePurchase = async (product: StoreProduct) => {
        // For MXN-only products, navigate to checkout with MXN price
        if (filter === 'MXN' || (product.priceMXN && !product.priceTokens)) {
            router.push({
                pathname: '/store/checkout',
                params: {
                    productId: product.id,
                    productName: product.name,
                    productPrice: (product.priceMXN || 0).toString(),
                    isPhysical: product.requiresShipping ? 'true' : 'false',
                    paymentType: 'mxn',
                }
            });
            return;
        }

        // For physical products, show that shipping will be requested
        if (product.requiresShipping) {
            Alert.alert(
                'Producto Físico',
                `Este producto requiere envío. Al confirmar, te pediremos tu dirección.\n\n¿Canjear ${product.name} por ${product.priceTokens} Tokens?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Continuar',
                        onPress: () => navigateToCheckout(product),
                    }
                ]
            );
            return;
        }

        // For digital Token products, show confirmation
        Alert.alert(
            'Confirmar Canje',
            `¿Canjear ${product.name} por ${product.priceTokens} Tokens?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        await executeTokenPurchase(product);
                    }
                }
            ]
        );
    };

    const navigateToCheckout = (product: StoreProduct) => {
        router.push({
            pathname: '/store/checkout',
            params: {
                productId: product.id,
                productName: product.name,
                productPrice: (product.priceTokens || 0).toString(),
                isPhysical: 'true',
                paymentType: 'tokens',
            }
        });
    };

    const executeTokenPurchase = async (product: StoreProduct) => {
        try {
            setProcessingId(product.id);

            // Verify can purchase
            const validation = await canPurchaseProduct(user!.uid, product.id);
            if (!validation.canPurchase) {
                Alert.alert('No disponible', validation.reason || 'No puedes comprar este producto');
                return;
            }

            const result = await purchaseWithTokens(user!.uid, product.id);
            if (result.success) {
                Alert.alert('¡Éxito!', result.message);
                loadData();
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setProcessingId(null);
        }
    };

    // Get icon based on product category and subcategory
    const getProductIcon = (product: StoreProduct): { name: keyof typeof Ionicons.glyphMap; color: string; bgColor: string } => {
        // By category
        if (product.category === 'physical') {
            // Physical products by subcategory
            if (product.subcategory === 'tools') {
                return { name: 'construct', color: '#F59E0B', bgColor: '#FEF3C7' };
            }
            if (product.subcategory === 'merch') {
                return { name: 'shirt', color: '#8B5CF6', bgColor: '#EDE9FE' };
            }
            return { name: 'cube', color: '#6B7280', bgColor: '#F3F4F6' };
        }

        if (product.category === 'subscription') {
            return { name: 'card', color: '#10B981', bgColor: '#D1FAE5' };
        }

        // Digital products by benefit type
        if (product.digitalBenefit) {
            switch (product.digitalBenefit.type) {
                case 'pro_days':
                    return { name: 'rocket', color: '#7C3AED', bgColor: '#F5F3FF' };
                case 'pdf_unlock':
                    return { name: 'document-text', color: '#2563EB', bgColor: '#EFF6FF' };
                case 'token_boost':
                    return { name: 'flash', color: '#F59E0B', bgColor: '#FEF3C7' };
                case 'tokens_grant':
                    return { name: 'wallet', color: '#10B981', bgColor: '#D1FAE5' };
            }
        }

        return { name: 'gift', color: '#6B7280', bgColor: '#F3F4F6' };
    };

    const renderProduct = ({ item }: { item: StoreProduct }) => {
        console.log('🏪 renderProduct called for:', item.id, item.name);
        const icon = getProductIcon(item);
        const isMXNFilter = filter === 'MXN';
        const price = isMXNFilter ? (item.priceMXN || 0) : (item.priceTokens || 0);
        const canBuy = isMXNFilter ? (item.priceMXN !== null && item.priceMXN > 0) : (balance >= price);
        console.log('🏪 renderProduct: isMXNFilter=', isMXNFilter, 'price=', price, 'canBuy=', canBuy);

        return (
            <View className="bg-white rounded-2xl mb-4 shadow-lg overflow-hidden border border-gray-100 flex-1 m-2">
                {/* Icon Header */}
                <View className="h-28 items-center justify-center" style={{ backgroundColor: icon.bgColor }}>
                    <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: icon.color + '20' }}>
                        <Ionicons name={icon.name} size={32} color={icon.color} />
                    </View>
                    {/* Physical product badge */}
                    {item.requiresShipping && (
                        <View className="absolute top-2 right-2 bg-amber-500 px-2 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">📦 Envío</Text>
                        </View>
                    )}
                    {/* Boost badge */}
                    {item.digitalBenefit?.type === 'token_boost' && (
                        <View className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">⚡ 1.5x</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View className="p-4">
                    <Text className="font-bold text-gray-800 text-base mb-1">{item.name}</Text>
                    <Text className="text-gray-500 text-xs mb-3" numberOfLines={2}>{item.description}</Text>

                    {/* Price - conditional based on filter */}
                    <View className="flex-row items-center mb-3">
                        {isMXNFilter ? (
                            <>
                                <Text className="text-2xl">💵</Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#16A34A', marginLeft: 4 }}>${price}</Text>
                                <Text className="text-gray-400 text-xs ml-1">MXN</Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-2xl">🪙</Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#CA8A04', marginLeft: 4 }}>{price}</Text>
                                <Text className="text-gray-400 text-xs ml-1">tokens</Text>
                            </>
                        )}
                    </View>

                    {/* Stock indicator for physical */}
                    {item.category === 'physical' && item.stock > 0 && item.stock < 20 && (
                        <Text className="text-orange-500 text-xs mb-2">⚠️ Solo {item.stock} disponibles</Text>
                    )}

                    {/* Button */}
                    <TouchableOpacity
                        onPress={() => handlePurchase(item)}
                        disabled={!!processingId || !canBuy}
                        className="py-3 rounded-xl items-center"
                        style={{
                            backgroundColor: canBuy ? (isMXNFilter ? '#16A34A' : '#EAB308') : '#D1D5DB',
                            opacity: processingId ? 0.5 : 1
                        }}
                    >
                        {processingId === item.id ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={{ fontWeight: 'bold', textAlign: 'center', color: canBuy ? '#FFFFFF' : '#6B7280' }}>
                                {isMXNFilter
                                    ? (canBuy ? 'Comprar' : 'No disponible')
                                    : (balance >= price ? 'Canjear' : 'Tokens insuficientes')
                                }
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    console.log('🏪 StoreCatalog: About to render JSX, products count:', products.length);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-indigo-900 pb-6 px-4 rounded-b-[30px] shadow-lg" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white">Tienda QRclima</Text>
                    <View className="bg-white/10 px-3 py-1 rounded-full flex-row items-center">
                        <Ionicons name="wallet-outline" size={16} color="#FACC15" />
                        <Text className="text-white font-bold ml-1">{balance}</Text>
                    </View>
                </View>

                {/* PRO and Boost Status */}
                <View className="flex-row justify-center mb-4 space-x-3">
                    {proDaysLeft > 0 && (
                        <View className="bg-purple-600/30 px-3 py-1.5 rounded-full flex-row items-center">
                            <Ionicons name="rocket-outline" size={14} color="#C084FC" />
                            <Text className="text-purple-300 text-xs font-medium ml-1">
                                PRO: {proDaysLeft} día{proDaysLeft !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                    {boostDaysLeft > 0 && (
                        <View className="bg-yellow-600/30 px-3 py-1.5 rounded-full flex-row items-center">
                            <Ionicons name="flash-outline" size={14} color="#FCD34D" />
                            <Text className="text-yellow-300 text-xs font-medium ml-1">
                                Boost 1.5x: {boostDaysLeft} día{boostDaysLeft !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                    {pdfUnlocks > 0 && (
                        <View className="bg-blue-600/30 px-3 py-1.5 rounded-full flex-row items-center">
                            <Ionicons name="document-text-outline" size={14} color="#93C5FD" />
                            <Text className="text-blue-300 text-xs font-medium ml-1">
                                PDF: {pdfUnlocks}
                            </Text>
                        </View>
                    )}
                    {proDaysLeft === 0 && boostDaysLeft === 0 && pdfUnlocks === 0 && (
                        <View className="bg-white/10 px-3 py-1.5 rounded-full">
                            <Text className="text-indigo-300 text-xs">Sin beneficios activos</Text>
                        </View>
                    )}
                </View>

                {/* Tabs */}
                <View className="flex-row bg-indigo-800 p-1 rounded-xl">
                    <TouchableOpacity
                        onPress={() => setFilter('Tokens')}
                        className="flex-1 py-2 rounded-lg items-center"
                        style={filter === 'Tokens' ? { backgroundColor: '#EAB308', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 } : {}}
                    >
                        <Text style={{ fontWeight: 'bold', color: filter === 'Tokens' ? '#FFFFFF' : '#A5B4FC' }}>Canjear (Tokens)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('MXN')}
                        className="flex-1 py-2 rounded-lg items-center"
                        style={filter === 'MXN' ? { backgroundColor: '#16A34A', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 } : {}}
                    >
                        <Text style={{ fontWeight: 'bold', color: filter === 'MXN' ? '#FFFFFF' : '#A5B4FC' }}>Comprar (MXN)</Text>
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
