import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// SISTEMA ANTI-FRAUDE "EL SHERIFF"
// Según master_plan.md - Módulo 7, Sección 3
// ============================================

export type FraudCheckResult = {
    passed: boolean;
    reason?: string;
    severity: 'low' | 'medium' | 'high';
    shouldBlock: boolean;
};

export type FraudLogEntry = {
    id?: string;
    userId: string;
    checkType: 'velocity' | 'geofence' | 'text_pattern' | 'duplicate';
    result: 'passed' | 'flagged' | 'blocked';
    details: string;
    referenceId?: string;
    createdAt: any;
};

// ============================================
// A. VELOCITY CHECKS (Bloqueo de Velocidad)
// "Nadie repara un aire acondicionado en 5 minutos"
// ============================================

const MINIMUM_SERVICE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutos mínimo entre servicios

/**
 * Verifica si hay servicios registrados demasiado rápido
 * Regla: Si hay 2 servicios con diferencia < 15 minutos, bloquea tokens
 */
export const checkVelocity = async (
    userId: string,
    referenceAction: 'service' | 'qr_link'
): Promise<FraudCheckResult> => {
    try {
        const now = new Date();
        const intervalAgo = new Date(now.getTime() - MINIMUM_SERVICE_INTERVAL_MS);

        // Buscar servicios/acciones recientes
        const collectionName = referenceAction === 'service' ? 'services' : 'equipments';
        const fieldName = referenceAction === 'service' ? 'technicianId' : 'linkedBy';

        const q = query(
            collection(db, collectionName),
            where(fieldName, '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(intervalAgo)),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const snapshot = await getDocs(q);

        if (snapshot.size >= 2) {
            // Hay 2+ servicios en menos de 15 minutos
            await logFraudEvent({
                userId,
                checkType: 'velocity',
                result: 'flagged',
                details: `${snapshot.size} acciones en menos de 15 minutos`,
            });

            return {
                passed: false,
                reason: 'Velocidad de registro sospechosa. Los tokens no se acreditarán.',
                severity: 'medium',
                shouldBlock: true, // Bloquea tokens pero permite el registro
            };
        }

        return { passed: true, severity: 'low', shouldBlock: false };
    } catch (error) {
        console.error('Error in velocity check:', error);
        // En caso de error, permitir (fail-open para no bloquear usuarios legítimos)
        return { passed: true, severity: 'low', shouldBlock: false };
    }
};

// ============================================
// B. GEOFENCING (Validación GPS)
// "No puedes reparar 3 equipos distintos desde el sofá"
// ============================================

interface GeoLocation {
    latitude: number;
    longitude: number;
}

const GEO_RADIUS_METERS = 20; // Radio máximo para considerar "misma ubicación"

/**
 * Calcula distancia entre dos puntos GPS (fórmula de Haversine simplificada)
 */
const calculateDistance = (loc1: GeoLocation, loc2: GeoLocation): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Verifica si múltiples servicios a diferentes clientes están en la misma ubicación
 * Regla: Si coord1 == coord2 (radio <20m) Y cliente es diferente → Bloqueo
 */
export const checkGeofence = async (
    userId: string,
    currentLocation: GeoLocation | null,
    clientId: string
): Promise<FraudCheckResult> => {
    // Si no hay ubicación, no podemos verificar (permitir)
    if (!currentLocation) {
        return { passed: true, severity: 'low', shouldBlock: false };
    }

    try {
        // Buscar servicios recientes del usuario
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'services'),
            where('technicianId', '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(today)),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const snapshot = await getDocs(q);

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();

            // Si es el mismo cliente, está bien (servicios múltiples al mismo cliente)
            if (data.clientId === clientId) continue;

            // Verificar ubicación
            if (data.location?.latitude && data.location?.longitude) {
                const distance = calculateDistance(currentLocation, {
                    latitude: data.location.latitude,
                    longitude: data.location.longitude,
                });

                if (distance < GEO_RADIUS_METERS) {
                    await logFraudEvent({
                        userId,
                        checkType: 'geofence',
                        result: 'flagged',
                        details: `Servicios a diferentes clientes desde la misma ubicación (${distance.toFixed(0)}m)`,
                    });

                    return {
                        passed: false,
                        reason: 'Ubicación sospechosa. Los tokens no se acreditarán.',
                        severity: 'high',
                        shouldBlock: true,
                    };
                }
            }
        }

        return { passed: true, severity: 'low', shouldBlock: false };
    } catch (error) {
        console.error('Error in geofence check:', error);
        return { passed: true, severity: 'low', shouldBlock: false };
    }
};

// ============================================
// C. DETECCIÓN DE PATRONES DE TEXTO
// Contenido basura como "asdasd", "test", "prueba"
// ============================================

const SPAM_PATTERNS = [
    /^[asdfghjkl]+$/i,           // Solo teclas del medio del teclado
    /^(.)\1{4,}$/,               // Mismo carácter repetido 5+ veces
    /^(test|prueba|asd|qwe|xxx|zzz|123|abc)$/i, // Palabras de prueba comunes
    /^[a-z]{1,3}$/i,             // Palabras muy cortas (1-3 letras)
];

const MINIMUM_DESCRIPTION_LENGTH = 5;

/**
 * Detecta patrones de texto spam o basura
 */
export const checkTextPattern = (text: string): FraudCheckResult => {
    if (!text || text.trim().length === 0) {
        return {
            passed: false,
            reason: 'La descripción no puede estar vacía',
            severity: 'low',
            shouldBlock: false,
        };
    }

    const cleanText = text.trim();

    // Verificar longitud mínima
    if (cleanText.length < MINIMUM_DESCRIPTION_LENGTH) {
        return {
            passed: false,
            reason: 'La descripción es muy corta',
            severity: 'low',
            shouldBlock: false,
        };
    }

    // Verificar patrones de spam
    for (const pattern of SPAM_PATTERNS) {
        if (pattern.test(cleanText)) {
            return {
                passed: false,
                reason: 'Contenido inválido detectado. Escribe una descripción real.',
                severity: 'medium',
                shouldBlock: true,
            };
        }
    }

    return { passed: true, severity: 'low', shouldBlock: false };
};

// ============================================
// D. VERIFICACIÓN DE DUPLICADOS
// ============================================

/**
 * Verifica si se está intentando registrar el mismo servicio dos veces
 */
export const checkDuplicate = async (
    userId: string,
    clientId: string,
    serviceType: string
): Promise<FraudCheckResult> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'services'),
            where('technicianId', '==', userId),
            where('clientId', '==', clientId),
            where('type', '==', serviceType),
            where('createdAt', '>=', Timestamp.fromDate(today)),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return {
                passed: false,
                reason: 'Ya existe un servicio similar para este cliente hoy.',
                severity: 'low',
                shouldBlock: false, // Advertir pero permitir
            };
        }

        return { passed: true, severity: 'low', shouldBlock: false };
    } catch (error) {
        console.error('Error in duplicate check:', error);
        return { passed: true, severity: 'low', shouldBlock: false };
    }
};

