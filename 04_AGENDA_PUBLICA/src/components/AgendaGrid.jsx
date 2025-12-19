// src/components/AgendaGrid.jsx
import React from 'react';
import dayjs from 'dayjs';
import './AgendaGrid.css'; // Asegúrate que este archivo exista aunque sea vacío, o usa el CSS global

const HORA_INICIO = 8;
const HORA_FIN = 20;
const PIXELS_POR_HORA = 80; // Aumenté un poco para más aire

// Colores más profesionales y suaves (tipo Google Calendar)
const COLORS = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }, // Azul
  { bg: '#dcfce7', border: '#22c55e', text: '#166534' }, // Verde
  { bg: '#fef9c3', border: '#eab308', text: '#854d0e' }, // Amarillo
  { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' }, // Morado
  { bg: '#ffedd5', border: '#f97316', text: '#9a3412' }, // Naranja
  { bg: '#fae8ff', border: '#d946ef', text: '#86198f' }, // Rosa
];

const getTechStyle = (index) => COLORS[index % COLORS.length];

const AgendaGrid = ({ tecnicos, citas, onEventClick }) => {
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);
  const totalHeight = horas.length * PIXELS_POR_HORA;

  const getEventStyle = (cita, indexTecnico) => {
    const start = dayjs(cita.start);
    const end = dayjs(cita.end);
    const startHour = start.hour();
    const startMin = start.minute();
    const totalMinutes = (startHour - HORA_INICIO) * 60 + startMin;
    const duration = end.diff(start, 'minute');

    const style = getTechStyle(indexTecnico);
    const isBlocked = cita.type === 'blocked';

    return {
      top: `${(totalMinutes / 60) * PIXELS_POR_HORA}px`,
      height: `${(duration / 60) * PIXELS_POR_HORA}px`,
      backgroundColor: isBlocked ? '#f1f5f9' : style.bg,
      borderLeft: isBlocked ? '4px solid #94a3b8' : `4px solid ${style.border}`,
      color: isBlocked ? '#64748b' : style.text,
      position: 'absolute',
      left: '4px',
      right: '4px',
      borderRadius: '4px',
      padding: '4px 6px',
      fontSize: '0.75rem',
      overflow: 'hidden',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      zIndex: 1,
      transition: 'transform 0.1s, box-shadow 0.1s',
    };
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>

      {/* 1. ENCABEZADO DE TÉCNICOS (STICKY) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ width: '60px', flexShrink: 0, borderRight: '1px solid #e2e8f0' }}></div> {/* Corner */}
        {tecnicos.map(tech => (
          <div key={tech.id} style={{
            flex: 1,
            minWidth: '120px',
            padding: '10px',
            textAlign: 'center',
            fontWeight: '600',
            color: '#334155',
            borderRight: '1px solid #e2e8f0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {tech.first_name} {tech.last_name.charAt(0)}.
          </div>
        ))}
      </div>

      {/* 2. AREA SCROLLABLE (HORAS + COLUMNAS) */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex' }}>

        {/* COLUMNA DE HORAS */}
        <div style={{ width: '60px', flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#fff' }}>
          {horas.map(hora => (
            <div key={hora} style={{
              height: `${PIXELS_POR_HORA}px`,
              borderBottom: '1px solid #f1f5f9',
              fontSize: '0.7rem',
              color: '#94a3b8',
              textAlign: 'right',
              paddingRight: '8px',
              transform: 'translateY(-8px)' // Ajuste visual para alinear con la línea
            }}>
              {hora}:00
            </div>
          ))}
        </div>

        {/* COLUMNAS DE TÉCNICOS */}
        {tecnicos.map((tech, index) => {
          const misCitas = citas.filter(c => c.resourceId === tech.id);
          return (
            <div key={tech.id} style={{
              flex: 1,
              minWidth: '120px',
              position: 'relative',
              borderRight: '1px solid #f1f5f9',
              height: `${totalHeight}px`,
              backgroundSize: `100% ${PIXELS_POR_HORA}px`,
              backgroundImage: 'linear-gradient(to bottom, #f8fafc 1px, transparent 1px)' // Líneas guías
            }}>
              {misCitas.map(cita => (
                <div
                  key={cita.id}
                  style={getEventStyle(cita, index)}
                  onClick={() => onEventClick && onEventClick(cita)}
                  className="agenda-card-hover" // Clase para hover effect si lo deseas en CSS
                >
                  <strong style={{ display: 'block', fontSize: '0.8rem' }}>
                    {dayjs(cita.start).format('HH:mm')}
                  </strong>
                  <div style={{ fontWeight: '600', lineHeight: '1.2' }}>
                    {cita.title}
                  </div>
                  {cita.details?.celular && (
                    <div style={{ marginTop: '2px', opacity: 0.8, fontSize: '0.7rem' }}>
                      📱 {cita.details.celular}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaGrid;