'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';

interface FlaggedItem {
    id: string;
    type: 'thread' | 'comment';
    authorId?: string;
    authorName?: string;
    content?: string;
    title?: string;
    toxicityScore?: number;
    createdAt?: string;
    threadId?: string;
}

export default function ModerationPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<FlaggedItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'thread' | 'comment'>('all');
    const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
        fetchFlaggedContent();
    }, []);

    const fetchFlaggedContent = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/moderation');
            const data = await response.json();
            setItems(data.items || []);
        } catch (error) {
            console.error('Error fetching flagged content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'dismiss' | 'delete' | 'ban') => {
        if (!selectedItem) return;

        try {
            setActionLoading(true);
            const response = await fetch('/api/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId: selectedItem.id,
                    contentType: selectedItem.type,
                    action,
                }),
            });

            if (response.ok) {
                setItems(items.filter(item => item.id !== selectedItem.id));
                setSelectedItem(null);
            }
        } catch (error) {
            console.error('Error performing moderation action:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.type === filter);

    const getToxicityColor = (score?: number) => {
        if (!score) return 'text-slate-400';
        if (score > 0.8) return 'text-red-600';
        if (score > 0.6) return 'text-orange-500';
        return 'text-yellow-500';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar
                flaggedContentCount={items.length}
                onLogout={logout}
            />

            <main className="lg:ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Moderación de Contenido</h2>
                    <p className="text-slate-500 mt-1">Revisar contenido flaggeado por IA</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`p-4 rounded-xl border-2 transition ${filter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white shadow-sm'
                            }`}
                    >
                        <p className="text-2xl font-bold text-slate-800">{items.length}</p>
                        <p className="text-sm text-slate-500">Total Pendientes</p>
                    </button>
                    <button
                        onClick={() => setFilter('thread')}
                        className={`p-4 rounded-xl border-2 transition ${filter === 'thread' ? 'border-purple-500 bg-purple-50' : 'border-transparent bg-white shadow-sm'
                            }`}
                    >
                        <p className="text-2xl font-bold text-slate-800">
                            {items.filter(i => i.type === 'thread').length}
                        </p>
                        <p className="text-sm text-slate-500">Hilos</p>
                    </button>
                    <button
                        onClick={() => setFilter('comment')}
                        className={`p-4 rounded-xl border-2 transition ${filter === 'comment' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white shadow-sm'
                            }`}
                    >
                        <p className="text-2xl font-bold text-slate-800">
                            {items.filter(i => i.type === 'comment').length}
                        </p>
                        <p className="text-sm text-slate-500">Comentarios</p>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Content List */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">Cola de Moderación</h3>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-500">Cargando contenido...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <span className="text-5xl block mb-4">✅</span>
                                <p className="text-lg">¡Todo limpio!</p>
                                <p className="text-sm">No hay contenido pendiente de moderar</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`p-4 hover:bg-slate-50 cursor-pointer transition ${selectedItem?.id === item.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'thread'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {item.type === 'thread' ? '📝 Hilo' : '💬 Comentario'}
                                                </span>
                                                <span className="text-slate-400 text-sm">
                                                    @{item.authorName || item.authorId?.slice(0, 8) || 'usuario'}
                                                </span>
                                            </div>
                                            {item.toxicityScore && (
                                                <span className={`text-sm font-bold ${getToxicityColor(item.toxicityScore)}`}>
                                                    🚨 {Math.round(item.toxicityScore * 100)}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-700 line-clamp-2">
                                            {item.title || item.content || 'Sin contenido'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        {selectedItem ? (
                            <>
                                <h3 className="font-bold text-lg text-slate-800 mb-4">Revisar Contenido</h3>

                                <div className="space-y-4">
                                    {/* Content Type Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedItem.type === 'thread'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {selectedItem.type === 'thread' ? '📝 Hilo SOS' : '💬 Comentario'}
                                        </span>
                                        {selectedItem.toxicityScore && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedItem.toxicityScore > 0.7
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                🚨 Toxicidad: {Math.round(selectedItem.toxicityScore * 100)}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Author */}
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Autor</p>
                                        <p className="font-medium text-slate-800">
                                            @{selectedItem.authorName || selectedItem.authorId?.slice(0, 12) || 'usuario'}
                                        </p>
                                    </div>

                                    {/* Content Preview */}
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Contenido</p>
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                                            {selectedItem.title && (
                                                <p className="font-bold mb-2">{selectedItem.title}</p>
                                            )}
                                            <p className="text-slate-700 whitespace-pre-wrap">
                                                {selectedItem.content || 'Sin contenido disponible'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 border-t border-slate-100 space-y-3">
                                        <button
                                            onClick={() => handleAction('dismiss')}
                                            disabled={actionLoading}
                                            className="w-full py-3 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            ✓ Ignorar (No es ofensivo)
                                        </button>
                                        <button
                                            onClick={() => handleAction('delete')}
                                            disabled={actionLoading}
                                            className="w-full py-3 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            🗑️ Eliminar Contenido
                                        </button>
                                        <button
                                            onClick={() => handleAction('ban')}
                                            disabled={actionLoading}
                                            className="w-full py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            🚫 Eliminar + Banear Usuario
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <span className="text-4xl block mb-3">👈</span>
                                <p>Selecciona un elemento de la lista para revisarlo</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                        <p className="font-medium text-blue-800">Sistema de Detección de IA</p>
                        <p className="text-sm text-blue-700">
                            El contenido aquí mostrado fue pre-filtrado automáticamente. El score de toxicidad indica
                            la probabilidad de que el contenido viole las normas de la comunidad.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
