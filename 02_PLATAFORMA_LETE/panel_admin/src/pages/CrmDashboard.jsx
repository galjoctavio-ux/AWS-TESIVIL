import React, { useEffect, useState } from 'react';
import { getCrmDashboard, forceAnalyze } from '../apiService';
import { Link } from 'react-router-dom';
import './CrmDashboard.css'; // Crearemos este CSS después

const CrmDashboard = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('TODOS'); // TODOS, ATENCION, CITA, SEGUIMIENTO

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await getCrmDashboard();
            setClientes(data);
        } catch (error) {
            console.error("Error cargando CRM:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleAnalizar = async (id) => {
        if (!confirm("¿Forzar análisis de IA para este cliente?")) return;
        await forceAnalyze(id);
        alert("Solicitud enviada. Recarga en unos segundos.");
    };

    // Filtrado visual
    const clientesFiltrados = clientes.filter(c => {
        if (filtro === 'TODOS') return true;
        return c.prioridad_visual === filtro;
    });

    const getBadgeColor = (prioridad) => {
        switch (prioridad) {
            case 'CITA': return 'badge-cita';
            case 'ATENCION': return 'badge-atencion';
            case 'SEGUIMIENTO': return 'badge-seguimiento';
            case 'GHOST': return 'badge-ghost';
            default: return 'badge-normal';
        }
    };

    return (
        <div className="crm-container">
            <header className="crm-header">
                <h1>🧠 Cerebro CRM (IA + Ventas)</h1>
                <div className="crm-controls">
                    <button onClick={() => setFiltro('TODOS')} className={filtro === 'TODOS' ? 'active' : ''}>Todos</button>
                    <button onClick={() => setFiltro('CITA')} className={filtro === 'CITA' ? 'active' : ''}>📅 Citas ({clientes.filter(c => c.prioridad_visual === 'CITA').length})</button>
                    <button onClick={() => setFiltro('ATENCION')} className={filtro === 'ATENCION' ? 'active' : ''}>🔥 Atención ({clientes.filter(c => c.prioridad_visual === 'ATENCION').length})</button>
                    <button onClick={() => setFiltro('SEGUIMIENTO')} className={filtro === 'SEGUIMIENTO' ? 'active' : ''}>👀 Seguimiento</button>
                    <button onClick={cargarDatos} className="refresh-btn">🔄</button>
                </div>
            </header>

            {loading ? <p>Cargando inteligencia...</p> : (
                <div className="crm-table-wrapper">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>Cliente / WhatsApp</th>
                                <th>Estado IA</th>
                                <th>Último Mensaje</th>
                                <th>Próxima Acción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesFiltrados.map(cliente => (
                                <tr key={cliente.cliente_id} className={`row-${cliente.prioridad_visual.toLowerCase()}`}>
                                    <td>
                                        <div className="client-info">
                                            <strong>{cliente.nombre_completo || 'Desconocido'}</strong>
                                            <span className="phone">{cliente.telefono}</span>
                                            {cliente.saldo_pendiente > 0 && <span className="debt-badge">Debe: ${cliente.saldo_pendiente}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getBadgeColor(cliente.prioridad_visual)}`}>
                                            {cliente.crm_intent}
                                        </span>
                                        <small style={{ display: 'block', fontSize: '0.75rem', marginTop: '4px', color: '#666' }}>
                                            {cliente.razon_ia || 'Sin análisis reciente'}
                                        </small>
                                    </td>
                                    <td className="msg-cell">
                                        <div className={`msg-bubble ${cliente.ultimo_mensaje_rol}`}>
                                            {cliente.ultimo_mensaje_texto || '(Sin mensajes)'}
                                        </div>
                                        <div className="time">
                                            {new Date(cliente.last_interaction).toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        {cliente.next_follow_up_date ? (
                                            <div className="follow-up">
                                                📅 {new Date(cliente.next_follow_up_date).toLocaleDateString()}
                                                <br />
                                                ⏰ {new Date(cliente.next_follow_up_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#aaa' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <button className="action-btn" onClick={() => handleAnalizar(cliente.cliente_id)}>⚡ Analizar</button>
                                        {/* Aquí podrías agregar botón para ir al chat completo o crear caso */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CrmDashboard;