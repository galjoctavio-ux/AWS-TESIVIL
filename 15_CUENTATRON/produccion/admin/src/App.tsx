/**
 * App Root Component
 * Cuentatron Admin Panel
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import UsersPage from './pages/UsersPage';
import PlansPage from './pages/PlansPage';
import ReportsPage from './pages/ReportsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AdminAlertsPage from './pages/AdminAlertsPage';
import Layout from './components/Layout';

// Admin email whitelist (can be moved to environment variable)
const ADMIN_EMAILS = ['admin@tesivil.com', 'gbt22@tesivil.com'];

export default function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            checkAdmin(session);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                checkAdmin(session);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Check if user is admin
    const checkAdmin = (session: Session | null) => {
        if (session?.user?.email) {
            setIsAdmin(ADMIN_EMAILS.includes(session.user.email));
        } else {
            setIsAdmin(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0f0f1a',
                color: '#fff',
            }}>
                Cargando...
            </div>
        );
    }

    // Not logged in
    if (!session) {
        return <LoginPage />;
    }

    // Not admin
    if (!isAdmin) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0f0f1a',
                color: '#fff',
                gap: 16,
            }}>
                <h1>Acceso Denegado</h1>
                <p>Tu cuenta no tiene permisos de administrador.</p>
                <button
                    onClick={() => supabase.auth.signOut()}
                    style={{
                        background: '#4f46e5',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: 8,
                    }}
                >
                    Cerrar sesión
                </button>
            </div>
        );
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/alerts" element={<AdminAlertsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}
