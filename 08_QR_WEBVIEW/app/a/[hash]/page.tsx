'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================
// TESIVIL QR "Hoja de Vida" Public View
// URL: https://qrclima.mx/qr/[token]
// ============================================

// ============================================
// SVG ICONS
// ============================================

const Icons = {
    snowflake: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07M12 6l-2 2m4 0l-2-2m-2 10l2-2m2 2l-2-2M6 12l2-2m0 4l-2-2m10 0l2 2m-2-4l2 2" />
        </svg>
    ),
    checkCircle: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    exclamationTriangle: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    exclamationCircle: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    calendar: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    wrench: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    sparkles: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
    bolt: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    clipboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    user: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    phone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    ),
    whatsapp: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    ),
    inbox: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    ),
    search: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    download: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    ),
    star: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    shield: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    badgeCheck: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
    crown: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
        </svg>
    ),
};

interface Equipment {
    id: string;
    token: string;
    brand: string;
    model: string;
    btu?: number;
    type?: string;
    location?: string;
    clientId?: string;
    technicianId?: string;
    lastServiceTechId?: string;
    lastServiceTechPhone?: string;
    lastServiceTechAlias?: string;
    lastServiceTechName?: string;        // Full name for display
    lastServiceTechDisplayName?: string; // Preferred display name (company or technician)
    lastServiceDate?: any;
    createdAt?: any;
    linkedAt?: any;
}

interface ServiceRecord {
    id: string;
    type: string;
    status: string;
    date: any;
    technicianId: string;
    publicNotes?: string;
    technicianName?: string;
    technicianAlias?: string;
    technicianBadge?: string;
    // PRO SERVICE DATA
    isPro?: boolean;
    proReadings?: {
        voltage?: number;
        amperage?: number;
        suctionPressure?: number;
        dischargePressure?: number;
        returnTemp?: number;
        supplyTemp?: number;
        ambientTemp?: number;
        deltaT?: number;
        gasType?: string;
    };
    proPhotos?: {
        before?: string[];
        after?: string[];
        equipment?: string[];
    };
    photos?: string[]; // Standard photos
}

interface TechnicianPublic {
    name?: string;    // Full name for display
    displayName?: string; // Preferred display name (company or technician)
    alias: string;
    rank: string;
    phone?: string;
    city?: string;
}

// ============================================
// HELPERS
// ============================================

const formatPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('52')) {
        return digits;
    }
    if (digits.length === 10) {
        return `52${digits}`;
    }
    return digits;
};

// ============================================
// COMPONENTS
// ============================================

