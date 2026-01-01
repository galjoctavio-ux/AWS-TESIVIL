"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Download, Mail, Shield, FileText, ExternalLink, Smartphone, Clock, HelpCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import { FAQModal } from "./FAQ";
import { FeaturesModal } from "./Features";
import { DOWNLOAD_LINKS } from "@/constants";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [showFAQ, setShowFAQ] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);

    return (
        <>
            <footer id="descargar" className="section bg-slate-900 text-white">
                <div className="container">
                    {/* Download Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                            Instálala hoy.{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                                Úsala en tu próximo servicio.
                            </span>
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                            Próximamente en Google Play y App Store. Descarga directa disponible ahora.
                        </p>

                        {/* Download Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                            {/* Descarga Directa - Principal */}
                            <motion.a
                                href={DOWNLOAD_LINKS.ANDROID_APK}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <Download className="w-8 h-8" />
                                <div className="text-left">
                                    <p className="text-xs opacity-80">Descarga Directa</p>
                                    <p className="text-lg font-bold">Android APK</p>
                                </div>
                            </motion.a>
                        </div>

                        {/* Coming Soon */}
                        <div className="flex flex-wrap gap-4 justify-center">
                            <div className="flex items-center gap-3 bg-slate-800 text-slate-400 px-6 py-3 rounded-xl opacity-75">
                                <Clock className="w-5 h-5" />
                                <span className="text-sm">Próximamente en Google Play</span>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-800 text-slate-400 px-6 py-3 rounded-xl opacity-75">
                                <Clock className="w-5 h-5" />
                                <span className="text-sm">Próximamente en App Store</span>
                            </div>
                        </div>

                        {/* Microcopy */}
                        <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            <span>100% gratis para empezar · Sin tarjeta de crédito</span>
                        </p>
                    </motion.div>

                    {/* Divider */}
                    <div className="border-t border-slate-800 my-8" />

                    {/* Footer Links - Simplified */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Image
                                    src="/icon.png"
                                    alt="QRclima"
                                    width={40}
                                    height={40}
                                    className="rounded-xl"
                                />
                                <span className="text-xl font-bold">QRclima</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">
                                Herramientas para el técnico de aire acondicionado moderno.
                            </p>
                            <a
                                href="mailto:qrclima@tesivil.com"
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                                <Mail className="w-4 h-4" />
                                qrclima@tesivil.com
                            </a>
                        </div>

                        {/* Quick Links with Modals */}
                        <div>
                            <h4 className="font-semibold mb-4 text-slate-300">Explora</h4>
                            <ul className="space-y-3">
                                <li>
                                    <button
                                        onClick={() => setShowFeatures(true)}
                                        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Ver todas las funciones
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setShowFAQ(true)}
                                        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        Preguntas Frecuentes
                                    </button>
                                </li>
                                <li>
                                    <a href="#precios" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        Precios FREE vs PRO
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-semibold mb-4 text-slate-300">Legal</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="/legal/privacidad" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Aviso de Privacidad
                                    </a>
                                </li>
                                <li>
                                    <a href="/legal/terminos" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Términos y Condiciones
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <div>
                            <p className="text-sm text-slate-500 mb-2">
                                © {currentYear} QRclima. Todos los derechos reservados.
                            </p>
                            <p className="text-xs text-slate-600">
                                Esta aplicación forma parte del ecosistema TESIVIL.{" "}
                                <a
                                    href="https://apps.tesivil.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    Conoce más apps como esta.
                                </a>
                            </p>
                        </div>
                        <p className="text-sm text-slate-500">
                            Hecho por y para técnicos de aire acondicionado ❄️
                        </p>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
            <FeaturesModal isOpen={showFeatures} onClose={() => setShowFeatures(false)} />
        </>
    );
}
