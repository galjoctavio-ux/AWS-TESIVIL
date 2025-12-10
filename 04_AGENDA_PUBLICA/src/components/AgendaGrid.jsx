// src/components/AgendaGrid.jsx
import React from 'react';
import dayjs from 'dayjs';
import './AgendaGrid.css';

const HORA_INICIO = 8;
const HORA_FIN = 20;
const PIXELS_POR_HORA = 60;

// Paleta de colores pastel estilo GroupCal
const COLORS = [
  '#E3F2FD', // Azul claro
  '#E8F5E9', // Verde claro
  '#FFF3E0', // Naranja claro
  '#F3E5F5', // Lila
  '#E0F7FA', // Cyan
  '#FFEBEE', // Rojo claro
];

// Función para obtener color estable basado en el ID del técnico
const getTechColor = (id, index) => {
  const colorHex = COLORS[index % COLORS.length];
  return { bg: colorHex, text: '#374151' }; // Texto gris oscuro para contraste
};

const AgendaGrid = ({ tecnicos, citas, onEventClick }) => {
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);
  const totalHeight = horas.length * PIXELS_POR_HORA;

  // Calculamos posición vertical
  const getEventStyle = (cita, indexTecnico) => {
    const start = dayjs(cita.start);
    const end = dayjs(cita.end);
    
    const startHour = start.hour();
    const startMin = start.minute();
    const totalMinutes = (startHour - HORA_INICIO) * 60 + startMin;
    const duration = end.diff(start, 'minute');

    const techColor = getTechColor(cita.resourceId, indexTecnico);

    return {
      top: `${(totalMinutes / 60) * PIXELS_POR_HORA}px`,
      height: `${(duration / 60) * PIXELS_POR_HORA}px`,
      backgroundColor: techColor.bg,
      color: techColor.text
    };
  };

  return (
    <div className="agenda-container">
      <div className="scroll-wrapper">
        <div 
          className="grid-layout" 
          style={{ '--tech-count': tecnicos.length }}
        >
          {/* 1. FILA DE ENCABEZADOS (Sticky Top) */}
          <div className="header-row">
            <div className="corner-cell"></div> {/* Esquina vacía sobre horas */}
            {tecnicos.map(tech => (
              <div key={tech.id} className="header-cell">
                {/* MOSTRAR NOMBRE COMPLETO */}
                {tech.first_name} {tech.last_name}
              </div>
            ))}
          </div>

          {/* 2. COLUMNA DE HORAS (Sticky Left) */}
          <div className="time-col" style={{ height: `${totalHeight}px` }}>
            {horas.map(hora => (
              <div key={hora} className="time-slot" style={{ height: `${PIXELS_POR_HORA}px` }}>
                {hora}:00
              </div>
            ))}
          </div>

          {/* 3. COLUMNAS DE CONTENIDO */}
          {tecnicos.map((tech, index) => {
             const misCitas = citas.filter(c => c.resourceId === tech.id);
             
             return (
               <div key={tech.id} className="tech-col" style={{ height: `${totalHeight}px` }}>
                 {misCitas.map(cita => (
                   <div
                     key={cita.id}
                     className={`event-card ${cita.type}`}
                     style={getEventStyle(cita, index)}
                     onClick={() => onEventClick && onEventClick(cita)}
                     title={`${cita.title}\n${dayjs(cita.start).format('HH:mm')} - ${dayjs(cita.end).format('HH:mm')}`}
                   >
                     <strong>{dayjs(cita.start).format('HH:mm')}</strong>
                     <div style={{marginTop:'2px', lineHeight:'1.1'}}>{cita.title}</div>
                   </div>
                 ))}
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgendaGrid;
