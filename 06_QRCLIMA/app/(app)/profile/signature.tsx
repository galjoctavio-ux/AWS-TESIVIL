import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../../../services/user-service';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SignatureModal from '../../../components/SignatureModal';

export default function SignatureScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [signature, setSignature] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadSignature();
        }, [user])
    );

    const loadSignature = async () => {
        if (!user) return;
        try {
            const profile = await getUserProfile(user.uid);
            if (profile?.signature) {
                setSignature(profile.signature);
            }
        } catch (error) {
            console.error('Error loading signature:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSignature = async (newSignature: string) => {
        if (!user) return;
        try {
            setSaving(true);
            // newSignature is a base64 string provided by the canvas
            await updateUserProfile(user.uid, { signature: newSignature });
            setSignature(newSignature);
            Alert.alert('¡Éxito!', 'Tu firma ha sido guardada correctamente');
        } catch (error) {
            console.error('Error saving signature:', error);
            Alert.alert('Error', 'No se pudo guardar la firma');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Mi Firma Digital</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 items-center">
                    <Text className="text-gray-600 text-center mb-6">
                        Esta firma se utilizará automáticamente en todos los reportes de servicio y cotizaciones que generes.
                    </Text>

                    {signature ? (
                        <View className="w-full h-48 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6 justify-center items-center">
                            <Image
                                source={{ uri: signature }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                    ) : (
                        <View className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl mb-6 items-center justify-center">
                            <Ionicons name="create-outline" size={48} color="#9CA3AF" />
                            <Text className="text-gray-400 mt-2">No has configurado tu firma</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => setShowModal(true)}
                        disabled={saving}
                        className={`w-full py-4 rounded-xl flex-row justify-center items-center ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name={signature ? "refresh" : "add-circle"} size={20} color="white" />
                                <Text className="text-white font-bold ml-2">
                                    {signature ? 'Actualizar Firma' : 'Crear Firma'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Tips */}
                <View className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={24} color="#2563EB" />
                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-blue-800 mb-1">Recomendación</Text>
                            <Text className="text-blue-600 text-sm">
                                Intenta firmar en modo horizontal (landscape) o usa un stylus para mayor precisión si es posible.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <SignatureModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onOK={handleSaveSignature}
                title="Dibuja tu firma"
                description="Firma en el centro de la pantalla"
            />
        </View>
    );
}
