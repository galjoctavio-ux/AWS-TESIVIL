import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmail() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const router = useRouter();
    const { user, signOut, refreshUserProfile } = useAuth();

    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleCodeChange = (value: string, index: number) => {
        if (value.length > 1) {
            // Si el usuario pega un código completo
            const pastedCode = value.slice(0, 6).split('');
            const newCode = [...code];
            pastedCode.forEach((char, i) => {
                if (index + i < 6) {
                    newCode[index + i] = char;
                }
            });
            setCode(newCode);
            // Enfocar el último campo lleno o el siguiente vacío
            const nextIndex = Math.min(index + pastedCode.length, 5);
            inputRefs.current[nextIndex]?.focus();
        } else {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            // Auto-avanzar al siguiente campo
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');

        if (fullCode.length !== 6) {
            Alert.alert('Error', 'Ingresa el código de 6 dígitos');
            return;
        }

        setLoading(true);
        try {
            const functions = getFunctions();
            const verifyEmailToken = httpsCallable(functions, 'verifyEmailToken');
            await verifyEmailToken({ code: fullCode });

            // Refrescar usuario para obtener el nuevo estado
            await refreshUserProfile();

            Alert.alert(
                '¡Email Verificado!',
                'Tu cuenta ha sido verificada correctamente.',
                [{ text: 'Continuar', onPress: () => router.replace('/(onboarding)/welcome') }]
            );
        } catch (error: any) {
            const errorMessage = error.message || 'Código incorrecto';
            Alert.alert('Error', errorMessage);
            // Limpiar código en caso de error
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setResending(true);
        try {
            const functions = getFunctions();
            const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
            await sendVerificationEmail({});

            Alert.alert(
                'Email Reenviado',
                'Hemos enviado un nuevo código de verificación a tu correo.',
                [{ text: 'OK' }]
            );
            // Limpiar código anterior
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            Alert.alert('Error', 'No se pudo reenviar el email. Intenta de nuevo.');
        } finally {
            setResending(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.replace('/(auth)/login');
    };

    const isCodeComplete = code.every(digit => digit !== '');

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-6">
            <View className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl">
                <View className="items-center mb-6">
                    <View className="bg-blue-100 p-4 rounded-full mb-4">
                        <Ionicons name="mail-outline" size={40} color="#2563EB" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 text-center">
                        Verifica tu Email
                    </Text>
                    <Text className="text-gray-500 text-center mt-3">
                        Hemos enviado un código de 6 dígitos a:
                    </Text>
                    <Text className="text-blue-600 font-semibold text-center mt-1">
                        {user?.email}
                    </Text>
                </View>

                {/* Código de 6 dígitos */}
                <View className="flex-row justify-between mb-6">
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            className="w-12 h-14 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold text-gray-800 focus:border-blue-500 focus:bg-white"
                            value={digit}
                            onChangeText={(value) => handleCodeChange(value.replace(/[^0-9]/g, ''), index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            keyboardType="number-pad"
                            maxLength={6}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <TouchableOpacity
                    className={`w-full py-4 rounded-xl shadow-md mb-3 ${isCodeComplete && !loading ? 'bg-blue-600' : 'bg-gray-300'}`}
                    onPress={handleVerify}
                    disabled={!isCodeComplete || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className={`text-center font-bold text-lg ${isCodeComplete ? 'text-white' : 'text-gray-500'}`}>
                            Verificar Código
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className={`w-full py-3 rounded-xl border-2 border-blue-600 ${resending ? 'opacity-50' : ''}`}
                    onPress={handleResendEmail}
                    disabled={resending}
                >
                    {resending ? (
                        <ActivityIndicator color="#2563EB" />
                    ) : (
                        <Text className="text-blue-600 text-center font-semibold">
                            Reenviar código
                        </Text>
                    )}
                </TouchableOpacity>

                <Text className="text-gray-400 text-center text-xs mt-4">
                    El código expira en 15 minutos
                </Text>

                <TouchableOpacity
                    className="mt-4"
                    onPress={handleSignOut}
                >
                    <Text className="text-gray-500 text-center">
                        Usar otra cuenta
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
