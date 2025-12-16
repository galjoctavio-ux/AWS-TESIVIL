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
