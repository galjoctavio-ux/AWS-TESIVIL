import React, { useState, useEffect } from 'react';
import api from '../apiService';
import AsignarCasoModal from './AsignarCasoModal';

const tableStyle = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 12px',
  marginTop: '20px',
};

const thStyle = {
  padding: '12px 16px',
  backgroundColor: '#F8FAFC',
  color: '#64748B',
  textAlign: 'left',
  textTransform: 'uppercase',
  fontSize: '12px',
  fontWeight: '600',
  borderBottom: '2px solid #E2E8F0',
};

const tdStyle = {
  padding: '16px',
  borderBottom: '1px solid #E2E8F0',
  color: '#1E293B',
};

const actionButtonStyles = {
  border: '1px solid #CBD5E1',
  backgroundColor: 'transparent',
  color: '#334155',
  borderRadius: '6px',
  padding: '6px 12px',
  cursor: 'pointer',
  marginRight: '8px',
  fontSize: '14px',
  transition: 'background-color 0.2s, color 0.2s',
};

function CasosList({ onDatosActualizados, onAgendarClick }) { // 1. Recibir 'onDatosActualizados'
  const [casos, setCasos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [casoParaAsignar, setCasoParaAsignar] = useState(null);

  useEffect(() => {
    const fetchCasos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/casos');
        setCasos(response.data);
      } catch (err) {
        console.error('Error al obtener los casos:', err);
        setError('No se pudieron cargar los casos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCasos();
  }, []); // 2. Array vacío, el 'key' en Dashboard refresca

  // 3. Esta función ahora llama a la prop correcta
  const handleCasoAsignado = () => {
    if (onDatosActualizados) {
      onDatosActualizados(); // Llama a la función del Dashboard
    }
  };

  if (isLoading) { return <div>Cargando lista de casos...</div>; }
  if (error) { return <div style={{ color: 'red' }}>{error}</div>; }

  return (
    <div>
      <h3>Lista de Casos</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Cliente</th>
            <th style={thStyle}>Dirección</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Técnico Asignado</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {casos.length === 0 ? (
            <tr><td colSpan="6" style={tdStyle}>No hay casos para mostrar.</td></tr>
          ) : (
            casos.map(caso => (
              <tr key={caso.id}>
                <td style={tdStyle}>{caso.id}</td>
                <td style={tdStyle}>{caso.cliente_nombre}</td>
                <td style={tdStyle}>{caso.cliente_direccion}</td>
                <td style={tdStyle}>{caso.status}</td>
                <td style={tdStyle}>{caso.tecnico?.nombre || 'Sin asignar'}</td>
                <td style={tdStyle}>
                  <button>Ver</button>
                  <button 
                    onClick={() => setCasoParaAsignar(caso)}
                    disabled={caso.status === 'completado'}
                  >
                    Asignar
                  </button>
                  <button
                    onClick={() => onAgendarClick(caso)}
                    disabled={caso.status !== 'asignado'}
                  >
                    Agendar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {casoParaAsignar && (
        <AsignarCasoModal
          caso={casoParaAsignar}
          onClose={() => setCasoParaAsignar(null)}
          onCasoAsignado={handleCasoAsignado} // 4. Pasar la función
        />
      )}
    </div>
  );
}

export default CasosList;
