import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { getAgendaPorDia } from '../apiService';
import CierreCasoModal from './CierreCasoModal'; // <--- 1. IMPORTAR EL NUEVO MODAL

const HOUR_HEIGHT = 80; // 80px per hour

const timelineContainerStyles = {
  position: 'relative',
  overflowY: 'auto',
  height: 'calc(100vh - 70px)', // Adjust based on header height
};

const hourGridStyles = {
  paddingLeft: '60px', // Space for the time labels
};

const hourSlotStyles = {
  height: `${HOUR_HEIGHT}px`,
  borderBottom: '1px solid #e0e0e0',
  boxSizing: 'border-box',
  position: 'relative',
  zIndex: 1,
};

const timeLabelStyles = {
  position: 'absolute',
  left: '0px',
  transform: 'translateY(-50%)',
  fontSize: '12px',
  color: '#666',
  width: '50px',
  textAlign: 'right',
  paddingRight: '10px',
};

const DiaTimeline = ({ date }) => {
  const [citas, setCitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. NUEVO ESTADO PARA EL MODAL ---
  const [casoParaCerrar, setCasoParaCerrar] = useState(null);

  const timelineRef = useRef(null);

  // --- 3. REFACTORIZAR FETCH PARA PODER REUTILIZARLO ---
  const fetchAgenda = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAgendaPorDia(date);
      setCitas(response.data || []);
    } catch (error) {
      console.error('Error fetching agenda:', error);
      setCitas([]);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  useEffect(() => {
    // Auto-scroll logic
    if (!isLoading && dayjs(date).isSame(dayjs(), 'day')) {
      setTimeout(() => {
        if (timelineRef.current) {
          const currentHour = dayjs().hour();
          const hourEl = timelineRef.current.querySelector(`#hora-${currentHour}`);
          if (hourEl) {
            hourEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [date, isLoading]);

  // Manejador para refrescar después de cerrar
  const handleCaseClosedSuccess = () => {
    fetchAgenda(); // Recargamos la lista para que el caso aparezca cerrado
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div ref={timelineRef} style={timelineContainerStyles}>
      {isLoading ? (
        <p style={{ textAlign: 'center', padding: '20px' }}>Cargando agenda...</p>
      ) : (
        <div style={hourGridStyles}>
          {hours.map(hour => (
            <div key={hour} id={`hora-${hour}`} style={{ ...hourSlotStyles, position: 'relative' }}>
              <span style={timeLabelStyles}>{`${String(hour).padStart(2, '0')}:00`}</span>
            </div>
          ))}

          {citas.map(cita => {
            const start = dayjs(cita.start_datetime);
            const end = dayjs(cita.end_datetime);
            const top = (start.hour() + start.minute() / 60) * HOUR_HEIGHT;
            const durationInMinutes = end.diff(start, 'minute');
            const height = (durationInMinutes / 60) * HOUR_HEIGHT;

            const style = { top: `${top}px`, height: `${height}px` };

            const tipoCaso = cita.caso?.tipo || 'default';
            const cardClassName = `cita-card card-${tipoCaso}`;

            // Verificamos si el caso está activo para mostrar botones
            const isCasoActivo = cita.caso &&
              cita.caso.status !== 'cerrado' &&
              cita.caso.status !== 'completado';

            return (
              <div
                key={cita.id}
                className={cardClassName}
                style={style}
              >
                {cita.caso ? (
                  <>
                    <div className="cita-content">
                      <strong>{cita.caso.cliente_nombre}</strong>
                      <p>{dayjs(cita.start_datetime).format('h:mm A')} - {dayjs(cita.end_datetime).format('h:mm A')}</p>
                    </div>

                    <div className="cita-actions">

                      {/* 1. Botón Mapa */}
                      <button
                        className="cita-icon-button"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cita.caso.cliente_direccion)}`, "_blank")}
                        title="Abrir en Google Maps"
                      >
                        📍
                      </button>

                      {/* --- 4. NUEVO BOTÓN DE CIERRE --- */}
                      {isCasoActivo && (
                        <button
                          className="cita-icon-button"
                          style={{ backgroundColor: '#e8f5e9', borderColor: '#4caf50' }} // Un toque verde para diferenciar
                          onClick={() => setCasoParaCerrar(cita.caso)}
                          title="Cobrar y Cerrar Caso"
                        >
                          💰
                        </button>
                      )}

                      {/* Botón Revisión */}
                      {(cita.caso.tipo !== 'levantamiento' && isCasoActivo) && (
                        <Link to={`/revision/${cita.caso.id}`} className="cita-icon-button" title="Iniciar Revisión">
                          📝
                        </Link>
                      )}

                      {/* Botón Cotizar */}
                      {(isCasoActivo || cita.caso.tipo === 'alto_consumo') && (
                        <Link
                          to="/cotizador"
                          state={{
                            casoId: cita.caso.id,
                            clienteNombre: cita.caso.cliente_nombre,
                            clienteDireccion: cita.caso.cliente_direccion
                          }}
                          className="cita-icon-button"
                          title="Crear Cotización"
                        >
                          ⚡
                        </Link>
                      )}

                      {/* Botón Detalles */}
                      <Link to={`/detalle-caso/${cita.caso.id}`} className="cita-icon-button" title="Ver Detalles">
                        ℹ️
                      </Link>

                    </div>
                  </>
                ) : (
                  <>
                    <strong>Cita (sin caso vinculado)</strong>
                    <p>{dayjs(cita.start_datetime).format('h:mm A')}</p>
                  </>
                )}
              </div>
            );
          })}

          {!isLoading && citas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No hay citas programadas para este día.</p>
            </div>
          )}
        </div>
      )}

      {/* --- 5. RENDERIZADO DEL MODAL --- */}
      {casoParaCerrar && (
        <CierreCasoModal
          caso={casoParaCerrar}
          onClose={() => setCasoParaCerrar(null)}
          onCaseClosed={handleCaseClosedSuccess}
        />
      )}
    </div>
  );
};

export default DiaTimeline;