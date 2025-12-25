import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getClientServices } from '../../services/clients-service';

interface Props {
    clientId: string;
    technicianId: string;
}

/**
 * MiniCRMCard Component
 * Shows client service history summary for the ActionSheet
 */
export default function MiniCRMCard({ clientId, technicianId }: Props) {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getClientServices(clientId, technicianId);
                setServices(data);
            } catch (error) {
                console.error('Error loading client history:', error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [clientId, technicianId]);

    if (loading) {
        return (
            <View className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-2">Cargando historial...</Text>
            </View>
        );
    }

    if (services.length === 0) {
        return (
            <View className="bg-gray-50 rounded-xl p-3 flex-row items-center">
                <Ionicons name="information-circle" size={18} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm ml-2">Primer servicio con este cliente</Text>
            </View>
        );
    }

    const lastService = services[0];
    const lastDate = lastService.createdAt?.toDate
        ? lastService.createdAt.toDate()
        : new Date(lastService.createdAt);

    // Count by type
    const typeCounts = services.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostCommonType = Object.entries(typeCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

    return (
        <View className="bg-gray-50 rounded-xl p-3">
            <View className="flex-row items-center mb-2">
                <Ionicons name="time" size={16} color="#6B7280" />
                <Text className="text-gray-700 font-medium ml-2">Historial del Cliente</Text>
            </View>

            <View className="flex-row flex-wrap">
                {/* Total Services */}
                <View className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 flex-row items-center">
                    <Text className="text-gray-800 font-bold">{services.length}</Text>
                    <Text className="text-gray-500 text-xs ml-1">servicios</Text>
                </View>

                {/* Last Visit */}
                <View className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 flex-row items-center">
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                        Última: {lastDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </Text>
                </View>

                {/* Most Common Type */}
                {mostCommonType && (
                    <View className="bg-white rounded-lg px-3 py-2 mb-2 flex-row items-center">
                        <Ionicons name="stats-chart" size={14} color="#6B7280" />
                        <Text className="text-gray-600 text-xs ml-1">
                            {String(mostCommonType[1])}x {String(mostCommonType[0])}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
