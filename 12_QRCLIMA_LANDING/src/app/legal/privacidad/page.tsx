import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-16">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-12 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </Link>

                <article className="font-sans">
                    <header className="mb-12 border-b border-slate-100 pb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Aviso de Privacidad Integral
                        </h1>
                        <h2 className="text-xl text-blue-600 font-semibold mb-2">
                            PLATAFORMA QRCLIMA
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Última actualización: 29 de diciembre de 2025
                        </p>
                    </header>

                    <div className="space-y-8 text-slate-600 leading-relaxed">
                        <p className="text-lg">
                            En cumplimiento con lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (en adelante, la “LFPDPPP”), se emite el presente Aviso de Privacidad para informar a los usuarios sobre el tratamiento de sus datos personales.
                        </p>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                                Responsable del Tratamiento
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <p className="mb-2">El responsable del tratamiento de los datos personales es:</p>
                                <p className="font-semibold text-slate-900">Tecnología y Software en la Ingeniería Civil</p>
                                <p>
                                    Correo de contacto: <a href="mailto:qrclima@tesivil.com" className="text-blue-600 hover:underline">qrclima@tesivil.com</a>
                                </p>
                                <p className="mt-2 text-sm text-slate-500">En adelante, el “Responsable”.</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                                Datos Personales que se Recaban
                            </h3>
                            <p className="mb-4">Para la correcta operación de la Plataforma QRclima, el Responsable podrá recabar las siguientes categorías de datos personales:</p>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-2">a) Datos de identificación</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Nombre o alias</li>
                                        <li>Correo electrónico</li>
                                        <li>Número telefónico (si aplica)</li>
                                        <li>Fotografía de perfil (opcional)</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-2">b) Datos técnicos y de uso</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Historial de servicios registrados</li>
                                        <li>Equipos asociados a códigos QR</li>
                                        <li>Fecha, tipo y ubicación del servicio</li>
                                        <li>Dirección IP y datos del dispositivo</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-2">c) Datos de geolocalización</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Ubicación precisa (GPS) en primer y segundo plano (con autorización explícita) para validación antifraude.</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-2">d) Contenido de usuario</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Textos, comentarios y reportes en comunidades y soporte.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                                Datos Personales Sensibles
                            </h3>
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-amber-900">
                                <p>
                                    El Responsable <strong>no recaba datos personales sensibles</strong> conforme a la LFPDPPP. La geolocalización precisa se trata como dato de alta sensibilidad operativa, pero no como dato sensible legal, y requiere consentimiento expreso.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
                                Finalidades del Tratamiento
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">Finalidades Primarias (Necesarias)</h4>
                                    <ul className="list-none space-y-2">
                                        {[
                                            "Crear y administrar cuentas de usuario.",
                                            "Registrar y mostrar servicios técnicos.",
                                            "Asociar servicios a códigos QR físicos.",
                                            "Mostrar bitácoras digitales.",
                                            "Validar la ejecución física de servicios (antifraude).",
                                            "Procesar pagos y suscripciones.",
                                            "Garantizar la seguridad y funcionamiento de la Plataforma."
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-green-500 mt-1">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">Finalidades Secundarias</h4>
                                    <ul className="list-none space-y-2">
                                        {[
                                            "Análisis estadístico y mejora del servicio.",
                                            "Moderación automatizada de contenido.",
                                            "Prevención de abuso, fraude o uso indebido.",
                                            "Comunicación de avisos operativos o legales."
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-slate-400 mt-1">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">5</span>
                                Bitácora Pública y Visibilidad
                            </h3>
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <p className="mb-4 text-blue-900">
                                    El Usuario Técnico reconoce y acepta que los siguientes datos serán <strong>públicamente visibles</strong> al escanear el QR físico:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 mb-4 text-blue-800">
                                    <li>Nombre del técnico</li>
                                    <li>Fecha del servicio</li>
                                    <li>Tipo de servicio</li>
                                </ul>
                                <p className="text-sm text-blue-700">
                                    Esta publicación constituye una transferencia de datos al público en general, realizada con consentimiento expreso.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">6</span>
                                Transferencias a Terceros
                            </h3>
                            <p className="mb-4">Terceros encargados del tratamiento para operación de la plataforma:</p>
                            <ul className="grid sm:grid-cols-2 gap-3">
                                <li className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <span className="font-bold block text-sm">Pagos</span> Stripe, MercadoPago
                                </li>
                                <li className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <span className="font-bold block text-sm">Mapas</span> Google Maps Platform
                                </li>
                                <li className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <span className="font-bold block text-sm">IA</span> Proveedores LLM (ej. Groq)
                                </li>
                                <li className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <span className="font-bold block text-sm">Infraestructura</span> Nube, Hosting, CDN
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">7</span>
                                Derechos ARCO y Contacto
                            </h3>
                            <p className="mb-4">
                                Puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición enviando solicitud a:
                            </p>
                            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                                <a href="mailto:qrclima@tesivil.com" className="text-xl font-bold text-blue-600 hover:text-blue-700">
                                    qrclima@tesivil.com
                                </a>
                                <p className="mt-2 text-slate-500 text-sm">Tecnología y Software en la Ingeniería Civil</p>
                            </div>
                        </section>

                        <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
                            <p>En caso de inconformidad, el titular podrá acudir al INAI.</p>
                        </div>
                    </div>
                </article>
            </div>
        </main>
    );
}
