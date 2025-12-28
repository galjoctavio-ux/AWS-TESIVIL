import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase-client';

interface Props {
    source?: string;
    onSuccess?: () => void;
}

export default function AcademyLeadCapture({ source = 'qrclima_profile', onSuccess }: Props) {
    const [contactType, setContactType] = useState<'email' | 'whatsapp'>('whatsapp');
    const [contactValue, setContactValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [joined, setJoined] = useState(false);

    const handleJoin = async () => {
        const trimmed = contactValue.trim();

        if (!trimmed) {
            Alert.alert('Error', contactType === 'email'
                ? 'Por favor ingresa tu correo electrónico'
                : 'Por favor ingresa tu número de WhatsApp');
            return;
        }

        // Validación básica
        if (contactType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmed)) {
                Alert.alert('Error', 'Por favor ingresa un correo válido');
                return;
            }
        } else {
            const cleaned = trimmed.replace(/\D/g, '');
            if (cleaned.length < 10) {
                Alert.alert('Error', 'Por favor ingresa un número de WhatsApp válido (mínimo 10 dígitos)');
                return;
            }
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('academy_waitlist').insert({
                contact_type: contactType,
                contact_value: trimmed.toLowerCase(),
                source,
                created_at: new Date().toISOString()
            });

            if (error) {
                // Ignore duplicate error - still mark as joined
                if (error.code === '23505') {
                    setJoined(true);
                    onSuccess?.();
                    return;
                }
                throw new Error(error.message || 'Error al registrar');
            }

            setJoined(true);
            onSuccess?.();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'No pudimos registrarte. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Estado de éxito
    if (joined) {
        return (
            <View className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                    <View className="flex-1 ml-3">
                        <Text className="text-gray-800 font-bold text-base">¡Estás en la lista! 🎉</Text>
                        <Text className="text-gray-600 text-sm">Te avisaremos cuando abramos inscripciones.</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            {/* Header con cronómetro */}
            <View className="flex-row items-center mb-3">
                <View className="bg-blue-100 w-11 h-11 rounded-xl items-center justify-center">
                    <Ionicons name="timer-outline" size={22} color="#2563EB" />
                </View>
                <View className="flex-1 ml-3">
                    <Text className="text-gray-800 font-bold text-base">El Método de las 50 Horas*</Text>
                    <Text className="text-blue-600 text-sm">Capacitación Intensiva con IA</Text>
                </View>
            </View>

            {/* Copy persuasivo */}
            <Text className="text-gray-600 mb-3 leading-5">
                ¿Sabías que esta app se diseñó y programó en menos de 50 horas*?{' '}
                <Text className="text-gray-800 font-semibold">
                    Estoy preparando una capacitación para enseñarte mi flujo de trabajo exacto.
                </Text>
            </Text>

            {/* Selector de tipo de contacto */}
            <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                    onPress={() => setContactType('whatsapp')}
                    className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border ${contactType === 'whatsapp'
                        ? 'bg-green-50 border-green-400'
                        : 'bg-white border-gray-200'
                        }`}
                >
                    <Ionicons
                        name="logo-whatsapp"
                        size={18}
                        color={contactType === 'whatsapp' ? '#22c55e' : '#9CA3AF'}
                    />
                    <Text className={`ml-1.5 font-medium ${contactType === 'whatsapp' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                        WhatsApp
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setContactType('email')}
                    className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border ${contactType === 'email'
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-white border-gray-200'
                        }`}
                >
                    <Ionicons
                        name="mail-outline"
                        size={18}
                        color={contactType === 'email' ? '#2563EB' : '#9CA3AF'}
                    />
                    <Text className={`ml-1.5 font-medium ${contactType === 'email' ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                        Correo
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Input de contacto */}
            <TextInput
                className="bg-white text-gray-800 px-4 py-3 rounded-xl border border-gray-200 mb-3"
                placeholder={contactType === 'email' ? 'tu@correo.com' : '+52 55 1234 5678'}
                placeholderTextColor="#9CA3AF"
                value={contactValue}
                onChangeText={setContactValue}
                keyboardType={contactType === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Botón de acción */}
            <TouchableOpacity
                onPress={handleJoin}
                disabled={loading}
                className={`bg-blue-600 py-3.5 rounded-xl flex-row items-center justify-center ${loading ? 'opacity-70' : ''
                    }`}
            >
                {loading ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <>
                        <Ionicons name="rocket-outline" size={18} color="white" />
                        <Text className="text-white font-bold text-base ml-2">Unirme a la Lista</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Footer */}
            <Text className="text-gray-400 text-xs text-center mt-2">
                Sin spam. Solo actualizaciones del curso.
            </Text>
            <Text className="text-gray-300 text-[10px] text-center mt-1">
                *50 horas laborales
            </Text>
        </View>
    );
}
