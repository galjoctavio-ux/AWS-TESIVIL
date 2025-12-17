import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// COTIZADOR PRO - Mr. Frío
// Según master_plan.md - Módulo 3 (Pro-Quoter)
// ============================================

export type QuoteItemType = 'Material' | 'Labor' | 'Equipment' | 'Gas' | 'Electrical';
export type QuoteCategory = 'installation' | 'maintenance' | 'repair' | 'parts';

export interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    unitCost: number;          // Costo real para el técnico
    type: QuoteItemType;
    category: QuoteCategory;
    margin?: number;           // Override default margin
    unit?: string;             // e.g., "metro", "kg", "pieza"
    minQuantity?: number;
    maxQuantity?: number;
}

export interface Quote {
    id?: string;
    userId: string;
    clientId?: string;         // Opcional: vincular a cliente existente
    clientName: string;
    clientPhone?: string;
    serviceType: 'Instalación' | 'Mantenimiento' | 'Reparación';
    items: QuoteItem[];
    subtotal: number;
    tax: number;
    total: number;
    laborCost: number;         // Desglose de mano de obra
    materialsCost: number;     // Desglose de materiales
    createdAt: any;
    validUntil?: any;          // Fecha de validez
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
    requires_invoice?: boolean;
    validity_days?: number;
    notes?: string;
    // Datos específicos para instalación
    installationData?: {
        tonnage?: number;
        distance?: number;      // Metros de tubería
        floorType?: 'wall' | 'floor' | 'ceiling';
        requiresElectrical?: boolean;
        requiresBase?: boolean;
    };
}

export type QuoteData = Quote;

// ============================================
// CONFIGURACIÓN DE MÁRGENES Y TASAS
// ============================================

export const QUOTE_CONFIG = {
    // Márgenes por defecto por tipo
    margins: {
        Material: 0.30,        // 30% margen en materiales
        Labor: 0.00,           // La mano de obra ya es el precio final
        Equipment: 0.25,       // 25% en equipos
        Gas: 0.35,             // 35% en gas (volátil)
        Electrical: 0.30,      // 30% en eléctrico
    },
    // Tasa de IVA
    taxRate: 0.16,
    // Días de validez por defecto
    defaultValidityDays: 15,
    // Factor de stock (para ajustar precios según disponibilidad)
    stockFactor: 1.0,          // 1.0 = normal, 1.1 = escasez, 0.9 = abundante
};

// ============================================
// BASE DE DATOS DE INSUMOS COMPLETA
// ============================================

