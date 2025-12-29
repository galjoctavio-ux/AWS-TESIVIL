"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Phone, MessageCircle, MapPin, Navigation, Clock, Route, ToggleLeft, ToggleRight } from "lucide-react";

export default function Agenda() {
    const [traficoOn, setTraficoOn] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        },
    };

    return (
        <section id="funciones" className="section section-alt">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Tu agenda completa en{" "}
                        <span className="text-gradient">menos de 60 segundos</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        No más notas sueltas ni confusiones. Visualiza hoy, mañana y toda tu semana con un vistazo.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Main Card - Vista 3 días */}
                    <motion.div
                        variants={cardVariants}
                        className="lg:col-span-2 lg:row-span-2 card p-6 md:p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800">Vista de 3 Días</h3>
                                <p className="text-slate-500">Lunes 28 - Miércoles 30 Dic</p>
                            </div>

                            {/* Traffic Toggle */}
                            <button
                                onClick={() => setTraficoOn(!traficoOn)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${traficoOn
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                                    }`}
                            >
                                {traficoOn ? (
                                    <ToggleRight className="w-5 h-5" />
                                ) : (
                                    <ToggleLeft className="w-5 h-5" />
                                )}
                                <span className="text-sm font-medium">
                                    Tráfico {traficoOn ? "ON" : "OFF"}
                                </span>
                                {traficoOn && (
                                    <span className="badge-pro text-xs px-2 py-0.5 rounded-full">PRO</span>
                                )}
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Day 1 */}
                            <div className="space-y-3">
                                <div className="text-center pb-2 border-b border-slate-200">
                                    <p className="text-sm font-semibold text-slate-800">Lun 28</p>
                                    <p className="text-xs text-slate-500">Hoy</p>
                                </div>

                                <motion.div
                                    layout
                                    className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg"
                                >
                                    <p className="text-sm font-semibold text-slate-800">9:00</p>
                                    <p className="text-xs text-slate-600 mb-1">Fam. Pérez</p>
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Mant.</span>

                                    {traficoOn && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-2 pt-2 border-t border-blue-200"
                                        >
                                            <div className="flex items-center gap-1 text-[10px] text-blue-700">
                                                <Clock className="w-3 h-3" />
                                                <span>12 min</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>

                                <motion.div
                                    layout
                                    className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg"
                                >
                                    <p className="text-sm font-semibold text-slate-800">11:30</p>
                                    <p className="text-xs text-slate-600 mb-1">Com. López</p>
                                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded">Urgente</span>

                                    {traficoOn && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-2 pt-2 border-t border-amber-200"
                                        >
                                            <div className="flex items-center gap-1 text-[10px] text-red-600 font-semibold">
                                                <Clock className="w-3 h-3" />
                                                <span>45 min ⚠️</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Day 2 */}
                            <div className="space-y-3">
                                <div className="text-center pb-2 border-b border-slate-200">
                                    <p className="text-sm font-semibold text-slate-800">Mar 29</p>
                                    <p className="text-xs text-slate-500">Mañana</p>
                                </div>

                                <motion.div
                                    layout
                                    className="bg-teal-50 border-l-4 border-teal-500 p-3 rounded-lg"
                                >
                                    <p className="text-sm font-semibold text-slate-800">10:00</p>
                                    <p className="text-xs text-slate-600 mb-1">Res. Torres</p>
                                    <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-700 rounded">Instalación</span>

                                    {traficoOn && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-2 pt-2 border-t border-teal-200"
                                        >
                                            <div className="flex items-center gap-1 text-[10px] text-teal-700">
                                                <Clock className="w-3 h-3" />
                                                <span>8 min</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>

                                <motion.div
                                    layout
                                    className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-lg"
                                >
                                    <p className="text-sm font-semibold text-slate-800">14:00</p>
                                    <p className="text-xs text-slate-600 mb-1">Clínica Salud</p>
                                    <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded">VRF</span>

                                    {traficoOn && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-2 pt-2 border-t border-purple-200"
                                        >
                                            <div className="flex items-center gap-1 text-[10px] text-purple-700">
                                                <Clock className="w-3 h-3" />
                                                <span>22 min</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Day 3 */}
                            <div className="space-y-3">
                                <div className="text-center pb-2 border-b border-slate-200">
                                    <p className="text-sm font-semibold text-slate-800">Mié 30</p>
                                    <p className="text-xs text-slate-500">Pasado</p>
                                </div>

                                <motion.div
                                    layout
                                    className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg"
                                >
                                    <p className="text-sm font-semibold text-slate-800">9:30</p>
                                    <p className="text-xs text-slate-600 mb-1">Rest. El Mar</p>
                                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded">Revisión</span>

                                    {traficoOn && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-2 pt-2 border-t border-green-200"
                                        >
                                            <div className="flex items-center gap-1 text-[10px] text-green-700">
                                                <Clock className="w-3 h-3" />
                                                <span>15 min</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </div>

                        {/* Traffic Note */}
                        {traficoOn && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg text-center"
                            >
                                💡 <strong>No es lo mismo 8 km libres que 8 km con tráfico.</strong>{" "}
                                Planea tu día con tiempos reales.
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Quick Actions Card */}
                    <motion.div
                        variants={cardVariants}
                        className="card p-6"
                    >
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Acciones Rápidas</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Un toque para llamar, navegar o enviar mensaje.
                        </p>

                        <div className="flex justify-around">
                            <div className="text-center">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg mb-2"
                                >
                                    <Phone className="w-6 h-6 text-white" />
                                </motion.button>
                                <p className="text-xs font-medium text-slate-600">Llamar</p>
                            </div>

                            <div className="text-center">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-2"
                                >
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </motion.button>
                                <p className="text-xs font-medium text-slate-600">WhatsApp</p>
                            </div>

                            <div className="text-center">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-lg mb-2"
                                >
                                    <MapPin className="w-6 h-6 text-white" />
                                </motion.button>
                                <p className="text-xs font-medium text-slate-600">Navegar</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Distance Card */}
                    <motion.div
                        variants={cardVariants}
                        className="card p-6"
                    >
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Distancia Inteligente</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Optimiza tu ruta entre servicios.
                        </p>

                        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                            <div className="text-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Navigation className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-xs text-slate-500">Actual</p>
                                <p className="text-sm font-bold text-slate-800">Fam. Pérez</p>
                            </div>

                            <div className="flex-1 mx-4">
                                <div className="flex items-center">
                                    <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500 to-teal-500" />
                                    <Route className="w-4 h-4 text-slate-400 mx-2" />
                                    <div className="h-0.5 flex-1 bg-gradient-to-r from-teal-500 to-green-500" />
                                </div>
                                <p className="text-center text-xs text-slate-600 mt-1">
                                    <strong>8.2 km</strong> · 12 min
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-xs text-slate-500">Siguiente</p>
                                <p className="text-sm font-bold text-slate-800">Com. López</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
