import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { updateUserProfile } from './user-service';

export interface ClientData {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
    technicianId: string;
    createdAt?: any;
    // Geo-coordinates for route optimization (Haversine)
    lat?: number;
    lng?: number;
}

export const addClient = async (clientData: ClientData) => {
    try {
        const docRef = await addDoc(collection(db, 'clients'), {
            ...clientData,
            createdAt: serverTimestamp(),
        });
        console.log('Client written with ID: ', docRef.id);

        // Trigger: Marcar logro de primer cliente
        if (clientData.technicianId) {
            updateUserProfile(clientData.technicianId, {
                achievements: { firstClient: true }
            }).catch(err => console.warn('Could not update firstClient achievement:', err));
        }

        return docRef.id;
    } catch (e) {
        console.error('Error adding client: ', e);
        throw e;
    }
};

export const getClients = async (technicianId: string) => {
    const q = query(collection(db, 'clients'), where('technicianId', '==', technicianId));
    const querySnapshot = await getDocs(q);
    const clients: any[] = [];
    querySnapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() });
    });
    return clients;
};

export const getClientById = async (clientId: string) => {
    try {
        const clientRef = doc(db, 'clients', clientId);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
            return { id: clientSnap.id, ...clientSnap.data() } as ClientData & { id: string };
        }
        return null;
    } catch (e) {
        console.error('Error fetching client by ID:', e);
        return null;
    }
};

export const updateClient = async (clientId: string, data: Partial<ClientData>) => {
    try {
        const clientRef = doc(db, 'clients', clientId);
        await updateDoc(clientRef, data);
        console.log('Client updated:', clientId);
        return true;
    } catch (e) {
        console.error('Error updating client:', e);
        throw e;
    }
};

export const getClientServices = async (clientId: string, technicianId: string) => {
    try {
        const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
        const q = query(
            collection(db, 'services'),
            where('clientId', '==', clientId),
            where('technicianId', '==', technicianId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const services: any[] = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() });
        });
        return services;
    } catch (e) {
        console.error('Error fetching client services:', e);
        return [];
    }
};

// ============================================
// CLIENT SEARCH & STATISTICS FUNCTIONS
// For "Clientes" tab feature
// ============================================

export interface ClientStats {
    totalServices: number;
    lastServiceDate: Date | null;
    lastServiceType: string | null;
    totalEquipments: number;
    activeInLast30Days: boolean;
}

export interface ClientWithStats extends ClientData {
    id: string;
    stats: ClientStats;
}

/**
 * Search clients by name, phone, or address (client-side filtering)
 */
export const searchClients = async (
    technicianId: string,
    query: string
): Promise<(ClientData & { id: string })[]> => {
    try {
        const clients = await getClients(technicianId);
        if (!query.trim()) return clients;

        const lowerQuery = query.toLowerCase().trim();
        return clients.filter(client =>
            client.name?.toLowerCase().includes(lowerQuery) ||
            client.phone?.toLowerCase().includes(lowerQuery) ||
            client.address?.toLowerCase().includes(lowerQuery)
        );
    } catch (e) {
        console.error('Error searching clients:', e);
        return [];
    }
};

/**
 * Get equipments linked to a client
 */
export const getClientEquipments = async (clientId: string) => {
    try {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const q = query(
            collection(db, 'equipments'),
            where('clientId', '==', clientId)
        );
        const querySnapshot = await getDocs(q);
        const equipments: any[] = [];
        querySnapshot.forEach((doc) => {
            equipments.push({ id: doc.id, ...doc.data() });
        });
        return equipments;
    } catch (e) {
        console.error('Error fetching client equipments:', e);
        return [];
    }
};

/**
 * Get statistics for a single client
 */
export const getClientStats = async (
    clientId: string,
    technicianId: string
): Promise<ClientStats> => {
    try {
        const [services, equipments] = await Promise.all([
            getClientServices(clientId, technicianId),
            getClientEquipments(clientId)
        ]);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let lastServiceDate: Date | null = null;
        let lastServiceType: string | null = null;
        let activeInLast30Days = false;

        if (services.length > 0) {
            const lastService = services[0];
            const serviceDate = lastService.createdAt?.toDate?.() ||
                (lastService.createdAt ? new Date(lastService.createdAt) : null);

            if (serviceDate) {
                lastServiceDate = serviceDate;
                lastServiceType = lastService.type || null;
                activeInLast30Days = serviceDate >= thirtyDaysAgo;
            }
        }

        return {
            totalServices: services.length,
            lastServiceDate,
            lastServiceType,
            totalEquipments: equipments.length,
            activeInLast30Days
        };
    } catch (e) {
        console.error('Error fetching client stats:', e);
        return {
            totalServices: 0,
            lastServiceDate: null,
            lastServiceType: null,
            totalEquipments: 0,
            activeInLast30Days: false
        };
    }
};

/**
 * Get all clients with their stats for the Clientes list
 */
export const getClientsWithStats = async (technicianId: string): Promise<ClientWithStats[]> => {
    try {
        const clients = await getClients(technicianId);

        const clientsWithStats = await Promise.all(
            clients.map(async (client) => {
                const stats = await getClientStats(client.id, technicianId);
                return { ...client, stats };
            })
        );

        return clientsWithStats;
    } catch (e) {
        console.error('Error fetching clients with stats:', e);
        return [];
    }
};
