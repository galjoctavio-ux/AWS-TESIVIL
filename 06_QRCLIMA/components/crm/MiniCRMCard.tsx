import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    clientHistory: any[]; // List of past services
    clientEquipment: any[]; // List of linked equipment
    totalSpend?: number;
    isLoading?: boolean;
}

export default function MiniCRMCard({
    clientHistory,
    clientEquipment,
    totalSpend = 0,
    isLoading
}: Props) {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    return (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mx-4 mt-2">
            {/* Header / Summary */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleExpand}
                className="p-4 flex-row justify-between items-center bg-slate-50"
            >
                <View className="flex-row items-center">
                    <View className="bg-orange-100 p-2 rounded-full mr-3">
                        <Ionicons name="briefcase" size={20} color="#EA580C" />
                    </View>
                    <View>
                        <Text className="font-bold text-gray-800">Historial del Cliente</Text>
                        <Text className="text-xs text-gray-500">
                            {clientHistory.length} servicios • {clientEquipment.length} equipos
                        </Text>
                    </View>
                </View>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Expanded Content */}
            {expanded && (
                <View className="p-4 border-t border-gray-100">

                    {/* Stats */}
                    {totalSpend > 0 && (
                        <View className="flex-row items-center justify-between mb-4 bg-green-50 p-3 rounded-lg">
                            <Text className="text-green-800 font-medium">Inversión Total</Text>
                            <Text className="text-green-800 font-bold text-lg">${totalSpend.toLocaleString()}</Text>
                        </View>
                    )}

                    {/* Equipment Fleet */}
                    <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Flota de Equipos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {clientEquipment.map((eq, index) => (
                            <View key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2 mr-2 w-32">
                                <Text className="font-bold text-gray-700 text-xs" numberOfLines={1}>{eq.brand}</Text>
                                <Text className="text-gray-500 text-[10px]" numberOfLines={1}>{eq.model}</Text>
                                <View className={`mt-1 h-1 w-full rounded-full ${getWarrantyColor(eq)}`} />
                            </View>
                        ))}
                        {clientEquipment.length === 0 && (
                            <Text className="text-gray-400 italic text-sm">Sin equipos registrados.</Text>
                        )}
                    </ScrollView>

                    {/* Last Services */}
                    <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Últimos Servicios</Text>
                    {clientHistory.slice(0, 3).map((svc, index) => (
                        <View key={index} className="flex-row items-center mb-2 last:mb-0">
                            <View className={`w-2 h-2 rounded-full mr-2 ${getServiceColor(svc.type)}`} />
                            <View className="flex-1">
                                <Text className="text-sm text-gray-800">{svc.type}</Text>
                                <Text className="text-[10px] text-gray-400">{formatDate(svc.date)}</Text>
                            </View>
                        </View>
                    ))}
                    {clientHistory.length === 0 && (
                        <Text className="text-gray-400 italic text-sm">Cliente nuevo (sin servicios previos).</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const getServiceColor = (type: string) => {
    switch (type) {
        case 'Instalación': return 'bg-purple-600';
        case 'Mantenimiento': return 'bg-yellow-500';
        case 'Reparación': return 'bg-red-500';
        default: return 'bg-gray-400';
    }
};

const getWarrantyColor = (eq: any) => {
    // Simple heuristic for now - assuming equipment has installedAt or similar
    // This connects to the warranty-validator logic nicely if we had the object fully populated
    return 'bg-green-500';
};

const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: '2-digit' });
};
