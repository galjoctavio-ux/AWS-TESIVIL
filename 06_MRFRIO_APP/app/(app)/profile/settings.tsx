import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../../context/SettingsContext';
import { useState } from 'react';

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
    const router = useRouter();
    const { settings, updateSettings } = useSettings();
    const [saving, setSaving] = useState(false);

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

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Configuración</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
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

                {/* Future Settings Placeholder */}
                <View className="mb-6">
                    <Text className="text-gray-500 font-medium text-sm mb-3 uppercase">
                        Otras Configuraciones
                    </Text>
                    <View className="bg-gray-100 rounded-2xl p-6 items-center">
                        <Ionicons name="construct-outline" size={32} color="#9CA3AF" />
                        <Text className="text-gray-500 text-sm mt-2 text-center">
                            Más opciones próximamente...
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
