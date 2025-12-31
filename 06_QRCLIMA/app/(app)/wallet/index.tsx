import { View, Text, ScrollView, TouchableOpacity, RefreshControl, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    getTokenBalance,
    getTransactionHistory,
    calculateLevel,
    TokenTransaction,
    EARN_RULES,
    fetchTokenRules
} from '../../../services/wallet-service';
import { getUserProfile } from '../../../services/user-service';
import { purchaseTokens, TOKEN_PACK } from '../../../services/stripe-service';

// Iconos por tipo de transacción
const TRANSACTION_ICONS: Record<string, { icon: string; color: string }> = {
    service_registered: { icon: 'construct', color: '#3B82F6' },
    sos_thread_created: { icon: 'help-circle', color: '#8B5CF6' },
    sos_solution_accepted: { icon: 'checkmark-circle', color: '#10B981' },
    profile_completed: { icon: 'person', color: '#6366F1' },
    qr_linked: { icon: 'qr-code', color: '#0EA5E9' },
    training_completed: { icon: 'school', color: '#EC4899' },
    store_purchase: { icon: 'cart', color: '#EF4444' },
    admin_grant: { icon: 'gift', color: '#F59E0B' },
    fraud_revoked: { icon: 'warning', color: '#DC2626' },
};

export default function WalletScreen() {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [balance, setBalance] = useState(0);
    const [level, setLevel] = useState({ level: 1, name: 'Novato', progress: 0, nextLevelAt: 100 });
    const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    const loadData = async () => {
        if (!user) return;

        try {
            // Cargar reglas de tokens desde Remote Config
            await fetchTokenRules();

            const [balanceData, transactionsData, userProfile] = await Promise.all([
                getTokenBalance(user.uid),
                getTransactionHistory(user.uid, 30),
                getUserProfile(user.uid)
            ]);

            setBalance(balanceData);
            // Usar lifetimeTokensEarned para calcular nivel (tokens históricos, no balance actual)
            const lifetimeTokens = userProfile?.lifetimeTokensEarned || balanceData;
            setLevel(calculateLevel(lifetimeTokens));
            setTransactions(transactionsData);
        } catch (error) {
            console.error('Error loading wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadData();
        }, [user])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleBuyTokens = async () => {
        if (!user) {
            Alert.alert('Error', 'Debes iniciar sesión para comprar tokens');
            return;
        }

        Alert.alert(
            '🪙 Comprar Tokens',
            `¿Deseas comprar ${TOKEN_PACK.tokens} tokens por $${TOKEN_PACK.priceMxn} MXN?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Comprar',
                    onPress: async () => {
                        try {
                            setPurchasing(true);
                            const result = await purchaseTokens({
                                userId: user.uid,
                                userEmail: user.email || '',
                            });

                            if (result.success) {
                                // Recargar datos después de la compra
                                await loadData();
                            }
                        } catch (error) {
                            console.error('Error purchasing tokens:', error);
                        } finally {
                            setPurchasing(false);
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (timestamp: any): string => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // Menos de 24 horas
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            if (hours === 0) return 'Hace unos minutos';
            return `Hace ${hours}h`;
        }

        // Menos de 7 días
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `Hace ${days} día${days > 1 ? 's' : ''}`;
        }

        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    const renderTransaction = ({ item }: { item: TokenTransaction }) => {
        const iconConfig = TRANSACTION_ICONS[item.type] || { icon: 'ellipse', color: '#9CA3AF' };
        const isPositive = item.amount > 0;

        return (
            <View className="flex-row items-center bg-white p-4 rounded-xl mb-2 border border-gray-100">
                {/* Icon */}
                <View
                    className="w-10 h-10 rounded-full justify-center items-center mr-3"
                    style={{ backgroundColor: iconConfig.color + '20' }}
                >
                    <Ionicons
                        name={iconConfig.icon as any}
                        size={20}
                        color={iconConfig.color}
                    />
                </View>

                {/* Details */}
                <View className="flex-1">
                    <Text className="font-bold text-gray-800">{item.description}</Text>
                    <Text className="text-gray-400 text-xs">{formatDate(item.createdAt)}</Text>
                </View>

                {/* Amount */}
                <Text
                    className={`font-bold text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}
                >
                    {isPositive ? '+' : ''}{item.amount}
                </Text>
            </View>
        );
    };

    return (
        <ScrollView
            className="flex-1 bg-slate-50"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
            <View className="p-6">
                {/* Balance Card */}
                <View className="p-6 rounded-3xl shadow-xl mb-6" style={{ backgroundColor: '#F59E0B' }}>
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-4">
                        <Text className="text-amber-100 font-medium">Saldo Actual</Text>
                        <View className="bg-white/20 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">🪙 Smart Tokens</Text>
                        </View>
                    </View>

                    {/* Balance */}
                    <View className="flex-row items-end mb-6">
                        <Text className="text-white text-5xl font-bold">
                            {balance.toLocaleString()}
                        </Text>
                        <Text className="text-amber-200 text-xl ml-2 mb-1">tokens</Text>
                    </View>

                    {/* Level Progress */}
                    <View className="bg-white/20 p-4 rounded-xl">
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-white/20 justify-center items-center mr-2">
                                    <Ionicons
                                        name={
                                            level.level === 1 ? 'leaf-outline' :
                                                level.level === 2 ? 'hammer-outline' :
                                                    level.level === 3 ? 'construct-outline' :
                                                        level.level === 4 ? 'trophy-outline' :
                                                            level.level === 5 ? 'ribbon-outline' : 'star'
                                        }
                                        size={18}
                                        color="white"
                                    />
                                </View>
                                <View>
                                    <Text className="text-white font-bold">{level.name}</Text>
                                    <Text className="text-amber-200 text-xs">Nivel {level.level}</Text>
                                </View>
                            </View>
                            <Text className="text-amber-200 text-sm">
                                {balance} / {level.nextLevelAt}
                            </Text>
                        </View>

                        {/* Progress Bar */}
                        <View className="h-2 bg-white/30 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${level.progress}%` }}
                            />
                        </View>
                    </View>
                </View>

                {/* Buy Tokens Button */}
                <TouchableOpacity
                    onPress={handleBuyTokens}
                    disabled={purchasing}
                    className="bg-white border-2 border-amber-400 rounded-2xl p-4 mb-6 flex-row items-center justify-between"
                >
                    <View className="flex-row items-center">
                        <View className="bg-amber-100 w-12 h-12 rounded-full items-center justify-center mr-3">
                            {purchasing ? (
                                <ActivityIndicator color="#F59E0B" />
                            ) : (
                                <Ionicons name="wallet-outline" size={24} color="#F59E0B" />
                            )}
                        </View>
                        <View>
                            <Text className="text-gray-800 font-bold text-lg">Comprar Tokens</Text>
                            <Text className="text-gray-500 text-sm">
                                {TOKEN_PACK.tokens} tokens por ${TOKEN_PACK.priceMxn} MXN
                            </Text>
                        </View>
                    </View>
                    <View className="bg-amber-500 px-4 py-2 rounded-xl">
                        <Text className="text-white font-bold">Comprar</Text>
                    </View>
                </TouchableOpacity>

                {/* Levels Section */}
                <View className="flex-row items-center mb-3">
                    <Ionicons name="trophy" size={20} color="#F59E0B" />
                    <Text className="text-lg font-bold text-gray-800 ml-2">Niveles de Técnico</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                >
                    {[
                        { level: 1, name: 'Novato', threshold: 0, icon: 'leaf-outline', color: '#9CA3AF' },
                        { level: 2, name: 'Aprendiz', threshold: 100, icon: 'hammer-outline', color: '#3B82F6' },
                        { level: 3, name: 'Técnico', threshold: 300, icon: 'construct-outline', color: '#8B5CF6' },
                        { level: 4, name: 'Experto', threshold: 600, icon: 'trophy-outline', color: '#F59E0B' },
                        { level: 5, name: 'Maestro', threshold: 1000, icon: 'ribbon-outline', color: '#EF4444' },
                        { level: 6, name: 'Leyenda', threshold: 2000, icon: 'star', color: '#10B981' },
                    ].map((lvl) => {
                        const isCurrentLevel = level.level === lvl.level;
                        const isUnlocked = balance >= lvl.threshold;

                        return (
                            <View
                                key={lvl.level}
                                className={`p-4 rounded-xl mr-3 border-2 ${isCurrentLevel
                                    ? 'bg-amber-50 border-amber-400'
                                    : isUnlocked
                                        ? 'bg-white border-gray-200'
                                        : 'bg-gray-100 border-gray-200'
                                    }`}
                                style={{ width: 110, opacity: isUnlocked ? 1 : 0.5 }}
                            >
                                <View
                                    className="w-12 h-12 rounded-full justify-center items-center mx-auto mb-2"
                                    style={{ backgroundColor: lvl.color + '20' }}
                                >
                                    <Ionicons name={lvl.icon as any} size={24} color={lvl.color} />
                                </View>
                                <Text
                                    className={`font-bold text-center ${isCurrentLevel ? 'text-amber-600' : 'text-gray-800'}`}
                                >
                                    {lvl.name}
                                </Text>
                                <Text className="text-gray-400 text-xs text-center mt-1">
                                    {lvl.threshold === 0 ? 'Inicio' : `${lvl.threshold}+ tokens`}
                                </Text>
                                {isCurrentLevel && (
                                    <View className="bg-amber-400 px-2 py-1 rounded-full mt-2">
                                        <Text className="text-white text-xs font-bold text-center">ACTUAL</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>

                {/* How to Earn Section */}
                <View className="flex-row items-center mb-3">
                    <Ionicons name="cash-outline" size={20} color="#10B981" />
                    <Text className="text-lg font-bold text-gray-800 ml-2">Cómo Ganar Tokens</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                >
                    {Object.entries(EARN_RULES)
                        .filter(([_, rule]) => rule.amount > 0)
                        .map(([type, rule]) => {
                            const iconConfig = TRANSACTION_ICONS[type] || { icon: 'ellipse', color: '#9CA3AF' };
                            return (
                                <View
                                    key={type}
                                    className="bg-white p-4 rounded-xl mr-3 shadow-sm border border-gray-100"
                                    style={{ width: 140 }}
                                >
                                    <View
                                        className="w-10 h-10 rounded-full justify-center items-center mb-2"
                                        style={{ backgroundColor: iconConfig.color + '20' }}
                                    >
                                        <Ionicons
                                            name={iconConfig.icon as any}
                                            size={20}
                                            color={iconConfig.color}
                                        />
                                    </View>
                                    <Text className="text-green-600 font-bold text-lg">+{rule.amount}</Text>
                                    <Text className="text-gray-600 text-xs" numberOfLines={2}>
                                        {rule.description}
                                    </Text>
                                    {rule.dailyLimit && (
                                        <Text className="text-gray-400 text-xs mt-1">
                                            Máx: {rule.dailyLimit}/día
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                </ScrollView>

                {/* Transaction History */}
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                        <Ionicons name="receipt-outline" size={20} color="#6366F1" />
                        <Text className="text-lg font-bold text-gray-800 ml-2">Historial</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className="text-blue-600 text-sm">Ver Todo</Text>
                    </TouchableOpacity>
                </View>

                {transactions.length > 0 ? (
                    <View>
                        {transactions.slice(0, 10).map((tx, index) => (
                            <View key={tx.id || index}>
                                {renderTransaction({ item: tx })}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="bg-white p-8 rounded-xl items-center">
                        <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-400 mt-3 text-center">
                            Aún no tienes movimientos.{'\n'}
                            ¡Registra un servicio para empezar!
                        </Text>
                    </View>
                )}

                {/* Legal Disclaimer */}
                <View className="mt-6 bg-gray-100 p-4 rounded-xl">
                    <Text className="text-gray-500 text-xs leading-4">
                        <Text className="font-bold">AVISO LEGAL: </Text>
                        Los 'Tokens Smart' son puntos de fidelidad virtuales sin valor monetario.
                        Son intransferibles y no canjeables por dinero. La plataforma puede
                        modificar reglas sin compensación.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
