import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  obtenerTecnicos,
  checkAvailability,
  createCasoFromCotizacion,
  agendarCotizacion // <--- 1. IMPORTAMOS LA NUEVA FUNCIÓN
} from '../apiService';

const AutorizarCotizacionModal = ({ cotizacion, onClose, onConfirm }) => {
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoId, setTecnicoId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false); // <--- 2. ESTADO VISUAL DE CARGA

  useEffect(() => {
    const cargarTecnicos = async () => {
      try {
        const res = await obtenerTecnicos();
        setTecnicos(res);
      } catch (error) {
        setError('Error al cargar los técnicos.');
      }
    };
    cargarTecnicos();
  }, []);

  const handleConfirm = async () => {
    if (!tecnicoId || !fechaInicio || !fechaFin) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    setError('');
    setProcesando(true); // Bloqueamos botón para evitar doble clic

    try {
      // 1. Verificar disponibilidad en calendario
      const availability = await checkAvailability(tecnicoId, fechaInicio, fechaFin);
      if (availability.hasConflict) {
        setError('El técnico ya tiene un evento en ese horario.');
        setProcesando(false);
        return;
      }

      // 2. CAMBIO CRÍTICO: Usamos la nueva función para cambiar estatus a 'AGENDADA'
      // Esto confirma financieramente el proyecto.
      const resAgendar = await agendarCotizacion(cotizacion.id);
      
      if(resAgendar.status !== 'success') {
          throw new Error(resAgendar.error || "Error al cambiar estatus de cotización");
      }

      // 3. Crear el evento en el calendario (Backend Node)
      await createCasoFromCotizacion({
        cotizacionId: cotizacion.id,
        tecnico_id: tecnicoId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        cliente_nombre: cotizacion.cliente_nombre,
        // CORRECCIÓN: Usamos 'direccion_obra' que viene de PHP, o un texto default
        cliente_direccion: cotizacion.direccion_obra || cotizacion.cliente_direccion || 'Dirección no especificada', 
      });

      // Todo salió bien
      onConfirm(); // Esto recargará la lista en CotizacionesList
    } catch (error) {
      console.error(error);
      setError('Error al procesar: ' + error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h2>📅 Agendar Proyecto #{cotizacion.id}</h2>
      <p style={{fontSize:'0.9em', color:'#666'}}>
        Al confirmar, la cotización pasará a estado <b>AGENDADA</b> y se creará el caso para el técnico.
      </p>
      
      {error && <div style={{ background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'4px', marginBottom:'10px' }}>{error}</div>}
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{display:'block', fontWeight:'bold'}}>Asignar a Técnico</label>
        <select 
            value={tecnicoId} 
            onChange={(e) => setTecnicoId(e.target.value)}
            style={{width:'100%', padding:'8px', marginTop:'5px'}}
        >
          <option value="">Seleccionar técnico...</option>
          {tecnicos.map((tecnico) => (
            <option key={tecnico.id} value={tecnico.id}>
              {tecnico.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display:'flex', gap:'10px', marginBottom:'15px' }}>
        <div style={{flex:1}}>
            <label style={{display:'block', fontSize:'0.9em'}}>Inicio de Proyecto</label>
            <input
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{width:'100%', padding:'8px', marginTop:'5px'}}
            />
        </div>
        <div style={{flex:1}}>
            <label style={{display:'block', fontSize:'0.9em'}}>Fin de Proyecto</label>
            <input
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{width:'100%', padding:'8px', marginTop:'5px'}}
            />
        </div>
      </div>

      <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'20px'}}>
          <button onClick={onClose} style={{padding:'8px 16px', background:'#6c757d', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>Cancelar</button>
          <button 
            onClick={handleConfirm} 
            disabled={procesando}
            style={{
                padding:'8px 16px', 
                background: procesando ? '#ccc' : '#28a745', 
                color:'white', 
                border:'none', 
                borderRadius:'4px', 
                cursor: procesando ? 'not-allowed' : 'pointer',
                fontWeight:'bold'
            }}
          >
            {procesando ? 'Procesando...' : 'Confirmar y Agendar'}
          </button>
      </div>
    </Modal>
  );
};

export default AutorizarCotizacionModal;