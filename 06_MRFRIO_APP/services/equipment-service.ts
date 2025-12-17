import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface EquipmentData {
    qrCode: string;              // Unique QR identifier
    clientId: string;            // Owner client
    brand: string;
    model: string;
    btu?: number;
    installDate?: any;           // Timestamp or Date
    location?: string;           // e.g., "Sala", "Recámara"
    technicianId: string;        // Original technician who linked QR
    lastServiceTechId?: string;  // King of the Hill - último técnico que dio servicio
    lastServiceDate?: any;       // Fecha del último servicio
    createdAt?: any;
}

/**
 * Lookup equipment by QR code
 */
export const getEquipmentByQrCode = async (qrCode: string): Promise<(EquipmentData & { id: string }) | null> => {
    try {
        const q = query(
            collection(db, 'equipments'),
            where('qrCode', '==', qrCode)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as EquipmentData & { id: string };
    } catch (e) {
        console.error('Error looking up equipment by QR:', e);
        return null;
    }
};

/**
 * Get equipment by Firestore document ID
 */
export const getEquipmentById = async (equipmentId: string): Promise<(EquipmentData & { id: string }) | null> => {
    try {
        const equipmentRef = doc(db, 'equipments', equipmentId);
        const equipmentSnap = await getDoc(equipmentRef);

        if (equipmentSnap.exists()) {
            return { id: equipmentSnap.id, ...equipmentSnap.data() } as EquipmentData & { id: string };
        }
        return null;
    } catch (e) {
        console.error('Error fetching equipment by ID:', e);
        return null;
    }
};

/**
 * Add new equipment to Firestore
 */
export const addEquipment = async (equipmentData: Omit<EquipmentData, 'createdAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, 'equipments'), {
            ...equipmentData,
            createdAt: serverTimestamp(),
        });
        console.log('Equipment created with ID:', docRef.id);
        return docRef.id;
    } catch (e) {
        console.error('Error adding equipment:', e);
        throw e;
    }
};

/**
 * Get all equipment for a specific client
 */
export const getEquipmentsByClient = async (clientId: string): Promise<(EquipmentData & { id: string })[]> => {
    try {
        const q = query(
            collection(db, 'equipments'),
            where('clientId', '==', clientId)
        );
        const querySnapshot = await getDocs(q);

        const equipments: (EquipmentData & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            equipments.push({ id: doc.id, ...doc.data() } as EquipmentData & { id: string });
        });

        return equipments;
    } catch (e) {
        console.error('Error fetching equipments by client:', e);
        return [];
    }
};

/**
 * Get all equipment for a specific technician
 */
export const getEquipmentsByTechnician = async (technicianId: string): Promise<(EquipmentData & { id: string })[]> => {
    try {
        const q = query(
            collection(db, 'equipments'),
            where('technicianId', '==', technicianId)
        );
        const querySnapshot = await getDocs(q);

        const equipments: (EquipmentData & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            equipments.push({ id: doc.id, ...doc.data() } as EquipmentData & { id: string });
        });

        return equipments;
    } catch (e) {
        console.error('Error fetching equipments by technician:', e);
        return [];
    }
};

// ============================================
// KING OF THE HILL - Regla del Último Técnico
// Según master_plan.md - Módulo 4 (Ecosistema QR)
// ============================================

/**
 * Actualiza el último técnico que dio servicio al equipo.
 * Esta es la "Regla de Oro" del sistema QR: el botón de WhatsApp
 * siempre enlaza al ÚLTIMO técnico que registró servicio.
 */
export const updateLastServiceTechnician = async (
    equipmentId: string,
    technicianId: string,
    technicianPhone: string,
    technicianAlias: string
): Promise<boolean> => {
    try {
        const equipmentRef = doc(db, 'equipments', equipmentId);
        await updateDoc(equipmentRef, {
            lastServiceTechId: technicianId,
            lastServiceTechPhone: technicianPhone,
            lastServiceTechAlias: technicianAlias,
            lastServiceDate: serverTimestamp(),
        });
        console.log(`King of the Hill updated: ${technicianAlias} is now the contact for equipment ${equipmentId}`);
        return true;
    } catch (e) {
        console.error('Error updating last service technician:', e);
        return false;
    }
};

// ============================================
// QR URL GENERATION
// ============================================

const QR_WEB_BASE_URL = process.env.EXPO_PUBLIC_QR_WEB_URL || 'https://qr.mrfrio.app';

/**
 * Genera la URL pública para el QR de un equipo
 */
export const getQrWebUrl = (equipmentId: string): string => {
    return `${QR_WEB_BASE_URL}/qr/${equipmentId}`;
};

/**
 * Genera el contenido para el código QR (para imprimir/descargar)
 */
export const generateQrContent = (equipmentId: string): {
    url: string;
    displayText: string;
} => {
    return {
        url: getQrWebUrl(equipmentId),
        displayText: `MR. FRÍO | Escanea para ver historial`,
    };
};

// ============================================
// TIMELINE FOR PUBLIC VIEW (Sanitized Data)
// ============================================

export interface PublicServiceRecord {
    id: string;
    date: Date;
    type: 'Instalación' | 'Mantenimiento' | 'Reparación';
    publicNotes?: string;
    technicianAlias: string;
    technicianBadge: 'Novato' | 'Técnico' | 'Pro';
}

/**
 * Obtiene el historial de servicios para la vista pública del QR.
 * Solo incluye datos sanitizados (sin precios, sin notas privadas).
 */
export const getPublicServiceTimeline = async (equipmentId: string): Promise<PublicServiceRecord[]> => {
    try {
        // Query services for this equipment
        const q = query(
            collection(db, 'services'),
            where('equipmentId', '==', equipmentId)
        );
        const snapshot = await getDocs(q);

        const timeline: PublicServiceRecord[] = [];

        for (const serviceDoc of snapshot.docs) {
            const data = serviceDoc.data();

            // Get technician info
            let techAlias = 'Técnico';
            let techBadge: 'Novato' | 'Técnico' | 'Pro' = 'Novato';

            if (data.technicianId) {
                const techRef = doc(db, 'users', data.technicianId);
                const techSnap = await getDoc(techRef);
                if (techSnap.exists()) {
                    const techData = techSnap.data();
                    techAlias = techData.alias || 'Técnico';
                    techBadge = techData.rank || 'Novato';
                }
            }

            timeline.push({
                id: serviceDoc.id,
                date: data.date?.toDate() || new Date(),
                type: data.type,
                publicNotes: data.publicNotes || data.notes?.substring(0, 100), // Truncate if needed
                technicianAlias: techAlias,
                technicianBadge: techBadge,
            });
        }

        // Sort by date descending
        return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (e) {
        console.error('Error fetching public timeline:', e);
        return [];
    }
};

/**
 * Obtiene el estado del equipo para el semáforo
 */
export const getEquipmentStatus = (lastServiceDate: Date | null): {
    status: 'ok' | 'warning' | 'critical';
    monthsSinceService: number;
} => {
    if (!lastServiceDate) {
        return { status: 'critical', monthsSinceService: 99 };
    }

    const now = new Date();
    const monthsSinceService = Math.floor(
        (now.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    if (monthsSinceService < 6) {
        return { status: 'ok', monthsSinceService };
    } else if (monthsSinceService < 12) {
        return { status: 'warning', monthsSinceService };
    } else {
        return { status: 'critical', monthsSinceService };
    }
};
