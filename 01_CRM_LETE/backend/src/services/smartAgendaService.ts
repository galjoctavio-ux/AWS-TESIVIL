// src/services/smartAgendaService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios"; // Asegúrate de tener instalado axios: npm install axios

// --- CONFIGURACIÓN ---
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // Tu Key de Google Maps

// --- MEMORIA TEMPORAL (Drafts) ---
export const agendaDrafts = new Map<string, any>();

// --- 1. RESETEAR EL PROCESO ---
export const resetAgendaDraft = (remoteJid: string): boolean => {
    return agendaDrafts.delete(remoteJid);
};

// --- GENERADOR DE PROMPT (Igual que antes) ---
const generatePrompt = (chatHistory: string): string => {
    const mexicoTime = new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" });
    const nowMexico = new Date(mexicoTime);
    const fechaHoy = nowMexico.toISOString().split('T')[0];
    const diaSemana = nowMexico.toLocaleDateString('es-MX', { weekday: 'long' });

    return `
    ACTÚA COMO ASISTENTE DE AGENDAMIENTO.
    CONTEXTO: HOY ES ${diaSemana.toUpperCase()}, ${fechaHoy} (Zona MX).
    
    ANALIZA EL CHAT Y EXTRAE EN JSON:
    "${chatHistory}"

    REGLAS:
    1. Extrae 'cliente_nombre', 'cliente_telefono', 'direccion_texto', 'fecha' (YYYY-MM-DD), 'hora' (HH:mm), 'tecnico_nombre', 'notas'.
    2. 'direccion_texto': se lo más especifico posible.
    3. Responde SOLO JSON.
  `;
};

// --- 2. GEOCODIFICACIÓN (SERVER SIDE) ---
// Esta función convierte "Calle X, Col Y" en {lat, lng, formatted_address}
const geocodeAddress = async (address: string) => {
    if (!address || !GOOGLE_API_KEY) return null;
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                formatted_address: result.formatted_address, // Dirección oficial de Google
                place_id: result.place_id
            };
        }
        return null;
    } catch (error) {
        console.error("Error Geocoding:", error);
        return null;
    }
};

