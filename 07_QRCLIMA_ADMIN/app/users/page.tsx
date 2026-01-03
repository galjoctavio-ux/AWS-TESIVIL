'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';

interface User {
    id: string;
    alias?: string;
    displayName?: string;
    email?: string;
    rank?: string;
    tokenBalance?: number;
    servicesCount?: number;
    is_premium?: boolean;
    is_banned?: boolean;
    eligible_for_directory?: boolean;
    city?: string;
    photoURL?: string;
    createdAt?: string;
}

export default function UsersPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [tokensToGift, setTokensToGift] = useState('');
    const [filter, setFilter] = useState<'all' | 'pro' | 'banned'>('all');
    const [actionLoading, setActionLoading] = useState(false);
    const { logout } = useAuth();

    // Notification modal state
    const [notificationModalOpen, setNotificationModalOpen] = useState(false);
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationBody, setNotificationBody] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (updates: Partial<User>) => {
        if (!selectedUser) return;

        try {
            setActionLoading(true);
            const response = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    updates,
                }),
            });

            if (response.ok) {
                // Update local state
                setUsers(users.map(u =>
                    u.id === selectedUser.id ? { ...u, ...updates } : u
                ));
                setSelectedUser({ ...selectedUser, ...updates });
            }
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleGiftTokens = async () => {
        if (!selectedUser || !tokensToGift) return;

        const amount = parseInt(tokensToGift);
        if (isNaN(amount) || amount <= 0) return;

        try {
            setActionLoading(true);
            const response = await fetch('/api/users/gift-tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    amount,
                }),
            });

            if (response.ok) {
                const newBalance = (selectedUser.tokenBalance || 0) + amount;
                setUsers(users.map(u =>
                    u.id === selectedUser.id ? { ...u, tokenBalance: newBalance } : u
                ));
                setSelectedUser({ ...selectedUser, tokenBalance: newBalance });
                setTokensToGift('');
                alert(`Se han enviado ${amount} tokens a ${selectedUser.alias || 'usuario'}`);
            }
        } catch (error) {
            console.error('Error gifting tokens:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendNotification = async () => {
        if (!selectedUser || !notificationTitle.trim() || !notificationBody.trim()) return;

        try {
            setActionLoading(true);
            const response = await fetch('/api/users/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    title: notificationTitle.trim(),
                    body: notificationBody.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✅ Notificación enviada a ${selectedUser.alias || 'usuario'}`);
                setNotificationModalOpen(false);
                setNotificationTitle('');
                setNotificationBody('');
            } else {
                alert(`❌ Error: ${data.error || 'No se pudo enviar la notificación'}`);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('❌ Error al enviar la notificación');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        // Apply search filter
        const matchesSearch = !searchQuery ||
            (u.alias?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()));

        // Apply type filter
        const matchesFilter = filter === 'all' ||
            (filter === 'pro' && u.is_premium) ||
            (filter === 'banned' && u.is_banned);

        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <div className="min-h-screen bg-slate-50">
                <Sidebar onLogout={logout} />

                {/* Main Content */}
                <main className="lg:ml-64 p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800">Gestión de Usuarios</h2>
                        <p className="text-slate-500 mt-1">Buscar, editar y administrar técnicos</p>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por alias o email..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                            </div>
                            <select
                                className="border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                            >
                                <option value="all">Todos</option>
                                <option value="pro">PRO</option>
                                <option value="banned">Baneados</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Users Table */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-500">Cargando usuarios...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Usuario</th>
                                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Tokens</th>
                                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                                                        No se encontraron usuarios
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr
                                                        key={user.id}
                                                        className={`hover:bg-slate-50 cursor-pointer transition ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                                                        onClick={() => setSelectedUser(user)}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {/* Profile Photo */}
                                                                {user.photoURL ? (
                                                                    <img
                                                                        src={user.photoURL}
                                                                        alt={user.alias || 'User'}
                                                                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                                        {(user.alias || user.displayName || 'U').charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-slate-800">{user.alias || user.displayName || 'Sin nombre'}</p>
                                                                    <p className="text-sm text-slate-500">{user.email || 'Sin email'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-800">🪙 {user.tokenBalance || 0}</td>
                                                        <td className="px-6 py-4">
                                                            {user.is_banned ? (
                                                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Baneado</span>
                                                            ) : user.is_premium ? (
                                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">PRO</span>
                                                            ) : (
                                                                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">Free</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* User Detail Panel */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            {selectedUser ? (
                                <>
                                    <h3 className="font-bold text-lg text-slate-800 mb-4">Detalle de Usuario</h3>

                                    <div className="space-y-4">
                                        <div className="text-center pb-4 border-b border-slate-100">
                                            {/* Large Profile Photo */}
                                            {selectedUser.photoURL ? (
                                                <img
                                                    src={selectedUser.photoURL}
                                                    alt={selectedUser.alias || 'User'}
                                                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-blue-100"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-blue-600 font-bold">
                                                    {(selectedUser.alias || selectedUser.displayName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <p className="font-bold text-lg">{selectedUser.alias || selectedUser.displayName || 'Usuario'}</p>
                                            <p className="text-sm text-slate-500">{selectedUser.email || 'Sin email'}</p>
                                            {selectedUser.city && (
                                                <p className="text-xs text-slate-400 mt-1">📍 {selectedUser.city}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xl font-bold text-slate-800">🪙 {selectedUser.tokenBalance || 0}</p>
                                                <p className="text-xs text-slate-500">Tokens</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xl font-bold text-slate-800">{selectedUser.servicesCount || 0}</p>
                                                <p className="text-xs text-slate-500">Servicios</p>
                                            </div>
                                        </div>

                                        {/* Flags */}
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Usuario PRO</span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUser.is_premium || false}
                                                    className="w-5 h-5 rounded"
                                                    onChange={(e) => handleUpdateUser({ is_premium: e.target.checked })}
                                                    disabled={actionLoading}
                                                />
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Elegible Directorio</span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUser.eligible_for_directory || false}
                                                    className="w-5 h-5 rounded"
                                                    onChange={(e) => handleUpdateUser({ eligible_for_directory: e.target.checked })}
                                                    disabled={actionLoading}
                                                />
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span className="text-sm text-red-600">Baneado</span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUser.is_banned || false}
                                                    className="w-5 h-5 rounded"
                                                    onChange={(e) => handleUpdateUser({ is_banned: e.target.checked })}
                                                    disabled={actionLoading}
                                                />
                                            </label>
                                        </div>

                                        {/* Gift Tokens */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <p className="text-sm font-medium text-slate-600 mb-2">Regalar Tokens</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Cantidad"
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                    value={tokensToGift}
                                                    onChange={(e) => setTokensToGift(e.target.value)}
                                                />
                                                <button
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                                                    onClick={handleGiftTokens}
                                                    disabled={actionLoading || !tokensToGift}
                                                >
                                                    Enviar
                                                </button>
                                            </div>
                                        </div>

                                        {/* User ID for debugging */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <p className="text-xs text-slate-400">ID: {selectedUser.id}</p>
                                        </div>

                                        {/* Send Notification */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <button
                                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                                onClick={() => setNotificationModalOpen(true)}
                                                disabled={actionLoading}
                                            >
                                                🔔 Enviar Notificación
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <span className="text-4xl block mb-3">👈</span>
                                    <p>Selecciona un usuario de la lista</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Notification Modal */}
            {notificationModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            🔔 Enviar Notificación
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Usuario: <strong>{selectedUser?.alias || selectedUser?.displayName || 'Sin nombre'}</strong>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Título</label>
                                <input
                                    type="text"
                                    placeholder="Ej: ¡Nueva actualización!"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Mensaje</label>
                                <textarea
                                    placeholder="Escribe el mensaje de la notificación..."
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                                    rows={3}
                                    value={notificationBody}
                                    onChange={(e) => setNotificationBody(e.target.value)}
                                    maxLength={200}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200"
                                onClick={() => {
                                    setNotificationModalOpen(false);
                                    setNotificationTitle('');
                                    setNotificationBody('');
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                                onClick={handleSendNotification}
                                disabled={actionLoading || !notificationTitle.trim() || !notificationBody.trim()}
                            >
                                {actionLoading ? 'Enviando...' : 'Enviar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

