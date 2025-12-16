import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'mrfrio.db';

export const getDb = async () => {
    return await SQLite.openDatabaseAsync(DB_NAME);
};

export const loadDatabase = async () => {
    const dbName = DB_NAME;
    const dbAsset = require('../assets/database/mrfrio.db');
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

            // En desarrollo con Expo Go, a veces necesitamos descargar el asset si es remoto,
            // pero para assets locales bundler, downloadAsync suele funcionar bien o copyAsync si está en el bundle.
            // Asset.fromModule asegura que tenemos acceso.

            await FileSystem.downloadAsync(dbUri, dbPath);
            console.log('Base de datos copiada exitosamente.');
        } else {
            console.log('Base de datos ya existe, saltando copia.');
        }

        return true;
    } catch (error) {
        console.error('Error al cargar la base de datos:', error);
        throw error;
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

/**
 * Obtiene todas las marcas únicas con sus logos y conteo de modelos
 */
export const getBrands = async (): Promise<BrandData[]> => {
    try {
        const db = await getDb();
        // Extraemos el nombre de la marca del logo_url (ej: /images/logos/mirage.png -> mirage)
        const result = await db.getAllAsync<BrandData>(`
            SELECT 
                REPLACE(REPLACE(logo_url, '/images/logos/', ''), '.png', '') as name,
                logo_url,
                COUNT(*) as model_count
            FROM air_conditioner_models 
            GROUP BY logo_url
            ORDER BY model_count DESC
        `);
        return result;
    } catch (error) {
        console.error('Error getting brands:', error);
        return [];
    }
};

/**
 * Obtiene todos los modelos de una marca específica
 */
export const getModelsByBrand = async (logoUrl: string): Promise<ModelData[]> => {
    try {
        const db = await getDb();
        const result = await db.getAllAsync<ModelData>(
            'SELECT * FROM air_conditioner_models WHERE logo_url = ? ORDER BY name',
            [logoUrl]
        );
        return result;
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

/**
 * Obtiene un modelo por su ID
 */
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
