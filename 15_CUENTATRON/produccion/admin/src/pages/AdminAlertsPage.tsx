/**
 * Admin Alerts Page
 * Alertas para administradores (UXUI-060)
 * 
 * Recordatorio conexión, dispositivo offline
 */

import { useEffect, useState } from 'react';
import { supabase, Dispositivo } from '../lib/supabase';
import { Bell, WifiOff, Clock, Check, RefreshCw } from 'lucide-react';
import './AdminAlertsPage.css';

interface AdminAlert {
    id: string;
    tipo: 'offline' | 'sin_conectar' | 'inactivo';
    dispositivo: Dispositivo;
    fecha: string;
    resuelta: boolean;
}

export default function AdminAlertsPage() {
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            // Fetch devices that might have alerts
            const { data: devices, error } = await supabase
                .from('dispositivos')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Generate admin alerts based on device states
            const generatedAlerts: AdminAlert[] = [];

            devices?.forEach((device) => {
                // Check for offline devices (last update > 1 hour)
                const lastUpdate = new Date(device.updated_at);
                const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

                if (device.estado === 'vinculado' && lastUpdate < hourAgo) {
                    generatedAlerts.push({
                        id: `offline-${device.device_id}`,
                        tipo: 'offline',
                        dispositivo: device,
                        fecha: device.updated_at,
                        resuelta: false,
                    });
                }

                // Check for devices not connected after 24h
                if (device.estado === 'sin_vincular') {
                    const createdAt = new Date(device.created_at);
                    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

                    if (createdAt < dayAgo) {
                        generatedAlerts.push({
                            id: `sin-conectar-${device.device_id}`,
                            tipo: 'sin_conectar',
                            dispositivo: device,
                            fecha: device.created_at,
                            resuelta: false,
                        });
                    }
                }
            });

            setAlerts(generatedAlerts);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsResolved = (alertId: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === alertId ? { ...a, resuelta: true } : a
        ));
    };

    const getAlertIcon = (tipo: string) => {
        switch (tipo) {
            case 'offline': return <WifiOff size={20} className="alert-icon-offline" />;
            case 'sin_conectar': return <Clock size={20} className="alert-icon-pending" />;
            default: return <Bell size={20} />;
        }
    };

    const getAlertTitle = (tipo: string) => {
        switch (tipo) {
            case 'offline': return 'Dispositivo Offline';
            case 'sin_conectar': return 'Pendiente de Conexión';
            case 'inactivo': return 'Usuario Inactivo';
            default: return 'Alerta';
        }
    };

    const getAlertDescription = (alert: AdminAlert) => {
        switch (alert.tipo) {
            case 'offline':
                return `El dispositivo ${alert.dispositivo.device_id} no ha enviado datos recientemente.`;
            case 'sin_conectar':
                return `El dispositivo ${alert.dispositivo.device_id} fue creado hace más de 24 horas y no ha sido vinculado.`;
            default:
                return 'Requiere atención.';
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !alert.resuelta;
        if (filter === 'resolved') return alert.resuelta;
        return true;
    });

    const pendingCount = alerts.filter(a => !a.resuelta).length;

    return (
        <div className="admin-alerts-page">
            <header className="page-header">
                <div>
                    <h1>Alertas Admin</h1>
                    <p>Monitoreo de dispositivos y usuarios</p>
                </div>
                <div className="header-actions">
                    {pendingCount > 0 && (
                        <span className="pending-badge">{pendingCount} pendientes</span>
                    )}
                    <button className="btn-secondary" onClick={fetchAlerts}>
                        <RefreshCw size={20} />
                        Actualizar
                    </button>
                </div>
            </header>

            {/* Filter */}
            <div className="filter-bar">
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pendientes
                </button>
                <button
                    className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setFilter('resolved')}
                >
                    Resueltas
                </button>
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todas
                </button>
            </div>

            {/* Alerts List */}
            <div className="alerts-list">
                {loading ? (
                    <div className="loading-state">Cargando alertas...</div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} />
                        <p>No hay alertas {filter === 'pending' ? 'pendientes' : ''}</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`alert-card ${alert.resuelta ? 'resolved' : ''}`}
                        >
                            <div className="alert-icon">
                                {getAlertIcon(alert.tipo)}
                            </div>
                            <div className="alert-content">
                                <h3 className="alert-title">{getAlertTitle(alert.tipo)}</h3>
                                <p className="alert-description">{getAlertDescription(alert)}</p>
                                <span className="alert-date">
                                    {new Date(alert.fecha).toLocaleString('es-MX')}
                                </span>
                            </div>
                            {!alert.resuelta && (
                                <button
                                    className="resolve-btn"
                                    onClick={() => markAsResolved(alert.id)}
                                >
                                    <Check size={16} />
                                    Resolver
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
