import React, { useState } from 'react';

const CierreProyectoModal = ({ cotizacion, onClose, onFinalizar }) => {
  const [gastoMaterial, setGastoMaterial] = useState('');
  const [gastoMo, setGastoMo] = useState('');

  const handleSubmit = () => {
    if (!gastoMaterial || !gastoMo) return alert("Ingresa los gastos reales (pueden ser 0).");
    onFinalizar(cotizacion.id, parseFloat(gastoMaterial), parseFloat(gastoMo));
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>🏁 Cierre Financiero: Cotización #{cotizacion.id}</h3>
        <p style={{ fontSize: '0.9em', color: '#666' }}>Ingresa los costos reales finales para calcular tu utilidad neta.</p>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Gasto Real en Materiales ($)</label>
          <input 
            type="number" 
            value={gastoMaterial} 
            onChange={e => setGastoMaterial(e.target.value)} 
            placeholder="Ej. 1500.50" 
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Gasto Real en Mano de Obra/Nómina ($)</label>
          <input 
            type="number" 
            value={gastoMo} 
            onChange={e => setGastoMo(e.target.value)} 
            placeholder="Ej. 800.00" 
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSubmit} style={{ flex: 1, padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar y Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CierreProyectoModal;