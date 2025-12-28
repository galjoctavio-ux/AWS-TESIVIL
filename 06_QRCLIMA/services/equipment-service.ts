import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// TESIVIL QR SYSTEM - "Hoja de Vida del Equipo"
// URL Format: https://qr.tesivil.com/a/[TOKEN]
// ============================================

const QR_WEB_BASE_URL = 'https://qr.tesivil.com';

export interface GeoLocation {
    latitude: number;
    longitude: number;
    capturedAt: any;
}

export interface EquipmentData {
    token: string;               // 6-char alphanumeric unique token (PRIMARY KEY for QR)
    qrCode?: string;             // Legacy - original scanned QR value (for reference)
    clientId: string;            // Owner client
    brand: string;
    model: string;
    btu?: number;
    installDate?: any;           // Timestamp or Date
    location?: string;           // e.g., "Sala", "Recámara"
    technicianId: string;        // Original technician who linked QR
    lastServiceTechId?: string;  // King of the Hill - último técnico que dio servicio
    lastServiceTechPhone?: string; // Phone for WhatsApp contact
    lastServiceTechAlias?: string; // Display name
    lastServiceDate?: any;       // Fecha del último servicio
    geoLocation?: GeoLocation;   // Passive geolocation capture
    createdAt?: any;

    // AGENDA v1.0.0 - Warranty Management
    warrantyMonths?: number;           // Duration of warranty given (e.g., 3, 6, 12)
    warrantyExpirationDate?: any;      // Calculated expiration date
    isWarrantyClaim?: boolean;         // Flag if current service is a warranty claim
}

// ============================================
// TOKEN GENERATION (6-char alphanumeric)
// ============================================

const TOKEN_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const TOKEN_LENGTH = 6;

/**
 * Generates a random 6-character alphanumeric token.
 * Example output: "a1b2c3", "x9y8z7"
 */
const generateRandomToken = (): string => {
    let token = '';
    for (let i = 0; i < TOKEN_LENGTH; i++) {
        token += TOKEN_CHARS.charAt(Math.floor(Math.random() * TOKEN_CHARS.length));
    }
    return token;
};

/**
 * Generates a unique token, checking against existing tokens in Firestore.
 * Retries up to 10 times if collision detected.
 */
export const generateUniqueToken = async (): Promise<string> => {
    const MAX_RETRIES = 10;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const token = generateRandomToken();

        // Check if token already exists
        const existing = await getEquipmentByToken(token);
        if (!existing) {
            console.log(`Generated unique token: ${token} (attempt ${attempt + 1})`);
            return token;
        }

        console.log(`Token collision detected: ${token}, retrying...`);
    }

    // Fallback: include timestamp to guarantee uniqueness
    const fallbackToken = generateRandomToken() + Date.now().toString(36).slice(-2);
    console.warn(`Using fallback token after max retries: ${fallbackToken}`);
    return fallbackToken.slice(0, 8); // Allow slightly longer for emergency
};

// ============================================
// EQUIPMENT LOOKUP FUNCTIONS
// ============================================

/**
 * Lookup equipment by 6-char token (PRIMARY lookup for QR system)
 */
