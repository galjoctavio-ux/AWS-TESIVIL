"use client";

import { motion } from "framer-motion";
import { Download, Smartphone } from "lucide-react";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="section relative overflow-hidden min-h-screen flex items-center">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-teal-50/30 pointer-events-none" />

            <div className="container relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Copy */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        {/* App Logo, Name & Badge - Unified Header */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-wrap items-center gap-4 justify-center lg:justify-start mb-6"
                        >
                            {/* Icon & Name */}
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/icon.png"
                                    alt="QRclima"
                                    width={56}
                                    height={56}
                                    className="rounded-xl shadow-lg"
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">QRclima</h2>
                                    <p className="text-sm text-slate-500">Bitácora y Cálculos</p>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-slate-600">
                                    App para técnicos de aire acondicionado
                                </span>
                            </div>
                        </motion.div>

                        {/* H1 */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            Todo tu día como técnico,{" "}
                            <span className="text-gradient">claro y bajo control.</span>
                        </h1>

                        {/* H2 */}
                        <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
                            Agenda visual, diagnóstico técnico y herramientas reales.{" "}
                            <strong className="text-slate-800">
                                Ve hoy, mañana y la semana completa en segundos.
                            </strong>
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-4">
                            <motion.a
                                href="#descargar"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary text-lg px-8 py-4 shadow-lg"
                            >
                                <Download className="w-5 h-5" />
                                Descargar Gratis
                            </motion.a>

                            <motion.a
                                href="#funciones"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-secondary text-lg px-8 py-4"
                            >
                                Ver funciones
                            </motion.a>
                        </div>

                        {/* Microcopy */}
                        <p className="text-sm text-slate-500 flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                Gratis
                            </span>
                            <span>·</span>
                            <span>Sin tarjeta</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                <Smartphone className="w-4 h-4" />
                                Próximamente en tiendas
                            </span>
                        </p>
                    </motion.div>

                    {/* Right: Android Phone Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative flex justify-center lg:justify-end"
                    >
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-teal-400/20 blur-3xl rounded-full transform scale-150" />

                            {/* Phone container with tilt effect */}
                            <motion.div
                                whileHover={{
                                    rotateY: 5,
                                    rotateX: -5,
                                    scale: 1.02,
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="relative z-10"
                                style={{ perspective: 1000 }}
                            >
                                {/* Android Phone Frame */}
                                <div className="relative w-[280px] md:w-[320px] h-[580px] md:h-[650px] bg-slate-800 rounded-[2.5rem] p-2 shadow-2xl border-4 border-slate-700">
                                    {/* Top speaker/camera bar */}
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                                        <div className="w-2 h-2 bg-slate-600 rounded-full" />
                                        <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
                                        <div className="w-2 h-2 bg-slate-600 rounded-full" />
                                    </div>

                                    {/* Screen */}
                                    <div className="relative w-full h-full bg-white rounded-[2rem] overflow-hidden">
                                        {/* App UI Mockup */}
                                        <div className="p-4 h-full">
                                            {/* Status bar - Android style */}
                                            <div className="flex justify-between items-center mb-4 pt-2">
                                                <span className="text-xs font-medium text-slate-800">12:45</span>
                                                <div className="flex gap-1 items-center">
                                                    <div className="flex gap-0.5">
                                                        <div className="w-1 h-2 bg-slate-800 rounded-sm" />
                                                        <div className="w-1 h-2.5 bg-slate-800 rounded-sm" />
                                                        <div className="w-1 h-3 bg-slate-800 rounded-sm" />
                                                        <div className="w-1 h-3.5 bg-slate-800 rounded-sm" />
                                                    </div>
                                                    <div className="w-5 h-2.5 bg-green-500 rounded-sm ml-1" />
                                                </div>
                                            </div>

                                            {/* Header */}
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-slate-800">Mi Agenda</h3>
                                                <p className="text-xs text-slate-500">Hoy · 28 Dic 2024</p>
                                            </div>

                                            {/* Calendar Events */}
                                            <div className="space-y-3">
                                                {/* Event 1 */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1 }}
                                                    className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        Mantenimiento Preventivo
                                                    </p>
                                                    <p className="text-xs text-slate-500">9:00 AM · Familia Pérez</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                            Minisplit
                                                        </span>
                                                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                            12 km
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                {/* Event 2 */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1.2 }}
                                                    className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">Revisión Urgente</p>
                                                    <p className="text-xs text-slate-500">11:30 AM · Comercial López</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                                                            VRF
                                                        </span>
                                                        <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                                            ⚠️ Tráfico
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                {/* Event 3 */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1.4 }}
                                                    className="bg-teal-50 border-l-4 border-teal-500 p-3 rounded-lg"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">Instalación Nueva</p>
                                                    <p className="text-xs text-slate-500">3:00 PM · Residencial Torres</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-700 rounded">
                                                            R-410A
                                                        </span>
                                                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                            8 km
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="absolute bottom-8 left-4 right-4">
                                                <div className="flex justify-around bg-slate-100 rounded-2xl p-3">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-lg">📞</span>
                                                    </div>
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-lg">💬</span>
                                                    </div>
                                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-lg">🗺️</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Android Navigation bar at bottom */}
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-600 rounded-full" />
                                </div>

                                {/* Floating elements */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3"
                                >
                                    <span className="text-2xl">📍</span>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 4,
                                        ease: "easeInOut",
                                        delay: 1,
                                    }}
                                    className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3"
                                >
                                    <span className="text-2xl">⚡</span>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