// --- HELPER LINK MAPAS (Para navegación del técnico) ---
const generateNavigationLink = (lat: number, lng: number, query: string) => {
    if (lat && lng) {
        // Link directo a coordenadas para navegación precisa
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

// --- FUNCIÓN PRINCIPAL DE PROCESAMIENTO ---
export const procesarSolicitudAgenda = async (
    chatContent: string,
    remoteJid: string,
    geminiModel: any
) => {
    try {
        // A) INTELIGENCIA ARTIFICIAL
        const prompt = generatePrompt(chatContent);
        const result = await geminiModel.generateContent(prompt);
        const cleanJson = result.response.text().replace(/```json|```/g, '').trim();
        const datos = JSON.parse(cleanJson);

        // B) GEOCODIFICACIÓN AUTOMÁTICA
        // Intentamos obtener lat/lng inmediatamente con la dirección que detectó la IA
        let lat = null;
        let lng = null;
        let direccionFinal = datos.direccion_texto;
        let avisoGeo = "⚠️ No pude localizar las coordenadas exactas. Verifica la dirección.";

        const geoData = await geocodeAddress(datos.direccion_texto);

        if (geoData) {
            lat = geoData.lat;
            lng = geoData.lng;
            direccionFinal = geoData.formatted_address; // Usamos la dirección bonita de Google
            avisoGeo = "✅ Coordenadas GPS localizadas exitosamente.";
        }

        const mapLink = generateNavigationLink(lat, lng, direccionFinal);

        // C) GUARDAR DRAFT
        agendaDrafts.set(remoteJid, {
            ...datos,
            direccion_texto: direccionFinal, // Actualizamos con la oficial
            ubicacion_lat: lat,
            ubicacion_lng: lng,
            link_gmaps_generado: mapLink,
            step: 'ESPERANDO_CONFIRMACION'
        });

        // D) RESPUESTA AL USUARIO
        return `📍 *Verificación de Agenda*\n\n` +
            `👤 Cliente: ${datos.cliente_nombre}\n` +
            `📅 Fecha: ${datos.fecha} a las ${datos.hora}\n` +
            `🏠 Dirección Detectada: "${direccionFinal}"\n` +
            `🌐 Estado GPS: ${avisoGeo}\n` +
            `🗺️ Mapa: ${mapLink}\n\n` +
            `👉 *ACCIONES:*\n` +
            `1. Si todo está bien, responde *SI* (se agendará directo).\n` +
            `2. Si la fecha está mal: */FECHA YYYY-MM-DD HH:mm*\n` +
            `3. Si la ubicación está mal: Envía el *Link de Maps* o *Ubicación* (clip).\n` +
            `4. Cancelar: *RESET*`;

    } catch (error) {
        console.error("Error processing agenda:", error);
        return "❌ Error procesando solicitud. Intenta de nuevo.";
    }
};

// --- HELPER PARA EXTRAER COORDENADAS DE URLS ---
const extractCoordsFromUrl = (url: string) => {
    // Intenta sacar lat,lng de URLs estándar de Google Maps
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

    // Soporte para links cortos tipo "https://maps.app.goo.gl/..." es complejo sin expandir URL,
    // pero si mandan el link largo de navegador, esto funcionará.
    return null;
};

// --- MANEJO DE CONFIRMACIÓN ---
export const manejarConfirmacionAgenda = async (
    mensajeTexto: string,
    mensajeTipo: string,
    mensajeLocation: any,
    remoteJid: string
) => {
    const draft = agendaDrafts.get(remoteJid);
    if (!draft) return null;

    const texto = mensajeTexto.toLowerCase().trim();

    // 1. RESET
    if (texto === 'reset' || texto === 'cancelar') {
        resetAgendaDraft(remoteJid);
        return `🗑️ Borrador eliminado. Puedes empezar de nuevo.`;
    }

    // 2. CAMBIO DE FECHA
    if (texto.startsWith('/fecha ')) {
        const partes = mensajeTexto.split(' '); // /fecha 2023-10-10 10:00
        if (partes.length >= 3) {
            draft.fecha = partes[1];
            draft.hora = partes[2];
            agendaDrafts.set(remoteJid, draft);
            return `📅 *Fecha Actualizada* a: ${draft.fecha} ${draft.hora}.\n¿Todo correcto? Responde *SI*.`;
        }
        return `⚠️ Formato incorrecto. Usa: /fecha YYYY-MM-DD HH:mm`;
    }

    // 3. MEJORA DE UBICACIÓN (LINK O CLIP)
    let nuevasCoords = null;

    // A. Si mandan ubicación nativa (Clip)
    if (mensajeTipo === 'location' || mensajeTipo === 'locationMessage') {
        nuevasCoords = {
            lat: mensajeLocation.degreesLatitude || mensajeLocation.lat,
            lng: mensajeLocation.degreesLongitude || mensajeLocation.lng
        };
        draft.direccion_texto = "Ubicación Compartida (WhatsApp)";
    }
    // B. Si mandan un link de Google Maps en texto
    else if (texto.includes('maps.google.com') || texto.includes('/maps/')) {
        nuevasCoords = extractCoordsFromUrl(mensajeTexto);
        if (nuevasCoords) {
            draft.direccion_texto = "Ubicación por Link";
            draft.link_gmaps_generado = mensajeTexto; // Guardamos el link original que mandaron
        }
    }
    // C. Si mandan texto plano para corregir dirección (re-geocodificar)
    else if (texto.length > 5 && texto !== 'si' && !texto.startsWith('/')) {
        // El usuario escribió una dirección nueva manualmente
        const geo = await geocodeAddress(mensajeTexto);
        if (geo) {
            nuevasCoords = { lat: geo.lat, lng: geo.lng };
            draft.direccion_texto = geo.formatted_address;
        } else {
            // Fallback si no encuentra coords
            draft.direccion_texto = mensajeTexto;
            return `⚠️ No encontré esa dirección en el mapa. Intenta ser más específico o envía la ubicación (clip).`;
        }
    }

    // Si detectamos nuevas coordenadas, actualizamos el draft
    if (nuevasCoords) {
        draft.ubicacion_lat = nuevasCoords.lat;
        draft.ubicacion_lng = nuevasCoords.lng;
        // Generamos link limpio para el técnico
        if (!draft.link_gmaps_generado.includes('http')) { // Si no era un link pegado
            draft.link_gmaps_generado = generateNavigationLink(nuevasCoords.lat, nuevasCoords.lng, "");
        }

        agendaDrafts.set(remoteJid, draft);
        return `✅ Ubicación actualizada con GPS preciso (${nuevasCoords.lat}, ${nuevasCoords.lng}).\nResponde *SI* para finalizar.`;
    }

    // 4. CONFIRMACIÓN FINAL ("SI")
    if (texto === 'si' && draft.step === 'ESPERANDO_CONFIRMACION') {
        // Aquí preparamos el payload FINAL
        // IMPORTANTE: Asegúrate de que tu lógica externa tome este objeto y lo guarde en Supabase

        const payloadFinal = {
            ...draft,
            status: 'COMPLETADO',
            // Estos son los campos clave para Supabase:
            latitud: draft.ubicacion_lat,
            longitud: draft.ubicacion_lng,
            google_maps_link: draft.link_gmaps_generado
        };

        // Marcamos como listo para que el controlador principal ejecute el guardado
        draft.step = 'AGENDAR_AHORA';
        agendaDrafts.set(remoteJid, draft);

        return `🚀 *Confirmado.* Creando orden de servicio en sistema...\n(Datos: ${draft.fecha} ${draft.hora} @ ${draft.direccion_texto})`;
    }

    return null;
};