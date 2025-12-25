import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getClients } from '../../../services/clients-service';
import { addService, checkScheduleConflict } from '../../../services/services-service';
import { getUserProfile } from '../../../services/user-service';
import { getLinearDistance } from '../../../services/haversine-calculator';
import DistanceIndicator, { getRouteEfficiencyColor } from '../../../components/agenda/DistanceIndicator';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AgendaWizard() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const { presetDate } = useLocalSearchParams<{ presetDate?: string }>();

    // Steps: 0=Client, 1=Date/Location, 2=Type
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data
    const [clients, setClients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredClients, setFilteredClients] = useState<any[]>([]);

    // Selection
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [date, setDate] = useState(new Date());
    const [serviceType, setServiceType] = useState('Mantenimiento');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');

    // Date/Time Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Distance Feedback State
    const [baseLat, setBaseLat] = useState<number | null>(null);
    const [baseLng, setBaseLng] = useState<number | null>(null);
    const [distanceToClient, setDistanceToClient] = useState<number | null>(null);

    // Initialize date from presetDate parameter (when tapping empty cell in calendar)
    useEffect(() => {
        if (presetDate) {
            const timestamp = parseInt(presetDate, 10);
            if (!isNaN(timestamp)) {
                setDate(new Date(timestamp));
            }
        }
    }, [presetDate]);

    // Load clients when screen gains focus
    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadClients();
                loadBaseLocation();
            }
        }, [user])
    );

    const loadBaseLocation = async () => {
        try {
            const profile = await getUserProfile(user!.uid);
            if (profile?.baseLat && profile?.baseLng) {
                setBaseLat(profile.baseLat);
                setBaseLng(profile.baseLng);
            }
        } catch (error) {
            console.error('Error loading base location:', error);
        }
    };

    const loadClients = async () => {
        setLoading(true);
        try {
            const allClients = await getClients(user!.uid);
            setClients(allClients);
            setFilteredClients(allClients);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    // Live Search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length > 0) {
            const lower = query.toLowerCase();
            setFilteredClients(clients.filter(c =>
                c.name?.toLowerCase().includes(lower) ||
                c.phone?.toLowerCase().includes(lower) ||
                c.address?.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredClients(clients);
        }
    };

    // Update address and calculate distance when client selected
    const handleClientSelect = (client: any) => {
        setSelectedClient(client);
        if (client?.address) setAddress(client.address);

        // Calculate distance if we have base location and client has coordinates
        if (baseLat && baseLng && client?.lat && client?.lng) {
            const distance = getLinearDistance(
                { latitude: baseLat, longitude: baseLng },
                { latitude: client.lat, longitude: client.lng }
            );
            setDistanceToClient(distance);
        } else {
            setDistanceToClient(null);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const newDate = new Date(date);
            newDate.setFullYear(selectedDate.getFullYear());
            newDate.setMonth(selectedDate.getMonth());
            newDate.setDate(selectedDate.getDate());
            setDate(newDate);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const newDate = new Date(date);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setDate(newDate);
        }
    };

    const handleNext = async () => {
        if (step === 0 && !selectedClient) {
            Alert.alert('Error', 'Selecciona un cliente');
            return;
        }
        if (step === 1 && !address) {
            Alert.alert('Error', 'Confirma la dirección');
            return;
        }

        if (step === 2) {
            // SAVE APPOINTMENT TO FIRESTORE
            setSaving(true);
            try {
                // Check for schedule conflicts first
                const conflict = await checkScheduleConflict(user!.uid, date);
                if (conflict) {
                    setSaving(false);
                    const conflictTime = conflict.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                    Alert.alert(
                        '⚠️ Horario Ocupado',
                        `Ya tienes una cita de ${conflict.type} con ${conflict.clientName} a las ${conflictTime}.\n\n¿Deseas agendar de todos modos?`,
                        [
                            { text: 'Cambiar Hora', style: 'cancel' },
                            {
                                text: 'Agendar Igual',
                                style: 'destructive',
                                onPress: () => saveAppointment()
                            }
                        ]
                    );
                    return;
                }

                await saveAppointment();
            } catch (error) {
                console.error('Error saving appointment:', error);
                Alert.alert('Error', 'No se pudo guardar la cita. Intenta de nuevo.');
                setSaving(false);
            }
            return;
        }

        setStep(step + 1);
    };

    const saveAppointment = async () => {
        setSaving(true);
        try {
            const serviceData: any = {
                clientId: selectedClient.id,
                clientName: selectedClient.name || 'Cliente',
                address: address || 'Sin dirección',
                technicianId: user!.uid,
                type: serviceType as 'Mantenimiento' | 'Reparación' | 'Instalación' | 'Reinstalación',
                status: 'Pendiente',
                date: date,
                notes: notes || `Cita agendada para ${serviceType}`,
            };

            // Only add lat/lng if they exist (Firestore doesn't accept undefined)
            if (selectedClient.lat !== undefined && selectedClient.lat !== null) {
                serviceData.lat = selectedClient.lat;
            }
            if (selectedClient.lng !== undefined && selectedClient.lng !== null) {
                serviceData.lng = selectedClient.lng;
            }

            await addService(serviceData);

            Alert.alert(
                '✅ Cita Agendada',
                `Se programó ${serviceType} para ${selectedClient.name} el ${date.toLocaleDateString('es-MX')}.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error saving appointment:', error);
            Alert.alert('Error', 'No se pudo guardar la cita.');
        } finally {
            setSaving(false);
        }
    };

    const renderStep0_Client = () => (
        <View className="flex-1">
            <View className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 flex-row items-center shadow-sm">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    className="flex-1 ml-3 text-lg text-gray-800"
                    placeholder="Buscar por nombre, teléfono..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text className="text-gray-400 mt-4">Cargando clientes...</Text>
                </View>
            ) : filteredClients.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                        <Ionicons name="people-outline" size={40} color="#9CA3AF" />
                    </View>
                    <Text className="text-gray-800 font-bold text-lg mb-2">
                        {clients.length === 0 ? 'Sin clientes registrados' : 'Sin resultados'}
                    </Text>
                    <Text className="text-gray-400 text-center mb-6 px-8">
                        {clients.length === 0
                            ? 'Registra tu primer cliente para poder agendar citas.'
                            : 'No se encontraron clientes con ese criterio.'}
                    </Text>
                    {clients.length === 0 && (
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/clients/add')}
                            className="bg-blue-600 py-3 px-6 rounded-xl flex-row items-center"
                        >
                            <Ionicons name="person-add" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Agregar Cliente</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {filteredClients.map(client => (
                        <TouchableOpacity
                            key={client.id}
                            onPress={() => handleClientSelect(client)}
                            className={`p-4 mb-3 rounded-2xl flex-row items-center shadow-sm ${selectedClient?.id === client.id
                                ? 'bg-blue-50 border-2 border-blue-500'
                                : 'bg-white border border-gray-100'
                                }`}
                        >
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                                <Text className="text-blue-600 font-bold text-xl">{client.name?.charAt(0)?.toUpperCase()}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 text-lg">{client.name}</Text>
                                {client.phone && <Text className="text-gray-500 text-sm">📞 {client.phone}</Text>}
                                {client.address && <Text className="text-gray-400 text-xs" numberOfLines={1}>📍 {client.address}</Text>}
                            </View>
                            {selectedClient?.id === client.id && (
                                <Ionicons name="checkmark-circle" size={28} color="#2563EB" />
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Quick Add Client Button */}
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/clients/add')}
                        className="p-4 mb-3 rounded-2xl flex-row items-center bg-gray-50 border border-dashed border-gray-300"
                    >
                        <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                            <Ionicons name="person-add" size={24} color="#16A34A" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-green-700 text-lg">Agregar Nuevo Cliente</Text>
                            <Text className="text-gray-400 text-sm">Crea un cliente rápidamente</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View className="h-4" />
                </ScrollView>
            )}
        </View>
    );

    const renderStep1_TimeLocation = () => (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="bg-white p-6 rounded-2xl mb-6 shadow-sm border border-gray-100">
                <Text className="text-gray-500 font-bold uppercase text-xs mb-4">Fecha y Hora</Text>

                {/* Date Button */}
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-gray-50 p-4 rounded-xl flex-row items-center justify-between mb-4"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="calendar" size={24} color="#2563EB" />
                        <Text className="text-gray-800 font-medium ml-3">
                            {date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Time Button */}
                <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    className="bg-gray-50 p-4 rounded-xl flex-row items-center justify-between"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="time" size={24} color="#2563EB" />
                        <Text className="text-gray-800 font-medium ml-3">
                            {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <View className="h-[1px] bg-gray-100 my-6" />

                <Text className="text-gray-500 font-bold uppercase text-xs mb-4">Ubicación</Text>
                <View className="bg-gray-50 p-4 rounded-xl flex-row items-start">
                    <Ionicons name="location" size={24} color="#EA580C" />
                    <TextInput
                        className="flex-1 ml-3 text-gray-800 text-base"
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Dirección del servicio"
                        placeholderTextColor="#9CA3AF"
                        multiline
                    />
                </View>
            </View>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* Time Picker Modal */}
            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </ScrollView>
    );

    const renderStep2_Details = () => (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-gray-500 font-bold uppercase text-xs mb-4">Tipo de Servicio</Text>
                <View className="flex-row flex-wrap">
                    {['Mantenimiento', 'Reparación', 'Instalación', 'Cotización', 'Garantía'].map(type => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setServiceType(type)}
                            className={`mr-2 mb-3 px-4 py-3 rounded-xl border-2 ${serviceType === type
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={serviceType === type ? 'text-white font-bold' : 'text-gray-600 font-medium'}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Summary Card */}
            <View className="bg-gray-900 rounded-2xl p-6 mt-6">
                <Text className="text-white font-bold text-lg mb-4">Resumen de la Cita</Text>
                <View className="flex-row items-center mb-3">
                    <Ionicons name="person" size={18} color="#9CA3AF" />
                    <Text className="text-gray-300 ml-3">{selectedClient?.name}</Text>
                </View>
                <View className="flex-row items-center mb-3">
                    <Ionicons name="calendar" size={18} color="#9CA3AF" />
                    <Text className="text-gray-300 ml-3">
                        {date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} a las {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View className="flex-row items-center mb-3">
                    <Ionicons name="location" size={18} color="#9CA3AF" />
                    <Text className="text-gray-300 ml-3" numberOfLines={1}>{address}</Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="build" size={18} color="#9CA3AF" />
                    <Text className="text-gray-300 ml-3">{serviceType}</Text>
                </View>
            </View>
        </ScrollView>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
                        <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">
                        {step === 0 ? 'Seleccionar Cliente' :
                            step === 1 ? 'Cuándo y Dónde' : 'Confirmar Cita'}
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Progress */}
                <View className="flex-row mt-6">
                    {[0, 1, 2].map(i => (
                        <View key={i} className={`flex-1 h-1 rounded-full mx-1 ${step >= i ? 'bg-white' : 'bg-white/30'}`} />
                    ))}
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 p-4">
                {step === 0 && renderStep0_Client()}
                {step === 1 && renderStep1_TimeLocation()}
                {step === 2 && renderStep2_Details()}
            </View>

            {/* Footer with Safe Area padding */}
            <View
                className="bg-white border-t border-gray-100"
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
                <View className="p-4">
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={saving}
                        className={`py-4 rounded-2xl items-center shadow-lg flex-row justify-center ${saving ? 'bg-gray-400' : 'bg-blue-600'}`}
                    >
                        {saving ? (
                            <>
                                <ActivityIndicator size="small" color="white" />
                                <Text className="text-white font-bold text-lg ml-2">Guardando...</Text>
                            </>
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                {step === 2 ? '✅ Confirmar Cita' : 'Siguiente →'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
