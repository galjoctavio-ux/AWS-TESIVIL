import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import api from '../apiService';
import './AgendarCasoForm.css'; 

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

// Helper para el visualizador (sin cambios)
const generarBloquesVisibles = (horariosOcupados, horaInicio = 8, horaFin = 18) => {
  const bloques = [];
  const aNumero = (horaStr) => {
    const [h, m] = horaStr.split(':').map(Number);
    return h + (m / 60);
  };
  const ocupados = horariosOcupados.map(h => ({
    inicio: aNumero(h.inicio),
    fin: aNumero(h.fin)
  }));
  for (let i = horaInicio; i < horaFin; i++) {
    const bloqueInicio = i;
    const bloqueFin = i + 1;
    let estaOcupado = false;
    for (const ocup of ocupados) {
      if (bloqueInicio < ocup.fin && bloqueFin > ocup.inicio) {
        estaOcupado = true;
        break;
      }
    }
    bloques.push({
      hora: `${String(i).padStart(2, '0')}:00 - ${String(i + 1).padStart(2, '0')}:00`,
      ocupado: estaOcupado
    });
  }
  return bloques;
};

// --- COMPONENTE PRINCIPAL (LÓGICA CORREGIDA) ---
function AgendarCasoForm({ caso, onClose, onCitaCreada }) {
  
  // El `caso` viene de las props (ya fue asignado)
  const [formData, setFormData] = useState({
    fecha: '',
    // Datos Cliente/Caso (los llenamos desde `caso`)
    cliente_nombre: caso.cliente_nombre || '',
    cliente_telefono: caso.cliente_telefono || '',
    tipo_caso: caso.tipo || 'alto_consumo',
    // Dirección (la buscamos)
    direccion_legible: caso.cliente_direccion || '', // Usamos la dirección del caso como default
    link_gmaps: '',
    // Cita
    hora: '',
    duracion_horas: '1',
    notas_adicionales: ''
  });

  // --- NUEVA LÓGICA DE IDs ---
  const [eaProviderId, setEaProviderId] = useState(null); // El ID de E!A (int)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);

  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // --- EFECTO 1: Buscar el ID de E!A ---
  useEffect(() => {
    if (!caso || !caso.tecnico_id) {
      setError('Error: El caso no tiene un técnico asignado.');
      return;
    }
    
    const fetchEaId = async () => {
      try {
        const response = await api.get(`/usuarios/find-ea-id/${caso.tecnico_id}`);
        setEaProviderId(response.data.ea_id); // Guardamos el ID (int)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al sincronizar ID de técnico.');
      }
    };
    fetchEaId();
  }, [caso]); // Se ejecuta 1 vez al abrir

  // --- EFECTO 2: Cargar Disponibilidad (¡LÓGICA CORREGIDA!) ---
  useEffect(() => {
    // Solo se ejecuta si tenemos el ID DE E!A y la FECHA
    if (eaProviderId && formData.fecha) {
      const fetchDisponibilidad = async () => {
        setLoadingDisponibilidad(true);
        setError('');
        try {
          const response = await api.get('/citas/disponibilidad', {
            params: {
              tecnico_id: eaProviderId, // <-- ¡Usamos el ID de E!A (int)!
              fecha: formData.fecha
            }
          });
          setHorariosOcupados(response.data);
        } catch (err) {
          setError('Error al cargar la disponibilidad.');
          setHorariosOcupados([]);
        } finally {
          setLoadingDisponibilidad(false);
        }
      };
      fetchDisponibilidad();
    } else {
      setHorariosOcupados([]);
    }
  }, [eaProviderId, formData.fecha]); // Se re-ejecuta si cambia el ID de E!A o la fecha

  // Lógica de bloques visuales (Corregida en el paso anterior)
  const bloquesVisibles = useMemo(() => {
    if (!eaProviderId || !formData.fecha) return [];
    if (loadingDisponibilidad) return [];
    return generarBloquesVisibles(horariosOcupados);
  }, [horariosOcupados, loadingDisponibilidad, eaProviderId, formData.fecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers de Google Maps (sin cambios)
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
          link_gmaps: place.url
        }));
        setError('');
      }
    }
  };

  // --- MODIFICADO: handleSubmit (¡NUEVA LÓGICA!) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!eaProviderId || !formData.fecha || !formData.hora || !formData.link_gmaps) {
      setError('Por favor, complete todos los campos (Fecha, Hora y Dirección).');
      return;
    }
    
    setLoading(true);
    try {
      // Preparamos el payload para la NUEVA ruta POST /citas
      const payload = {
        caso_id: caso.id, // ID del caso de Supabase
        tecnico_id_ea: eaProviderId, // ID del técnico de E!A
        fecha: formData.fecha,
        hora: formData.hora,
        duracion_horas: formData.duracion_horas,
        direccion_legible: formData.direccion_legible,
        link_gmaps: formData.link_gmaps,
        notas_adicionales: formData.notas_adicionales
      };
      
      await api.post('/citas', payload);
      
      onCitaCreada();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agendar la cita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <form className="agendar-caso-form" onSubmit={handleSubmit} noValidate>
        {/* Mostramos un título, ya no es un formulario de "Crear" */}
        <h3>Agendar Cita para Caso #{caso.id}</h3>
        
        {/* Mostramos el técnico, ya no lo seleccionamos */}
        <div className="tecnico-info">
          <strong>Cliente:</strong> {formData.cliente_nombre} <br/>
          <strong>Técnico Asignado:</strong> {caso.tecnico?.nombre || '(Cargando...)'}
        </div>

        {/* --- PASO 1: DISPONIBILIDAD --- */}
        <h4>Paso 1: Ver Disponibilidad</h4>
        <div className="form-paso-inline">
          <div>
            <label htmlFor="fecha">Fecha</label>
            <input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleChange} required />
          </div>
        </div>

        {loadingDisponibilidad && <p>Cargando disponibilidad...</p>}
        {error && !loadingDisponibilidad && <p className="error-msg">{error}</p>}
        {bloquesVisibles.length > 0 && (
          <div className="disponibilidad-visual">
            <strong>Disponibilidad para el día:</strong>
            <ul>
              {bloquesVisibles.map((bloque) => (
                <li key={bloque.hora} className={bloque.ocupado ? 'ocupado' : 'libre'}>
                  {bloque.hora}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* --- PASO 2: DIRECCIÓN --- */}
        <h4>Paso 2: Dirección</h4>
        <div className="form-paso">
          <label htmlFor="direccion">Dirección del Cliente (Buscar en Google)</label>
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              id="direccion"
              placeholder="Escribe la dirección y selecciónala..."
              ref={inputRef}
              required
              // Llenamos con la dirección default del caso
              defaultValue={formData.direccion_legible} 
              style={{ width: '100%' }}
            />
          </Autocomplete>
          {formData.link_gmaps && <small style={{ color: 'green' }}>✓ Dirección seleccionada</small>}
        </div>

        {/* --- PASO 3: AGENDAR --- */}
        <h4>Paso 3: Confirmar Cita</h4>
        <div className="form-paso-inline">
          <div>
            <label htmlFor="hora">Hora de Inicio (ej: 14:30)</label>
            <input type="time" id="hora" name="hora" value={formData.hora} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="duracion_horas">Duración</label>
            <select id="duracion_horas" name="duracion_horas" value={formData.duracion_horas} onChange={handleChange}>
              <option value="1">1 hora</option>
              <option value="2">2 horas</option>
              <option value="3">3 horas</option>
            </select>
          </div>
        </div>
        <div className="form-paso">
          <label htmlFor="notas_adicionales">Notas Adicionales (Técnico)</label>
          <textarea id="notas_adicionales" name="notas_adicionales" value={formData.notas_adicionales} onChange={handleChange} />
        </div>

        {/* --- BOTONES Y ERRORES --- */}
        <div className="form-botones">
          <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
          
          {/* --- TAREA 1: Botón cambiado --- */}
          <button type="submit" disabled={loading || !eaProviderId}>
            {loading ? 'Guardando...' : 'Guardar Cita'}
          </button>
        </div>
      </form>
    </LoadScript>
  );
}

export default AgendarCasoForm;