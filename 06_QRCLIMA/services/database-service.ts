import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'qrclima.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
    if (!dbInstance) {
        dbInstance = await SQLite.openDatabaseAsync(DB_NAME, {
            useNewConnection: true
        });
    }
    return dbInstance;
};

export const loadDatabase = async () => {
    const dbName = DB_NAME;
    const dbAsset = require('../assets/database/qrclima.db');
    const dbUri = Asset.fromModule(dbAsset).uri;
    const dbDir = FileSystem.documentDirectory + 'SQLite';
    const dbPath = dbDir + '/' + dbName;

    try {
        // 1. Verificar si el directorio SQLite existe, si no, crearlo
        const dirInfo = await FileSystem.getInfoAsync(dbDir);
        if (!dirInfo.exists) {
            console.log('Creando directorio SQLite...');
            await FileSystem.makeDirectoryAsync(dbDir);
        }

        // 2. Verificar si la base de datos ya existe
        const dbInfo = await FileSystem.getInfoAsync(dbPath);
        if (!dbInfo.exists) {
            console.log('Copiando base de datos desde assets...');
            await FileSystem.downloadAsync(dbUri, dbPath);
            console.log('Base de datos copiada exitosamente.');
        } else {
            console.log('Base de datos ya existe, saltando copia.');
        }

        // 3. ASEGURAR SCHEMAS (MIGRACIONES)
        await createTables();

        // 4. Verificar y poblar datos faltantes (Carrier, York, LG)
        await seedMissingBrands();

        return true;
    } catch (error) {
        console.error('Error al cargar la base de datos:', error);
        throw error;
    }
};

const createTables = async () => {
    try {
        const db = await getDb();
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS air_conditioner_models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                reference_id TEXT,
                image_url TEXT,
                logo_url TEXT,
                type TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS error_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_id INTEGER NOT NULL,
                code TEXT NOT NULL,
                description TEXT,
                solution TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (model_id) REFERENCES air_conditioner_models (id)
            );

            -- =============================================
            -- MÓDULO DE CAPACITACIÓN "QRclima"
            -- =============================================
            
            -- Módulos de capacitación (40 temas base + noticias automáticas)
            CREATE TABLE IF NOT EXISTS training_modules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content_body TEXT NOT NULL,
                level TEXT CHECK(level IN ('Básico', 'Intermedio', 'Avanzado')) DEFAULT 'Básico',
                category TEXT CHECK(category IN ('HVAC', 'Electricidad', 'Seguridad', 'Negocio', 'Herramientas', 'Noticias')) DEFAULT 'HVAC',
                block_number INTEGER DEFAULT 1,
                token_reward INTEGER DEFAULT 10,
                estimated_time_minutes INTEGER DEFAULT 5,
                is_automated INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Preguntas de quiz (3 por módulo)
            CREATE TABLE IF NOT EXISTS quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module_id INTEGER NOT NULL,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_answer_index INTEGER NOT NULL,
                FOREIGN KEY (module_id) REFERENCES training_modules (id)
            );

            -- Progreso del usuario en training (SQLite local) 
            CREATE TABLE IF NOT EXISTS user_training_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                module_id INTEGER NOT NULL,
                status TEXT CHECK(status IN ('not_started', 'reading', 'quiz_pending', 'failed', 'completed')) DEFAULT 'not_started',
                reading_started_at DATETIME,
                quiz_score INTEGER DEFAULT 0,
                quiz_attempts INTEGER DEFAULT 0,
                last_attempt_at DATETIME,
                tokens_claimed INTEGER DEFAULT 0,
                completed_at DATETIME,
                UNIQUE(user_id, module_id),
                FOREIGN KEY (module_id) REFERENCES training_modules (id)
            );

            -- Posts/Comentarios en módulos de training
            CREATE TABLE IF NOT EXISTS training_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module_id INTEGER NOT NULL,
                user_id TEXT NOT NULL,
                user_name TEXT,
                parent_id INTEGER REFERENCES training_posts(id),
                content TEXT NOT NULL,
                status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
                expert_badge INTEGER DEFAULT 0,
                ai_reason TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (module_id) REFERENCES training_modules (id)
            );

            -- Reacciones técnicas (Maestro, Tal cual, Interesante)
            CREATE TABLE IF NOT EXISTS training_reactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id TEXT NOT NULL,
                reaction_type TEXT CHECK(reaction_type IN ('maestro', 'tal_cual', 'interesante')) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(post_id, user_id),
                FOREIGN KEY (post_id) REFERENCES training_posts (id)
            );

            -- Deduplicación de noticias automáticas (para cron futuro)
            CREATE TABLE IF NOT EXISTS news_hash_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_hash TEXT UNIQUE NOT NULL,
                source_url TEXT,
                published_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Tablas verificadas/creadas exitosamente (incluye Training QRclima).");
    } catch (error) {
        console.error("Error creando tablas:", error);
    }
};

