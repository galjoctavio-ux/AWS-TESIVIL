'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    pendingOrders?: number;
    flaggedContentCount?: number;
    onLogout?: () => void;
}

const navItems = [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/users', icon: '👥', label: 'Usuarios' },
    { href: '/orders', icon: '📦', label: 'Pedidos', badge: 'pendingOrders' },
    { href: '/products', icon: '🏪', label: 'Productos' },
    { href: '/moderation', icon: '🛡️', label: 'Moderación', badge: 'flaggedContent' },
    { href: '/settings', icon: '⚙️', label: 'Configuración' },
];

const toolItems = [
    { href: '/tokens', icon: '🪙', label: 'Economía Tokens' },
    { href: '/logs', icon: '📋', label: 'Logs Auditoría' },
];

export default function Sidebar({ pendingOrders = 0, flaggedContentCount = 0, onLogout }: SidebarProps) {
    const pathname = usePathname();

    const getBadgeCount = (badge?: string) => {
        if (badge === 'pendingOrders') return pendingOrders;
        if (badge === 'flaggedContent') return flaggedContentCount;
        return 0;
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform transition-transform lg:translate-x-0">
            {/* Header */}
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    ❄️ <span>QRclima Admin</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">Panel de Administración</p>
            </div>

            {/* Main Navigation */}
            <nav className="p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const badgeCount = getBadgeCount(item.badge);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive
                                            ? 'bg-slate-700 text-white'
                                            : 'hover:bg-slate-700 text-slate-300'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                    {badgeCount > 0 && (
                                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${item.badge === 'flaggedContent'
                                                ? 'bg-yellow-500 text-white'
                                                : 'bg-red-500 text-white'
                                            }`}>
                                            {badgeCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Tools Section */}
                <div className="mt-8 pt-8 border-t border-slate-700">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 px-4">Herramientas</p>
                    <ul className="space-y-2">
                        {toolItems.map((item) => {
                            const isActive = pathname === item.href;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive
                                                ? 'bg-slate-700 text-white'
                                                : 'hover:bg-slate-700 text-slate-300'
                                            }`}
                                    >
                                        <span>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Logout Button */}
                {onLogout && (
                    <div className="mt-8 pt-8 border-t border-slate-700">
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-slate-700 transition w-full"
                        >
                            <span>🚪</span>
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </nav>
        </aside>
    );
}
