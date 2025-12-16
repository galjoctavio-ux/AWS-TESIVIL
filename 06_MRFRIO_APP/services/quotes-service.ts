import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export type QuoteItemType = 'Material' | 'Labor' | 'Equipment';

export interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    unitCost: number; // Costo real para el técnico
    type: QuoteItemType;
    margin?: number; // Override default margin
}

export interface Quote {
    id?: string;
    userId: string;
    clientName: string;
    items: QuoteItem[];
    subtotal: number;
    tax: number;
    total: number;
    createdAt: any;
    status: 'Draft' | 'Sent' | 'Accepted';
    requires_invoice?: boolean;
    validity_days?: number;
    notes?: string;
}

export type QuoteData = Quote;

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

// CONFIGURABLE MARGINS
const DEFAULT_MATERIAL_MARGIN = 0.30; // 30% profit on materials
const TAX_RATE = 0.16; // IVA

// MOCK ITEM DATABASE (Simulating SQLite/JSON)
export const ITEM_DATABASE: QuoteItem[] = [
    { id: 'm1', description: 'Tubería de Cobre 1/2" (Metro)', unitCost: 150, quantity: 1, type: 'Material' },
    { id: 'm2', description: 'Tubería de Cobre 1/4" (Metro)', unitCost: 80, quantity: 1, type: 'Material' },
    { id: 'm3', description: 'Cable de Control 4x16 (Metro)', unitCost: 25, quantity: 1, type: 'Material' },
    { id: 'm4', description: 'Cinta Momia (Rollo)', unitCost: 40, quantity: 1, type: 'Material' },
    { id: 'm5', description: 'Gas R410A (Kg)', unitCost: 350, quantity: 1, type: 'Material' },
    { id: 'k1', description: 'Kit Instalación Básico (3m)', unitCost: 1200, quantity: 1, type: 'Material' },
    { id: 'base', description: 'Base de Piso (Par)', unitCost: 180, quantity: 1, type: 'Material' },
    { id: 'cap', description: 'Capacitor de Trabajo 35uF', unitCost: 120, quantity: 1, type: 'Material' },
    { id: 'l1', description: 'Mano de Obra (Instalación Básica)', unitCost: 1500, quantity: 1, type: 'Labor' },
    { id: 'l2', description: 'Mano de Obra (Mantinimiento)', unitCost: 650, quantity: 1, type: 'Labor' },
    { id: 'l3', description: 'Diagnóstico y Revisión', unitCost: 450, quantity: 1, type: 'Labor' },
];

export const calculateLineTotal = (item: QuoteItem): number => {
    // If Labor, price is usually fixed/direct. 
    // If Material, add margin.
    const margin = item.type === 'Material' ? (item.margin || DEFAULT_MATERIAL_MARGIN) : 0;
    const priceWithMargin = item.unitCost * (1 + margin);
    return priceWithMargin * item.quantity;
};

export const calculateQuoteTotals = (items: QuoteItem[], includeTax: boolean) => {
    let subtotal = 0;

    items.forEach(item => {
        subtotal += calculateLineTotal(item);
    });

    const tax = includeTax ? subtotal * TAX_RATE : 0;
    const total = subtotal + tax;

    return { subtotal, tax, total };
};

export const saveQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt'>) => {
    try {
        const docRef = await addDoc(collection(db, 'quotes'), {
            ...quoteData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error saving quote:", e);
        throw e;
    }
};

export const getSmartSuggestions = (serviceType: 'Instalación' | 'Mantenimiento' | 'Reparación'): QuoteItem[] => {
    // The "Brain" of the Trifurcator
    switch (serviceType) {
        case 'Instalación':
            return [
                { ...ITEM_DATABASE.find(i => i.id === 'k1')!, quantity: 1 },
                { ...ITEM_DATABASE.find(i => i.id === 'base')!, quantity: 1 },
                { ...ITEM_DATABASE.find(i => i.id === 'l1')!, quantity: 1 },
            ];
        case 'Mantenimiento':
            return [
                { ...ITEM_DATABASE.find(i => i.id === 'l2')!, quantity: 1 },
            ];
        case 'Reparación':
            return [
                { ...ITEM_DATABASE.find(i => i.id === 'l3')!, quantity: 1 },
            ];
        default:
            return [];
    }
};
