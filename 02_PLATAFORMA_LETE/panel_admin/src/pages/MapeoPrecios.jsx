import React, { useState, useEffect } from 'react';
import { subirXml, obtenerPendientes, obtenerRecursos, vincularProducto, crearRecurso } from '../apiService';

const MapeoPrecios = () => {
  // Estados de Datos
  const [pendientes, setPendientes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de UI
  const [uploadMsg, setUploadMsg] = useState('');
  const [selecciones, setSelecciones] = useState({});

  // Estado para Nuevo Material
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaUnidad, setNuevaUnidad] = useState('');
  const [msgCreacion, setMsgCreacion] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resPendientes, resRecursos] = await Promise.all([
        obtenerPendientes(),
        obtenerRecursos()
      ]);
      if (resPendientes.status === 'success') setPendientes(resPendientes.data);
      if (resRecursos.status === 'success') setRecursos(resRecursos.data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Subir XML
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadMsg("Procesando...");
    try {
      const res = await subirXml(file);
      if (res.status === 'success') {
        setUploadMsg(`✅ ${res.data.nuevos_mapeos} nuevos, ${res.data.precios_actualizados} actualizados.`);
        cargarDatos();
      } else {
        setUploadMsg(`❌ ${res.error}`);
      }
    } catch (err) { setUploadMsg("Error de conexión"); }
  };

  // 2. Vincular
  const handleVincular = async (idMapeo) => {
    const idRecurso = selecciones[idMapeo];
    if (!idRecurso) return alert("Selecciona un recurso");
    const res = await vincularProducto(idMapeo, parseInt(idRecurso));
    if (res.status === 'success') {
      setPendientes(pendientes.filter(p => p.id !== idMapeo));
    }
  };

  // 3. CREAR NUEVO (ALTA RÁPIDA)
  const handleCrear = async () => {
    if (!nuevoNombre || !nuevaUnidad) return alert("Pon nombre y unidad");
    
    const res = await crearRecurso(nuevoNombre, nuevaUnidad);
    if (res.status === 'success') {
      setMsgCreacion(`✅ Creado: ${nuevoNombre}`);
      setNuevoNombre('');
      setNuevaUnidad('');
      cargarDatos(); // Recargamos para que aparezca en los dropdowns
      // Borrar mensaje a los 3 seg
      setTimeout(() => setMsgCreacion(''), 3000);
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>💰 Gestión de Costos</h2>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* CAJA 1: SUBIR XML */}
        <div style={{ flex: 1, background: '#f8f9fa', padding: '15px', borderRadius: '8px', minWidth: '300px' }}>
          <h4>📂 1. Subir XML</h4>
          <input type="file" accept=".xml" onChange={handleFileUpload} />
          <p style={{ fontSize: '0.9em', color: '#666' }}>{uploadMsg}</p>
        </div>

        {/* CAJA 2: CREAR MATERIAL */}
        <div style={{ flex: 1, background: '#e3f2fd', padding: '15px', borderRadius: '8px', minWidth: '300px' }}>
          <h4>✨ 2. ¿No existe? Créalo aquí</h4>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input 
              placeholder="Nombre (ej. Varilla 1/2)" 
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              style={{ flex: 2, padding: '5px' }}
            />
            <input 
              placeholder="Unidad (pza, m)" 
              value={nuevaUnidad}
              onChange={e => setNuevaUnidad(e.target.value)}
              style={{ flex: 1, padding: '5px' }}
            />
            <button onClick={handleCrear} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Crear
            </button>
          </div>
          <p style={{ color: 'green', fontSize: '0.9em', marginTop: '5px' }}>{msgCreacion}</p>
        </div>
      </div>

      <hr style={{ margin: '20px 0' }} />

      <h3>⚠️ 3. Pendientes de Vincular</h3>
      {loading ? <p>Cargando...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#343a40', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Producto XML</th>
              <th style={{ padding: '10px' }}>Costo</th>
              <th style={{ padding: '10px' }}>Es igual a...</th>
              <th style={{ padding: '10px' }}></th>
            </tr>
          </thead>
          <tbody>
            {pendientes.length === 0 ? <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Todo limpio ✅</td></tr> : 
            pendientes.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>{p.descripcion_proveedor}</div>
                  <small style={{ color: '#666' }}>{p.sku_proveedor} ({p.razon_social})</small>
                </td>
                <td style={{ padding: '10px', color: 'green' }}>${parseFloat(p.ultimo_precio_registrado).toFixed(2)}</td>
                <td style={{ padding: '10px' }}>
                  <select 
                    style={{ width: '100%', padding: '8px' }}
                    onChange={(e) => setSelecciones({ ...selecciones, [p.id]: e.target.value })}
                  >
                    <option value="">-- Seleccionar --</option>
                    {recursos.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '10px' }}>
                  <button 
                    onClick={() => handleVincular(p.id)}
                    style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MapeoPrecios;