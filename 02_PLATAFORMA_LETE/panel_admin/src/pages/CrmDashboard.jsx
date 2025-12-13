import React, { useEffect, useState, useMemo } from 'react';
import { getCrmDashboard, forceAnalyze } from '../apiService';
import ChatModal from '../components/ChatModal';
import './CrmDashboard.css';

const CrmDashboard = () => {
    // --- ESTADOS DE DATOS ---
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE INTERFAZ ---
    const [filtro, setFiltro] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');
    const [orden, setOrden] = useState({ key: 'last_interaction', direction: 'desc' });
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 20;

    const [selectedClientForChat, setSelectedClientForChat] = useState(null);

    // --- CARGA DE DATOS ---
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await getCrmDashboard();
            setClientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando CRM:", error);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Resetear paginación al filtrar
    useEffect(() => { setPaginaActual(1); }, [filtro, busqueda]);

    // --- ACCIONES ---
    const handleAnalizar = async (id) => {
        if (!window.confirm("¿Forzar análisis de IA para este cliente? Esto pondrá al cliente en cola de procesamiento.")) return;
        try {
            await forceAnalyze(id);
            alert("Solicitud enviada. Recargando datos en 3s...");
            setTimeout(cargarDatos, 3000);
        } catch (error) {
            alert("Error al solicitar análisis.");
        }
    };

    const handleSort = (key) => {
        setOrden(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    // --- CALCULOS DE CONTADORES (RESTAURADO) ---
    const counts = useMemo(() => {
        return {
            alertas: clientes.filter(c => c.crm_intent === 'OPERATIONAL_ALERT' || c.alerta_cita_desincronizada || c.debe_cotizacion).length,
            admin: clientes.filter(c => c.crm_intent === 'ADMIN_TASK').length,
            sinEa: clientes.filter(c => !c.sync_mariadb).length
        };
    }, [clientes]);

    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
    const datosProcesados = useMemo(() => {
        let data = [...clientes];

        // 1. Filtro por Pestañas
        if (filtro === 'ALERTA') {
            data = data.filter(c => c.crm_intent === 'OPERATIONAL_ALERT' || c.alerta_cita_desincronizada || c.debe_cotizacion);
        } else if (filtro === 'ADMIN') {
            data = data.filter(c => c.crm_intent === 'ADMIN_TASK');
        } else if (filtro === 'SIN_EA') {
            data = data.filter(c => !c.sync_mariadb); // Nueva pestaña solicitada
        } else if (filtro !== 'TODOS') {
            data = data.filter(c => c.prioridad_visual === filtro || c.crm_intent === filtro);
        }

        // 2. Búsqueda
        if (busqueda) {
            const lowerTerm = busqueda.toLowerCase();
            data = data.filter(c =>
                (c.nombre_completo || '').toLowerCase().includes(lowerTerm) ||
                (c.telefono || '').includes(lowerTerm) ||
                (c.email || '').toLowerCase().includes(lowerTerm) ||
                (c.ai_summary || '').toLowerCase().includes(lowerTerm)
            );
        }

        // 3. Ordenamiento
        data.sort((a, b) => {
            let valA = a[orden.key];
            let valB = b[orden.key];

            // Manejo de fechas
            if (['last_interaction', 'next_follow_up_date'].includes(orden.key)) {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            }
            // Manejo strings nulos
            else {
                valA = valA ? String(valA).toLowerCase() : '';
                valB = valB ? String(valB).toLowerCase() : '';
            }

            if (valA < valB) return orden.direction === 'asc' ? -1 : 1;
            if (valA > valB) return orden.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [clientes, filtro, busqueda, orden]);

    // Paginación
    const totalPaginas = Math.ceil(datosProcesados.length / itemsPorPagina);
    const datosPaginados = datosProcesados.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);

    // --- HELPERS VISUALES (RESTAURADOS Y MEJORADOS) ---

    // Semáforo de Calificación
    const getScoreColor = (calif) => {
        switch (calif) {
            case 'AMABLE': return 'var(--color-success)';
            case 'NEUTRO': return 'var(--color-warning)';
            case 'HOSTIL': return 'var(--color-danger)';
            case 'SOSPECHOSO': return 'var(--color-danger)';
            default: return 'var(--color-gray)';
        }
    };

    // Texto seguro
    const safeText = (text, limit = 80) => {
        if (!text) return '';
        const str = String(text);
        return str.length > limit ? str.substring(0, limit) + '...' : str;
    };

    // Badge Principal (Restaurado getBadgeInfo con lógica nueva)
    const getBadgeInfo = (cliente) => {
        // Prioridad 1: Alertas Críticas
        if (cliente.alerta_cita_desincronizada) return { class: 'badge-alert', label: '⚠️ CITA NO AGENDADA' };
        if (cliente.debe_cotizacion) return { class: 'badge-alert', label: '💰 COTIZAR' };
        if (cliente.crm_intent === 'OPERATIONAL_ALERT') return { class: 'badge-alert', label: '🚨 ALERTA' };

        // Prioridad 2: Trámites Admin
        if (cliente.crm_intent === 'ADMIN_TASK') return { class: 'badge-admin', label: '📄 TRAMITE' };

        // Prioridad 3: Estados Visuales Normales
        const status = cliente.prioridad_visual || cliente.crm_intent || 'NONE';
        switch (status) {
            case 'CITA': return { class: 'badge-cita', label: '📅 CITA' };
            case 'ATENCION': return { class: 'badge-alert', label: '🔥 ATENCION' };
            default: return { class: 'badge-normal', label: status };
        }
    };

    return (
        <div className="crm-container">
            {/* HEADER */}
            <header className="crm-header">
                <div>
                    <h1>🧠 CRM: Fuente de la Verdad</h1>
                    <div className="crm-stats">
                        {clientes.length} Clientes Total | {counts.alertas} Alertas | {counts.sinEa} Sin Agenda
                    </div>
                </div>

                <div className="crm-controls-group">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Buscar nombre, tel, notas..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button onClick={cargarDatos} className="refresh-btn" title="Recargar">🔄</button>
                </div>
            </header>

            {/* BARRA DE FILTROS */}
            <div className="crm-tabs">
                <button onClick={() => setFiltro('ALERTA')} className={`tab-btn alert ${filtro === 'ALERTA' ? 'active' : ''}`}>
                    🚨 ALERTAS ({counts.alertas})
                </button>
                <button onClick={() => setFiltro('SIN_EA')} className={`tab-btn ${filtro === 'SIN_EA' ? 'active' : ''}`}>
                    📅 Sin Agenda ({counts.sinEa})
                </button>
                <button onClick={() => setFiltro('ADMIN')} className={`tab-btn admin ${filtro === 'ADMIN' ? 'active' : ''}`}>
                    📄 Tramites ({counts.admin})
                </button>
                <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }}></div>
                <button onClick={() => setFiltro('TODOS')} className={`tab-btn ${filtro === 'TODOS' ? 'active' : ''}`}>Todos</button>
                <button onClick={() => setFiltro('CITA')} className={`tab-btn ${filtro === 'CITA' ? 'active' : ''}`}>Citas</button>
                <button onClick={() => setFiltro('LEAD')} className={`tab-btn ${filtro === 'LEAD' ? 'active' : ''}`}>Leads</button>
            </div>

            {/* TABLA PRINCIPAL */}
            {loading ? <div className="loading-state">Analizando ecosistema de datos...</div> : (
                <div className="crm-table-wrapper">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('nombre_completo')}>Cliente ↕</th>
                                <th>Estado & Sync</th>
                                <th onClick={() => handleSort('last_interaction')}>Interacción ↕</th>
                                <th>Análisis IA & Notas</th>
                                <th onClick={() => handleSort('saldo_pendiente')}>Finanzas & Acción ↕</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosPaginados.map(cliente => {
                                const badge = getBadgeInfo(cliente);
                                const scoreColor = getScoreColor(cliente.calificacion_semaforo || cliente.calificacion);

                                return (
                                    <tr key={cliente.id || cliente.cliente_id} className={badge.class === 'badge-alert' ? 'row-alert' : ''}>

                                        {/* COL 1: CLIENTE (Enriquecido) */}
                                        <td>
                                            <div className="client-info">
                                                <div className="client-name">
                                                    <span className="score-indicator" style={{ backgroundColor: scoreColor }} title={`Calificación: ${cliente.calificacion_semaforo}`}></span>
                                                    {cliente.nombre_completo || 'Desconocido'}
                                                </div>
                                                <div className="client-meta">
                                                    <span>📞 {cliente.telefono}</span>
                                                    {cliente.email && <span className="client-email">✉️ {cliente.email}</span>}
                                                    {cliente.direccion_principal && (
                                                        <span className="client-address">
                                                            📍 {safeText(cliente.direccion_principal, 30)}
                                                            {cliente.google_maps_link && (
                                                                <a href={cliente.google_maps_link} target="_blank" rel="noopener noreferrer"> (Mapa)</a>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* COL 2: ESTADO & SYNC (Fuente de la Verdad) */}
                                        <td>
                                            <span className={`badge ${badge.class}`}>{badge.label}</span>

                                            <div className="sync-status-container">
                                                <span style={{ color: cliente.sync_mariadb ? 'var(--color-success)' : 'var(--color-danger)' }} title="Base de Datos Agenda (EA)">
                                                    ● EA
                                                </span>
                                                <span style={{ color: cliente.sync_evolution ? 'var(--color-success)' : 'var(--color-gray)' }} title="WhatsApp / Evolution">
                                                    ● WA
                                                </span>
                                                {cliente.cita_realizada && (
                                                    <span style={{ color: 'var(--color-info)' }} title="Tiene citas pasadas en EA">
                                                        ● Historic
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* COL 3: INTERACCIÓN (Restaurada) */}
                                        <td className="msg-cell">
                                            <div className={`msg-bubble ${cliente.ultimo_mensaje_rol === 'assistant' ? 'assistant' : 'user'}`}>
                                                {safeText(cliente.ultimo_mensaje_texto || '(Sin mensajes)', 60)}
                                            </div>
                                            <div className="msg-meta">
                                                <span>
                                                    {cliente.last_interaction
                                                        ? new Date(cliente.last_interaction).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : '-'}
                                                </span>
                                                {cliente.unread_count > 0 && (
                                                    <span className="unread-badge">{cliente.unread_count} new</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* COL 4: IA & NOTAS (Combinadas) */}
                                        <td className="ai-cell">
                                            <div className="ai-summary" title={cliente.ai_summary}>
                                                {safeText(cliente.ai_summary, 90)}
                                            </div>
                                            {cliente.notas_internas && (
                                                <div className="internal-note" title="Nota Interna">
                                                    📝 {safeText(cliente.notas_internas, 50)}
                                                </div>
                                            )}
                                        </td>

                                        {/* COL 5: FINANZAS & ACCIÓN (Restaurada Next Follow Up) */}
                                        <td className="finance-cell">
                                            {cliente.saldo_pendiente > 0 ? (
                                                <div className="debt-text">Debe: ${Number(cliente.saldo_pendiente).toFixed(2)}</div>
                                            ) : (
                                                <span style={{ color: 'var(--color-success)', fontSize: '0.8rem' }}>Al corriente</span>
                                            )}

                                            {cliente.next_follow_up_date && (
                                                <div className="next-action">
                                                    ⏰ {new Date(cliente.next_follow_up_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>

                                        {/* COL 6: BOTONES ACCIÓN */}
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-chat"
                                                    onClick={() => setSelectedClientForChat(cliente)}
                                                    title="Abrir Chat"
                                                >
                                                    💬
                                                </button>
                                                <button
                                                    className="btn-icon btn-ai"
                                                    onClick={() => handleAnalizar(cliente.id || cliente.cliente_id)}
                                                    title="Forzar Análisis IA"
                                                >
                                                    ⚡
                                                </button>
                                                {!cliente.sync_mariadb && (
                                                    <button
                                                        className="btn-icon btn-ea"
                                                        onClick={() => alert("Próximamente: Crear en Easy!Appointments")}
                                                        title="Crear Cliente en Agenda (Faltante)"
                                                    >
                                                        👤
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                    </tr>
                                );
                            })}
                            {datosPaginados.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                        No se encontraron resultados para los filtros actuales.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PAGINACIÓN */}
            {!loading && (
                <div className="pagination">
                    <button disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)} className="tab-btn">◀ Anterior</button>
                    <span style={{ margin: '0 10px', color: 'var(--text-secondary)' }}>Página {paginaActual} de {totalPaginas || 1}</span>
                    <button disabled={paginaActual === totalPaginas || totalPaginas === 0} onClick={() => setPaginaActual(p => p + 1)} className="tab-btn">Siguiente ▶</button>
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