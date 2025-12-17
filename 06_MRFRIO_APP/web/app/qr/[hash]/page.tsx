'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================
// TIPOS
// ============================================

interface Equipment {
    id: string;
    brand: string;
    model: string;
    type: string;
    linkedAt: any;
    lastServiceTechId?: string;  // King of the Hill
    installDate?: any;
}

interface ServiceRecord {
    id: string;
    type: string;
    status: string;
    date: any;
    technicianId: string;
    diagnosis?: { errorCode: string; description: string };
    tasks?: string[];
}

interface TechnicianPublic {
    alias: string;
    rank: string;
    city?: string;
}

// ============================================
// COMPONENTES
// ============================================

function StatusBadge({ status }: { status: 'healthy' | 'warning' | 'critical' }) {
    const config = {
        healthy: { bg: 'bg-green-100', text: 'text-green-700', icon: '✅', label: 'Al día' },
        warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⚠️', label: 'Próximo mantenimiento' },
        critical: { bg: 'bg-red-100', text: 'text-red-700', icon: '🔴', label: 'Requiere atención' },
    };
    const c = config[status];

    return (
        <div className={`${c.bg} ${c.text} px-4 py-2 rounded-full flex items-center gap-2 font-bold`}>
            <span>{c.icon}</span>
            <span>{c.label}</span>
        </div>
    );
}

