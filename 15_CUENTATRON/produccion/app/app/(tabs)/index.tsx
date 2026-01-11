/**
 * Dashboard / Inicio Screen
 * Cuentatron MVP
 * 
 * Module: modulo_02_dashboard_inicio
 * Shows: consumo actual, estado dispositivo, última alerta, info CFE, predicción
 * 
 * NO incluir: mini-gráfica (UXUI-009)
 * Predicción: DEBE mostrar kWh Y pesos (UXUI-013)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase, Dispositivo, Alerta } from '../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

// Mock data for development (will be replaced with real API calls)
interface DashboardData {
    consumoHoy: number;
    dispositivo: {
        conectado: boolean;
        nombre: string;
    } | null;
    ultimaAlerta: Alerta | null;
    fechaCorte: string | null;
    consumoBimestreAnterior: number;
    prediccion: {
        kwh: number;
        pesos: number;
    };
}

export default function DashboardScreen() {
    const router = useRouter();
    const { profile, user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null);

    // Fetch dashboard data
    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            // Fetch user's device
            const { data: dispositivos } = await supabase
                .from('dispositivos')
                .select('*')
                .eq('usuario_id', user.id)
                .limit(1);

            const device = dispositivos?.[0] || null;
            setDispositivo(device);

            // Fetch latest alert
            const { data: alertas } = await supabase
                .from('alertas')
                .select('*')
                .eq('usuario_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

            const ultimaAlerta = alertas?.[0] || null;

            // Calculate mock data (will be replaced with InfluxDB queries)
            setData({
                consumoHoy: 15.7, // Mock - from InfluxDB
                dispositivo: device ? {
                    conectado: device.estado === 'vinculado' || device.estado === 'suscrito',
                    nombre: device.nombre_personalizado || device.device_id,
                } : null,
                ultimaAlerta,
                fechaCorte: profile?.fecha_corte || null,
                consumoBimestreAnterior: profile?.consumo_ultimo_recibo || 0,
                prediccion: {
                    kwh: 280, // Mock - calculated based on current consumption rate
                    pesos: 850, // Mock - based on CFE tariff
                },
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [user, profile]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [fetchData]);

    // Format date for display
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'No configurada';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format time ago
    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffMins > 0) return `hace ${diffMins} min`;
        return 'ahora';
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    // No device linked state
    if (!dispositivo) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Ionicons name="hardware-chip-outline" size={64} color="#666" />
                <Text style={styles.emptyTitle}>Sin dispositivo vinculado</Text>
                <Text style={styles.emptyText}>
                    Vincula tu dispositivo Cuentatron para comenzar a monitorear
                </Text>
                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.push('/vincular')}
                >
                    <Text style={styles.linkButtonText}>Vincular dispositivo</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#4f46e5"
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    Hola, {profile?.nombre || 'Usuario'}
                </Text>
                <Text style={styles.subtitle}>Tu resumen de energía</Text>
            </View>

            {/* Consumo Actual Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>CONSUMO ACTUAL</Text>
                <View style={styles.consumoContainer}>
                    <Text style={styles.consumoValue}>{data?.consumoHoy.toFixed(1)}</Text>
                    <Text style={styles.consumoUnit}>kWh</Text>
                    <Text style={styles.consumoPeriod}>(hoy)</Text>
                </View>
                {/* Progress bar mock */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '45%' }]} />
                </View>
            </View>

            {/* Información CFE Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="calendar-outline" size={20} color="#4f46e5" />
                    <Text style={styles.cardTitle}>INFORMACIÓN CFE</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fecha de corte:</Text>
                    <Text style={styles.infoValue}>{formatDate(data?.fechaCorte || null)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Bimestre anterior:</Text>
                    <Text style={styles.infoValue}>{data?.consumoBimestreAnterior} kWh</Text>
                </View>

                <View style={styles.divider} />

                {/* Predicción - MUST show both kWh AND pesos (UXUI-013) */}
                <View style={styles.prediccionContainer}>
                    <Text style={styles.prediccionLabel}>Predicción del periodo:</Text>
                    <View style={styles.prediccionValues}>
                        <View style={styles.prediccionItem}>
                            <Text style={styles.prediccionNumber}>~{data?.prediccion.kwh}</Text>
                            <Text style={styles.prediccionUnit}>kWh</Text>
                        </View>
                        <Text style={styles.prediccionDivider}>/</Text>
                        <View style={styles.prediccionItem}>
                            <Text style={styles.prediccionNumber}>~${data?.prediccion.pesos}</Text>
                            <Text style={styles.prediccionUnit}>MXN</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Cards Row */}
            <View style={styles.cardsRow}>
                {/* Dispositivo Card */}
                <TouchableOpacity
                    style={[styles.smallCard, styles.halfCard]}
                    onPress={() => router.push('/(tabs)/cuenta')}
                >
                    <Ionicons
                        name="hardware-chip"
                        size={24}
                        color={data?.dispositivo?.conectado ? '#22c55e' : '#ef4444'}
                    />
                    <Text style={styles.smallCardTitle}>DISPOSITIVO</Text>
                    <View style={styles.statusRow}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: data?.dispositivo?.conectado ? '#22c55e' : '#ef4444' }
                        ]} />
                        <Text style={styles.statusText}>
                            {data?.dispositivo?.conectado ? 'Conectado' : 'Desconectado'}
                        </Text>
                    </View>
                    <Text style={styles.deviceName} numberOfLines={1}>
                        {data?.dispositivo?.nombre}
                    </Text>
                </TouchableOpacity>

                {/* Última Alerta Card */}
                <TouchableOpacity
                    style={[styles.smallCard, styles.halfCard]}
                    onPress={() => router.push('/(tabs)/alertas')}
                >
                    <Ionicons name="notifications" size={24} color="#f59e0b" />
                    <Text style={styles.smallCardTitle}>ÚLTIMA ALERTA</Text>
                    {data?.ultimaAlerta ? (
                        <>
                            <Text style={styles.alertTitle} numberOfLines={1}>
                                {data.ultimaAlerta.titulo}
                            </Text>
                            <Text style={styles.alertTime}>
                                {formatTimeAgo(data.ultimaAlerta.created_at)}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.noAlertText}>Sin alertas recientes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    loadingText: {
        color: '#888',
        marginTop: 12,
    },
    // Header
    header: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginTop: 4,
    },
    // Empty state
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 24,
    },
    linkButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    linkButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    // Cards
    card: {
        backgroundColor: '#252542',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
        letterSpacing: 1,
    },
    // Consumo card
    consumoContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 12,
        marginBottom: 16,
    },
    consumoValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
    },
    consumoUnit: {
        fontSize: 20,
        color: '#888',
        marginLeft: 8,
    },
    consumoPeriod: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#1a1a2e',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4f46e5',
        borderRadius: 4,
    },
    // Info rows
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#888',
    },
    infoValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 12,
    },
    // Predicción
    prediccionContainer: {
        marginTop: 4,
    },
    prediccionLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
    },
    prediccionValues: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    prediccionItem: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    prediccionNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    prediccionUnit: {
        fontSize: 14,
        color: '#888',
        marginLeft: 4,
    },
    prediccionDivider: {
        fontSize: 24,
        color: '#666',
        marginHorizontal: 12,
    },
    // Bottom cards row
    cardsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    smallCard: {
        backgroundColor: '#252542',
        borderRadius: 16,
        padding: 16,
    },
    halfCard: {
        flex: 1,
    },
    smallCardTitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#888',
        letterSpacing: 1,
        marginTop: 12,
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    deviceName: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    alertTitle: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    alertTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    noAlertText: {
        fontSize: 14,
        color: '#666',
    },
});
