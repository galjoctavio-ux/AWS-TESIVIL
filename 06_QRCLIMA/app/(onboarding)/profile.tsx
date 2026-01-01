import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Lista de ciudades principales de México para sugerencias
const CITIES = [
    'Monterrey', 'Guadalajara', 'Ciudad de México', 'Tijuana', 'Cancún',
    'Mérida', 'Puebla', 'Querétaro', 'León', 'Hermosillo', 'Culiacán',
    'Chihuahua', 'Torreón', 'Veracruz', 'Acapulco', 'Mazatlán', 'Otra'
];

export default function ProfileSetup() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [fullName, setFullName] = useState('');
    const [alias, setAlias] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [showCityPicker, setShowCityPicker] = useState(false);

    const isValid = fullName.trim().length >= 5 && alias.trim().length >= 3 && city.trim().length > 0 && phone.trim().length >= 10;

    const handleContinue = () => {
        if (!isValid) {
            Alert.alert('Campos requeridos', 'Por favor ingresa tu nombre completo, un alias, teléfono y tu ciudad');
            return;
        }

        // Guardar en estado global o pasar como params
        router.push({
            pathname: '/(onboarding)/experience',
            params: { fullName, alias, phone, city, businessName }
        });
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 p-6 pt-16">
                    {/* Header */}
                    <TouchableOpacity onPress={handleBack} className="mb-6">
                        <Ionicons name="arrow-back" size={28} color="#374151" />
                    </TouchableOpacity>

                    {/* Indicador de pasos */}
                    <View className="flex-row mb-6">
                        <View className="w-8 h-2 bg-blue-600 rounded-full mx-1" />
                        <View className="w-8 h-2 bg-blue-600 rounded-full mx-1" />
                        <View className="w-8 h-2 bg-gray-300 rounded-full mx-1" />
                    </View>

                    {/* Título */}
                    <Text className="text-3xl font-bold text-gray-800 mb-2">
                        Tu Identidad Profesional
                    </Text>
                    <Text className="text-gray-500 mb-8">
                        Esta información será visible para tus clientes en las bitácoras digitales
                    </Text>

                    {/* Formulario */}
                    <View className="space-y-6">
                        {/* Nombre Completo */}
                        <View>
                            <Text className="text-gray-700 font-semibold mb-2 flex-row items-center">
                                <Ionicons name="id-card" size={16} color="#374151" /> Nombre Completo (Oficial) *
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-xl p-4 text-lg"
                                placeholder="Ej: Juan Pérez González"
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                            />
                            <Text className="text-gray-400 text-sm mt-1">
                                Este es el nombre que aparecerá en tus firmas y reportes oficiales.
                            </Text>
                        </View>

                        {/* Alias */}
                        <View>
                            <Text className="text-gray-700 font-semibold mb-2 flex-row items-center">
                                <Ionicons name="person" size={16} color="#374151" /> Alias Público *
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-xl p-4 text-lg"
                                placeholder="Ej: FrioTec2024, TécnicoJuan"
                                value={alias}
                                onChangeText={setAlias}
                                autoCapitalize="none"
                                maxLength={20}
                            />
                            <Text className="text-gray-400 text-sm mt-1">
                                Este nombre se usará en la comunidad y foros.
                            </Text>
                        </View>

                        {/* Teléfono */}
                        <View className="mt-4">
                            <Text className="text-gray-700 font-semibold mb-2 flex-row items-center">
                                <Ionicons name="call" size={16} color="#374151" /> Teléfono de Contacto *
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-xl p-4 text-lg"
                                placeholder="Ej: 8111234567"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                maxLength={15}
                            />
                            <Text className="text-gray-400 text-sm mt-1">
                                Este número aparecerá en las bitácoras QR para que tus clientes te contacten.
                            </Text>
                        </View>

                        {/* Ciudad */}
                        <View className="mt-4">
                            <Text className="text-gray-700 font-semibold mb-2">
                                <Ionicons name="location" size={16} color="#374151" /> Ciudad Base *
                            </Text>
                            <TouchableOpacity
                                className="bg-white border border-gray-300 rounded-xl p-4 flex-row justify-between items-center"
                                onPress={() => setShowCityPicker(!showCityPicker)}
                            >
                                <Text className={city ? "text-gray-800 text-lg" : "text-gray-400 text-lg"}>
                                    {city || 'Selecciona tu ciudad'}
                                </Text>
                                <Ionicons
                                    name={showCityPicker ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>

                            {/* Selector de ciudades */}
                            {showCityPicker && (
                                <View className="bg-white border border-gray-200 rounded-xl mt-2 max-h-48 overflow-hidden">
                                    <ScrollView nestedScrollEnabled>
                                        {CITIES.map((c) => (
                                            <TouchableOpacity
                                                key={c}
                                                className={`p-3 border-b border-gray-100 ${city === c ? 'bg-blue-50' : ''}`}
                                                onPress={() => {
                                                    setCity(c);
                                                    setShowCityPicker(false);
                                                }}
                                            >
                                                <Text className={city === c ? "text-blue-600 font-semibold" : "text-gray-700"}>
                                                    {c}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                            <Text className="text-gray-400 text-sm mt-1">
                                Usada para cálculos de BTU y precios locales
                            </Text>
                        </View>

                        {/* Nombre de Empresa (Opcional) */}
                        <View className="mt-4">
                            <Text className="text-gray-700 font-semibold mb-2">
                                <Ionicons name="business" size={16} color="#374151" /> Nombre de Empresa (Opcional)
                            </Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-xl p-4 text-lg"
                                placeholder="Ej: Climatización del Norte S.A."
                                value={businessName}
                                onChangeText={setBusinessName}
                                maxLength={100}
                                onFocus={() => {
                                    // Scroll down when business name is focused
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollToEnd({ animated: true });
                                    }, 300);
                                }}
                            />
                            <Text className="text-gray-400 text-sm mt-1">
                                Aparecerá en tus cotizaciones y documentos
                            </Text>
                        </View>
                    </View>

                    {/* Botón Continuar */}
                    <TouchableOpacity
                        className={`w-full py-4 rounded-xl mt-8 flex-row justify-center items-center ${isValid ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                        onPress={handleContinue}
                        disabled={!isValid}
                    >
                        <Text className={`font-bold text-lg mr-2 ${isValid ? 'text-white' : 'text-gray-500'}`}>
                            Continuar
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color={isValid ? "white" : "#6b7280"} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