export const ITEM_DATABASE: QuoteItem[] = [
    // ==========================================
    // MATERIALES DE INSTALACIÓN
    // ==========================================
    { id: 'kit_3m', description: 'Kit Instalación Básico (3m)', unitCost: 1200, quantity: 1, type: 'Material', category: 'installation', unit: 'kit' },
    { id: 'kit_5m', description: 'Kit Instalación Extendido (5m)', unitCost: 1600, quantity: 1, type: 'Material', category: 'installation', unit: 'kit' },
    { id: 'kit_8m', description: 'Kit Instalación Largo (8m)', unitCost: 2100, quantity: 1, type: 'Material', category: 'installation', unit: 'kit' },
    { id: 'base_pared', description: 'Soporte de Pared', unitCost: 180, quantity: 1, type: 'Material', category: 'installation', unit: 'pieza' },
    { id: 'base_piso', description: 'Base de Piso (Par)', unitCost: 220, quantity: 1, type: 'Material', category: 'installation', unit: 'par' },
    { id: 'base_techo', description: 'Rack de Techo', unitCost: 450, quantity: 1, type: 'Material', category: 'installation', unit: 'pieza' },

    // ==========================================
    // TUBERÍAS Y CONEXIONES
    // ==========================================
    { id: 'cobre_1_4', description: 'Tubería de Cobre 1/4" (Metro)', unitCost: 85, quantity: 1, type: 'Material', category: 'parts', unit: 'metro', minQuantity: 1, maxQuantity: 30 },
    { id: 'cobre_3_8', description: 'Tubería de Cobre 3/8" (Metro)', unitCost: 110, quantity: 1, type: 'Material', category: 'parts', unit: 'metro', minQuantity: 1, maxQuantity: 30 },
    { id: 'cobre_1_2', description: 'Tubería de Cobre 1/2" (Metro)', unitCost: 160, quantity: 1, type: 'Material', category: 'parts', unit: 'metro', minQuantity: 1, maxQuantity: 30 },
    { id: 'cobre_5_8', description: 'Tubería de Cobre 5/8" (Metro)', unitCost: 195, quantity: 1, type: 'Material', category: 'parts', unit: 'metro', minQuantity: 1, maxQuantity: 30 },
    { id: 'cobre_3_4', description: 'Tubería de Cobre 3/4" (Metro)', unitCost: 240, quantity: 1, type: 'Material', category: 'parts', unit: 'metro', minQuantity: 1, maxQuantity: 30 },
    { id: 'aislante', description: 'Aislante Armaflex (Metro)', unitCost: 45, quantity: 1, type: 'Material', category: 'parts', unit: 'metro' },
    { id: 'cinta_momia', description: 'Cinta Momia (Rollo)', unitCost: 40, quantity: 1, type: 'Material', category: 'parts', unit: 'rollo' },
    { id: 'canaleta', description: 'Canaleta Plástica (Metro)', unitCost: 35, quantity: 1, type: 'Material', category: 'installation', unit: 'metro' },

    // ==========================================
    // GASES REFRIGERANTES
    // ==========================================
    { id: 'gas_r410a', description: 'Gas R410A (Kg)', unitCost: 850, quantity: 1, type: 'Gas', category: 'parts', unit: 'kg', minQuantity: 0.5, maxQuantity: 10 },
    { id: 'gas_r22', description: 'Gas R22 (Kg)', unitCost: 1200, quantity: 1, type: 'Gas', category: 'parts', unit: 'kg', minQuantity: 0.5, maxQuantity: 10 },
    { id: 'gas_r32', description: 'Gas R32 (Kg)', unitCost: 950, quantity: 1, type: 'Gas', category: 'parts', unit: 'kg', minQuantity: 0.5, maxQuantity: 10 },
    { id: 'gas_r134a', description: 'Gas R134A (Kg)', unitCost: 650, quantity: 1, type: 'Gas', category: 'parts', unit: 'kg', minQuantity: 0.5, maxQuantity: 10 },

    // ==========================================
    // COMPONENTES ELÉCTRICOS
    // ==========================================
    { id: 'cable_control', description: 'Cable de Control 4x16 (Metro)', unitCost: 28, quantity: 1, type: 'Electrical', category: 'parts', unit: 'metro' },
    { id: 'cable_12', description: 'Cable THW #12 (Metro)', unitCost: 15, quantity: 1, type: 'Electrical', category: 'parts', unit: 'metro' },
    { id: 'cable_10', description: 'Cable THW #10 (Metro)', unitCost: 22, quantity: 1, type: 'Electrical', category: 'parts', unit: 'metro' },
    { id: 'cable_8', description: 'Cable THW #8 (Metro)', unitCost: 35, quantity: 1, type: 'Electrical', category: 'parts', unit: 'metro' },
    { id: 'breaker_20', description: 'Interruptor Termomagnético 20A', unitCost: 180, quantity: 1, type: 'Electrical', category: 'installation', unit: 'pieza' },
    { id: 'breaker_30', description: 'Interruptor Termomagnético 30A', unitCost: 220, quantity: 1, type: 'Electrical', category: 'installation', unit: 'pieza' },
    { id: 'breaker_40', description: 'Interruptor Termomagnético 40A', unitCost: 280, quantity: 1, type: 'Electrical', category: 'installation', unit: 'pieza' },
    { id: 'contacto_220', description: 'Contacto 220V', unitCost: 150, quantity: 1, type: 'Electrical', category: 'installation', unit: 'pieza' },

    // ==========================================
    // REFACCIONES (REPARACIÓN)
    // ==========================================
    { id: 'cap_25uf', description: 'Capacitor de Trabajo 25µF', unitCost: 95, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'cap_35uf', description: 'Capacitor de Trabajo 35µF', unitCost: 120, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'cap_45uf', description: 'Capacitor de Trabajo 45µF', unitCost: 145, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'cap_marcha', description: 'Capacitor de Marcha', unitCost: 180, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'sensor_temp', description: 'Sensor de Temperatura', unitCost: 250, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'sensor_presion', description: 'Sensor de Presión', unitCost: 380, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'motor_fan_int', description: 'Motor Ventilador Interior', unitCost: 850, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'motor_fan_ext', description: 'Motor Ventilador Exterior', unitCost: 1200, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'tarjeta_evap', description: 'Tarjeta Electrónica Evaporador', unitCost: 1800, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'tarjeta_cond', description: 'Tarjeta Electrónica Condensador', unitCost: 2200, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'compresor_1ton', description: 'Compresor 1 Tonelada', unitCost: 4500, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'compresor_1.5ton', description: 'Compresor 1.5 Toneladas', unitCost: 5800, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'compresor_2ton', description: 'Compresor 2 Toneladas', unitCost: 7200, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'valvula_expansion', description: 'Válvula de Expansión', unitCost: 650, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'valvula_servicio', description: 'Válvula de Servicio', unitCost: 280, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },
    { id: 'filtro_secador', description: 'Filtro Secador', unitCost: 180, quantity: 1, type: 'Equipment', category: 'repair', unit: 'pieza' },

    // ==========================================
    // MANO DE OBRA
    // ==========================================
    { id: 'mo_inst_basica', description: 'Mano de Obra - Instalación Básica', unitCost: 1800, quantity: 1, type: 'Labor', category: 'installation', unit: 'servicio' },
    { id: 'mo_inst_premium', description: 'Mano de Obra - Instalación Premium (incluye vacío)', unitCost: 2500, quantity: 1, type: 'Labor', category: 'installation', unit: 'servicio' },
    { id: 'mo_manto_basico', description: 'Mano de Obra - Mantenimiento Básico', unitCost: 650, quantity: 1, type: 'Labor', category: 'maintenance', unit: 'servicio' },
    { id: 'mo_manto_profundo', description: 'Mano de Obra - Mantenimiento Profundo', unitCost: 950, quantity: 1, type: 'Labor', category: 'maintenance', unit: 'servicio' },
    { id: 'mo_diagnostico', description: 'Mano de Obra - Diagnóstico', unitCost: 450, quantity: 1, type: 'Labor', category: 'repair', unit: 'servicio' },
    { id: 'mo_reparacion', description: 'Mano de Obra - Reparación Estándar', unitCost: 800, quantity: 1, type: 'Labor', category: 'repair', unit: 'servicio' },
    { id: 'mo_soldadura', description: 'Mano de Obra - Soldadura', unitCost: 600, quantity: 1, type: 'Labor', category: 'repair', unit: 'servicio' },
    { id: 'mo_carga_gas', description: 'Mano de Obra - Carga de Gas', unitCost: 400, quantity: 1, type: 'Labor', category: 'repair', unit: 'servicio' },
    { id: 'mo_electrica', description: 'Mano de Obra - Instalación Eléctrica', unitCost: 1200, quantity: 1, type: 'Labor', category: 'installation', unit: 'servicio' },

    // ==========================================
    // CONSUMIBLES
    // ==========================================
    { id: 'soldadura_plata', description: 'Soldadura de Plata', unitCost: 350, quantity: 1, type: 'Material', category: 'parts', unit: 'varilla' },
    { id: 'nitrogeno', description: 'Nitrógeno (Servicio de purga)', unitCost: 200, quantity: 1, type: 'Material', category: 'parts', unit: 'servicio' },
    { id: 'limpiador_espuma', description: 'Limpiador Espuma A/C', unitCost: 180, quantity: 1, type: 'Material', category: 'maintenance', unit: 'lata' },
    { id: 'limpiador_evap', description: 'Limpiador de Evaporador', unitCost: 220, quantity: 1, type: 'Material', category: 'maintenance', unit: 'lata' },
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

export const getItemsByCategory = (category: QuoteCategory): QuoteItem[] => {
    return ITEM_DATABASE.filter(item => item.category === category);
};

export const getItemsByType = (type: QuoteItemType): QuoteItem[] => {
    return ITEM_DATABASE.filter(item => item.type === type);
};

export const searchItems = (query: string): QuoteItem[] => {
    const lowerQuery = query.toLowerCase();
    return ITEM_DATABASE.filter(item =>
        item.description.toLowerCase().includes(lowerQuery)
    );
};

// ============================================
// CÁLCULOS DE COTIZACIÓN
// ============================================

export const calculateLineTotal = (item: QuoteItem): number => {
    const marginKey = item.type as keyof typeof QUOTE_CONFIG.margins;
    const defaultMargin = QUOTE_CONFIG.margins[marginKey] || 0;
    const margin = item.margin ?? defaultMargin;
    const priceWithMargin = item.unitCost * (1 + margin) * QUOTE_CONFIG.stockFactor;
    return priceWithMargin * item.quantity;
};

export const calculateQuoteTotals = (items: QuoteItem[], includeTax: boolean) => {
    let subtotal = 0;
    let laborCost = 0;
    let materialsCost = 0;

    items.forEach(item => {
        const lineTotal = calculateLineTotal(item);
        subtotal += lineTotal;

        if (item.type === 'Labor') {
            laborCost += lineTotal;
        } else {
            materialsCost += lineTotal;
        }
    });

    const tax = includeTax ? subtotal * QUOTE_CONFIG.taxRate : 0;
    const total = subtotal + tax;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        laborCost: Math.round(laborCost * 100) / 100,
        materialsCost: Math.round(materialsCost * 100) / 100,
    };
};