const seedMissingBrands = async () => {
    try {
        const db = await getDb();
        console.log("Checking for missing brand data...");

        // CARRIER
        const carrierCheck = await db.getAllAsync<{ count: number }>(
            "SELECT count(*) as count FROM air_conditioner_models WHERE logo_url LIKE '%carrier%' OR reference_id LIKE '%carrier%'"
        );
        if (carrierCheck[0].count === 0) {
            console.log("Seeding Carrier data...");
            const carrierData = require('../assets/data/data_carrier.json');
            await insertBrandData(db, carrierData);
        }

        // YORK
        const yorkCheck = await db.getAllAsync<{ count: number }>(
            "SELECT count(*) as count FROM air_conditioner_models WHERE logo_url LIKE '%york%' OR reference_id LIKE '%york%'"
        );
        if (yorkCheck[0].count === 0) {
            console.log("Seeding York data...");
            const yorkData = require('../assets/data/data_york.json');
            await insertBrandData(db, yorkData);
        }

        // LG
        const lgCheck = await db.getAllAsync<{ count: number }>(
            "SELECT count(*) as count FROM air_conditioner_models WHERE logo_url LIKE '%lg%' OR reference_id LIKE '%lg%'"
        );
        if (lgCheck[0].count === 0) {
            console.log("Seeding LG data...");
            const lgData = require('../assets/data/data_lg.json');
            await insertBrandData(db, lgData);
        }

    } catch (error) {
        console.error("Error seeding brands:", error);
    }
};

const insertBrandData = async (db: SQLite.SQLiteDatabase, data: any[]) => {
    for (const model of data) {
        // Insert Model
        const result = await db.runAsync(
            'INSERT INTO air_conditioner_models (name, reference_id, type, image_url, logo_url) VALUES (?, ?, ?, ?, ?)',
            [model.nombre_comercial, model.id_referencia, model.tipo, model.imagen_local, model.logo_local]
        );
        const modelId = result.lastInsertRowId;

        // Insert Errors
        if (model.errores && Array.isArray(model.errores)) {
            for (const error of model.errores) {
                await db.runAsync(
                    'INSERT INTO error_codes (model_id, code, description, solution) VALUES (?, ?, ?, ?)',
                    [modelId, error.codigo, error.descripcion, error.solucion]
                );
            }
        }
    }
};

export const searchError = async (codePart: string) => {
    try {
        const db = await getDb();
        const searchTerm = `%${codePart}%`;
        const result = await db.getAllAsync(
            'SELECT * FROM error_codes WHERE code LIKE ? LIMIT 10',
            [searchTerm]
        );
        return result;
    } catch (error) {
        console.error('Error searching error:', error);
        return [];
    }
};

// ============================================
// BIBLIOTECA DE ERRORES - FUNCIONES ADICIONALES
// ============================================

export interface BrandData {
    name: string;
    logo_url: string;
    model_count: number;
    displayName: string;
}

export interface ModelData {
    id: number;
    name: string;
    reference_id: string;
    image_url: string;
    logo_url: string;
    type: string;
}

export interface ErrorCodeData {
    id: number;
    model_id: number;
    code: string;
    description: string;
    solution: string;
}

