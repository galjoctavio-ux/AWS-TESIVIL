/**
 * Admin Layout Component
 * Sidebar navigation + main content area
 */

import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import {
    LayoutDashboard,
    Cpu,
    Users,
    CreditCard,
    FileText,
    LogOut,
    Bell,
    Wallet,
} from 'lucide-react';
import './Layout.css';

const NAV_ITEMS = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/devices', icon: Cpu, label: 'Dispositivos' },
    { path: '/users', icon: Users, label: 'Usuarios' },
    { path: '/subscriptions', icon: Wallet, label: 'Suscripciones' },
    { path: '/plans', icon: CreditCard, label: 'Planes' },
    { path: '/alerts', icon: Bell, label: 'Alertas Admin' },
    { path: '/reports', icon: FileText, label: 'Reportes' },
];

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="logo">Cuentatron</h1>
                    <span className="logo-subtitle">Admin</span>
                </div>

                <nav className="nav">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
