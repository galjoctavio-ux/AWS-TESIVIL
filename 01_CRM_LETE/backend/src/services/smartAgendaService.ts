// src/services/smartAgendaService.ts
//import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk"; // CAMBIO: Usamos Groq SDK
import axios from "axios";

// --- CONFIGURACIÓN ---
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Inicializamos el cliente de Groq
// Asegúrate de tener GROQ_API_KEY en tu archivo .env
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

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
    3. 'tecnico_nombre' (null si no se menciona un técnico específico).
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
        const cleanAddress = address.trim();
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanAddress)}&components=country:MX&key=${GOOGLE_API_KEY}`;

        console.log(`🔍 Buscando en Google Maps: "${cleanAddress}"`);

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
            console.log(`⚠️ Google devolvió status: ${response.data.status}`);
        }
        return null;
    } catch (error) {
        console.error("❌ Error Axios Geocoding:", error);
        return null;
    }
};

// --- 3. GENERADOR DE LINKS MEJORADO ---
// Prioriza la dirección legible si existe para que en el mapa aparezca "Av. Vallarta..." 
const generateNavigationLink = (lat: number | null, lng: number | null, addressQuery: string) => {
    const baseUrl = "https://www.google.com/maps/search/?api=1&query=";

    // CASO 1: Tenemos una dirección validada por Google (Prioridad Visual)
    if (addressQuery && addressQuery.length > 5 && addressQuery !== "Ubicación Compartida (WhatsApp)") {
        return `${baseUrl}${encodeURIComponent(addressQuery)}`;
    }

    // CASO 2: Solo tenemos coordenadas (ej. Pin de Ubicación o dirección ambigua)
    if (lat && lng) {
        return `${baseUrl}${lat},${lng}`;
    }

    // CASO 3: Fallback
    return "https://maps.google.com";
};

// --- HELPER PARA EXTRAER COORDENADAS DE URLS ---
const extractCoordsFromUrl = (url: string) => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
};

// --- FUNCIÓN PRINCIPAL DE PROCESAMIENTO ---
export const procesarSolicitudAgenda = async (
    chatContent: string,
    remoteJid: string,
    //geminiModel: any
) => {
    try {
        // A) INTELIGENCIA ARTIFICIAL
        const prompt = generatePrompt(chatContent);
        console.log("🤖 Consultando a Groq...");
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile", // Modelo muy potente y rápido
            temperature: 0, // Temperatura 0 para que sea estricto con el JSON
            response_format: { type: "json_object" } // Forzamos modo JSON para evitar errores
        });

        const rawContent = completion.choices[0]?.message?.content || "{}";

        // Limpieza extra por seguridad (aunque el json_mode ayuda mucho)
        const cleanJson = rawContent.replace(/```json|```/g, '').trim();

        let datos;
        try {
            datos = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Error parseando JSON de Groq:", rawContent);
            return "❌ No pude entender los datos del cliente. Intenta ser más claro.";
        }
        //const result = await geminiModel.generateContent(prompt);
        //const cleanJson = result.response.text().replace(/```json|```/g, '').trim();
        //const datos = JSON.parse(cleanJson);

        // B) GEOCODIFICACIÓN INTELIGENTE
        let lat = null;
        let lng = null;
        let direccionOficial = datos.direccion_buscable; // Dirección dicha por IA
        let avisoGeo = "⚠️ No pude localizar las coordenadas. Intenta enviar la ubicación (clip).";

        const geoData = await geocodeAddress(datos.direccion_buscable);

        if (geoData) {
            lat = geoData.lat;
            lng = geoData.lng;
            direccionOficial = geoData.formatted_address; // Dirección oficial de Google
            avisoGeo = "✅ Coordenadas GPS localizadas.";
        }

        // C) CONSTRUIR DATOS FINALES
        const direccionCompletaTexto = `${direccionOficial}. ${datos.direccion_complemento || ''}`.trim();
        const mapLink = generateNavigationLink(lat, lng, direccionOficial);

        // Manejo del técnico (default si es null)
        const tecnicoMostrar = datos.tecnico_nombre || "Por Asignar";

        // D) GUARDAR DRAFT
        agendaDrafts.set(remoteJid, {
            ...datos,
            tecnico_nombre: tecnicoMostrar, // Guardamos el técnico detectado
            direccion_texto: direccionCompletaTexto,
            direccion_final: direccionCompletaTexto,
            ubicacion_lat: lat,
            ubicacion_lng: lng,
            link_gmaps_generado: mapLink,
            step: 'ESPERANDO_CONFIRMACION'
        });

        // E) RESPUESTA AL USUARIO
        return `📍 *Verificación de Agenda*\n\n` +
            `👤 Cliente: ${datos.cliente_nombre}\n` +
            `👷 Técnico (por defecto Ing. Gallardo): *${tecnicoMostrar}*\n` +
            `📅 Fecha: ${datos.fecha} a las ${datos.hora}\n` +
            `🏠 Dirección: "${direccionCompletaTexto}"\n` +
            `🌐 GPS: ${avisoGeo}\n` +
            `🗺️ Mapa: ${mapLink}\n\n` +
            `👉 *ACCIONES:*\n` +
            `1. Responde *SI* para confirmar.\n` +
            `2. Corregir fecha: */fecha YYYY-MM-DD HH:mm*\n` +
            `3. Corregir Técnico: */tecnico Nombre*\n` +
            `4. Corregir Dir: Envía *Ubicación* (clip) o escribe calle.\n` +
            `5. Cancelar: *RESET*`;

    } catch (error) {
        console.error("Error processing agenda:", error);
        return "❌ Error procesando solicitud. Intenta de nuevo.";
    }
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

    // 3. CAMBIO DE TÉCNICO (NUEVO)
    if (texto.startsWith('/tecnico ')) {
        // Extraemos todo lo que esté después del comando "/tecnico "
        // Usamos substring(9) porque "/tecnico " tiene 9 caracteres
        const nuevoTecnico = mensajeTexto.substring(9).trim();

        if (nuevoTecnico.length > 0) {
            draft.tecnico_nombre = nuevoTecnico;
            agendaDrafts.set(remoteJid, draft);
            return `👷 *Técnico Actualizado* a: *${nuevoTecnico}*.\n¿Todo correcto? Responde *SI*.`;
        }
        return `⚠️ Debes escribir el nombre. Ejemplo: /tecnico Juan Pérez`;
    }

    // 4. MEJORA DE UBICACIÓN (LINK O CLIP O TEXTO)
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
        // Si el usuario escribe una dirección nueva manualmente
        const geo = await geocodeAddress(mensajeTexto);
        if (geo) {
            nuevasCoords = { lat: geo.lat, lng: geo.lng };
            nuevoTexto = geo.formatted_address;
            draft.direccion_complemento = ""; // Limpiamos complemento viejo
        } else {
            draft.direccion_texto = mensajeTexto;
            return `⚠️ Sigo sin encontrar "${mensajeTexto}" en el mapa.\nPor favor envía la *UBICACIÓN* (el clip 📎) para ser exactos.`;
        }
    }

    // Actualizar Draft si hubo cambios de coordenadas
    if (nuevasCoords) {
        draft.ubicacion_lat = nuevasCoords.lat;
        draft.ubicacion_lng = nuevasCoords.lng;
        draft.direccion_texto = nuevoTexto || draft.direccion_texto;

        // Regeneramos el link siempre que haya nuevas coordenadas
        // Pasamos nuevoTexto para que el link use el nombre de la calle si está disponible
        draft.link_gmaps_generado = generateNavigationLink(nuevasCoords.lat, nuevasCoords.lng, nuevoTexto || "");

        agendaDrafts.set(remoteJid, draft);
        return `✅ Ubicación GPS detectada (${nuevasCoords.lat}, ${nuevasCoords.lng}).\nResponde *SI* para finalizar.`;
    }

    // 5. CONFIRMACIÓN FINAL ("SI")
    if (texto === 'si' && draft.step === 'ESPERANDO_CONFIRMACION') {
        draft.step = 'AGENDAR_AHORA';
        agendaDrafts.set(remoteJid, draft);
        // El webhookController detectará este estado
        return `🚀 Confirmando datos...`;
    }

    return null;
};