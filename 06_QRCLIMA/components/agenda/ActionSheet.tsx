import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Linking, Alert, Platform, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteService, updateServiceDate } from '../../services/services-service';
import { getClientById } from '../../services/clients-service';
import { TrafficDistanceResult } from '../../services/traffic-distance-service';
import DistanceIndicator from './DistanceIndicator';
import MiniCRMCard from './MiniCRMCard';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

type NavAppType = 'waze' | 'google' | 'apple';

interface Props {
    selectedEvent: any | null;
    onClose: () => void;
    onNavigate: () => void;
    onCall: () => void;
    onStartJob: () => void;
    onDelete?: () => void;
    onReschedule?: () => void;
    distanceKm?: number;       // Distance in km
    isFromBase?: boolean;      // True if first appointment (from base), false if from previous
    technicianId?: string;
    // PRO Traffic Data
    trafficData?: TrafficDistanceResult;
    isPro?: boolean;
    // Base Location
    hasBaseLocation?: boolean;
    onGoToSettings?: () => void;
    // Navigation App Preference
    preferredNavApp?: NavAppType | null;
    onRememberNavApp?: (app: NavAppType) => void;
    // Refresh Distance
    onRefreshDistance?: () => void;
    refreshingDistance?: boolean;
}

export default function ActionSheet({
    selectedEvent,
    onClose,
    onNavigate,
    onCall,
    onStartJob,
    onDelete,
    onReschedule,
    distanceKm,
    isFromBase,
    technicianId,
    trafficData,
    isPro,
    hasBaseLocation,
    onGoToSettings,
    preferredNavApp,
    onRememberNavApp,
    onRefreshDistance,
    refreshingDistance
}: Props) {
    // Reschedule State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [newDate, setNewDate] = useState<Date | null>(null);

    // Client Phone State - Fetch from clients collection
    const [clientPhone, setClientPhone] = useState<string | null>(null);

    // Fetch client phone when sheet opens
    useEffect(() => {
        const fetchClientPhone = async () => {
            const clientId = selectedEvent?.raw?.clientId;
            if (clientId) {
                try {
                    const client = await getClientById(clientId);
                    if (client?.phone) {
                        setClientPhone(client.phone);
                    } else {
                        setClientPhone(null);
                    }
                } catch (error) {
                    console.error('[ActionSheet] Error fetching client phone:', error);
                    setClientPhone(null);
                }
            } else {
                setClientPhone(null);
            }
        };

        if (selectedEvent) {
            fetchClientPhone();
        }
    }, [selectedEvent]);

    // Safe area for bottom navigation
    const insets = useSafeAreaInsets();

    // Swipe-to-close animation
    const translateY = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only respond to vertical swipes
                return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    // Swipe down enough - close
                    Animated.timing(translateY, {
                        toValue: height,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        translateY.setValue(0);
                        onClose();
                    });
                } else {
                    // Snap back
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    if (!selectedEvent) return null;

    const handleCall = () => {
        // Priority: fetched clientPhone > raw.phone > phone
        const phone = clientPhone || selectedEvent.raw?.phone || selectedEvent.phone;
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        } else {
            Alert.alert(
                '📞 Sin número',
                'Este cliente no tiene número de teléfono registrado.',
                [{ text: 'Entendido' }]
            );
        }
        onCall();
    };

    const handleWhatsApp = () => {
        const phone = clientPhone || selectedEvent.raw?.phone || selectedEvent.phone;
        if (phone) {
            // Clean phone number and open WhatsApp
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const message = encodeURIComponent(`Hola, soy tu técnico de ${selectedEvent.type}. Voy en camino 🛠️`);
            Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
        } else {
            Alert.alert(
                '📱 Sin número',
                'Este cliente no tiene número de teléfono registrado.',
                [{ text: 'Entendido' }]
            );
        }
    };

    // Navigation URL helpers
    const getNavigationUrls = () => {
        const address = selectedEvent.address;
        const lat = selectedEvent.lat || selectedEvent.raw?.lat;
        const lng = selectedEvent.lng || selectedEvent.raw?.lng;
        const encoded = encodeURIComponent(address || '');
        const coords = lat && lng ? `${lat},${lng}` : '';

        return {
            waze: coords
                ? `https://waze.com/ul?ll=${coords}&navigate=yes`
                : `https://waze.com/ul?q=${encoded}&navigate=yes`,
            google: coords
                ? `https://www.google.com/maps/dir/?api=1&destination=${coords}`
                : `https://www.google.com/maps/search/?api=1&query=${encoded}`,
            apple: coords
                ? `http://maps.apple.com/?daddr=${coords}`
                : `http://maps.apple.com/?q=${encoded}`,
            hasLocation: !!(address || lat)
        };
    };

    const openNavApp = (app: 'waze' | 'google' | 'apple', remember: boolean = false) => {
        const urls = getNavigationUrls();
        const url = urls[app];

        if (remember && onRememberNavApp) {
            onRememberNavApp(app);
        }

        Linking.openURL(url).catch(() => {
            const appNames = { waze: 'Waze', google: 'Google Maps', apple: 'Apple Maps' };
            Alert.alert('Error', `No se pudo abrir ${appNames[app]}`);
        });
    };

    const handleNavigate = () => {
        const urls = getNavigationUrls();

        if (!urls.hasLocation) {
            Alert.alert('📍 Sin ubicación', 'Esta cita no tiene dirección registrada.');
            return;
        }

        // If user has a saved preference, use it directly
        if (preferredNavApp) {
            openNavApp(preferredNavApp);
            onNavigate();
            return;
        }

        // Otherwise, show picker with "remember" option
        Alert.alert(
            '🗺️ Navegación',
            '¿Con qué app deseas abrir la ruta?',
            [
                {
                    text: 'Waze',
                    onPress: () => {
                        Alert.alert('Recordar elección', '¿Siempre usar Waze?', [
                            { text: 'Solo esta vez', onPress: () => openNavApp('waze', false) },
                            { text: 'Siempre', onPress: () => openNavApp('waze', true) }
                        ]);
                    }
                },
                {
                    text: 'Google Maps',
                    onPress: () => {
                        Alert.alert('Recordar elección', '¿Siempre usar Google Maps?', [
                            { text: 'Solo esta vez', onPress: () => openNavApp('google', false) },
                            { text: 'Siempre', onPress: () => openNavApp('google', true) }
                        ]);
                    }
                },
                {
                    text: 'Apple Maps',
                    onPress: () => {
                        Alert.alert('Recordar elección', '¿Siempre usar Apple Maps?', [
                            { text: 'Solo esta vez', onPress: () => openNavApp('apple', false) },
                            { text: 'Siempre', onPress: () => openNavApp('apple', true) }
                        ]);
                    }
                },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
        onNavigate();
    };

    const handleDelete = () => {
        Alert.alert(
            '🗑️ Eliminar Cita',
            `¿Estás seguro de eliminar la cita con ${selectedEvent.title}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteService(selectedEvent.id);
                        if (success) {
                            Alert.alert('✅ Eliminado', 'La cita ha sido eliminada.');
                            onDelete?.();
                            onClose();
                        } else {
                            Alert.alert('Error', 'No se pudo eliminar la cita.');
                        }
                    }
                }
            ]
        );
    };

    const handleReschedule = () => {
        const currentDate = selectedEvent.start || new Date();
        setNewDate(new Date(currentDate));
        setShowDatePicker(true);
    };

    const onDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate && newDate) {
            const updated = new Date(selectedDate);
            updated.setHours(newDate.getHours());
            updated.setMinutes(newDate.getMinutes());
            setNewDate(updated);
            setTimeout(() => setShowTimePicker(true), 300);
        }
    };

    const onTimeChange = async (_event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime && newDate) {
            const finalDate = new Date(newDate);
            finalDate.setHours(selectedTime.getHours());
            finalDate.setMinutes(selectedTime.getMinutes());

            const success = await updateServiceDate(selectedEvent.id, finalDate);
            if (success) {
                Alert.alert('✅ Reprogramado', `Cita movida a ${finalDate.toLocaleDateString('es-MX')} ${finalDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`);
                onReschedule?.();
                onClose();
            } else {
                Alert.alert('Error', 'No se pudo reprogramar la cita.');
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Backdrop */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
            />

            {/* Sheet with Swipe-to-Close */}
            <Animated.View
                className="absolute bottom-0 w-full bg-white rounded-t-3xl p-6 shadow-2xl"
                style={[
                    { paddingBottom: Math.max(insets.bottom, 16) + 16 },
                    { transform: [{ translateY }] }
                ]}
            >
                {/* Handle Bar - Swipe area */}
                <View {...panResponder.panHandlers} className="py-3 -mt-3">
                    <View className="w-12 h-1 bg-gray-300 rounded-full self-center" />
                </View>

                {/* Header: Client & Type + Delete Icon */}
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-4">
                        <Text className="text-2xl font-bold text-gray-900 mb-1">{selectedEvent.title}</Text>
                        <Text className="text-gray-500 text-base" numberOfLines={2}>{selectedEvent.address}</Text>
                    </View>

                    <View className="flex-row items-center">
                        {/* Delete Icon - Top right for safety */}
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="w-8 h-8 items-center justify-center mr-2"
                        >
                            <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                        </TouchableOpacity>

                        {/* Badge - Master Plan Colors */}
                        <View className={`px-3 py-1 rounded-full ${getBadgeColor(selectedEvent.type)}`}>
                            <Text className="text-white font-bold text-xs">{selectedEvent.type}</Text>
                        </View>
                    </View>
                </View>

                {/* Distance Indicator - Sequential */}
                {distanceKm !== undefined && (
                    <View className="mb-3">
                        <DistanceIndicator
                            distanceKm={distanceKm}
                            label={isFromBase ? 'desde tu base' : 'desde cita anterior'}
                            trafficData={trafficData}
                            isPro={isPro}
                        />
                        {/* Calculation time + Refresh button */}
                        {trafficData && (
                            <View className="flex-row items-center justify-between mt-2 px-1">
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                    <Text className="text-gray-400 text-xs ml-1">
                                        Calculado: {new Date(trafficData.lastUpdated).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                        {trafficData.isFromCache && ' (cache)'}
                                    </Text>
                                </View>
                                {isPro && onRefreshDistance && (
                                    <TouchableOpacity
                                        onPress={onRefreshDistance}
                                        disabled={refreshingDistance}
                                        className="flex-row items-center bg-blue-50 px-2 py-1 rounded-md"
                                    >
                                        <Ionicons
                                            name={refreshingDistance ? 'sync' : 'refresh-outline'}
                                            size={14}
                                            color="#2563EB"
                                        />
                                        <Text className="text-blue-600 text-xs font-medium ml-1">
                                            {refreshingDistance ? 'Actualizando...' : 'Actualizar'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* Informative Banner - No Base Location Configured */}
                {!hasBaseLocation && distanceKm === undefined && (
                    <TouchableOpacity
                        onPress={onGoToSettings}
                        className="mb-3 bg-blue-50 border border-blue-200 rounded-xl p-3 flex-row items-start"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="location-outline" size={20} color="#2563EB" style={{ marginTop: 2 }} />
                        <View className="flex-1 ml-2">
                            <Text className="text-blue-800 font-bold text-sm">📍 Activa las distancias</Text>
                            <Text className="text-blue-600 text-xs mt-1 leading-4">
                                Configura tu ubicación base para ver la distancia lineal a cada cita.
                                {isPro
                                    ? ' Como usuario PRO, también verás el tiempo real con tráfico.'
                                    : ' Los usuarios PRO también ven el tiempo con tráfico.'}
                            </Text>
                            <View className="flex-row items-center mt-2">
                                <Text className="text-blue-700 font-bold text-xs">Ir a Configuración</Text>
                                <Ionicons name="chevron-forward" size={14} color="#1D4ED8" />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Mini CRM Card */}
                {selectedEvent.raw?.clientId && technicianId && (
                    <View className="mb-4">
                        <MiniCRMCard
                            clientId={selectedEvent.raw.clientId}
                            technicianId={technicianId}
                        />
                    </View>
                )}

                {/* Primary Actions (Big Buttons) - 5 actions with WhatsApp */}
                <View className="flex-row justify-between mb-4">
                    <TouchableOpacity onPress={handleCall} className="items-center w-[18%]">
                        <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="call-outline" size={22} color="#16A34A" />
                        </View>
                        <Text className="text-gray-600 text-[10px] font-medium">Llamar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleWhatsApp} className="items-center w-[18%]">
                        <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                        </View>
                        <Text className="text-gray-600 text-[10px] font-medium">WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleNavigate} className="items-center w-[18%]">
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="navigate-outline" size={22} color="#2563EB" />
                        </View>
                        <Text className="text-gray-600 text-[10px] font-medium">Navegar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onStartJob} className="items-center w-[18%]">
                        <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="hammer-outline" size={22} color="#7C3AED" />
                        </View>
                        <Text className="text-gray-600 text-[10px] font-medium">Iniciar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleReschedule} className="items-center w-[18%]">
                        <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="calendar-outline" size={22} color="#D97706" />
                        </View>
                        <Text className="text-gray-600 text-[10px] font-medium">Mover</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer - Only Close button */}
                <View className="border-t border-gray-100 pt-4 flex-row justify-center">
                    <TouchableOpacity onPress={onClose} className="px-6 py-2">
                        <Text className="text-gray-500 font-medium">Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    value={newDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                />
            )}

            {/* Time Picker Modal */}
            {showTimePicker && (
                <DateTimePicker
                    value={newDate || new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                />
            )}
        </View>
    );
}

// Master Plan v1.0.0 Service Colors
const getBadgeColor = (type: string) => {
    switch (type) {
        case 'Mantenimiento': return 'bg-[#4A90D9]';
        case 'Reparación': return 'bg-[#D94A4A]';
        case 'Instalación': return 'bg-[#4AD97E]';
        case 'Reinstalación': return 'bg-[#4AD97E]';
        case 'Garantía': return 'bg-[#9B59B6]';
        case 'Cotización': return 'bg-[#F1C40F]';
        default: return 'bg-gray-500';
    }
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        elevation: 10,
    }
});
