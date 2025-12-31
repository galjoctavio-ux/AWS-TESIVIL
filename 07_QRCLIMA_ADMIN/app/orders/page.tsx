'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';

interface Order {
    id: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    product?: string;
    amount?: number;
    amountTokens?: number;
    paymentMethod?: 'tokens' | 'stripe' | 'oxxo';
    status: string;
    date?: string;
    address?: string;
    trackingNumber?: string;
    trackingCarrier?: string;
}

const statusOptions = [
    { value: 'paid', label: 'Pagado', color: 'bg-green-100 text-green-700' },
    { value: 'processing', label: 'Preparando', color: 'bg-blue-100 text-blue-700' },
    { value: 'shipped', label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
    { value: 'delivered', label: 'Entregado', color: 'bg-slate-100 text-slate-700' },
];

const carriers = ['DHL', 'Estafeta', 'FedEx', 'Correos de México', 'Paquetexpress', 'Otro'];

export default function OrdersPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [selectedCarrier, setSelectedCarrier] = useState(carriers[0]);
    const [customCarrier, setCustomCarrier] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders');
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkShipped = async () => {
        if (!selectedOrder || !trackingNumber) return;

        const finalCarrier = getFinalCarrier();
        if (!finalCarrier) return;

        try {
            setActionLoading(true);
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedOrder.id,
                    trackingNumber,
                    trackingCarrier: finalCarrier,
                }),
            });

            if (response.ok) {
                setOrders(orders.map(o =>
                    o.id === selectedOrder.id
                        ? { ...o, status: 'shipped', trackingNumber, trackingCarrier: finalCarrier }
                        : o
                ));
                setSelectedOrder(null);
                setTrackingNumber('');
                setCustomCarrier('');
            }
        } catch (error) {
            console.error('Error marking order as shipped:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Filtrado por estado y búsqueda
    const filteredOrders = orders
        .filter(o => filter === 'all' ? true : o.status === filter)
        .filter(o => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                o.id.toLowerCase().includes(query) ||
                o.userName?.toLowerCase().includes(query) ||
                o.userEmail?.toLowerCase().includes(query) ||
                o.product?.toLowerCase().includes(query) ||
                o.trackingNumber?.toLowerCase().includes(query)
            );
        });

    // Obtener carrier final (personalizado si es Otro)
    const getFinalCarrier = () => {
        return selectedCarrier === 'Otro' ? customCarrier : selectedCarrier;
    };

    const pendingCount = orders.filter(o => o.status === 'paid' || o.status === 'processing').length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar
                pendingOrders={pendingCount}
                onLogout={logout}
            />

            {/* Main Content */}
            <main className="lg:ml-64 p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Gestión de Pedidos</h2>
                    <p className="text-slate-500 mt-1">Administrar envíos de etiquetas QR</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {statusOptions.map((status) => {
                        const count = orders.filter(o => o.status === status.value).length;
                        return (
                            <button
                                key={status.value}
                                onClick={() => setFilter(status.value)}
                                className={`p-4 rounded-xl border-2 transition ${filter === status.value ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white shadow-sm'
                                    }`}
                            >
                                <p className="text-2xl font-bold text-slate-800">{count}</p>
                                <p className="text-sm text-slate-500">{status.label}</p>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Orders List */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="p-4 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-slate-800">Lista de Pedidos</h3>
                                <button
                                    onClick={() => { setFilter('all'); setSearchQuery(''); }}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Ver todos
                                </button>
                            </div>
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por ID, cliente, email, producto o guía..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-500">Cargando pedidos...</p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <span className="text-4xl block mb-2">📦</span>
                                <p>No hay pedidos</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`p-4 hover:bg-slate-50 cursor-pointer transition ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-800">{order.id.slice(0, 12)}...</p>
                                                <p className="text-sm text-slate-500">{order.userName || 'Usuario'} • {order.product || 'Producto'}</p>
                                                <p className="text-xs text-slate-400 mt-1">{order.date || 'Sin fecha'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800">
                                                    {order.paymentMethod === 'tokens'
                                                        ? `🪙 ${order.amountTokens || 0}`
                                                        : `$${order.amount || 0} MXN`}
                                                </p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusOptions.find(s => s.value === order.status)?.color
                                                    }`}>
                                                    {statusOptions.find(s => s.value === order.status)?.label || order.status}
                                                </span>
                                            </div>
                                        </div>
                                        {order.trackingNumber && (
                                            <p className="text-xs text-purple-600 mt-2">📦 {order.trackingCarrier}: {order.trackingNumber}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Detail/Ship Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        {selectedOrder ? (
                            <>
                                <h3 className="font-bold text-lg text-slate-800 mb-4">Detalle del Pedido</h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="font-bold text-slate-800">{selectedOrder.id.slice(0, 16)}...</p>
                                        <p className="text-sm text-slate-500">{selectedOrder.date}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Cliente</p>
                                        <p className="font-medium text-slate-800">{selectedOrder.userName || 'Usuario'}</p>
                                        <p className="text-sm text-slate-500">{selectedOrder.userEmail || ''}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Producto</p>
                                        <p className="font-medium text-slate-800">{selectedOrder.product || 'Producto'}</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {selectedOrder.paymentMethod === 'tokens'
                                                ? `🪙 ${selectedOrder.amountTokens || 0} Tokens`
                                                : `$${selectedOrder.amount || 0} MXN`}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Dirección de Envío</p>
                                        <p className="text-slate-800">{selectedOrder.address || 'Sin dirección'}</p>
                                    </div>

                                    {selectedOrder.trackingNumber ? (
                                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                            <p className="text-xs text-purple-500 uppercase mb-1">Número de Guía</p>
                                            <p className="font-bold text-purple-700">{selectedOrder.trackingCarrier}: {selectedOrder.trackingNumber}</p>
                                        </div>
                                    ) : selectedOrder.status === 'paid' || selectedOrder.status === 'processing' ? (
                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                            <p className="font-medium text-slate-800">Marcar como Enviado</p>

                                            <select
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                value={selectedCarrier}
                                                onChange={(e) => setSelectedCarrier(e.target.value)}
                                            >
                                                {carriers.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>

                                            {/* Campo para carrier personalizado */}
                                            {selectedCarrier === 'Otro' && (
                                                <input
                                                    type="text"
                                                    placeholder="Nombre de la paquetería"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                    value={customCarrier}
                                                    onChange={(e) => setCustomCarrier(e.target.value)}
                                                />
                                            )}

                                            <input
                                                type="text"
                                                placeholder="Número de guía"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                            />

                                            <button
                                                onClick={handleMarkShipped}
                                                disabled={!trackingNumber || (selectedCarrier === 'Otro' && !customCarrier) || actionLoading}
                                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                📦 Marcar Enviado
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <span className="text-4xl block mb-3">📦</span>
                                <p>Selecciona un pedido para ver detalles</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
