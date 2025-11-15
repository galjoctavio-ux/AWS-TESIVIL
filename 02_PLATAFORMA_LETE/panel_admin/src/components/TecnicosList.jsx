import React, { useState, useEffect } from 'react';
import api from '../apiService';

// --- ESTILOS (Sin cambios, copiados de tu archivo) ---
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
// ---------------------------------------------------

function TecnicosList({ onTecnicoActualizado }) {
  const [tecnicos, setTecnicos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTecnicos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/usuarios/tecnicos'); // Ruta corregida
        setTecnicos(response.data);
      } catch (err) {
        console.error('Error al obtener los técnicos:', err);
        setError('No se pudieron cargar los técnicos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTecnicos();
  }, []); // Usamos la dependencia original '[]'

  const handleDelete = async (tecnicoIdSupabase) => { // ID ahora es el de Supabase
    if (window.confirm('¿Estás seguro de que quieres eliminar este técnico?')) {
      try {
        await api.delete(`/usuarios/tecnicos/${tecnicoIdSupabase}`);
        
        // --- MODIFICACIÓN 1: Usar 'id_supabase' ---
        setTecnicos(tecnicos.filter(t => t.id_supabase !== tecnicoIdSupabase));
        
        if(onTecnicoActualizado) onTecnicoActualizado();
      } catch (err) {
        console.error('Error al eliminar el técnico:', err);
        setError('No se pudo eliminar el técnico.');
      }
    }
  };

  if (isLoading) { return <div>Cargando lista de técnicos...</div>; }
  if (error) { return <div style={{ color: 'red' }}>{error}</div>; }

  return (
    <div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Nombre</th>
            
            {/* --- CORRECCIÓN DEL TYPO ---
                Mi código anterior tenía 'style{...thStyle}'
                El código correcto es 'style={thStyle}'
            ---*/}
            <th style={thStyle}>Email</th> 
            
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tecnicos.length === 0 ? (
            <tr><td colSpan="4" style={{ ...tdStyle, textAlign: 'center' }}>No hay técnicos registrados.</td></tr>
          ) : (
            tecnicos.map(tecnico => (
              // --- MODIFICACIÓN 2: Usar 'id_supabase' para la key ---
              <tr key={tecnico.id_supabase} style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                
                {/* --- MODIFICACIÓN 3 (LA DEL CRASH): Usar 'id_supabase' ---
                    El error 'tecnico.id is undefined' venía de esta línea */}
                <td style={tdStyle}>{tecnico.id_supabase.substring(0, 8)}...</td>
                
                <td style={tdStyle}>{tecnico.nombre}</td>
                <td style={tdStyle}>{tecnico.email}</td>
                <td style={tdStyle}>
                  <button
                    style={actionButtonStyles}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Editar
                  </button>
                  
                  {/* --- MODIFICACIÓN 4: Usar 'id_supabase' en el handler --- */}
                  <button
                    onClick={() => handleDelete(tecnico.id_supabase)}
                    style={{...actionButtonStyles, color: '#DC2626', borderColor: '#F87171'}}
                    onMouseOver={e => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.color = '#991B1B'; }}
                    onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#DC2626'; }}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TecnicosList;