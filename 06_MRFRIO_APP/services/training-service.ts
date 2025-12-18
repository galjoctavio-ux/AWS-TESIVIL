/**
 * Training Service - Módulo de Micro-Capacitación "QRclima"
 * Gestiona los 40 temas de capacitación, quizzes y progreso
 */

import {
    isTrainingDataSeeded, seedTrainingModules, getTrainingModules,
    getTrainingModuleById, getQuizzesByModule, getOrCreateModuleProgress,
    updateTrainingProgress, getBlockCompletionStats, getUserTrainingProgress,
    TrainingModule, QuizQuestion, UserTrainingProgress
} from './database-service';
import { earnTokens } from './wallet-service';
import { ALL_TRAINING_DATA } from './training-data';

// Constantes de configuración
const QUIZ_COOLDOWN_HOURS = 1;
const READING_REQUIRED_PERCENT = 0.8; // 80% del tiempo estimado

// ============================================
// DATOS DE LOS 40 TEMAS - PARSEADOS DE cursos.txt
// ============================================

// Categorías y niveles por bloque
const BLOCK_CONFIG: { [key: number]: { category: string; level: string; name: string } } = {
    1: { category: 'HVAC', level: 'Básico', name: 'Tendencias y Tecnología' },
    2: { category: 'Negocio', level: 'Básico', name: 'Herramientas y Documentación' },
    3: { category: 'HVAC', level: 'Intermedio', name: 'Termodinámica y Diagnóstico' },
    4: { category: 'HVAC', level: 'Intermedio', name: 'Componentes y Fallas' },
    5: { category: 'HVAC', level: 'Avanzado', name: 'Sistemas Inverter' },
    6: { category: 'HVAC', level: 'Avanzado', name: 'Electrónica de Potencia' },
    7: { category: 'Electricidad', level: 'Básico', name: 'Electricidad Básica' },
    8: { category: 'Electricidad', level: 'Avanzado', name: 'Calidad de Energía' },
};

// Los 40 temas se cargan dinámicamente desde la base de datos
// La función seedInitialTrainingData() los carga desde cursos.txt

/**
 * Inicializa los datos de training si no existen
 */
export const initializeTrainingData = async (): Promise<boolean> => {
    try {
        const isSeeded = await isTrainingDataSeeded();
        if (isSeeded) {
            console.log('Training data already seeded.');
            return true;
        }

        console.log('Seeding training data...');
        await seedTrainingModules(ALL_TRAINING_DATA);
        console.log('Training data seeded successfully!');
        return true;
    } catch (error) {
        console.error('Error initializing training data:', error);
        return false;
    }
};

/**
 * Obtiene todos los módulos organizados por bloque
 */
export const getModulesByBlock = async (): Promise<{
    block: number;
    name: string;
    modules: TrainingModule[]
}[]> => {
    const allModules = await getTrainingModules();
    const grouped: Map<number, TrainingModule[]> = new Map();

    for (const mod of allModules) {
        if (!grouped.has(mod.block_number)) {
            grouped.set(mod.block_number, []);
        }
        grouped.get(mod.block_number)!.push(mod);
    }

    return Array.from(grouped.entries()).map(([block, modules]) => ({
        block,
        name: BLOCK_CONFIG[block]?.name || `Bloque ${block}`,
        modules
    })).sort((a, b) => a.block - b.block);
};

/**
 * Obtiene módulos filtrados por categoría
 */
export const getModulesByCategory = async (
    category: 'HVAC' | 'Electricidad' | 'Seguridad' | 'Negocio' | 'Herramientas' | 'Noticias'
): Promise<TrainingModule[]> => {
    return getTrainingModules(undefined, category);
};

/**
 * Inicia la lectura de un módulo
 */
export const startReading = async (userId: string, moduleId: number): Promise<void> => {
    await getOrCreateModuleProgress(userId, moduleId);
    await updateTrainingProgress(userId, moduleId, {
        status: 'reading',
        reading_started_at: new Date().toISOString()
    });
};

/**
 * Verifica si el usuario puede tomar el quiz
 */
