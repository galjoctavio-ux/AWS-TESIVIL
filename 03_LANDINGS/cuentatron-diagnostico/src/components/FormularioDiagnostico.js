// src/components/FormularioDiagnostico.js
'use client';

import { useState, useEffect, useRef } from 'react';
import ItemInventario from './ItemInventario';
import { Loader, AlertCircle } from 'lucide-react';

// --- ¡NUEVAS IMPORTACIONES DE GOOGLE MAPS! ---
import { LoadScript, Autocomplete } from '@react-google-maps/api';

// --- Constantes para Google Maps ---
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

// --- Funciones de Utilidad para formatear fechas ---
function formatDay(dateString) { // "2025-11-13"
  // Añadimos T12:00:00 para evitar problemas de zona horaria (UTC vs. local)
  const date = new Date(`${dateString}T12:00:00`); 
  const options = { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Mexico_City' };
  let formatted = date.toLocaleDateString('es-ES', options);
  // Capitalizar la primera letra
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTime(slotString) { // "2025-11-13 09:00:00"
  const time = slotString.split(' ')[1]; // "09:00:00"
  return time.substring(0, 5); // "09:00"
}
// ---

export default function FormularioDiagnostico() {
  // === ESTADO COMPLETO DEL FORMULARIO ===
  const [formData, setFormData] = useState({
    // (Campos de Cliente)
    nombre: '',
    apellido: '',
    email: '',
    telefono_whatsapp: '',
    
    // (Campos de Domicilio - Google Maps los llenará)
    calle: '',
    numero_domicilio: '',
    colonia: '',
    municipio: 'guadalajara',
    
    // (Nuevos campos de Google Maps)
    link_gmaps: '',          
    direccion_legible: '', 

    // (Campos de Inventario)
    refri_cantidad: 1,
    refri_antiguedad_anos: 5,
    ac_cantidad: 0,
    ac_tipo: 'no_se',
    lavadora_cantidad: 1,
    secadora_electrica_cantidad: 0,
    secadora_gas_cantidad: 0,
    estufa_electrica_cantidad: 0,
    calentador_electrico_cantidad: 0,
    bomba_agua_cantidad: 0,
    bomba_alberca_cantidad: 0,
    paneles_solares_cantidad: 0,
    horno_electrico_cantidad: 0,

    // (Contexto)
    contexto_problema: '',
    confirmo_no_conectar_raros: false,
  });

  // === ESTADOS DE AGENDAMIENTO ===
  const [availableSlots, setAvailableSlots] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // === ESTADOS DE UI ===
  const [isLoading, setIsLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // === Refs para Google Maps ===
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // --- Cargar Disponibilidad de E!A al montar ---
  useEffect(() => {
    async function fetchAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError('');
      try {
        const response = await fetch('/api/ea-availability', {
          method: 'POST' 
        });
        
        if (!response.ok) {
           // Leemos el error como JSON (nuestro endpoint ya lo formatea)
           const err = await response.json();
           // Usamos err.details (que es el mensaje limpio de E!A)
           throw new Error(err.details || 'No se pudo cargar la disponibilidad.');
        }

        const slots = await response.json();
        
        if (slots.length === 0) {
          setAvailabilityError('No hay citas disponibles por el momento. Por favor, contáctanos.');
          return;
        }

        const grouped = slots.reduce((acc, slot) => {
          const datePart = slot.split(' ')[0];
          if (!acc[datePart]) acc[datePart] = [];
          acc[datePart].push(slot);
          return acc;
        }, {});
        
        setAvailableSlots(grouped);
      } catch (err) {
        console.error('Error fetching availability:', err.message);
        // Mostramos el error real en la UI
        setAvailabilityError(err.message);
      } finally {
        setAvailabilityLoading(false);
      }
    }
    fetchAvailability();
  }, []); // El array vacío asegura que solo se ejecute una vez


  // --- Manejadores de Estado (Inputs y Contadores) ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInventarioChange = (name, delta) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: Math.max(0, prevData[name] + delta),
    }));
  };

  // --- Handlers de Google Maps ---
  const onAutocompleteLoad = (autocompleteInstance) => {
    autocompleteRef.current = autocompleteInstance;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address && place.url) {
        setFormData((prev) => ({
          ...prev,
          direccion_legible: place.formatted_address,
          link_gmaps: place.url,
          ...parseGoogleAddress(place.address_components) // Llenamos los campos ocultos
        }));
        setFormError(''); // Limpiamos error de dirección si lo hubo
      }
    }
  };
  
  // Función helper para parsear la dirección de Google
  const parseGoogleAddress = (components) => {
    const address = {
      calle: '',
      numero_domicilio: '',
      colonia: '',
      municipio: ''
    };
    
    components.forEach(comp => {
      if (comp.types.includes('route')) {
        address.calle = comp.long_name;
      }
      if (comp.types.includes('sublocality_level_1')) {
        address.colonia = comp.long_name;
      }
      if (comp.types.includes('locality')) {
        // Normalizamos el municipio (ej. 'Guadalajara', 'Zapopan')
        address.municipio = comp.long_name.toLowerCase().replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
      }
      if (comp.types.includes('street_number')) {
        address.numero_domicilio = comp.long_name;
      }
    });
    return address;
  };
  // --- Fin Handlers Google Maps ---


  // --- handleSubmit (¡Actualizado!) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    setFormSuccess(false);

    // --- VALIDACIÓN COMPLETA ---
    if (!selectedSlot) {
      setFormError('Paso 1: Por favor, selecciona una fecha y hora para tu cita.');
      setIsLoading(false);
      return;
    }
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono_whatsapp) {
      setFormError('Paso 2: Por favor, completa todos tus Datos de Cliente.');
      setIsLoading(false);
      return;
    }
    if (!formData.link_gmaps || !formData.direccion_legible) {
      setFormError('Paso 3: Por favor, busca y selecciona tu dirección de la lista de Google.');
      setIsLoading(false);
      return;
    }
    if (!formData.confirmo_no_conectar_raros) {
      setFormError('Paso 5: Debes marcar la casilla de confirmación obligatoria.');
      setIsLoading(false);
      return;
    }
    // --- Fin Validación ---

    try {
      // Llamada a la API que usará inyección directa
      const response = await fetch('/api/confirmar-cita-y-perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileData: formData, 
          appointmentData: { slot: selectedSlot }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocurrió un error en el servidor.');
      }
      setFormSuccess(true);
    } catch (error) {
      console.error('Error al enviar formulario unificado:', error);
      setFormError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  // --- Renderizado ---

  if (formSuccess) {
    return (
      <div className="p-10 text-center bg-green-50 border border-green-300 rounded-lg">
        <h3 className="text-2xl font-bold text-green-800">¡Cita Confirmada y Perfil Guardado!</h3>
        <p className="mt-2 text-green-700">
          Has completado el proceso. Recibirás un correo de confirmación en breve.
        </p>
      </div>
    );
  }

  return (
    // ¡Envolvemos todo en <LoadScript>!
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onError={(e) => setFormError("Error al cargar Google Maps. Revisa la API Key.")}
    >
      <form onSubmit={handleSubmit} className="space-y-8 p-4 md:p-8 border border-gray-200 rounded-lg bg-gray-50">

        {/* --- Paso 1: Selector de Cita --- */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gris-grafito pb-2 border-b border-gray-300 w-full">
            Paso 1: Selecciona tu Cita de Instalación
          </legend>
          
          {availabilityLoading && (
            <div className="flex items-center justify-center h-24">
              <Loader className="w-8 h-8 animate-spin text-azul-confianza" />
              <span className="ml-3 text-gray-700">Cargando horarios disponibles...</span>
            </div>
          )}
          
          {availabilityError && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {availabilityError}
            </div>
          )}

          <div className="space-y-4">
            {Object.keys(availableSlots).map(date => (
              <div key={date}>
                <h4 className="font-semibold text-gray-800 text-lg">{formatDay(date)}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableSlots[date].map(slot => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        px-4 py-2 rounded-md border text-sm font-medium transition-colors
                        ${selectedSlot === slot 
                          ? 'bg-azul-confianza text-white border-azul-confianza shadow-lg' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                      `}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {/* --- Paso 2: Datos del Cliente --- */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gris-grafito pb-2 border-b border-gray-300 w-full">
            Paso 2: Datos del Cliente
          </legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre(s)</label>
              <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza" />
            </div>
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido(s)</label>
              <input type="text" name="apellido" id="apellido" value={formData.apellido} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico (para la confirmación)</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza" />
            </div>
            <div>
              <label htmlFor="telefono_whatsapp" className="block text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
              <input type="tel" name="telefono_whatsapp" id="telefono_whatsapp" value={formData.telefono_whatsapp} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza" />
            </div>
          </div>
        </fieldset>

        {/* --- Paso 3: Datos de Domicilio (¡CON GOOGLE MAPS!) --- */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gris-grafito pb-2 border-b border-gray-300 w-full">
            Paso 3: Datos de Domicilio
          </legend>

          <div>
            <label htmlFor="direccion_google" className="block text-sm font-medium text-gray-700">
              Busca tu Dirección (Google)
            </label>
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
              // Restringimos a México
              options={{ componentRestrictions: { country: 'mx' } }}
            >
              <input
                type="text"
                id="direccion_google"
                placeholder="Escribe la dirección y selecciónala de la lista..."
                ref={inputRef}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza"
              />
            </Autocomplete>
            {formData.link_gmaps && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Dirección seleccionada: <strong>{formData.direccion_legible}</strong>
              </p>
            )}
          </div>
          
          {/* Ocultamos los campos que Google llena */}
          <input type="hidden" name="calle" value={formData.calle} />
          <input type="hidden" name="colonia" value={formData.colonia} />
          
          {/* El número de casa a veces falla, lo pedimos manual si Google no lo encuentra */}
          {formData.link_gmaps && !formData.numero_domicilio && (
             <div>
              <label htmlFor="numero_domicilio" className="block text-sm font-medium text-gray-700 text-yellow-700">
                Por favor, ingresa tu Número (Ext/Int)
              </label>
              <input type="text" name="numero_domicilio" id="numero_domicilio" value={formData.numero_domicilio} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza" />
            </div>
          )}
          
           {/* Municipio (lo dejamos visible por si Google falla o para confirmar) */}
           <div>
            <label htmlFor="municipio" className="block text-sm font-medium text-gray-700">Municipio (Confirmar)</label>
            <select name="municipio" id="municipio" value={formData.municipio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza">
              <option value="guadalajara">Guadalajara</option>
              <option value="zapopan">Zapopan</option>
              <option value="tlaquepaque">Tlaquepaque</option>
              <option value="tonala">Tonalá</option>
              <option value="tlajomulco">Tlajomulco</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </fieldset>


        {/* --- Paso 4: Inventario Interactivo --- */}
        <fieldset>
          <legend className="text-xl font-semibold text-gris-grafito pb-2 border-b border-gray-300 w-full">
            Paso 4: Inventario de Equipos
          </legend>
          
          <div className="py-3 border-b border-gray-300">
            <ItemInventario
              label="Refrigeradores"
              value={formData.refri_cantidad}
              onIncrement={() => handleInventarioChange('refri_cantidad', 1)}
              onDecrement={() => handleInventarioChange('refri_cantidad', -1)}
            />
            {formData.refri_cantidad > 0 && (
              <div className="mt-2 pl-4">
                <label htmlFor="refri_antiguedad_anos" className="block text-sm font-medium text-gray-700">Antigüedad (Aprox. del más viejo)</label>
                <input type="number" name="refri_antiguedad_anos" id="refri_antiguedad_anos" value={formData.refri_antiguedad_anos} onChange={handleChange} className="mt-1 w-32 rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza" placeholder="Años" />
              </div>
            )}
          </div>

          <div className="py-3 border-b border-gray-300">
            <ItemInventario
              label="Aire Acondicionado"
              value={formData.ac_cantidad}
              onIncrement={() => handleInventarioChange('ac_cantidad', 1)}
              onDecrement={() => handleInventarioChange('ac_cantidad', -1)}
            />
            {formData.ac_cantidad > 0 && (
              <div className="mt-2 pl-4 space-y-1">
                <span className="block text-sm font-medium text-gray-700">Tipo (del principal):</span>
                <div className="flex gap-4">
                  <label><input type="radio" name="ac_tipo" value="estandar" checked={formData.ac_tipo === 'estandar'} onChange={handleChange} /> Estándar</label>
                  <label><input type="radio" name="ac_tipo" value="inverter" checked={formData.ac_tipo === 'inverter'} onChange={handleChange} /> Inverter</label>
                  <label><input type="radio" name="ac_tipo" value="no_se" checked={formData.ac_tipo === 'no_se'} onChange={handleChange} /> No sé</label>
                </div>
              </div>
            )}
          </div>

          <ItemInventario label="Lavadora" value={formData.lavadora_cantidad} onIncrement={() => handleInventarioChange('lavadora_cantidad', 1)} onDecrement={() => handleInventarioChange('lavadora_cantidad', -1)} />
          <ItemInventario label="Secadora Eléctrica" value={formData.secadora_electrica_cantidad} onIncrement={() => handleInventarioChange('secadora_electrica_cantidad', 1)} onDecrement={() => handleInventarioChange('secadora_electrica_cantidad', -1)} />
          <ItemInventario label="Secadora de Gas" value={formData.secadora_gas_cantidad} onIncrement={() => handleInventarioChange('secadora_gas_cantidad', 1)} onDecrement={() => handleInventarioChange('secadora_gas_cantidad', -1)} />
          <ItemInventario label="Estufa Eléctrica / Parrilla" value={formData.estufa_electrica_cantidad} onIncrement={() => handleInventarioChange('estufa_electrica_cantidad', 1)} onDecrement={() => handleInventarioChange('estufa_electrica_cantidad', -1)} />
          <ItemInventario label="Calentador Eléctrico (Boiler/Ducha)" value={formData.calentador_electrico_cantidad} onIncrement={() => handleInventarioChange('calentador_electrico_cantidad', 1)} onDecrement={() => handleInventarioChange('calentador_electrico_cantidad', -1)} />
          <ItemInventario label="Bomba de Agua / Hidroneumático" value={formData.bomba_agua_cantidad} onIncrement={() => handleInventarioChange('bomba_agua_cantidad', 1)} onDecrement={() => handleInventarioChange('bomba_agua_cantidad', -1)} />
          <ItemInventario label="Bomba de Alberca" value={formData.bomba_alberca_cantidad} onIncrement={() => handleInventarioChange('bomba_alberca_cantidad', 1)} onDecrement={() => handleInventarioChange('bomba_alberca_cantidad', -1)} />
          <ItemInventario label="Paneles Solares" value={formData.paneles_solares_cantidad} onIncrement={() => handleInventarioChange('paneles_solares_cantidad', 1)} onDecrement={() => handleInventarioChange('paneles_solares_cantidad', -1)} />
          <ItemInventario label="Horno Eléctrico" value={formData.horno_electrico_cantidad} onIncrement={() => handleInventarioChange('horno_electrico_cantidad', 1)} onDecrement={() => handleInventarioChange('horno_electrico_cantidad', -1)} />
        </fieldset>

        {/* --- Paso 5: Contexto y Confirmación --- */}
        <fieldset className="space-y-4">
          <legend className="text-xl font-semibold text-gris-grafito pb-2 border-b border-gray-300 w-full">
            Paso 5: Contexto y Confirmación
          </legend>

          <div>
            <label htmlFor="contexto_problema" className="block text-sm font-medium text-gray-700">
              En pocas palabras, ¿cuál es tu problema o principal sospechoso? (Opcional)
            </label>
            <textarea
              name="contexto_problema"
              id="contexto_problema"
              rows="4"
              value={formData.contexto_problema}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-azul-confianza focus:ring-azul-confianza"
              placeholder="Ej: El recibo subió mucho, sospecho del aire acondicionado o de la bomba de agua."
            />
          </div>

          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="confirmo_no_conectar_raros"
                name="confirmo_no_conectar_raros"
                type="checkbox"
                checked={formData.confirmo_no_conectar_raros}
                onChange={handleChange}
                required
                className="h-4 w-4 rounded border-gray-300 text-azul-confianza focus:ring-azul-confianza"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="confirmo_no_conectar_raros" className="font-medium text-gray-700">
                Confirmación Obligatoria (Requerido)
              </label>
              <p className="text-gray-500">
                Entiendo que para un diagnóstico preciso, NO debo conectar aparatos inusuales (soldadoras, etc.) durante los 7 días de monitoreo.
              </p>
            </div>
          </div>
        </fieldset>

        {/* --- Botón de Envío y Mensajes de Estado --- */}
        <div>
          {formError && (
            <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-800 rounded-md">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || availabilityLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-azul-confianza hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-confianza disabled:bg-gray-400"
          >
            {isLoading ? 'Confirmando y Guardando...' : 'Confirmar Cita y Guardar Perfil'}
          </button>
        </div>
      </form>
    </LoadScript>
  );
}