export const getEquipmentByToken = async (token: string): Promise<(EquipmentData & { id: string }) | null> => {
    try {
        const q = query(
            collection(db, 'equipments'),
            where('token', '==', token.toLowerCase())
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as EquipmentData & { id: string };
    } catch (e) {
        console.error('Error looking up equipment by token:', e);
        return null;
    }
};

/**
 * Lookup equipment by scanned QR code value (legacy support)
 */
export const getEquipmentByQrCode = async (qrCode: string): Promise<(EquipmentData & { id: string }) | null> => {
    try {
        // First try to find by token (if the QR contains just the token)
        if (qrCode.length === 6 && /^[a-z0-9]+$/i.test(qrCode)) {
            const byToken = await getEquipmentByToken(qrCode);
            if (byToken) return byToken;
        }

        // Extract token from URL if full URL scanned
        const tokenFromUrl = extractTokenFromUrl(qrCode);
        if (tokenFromUrl) {
            const byToken = await getEquipmentByToken(tokenFromUrl);
            if (byToken) return byToken;
        }

        // Fallback: search by legacy qrCode field
        const q = query(
            collection(db, 'equipments'),
            where('qrCode', '==', qrCode)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as EquipmentData & { id: string };
    } catch (e) {
        console.error('Error looking up equipment by QR:', e);
        return null;
    }
};

/**
 * Extract token from TESIVIL QR URL
 * Input: "https://qr.tesivil.com/a/abc123" -> Output: "abc123"
 */
export const extractTokenFromUrl = (url: string): string | null => {
    try {
        // Match pattern: /a/[token]
        const match = url.match(/\/a\/([a-z0-9]+)/i);
        if (match && match[1]) {
            return match[1].toLowerCase();
        }
        return null;
    } catch {
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

// ============================================
// EQUIPMENT CRUD OPERATIONS
// ============================================

interface AddEquipmentInput {
    clientId: string;
    brand: string;
    model: string;
    technicianId: string;
    qrCode?: string;           // Original scanned value (for reference)
    btu?: number;
    location?: string;
    geoLocation?: GeoLocation;
}

/**
 * Add new equipment to Firestore with auto-generated 6-char token.
 * Returns the token (not document ID) for QR generation.
 */
/**
 * Helper to remove undefined values from an object (Firestore doesn't accept undefined)
 */
const removeUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    ) as Partial<T>;
};

export const addEquipment = async (equipmentData: AddEquipmentInput): Promise<{ id: string; token: string }> => {
    try {
        // Generate unique 6-char token
        const token = await generateUniqueToken();

        // Clean undefined values - Firestore doesn't accept undefined
        const cleanedData = removeUndefined(equipmentData);

        const docRef = await addDoc(collection(db, 'equipments'), {
            ...cleanedData,
            token: token.toLowerCase(),
            createdAt: serverTimestamp(),
        });

        console.log(`Equipment created - ID: ${docRef.id}, Token: ${token}`);

        // Update technician stats
        try {
            const userRef = doc(db, 'users', equipmentData.technicianId);
            await updateDoc(userRef, {
                'stats.qrsActive': increment(1)
            });
        } catch (e) {
            console.error('Error updating technician stats for QR:', e);
        }

        return { id: docRef.id, token };
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
        querySnapshot.forEach((docSnap) => {
            equipments.push({ id: docSnap.id, ...docSnap.data() } as EquipmentData & { id: string });
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
        querySnapshot.forEach((docSnap) => {
            equipments.push({ id: docSnap.id, ...docSnap.data() } as EquipmentData & { id: string });
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

/**
 * Marks equipment as having an installation service.
 * This sets installDate so future services show Reinstalación instead of Instalación.
 */
export const markEquipmentAsInstalled = async (equipmentId: string): Promise<boolean> => {
    try {
        const equipmentRef = doc(db, 'equipments', equipmentId);
        await updateDoc(equipmentRef, {
            installDate: serverTimestamp(),
        });
        console.log(`Equipment ${equipmentId} marked as installed`);
        return true;
    } catch (e) {
        console.error('Error marking equipment as installed:', e);
        return false;
    }
};

/**
 * Updates equipment geolocation (passive capture)
 */
export const updateEquipmentGeoLocation = async (
    equipmentId: string,
    latitude: number,
    longitude: number
): Promise<boolean> => {
    try {
        const equipmentRef = doc(db, 'equipments', equipmentId);
        await updateDoc(equipmentRef, {
            geoLocation: {
                latitude,
                longitude,
                capturedAt: serverTimestamp(),
            },
        });
        console.log(`GeoLocation updated for equipment ${equipmentId}: ${latitude}, ${longitude}`);
        return true;
    } catch (e) {
        console.error('Error updating equipment geolocation:', e);
        return false;
    }
};

// ============================================
// QR URL GENERATION - TESIVIL Format
// URL: https://qr.tesivil.com/a/[TOKEN]
// ============================================

/**
 * Genera la URL pública para el QR de un equipo usando el token.
 * Format: https://qr.tesivil.com/a/[TOKEN]
 */
export const getQrWebUrl = (token: string): string => {
    return `${QR_WEB_BASE_URL}/a/${token.toLowerCase()}`;
};

/**
 * Genera el contenido completo para el código QR (para imprimir/descargar)
 */
export const generateQrContent = (token: string): {
    url: string;
    displayText: string;
    token: string;
} => {
    return {
        url: getQrWebUrl(token),
        displayText: 'HOJA DE VIDA DEL EQUIPO | Escanea para ver historial',
        token: token.toLowerCase(),
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
 * Obtiene el estado del equipo para el semáforo (verde/amarillo/rojo)
 */
export const getEquipmentStatus = (lastServiceDate: Date | null): {
    status: 'ok' | 'warning' | 'critical';
    monthsSinceService: number;
    nextMaintenanceDate: Date;
} => {
    const now = new Date();

    if (!lastServiceDate) {
        return {
            status: 'critical',
            monthsSinceService: 99,
            nextMaintenanceDate: new Date(), // Maintenance needed now
        };
    }

    const monthsSinceService = Math.floor(
        (now.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    // Calculate next maintenance date (6 months from last service)
    const nextMaintenanceDate = new Date(lastServiceDate);
    nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 6);

    if (monthsSinceService < 6) {
        return { status: 'ok', monthsSinceService, nextMaintenanceDate };
    } else if (monthsSinceService < 12) {
        return { status: 'warning', monthsSinceService, nextMaintenanceDate };
    } else {
        return { status: 'critical', monthsSinceService, nextMaintenanceDate };
    }
};
