/**
 * Plans Page
 * Plan management (UXUI-058)
 * Only 4 plan types for MVP (UXUI-029)
 */

import { useEffect, useState } from 'react';
import { supabase, Plan } from '../lib/supabase';
import { CreditCard, Edit2 } from 'lucide-react';
import './PlansPage.css';

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('planes')
                .select('*')
                .order('id');

            if (error) throw error;
            setPlans(data || []);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="plans-page">
            <header className="page-header">
                <h1>Planes</h1>
                <p>Gestión de planes disponibles (4 tipos MVP)</p>
            </header>

            <div className="plans-grid">
                {loading ? (
                    <div className="loading">Cargando...</div>
                ) : (
                    plans.map((plan) => (
                        <div key={plan.id} className="plan-card">
                            <div className="plan-header">
                                <CreditCard size={24} />
                                <span className={`plan-type ${plan.tipo}`}>
                                    {plan.tipo === 'permanente' ? 'Suscripción' : '7 Días'}
                                </span>
                            </div>

                            <h3 className="plan-name">{plan.nombre_plan}</h3>
                            <p className="plan-description">{plan.descripcion}</p>

                            <div className="plan-price">
                                <span className="price">${plan.precio}</span>
                                <span className="period">
                                    {plan.tipo === 'permanente' ? '/mes' : 'único'}
                                </span>
                            </div>

                            <div className="plan-features">
                                <div className="feature">
                                    <span className="feature-label">Bifásico:</span>
                                    <span className={`feature-value ${plan.bifasico ? 'yes' : 'no'}`}>
                                        {plan.bifasico ? 'Sí' : 'No'}
                                    </span>
                                </div>
                                <div className="feature">
                                    <span className="feature-label">Con paneles:</span>
                                    <span className={`feature-value ${plan.con_paneles ? 'yes' : 'no'}`}>
                                        {plan.con_paneles ? 'Sí' : 'No'}
                                    </span>
                                </div>
                            </div>

                            <button className="btn-edit" disabled>
                                <Edit2 size={16} />
                                Editar (deshabilitado)
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
