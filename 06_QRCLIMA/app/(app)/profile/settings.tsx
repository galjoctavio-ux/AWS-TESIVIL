import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../../../services/user-service';
import { getNotificationPreferences, updateNotificationPreferences, NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '../../../services/notification-service';
import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

const REMINDER_OPTIONS = [
    { value: 1, label: '1 mes' },
    { value: 2, label: '2 meses' },
    { value: 3, label: '3 meses' },
    { value: 4, label: '4 meses' },
    { value: 5, label: '5 meses' },
    { value: 6, label: '6 meses' },
    { value: 9, label: '9 meses' },
    { value: 12, label: '1 año' },
];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const { settings, updateSettings } = useSettings();
    const [saving, setSaving] = useState(false);

    // Base Location State
    const [baseLat, setBaseLat] = useState<number | null>(null);
    const [baseLng, setBaseLng] = useState<number | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    // Notification Preferences State
    const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
    const [loadingPrefs, setLoadingPrefs] = useState(false);

    // Load current base location and preferences on focus
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                if (!user) return;
                try {
                    // Load Profile for Base Location
                    const profile = await getUserProfile(user.uid);
                    if (profile?.baseLat && profile?.baseLng) {
                        setBaseLat(profile.baseLat);
                        setBaseLng(profile.baseLng);
                    }

                    // Load Notification Preferences
                    const prefs = await getNotificationPreferences(user.uid);
                    setNotifPrefs(prefs);
                } catch (error) {
                    console.error('Error loading settings data:', error);
                }
            };
            loadData();
        }, [user])
    );

    const handleSelectReminder = async (months: number) => {
        try {
            setSaving(true);
            await updateSettings({ reminderMonths: months });
            Alert.alert('Guardado', `El recordatorio ahora es de ${months} ${months === 1 ? 'mes' : 'meses'}`);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleSetBaseLocation = async () => {
        if (!user) return;

        try {
            setLoadingLocation(true);

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso Denegado', 'Necesitamos acceso a tu ubicación para configurar la base.');
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const lat = Number(location.coords.latitude.toFixed(6));
            const lng = Number(location.coords.longitude.toFixed(6));

            // Save to Firestore
            await updateUserProfile(user.uid, { baseLat: lat, baseLng: lng });

            // Update local state
            setBaseLat(lat);
            setBaseLng(lng);

            Alert.alert('✅ Ubicación Guardada', 'Tu ubicación base ha sido configurada. Las distancias en la agenda se calcularán desde aquí.');
        } catch (error: any) {
            console.error('Error setting base location:', error);
            Alert.alert('Error', 'No se pudo obtener tu ubicación. Asegúrate de tener el GPS activado.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const toggleNotification = async (key: keyof NotificationPreferences) => {
        if (!user) return;

        try {
            // Optimistic update
            const newPrefs = { ...notifPrefs, [key]: !notifPrefs[key] };
            setNotifPrefs(newPrefs);

            await updateNotificationPreferences(user.uid, { [key]: !notifPrefs[key] });
        } catch (error) {
            console.error('Error updating notification preference:', error);
            // Revert on error
            setNotifPrefs(notifPrefs);
            Alert.alert('Error', 'No se pudo guardar la preferencia');
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pb-4 px-4 shadow-sm flex-row items-center" style={{ paddingTop: insets.top + 8 }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Configuración</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                {/* Base Location Section */}
                <View className="mb-6">
                    <Text className="text-gray-500 font-medium text-sm mb-3 uppercase">
                        Ubicación Base (Rutas)
                    </Text>

                    <View className="bg-white rounded-2xl border border-gray-100 p-4">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-blue-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="navigate" size={20} color="#2563EB" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-bold">Mi Ubicación Base</Text>
                                <Text className="text-gray-500 text-xs">
                                    Punto de partida para cálculo de rutas
                                </Text>
                            </View>
                        </View>

                        {baseLat && baseLng ? (
                            <View className="bg-green-50 p-3 rounded-xl mb-4 flex-row items-center">
                                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                                <Text className="text-green-700 text-sm flex-1 ml-2">
                                    📍 {baseLat.toFixed(4)}, {baseLng.toFixed(4)}
                                </Text>
                            </View>
                        ) : (
                            <View className="bg-amber-50 p-3 rounded-xl mb-4 flex-row items-center">
                                <Ionicons name="warning" size={18} color="#D97706" />
                                <Text className="text-amber-700 text-sm flex-1 ml-2">
                                    No configurada. Las distancias no se mostrarán.
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleSetBaseLocation}
                            disabled={loadingLocation}
                            className="bg-blue-600 py-3 rounded-xl flex-row items-center justify-center"
                        >
                            {loadingLocation ? (
                                <>
                                    <ActivityIndicator size="small" color="white" />
                                    <Text className="text-white font-bold ml-2">Obteniendo...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="locate" size={20} color="white" />
                                    <Text className="text-white font-bold ml-2">Usar Mi Ubicación Actual</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notification Settings Section */}
                <View className="mb-6">
                    <Text className="text-gray-500 font-medium text-sm mb-3 uppercase">
                        Notificaciones Push
                    </Text>

                    <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        {[
                            {
                                key: 'maintenanceReminders',
                                label: 'Mantenimientos (PRO)',
                                desc: 'Recordatorio 7 días antes',
                                icon: 'construct' as const, color: '#F59E0B'
                            },
                            {
                                key: 'appointmentReminders',
                                label: 'Citas y Agenda',
                                desc: 'Recordatorios de visitas',
                                icon: 'calendar' as const, color: '#3B82F6'
                            },
                            {
                                key: 'sosReplies',
                                label: 'Comunidad SOS',
                                desc: 'Respuestas y soluciones',
                                icon: 'people' as const, color: '#8B5CF6'
                            },
                            {
                                key: 'storeOrders',
                                label: 'Tienda y Pedidos',
                                desc: 'Estado de tus compras',
                                icon: 'cart' as const, color: '#10B981'
                            },
                        ].map((item, index) => (
                            <View key={item.key} className={`p-4 flex-row items-center ${index !== 0 ? 'border-t border-gray-50' : ''}`}>
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3`} style={{ backgroundColor: `${item.color}20` }}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-800 font-bold text-base">{item.label}</Text>
                                    <Text className="text-gray-500 text-xs">{item.desc}</Text>
                                </View>
                                <View>
                                    {/* Custom Toggle Switch */}
                                    <TouchableOpacity
                                        onPress={() => toggleNotification(item.key as keyof NotificationPreferences)}
                                        className={`w-12 h-7 rounded-full justify-center px-1 ${notifPrefs[item.key as keyof NotificationPreferences] ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <View className={`w-5 h-5 rounded-full bg-white shadow-sm transform ${notifPrefs[item.key as keyof NotificationPreferences] ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View className="bg-slate-100 p-3 rounded-xl mt-3 flex-row items-start">
                        <Ionicons name="moon" size={16} color="#64748B" />
                        <Text className="text-slate-500 text-xs flex-1 ml-2 leading-4">
                            <Text className="font-bold">Modo Silencio:</Text> Las notificaciones no sonarán entre 10:00 PM y 8:00 AM para no interrumpir tu descanso.
                        </Text>
                    </View>
                </View>

                {/* Reminder Settings Section */}
                <View className="mb-6">
                    <Text className="text-gray-500 font-medium text-sm mb-3 uppercase">
                        Recordatorios de Servicio
                    </Text>

                    <View className="bg-white rounded-2xl border border-gray-100 p-4">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-indigo-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="notifications" size={20} color="#4F46E5" />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-gray-800 font-bold">Tiempo de Recordatorio</Text>
                                    <View className="bg-indigo-600 px-2 py-0.5 rounded ml-2">
                                        <Text className="text-white text-[10px] font-bold">PRO</Text>
                                    </View>
                                </View>
                                <Text className="text-gray-500 text-xs">
                                    Para mantenimientos y servicios recurrentes
                                </Text>
                            </View>
                        </View>

                        <Text className="text-gray-600 text-sm mb-3">
                            Selecciona cuánto tiempo después de un servicio se enviará el recordatorio al cliente:
                        </Text>

                        <View className="flex-row flex-wrap">
                            {REMINDER_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => handleSelectReminder(option.value)}
                                    disabled={saving}
                                    className={`px-4 py-2 rounded-full mr-2 mb-2 border ${settings.reminderMonths === option.value
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <Text className={`font-medium ${settings.reminderMonths === option.value
                                        ? 'text-white'
                                        : 'text-gray-600'
                                        }`}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="bg-indigo-50 p-3 rounded-xl mt-4 flex-row items-start">
                            <Ionicons name="information-circle" size={18} color="#4F46E5" />
                            <Text className="text-indigo-700 text-xs flex-1 ml-2">
                                Actualmente configurado en <Text className="font-bold">{settings.reminderMonths} {settings.reminderMonths === 1 ? 'mes' : 'meses'}</Text>.
                                Este tiempo aplica para todos los nuevos servicios.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom spacing */}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}
