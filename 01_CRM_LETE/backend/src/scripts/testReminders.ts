import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { checkReminders } from '../services/cronReminders';

const runTest = async () => {
    console.log("==========================================");
    console.log("🧪 TEST MANUAL: ENVIADOR DE RECORDATORIOS");
    console.log("==========================================");

    await checkReminders();

    console.log("\n==========================================");
    console.log("✅ Prueba finalizada.");
    process.exit(0);
};

runTest();