// src/App.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importar español
import { getTecnicos, getCitas } from './api';
import AgendaGrid from './components/AgendaGrid';
import './App.css';

// Configurar Dayjs globalmente
dayjs.locale('es');

function App() {
  const [tecnicos, setTecnicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCita, setSelectedCita] = useState(null); // Estado para el Popup

  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  // Cargar Técnicos
  useEffect(() => {
    if (!token) {
      setError('Falta token de seguridad.');
      setLoading(false);
      return;
    }
    getTecnicos(token).then(setTecnicos).catch(() => setError('Error técnicos'));
  }, [token]);

  // Cargar Citas
  useEffect(() => {
    if (!token || tecnicos.length === 0) return;
    const loadCitas = async () => {
      setLoading(true);
      try {
        const data = await getCitas(fecha, token);
        setCitas(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadCitas();
  }, [fecha, tecnicos, token]);

  const cambiarDia = (dias) => {
    setFecha(dayjs(fecha).add(dias, 'day').format('YYYY-MM-DD'));
  };

  // Manejo del Modal
  const handleEventClick = (cita) => {
    // Si es un bloqueo (sin datos de cliente), tal vez no quieras abrir modal
    // Pero si quieres ver detalles aunque sea bloqueo, quita el if.
    if (cita.type === 'blocked' && !cita.details?.cliente) return;
    setSelectedCita(cita);
  };

  const closeModal = () => setSelectedCita(null);

  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div className="app-container">
      {/* 1. CABECERA: Día de la semana */}
      <header className="top-header">
        <h2>{dayjs(fecha).format('dddd D')}</h2>
        <span>{dayjs(fecha).format('MMMM YYYY')}</span>
      </header>

      {/* 2. ÁREA CENTRAL: Calendario */}
      <div className="grid-wrapper">
        {loading && <div style={{ padding: 20, textAlign: 'center' }}>Cargando agenda...</div>}

        {tecnicos.length > 0 && (
          <AgendaGrid
            tecnicos={tecnicos}
            citas={citas}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* 3. BARRA INFERIOR: Navegación */}
      <footer className="bottom-nav">
        <div className="nav-group">
          <button className="btn-nav" onClick={() => cambiarDia(-1)}>◀</button>
          <button className="btn-nav" onClick={() => cambiarDia(1)}>▶</button>
        </div>

        <input
          type="date"
          className="date-picker-trigger"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <button
          className="btn-nav btn-today"
          onClick={() => setFecha(dayjs().format('YYYY-MM-DD'))}
        >
          Hoy
        </button>
      </footer>

      {/* 4. MODAL DE DETALLES (Actualizado) */}
      {selectedCita && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <div className="modal-title">
                {/* Título: Nombre del Cliente */}
                <h3>{selectedCita.title}</h3>

                {/* Badge: Tipo de Servicio */}
                {selectedCita.details?.tipoServicio && (
                  <span className="modal-badge">{selectedCita.details.tipoServicio}</span>
                )}
              </div>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Fila 1: Horario */}
              <div className="info-row">
                <span className="icon">🕒</span>
                <div>
                  <strong>Horario:</strong><br />
                  {dayjs(selectedCita.start).format('h:mm A')} - {dayjs(selectedCita.end).format('h:mm A')}
                </div>
              </div>

              {/* Fila 2: Celular (¡AQUÍ ESTÁ LO NUEVO!) */}
              {selectedCita.details?.celular && (
                <div className="info-row">
                  <span className="icon">📱</span>
                  <div>
                    <strong>Celular:</strong><br />
                    <a
                      href={`tel:${selectedCita.details.celular}`}
                      style={{ color: '#0369a1', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                      {selectedCita.details.celular}
                    </a>
                  </div>
                </div>
              )}

              {/* Fila 3: Dirección */}
              {selectedCita.details?.direccion && (
                <div className="info-row">
                  <span className="icon">📍</span>
                  <div>
                    <strong>Dirección:</strong><br />
                    {selectedCita.details.direccion}
                  </div>
                </div>
              )}

              {/* Fila 4: Notas (Si las hay) */}
              {selectedCita.details?.notas && (
                <div className="info-row" style={{ background: '#fff3cd', padding: '8px', borderRadius: '5px' }}>
                  <span className="icon">📝</span>
                  <div>
                    <strong>Notas:</strong><br />
                    <span style={{ fontSize: '0.85rem' }}>{selectedCita.details.notas}</span>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="actions-row">
                {selectedCita.details?.celular && (
                  <a href={`tel:${selectedCita.details.celular}`} className="btn-action btn-call">
                    📞 Llamar
                  </a>
                )}

                {selectedCita.details?.mapsLink ? (
                  <a href={selectedCita.details.mapsLink} target="_blank" rel="noreferrer" className="btn-action btn-map">
                    🗺️ Ir a Maps
                  </a>
                ) : (
                  /* Fallback si no hay link pero hay dirección */
                  selectedCita.details?.direccion && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCita.details.direccion)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-action btn-map"
                    >
                      🗺️ Ir a Maps
                    </a>
                  )
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;