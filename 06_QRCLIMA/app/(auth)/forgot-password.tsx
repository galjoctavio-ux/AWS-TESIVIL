import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Step = 'email' | 'code' | 'password';

export default function ForgotPassword() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const inputRefs = useRef<(TextInput | null)[]>([]);

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 1: Enviar código al email
    // ─────────────────────────────────────────────────────────────────────────────
    const handleSendCode = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
            return;
        }

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

            setStep('code');
            Alert.alert(
                'Código Enviado',
                'Si existe una cuenta con ese email, recibirás un código de 6 dígitos.',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            Alert.alert('Error', 'Ocurrió un error al enviar el correo. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 2: Manejar entrada de código de 6 dígitos
    // ─────────────────────────────────────────────────────────────────────────────
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
            const nextIndex = Math.min(index + pastedCode.length, 5);
            inputRefs.current[nextIndex]?.focus();
        } else {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

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

    const handleVerifyCode = () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            Alert.alert('Error', 'Ingresa el código de 6 dígitos');
            return;
        }
        setStep('password');
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            const functions = getFunctions();
            const sendPasswordResetEmailFn = httpsCallable(functions, 'sendPasswordResetEmail');
            await sendPasswordResetEmailFn({ email });

            Alert.alert(
                'Código Reenviado',
                'Hemos enviado un nuevo código de 6 dígitos a tu correo.',
                [{ text: 'OK' }]
            );
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            Alert.alert('Error', 'No se pudo reenviar el código. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 3: Cambiar contraseña
    // ─────────────────────────────────────────────────────────────────────────────
    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const functions = getFunctions();
            const verifyPasswordResetCode = httpsCallable(functions, 'verifyPasswordResetCode');
            await verifyPasswordResetCode({
                email,
                code: code.join(''),
                newPassword
            });

            Alert.alert(
                '¡Contraseña Actualizada!',
                'Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión.',
                [{ text: 'Ir a Login', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error: any) {
            const errorMessage = error.message || 'Error al cambiar la contraseña';

            // Si el código es incorrecto o expiró, volver al paso del código
            if (errorMessage.includes('incorrecto') || errorMessage.includes('expirado') || errorMessage.includes('intentos')) {
                Alert.alert('Error', errorMessage, [
                    {
                        text: 'OK', onPress: () => {
                            setStep('code');
                            setCode(['', '', '', '', '', '']);
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const isCodeComplete = code.every(digit => digit !== '');

    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-6">
            <View className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl">
                {/* Header */}
                <View className="items-center mb-6">
                    <View className="bg-blue-100 p-4 rounded-full mb-4">
                        <Ionicons
                            name={step === 'password' ? 'key-outline' : step === 'code' ? 'keypad-outline' : 'lock-open-outline'}
                            size={40}
                            color="#2563EB"
                        />
                    </View>
                    <Text className="text-2xl font-bold text-blue-600 text-center">
                        {step === 'password' ? 'Nueva Contraseña' : step === 'code' ? 'Ingresa el Código' : 'Recuperar Contraseña'}
                    </Text>
                    <Text className="text-gray-500 text-center mt-2">
                        {step === 'password'
                            ? 'Ingresa tu nueva contraseña'
                            : step === 'code'
                                ? 'Ingresa el código de 6 dígitos enviado a:'
                                : 'Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña'}
                    </Text>
                    {step === 'code' && (
                        <Text className="text-blue-600 font-semibold text-center mt-1">{email}</Text>
                    )}
                </View>

                {/* STEP 1: Email */}
                {step === 'email' && (
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
                            onPress={handleSendCode}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg">
                                    Enviar Código
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {/* STEP 2: Code */}
                {step === 'code' && (
                    <>
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
                            onPress={handleVerifyCode}
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
                            className={`w-full py-3 rounded-xl border-2 border-blue-600 ${loading ? 'opacity-50' : ''}`}
                            onPress={handleResendCode}
                            disabled={loading}
                        >
                            <Text className="text-blue-600 text-center font-semibold">
                                Reenviar código
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-gray-400 text-center text-xs mt-4">
                            El código expira en 15 minutos
                        </Text>

                        <TouchableOpacity
                            className="mt-4"
                            onPress={() => {
                                setStep('email');
                                setCode(['', '', '', '', '', '']);
                            }}
                        >
                            <Text className="text-gray-500 text-center">
                                ← Usar otro correo
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* STEP 3: New Password */}
                {step === 'password' && (
                    <>
                        <Text className="text-gray-700 font-semibold mb-1">Nueva Contraseña</Text>
                        <View className="relative mb-4">
                            <TextInput
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 pr-12 focus:border-blue-500 focus:bg-white"
                                placeholder="Mínimo 6 caracteres"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                                autoFocus
                            />
                            <TouchableOpacity
                                className="absolute right-3 top-3"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-700 font-semibold mb-1">Confirmar Contraseña</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-6 focus:border-blue-500 focus:bg-white"
                            placeholder="Repite tu contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
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
                                    Cambiar Contraseña
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="mt-4"
                            onPress={() => setStep('code')}
                        >
                            <Text className="text-gray-500 text-center">
                                ← Volver al código
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Link to Login */}
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
