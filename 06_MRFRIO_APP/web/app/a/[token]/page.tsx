'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================
// TESIVIL QR "Hoja de Vida" Public View
// URL: https://qr.tesivil.com/a/[token]
// ============================================

interface Equipment {
    id: string;
    token: string;
    brand: string;
    model: string;
    btu?: number;
    location?: string;
    lastServiceTechId?: string;
    lastServiceTechPhone?: string;
    lastServiceTechAlias?: string;
    lastServiceDate?: any;
    createdAt?: any;
}

interface ServiceRecord {
    id: string;
    type: string;
    status: string;
    date: any;
    technicianId: string;
    publicNotes?: string;
}

interface TechnicianPublic {
    alias: string;
    rank: string;
    phone?: string;
    city?: string;
}

// ============================================
// COMPONENTS
// ============================================

function StatusBadge({ status, nextDate }: { status: 'ok' | 'warning' | 'critical'; nextDate?: string }) {
    const config = {
        ok: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: '✅', label: 'Al día' },
        warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: '⚠️', label: 'Próximo mantenimiento' },
        critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: '🔴', label: 'Requiere atención' },
    };
    const c = config[status];

    return (
        <div className={`${c.bg} ${c.text} border ${c.border} px-4 py-3 rounded-xl`}>
            <div className="flex items-center gap-2 font-bold">
                <span>{c.icon}</span>
                <span>{c.label}</span>
            </div>
            {nextDate && (
                <p className="text-sm mt-1 opacity-80">
                    📅 Próximo servicio: {nextDate}
                </p>
            )}
        </div>
    );
}

