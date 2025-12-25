import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, UserProfile, UserRank } from '../../../services/user-service';
import { updateProfilePhotoFlow } from '../../../services/image-service';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import BottomNav from '../../../components/BottomNav';
import AcademyLeadCapture from '../../../components/AcademyLeadCapture';

const getRankInfo = (rank: UserRank | undefined) => {
    switch (rank) {
        case 'Experto': return { icon: '🥇', label: 'Experto Certificado', color: 'bg-purple-100', textColor: 'text-purple-700' };
        case 'Técnico': return { icon: '🛡️', label: 'Técnico Profesional', color: 'bg-blue-100', textColor: 'text-blue-700' };
        default: return { icon: '🌱', label: 'Técnico Novato', color: 'bg-green-100', textColor: 'text-green-600' };
    }
};

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const loadProfile = async () => {
        if (!user) return;
        try {
            const data = await getUserProfile(user.uid);
            setProfile(data);
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [user])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProfile();
        setRefreshing(false);
    };

    const handleChangePhoto = async () => {
        if (!user || uploadingPhoto) return;

        try {
            setUploadingPhoto(true);
            const photoURL = await updateProfilePhotoFlow(user.uid);
            if (photoURL) {
                // Actualizar perfil local
                setProfile(prev => prev ? { ...prev, photoURL } : null);
                Alert.alert('¡Listo!', 'Tu foto de perfil ha sido actualizada');
            }
        } catch (error: any) {
            console.error('Error changing photo:', error);
            Alert.alert('Error', error.message || 'No se pudo cambiar la foto');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const displayName = profile?.alias || profile?.businessName || user?.email?.split('@')[0] || 'Usuario';
    const rankInfo = getRankInfo(profile?.rank);
    const tokenBalance = (profile as any)?.tokenBalance || 0;
    const completenessScore = profile?.profileCompletenessScore || 0;

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas salir?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', style: 'destructive', onPress: () => signOut() }
            ]
        );
    };

    const handleAdminAccess = () => {
        Alert.alert(
            'Modo Dios',
            '¿Entrar al Panel Administrativo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Entrar', onPress: () => router.push('/(app)/admin') }
            ]
        );
    };

    // Menu items
    const menuItems = [
        { id: 'wallet', icon: 'wallet', label: 'Mi Billetera', sublabel: `${tokenBalance} tokens`, route: '/(app)/wallet', iconColor: '#EAB308', iconBg: 'bg-yellow-100' },
        { id: 'community', icon: 'people', label: 'Comunidad SOS', sublabel: 'Pide ayuda a técnicos', route: '/(app)/community', iconColor: '#6366F1', iconBg: 'bg-indigo-100' },
        { id: 'training', icon: 'school', label: 'Capacitación', sublabel: 'Aprende y gana tokens', route: '/(app)/training', iconColor: '#10B981', iconBg: 'bg-green-100' },
        { id: 'store', icon: 'storefront', label: 'Tienda', sublabel: 'Canjea tus tokens', route: '/(app)/store', iconColor: '#EC4899', iconBg: 'bg-pink-100' },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
            >
                {/* Header */}
                <View className="bg-blue-600 pb-20 px-5" style={{ paddingTop: insets.top + 8 }}>
                    <Text className="text-white text-2xl font-bold">Mi Perfil</Text>
                </View>

                {/* Profile Card */}
                <View className="px-4 -mt-14 mb-6">
                    <View className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            {/* Avatar con foto de perfil */}
                            <TouchableOpacity
                                onPress={handleChangePhoto}
                                disabled={uploadingPhoto}
                                className="relative mr-4"
                            >
                                {profile?.photoURL ? (
                                    <Image
                                        source={{ uri: profile.photoURL }}
                                        className="w-20 h-20 rounded-2xl"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="bg-blue-100 w-20 h-20 rounded-2xl items-center justify-center">
                                        <Text className="text-blue-600 text-3xl font-bold">{displayName.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}

                                {/* Overlay de cámara */}
                                <View className="absolute bottom-0 right-0 bg-blue-600 w-7 h-7 rounded-full items-center justify-center border-2 border-white shadow-sm">
                                    {uploadingPhoto ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Ionicons name="camera" size={14} color="white" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View className="flex-1">
                                <Text className="text-xl font-bold text-gray-800">{displayName}</Text>
                                <View className={`${rankInfo.color} self-start px-3 py-1 rounded-full mt-1 flex-row items-center`}>
                                    <Text className="mr-1">{rankInfo.icon}</Text>
                                    <Text className={`${rankInfo.textColor} text-xs font-bold`}>{rankInfo.label}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Profile Completeness */}
                        <View className="bg-gray-50 rounded-2xl p-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-gray-600 font-medium">Perfil completado</Text>
                                <Text className="text-blue-600 font-bold">{completenessScore}%</Text>
                            </View>
                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <View className="h-full bg-blue-600 rounded-full" style={{ width: `${completenessScore}%` }} />
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row mt-4 pt-4 border-t border-gray-100">
                            <View className="flex-1 items-center">
                                <Text className="text-2xl font-bold text-gray-800">{profile?.stats?.servicesCount || 0}</Text>
                                <Text className="text-gray-500 text-xs">Servicios</Text>
                            </View>
                            <View className="w-px bg-gray-100" />
                            <View className="flex-1 items-center">
                                <Text className="text-2xl font-bold text-gray-800">{profile?.stats?.qrsActive || 0}</Text>
                                <Text className="text-gray-500 text-xs">QRs</Text>
                            </View>
                            <View className="w-px bg-gray-100" />
                            <View className="flex-1 items-center">
                                <Text className="text-2xl font-bold text-yellow-600">{tokenBalance}</Text>
                                <Text className="text-gray-500 text-xs">Tokens</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* PRO Subscription CTA - Show only for free users */}
                {profile?.subscription === 'free' && (
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/profile/subscription' as any)}
                        className="mx-4 mb-6 bg-indigo-600 p-4 rounded-2xl"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-white/20 w-12 h-12 rounded-xl items-center justify-center mr-4">
                                <Ionicons name="rocket" size={24} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-lg">Hazte PRO</Text>
                                <Text className="text-white/80 text-sm">Desbloquea todo por $99/mes</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Show PRO badge for subscribed users */}
                {profile?.subscription && profile.subscription !== 'free' && (
                    <View className="mx-4 mb-6 bg-indigo-600 p-4 rounded-2xl">
                        <View className="flex-row items-center">
                            <Text className="text-2xl mr-3">⭐</Text>
                            <View className="flex-1">
                                <Text className="text-white font-bold">Usuario {profile.subscription}</Text>
                                <Text className="text-white/80 text-sm">Todas las funciones desbloqueadas</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Menu Items */}
                <View className="px-4 mb-6">
                    <Text className="text-gray-700 font-bold mb-3">Comunidad & Aprendizaje</Text>
                    {menuItems.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => router.push(item.route as any)}
                            className="bg-white p-4 rounded-2xl border border-gray-100 mb-3 flex-row items-center active:bg-gray-50"
                        >
                            <View className={`${item.iconBg} w-12 h-12 rounded-xl items-center justify-center mr-4`}>
                                <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800">{item.label}</Text>
                                <Text className="text-gray-500 text-sm">{item.sublabel}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Settings Section */}
                <View className="px-4 mb-6">
                    <Text className="text-gray-700 font-bold mb-3">Configuración</Text>

                    <TouchableOpacity
                        onPress={() => router.push('/(app)/profile/signature')}
                        className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center active:bg-gray-50 mb-3"
                    >
                        <View className="bg-purple-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
                            <Ionicons name="create" size={24} color="#7C3AED" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800">Mi Firma Digital</Text>
                            <Text className="text-gray-500 text-sm">Configura tu firma para reportes</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Branding - only for PRO users */}
                    {profile?.subscription && profile.subscription !== 'free' && (
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/profile/branding')}
                            className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center active:bg-gray-50 mb-3"
                        >
                            <View className="bg-indigo-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
                                <Ionicons name="color-palette" size={24} color="#6366F1" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800">Personalizar PDFs</Text>
                                <Text className="text-gray-500 text-sm">Logo, colores y marca para reportes</Text>
                            </View>
                            <View className="bg-indigo-600 px-2 py-0.5 rounded-full mr-2">
                                <Text className="text-white text-xs font-bold">PRO</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => router.push('/(app)/profile/settings')}
                        className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center active:bg-gray-50"
                    >
                        <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
                            <Ionicons name="settings" size={24} color="#6B7280" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800">Ajustes</Text>
                            <Text className="text-gray-500 text-sm">Recordatorios, notificaciones</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Academia - Lista de Espera */}
                <View className="px-4 mb-6">
                    <Text className="text-gray-700 font-bold mb-3">Aprende con IA</Text>
                    <AcademyLeadCapture source="qrclima_profile" />
                </View>

                {/* Logout */}
                <View className="px-4 mb-6">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center"
                    >
                        <View className="bg-red-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
                            <Ionicons name="log-out" size={24} color="#EF4444" />
                        </View>
                        <Text className="text-red-600 font-bold flex-1">Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>

                {/* Version */}
                <View className="items-center mb-10 px-4">
                    <TouchableOpacity onLongPress={handleAdminAccess} delayLongPress={2000}>
                        <Text className="text-gray-400 text-xs">Versión 1.0.0 (Build 2025)</Text>
                        <Text className="text-gray-300 text-[10px] text-center mt-1">QRclima © 2025</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNav />
        </View>
    );
}
