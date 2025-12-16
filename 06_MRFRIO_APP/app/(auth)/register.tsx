import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Aceptación legal (obligatoria según master_plan.md)
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    const isFormValid = email && password && confirmPassword && acceptTerms && acceptPrivacy;

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
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert('Éxito', 'Cuenta creada correctamente', [{ text: 'OK' }]);
            // La redirección la maneja el _layout (irá a onboarding)
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
                    placeholder="ejemplo@mrfrio.com"
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
                                onPress={() => openLink('https://mrfrio.app/terms')}
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
                                onPress={() => openLink('https://mrfrio.app/privacy')}
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

