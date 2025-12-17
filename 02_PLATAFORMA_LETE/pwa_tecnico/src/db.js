import Dexie from 'dexie';

// Base de datos offline para PWA Técnico
export const db = new Dexie('TesivilOfflineDB');

// Mantenemos el esquema original con auto-increment id
db.version(2).stores({
    borradores: '++id, &key, last_updated',
    cola_sincronizacion: '++id, tipo, status, retry_count, timestamp'
});

/**
 * Guarda un borrador genérico (upsert manual).
 * key: Un string único, ej: "cotizacion_draft" o "revision_55"
 * Primero elimina el registro existente (si hay) y luego inserta uno nuevo.
 */
export const guardarBorrador = async (key, data) => {
    // Eliminar el registro existente primero para evitar ConstraintError
    await db.borradores.where('key').equals(key).delete();
    // Insertar el nuevo registro
    await db.borradores.add({
        key: key,
        data: data,
        last_updated: new Date()
    });
};

/**
 * Recupera un borrador.
 */
export const obtenerBorrador = async (key) => {
    return await db.borradores.where('key').equals(key).first();
};

/**
 * Elimina un borrador (cuando ya se finalizó).
 */
export const eliminarBorrador = async (key) => {
    return await db.borradores.where('key').equals(key).delete();
};

/**
 * Encola un elemento para envío.
 * tipo: 'revision' | 'cotizacion'
 */
export const encolarParaEnvio = async (tipo, payload) => {
    return db.transaction('rw', db.cola_sincronizacion, async () => {
        await db.cola_sincronizacion.add({
            tipo: tipo,
            payload: payload,
            status: 'pending',
            retry_count: 0,
            timestamp: new Date()
        });
    });
};