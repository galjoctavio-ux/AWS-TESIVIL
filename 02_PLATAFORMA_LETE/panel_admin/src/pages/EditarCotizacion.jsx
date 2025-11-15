import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { obtenerDetalleCotizacion, guardarCambiosCotizacion, obtenerRecursos } from '../apiService';

const EditarCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);
  
  // Listas editables
  const [materiales, setMateriales] = useState([]);
  const [manoObra, setManoObra] = useState([]);
  
  // Catálogo
  const [catalogo, setCatalogo] = useState([]);
  const [itemSeleccionado, setItemSeleccionado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const [cotiRes, catRes] = await Promise.all([
        obtenerDetalleCotizacion(id),
        obtenerRecursos()
      ]);

      if (cotiRes.status === 'success') {
        setCotizacion(cotiRes.data.header);
        
        setMateriales(cotiRes.data.materiales.map(m => ({
          id_recurso_ref: m.recurso_id, 
          nombre: m.nombre,
          unidad: m.unidad,
          cantidad: parseFloat(m.cantidad),
          precio_base: parseFloat(m.precio_base_capturado)
        })));
        
        setManoObra(cotiRes.data.mano_obra.map(mo => ({
          descripcion: mo.descripcion,
          horas: parseFloat(mo.horas)
        })));
      }
      if (catRes.status === 'success') {
        setCatalogo(catRes.data);
      }
    } catch (error) {
      alert("Error cargando datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS FINANCIEROS ---
  // Nota: Estos valores vienen de la BD. Al guardar se recalculan.
  const calcularFinanzas = () => {
    if (!cotizacion) return {};
    
    const matCD = parseFloat(cotizacion.total_materiales_cd || 0);
    const moCD = parseFloat(cotizacion.total_mano_obra_cd || 0);
    const costoDirectoTotal = matCD + moCD;
    
    // Estimación inversa de indirectos (basado en tu config del backend)
    // Precio Venta = (CostoDirecto + Indirectos) + Utilidad
    // Aquí mostramos lo que ya se guardó.
    const precioVenta = parseFloat(cotizacion.subtotal_venta || 0);
    const utilidadBruta = precioVenta - costoDirectoTotal;
    
    const margen = precioVenta > 0 ? ((utilidadBruta / precioVenta) * 100) : 0;

    return { matCD, moCD, costoDirectoTotal, precioVenta, utilidadBruta, margen };
  };

  const finanzas = calcularFinanzas();

  // --- MANEJO DE MATERIALES ---
  const changeMaterialCant = (index, nuevaCant) => {
    const nuevos = [...materiales];
    nuevos[index].cantidad = parseFloat(nuevaCant) || 0;
    setMateriales(nuevos);
  };

  const eliminarMaterial = (index) => {
    const nuevos = [...materiales];
    nuevos.splice(index, 1);
    setMateriales(nuevos);
  };

  const agregarMaterial = () => {
    if (!itemSeleccionado) return;
    const recurso = catalogo.find(r => r.id == itemSeleccionado);
    if (!recurso) return;

    setMateriales([...materiales, {
      id_recurso_ref: recurso.id,
      nombre: recurso.nombre,
      unidad: recurso.unidad,
      cantidad: 1,
      precio_base: parseFloat(recurso.precio_costo_base)
    }]);
    setItemSeleccionado('');
  };

  // --- MANEJO DE MANO DE OBRA ---
  const changeMOHoras = (index, nuevasHoras) => {
    const nuevas = [...manoObra];
    nuevas[index].horas = parseFloat(nuevasHoras) || 0;
    setManoObra(nuevas);
  };

  const changeMODesc = (index, texto) => {
    const nuevas = [...manoObra];
    nuevas[index].descripcion = texto;
    setManoObra(nuevas);
  };

  const eliminarMO = (index) => {
    const nuevas = [...manoObra];
    nuevas.splice(index, 1);
    setManoObra(nuevas);
  };

  const agregarMO = () => {
    setManoObra([...manoObra, { descripcion: 'Nueva tarea', horas: 1 }]);
  };

  // --- GUARDAR ---
  const handleGuardar = async () => {
    if (!window.confirm("¿Guardar cambios? Se recalcularán todos los costos.")) return;
    setGuardando(true);
    try {
      const payload = {
        id: parseInt(id),
        cliente_email: cotizacion.cliente_email,
        cliente_nombre: cotizacion.cliente_nombre,
        items: materiales.map(m => ({ id_recurso: m.id_recurso_ref, cantidad: m.cantidad })),
        mano_de_obra: manoObra
      };

      const res = await guardarCambiosCotizacion(payload);
      if (res.status === 'success') {
        alert("✅ Actualizado.");
        cargarDatos(); // Recargamos para ver los nuevos números financieros
      } else {
        alert("Error: " + res.error);
      }
    } catch (error) { alert("Error: " + error.message); } 
    finally { setGuardando(false); }
  };

  const formatMoney = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);

  if (loading) return <div style={{padding:'40px'}}>Cargando...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
            <h2 style={{margin:0}}>✏️ Editor Maestro: Cotización #{id}</h2>
            <span style={{color:'#666'}}>{cotizacion?.cliente_nombre}</span>
        </div>
        <Link to="/cotizaciones" style={{ textDecoration: 'none', color: '#666', background:'#f1f1f1', padding:'8px 15px', borderRadius:'5px' }}>&larr; Volver</Link>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* COLUMNA IZQUIERDA: EDITOR */}
        <div style={{ flex: 2, minWidth: '300px' }}>
            
            {/* MATERIALES */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0, color: '#0056b3' }}>🧱 Materiales</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Cant.</th>
                    <th style={{ padding: '8px' }}>Unidad</th>
                    <th style={{ padding: '8px' }}>Descripción</th>
                    <th style={{ padding: '8px' }}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {materiales.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', width: '80px' }}>
                        <input type="number" value={item.cantidad} onChange={(e) => changeMaterialCant(idx, e.target.value)} style={{ width: '60px', padding: '5px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '8px', color: '#666' }}>{item.unidad}</td>
                        <td style={{ padding: '8px' }}>{item.nombre}</td>
                        <td style={{ padding: '8px' }}><button onClick={() => eliminarMaterial(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>&times;</button></td>
                    </tr>
                    ))}
                </tbody>
                </table>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', background: '#f1f1f1', padding: '10px', borderRadius: '5px' }}>
                <select value={itemSeleccionado} onChange={e => setItemSeleccionado(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                    <option value="">-- Agregar Material --</option>
                    {catalogo.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
                <button onClick={agregarMaterial} style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                </div>
            </div>

            {/* MANO DE OBRA */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0, color: '#0056b3' }}>👷 Mano de Obra</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Horas</th>
                    <th style={{ padding: '8px' }}>Descripción</th>
                    <th style={{ padding: '8px' }}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {manoObra.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', width: '80px' }}>
                        <input type="number" value={item.horas} onChange={(e) => changeMOHoras(idx, e.target.value)} style={{ width: '60px', padding: '5px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                        <input type="text" value={item.descripcion} onChange={(e) => changeMODesc(idx, e.target.value)} style={{ width: '100%', padding: '5px' }} />
                        </td>
                        <td style={{ padding: '8px' }}><button onClick={() => eliminarMO(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>&times;</button></td>
                    </tr>
                    ))}
                </tbody>
                </table>
                <button onClick={agregarMO} style={{ marginTop: '10px', padding: '8px 15px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Tarea</button>
            </div>
        </div>

        {/* COLUMNA DERECHA: RAYOS X FINANCIEROS */}
        <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ background: '#212529', color: 'white', padding: '20px', borderRadius: '8px', position: 'sticky', top: '20px' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>🩻 Rayos X (Tripas)</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.9em', color: '#ccc' }}>Costo Directo Materiales</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{formatMoney(finanzas.matCD)}</div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.9em', color: '#ccc' }}>Costo Directo Mano Obra</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{formatMoney(finanzas.moCD)}</div>
                </div>

                <div style={{ marginBottom: '15px', borderTop: '1px solid #444', paddingTop: '10px' }}>
                    <div style={{ fontSize: '0.9em', color: '#ffc107' }}>COSTO DIRECTO TOTAL</div>
                    <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#ffc107' }}>{formatMoney(finanzas.costoDirectoTotal)}</div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.9em', color: '#ccc' }}>Precio de Venta (Subtotal)</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{formatMoney(finanzas.precioVenta)}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px' }}>
                    <div style={{ fontSize: '0.9em', color: '#00d4ff' }}>Utilidad Bruta Estimada</div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#00d4ff' }}>{formatMoney(finanzas.utilidadBruta)}</div>
                    <div style={{ fontSize: '0.8em', color: '#ccc' }}>Margen: {finanzas.margen.toFixed(1)}%</div>
                </div>

                <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#888', fontStyle: 'italic' }}>
                    * Estos valores incluyen tus porcentajes de indirectos, herramienta y supervisión configurados en sistema.
                </div>
            </div>
        </div>

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '15px', textAlign: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', borderTop: '1px solid #ddd', zIndex: 100 }}>
        <button onClick={handleGuardar} disabled={guardando} style={{ padding: '12px 40px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', cursor: guardando ? 'wait' : 'pointer', opacity: guardando ? 0.7 : 1 }}>
          {guardando ? 'Recalculando...' : '💾 Guardar y Recalcular Costos'}
        </button>
      </div>
    </div>
  );
};

export default EditarCotizacion;