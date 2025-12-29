"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Crown, Sparkles } from "lucide-react";

const features = {
    free: [
        { name: "Dashboard Inteligente", desc: "Centro de control con próximos servicios" },
        { name: "Registro de Servicios", desc: "Alta en 30 segundos con fotos y notas" },
        { name: "CRM de Clientes", desc: "Base de datos privada con historial" },
        { name: "Scanner QR", desc: "Escanea y registra equipos al instante" },
        { name: "Ecosistema QR (Bitácora Viva)", desc: "QR único por equipo con historial público" },
        { name: "Biblioteca de Errores Offline", desc: "67+ modelos sin necesidad de internet" },
        { name: "Calculadora BTU Básica", desc: "Estimación rápida de carga térmica" },
        { name: "Guía de Cables (NOM)", desc: "Voltaje + Tonelaje = Cable AWG correcto" },
        { name: "Tabla P-T", desc: "Presión-Temperatura para R410A, R32, R22" },
        { name: "Calendario Visual", desc: "Vista día/3 días/semana con colores" },
        { name: "Acciones Rápidas en Citas", desc: "Llamar, WhatsApp, Navegar con 1 tap" },
        { name: "Comunidad SOS", desc: "Foro técnico moderado por IA" },
        { name: "Capacitación con Quizzes", desc: "40 cursos y gana tokens" },
        { name: "Sistema de Tokens", desc: "Gana por usar, canjea por PRO" },
        { name: "Perfil Profesional", desc: "Tu tarjeta digital con estadísticas" },
        { name: "Firma Digital", desc: "Tu rúbrica en reportes y cotizaciones" },
    ],
    pro: [
        { name: "Tráfico en Tiempo Real", desc: "Google Directions API integrado" },
        { name: "Recordatorios Automáticos", desc: "Te avisa cuando toca mantenimiento" },
        { name: "Calculadora BTU Profesional", desc: "Análisis completo con PDF exportable" },
        { name: "Cotizador Inteligente", desc: "174+ insumos con precios de mercado" },
        { name: "Radar de Precios", desc: "Inteligencia de mercado en tiempo real" },
        { name: "Modo Diagnóstico Mirage", desc: "Guía paso a paso del modo TEST" },
        { name: "PDFs sin Marca de Agua", desc: "Tu logo, tus colores, profesional" },
        { name: "Insignia PRO en comentarios", desc: "Destaca tus servicios con insignia PRO" },
    ],
};

interface FeaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-10 lg:inset-20 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Todas las Funciones</h2>
                                    <p className="text-sm text-slate-500">32 FREE + 8 PRO</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                                {/* FREE Column */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Check className="w-5 h-5 text-green-500" />
                                        <h3 className="font-bold text-lg text-slate-800">Funciones FREE</h3>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">16 funciones</span>
                                    </div>
                                    <div className="space-y-2">
                                        {features.free.map((feature, idx) => (
                                            <div key={idx} className="bg-slate-50 rounded-lg p-3">
                                                <div className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{feature.name}</p>
                                                        <p className="text-xs text-slate-500">{feature.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* PRO Column */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Crown className="w-5 h-5 text-blue-500" />
                                        <h3 className="font-bold text-lg text-slate-800">Funciones PRO</h3>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">$99/mes</span>
                                    </div>
                                    <div className="space-y-2">
                                        {features.pro.map((feature, idx) => (
                                            <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <div className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{feature.name}</p>
                                                        <p className="text-xs text-slate-500">{feature.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* PRO CTA */}
                                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl text-white text-center">
                                        <p className="font-bold">$99 MXN/mes</p>
                                        <p className="text-sm opacity-90">Trial de 7 días gratis</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Export a trigger button
export function FeaturesTrigger({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
            <Sparkles className="w-4 h-4" />
            Ver todas las funciones
        </button>
    );
}
