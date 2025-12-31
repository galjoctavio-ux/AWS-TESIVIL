'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';

interface TokenStats {
    totalCirculating: number;
    emittedToday: number;
    averagePerUser: number;
    topUsers: Array<{
        id: string;
        alias: string;
        balance: number;
    }>;
    recentTransactions: Array<{
        id: string;
        type: 'earn' | 'spend';
        amount: number;
        reason: string;
        userId: string;
        userAlias?: string;
        timestamp: string;
    }>;
}

export default function TokensPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<TokenStats>({
        totalCirculating: 0,
        emittedToday: 0,
        averagePerUser: 0,
        topUsers: [],
        recentTransactions: [],
    });
    const { logout } = useAuth();

    useEffect(() => {
        fetchTokenStats();
    }, []);

    const fetchTokenStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tokens');
            const data = await response.json();
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching token stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('es-MX').format(num);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar onLogout={logout} />

            <main className="lg:ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Economía de Tokens</h2>
                    <p className="text-slate-500 mt-1">Monitoreo de circulación y distribución</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500">Cargando estadísticas...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl">🪙</span>
                                    <span className="text-amber-200 text-sm">Total</span>
                                </div>
                                <p className="text-4xl font-bold">{formatNumber(stats.totalCirculating)}</p>
                                <p className="text-amber-100 mt-1">Tokens en Circulación</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl">📈</span>
                                    <span className="text-green-200 text-sm">Hoy</span>
                                </div>
                                <p className="text-4xl font-bold">{formatNumber(stats.emittedToday)}</p>
                                <p className="text-green-100 mt-1">Tokens Emitidos Hoy</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl">📊</span>
                                    <span className="text-blue-200 text-sm">Promedio</span>
                                </div>
                                <p className="text-4xl font-bold">{formatNumber(Math.round(stats.averagePerUser))}</p>
                                <p className="text-blue-100 mt-1">Tokens por Usuario</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Users */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                                    <span className="text-xl">🏆</span>
                                    <h3 className="font-bold text-slate-800">Top 10 Usuarios</h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {stats.topUsers.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400">
                                            <span className="text-3xl block mb-2">📭</span>
                                            <p>No hay datos disponibles</p>
                                        </div>
                                    ) : (
                                        stats.topUsers.map((user, index) => (
                                            <div key={user.id} className="p-4 flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                                        index === 1 ? 'bg-slate-200 text-slate-600' :
                                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                                'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800">{user.alias || 'Usuario'}</p>
                                                    <p className="text-xs text-slate-400">{user.id.slice(0, 12)}...</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-amber-600">🪙 {formatNumber(user.balance)}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                                    <span className="text-xl">📋</span>
                                    <h3 className="font-bold text-slate-800">Transacciones Recientes</h3>
                                </div>
                                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                    {stats.recentTransactions.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400">
                                            <span className="text-3xl block mb-2">📭</span>
                                            <p>No hay transacciones recientes</p>
                                        </div>
                                    ) : (
                                        stats.recentTransactions.map((tx) => (
                                            <div key={tx.id} className="p-4 flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earn'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {tx.type === 'earn' ? '↑' : '↓'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800">{tx.reason}</p>
                                                    <p className="text-xs text-slate-400">
                                                        @{tx.userAlias || tx.userId?.slice(0, 8)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {new Date(tx.timestamp).toLocaleDateString('es-MX')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Token Rules Quick Reference */}
                        <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">📖</span>
                                <h3 className="font-bold">Reglas de Emisión Actuales</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[
                                    { action: 'Servicio', tokens: 10, icon: '🔧' },
                                    { action: 'Hilo SOS', tokens: 20, icon: '🆘' },
                                    { action: 'Respuesta Validada', tokens: 50, icon: '✓' },
                                    { action: 'Perfil Completo', tokens: 100, icon: '👤' },
                                    { action: 'Vincular QR', tokens: 15, icon: '📱' },
                                ].map((rule) => (
                                    <div key={rule.action} className="bg-white/10 rounded-lg p-3 text-center">
                                        <span className="text-2xl block mb-1">{rule.icon}</span>
                                        <p className="text-sm text-slate-300">{rule.action}</p>
                                        <p className="font-bold text-amber-400">+{rule.tokens}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