// ============================================
// SUGERENCIAS INTELIGENTES (EL "CEREBRO")
// ============================================

export const getSmartSuggestions = (
    serviceType: 'Instalación' | 'Mantenimiento' | 'Reparación',
    options?: {
        tonnage?: number;
        distance?: number;
        includeElectrical?: boolean;
        floorType?: 'wall' | 'floor' | 'ceiling';
    }
): QuoteItem[] => {
    const suggestions: QuoteItem[] = [];

    switch (serviceType) {
        case 'Instalación':
            // Seleccionar kit según distancia
            const distance = options?.distance || 3;
            if (distance <= 3) {
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'kit_3m')!, quantity: 1 });
            } else if (distance <= 5) {
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'kit_5m')!, quantity: 1 });
            } else {
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'kit_8m')!, quantity: 1 });
            }

            // Base según tipo de montaje
            const floorType = options?.floorType || 'wall';
            if (floorType === 'wall') {
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'base_pared')!, quantity: 1 });
            } else if (floorType === 'floor') {
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'base_piso')!, quantity: 1 });
            } else {
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'base_techo')!, quantity: 1 });
            }

            // Mano de obra
            suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'mo_inst_premium')!, quantity: 1 });

            // Instalación eléctrica si se requiere
            if (options?.includeElectrical) {
                const tonnage = options?.tonnage || 1;
                const breakerId = tonnage <= 1 ? 'breaker_20' : tonnage <= 1.5 ? 'breaker_30' : 'breaker_40';
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === breakerId)!, quantity: 1 });
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'cable_10')!, quantity: 10 });
                suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'mo_electrica')!, quantity: 1 });
            }
            break;

        case 'Mantenimiento':
            suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'mo_manto_profundo')!, quantity: 1 });
            suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'limpiador_evap')!, quantity: 1 });
            break;

        case 'Reparación':
            suggestions.push({ ...ITEM_DATABASE.find(i => i.id === 'mo_diagnostico')!, quantity: 1 });
            break;
    }

    return suggestions.filter(Boolean);
};

