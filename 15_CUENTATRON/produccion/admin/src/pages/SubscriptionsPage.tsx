/**
 * Subscriptions Page
 * Control de suscripciones (UXUI-059)
 * 
 * Activar/cancelar acceso a usuarios
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, Check, X, RefreshCw } from 'lucide-react';
import './SubscriptionsPage.css';

interface UserSubscription {
    id: string;
    email: string;
    nombre: string;
    subscription_status: 'active' | 'inactive' | 'pending';
    fecha_proximo_pago: string | null;
    created_at: string;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('id, email, nombre, subscription_status, fecha_proximo_pago, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubscriptions(data || []);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubscription = async (userId: string, newStatus: 'active' | 'inactive') => {
        try {
            const { error } = await supabase
                .from('perfiles')
                .update({
                    subscription_status: newStatus,
                    fecha_proximo_pago: newStatus === 'active'
                        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        : null
                })
                .eq('id', userId);

            if (error) throw error;
            fetchSubscriptions();
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Error al actualizar suscripción');
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        if (filter === 'all') return true;
        return sub.subscription_status === filter;
    });

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.subscription_status === 'active').length,
        inactive: subscriptions.filter(s => s.subscription_status === 'inactive').length,
    };

    return (
        <div className="subscriptions-page">
            <header className="page-header">
                <div>
                    <h1>Suscripciones</h1>
                    <p>Control de suscripciones de usuarios</p>
                </div>
                <button className="btn-secondary" onClick={fetchSubscriptions}>
                    <RefreshCw size={20} />
                    Actualizar
                </button>
            </header>

            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Usuarios</span>
                </div>
                <div className="stat-card stat-active">
                    <span className="stat-value">{stats.active}</span>
                    <span className="stat-label">Activas</span>
                </div>
                <div className="stat-card stat-inactive">
                    <span className="stat-value">{stats.inactive}</span>
                    <span className="stat-label">Inactivas</span>
                </div>
            </div>

            {/* Filter */}
            <div className="filter-bar">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todas
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Activas
                </button>
                <button
                    className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
                    onClick={() => setFilter('inactive')}
                >
                    Inactivas
                </button>
            </div>

            {/* Subscriptions Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Próximo Pago</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="loading-cell">Cargando...</td></tr>
                        ) : filteredSubscriptions.length === 0 ? (
                            <tr><td colSpan={5} className="empty-cell">No hay suscripciones</td></tr>
                        ) : (
                            filteredSubscriptions.map((sub) => (
                                <tr key={sub.id}>
                                    <td>
                                        <div className="user-info">
                                            <CreditCard size={16} />
                                            {sub.nombre || 'Sin nombre'}
                                        </div>
                                    </td>
                                    <td>{sub.email}</td>
                                    <td>
                                        <span className={`status-badge status-${sub.subscription_status}`}>
                                            {sub.subscription_status === 'active' ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td>
                                        {sub.fecha_proximo_pago
                                            ? new Date(sub.fecha_proximo_pago).toLocaleDateString('es-MX')
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        {sub.subscription_status === 'active' ? (
                                            <button
                                                className="action-btn action-danger"
                                                onClick={() => toggleSubscription(sub.id, 'inactive')}
                                            >
                                                <X size={16} />
                                                Cancelar
                                            </button>
                                        ) : (
                                            <button
                                                className="action-btn action-success"
                                                onClick={() => toggleSubscription(sub.id, 'active')}
                                            >
                                                <Check size={16} />
                                                Activar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
