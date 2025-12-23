import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link, useRouter } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa email y contraseña');
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // La redirección la maneja el _layout basado en el estado de auth
        } catch (error: any) {
            Alert.alert('Error de Login', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-6">
            <View className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl">
                <Text className="text-3xl font-bold text-blue-600 text-center mb-2">QRclima</Text>
                <Text className="text-gray-500 text-center mb-8">Acceso Técnico</Text>

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
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-6 focus:border-blue-500 focus:bg-white"
                    placeholder="******"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    className={`w-full py-4 rounded-xl ${loading ? 'bg-blue-400' : 'bg-blue-600'} shadow-md`}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">Entrar</Text>
                    )}
                </TouchableOpacity>

                <View className="mt-6 flex-row justify-center">
                    <Text className="text-gray-600">¿No tienes cuenta? </Text>
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold">Regístrate</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}
