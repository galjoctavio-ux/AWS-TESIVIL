'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data for orders
const mockOrders = [
    { id: 'ORD-001', userId: '1', userName: 'FrioTec2024', product: 'Pack 50 QRs', amount: 399, status: 'paid', date: '2024-12-16', address: 'Calle Reforma 123, CDMX' },
    { id: 'ORD-002', userId: '2', userName: 'ACMaster', product: 'Pack 100 QRs', amount: 699, status: 'processing', date: '2024-12-15', address: 'Av. Insurgentes 456, Guadalajara' },
    { id: 'ORD-003', userId: '3', userName: 'TecnicoJuan', product: 'Pack 20 QRs', amount: 199, status: 'shipped', date: '2024-12-14', address: 'Col. Centro, Monterrey', trackingNumber: 'DHL123456789' },
    { id: 'ORD-004', userId: '4', userName: 'ClimaExpert', product: 'Pack 50 QRs', amount: 399, status: 'delivered', date: '2024-12-10', address: 'Zona Industrial, Puebla', trackingNumber: 'EST987654321' },
];

const statusOptions = [
    { value: 'paid', label: 'Pagado', color: 'bg-green-100 text-green-700' },
    { value: 'processing', label: 'Preparando', color: 'bg-blue-100 text-blue-700' },
    { value: 'shipped', label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
    { value: 'delivered', label: 'Entregado', color: 'bg-slate-100 text-slate-700' },
];

const carriers = ['DHL', 'Estafeta', 'FedEx', 'Correos de México', 'Paquetexpress'];

export default function OrdersPage() {
    const [orders, setOrders] = useState(mockOrders);
    const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [selectedCarrier, setSelectedCarrier] = useState(carriers[0]);
    const [filter, setFilter] = useState('all');

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const handleMarkShipped = () => {
        if (!selectedOrder || !trackingNumber) return;

        setOrders(orders.map(o =>
            o.id === selectedOrder.id
                ? { ...o, status: 'shipped', trackingNumber: trackingNumber }
                : o
        ));
        setSelectedOrder(null);
        setTrackingNumber('');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        ❄️ <span>Mr. Frío Admin</span>
                    </h1>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>📊</span> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/users" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>👥</span> Usuarios
                            </Link>
                        </li>
                        <li>
                            <Link href="/orders" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-700 text-white">
                                <span>📦</span> Pedidos
                            </Link>
                        </li>
                        <li>
                            <Link href="/moderation" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>🛡️</span> Moderación
                            </Link>
                        </li>
                        <li>
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
                                <span>⚙️</span> Configuración
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

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
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Lista de Pedidos</h3>
                            <button
                                onClick={() => setFilter('all')}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Ver todos
                            </button>
                        </div>
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
                                            <p className="font-bold text-slate-800">{order.id}</p>
                                            <p className="text-sm text-slate-500">{order.userName} • {order.product}</p>
                                            <p className="text-xs text-slate-400 mt-1">{order.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">${order.amount}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusOptions.find(s => s.value === order.status)?.color
                                                }`}>
                                                {statusOptions.find(s => s.value === order.status)?.label}
                                            </span>
                                        </div>
                                    </div>
                                    {order.trackingNumber && (
                                        <p className="text-xs text-purple-600 mt-2">📦 {order.trackingNumber}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Detail/Ship Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        {selectedOrder ? (
                            <>
                                <h3 className="font-bold text-lg text-slate-800 mb-4">Detalle del Pedido</h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="font-bold text-slate-800">{selectedOrder.id}</p>
                                        <p className="text-sm text-slate-500">{selectedOrder.date}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Cliente</p>
                                        <p className="font-medium text-slate-800">{selectedOrder.userName}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Producto</p>
                                        <p className="font-medium text-slate-800">{selectedOrder.product}</p>
                                        <p className="text-lg font-bold text-green-600">${selectedOrder.amount} MXN</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Dirección de Envío</p>
                                        <p className="text-slate-800">{selectedOrder.address}</p>
                                    </div>

                                    {selectedOrder.trackingNumber ? (
                                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                            <p className="text-xs text-purple-500 uppercase mb-1">Número de Guía</p>
                                            <p className="font-bold text-purple-700">{selectedOrder.trackingNumber}</p>
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

                                            <input
                                                type="text"
                                                placeholder="Número de guía"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                            />

                                            <button
                                                onClick={handleMarkShipped}
                                                disabled={!trackingNumber}
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
