/**
 * Daily Job - Chat Analyzer
 * Script maestro que ejecuta sincronización + análisis
 * Programar con cron: 0 3 * * * (3 AM diario)
 */

import { syncChats } from './sync_chats';
import { analyzeAllChats } from './analyze_chats';

const main = async (): Promise<void> => {
    const startTime = Date.now();
    console.log('═'.repeat(50));
    console.log('🌙 DAILY JOB - Luz en tu Espacio');
    console.log(`📅 ${new Date().toLocaleString('es-MX')}`);
    console.log('═'.repeat(50));

    try {
        // Fase 1: Sincronización
        console.log('\n📥 FASE 1: Sincronización de chats...\n');
        await syncChats();

        // Pequeña pausa entre fases
        await new Promise(r => setTimeout(r, 2000));

        // Fase 2: Análisis
        console.log('\n🤖 FASE 2: Análisis con IA...\n');
        await analyzeAllChats();

        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
        console.log('\n' + '═'.repeat(50));
        console.log(`✅ JOB COMPLETADO en ${duration} minutos`);
        console.log('═'.repeat(50));

    } catch (error) {
        console.error('❌ ERROR FATAL:', error);
        process.exit(1);
    }
};

main().then(() => process.exit(0));