// Definición de las 4 marcas principales
const BRAND_CONFIG = [
    {
        name: 'MIRAGE',
        displayName: 'Mirage',
        logo_url: '/images/logos/mirage.png',
        logoPattern: ['mirage', 'absolutv', 'abtx', 'flex', 'magnum', 'life', 'titanium', 'x2', 'x3', 'xlife', 'xmart', 'xmax', 'xone', 'xplus', 'xr', 'xtra', 'vox', 'ciseries', 'inverter', 'smart', 'neo', 'nex', 'flux', 'bluplus', 'vlu', 'uvc', 'matt', 'max', 'mpt', 'live']
    },
    {
        name: 'YORK',
        displayName: 'York',
        logo_url: '/images/logos/york_logo.png',
        logoPattern: ['york']
    },
    {
        name: 'LG',
        displayName: 'LG',
        logo_url: '/images/logos/logo_lg.png',
        logoPattern: ['lg']
    },
    {
        name: 'CARRIER',
        displayName: 'Carrier',
        logo_url: '/images/logos/carrier_logo.png',
        logoPattern: ['carrier']
    }
];

/**
 * Determina la marca de un modelo basado en su logo_url o reference_id
 */
const getBrandForModel = (logoUrl: string, referenceId: string): string => {
    const lowerLogo = logoUrl.toLowerCase();
    const lowerRef = referenceId.toLowerCase();

    // Check for York, LG, Carrier first (more specific)
    if (lowerLogo.includes('york') || lowerRef.includes('york')) return 'YORK';
    if (lowerLogo.includes('lg') || lowerRef.includes('lg')) return 'LG';
    if (lowerLogo.includes('carrier') || lowerRef.includes('carrier')) return 'CARRIER';

    // Default to Mirage (all other models are Mirage)
    return 'MIRAGE';
};

/**
 * Obtiene las 4 marcas principales con sus logos y conteo de modelos
 */
export const getBrands = async (): Promise<BrandData[]> => {
    try {
        const db = await getDb();

        // Obtener todos los modelos para contar por marca
        const allModels = await db.getAllAsync<{ logo_url: string; reference_id: string }>(
            'SELECT logo_url, reference_id FROM air_conditioner_models'
        );

        // Contar modelos por marca
        const brandCounts: { [key: string]: number } = {
            'MIRAGE': 0,
            'YORK': 0,
            'LG': 0,
            'CARRIER': 0
        };

        for (const model of allModels) {
            const brand = getBrandForModel(model.logo_url, model.reference_id);
            brandCounts[brand]++;
        }

        // Construir resultado con las marcas
        const result: BrandData[] = BRAND_CONFIG.map(brand => ({
            name: brand.name,
            displayName: brand.displayName,
            logo_url: brand.logo_url,
            model_count: brandCounts[brand.name] || 0
        }));

        // Ordenar por cantidad de modelos (Mirage primero)
        result.sort((a, b) => b.model_count - a.model_count);

        return result;
    } catch (error) {
        console.error('Error getting brands:', error);
        return [];
    }
};

/**
 * Obtiene todos los modelos de una marca específica
 */
export const getModelsByBrand = async (brandName: string): Promise<ModelData[]> => {
    try {
        const db = await getDb();

        // Obtener todos los modelos
        const allModels = await db.getAllAsync<ModelData>(
            'SELECT * FROM air_conditioner_models ORDER BY name'
        );

        // Filtrar por marca
        const filteredModels = allModels.filter(model => {
            const modelBrand = getBrandForModel(model.logo_url, model.reference_id);
            return modelBrand === brandName.toUpperCase();
        });

        return filteredModels;
    } catch (error) {
        console.error('Error getting models by brand:', error);
        return [];
    }
};

/**
 * Obtiene todos los códigos de error para un modelo específico
 */
export const getErrorsByModel = async (modelId: number): Promise<ErrorCodeData[]> => {
    try {
        const db = await getDb();
        const result = await db.getAllAsync<ErrorCodeData>(
            'SELECT * FROM error_codes WHERE model_id = ? ORDER BY code',
            [modelId]
        );
        return result;
    } catch (error) {
        console.error('Error getting errors by model:', error);
        return [];
    }
};

/**
 * Búsqueda predictiva de errores con filtro opcional por modelo
 */
