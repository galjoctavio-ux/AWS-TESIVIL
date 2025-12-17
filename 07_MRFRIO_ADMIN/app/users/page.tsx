'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data for users
const mockUsers = [
    { id: '1', alias: 'FrioTec2024', email: 'friotec@email.com', rank: 'Pro', tokens: 1250, services: 89, isPro: true, isBanned: false },
    { id: '2', alias: 'ACMaster', email: 'acmaster@email.com', rank: 'Técnico', tokens: 450, services: 34, isPro: false, isBanned: false },
    { id: '3', alias: 'TecnicoJuan', email: 'juan@email.com', rank: 'Novato', tokens: 120, services: 12, isPro: false, isBanned: false },
    { id: '4', alias: 'ClimaExpert', email: 'clima@email.com', rank: 'Técnico', tokens: 780, services: 56, isPro: true, isBanned: false },
    { id: '5', alias: 'RefriPro', email: 'refri@email.com', rank: 'Novato', tokens: 50, services: 5, isPro: false, isBanned: true },
];

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
    const [tokensToGift, setTokensToGift] = useState('');

    const filteredUsers = mockUsers.filter(u =>
        u.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar (same as dashboard) */}
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
                            <Link href="/users" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-700 text-white">
                                <span>👥</span> Usuarios
                            </Link>
                        </li>
                        <li>
                            <Link href="/orders" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition">
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
                        <select className="border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option>Todos</option>
                            <option>PRO</option>
                            <option>Baneados</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Users Table */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Usuario</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Rango</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Tokens</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Servicios</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-slate-500">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-slate-50 cursor-pointer transition ${selectedUser?.id === user.id ? 'bg-blue-50' : ''}`}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-800">{user.alias}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2 py-1 rounded-full ${user.rank === 'Pro' ? 'bg-yellow-100 text-yellow-700' :
                                                        user.rank === 'Técnico' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {user.rank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">🪙 {user.tokens}</td>
                                            <td className="px-6 py-4 text-slate-600">{user.services}</td>
                                            <td className="px-6 py-4">
                                                {user.isBanned ? (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Baneado</span>
                                                ) : user.isPro ? (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">PRO</span>
                                                ) : (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">Free</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* User Detail Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        {selectedUser ? (
                            <>
                                <h3 className="font-bold text-lg text-slate-800 mb-4">Detalle de Usuario</h3>

                                <div className="space-y-4">
                                    <div className="text-center pb-4 border-b border-slate-100">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                                            {selectedUser.alias.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="font-bold text-lg">{selectedUser.alias}</p>
                                        <p className="text-sm text-slate-500">{selectedUser.email}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-xl font-bold text-slate-800">🪙 {selectedUser.tokens}</p>
                                            <p className="text-xs text-slate-500">Tokens</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-xl font-bold text-slate-800">{selectedUser.services}</p>
                                            <p className="text-xs text-slate-500">Servicios</p>
                                        </div>
                                    </div>

                                    {/* Flags */}
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Usuario PRO</span>
                                            <input type="checkbox" checked={selectedUser.isPro} className="w-5 h-5 rounded" onChange={() => { }} />
                                        </label>
                                        <label className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Elegible Directorio</span>
                                            <input type="checkbox" className="w-5 h-5 rounded" onChange={() => { }} />
                                        </label>
                                        <label className="flex items-center justify-between">
                                            <span className="text-sm text-red-600">Baneado</span>
                                            <input type="checkbox" checked={selectedUser.isBanned} className="w-5 h-5 rounded" onChange={() => { }} />
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
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                                                Enviar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 flex gap-2">
                                        <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200">
                                            Enviar Push
                                        </button>
                                        <button className="flex-1 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm hover:bg-orange-200">
                                            Resetear Pass
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
    );
}
