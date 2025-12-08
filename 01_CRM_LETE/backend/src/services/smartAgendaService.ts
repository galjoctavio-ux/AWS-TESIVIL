// src/services/smartAgendaService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- MEMORIA TEMPORAL (Drafts) ---
export const agendaDrafts = new Map<string, any>();

// --- GENERADOR DE PROMPT CON ZONA HORARIA MÉXICO ---
const generatePrompt = (chatHistory: string): string => {
    // 1. FORZAMOS LA ZONA HORARIA A MÉXICO (CDMX/Guadalajara)
    const mexicoTime = new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" });
    const nowMexico = new Date(mexicoTime);

    // 2. Formateamos a YYYY-MM-DD y Día de la semana en Español
    const fechaHoy = nowMexico.toISOString().split('T')[0];
    const diaSemana = nowMexico.toLocaleDateString('es-MX', { weekday: 'long' });

    return `
    ACTÚA COMO ASISTENTE DE AGENDAMIENTO.
    CONTEXTO DE TIEMPO:
    - HOY ES: ${diaSemana.toUpperCase()}, ${fechaHoy} (Zona Horaria México).
    - Usa esta fecha base para calcular "mañana", "el jueves", etc.
    
    ANALIZA EL SIGUIENTE CHAT Y EXTRAE EN JSON:
    "${chatHistory}"

    REGLAS:
    1. Extrae 'cliente_nombre', 'cliente_telefono', 'direccion_texto', 'fecha' (YYYY-MM-DD), 'hora' (HH:mm formato 24h), 'tecnico_nombre', 'costo' (numero), 'notas'.
    2. En 'direccion_texto' extrae TODO lo referente a la ubicación.
    3. Si no hay técnico, pon null.
    4. Responde SOLO JSON.
  `;
};

// --- HELPER PARA GOOGLE MAPS ---
const generateGoogleMapsLink = (direccion: string): string => {
    if (!direccion) return '';
    const query = encodeURIComponent(direccion);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

// --- FUNCIÓN PRINCIPAL DE PROCESAMIENTO ---
export const procesarSolicitudAgenda = async (
    chatContent: string,
    remoteJid: string,
    geminiModel: any
) => {
    try {
        const prompt = generatePrompt(chatContent);
        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text();

        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const datos = JSON.parse(cleanJson);

        const mapLink = generateGoogleMapsLink(datos.direccion_texto);

        agendaDrafts.set(remoteJid, {
            ...datos,
            link_gmaps_generado: mapLink,
            step: 'ESPERANDO_CONFIRMACION_UBICACION'
        });

        return `📍 *Verificación de Ubicación*\n\nLa IA detectó:\n📅 Fecha: ${datos.fecha}\n⏰ Hora: ${datos.hora}\n🏠 Dir: "${datos.direccion_texto}"\n\n🗺️ Ver en Mapa: ${mapLink}\n\n👉 *Opciones:*\n1. Si es correcta, responde *SI*.\n2. Si es incorrecta, *envía la UBICACIÓN* (clip) o escribe la dirección correcta.`;

    } catch (error) {
        console.error("Error en smartAgendaService:", error);
        return "❌ Error procesando el chat. Intenta reenviar de nuevo.";
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

    // A) UBICACIÓN REAL (Clip)
    if (mensajeTipo === 'location' || mensajeTipo === 'locationMessage') {
        const lat = mensajeLocation.degreesLatitude || mensajeLocation.lat;
        const lng = mensajeLocation.degreesLongitude || mensajeLocation.lng;

        draft.ubicacion_lat = lat;
        draft.ubicacion_lng = lng;
        // Link directo a coordenadas
        draft.link_gmaps_final = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        draft.direccion_final = "Ubicación GPS compartida";

        draft.step = 'LISTO_PARA_ENVIAR';
        agendaDrafts.set(remoteJid, draft);

        return `✅ GPS Recibido.\nEscribe *AGENDAR* para procesar.`;
    }

    // B) CONFIRMACIÓN "SI"
    if (mensajeTexto.toLowerCase().trim() === 'si' && draft.step === 'ESPERANDO_CONFIRMACION_UBICACION') {
        draft.link_gmaps_final = draft.link_gmaps_generado;
        draft.direccion_final = draft.direccion_texto;
        draft.step = 'LISTO_PARA_ENVIAR';
        agendaDrafts.set(remoteJid, draft);

        return `✅ Dirección confirmada.\nEscribe *AGENDAR* para procesar.`;
    }

    // C) CORRECCIÓN MANUAL DE TEXTO
    if (draft.step === 'ESPERANDO_CONFIRMACION_UBICACION' && mensajeTexto.length > 5 && mensajeTexto.toLowerCase() !== 'agendar') {
        const nuevoLink = generateGoogleMapsLink(mensajeTexto);
        draft.direccion_texto = mensajeTexto;
        draft.link_gmaps_generado = nuevoLink;
        agendaDrafts.set(remoteJid, draft);

        return `🔄 Actualizado: "${mensajeTexto}"\n🗺️ Mapa: ${nuevoLink}\n\n¿Es correcto? (Responde SI)`;
    }

    return null;
};