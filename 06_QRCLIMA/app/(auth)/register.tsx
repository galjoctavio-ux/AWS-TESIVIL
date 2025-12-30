import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle, configureGoogleSignIn } from '../../services/google-auth-service';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();

    // Aceptación legal (obligatoria según master_plan.md)
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    const isFormValid = email && password && confirmPassword && acceptTerms && acceptPrivacy;

    // Configure Google Sign-In on mount
    useEffect(() => {
        configureGoogleSignIn();
    }, []);

    const handleGoogleRegister = async () => {
        setGoogleLoading(true);
        try {
            const user = await signInWithGoogle();
            if (user) {
                console.log('Google registration successful:', user.email);
                // Auth context will handle redirect
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo registrar con Google');
            console.error('Google registration error:', error);
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }
        if (!acceptTerms || !acceptPrivacy) {
            Alert.alert('Error', 'Debes aceptar los Términos y Condiciones y el Aviso de Privacidad');
            return;
        }

        setLoading(true);
        try {
            // Crear cuenta
            await createUserWithEmailAndPassword(auth, email, password);

            // Enviar email de verificación via Cloud Function (Resend)
            const functions = getFunctions();
            const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
            await sendVerificationEmail({});

            // Redirigir a pantalla de verificación
            router.replace('/(auth)/verify-email');
        } catch (error: any) {
            Alert.alert('Error de Registro', error.message);
        } finally {
            setLoading(false);
        }
    };

    const openLink = (url: string) => {
        // En producción, estos serían links reales a tus documentos legales
        Alert.alert(
            'Documento Legal',
            'En producción, aquí se abriría el documento correspondiente.',
            [{ text: 'OK' }]
        );
        // Linking.openURL(url);
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-6">
            <View className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl">
                <Text className="text-2xl font-bold text-blue-600 text-center mb-6">Crear Cuenta</Text>

                <Text className="text-gray-700 font-semibold mb-1">Email</Text>
                <TextInput
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4 focus:border-blue-500 focus:bg-white"
                    placeholder="ejemplo@qrclima.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text className="text-gray-700 font-semibold mb-1">Contraseña</Text>
                <TextInput
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4 focus:border-blue-500 focus:bg-white"
                    placeholder="******"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Text className="text-gray-700 font-semibold mb-1">Confirmar Contraseña</Text>
                <TextInput
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4 focus:border-blue-500 focus:bg-white"
                    placeholder="******"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                {/* Aceptación Legal */}
                <View className="mb-6 mt-2">
                    {/* Términos y Condiciones */}
                    <TouchableOpacity
                        className="flex-row items-start mb-3"
                        onPress={() => setAcceptTerms(!acceptTerms)}
                    >
                        <View className={`w-6 h-6 rounded border-2 mr-3 justify-center items-center ${acceptTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                            }`}>
                            {acceptTerms && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text className="text-gray-600 flex-1 text-sm">
                            Acepto los{' '}
                            <Text
                                className="text-blue-600 underline"
                                onPress={() => openLink('https://qrclima.com/terms')}
                            >
                                Términos y Condiciones
                            </Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Aviso de Privacidad */}
                    <TouchableOpacity
                        className="flex-row items-start"
                        onPress={() => setAcceptPrivacy(!acceptPrivacy)}
                    >
                        <View className={`w-6 h-6 rounded border-2 mr-3 justify-center items-center ${acceptPrivacy ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                            }`}>
                            {acceptPrivacy && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text className="text-gray-600 flex-1 text-sm">
                            Acepto el{' '}
                            <Text
                                className="text-blue-600 underline"
                                onPress={() => openLink('https://qrclima.com/privacy')}
                            >
                                Aviso de Privacidad
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className={`w-full py-4 rounded-xl shadow-md ${isFormValid && !loading ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    onPress={handleRegister}
                    disabled={!isFormValid || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className={`text-center font-bold text-lg ${isFormValid ? 'text-white' : 'text-gray-500'
                            }`}>
                            Registrarse
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-6">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-4 text-gray-400 text-sm">o continúa con</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* Google Sign-In Button */}
                <TouchableOpacity
                    className={`w-full py-4 rounded-xl border border-gray-300 flex-row justify-center items-center ${googleLoading ? 'bg-gray-100' : 'bg-white'}`}
                    onPress={handleGoogleRegister}
                    disabled={googleLoading}
                >
                    {googleLoading ? (
                        <ActivityIndicator color="#4285F4" />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={20} color="#4285F4" />
                            <Text className="text-gray-700 font-semibold ml-3">Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View className="mt-6 flex-row justify-center">
                    <Text className="text-gray-600">¿Ya tienes cuenta? </Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold">Inicia Sesión</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}

