import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface EquipmentData {
    qrCode: string;         // Unique QR identifier
    clientId: string;       // Owner client
    brand: string;
    model: string;
    btu?: number;
    installDate?: any;      // Timestamp or Date
    location?: string;      // e.g., "Sala", "Recámara"
    technicianId: string;
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
