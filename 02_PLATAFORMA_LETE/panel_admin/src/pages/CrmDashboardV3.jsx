import React, { useEffect, useState, useMemo } from 'react';
import api from '../apiService';
import './CrmDashboardV3.css';
import ClientDetailsDrawer from '../components/ClientDetailsDrawer';
// En el siguiente paso importaremos el Drawer (Detalles) aquí.

const CrmDashboardV3 = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');
    
    // Placeholder para el siguiente paso
    const [selectedClient, setSelectedClient] = useState(null);

    // --- CARGA DE DATOS V3 ---
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/clientes/admin-dashboard-v3');
            const dataRaw = response.data.data || [];
            setClientes(dataRaw);
        } catch (error) {
            console.error("Error cargando CRM V3:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        // Auto-refresh cada 2 min para ver cambios de crons
        const interval = setInterval(cargarDatos, 120000); 
        return () => clearInterval(interval);
    }, []);

    // --- FILTROS Y BÚSQUEDA ---
    const datosFiltrados = useMemo(() => {
        return clientes.filter(c => {
            // 1. Filtro por Pestaña
            if (filtro === 'ALERTAS') {
                if (c.status_integridad !== 'OK') return true; // Fantasmas/Manuales
                if (c.next_action?.color === 'red') return true; // Crons urgentes
                if (c.saldo_pendiente > 0) return true; // Deudores
                return false;
            }
            if (filtro === 'GHOST' && c.status_integridad !== 'GHOST') return false;
            
            // 2. Búsqueda de Texto
            if (busqueda) {
                const q = busqueda.toLowerCase();
                return (
                    (c.nombre || '').toLowerCase().includes(q) ||
                    (c.telefono || '').includes(q) ||
                    (c.tecnico || '').toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [clientes, filtro, busqueda]);

    // --- RENDERIZADO DE BADGES ---
    const renderNextAction = (action) => {
        if (!action || action.tipo === 'NADA') return <span className="text-gray-400">-</span>;
        return (
            <span className={`badge badge-${action.color}`}>
                {action.mensaje}
            </span>
        );
    };

    const renderIntegridad = (status) => {
        if (status === 'OK') return <span title="Sincronizado"><span className="dot dot-ok"></span>OK</span>;
        if (status === 'GHOST') return <span title="Cita fantasma"><span className="dot dot-ghost"></span>GHOST</span>;
        return <span title="Agendado Manual"><span className="dot dot-manual"></span>MANUAL</span>;
    };

    return (
        <div className="v3-container">
            {/* HEADER */}
            <div className="v3-header">
                <h2>🚀 Centro de Mando V3</h2>
                <div className="v3-stats">
                    <span className="stat-item">Total: <strong>{clientes.length}</strong></span>
                    <span className="stat-item">Vista: <strong>{datosFiltrados.length}</strong></span>
                </div>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar cliente..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
            </div>

            {/* TABS */}
            <div className="v3-tabs">
                <button className={`v3-tab alert ${filtro === 'ALERTAS' ? 'active' : ''}`} onClick={() => setFiltro('ALERTAS')}>🚨 Atención</button>
                <button className={`v3-tab ${filtro === 'TODOS' ? 'active' : ''}`} onClick={() => setFiltro('TODOS')}>Todos</button>
                <button className={`v3-tab ${filtro === 'GHOST' ? 'active' : ''}`} onClick={() => setFiltro('GHOST')}>👻 Fantasmas</button>
            </div>

            {/* TABLA */}
            <div className="table-container">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Cargando análisis...</div>
                ) : (
                    <table className="v3-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Status</th>
                                <th>Cliente</th>
                                <th>🤖 Próxima Acción (Cron)</th>
                                <th>Técnico / Cita</th>
                                <th>Finanzas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosFiltrados.map(c => (
                                <tr key={c.id} onClick={() => setSelectedClient(c)}>
                                    <td>{renderIntegridad(c.status_integridad)}</td>
                                    <td>
                                        <div className="cell-cliente">{c.nombre}</div>
                                        <span className="cell-subtext">{c.telefono}</span>
                                    </td>
                                    <td>
                                        {renderNextAction(c.next_action)}
                                    </td>
                                    <td>
                                        <div>{c.tecnico}</div>
                                        {c.fecha_cita_real && (
                                            <span className="cell-subtext">
                                                {new Date(c.fecha_cita_real).toLocaleDateString()}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {c.saldo_pendiente > 0 ? (
                                            <span className="money-debt">${c.saldo_pendiente}</span>
                                        ) : (
                                            <span className="money-ok">OK</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ANTES ERA UN DIV NEGRO, AHORA ES ESTO: */}
{selectedClient && (
    <ClientDetailsDrawer 
        cliente={selectedClient} 
        onClose={() => setSelectedClient(null)} 
    />
)}
</div>
    );
};

export default CrmDashboardV3;