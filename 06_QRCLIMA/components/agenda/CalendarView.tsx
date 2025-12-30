import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { getLinearDistance } from '../../services/haversine-calculator';
import { TrafficDistanceResult, formatDuration } from '../../services/traffic-distance-service';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Configure dayjs locale
dayjs.locale('es');

const { height: screenHeight } = Dimensions.get('window');

export type CalendarMode = 'day' | '3days' | 'week';

interface Props {
    events: any[];
    mode: CalendarMode;
    date: Date;
    onChangeDate: (date: Date) => void;
    onPressEvent: (event: any) => void;
    onLongPressEvent?: (event: any) => void;
    onLongPressCell?: (date: Date) => void;
    baseLat?: number | null;
    baseLng?: number | null;
    isLoading?: boolean;
    // PRO Traffic Data
    trafficDataMap?: { [eventId: string]: TrafficDistanceResult };
    isPro?: boolean;
    distanceMode?: 'linear' | 'traffic';
}

export default function CalendarView({
    events,
    mode,
    date,
    onChangeDate,
    onPressEvent,
    onLongPressEvent,
    onLongPressCell,
    baseLat,
    baseLng,
    isLoading,
    trafficDataMap,
    isPro,
    distanceMode = 'linear'
}: Props) {

    // Dynamic height based on screen - adjusted to prevent cut-off
    const calendarHeight = screenHeight - 200;

    // Master Plan v1.0.0 Service Colors
    const getEventColor = (type: string) => {
        switch (type) {
            case 'Mantenimiento': return '#4A90D9';
            case 'Reparación': return '#D94A4A';
            case 'Instalación': return '#4AD97E';
            case 'Reinstalación': return '#4AD97E';
            case 'Garantía': return '#9B59B6';
            case 'Cotización': return '#F1C40F';
            default: return '#6B7280';
        }
    };

    // Get text color based on background (dark text for light colors like yellow/green)
    const getTextColor = (type: string) => {
        switch (type) {
            case 'Cotización': return '#1F2937'; // Dark gray on yellow
            case 'Instalación':
            case 'Reinstalación': return '#065F46'; // Dark green on green
            default: return '#FFFFFF'; // White on dark colors
        }
    };

    // Pre-calculate sequential distances for all events
    // First event: distance from base
    // Subsequent events: distance from previous event
    const eventDistances = useMemo(() => {
        const distanceMap: { [eventId: string]: { distance: string; fromBase: boolean } } = {};

        if (!baseLat || !baseLng) return distanceMap;

        // Sort events by start time
        const sortedEvents = [...events].sort((a, b) => {
            const aTime = a.start instanceof Date ? a.start.getTime() : new Date(a.start).getTime();
            const bTime = b.start instanceof Date ? b.start.getTime() : new Date(b.start).getTime();
            return aTime - bTime;
        });

        let prevLat = baseLat;
        let prevLng = baseLng;

        sortedEvents.forEach((event, index) => {
            const eventLat = event.lat || event.raw?.lat;
            const eventLng = event.lng || event.raw?.lng;

            if (eventLat && eventLng) {
                const distance = getLinearDistance(
                    { latitude: prevLat, longitude: prevLng },
                    { latitude: eventLat, longitude: eventLng }
                );

                distanceMap[event.id] = {
                    distance: distance.toFixed(1),
                    fromBase: index === 0
                };

                // Update previous location for next event
                prevLat = eventLat;
                prevLng = eventLng;
            }
        });

        return distanceMap;
    }, [events, baseLat, baseLng]);

    // Render custom event cell with long press support and distance
    const renderEvent = (event: any, touchableOpacityProps: any) => {
        const { key, ...restProps } = touchableOpacityProps;
        const bgColor = getEventColor(event.type);
        const textColor = getTextColor(event.type);
        const distanceInfo = eventDistances[event.id];
        const trafficInfo = trafficDataMap?.[event.id];
        const isCompleted = event.raw?.status === 'Completado' || event.raw?.status === 'Finalizado';

        return (
            <TouchableOpacity
                key={key}
                {...restProps}
                style={[
                    restProps.style,
                    {
                        backgroundColor: bgColor,
                        borderRadius: 8,
                        padding: 4,
                        marginLeft: 4, // Margin from time column
                        opacity: isCompleted ? 0.65 : 0.95
                    }
                ]}
                onLongPress={() => onLongPressEvent?.(event)}
                delayLongPress={400}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isCompleted && (
                        <Text style={{ color: textColor, fontSize: 10, marginRight: 3 }}>✓</Text>
                    )}
                    <Text
                        style={{ color: textColor, fontWeight: 'bold', fontSize: 11, flex: 1 }}
                        numberOfLines={1}
                    >
                        {event.title}
                    </Text>
                </View>
                {mode !== 'week' && (
                    <>
                        <Text
                            style={{ color: textColor, opacity: 0.85, fontSize: 9 }}
                            numberOfLines={1}
                        >
                            {event.address}
                        </Text>
                        {distanceInfo && (
                            <Text style={{ color: textColor, opacity: 0.7, fontSize: 8, marginTop: 1 }}>
                                {distanceInfo.fromBase ? '🏠' : '📍'} {distanceInfo.distance} km
                                {isPro && distanceMode === 'traffic' && trafficInfo?.isTrafficData && trafficInfo.durationInTrafficMinutes
                                    ? ` • 🚗 ${formatDuration(trafficInfo.durationInTrafficMinutes)}`
                                    : ''}
                            </Text>
                        )}
                    </>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {isLoading && (
                <View className="absolute z-50 w-full h-full bg-white/50 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            )}

            <Calendar
                events={events}
                height={calendarHeight}
                mode={mode === 'week' ? 'week' : mode === '3days' ? '3days' : 'day'}
                date={date}
                swipeEnabled={true}
                showTime={true}
                hourRowHeight={60}
                locale="es"
                onPressEvent={onPressEvent}
                onLongPressCell={onLongPressCell}
                onSwipeEnd={(newDate) => onChangeDate(newDate)}
                renderEvent={renderEvent}

                // Styling - improved contrast and compact day header
                headerContainerStyle={{ height: 60, borderBottomWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', paddingTop: 2 }}
                bodyContainerStyle={{ backgroundColor: '#FAFBFC' }}
                dayHeaderStyle={{ backgroundColor: 'transparent', paddingBottom: 0, paddingTop: 0 }}
                dayHeaderHighlightColor="#2563EB"
                weekDayHeaderHighlightColor="#2563EB"
                hourStyle={{ fontSize: 11, color: '#6B7280', fontWeight: '500' }}
            />
        </View>
    );
}
