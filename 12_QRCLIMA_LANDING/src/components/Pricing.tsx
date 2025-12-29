"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, Crown, Gift } from "lucide-react";

const plans = {
    free: {
        name: "FREE",
        price: "Gratis",
        period: "para siempre",
        description: "Para empezar sin compromiso",
        features: [
            { text: "Agenda básica", included: true },
            { text: "Registro de servicios", included: true },
            { text: "PDFs con marca de agua", included: true },
            { text: "Códigos de error (limitado)", included: true },
            { text: "Tráfico en tiempo real", included: false },
            { text: "Recordatorios automáticos", included: false },
            { text: "Diagnóstico avanzado", included: false },
            { text: "PDFs limpios + tu logo", included: false },
        ],
    },
    pro: {
        name: "PRO",
        price: "$99",
        period: "MXN / mes",
        description: "Desbloquea todo el potencial",
        features: [
            { text: "Todo lo de FREE", included: true },
            { text: "Tráfico en tiempo real", included: true, highlight: true },
            { text: "Recordatorios automáticos", included: true, highlight: true },
            { text: "Radar de precios actualizados", included: true, highlight: true },
            { text: "Calculadora BTU profesional", included: true },
            { text: "PDFs limpios + tu logo", included: true },
            { text: "Nuevas funciones primero", included: true },
        ],
    },
};

export default function Pricing() {
    return (
        <section id="precios" className="section section-alt">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Empieza gratis.{" "}
                        <span className="text-gradient">Desbloquea potencia</span> cuando la necesites.
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Sin trucos. El plan FREE es realmente funcional. PRO es para cuando quieras más.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* FREE Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="card p-8 border-2 border-slate-200"
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                {plans.free.name}
                            </h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-slate-800">
                                    {plans.free.price}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{plans.free.period}</p>
                            <p className="text-sm text-slate-600 mt-2">{plans.free.description}</p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {plans.free.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    {feature.included ? (
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                                    )}
                                    <span className={feature.included ? "text-slate-700" : "text-slate-400"}>
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <motion.a
                            href="#descargar"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="block w-full btn-secondary text-center py-4"
                        >
                            Empezar Gratis
                        </motion.a>
                    </motion.div>

                    {/* PRO Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="card p-8 border-2 border-blue-500 relative overflow-hidden"
                    >
                        {/* Popular Badge */}
                        <div className="absolute top-4 right-4">
                            <div className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                <Crown className="w-3 h-3" />
                                Popular
                            </div>
                        </div>

                        {/* Gradient Glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-3xl" />

                        <div className="text-center mb-6 relative">
                            <h3 className="text-2xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2">
                                {plans.pro.name}
                                <Sparkles className="w-5 h-5" />
                            </h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-slate-800">
                                    {plans.pro.price}
                                </span>
                                <span className="text-slate-500">{plans.pro.period}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{plans.pro.description}</p>
                        </div>

                        <ul className="space-y-3 mb-8 relative">
                            {plans.pro.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <Check className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? "text-blue-500" : "text-green-500"
                                        }`} />
                                    <span className={`text-slate-700 ${feature.highlight ? "font-semibold" : ""}`}>
                                        {feature.text}
                                        {feature.highlight && (
                                            <span className="ml-2 text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                                                ⭐ Clave
                                            </span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <motion.a
                            href="#descargar"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="block w-full btn-primary text-center py-4 relative"
                        >
                            Comenzar con PRO
                        </motion.a>
                    </motion.div>
                </div>

                {/* Bonus Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 max-w-2xl mx-auto"
                >
                    <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-lg">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Gift className="w-6 h-6 text-amber-600" />
                            <h4 className="text-lg font-bold text-amber-800">
                                ¡Oferta de Lanzamiento!
                            </h4>
                        </div>
                        <p className="text-amber-700">
                            <strong>Completa tu perfil al 100%</strong> y recibe{" "}
                            <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                3 DÍAS PRO GRATIS
                            </span>{" "}
                            hoy mismo.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
