// src/app/gracias-por-tu-compra/page.js

'use client'; // Necesario porque el formulario (Paso 2) es interactivo

// 1. Importamos el componente del formulario
import FormularioDiagnostico from '@/components/FormularioDiagnostico';

// (Ya NO importamos 'react-calendly', 'useEffect', 'useState', etc.)

export default function GraciasPage() {
  
  // 2. Definimos tu URL de Easy!Appointments (E!A)
  const easyAppointmentsUrl = "https://calendario.tesivil.com/index.php?service=4";

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl w-full mx-auto bg-white p-6 md:p-10 rounded-lg shadow-xl">

          <h1 className="text-3xl md:text-4xl font-bold text-gris-grafito text-center">
            ¡Pago Exitoso! Faltan 2 pasos para tu diagnóstico.
          </h1>

          {/* ================================== */}
          {/* SECCIÓN 1: Agendamiento (¡Actualizado a E!A!) */}
          {/* ================================== */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-azul-confianza">
              Paso 1: Agenda tu Cita de Instalación
            </h2>
            <p className="mt-2 text-gray-600">
              Selecciona el día y la hora que mejor te convenga. Nuestro calendario muestra la disponibilidad real de nuestros ingenieros.
            </p>
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              
              {/* 3. Usamos un iframe simple para E!A */}
              <iframe
                src={easyAppointmentsUrl}
                style={{
                  width: '100%',
                  height: '800px', // Puedes ajustar esta altura
                  border: '0',
                }}
                allowFullScreen
                title="Agendamiento de Cita - Cuentatrón"
              ></iframe>

            </div>
          </div>

          {/* ================================== */}
          {/* SECCIÓN 2: Formulario (Sin cambios) */}
          {/* ================================== */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-azul-confianza">
              Paso 2: Completa tu Perfil Energético
            </h2>
            <p className="mt-2 text-gray-600">
              Ayúdanos a preparar tu diagnóstico. Esta información es vital para que el ingeniero sepa qué buscar.
            </p>
            <div className="mt-6">
              {/* 4. Renderizamos el componente del formulario */}
              <FormularioDiagnostico />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Sencillo */}
      <footer className="w-full bg-gris-grafito text-gray-400 py-8 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm">
            © 2025 Cuentatrón - Un servicio de TESIVIL.
          </p>
        </div>
      </footer>
    </>
  );
}