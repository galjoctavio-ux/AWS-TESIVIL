'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data for demonstration
const mockStats = {
    dau: 127,
    mau: 892,
    totalRevenue: 15750,
    pendingOrders: 8,
    tokenFloat: 45230,
    proSubscribers: 34,
    reportsToReview: 3,
    servicesThisWeek: 423,
};

const mockRecentOrders = [
    { id: 'ORD-001', user: 'FrioTec2024', product: 'Pack 50 QRs', amount: 399, status: 'paid', date: '2024-12-16' },
    { id: 'ORD-002', user: 'ACMaster', product: 'Pack 100 QRs', amount: 699, status: 'processing', date: '2024-12-15' },
    { id: 'ORD-003', user: 'TecnicoJuan', product: 'Pack 20 QRs', amount: 199, status: 'shipped', date: '2024-12-14' },
];

const mockFlaggedContent = [
    { id: 'REP-001', type: 'comment', author: 'usuario123', content: 'Texto sospechoso...', toxicityScore: 0.78 },
    { id: 'REP-002', type: 'thread', author: 'nuevo2024', content: 'Publicación spam...', toxicityScore: 0.65 },
];

export default function AdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform transition-transform lg:translate-x-0">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        ❄️ <span>Mr. Frío Admin</span>
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
                                {mockStats.pendingOrders > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{mockStats.pendingOrders}</span>
                                )}
                            </Link>
                        </li>
                        <li>
                            <Link href="/moderation" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>🛡️</span> Moderación
                                {mockStats.reportsToReview > 0 && (
                                    <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{mockStats.reportsToReview}</span>
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
                    <p className="text-slate-500 mt-1">Resumen de actividad y métricas clave</p>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* DAU */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">👤</span>
                            <span className="text-green-500 text-sm font-medium">+12%</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{mockStats.dau}</p>
                        <p className="text-slate-500 text-sm">Usuarios Hoy (DAU)</p>
                    </div>

                    {/* Revenue */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">💰</span>
                            <span className="text-green-500 text-sm font-medium">+8%</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">${mockStats.totalRevenue.toLocaleString()}</p>
                        <p className="text-slate-500 text-sm">Ventas Este Mes (MXN)</p>
                    </div>

                    {/* Token Float */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">🪙</span>
                            <span className="text-yellow-500 text-sm font-medium">Estable</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{mockStats.tokenFloat.toLocaleString()}</p>
                        <p className="text-slate-500 text-sm">Tokens en Circulación</p>
                    </div>

                    {/* PRO Subscribers */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">⭐</span>
                            <span className="text-green-500 text-sm font-medium">+5</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{mockStats.proSubscribers}</p>
                        <p className="text-slate-500 text-sm">Suscriptores PRO</p>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Pedidos Recientes</h3>
                            <Link href="/orders" className="text-blue-600 text-sm hover:underline">Ver todos →</Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {mockRecentOrders.map((order) => (
                                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                                    <div>
                                        <p className="font-medium text-slate-800">{order.id}</p>
                                        <p className="text-sm text-slate-500">{order.user} • {order.product}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800">${order.amount}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-purple-100 text-purple-700'
                                            }`}>
                                            {order.status === 'paid' ? 'Pagado' : order.status === 'processing' ? 'Preparando' : 'Enviado'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Moderation Queue */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Cola de Moderación</h3>
                            <Link href="/moderation" className="text-blue-600 text-sm hover:underline">Ver todos →</Link>
                        </div>
                        {mockFlaggedContent.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {mockFlaggedContent.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'comment' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {item.type === 'comment' ? 'Comentario' : 'Hilo'}
                                                </span>
                                                <span className="text-slate-500 text-sm ml-2">@{item.author}</span>
                                            </div>
                                            <span className={`text-xs font-medium ${item.toxicityScore > 0.7 ? 'text-red-600' : 'text-yellow-600'
                                                }`}>
                                                🚨 {Math.round(item.toxicityScore * 100)}%
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm truncate">{item.content}</p>
                                        <div className="mt-3 flex gap-2">
                                            <button className="text-xs px-3 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                Ignorar
                                            </button>
                                            <button className="text-xs px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200">
                                                Borrar
                                            </button>
                                            <button className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">
                                                Banear
                                            </button>
                                        </div>
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

                {/* Activity Summary */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Actividad Semanal</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{mockStats.servicesThisWeek}</p>
                            <p className="text-slate-500 text-sm">Servicios</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">89</p>
                            <p className="text-slate-500 text-sm">QRs Vinculados</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">34</p>
                            <p className="text-slate-500 text-sm">Hilos SOS</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">156</p>
                            <p className="text-slate-500 text-sm">Cotizaciones</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