function StatusBadge({ status, nextDate }: { status: 'ok' | 'warning' | 'critical'; nextDate?: string }) {
    const config = {
        ok: {
            bg: 'bg-gradient-to-r from-green-400 to-emerald-500',
            icon: Icons.checkCircle,
            label: 'Al día',
            description: 'Tu equipo está en óptimas condiciones'
        },
        warning: {
            bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
            icon: Icons.exclamationTriangle,
            label: 'Próximo mantenimiento',
            description: 'Agenda tu servicio pronto'
        },
        critical: {
            bg: 'bg-gradient-to-r from-red-500 to-rose-600',
            icon: Icons.exclamationCircle,
            label: 'Requiere atención',
            description: 'Tu equipo necesita servicio urgente'
        },
    };
    const c = config[status];

    return (
        <div className={`${c.bg} text-white px-5 py-4 rounded-2xl shadow-lg`}>
            <div className="flex items-center gap-3">
                <span className="opacity-90">{c.icon}</span>
                <div>
                    <p className="font-bold text-lg">{c.label}</p>
                    <p className="text-white/80 text-sm">{c.description}</p>
                </div>
            </div>
            {nextDate && status !== 'critical' && (
                <p className="mt-2 text-sm text-white/70 flex items-center gap-1">
                    {Icons.calendar} Próximo servicio: {nextDate}
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

    const typeConfig: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
        'Instalación': { icon: Icons.wrench, color: 'text-green-700', bg: 'bg-green-100' },
        'Mantenimiento': { icon: Icons.sparkles, color: 'text-blue-700', bg: 'bg-blue-100' },
        'Reparación': { icon: Icons.bolt, color: 'text-orange-700', bg: 'bg-orange-100' },
    };

    const tc = typeConfig[service.type] || { icon: Icons.clipboard, color: 'text-gray-700', bg: 'bg-gray-100' };

    const getBadgeIcon = (badge?: string) => {
        if (badge === 'Pro') return <span className="text-yellow-500">{Icons.star}</span>;
        if (badge === 'Técnico') return <span className="text-blue-500">{Icons.shield}</span>;
        return <span className="text-gray-500">{Icons.badgeCheck}</span>;
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className={`${tc.bg} ${tc.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                        {tc.icon}
                    </span>
                    <div>
                        <span className="font-bold text-gray-800">{service.type}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${service.status === 'Terminado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {service.status}
                        </span>
                    </div>
                </div>
                <span className="text-gray-400 text-sm">{formatDate(service.date)}</span>
            </div>
            {service.publicNotes && (
                <p className="text-sm text-gray-600 mt-2">{service.publicNotes}</p>
            )}
            {(service.technicianName || service.technicianAlias) && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <span className="text-gray-400">{Icons.user}</span>
                    Realizado por: <span className="font-medium">{service.technicianName || service.technicianAlias}</span>
                    {service.technicianBadge && getBadgeIcon(service.technicianBadge)}
                </p>
            )}
        </div>
    );
}

// ============================================
// PRO COMPONENTS
// ============================================

function ProMetricsCard({ readings }: { readings: ServiceRecord['proReadings'] }) {
    if (!readings) return null;

    const getStatusColor = (value: number | undefined, min: number, max: number) => {
        if (value === undefined || value === null) return 'text-gray-400';
        if (value >= min && value <= max) return 'text-green-600';
        if (value >= min * 0.8 && value <= max * 1.2) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusIcon = (value: number | undefined, min: number, max: number) => {
        if (value === undefined || value === null) return '';
        if (value >= min && value <= max) return '✓';
        if (value >= min * 0.8 && value <= max * 1.2) return '⚠';
        return '✗';
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 mb-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <p className="text-indigo-900 font-bold">Lecturas Técnicas</p>
                    <p className="text-indigo-600 text-xs">Servicio PRO verificado</p>
                </div>
            </div>

            {/* Delta T Highlight */}
            {readings.deltaT !== undefined && readings.deltaT !== null && (
                <div className={`bg-white rounded-xl p-4 mb-3 border ${readings.deltaT >= 8 && readings.deltaT <= 15 ? 'border-green-200' : 'border-yellow-200'}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-xs">Delta T (Δt)</p>
                            <p className={`text-2xl font-bold ${getStatusColor(readings.deltaT, 8, 15)}`}>
                                {readings.deltaT}°C {getStatusIcon(readings.deltaT, 8, 15)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-xs">Rango óptimo</p>
                            <p className="text-gray-600 text-sm">8°C - 15°C</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                {readings.voltage !== undefined && readings.voltage !== null && (
                    <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Voltaje</p>
                        <p className={`font-bold ${getStatusColor(readings.voltage, 200, 240)}`}>
                            {readings.voltage}V {getStatusIcon(readings.voltage, 200, 240)}
                        </p>
                    </div>
                )}
                {readings.amperage !== undefined && readings.amperage !== null && (
                    <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Amperaje</p>
                        <p className={`font-bold ${getStatusColor(readings.amperage, 3, 15)}`}>
                            {readings.amperage}A {getStatusIcon(readings.amperage, 3, 15)}
                        </p>
                    </div>
                )}
                {readings.suctionPressure !== undefined && readings.suctionPressure !== null && (
                    <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Presión Succión</p>
                        <p className="font-bold text-gray-800">{readings.suctionPressure} PSI</p>
                    </div>
                )}
                {readings.dischargePressure !== undefined && readings.dischargePressure !== null && (
                    <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Presión Descarga</p>
                        <p className="font-bold text-gray-800">{readings.dischargePressure} PSI</p>
                    </div>
                )}
            </div>

            {/* Gas Type Badge */}
            {readings.gasType && (
                <div className="mt-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        Gas: {readings.gasType}
                    </span>
                    {readings.ambientTemp !== undefined && readings.ambientTemp !== null && (
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                            Ambiente: {readings.ambientTemp}°C
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

function ProPhotosGallery({ photos, proPhotos }: { photos?: string[]; proPhotos?: ServiceRecord['proPhotos'] }) {
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    const categories = [
        { label: '📸 Antes', photos: proPhotos?.before || [] },
        { label: '✅ Después', photos: proPhotos?.after || [] },
        { label: '🔧 Placa/Equipo', photos: proPhotos?.equipment || [] },
        { label: '📷 Otras', photos: photos || [] },
    ].filter(cat => cat.photos.length > 0);

    if (categories.length === 0) return null;

    return (
        <>
            {/* Fullscreen Modal */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setFullscreenImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-3xl font-bold"
                        onClick={() => setFullscreenImage(null)}
                    >
                        ✕
                    </button>
                    <img
                        src={fullscreenImage}
                        alt="Foto ampliada"
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            )}

            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">📷 Evidencia fotográfica</p>
                {categories.map((category, catIdx) => (
                    <div key={catIdx} className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">{category.label}</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {category.photos.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    alt={`${category.label} ${idx + 1}`}
                                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                                    onClick={() => setFullscreenImage(url)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

// Simple line chart for Delta T history using SVG
function MetricsHistoryChart({ services }: { services: ServiceRecord[] }) {
    // Filter services with PRO readings that have deltaT
    const proServices = services
        .filter(s => s.isPro && s.proReadings?.deltaT)
        .reverse(); // Oldest first for chart

    if (proServices.length < 2) return null; // Need at least 2 data points

    const deltaTValues = proServices.map(s => s.proReadings!.deltaT!);
    const maxValue = Math.max(...deltaTValues, 15);
    const minValue = Math.min(...deltaTValues, 8);
    const range = maxValue - minValue || 1;

    const width = 300;
    const height = 120;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Generate points
    const points = proServices.map((service, idx) => {
        const x = padding + (idx / (proServices.length - 1)) * chartWidth;
        const normalizedY = (service.proReadings!.deltaT! - minValue) / range;
        const y = height - padding - normalizedY * chartHeight;
        return { x, y, value: service.proReadings!.deltaT!, date: service.date };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <div>
                    <p className="text-gray-800 font-bold text-sm">Evolución de Δt</p>
                    <p className="text-gray-400 text-xs">{proServices.length} servicios PRO registrados</p>
                </div>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
                {/* Optimal range background */}
                <rect
                    x={padding}
                    y={height - padding - ((15 - minValue) / range) * chartHeight}
                    width={chartWidth}
                    height={((15 - 8) / range) * chartHeight}
                    fill="#dcfce7"
                    opacity="0.5"
                />

                {/* Grid lines */}
                {[8, 12, 15].map(val => {
                    const y = height - padding - ((val - minValue) / range) * chartHeight;
                    return (
                        <g key={val}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4" />
                            <text x={padding - 5} y={y + 3} fontSize="10" fill="#9ca3af" textAnchor="end">{val}°</text>
                        </g>
                    );
                })}

                {/* Line */}
                <path d={pathData} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />

                {/* Data points */}
                {points.map((p, idx) => (
                    <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" />
                        <circle cx={p.x} cy={p.y} r="2" fill="white" />
                    </g>
                ))}

                {/* X-axis labels */}
                {proServices.length <= 5 && points.map((p, idx) => (
                    <text key={idx} x={p.x} y={height - 5} fontSize="8" fill="#9ca3af" textAnchor="middle">
                        {formatDate(proServices[idx].date)}
                    </text>
                ))}
            </svg>

            <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>🟢 Rango óptimo: 8°C - 15°C</span>
                <span>Último: <strong className="text-indigo-600">{deltaTValues[deltaTValues.length - 1]}°C</strong></span>
            </div>
        </div>
    );
}

// PDF Certificate Download Button - Generates Professional Certificate
function DownloadCertificateButton({ equipment, services, lastTech }: {
    equipment: Equipment | null;
    services: ServiceRecord[];
    lastTech: TechnicianPublic | null;
}) {
    const hasProServices = services.some(s => s.isPro);
    if (!hasProServices) return null;

    const latestProService = services.find(s => s.isPro);

    // Generate Delta T chart data
    const proServicesForChart = services
        .filter(s => s.isPro && s.proReadings?.deltaT)
        .slice(0, 10) // Last 10 max
        .reverse(); // Oldest first

    const generateDeltaTChartSVG = (): string => {
        if (proServicesForChart.length < 2) return '';

        const deltaTValues = proServicesForChart.map(s => s.proReadings!.deltaT!);
        const maxValue = Math.max(...deltaTValues, 15);
        const minValue = Math.min(...deltaTValues, 8);
        const range = maxValue - minValue || 1;

        const width = 400;
        const height = 150;
        const padding = 30;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Generate points
        const points = proServicesForChart.map((service, idx) => {
            const x = padding + (idx / (proServicesForChart.length - 1)) * chartWidth;
            const normalizedY = (service.proReadings!.deltaT! - minValue) / range;
            const y = height - padding - normalizedY * chartHeight;
            return { x, y, value: service.proReadings!.deltaT! };
        });

        // Create path
        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        // Create gradient area
        const areaD = `M ${points[0].x} ${height - padding} ${pathD} L ${points[points.length - 1].x} ${height - padding} Z`;

        return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
            <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0.05" />
                </linearGradient>
            </defs>
            <!-- Grid lines -->
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1"/>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1"/>
            <!-- Optimal zone (8-15°C) -->
            <rect x="${padding}" y="${height - padding - ((15 - minValue) / range) * chartHeight}" width="${chartWidth}" height="${((15 - 8) / range) * chartHeight}" fill="#10b981" fill-opacity="0.1" />
            <!-- Area fill -->
            <path d="${areaD}" fill="url(#chartGradient)" />
            <!-- Line -->
            <path d="${pathD}" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Points -->
            ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#6366f1" stroke="white" stroke-width="2"/>`).join('\n')}
            <!-- Labels -->
            <text x="${width / 2}" y="${height - 5}" text-anchor="middle" font-size="10" fill="#9ca3af">Historial de Servicios →</text>
            <text x="5" y="${padding + 5}" font-size="10" fill="#9ca3af">${maxValue.toFixed(0)}°</text>
            <text x="5" y="${height - padding}" font-size="10" fill="#9ca3af">${minValue.toFixed(0)}°</text>
        </svg>`;
    };

    const handleDownloadCertificate = () => {
        if (!equipment || !latestProService) return;

        const serviceDate = latestProService.date?.toDate
            ? latestProService.date.toDate().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('es-MX');

        const readings = latestProService.proReadings;
        const deltaTChartSVG = generateDeltaTChartSVG();

        const certificateHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificado de Servicio PRO - ${equipment.brand} ${equipment.model}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @page { margin: 20px; }
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1f2937;
            line-height: 1.5;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { font-size: 20px; margin-bottom: 5px; }
        .header .subtitle { opacity: 0.9; font-size: 12px; }
        .badge {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .section {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .section-title {
            color: #4f46e5;
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        .two-cols { display: flex; gap: 20px; }
        .col { flex: 1; }
        .info-row { margin-bottom: 8px; font-size: 13px; }
        .info-label { color: #6b7280; font-size: 11px; }
        .info-value { font-weight: 600; color: #1f2937; }
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .metric-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
        }
        .metric-value { font-size: 20px; font-weight: bold; color: #4f46e5; }
        .metric-label { font-size: 10px; color: #6b7280; }
        .delta-highlight {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        .delta-highlight .metric-value { color: white; }
        .delta-highlight .metric-label { color: rgba(255,255,255,0.9); }
        .technician-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 10px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .tech-avatar {
            width: 50px;
            height: 50px;
            background: #f59e0b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #9ca3af;
            font-size: 11px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
        .qr-section {
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
            border-radius: 10px;
        }
        .print-btn {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            margin: 20px auto;
            display: block;
        }
        @media print {
            .print-btn { display: none; }
            body { padding: 10px; }
        }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">📄 Imprimir / Guardar PDF</button>
    
    <div class="header">
        <div>
            <h1>Certificado de Servicio PRO</h1>
            <div class="subtitle">Hoja de Vida del Equipo - ${serviceDate}</div>
        </div>
        <div class="badge">✓ SERVICIO VERIFICADO</div>
    </div>

    <div class="two-cols">
        <div class="col">
            <div class="section">
                <div class="section-title">🔧 Equipo</div>
                <div class="info-row">
                    <div class="info-label">Marca / Modelo</div>
                    <div class="info-value">${equipment.brand} ${equipment.model}</div>
                </div>
                ${equipment.btu ? `
                <div class="info-row">
                    <div class="info-label">Capacidad</div>
                    <div class="info-value">${equipment.btu.toLocaleString()} BTU</div>
                </div>` : ''}
                <div class="info-row">
                    <div class="info-label">Tipo de Servicio</div>
                    <div class="info-value">${latestProService.type}</div>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="section">
                <div class="section-title">📊 Historial</div>
                <div class="info-row">
                    <div class="info-label">Total de Servicios</div>
                    <div class="info-value">${services.length}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Servicios PRO</div>
                    <div class="info-value">${services.filter(s => s.isPro).length}</div>
                </div>
            </div>
        </div>
    </div>

    ${readings ? `
    <div class="section">
        <div class="section-title">📈 Lecturas Técnicas PRO</div>
        <div class="metrics-grid">
            ${readings.deltaT ? `
            <div class="metric-card delta-highlight">
                <div class="metric-value">${readings.deltaT.toFixed(1)}°C</div>
                <div class="metric-label">Delta T</div>
            </div>` : ''}
            ${readings.voltage ? `
            <div class="metric-card">
                <div class="metric-value">${readings.voltage}V</div>
                <div class="metric-label">Voltaje</div>
            </div>` : ''}
            ${readings.amperage ? `
            <div class="metric-card">
                <div class="metric-value">${readings.amperage}A</div>
                <div class="metric-label">Amperaje</div>
            </div>` : ''}
            ${readings.suctionPressure ? `
            <div class="metric-card">
                <div class="metric-value">${readings.suctionPressure}</div>
                <div class="metric-label">Presión Succión</div>
            </div>` : ''}
            ${readings.dischargePressure ? `
            <div class="metric-card">
                <div class="metric-value">${readings.dischargePressure}</div>
                <div class="metric-label">Presión Descarga</div>
            </div>` : ''}
            ${readings.gasType ? `
            <div class="metric-card">
                <div class="metric-value">${readings.gasType}</div>
                <div class="metric-label">Gas Refrigerante</div>
            </div>` : ''}
        </div>
    </div>` : ''}

    ${deltaTChartSVG ? `
    <div class="section">
        <div class="section-title">📊 Evolución del Rendimiento (Delta T)</div>
        <div style="text-align: center; padding: 10px 0;">
            ${deltaTChartSVG}
        </div>
        <div style="text-align: center; font-size: 11px; color: #6b7280; margin-top: 10px;">
            🟢 Zona óptima: 8°C - 15°C | Muestra los últimos servicios PRO
        </div>
    </div>` : ''}

    ${lastTech ? `
    <div class="technician-box">
        <div class="tech-avatar">👨‍🔧</div>
        <div>
            <div style="font-weight: bold;">${lastTech.displayName || lastTech.name || lastTech.alias}</div>
            <div style="font-size: 12px; color: #92400e;">Técnico Certificado</div>
        </div>
    </div>` : ''}

    <div class="qr-section">
        <div style="font-weight: bold; color: #4338ca; margin-bottom: 8px;">📱 Historial Digital Verificable</div>
        <div style="font-size: 12px; color: #6b7280;">
            Este certificado corresponde a datos almacenados digitalmente.
            <br/>Escanee el QR del equipo para acceder al historial completo actualizado.
        </div>
    </div>

    <div class="footer">
        <div>Certificado generado el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}</div>
        <div style="margin-top: 5px;">Powered by <strong>QRclima</strong> | qr.tesivil.com</div>
    </div>
</body>
</html>`;

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(certificateHTML);
            printWindow.document.close();
        }
    };

    return (
        <button
            onClick={handleDownloadCertificate}
            className="no-print flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-5 rounded-xl font-bold shadow-lg hover:shadow-xl transition w-full mb-4"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Certificado PRO
        </button>
    );
}

// ============================================
// MAIN PAGE
// ============================================

export default function QRPublicView() {
    const params = useParams();
    const hash = (params.hash as string)?.toLowerCase();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [services, setServices] = useState<ServiceRecord[]>([]);
    const [lastTech, setLastTech] = useState<TechnicianPublic | null>(null);

    const getEquipmentStatus = (): { status: 'ok' | 'warning' | 'critical'; nextDate: string } => {
        if (equipment?.lastServiceDate) {
            const lastDate = equipment.lastServiceDate.toDate
                ? equipment.lastServiceDate.toDate()
                : new Date(equipment.lastServiceDate);
            const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

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
        }

        if (services.length === 0) {
            return { status: 'warning', nextDate: 'Sin servicios registrados' };
        }

        const lastService = services[0];
        if (!lastService.date) {
            return { status: 'warning', nextDate: 'Fecha no disponible' };
        }

        const lastDate = lastService.date.toDate ? lastService.date.toDate() : new Date(lastService.date);
        const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

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

                const equipQuery = query(
                    collection(db, 'equipments'),
                    where('token', '==', hash)
                );
                const equipSnapshot = await getDocs(equipQuery);

                let equipDoc;
                let equipData: Equipment;

                if (!equipSnapshot.empty) {
                    equipDoc = equipSnapshot.docs[0];
                    equipData = { id: equipDoc.id, ...equipDoc.data() } as Equipment;
                } else {
                    const directRef = doc(db, 'equipments', hash);
                    const directSnap = await getDoc(directRef);

                    if (directSnap.exists()) {
                        equipDoc = directSnap;
                        equipData = { id: directSnap.id, ...directSnap.data() } as Equipment;
                    } else {
                        setError('Equipo no encontrado. Verifica el código QR.');
                        return;
                    }
                }

                setEquipment(equipData);

                const servicesQuery = query(
                    collection(db, 'services'),
                    where('equipmentId', '==', equipDoc.id),
                    orderBy('date', 'desc'),
                    limit(10)
                );

                try {
                    const servicesSnap = await getDocs(servicesQuery);
                    const servicesData: ServiceRecord[] = [];

                    for (const docSnap of servicesSnap.docs) {
                        const data = docSnap.data();

                        // Use technicianAlias from service if available, don't fetch from users
                        servicesData.push({
                            id: docSnap.id,
                            type: data.type,
                            status: data.status,
                            date: data.date,
                            technicianId: data.technicianId,
                            publicNotes: data.publicNotes || (data.notes ? data.notes.substring(0, 150) : undefined),
                            technicianName: data.technicianName,
                            technicianAlias: data.technicianAlias || 'Técnico',
                            technicianBadge: data.technicianRank || 'Técnico',
                            // PRO DATA
                            isPro: data.isPro || false,
                            proReadings: data.proReadings || undefined,
                            proPhotos: data.proPhotos || undefined,
                            photos: data.photos || undefined,
                        });
                    }

                    setServices(servicesData);
                } catch (e) {
                    console.warn('Could not fetch services:', e);
                    // Services might be blocked by permissions - that's OK
                }

                // Use technician data stored directly in equipment document
                // BUT also try to read the technician's profile for real-time display name preference
                if (equipData.lastServiceTechId || equipData.lastServiceTechAlias || equipData.lastServiceTechName) {
                    let displayName = equipData.lastServiceTechDisplayName || equipData.lastServiceTechName;

                    // Try to read technician profile for real-time qrDisplayName preference
                    if (equipData.lastServiceTechId) {
                        try {
                            const techRef = doc(db, 'users', equipData.lastServiceTechId);
                            const techSnap = await getDoc(techRef);
                            if (techSnap.exists()) {
                                const techProfile = techSnap.data();
                                // Apply real-time display name preference
                                if (techProfile.qrDisplayName === 'company' && techProfile.businessName) {
                                    displayName = techProfile.businessName;
                                } else if (techProfile.qrDisplayName === 'technician' || !techProfile.qrDisplayName) {
                                    displayName = techProfile.fullName || techProfile.alias || equipData.lastServiceTechName;
                                }
                                console.log('Real-time tech profile loaded:', {
                                    qrDisplayName: techProfile.qrDisplayName,
                                    businessName: techProfile.businessName,
                                    fullName: techProfile.fullName,
                                    resolvedDisplayName: displayName
                                });
                            }
                        } catch (techErr) {
                            console.warn('Could not load tech profile (using fallback):', techErr);
                            // Fallback to stored values - this is OK
                        }
                    }

                    setLastTech({
                        name: equipData.lastServiceTechName,
                        displayName: displayName,
                        alias: equipData.lastServiceTechAlias || 'Técnico',
                        rank: 'Técnico', // Default rank since we can't read from users
                        phone: equipData.lastServiceTechPhone,
                        city: undefined,
                    });
                    console.log('Technician data loaded:', {
                        name: equipData.lastServiceTechName,
                        displayName: displayName,
                        alias: equipData.lastServiceTechAlias,
                        phone: equipData.lastServiceTechPhone
                    });
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

    // Loading state
    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="absolute inset-0 flex items-center justify-center text-blue-600">
                            {Icons.snowflake}
                        </span>
                    </div>
                    <p className="text-gray-500">Cargando historial...</p>
                </div>
            </main>
        );
    }

    // Error state
    if (error || !equipment) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md text-center">
                    <div className="text-blue-300 mb-4 flex justify-center">{Icons.search}</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Equipo no encontrado</h1>
                    <p className="text-gray-500 mb-6">{error || 'Este código QR no está registrado en el sistema.'}</p>
                    <a
                        href="https://qrclima.tesivil.com"
                        className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition"
                    >
                        Ir a QRclima
                    </a>
                </div>
            </main>
        );
    }

    const statusInfo = getEquipmentStatus();
    const capacity = equipment.btu ? `${(equipment.btu / 12000).toFixed(1)} Tons` : null;

    const phoneFormatted = lastTech?.phone ? formatPhone(lastTech.phone) : null;
    const whatsappUrl = phoneFormatted
        ? `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(
            `Hola ${lastTech?.alias || 'Técnico'}, escaneé el QR de mi equipo ${equipment.brand} ${equipment.model} y necesito un servicio.`
        )}`
        : null;
    const callUrl = phoneFormatted ? `tel:+${phoneFormatted}` : null;

    const getRankDisplay = (rank: string) => {
        if (rank === 'Pro') return { icon: Icons.star, label: 'Especialista Certificado', color: 'text-yellow-500' };
        if (rank === 'Técnico') return { icon: Icons.shield, label: 'Técnico Profesional', color: 'text-blue-500' };
        return { icon: Icons.badgeCheck, label: 'Miembro Verificado', color: 'text-gray-500' };
    };

    // Main view
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 pb-32 print-certificate">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white p-6 pb-28">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-blue-200 text-sm">
                            <span className="text-white">{Icons.snowflake}</span>
                            <span className="font-bold">QRclima</span>
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider">
                            {hash}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold">Hoja de Vida del Equipo</h1>
                    <p className="text-blue-200 text-sm mt-1">Historial de servicios verificado</p>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-md mx-auto -mt-20 px-4">
                {/* Equipment Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-16 h-16 rounded-xl flex items-center justify-center shadow-inner text-blue-600">
                            {Icons.snowflake}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{equipment.brand}</h2>
                            <p className="text-gray-500">{equipment.model}</p>
                            <div className="flex gap-2 mt-1">
                                {capacity && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                        {capacity}
                                    </span>
                                )}
                                {equipment.type && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                        {equipment.type}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <StatusBadge status={statusInfo.status} nextDate={statusInfo.nextDate} />

                    <div className="grid grid-cols-2 gap-4 mt-5 bg-gray-50 rounded-xl p-4">
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

                {/* Download Certificate Button (PRO only) */}
                <DownloadCertificateButton equipment={equipment} services={services} lastTech={lastTech} />

                {/* Technician Contact Card */}
                {lastTech && (
                    <div className="bg-white rounded-2xl p-5 shadow-xl mb-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                            <span className="text-yellow-500">{Icons.crown}</span> Tu técnico de confianza
                        </p>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 w-14 h-14 rounded-full flex items-center justify-center shadow-inner text-orange-500">
                                {Icons.user}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 text-lg">{lastTech.displayName || lastTech.name || lastTech.alias}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <span className={getRankDisplay(lastTech.rank).color}>
                                        {getRankDisplay(lastTech.rank).icon}
                                    </span>
                                    {getRankDisplay(lastTech.rank).label}
                                    {lastTech.city ? ` • ${lastTech.city}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Only show contact buttons if phone is available */}
                        {phoneFormatted ? (
                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={whatsappUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold transition shadow-lg shadow-green-500/30"
                                >
                                    {Icons.whatsapp}
                                    <span>WhatsApp</span>
                                </a>

                                <a
                                    href={callUrl!}
                                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold transition shadow-lg shadow-blue-500/30"
                                >
                                    {Icons.phone}
                                    <span>Llamar</span>
                                </a>
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 text-sm">
                                Contacta a tu técnico para solicitar servicio
                            </p>
                        )}
                    </div>
                )}

                {/* Service History */}
                <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">{Icons.clipboard}</span>
                        <span>Bitácora de Servicios</span>
                        {services.some(s => s.isPro) && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">PRO</span>
                        )}
                    </h3>

                    {/* PRO Insights - Show metrics from latest PRO service */}
                    {(() => {
                        const latestProService = services.find(s => s.isPro && s.proReadings);
                        if (latestProService?.proReadings) {
                            return (
                                <ProMetricsCard readings={latestProService.proReadings} />
                            );
                        }
                        return null;
                    })()}

                    {/* PRO Historical Chart - Show Delta T evolution */}
                    <MetricsHistoryChart services={services} />

                    {services.length > 0 ? (
                        <div className="space-y-3">
                            {services.map(service => (
                                <div key={service.id}>
                                    <ServiceCard service={service} />
                                    {/* Show photos if available */}
                                    {(service.photos?.length || service.proPhotos) && (
                                        <div className="mt-2 ml-4">
                                            <ProPhotosGallery photos={service.photos} proPhotos={service.proPhotos} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-6 text-center">
                            <span className="text-gray-300 mb-3 block">{Icons.inbox}</span>
                            <p className="text-gray-500">Este equipo aún no tiene servicios registrados en el sistema.</p>
                            <p className="text-xs text-gray-400 mt-2">Los servicios aparecerán aquí cuando el técnico los registre.</p>
                        </div>
                    )}
                </div>

                {/* Download App CTA */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center shadow-xl">
                    <div className="text-white/80 mb-3">{Icons.snowflake}</div>
                    <h3 className="text-xl font-bold mb-2">¿Eres técnico de A/C?</h3>
                    <p className="text-blue-100 text-sm mb-4">
                        Organiza tus clientes, genera QRs profesionales y haz crecer tu negocio
                    </p>
                    <a
                        href="https://qrclima.tesivil.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
                    >
                        {Icons.download}
                        Descargar App Gratis
                    </a>
                </div>

                {/* Footer */}
                <footer className="text-center text-gray-400 text-sm mt-8 pb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span>Powered by</span>
                        <span className="font-bold text-blue-600">QRclima</span>
                    </div>
                    <p className="text-xs">La bitácora digital para equipos de climatización</p>
                </footer>
            </div>
        </main>
    );
}
