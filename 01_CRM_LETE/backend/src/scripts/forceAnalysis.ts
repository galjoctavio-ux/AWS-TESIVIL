import { runNightlyAnalysis } from '../services/cronAnalysis';

(async () => {
    console.log("🚀 --- FORZANDO EJECUCIÓN MANUAL DEL ANÁLISIS NOCTURNO ---");
    console.log("Se analizarán todos los chats reales según la lógica definida.");
    
    // Ejecuta la función real que creamos en cronAnalysis.ts
    await runNightlyAnalysis();
    
    console.log("✅ Ejecución manual finalizada.");
    process.exit(0);
})();

