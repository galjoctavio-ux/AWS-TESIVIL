/**
 * Reports Page
 * PDF Report generation (UXUI-061)
 * Only for 7-day service users
 * 
 * CAME A-06: PDF requires human intervention
 */

import { useEffect, useState } from 'react';
import { supabase, Usuario, Dispositivo } from '../lib/supabase';
import { FileText, Download, Eye, User } from 'lucide-react';
import './ReportsPage.css';

interface ReportCandidate {
    user: Usuario;
    device: Dispositivo;
}

export default function ReportsPage() {
    const [candidates, setCandidates] = useState<ReportCandidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCandidates();
    }, []);

    // Fetch users with 7-day service who need reports
    const fetchCandidates = async () => {
        try {
            // Get users with inactive subscription (7-day trial)
            const { data: users, error: usersError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('subscription_status', 'inactive');

            if (usersError) throw usersError;

            // For each user, get their device
            const candidatesWithDevices: ReportCandidate[] = [];
            for (const user of users || []) {
                const { data: devices } = await supabase
                    .from('dispositivos')
                    .select('*')
                    .eq('usuario_id', user.id)
                    .limit(1);

                if (devices && devices.length > 0) {
                    candidatesWithDevices.push({
                        user,
                        device: devices[0],
                    });
                }
            }

            setCandidates(candidatesWithDevices);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate PDF (placeholder - would integrate with PDF generation service)
    const handleGenerateReport = (candidate: ReportCandidate) => {
        alert(`Generación de PDF para ${candidate.user.nombre || candidate.user.email} - Función en desarrollo`);
    };

    return (
        <div className="reports-page">
            <header className="page-header">
                <h1>Reportes de Diagnóstico</h1>
                <p>Generación de PDFs para usuarios de servicio 7 días</p>
            </header>

            <div className="info-banner">
                <FileText size={20} />
                <p>
                    Los reportes PDF requieren revisión humana antes de publicarse al usuario (CAME A-06).
                    Solo se muestran usuarios con servicio de 7 días activo.
                </p>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Dispositivo</th>
                            <th>Tarifa CFE</th>
                            <th>Estado Reporte</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="loading-cell">Cargando...</td></tr>
                        ) : candidates.length === 0 ? (
                            <tr><td colSpan={5} className="empty-cell">No hay usuarios con servicio 7 días</td></tr>
                        ) : (
                            candidates.map((candidate) => (
                                <tr key={candidate.user.id}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="user-name">{candidate.user.nombre || 'Sin nombre'}</div>
                                                <div className="user-email">{candidate.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="device-id">{candidate.device.device_id}</td>
                                    <td>{candidate.user.tipo_tarifa || 'No configurada'}</td>
                                    <td>
                                        <span className="status-badge pending">Pendiente</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action"
                                                onClick={() => handleGenerateReport(candidate)}
                                                title="Generar PDF"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button className="btn-action" disabled title="Ver PDF">
                                                <Eye size={16} />
                                            </button>
                                            <button className="btn-action" disabled title="Descargar">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
