'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';

interface AuditLog {
    id: string;
    action: string;
    adminId: string;
    adminEmail?: string;
    contentId?: string;
    contentType?: string;
    authorId?: string;
    userId?: string;
    details?: string;
    timestamp: string;
    ip?: string;
}

const actionLabels: Record<string, { label: string; icon: string; color: string }> = {
    'admin_login': { label: 'Inicio de Sesión', icon: '🔐', color: 'bg-green-100 text-green-700' },
    'admin_logout': { label: 'Cierre de Sesión', icon: '🚪', color: 'bg-slate-100 text-slate-700' },
    'moderation_dismiss': { label: 'Moderación: Ignorar', icon: '✓', color: 'bg-blue-100 text-blue-700' },
    'moderation_delete': { label: 'Moderación: Eliminar', icon: '🗑️', color: 'bg-orange-100 text-orange-700' },
    'moderation_ban': { label: 'Moderación: Banear', icon: '🚫', color: 'bg-red-100 text-red-700' },
    'user_update': { label: 'Actualizar Usuario', icon: '👤', color: 'bg-purple-100 text-purple-700' },
    'order_shipped': { label: 'Orden Enviada', icon: '📦', color: 'bg-teal-100 text-teal-700' },
    'config_update': { label: 'Config Actualizada', icon: '⚙️', color: 'bg-yellow-100 text-yellow-700' },
    'tokens_gift': { label: 'Tokens Regalados', icon: '🪙', color: 'bg-amber-100 text-amber-700' },
};

export default function LogsPage() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        fetchLogs();
    }, [filter, page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });
            if (filter !== 'all') {
                queryParams.set('action', filter);
            }

            const response = await fetch(`/api/logs?${queryParams}`);
            const data = await response.json();

            if (page === 1) {
                setLogs(data.logs || []);
            } else {
                setLogs(prev => [...prev, ...(data.logs || [])]);
            }
            setHasMore(data.hasMore || false);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionInfo = (action: string) => {
        return actionLabels[action] || {
            label: action,
            icon: '📋',
            color: 'bg-slate-100 text-slate-700'
        };
    };

    const uniqueActions = ['all', ...Object.keys(actionLabels)];

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar onLogout={logout} />

            <main className="lg:ml-64 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Logs de Auditoría</h2>
                        <p className="text-slate-500 mt-1">Historial de acciones administrativas</p>
                    </div>
                    <button
                        onClick={() => {
                            const csvContent = logs.map(log =>
                                `${log.timestamp},${log.action},${log.adminEmail || log.adminId},${log.details || ''}`
                            ).join('\n');
                            const header = 'Fecha,Acción,Admin,Detalles\n';
                            const blob = new Blob([header + csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                        }}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                    >
                        📥 Exportar CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {uniqueActions.map((action) => {
                        const info = action === 'all'
                            ? { label: 'Todos', icon: '📋', color: '' }
                            : getActionInfo(action);

                        return (
                            <button
                                key={action}
                                onClick={() => {
                                    setFilter(action);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === action
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {info.icon} {info.label}
                            </button>
                        );
                    })}
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Fecha/Hora</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Acción</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Administrador</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Detalles</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-slate-500">Cargando logs...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <span className="text-4xl block mb-2">📭</span>
                                        <p>No hay logs disponibles</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const actionInfo = getActionInfo(log.action);
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-800">
                                                    {new Date(log.timestamp).toLocaleDateString('es-MX', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(log.timestamp).toLocaleTimeString('es-MX')}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}>
                                                    {actionInfo.icon} {actionInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-800">{log.adminEmail || 'Admin'}</p>
                                                <p className="text-xs text-slate-400">{log.adminId?.slice(0, 12)}...</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 max-w-xs truncate">
                                                    {log.contentType && `${log.contentType}: `}
                                                    {log.contentId || log.userId || log.details || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-slate-400 font-mono">{log.ip || '-'}</p>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* Load More */}
                    {hasMore && logs.length > 0 && (
                        <div className="p-4 border-t border-slate-100 text-center">
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={loading}
                                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                            >
                                {loading ? 'Cargando...' : 'Cargar más'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-slate-100 rounded-xl flex items-start gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                        <p className="font-medium text-slate-800">Registro de Seguridad</p>
                        <p className="text-sm text-slate-600">
                            Todas las acciones administrativas son registradas automáticamente para auditoría y seguridad.
                            Los logs se retienen por 90 días.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
