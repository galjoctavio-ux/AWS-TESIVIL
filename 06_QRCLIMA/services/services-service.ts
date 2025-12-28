import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where, orderBy, limit, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { updateUserProfile } from './user-service';

export interface ServiceData {
    clientId: string;
    clientName?: string;
    address?: string;
    lat?: number;  // Client latitude for route optimization
    lng?: number;  // Client longitude for route optimization
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

    // AGENDA v1.0.0 - Route Optimization fields
    scheduledStart?: any;  // Scheduled start time
    scheduledEnd?: any;    // Scheduled end time
    isWarrantyClaim?: boolean;  // Is this a warranty service?
    routeEfficiencyColor?: 'green' | 'yellow' | 'red';  // Haversine efficiency
    distanceFromPrevious?: number;  // Distance in km from last appointment

    // Warranty
    warrantyMonths?: number;  // Duration of warranty (0, 1, 3, 6, 12)
}

export const addService = async (serviceData: ServiceData) => {
    try {
        const docRef = await addDoc(collection(db, 'services'), {
            ...serviceData,
            createdAt: serverTimestamp(),
        });
        console.log('Service created with ID: ', docRef.id);

        // Incrementar el contador de servicios del técnico
        try {
            const userRef = doc(db, 'users', serviceData.technicianId);
            await updateDoc(userRef, {
                'stats.servicesCount': increment(1)
            });
            console.log('Service count incremented for technician:', serviceData.technicianId);
        } catch (statsError) {
            console.warn('Could not update service count (user profile may not exist):', statsError);
        }

        // Trigger: Marcar logro de primera agenda si tiene fecha programada
        if (serviceData.scheduledStart || serviceData.date) {
            updateUserProfile(serviceData.technicianId, {
                achievements: { firstAgenda: true }
            }).catch(err => console.warn('Could not update firstAgenda achievement:', err));
        }

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

/**
 * Cuenta el total de servicios de un técnico
 */
export const getTotalServicesCount = async (technicianId: string): Promise<number> => {
    try {
        const q = query(
            collection(db, 'services'),
            where('technicianId', '==', technicianId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (e) {
        console.error('Error counting services:', e);
        return 0;
    }
};

/**
 * Sincroniza el contador de servicios del perfil con el conteo real
 * Útil para usuarios existentes que ya tenían servicios antes de esta actualización
 */
export const syncServicesCount = async (technicianId: string): Promise<number> => {
    try {
        const totalCount = await getTotalServicesCount(technicianId);

        // Actualizar el perfil con el conteo real
        const userRef = doc(db, 'users', technicianId);
        await updateDoc(userRef, {
            'stats.servicesCount': totalCount
        });

        console.log('Synced services count for technician:', technicianId, 'count:', totalCount);
        return totalCount;
    } catch (e) {
        console.error('Error syncing services count:', e);
        return 0;
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

/**
 * Check if there's a schedule conflict at the given date/time
 * Returns the conflicting service if found, null otherwise
 * Uses a 1-hour window (±30 min) to check for conflicts
 */
export const checkScheduleConflict = async (
    technicianId: string,
    proposedDate: Date
): Promise<any | null> => {
    try {
        // Get all pending services for this technician
        const q = query(
            collection(db, 'services'),
            where('technicianId', '==', technicianId),
            where('status', '==', 'Pendiente')
        );

        const querySnapshot = await getDocs(q);

        // Check each service for time conflict (within 1 hour window)
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            let serviceDate: Date;

            if (data.date?.toDate) {
                serviceDate = data.date.toDate();
            } else if (data.date) {
                serviceDate = new Date(data.date);
            } else {
                continue;
            }

            // Calculate time difference in hours
            const timeDiff = Math.abs(proposedDate.getTime() - serviceDate.getTime());
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            // If within 1 hour, it's a conflict
            if (hoursDiff < 1) {
                return {
                    id: docSnap.id,
                    clientName: data.clientName || 'Cliente',
                    date: serviceDate,
                    type: data.type
                };
            }
        }

        return null; // No conflict found
    } catch (e) {
        console.error('Error checking schedule conflict:', e);
        return null; // Allow scheduling on error (fail open)
    }
};

/**
 * Delete a service/appointment from Firestore
 */
export const deleteService = async (serviceId: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, 'services', serviceId));
        console.log('Service deleted:', serviceId);
        return true;
    } catch (e) {
        console.error('Error deleting service:', e);
        return false;
    }
};

/**
 * Update service date/time (for rescheduling)
 */
export const updateServiceDate = async (
    serviceId: string,
    newDate: Date
): Promise<boolean> => {
    try {
        await updateDoc(doc(db, 'services', serviceId), {
            date: newDate
        });
        console.log('Service rescheduled:', serviceId, newDate);
        return true;
    } catch (e) {
        console.error('Error updating service date:', e);
        return false;
    }
};

/**
 * Get all services with scheduled reminders (nextServiceDate set and in the future)
 * Used by Recordatorios PRO screen
 */
export const getScheduledReminders = async (technicianId: string): Promise<(ServiceData & { id: string })[]> => {
    try {
        const now = new Date();

        // Query services with reminderEnabled = true
        const q = query(
            collection(db, 'services'),
            where('technicianId', '==', technicianId),
            where('reminderEnabled', '==', true),
            orderBy('nextServiceDate', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const reminders: (ServiceData & { id: string })[] = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as ServiceData;

            // Filter: only include future dates
            if (data.nextServiceDate) {
                const nextDate = data.nextServiceDate?.toDate
                    ? data.nextServiceDate.toDate()
                    : new Date(data.nextServiceDate);

                // Include past reminders too (show as "vencido")
                reminders.push({ id: docSnap.id, ...data });
            }
        });

        return reminders;
    } catch (e) {
        console.error('Error fetching scheduled reminders:', e);
        return [];
    }
};

/**
 * Update reminder date for a service
 * Used by Recordatorios PRO screen for date editing
 */
export const updateReminderDate = async (
    serviceId: string,
    newDate: Date
): Promise<boolean> => {
    try {
        await updateDoc(doc(db, 'services', serviceId), {
            nextServiceDate: newDate
        });
        console.log('Reminder date updated:', serviceId, newDate);
        return true;
    } catch (e) {
        console.error('Error updating reminder date:', e);
        return false;
    }
};
