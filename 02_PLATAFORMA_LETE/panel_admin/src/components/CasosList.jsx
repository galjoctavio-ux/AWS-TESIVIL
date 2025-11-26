import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../apiService';
import EditarCasoModal from './EditarCasoModal';

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

function CasosList() {
  const [casos, setCasos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaso, setEditingCaso] = useState(null);

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

  const handleEditClick = (caso) => {
    setEditingCaso(caso);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCaso(null);
  };

  const handleSaveCaso = async (formData) => {
    if (!editingCaso) return;
    try {
      await api.put(`/casos/${editingCaso.id}`, formData);
      handleCloseModal();
      fetchCasos(); // Recargar la lista
    } catch (error) {
      console.error("Error al guardar el caso:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  if (isLoading) { return <div>Cargando lista de casos...</div>; }
  if (error) { return <div style={{ color: 'red' }}>{error}</div>; }

  const VITE_PHP_API_URL = import.meta.env.VITE_PHP_API_BASE_URL || '/api';

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

                {/* --- CORRECCIÓN AQUÍ: Accedemos al objeto 'cliente' --- */}
                <td style={tdStyle}>
                  {caso.cliente?.nombre_completo || 'Cliente Desconocido'}
                </td>
                <td style={tdStyle}>
                  {caso.cliente?.direccion_principal || 'Sin Dirección'}
                </td>
                {/* ----------------------------------------------------- */}

                <td style={tdStyle}>
                  {caso.tipo_servicio
                    ? caso.tipo_servicio.replace('_', ' ').toUpperCase()
                    : 'DIAGNÓSTICO'}
                </td>
                <td style={tdStyle}>{caso.status}</td>
                <td style={tdStyle}>{caso.tecnico?.nombre || 'Sin asignar'}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditClick(caso)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>✏️ Editar</button>

                    {/* --- CORRECCIÓN ADICIONAL: El enlace a cotizaciones también estaba roto --- */}
                    <Link
                      to={`/cotizaciones?search=${encodeURIComponent(caso.cliente?.nombre_completo || '')}`}
                      style={{ background: '#28a745', color: 'white', textDecoration: 'none', padding: '5px 10px', borderRadius: '4px' }}
                    >
                      💰 Cotizaciones
                    </Link>
                    {/* ------------------------------------------------------------------------- */}

                    {/* Nota: En tu código original usabas 'caso.tipo' aquí abajo, pero en el backend traes 'tipo_servicio'. 
                        Si 'caso.tipo' no existe en la respuesta del backend, esto nunca se mostrará. 
                        Asumiré que 'tipo_servicio' es lo correcto o que 'tipo' viene de otro lado no visto. 
                        Por seguridad, usaré la lógica que ya tenías pero verifica si es 'tipo_servicio'. */}
                    {(caso.tipo === 'alto_consumo' || caso.tipo_servicio === 'alto_consumo') && (
                      <a
                        href={caso.revisiones?.[0]?.pdf_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: caso.revisiones?.[0]?.pdf_url ? '#dc3545' : '#6c757d',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          pointerEvents: caso.revisiones?.[0]?.pdf_url ? 'auto' : 'none'
                        }}
                      >
                        📄 PDF
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {editingCaso && (
        <EditarCasoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          caso={editingCaso}
          onSave={handleSaveCaso}
        />
      )}
    </div>
  );
}

export default CasosList;
