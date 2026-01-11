/**
 * Dashboard Page
 * Admin Panel Overview
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cpu, Users, AlertTriangle, Activity } from 'lucide-react';
import './DashboardPage.css';

interface Stats {
    totalDevices: number;
    activeDevices: number;
    totalUsers: number;
    pendingAlerts: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalDevices: 0,
        activeDevices: 0,
        totalUsers: 0,
        pendingAlerts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch device count
            const { count: deviceCount } = await supabase
                .from('dispositivos')
                .select('*', { count: 'exact', head: true });

            // Fetch active devices
            const { count: activeCount } = await supabase
                .from('dispositivos')
                .select('*', { count: 'exact', head: true })
                .in('estado', ['vinculado', 'suscrito']);

            // Fetch user count
            const { count: userCount } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true });

            // Fetch unread alerts
            const { count: alertCount } = await supabase
                .from('alertas')
                .select('*', { count: 'exact', head: true })
                .eq('leida', false);

            setStats({
                totalDevices: deviceCount || 0,
                activeDevices: activeCount || 0,
                totalUsers: userCount || 0,
                pendingAlerts: alertCount || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <header className="page-header">
                <h1>Dashboard</h1>
                <p>Resumen general del sistema</p>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.2)' }}>
                        <Cpu size={24} color="#4f46e5" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{loading ? '...' : stats.totalDevices}</span>
                        <span className="stat-label">Dispositivos Total</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                        <Activity size={24} color="#22c55e" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{loading ? '...' : stats.activeDevices}</span>
                        <span className="stat-label">Dispositivos Activos</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                        <Users size={24} color="#3b82f6" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{loading ? '...' : stats.totalUsers}</span>
                        <span className="stat-label">Usuarios Registrados</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                        <AlertTriangle size={24} color="#f59e0b" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{loading ? '...' : stats.pendingAlerts}</span>
                        <span className="stat-label">Alertas Sin Leer</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="section">
                <h2>Acciones Rápidas</h2>
                <div className="actions-grid">
                    <a href="/devices" className="action-card">
                        <Cpu size={32} />
                        <span>Aprovisionar Dispositivo</span>
                    </a>
                    <a href="/users" className="action-card">
                        <Users size={32} />
                        <span>Ver Usuarios</span>
                    </a>
                    <a href="/reports" className="action-card">
                        <AlertTriangle size={32} />
                        <span>Generar Reporte</span>
                    </a>
                </div>
            </section>
        </div>
    );
}