// ============================================
// CALCULADORA DE VOLUMEN (BTU)
// ============================================

export interface VolumeCalculation {
    area: number;          // m²
    height: number;        // metros
    volume: number;        // m³
    climate: 'templado' | 'calido' | 'muy_calido';
    sunExposure: 'none' | 'moderate' | 'high';
    occupants: number;
    appliances: number;    // Cantidad de electrodomésticos
    recommendedBTU: number;
    recommendedTonnage: number;
}

const BTU_FACTORS = {
    templado: 500,
    calido: 600,
    muy_calido: 700,
};

const EXPOSURE_MULTIPLIERS = {
    none: 1.0,
    moderate: 1.1,
    high: 1.2,
};

export const calculateBTURequirement = (params: {
    area: number;
    height?: number;
    climate: 'templado' | 'calido' | 'muy_calido';
    sunExposure?: 'none' | 'moderate' | 'high';
    occupants?: number;
    appliances?: number;
}): VolumeCalculation => {
    const {
        area,
        height = 2.5,
        climate,
        sunExposure = 'moderate',
        occupants = 2,
        appliances = 0,
    } = params;

    const volume = area * height;

    // Base BTU
    let btu = area * BTU_FACTORS[climate];

    // Factor de exposición solar
    btu *= EXPOSURE_MULTIPLIERS[sunExposure];

    // Ajuste por ocupantes (600 BTU por persona adicional después de 2)
    if (occupants > 2) {
        btu += (occupants - 2) * 600;
    }

    // Ajuste por electrodomésticos (500 BTU cada uno)
    btu += appliances * 500;

    // Redondear a múltiplos de 1000
    const recommendedBTU = Math.ceil(btu / 1000) * 1000;

    // Convertir a toneladas
    const recommendedTonnage = recommendedBTU / 12000;

    return {
        area,
        height,
        volume,
        climate,
        sunExposure,
        occupants,
        appliances,
        recommendedBTU,
        recommendedTonnage: Math.round(recommendedTonnage * 2) / 2, // Redondear a 0.5
    };
};

