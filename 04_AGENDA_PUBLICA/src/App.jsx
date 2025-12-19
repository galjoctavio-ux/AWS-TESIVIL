// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
// IMPORTANTE: Asegúrate de tener deleteCita en api.js
import { getTecnicos, getCitas, updateCitaLocation, deleteCita } from './api';
import AgendaGrid from './components/AgendaGrid';
import './App.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

dayjs.locale('es');

function App() {
  const [tecnicos, setTecnicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del Modal
  const [selectedCita, setSelectedCita] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Refs
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
        setEditAddress(place.formatted_address);
      }
    }
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (!token) {
      setError('⚠️ Falta token de seguridad.');
      setLoading(false);
      return;
    }
    getTecnicos(token).then(setTecnicos).catch(() => setError('Error cargando técnicos'));
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
    setDeleting(false);
  };

  const closeModal = () => {
    setSelectedCita(null);
    setIsEditing(false);
  };

  const handleSaveLocation = async () => {
    if (!editAddress.trim()) return;
    setSaving(true);
    try {
      await updateCitaLocation(selectedCita.id, editAddress, token);

      // Actualización optimista
      const updatedCita = {
        ...selectedCita,
        details: { ...selectedCita.details, direccion: editAddress }
      };
      setSelectedCita(updatedCita);
      loadCitas(); // Recarga real
      setIsEditing(false);
    } catch (err) {
      alert("❌ Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- LÓGICA DE BORRADO ---
  const handleDeleteClick = async () => {
    if (!selectedCita) return;
    const confirmacion = window.confirm(
      "⚠️ ¿ELIMINAR CITA?\n\nSe borrará del calendario y se eliminará el caso asociado.\nEsta acción no se puede deshacer."
    );

    if (confirmacion) {
      setDeleting(true);
      try {
        await deleteCita(selectedCita.id, token);
        alert("✅ Cita eliminada.");
        closeModal();
        loadCitas();
      } catch (err) {
        alert("❌ Error: " + err.message);
      } finally {
        setDeleting(false);
      }
    }
  };

  if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div className="app-container">

        {/* --- 1. HEADER MODERNO CON NAVEGACIÓN --- */}
        <header className="top-header">
          <div className="header-info">
            <h2>{dayjs(fecha).format('dddd D')}</h2>
            <span>{dayjs(fecha).format('MMMM YYYY')}</span>
          </div>

          <div className="header-controls">
            <button className="btn-icon" onClick={() => cambiarDia(-1)}>◀</button>
            <button className="btn-today" onClick={() => setFecha(dayjs().format('YYYY-MM-DD'))}>Hoy</button>
            <input
              type="date"
              className="date-picker-trigger"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <button className="btn-icon" onClick={() => cambiarDia(1)}>▶</button>
          </div>
        </header>

        {/* --- 2. GRID PRINCIPAL --- */}
        <div className="grid-wrapper">
          {loading && (
            <div className="loading-overlay">
              <span>↻ Actualizando agenda...</span>
            </div>
          )}
          {tecnicos.length > 0 && (
            <AgendaGrid tecnicos={tecnicos} citas={citas} onEventClick={handleEventClick} />
          )}
        </div>

        {/* --- 3. MODAL PROFESIONAL --- */}
        {selectedCita && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>

              <div className="modal-header">
                <div className="modal-title">
                  <h3>{selectedCita.title}</h3>
                  {selectedCita.details?.tipoServicio && (
                    <span className="modal-badge">{selectedCita.details.tipoServicio.replace('_', ' ')}</span>
                  )}
                </div>
                <button className="btn-close" onClick={closeModal}>&times;</button>
              </div>

              <div className="modal-body">
                {/* Horario */}
                <div className="info-row">
                  <span className="icon">🕒</span>
                  <div className="info-content">
                    <span className="label">Horario</span>
                    <span className="value">
                      {dayjs(selectedCita.start).format('h:mm A')} - {dayjs(selectedCita.end).format('h:mm A')}
                    </span>
                  </div>
                </div>

                {/* Celular */}
                {selectedCita.details?.celular && (
                  <div className="info-row">
                    <span className="icon">📱</span>
                    <div className="info-content">
                      <span className="label">Contacto</span>
                      <a href={`tel:${selectedCita.details.celular}`} className="value link-phone">
                        {selectedCita.details.celular}
                      </a>
                    </div>
                  </div>
                )}

                {/* Dirección / Edición */}
                <div className="info-row">
                  <span className="icon">📍</span>
                  <div className="info-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="label">Ubicación</span>
                      {!isEditing && (
                        <small
                          style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                          onClick={() => setIsEditing(true)}
                        >
                          Editar
                        </small>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="edit-mode-box">
                        <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                          <input
                            type="text"
                            className="edit-input"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            placeholder="Buscar en Google Maps..."
                            autoFocus
                          />
                        </Autocomplete>
                        <div className="edit-actions">
                          <button
                            onClick={handleSaveLocation}
                            disabled={saving}
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            {saving ? '...' : 'Guardar'}
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            style={{ background: 'transparent', color: 'var(--text-sec)', border: 'none', padding: '6px 12px', cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="value">
                        {selectedCita.details?.direccion || <span style={{ color: 'orange' }}>Sin dirección</span>}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                {!isEditing && (
                  <>
                    <div className="actions-row">
                      {selectedCita.details?.celular && (
                        <a href={`tel:${selectedCita.details.celular}`} className="btn-action btn-call">
                          📞 Llamar
                        </a>
                      )}

                      {selectedCita.details?.mapsLink ? (
                        <a href={selectedCita.details.mapsLink} target="_blank" rel="noreferrer" className="btn-action btn-map">
                          🗺️ Ver Mapa
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

                    <div className="delete-section">
                      <button
                        className="btn-delete"
                        onClick={handleDeleteClick}
                        disabled={deleting}
                      >
                        {deleting ? 'Eliminando...' : '🗑️ Eliminar Cita'}
                      </button>
                    </div>
                  </>
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