import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit, 
    doc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    runTransaction
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// COTIZADOR FREE - QRclima
// Sistema de cotizaciones universal para todos los usuarios
// Permite cargar conceptos personalizados de MO y MT
// ============================================

// Tipos de concepto
export type ConceptType = 'MO' | 'MT'; // MO = Mano de Obra, MT = Materiales

// Interface para conceptos personalizados
export interface CotizadorConcept {
    id?: string;
    code: string;              // Código auto-generado (e.g., ABC-MO-001)
    description: string;       // Descripción del concepto
    type: ConceptType;         // MO o MT
    unitPrice: number;         // Precio unitario
    unit?: string;             // Unidad (servicio, pieza, metro, etc.)
    technicianId: string;      // ID del técnico propietario
    createdAt?: any;
    updatedAt?: any;
}

// Interface para items seleccionados en una cotización
export interface CotizadorQuoteItem {
    conceptId: string;         // Referencia al concepto original
    code: string;              // Snapshot del código
    description: string;       // Snapshot de la descripción
    type: ConceptType;         // Snapshot del tipo
    unitPrice: number;         // Snapshot del precio
    quantity: number;          // Cantidad seleccionada
    total: number;             // unitPrice * quantity
}

// Interface para cotizaciones
export interface CotizadorQuote {
    id?: string;
    technicianId: string;
    clientId: string;
    clientName: string;
    clientPhone?: string;
    clientAddress?: string;
    items: CotizadorQuoteItem[];
    subtotal: number;
    total: number;
    notes?: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    createdAt?: any;
    updatedAt?: any;
}

// ============================================
// GENERACIÓN DE CÓDIGOS ÚNICOS
// Formato: [3 primeros chars del UID]-[MO/MT]-[###]
// ============================================

/**
 * Genera el prefijo del técnico a partir de su UID
 */
export const getTechnicianPrefix = (userId: string): string => {
    return userId.substring(0, 3).toUpperCase();
};

/**
 * Genera un código único para un nuevo concepto
 * Consulta Firestore para obtener el número más alto existente
 */
export const generateConceptCode = async (
    userId: string,
    type: ConceptType
): Promise<string> => {
    const prefix = getTechnicianPrefix(userId);
    
    try {
        // Obtener el último código del mismo tipo para este usuario
        const conceptsRef = collection(db, 'cotizador_concepts');
        const q = query(
            conceptsRef,
            where('technicianId', '==', userId),
            where('type', '==', type),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        let nextNumber = 1;
        
        if (!snapshot.empty) {
            const lastConcept = snapshot.docs[0].data() as CotizadorConcept;
            // Extraer el número del código (e.g., "ABC-MO-015" -> 15)
            const match = lastConcept.code.match(/-(\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        
        // Formatear el número con ceros a la izquierda (3 dígitos)
        const numberStr = nextNumber.toString().padStart(3, '0');
        
        return `${prefix}-${type}-${numberStr}`;
    } catch (error) {
        console.error('Error generating concept code:', error);
        // Fallback: usar timestamp si hay error
        const fallbackNum = Date.now().toString().slice(-3);
        return `${prefix}-${type}-${fallbackNum}`;
    }
};

// ============================================
// CRUD DE CONCEPTOS
// ============================================

/**
 * Agrega un nuevo concepto
 */
export const addConcept = async (
    conceptData: Omit<CotizadorConcept, 'id' | 'code' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    try {
        // Generar código único
        const code = await generateConceptCode(conceptData.technicianId, conceptData.type);
        
        const docRef = await addDoc(collection(db, 'cotizador_concepts'), {
            ...conceptData,
            code,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        
        console.log('Concept added with code:', code, 'ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding concept:', error);
        throw error;
    }
};

/**
 * Obtiene todos los conceptos de un técnico
 */
export const getConcepts = async (
    technicianId: string,
    type?: ConceptType
): Promise<CotizadorConcept[]> => {
    try {
        const conceptsRef = collection(db, 'cotizador_concepts');
        let q = query(
            conceptsRef,
            where('technicianId', '==', technicianId)
        );
        
        // Si se especifica tipo, filtrar
        if (type) {
            q = query(
                conceptsRef,
                where('technicianId', '==', technicianId),
                where('type', '==', type)
            );
        }
        
        const snapshot = await getDocs(q);
        const concepts: CotizadorConcept[] = [];
        
        snapshot.forEach((doc) => {
            concepts.push({ id: doc.id, ...doc.data() } as CotizadorConcept);
        });
        
        // Ordenar por código
        concepts.sort((a, b) => a.code.localeCompare(b.code));
        
        return concepts;
    } catch (error) {
        console.error('Error fetching concepts:', error);
        return [];
    }
};

/**
 * Actualiza un concepto existente
 */
export const updateConcept = async (
    conceptId: string,
    data: Partial<Omit<CotizadorConcept, 'id' | 'code' | 'technicianId' | 'createdAt'>>
): Promise<boolean> => {
    try {
        const conceptRef = doc(db, 'cotizador_concepts', conceptId);
        await updateDoc(conceptRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
        console.log('Concept updated:', conceptId);
        return true;
    } catch (error) {
        console.error('Error updating concept:', error);
        return false;
    }
};

/**
 * Elimina un concepto
 */
export const deleteConcept = async (conceptId: string): Promise<boolean> => {
    try {
        const conceptRef = doc(db, 'cotizador_concepts', conceptId);
        await deleteDoc(conceptRef);
        console.log('Concept deleted:', conceptId);
        return true;
    } catch (error) {
        console.error('Error deleting concept:', error);
        return false;
    }
};

// ============================================
// MANEJO DE COTIZACIONES
// ============================================

/**
 * Calcula los totales de una cotización
 */
export const calculateQuoteTotals = (items: CotizadorQuoteItem[]): {
    subtotal: number;
    total: number;
} => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(subtotal * 100) / 100, // Sin IVA adicional en versión free
    };
};

/**
 * Guarda una nueva cotización
 */
export const saveCotizadorQuote = async (
    quoteData: Omit<CotizadorQuote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, 'cotizador_quotes'), {
            ...quoteData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log('Quote saved:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving quote:', error);
        throw error;
    }
};

/**
 * Obtiene las cotizaciones de un técnico
 */
export const getUserCotizadorQuotes = async (
    technicianId: string,
    limitCount: number = 20
): Promise<CotizadorQuote[]> => {
    try {
        const quotesRef = collection(db, 'cotizador_quotes');
        const q = query(
            quotesRef,
            where('technicianId', '==', technicianId),
            limit(limitCount)
        );
        
        const snapshot = await getDocs(q);
        const quotes: CotizadorQuote[] = [];
        
        snapshot.forEach((doc) => {
            quotes.push({ id: doc.id, ...doc.data() } as CotizadorQuote);
        });
        
        // Ordenar por fecha de creación (más reciente primero)
        quotes.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });
        
        return quotes;
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return [];
    }
};

/**
 * Actualiza el estado de una cotización
 */
export const updateCotizadorQuoteStatus = async (
    quoteId: string,
    status: CotizadorQuote['status']
): Promise<boolean> => {
    try {
        const quoteRef = doc(db, 'cotizador_quotes', quoteId);
        await updateDoc(quoteRef, {
            status,
            updatedAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Error updating quote status:', error);
        return false;
    }
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea un precio en moneda mexicana
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

/**
 * Obtiene el nombre legible del tipo de concepto
 */
export const getConceptTypeName = (type: ConceptType): string => {
    return type === 'MO' ? 'Mano de Obra' : 'Materiales';
};
