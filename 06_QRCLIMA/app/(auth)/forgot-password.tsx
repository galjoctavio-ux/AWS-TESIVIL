import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
            return;
        }

        // Validar formato de email básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'El formato del correo electrónico no es válido');
            return;
        }

        setLoading(true);
        try {
            const functions = getFunctions();
            const sendPasswordResetEmailFn = httpsCallable(functions, 'sendPasswordResetEmail');
            await sendPasswordResetEmailFn({ email });

            setEmailSent(true);
            Alert.alert(
                'Correo Enviado',
                'Si existe una cuenta con ese email, recibirás un código de recuperación.',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            Alert.alert('Error', 'Ocurrió un error al enviar el correo. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-6">
            <View className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl">
                <View className="items-center mb-6">
                    <View className="bg-blue-100 p-4 rounded-full mb-4">
                        <Ionicons name="lock-open-outline" size={40} color="#2563EB" />
                    </View>
                    <Text className="text-2xl font-bold text-blue-600 text-center">
                        Recuperar Contraseña
                    </Text>
                    <Text className="text-gray-500 text-center mt-2">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                    </Text>
                </View>

                {!emailSent ? (
                    <>
                        <Text className="text-gray-700 font-semibold mb-1">Email</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-6 focus:border-blue-500 focus:bg-white"
                            placeholder="ejemplo@qrclima.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoFocus
                        />

                        <TouchableOpacity
                            className={`w-full py-4 rounded-xl ${loading ? 'bg-blue-400' : 'bg-blue-600'} shadow-md`}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg">
                                    Enviar Enlace
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <View className="items-center py-4">
                        <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
                        <Text className="text-gray-600 text-center mt-4">
                            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                        </Text>
                        <TouchableOpacity
                            className="mt-4"
                            onPress={() => {
                                setEmailSent(false);
                                setEmail('');
                            }}
                        >
                            <Text className="text-blue-600 font-semibold">
                                ¿No recibiste el correo? Intenta de nuevo
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity className="mt-6">
                        <Text className="text-blue-600 text-center font-semibold">
                            ← Volver al Login
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}
