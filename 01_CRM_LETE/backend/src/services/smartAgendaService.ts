// src/services/smartAgendaService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// --- CONFIGURACIÓN ---
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// --- MEMORIA TEMPORAL (Drafts) ---
export const agendaDrafts = new Map<string, any>();

// --- RESETEAR EL PROCESO ---
export const resetAgendaDraft = (remoteJid: string): boolean => {
    return agendaDrafts.delete(remoteJid);
};

// --- 1. GENERADOR DE PROMPT MEJORADO ---
const generatePrompt = (chatHistory: string): string => {
    const mexicoTime = new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" });
    const nowMexico = new Date(mexicoTime);
    const fechaHoy = nowMexico.toISOString().split('T')[0];
    const diaSemana = nowMexico.toLocaleDateString('es-MX', { weekday: 'long' });

    return `
    ACTÚA COMO ASISTENTE DE AGENDAMIENTO EXPERTO.
    CONTEXTO: HOY ES ${diaSemana.toUpperCase()}, ${fechaHoy} (Zona MX).
    
    ANALIZA EL CHAT Y EXTRAE UN JSON ESTRUCTURADO:
    "${chatHistory}"

    REGLAS DE EXTRACCIÓN:
    1. 'cliente_nombre', 'cliente_telefono'.
    2. 'fecha' (YYYY-MM-DD), 'hora' (HH:mm).
    3. 'tecnico_nombre' (null si no hay).
    4. 'costo' (numero o null).
    
    ⚠️ REGLA CRÍTICA DE DIRECCIÓN (DIVÍDELA EN DOS):
    - 'direccion_buscable': SOLO Calle, Número Exterior, Colonia y Ciudad. (Ej: "Av Vallarta 2440, Guadalajara"). NO incluyas interior, piso, ni referencias aquí.
    - 'direccion_complemento': Interior, Depto, Torre, Caseta, Referencias (Ej: "Torre A, Depto 101, frente al parque").
    
    5. 'notas': Otras notas del servicio.
    
    Responde SOLO JSON.
  `;
};

// --- 2. GEOCODIFICACIÓN ROBUSTA (SERVER SIDE) ---
const geocodeAddress = async (address: string) => {
    if (!address || !GOOGLE_API_KEY) {
        console.log("❌ Geocoding abortado: Falta dirección o API Key");
        return null;
    }
    try {
        // TRUCO: Agregamos components=country:MX para forzar México
        // y limpiamos espacios extra.
        const cleanAddress = address.trim();
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanAddress)}&components=country:MX&key=${GOOGLE_API_KEY}`;

        console.log(`🔍 Buscando en Google Maps: "${cleanAddress}"`); // Debug para ver qué buscamos

        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            console.log(`✅ Google encontró: ${result.formatted_address}`);
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                formatted_address: result.formatted_address,
                place_id: result.place_id
            };
        } else {
            console.log(`⚠️ Google devolvió status: ${response.data.status}`); // ZERO_RESULTS o REQUEST_DENIED
        }
        return null;
    } catch (error) {
        console.error("❌ Error Axios Geocoding:", error);
        return null;
    }
};

// Reemplaza tu función actual con esta versión corregida:

const generateNavigationLink = (lat: number | null, lng: number | null, query: string) => {
    // Si tenemos coordenadas, generamos link directo al punto
    if (lat && lng) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    // Si no, buscamos por texto (encodeURIComponent es vital)
    const cleanQuery = query ? encodeURIComponent(query.trim()) : "";
    return `https://www.google.com/maps/search/?api=1&query=${cleanQuery}`;
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

        // B) GEOCODIFICACIÓN INTELIGENTE
        // Usamos solo la parte "buscable" para obtener coordenadas
        let lat = null;
        let lng = null;

        // La dirección oficial empieza siendo lo que dijo la IA, pero limpia
        let direccionOficial = datos.direccion_buscable;
        let avisoGeo = "⚠️ No pude localizar las coordenadas. Intenta enviar la ubicación (clip).";

        // Intentamos geocodificar
        const geoData = await geocodeAddress(datos.direccion_buscable);

        if (geoData) {
            lat = geoData.lat;
            lng = geoData.lng;
            direccionOficial = geoData.formatted_address; // La dirección bonita de Google (Ej: "Calle Real 123, Col X...")
            avisoGeo = "✅ Coordenadas GPS localizadas.";
        }

        // C) CONSTRUIR DIRECCIÓN COMPLETA PARA EL USUARIO Y TÉCNICO
        // Unimos: Dirección Google + Complementos (Depto, Torre, etc.)
        const direccionCompletaTexto = `${direccionOficial}. ${datos.direccion_complemento || ''}`.trim();

        const mapLink = generateNavigationLink(lat, lng, direccionOficial);

        // D) GUARDAR DRAFT
        agendaDrafts.set(remoteJid, {
            ...datos,
            direccion_texto: direccionCompletaTexto, // Guardamos la versión completa
            direccion_final: direccionCompletaTexto,
            ubicacion_lat: lat,
            ubicacion_lng: lng,
            link_gmaps_generado: mapLink,
            step: 'ESPERANDO_CONFIRMACION'
        });

        // E) RESPUESTA AL USUARIO
        return `📍 *Verificación de Agenda*\n\n` +
            `👤 Cliente: ${datos.cliente_nombre}\n` +
            `📅 Fecha: ${datos.fecha} a las ${datos.hora}\n` +
            `🏠 Dirección: "${direccionCompletaTexto}"\n` +
            `🌐 GPS: ${avisoGeo}\n` +
            `🗺️ Mapa: ${mapLink}\n\n` +
            `👉 *ACCIONES:*\n` +
            `1. Responde *SI* para confirmar.\n` +
            `2. Corregir fecha: */FECHA YYYY-MM-DD HH:mm*\n` +
            `3. Corregir Dir: Envía *Ubicación* (clip) o escribe solo calle y número.\n` +
            `4. Cancelar: *RESET*`;

    } catch (error) {
        console.error("Error processing agenda:", error);
        return "❌ Error procesando solicitud. Intenta de nuevo.";
    }
};

