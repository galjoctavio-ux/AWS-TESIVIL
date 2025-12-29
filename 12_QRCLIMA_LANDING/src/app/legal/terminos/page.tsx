import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function TerminosPage() {
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
                            Términos y Condiciones de Uso
                        </h1>
                        <h2 className="text-xl text-blue-600 font-semibold mb-2">
                            Tecnología y Software en la Ingeniería Civil
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Última actualización: 24 de Diciembre de 2024
                        </p>
                    </header>

                    <div className="space-y-10 text-slate-600 leading-relaxed">

                        {/* Aceptación */}
                        <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Aceptación de los Términos</h3>
                            <p className="text-sm">
                                Al acceder, registrarse o utilizar la aplicación móvil, el usuario reconoce haber leído, entendido y aceptado estos Términos, que son obligatorios y vinculantes. Si no está de acuerdo, absténgase de usar la aplicación.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Naturaleza de la Plataforma</h3>
                            <p className="mb-4">
                                La Aplicación es una herramienta de gestión documental y apoyo técnico.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-green-600 mb-2">Lo que SÍ hacemos</h4>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>Facilitar registros técnicos</li>
                                        <li>Organizar información de mantenimiento</li>
                                        <li>Proveer herramientas de cálculo referencial</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-500 mb-2">Lo que NO hacemos</h4>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>Prestar servicios de instalación/reparación</li>
                                        <li>Supervisar trabajos de técnicos</li>
                                        <li>Emitir certificaciones oficiales</li>
                                        <li>Sustituir normas o garantías</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Usuarios y Uso Permitido</h3>
                            <p className="mb-4">Dirigido a Técnicos, Empresas y Profesionales HVAC.</p>
                            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50">
                                <p className="font-medium text-slate-900 mb-1">Compromiso del Usuario:</p>
                                <ul className="list-disc pl-5 text-sm">
                                    <li>Proporcionar información veraz.</li>
                                    <li>Usar la app conforme a la ley.</li>
                                    <li>No realizar actos fraudulentos.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">5. Regla "King of the Hill"</h3>
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                    <h4 className="text-lg font-bold text-amber-800">Visibilidad en Códigos QR</h4>
                                </div>
                                <ul className="space-y-3 text-amber-900">
                                    <li className="flex gap-2">
                                        <span className="font-bold whitespace-nowrap">Sin Exclusividad:</span>
                                        <span>Solo el <strong>último técnico</strong> que registra un servicio aparece visible en el QR físico.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold whitespace-nowrap">Pérdida de Visibilidad:</span>
                                        <span>Si otro técnico escanea y registra servicio en el mismo equipo, tu información será reemplazada inmediatamente.</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">6. Tokens y Pagos</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-5 border border-slate-200 rounded-xl">
                                    <h4 className="font-bold text-slate-800 mb-2">🪙 Tokens</h4>
                                    <p className="text-sm">Son unidades de gamificación <strong>sin valor monetario</strong>. No son canjeables por dinero real. La app puede confiscar tokens en caso de fraude.</p>
                                </div>
                                <div className="p-5 border border-slate-200 rounded-xl">
                                    <h4 className="font-bold text-slate-800 mb-2">💳 Suscripción PRO</h4>
                                    <p className="text-sm">Cargos recurrentes automáticos. Cancelación detiene cobros futuros pero no reembolsa el periodo vigente. Precios sujetos a cambios con aviso previo.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">8. Exención de Responsabilidad</h3>
                            <p className="mb-4">
                                Las herramientas (Calculadora BTU, Guía de Cables) son <strong>SOLO ESTIMACIONES</strong>.
                            </p>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 text-sm">
                                <strong>Importante:</strong> La Aplicación no se hace responsable por daños a equipos, fallas eléctricas o accidentes. El criterio final es 100% responsabilidad del técnico certificado.
                            </div>
                        </section>

                        <div className="text-sm text-slate-500 pt-8 border-t border-slate-100">
                            <p className="mb-2"><strong>Propiedad Intelectual:</strong> Todos los derechos reservados por Tecnología y Software en la Ingeniería Civil.</p>
                            <p className="mb-2"><strong>Legislación:</strong> Se rige por las leyes de los Estados Unidos Mexicanos.</p>
                        </div>

                    </div>
                </article>
            </div>
        </main>
    );
}
