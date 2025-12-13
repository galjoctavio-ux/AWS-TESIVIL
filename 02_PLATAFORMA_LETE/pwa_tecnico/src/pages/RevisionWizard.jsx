import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
// import api from '../apiService'; // Ya no se usa directamente aquí

// --- NUEVOS IMPORTS PARA OFFLINE FIRST ---
import { guardarBorrador, obtenerBorrador, encolarParaEnvio } from '../db';
import { syncManager } from '../services/SyncManager';
// ------------------------------------------

// Importar los pasos reales
import Step1_Generales from '../components/wizard/steps/Step1_Generales';
import Step2_Medidor from '../components/wizard/steps/Step2_Medidor';
import Step3_Mediciones from '../components/wizard/steps/Step3_Mediciones';
import Step4_Fugas from '../components/wizard/steps/Step4_Fugas';
import Step5_Equipos from '../components/wizard/steps/Step5_Equipos';
import Step6_Resumen from '../components/wizard/steps/Step6_Resumen';

const steps = [
  { id: 'generales', title: 'Datos Generales', component: Step1_Generales },
  { id: 'medidor', title: 'Revisión Medidor', component: Step2_Medidor },
  { id: 'mediciones', title: 'Mediciones', component: Step3_Mediciones },
  { id: 'fugas', title: 'Revisión de Fugas', component: Step4_Fugas },
  { id: 'equipos', title: 'Equipos de Consumo', component: Step5_Equipos },
  { id: 'resumen', title: 'Resumen y Firma', component: Step6_Resumen },
];