function ServiceCard({ service }: { service: ServiceRecord }) {
    const formatDate = (date: any) => {
        if (!date) return 'Sin fecha';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const typeIcons: Record<string, string> = {
        'Instalación': '🔧',
        'Mantenimiento': '🧹',
        'Reparación': '⚡',
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span>{typeIcons[service.type] || '📋'}</span>
                    <span className="font-bold text-gray-800">{service.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${service.status === 'Terminado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {service.status}
                    </span>
                </div>
                <span className="text-gray-400 text-sm">{formatDate(service.date)}</span>
            </div>
            {service.publicNotes && (
                <p className="text-sm text-gray-600">{service.publicNotes}</p>
            )}
        </div>
    );
}

// ============================================
// MAIN PAGE
// ============================================

export default function QRPublicView() {
    const params = useParams();
    const token = (params.token as string)?.toLowerCase();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [services, setServices] = useState<ServiceRecord[]>([]);
    const [lastTech, setLastTech] = useState<TechnicianPublic | null>(null);

    const getEquipmentStatus = (): { status: 'ok' | 'warning' | 'critical'; nextDate: string } => {
        if (services.length === 0) {
            return { status: 'warning', nextDate: 'No hay servicios registrados' };
        }

        const lastService = services[0];
        if (!lastService.date) {
            return { status: 'warning', nextDate: 'Fecha no disponible' };
        }

        const lastDate = lastService.date.toDate ? lastService.date.toDate() : new Date(lastService.date);
        const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate next maintenance date (6 months from last service)
        const nextMaintenanceDate = new Date(lastDate);
        nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 6);
        const nextDateStr = nextMaintenanceDate.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        if (daysSince > 365) return { status: 'critical', nextDate: 'Mantenimiento urgente' };
        if (daysSince > 180) return { status: 'warning', nextDate: nextDateStr };
        return { status: 'ok', nextDate: nextDateStr };
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // 1. Search equipment by token
                const equipQuery = query(
                    collection(db, 'equipments'),
                    where('token', '==', token)
                );
                const equipSnapshot = await getDocs(equipQuery);

                if (equipSnapshot.empty) {
                    setError('Equipo no encontrado. Verifica el código QR.');
                    return;
                }

                const equipDoc = equipSnapshot.docs[0];
                const equipData = { id: equipDoc.id, ...equipDoc.data() } as Equipment;
                setEquipment(equipData);

                // 2. Get service history (sanitized)
                const servicesQuery = query(
                    collection(db, 'services'),
                    where('equipmentId', '==', equipDoc.id),
                    orderBy('date', 'desc'),
                    limit(10)
                );

                const servicesSnap = await getDocs(servicesQuery);
                const servicesData: ServiceRecord[] = [];

                servicesSnap.forEach(docSnap => {
                    const data = docSnap.data();
                    servicesData.push({
                        id: docSnap.id,
                        type: data.type,
                        status: data.status,
                        date: data.date,
                        technicianId: data.technicianId,
                        publicNotes: data.publicNotes || (data.notes ? data.notes.substring(0, 100) : undefined),
                    });
                });

                setServices(servicesData);

                // 3. Get last technician info (King of the Hill)
                if (equipData.lastServiceTechId) {
                    const techRef = doc(db, 'users', equipData.lastServiceTechId);
                    const techSnap = await getDoc(techRef);

                    if (techSnap.exists()) {
                        const techData = techSnap.data();
                        setLastTech({
                            alias: equipData.lastServiceTechAlias || techData.alias || 'Técnico',
                            rank: techData.rank || 'Técnico',
                            phone: equipData.lastServiceTechPhone || techData.phone,
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

        if (token) {
            loadData();
        }
    }, [token]);

    // Loading state
    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando historial...</p>
                </div>
            </main>
        );
    }

    // Error state
    if (error || !equipment) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">No encontrado</h1>
                    <p className="text-gray-500 mb-6">{error || 'Este código QR no está registrado.'}</p>
                    <a
                        href="https://tesivil.com"
                        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                        Ir a TESIVIL
                    </a>
                </div>
            </main>
        );
    }

    const statusInfo = getEquipmentStatus();

    // Main view
    return (
        <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 pb-24">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-indigo-200 text-sm mb-2">
                        <span>❄️</span>
                        <span>TESIVIL</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
                            {token?.toUpperCase()}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold">Hoja de Vida del Equipo</h1>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-md mx-auto -mt-16 px-4 pb-8">
                {/* Equipment Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center">
                            <span className="text-3xl">❄️</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{equipment.brand}</h2>
                            <p className="text-gray-500">{equipment.model}</p>
                            {equipment.btu && (
                                <p className="text-indigo-600 text-sm font-bold">
                                    {equipment.btu.toLocaleString()} BTU
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <StatusBadge status={statusInfo.status} nextDate={statusInfo.nextDate} />

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 rounded-xl p-4">
                        <div>
                            <p className="text-gray-400 text-xs">Servicios registrados</p>
                            <p className="text-2xl font-bold text-indigo-600">{services.length}</p>
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

                {/* WhatsApp Contact - King of the Hill */}
                {lastTech && (
                    <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                                <span className="text-xl">👨‍🔧</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Tu técnico de confianza</p>
                                <p className="font-bold text-gray-800">{lastTech.alias}</p>
                                <p className="text-xs text-gray-500">{lastTech.rank} {lastTech.city ? `• ${lastTech.city}` : ''}</p>
                            </div>
                            {lastTech.phone && (
                                <a
                                    href={`https://wa.me/${lastTech.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                        `Hola ${lastTech.alias}, escaneé el QR de mi equipo ${equipment.brand} ${equipment.model} y necesito servicio.`
                                    )}`}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2"
                                >
                                    <span>📱</span>
                                    <span>Contactar</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Service History */}
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>📋</span>
                    <span>Bitácora de Servicios</span>
                </h3>

                {services.length > 0 ? (
                    <div className="space-y-3 mb-6">
                        {services.map(service => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-6 text-center text-gray-400 mb-6">
                        <p>Este equipo aún no tiene servicios registrados.</p>
                    </div>
                )}

                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">¿Eres técnico?</h3>
                    <p className="text-indigo-100 text-sm mb-4">
                        Profesionaliza tu servicio con TESIVIL
                    </p>
                    <a
                        href="https://tesivil.com"
                        className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
                    >
                        Conocer más
                    </a>
                </div>

                {/* Footer */}
                <footer className="text-center text-gray-400 text-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span>Powered by</span>
                        <span className="font-bold text-indigo-600">TESIVIL</span>
                    </div>
                    <p className="text-xs">Tecnología para expertos</p>
                </footer>
            </div>
        </main>
    );
}