export const canTakeQuiz = async (
    userId: string,
    moduleId: number,
    scrolledToEnd: boolean = false
): Promise<{ allowed: boolean; reason?: string; remainingSeconds?: number }> => {
    const progress = await getOrCreateModuleProgress(userId, moduleId);
    const module = await getTrainingModuleById(moduleId);

    if (!module) {
        return { allowed: false, reason: 'Módulo no encontrado' };
    }

    // Ya completado
    if (progress.status === 'completed') {
        return { allowed: false, reason: 'Ya completaste este módulo' };
    }

    // Verificar cooldown si falló anteriormente
    if (progress.status === 'failed' && progress.last_attempt_at) {
        const lastAttempt = new Date(progress.last_attempt_at);
        const cooldownEnd = new Date(lastAttempt.getTime() + QUIZ_COOLDOWN_HOURS * 60 * 60 * 1000);
        const now = new Date();

        if (now < cooldownEnd) {
            const remainingMs = cooldownEnd.getTime() - now.getTime();
            return {
                allowed: false,
                reason: 'Debes esperar antes de reintentar',
                remainingSeconds: Math.ceil(remainingMs / 1000)
            };
        }
    }

    // Si hizo scroll al final, permitir
    if (scrolledToEnd) {
        await updateTrainingProgress(userId, moduleId, { status: 'quiz_pending' });
        return { allowed: true };
    }

    // Verificar tiempo de lectura (80%)
    if (progress.reading_started_at) {
        const startTime = new Date(progress.reading_started_at);
        const requiredMs = module.estimated_time_minutes * 60 * 1000 * READING_REQUIRED_PERCENT;
        const elapsedMs = Date.now() - startTime.getTime();

        if (elapsedMs >= requiredMs) {
            await updateTrainingProgress(userId, moduleId, { status: 'quiz_pending' });
            return { allowed: true };
        }

        const remainingMs = requiredMs - elapsedMs;
        return {
            allowed: false,
            reason: 'Continúa leyendo el contenido',
            remainingSeconds: Math.ceil(remainingMs / 1000)
        };
    }

    return { allowed: false, reason: 'Inicia la lectura primero' };
};

/**
 * Envía respuestas del quiz y calcula resultado
 */
export const submitQuiz = async (
    userId: string,
    moduleId: number,
    answers: number[]
): Promise<{
    passed: boolean;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    tokensEarned: number;
    cooldownSeconds?: number;
}> => {
    const questions = await getQuizzesByModule(moduleId);
    const module = await getTrainingModuleById(moduleId);
    const progress = await getOrCreateModuleProgress(userId, moduleId);

    if (!module || questions.length === 0) {
        throw new Error('Módulo o preguntas no encontradas');
    }

    // Calcular respuestas correctas
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
        if (answers[i] === questions[i].correct_answer_index) {
            correctCount++;
        }
    }

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = correctCount === questions.length; // Solo 100% pasa

    const now = new Date().toISOString();
    let tokensEarned = 0;

    if (passed) {
        // Marcar como completado
        await updateTrainingProgress(userId, moduleId, {
            status: 'completed',
            quiz_score: score,
            quiz_attempts: progress.quiz_attempts + 1,
            last_attempt_at: now,
            completed_at: now,
            tokens_claimed: 1
        });

        // Otorgar tokens usando wallet-service
        const result = await earnTokens(userId, 'training_completed', `module_${moduleId}`);
        if (result.success) {
            tokensEarned = module.token_reward;
        }
    } else {
        // Marcar como fallido con cooldown
        await updateTrainingProgress(userId, moduleId, {
            status: 'failed',
            quiz_score: score,
            quiz_attempts: progress.quiz_attempts + 1,
            last_attempt_at: now
        });
    }

    return {
        passed,
        score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        tokensEarned,
        cooldownSeconds: passed ? undefined : QUIZ_COOLDOWN_HOURS * 60 * 60
    };
};

/**
 * Obtiene el progreso general del usuario
 */
export const getOverallProgress = async (userId: string): Promise<{
    completedModules: number;
    totalModules: number;
    totalTokensEarned: number;
    blockStats: { block: number; completed: number; total: number }[];
}> => {
    const allModules = await getTrainingModules();
    const userProgress = await getUserTrainingProgress(userId);
    const blockStats = await getBlockCompletionStats(userId);

    const completedModules = userProgress.filter(p => p.status === 'completed').length;
    const totalTokensEarned = userProgress
        .filter(p => p.tokens_claimed > 0)
        .reduce((sum, p) => sum + p.quiz_score, 0); // Aproximación

    return {
        completedModules,
        totalModules: allModules.length,
        totalTokensEarned,
        blockStats
    };
};

// Re-exportar tipos para uso externo
export type { TrainingModule, QuizQuestion, UserTrainingProgress };
export { getTrainingModuleById, getQuizzesByModule };