const ProgressBar = ({ current, total }) => {
  const progress = (current / total) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div
        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const RevisionWizard = () => {
  const navigate = useNavigate();
  const { casoId } = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nuevo estado para indicar si la data ya cargó desde IndexedDB
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [formData, setFormData] = useState({
    caso_id: casoId || null,

    // --- CAMPOS INICIALES (TU ESTRUCTURA ORIGINAL) ---
    tarifa_cfe: '01',
    condicion_infraestructura: 'Regular',
    kwh_recibo_cfe: 0,
    se_midieron_cargas_menores: false,

    // Step 1: Generales
    cliente_email: '',
    // Step 2: Medidor y C.C.
    tipo_servicio: 'Monofásico',
    tipo_medidor: 'Digital',
    giro_medidor: 'Regular',
    sello_cfe: true,
    condicion_base_medidor: 'Bueno',
    edad_instalacion: '0-10 años',
    cantidad_circuitos: 1,
    condiciones_cc: 'Bueno',
    observaciones_cc: '',
    tornillos_flojos: false,
    capacidad_vs_calibre: true,
    // Step 3: Mediciones
    voltaje_medido: 127.0,
    corriente_red_f1: 0,
    corriente_red_f2: 0,
    corriente_red_f3: 0,
    corriente_red_n: 0,
    corriente_paneles_f1: 0,
    corriente_paneles_f2: 0,
    corriente_paneles_f3: 0,
    cantidad_paneles: 0,
    watts_por_panel: 0,
    paneles_antiguedad_anos: 0,
    // Step 4: Fugas
    se_puede_apagar_todo: false,
    corriente_fuga_f1: 0,
    corriente_fuga_f2: 0,
    corriente_fuga_f3: 0,
    // Step 5: Equipos
    equiposData: [],
    // Step 6: Cierre
    causas_alto_consumo: [],
    recomendaciones_tecnico: '',
    firmaBase64: null,
  });

  // --- NUEVA LÓGICA DE PERSISTENCIA ---

  // 1. Efecto de Carga Inicial (IndexedDB)
  useEffect(() => {
    const loadDraft = async () => {
      if (!casoId) {
        setIsDataLoaded(true); // Permitir que la UI inicie si no hay casoId
        return;
      }

      try {
        const borrador = await obtenerBorrador(casoId);
        if (borrador && borrador.data) {
          // Restauramos los datos del borrador guardado localmente
          setFormData(prev => ({ ...prev, ...borrador.data }));
          console.log(`✅ Borrador para Caso ${casoId} recuperado de IndexedDB.`);
        }
      } catch (e) {
        console.error("Error leyendo borrador local", e);
        // Podríamos alertar si hay un error grave de IDB
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadDraft();
  }, [casoId]);

  // 2. Efecto de Autoguardado (Debounced Save)
  useEffect(() => {
    // Solo guardar si los datos ya cargaron inicialmente y tenemos un casoId
    if (!isDataLoaded || !formData.caso_id) return;

    // Usamos un debounce (retardo) para evitar escribir en disco local a cada tecla
    const timer = setTimeout(() => {
      guardarBorrador(formData.caso_id, formData);
      console.log(`Borrador Caso ${formData.caso_id} autoguardado.`);
    }, 1000); // 1 segundo de espera

    return () => clearTimeout(timer); // Limpieza del timer
  }, [formData, isDataLoaded]);

  // ------------------------------------------

  // Efecto de seguridad original (mantenido)
  useEffect(() => {
    if (casoId) {
      setFormData(prev => ({ ...prev, caso_id: casoId }));
    }
  }, [casoId]);

  const goToNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  };

  const updateFormData = (newData) => {
    // Se combina el nuevo dato con el estado actual, lo que disparará el Autoguardado
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // --- NUEVA LÓGICA DE SUBMIT (Offline Queue) ---
  const handleSubmit = async () => {
    // 1. Validaciones de seguridad
    if (!formData.caso_id) {
      alert("Error: No se ha detectado el ID del caso. Vuelva a la agenda e intente de nuevo.");
      return;
    }

    if (!formData.cliente_email) {
      alert("El correo del cliente es obligatorio para enviar el reporte.");
      setCurrentStepIndex(0);
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. ENCOLAR: En lugar de enviar a la API, lo guardamos en la cola local
      await encolarParaEnvio(formData.caso_id, formData);

      // 3. DISPARAR SINCRONIZACIÓN: Intentamos subirlo inmediatamente, pero no esperamos
      // La respuesta del servidor la manejará el SyncManager en segundo plano
      syncManager.procesarCola();

      // 4. Feedback Inmediato al Técnico
      // Ahora la respuesta es casi instantánea, eliminando la excusa de "está cargando"
      alert('✅ Reporte Finalizado y GUARDADO LOCALMENTE.\n\nSe subirá automáticamente al servidor cuando detectemos una conexión estable.\n\nPuedes cerrar la aplicación.');

      // 5. Salir a la Agenda
      navigate('/');

    } catch (error) {
      console.error('Error al guardar en la cola local (IndexedDB):', error);
      // Este es un error MUY raro, pero es la última línea de defensa.
      alert('⚠️ Error crítico. No se pudo guardar la revisión ni siquiera localmente. Contacta a soporte.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // ------------------------------------------

  const CurrentStepComponent = steps[currentStepIndex].component;
  const currentStepTitle = steps[currentStepIndex].title;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Si los datos aún no cargan de IndexedDB, mostramos un loading para evitar parpadeos
  if (!isDataLoaded) {
    return <div className="text-center p-8">Cargando datos locales...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-1/4">
              {currentStepIndex > 0 && (
                <button onClick={goToPrevious} className="text-gray-500 hover:text-gray-800">
                  <ChevronLeft size={24} />
                </button>
              )}
            </div>
            <div className="w-1/2 text-center">
              <h1 className="text-lg font-bold text-gray-800 truncate">{currentStepTitle}</h1>
            </div>
            <div className="w-1/4" />
          </div>
          <div className="mt-3">
            <ProgressBar current={currentStepIndex + 1} total={steps.length} />
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto pb-32">
        <div className="max-w-md mx-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent formData={formData} setFormData={setFormData} updateFormData={updateFormData} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 w-full bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto p-4">
          <button
            onClick={isLastStep ? handleSubmit : goToNext}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transform transition-transform duration-200 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando en local...' : (isLastStep ? 'Finalizar Revisión' : 'Siguiente')}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RevisionWizard;