// --- HELPER PARA EXTRAER COORDENADAS DE URLS ---
const extractCoordsFromUrl = (url: string) => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
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
        return `🗑️ Borrador eliminado.`;
    }

    // 2. CAMBIO DE FECHA
    if (texto.startsWith('/fecha ')) {
        const partes = mensajeTexto.split(' ');
        if (partes.length >= 3) {
            draft.fecha = partes[1];
            draft.hora = partes[2];
            agendaDrafts.set(remoteJid, draft);
            return `📅 *Fecha Actualizada* a: ${draft.fecha} ${draft.hora}.\n¿Todo correcto? Responde *SI*.`;
        }
        return `⚠️ Formato incorrecto. Usa: /fecha YYYY-MM-DD HH:mm`;
    }

    // 3. MEJORA DE UBICACIÓN (LINK O CLIP O TEXTO)
    let nuevasCoords = null;
    let nuevoTexto = "";

    // A. Ubicación nativa (Clip)
    if (mensajeTipo === 'location' || mensajeTipo === 'locationMessage') {
        nuevasCoords = {
            lat: mensajeLocation.degreesLatitude || mensajeLocation.lat,
            lng: mensajeLocation.degreesLongitude || mensajeLocation.lng
        };
        nuevoTexto = "Ubicación Compartida (WhatsApp)";
    }
    // B. Link de Google Maps
    else if (texto.includes('http') && texto.includes('maps')) {
        nuevasCoords = extractCoordsFromUrl(mensajeTexto);
        if (nuevasCoords) {
            nuevoTexto = "Ubicación por Link";
            draft.link_gmaps_generado = mensajeTexto;
        }
    }
    // C. CORRECCIÓN MANUAL DE TEXTO (RE-GEOCODING)
    else if (texto.length > 5 && texto !== 'si' && !texto.startsWith('/')) {
        // Si el usuario escribe una dirección nueva manualmente, intentamos geocodificarla de nuevo
        const geo = await geocodeAddress(mensajeTexto);
        if (geo) {
            nuevasCoords = { lat: geo.lat, lng: geo.lng };
            nuevoTexto = geo.formatted_address;
            draft.direccion_complemento = ""; // Limpiamos el complemento viejo si cambiaron toda la dirección
        } else {
            // Si falla de nuevo, guardamos el texto pero avisamos
            draft.direccion_texto = mensajeTexto;
            return `⚠️ Sigo sin encontrar "${mensajeTexto}" en el mapa.\nPor favor envía la *UBICACIÓN* (el clip 📎 del chat) para ser exactos.`;
        }
    }

    // Actualizar Draft si hubo cambios de coordenadas
    if (nuevasCoords) {
        draft.ubicacion_lat = nuevasCoords.lat;
        draft.ubicacion_lng = nuevasCoords.lng;
        draft.direccion_texto = nuevoTexto || draft.direccion_texto;

        // ✅ CORRECCIÓN: Forzamos la regeneración del link siempre que haya nuevas coordenadas
        // Eliminamos el if (!draft.link_gmaps_generado.includes('http'))
        draft.link_gmaps_generado = generateNavigationLink(nuevasCoords.lat, nuevasCoords.lng, "");

        agendaDrafts.set(remoteJid, draft);
        return `✅ Ubicación GPS detectada (${nuevasCoords.lat}, ${nuevasCoords.lng}).\nResponde *SI* para finalizar.`;
    }

    // 4. CONFIRMACIÓN FINAL ("SI")
    if (texto === 'si' && draft.step === 'ESPERANDO_CONFIRMACION') {
        draft.step = 'AGENDAR_AHORA';
        agendaDrafts.set(remoteJid, draft);
        // El webhookController detectará este estado y enviará los datos
        return `🚀 Confirmando datos...`;
    }

    return null;
};