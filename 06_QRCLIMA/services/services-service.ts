import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface ServiceData {
    clientId: string;
    technicianId: string;
    type: 'Reparación' | 'Mantenimiento' | 'Instalación' | 'Reinstalación';
    status: 'Pendiente' | 'Terminado';
    date: any; // Timestamp or Date
    diagnosis?: {
        errorCode: string;
        description: string;
        cause: string;
    };
    notes?: string;
    equipment?: {
        brand: string;
        model: string;
        type: string;
        capacityBTU?: string; // New field
        qrId?: string;
    };
    tasks?: string[];
    checklist?: { [key: string]: boolean };
    photos?: string[];
    nextServiceDate?: any;
    reminderEnabled?: boolean;
    cost?: number;
    createdAt?: any;
    clientSignature?: string; // Firma del cliente en Base64
}

export const addService = async (serviceData: ServiceData) => {
    try {
        const docRef = await addDoc(collection(db, 'services'), {
            ...serviceData,
            createdAt: serverTimestamp(),
        });
        console.log('Service created with ID: ', docRef.id);
        return docRef.id;
    } catch (e) {
        console.error('Error adding service: ', e);
        throw e;
    }
};

export const getLastServices = async (technicianId: string, limitCount: number = 5) => {
    try {
        const q = query(
            collection(db, 'services'),
            where('technicianId', '==', technicianId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const services: any[] = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() });
        });
        return services;
    } catch (e) {
        console.error('Error fetching last services:', e);
        // Fallback for indexing errors or empty states
        return [];
    }
};

export const getUpcomingServices = async (technicianId: string) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'services'),
            where('technicianId', '==', technicianId),
            where('status', '==', 'Pendiente'),
            orderBy('date', 'asc'),
            limit(5)
        );

        const querySnapshot = await getDocs(q);
        const services: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Client-side filter for dates in the future (Firestore query limitations with multiple fields)
            let serviceDate = new Date();
            if (data.date?.toDate) serviceDate = data.date.toDate();
            else if (data.date) serviceDate = new Date(data.date);

            if (serviceDate >= today) {
                services.push({ id: doc.id, ...data });
            }
        });
        return services;
    } catch (e) {
        console.error('Error fetching upcoming services:', e);
        return [];
    }
};

export const getRecentServices = async (technicianId: string, limitCount: number = 50) => {
    try {
        const q = query(
            collection(db, 'services'),
            where('technicianId', '==', technicianId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const services: any[] = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() });
        });
        return services;
    } catch (e) {
        console.error('Error fetching recent services:', e);
        return [];
    }
};

export const getServiceById = async (serviceId: string) => {
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const serviceRef = doc(db, 'services', serviceId);
        const serviceSnap = await getDoc(serviceRef);

        if (serviceSnap.exists()) {
            return { id: serviceSnap.id, ...serviceSnap.data() } as ServiceData & { id: string };
        }
        return null;
    } catch (e) {
        console.error('Error fetching service by ID:', e);
        return null;
    }
};

// Check if equipment has a prior installation service
export const hasInstallationService = async (equipmentId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, 'services'),
            where('equipment.qrId', '==', equipmentId),
            where('type', 'in', ['Instalación', 'Reinstalación']),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (e) {
        console.error('Error checking installation service:', e);
        return false;
    }
};
