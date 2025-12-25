import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
