"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, Calculator, Zap, Thermometer } from "lucide-react";

const tools = [
    {
        icon: WifiOff,
        title: "Modo Offline",
        description: "Códigos de error sin internet. Funciona en sótanos y azoteas.",
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
        textColor: "text-blue-600",
    },
    {
        icon: Calculator,
        title: "Calculadora BTU",
        description: "Dimensiona en 10 segundos. Residencial, comercial e industrial.",
        color: "bg-teal-500",
        lightColor: "bg-teal-50",
        textColor: "text-teal-600",
    },
    {
        icon: Zap,
        title: "Guía Eléctrica",
        description: "Cumple con NOM sin dudar. Calibres y protecciones correctas.",
        color: "bg-amber-500",
        lightColor: "bg-amber-50",
        textColor: "text-amber-600",
    },
    {
        icon: Thermometer,
        title: "Tabla P-T",
        description: "R410A, R22, R32 y más. Valores ajustados al campo real.",
        color: "bg-purple-500",
        lightColor: "bg-purple-50",
        textColor: "text-purple-600",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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

export default function Herramientas() {
    return (
        <section className="section section-alt">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Herramientas hechas para{" "}
                        <span className="text-gradient">el campo</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        No para la oficina. Diseñadas por técnicos, para resolver problemas reales en segundos.
                    </p>
                </motion.div>

                {/* Tools Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.title}
                            variants={cardVariants}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="card p-6 text-center group cursor-pointer"
                        >
                            {/* Icon */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`w-16 h-16 ${tool.lightColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:${tool.color} transition-colors`}
                            >
                                <tool.icon className={`w-8 h-8 ${tool.textColor} group-hover:text-white transition-colors`} />
                            </motion.div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                {tool.title}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {tool.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Closing Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-md">
                        <Wifi className="w-5 h-5 text-green-500" />
                        <p className="text-slate-700">
                            <strong>Menos Google.</strong>{" "}
                            <span className="text-slate-500">Menos adivinar.</span>{" "}
                            <strong className="text-teal-600">Más certeza.</strong>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
