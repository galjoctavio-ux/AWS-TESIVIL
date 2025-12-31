import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice, ShippingAddress } from '../../../services/payment-service';
import { purchaseWithTokens } from '../../../services/store-service';
import { purchaseProduct } from '../../../services/stripe-service';
import { getUserProfile } from '../../../services/user-service';
import AddressAutocomplete, { AddressComponents } from '../../../components/AddressAutocomplete';

// Mexican states for dropdown
const MEXICAN_STATES = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

export default function Checkout() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    // Product info from params
    const productId = params.productId as string;
    const productName = params.productName as string;
    const productPrice = parseFloat(params.productPrice as string) || 0;
    const isPhysical = params.isPhysical === 'true';
    const isTokenPayment = params.paymentType === 'tokens';

    // Helper to format price based on payment type
    const displayPrice = (amount: number) => {
        return isTokenPayment ? `🪙 ${amount} tokens` : formatPrice(amount);
    };

    // Form state
    const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
    const [loading, setLoading] = useState(false);

    // Shipping address
    const [address, setAddress] = useState<ShippingAddress>({
        fullName: '',
        phone: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        postalCode: '',
        references: '',
    });

    // State picker modal
    const [showStatePicker, setShowStatePicker] = useState(false);

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'oxxo' | 'mercadopago'>('card');

    // Calculated values
    const shippingCost = isPhysical ? 99 : 0;
    const total = productPrice + shippingCost;

    const validateShipping = (): boolean => {
        if (!address.fullName.trim()) {
            Alert.alert('Error', 'Ingresa tu nombre completo');
            return false;
        }
        if (!address.phone?.trim() || (address.phone?.length || 0) < 10) {
            Alert.alert('Error', 'Ingresa un teléfono válido (10 dígitos)');
            return false;
        }
        if (!address.street.trim()) {
            Alert.alert('Error', 'Ingresa tu calle y número');
            return false;
        }
        if (!address.neighborhood?.trim()) {
            Alert.alert('Error', 'Ingresa tu colonia');
            return false;
        }
        if (!address.city.trim()) {
            Alert.alert('Error', 'Ingresa tu ciudad');
            return false;
        }
        if (!address.state) {
            Alert.alert('Error', 'Selecciona tu estado');
            return false;
        }
        if (!address.postalCode.trim() || address.postalCode.length !== 5) {
            Alert.alert('Error', 'Ingresa un código postal válido (5 dígitos)');
            return false;
        }
        return true;
    };

    const handleContinueToPayment = async () => {
        if (isPhysical && !validateShipping()) return;

        // For token payments, process immediately
        if (isTokenPayment) {
            await handleTokenPurchase();
            return;
        }

        setStep('payment');
    };

    const handleTokenPurchase = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const result = await purchaseWithTokens(user.uid, productId, isPhysical ? address as any : undefined);
            if (result.success) {
                setStep('confirmation');
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al procesar la compra');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Get user email for Stripe
            const userProfile = await getUserProfile(user.uid);
            const userEmail = userProfile?.email || user.email || '';

            // Use Stripe Payment Sheet for real payment
            const result = await purchaseProduct({
                userId: user.uid,
                userEmail,
                productId,
                productName,
                amountMxn: total,
                shippingAddress: isPhysical ? {
                    fullName: address.fullName,
                    phone: address.phone || '',
                    street: address.street,
                    neighborhood: address.neighborhood,
                    city: address.city,
                    state: address.state,
                    postalCode: address.postalCode,
                    references: address.references,
                } : undefined,
            });

            if (result.success) {
                setStep('confirmation');
            } else if (result.error !== 'Compra cancelada') {
                Alert.alert('Error', result.error || 'No se pudo procesar el pago.');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    // STEP 1: SHIPPING FORM
    const renderShippingForm = () => (
        <ScrollView className="flex-1 p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">📦 Dirección de Envío</Text>

            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
                {/* Full Name */}
                <Text className="text-sm font-medium text-gray-600 mb-1">Nombre completo *</Text>
                <TextInput
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3"
                    placeholder="Juan Pérez García"
                    value={address.fullName}
                    onChangeText={text => setAddress({ ...address, fullName: text })}
                />

                {/* Phone */}
                <Text className="text-sm font-medium text-gray-600 mb-1">Teléfono (10 dígitos) *</Text>
                <TextInput
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3"
                    placeholder="5512345678"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={address.phone}
                    onChangeText={text => setAddress({ ...address, phone: text })}
                />

                {/* Address Autocomplete */}
                <Text className="text-sm font-medium text-gray-600 mb-1">🔍 Buscar dirección</Text>
                <View style={{ zIndex: 1000, marginBottom: 12 }}>
                    <AddressAutocomplete
                        value={undefined as any}
                        onAddressSelect={() => { }}
                        onAddressComponents={(components: AddressComponents) => {
                            // Pre-fill address fields from Google Places
                            setAddress(prev => ({
                                ...prev,
                                street: components.street || prev.street,
                                neighborhood: components.neighborhood || prev.neighborhood,
                                city: components.city || prev.city,
                                state: components.state || prev.state,
                                postalCode: components.postalCode || prev.postalCode,
                            }));
                        }}
                        placeholder="Buscar dirección con Google Maps..."
                    />
                </View>

                {/* Street */}
                <Text className="text-sm font-medium text-gray-600 mb-1">Calle y número *</Text>
                <TextInput
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3"
                    placeholder="Av. Reforma 123, Int. 4B"
                    value={address.street}
                    onChangeText={text => setAddress({ ...address, street: text })}
                />

                {/* Neighborhood */}
                <Text className="text-sm font-medium text-gray-600 mb-1">Colonia *</Text>
                <TextInput
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3"
                    placeholder="Col. Centro"
                    value={address.neighborhood}
                    onChangeText={text => setAddress({ ...address, neighborhood: text })}
                />

                <View className="flex-row gap-3">
                    {/* City */}
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-600 mb-1">Ciudad *</Text>
                        <TextInput
                            className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                            placeholder="CDMX"
                            value={address.city}
                            onChangeText={text => setAddress({ ...address, city: text })}
                        />
                    </View>

                    {/* Postal Code */}
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-600 mb-1">C.P. *</Text>
                        <TextInput
                            className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                            placeholder="06600"
                            keyboardType="number-pad"
                            maxLength={5}
                            value={address.postalCode}
                            onChangeText={text => setAddress({ ...address, postalCode: text })}
                        />
                    </View>
                </View>

                {/* State Picker */}
                <Text className="text-sm font-medium text-gray-600 mb-1 mt-3">Estado *</Text>
                <TouchableOpacity
                    onPress={() => setShowStatePicker(true)}
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex-row justify-between items-center"
                >
                    <Text className={address.state ? 'text-gray-800' : 'text-gray-400'}>
                        {address.state || 'Seleccionar estado...'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* References */}
                <Text className="text-sm font-medium text-gray-600 mb-1 mt-3">Referencias (opcional)</Text>
                <TextInput
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                    placeholder="Entre calles, color de casa, etc."
                    value={address.references}
                    onChangeText={text => setAddress({ ...address, references: text })}
                    multiline
                />
            </View>

            {/* Order Summary */}
            <View className="bg-white rounded-xl p-4 border border-gray-100">
                <Text className="font-bold text-gray-800 mb-3">🛒 Resumen del Pedido</Text>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">{productName}</Text>
                    <Text className="font-medium">{displayPrice(productPrice)}</Text>
                </View>
                {!isTokenPayment && (
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Envío</Text>
                        <Text className="font-medium">{shippingCost > 0 ? displayPrice(shippingCost) : 'Gratis'}</Text>
                    </View>
                )}
                <View className="h-px bg-gray-200 my-2" />
                <View className="flex-row justify-between">
                    <Text className="font-bold text-gray-800">Total</Text>
                    <Text className="font-bold text-green-600 text-lg">
                        {isTokenPayment ? displayPrice(productPrice) : displayPrice(total)}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleContinueToPayment}
                disabled={loading}
                className={`bg-blue-600 p-4 rounded-xl items-center mt-4 ${loading ? 'opacity-70' : ''}`}
                style={{ marginBottom: insets.bottom + 20 }}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text className="text-white font-bold text-lg">
                        {isTokenPayment ? 'Confirmar Canje con Tokens' : 'Continuar al Pago'}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );

    // STEP 2: PAYMENT METHOD
    const renderPaymentForm = () => (
        <ScrollView className="flex-1 p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">💳 Método de Pago</Text>

            {/* Payment Options */}
            <View className="space-y-3 mb-6">
                <TouchableOpacity
                    onPress={() => setPaymentMethod('card')}
                    className={`bg-white p-4 rounded-xl border flex-row items-center ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                    <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${paymentMethod === 'card' ? 'border-blue-600' : 'border-gray-300'}`}>
                        {paymentMethod === 'card' && <View className="w-3 h-3 rounded-full bg-blue-600" />}
                    </View>
                    <Ionicons name="card" size={24} color={paymentMethod === 'card' ? '#2563EB' : '#9CA3AF'} />
                    <View className="ml-3">
                        <Text className={`font-medium ${paymentMethod === 'card' ? 'text-blue-800' : 'text-gray-800'}`}>Tarjeta de Crédito/Débito</Text>
                        <Text className="text-gray-500 text-xs">Pago seguro con Stripe</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Summary */}
            <View className="bg-gray-900 rounded-2xl p-6">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Producto</Text>
                    <Text className="text-white">{displayPrice(productPrice)}</Text>
                </View>
                {!isTokenPayment && (
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-400">Envío</Text>
                        <Text className="text-white">{shippingCost > 0 ? displayPrice(shippingCost) : 'Gratis'}</Text>
                    </View>
                )}
                <View className="h-px bg-gray-700 my-2" />
                <View className="flex-row justify-between mb-6">
                    <Text className="text-lg font-bold text-white">
                        {isTokenPayment ? 'Total en Tokens' : 'Total a pagar'}
                    </Text>
                    <Text className="text-2xl font-bold text-amber-400">
                        {isTokenPayment ? displayPrice(productPrice) : displayPrice(total)}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleProcessPayment}
                    disabled={loading}
                    className={`bg-white p-4 rounded-xl items-center ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="#1F2937" />
                    ) : (
                        <Text className="font-bold text-gray-900 text-lg">
                            {paymentMethod === 'oxxo' ? 'Generar Ficha OXXO' : 'Pagar Ahora'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setStep('shipping')} className="mt-4 items-center">
                <Text className="text-blue-600 font-medium">← Volver a dirección</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // STEP 3: CONFIRMATION
    const renderConfirmation = () => (
        <View className="flex-1 items-center justify-center p-6">
            <View className="bg-green-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Confirmado!</Text>
            <Text className="text-gray-500 text-center mb-6">
                Tu pedido ha sido procesado exitosamente.{'\n'}
                {isPhysical ? 'Recibirás un correo con los detalles del envío.' : 'Tu beneficio ya está activo.'}
            </Text>

            <View className="bg-white rounded-xl p-4 w-full mb-6 border border-gray-100">
                <Text className="text-sm text-gray-500 text-center">Número de orden</Text>
                <Text className="text-lg font-mono font-bold text-gray-800 text-center">#{Date.now().toString(36).toUpperCase()}</Text>
            </View>

            <TouchableOpacity
                onPress={() => router.replace('/(app)/')}
                className="bg-blue-600 px-8 py-4 rounded-xl"
            >
                <Text className="text-white font-bold">Volver al Inicio</Text>
            </TouchableOpacity>
        </View>
    );

    // State Picker Modal (simplified)
    const renderStatePicker = () => (
        showStatePicker && (
            <View className="absolute inset-0 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl max-h-[70%]">
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                        <Text className="text-lg font-bold">Seleccionar Estado</Text>
                        <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="p-4">
                        {MEXICAN_STATES.map(state => (
                            <TouchableOpacity
                                key={state}
                                onPress={() => {
                                    setAddress({ ...address, state });
                                    setShowStatePicker(false);
                                }}
                                className={`p-3 rounded-lg mb-1 ${address.state === state ? 'bg-blue-100' : ''}`}
                            >
                                <Text className={address.state === state ? 'text-blue-700 font-medium' : 'text-gray-700'}>{state}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        )
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Checkout</Text>
                </View>

                {/* Progress Steps */}
                <View className="flex-row mt-4">
                    <View className={`flex-1 h-1 rounded-full mr-1 ${step === 'shipping' || step === 'payment' || step === 'confirmation' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    <View className={`flex-1 h-1 rounded-full mr-1 ${step === 'payment' || step === 'confirmation' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    <View className={`flex-1 h-1 rounded-full ${step === 'confirmation' ? 'bg-green-500' : 'bg-gray-200'}`} />
                </View>
                <View className="flex-row mt-2">
                    <Text className={`flex-1 text-xs ${step === 'shipping' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>Envío</Text>
                    <Text className={`flex-1 text-xs ${step === 'payment' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>Pago</Text>
                    <Text className={`flex-1 text-xs ${step === 'confirmation' ? 'text-green-600 font-medium' : 'text-gray-400'}`}>Confirmación</Text>
                </View>
            </View>

            {step === 'shipping' && renderShippingForm()}
            {step === 'payment' && renderPaymentForm()}
            {step === 'confirmation' && renderConfirmation()}

            {renderStatePicker()}
        </KeyboardAvoidingView>
    );
}