// ============================================
// E. LOGS DE AUDITORÍA
// ============================================

/**
 * Registra un evento de fraude detectado para auditoría
 */
export const logFraudEvent = async (
    event: Omit<FraudLogEntry, 'id' | 'createdAt'>
): Promise<void> => {
    try {
        await addDoc(collection(db, 'fraud_logs'), {
            ...event,
            createdAt: serverTimestamp(),
        });
        console.warn('⚠️ Fraud event logged:', event.checkType, event.details);
    } catch (error) {
        console.error('Error logging fraud event:', error);
    }
};

// ============================================
// F. VALIDACIÓN COMPLETA PRE-SERVICIO
// Ejecuta todas las verificaciones relevantes
// ============================================

export interface FullValidationParams {
    userId: string;
    clientId: string;
    serviceType: string;
    description?: string;
    location?: GeoLocation | null;
}

export const runFullValidation = async (
    params: FullValidationParams
): Promise<{
    canProceed: boolean;
    canEarnTokens: boolean;
    warnings: string[];
    blocks: string[];
}> => {
    const warnings: string[] = [];
    const blocks: string[] = [];
    let canEarnTokens = true;

    // 1. Velocity Check
    const velocityResult = await checkVelocity(params.userId, 'service');
    if (!velocityResult.passed) {
        if (velocityResult.shouldBlock) {
            blocks.push(velocityResult.reason || 'Velocidad sospechosa');
            canEarnTokens = false;
        } else {
            warnings.push(velocityResult.reason || 'Advertencia de velocidad');
        }
    }

    // 2. Geofence Check
    const geoResult = await checkGeofence(params.userId, params.location || null, params.clientId);
    if (!geoResult.passed) {
        if (geoResult.shouldBlock) {
            blocks.push(geoResult.reason || 'Ubicación sospechosa');
            canEarnTokens = false;
        } else {
            warnings.push(geoResult.reason || 'Advertencia de ubicación');
        }
    }

    // 3. Text Pattern Check
    if (params.description) {
        const textResult = checkTextPattern(params.description);
        if (!textResult.passed) {
            if (textResult.shouldBlock) {
                blocks.push(textResult.reason || 'Contenido inválido');
                canEarnTokens = false;
            } else {
                warnings.push(textResult.reason || 'Descripción insuficiente');
            }
        }
    }

    // 4. Duplicate Check
    const dupResult = await checkDuplicate(params.userId, params.clientId, params.serviceType);
    if (!dupResult.passed) {
        warnings.push(dupResult.reason || 'Posible duplicado');
    }

    return {
        canProceed: true, // Siempre permitimos el registro, solo bloqueamos tokens
        canEarnTokens,
        warnings,
        blocks,
    };
};
