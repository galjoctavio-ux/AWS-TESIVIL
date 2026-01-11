// Archivo: app/api/confirmar-cita-y-perfil/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Inicializar clientes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

// Función para formatear la fecha para el correo
function formatEmailDateTime(slot) {
  const date = new Date(slot.replace(' ', 'T'));
  const dia = date.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Mexico_City'
  });
  const hora = date.toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'America/Mexico_City'
  });
  return { dia, hora };
}

// === EL HANDLER PRINCIPAL ===
export async function POST(request) {
  try {
    const { profileData, appointmentData } = await request.json();
    const {
      EASY_APPOINTMENTS_URL,
      EASY_APPOINTMENTS_API_KEY,
      EASY_APPOINTMENTS_SERVICE_ID,
      EASY_APPOINTMENTS_PROVIDER_ID,
      RESEND_EMAIL_FROM,
    } = process.env;

    const { slot } = appointmentData;
    const { nombre, apellido, email, telefono_whatsapp } = profileData;

    // --- TAREA 1: Crear Cita en Easy!Appointments ---
    
    // Calcular 'end' time (asumiendo 30 min, como dice el brief)
    const start = new Date(slot.replace(' ', 'T'));
    const end = new Date(start.getTime() + 30 * 60000); // 30 minutos
    const formatForEA = (date) => date.toISOString().replace('T', ' ').substring(0, 19);
    
    const startDateTime = formatForEA(start);
    const endDateTime = formatForEA(end);

    const eaPayload = {
      serviceId: parseInt(EASY_APPOINTMENTS_SERVICE_ID, 10),
      providerId: parseInt(EASY_APPOINTMENTS_PROVIDER_ID, 10),
      start: startDateTime,
      end: endDateTime,
      customer: {
        firstName: nombre,
        lastName: apellido,
        email: email,
        phone: telefono_whatsapp,
        address: `${profileData.calle} ${profileData.numero_domicilio}`,
        city: profileData.municipio,
        notes: `Colonia: ${profileData.colonia}. Contexto: ${profileData.contexto_problema || 'N/A'}`
      }
    };

    const eaResponse = await fetch(`${EASY_APPOINTMENTS_URL}/index.php/api/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EASY_APPOINTMENTS_API_KEY}`,
      },
      body: JSON.stringify(eaPayload),
      cache: 'no-store',
    });

    if (!eaResponse.ok) {
      const errorBody = await eaResponse.json();
      console.error("Error al crear cita en E!A:", errorBody);
      return NextResponse.json({ error: `Error de Easy!Appointments: ${errorBody.message || 'No se pudo crear la cita.'}` }, { status: 500 });
    }

    const newAppointment = await eaResponse.json();

    // --- TAREA 2: Guardar Perfil en Supabase ---
    
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('perfiles_diagnostico')
      .insert([
        {
          ...profileData, // Guardamos TODOS los datos del formulario
          easy_appointments_id: newAppointment.id, // Guardamos el ID de la cita para referencia
        }
      ])
      .select();

    if (supabaseError) {
      console.error("Error al guardar perfil en Supabase:", supabaseError);
      // Opcional: Aquí podrías intentar "cancelar" la cita en E!A para un rollback
      return NextResponse.json({ error: `Cita creada (ID: ${newAppointment.id}), pero error al guardar perfil: ${supabaseError.message}` }, { status: 500 });
    }

    // --- TAREA 3: Enviar Email de Confirmación (Plantilla 1) ---
    
    const { dia, hora } = formatEmailDateTime(slot);
    const direccionCompleta = `${profileData.calle} ${profileData.numero_domicilio}, ${profileData.colonia}, ${profileData.municipio}`;

    try {
      await resend.emails.send({
        from: RESEND_EMAIL_FROM,
        to: [email],
        subject: `Cita Confirmada: Tu Monitoreo Cuentatrón (Día: ${dia})`,
        html: `
          <h1>¡Hola, ${nombre}!</h1>
          <p>Felicidades. Tu pago ha sido recibido y tu cita está confirmada.</p>
          <p>Has dado el primer paso para tomar el control de tu consumo energético.</p>
          <h3>Datos de tu Cita:</h3>
          <ul>
            <li><strong>Servicio:</strong> Monitoreo Especial Cuentatrón (7 Días)</li>
            <li><strong>Día:</strong> ${dia}</li>
            <li><strong>Hora:</strong> ${hora}</li>
            <li><strong>Dirección:</strong> ${direccionCompleta}</li>
          </ul>
          <p><strong>Instrucción Clave:</strong> Para asegurar la precisión del diagnóstico, es vital que durante los 7 días de monitoreo no conectes aparatos de alto consumo que no uses habitualmente (soldadoras, maquinaria pesada, etc.).</p>
          <p>Un Ingeniero de Cuentatrón te visitará puntualmente. Si necesitas reagendar, por favor contáctanos por WhatsApp.</p>
          <br>
          <p>Atentamente,<br>El equipo de Cuentatrón (TESIVIL)</p>
        `
      });
    } catch (emailError) {
      console.error("Error al enviar email con Resend:", emailError);
      // No fallamos la solicitud completa, solo registramos el error
      // El cliente ya tiene su cita y su perfil guardado.
    }

    // --- ¡ÉXITO TOTAL! ---
    return NextResponse.json({ 
      success: true, 
      appointmentId: newAppointment.id, 
      profileId: supabaseData[0].id 
    });

  } catch (error) {
    console.error('Error en el handler confirmar-cita-y-perfil:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}