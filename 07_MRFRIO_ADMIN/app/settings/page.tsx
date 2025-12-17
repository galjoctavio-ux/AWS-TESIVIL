'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock configuration data
const initialConfig = {
    tokenRules: {
        service_register: { amount: 10, dailyLimit: 6 },
        sos_thread: { amount: 20, dailyLimit: 1 },
        sos_solution: { amount: 50, dailyLimit: null },
        profile_complete: { amount: 100, dailyLimit: 1 },
        qr_link: { amount: 15, dailyLimit: 10 },
    },
    btuFactors: {
        templado: 500,
        calido: 600,
        muycalido: 700,
    },
    marketPrices: {
        gas_r410a: 850,
        gas_r22: 1200,
        cobre_metro: 180,
        capacitor_35uf: 250,
    },
    storeConfig: {
        qr_pack_20_active: true,
        qr_pack_50_active: true,
        qr_pack_100_active: true,
        pro_subscription_active: true,
    }
};

export default function SettingsPage() {
    const [config, setConfig] = useState(initialConfig);
    const [activeTab, setActiveTab] = useState<'tokens' | 'btu' | 'prices' | 'store'>('tokens');
    const [hasChanges, setHasChanges] = useState(false);

    const handleSave = () => {
        // TODO: Guardar en Firebase Remote Config
        console.log('Saving config:', config);
        setHasChanges(false);
        alert('Configuración guardada (mock)');
    };

    const updateTokenRule = (key: string, field: 'amount' | 'dailyLimit', value: number | null) => {
        setConfig(prev => ({
            ...prev,
            tokenRules: {
                ...prev.tokenRules,
                [key]: { ...prev.tokenRules[key as keyof typeof prev.tokenRules], [field]: value }
            }
        }));
        setHasChanges(true);
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
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-700 text-white">
                                <span>⚙️</span> Configuración
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Configuración Remota</h2>
                        <p className="text-slate-500 mt-1">Ajustar reglas de negocio en tiempo real</p>
                    </div>
                    {hasChanges && (
                        <button
                            onClick={handleSave}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                        >
                            💾 Guardar Cambios
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: 'tokens', label: '🪙 Reglas Tokens', icon: '🪙' },
                        { key: 'btu', label: '🌡️ Factores BTU', icon: '🌡️' },
                        { key: 'prices', label: '💲 Precios Mercado', icon: '💲' },
                        { key: 'store', label: '🏪 Tienda', icon: '🏪' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === tab.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    {/* Token Rules Tab */}
                    {activeTab === 'tokens' && (
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Reglas de Emisión de Tokens</h3>
                            <p className="text-slate-500 text-sm mb-6">Define cuántos tokens gana el usuario por cada acción.</p>

                            <div className="space-y-4">
                                {Object.entries(config.tokenRules).map(([key, rule]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {key === 'service_register' ? 'Registrar Servicio' :
                                                    key === 'sos_thread' ? 'Crear Hilo SOS' :
                                                        key === 'sos_solution' ? 'Respuesta Validada' :
                                                            key === 'profile_complete' ? 'Perfil Completo' :
                                                                key === 'qr_link' ? 'Vincular QR' : key}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Límite diario: {rule.dailyLimit === null ? 'Sin límite' : rule.dailyLimit}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400">🪙</span>
                                            <input
                                                type="number"
                                                className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center font-bold"
                                                value={rule.amount}
                                                onChange={(e) => updateTokenRule(key, 'amount', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BTU Factors Tab */}
                    {activeTab === 'btu' && (
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Factores de Cálculo BTU</h3>
                            <p className="text-slate-500 text-sm mb-6">BTU por m² según zona climática.</p>

                            <div className="space-y-4">
                                {Object.entries(config.btuFactors).map(([zone, value]) => (
                                    <div key={zone} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <p className="font-medium text-slate-800 capitalize">
                                            {zone === 'templado' ? '🌤️ Templado' :
                                                zone === 'calido' ? '☀️ Cálido' : '🔥 Muy Cálido'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-center font-bold"
                                                value={value}
                                                onChange={(e) => {
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        btuFactors: { ...prev.btuFactors, [zone]: parseInt(e.target.value) }
                                                    }));
                                                    setHasChanges(true);
                                                }}
                                            />
                                            <span className="text-slate-500 text-sm">BTU/m²</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Market Prices Tab */}
                    {activeTab === 'prices' && (
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Precios de Mercado</h3>
                            <p className="text-slate-500 text-sm mb-6">Referencia para cotizador. Actualizar semanalmente.</p>

                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(config.marketPrices).map(([item, price]) => (
                                    <div key={item} className="p-4 bg-slate-50 rounded-lg">
                                        <p className="font-medium text-slate-800 mb-2">
                                            {item === 'gas_r410a' ? '❄️ Gas R410-A (Kg)' :
                                                item === 'gas_r22' ? '❄️ Gas R22 (Kg)' :
                                                    item === 'cobre_metro' ? '🔶 Cobre (Metro)' : '⚡ Capacitor 35µF'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">$</span>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                                                value={price}
                                                onChange={(e) => {
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        marketPrices: { ...prev.marketPrices, [item]: parseInt(e.target.value) }
                                                    }));
                                                    setHasChanges(true);
                                                }}
                                            />
                                            <span className="text-slate-500">MXN</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Store Config Tab */}
                    {activeTab === 'store' && (
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Configuración de Tienda</h3>
                            <p className="text-slate-500 text-sm mb-6">Activar o desactivar productos.</p>

                            <div className="space-y-4">
                                {Object.entries(config.storeConfig).map(([key, isActive]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <p className="font-medium text-slate-800">
                                            {key === 'qr_pack_20_active' ? '📦 Pack 20 QRs' :
                                                key === 'qr_pack_50_active' ? '📦 Pack 50 QRs' :
                                                    key === 'qr_pack_100_active' ? '📦 Pack 100 QRs' : '⭐ Suscripción PRO'}
                                        </p>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={(e) => {
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        storeConfig: { ...prev.storeConfig, [key]: e.target.checked }
                                                    }));
                                                    setHasChanges(true);
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-medium text-yellow-800">Los cambios son en tiempo real</p>
                        <p className="text-sm text-yellow-700">Las modificaciones se aplicarán inmediatamente a todos los usuarios de la app.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
