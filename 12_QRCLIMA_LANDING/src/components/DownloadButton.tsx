"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import { DOWNLOAD_LINKS } from "@/constants";

// reCAPTCHA Site Key
const RECAPTCHA_SITE_KEY = "6LeW1z8sAAAAAGnKQY0jcMcs5fAhoFNLRgFcL0w3";

type ModalState = "idle" | "verifying" | "success" | "error";

export default function DownloadButton() {
    const [modalState, setModalState] = useState<ModalState>("idle");

    const handleDownload = async () => {
        setModalState("verifying");

        try {
            // Cargar reCAPTCHA dinámicamente si no está cargado
            if (typeof window !== "undefined" && !window.grecaptcha) {
                const script = document.createElement("script");
                script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
                script.async = true;
                document.head.appendChild(script);

                await new Promise((resolve) => {
                    script.onload = resolve;
                    setTimeout(resolve, 3000); // Timeout fallback
                });
            }

            // Esperar a que grecaptcha esté listo
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (window.grecaptcha) {
                const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
                    action: "download",
                });

                if (token) {
                    setModalState("success");

                    // Esperar un momento y luego descargar
                    setTimeout(() => {
                        setModalState("idle");
                        window.location.href = DOWNLOAD_LINKS.ANDROID_APK;
                    }, 1500);
                } else {
                    setModalState("error");
                }
            } else {
                // Fallback: permitir descarga si reCAPTCHA no carga
                setModalState("success");
                setTimeout(() => {
                    setModalState("idle");
                    window.location.href = DOWNLOAD_LINKS.ANDROID_APK;
                }, 1500);
            }
        } catch (error) {
            console.error("reCAPTCHA error:", error);
            setModalState("error");
        }
    };

    const closeModal = () => setModalState("idle");

    return (
        <>
            {/* Download Button */}
            <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            >
                <Download className="w-8 h-8" />
                <div className="text-left">
                    <p className="text-xs opacity-80">Descarga Directa</p>
                    <p className="text-lg font-bold">Android APK</p>
                </div>
            </motion.button>

            {/* Verification Modal */}
            <AnimatePresence>
                {modalState !== "idle" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={modalState === "error" ? closeModal : undefined}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {modalState === "verifying" && (
                                <>
                                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                                    <p className="text-lg text-slate-300">Verificando seguridad...</p>
                                </>
                            )}

                            {modalState === "success" && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 10 }}
                                    >
                                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                    </motion.div>
                                    <p className="text-lg text-green-400">¡Verificado! Iniciando descarga...</p>
                                </>
                            )}

                            {modalState === "error" && (
                                <>
                                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                    <p className="text-lg text-red-400 mb-4">Error de verificación</p>
                                    <button
                                        onClick={closeModal}
                                        className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Type declaration for grecaptcha
declare global {
    interface Window {
        grecaptcha: {
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
            ready: (callback: () => void) => void;
        };
    }
}