// ============================================
// PERSISTENCIA EN FIRESTORE
// ============================================

export const saveQuote = async (quoteData: Omit<Quote, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + (quoteData.validity_days || QUOTE_CONFIG.defaultValidityDays));

        const docRef = await addDoc(collection(db, 'quotes'), {
            ...quoteData,
            createdAt: serverTimestamp(),
            validUntil,
        });
        console.log('Quote saved:', docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error saving quote:", e);
        throw e;
    }
};

export const updateQuoteStatus = async (
    quoteId: string,
    status: Quote['status']
): Promise<void> => {
    try {
        const quoteRef = doc(db, 'quotes', quoteId);
        await updateDoc(quoteRef, {
            status,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating quote status:", e);
        throw e;
    }
};

export const getUserQuotes = async (
    userId: string,
    limitCount: number = 20
): Promise<Quote[]> => {
    try {
        const q = query(
            collection(db, 'quotes'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
    } catch (e) {
        console.error("Error fetching quotes:", e);
        return [];
    }
};

// ============================================
// GENERACIÓN DE PDF (Placeholder)
// ============================================

export const generateQuotePDF = async (quote: Quote): Promise<string> => {
    // TODO: Implementar con expo-print
    // Por ahora retorna un placeholder
    console.log('Generating PDF for quote:', quote.id);
    return `https://example.com/quotes/${quote.id}.pdf`;
};
