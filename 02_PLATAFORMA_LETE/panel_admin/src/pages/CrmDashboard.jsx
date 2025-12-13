import React, { useEffect, useState, useMemo } from 'react';
import { getCrmDashboard, forceAnalyze } from '../apiService';
import ChatModal from '../components/ChatModal';
import './CrmDashboard.css';

const CrmDashboard = () => {
    // --- ESTADOS DE DATOS ---
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null); // Estado para manejar la fila expandida

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
    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleAnalizar = async (e, id) => {
        e.stopPropagation(); // Evitar abrir/cerrar la fila al hacer click
        if (!window.confirm("¿Forzar análisis de IA para este cliente?")) return;
        try {
            await forceAnalyze(id);
            alert("Solicitud enviada. Recargando datos en 3s...");
            setTimeout(cargarDatos, 3000);
        } catch (error) {
            alert("Error al solicitar análisis.");
        }
    };

    const handleChatOpen = (e, cliente) => {
        e.stopPropagation();
        setSelectedClientForChat(cliente);
    };

    const handleSort = (key) => {
        setOrden(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    // --- CALCULOS DE CONTADORES ---
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
            data = data.filter(c => !c.sync_mariadb);
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
                (c.ai_summary || '').toLowerCase().includes(lowerTerm) ||
                (c.notas_internas || '').toLowerCase().includes(lowerTerm)
            );
        }

        // 3. Ordenamiento
        data.sort((a, b) => {
            let valA = a[orden.key];
            let valB = b[orden.key];

            if (['last_interaction', 'next_follow_up_date'].includes(orden.key)) {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            } else {
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

    // --- HELPERS VISUALES ---
    const getScoreColor = (calif) => {
        switch (calif) {
            case 'AMABLE': return 'var(--color-success)';
            case 'NEUTRO': return 'var(--color-warning)';
            case 'HOSTIL': return 'var(--color-danger)';
            case 'SOSPECHOSO': return 'var(--color-danger)';
            default: return 'var(--color-gray)';
        }
    };

    const getIntentBadge = (cliente) => {
        if (cliente.alerta_cita_desincronizada) return { label: '⚠️ CITA SIN AGENDAR', class: 'bg-red' };
        if (cliente.debe_cotizacion) return { label: '💰 COTIZAR', class: 'bg-blue' };

        const intent = cliente.crm_intent || 'NONE';
        if (intent === 'OPERATIONAL_ALERT') return { label: '🚨 ALERTA', class: 'bg-red' };
        if (intent === 'ADMIN_TASK') return { label: '📄 TRAMITE', class: 'bg-blue' };
        if (intent === 'QUOTE_FOLLOWUP') return { label: '⏳ SEGUIMIENTO', class: 'bg-orange' };

        return { label: intent.replace('_', ' '), class: 'bg-gray' };
    };

    const safeText = (text, limit) => {
        if (!text) return '';
        const str = String(text);
        if (!limit) return str;
        return str.length > limit ? str.substring(0, limit) + '...' : str;
    };

    // --- RENDERIZADO ---
    return (
        <div className="crm-container">
            {/* HEADER */}
            <header className="crm-header">
                <div>
                    <h1>🧠 Cerebro CRM</h1>
                    <div className="crm-stats">
                        Total: {clientes.length} | Alertas: {counts.alertas} | Sin Agenda: {counts.sinEa}
                    </div>
                </div>

                <div className="crm-controls-group">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Buscar..."
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
            </div>

            {/* TABLA PRINCIPAL */}
            {loading ? <div className="loading-state">Analizando ecosistema de datos...</div> : (
                <div className="crm-table-wrapper">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>Ver</th>
                                <th onClick={() => handleSort('nombre_completo')}>Cliente ↕</th>
                                <th>Status & Sync</th>
                                <th>Resumen IA (Preview)</th>
                                <th onClick={() => handleSort('saldo_pendiente')}>Finanzas ↕</th>
                                <th onClick={() => handleSort('last_interaction')}>Interacción ↕</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosPaginados.map(cliente => {
                                const isExpanded = expandedRow === (cliente.id || cliente.cliente_id);
                                const scoreColor = getScoreColor(cliente.calificacion_semaforo || cliente.calificacion);
                                const intentBadge = getIntentBadge(cliente);

                                return (
                                    <React.Fragment key={cliente.id || cliente.cliente_id}>
                                        {/* FILA PRINCIPAL (RESUMEN) */}
                                        <tr
                                            className={`main-row ${cliente.alerta_cita_desincronizada ? 'row-alert' : ''}`}
                                            onClick={() => toggleRow(cliente.id || cliente.cliente_id)}
                                        >
                                            <td style={{ textAlign: 'center' }}>
                                                <button className={`btn-expand ${isExpanded ? 'open' : ''}`}>▼</button>
                                            </td>

                                            {/* Cliente */}
                                            <td>
                                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <span className="score-indicator" style={{ backgroundColor: scoreColor }} title={`Calificación: ${cliente.calificacion_semaforo}`}></span>
                                                    {cliente.nombre_completo || 'Desconocido'}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{cliente.telefono}</div>
                                            </td>

                                            {/* Status & Sync */}
                                            <td>
                                                <span className={`mini-badge ${intentBadge.class}`}>{intentBadge.label}</span>
                                                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                                    <span style={{ color: cliente.sync_mariadb ? 'green' : 'red', fontWeight: 'bold' }} title="Existe en Easy!Appointments">
                                                        ● EA
                                                    </span>
                                                    <span style={{ color: '#ccc', margin: '0 4px' }}>|</span>
                                                    <span style={{ color: cliente.sync_evolution ? 'green' : 'gray', fontWeight: 'bold' }} title="Conectado a WhatsApp">
                                                        ● WA
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Resumen IA (Corto) */}
                                            <td>
                                                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                                                    {safeText(cliente.ai_summary, 70)}
                                                </div>
                                            </td>

                                            {/* Finanzas */}
                                            <td>
                                                {cliente.saldo_pendiente > 0 ? (
                                                    <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>
                                                        Debe: ${Number(cliente.saldo_pendiente).toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--color-success)', fontSize: '0.8rem' }}>Al corriente</span>
                                                )}
                                            </td>

                                            {/* Interacción */}
                                            <td>
                                                <div style={{ fontSize: '0.8rem' }}>
                                                    {cliente.last_interaction
                                                        ? new Date(cliente.last_interaction).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : '-'}
                                                </div>
                                                {cliente.unread_count > 0 && (
                                                    <span className="mini-badge bg-red" style={{ marginTop: '3px', display: 'inline-block' }}>
                                                        {cliente.unread_count} nuevos
                                                    </span>
                                                )}
                                            </td>

                                            {/* Acciones Rápidas */}
                                            <td onClick={e => e.stopPropagation()}>
                                                <div className="action-buttons">
                                                    <button className="btn-icon btn-chat" onClick={(e) => handleChatOpen(e, cliente)} title="Chat">💬</button>
                                                    <button className="btn-icon btn-ai" onClick={(e) => handleAnalizar(e, cliente.id || cliente.cliente_id)} title="Forzar IA">⚡</button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* FILA EXPANDIBLE (DETALLES COMPLETOS) */}
                                        {isExpanded && (
                                            <tr className="row-expanded-bg">
                                                <td colSpan="7">
                                                    <div className="details-panel">

                                                        {/* CARD 1: ANÁLISIS IA & NOTAS */}
                                                        <div className="detail-card">
                                                            <h4>🤖 Análisis IA Completo</h4>
                                                            <div className="full-text">
                                                                {cliente.ai_summary || "No hay análisis de IA disponible."}
                                                            </div>

                                                            {cliente.notas_internas && (
                                                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '4px' }}>
                                                                    <strong>📝 Nota Interna:</strong>
                                                                    <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>{cliente.notas_internas}</div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* CARD 2: DATOS DE CONTACTO */}
                                                        <div className="detail-card">
                                                            <h4>📍 Datos de Contacto</h4>
                                                            <div className="info-row">
                                                                <span className="info-label">Nombre:</span>
                                                                <span className="info-value">{cliente.nombre_completo}</span>
                                                            </div>
                                                            <div className="info-row">
                                                                <span className="info-label">Teléfono:</span>
                                                                <span className="info-value">{cliente.telefono}</span>
                                                            </div>
                                                            <div className="info-row">
                                                                <span className="info-label">Email:</span>
                                                                <span className="info-value">{cliente.email || '-'}</span>
                                                            </div>

                                                            <div style={{ marginTop: '15px' }}>
                                                                <div className="info-label" style={{ marginBottom: '5px' }}>Dirección:</div>
                                                                <div style={{ color: '#334155', fontStyle: 'italic', marginBottom: '8px' }}>
                                                                    {cliente.direccion_real || cliente.direccion_principal || "Sin dirección registrada"}
                                                                </div>
                                                                {cliente.google_maps_link && (
                                                                    <a href={cliente.google_maps_link} target="_blank" rel="noopener noreferrer" className="map-link-btn">
                                                                        🗺️ Abrir en Google Maps
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* CARD 3: OPERACIONES & ACCIONES */}
                                                        <div className="detail-card">
                                                            <h4>⚙️ Estado Operativo</h4>

                                                            <div className="info-row">
                                                                <span className="info-label">Sincronizado EA:</span>
                                                                <span className="info-value" style={{ fontWeight: 'bold', color: cliente.sync_mariadb ? 'green' : 'red' }}>
                                                                    {cliente.sync_mariadb ? 'SI' : 'NO'}
                                                                </span>
                                                            </div>
                                                            <div className="info-row">
                                                                <span className="info-label">Cotización Pendiente:</span>
                                                                <span className="info-value" style={{ fontWeight: 'bold', color: cliente.debe_cotizacion ? 'blue' : '#64748b' }}>
                                                                    {cliente.debe_cotizacion ? 'SI' : 'NO'}
                                                                </span>
                                                            </div>
                                                            <div className="info-row">
                                                                <span className="info-label">Historial Citas:</span>
                                                                <span className="info-value">{cliente.cita_realizada ? 'SI' : 'NO'}</span>
                                                            </div>

                                                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                {!cliente.sync_mariadb && (
                                                                    <button
                                                                        className="tab-btn alert"
                                                                        style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                                                                        onClick={() => alert("Próximamente: Creación automática en EA")}
                                                                    >
                                                                        👤 Crear Cliente en Agenda
                                                                    </button>
                                                                )}
                                                                {cliente.debe_cotizacion && (
                                                                    <button
                                                                        className="tab-btn admin"
                                                                        style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                                                                        onClick={() => alert("Próximamente: Ir a cotizador")}
                                                                    >
                                                                        💰 Generar Cotización
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {datosPaginados.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
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