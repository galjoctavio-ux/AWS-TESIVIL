'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';

// Token rule types from the app
interface TokenRule {
    amount: number;
    dailyLimit: number | null;
    description: string;
}

interface TokenRules {
    [key: string]: TokenRule;
}

interface Config {
    tokenRules: TokenRules;
    btuFactors: {
        [key: string]: number;
    };
    marketPrices: {
        [key: string]: number;
    };
    storeConfig: {
        [key: string]: boolean;
    };
}

// Default token rules (must match app's DEFAULT_EARN_RULES)
const defaultTokenRules: TokenRules = {
    service_registered: { amount: 10, dailyLimit: 6, description: 'Registro de Servicio' },
    sos_thread_created: { amount: 20, dailyLimit: 1, description: 'Hilo SOS Creado' },
    sos_solution_accepted: { amount: 50, dailyLimit: null, description: 'Solución Aceptada' },
    profile_completed: { amount: 100, dailyLimit: 1, description: 'Perfil Completado' },
    qr_linked: { amount: 15, dailyLimit: 10, description: 'QR Vinculado' },
    training_completed: { amount: 5, dailyLimit: null, description: 'Cápsula Completada' },
    training_quiz_passed: { amount: 0, dailyLimit: null, description: 'Quiz Aprobado (variable)' },
    training_comment_approved: { amount: 2, dailyLimit: 10, description: 'Comentario Aprobado' },
    training_reaction_maestro: { amount: 5, dailyLimit: 5, description: 'Reacción Maestro Recibida' },
    token_purchase: { amount: 50, dailyLimit: null, description: 'Compra de Tokens' },
};

const tokenRuleIcons: { [key: string]: string } = {
    service_registered: '🔧',
    sos_thread_created: '🆘',
    sos_solution_accepted: '✓',
    profile_completed: '👤',
    qr_linked: '📱',
    training_completed: '📚',
    training_quiz_passed: '🎓',
    training_comment_approved: '💬',
    training_reaction_maestro: '⭐',
    token_purchase: '💳',
};

const initialConfig: Config = {
    tokenRules: defaultTokenRules,
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
    const [config, setConfig] = useState<Config>(initialConfig);
    const [activeTab, setActiveTab] = useState<'tokens' | 'btu' | 'prices' | 'store'>('tokens');
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/settings');
            const data = await response.json();
            if (data.config) {
                // Merge with defaults to ensure all fields exist
                setConfig({
                    ...initialConfig,
                    ...data.config,
                    tokenRules: {
                        ...initialConfig.tokenRules,
                        ...data.config.tokenRules,
                    },
                });
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config }),
            });

            if (response.ok) {
                setHasChanges(false);
                alert('✅ Configuración guardada correctamente');
            } else {
                alert('❌ Error al guardar configuración');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            alert('❌ Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    const updateTokenRule = (key: string, field: 'amount' | 'dailyLimit', value: number | null) => {
        setConfig(prev => ({
            ...prev,
            tokenRules: {
                ...prev.tokenRules,
                [key]: { ...prev.tokenRules[key], [field]: value }
            }
        }));
        setHasChanges(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar onLogout={logout} />

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
                            disabled={saving}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: 'tokens', label: '🪙 Reglas Tokens' },
                        { key: 'btu', label: '🌡️ Factores BTU' },
                        { key: 'prices', label: '💲 Precios Mercado' },
                        { key: 'store', label: '🏪 Tienda' },
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

                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500">Cargando configuración...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        {/* Token Rules Tab */}
                        {activeTab === 'tokens' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">Reglas de Emisión de Tokens</h3>
                                        <p className="text-slate-500 text-sm">Define cuántos tokens gana el usuario por cada acción.</p>
                                    </div>
                                    <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded">
                                        La app recarga reglas cada 5 min
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {Object.entries(config.tokenRules).map(([key, rule]) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{tokenRuleIcons[key] || '🪙'}</span>
                                                <div>
                                                    <p className="font-medium text-slate-800">{rule.description}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{key}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {/* Daily Limit */}
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 mb-1">Límite Diario</p>
                                                    <input
                                                        type="number"
                                                        className="w-16 px-2 py-1 border border-slate-200 rounded text-center text-sm"
                                                        value={rule.dailyLimit === null ? '' : rule.dailyLimit}
                                                        placeholder="∞"
                                                        onChange={(e) => {
                                                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                                                            updateTokenRule(key, 'dailyLimit', val);
                                                        }}
                                                    />
                                                </div>
                                                {/* Amount */}
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 mb-1">Tokens</p>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-amber-500">🪙</span>
                                                        <input
                                                            type="number"
                                                            className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-bold"
                                                            value={rule.amount}
                                                            onChange={(e) => updateTokenRule(key, 'amount', parseInt(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Token Rules Info */}
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                    <span className="text-xl">ℹ️</span>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">Cómo funciona</p>
                                        <p>Los cambios se guardan en Firebase Remote Config. La app recarga las reglas cada 5 minutos o cuando el usuario reinicia.</p>
                                    </div>
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
                )}

                {/* Warning */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-medium text-yellow-800">Los cambios son en tiempo real</p>
                        <p className="text-sm text-yellow-700">Las modificaciones se aplicarán a todos los usuarios de la app tras su próxima sincronización (máx 5 min).</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
