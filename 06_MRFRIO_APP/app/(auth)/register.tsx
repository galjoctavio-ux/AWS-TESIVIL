import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link, useRouter } from 'expo-router';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert('Éxito', 'Cuenta creada correctamente', [{ text: 'OK' }]);
            // La redirección la maneja el _layout
        } catch (error: any) {
            Alert.alert('Error de Registro', error.message);
        } finally {
            setLoading(false);
        }
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
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-6 focus:border-blue-500 focus:bg-white"
                    placeholder="******"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    className={`w-full py-4 rounded-xl ${loading ? 'bg-blue-400' : 'bg-blue-600'} shadow-md`}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">Registrarse</Text>
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
