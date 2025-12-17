import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// TIPOS Y CONSTANTES según master_plan.md
// Módulo 7: Economía de Tokens
// ============================================

export type TransactionType =
    | 'service_registered'      // +10 tokens
    | 'sos_thread_created'      // +20 tokens  
    | 'sos_solution_accepted'   // +50 tokens
    | 'profile_completed'       // +100 tokens (una vez)
    | 'qr_linked'               // +15 tokens
    | 'training_completed'      // +5 tokens
    | 'store_purchase'          // Gasto (negativo)
    | 'admin_grant'             // Otorgado por admin
    | 'fraud_revoked';          // Revocado por fraude

export interface TokenTransaction {
    id?: string;
    userId: string;
    type: TransactionType;
    amount: number;              // Positivo = ganancia, Negativo = gasto
    description: string;
    referenceId?: string;        // ID del servicio, hilo, etc.
    createdAt: any;
}

// Reglas de emisión según master_plan.md - Tabla de Ganancias
export const EARN_RULES: Record<TransactionType, { amount: number; dailyLimit: number | null; description: string }> = {
    service_registered: { amount: 10, dailyLimit: 6, description: 'Registro de Servicio' },
    sos_thread_created: { amount: 20, dailyLimit: 1, description: 'Hilo SOS Creado' },
    sos_solution_accepted: { amount: 50, dailyLimit: null, description: 'Solución Aceptada' }, // Sin límite
    profile_completed: { amount: 100, dailyLimit: 1, description: 'Perfil Completado' }, // Una vez
    qr_linked: { amount: 15, dailyLimit: 10, description: 'QR Vinculado' },
    training_completed: { amount: 5, dailyLimit: null, description: 'Cápsula Completada' },
    store_purchase: { amount: 0, dailyLimit: null, description: 'Compra en Tienda' },
    admin_grant: { amount: 0, dailyLimit: null, description: 'Otorgado por Admin' },
    fraud_revoked: { amount: 0, dailyLimit: null, description: 'Revocado por Fraude' },
};

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Obtiene el balance de tokens del usuario
 */
export const getTokenBalance = async (userId: string): Promise<number> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data()?.tokenBalance || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error getting token balance:', error);
        return 0;
    }
};

/**
 * Obtiene el historial de transacciones (Ledger)
 */
export const getTransactionHistory = async (
    userId: string,
    limitCount: number = 20
): Promise<TokenTransaction[]> => {
    try {
        const q = query(
            collection(db, 'token_transactions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const transactions: TokenTransaction[] = [];

        snapshot.forEach(docSnap => {
            transactions.push({ id: docSnap.id, ...docSnap.data() } as TokenTransaction);
        });

        return transactions;
    } catch (error) {
        console.error('Error getting transaction history:', error);
        return [];
    }
};

/**
 * Obtiene el conteo de transacciones del día para verificar límites
 */
export const getDailyTransactionCount = async (
    userId: string,
    type: TransactionType
): Promise<number> => {
    try {
        // Inicio del día actual
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'token_transactions'),
            where('userId', '==', userId),
            where('type', '==', type),
            where('createdAt', '>=', Timestamp.fromDate(today))
        );

        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting daily count:', error);
        return 0;
    }
};

/**
 * Otorga tokens al usuario con validación de límites
 * Retorna { success, message, newBalance }
 */
export const earnTokens = async (
    userId: string,
    type: TransactionType,
    referenceId?: string
): Promise<{ success: boolean; message: string; amount: number; newBalance?: number }> => {
    const rule = EARN_RULES[type];

    if (!rule || rule.amount <= 0) {
        return { success: false, message: 'Tipo de transacción inválido', amount: 0 };
    }

    try {
        // Verificar límite diario
        if (rule.dailyLimit !== null) {
            const dailyCount = await getDailyTransactionCount(userId, type);

            if (dailyCount >= rule.dailyLimit) {
                return {
                    success: false,
                    message: `Límite diario alcanzado (${rule.dailyLimit}/${rule.dailyLimit})`,
                    amount: 0
                };
            }
        }

        // Crear transacción
        const transaction: Omit<TokenTransaction, 'id'> = {
            userId,
            type,
            amount: rule.amount,
            description: rule.description,
            referenceId,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'token_transactions'), transaction);

        // Actualizar balance del usuario
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            tokenBalance: increment(rule.amount),
        });

        // Obtener nuevo balance
        const newBalance = await getTokenBalance(userId);

        return {
            success: true,
            message: `+${rule.amount} tokens por ${rule.description}`,
            amount: rule.amount,
            newBalance
        };
    } catch (error) {
        console.error('Error earning tokens:', error);
        return { success: false, message: 'Error al procesar tokens', amount: 0 };
    }
};

/**
 * Gasta tokens del usuario (para compras en tienda)
 */
export const spendTokens = async (
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
): Promise<{ success: boolean; message: string; newBalance?: number }> => {
    if (amount <= 0) {
        return { success: false, message: 'Monto inválido' };
    }

    try {
        // Verificar balance suficiente
        const currentBalance = await getTokenBalance(userId);

        if (currentBalance < amount) {
            return {
                success: false,
                message: `Balance insuficiente. Tienes ${currentBalance} tokens.`
            };
        }

        // Crear transacción (negativa)
        const transaction: Omit<TokenTransaction, 'id'> = {
            userId,
            type: 'store_purchase',
            amount: -amount,
            description,
            referenceId,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'token_transactions'), transaction);

        // Actualizar balance
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            tokenBalance: increment(-amount),
        });

        const newBalance = currentBalance - amount;

        return {
            success: true,
            message: `Compra exitosa: -${amount} tokens`,
            newBalance
        };
    } catch (error) {
        console.error('Error spending tokens:', error);
        return { success: false, message: 'Error al procesar compra' };
    }
};

/**
 * Calcula el nivel del usuario basado en tokens acumulados
 */
export const calculateLevel = (tokenBalance: number): { level: number; name: string; progress: number; nextLevelAt: number } => {
    const levels = [
        { threshold: 0, name: 'Novato' },
        { threshold: 100, name: 'Aprendiz' },
        { threshold: 300, name: 'Técnico' },
        { threshold: 600, name: 'Experto' },
        { threshold: 1000, name: 'Maestro' },
        { threshold: 2000, name: 'Leyenda' },
    ];

    let currentLevel = 0;
    let currentName = 'Novato';
    let nextLevelAt = 100;

    for (let i = levels.length - 1; i >= 0; i--) {
        if (tokenBalance >= levels[i].threshold) {
            currentLevel = i + 1;
            currentName = levels[i].name;
            nextLevelAt = levels[i + 1]?.threshold || levels[i].threshold;
            break;
        }
    }

    // Calcular progreso hacia el siguiente nivel
    const prevThreshold = levels[currentLevel - 1]?.threshold || 0;
    const progress = nextLevelAt > prevThreshold
        ? Math.min(100, ((tokenBalance - prevThreshold) / (nextLevelAt - prevThreshold)) * 100)
        : 100;

    return { level: currentLevel, name: currentName, progress, nextLevelAt };
};

/**
 * Obtiene estadísticas de tokens del usuario
 */
export const getTokenStats = async (userId: string): Promise<{
    balance: number;
    level: { level: number; name: string; progress: number; nextLevelAt: number };
    totalEarned: number;
    totalSpent: number;
}> => {
    try {
        const balance = await getTokenBalance(userId);
        const level = calculateLevel(balance);

        // Calcular totales (simplificado - en producción usar aggregation)
        const transactions = await getTransactionHistory(userId, 100);

        let totalEarned = 0;
        let totalSpent = 0;

        transactions.forEach(tx => {
            if (tx.amount > 0) totalEarned += tx.amount;
            else totalSpent += Math.abs(tx.amount);
        });

        return { balance, level, totalEarned, totalSpent };
    } catch (error) {
        console.error('Error getting token stats:', error);
        return {
            balance: 0,
            level: { level: 1, name: 'Novato', progress: 0, nextLevelAt: 100 },
            totalEarned: 0,
            totalSpent: 0
        };
    }
};
