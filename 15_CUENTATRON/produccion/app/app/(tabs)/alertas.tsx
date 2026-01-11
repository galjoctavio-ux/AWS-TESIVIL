/**
 * Alertas Screen
 * Cuentatron MVP
 * 
 * Module: modulo_03_alertas
 * 8 alert types for users (UXUI-034 to UXUI-042)
 * Filters: Todas, Consumo, Voltaje, Picos, CFE, Sistema
 * 
 * NO mostrar: alertas admin (UXUI-043, UXUI-044)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase, Alerta } from '../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

// Alert filter types
type AlertFilter = 'todas' | 'consumo' | 'voltaje' | 'picos' | 'cfe' | 'sistema';

// Alert type configuration (UXUI-034 to UXUI-042)
const ALERT_TYPES: Record<string, {
    icon: string;
    color: string;
    category: AlertFilter;
    hasChart: boolean;
}> = {
    'reporte_diario': { icon: 'bar-chart', color: '#3b82f6', category: 'consumo', hasChart: false },
    'aviso_corte_3dias': { icon: 'calendar', color: '#f59e0b', category: 'cfe', hasChart: false },
    'dia_corte': { icon: 'calendar-outline', color: '#ef4444', category: 'cfe', hasChart: false },
    'picos_voltaje_alto': { icon: 'flash', color: '#ef4444', category: 'voltaje', hasChart: true },
    'voltaje_bajo': { icon: 'flash-off', color: '#f59e0b', category: 'voltaje', hasChart: true },
    'fuga_corriente': { icon: 'water', color: '#ef4444', category: 'picos', hasChart: true },
    'consumo_fantasma': { icon: 'moon', color: '#8b5cf6', category: 'picos', hasChart: true },
    'brinco_escalon': { icon: 'trending-up', color: '#f59e0b', category: 'sistema', hasChart: false },
    'felicitacion_conexion': { icon: 'checkmark-circle', color: '#22c55e', category: 'sistema', hasChart: false },
};

const FILTERS: { key: AlertFilter; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'consumo', label: 'Consumo' },
    { key: 'voltaje', label: 'Voltaje' },
    { key: 'picos', label: 'Picos' },
    { key: 'cfe', label: 'CFE' },
    { key: 'sistema', label: 'Sistema' },
];

export default function AlertasScreen() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [filter, setFilter] = useState<AlertFilter>('todas');
    const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null);

    // Fetch alerts
    const fetchAlertas = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('alertas')
                .select('*')
                .eq('usuario_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setAlertas(data || []);
        } catch (error) {
            console.error('Error fetching alertas:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAlertas();
    }, [fetchAlertas]);

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAlertas();
        setRefreshing(false);
    }, [fetchAlertas]);

    // Filter alerts
    const filteredAlertas = alertas.filter(alerta => {
        if (filter === 'todas') return true;
        const alertType = ALERT_TYPES[alerta.tipo];
        return alertType?.category === filter;
    });

    // Mark alert as read
    const markAsRead = async (alertaId: number) => {
        try {
            await supabase
                .from('alertas')
                .update({ leida: true, fecha_lectura: new Date().toISOString() })
                .eq('id', alertaId);

            // Update local state
            setAlertas(prev =>
                prev.map(a => a.id === alertaId ? { ...a, leida: true } : a)
            );
        } catch (error) {
            console.error('Error marking alert as read:', error);
        }
    };

    // Handle alert tap
    const handleAlertPress = (alerta: Alerta) => {
        if (!alerta.leida) {
            markAsRead(alerta.id);
        }
        setSelectedAlerta(alerta);
    };

    // Format time
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return date.toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffMins > 0) return `Hace ${diffMins} min`;
        return 'Ahora';
    };

    // Get alert config
    const getAlertConfig = (tipo: string) => {
        return ALERT_TYPES[tipo] || {
            icon: 'alert-circle',
            color: '#888',
            category: 'sistema',
            hasChart: false,
        };
    };

    // Unread count
    const unreadCount = alertas.filter(a => !a.leida).length;

    // Render filter button
    const renderFilter = ({ item }: { item: { key: AlertFilter; label: string } }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                filter === item.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(item.key)}
        >
            <Text style={[
                styles.filterText,
                filter === item.key && styles.filterTextActive,
            ]}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );

    // Render alert item
    const renderAlerta = ({ item }: { item: Alerta }) => {
        const config = getAlertConfig(item.tipo);

        return (
            <TouchableOpacity
                style={[styles.alertCard, !item.leida && styles.alertCardUnread]}
                onPress={() => handleAlertPress(item)}
            >
                <View style={[styles.alertIconContainer, { backgroundColor: config.color + '20' }]}>
                    <Ionicons
                        name={config.icon as any}
                        size={24}
                        color={config.color}
                    />
                </View>
                <View style={styles.alertContent}>
                    <Text style={styles.alertTitle} numberOfLines={1}>
                        {item.titulo}
                    </Text>
                    <Text style={styles.alertMessage} numberOfLines={2}>
                        {item.mensaje}
                    </Text>
                    <Text style={styles.alertTime}>{formatTime(item.created_at)}</Text>
                </View>
                {!item.leida && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    // Render detail modal
    const renderDetailModal = () => {
        if (!selectedAlerta) return null;
        const config = getAlertConfig(selectedAlerta.tipo);

        return (
            <Modal
                visible={true}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedAlerta(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIcon, { backgroundColor: config.color + '20' }]}>
                                <Ionicons name={config.icon as any} size={32} color={config.color} />
                            </View>
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setSelectedAlerta(null)}
                            >
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalTitle}>{selectedAlerta.titulo}</Text>
                        <Text style={styles.modalTime}>
                            {formatTime(selectedAlerta.created_at)}
                        </Text>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalMessage}>{selectedAlerta.mensaje}</Text>

                            {/* Chart placeholder for alerts that require it (UXUI-037 to UXUI-040) */}
                            {config.hasChart && (
                                <View style={styles.chartPlaceholder}>
                                    <Ionicons name="stats-chart" size={48} color="#666" />
                                    <Text style={styles.chartPlaceholderText}>
                                        Gráfica del evento
                                    </Text>
                                    <Text style={styles.chartPlaceholderSubtext}>
                                        (Datos de InfluxDB)
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setSelectedAlerta(null)}
                        >
                            <Text style={styles.modalButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Alertas</Text>
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                )}
            </View>

            {/* Filters */}
            <FlatList
                data={FILTERS}
                renderItem={renderFilter}
                keyExtractor={(item) => item.key}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterList}
                contentContainerStyle={styles.filterContainer}
            />

            {/* Alerts List */}
            <FlatList
                data={filteredAlertas}
                renderItem={renderAlerta}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4f46e5"
                    />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={48} color="#666" />
                        <Text style={styles.emptyText}>No hay alertas</Text>
                    </View>
                }
            />

            {/* Detail Modal */}
            {renderDetailModal()}
        </View>
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
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    badge: {
        backgroundColor: '#ef4444',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Filters
    filterList: {
        maxHeight: 50,
    },
    filterContainer: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#252542',
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: '#4f46e5',
    },
    filterText: {
        color: '#888',
        fontSize: 14,
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '500',
    },
    // Alert list
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    alertCard: {
        flexDirection: 'row',
        backgroundColor: '#252542',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    alertCardUnread: {
        borderLeftWidth: 3,
        borderLeftColor: '#4f46e5',
    },
    alertIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    alertMessage: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
    },
    alertTime: {
        fontSize: 12,
        color: '#666',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4f46e5',
        marginLeft: 8,
    },
    // Empty state
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginTop: 12,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#252542',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    modalIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalClose: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    modalTime: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
    },
    modalBody: {
        maxHeight: 300,
    },
    modalMessage: {
        fontSize: 16,
        color: '#ccc',
        lineHeight: 24,
    },
    chartPlaceholder: {
        height: 200,
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    chartPlaceholderText: {
        color: '#666',
        marginTop: 12,
    },
    chartPlaceholderSubtext: {
        color: '#444',
        fontSize: 12,
        marginTop: 4,
    },
    modalButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
