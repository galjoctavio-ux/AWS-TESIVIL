import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createThread, SOSThread } from '../../../services/community-service';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile } from '../../../services/user-service';

export default function NewThread() {
    const router = useRouter();
    const { user } = useAuth();

    // Form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim() || !brand.trim()) {
            Alert.alert('Error', 'Completa los campos obligatorios (Título, Marca, Descripción)');
            return;
        }

        if (content.length < 20) {
            Alert.alert('Detalle Insuficiente', 'Por favor describe mejor el problema (mínimo 20 caracteres) para recibir ayuda de calidad.');
            return;
        }

        try {
            setLoading(true);
            const userProfile = await getUserProfile(user!.uid);

            const threadData = {
                authorId: user!.uid,
                authorName: userProfile?.alias || 'Anon',
                authorRank: userProfile?.rank || 'Novato',
                title: title.trim(),
                content: content.trim(),
                brand: brand.trim(),
                model: model.trim() || 'Desconocido',
                status: 'Abierto' as const,
            };

            await createThread(threadData);

            Alert.alert('¡Publicado!', 'Tu solicitud de ayuda ha sido enviada.', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            Alert.alert('Error de Moderación', error.message || 'No se pudo publicar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Pedir Ayuda SOS</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                <Text className="text-gray-500 mb-6">
                    Describe tu problema técnico detalladamente. Expertos de la comunidad te ayudarán a resolverlo.
                </Text>

                <View className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
                    <Text className="text-sm font-bold text-gray-700 mb-2">Equipo</Text>
                    <View className="flex-row gap-2 mb-2">
                        <TextInput
                            className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100"
                            placeholder="Marca (ej. Mirage)"
                            value={brand}
                            onChangeText={setBrand}
                        />
                        <TextInput
                            className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100"
                            placeholder="Modelo (Opcional)"
                            value={model}
                            onChangeText={setModel}
                        />
                    </View>
                </View>

                <View className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
                    <Text className="text-sm font-bold text-gray-700 mb-2">Título del Problema</Text>
                    <TextInput
                        className="bg-gray-50 p-3 rounded-lg border border-gray-100 font-bold"
                        placeholder="ej. Error E6 en Minisplit Inverter"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={60}
                    />
                </View>

                <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
                    <Text className="text-sm font-bold text-gray-700 mb-2">Descripción Detallada</Text>
                    <TextInput
                        className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[120px]"
                        placeholder="Describe las pruebas que ya realizaste, voltajes, presiones, etc..."
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />
                    <Text className="text-right text-xs text-gray-400 mt-1">{content.length} car.</Text>
                </View>

                {/* Tips */}
                <View className="bg-blue-50 p-4 rounded-xl mb-8 flex-row">
                    <Ionicons name="information-circle" size={20} color="#2563EB" />
                    <Text className="text-blue-800 text-xs ml-2 flex-1">
                        Tu publicación será analizada por nuestra IA para mantener la calidad de la comunidad. Evita lenguaje ofensivo.
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`bg-red-600 p-4 rounded-xl shadow-lg items-center ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons name="megaphone" size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">Publicar SOS</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View className="h-10" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
