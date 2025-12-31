import React from 'react';

const DetalleCotizacionModal = ({ cotizacion, onClose, onAutorizar, onRechazar }) => {
  if (!cotizacion) return null;

  const precioTecnico = parseFloat(cotizacion.precio_venta_final);
  const precioIA = parseFloat(cotizacion.estimacion_ia || 0);
  
  // Calculamos la desviación solo si la IA dio un precio
  let diferenciaPct = 0;
  let colorDiferencia = '#666';
  
  if (precioIA > 0) {
    diferenciaPct = ((precioTecnico - precioIA) / precioIA) * 100;
    // Si cobra menos del 15% de lo que dice la IA -> ROJO (Pérdida)
    // Si cobra más -> VERDE (Ganancia)
    colorDiferencia = diferenciaPct < -15 ? '#dc3545' : '#28a745';
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', width: '90%', maxWidth: '700px', borderRadius: '8px', padding: '0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        
        {/* Encabezado */}
        <div style={{ background: '#ffc107', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#333' }}>⚠️ Revisión Requerida: Cotización #{cotizacion.id}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ padding: '20px' }}>
          
          {/* Razón de la Detención */}
          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '5px', marginBottom: '20px', borderLeft: '5px solid #ffc107' }}>
            <strong style={{ display: 'block', marginBottom: '5px', color: '#856404' }}>🛑 Motivo de la Alerta:</strong>
            {cotizacion.razon_detencion || "Revisión manual solicitada"}
          </div>

          {/* VS: Técnico vs IA */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            
            {/* Lado Técnico */}
            <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>👷 Técnico (Real)</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {formatCurrency(precioTecnico)}
              </div>
              <small style={{ color: '#999' }}>Precio final al cliente</small>
            </div>

            {/* VS Icono */}
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#ccc', fontSize: '20px' }}>VS</div>

            {/* Lado IA */}
            <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', background: '#f8f9fa' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>🤖 IA (Estimado)</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#666' }}>
                {precioIA > 0 ? formatCurrency(precioIA) : 'No disponible'}
              </div>
              {precioIA > 0 && (
                <div style={{ marginTop: '5px', fontWeight: 'bold', color: colorDiferencia }}>
                  {diferenciaPct > 0 ? '+' : ''}{diferenciaPct.toFixed(1)}% vs Mercado
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <button 
              onClick={() => onRechazar(cotizacion.id)}
              style={{ flex: 1, padding: '12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ❌ Rechazar (Cancelar)
            </button>
            <button 
              onClick={() => onAutorizar(cotizacion.id)}
              style={{ flex: 2, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✅ Aprobar y Enviar Cliente
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetalleCotizacionModal;