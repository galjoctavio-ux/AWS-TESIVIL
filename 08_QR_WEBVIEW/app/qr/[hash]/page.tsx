'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// ============================================
// TIPOS
// ============================================

interface ServiceRecord {
    id: string;
    date: Date;
    type: 'Instalación' | 'Mantenimiento' | 'Reparación';
    publicNotes?: string;
    technicianAlias: string;
    technicianBadge: 'Novato' | 'Técnico' | 'Pro';
}

interface EquipmentData {
    id: string;
    brand: string;
    model: string;
    capacity: string;
    type: string;
    installDate?: Date;
    lastServiceDate: Date;
    lastTechnicianId: string;
    lastTechnicianPhone: string;
    lastTechnicianAlias: string;
    lastTechnicianBadge: 'Novato' | 'Técnico' | 'Pro';
    services: ServiceRecord[];
}

// ============================================
// MOCK DATA (En producción viene de Firestore)
// ============================================

const mockEquipment: EquipmentData = {
    id: 'abc123xyz',
    brand: 'Mirage',
    model: 'Magnum 19 Inverter',
    capacity: '1.5 Toneladas',
    type: 'Minisplit Muro',
    installDate: new Date('2023-06-15'),
    lastServiceDate: new Date('2024-09-20'),
    lastTechnicianId: 'tech123',
    lastTechnicianPhone: '5551234567',
    lastTechnicianAlias: 'FrioTec2024',
    lastTechnicianBadge: 'Pro',
    services: [
        {
            id: 's1',
            date: new Date('2024-09-20'),
            type: 'Mantenimiento',
            publicNotes: 'Limpieza profunda completa, equipo funcionando óptimo.',
            technicianAlias: 'FrioTec2024',
            technicianBadge: 'Pro',
        },
        {
            id: 's2',
            date: new Date('2024-03-15'),
            type: 'Mantenimiento',
            publicNotes: 'Servicio preventivo de temporada.',
            technicianAlias: 'FrioTec2024',
            technicianBadge: 'Pro',
        },
        {
            id: 's3',
            date: new Date('2023-06-15'),
            type: 'Instalación',
            publicNotes: 'Instalación del equipo nuevo con kit completo.',
            technicianAlias: 'ACMaster',
            technicianBadge: 'Técnico',
        },
    ],
};

// ============================================
// HELPERS
// ============================================