export const searchErrorsInModel = async (codePart: string, modelId?: number): Promise<ErrorCodeData[]> => {
    try {
        const db = await getDb();
        const searchTerm = `%${codePart}%`;

        if (modelId) {
            const result = await db.getAllAsync<ErrorCodeData>(
                'SELECT * FROM error_codes WHERE model_id = ? AND code LIKE ? ORDER BY code LIMIT 20',
                [modelId, searchTerm]
            );
            return result;
        } else {
            const result = await db.getAllAsync<ErrorCodeData>(
                'SELECT * FROM error_codes WHERE code LIKE ? ORDER BY code LIMIT 20',
                [searchTerm]
            );
            return result;
        }
    } catch (error) {
        console.error('Error searching errors:', error);
        return [];
    }
};

export const getModelById = async (modelId: number): Promise<ModelData | null> => {
    try {
        const db = await getDb();
        const result = await db.getFirstAsync<ModelData>(
            'SELECT * FROM air_conditioner_models WHERE id = ?',
            [modelId]
        );
        return result || null;
    } catch (error) {
        console.error('Error getting model by id:', error);
        return null;
    }
};

// ============================================
// MÓDULO DE CAPACITACIÓN "QRclima" - FUNCIONES
// ============================================

export interface TrainingModule {
    id: number;
    title: string;
    content_body: string;
    level: 'Básico' | 'Intermedio' | 'Avanzado';
    category: 'HVAC' | 'Electricidad' | 'Seguridad' | 'Negocio' | 'Herramientas' | 'Noticias';
    block_number: number;
    token_reward: number;
    estimated_time_minutes: number;
    is_automated: number;
}

export interface QuizQuestion {
    id: number;
    module_id: number;
    question: string;
    options: string; // JSON string
    correct_answer_index: number;
}

export interface UserTrainingProgress {
    id: number;
    user_id: string;
    module_id: number;
    status: 'not_started' | 'reading' | 'quiz_pending' | 'failed' | 'completed';
    reading_started_at?: string;
    quiz_score: number;
    quiz_attempts: number;
    last_attempt_at?: string;
    tokens_claimed: number;
    completed_at?: string;
}

export interface TrainingPost {
    id: number;
    module_id: number;
    user_id: string;
    user_name?: string;
    parent_id?: number;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    expert_badge: number;
    ai_reason?: string;
    created_at: string;
}

export interface TrainingReaction {
    id: number;
    post_id: number;
    user_id: string;
    reaction_type: 'maestro' | 'tal_cual' | 'interesante';
    created_at: string;
}

/**
 * Verifica si los módulos de training ya están cargados
 */
export const isTrainingDataSeeded = async (): Promise<boolean> => {
    try {
        const db = await getDb();
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM training_modules'
        );
        return (result?.count || 0) > 0;
    } catch (error) {
        console.error('Error checking training data:', error);
        return false;
    }
};

/**
 * Carga los 40 temas iniciales de training
 * Esta función parsea los datos del array proporcionado
 */
