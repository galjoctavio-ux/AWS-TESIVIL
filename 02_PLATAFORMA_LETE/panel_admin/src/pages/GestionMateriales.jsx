import React, { useState, useEffect } from 'react';
import { obtenerInventarioAdmin, updateRecurso, deleteRecurso, aprobarRecurso } from '../apiService'; 

const GestionMateriales = () => {
  const [recursos, setRecursos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null); 

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const res = await obtenerInventarioAdmin();
    if (res.status === 'success') setRecursos(res.data);
  };

  const handleGuardar = async (id) => {
    // Leemos los 3 valores de los inputs
    const nombre = document.getElementById(`nombre-${id}`).value;
    const precio = document.getElementById(`precio-${id}`).value;
    const tiempo = document.getElementById(`tiempo-${id}`).value; // ¡NUEVO!

    await updateRecurso(id, {
        nombre: nombre,
        precio: parseFloat(precio),
        tiempo: parseInt(tiempo) // ¡NUEVO!
    });
    setEditando(null);
    cargar();
  };

  const handleBorrar = async (id) => { /* ... (sin cambios) ... */
    if(confirm("¿Seguro? Se ocultará del cotizador.")) {
        await deleteRecurso(id);
        cargar();
    }
  };
  const handleAprobar = async (id) => { /* ... (sin cambios) ... */
    await aprobarRecurso(id);
    cargar();
  };

  const filtrados = recursos.filter(r => r.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div style={{padding: '20px'}}>
      <h2>🗄️ Inventario Total (Admin)</h2>
      <input placeholder="Buscar material..." onChange={e => setBusqueda(e.target.value)} style={{padding: '10px', width: '100%', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px'}} />
      
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{background: '#343a40', color: 'white', textAlign: 'left'}}>
            <th style={{padding: '10px'}}>Estatus</th>
            <th>Nombre</th>
            <th>Precio Base</th>
            <th>Tiempo (Min)</th> {/* ¡NUEVO! */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map(r => (
            <tr key={r.id} style={{borderBottom: '1px solid #eee', background: r.estatus === 'PENDIENTE_TECNICO' ? '#fff3cd' : 'white'}}>
              <td style={{padding: '10px'}}>
                {r.estatus === 'PENDIENTE_TECNICO' ? 
                  (<span style={{background: '#ffc107', color: 'black', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold'}}>⚠️ PENDIENTE</span>) : 
                  (<span style={{color: 'green', fontSize: '0.8em'}}>✅ OK</span>)
                }
              </td>
              <td>
                {editando === r.id ? <input defaultValue={r.nombre} id={`nombre-${r.id}`} style={{width: '100%'}} /> : r.nombre}
              </td>
              <td>
                {editando === r.id ? 
                  <input type="number" step="0.01" defaultValue={r.precio_costo_base} id={`precio-${r.id}`} style={{width: '80px'}} /> : 
                  `$${parseFloat(r.precio_costo_base).toFixed(2)}`}
              </td>
              {/* ¡NUEVO CAMPO DE TIEMPO! */}
              <td>
                {editando === r.id ? 
                  <input type="number" step="1" defaultValue={r.tiempo_instalacion_min} id={`tiempo-${r.id}`} style={{width: '60px'}} /> : 
                  `${r.tiempo_instalacion_min} min`}
              </td>
              <td>
                {editando === r.id ? (
                  <button onClick={() => handleGuardar(r.id)}>💾 Guardar</button>
                ) : (
                  <div style={{display: 'flex', gap: '10px'}}>
                    {r.estatus === 'PENDIENTE_TECNICO' && (
                      <button onClick={() => handleAprobar(r.id)} style={{background: '#28a745', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer'}} title="Aprobar y Oficializar">
                        ✅
                      </button>
                    )}
                    <button onClick={() => setEditando(r.id)} style={{cursor: 'pointer'}}>✏️</button>
                    <button onClick={() => handleBorrar(r.id)} style={{color:'red', cursor: 'pointer'}}>🗑️</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default GestionMateriales;