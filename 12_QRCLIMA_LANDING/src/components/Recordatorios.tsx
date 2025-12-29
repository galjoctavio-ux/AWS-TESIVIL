"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Bell, Calendar, Gift, Clock } from "lucide-react";

export default function Recordatorios() {
    const timelineRef = useRef(null);
    const isInView = useInView(timelineRef, { once: true, margin: "-100px" });

    return (
        <section className="section">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Que la app{" "}
                        <span className="text-gradient">se acuerde por ti</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                        Con un solo mantenimiento recuperado,{" "}
                        <strong className="text-slate-800">pagas meses de la app.</strong>
                    </p>
                </motion.div>

                {/* Timeline Visual */}
                <div ref={timelineRef} className="max-w-4xl mx-auto">
                    {/* Timeline Container */}
                    <div className="relative">
                        {/* Timeline Line - Behind everything */}
                        <div className="absolute top-8 md:top-10 left-0 right-0 h-1 bg-slate-200 rounded-full z-0">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={isInView ? { width: "100%" } : { width: 0 }}
                                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 rounded-full"
                            />
                        </div>

                        {/* Timeline Points */}
                        <div className="relative flex justify-between items-start z-10">
                            {/* Point A - Hoy */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center text-center w-1/3"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={isInView ? { scale: 1 } : {}}
                                    transition={{ delay: 0.5, type: "spring" }}
                                    className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg mb-4 relative z-10"
                                >
                                    <Check className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </motion.div>

                                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 max-w-[200px] relative z-10">
                                    <p className="text-xs text-slate-500 mb-1">Hoy</p>
                                    <p className="text-sm md:text-base font-bold text-slate-800 mb-2">
                                        Terminas un servicio
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Familia Pérez - Minisplit 2TR
                                    </p>
                                </div>
                            </motion.div>

                            {/* Point B - Acción */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 1 }}
                                className="flex flex-col items-center text-center w-1/3"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={isInView ? { scale: 1 } : {}}
                                    transition={{ delay: 1.2, type: "spring" }}
                                    className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg mb-4 relative z-10"
                                >
                                    <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </motion.div>

                                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 max-w-[200px] relative z-10">
                                    <span className="absolute -top-2 -right-2 badge-pro text-[10px] px-2 py-0.5 rounded-full">
                                        PRO
                                    </span>
                                    <p className="text-xs text-slate-500 mb-1">Acción</p>
                                    <p className="text-sm md:text-base font-bold text-slate-800 mb-2">
                                        Activas recordatorio
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        "Avisar en 6 meses"
                                    </p>
                                </div>
                            </motion.div>

                            {/* Point C - Futuro */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 1.7 }}
                                className="flex flex-col items-center text-center w-1/3"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={isInView ? { scale: 1 } : {}}
                                    transition={{ delay: 1.9, type: "spring" }}
                                    className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-4 relative z-10"
                                >
                                    <Bell className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </motion.div>

                                {/* Push Notification */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                                    transition={{ delay: 2.2, type: "spring" }}
                                    className="bg-white rounded-xl shadow-2xl p-4 md:p-6 max-w-[220px] border-2 border-green-200"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">QR</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800">QRclima</p>
                                            <p className="text-[10px] text-slate-500">ahora</p>
                                        </div>
                                    </div>

                                    <p className="text-sm font-bold text-slate-800 mb-1">
                                        🔔 Mantenimiento Preventivo
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        Familia Pérez toca revisión de su equipo. ¿Deseas contactar?
                                    </p>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Dotted time indicator - moved above timeline with higher z-index */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ delay: 1.5 }}
                            className="absolute top-14 left-1/3 right-1/3 flex items-center justify-center z-20"
                        >
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-md">
                                <Clock className="w-3 h-3 text-teal-500" />
                                <span className="text-[10px] text-slate-600 font-medium">6 meses después...</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Special Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 2.5 }}
                        className="mt-12 flex justify-center"
                    >
                        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full px-6 py-3 shadow-md">
                            <Gift className="w-5 h-5 text-amber-600" />
                            <p className="text-sm text-amber-800">
                                <strong>Te avisamos aunque tu PRO haya expirado</strong>{" "}
                                <span className="text-amber-600">· El recordatorio ya está guardado</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Copy de apoyo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-center max-w-xl mx-auto"
                    >
                        <p className="text-slate-600">
                            Convierte cada servicio de hoy en{" "}
                            <strong className="text-slate-800">dinero futuro</strong>.
                            Si ya no eres PRO cuando llega la fecha, igual te avisamos.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