export const seedTrainingModules = async (modules: {
    title: string;
    content: string;
    level: string;
    category: string;
    block: number;
    tokens: number;
    time: number;
    questions: { question: string; options: string[]; correctIndex: number }[];
}[]): Promise<void> => {
    try {
        const db = await getDb();

        for (const mod of modules) {
            // Insert module
            const result = await db.runAsync(
                `INSERT INTO training_modules (title, content_body, level, category, block_number, token_reward, estimated_time_minutes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [mod.title, mod.content, mod.level, mod.category, mod.block, mod.tokens, mod.time]
            );
            const moduleId = result.lastInsertRowId;

            // Insert quiz questions
            for (const q of mod.questions) {
                await db.runAsync(
                    `INSERT INTO quizzes (module_id, question, options, correct_answer_index) VALUES (?, ?, ?, ?)`,
                    [moduleId, q.question, JSON.stringify(q.options), q.correctIndex]
                );
            }
        }
        console.log(`Seeded ${modules.length} training modules with quizzes.`);
    } catch (error) {
        console.error('Error seeding training modules:', error);
        throw error;
    }
};

/**
 * Obtiene todos los módulos de training, opcionalmente filtrados
 */
export const getTrainingModules = async (
    blockNumber?: number,
    category?: string
): Promise<TrainingModule[]> => {
    try {
        const db = await getDb();
        let query = 'SELECT * FROM training_modules';
        const params: any[] = [];

        if (blockNumber && category) {
            query += ' WHERE block_number = ? AND category = ?';
            params.push(blockNumber, category);
        } else if (blockNumber) {
            query += ' WHERE block_number = ?';
            params.push(blockNumber);
        } else if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY block_number, id';
        const result = await db.getAllAsync<TrainingModule>(query, params);
        return result;
    } catch (error) {
        console.error('Error getting training modules:', error);
        return [];
    }
};

/**
 * Obtiene un módulo específico por ID
 */
export const getTrainingModuleById = async (moduleId: number): Promise<TrainingModule | null> => {
    try {
        const db = await getDb();
        const result = await db.getFirstAsync<TrainingModule>(
            'SELECT * FROM training_modules WHERE id = ?',
            [moduleId]
        );
        return result || null;
    } catch (error) {
        console.error('Error getting training module:', error);
        return null;
    }
};

/**
 * Obtiene las preguntas del quiz para un módulo
 */
export const getQuizzesByModule = async (moduleId: number): Promise<QuizQuestion[]> => {
    try {
        const db = await getDb();
        const result = await db.getAllAsync<QuizQuestion>(
            'SELECT * FROM quizzes WHERE module_id = ? ORDER BY id',
            [moduleId]
        );
        return result;
    } catch (error) {
        console.error('Error getting quizzes:', error);
        return [];
    }
};

/**
 * Obtiene el progreso del usuario para todos los módulos
 */
export const getUserTrainingProgress = async (userId: string): Promise<UserTrainingProgress[]> => {
    try {
        const db = await getDb();
        const result = await db.getAllAsync<UserTrainingProgress>(
            'SELECT * FROM user_training_progress WHERE user_id = ?',
            [userId]
        );
        return result;
    } catch (error) {
        console.error('Error getting user progress:', error);
        return [];
    }
};

/**
 * Obtiene o crea el progreso para un módulo específico
 */
export const getOrCreateModuleProgress = async (
    userId: string,
    moduleId: number
): Promise<UserTrainingProgress> => {
    try {
        const db = await getDb();
        let progress = await db.getFirstAsync<UserTrainingProgress>(
            'SELECT * FROM user_training_progress WHERE user_id = ? AND module_id = ?',
            [userId, moduleId]
        );

        if (!progress) {
            await db.runAsync(
                `INSERT INTO user_training_progress (user_id, module_id, status, quiz_score, quiz_attempts, tokens_claimed) 
                 VALUES (?, ?, 'not_started', 0, 0, 0)`,
                [userId, moduleId]
            );
            progress = await db.getFirstAsync<UserTrainingProgress>(
                'SELECT * FROM user_training_progress WHERE user_id = ? AND module_id = ?',
                [userId, moduleId]
            );
        }

        return progress!;
    } catch (error) {
        console.error('Error getting/creating progress:', error);
        throw error;
    }
};

/**
 * Actualiza el progreso del usuario
 */
export const updateTrainingProgress = async (
    userId: string,
    moduleId: number,
    updates: Partial<Pick<UserTrainingProgress, 'status' | 'reading_started_at' | 'quiz_score' | 'quiz_attempts' | 'last_attempt_at' | 'tokens_claimed' | 'completed_at'>>
): Promise<void> => {
    try {
        const db = await getDb();
        const setClauses: string[] = [];
        const params: any[] = [];

        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                setClauses.push(`${key} = ?`);
                params.push(value);
            }
        }

        if (setClauses.length === 0) return;

        params.push(userId, moduleId);
        await db.runAsync(
            `UPDATE user_training_progress SET ${setClauses.join(', ')} WHERE user_id = ? AND module_id = ?`,
            params
        );
    } catch (error) {
        console.error('Error updating progress:', error);
        throw error;
    }
};

/**
 * Obtiene el conteo de módulos completados por bloque
 */
export const getBlockCompletionStats = async (userId: string): Promise<{ block: number; completed: number; total: number }[]> => {
    try {
        const db = await getDb();

        // Get all blocks with their module counts
        const blocks = await db.getAllAsync<{ block_number: number; total: number }>(
            `SELECT block_number, COUNT(*) as total FROM training_modules GROUP BY block_number ORDER BY block_number`
        );

        // Get completed counts per block
        const completed = await db.getAllAsync<{ block_number: number; completed: number }>(
            `SELECT tm.block_number, COUNT(*) as completed 
             FROM user_training_progress utp 
             JOIN training_modules tm ON utp.module_id = tm.id 
             WHERE utp.user_id = ? AND utp.status = 'completed' 
             GROUP BY tm.block_number`,
            [userId]
        );

        const completedMap = new Map(completed.map(c => [c.block_number, c.completed]));

        return blocks.map(b => ({
            block: b.block_number,
            completed: completedMap.get(b.block_number) || 0,
            total: b.total
        }));
    } catch (error) {
        console.error('Error getting block stats:', error);
        return [];
    }
};

// ============================================
// TRAINING POSTS (COMUNIDAD)
// ============================================

/**
 * Agrega un nuevo post/comentario de training
 */
export const addTrainingPost = async (
    moduleId: number,
    userId: string,
    userName: string,
    content: string,
    status: 'pending' | 'approved' | 'rejected' = 'pending',
    expertBadge: number = 0,
    parentId?: number,
    aiReason?: string
): Promise<number> => {
    try {
        const db = await getDb();
        const result = await db.runAsync(
            `INSERT INTO training_posts (module_id, user_id, user_name, content, status, expert_badge, parent_id, ai_reason) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [moduleId, userId, userName, content, status, expertBadge, parentId || null, aiReason || null]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('Error adding training post:', error);
        throw error;
    }
};

/**
 * Obtiene posts aprobados para un módulo
 */
export const getTrainingPosts = async (moduleId: number): Promise<TrainingPost[]> => {
    try {
        const db = await getDb();
        const result = await db.getAllAsync<TrainingPost>(
            `SELECT * FROM training_posts WHERE module_id = ? AND status = 'approved' ORDER BY created_at DESC`,
            [moduleId]
        );
        return result;
    } catch (error) {
        console.error('Error getting training posts:', error);
        return [];
    }
};

/**
 * Actualiza el status de un post (para moderación)
 */
export const updateTrainingPostStatus = async (
    postId: number,
    status: 'pending' | 'approved' | 'rejected',
    aiReason?: string,
    expertBadge?: number
): Promise<void> => {
    try {
        const db = await getDb();
        await db.runAsync(
            `UPDATE training_posts SET status = ?, ai_reason = ?, expert_badge = COALESCE(?, expert_badge) WHERE id = ?`,
            [status, aiReason || null, expertBadge ?? null, postId]
        );
    } catch (error) {
        console.error('Error updating post status:', error);
        throw error;
    }
};

/**
 * Agrega una reacción a un post
 */
export const addTrainingReaction = async (
    postId: number,
    userId: string,
    reactionType: 'maestro' | 'tal_cual' | 'interesante'
): Promise<boolean> => {
    try {
        const db = await getDb();
        await db.runAsync(
            `INSERT OR REPLACE INTO training_reactions (post_id, user_id, reaction_type) VALUES (?, ?, ?)`,
            [postId, userId, reactionType]
        );
        return true;
    } catch (error) {
        console.error('Error adding reaction:', error);
        return false;
    }
};

/**
 * Obtiene las reacciones de un post con conteo
 */
export const getTrainingReactions = async (postId: number): Promise<{ maestro: number; tal_cual: number; interesante: number }> => {
    try {
        const db = await getDb();
        const result = await db.getAllAsync<{ reaction_type: string; count: number }>(
            `SELECT reaction_type, COUNT(*) as count FROM training_reactions WHERE post_id = ? GROUP BY reaction_type`,
            [postId]
        );

        const counts = { maestro: 0, tal_cual: 0, interesante: 0 };
        for (const r of result) {
            if (r.reaction_type in counts) {
                counts[r.reaction_type as keyof typeof counts] = r.count;
            }
        }
        return counts;
    } catch (error) {
        console.error('Error getting reactions:', error);
        return { maestro: 0, tal_cual: 0, interesante: 0 };
    }
};
