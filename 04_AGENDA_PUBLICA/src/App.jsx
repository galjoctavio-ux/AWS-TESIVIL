// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { LoadScript, Autocomplete } from '@react-google-maps/api'; //
import { getTecnicos, getCitas, updateCitaLocation } from './api';
import AgendaGrid from './components/AgendaGrid';
import './App.css';

// Configuración de Google Maps
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; //
const libraries = ["places"]; //

dayjs.locale('es');

function App() {
  const [tecnicos, setTecnicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del Modal
  const [selectedCita, setSelectedCita] = useState(null);

  // Estados de Edición
  const [isEditing, setIsEditing] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Referencias para Google Maps
  const autocompleteRef = useRef(null);

  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  // --- HANDLERS GOOGLE MAPS ---
  const onAutocompleteLoad = (autocompleteInstance) => {
    autocompleteRef.current = autocompleteInstance;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        // Actualizamos el estado con la dirección limpia de Google
        setEditAddress(place.formatted_address);
        console.log("Dirección seleccionada:", place.formatted_address);
      }
    }
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (!token) {
      setError('Falta token de seguridad.');
      setLoading(false);
      return;
    }
    getTecnicos(token).then(setTecnicos).catch(() => setError('Error técnicos'));
  }, [token]);

  const loadCitas = async () => {
    if (!token || tecnicos.length === 0) return;
    setLoading(true);
    try {
      const data = await getCitas(fecha, token);
      setCitas(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadCitas();
  }, [fecha, tecnicos, token]);

  const cambiarDia = (dias) => {
    setFecha(dayjs(fecha).add(dias, 'day').format('YYYY-MM-DD'));
  };

  // --- MANEJO DEL MODAL ---
  const handleEventClick = (cita) => {
    if (cita.type === 'blocked' && !cita.details?.cliente) return;

    setSelectedCita(cita);
    setEditAddress(cita.details?.direccion || "");
    setIsEditing(false);
  };

  const closeModal = () => {
    setSelectedCita(null);
    setIsEditing(false);
  };

  const handleSaveLocation = async () => {
    if (!editAddress.trim()) return;
    setSaving(true);
    try {
      // Enviamos la dirección (texto) al backend.
      // El backend la recibirá, hará su propio geocoding (ahora infalible porque el texto es de Google)
      // y actualizará coordenadas y links.
      await updateCitaLocation(selectedCita.id, editAddress, token);

      const updatedCita = {
        ...selectedCita,
        details: { ...selectedCita.details, direccion: editAddress }
      };
      setSelectedCita(updatedCita);

      loadCitas(); // Recargar para obtener las nuevas coordenadas calculadas por el server

      setIsEditing(false);
      alert("✅ Ubicación actualizada y coordenadas recalculadas.");
    } catch (err) {
      alert("❌ Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    // Envolvemos toda la App en LoadScript para cargar la API una sola vez
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div className="app-container">
        <header className="top-header">
          <h2>{dayjs(fecha).format('dddd D')}</h2>
          <span>{dayjs(fecha).format('MMMM YYYY')}</span>
        </header>

        <div className="grid-wrapper">
          {loading && <div style={{ padding: 20, textAlign: 'center' }}>Cargando agenda...</div>}
          {tecnicos.length > 0 && (
            <AgendaGrid tecnicos={tecnicos} citas={citas} onEventClick={handleEventClick} />
          )}
        </div>

        <footer className="bottom-nav">
          <div className="nav-group">
            <button className="btn-nav" onClick={() => cambiarDia(-1)}>◀</button>
            <button className="btn-nav" onClick={() => cambiarDia(1)}>▶</button>
          </div>
          <input type="date" className="date-picker-trigger" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <button className="btn-nav btn-today" onClick={() => setFecha(dayjs().format('YYYY-MM-DD'))}>Hoy</button>
        </footer>

        {/* --- MODAL --- */}
        {selectedCita && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>

              <div className="modal-header">
                <div className="modal-title">
                  <h3>{selectedCita.title}</h3>
                  {selectedCita.details?.tipoServicio && (
                    <span className="modal-badge">{selectedCita.details.tipoServicio}</span>
                  )}
                </div>
                <button className="btn-close" onClick={closeModal}>×</button>
              </div>

              <div className="modal-body">
                {/* Info Horario */}
                <div className="info-row">
                  <span className="icon">🕒</span>
                  <div>
                    <strong>Horario:</strong><br />
                    {dayjs(selectedCita.start).format('h:mm A')} - {dayjs(selectedCita.end).format('h:mm A')}
                  </div>
                </div>

                {/* Info Celular */}
                {selectedCita.details?.celular && (
                  <div className="info-row">
                    <span className="icon">📱</span>
                    <div>
                      <strong>Celular:</strong><br />
                      <a href={`tel:${selectedCita.details.celular}`} style={{ color: '#0369a1', fontWeight: 'bold', textDecoration: 'none' }}>
                        {selectedCita.details.celular}
                      </a>
                    </div>
                  </div>
                )}

                {/* --- ZONA EDITABLE CON GOOGLE AUTOCOMPLETE --- */}
                <div className="info-row" style={{ border: isEditing ? '2px solid #2196F3' : 'none', borderRadius: '8px', padding: isEditing ? '8px' : '0' }}>
                  <span className="icon">📍</span>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Dirección:</strong>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          style={{ fontSize: '0.8rem', padding: '2px 8px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✏️ Editar
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div style={{ marginTop: '8px' }}>
                        {/* INPUT CON AUTOCOMPLETE */}
                        <Autocomplete
                          onLoad={onAutocompleteLoad}
                          onPlaceChanged={onPlaceChanged}
                        >
                          <input
                            type="text"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            placeholder="🔍 Buscar en Google Maps..."
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '4px',
                              border: '1px solid #2196F3', // Azul para indicar foco
                              outline: 'none'
                            }}
                          />
                        </Autocomplete>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button
                            onClick={handleSaveLocation}
                            disabled={saving}
                            style={{ flex: 1, background: '#4CAF50', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            {saving ? 'Guardando...' : '💾 Confirmar'}
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        </div>
                        <small style={{ display: 'block', marginTop: 5, color: '#666', fontSize: '0.75rem' }}>
                          * Selecciona una opción de la lista para mayor precisión.
                        </small>
                      </div>
                    ) : (
                      // MODO LECTURA
                      <div style={{ marginTop: '4px' }}>
                        {selectedCita.details?.direccion || <span style={{ color: 'red' }}>Sin dirección</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción (Maps / Llamar) */}
                {!isEditing && (
                  <div className="actions-row" style={{ marginTop: '15px' }}>
                    {selectedCita.details?.celular && (
                      <a href={`tel:${selectedCita.details.celular}`} className="btn-action btn-call">📞 Llamar</a>
                    )}

                    {selectedCita.details?.mapsLink ? (
                      <a href={selectedCita.details.mapsLink} target="_blank" rel="noreferrer" className="btn-action btn-map">
                        🗺️ Ir a Maps
                      </a>
                    ) : (
                      selectedCita.details?.direccion && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCita.details.direccion)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-action btn-map"
                        >
                          🗺️ Buscar
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
}

export default App;