function ServiceCard({ service, techName }: { service: ServiceRecord; techName?: string }) {
    const formatDate = (date: any) => {
        if (!date) return 'Sin fecha';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="font-bold text-gray-800">{service.type}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${service.status === 'Terminado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {service.status}
                    </span>
                </div>
                <span className="text-gray-400 text-sm">{formatDate(service.date)}</span>
            </div>

            {service.diagnosis && (
                <p className="text-sm text-red-600 mb-2">
                    🔧 {service.diagnosis.errorCode}: {service.diagnosis.description}
                </p>
            )}

            {service.tasks && service.tasks.length > 0 && (
                <ul className="text-sm text-gray-600 list-disc list-inside">
                    {service.tasks.slice(0, 3).map((task, i) => (
                        <li key={i}>{task}</li>
                    ))}
                </ul>
            )}

            {techName && (
                <p className="text-xs text-gray-400 mt-2">Realizado por: {techName}</p>
            )}
        </div>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function QRPublicView() {
    const params = useParams();
    const hash = params.hash as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [services, setServices] = useState<ServiceRecord[]>([]);
    const [lastTech, setLastTech] = useState<TechnicianPublic | null>(null);

    // Determinar estado del equipo
    const getEquipmentStatus = (): 'healthy' | 'warning' | 'critical' => {
        if (services.length === 0) return 'warning';

        const lastService = services[0];
        if (!lastService.date) return 'warning';

        const lastDate = lastService.date.toDate ? lastService.date.toDate() : new Date(lastService.date);
        const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSince > 180) return 'critical';  // >6 meses
        if (daysSince > 150) return 'warning';   // >5 meses
        return 'healthy';
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // 1. Obtener equipo por hash (QR code)
                // En producción, el hash sería un campo indexado
                // Por ahora, asumimos que hash === equipmentId
                const equipRef = doc(db, 'equipments', hash);
                const equipSnap = await getDoc(equipRef);

                if (!equipSnap.exists()) {
                    setError('Equipo no encontrado. Verifica el código QR.');
                    return;
                }

                const equipData = { id: equipSnap.id, ...equipSnap.data() } as Equipment;
                setEquipment(equipData);

                // 2. Obtener historial de servicios (datos sanitizados)
                const servicesQuery = query(
                    collection(db, 'services'),
                    where('equipmentId', '==', hash),
                    orderBy('date', 'desc'),
                    limit(10)
                );

                const servicesSnap = await getDocs(servicesQuery);
                const servicesData: ServiceRecord[] = [];

                servicesSnap.forEach(docSnap => {
                    const data = docSnap.data();
                    // Sanitizar: solo mostrar datos públicos
                    servicesData.push({
                        id: docSnap.id,
                        type: data.type,
                        status: data.status,
                        date: data.date,
                        technicianId: data.technicianId,
                        diagnosis: data.diagnosis ? {
                            errorCode: data.diagnosis.errorCode,
                            description: data.diagnosis.description || 'Reparación realizada'
                        } : undefined,
                        tasks: data.tasks?.slice(0, 3), // Limitar
                    });
                });

                setServices(servicesData);

                // 3. Obtener último técnico (King of the Hill)
                if (equipData.lastServiceTechId) {
                    const techRef = doc(db, 'users', equipData.lastServiceTechId);
                    const techSnap = await getDoc(techRef);

                    if (techSnap.exists()) {
                        const techData = techSnap.data();
                        setLastTech({
                            alias: techData.alias || 'Técnico',
                            rank: techData.rank || 'Técnico',
                            city: techData.city,
                        });
                    }
                }

            } catch (err: any) {
                console.error('Error loading QR data:', err);
                setError('Error al cargar los datos. Intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        if (hash) {
            loadData();
        }
    }, [hash]);

    // ============================================
    // LOADING STATE
    // ============================================
    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando historial...</p>
                </div>
            </main>
        );
    }

    // ============================================
    // ERROR STATE
    // ============================================
    if (error || !equipment) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">No encontrado</h1>
                    <p className="text-gray-500 mb-6">{error || 'Este código QR no está registrado.'}</p>
                    <a
                        href="https://mrfrio.app"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
                    >
                        Ir a Mr. Frío
                    </a>
                </div>
            </main>
        );
    }

    // ============================================
    // MAIN VIEW
    // ============================================
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header con estado */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-20">
                <div className="max-w-md mx-auto">
                    <p className="text-blue-200 text-sm mb-1">❄️ Mr. Frío</p>
                    <h1 className="text-2xl font-bold mb-4">Historial del Equipo</h1>

                    <StatusBadge status={getEquipmentStatus()} />
                </div>
            </header>

            {/* Equipment Info Card */}
            <div className="max-w-md mx-auto -mt-12 px-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center">
                            <span className="text-3xl">❄️</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{equipment.brand}</h2>
                            <p className="text-gray-500">{equipment.model} • {equipment.type}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                        <div>
                            <p className="text-gray-400 text-xs">Servicios registrados</p>
                            <p className="text-2xl font-bold text-blue-600">{services.length}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Último servicio</p>
                            <p className="text-lg font-bold text-gray-800">
                                {services.length > 0
                                    ? (services[0].date?.toDate?.() || new Date()).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
                                    : 'Sin registro'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Last Technician (King of the Hill) */}
                {lastTech && (
                    <div className="bg-white rounded-2xl p-4 shadow-lg mb-6 flex items-center gap-4">
                        <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                            <span className="text-xl">👨‍🔧</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-400">Último técnico</p>
                            <p className="font-bold text-gray-800">{lastTech.alias}</p>
                            <p className="text-xs text-gray-500">{lastTech.rank} • {lastTech.city}</p>
                        </div>
                        <a
                            href={`https://wa.me/52?text=Hola, vi tu perfil en Mr. Frío y necesito servicio para mi aire acondicionado.`}
                            className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
                        >
                            Contactar
                        </a>
                    </div>
                )}

                {/* Service History */}
                <h3 className="font-bold text-gray-800 mb-3">📋 Bitácora de Servicios</h3>

                {services.length > 0 ? (
                    <div className="space-y-3 mb-8">
                        {services.map(service => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-6 text-center text-gray-400 mb-8">
                        <p>Este equipo aún no tiene servicios registrados.</p>
                    </div>
                )}

                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center mb-8">
                    <h3 className="text-xl font-bold mb-2">¿Necesitas servicio?</h3>
                    <p className="text-blue-100 text-sm mb-4">
                        Encuentra técnicos verificados cerca de ti
                    </p>
                    <a
                        href="https://mrfrio.app/directorio"
                        className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold"
                    >
                        Buscar Técnicos
                    </a>
                </div>

                {/* Footer */}
                <footer className="text-center text-gray-400 text-sm pb-8">
                    <p>Información proporcionada por <strong>Mr. Frío</strong></p>
                    <p className="text-xs mt-1">Los datos son responsabilidad del técnico registrado.</p>
                </footer>
            </div>
        </main>
    );
}
