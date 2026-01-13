/**
 * Reset Password Page
 * Allows users to enter OTP code and set new password
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
    const [step, setStep] = useState<'otp' | 'password'>('otp');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otpCode,
            type: 'recovery',
        });

        setLoading(false);

        if (error) {
            setError('Código inválido o expirado');
        } else {
            setStep('password');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        setLoading(false);

        if (error) {
            setError('Error al actualizar la contraseña');
        } else {
            setSuccess('¡Contraseña actualizada exitosamente! Redirigiendo al login...');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    };

    const goBack = () => {
        window.location.href = '/';
    };

    return (
        <div className="reset-page">
            <div className="reset-card">
                <button className="back-button" onClick={goBack}>
                    <ArrowLeft size={20} />
                    Volver al login
                </button>

                <div className="reset-header">
                    <h1 className="reset-logo">Cuentatron</h1>
                    <p className="reset-subtitle">Restablecer Contraseña</p>
                </div>

                {step === 'otp' ? (
                    <form onSubmit={handleVerifyOtp} className="reset-form">
                        {error && <div className="reset-error">{error}</div>}

                        <p className="reset-instructions">
                            Ingresa tu correo electrónico y el código de 8 dígitos que recibiste.
                        </p>

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
                            <label htmlFor="otp">Código de verificación</label>
                            <input
                                id="otp"
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                placeholder="12345678"
                                maxLength={8}
                                required
                                disabled={loading}
                                className="otp-input"
                            />
                        </div>

                        <button type="submit" className="reset-button" disabled={loading}>
                            {loading ? 'Verificando...' : 'Verificar código'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="reset-form">
                        {error && <div className="reset-error">{error}</div>}
                        {success && <div className="reset-success">{success}</div>}

                        <p className="reset-instructions">
                            Ingresa tu nueva contraseña.
                        </p>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nueva contraseña</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar contraseña</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="reset-button" disabled={loading || !!success}>
                            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
