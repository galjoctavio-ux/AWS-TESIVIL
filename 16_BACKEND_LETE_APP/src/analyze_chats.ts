/**
 * Analyze Chats - Chat Analyzer
 * Analiza los chats del día anterior y clasifica intenciones
 */

import { supabaseAdmin } from './supabaseClient';
import { analyzeChat, ChatIntent, AnalysisResult } from './groqService';

// Mapeo de intenciones a sugerencias predeterminadas
const getSuggestionTemplate = (intent: ChatIntent, clienteNombre: string, meta?: any): string => {
    switch (intent) {
        case 'cita_hoy':
            return `${clienteNombre} te recordamos que hoy es tu visita a las ${meta?.citaHora || '[hora]'}`;
        case 'fantasma':
            return 'Notamos que tuviste interés en nuestros servicios, ¿te interesa darle seguimiento?';
        case 'pendiente_autorizacion':
            return 'Tu cotización está próxima a caducar, ¿deseas agendarla para congelar el precio?';
        case 'agendado_sin_cita':
            return '⚠️ Este cliente quiere una cita pero no existe ningún caso en la agenda';
        default:
            return '';
    }
};

/**
 * Analiza todos los chats con actividad reciente
 */
export const analyzeAllChats = async (): Promise<void> => {
    console.log('🤖 Iniciando análisis de chats...');

    try {
        // Obtener fecha de ayer
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        ayer.setHours(0, 0, 0, 0);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Obtener clientes con mensajes de ayer
        const { data: clientesActivos, error: clientesError } = await supabaseAdmin
            .from('mensajes_whatsapp')
            .select('cliente_id')
            .gte('created_at', ayer.toISOString())
            .lt('created_at', hoy.toISOString())
            .not('cliente_id', 'is', null);

        if (clientesError) {
            console.error('❌ Error obteniendo clientes:', clientesError);
            return;
        }

        // Obtener IDs únicos
        const clienteIds = [...new Set(clientesActivos?.map(m => m.cliente_id) || [])];
        console.log(`📋 ${clienteIds.length} clientes con actividad ayer`);

        if (clienteIds.length === 0) {
            console.log('⚠️ No hay chats que analizar');
            return;
        }

        let analyzedCount = 0;
        let errorCount = 0;

        for (const clienteId of clienteIds) {
            try {
                console.log(`\n--- Procesando cliente: ${clienteId} ---`);

                // Obtener datos del cliente
                const { data: cliente, error: clienteError } = await supabaseAdmin
                    .from('clientes')
                    .select('id, nombre, telefono')
                    .eq('id', clienteId)
                    .single();

                if (clienteError) {
                    console.log(`⚠️ Error buscando cliente: ${clienteError.message}`);
                    continue;
                }
                if (!cliente) {
                    console.log(`⚠️ Cliente no encontrado en tabla 'clientes'`);
                    continue;
                }
                console.log(`👤 Cliente: ${cliente.nombre}`);

                // Obtener últimos 20 mensajes para contexto
                const { data: mensajes, error: mensajesError } = await supabaseAdmin
                    .from('mensajes_whatsapp')
                    .select('role, content, created_at')
                    .eq('cliente_id', clienteId)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (mensajesError) {
                    console.log(`⚠️ Error buscando mensajes: ${mensajesError.message}`);
                    continue;
                }
                if (!mensajes || mensajes.length === 0) {
                    console.log(`⚠️ Sin mensajes para este cliente`);
                    continue;
                }
                console.log(`💬 ${mensajes.length} mensajes encontrados`);

                // Verificar si tiene cita hoy
                const { data: citaHoy } = await supabaseAdmin
                    .from('visitas')
                    .select('hora_inicio')
                    .eq('cliente_id', clienteId)
                    .eq('fecha', new Date().toISOString().split('T')[0])
                    .maybeSingle();

                // Analizar con IA (La función ahora maneja sus propios reintentos internamente)
                const result: AnalysisResult = await analyzeChat(
                    cliente.nombre || 'Cliente',
                    mensajes.reverse(), // Orden cronológico
                    citaHoy ? { hora: citaHoy.hora_inicio } : null
                );

                // DEBUG: Mostrar resultado de IA
                console.log(`🔍 ${cliente.nombre}: intent=${result.intent}, confidence=${result.confidence}`);

                // Solo guardar si hay una acción pendiente
                if (result.intent !== 'sin_accion' && result.confidence > 0.5) {
                    // Obtener sugerencia mejorada
                    const sugerencia = result.suggestion || getSuggestionTemplate(
                        result.intent,
                        cliente.nombre || 'Cliente',
                        { citaHora: citaHoy?.hora_inicio }
                    );

                    // Guardar en analisis_chats
                    await supabaseAdmin.from('analisis_chats').upsert({
                        cliente_id: clienteId,
                        fecha_analisis: new Date().toISOString().split('T')[0],
                        intencion: result.intent,
                        sugerencia: sugerencia,
                        estado: 'pendiente',
                        meta: {
                            confidence: result.confidence,
                            citaHora: citaHoy?.hora_inicio
                        }
                    }, {
                        onConflict: 'cliente_id,fecha_analisis'
                    });

                    analyzedCount++;
                    console.log(`✅ ${cliente.nombre}: ${result.intent} (${Math.round(result.confidence * 100)}%)`);
                }

            } catch (error: any) {
                errorCount++;
                console.error(`❌ Error analizando cliente ${clienteId}:`, error.message);
            }
        }

        console.log(`\n🎉 Análisis completado: ${analyzedCount} clasificados, ${errorCount} errores`);

    } catch (error) {
        console.error('❌ Error general en análisis:', error);
    }
};

// Ejecutar standalone
if (require.main === module) {
    analyzeAllChats().then(() => process.exit(0));
}