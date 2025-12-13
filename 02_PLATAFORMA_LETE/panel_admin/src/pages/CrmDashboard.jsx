import React, { useEffect, useState } from 'react';
import { getCrmDashboard, forceAnalyze } from '../apiService';
import ChatModal from '../components/ChatModal'; // <--- Importamos el Modal
import './CrmDashboard.css';

const CrmDashboard = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('TODOS'); // TODOS, ATENCION, CITA, SEGUIMIENTO

    // Nuevo estado para controlar qué cliente se muestra en el modal
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
        // Opcional: Recargar datos automáticamente tras unos segundos
        setTimeout(cargarDatos, 2000);
    };

    // Lógica de Filtrado Visual
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
            {/* HEADER Y FILTROS */}
            <header className="crm-header">
                <h1>🧠 Cerebro CRM (IA + Ventas)</h1>
                <div className="crm-controls">
                    <button onClick={() => setFiltro('TODOS')} className={filtro === 'TODOS' ? 'active' : ''}>
                        Todos
                    </button>
                    <button onClick={() => setFiltro('CITA')} className={filtro === 'CITA' ? 'active' : ''}>
                        📅 Citas ({clientes.filter(c => c.prioridad_visual === 'CITA').length})
                    </button>
                    <button onClick={() => setFiltro('ATENCION')} className={filtro === 'ATENCION' ? 'active' : ''}>
                        🔥 Atención ({clientes.filter(c => c.prioridad_visual === 'ATENCION').length})
                    </button>
                    <button onClick={() => setFiltro('SEGUIMIENTO')} className={filtro === 'SEGUIMIENTO' ? 'active' : ''}>
                        👀 Seguimiento
                    </button>
                    <button onClick={cargarDatos} className="refresh-btn" title="Recargar datos">🔄</button>
                </div>
            </header>

            {/* TABLA DE DATOS */}
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

                                    {/* Columna 1: Info Cliente */}
                                    <td>
                                        <div className="client-info">
                                            <strong>{cliente.nombre_completo || 'Desconocido'}</strong>
                                            <span className="phone">{cliente.telefono}</span>
                                            {cliente.saldo_pendiente > 0 && (
                                                <span className="debt-badge">Debe: ${cliente.saldo_pendiente}</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Columna 2: Estado IA */}
                                    <td>
                                        <span className={`badge ${getBadgeColor(cliente.prioridad_visual)}`}>
                                            {cliente.crm_intent}
                                        </span>
                                        <small style={{ display: 'block', fontSize: '0.75rem', marginTop: '4px', color: '#666', maxWidth: '300px', lineHeight: '1.2' }}>
                                            {cliente.razon_ia || 'Sin análisis reciente'}
                                        </small>
                                    </td>

                                    {/* Columna 3: Último Mensaje */}
                                    <td className="msg-cell">
                                        <div className={`msg-bubble ${cliente.ultimo_mensaje_rol === 'assistant' ? 'assistant' : 'user'}`}>
                                            {cliente.ultimo_mensaje_texto || '(Sin mensajes)'}
                                        </div>
                                        <div className="time">
                                            {cliente.last_interaction
                                                ? new Date(cliente.last_interaction).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })
                                                : ''}
                                        </div>
                                    </td>

                                    {/* Columna 4: Próxima Acción */}
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

                                    {/* Columna 5: Acciones (Botones) */}
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button
                                                className="action-btn"
                                                onClick={() => handleAnalizar(cliente.cliente_id)}
                                                title="Forzar análisis de IA"
                                            >
                                                ⚡ IA
                                            </button>

                                            <button
                                                className="action-btn"
                                                style={{ background: '#25D366' }} // Color WhatsApp
                                                onClick={() => setSelectedClientForChat(cliente)}
                                                title="Ver historial de chat"
                                            >
                                                💬 Chat
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DE CHAT (Solo se muestra si hay un cliente seleccionado) */}
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