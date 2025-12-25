import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { getUserProfile, updateUserProfile, isUserPro, BrandingConfig } from '../../../services/user-service';
import { uploadBrandingLogo } from '../../../services/storage-service';

// Predefined color palette
const COLOR_PALETTE = [
    { name: 'Azul', color: '#2563EB' },
    { name: 'Rojo', color: '#DC2626' },
    { name: 'Verde', color: '#16A34A' },
    { name: 'Naranja', color: '#EA580C' },
    { name: 'Morado', color: '#7C3AED' },
    { name: 'Rosa', color: '#DB2777' },
    { name: 'Cyan', color: '#0891B2' },
    { name: 'Amarillo', color: '#CA8A04' },
    { name: 'Gris', color: '#4B5563' },
    { name: 'Negro', color: '#1F2937' },
];

export default function BrandingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [isProPlus, setIsProPlus] = useState(false);

    // Branding state
    const [branding, setBranding] = useState<BrandingConfig>({
        primaryColor: '#2563EB',
        secondaryColor: '#1D4ED8',
        footerText: '',
        showQRclimaWatermark: true,
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                router.back();
                return;
            }

            const profile = await getUserProfile(user.uid);
            if (!isUserPro(profile)) {
                Alert.alert('Función PRO', 'Esta función está disponible solo para usuarios PRO.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
                return;
            }

            setHasAccess(true);
            setIsProPlus(profile?.subscription === 'Pro+');

            if (profile?.branding) {
                setBranding({
                    ...branding,
                    ...profile.branding,
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'No se pudo cargar la configuración.');
        } finally {
            setIsLoading(false);
        }
    };

    const pickLogo = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar un logo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadLogo(result.assets[0].uri);
        }
    };

    const uploadLogo = async (uri: string) => {
        const user = auth.currentUser;
        if (!user) return;

        setIsUploading(true);
        try {
            const logoURL = await uploadBrandingLogo(user.uid, uri);
            setBranding(prev => ({ ...prev, logoURL }));
            Alert.alert('✅ Logo subido', 'Tu logo se ha guardado correctamente.');
        } catch (error) {
            console.error('Error uploading logo:', error);
            Alert.alert('Error', 'No se pudo subir el logo. Intenta de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeLogo = () => {
        Alert.alert(
            'Eliminar Logo',
            '¿Estás seguro de que deseas eliminar tu logo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => setBranding(prev => ({ ...prev, logoURL: undefined }))
                }
            ]
        );
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsSaving(true);
        try {
            await updateUserProfile(user.uid, { branding });
            Alert.alert('✅ Guardado', 'Tu configuración de marca se ha guardado correctamente.');
        } catch (error) {
            console.error('Error saving branding:', error);
            Alert.alert('Error', 'No se pudo guardar la configuración.');
        } finally {
            setIsSaving(false);
        }
    };

    const resetToDefault = () => {
        Alert.alert(
            'Restablecer Marca',
            '¿Deseas volver a la configuración por defecto de QRclima?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restablecer',
                    onPress: () => setBranding({
                        primaryColor: '#2563EB',
                        secondaryColor: '#1D4ED8',
                        footerText: '',
                        showQRclimaWatermark: true,
                        logoURL: undefined,
                    })
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-4">Cargando configuración...</Text>
            </View>
        );
    }

    if (!hasAccess) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <Ionicons name="lock-closed" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">Redirigiendo...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">Personalizar PDFs</Text>
                    <Text className="text-gray-500 text-sm">Configura tu marca para reportes</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Logo Section */}
                    <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="business-outline" size={20} color="#374151" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">Logo de Empresa</Text>
                        </View>

                        <View className="items-center">
                            {branding.logoURL ? (
                                <View className="items-center">
                                    <Image
                                        source={{ uri: branding.logoURL }}
                                        className="w-32 h-32 rounded-xl mb-3"
                                        resizeMode="contain"
                                    />
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={pickLogo}
                                            className="bg-blue-100 px-4 py-2 rounded-lg flex-row items-center"
                                        >
                                            <Ionicons name="image-outline" size={18} color="#2563EB" />
                                            <Text className="text-blue-600 ml-2">Cambiar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={removeLogo}
                                            className="bg-red-100 px-4 py-2 rounded-lg flex-row items-center"
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#DC2626" />
                                            <Text className="text-red-600 ml-2">Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={pickLogo}
                                    disabled={isUploading}
                                    className="w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center"
                                >
                                    {isUploading ? (
                                        <ActivityIndicator color="#2563EB" />
                                    ) : (
                                        <>
                                            <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                                            <Text className="text-gray-400 text-sm mt-2">Subir logo</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text className="text-gray-400 text-xs text-center mt-3">
                            Formato recomendado: PNG cuadrado, máximo 2MB
                        </Text>
                    </View>

                    {/* Color Section */}
                    <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="color-palette-outline" size={20} color="#374151" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">Color Principal</Text>
                        </View>
                        <Text className="text-gray-500 text-sm mb-3">Se usará en encabezados y acentos del PDF</Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {COLOR_PALETTE.map((item) => (
                                <TouchableOpacity
                                    key={item.color}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        console.log('Color selected:', item.color);
                                        setBranding(prev => ({
                                            ...prev,
                                            primaryColor: item.color,
                                            secondaryColor: item.color + 'DD',
                                        }));
                                    }}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        backgroundColor: item.color,
                                        marginRight: 8,
                                        marginBottom: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: branding.primaryColor === item.color ? 4 : 1,
                                        borderColor: branding.primaryColor === item.color ? '#1F2937' : '#E5E7EB',
                                    }}
                                >
                                    {branding.primaryColor === item.color && (
                                        <Ionicons name="checkmark" size={24} color="white" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Preview */}
                        <View
                            style={{
                                backgroundColor: branding.primaryColor || '#2563EB',
                                marginTop: 16,
                                padding: 16,
                                borderRadius: 12,
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                Vista Previa del Color
                            </Text>
                        </View>
                    </View>

                    {/* Footer Text Section */}
                    <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="document-text-outline" size={20} color="#374151" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">Texto del Pie de Página</Text>
                        </View>
                        <Text className="text-gray-500 text-sm mb-3">Aparecerá al final del PDF</Text>

                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                            placeholder="Ej: Climas del Norte - Tel: 555-1234"
                            value={branding.footerText}
                            onChangeText={(text) => setBranding(prev => ({ ...prev, footerText: text }))}
                            maxLength={100}
                        />
                        <Text className="text-gray-400 text-xs text-right mt-1">
                            {branding.footerText?.length || 0}/100
                        </Text>
                    </View>

                    {/* Watermark Toggle (PRO+ only) */}
                    {isProPlus && (
                        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-800">Marca de Agua QRclima</Text>
                                    <Text className="text-gray-500 text-sm">
                                        "Powered by QRclima" en el PDF
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setBranding(prev => ({
                                        ...prev,
                                        showQRclimaWatermark: !prev.showQRclimaWatermark
                                    }))}
                                    className={`w-14 h-8 rounded-full p-1 ${branding.showQRclimaWatermark ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <View
                                        className={`w-6 h-6 rounded-full bg-white ${branding.showQRclimaWatermark ? 'ml-auto' : 'mr-auto'
                                            }`}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Reset Button */}
                    <TouchableOpacity
                        onPress={resetToDefault}
                        className="flex-row items-center justify-center py-3"
                    >
                        <Ionicons name="refresh-outline" size={18} color="#6B7280" />
                        <Text className="text-gray-500 ml-2">Restablecer valores por defecto</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="bg-white border-t border-gray-200 p-4" style={{ paddingBottom: insets.bottom + 16 }}>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center"
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">Guardar Cambios</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
