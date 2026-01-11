/**
 * Users Page
 * User/Client management (UXUI-062)
 */

import { useEffect, useState } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { User, Calendar, Zap } from 'lucide-react';
import './UsersPage.css';

export default function UsersPage() {
    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="users-page">
            <header className="page-header">
                <h1>Usuarios</h1>
                <p>Lista de usuarios registrados</p>
            </header>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Tarifa CFE</th>
                            <th>Fecha Corte</th>
                            <th>Suscripción</th>
                            <th>Onboarding</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="loading-cell">Cargando...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="empty-cell">No hay usuarios</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="user-name">{user.nombre || 'Sin nombre'}</div>
                                                <div className="user-email">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="tarifa-badge">
                                            <Zap size={14} />
                                            {user.tipo_tarifa || 'No configurada'}
                                        </div>
                                    </td>
                                    <td>
                                        {user.fecha_corte ? (
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                {new Date(user.fecha_corte).toLocaleDateString('es-MX')}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <span className={`status-badge sub-${user.subscription_status}`}>
                                            {user.subscription_status === 'active' ? 'Activa' :
                                                user.subscription_status === 'inactive' ? '7 días' :
                                                    user.subscription_status === 'grace_period' ? 'Gracia' : 'Expirada'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`onboarding-badge ${user.onboarding_completado ? 'complete' : 'pending'}`}>
                                            {user.onboarding_completado ? 'Completo' : 'Pendiente'}
                                        </span>
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
