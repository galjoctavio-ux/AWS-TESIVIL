import { View, Text, TouchableOpacity, FlatList, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getScheduledReminders, updateReminderDate, ServiceData } from '../../../services/services-service';
import { getClientById } from '../../../services/clients-service';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ReminderItem {
    id: string;
    service: ServiceData;
    clientName: string;
    nextServiceDate: Date;
    daysUntil: number;
}

export default function RemindersScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();

    const [reminders, setReminders] = useState<ReminderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Edit Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState<ReminderItem | null>(null);
    const [newDate, setNewDate] = useState(new Date());
    const [saving, setSaving] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadReminders();
            }
        }, [user])
    );

    const loadReminders = async () => {
        try {
            const services = await getScheduledReminders(user!.uid);
            const now = new Date();

            const reminderItems: ReminderItem[] = await Promise.all(
                services.map(async (service) => {
                    let clientName = 'Cliente';
                    if (service.clientId) {
                        try {
                            const client = await getClientById(service.clientId);
                            if (client) {
                                clientName = client.name || 'Cliente';
                            }
                        } catch (e) {
                            console.error('Error fetching client:', e);
                        }
                    }

                    const nextDate = service.nextServiceDate?.toDate
                        ? service.nextServiceDate.toDate()
                        : new Date(service.nextServiceDate);

                    const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    return {
                        id: service.id || '',
                        service,
                        clientName,
                        nextServiceDate: nextDate,
                        daysUntil
                    };
                })
            );

            // Sort by date ascending
            reminderItems.sort((a, b) => a.nextServiceDate.getTime() - b.nextServiceDate.getTime());
            setReminders(reminderItems);
        } catch (error) {
            console.error('Error loading reminders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadReminders();
    };

    const openEditModal = (reminder: ReminderItem) => {
        setSelectedReminder(reminder);
        setNewDate(reminder.nextServiceDate);
        setEditModalVisible(true);
    };

    const handleSaveNewDate = async () => {
        if (!selectedReminder) return;

        setSaving(true);
        try {
            await updateReminderDate(selectedReminder.id, newDate);
            setEditModalVisible(false);
            setSelectedReminder(null);
            Alert.alert('¡Listo!', 'La fecha del recordatorio ha sido actualizada.');
            loadReminders();
        } catch (error) {
            console.error('Error updating reminder:', error);
            Alert.alert('Error', 'No se pudo actualizar la fecha.');
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (daysUntil: number) => {
        if (daysUntil <= 0) return { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-500' };
        if (daysUntil <= 7) return { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-500' };
        return { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500' };
    };

    const renderReminder = ({ item }: { item: ReminderItem }) => {
        const colors = getStatusColor(item.daysUntil);
        const equipment = item.service.equipment;

        return (
            <TouchableOpacity
                onPress={() => openEditModal(item)}
                className={`${colors.bg} rounded-2xl p-4 mb-3 border border-gray-100`}
            >
                <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                        {/* Client Name */}
                        <Text className="text-gray-800 font-bold text-lg">{item.clientName}</Text>

                        {/* Equipment */}
                        {equipment && (
                            <View className="flex-row items-center mt-1">
                                <Ionicons name="snow-outline" size={14} color="#6B7280" />
                                <Text className="text-gray-500 text-sm ml-1">
                                    {equipment.brand} {equipment.model}
                                </Text>
                            </View>
                        )}

                        {/* Date */}
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-1">
                                {item.nextServiceDate.toLocaleDateString('es-MX', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>

                    {/* Days Badge */}
                    <View className="items-center">
                        <View className={`${colors.badge} px-3 py-1 rounded-full`}>
                            <Text className="text-white font-bold text-sm">
                                {item.daysUntil <= 0
                                    ? '¡Vencido!'
                                    : item.daysUntil === 1
                                        ? 'Mañana'
                                        : `${item.daysUntil} días`}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => openEditModal(item)}
                            className="mt-2 flex-row items-center"
                        >
                            <Ionicons name="create-outline" size={16} color="#4F46E5" />
                            <Text className="text-indigo-600 text-xs ml-1">Editar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center px-8">
            <View className="bg-indigo-100 p-6 rounded-full mb-6">
                <Ionicons name="notifications-outline" size={48} color="#4F46E5" />
            </View>
            <Text className="text-gray-800 font-bold text-xl text-center mb-2">
                No hay recordatorios programados
            </Text>
            <Text className="text-gray-500 text-center mb-6">
                Cuando crees un servicio con recordatorio activado, aparecerá aquí.
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/(app)/scanner')}
                className="bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center"
            >
                <Ionicons name="qr-code" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Escanear QR</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-indigo-600 pb-4 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <Text className="text-white text-2xl font-bold">Recordatorios</Text>
                            <View className="bg-white/20 px-2 py-0.5 rounded ml-2">
                                <Text className="text-white text-xs font-bold">PRO</Text>
                            </View>
                        </View>
                        <Text className="text-indigo-200 text-sm">
                            {reminders.length} {reminders.length === 1 ? 'recordatorio' : 'recordatorios'} programados
                        </Text>
                    </View>
                </View>
            </View>

            {/* Info Note */}
            <View className="mx-4 mt-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex-row">
                <Ionicons name="information-circle" size={24} color="#6366F1" />
                <View className="flex-1 ml-3">
                    <Text className="text-indigo-800 font-bold mb-1">¿Cómo funciona?</Text>
                    <Text className="text-indigo-600 text-sm">
                        Al terminar un servicio siendo PRO, puedes programar un recordatorio automático.{'\n'}
                        <Text className="font-bold">Las notificaciones ya creadas seguirán activas</Text> aunque tu suscripción expire. Solo necesitas PRO para crear nuevos recordatorios.
                    </Text>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text className="text-gray-500 mt-4">Cargando recordatorios...</Text>
                </View>
            ) : reminders.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={reminders}
                    renderItem={renderReminder}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="p-4"
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-800">Editar Fecha</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {selectedReminder && (
                            <>
                                <Text className="text-gray-600 mb-4">
                                    Cambiar fecha de recordatorio para {selectedReminder.clientName}
                                </Text>

                                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                                    {/* Date display - tap to open picker on Android */}
                                    {Platform.OS === 'android' && (
                                        <TouchableOpacity
                                            onPress={() => setShowDatePicker(true)}
                                            className="py-3 items-center"
                                        >
                                            <Text className="text-indigo-600 font-bold text-lg">
                                                {newDate.toLocaleDateString('es-MX', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </Text>
                                            <Text className="text-gray-400 text-sm mt-1">Toca para cambiar fecha</Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* DateTimePicker - always visible on iOS, controlled on Android */}
                                    {(Platform.OS === 'ios' || showDatePicker) && (
                                        <DateTimePicker
                                            value={newDate}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            minimumDate={new Date()}
                                            onChange={(event, date) => {
                                                // On Android, hide picker after selection
                                                if (Platform.OS === 'android') {
                                                    setShowDatePicker(false);
                                                }
                                                if (date) {
                                                    setNewDate(date);
                                                }
                                            }}
                                            locale="es-MX"
                                        />
                                    )}
                                </View>

                                {/* Quick Options */}
                                <View className="flex-row flex-wrap mb-4">
                                    {[
                                        { label: '+1 mes', months: 1 },
                                        { label: '+3 meses', months: 3 },
                                        { label: '+6 meses', months: 6 },
                                        { label: '+1 año', months: 12 },
                                    ].map((opt) => (
                                        <TouchableOpacity
                                            key={opt.months}
                                            onPress={() => {
                                                const d = new Date();
                                                d.setMonth(d.getMonth() + opt.months);
                                                setNewDate(d);
                                            }}
                                            className="bg-indigo-100 px-4 py-2 rounded-full mr-2 mb-2"
                                        >
                                            <Text className="text-indigo-700 font-medium">{opt.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    onPress={handleSaveNewDate}
                                    disabled={saving}
                                    className={`py-4 rounded-xl items-center ${saving ? 'bg-gray-300' : 'bg-indigo-600'}`}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold text-lg">Guardar Cambios</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
