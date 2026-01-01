/**
 * Script para limpiar TODOS los datos de prueba de Firestore y Auth
 * ⚠️ PELIGROSO: Esto borra TODO. Usar solo para reset pre-producción.
 * 
 * Ejecutar con:
 *   cd functions
 *   set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
 *   npx ts-node scripts/clean-test-data.ts
 * 
 * O descargar la clave de servicio desde Firebase Console:
 *   Project Settings > Service Accounts > Generate New Private Key
 */

import * as admin from 'firebase-admin';
import * as readline from 'readline';

// Colecciones a limpiar (en orden de dependencia)
const COLLECTIONS_TO_DELETE = [
    'services',              // Servicios registrados
    'equipments',            // Equipos vinculados a QR
    'clients',               // Clientes de técnicos
    'quotes',                // Cotizaciones PRO
    'cotizador_quotes',      // Cotizaciones Free
    'cotizador_concepts',    // Conceptos personalizados
    'token_transactions',    // Historial de tokens
    'payment_intents',       // Intentos de pago
    'orders',                // Órdenes de la tienda
    'qr_pdf_downloads',      // Historial de PDFs
    'community_threads',     // Threads de comunidad
    'sos_threads',           // Threads SOS
    'sos_comments',          // Comentarios SOS
    'community_failures',    // Fallas de comunidad
    'fraud_logs',            // Logs de fraude
    'password_resets',       // Reset de passwords pendientes
    'users',                 // Perfiles de usuarios (último)
];

// Inicializar Firebase Admin con credenciales del proyecto
// Requiere GOOGLE_APPLICATION_CREDENTIALS env var o usar gcloud auth
try {
    admin.initializeApp({
        projectId: 'mr-frio',
    });
} catch (e) {
    // Ya inicializado
}

const db = admin.firestore();

async function askConfirmation(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\n⚠️  ¡ADVERTENCIA CRÍTICA! ⚠️');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Este script BORRARÁ PERMANENTEMENTE:');
        console.log('  - Todos los usuarios de Firebase Auth');
        console.log('  - Todas las colecciones de Firestore listadas');
        console.log('  - Incluyendo subcolecciones (training progress, etc.)');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('\nColecciones a borrar:', COLLECTIONS_TO_DELETE.join(', '));
        console.log('\n');

        rl.question('Escribe "BORRAR TODO" para confirmar: ', (answer: string) => {
            rl.close();
            resolve(answer === 'BORRAR TODO');
        });
    });
}

async function deleteCollection(collectionPath: string, batchSize: number = 500): Promise<number> {
    const collectionRef = db.collection(collectionPath);
    let totalDeleted = 0;

    while (true) {
        const snapshot = await collectionRef.limit(batchSize).get();

        if (snapshot.empty) {
            break;
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        totalDeleted += snapshot.size;
        console.log(`  📄 ${collectionPath}: ${totalDeleted} documentos borrados...`);
    }

    return totalDeleted;
}

async function deleteUsersSubcollections() {
    console.log('\n🔄 Borrando subcolecciones de usuarios...');

    const usersSnapshot = await db.collection('users').get();
    let totalSubcollections = 0;

    for (const userDoc of usersSnapshot.docs) {
        // Borrar training progress
        const trainingRef = userDoc.ref.collection('training');
        const trainingSnapshot = await trainingRef.get();

        if (!trainingSnapshot.empty) {
            const batch = db.batch();
            trainingSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            totalSubcollections += trainingSnapshot.size;
        }
    }

    console.log(`  ✅ ${totalSubcollections} documentos de subcolecciones borrados`);
}

async function deleteAllAuthUsers(): Promise<number> {
    console.log('\n🔄 Borrando usuarios de Firebase Auth...');
    let totalDeleted = 0;
    let nextPageToken: string | undefined;

    try {
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

            if (listUsersResult.users.length === 0) {
                break;
            }

            for (const user of listUsersResult.users) {
                try {
                    await admin.auth().deleteUser(user.uid);
                    console.log(`  ❌ Auth: ${user.email || user.uid}`);
                    totalDeleted++;
                } catch (error) {
                    console.error(`  ⚠️ Error borrando ${user.uid}:`, error);
                }
            }

            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
    } catch (error) {
        console.error('  ⚠️ Error accediendo a Auth (necesitas credenciales de servicio):', error);
    }

    return totalDeleted;
}

async function cleanAllData() {
    const confirmed = await askConfirmation();

    if (!confirmed) {
        console.log('\n❌ Operación cancelada. No se borró nada.');
        return;
    }

    console.log('\n🚀 Iniciando limpieza completa...\n');

    const startTime = Date.now();
    const stats: Record<string, number> = {};

    // 1. Borrar subcolecciones primero
    await deleteUsersSubcollections();

    // 2. Borrar colecciones principales
    for (const collection of COLLECTIONS_TO_DELETE) {
        console.log(`\n📁 Limpiando: ${collection}`);
        try {
            stats[collection] = await deleteCollection(collection);
        } catch (error) {
            console.error(`  ❌ Error en ${collection}:`, error);
            stats[collection] = -1;
        }
    }

    // 3. Borrar usuarios de Auth
    stats['auth_users'] = await deleteAllAuthUsers();

    // Resumen final
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    📊 RESUMEN DE LIMPIEZA                  ');
    console.log('═══════════════════════════════════════════════════════════');

    let totalDocs = 0;
    for (const [key, count] of Object.entries(stats)) {
        if (count >= 0) {
            console.log(`  ${key}: ${count} documentos`);
            totalDocs += count;
        } else {
            console.log(`  ${key}: ❌ ERROR`);
        }
    }

    console.log('───────────────────────────────────────────────────────────');
    console.log(`  TOTAL: ${totalDocs} documentos borrados en ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ Base de datos lista para v1.0 en producción!\n');
}

cleanAllData()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
