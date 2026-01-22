/**
 * Sync Chats - Chat Analyzer
 * Sincroniza mensajes de Evolution API a Supabase
 * CORREGIDO: Ajustado para usar rutas clásicas (findContacts/findChats)
 */

import axios from 'axios';
import { supabaseAdmin } from './supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuración Evolution API
const EVO_URL = process.env.EVOLUTION_URL || 'http://localhost:8080';
const EVO_APIKEY = process.env.EVOLUTION_APIKEY || '';
const EVO_INSTANCE = process.env.EVOLUTION_INSTANCE || 'LuzEnTuEspacio';

const api = axios.create({
    baseURL: EVO_URL,
    headers: { 'apikey': EVO_APIKEY }
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sincroniza los chats recientes de Evolution API a Supabase
 */
export const syncChats = async (): Promise<void> => {
    console.log('🔄 Iniciando sincronización de chats...');

    try {
        // Obtener contactos de Evolution
        let targets: any[] = [];

        try {
            // INTENTO 1: Ruta Clásica (Más probable que funcione en tu versión)
            const res = await api.post(`/contact/findContacts/${EVO_INSTANCE}`, {
                where: {}
            });
            targets = Array.isArray(res.data) ? res.data : [];
            console.log(`✅ ${targets.length} contactos encontrados via /contact/findContacts`);
        } catch (e: any) {
            console.log(`⚠️ Fallo en contactos (${e.response?.status || e.code}), probando chats...`);
            try {
                // INTENTO 2: Ruta de Chats Clásica
                const resChat = await api.post(`/chat/findChats/${EVO_INSTANCE}`, { where: {} });
                targets = Array.isArray(resChat.data) ? resChat.data : [];
                console.log(`✅ ${targets.length} chats encontrados via /chat/findChats`);
            } catch (errChat: any) {
                console.error('❌ No se pudo obtener datos de Evolution API');
                console.error(`   URL: ${EVO_URL}`);
                console.error(`   Error: ${errChat.response?.status} - ${errChat.response?.statusText || errChat.message}`);
                return;
            }
        }

        if (targets.length === 0) {
            console.log('⚠️ Lista vacía, Evolution no reporta contactos activos');
            return;
        }

        let syncedCount = 0;
        let errorCount = 0;

        for (const item of targets) {
            // Normalizar ID
            const rawId = item.id || item.remoteJid || item.key?.remoteJid;

            // Filtros de grupos y broadcast
            if (!rawId) continue;
            if (rawId.includes('@g.us')) continue;
            if (rawId.includes('@broadcast')) continue;
            if (rawId === 'status@broadcast') continue;

            let whatsappId = rawId.split('@')[0];

            // Fix México: 521 -> 52 (o recortar a 10 dígitos si prefieres)
            if (whatsappId.startsWith('521') && whatsappId.length === 13) {
                whatsappId = whatsappId.substring(3);
            }

            const nombre = item.pushName || item.name || item.notify || item.verifiedName || whatsappId;

            try {
                // Buscar o crear cliente en Supabase
                let clienteId = null;
                const { data: clientData } = await supabaseAdmin
                    .from('clientes')
                    .select('id')
                    .or(`whatsapp_id.eq.${whatsappId},telefono.eq.${whatsappId}`)
                    .maybeSingle();

                if (clientData) {
                    clienteId = clientData.id;
                } else {
                    const { data: newClient } = await supabaseAdmin
                        .from('clientes')
                        .insert({
                            whatsapp_id: whatsappId,
                            telefono: whatsappId,
                            nombre: nombre,
                            crm_status: 'IMPORTED',
                            crm_intent: 'NONE'
                        })
                        .select('id')
                        .single();
                    if (newClient) clienteId = newClient.id;
                }

                if (!clienteId) continue;

                // Obtener mensajes recientes (últimos 15)
                const resMsgs = await api.post(`/chat/findMessages/${EVO_INSTANCE}`, {
                    where: { key: { remoteJid: rawId } },
                    options: { limit: 15, sort: { order: 'DESC' } }
                });

                const messages = resMsgs.data;
                if (messages && Array.isArray(messages) && messages.length > 0) {
                    const msjsParaGuardar = [];

                    for (const msg of messages) {
                        let content = '';
                        const type = msg.messageType;

                        // Extracción robusta del contenido
                        if (type === 'conversation') content = msg.message?.conversation;
                        else if (type === 'extendedTextMessage') content = msg.message?.extendedTextMessage?.text;
                        else if (msg.message?.imageMessage) content = '📸 [Imagen]';
                        else if (msg.message?.audioMessage) content = '🎤 [Audio]';
                        else if (msg.message?.videoMessage) content = '🎥 [Video]';
                        else content = `[${type}]`;

                        if (!content) continue;

                        let timestamp = msg.messageTimestamp;
                        // Ajuste de timestamp
                        if (typeof timestamp === 'number' && timestamp < 10000000000) timestamp *= 1000;

                        msjsParaGuardar.push({
                            cliente_id: clienteId,
                            whatsapp_message_id: msg.key?.id || `sync_${Date.now()}_${Math.random()}`,
                            role: msg.key?.fromMe ? 'assistant' : 'user',
                            content: content,
                            created_at: new Date(timestamp).toISOString(),
                            status: 'read'
                        });
                    }

                    if (msjsParaGuardar.length > 0) {
                        await supabaseAdmin.from('mensajes_whatsapp')
                            .upsert(msjsParaGuardar, { onConflict: 'whatsapp_message_id', ignoreDuplicates: true });
                        syncedCount++;
                    }
                }

                await delay(50); // Pequeña pausa
            } catch (error: any) {
                errorCount++;
            }
        }

        console.log(`✅ Sincronización completada: ${syncedCount} chats procesados, ${errorCount} errores`);

    } catch (error) {
        console.error('❌ Error general en sincronización:', error);
    }
};

// Ejecutar standalone
if (require.main === module) {
    syncChats().then(() => process.exit(0));
}