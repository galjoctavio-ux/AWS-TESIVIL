import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { getLinearDistance } from '../../services/haversine-calculator';
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
    isLoading
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
        const distanceInfo = eventDistances[event.id];

        return (
            <TouchableOpacity
                key={key}
                {...restProps}
                style={[restProps.style, { backgroundColor: bgColor, borderRadius: 6, padding: 3, opacity: 0.95 }]}
                onLongPress={() => onLongPressEvent?.(event)}
                delayLongPress={400}
            >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }} numberOfLines={1}>{event.title}</Text>
                {mode !== 'week' && (
                    <>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 9 }} numberOfLines={1}>{event.address}</Text>
                        {distanceInfo && (
                            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 8, marginTop: 1 }}>
                                {distanceInfo.fromBase ? '🏠' : '📍'} {distanceInfo.distance} km {distanceInfo.fromBase ? '(base)' : ''}
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

                // Styling - increased header height to prevent day number cutoff
                headerContainerStyle={{ height: 70, borderBottomWidth: 1, borderColor: '#E5E7EB', paddingTop: 10 }}
                bodyContainerStyle={{ backgroundColor: '#F9FAFB' }}
                dayHeaderStyle={{ backgroundColor: '#F3F4F6', paddingBottom: 5 }}
                dayHeaderHighlightColor="#2563EB"
                weekDayHeaderHighlightColor="#2563EB"
                hourStyle={{ fontSize: 10, color: '#9CA3AF' }}
            />
        </View>
    );
}
