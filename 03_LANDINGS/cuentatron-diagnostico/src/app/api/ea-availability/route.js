// Archivo: app/api/ea-availability/route.js
// (Versión con manejo de errores HTML)

import { NextResponse } from 'next/server';

export async function POST(request) {
  const {
    EASY_APPOINTMENTS_URL,
    EASY_APPOINTMENTS_API_KEY,
    EASY_APPOINTMENTS_SERVICE_ID,
    EASY_APPOINTMENTS_PROVIDER_ID,
  } = process.env;

  if (
    !EASY_APPOINTMENTS_URL ||
    !EASY_APPOINTMENTS_API_KEY ||
    !EASY_APPOINTMENTS_SERVICE_ID ||
    !EASY_APPOINTMENTS_PROVIDER_ID
  ) {
    console.error('Faltan variables de entorno de Easy!Appointments');
    return NextResponse.json(
      { error: 'Servidor no configurado para agendamiento.' },
      { status: 500 }
    );
  }

  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 14);

    const formatDateTime = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} 00:00:00`;
    };

    const startDateTime = formatDateTime(startDate);
    const endDateTime = formatDateTime(endDate).replace('00:00:00', '23:59:59');

    // Usamos la URL sin /index.php
    const apiUrl = `${EASY_APPOINTMENTS_URL}/api/v1/availabilities`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EASY_APPOINTMENTS_API_KEY}`,
      },
      body: JSON.stringify({
        serviceId: parseInt(EASY_APPOINTMENTS_SERVICE_ID, 10),
        providerId: parseInt(EASY_APPOINTMENTS_PROVIDER_ID, 10),
        startDate: startDateTime,
        endDate: endDateTime,
      }),
      cache: 'no-store',
    });

    // --- ¡BLOQUE MODIFICADO! ---
    if (!response.ok) {
      // Si E!A da un error (401, 500, etc.), leemos el cuerpo como TEXTO
      const errorText = await response.text(); 
      console.error('Error de la API de E!A (Respuesta HTML/Texto):', errorText);
      
      // Intentamos extraer un mensaje útil del HTML si es posible
      const match = errorText.match(/<title>(.*?)<\/title>/i) || errorText.match(/<h3>(.*?)<\/h3>/i);
      const simpleError = match ? match[1] : 'Error desconocido de E!A';

      return NextResponse.json(
        { error: 'Error al consultar la API de Easy!Appointments', details: simpleError },
        { status: response.status }
      );
    }
    // --- FIN DEL BLOQUE MODIFICADO ---

    // Verificamos si la respuesta es JSON (como debería)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const availabilityData = await response.json();
      return NextResponse.json(availabilityData);
    } else {
      // Si E!A devuelve 200 OK pero con HTML (raro, pero posible)
      const errorHtml = await response.text();
      console.error("Error: E!A devolvió 200 OK pero con HTML, no JSON.", errorHtml);
      throw new Error('La API de E!A respondió con HTML en lugar de JSON.');
    }

  } catch (error) {
    console.error('Error al conectar con la API de E!A:', error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor al consultar disponibilidad.', details: error.message },
      { status: 500 }
    );
  }
}