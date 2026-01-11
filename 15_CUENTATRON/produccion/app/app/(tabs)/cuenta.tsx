/**
 * Cuenta Screen
 * Cuentatron MVP
 * 
 * Module: modulo_05_cuenta
 * Sections: Profile, Notifications, Subscription, Devices, Reports (7-day only), Logout
 * 
 * NO implementar: cambiar plan (AMB-04)
 * "Mis Reportes" solo para servicio 7 días (UXUI-054)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Modal,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase, Dispositivo, Plan } from '../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

type CuentaSection = 'main' | 'notifications' | 'subscription' | 'devices' | 'reports';

export default function CuentaScreen() {
    const { profile, user, signOut, updateProfile } = useAuth();

    const [section, setSection] = useState<CuentaSection>('main');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState<Dispositivo | null>(null);

    // Check if user has 7-day service (shows reports section)
    const hasSevenDayService = profile?.subscription_status === 'inactive';

    // Fetch devices
    const fetchDevices = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('dispositivos')
                .select('*')
                .eq('usuario_id', user.id);

            if (error) throw error;
            setDispositivos(data || []);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchDevices();
        setNotificationsEnabled(profile?.notificaciones_enabled ?? true);
    }, [fetchDevices, profile]);

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDevices();
        setRefreshing(false);
    }, [fetchDevices]);

    // Handle sign out
    const handleSignOut = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro que deseas salir?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    style: 'destructive',
                    onPress: () => signOut(),
                },
            ]
        );
    };

    // Handle toggle notifications
    const handleToggleNotifications = async (value: boolean) => {
        setNotificationsEnabled(value);
        await updateProfile({ notificaciones_enabled: value });
    };

    // Handle unlink device
    const handleUnlinkDevice = async (device: Dispositivo) => {
        Alert.alert(
            'Desvincular dispositivo',
            `¿Estás seguro que deseas desvincular ${device.nombre_personalizado || device.device_id}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desvincular',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await supabase
                                .from('dispositivos')
                                .update({
                                    usuario_id: null,
                                    estado: 'sin_vincular',
                                    fecha_vinculacion: null,
                                })
                                .eq('device_id', device.device_id);

                            await fetchDevices();
                        } catch (error) {
                            console.error('Error unlinking device:', error);
                            Alert.alert('Error', 'No se pudo desvincular el dispositivo');
                        }
                    },
                },
            ]
        );
    };

    // Handle cancel subscription
    const handleCancelSubscription = () => {
        Alert.alert(
            'Cancelar suscripción',
            '¿Estás seguro que deseas cancelar tu suscripción? Perderás acceso al final del periodo actual.',
            [
                { text: 'No, mantener', style: 'cancel' },
                {
                    text: 'Sí, cancelar',
                    style: 'destructive',
                    onPress: () => {
                        // In real implementation, this would call Stripe API
                        Alert.alert('Aviso', 'La cancelación se procesará próximamente.');
                    },
                },
            ]
        );
    };

    // Render main section
    const renderMainSection = () => (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />
            }
        >
            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={40} color="#4f46e5" />
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile?.nombre || 'Usuario'}</Text>
                    <Text style={styles.profileEmail}>{profile?.email}</Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setSection('notifications')}
                >
                    <View style={styles.menuLeft}>
                        <Ionicons name="notifications-outline" size={24} color="#4f46e5" />
                        <Text style={styles.menuText}>Notificaciones</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setSection('subscription')}
                >
                    <View style={styles.menuLeft}>
                        <Ionicons name="card-outline" size={24} color="#4f46e5" />
                        <Text style={styles.menuText}>Mi Suscripción</Text>
                    </View>
                    <View style={styles.menuRight}>
                        <Text style={styles.menuSubtext}>
                            {profile?.subscription_status === 'active' ? 'Activa' : 'Servicio 7 días'}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setSection('devices')}
                >
                    <View style={styles.menuLeft}>
                        <Ionicons name="hardware-chip-outline" size={24} color="#4f46e5" />
                        <Text style={styles.menuText}>Mis Dispositivos</Text>
                    </View>
                    <View style={styles.menuRight}>
                        <Text style={styles.menuSubtext}>({dispositivos.length})</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                {/* Reports - Only for 7-day service (UXUI-054) */}
                {hasSevenDayService && (
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setSection('reports')}
                    >
                        <View style={styles.menuLeft}>
                            <Ionicons name="document-text-outline" size={24} color="#4f46e5" />
                            <Text style={styles.menuText}>Mis Reportes</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // Render notifications section
    const renderNotificationsSection = () => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <TouchableOpacity onPress={() => setSection('main')}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>Notificaciones</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.settingItem}>
                <View>
                    <Text style={styles.settingTitle}>Notificaciones Push</Text>
                    <Text style={styles.settingSubtitle}>Recibe alertas en tu dispositivo</Text>
                </View>
                <Switch
                    value={notificationsEnabled}
                    onValueChange={handleToggleNotifications}
                    trackColor={{ false: '#333', true: '#4f46e5' }}
                    thumbColor="#fff"
                />
            </View>
        </View>
    );

    // Render subscription section
    const renderSubscriptionSection = () => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <TouchableOpacity onPress={() => setSection('main')}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>Mi Suscripción</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.subscriptionCard}>
                <View style={styles.subscriptionStatus}>
                    <Ionicons
                        name={profile?.subscription_status === 'active' ? 'checkmark-circle' : 'time-outline'}
                        size={32}
                        color={profile?.subscription_status === 'active' ? '#22c55e' : '#f59e0b'}
                    />
                    <Text style={styles.subscriptionStatusText}>
                        {profile?.subscription_status === 'active' ? 'Suscripción Activa' : 'Servicio 7 Días'}
                    </Text>
                </View>

                <View style={styles.subscriptionDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Estado:</Text>
                        <Text style={styles.detailValue}>
                            {profile?.subscription_status === 'active' ? 'Activa' : 'En prueba'}
                        </Text>
                    </View>

                    {profile?.fecha_proximo_pago && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Próximo cobro:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(profile.fecha_proximo_pago).toLocaleDateString('es-MX')}
                            </Text>
                        </View>
                    )}
                </View>

                {profile?.subscription_status === 'active' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelSubscription}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar suscripción</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    // Render devices section
    const renderDevicesSection = () => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <TouchableOpacity onPress={() => setSection('main')}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>Mis Dispositivos</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.deviceList}>
                {dispositivos.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="hardware-chip-outline" size={48} color="#666" />
                        <Text style={styles.emptyText}>Sin dispositivos vinculados</Text>
                    </View>
                ) : (
                    dispositivos.map((device) => (
                        <View key={device.device_id} style={styles.deviceCard}>
                            <View style={styles.deviceInfo}>
                                <View style={styles.deviceHeader}>
                                    <Ionicons name="hardware-chip" size={24} color="#4f46e5" />
                                    <Text style={styles.deviceName}>
                                        {device.nombre_personalizado || device.device_id}
                                    </Text>
                                </View>
                                <Text style={styles.deviceId}>ID: {device.device_id}</Text>
                                <View style={styles.deviceStatus}>
                                    <View style={[
                                        styles.statusDot,
                                        {
                                            backgroundColor: device.estado === 'vinculado' || device.estado === 'suscrito'
                                                ? '#22c55e' : '#888'
                                        }
                                    ]} />
                                    <Text style={styles.deviceStatusText}>
                                        {device.estado === 'vinculado' || device.estado === 'suscrito'
                                            ? 'Conectado' : device.estado}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.unlinkButton}
                                onPress={() => handleUnlinkDevice(device)}
                            >
                                <Ionicons name="unlink-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );

    // Render reports section (7-day service only)
    const renderReportsSection = () => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <TouchableOpacity onPress={() => setSection('main')}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>Mis Reportes</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.reportsInfo}>
                <Ionicons name="document-text" size={48} color="#4f46e5" />
                <Text style={styles.reportsTitle}>Reportes de Diagnóstico</Text>
                <Text style={styles.reportsDescription}>
                    Como usuario del servicio de 7 días, recibirás un reporte PDF
                    con el análisis de tu instalación eléctrica al finalizar el periodo.
                </Text>
            </View>

            <View style={styles.reportsList}>
                {/* Placeholder - reports would come from Supabase Storage */}
                <View style={styles.reportCard}>
                    <Ionicons name="document" size={24} color="#4f46e5" />
                    <View style={styles.reportInfo}>
                        <Text style={styles.reportName}>Diagnóstico Inicial</Text>
                        <Text style={styles.reportDate}>Pendiente de generación</Text>
                    </View>
                    <TouchableOpacity style={styles.downloadButton} disabled>
                        <Ionicons name="download-outline" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Render current section
    const renderSection = () => {
        switch (section) {
            case 'notifications': return renderNotificationsSection();
            case 'subscription': return renderSubscriptionSection();
            case 'devices': return renderDevicesSection();
            case 'reports': return renderReportsSection();
            default: return renderMainSection();
        }
    };

    return (
        <View style={styles.container}>
            {/* Header (only on main) */}
            {section === 'main' && (
                <View style={styles.header}>
                    <Text style={styles.title}>Mi Cuenta</Text>
                </View>
            )}

            {renderSection()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    // Profile card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252542',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#1a1a2e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    profileEmail: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    // Menu
    menuSection: {
        backgroundColor: '#252542',
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuText: {
        fontSize: 16,
        color: '#fff',
    },
    menuSubtext: {
        fontSize: 14,
        color: '#888',
    },
    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        marginTop: 24,
    },
    logoutText: {
        fontSize: 16,
        color: '#ef4444',
    },
    // Section screens
    sectionContainer: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    // Settings
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#252542',
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 12,
    },
    settingTitle: {
        fontSize: 16,
        color: '#fff',
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    // Subscription
    subscriptionCard: {
        backgroundColor: '#252542',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
    },
    subscriptionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    subscriptionStatusText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    subscriptionDetails: {
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        color: '#888',
    },
    detailValue: {
        color: '#fff',
        fontWeight: '500',
    },
    cancelButton: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 8,
    },
    cancelButtonText: {
        color: '#ef4444',
    },
    // Devices
    deviceList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    deviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252542',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    deviceId: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    deviceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    deviceStatusText: {
        fontSize: 12,
        color: '#888',
    },
    unlinkButton: {
        padding: 12,
    },
    // Empty state
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#666',
        marginTop: 12,
    },
    // Reports
    reportsInfo: {
        alignItems: 'center',
        padding: 24,
    },
    reportsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    reportsDescription: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    },
    reportsList: {
        paddingHorizontal: 16,
    },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252542',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    reportInfo: {
        flex: 1,
        marginLeft: 12,
    },
    reportName: {
        fontSize: 16,
        color: '#fff',
    },
    reportDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    downloadButton: {
        padding: 8,
    },
});
