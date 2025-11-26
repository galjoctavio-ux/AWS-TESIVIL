import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import api from '../apiService';
import './AgendarCasoForm.css'; // Usamos el mismo CSS

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

// --- HELPER PARA BLOQUES DE TIEMPO (Sin cambios) ---
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
    const horaISO = `${String(i).padStart(2, '0')}:00`;
    bloques.push({
      horaLabel: `${horaISO} - ${String(i + 1).padStart(2, '0')}:00`,
      horaValor: horaISO,
      ocupado: estaOcupado
    });
  }
  return bloques;
};

// --- COMPONENTE PRINCIPAL ---
function CrearCasoForm({ onClose, onCasoCreado }) {

  const [formData, setFormData] = useState({
    // Datos Técnicos
    tecnico_id_ea: '',
    tecnico_id_supabase: '',
    fecha: '',
    hora: '',
    duracion_horas: '1',

    // Datos Cliente (El nuevo núcleo)
    cliente_telefono: '', // Ahora es el campo principal
    cliente_nombre: '',
    tipo_caso: 'alto_consumo',

    // Dirección
    direccion_legible: '',
    link_gmaps: '',
    ubicacion_lat: null, // Nuevo: Para guardar coordenadas si Google las da
    ubicacion_lng: null,

    notas_adicionales: ''
  });

  // Estados de UI
  const [tecnicos, setTecnicos] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);

  // Estados para el CRM (Buscador)
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [infoCliente, setInfoCliente] = useState(null); // Para guardar el status (Semáforo)

  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Cargar Técnicos al inicio
  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const response = await api.get('/usuarios/tecnicos');
        setTecnicos(response.data);
      } catch (err) {
        setError('Error al cargar técnicos.');
      }
    };
    fetchTecnicos();
  }, []);

  // 2. Cargar Disponibilidad cuando cambia Técnico o Fecha
  useEffect(() => {
    if (formData.tecnico_id_ea && formData.fecha) {
      const fetchDisponibilidad = async () => {
        setLoadingDisponibilidad(true);
        setError('');
        try {
          const response = await api.get('/citas/disponibilidad', {
            params: {
              tecnico_id: formData.tecnico_id_ea,
              fecha: formData.fecha
            }
          });
          setHorariosOcupados(response.data);
        } catch (err) {
          setError('Error consultando disponibilidad.');
          setHorariosOcupados([]);
        } finally {
          setLoadingDisponibilidad(false);
        }
      };
      fetchDisponibilidad();
    } else {
      setHorariosOcupados([]);
    }
  }, [formData.tecnico_id_ea, formData.fecha]);

  // 3. Generar Bloques Visuales
  const bloquesVisibles = useMemo(() => {
    if (!formData.tecnico_id_ea || !formData.fecha || loadingDisponibilidad) return [];
    return generarBloquesVisibles(horariosOcupados);
  }, [horariosOcupados, loadingDisponibilidad, formData.tecnico_id_ea, formData.fecha]);

  // --- LÓGICA CRM: BUSCAR CLIENTE ---
  const handlePhoneBlur = async () => {
    const telefono = formData.cliente_telefono.trim();
    if (telefono.length < 8) return; // Validación básica

    setBuscandoCliente(true);
    setInfoCliente(null); // Reset

    try {
      // Llamamos al nuevo endpoint que creamos
      const response = await api.get(`/clientes/buscar?telefono=${telefono}`);

      if (response.data && response.data.length > 0) {
        // ¡Cliente Encontrado!
        const cliente = response.data[0];
        setInfoCliente(cliente); // Guardamos info completa (incluyendo calificacion)

        // Autocompletamos el formulario
        setFormData(prev => ({
          ...prev,
          cliente_nombre: cliente.nombre_completo,
          direccion_legible: cliente.direccion_principal || '',
          link_gmaps: cliente.google_maps_link || '',
          // Si tuviéramos lat/lng guardados en cliente, también los pondríamos aquí
        }));

        // Actualizamos el input visual de Google Maps si existe referencia
        if (inputRef.current) {
          inputRef.current.value = cliente.direccion_principal || '';
        }
      }
    } catch (err) {
      console.log('Cliente no encontrado o error, permitiendo captura manual.');
      // No mostramos error, simplemente dejamos que el usuario llene los datos
    } finally {
      setBuscandoCliente(false);
    }
  };

  // --- HANDLERS GENERALES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'tecnico_id_ea') {
      const tecnicoSeleccionado = tecnicos.find(t => t.ea_id == value);
      if (tecnicoSeleccionado) {
        setFormData((prev) => ({
          ...prev,
          tecnico_id_ea: tecnicoSeleccionado.ea_id,
          tecnico_id_supabase: tecnicoSeleccionado.id_supabase
        }));
      }
    }
  };

  const handleBloqueClick = (horaValor) => {
    setFormData((prev) => ({ ...prev, hora: horaValor }));
  };

  // Google Maps
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
          ubicacion_lat: place.geometry?.location?.lat(),
          ubicacion_lng: place.geometry?.location?.lng()
        }));
        setError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- 🔍 DEBUG: Restaurado para pruebas ---
    console.log('--- INTENTANDO CREAR CASO ---');
    console.log('Datos actuales:', formData);

    // --- ✅ VALIDACIÓN: Restaurada y completa ---
    // Verificamos explícitamente los IDs y el link de mapas
    const camposFaltantes = [];
    if (!formData.tecnico_id_ea) camposFaltantes.push('Técnico (Agenda)');
    if (!formData.tecnico_id_supabase) camposFaltantes.push('Técnico (Base de Datos)');
    if (!formData.fecha) camposFaltantes.push('Fecha');
    if (!formData.hora) camposFaltantes.push('Hora');
    if (!formData.cliente_nombre) camposFaltantes.push('Nombre Cliente');
    if (!formData.cliente_telefono) camposFaltantes.push('Teléfono Cliente');
    if (!formData.link_gmaps) camposFaltantes.push('Dirección (Seleccionar de Google Maps)');

    if (camposFaltantes.length > 0) {
      const msg = `Faltan campos obligatorios: ${camposFaltantes.join(', ')}`;
      console.error(msg); // Log para ti
      setError(msg);      // UI para el usuario
      return;
    }

    setLoading(true);
    try {
      // 1. Crear Caso + Cliente (CRM Logic)
      const casoPayload = {
        cliente_nombre: formData.cliente_nombre,
        cliente_telefono: formData.cliente_telefono,
        cliente_direccion: formData.direccion_legible,
        comentarios_iniciales: `Caso Nuevo - ${formData.tipo_caso} - ${formData.notas_adicionales}`,
        ubicacion_lat: formData.ubicacion_lat,
        ubicacion_lng: formData.ubicacion_lng
      };

      console.log('Enviando Caso:', casoPayload); // Debug
      const respCaso = await api.post('/casos', casoPayload);
      const nuevoCaso = respCaso.data.caso;

      // 2. Agendar Cita (Agenda Logic)
      const citaPayload = {
        caso_id: nuevoCaso.id,
        tecnico_id_ea: formData.tecnico_id_ea,
        fecha: formData.fecha,
        hora: formData.hora,
        duracion_horas: formData.duracion_horas,
        direccion_legible: formData.direccion_legible,
        link_gmaps: formData.link_gmaps,
        notas_adicionales: formData.notas_adicionales
      };

      console.log('Enviando Cita:', citaPayload); // Debug
      await api.post('/citas', citaPayload);

      onCasoCreado();
      onClose();
    } catch (err) {
      console.error('Error en el proceso:', err);
      setError(err.response?.data?.error || 'Error al crear el caso.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <form className="agendar-caso-form" onSubmit={handleSubmit} noValidate>
        <h3>Nuevo Servicio / Caso</h3>

        {/* --- PASO 1: DATOS DEL CLIENTE (PRIORIDAD) --- */}
        <h4>1. Datos del Cliente</h4>
        <div className="form-paso">

          {/* CAMPO TELÉFONO - CON BUSCADOR */}
          <div style={{ position: 'relative' }}>
            <label htmlFor="cliente_telefono">Teléfono (Móvil)</label>
            <input
              type="tel"
              id="cliente_telefono"
              name="cliente_telefono"
              value={formData.cliente_telefono}
              onChange={handleChange}
              onBlur={handlePhoneBlur} // <--- AQUÍ OCURRE LA MAGIA
              placeholder="Ej: 3312345678"
              autoComplete="off"
              required
              style={{ borderColor: infoCliente ? '#4CAF50' : '#ccc' }}
            />
            {buscandoCliente && <span style={{ position: 'absolute', right: 10, top: 35, fontSize: '0.8em', color: '#666' }}>Buscando...</span>}
          </div>

          <div>
            <label htmlFor="cliente_nombre">Nombre Completo</label>
            <input
              type="text"
              id="cliente_nombre"
              name="cliente_nombre"
              value={formData.cliente_nombre}
              onChange={handleChange}
              placeholder="Nombre del cliente"
              required
            />
          </div>
        </div>

        {/* ALERTA DE SEMÁFORO DEL CLIENTE */}
        {infoCliente && (
          <div style={{
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor:
              infoCliente.calificacion === 'TOXICO' ? '#ffebee' :
                infoCliente.calificacion === 'EXIGENTE' ? '#fff3e0' : '#e8f5e9',
            border:
              infoCliente.calificacion === 'TOXICO' ? '1px solid #ffcdd2' :
                infoCliente.calificacion === 'EXIGENTE' ? '1px solid #ffe0b2' : '1px solid #c8e6c9'
          }}>
            <div>
              <strong>Cliente Registrado:</strong>
              <span style={{ marginLeft: '8px', fontSize: '0.9em' }}>
                Servicios previos: (Ver historial)
              </span>
            </div>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '0.85em',
              color: 'white',
              backgroundColor:
                infoCliente.calificacion === 'TOXICO' ? '#d32f2f' :
                  infoCliente.calificacion === 'EXIGENTE' ? '#f57c00' : '#388e3c'
            }}>
              {infoCliente.calificacion}
            </span>
          </div>
        )}

        <div className="form-paso">
          <div>
            <label htmlFor="tipo_caso">Tipo de Servicio</label>
            <select id="tipo_caso" name="tipo_caso" value={formData.tipo_caso} onChange={handleChange}>
              <option value="alto_consumo">Diagnóstico Alto Consumo</option>
              <option value="instalacion">Instalación Eléctrica</option>
              <option value="levantamiento">Levantamiento de Proyecto</option>
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label>Dirección (Google Maps)</label>
            <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
              <input
                type="text"
                placeholder="Escribe y selecciona la dirección..."
                ref={inputRef}
                // IMPORTANTE: defaultValue permite escribir sin bloqueos.
                // La actualización automática la maneja 'handlePhoneBlur' vía inputRef.current.value
                defaultValue={formData.direccion_legible}
                required
                style={{ width: '100%' }}
              />
            </Autocomplete>
          </div>
        </div>

        {/* --- PASO 2: ASIGNACIÓN TÉCNICA --- */}
        <h4>2. Agenda y Técnico</h4>
        <div className="form-paso">
          <div>
            <label>Técnico</label>
            <select name="tecnico_id_ea" value={formData.tecnico_id_ea} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.ea_id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
          </div>
        </div>

        {/* Selector Visual de Horarios */}
        {loadingDisponibilidad && <p style={{ fontSize: '0.9em', color: '#666' }}>Consultando agenda...</p>}
        {bloquesVisibles.length > 0 && (
          <div className="disponibilidad-visual">
            <strong>Selecciona Hora de Inicio:</strong>
            <ul>
              {bloquesVisibles.map((bloque) => (
                <li
                  key={bloque.horaValor}
                  className={`
                    ${bloque.ocupado ? 'ocupado' : 'libre'}
                    ${!bloque.ocupado && bloque.horaValor === formData.hora ? 'seleccionado' : ''}
                  `}
                  onClick={!bloque.ocupado ? () => handleBloqueClick(bloque.horaValor) : undefined}
                >
                  {bloque.horaLabel}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-paso-inline">
          <div>
            <label>Hora Seleccionada</label>
            <input type="time" name="hora" value={formData.hora} readOnly />
          </div>
          <div>
            <label>Duración Estimada</label>
            <select name="duracion_horas" value={formData.duracion_horas} onChange={handleChange}>
              <option value="1">1 hora</option>
              <option value="2">2 horas</option>
              <option value="3">3 horas</option>
              <option value="5">Proyecto (5 hrs)</option>
            </select>
          </div>
        </div>

        <div className="form-paso">
          <label>Notas Internas</label>
          <textarea
            name="notas_adicionales"
            value={formData.notas_adicionales}
            onChange={handleChange}
            placeholder="Detalles para el técnico..."
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="form-botones">
          <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Procesando...' : 'Crear Caso y Agendar'}
          </button>
        </div>

      </form>
    </LoadScript>
  );
}

export default CrearCasoForm;