const getStatusInfo = (lastServiceDate: Date) => {
    const now = new Date();
    const monthsSinceService = Math.floor((now.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    if (monthsSinceService < 6) {
        return {
            status: 'ok' as const,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            icon: '✅',
            title: 'Al Corriente',
            message: 'Último servicio hace menos de 6 meses',
        };
    } else if (monthsSinceService < 12) {
        return {
            status: 'warning' as const,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            icon: '⚠️',
            title: 'Mantenimiento Sugerido',
            message: 'Han pasado más de 6 meses desde el último servicio',
        };
    } else {
        return {
            status: 'critical' as const,
            color: 'bg-red-500',
            textColor: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: '🔴',
            title: 'Atención Requerida',
            message: 'Más de 1 año sin mantenimiento',
        };
    }
};

const getBadgeDisplay = (badge: 'Novato' | 'Técnico' | 'Pro') => {
    switch (badge) {
        case 'Pro':
            return { icon: '🥇', label: 'Especialista Certificado', color: 'bg-yellow-100 text-yellow-800' };
        case 'Técnico':
            return { icon: '🛡️', label: 'Técnico Profesional', color: 'bg-blue-100 text-blue-700' };
        default:
            return { icon: '✅', label: 'Miembro Verificado', color: 'bg-gray-100 text-gray-600' };
    }
};

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function QRPage() {
    const params = useParams();
    const hash = params.hash as string;

    const [equipment, setEquipment] = useState<EquipmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // TODO: Fetch real data from Firestore
        // const fetchEquipment = async () => {
        //   const equipmentRef = doc(db, 'equipments', hash);
        //   const snap = await getDoc(equipmentRef);
        //   if (snap.exists()) {
        //     setEquipment(snap.data() as EquipmentData);
        //   } else {
        //     setError('Equipo no encontrado');
        //   }
        //   setLoading(false);
        // };
        // fetchEquipment();

        // MOCK: Simulate loading
        setTimeout(() => {
            if (hash) {
                setEquipment(mockEquipment);
            } else {
                setError('Código QR inválido');
            }
            setLoading(false);
        }, 1000);
    }, [hash]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Cargando información...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !equipment) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <span className="text-6xl block mb-4">❄️</span>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Equipo No Encontrado</h1>
                    <p className="text-slate-500 mb-6">{error || 'Este código QR no está vinculado a ningún equipo.'}</p>
                    <a
                        href="https://mrfrio.app"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                    >
                        Ir a Mr. Frío
                    </a>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(equipment.lastServiceDate);
    const techBadge = getBadgeDisplay(equipment.lastTechnicianBadge);
    const whatsappUrl = `https://wa.me/52${equipment.lastTechnicianPhone}?text=Hola%2C%20escanee%20el%20QR%20de%20mi%20equipo%20${equipment.brand}%20${equipment.model}%20y%20me%20gustar%C3%ADa%20agendar%20un%20servicio.`;

    return (
        <div className="min-h-screen pb-32">
            {/* Header with Status */}
            <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-b px-6 py-8`}>
                <div className="max-w-lg mx-auto">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.color} text-white font-medium mb-4 animate-pulse-status`}>
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.title}</span>
                    </div>

                    {/* Equipment Info */}
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">{equipment.brand}</h1>
                    <p className="text-lg text-slate-600 mb-2">{equipment.model}</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm px-3 py-1 bg-white/80 rounded-full text-slate-600">{equipment.capacity}</span>
                        <span className="text-sm px-3 py-1 bg-white/80 rounded-full text-slate-600">{equipment.type}</span>
                    </div>

                    <p className={`text-sm mt-4 ${statusInfo.textColor}`}>{statusInfo.message}</p>
                </div>
            </div>

            {/* Service History */}
            <div className="px-6 py-6 max-w-lg mx-auto">
                <h2 className="text-lg font-bold text-slate-800 mb-4">📋 Historial de Servicios</h2>

                <div className="space-y-4">
                    {equipment.services.map((service, index) => {
                        const serviceBadge = getBadgeDisplay(service.technicianBadge);
                        return (
                            <div
                                key={service.id}
                                className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${service.type === 'Instalación' ? 'border-green-500' :
                                        service.type === 'Mantenimiento' ? 'border-blue-500' : 'border-orange-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${service.type === 'Instalación' ? 'bg-green-100 text-green-700' :
                                                service.type === 'Mantenimiento' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {service.type}
                                        </span>
                                        <p className="text-sm text-slate-500 mt-1">{formatDate(service.date)}</p>
                                    </div>
                                    {index === 0 && (
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Más reciente</span>
                                    )}
                                </div>

                                {service.publicNotes && (
                                    <p className="text-slate-600 text-sm mb-3">{service.publicNotes}</p>
                                )}

                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${serviceBadge.color}`}>
                                        {serviceBadge.icon} {serviceBadge.label}
                                    </span>
                                    <span className="text-xs text-slate-400">por {service.technicianAlias}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contact Button - Fixed at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
                <div className="max-w-lg mx-auto">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition shadow-lg"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contactar al Técnico
                    </a>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        {techBadge.icon} {equipment.lastTechnicianAlias} • {techBadge.label}
                    </p>
                </div>
            </div>

            {/* Acquisition Banner */}
            <div className="fixed bottom-24 left-0 right-0 px-4 pb-2">
                <div className="max-w-lg mx-auto">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">❄️</span>
                            <div className="flex-1">
                                <p className="text-white font-bold text-sm">¿Eres técnico de A/C?</p>
                                <p className="text-blue-100 text-xs">Organiza tus clientes con Mr. Frío - ¡Gratis!</p>
                            </div>
                            <a
                                href="https://mrfrio.app/download"
                                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition"
                            >
                                Descargar
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
