import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { getUserProfile, isUserPro } from '../../../services/user-service';
import { initiateStripePayment, verifyPaymentStatus, STRIPE_PRICES } from '../../../services/stripe-service';

// PRO Benefits comparison
const BENEFITS = [
    { feature: 'Registrar Servicios', free: true, pro: true },
    { feature: 'Escanear QRs', free: true, pro: true },
    { feature: 'Calculadora BTU Básica', free: true, pro: true },
    { feature: 'Gestión de Clientes', free: true, pro: true },
    { feature: 'Calculadora BTU PRO', free: false, pro: true },
    { feature: 'Recordatorios Automáticos', free: false, pro: true },
    { feature: 'PDFs sin Marca de Agua', free: false, pro: true },
    { feature: 'Cotizador PRO', free: false, pro: true },
    { feature: 'Agenda Inteligente', free: false, pro: true },
    { feature: 'Soporte Prioritario', free: false, pro: true },
];

// Pricing plans with Stripe price IDs
const PLANS = [
    {
        id: 'monthly',
        name: 'Mensual',
        price: 99,
        period: '/mes',
        description: 'Flexibilidad total',
        days: 30,
        popular: false,
        stripePriceId: STRIPE_PRICES.PRO_MONTHLY,
    },
    {
        id: 'yearly',
        name: 'Anual',
        price: 999,
        period: '/año',
        description: 'Ahorra 2 meses',
        savings: '$189',
        days: 365,
        popular: true,
        stripePriceId: STRIPE_PRICES.PRO_YEARLY,
    },
];

