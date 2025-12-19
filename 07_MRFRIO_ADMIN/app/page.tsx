'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types for API response
interface DashboardStats {
    totalUsers: number;
    proUsers: number;
    servicesThisMonth: number;
    tokenFloat: number;
    pendingOrders: number;
}

interface Order {
    id: string;
    userId?: string;
    product?: string;
    amount?: number;
    status: string;
    createdAt?: any;
}

interface FlaggedItem {
    id: string;
    type: 'thread' | 'comment';
    authorId?: string;
    content?: string;
    toxicityScore?: number;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        proUsers: 0,
        servicesThisMonth: 0,
        tokenFloat: 0,
        pendingOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [flaggedContent, setFlaggedContent] = useState<FlaggedItem[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/stats');

                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const data = await response.json();

                if (data.error) {
                    setError(data.message || 'Error loading data');
                } else {
                    setStats(data.stats);
                    setRecentOrders(data.recentOrders || []);
                    setFlaggedContent(data.flaggedContent || []);
                }
            } catch (err) {
                console.error('Error fetching dashboard:', err);
                setError('Error al conectar con Firebase');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
                    <span className="text-4xl mb-4 block">⚠️</span>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Error de Conexión</h1>
                    <p className="text-slate-500 mb-4">{error}</p>
                    <p className="text-sm text-slate-400">Verifica que el archivo .env.local esté configurado correctamente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform transition-transform lg:translate-x-0">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        ❄️ <span>QRclima Admin</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Panel de Administración</p>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-700 text-white">
                                <span>📊</span> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/users" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>👥</span> Usuarios
                            </Link>
                        </li>
                        <li>
                            <Link href="/orders" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>📦</span> Pedidos
                                {stats.pendingOrders > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingOrders}</span>
                                )}
                            </Link>
                        </li>
                        <li>
                            <Link href="/moderation" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>🛡️</span> Moderación
                                {flaggedContent.length > 0 && (
                                    <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{flaggedContent.length}</span>
                                )}
                            </Link>
                        </li>
                        <li>
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>⚙️</span> Configuración
                            </Link>
                        </li>
                    </ul>

                    <div className="mt-8 pt-8 border-t border-slate-700">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Herramientas</p>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/tokens" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                    <span>🪙</span> Economía Tokens
                                </Link>
                            </li>
                            <li>
                                <Link href="/logs" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                    <span>📋</span> Logs Auditoría
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
                    <p className="text-slate-500 mt-1">Datos en tiempo real de Firebase 🔥</p>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Users */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">👤</span>
                            <span className="text-green-500 text-sm font-medium">Firebase ✓</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{stats.totalUsers}</p>
                        <p className="text-slate-500 text-sm">Usuarios Totales</p>
                    </div>

                    {/* PRO Subscribers */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">⭐</span>
                            <span className="text-green-500 text-sm font-medium">Firebase ✓</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{stats.proUsers}</p>
                        <p className="text-slate-500 text-sm">Suscriptores PRO</p>
                    </div>

                    {/* Token Float */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">🪙</span>
                            <span className="text-green-500 text-sm font-medium">Firebase ✓</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{stats.tokenFloat.toLocaleString()}</p>
                        <p className="text-slate-500 text-sm">Tokens en Circulación</p>
                    </div>

                    {/* Services This Month */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">🔧</span>
                            <span className="text-green-500 text-sm font-medium">Firebase ✓</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{stats.servicesThisMonth}</p>
                        <p className="text-slate-500 text-sm">Servicios Este Mes</p>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Pedidos Pendientes</h3>
                            <Link href="/orders" className="text-blue-600 text-sm hover:underline">Ver todos →</Link>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                                        <div>
                                            <p className="font-medium text-slate-800">{order.id.slice(0, 8)}...</p>
                                            <p className="text-sm text-slate-500">{order.product || 'Producto'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">${order.amount || 0}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-purple-100 text-purple-700'
                                                }`}>
                                                {order.status === 'paid' ? 'Pagado' : order.status === 'processing' ? 'Preparando' : order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400">
                                <span className="text-4xl block mb-2">📦</span>
                                <p>No hay pedidos pendientes</p>
                            </div>
                        )}
                    </div>

                    {/* Moderation Queue */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Cola de Moderación</h3>
                            <Link href="/moderation" className="text-blue-600 text-sm hover:underline">Ver todos →</Link>
                        </div>
                        {flaggedContent.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {flaggedContent.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'comment' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {item.type === 'comment' ? 'Comentario' : 'Hilo'}
                                                </span>
                                                <span className="text-slate-500 text-sm ml-2">@{item.authorId?.slice(0, 8) || 'usuario'}</span>
                                            </div>
                                            {item.toxicityScore && (
                                                <span className={`text-xs font-medium ${item.toxicityScore > 0.7 ? 'text-red-600' : 'text-yellow-600'
                                                    }`}>
                                                    🚨 {Math.round(item.toxicityScore * 100)}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 text-sm truncate">{item.content || 'Contenido flaggeado'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400">
                                <span className="text-4xl block mb-2">✅</span>
                                <p>No hay contenido pendiente de revisar</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Connection Status */}
                <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
                    <span className="text-2xl">🔥</span>
                    <div>
                        <p className="font-bold text-green-800">Firebase Conectado</p>
                        <p className="text-green-600 text-sm">Proyecto: mr-frio | Datos en tiempo real</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
