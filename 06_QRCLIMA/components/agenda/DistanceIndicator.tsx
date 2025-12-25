import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistance } from '../../services/haversine-calculator';
import { TrafficDistanceResult, formatDuration } from '../../services/traffic-distance-service';

interface Props {
    distanceKm: number;
    compact?: boolean;
    label?: string;  // Custom label like "desde tu base" or "desde cita anterior"
    // PRO Traffic Data
    trafficData?: TrafficDistanceResult;
    isPro?: boolean;
}

/**
 * DistanceIndicator Component
 * Shows route efficiency with color coding according to Master Plan:
 * - GREEN: < 10 km (Óptimo)
 * - YELLOW: 10-30 km (Aceptable)
 * - RED: > 30 km (Ineficiente)
 * 
 * PRO users see traffic-based duration instead of linear distance
 */
export default function DistanceIndicator({
    distanceKm,
    compact = false,
    label = 'desde tu base',
    trafficData,
    isPro = false
}: Props) {
    // Use traffic distance if available, otherwise haversine
    const displayDistance = trafficData?.distanceKm ?? distanceKm;
    const showTrafficData = isPro && trafficData?.isTrafficData;

    // Determine efficiency color based on distance
    const getEfficiencyConfig = () => {
        if (displayDistance < 10) {
            return {
                color: 'green',
                bgColor: 'bg-green-100',
                textColor: 'text-green-700',
                iconColor: '#16A34A',
                efficiencyLabel: 'Óptimo',
            };
        } else if (displayDistance <= 30) {
            return {
                color: 'yellow',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-700',
                iconColor: '#D97706',
                efficiencyLabel: 'Aceptable',
            };
        } else {
            return {
                color: 'red',
                bgColor: 'bg-red-100',
                textColor: 'text-red-700',
                iconColor: '#DC2626',
                efficiencyLabel: 'Ineficiente',
            };
        }
    };

    const config = getEfficiencyConfig();

    if (compact) {
        return (
            <View className={`flex-row items-center px-2 py-1 rounded-lg ${config.bgColor}`}>
                <Ionicons name="navigate-circle" size={14} color={config.iconColor} />
                <Text className={`text-xs font-bold ml-1 ${config.textColor}`}>
                    {formatDistance(displayDistance)}
                </Text>
                {showTrafficData && (
                    <View className="bg-indigo-500 px-1 rounded ml-1">
                        <Text className="text-white text-[8px] font-bold">PRO</Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View className={`flex-row items-center p-3 rounded-xl ${config.bgColor}`}>
            <View className="w-8 h-8 rounded-full bg-white/50 items-center justify-center mr-3">
                <Ionicons name="navigate" size={18} color={config.iconColor} />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className={`font-bold ${config.textColor}`}>
                        {formatDistance(displayDistance)} {label}
                    </Text>
                    {showTrafficData && (
                        <View className="bg-indigo-500 px-1.5 py-0.5 rounded ml-2">
                            <Text className="text-white text-[10px] font-bold">PRO</Text>
                        </View>
                    )}
                </View>

                {/* PRO: Show traffic duration */}
                {showTrafficData && trafficData?.durationInTrafficMinutes ? (
                    <View className="flex-row items-center mt-0.5">
                        <Ionicons name="time-outline" size={12} color={config.iconColor} />
                        <Text className={`text-xs ml-1 ${config.textColor} opacity-70`}>
                            ~{formatDuration(trafficData.durationInTrafficMinutes)} con tráfico
                        </Text>
                        {trafficData.isFromCache && (
                            <Text className={`text-xs ml-1 ${config.textColor} opacity-50`}>
                                (cache)
                            </Text>
                        )}
                    </View>
                ) : (
                    <Text className={`text-xs ${config.textColor} opacity-70`}>
                        {config.efficiencyLabel} • Distancia lineal
                    </Text>
                )}
            </View>
        </View>
    );
}

/**
 * Returns the route efficiency color for a given distance
 */
export const getRouteEfficiencyColor = (distanceKm: number): 'green' | 'yellow' | 'red' => {
    if (distanceKm < 10) return 'green';
    if (distanceKm <= 30) return 'yellow';
    return 'red';
};

