import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addClient } from '../../../services/clients-service';
import { useAuth } from '../../../context/AuthContext';

export default function AddClient() {
    const router = useRouter();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        if (!user) return;

        setSaving(true);
        try {
            await addClient({
                name,
                phone,
                address,
                technicianId: user.uid,
            });
            Alert.alert('Éxito', 'Cliente guardado correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar el cliente');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center p-4 bg-white shadow-sm pt-12">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Nuevo Cliente</Text>
            </View>

            {/* Form */}
            <View className="p-6">
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">

                    <View>
                        <Text className="text-sm font-bold text-gray-700 mb-2">Nombre Completo *</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
                            placeholder="Ej. Juan Pérez"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View className="mt-4">
                        <Text className="text-sm font-bold text-gray-700 mb-2">Teléfono</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
                            placeholder="Ej. 55 1234 5678"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View className="mt-4">
                        <Text className="text-sm font-bold text-gray-700 mb-2">Dirección</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 h-24"
                            placeholder="Calle, Número, Colonia..."
                            multiline
                            textAlignVertical="top"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>

                </View>

                <TouchableOpacity
                    className={`mt-8 w-full py-4 rounded-xl shadow-lg ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">Guardar Cliente</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
