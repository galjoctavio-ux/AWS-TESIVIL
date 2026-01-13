/**
 * Login Page
 * Admin Panel Authentication
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setError('Credenciales incorrectas');
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Ingresa tu correo electrónico primero');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        setLoading(false);

        if (error) {
            setError('Error al enviar el correo de recuperación');
        } else {
            setSuccess('Se ha enviado un enlace de recuperación a tu correo');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-logo">Cuentatron</h1>
                    <p className="login-subtitle">Panel de Administración</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && (
                        <div className="login-error">{error}</div>
                    )}

                    {success && (
                        <div className="login-success">
                            {success}
                            <a href="/reset-password" className="reset-link">
                                Ir a restablecer contraseña →
                            </a>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@tesivil.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="forgot-password-link"
                        onClick={handleForgotPassword}
                        disabled={loading}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="login-footer">
                    Acceso solo para administradores autorizados
                </p>
            </div>
        </div>
    );
}
