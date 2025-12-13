import dotenv from 'dotenv';
import path from 'path';

// Aseguramos que cargue las variables de entorno (.env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { runNightlyAnalysis } from '../services/cronAnalysis';

const runTest = async () => {
    console.log("==========================================");
    console.log("🧪 TEST MANUAL: CEREBRO IA (CRON ANALYSIS)");
    console.log("==========================================");

    // Ejecutamos la función que acabamos de migrar
    await runNightlyAnalysis();

    console.log("\n==========================================");
    console.log("✅ Prueba finalizada.");
    process.exit(0);
};

runTest().catch((error) => {
    console.error("❌ Error fatal en la prueba:", error);
    process.exit(1);
});