import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { SPACING, RADIUS } from '@/constants/config';
import { Icon } from '@/components/icons/Icon';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { signIn, signUp, signInWithGoogleHandler } = useAuth();
    const { colors, isDark } = useTheme();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const styles = createStyles(colors);

    const validateForm = () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Ingresa tu correo electrónico');
            return false;
        }
        if (!email.includes('@')) {
            Alert.alert('Error', 'Ingresa un correo válido');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (!isLogin && password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            if (isLogin) {
                const result = await signIn(email, password);
                if (result.success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.replace('/(tabs)/profile');
                } else {
                    Alert.alert('Error', result.error || 'No se pudo iniciar sesión');
                }
            } else {
                const result = await signUp(email, password);
                if (result.success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    if (result.error) {
                        // Email confirmation required
                        Alert.alert('¡Registro exitoso!', result.error, [
                            { text: 'OK', onPress: () => setIsLogin(true) }
                        ]);
                    } else {
                        router.replace('/(tabs)/profile');
                    }
                } else {
                    Alert.alert('Error', result.error || 'No se pudo crear la cuenta');
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ocurrió un error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleMode = () => {
        Haptics.selectionAsync();
        setIsLogin(!isLogin);
        setPassword('');
        setConfirmPassword('');
    };

    const handleGoogleSignIn = async () => {
        setIsLoadingGoogle(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const result = await signInWithGoogleHandler();
            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace('/(tabs)/profile');
            } else {
                // Don't show error for cancelled auth
                if (result.error && !result.error.includes('cancelled')) {
                    Alert.alert('Error', result.error || 'No se pudo iniciar sesión con Google');
                }
            }
        } catch (error: any) {
            Alert.alert('Error', 'Ocurrió un error al conectar con Google');
        } finally {
            setIsLoadingGoogle(false);
        }
    };

    // Dynamic gradient colors based on theme
    const gradientColors: [string, string] = isDark
        ? ['#1a1a2e', '#0B0E14']
        : [colors.surfaceLight, colors.background];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={gradientColors}
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Icon name="ArrowLeft" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.logo}>✨</Text>
                            <Text style={styles.title}>
                                {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                            </Text>
                            <Text style={styles.subtitle}>
                                {isLogin
                                    ? 'Inicia sesión para acceder a todas las funciones'
                                    : 'Únete a SYNAPSE AI y desbloquea el poder de la IA'
                                }
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Icon name="Mail" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Correo electrónico"
                                    placeholderTextColor={colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Icon name="Lock" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contraseña"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Icon
                                        name={showPassword ? 'EyeOff' : 'Eye'}
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>

                            {!isLogin && (
                                <View style={styles.inputContainer}>
                                    <Icon name="Lock" size={20} color={colors.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirmar contraseña"
                                        placeholderTextColor={colors.textMuted}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                </View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#8B5CF6', '#6D28D9']}
                                    style={styles.submitGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitText}>
                                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Toggle Mode */}
                            <TouchableOpacity
                                style={styles.toggleButton}
                                onPress={handleToggleMode}
                            >
                                <Text style={styles.toggleText}>
                                    {isLogin
                                        ? '¿No tienes cuenta? '
                                        : '¿Ya tienes cuenta? '
                                    }
                                    <Text style={styles.toggleTextBold}>
                                        {isLogin ? 'Regístrate' : 'Inicia sesión'}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>O continúa con</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialButtons}>
                            <TouchableOpacity
                                style={[styles.socialButton, isLoadingGoogle && { opacity: 0.7 }]}
                                onPress={handleGoogleSignIn}
                                disabled={isLoadingGoogle || isLoading}
                            >
                                <Text style={styles.socialIcon}>G</Text>
                                {isLoadingGoogle ? (
                                    <ActivityIndicator size="small" color={colors.textPrimary} />
                                ) : (
                                    <Text style={styles.socialText}>Continuar con Google</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: SPACING.lg,
    },
    form: {
        gap: SPACING.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        paddingHorizontal: SPACING.md,
    },
    inputIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: colors.textPrimary,
    },
    eyeButton: {
        padding: SPACING.sm,
    },
    submitButton: {
        marginTop: SPACING.md,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    toggleButton: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    toggleText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    toggleTextBold: {
        color: colors.primary,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.surfaceBorder,
    },
    dividerText: {
        marginHorizontal: SPACING.md,
        fontSize: 13,
        color: colors.textMuted,
    },
    socialButtons: {
        gap: SPACING.md,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        paddingVertical: 14,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        gap: SPACING.sm,
    },
    socialIcon: {
        fontSize: 18,
        fontWeight: '700',
        color: '#EA4335',
    },
    socialText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    comingSoonBadge: {
        backgroundColor: colors.warning,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADIUS.md,
    },
    comingSoonText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#000',
    },
});
