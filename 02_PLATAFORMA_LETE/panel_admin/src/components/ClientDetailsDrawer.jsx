import React from 'react';
import './ClientDetailsDrawer.css';

const ClientDetailsDrawer = ({ cliente, onClose }) => {
    if (!cliente) return null;

    // Helper para formatear fecha bonita
    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onClose}></div>
            <div className="drawer-panel">
                
                {/* HEADER */}
                <div className="drawer-header">
                    <div>
                        <h2>{cliente.nombre}</h2>
                        <span style={{ fontSize: '0.9em', color: '#64748b' }}>
                            {cliente.telefono}
                        </span>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* CONTENT */}
                <div className="drawer-content">

                    {/* 1. ACCIONES RÁPIDAS */}
                    <div className="action-grid">
                        <a 
                            href={`https://wa.me/${cliente.telefono?.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn-action btn-whatsapp"
                        >
                            💬 Abrir WhatsApp
                        </a>
                        <button className="btn-action">
                            📂 Ver Historial Casos
                        </button>
                    </div>

                    {/* 2. CEREBRO IA (Lo más importante) */}
                    <div className="detail-section">
                        <div className="section-title">🧠 Diagnóstico IA (Última Interacción)</div>
                        {cliente.ai_summary ? (
                            <div className="ai-summary-box">
                                {cliente.ai_summary}
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin análisis reciente.</p>
                        )}
                        <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#64748b' }}>
                            Último mensaje: {formatDate(cliente.last_interaction)}
                        </div>
                    </div>

                    {/* 3. PRÓXIMA ACCIÓN AUTOMÁTICA */}
                    <div className="detail-section">
                        <div className="section-title">🤖 Estado del Autómata (Cron)</div>
                        {cliente.next_action?.tipo !== 'NADA' ? (
                            <div>
                                <div style={{ 
                                    padding: '8px', 
                                    borderRadius: '4px', 
                                    background: cliente.next_action?.color === 'red' ? '#fef2f2' : '#f0fdf4',
                                    color: cliente.next_action?.color === 'red' ? '#b91c1c' : '#15803d',
                                    fontWeight: 'bold',
                                    marginBottom: '5px'
                                }}>
                                    {cliente.next_action?.mensaje}
                                </div>
                                <small>Fecha programada: {formatDate(cliente.next_action?.fecha)}</small>
                            </div>
                        ) : (
                            <p>El bot está en reposo con este cliente.</p>
                        )}
                    </div>

                    {/* 4. INTEGRIDAD Y TÉCNICO */}
                    <div className="detail-section">
                        <div className="section-title">📋 Datos Operativos</div>
                        <table style={{ width: '100%', fontSize: '0.9rem' }}>
                            <tbody>
                                <tr>
                                    <td style={{ color: '#64748b', padding: '5px 0' }}>Integridad:</td>
                                    <td><strong>{cliente.status_integridad}</strong></td>
                                </tr>
                                <tr>
                                    <td style={{ color: '#64748b', padding: '5px 0' }}>Técnico Asignado:</td>
                                    <td>{cliente.tecnico}</td>
                                </tr>
                                <tr>
                                    <td style={{ color: '#64748b', padding: '5px 0' }}>Saldo Pendiente:</td>
                                    <td style={{ color: cliente.saldo_pendiente > 0 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                                        ${cliente.saldo_pendiente}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ClientDetailsDrawer;