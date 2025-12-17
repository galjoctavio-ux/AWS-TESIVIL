import { doc, updateDoc, increment, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { earnTokens } from './wallet-service';

export interface TrainingCapsule {
    id: string;
    title: string;
    description: string;
    duration: string; // "30s"
    thumbnail: string; // Mock icon/color
    category: 'Técnico' | 'Seguridad' | 'Negocio' | 'Herramientas';
    rewardTokens: number;
    difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
}

// Cápsulas según master_plan.md - Módulo 1: Capacitación Ligera
const CAPSULES: TrainingCapsule[] = [
    // === TÉCNICO ===
    {
        id: 'c1',
        title: 'Buenas Prácticas de Vacío',
        description: 'Aprende por qué debes llegar a 500 micrones para evitar humedad en el sistema.',
        duration: '2 min',
        thumbnail: 'cube',
        category: 'Técnico',
        rewardTokens: 5,
        difficulty: 'Básico'
    },
    {
        id: 'c3',
        title: 'Carga de Gas R410A',
        description: 'Diferencias entre carga líquida y gaseosa. ¿Por qué voltear el tanque?',
        duration: '4 min',
        thumbnail: 'flask',
        category: 'Técnico',
        rewardTokens: 8,
        difficulty: 'Intermedio'
    },
    {
        id: 'c5',
        title: 'Mantenimiento de Drenajes',
        description: 'Técnicas para desobstruir bandejas de condensado llenas de lodo.',
        duration: '2 min',
        thumbnail: 'water',
        category: 'Técnico',
        rewardTokens: 5,
        difficulty: 'Básico'
    },
    {
        id: 'c6',
        title: 'Diagnóstico de Compresores',
        description: 'Identifica fallas comunes: amperaje, ruidos, y pruebas de bobinas.',
        duration: '5 min',
        thumbnail: 'speedometer',
        category: 'Técnico',
        rewardTokens: 10,
        difficulty: 'Avanzado'
    },
    {
        id: 'c7',
        title: 'Lectura de Presiones',
        description: 'Cómo interpretar manómetros de alta y baja correctamente.',
        duration: '3 min',
        thumbnail: 'thermometer',
        category: 'Técnico',
        rewardTokens: 6,
        difficulty: 'Intermedio'
    },

    // === SEGURIDAD ===
    {
        id: 'c2',
        title: 'Seguridad en Alturas',
        description: 'Uso correcto de arnés y línea de vida en instalaciones de tercer piso.',
        duration: '3 min',
        thumbnail: 'body',
        category: 'Seguridad',
        rewardTokens: 10,
        difficulty: 'Básico'
    },
    {
        id: 'c8',
        title: 'Manejo de Refrigerantes',
        description: 'Normas EPA y prácticas seguras para manipular refrigerantes.',
        duration: '4 min',
        thumbnail: 'warning',
        category: 'Seguridad',
        rewardTokens: 8,
        difficulty: 'Intermedio'
    },

    // === NEGOCIO ===
    {
        id: 'c4',
        title: 'Atención al Cliente',
        description: 'Cómo explicar una falla técnica sin usar tecnicismos para generar confianza.',
        duration: '1 min',
        thumbnail: 'people',
        category: 'Negocio',
        rewardTokens: 5,
        difficulty: 'Básico'
    },
    {
        id: 'c9',
        title: 'Cotizar Sin Perder Clientes',
        description: 'Estructura de precios que genera confianza y reduce objeciones.',
        duration: '3 min',
        thumbnail: 'cash',
        category: 'Negocio',
        rewardTokens: 7,
        difficulty: 'Intermedio'
    },
    {
        id: 'c10',
        title: 'Foto Evidencia Profesional',
        description: 'Qué fotografiar y cómo para proteger tu trabajo y tus garantías.',
        duration: '2 min',
        thumbnail: 'camera',
        category: 'Negocio',
        rewardTokens: 5,
        difficulty: 'Básico'
    },

    // === HERRAMIENTAS ===
    {
        id: 'c11',
        title: 'Uso del Multímetro',
        description: 'Mide voltaje, amperaje y continuidad correctamente.',
        duration: '4 min',
        thumbnail: 'flash',
        category: 'Herramientas',
        rewardTokens: 8,
        difficulty: 'Intermedio'
    },
    {
        id: 'c12',
        title: 'Tu Primera Bomba de Vacío',
        description: 'Guía de mantenimiento: cambio de aceite y cuidados básicos.',
        duration: '3 min',
        thumbnail: 'construct',
        category: 'Herramientas',
        rewardTokens: 6,
        difficulty: 'Básico'
    },
];

export const getCapsules = async (category?: string): Promise<TrainingCapsule[]> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (category && category !== 'Todos') {
        return CAPSULES.filter(c => c.category === category);
    }
    return CAPSULES;
};

export const completeCapsule = async (userId: string, capsuleId: string) => {
    // 1. Check if already completed
    const progressRef = doc(db, 'users', userId, 'training', capsuleId);
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
        throw new Error("Ya completaste esta cápsula anteriormente.");
    }

    const capsule = CAPSULES.find(c => c.id === capsuleId);
    if (!capsule) throw new Error("Cápsula no encontrada");

    // 2. Mark as complete with timestamp
    await setDoc(progressRef, {
        completedAt: serverTimestamp(),
        capsuleId,
        rewardEarned: capsule.rewardTokens
    });

    // 3. Award Tokens using wallet-service for proper ledger tracking
    const result = await earnTokens(userId, 'training_completed', capsuleId);

    if (!result.success) {
        console.warn('Token reward might have hit daily limit:', result.message);
        // Still return the expected amount (capsule was completed)
    }

    // 4. Update user stats
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        'stats.trainingCompleted': increment(1)
    });

    return capsule.rewardTokens;
};

/**
 * Obtiene el progreso de entrenamiento del usuario
 */
export const getTrainingProgress = async (userId: string): Promise<{
    completedCount: number;
    totalCount: number;
    completedIds: string[];
}> => {
    const completedIds: string[] = [];

    // En producción: obtener de subcollection 'training'
    // Por ahora, retornamos vacío (el UI maneja estado local)

    return {
        completedCount: completedIds.length,
        totalCount: CAPSULES.length,
        completedIds
    };
};