export default function SubscriptionScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
    const [loading, setLoading] = useState(false);
    const [isPro, setIsPro] = useState(false);

    // Check if user already has PRO when returning from payment
    useFocusEffect(
        useCallback(() => {
            const checkProStatus = async () => {
                if (user) {
                    const profile = await getUserProfile(user.uid);
                    const hasPro = isUserPro(profile);
                    setIsPro(hasPro);

                    if (hasPro) {
                        Alert.alert(
                            '🎉 ¡Ya eres PRO!',
                            'Tu suscripción está activa. Disfruta de todas las funciones premium.',
                            [{ text: 'Genial', onPress: () => router.back() }]
                        );
                    }
                }
            };
            checkProStatus();
        }, [user])
    );

    const handleSubscribe = async () => {
        if (!user) {
            Alert.alert('Error', 'Debes iniciar sesión para suscribirte');
            return;
        }

        const plan = PLANS.find(p => p.id === selectedPlan);
        if (!plan) return;

        Alert.alert(
            'Confirmar Suscripción',
            `¿Deseas suscribirte al plan ${plan.name} por $${plan.price} MXN?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Continuar al pago',
                    onPress: async () => {
                        try {
                            setLoading(true);

                            // Iniciar pago nativo con Stripe PaymentSheet
                            const success = await initiateStripePayment({
                                userId: user.uid,
                                userEmail: user.email || '',
                                planType: plan.id as 'monthly' | 'yearly',
                            });

                            if (success) {
                                // El pago fue exitoso, verificar status PRO
                                // El webhook ya debería haber actualizado Firestore
                                // Esperamos un momento y verificamos
                                setTimeout(async () => {
                                    const profile = await getUserProfile(user.uid);
                                    if (isUserPro(profile)) {
                                        setIsPro(true);
                                        router.back();
                                    }
                                }, 2000);
                            }

                        } catch (error) {
                            console.error('Subscription error:', error);
                            Alert.alert('Error', 'Hubo un problema al procesar tu suscripción.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Header */}
                <View className="bg-indigo-600 pb-8 px-5" style={{ paddingTop: insets.top + 8 }}>
                    <View className="flex-row items-center mb-4">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">QRclima Pro</Text>
                    </View>

                    <View className="items-center py-4">
                        <View className="bg-white/20 w-20 h-20 rounded-full items-center justify-center mb-4">
                            <Text className="text-4xl">🚀</Text>
                        </View>
                        <Text className="text-white text-2xl font-bold text-center">
                            Desbloquea todo tu potencial
                        </Text>
                        <Text className="text-white/80 text-center mt-2">
                            Herramientas profesionales para técnicos que quieren crecer
                        </Text>
                    </View>
                </View>

                {/* Benefits Comparison */}
                <View className="px-4 -mt-4">
                    <View className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Header Row */}
                        <View className="flex-row bg-gray-50 border-b border-gray-100">
                            <View className="flex-1 p-3">
                                <Text className="font-bold text-gray-700">Característica</Text>
                            </View>
                            <View className="w-16 p-3 items-center border-l border-gray-100">
                                <Text className="font-bold text-gray-500 text-xs">FREE</Text>
                            </View>
                            <View className="w-16 p-3 items-center border-l border-gray-100 bg-indigo-50">
                                <Text className="font-bold text-indigo-600 text-xs">PRO</Text>
                            </View>
                        </View>

                        {/* Benefit Rows */}
                        {BENEFITS.map((benefit, index) => (
                            <View
                                key={benefit.feature}
                                className={`flex-row ${index < BENEFITS.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                                <View className="flex-1 p-3">
                                    <Text className="text-gray-700 text-sm">{benefit.feature}</Text>
                                </View>
                                <View className="w-16 p-3 items-center border-l border-gray-50">
                                    {benefit.free ? (
                                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                    ) : (
                                        <Ionicons name="close-circle" size={20} color="#D1D5DB" />
                                    )}
                                </View>
                                <View className="w-16 p-3 items-center border-l border-gray-50 bg-indigo-50/50">
                                    <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pricing Plans */}
                <View className="px-4 mt-8">
                    <Text className="text-lg font-bold text-gray-800 mb-4 text-center">
                        Elige tu plan
                    </Text>

                    <View className="flex-row gap-3">
                        {PLANS.map(plan => (
                            <TouchableOpacity
                                key={plan.id}
                                onPress={() => setSelectedPlan(plan.id)}
                                className={`flex-1 rounded-2xl p-4 border-2 ${selectedPlan === plan.id
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                {plan.popular && (
                                    <View className="bg-indigo-600 px-2 py-1 rounded-full self-start mb-2">
                                        <Text className="text-white text-xs font-bold">POPULAR</Text>
                                    </View>
                                )}
                                <Text className="text-gray-800 font-bold text-lg">{plan.name}</Text>
                                <View className="flex-row items-baseline mt-1">
                                    <Text className="text-2xl font-bold text-gray-800">${plan.price}</Text>
                                    <Text className="text-gray-500 text-sm ml-1">{plan.period}</Text>
                                </View>
                                <Text className="text-gray-500 text-sm mt-1">{plan.description}</Text>
                                {plan.savings && (
                                    <View className="bg-green-100 px-2 py-1 rounded-lg self-start mt-2">
                                        <Text className="text-green-700 text-xs font-bold">Ahorras {plan.savings}</Text>
                                    </View>
                                )}

                                {/* Selection indicator */}
                                <View className="absolute top-4 right-4">
                                    <Ionicons
                                        name={selectedPlan === plan.id ? 'radio-button-on' : 'radio-button-off'}
                                        size={24}
                                        color={selectedPlan === plan.id ? '#4F46E5' : '#D1D5DB'}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Trust badges */}
                <View className="px-4 mt-8">
                    <View className="bg-gray-100 rounded-2xl p-4">
                        <View className="flex-row items-center justify-center mb-2">
                            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                            <Text className="text-gray-700 font-medium ml-2">Pago seguro con Stripe</Text>
                        </View>
                        <Text className="text-gray-500 text-center text-sm">
                            Cancela cuando quieras. Sin compromisos.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Subscribe Button */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4"
                style={{ paddingBottom: insets.bottom + 16 }}
            >
                <TouchableOpacity
                    onPress={handleSubscribe}
                    disabled={loading}
                    className={`py-4 rounded-2xl flex-row items-center justify-center ${loading ? 'bg-gray-400' : 'bg-indigo-600'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="rocket" size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">
                                Suscribirse a PRO
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
