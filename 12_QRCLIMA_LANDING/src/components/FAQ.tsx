"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, HelpCircle, X } from "lucide-react";

const faqs = [
    {
        question: "¿Qué puedo hacer con la versión GRATIS?",
        answer: "La versión FREE incluye: Dashboard inteligente, registro de servicios ilimitado, CRM de clientes, scanner QR, ecosistema QR (bitácora viva), biblioteca de errores básica (offline), calculadora BTU básica, guía de cables eléctricos (NOM), tabla P-T para gases, calendario visual, acciones rápidas en citas, comunidad SOS, capacitación con quizzes, sistema de tokens y gamificación, perfil profesional, y firma digital.",
    },
    {
        question: "¿Qué incluye la suscripción PRO?",
        answer: "Por $99 MXN/mes desbloqueas: Tráfico en tiempo real, recordatorios automáticos de mantenimiento, modo diagnóstico Mirage, calculadora BTU profesional con PDF, cotizador inteligente con 2,000+ insumos, radar de precios del mercado, y PDFs sin marca de agua + tu logo.",
    },
    {
        question: "¿Funciona sin internet?",
        answer: "Sí. La biblioteca de errores con 67+ modelos funciona completamente offline. Puedes buscar códigos de error en la azotea, en sótanos o donde no tengas señal.",
    },
    {
        question: "¿Qué es el ecosistema QR 'Bitácora Viva'?",
        answer: "Cada equipo que registras tiene un código QR único. Cuando el cliente escanea ese QR, ve el historial completo de servicios y tu información de contacto. Es tu marca pegada en cada equipo.",
    },
    {
        question: "¿Qué son los tokens y cómo los gano?",
        answer: "Los tokens son puntos que ganas por usar la app. Puedes canjear 500 tokens por 7 días PRO.",
    },
    {
        question: "¿Cómo me ayudan los recordatorios automáticos?",
        answer: "Cuando terminas un servicio, programas un recordatorio. La app te avisa automáticamente cuando toca darle seguimiento. Te avisamos AUNQUE tu suscripción PRO haya expirado.",
    },
    {
        question: "¿Cómo obtengo los 3 días PRO gratis?",
        answer: "Completa tu perfil al 100% siguiendo la guía de completitud. Al llegar al 100%, se activan automáticamente 3 días de PRO sin costo.",
    },
    {
        question: "¿Qué es la Comunidad SOS?",
        answer: "Es un foro exclusivo para técnicos donde puedes preguntar sobre fallas difíciles. Está moderado por IA que bloquea spam y contenido sin valor técnico.",
    },
];

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FAQModal({ isOpen, onClose }: FAQModalProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Preguntas Frecuentes</h2>
                                    <p className="text-sm text-slate-500">Lo que otros técnicos preguntan</p>
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
                            <div className="max-w-2xl mx-auto space-y-3">
                                {faqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="bg-slate-50 rounded-xl overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleFAQ(index)}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 transition-colors"
                                        >
                                            <span className="font-medium text-slate-800 pr-4 text-sm md:text-base">
                                                {faq.question}
                                            </span>
                                            <motion.div
                                                animate={{ rotate: openIndex === index ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex-shrink-0"
                                            >
                                                <ChevronDown className="w-5 h-5 text-slate-500" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {openIndex === index && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 text-slate-600 text-sm border-t border-slate-200 pt-3">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50">
                            <p className="text-center text-sm text-slate-600">
                                ¿Tienes otra pregunta? Escríbenos a{" "}
                                <a href="mailto:qrclima@tesivil.com" className="text-blue-600 font-medium">
                                    qrclima@tesivil.com
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Export a simple FAQ trigger button for use elsewhere
export function FAQTrigger({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
            <HelpCircle className="w-4 h-4" />
            Ver Preguntas Frecuentes
        </button>
    );
}
