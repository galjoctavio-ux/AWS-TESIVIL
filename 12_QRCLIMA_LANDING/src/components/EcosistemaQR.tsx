"use client";

import { motion } from "framer-motion";
import { QrCode, Scan, Phone, History, Shield, UserCheck } from "lucide-react";
import Image from "next/image";

export default function EcosistemaQR() {
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
                        Queda{" "}
                        <span className="text-gradient">sembrado en cada equipo</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        El QR no busca clientes nuevos. Asegura que no pierdas los que ya tienes.
                    </p>
                </motion.div>

                {/* Main Visual */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Equipment with QR */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Real QR Sticker Image */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:rotate-1 transition-transform duration-500">
                            <Image
                                src="/qr-sticker.png"
                                alt="QRclima Sticker en equipo"
                                width={600}
                                height={400}
                                className="w-full h-auto object-cover"
                            />

                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 flex items-center gap-2 border border-blue-100"
                            >
                                <QrCode className="w-6 h-6 text-blue-600" />
                                <span className="text-sm font-semibold text-slate-800">Así se ve en tu equipo</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right - Phone Scanning */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        {/* Phone Mockup Scanning */}
                        <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-8">
                            <div className="relative max-w-[200px] mx-auto">
                                {/* Phone Frame */}
                                <div className="bg-slate-900 rounded-[2rem] p-2 shadow-2xl">
                                    <div className="bg-white rounded-[1.5rem] overflow-hidden">
                                        {/* Scanning Screen */}
                                        <div className="p-3 h-[300px] flex flex-col">
                                            {/* Header */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <Scan className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-semibold text-slate-800">Escanear QR</span>
                                            </div>

                                            {/* Scanning Animation */}
                                            <div className="relative bg-slate-100 rounded-xl h-20 flex items-center justify-center mb-3 overflow-hidden">
                                                <motion.div
                                                    animate={{ y: [-25, 25, -25] }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                                    className="absolute inset-x-2 h-0.5 bg-blue-500 rounded-full shadow-lg"
                                                    style={{ boxShadow: "0 0 10px rgba(37, 99, 235, 0.5)" }}
                                                />
                                                <QrCode className="w-10 h-10 text-slate-400" />
                                            </div>

                                            {/* Result */}
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-2 flex-grow">
                                                <p className="text-[10px] text-green-700 font-semibold mb-0.5">✓ Equipo Encontrado</p>
                                                <p className="text-[10px] text-slate-600">Técnico: Juan Pérez</p>
                                                <p className="text-[10px] text-slate-500">Último: 15 Jun 2024</p>
                                            </div>

                                            {/* Action Button */}
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="mt-2 bg-blue-500 text-white text-center py-2 rounded-lg text-xs font-semibold"
                                            >
                                                <Phone className="w-3 h-3 inline mr-1" />
                                                Llamar Técnico
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <History className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">El cliente ve el historial</p>
                                    <p className="text-sm text-slate-500">Todos los servicios pasados en un solo lugar.</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md"
                            >
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <UserCheck className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Te llama a TI</p>
                                    <p className="text-sm text-slate-500">Tu número aparece primero. Sin intermediarios.</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Protege tu trabajo</p>
                                    <p className="text-sm text-slate-500">Tu reputación ligada a cada equipo que tocas.</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
