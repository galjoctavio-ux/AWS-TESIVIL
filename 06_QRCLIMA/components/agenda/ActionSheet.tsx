import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Linking, Alert, Platform, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteService, updateServiceDate } from '../../services/services-service';
import { TrafficDistanceResult } from '../../services/traffic-distance-service';
import DistanceIndicator from './DistanceIndicator';
import MiniCRMCard from './MiniCRMCard';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

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
    isPro
}: Props) {
    // Reschedule State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [newDate, setNewDate] = useState<Date | null>(null);

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
        const phone = selectedEvent.raw?.phone || selectedEvent.phone;
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
        onCall();
    };

    const handleNavigate = () => {
        const address = selectedEvent.address;
        if (address) {
            const encoded = encodeURIComponent(address);
            Linking.openURL(`https://waze.com/ul?q=${encoded}&navigate=yes`).catch(() => {
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
            });
        }
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

                {/* Header: Client & Type */}
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-4">
                        <Text className="text-2xl font-bold text-gray-900 mb-1">{selectedEvent.title}</Text>
                        <Text className="text-gray-500 text-base" numberOfLines={2}>{selectedEvent.address}</Text>
                    </View>

                    {/* Badge - Master Plan Colors */}
                    <View className={`px-3 py-1 rounded-full ${getBadgeColor(selectedEvent.type)}`}>
                        <Text className="text-white font-bold text-xs">{selectedEvent.type}</Text>
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
                    </View>
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

                {/* Primary Actions (Big Buttons) */}
                <View className="flex-row justify-between mb-4">
                    <TouchableOpacity onPress={handleCall} className="items-center w-[23%]">
                        <View className="w-14 h-14 bg-green-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="call" size={26} color="#16A34A" />
                        </View>
                        <Text className="text-gray-600 text-xs font-medium">Llamar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleNavigate} className="items-center w-[23%]">
                        <View className="w-14 h-14 bg-blue-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="map" size={26} color="#2563EB" />
                        </View>
                        <Text className="text-gray-600 text-xs font-medium">Navegar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onStartJob} className="items-center w-[23%]">
                        <View className="w-14 h-14 bg-purple-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="play" size={26} color="#7C3AED" />
                        </View>
                        <Text className="text-gray-600 text-xs font-medium">Iniciar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleReschedule} className="items-center w-[23%]">
                        <View className="w-14 h-14 bg-amber-100 rounded-full items-center justify-center mb-1">
                            <Ionicons name="calendar" size={26} color="#D97706" />
                        </View>
                        <Text className="text-gray-600 text-xs font-medium">Mover</Text>
                    </TouchableOpacity>
                </View>

                {/* Secondary Actions */}
                <View className="border-t border-gray-100 pt-4 flex-row justify-between">
                    <TouchableOpacity onPress={handleDelete} className="flex-row items-center">
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                        <Text className="text-red-600 font-medium ml-2">Eliminar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-gray-400 font-medium">Cerrar</Text>
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
