"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const screenshots = [
    {
        id: 1,
        title: "Dashboard Principal",
        description: "Tu centro de control con próximos servicios y accesos rápidos",
        image: "/screenshots/dashboard.jpeg",
    },
    {
        id: 2,
        title: "Agenda Visual",
        description: "Vista de 3 días con código de colores por tipo de servicio",
        image: "/screenshots/agenda.jpeg",
    },
    {
        id: 3,
        title: "Registro de Servicio",
        description: "Alta en 30 segundos con checklist, fotos y notas",
        image: "/screenshots/servicios.jpeg",
    },
    {
        id: 4,
        title: "Biblioteca de Errores",
        description: "Códigos de error offline para 67+ modelos",
        image: "/screenshots/errores.jpeg",
    },
    {
        id: 5,
        title: "Cotizador PRO",
        description: "174+ insumos con precios de mercado y factor de stock",
        image: "/screenshots/cotizador.jpeg",
    },
    {
        id: 6,
        title: "Comunidad SOS",
        description: "Foro técnico moderado por IA con soluciones reales",
        image: "/screenshots/comunidad.jpeg",
    },
];

export default function Screenshots() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <section className="section">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Mira la app{" "}
                        <span className="text-gradient">por dentro</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Capturas reales de lo que encontrarás cuando la descargues.
                    </p>
                </motion.div>

                {/* Carousel Container */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Main Carousel */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 md:p-10">
                        <div className="flex items-center gap-8">
                            {/* Phone Mockup with Real Screenshot */}
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="flex-shrink-0 mx-auto"
                            >
                                {/* Android Phone Frame */}
                                <div className="relative w-[240px] md:w-[280px] h-[480px] md:h-[560px] bg-slate-800 rounded-[2rem] p-2 shadow-2xl border-4 border-slate-700">
                                    {/* Top bar */}
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                                        <div className="w-2 h-2 bg-slate-600 rounded-full" />
                                        <div className="w-10 h-1 bg-slate-600 rounded-full" />
                                    </div>

                                    {/* Screen with real screenshot */}
                                    <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-white">
                                        <Image
                                            src={screenshots[currentIndex].image}
                                            alt={screenshots[currentIndex].title}
                                            fill
                                            className="object-cover object-top"
                                            priority
                                        />
                                    </div>

                                    {/* Bottom bar */}
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-600 rounded-full" />
                                </div>
                            </motion.div>

                            {/* Info Panel - Desktop */}
                            <div className="hidden lg:block flex-1">
                                <motion.div
                                    key={`info-${currentIndex}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-xl p-8"
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white text-sm font-medium mb-4">
                                        <span>{currentIndex + 1} / {screenshots.length}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                        {screenshots[currentIndex].title}
                                    </h3>
                                    <p className="text-slate-600 text-lg mb-6">
                                        {screenshots[currentIndex].description}
                                    </p>

                                    {/* Mini preview */}
                                    <div className="flex gap-2">
                                        {screenshots.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => goToSlide(idx)}
                                                className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex
                                                        ? "bg-blue-500 scale-125"
                                                        : "bg-slate-300 hover:bg-slate-400"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
                    >
                        <ChevronRight className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                {/* Mobile Info */}
                <motion.div
                    key={`mobile-info-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="lg:hidden text-center mt-6"
                >
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {screenshots[currentIndex].title}
                    </h3>
                    <p className="text-slate-600">
                        {screenshots[currentIndex].description}
                    </p>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-4">
                        {screenshots.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex
                                        ? "bg-blue-500 scale-125"
                                        : "bg-slate-300"
                                    }`}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
