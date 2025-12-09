import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { deleteCaso } from '../apiService'; // <--- 1. IMPORTAMOS deleteCaso

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

function CasosList({ onDatosActualizados }) { // Agregamos prop para refrescar dashboard si es necesario
  const [casos, setCasos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchCasos();
  }, []);

  // --- 2. LÓGICA DE BORRADO ---
  const handleDelete = async (casoId, status) => {
    if (status === 'cerrado' || status === 'completado') {
      alert('🚫 No puedes borrar casos CERRADOS o COMPLETADOS porque afectan las finanzas.');
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar este caso? Se borrarán las revisiones asociadas pero el cliente se conservará.')) {
      try {
        await deleteCaso(casoId);
        alert('✅ Caso eliminado correctamente');
        fetchCasos(); // Recargamos la lista local
        if (onDatosActualizados) onDatosActualizados(); // Avisamos al padre si existe
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert('Error al eliminar: ' + (error.response?.data?.error || error.message));
      }
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
            <th style={thStyle}>Tipo</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Técnico</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {casos.length === 0 ? (
            <tr><td colSpan="7" style={tdStyle}>No hay casos para mostrar.</td></tr>
          ) : (
            casos.map(caso => (
              <tr key={caso.id}>
                <td style={tdStyle}>{caso.id}</td>
                <td style={tdStyle}>{caso.cliente?.nombre_completo || 'Cliente Desconocido'}</td>
                <td style={tdStyle}>{caso.cliente?.direccion_principal || 'Sin Dirección'}</td>

                <td style={tdStyle}>
                  {caso.tipo_servicio
                    ? caso.tipo_servicio.replace('_', ' ').toUpperCase()
                    : 'DIAGNÓSTICO'}
                </td>

                <td style={tdStyle}>
                  {/* Badge sencillo de estado */}
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    backgroundColor: (caso.status === 'cerrado' || caso.status === 'completado') ? '#dcfce7' : '#fff7ed',
                    color: (caso.status === 'cerrado' || caso.status === 'completado') ? '#166534' : '#9a3412',
                    fontWeight: 'bold'
                  }}>
                    {caso.status}
                  </span>
                </td>

                <td style={tdStyle}>{caso.tecnico?.nombre || 'Sin asignar'}</td>

                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                    {/* BOTÓN 1: COTIZACIONES */}
                    <Link
                      to={`/cotizaciones?search=${encodeURIComponent(caso.cliente?.nombre_completo || '')}`}
                      style={{ background: '#28a745', color: 'white', textDecoration: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '14px' }}
                    >
                      💰 Ver Cotizaciones
                    </Link>

                    {/* BOTÓN 2: PDF (Solo si aplica) */}
                    {(caso.tipo_servicio === 'alto_consumo' || caso.tipo === 'alto_consumo') && (
                      <a
                        href={caso.revisiones?.[0]?.pdf_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: caso.revisiones?.[0]?.pdf_url ? '#dc3545' : '#6c757d',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontSize: '14px',
                          pointerEvents: caso.revisiones?.[0]?.pdf_url ? 'auto' : 'none',
                          opacity: caso.revisiones?.[0]?.pdf_url ? 1 : 0.6
                        }}
                      >
                        📄 PDF
                      </a>
                    )}

                    {/* --- 3. NUEVO BOTÓN DE ELIMINAR (Reemplaza al de Editar) --- */}
                    <button
                      onClick={() => handleDelete(caso.id, caso.status)}
                      style={{
                        background: 'none',
                        border: '1px solid #fee2e2',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title="Eliminar Caso"
                    >
                      🗑️
                    </button>

                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CasosList;