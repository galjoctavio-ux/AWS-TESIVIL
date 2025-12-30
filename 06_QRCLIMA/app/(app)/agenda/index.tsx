import { View, Text, TouchableOpacity, RefreshControl, SafeAreaView, ScrollView } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';
import { getUpcomingServices, ServiceData } from '../../../services/services-service';
import { getLinearDistance } from '../../../services/haversine-calculator';
import { getUserProfile, isUserPro, updateUserProfile } from '../../../services/user-service';
import { getTrafficDistance, TrafficDistanceResult, getDailyApiUsageInfo } from '../../../services/traffic-distance-service';
import CalendarView, { CalendarMode } from '../../../components/agenda/CalendarView';
import ActionSheet from '../../../components/agenda/ActionSheet';
import BottomNav from '../../../components/BottomNav';

export default function AgendaScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const { settings, updateSettings } = useSettings();

    // Calendar State
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // View Mode State
    const [viewMode, setViewMode] = useState<CalendarMode>('day');

    // Interaction State
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    // Base Location for distance
    const [baseLat, setBaseLat] = useState<number | null>(null);
    const [baseLng, setBaseLng] = useState<number | null>(null);

    // PRO Traffic Feature
    const [isPro, setIsPro] = useState(false);
    const [trafficData, setTrafficData] = useState<TrafficDistanceResult | null>(null);
    const [trafficDataMap, setTrafficDataMap] = useState<{ [eventId: string]: TrafficDistanceResult }>({});
    const [loadingTraffic, setLoadingTraffic] = useState(false);

    // API Usage for distance mode counter
    const [apiUsage, setApiUsage] = useState<{ used: number, max: number, remaining: number }>({ used: 0, max: 10, remaining: 10 });

    // Data Load
    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadEvents();
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
            // Sync settings if profile has preference but settings doesn't
            if (profile?.preferredNavigationApp && !settings.preferredNavApp) {
                updateSettings({ preferredNavApp: profile.preferredNavigationApp });
            }
            // Check PRO status
            const userIsPro = isUserPro(profile);
            setIsPro(userIsPro);

            // Load API usage for PRO users
            if (userIsPro) {
                const usage = await getDailyApiUsageInfo();
                setApiUsage(usage);
            }
        } catch (error) {
            console.error('Error loading base location:', error);
        }
    };

    const loadEvents = async () => {
        setLoading(true);
        try {
            const services = await getUpcomingServices(user!.uid);

            const calendarEvents = services.map(s => ({
                id: s.id,
                title: s.clientName || 'Cliente',
                start: s.date?.toDate ? s.date.toDate() : new Date(s.date),
                end: calculateEndTime(s.date?.toDate ? s.date.toDate() : new Date(s.date)),
                type: s.type,
                address: s.address || 'Sin dirección',
                lat: s.lat,
                lng: s.lng,
                raw: s
            }));

            setEvents(calendarEvents);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEvents();
        setRefreshing(false);
    };

    const calculateEndTime = (startDate: Date) => {
        const end = new Date(startDate);
        end.setHours(end.getHours() + 1);
        return end;
    };

    // PRO Feature: Load traffic data when event is selected
    useEffect(() => {
        const loadTrafficData = async () => {
            // Only load for PRO users with a selected event
            if (!isPro || !selectedEvent || !baseLat || !baseLng) {
                setTrafficData(null);
                return;
            }

            const targetLat = selectedEvent.lat || selectedEvent.raw?.lat;
            const targetLng = selectedEvent.lng || selectedEvent.raw?.lng;

            if (!targetLat || !targetLng) {
                setTrafficData(null);
                return;
            }

            // Calculate origin: base or previous event
            const sortedEvents = [...events].sort((a, b) => {
                const aTime = a.start instanceof Date ? a.start.getTime() : new Date(a.start).getTime();
                const bTime = b.start instanceof Date ? b.start.getTime() : new Date(b.start).getTime();
                return aTime - bTime;
            });

            const eventIndex = sortedEvents.findIndex(e => e.id === selectedEvent.id);
            let originLat: number, originLng: number;

            if (eventIndex <= 0) {
                // First event: from base
                originLat = baseLat;
                originLng = baseLng;
            } else {
                // From previous event
                const prevEvent = sortedEvents[eventIndex - 1];
                originLat = prevEvent.lat || prevEvent.raw?.lat || baseLat;
                originLng = prevEvent.lng || prevEvent.raw?.lng || baseLng;
            }

            setLoadingTraffic(true);
            try {
                const data = await getTrafficDistance(
                    { latitude: originLat, longitude: originLng },
                    { latitude: targetLat, longitude: targetLng }
                );
                setTrafficData(data);
                // Also update trafficDataMap for calendar cards
                setTrafficDataMap(prev => ({ ...prev, [selectedEvent.id]: data }));
            } catch (error) {
                console.error('[Agenda] Error loading traffic data:', error);
                setTrafficData(null);
            } finally {
                setLoadingTraffic(false);
            }
        };

        loadTrafficData();
    }, [selectedEvent, isPro, baseLat, baseLng, events]);

    // Navigate days
    const goToday = () => setDate(new Date());
    const goPrev = () => {
        const newDate = new Date(date);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (viewMode === '3days') {
            newDate.setDate(newDate.getDate() - 3);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }
        setDate(newDate);
    };
    const goNext = () => {
        const newDate = new Date(date);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (viewMode === '3days') {
            newDate.setDate(newDate.getDate() + 3);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        setDate(newDate);
    };

    const viewModes: { value: CalendarMode; label: string }[] = [
        { value: 'day', label: '1 Día' },
        { value: '3days', label: '3 Días' },
        { value: 'week', label: 'Semana' },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            {/* ========================================== */}
            {/* HEADER - Simplified & Modern */}
            {/* ========================================== */}
            <View className="bg-blue-600 pb-3 px-4" style={{ paddingTop: insets.top + 4 }}>
                {/* Top Row: Navigation + Title + Actions */}
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={goPrev} className="p-1 mr-1">
                            <Ionicons name="chevron-back" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={goToday} className="flex-row items-center">
                            <Text className="text-white text-lg font-bold">
                                {date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                            </Text>
                            {date.toDateString() !== new Date().toDateString() && (
                                <View className="ml-2 bg-white/25 px-2 py-0.5 rounded">
                                    <Text className="text-white text-[10px] font-bold">HOY</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={goNext} className="p-1 ml-1">
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center">
                        {/* Traffic Mode Toggle (Icon) */}
                        <TouchableOpacity
                            onPress={() => {
                                if (isPro) {
                                    const newMode = settings.distanceMode === 'linear' ? 'traffic' : 'linear';
                                    updateSettings({ distanceMode: newMode });
                                } else {
                                    router.push('/(app)/wallet');
                                }
                            }}
                            className={`w-9 h-9 rounded-full items-center justify-center mr-2 ${!isPro
                                ? 'bg-white/15'
                                : settings.distanceMode === 'traffic'
                                    ? 'bg-green-500'
                                    : 'bg-white/20'
                                }`}
                        >
                            <Ionicons
                                name={isPro && settings.distanceMode === 'traffic' ? 'car' : 'navigate'}
                                size={18}
                                color="white"
                            />
                            {!isPro && (
                                <View className="absolute -top-0.5 -right-0.5 bg-amber-500 w-3.5 h-3.5 rounded-full items-center justify-center">
                                    <Ionicons name="lock-closed" size={8} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Reminders (icon only) */}
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/agenda/reminders')}
                            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
                        >
                            <Ionicons name="notifications" size={18} color="white" />
                            <View className="absolute -top-0.5 -right-0.5 bg-amber-500 w-3.5 h-3.5 rounded-full items-center justify-center">
                                <Text className="text-white text-[7px] font-bold">★</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Modern Segmented Control - iOS/Material 3 Style */}
                <View
                    className="flex-row mt-3 bg-blue-700/30 rounded-xl p-1"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2
                    }}
                >
                    {viewModes.map(mode => (
                        <TouchableOpacity
                            key={mode.value}
                            onPress={() => setViewMode(mode.value)}
                            className="flex-1 py-2 rounded-lg items-center"
                            style={viewMode === mode.value ? {
                                backgroundColor: 'white',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 4,
                                elevation: 2,
                            } : {}}
                        >
                            <Text
                                className={`font-semibold text-sm ${viewMode === mode.value ? 'text-blue-600' : 'text-blue-200'}`}
                            >
                                {mode.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* API Counter (only when traffic mode active) */}
                {isPro && settings.distanceMode === 'traffic' && (
                    <View className="flex-row items-center justify-center mt-2">
                        <View className="flex-row items-center bg-green-500/30 px-3 py-1 rounded-full">
                            <Ionicons name="speedometer-outline" size={12} color="white" />
                            <Text className="text-white text-xs ml-1.5 font-medium">
                                {apiUsage.used}/{apiUsage.max} consultas tráfico
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* ========================================== */}
            {/* CALENDAR VIEW */}
            {/* ========================================== */}
            <View className="flex-1">
                <CalendarView
                    events={events}
                    mode={viewMode}
                    date={date}
                    onChangeDate={setDate}
                    onPressEvent={(event) => setSelectedEvent(event)}
                    onLongPressEvent={(event) => setSelectedEvent(event)}
                    onLongPressCell={(cellDate) => {
                        // Pass the selected date/time to wizard
                        const timestamp = cellDate.getTime();
                        router.push(`/(app)/agenda/wizard?presetDate=${timestamp}`);
                    }}
                    baseLat={baseLat}
                    baseLng={baseLng}
                    isLoading={loading || refreshing}
                    trafficDataMap={trafficDataMap}
                    isPro={isPro}
                    distanceMode={settings.distanceMode}
                />
            </View>

            {/* ========================================== */}
            {/* LEGEND */}
            {/* ========================================== */}
            <View className="bg-white border-t border-gray-100 px-4 py-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row items-center">
                        <View className="flex-row items-center mr-4">
                            <View className="w-3 h-3 rounded-full bg-[#4A90D9] mr-1" />
                            <Text className="text-gray-500 text-xs">Mant.</Text>
                        </View>
                        <View className="flex-row items-center mr-4">
                            <View className="w-3 h-3 rounded-full bg-[#D94A4A] mr-1" />
                            <Text className="text-gray-500 text-xs">Reparación</Text>
                        </View>
                        <View className="flex-row items-center mr-4">
                            <View className="w-3 h-3 rounded-full bg-[#4AD97E] mr-1" />
                            <Text className="text-gray-500 text-xs">Instalación</Text>
                        </View>
                        <View className="flex-row items-center mr-4">
                            <View className="w-3 h-3 rounded-full bg-[#9B59B6] mr-1" />
                            <Text className="text-gray-500 text-xs">Garantía</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 rounded-full bg-[#F1C40F] mr-1" />
                            <Text className="text-gray-500 text-xs">Cotización</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* FAB - Nueva Cita */}
            <TouchableOpacity
                onPress={() => router.push('/(app)/agenda/wizard')}
                className="absolute right-4 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{ bottom: insets.bottom + 90 }}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* Bottom Navigation */}
            <BottomNav />

            {/* Thumb Zone Action Sheet */}
            {selectedEvent && (
                <ActionSheet
                    selectedEvent={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onNavigate={() => console.log('Navigate')}
                    onCall={() => console.log('Call')}
                    onStartJob={() => {
                        setSelectedEvent(null);
                        router.push('/(app)/scanner?mode=service');
                    }}
                    onDelete={() => loadEvents()}
                    onReschedule={() => loadEvents()}
                    distanceKm={(() => {
                        if (!baseLat || !baseLng) return undefined;
                        // Sort events by time to find sequence
                        const sortedEvents = [...events].sort((a, b) => {
                            const aTime = a.start instanceof Date ? a.start.getTime() : new Date(a.start).getTime();
                            const bTime = b.start instanceof Date ? b.start.getTime() : new Date(b.start).getTime();
                            return aTime - bTime;
                        });

                        const eventIndex = sortedEvents.findIndex(e => e.id === selectedEvent.id);
                        if (eventIndex === -1) return undefined;

                        const targetLat = selectedEvent.lat || selectedEvent.raw?.lat;
                        const targetLng = selectedEvent.lng || selectedEvent.raw?.lng;
                        if (!targetLat || !targetLng) return undefined;

                        let originLat, originLng;

                        if (eventIndex === 0) {
                            // First event: calculate from base
                            originLat = baseLat;
                            originLng = baseLng;
                        } else {
                            // Previous event location
                            const prevEvent = sortedEvents[eventIndex - 1];
                            originLat = prevEvent.lat || prevEvent.raw?.lat;
                            originLng = prevEvent.lng || prevEvent.raw?.lng;
                        }

                        if (!originLat || !originLng) return undefined;

                        return getLinearDistance(
                            { latitude: originLat, longitude: originLng },
                            { latitude: targetLat, longitude: targetLng }
                        );
                    })()}
                    isFromBase={(() => {
                        const sortedEvents = [...events].sort((a, b) => {
                            const aTime = a.start instanceof Date ? a.start.getTime() : new Date(a.start).getTime();
                            const bTime = b.start instanceof Date ? b.start.getTime() : new Date(b.start).getTime();
                            return aTime - bTime;
                        });
                        return sortedEvents[0]?.id === selectedEvent.id;
                    })()}
                    technicianId={user?.uid}
                    trafficData={trafficData || undefined}
                    isPro={isPro}
                    hasBaseLocation={!!(baseLat && baseLng)}
                    onGoToSettings={() => {
                        setSelectedEvent(null);
                        router.push('/(app)/profile/settings');
                    }}
                    preferredNavApp={settings.preferredNavApp}
                    onRememberNavApp={(app) => {
                        updateSettings({ preferredNavApp: app });
                        if (user?.uid) {
                            updateUserProfile(user.uid, { preferredNavigationApp: app });
                        }
                    }}
                />
            )}
        </View>
    );
}
