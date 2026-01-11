/**
 * Auth Screen Component
 * Cuentatron MVP
 * 
 * Primary: Google Auth
 * Alternative: Email + 6-digit code (OTP)
 * 
 * Referencia: modulo_01_auth_onboarding
 * NO implementar: WhatsApp, teléfono, contraseña tradicional
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type AuthStep = 'choose' | 'email' | 'otp';

export default function AuthScreen() {
    const { signInWithGoogle, signInWithEmail, verifyOTP } = useAuth();

    const [step, setStep] = useState<AuthStep>('choose');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle Google Sign In
    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            Alert.alert('Error', 'No se pudo iniciar sesión con Google');
        } finally {
            setLoading(false);
        }
    };

    // Handle Email Sign In (send OTP)
    const handleEmailSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Ingresa tu correo electrónico');
            return;
        }

        setLoading(true);
        const { error } = await signInWithEmail(email);
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setStep('otp');
        }
    };

    // Handle OTP Verification
    const handleOTPSubmit = async () => {
        if (otpCode.length < 6 || otpCode.length > 8) {
            Alert.alert('Error', 'El código debe tener entre 6 y 8 dígitos');
            return;
        }

        setLoading(true);
        const { error } = await verifyOTP(email, otpCode);
        setLoading(false);

        if (error) {
            Alert.alert('Error', 'Código inválido. Intenta de nuevo.');
            setOtpCode('');
        }
        // If successful, AuthContext will handle navigation
    };

    // Render based on current step
    const renderContent = () => {
        switch (step) {
            case 'choose':
                return (
                    <>
                        <Text style={styles.title}>Bienvenido a Cuentatron</Text>
                        <Text style={styles.subtitle}>Monitorea tu consumo de energía</Text>

                        {/* Google Auth - Primary */}
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <Ionicons name="logo-google" size={24} color="#fff" />
                            <Text style={styles.googleButtonText}>Continuar con Google</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>o</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Email Auth - Alternative */}
                        <TouchableOpacity
                            style={styles.emailButton}
                            onPress={() => setStep('email')}
                            disabled={loading}
                        >
                            <Ionicons name="mail-outline" size={24} color="#4f46e5" />
                            <Text style={styles.emailButtonText}>Continuar con Email</Text>
                        </TouchableOpacity>
                    </>
                );

            case 'email':
                return (
                    <>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setStep('choose')}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>

                        <Text style={styles.title}>Ingresa tu correo</Text>
                        <Text style={styles.subtitle}>
                            Te enviaremos un código para verificar
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="correo@ejemplo.com"
                            placeholderTextColor="#666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                        />

                        <TouchableOpacity
                            style={[styles.primaryButton, !email.trim() && styles.buttonDisabled]}
                            onPress={handleEmailSubmit}
                            disabled={loading || !email.trim()}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Enviar código</Text>
                            )}
                        </TouchableOpacity>
                    </>
                );

            case 'otp':
                return (
                    <>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setStep('email')}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>

                        <Text style={styles.title}>Ingresa el código</Text>
                        <Text style={styles.subtitle}>
                            Revisa tu correo {email}
                        </Text>

                        <TextInput
                            style={[styles.input, styles.otpInput]}
                            placeholder="Código de verificación"
                            placeholderTextColor="#666"
                            keyboardType="number-pad"
                            maxLength={8}
                            value={otpCode}
                            onChangeText={setOtpCode}
                            editable={!loading}
                        />

                        <TouchableOpacity
                            style={[styles.primaryButton, otpCode.length < 6 && styles.buttonDisabled]}
                            onPress={handleOTPSubmit}
                            disabled={loading || otpCode.length < 6}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Verificar</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleEmailSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.resendText}>Reenviar código</Text>
                        </TouchableOpacity>
                    </>
                );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {loading && step === 'choose' && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#4f46e5" />
                    </View>
                )}
                {renderContent()}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(26, 26, 46, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 0,
        padding: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 40,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4285f4',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 12,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    dividerText: {
        color: '#666',
        paddingHorizontal: 16,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#4f46e5',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 12,
    },
    emailButtonText: {
        color: '#4f46e5',
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#252542',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
    },
    otpInput: {
        textAlign: 'center',
        fontSize: 32,
        letterSpacing: 8,
    },
    primaryButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    resendButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        color: '#4f46e5',
        fontSize: 14,
    },
});
