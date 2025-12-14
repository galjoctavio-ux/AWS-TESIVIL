// src/controllers/integracion.controller.js
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '../services/supabaseClient.js';
import eaPool from '../services/eaDatabase.js';
import { sendNotificationToUser } from './notifications.controller.js';

export const agendarDesdeBot = async (req, res) => {
    const { cliente, caso, cita } = req.body;

    // Validaciones básicas de seguridad
    if (!cliente?.telefono || !cita?.fecha || !cita?.hora || !cita?.tecnico_id_ea) {
        return res.status(400).json({ error: 'Faltan datos obligatorios en el payload del Bot.' });
    }

    try {
        // =================================================================
        // 1. GESTIÓN DEL CLIENTE (SUPABASE)
        // =================================================================
        // 👇 2. LIMPIEZA DEL TELÉFONO (MEJORA SOLICITADA)
        // Primero quitamos todo lo que no sea número
        let telefonoLimpio = cliente.telefono.replace(/\D/g, '');

        // Si tiene 12 dígitos y empieza con 52 (Ej: 523312345678), quitamos el 52.
        // Si tiene 10 dígitos (Ej: 3312345678), lo dejamos igual.
        if (telefonoLimpio.length === 12 && telefonoLimpio.startsWith('52')) {
            telefonoLimpio = telefonoLimpio.substring(2);
        }

        // A) Definir los datos de dirección para INSERT/UPDATE
        const datosDireccion = {
            direccion_principal: cliente.direccion,
            google_maps_link: cliente.google_maps_link,
            ubicacion_lat: cliente.latitud || null, // Asumo que el payload ahora trae latitud
            ubicacion_lng: cliente.longitud || null, // Asumo que el payload ahora trae longitud
        };


        // B) Buscar si ya existe
        let { data: clienteDB, error: findError } = await supabaseAdmin
            .from('clientes')
            .select('id, nombre_completo')
            .eq('telefono', telefonoLimpio)
            .single();

        // C) Si no existe, lo creamos
        if (!clienteDB) {
            console.log(`[BOT] Creando cliente nuevo: ${cliente.nombre}`);
            const { data: newClient, error: createError } = await supabaseAdmin
                .from('clientes')
                .insert({
                    telefono: telefonoLimpio,
                    nombre_completo: cliente.nombre || 'Cliente WhatsApp',
                    ...datosDireccion // <--- INSERTA Dirección y GPS
                })
                .select()
                .single();

            if (createError) throw new Error(`Error creando cliente: ${createError.message}`);
            clienteDB = newClient;
        } else {
            // D) CORRECCIÓN CRÍTICA: Si existe, actualizamos los datos de dirección
            console.log(`[BOT] Cliente existente encontrado: ${clienteDB.id}. Actualizando dirección.`);

            const { error: updateError } = await supabaseAdmin
                .from('clientes')
                .update(datosDireccion) // <--- ACTUALIZA Dirección y GPS
                .eq('id', clienteDB.id);

            if (updateError) console.error(`[BOT] Error al actualizar dirección del cliente ${clienteDB.id}: ${updateError.message}`);
        }
        // =================================================================
        // 2. CREAR EL CASO (SUPABASE)
        // ... (El resto del código sigue igual)
        // =================================================================

        const { data: nuevoCaso, error: casoError } = await supabaseAdmin
            .from('casos')
            .insert({
                cliente_id: clienteDB.id,
                tecnico_id: cita.tecnico_id_supabase, // Vinculamos al técnico en BD
                status: 'pendiente', // Ya nace pendiente
                tipo_servicio: caso.tipo || 'DIAGNOSTICO',
                descripcion_problema: caso.comentarios
            })
            .select()
            .single();

        if (casoError) throw new Error(`Error creando caso: ${casoError.message}`);

        // =================================================================
        // 3. AGENDAR EN EASY!APPOINTMENTS (MYSQL)
        // =================================================================

        // Preparar fechas MySQL (YYYY-MM-DD HH:mm:ss)
        const start_datetime_str = `${cita.fecha} ${cita.hora}:00`;
        const startDate = new Date(start_datetime_str);
        const duracion = parseInt(cita.duracion) || 1;
        const endDate = new Date(startDate.getTime() + (duracion * 60 * 60 * 1000));

        // Formateador manual para evitar líos de zona horaria de librerías
        const pad = (n) => n.toString().padStart(2, '0');
        const toMySQL = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

        const startMySQL = toMySQL(startDate);
        const endMySQL = toMySQL(endDate);

        // Datos Fijos para E!A
        const ID_CLIENTE_COMODIN = 21; // Usamos tu ID genérico
        const ID_SERVICIO_DEFAULT = 1;
        const hash = randomBytes(16).toString('hex');

        // Notas visibles en calendario
        const notasCalendario = `Caso #${nuevoCaso.id} - ${cliente.nombre || 'Cliente'}\n${cita.notas_adicionales || ''}`;
        // Notas ocultas para enlazar lógica
        const notasEstructuradas = JSON.stringify({ caso_id: nuevoCaso.id });

        const sql = `
      INSERT INTO ea_appointments 
      (id_users_provider, id_services, id_users_customer, book_datetime, start_datetime, end_datetime, location, direccion_link, notes, notas_estructuradas, hash, is_unavailable)
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, 0)`;

        const values = [
            cita.tecnico_id_ea,
            ID_SERVICIO_DEFAULT,
            ID_CLIENTE_COMODIN,
            startMySQL,
            endMySQL,
            cliente.direccion || 'Dirección pendiente',
            cliente.google_maps_link || '',
            notasCalendario,
            notasEstructuradas,
            hash
        ];

        await eaPool.query(sql, values);

        console.log(`[BOT] Agenda completada. Caso ID: ${nuevoCaso.id}`);


        // =================================================================
        // 4. 👇 NUEVO: ENVIAR NOTIFICACIÓN PUSH AL TÉCNICO
        // =================================================================
        try {
            const notifPayload = {
                title: '🤖 Nuevo Caso Asignado (Bot)',
                body: `📅 ${cita.fecha} ${cita.hora}\n📍 ${cliente.direccion}\nClic para ver detalles.`,
                url: '/agenda' // O '/casos' según prefieras
            };

            // Usamos el ID numérico de E!A (cita.tecnico_id_ea) que es compatible con tu sistema de notificaciones
            await sendNotificationToUser(cita.tecnico_id_ea, notifPayload);
            console.log(`[BOT] Push enviada al técnico ID ${cita.tecnico_id_ea}`);

        } catch (pushError) {
            console.error('[BOT] Error al enviar push (No crítico):', pushError.message);
            // No hacemos throw para no cancelar la respuesta exitosa si solo falla la notificación
        }

        // Respuesta final al Bot
        res.status(201).json({
            success: true,
            id: nuevoCaso.id,
            mensaje: 'Proceso de integración completado exitosamente.'
        });

    } catch (error) {
        console.error('[BOT ERROR] Falló la integración:', error);
        res.status(500).json({ error: error.message });
    }
};