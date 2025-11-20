import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerInventarioAdmin, updateRecurso, deleteRecurso, aprobarRecurso, crearRecurso } from '../apiService';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '450px',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
};

Modal.setAppElement('#root');

const GestionMateriales = () => {
  const [recursos, setRecursos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [orden, setOrden] = useState('reciente'); // 'reciente', 'antiguo', 'precio_alto', 'precio_bajo'

  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaUnidad, setNuevaUnidad] = useState('pza');
  const [nuevoPrecio, setNuevoPrecio] = useState(0);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const res = await obtenerInventarioAdmin();
    if (res.status === 'success') setRecursos(res.data);
  };

  // --- LÓGICA DEL MODAL ---
  const handleAbrirModal = () => setModalOpen(true);
  const handleCerrarModal = () => setModalOpen(false);

  const handleCrearManual = async () => {
    if (!nuevoNombre || !nuevaUnidad) {
      alert("Nombre y unidad son requeridos.");
      return;
    }
    const res = await crearRecurso(nuevoNombre, nuevaUnidad, nuevoPrecio);
    if (res.status === 'success') {
      cargar(); 
      handleCerrarModal();
      setNuevoNombre('');
      setNuevaUnidad('pza');
      setNuevoPrecio(0);
    } else {
      alert("Error: " + (res.error || 'No se pudo crear'));
    }
  };

  const handleGuardar = async (id) => {
    const nombre = document.getElementById(`nombre-${id}`).value;
    const precio = document.getElementById(`precio-${id}`).value;
    const tiempo = document.getElementById(`tiempo-${id}`).value;
    const unidad = document.getElementById(`unidad-${id}`).value;

    await updateRecurso(id, {
        nombre: nombre,
        precio: parseFloat(precio),
        tiempo: parseInt(tiempo),
        unidad: unidad
    });
    setEditando(null);
    cargar();
  };

  const handleBorrar = async (id) => {
    if(confirm("¿Seguro? Se ocultará del cotizador.")) {
        await deleteRecurso(id);
        cargar();
    }
  };

  const handleAprobar = async (id) => {
    await aprobarRecurso(id);
    cargar();
  };

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const procesarDatos = () => {
    let datos = recursos.filter(r => 
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      (r.sku_proveedor && r.sku_proveedor.toLowerCase().includes(busqueda.toLowerCase()))
    );

    switch(orden) {
      case 'reciente':
        // Usamos ID descendente como proxy de "Más Reciente"
        datos.sort((a, b) => b.id - a.id);
        break;
      case 'antiguo':
        datos.sort((a, b) => a.id - b.id);
        break;
      case 'precio_alto':
        datos.sort((a, b) => parseFloat(b.precio_costo_base) - parseFloat(a.precio_costo_base));
        break;
      case 'precio_bajo':
        datos.sort((a, b) => parseFloat(a.precio_costo_base) - parseFloat(b.precio_costo_base));
        break;
      default:
        break;
    }
    return datos;
  };

  const datosVisibles = procesarDatos();

  return (
    <div style={{padding: '20px', maxWidth: '1400px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
         <div>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#6c757d', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                &larr; Volver
            </Link>
            <h2 style={{margin: 0}}>🗄️ Inventario Maestro</h2>
         </div>
        <button onClick={handleAbrirModal} style={{background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'}}>
          + Nuevo Material
        </button>
      </div>

      {/* BARRA DE HERRAMIENTAS */}
      <div style={{display: 'flex', gap: '15px', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px'}}>
        <input 
            placeholder="🔍 Buscar por nombre o SKU..." 
            onChange={e => setBusqueda(e.target.value)} 
            style={{flex: 1, padding: '10px', border: '1px solid #ced4da', borderRadius: '6px'}} 
        />
        
        <select 
            value={orden} 
            onChange={(e) => setOrden(e.target.value)}
            style={{padding: '10px', border: '1px solid #ced4da', borderRadius: '6px', background: 'white', cursor: 'pointer'}}
        >
            <option value="reciente">📅 Más Recientes</option>
            <option value="antiguo">📅 Más Antiguos</option>
            <option value="precio_alto">💰 Precio Mayor</option>
            <option value="precio_bajo">💰 Precio Menor</option>
        </select>
      </div>

      <div style={{overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
            <thead>
            <tr style={{background: '#1f2937', color: 'white', textAlign: 'left'}}>
                <th style={{padding: '12px'}}>Estatus</th>
                <th style={{padding: '12px'}}>SKU</th> {/* NUEVA */}
                <th style={{padding: '12px'}}>Nombre</th>
                <th style={{padding: '12px'}}>Última Act.</th> {/* NUEVA */}
                <th style={{padding: '12px'}}>Unidad</th>
                <th style={{padding: '12px'}}>Costo Base</th>
                <th style={{padding: '12px'}}>Tiempo</th>
                <th style={{padding: '12px'}}>Acciones</th>
            </tr>
            </thead>
            <tbody>
            {datosVisibles.map(r => (
                <tr key={r.id} style={{borderBottom: '1px solid #eee', background: r.estatus === 'PENDIENTE_TECNICO' ? '#fff8e1' : 'white'}}>
                <td style={{padding: '12px'}}>
                    {r.estatus === 'PENDIENTE_TECNICO' ?
                    (<span style={{background: '#fbbf24', color: '#78350f', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75em', fontWeight: 'bold'}}>⚠️ PENDIENTE</span>) :
                    (<span style={{color: '#059669', fontSize: '0.8em', fontWeight: '600'}}>✅ OK</span>)
                    }
                </td>
                <td style={{padding: '12px', color: '#6b7280', fontFamily: 'monospace'}}>
                    {r.sku_proveedor || '---'}
                </td>
                <td style={{padding: '12px', fontWeight: '500'}}>
                    {editando === r.id ? <input defaultValue={r.nombre} id={`nombre-${r.id}`} style={{width: '100%', padding: '5px'}} /> : r.nombre}
                </td>
                <td style={{padding: '12px', color: '#6b7280', fontSize: '0.85em'}}>
                    {r.fecha_ultimo_xml ? r.fecha_ultimo_xml.split(' ')[0] : 'Manual'}
                </td>
                <td style={{padding: '12px'}}>
                    {editando === r.id ? <input defaultValue={r.unidad || ''} id={`unidad-${r.id}`} style={{width: '50px', padding: '5px'}} /> : r.unidad}
                </td>
                <td style={{padding: '12px', color: '#2563eb', fontWeight: 'bold'}}>
                    {editando === r.id ?
                    <input type="number" step="0.01" defaultValue={r.precio_costo_base} id={`precio-${r.id}`} style={{width: '80px', padding: '5px'}} /> :
                    `$${parseFloat(r.precio_costo_base).toFixed(2)}`}
                </td>
                <td style={{padding: '12px'}}>
                    {editando === r.id ?
                    <input type="number" step="1" defaultValue={r.tiempo_instalacion_min} id={`tiempo-${r.id}`} style={{width: '60px', padding: '5px'}} /> :
                    `${r.tiempo_instalacion_min} min`}
                </td>
                <td style={{padding: '12px'}}>
                    {editando === r.id ? (
                    <button onClick={() => handleGuardar(r.id)} style={{background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>💾</button>
                    ) : (
                    <div style={{display: 'flex', gap: '8px'}}>
                        {r.estatus === 'PENDIENTE_TECNICO' && (
                        <button onClick={() => handleAprobar(r.id)} style={{background: '#059669', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer'}} title="Aprobar">
                            ✅
                        </button>
                        )}
                        <button onClick={() => setEditando(r.id)} style={{background: '#e5e7eb', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer'}} title="Editar">✏️</button>
                        <button onClick={() => handleBorrar(r.id)} style={{background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer'}} title="Borrar">🗑️</button>
                    </div>
                    )}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>

      {/* --- MODAL DE CREACIÓN --- */}
      <Modal isOpen={modalOpen} onRequestClose={handleCerrarModal} style={customStyles}>
        <h2 style={{marginTop: 0, color: '#1f2937'}}>Agregar Material</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <div>
             <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', color: '#6b7280'}}>Nombre del Material</label>
             <input
                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box'}}
                placeholder="Ej. Cable Calibre 12..."
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
            />
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <div style={{flex: 1}}>
                <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', color: '#6b7280'}}>Unidad</label>
                <input
                    style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box'}}
                    placeholder="pza, m, kg"
                    value={nuevaUnidad}
                    onChange={e => setNuevaUnidad(e.target.value)}
                />
            </div>
            <div style={{flex: 1}}>
                <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', color: '#6b7280'}}>Precio Costo</label>
                <input
                    type="number"
                    style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box'}}
                    placeholder="0.00"
                    value={nuevoPrecio}
                    onChange={e => setNuevoPrecio(parseFloat(e.target.value))}
                />
            </div>
          </div>
          
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
            <button onClick={handleCerrarModal} style={{background: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'}}>Cancelar</button>
            <button onClick={handleCrearManual} style={{background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'}}>Crear Material</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default GestionMateriales;