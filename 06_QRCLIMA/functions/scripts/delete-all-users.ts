/**
 * Script para borrar todos los usuarios de Firebase Auth
 * Ejecutar con: npx ts-node scripts/delete-all-users.ts
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

async function deleteAllUsers() {
    console.log('🔄 Obteniendo lista de usuarios...');

    let totalDeleted = 0;
    let nextPageToken: string | undefined;

    do {
        // Obtener usuarios en lotes de 1000
        const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

        if (listUsersResult.users.length === 0) {
            console.log('No hay usuarios para borrar.');
            break;
        }

        // Borrar cada usuario
        for (const user of listUsersResult.users) {
            try {
                await admin.auth().deleteUser(user.uid);
                console.log(`  ❌ Borrado: ${user.email || user.uid}`);
                totalDeleted++;
            } catch (error) {
                console.error(`  ⚠️ Error borrando ${user.uid}:`, error);
            }
        }

        nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`\n✅ Total de usuarios borrados: ${totalDeleted}`);
}

deleteAllUsers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
