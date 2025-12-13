import React, { useEffect, useState } from 'react';
import { getCrmDashboard, forceAnalyze } from '../apiService';
import ChatModal from '../components/ChatModal';
import './CrmDashboard.css';

const CrmDashboard = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    // Agregamos los nuevos estados de filtro
    const [filtro, setFiltro] = useState('TODOS'); // TODOS, ALERTA, ADMIN, CITA, ATENCION, SEGUIMIENTO

    const [selectedClientForChat, setSelectedClientForChat] = useState(null);

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
        alert("Solicitud enviada. La IA procesará el chat en breve.");
        setTimeout(cargarDatos, 2000);
    };

    // --- LÓGICA DE FILTRADO ACTUALIZADA ---
    const clientesFiltrados = clientes.filter(c => {
        if (filtro === 'TODOS') return true;

        // Filtros específicos de Auditoría (usan crm_intent directo)
        if (filtro === 'ALERTA') return c.crm_intent === 'OPERATIONAL_ALERT';
        if (filtro === 'ADMIN') return c.crm_intent === 'ADMIN_TASK';

        // Filtros de Ventas (usan prioridad_visual o mapeo existente)
        return c.prioridad_visual === filtro;
    });

    // --- COLORES DE BADGES ACTUALIZADOS ---
    const getBadgeInfo = (intent, prioridadVisual) => {
        switch (intent) {
            case 'OPERATIONAL_ALERT':
                return { class: 'badge-alert', label: '🚨 ALERTA' };
            case 'ADMIN_TASK':
                return { class: 'badge-admin', label: '📄 TRAMITE' };
            default:
                // Fallback a la lógica de ventas original
                switch (prioridadVisual) {
                    case 'CITA': return { class: 'badge-cita', label: intent };
                    case 'ATENCION': return { class: 'badge-atencion', label: intent };
                    case 'SEGUIMIENTO': return { class: 'badge-seguimiento', label: intent };
                    case 'GHOST': return { class: 'badge-ghost', label: 'GHOST' };
                    default: return { class: 'badge-normal', label: intent || 'NONE' };
                }
        }
    };

    // Contadores para los botones
    const countAlerts = clientes.filter(c => c.crm_intent === 'OPERATIONAL_ALERT').length;
    const countAdmin = clientes.filter(c => c.crm_intent === 'ADMIN_TASK').length;

    return (
        <div className="crm-container">
            {/* HEADER Y FILTROS */}
            <header className="crm-header">
                <div>
                    <h1>🧠 Cerebro CRM</h1>
                    <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>Auditoría & Ventas</p>
                </div>

                <div className="crm-controls">
                    {/* BOTONES DE AUDITORÍA (PRIORIDAD ALTA) */}
                    {countAlerts > 0 && (
                        <button
                            onClick={() => setFiltro('ALERTA')}
                            className={`btn-alert ${filtro === 'ALERTA' ? 'active' : ''}`}
                        >
                            🚨 ALERTAS ({countAlerts})
                        </button>
                    )}

                    <button
                        onClick={() => setFiltro('ADMIN')}
                        className={filtro === 'ADMIN' ? 'active' : ''}
                    >
                        📄 Admin ({countAdmin})
                    </button>

                    <div className="divider-vertical"></div>

                    {/* BOTONES DE VENTAS */}
                    <button onClick={() => setFiltro('TODOS')} className={filtro === 'TODOS' ? 'active' : ''}>
                        Todos
                    </button>
                    <button onClick={() => setFiltro('CITA')} className={filtro === 'CITA' ? 'active' : ''}>
                        📅 Citas
                    </button>
                    <button onClick={() => setFiltro('ATENCION')} className={filtro === 'ATENCION' ? 'active' : ''}>
                        🔥 Atención
                    </button>

                    <button onClick={cargarDatos} className="refresh-btn" title="Recargar">🔄</button>
                </div>
            </header>

            {/* TABLA DE DATOS */}
            {loading ? <p>Analizando operaciones...</p> : (
                <div className="crm-table-wrapper">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Estado Auditoría</th>
                                <th>Análisis IA</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesFiltrados.map(cliente => {
                                const badge = getBadgeInfo(cliente.crm_intent, cliente.prioridad_visual);

                                return (
                                    <tr key={cliente.cliente_id} className={cliente.crm_intent === 'OPERATIONAL_ALERT' ? 'row-alert' : ''}>

                                        {/* Info Cliente */}
                                        <td>
                                            <div className="client-info">
                                                <strong>{cliente.nombre_completo || 'Desconocido'}</strong>
                                                <span className="phone">{cliente.telefono}</span>
                                            </div>
                                        </td>

                                        {/* Estado (Badge) */}
                                        <td>
                                            <span className={`badge ${badge.class}`}>
                                                {badge.label}
                                            </span>
                                            <div className="last-date">
                                                {cliente.last_interaction
                                                    ? new Date(cliente.last_interaction).toLocaleDateString()
                                                    : '-'}
                                            </div>
                                        </td>

                                        {/* Razón IA (Aquí es donde brilla el resumen) */}
                                        <td style={{ maxWidth: '350px' }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>
                                                {cliente.ai_summary || cliente.razon_ia || 'Sin análisis'}
                                            </p>
                                            {cliente.next_follow_up_date && (
                                                <small style={{ color: '#2196F3', fontWeight: 'bold' }}>
                                                    📅 Programado: {new Date(cliente.next_follow_up_date).toLocaleDateString()}
                                                </small>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button
                                                    className="action-btn chat-btn"
                                                    onClick={() => setSelectedClientForChat(cliente)}
                                                >
                                                    💬 Ver Chat
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleAnalizar(cliente.cliente_id)}
                                                >
                                                    ⚡
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedClientForChat && (
                <ChatModal
                    cliente={selectedClientForChat}
                    onClose={() => setSelectedClientForChat(null)}
                />
            )}
        </div>
    );
};

export default CrmDashboard;