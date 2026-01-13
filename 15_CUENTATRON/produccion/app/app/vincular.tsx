/**
 * Vinculación Screen
 * Cuentatron MVP
 * 
 * Module: modulo_06_vinculacion
 * Flow: QR scan → Verify device → WiFi config → Confirm
 * 
 * DEBE existir alternativa manual al QR (UXUI-069)
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type VinculacionStep = 'scan' | 'manual' | 'wifi' | 'success';

export default function VinculacionScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();

    const [step, setStep] = useState<VinculacionStep>('scan');
    const [loading, setLoading] = useState(false);
    const [deviceId, setDeviceId] = useState('');
    const [manualCode, setManualCode] = useState('');
    const [wifiSSID, setWifiSSID] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [scanned, setScanned] = useState(false);

    // Request permission on mount
    useEffect(() => {
        if (!permission?.granted && permission?.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    // Verify device exists and is available
    const verifyDevice = async (code: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('dispositivos')
                .select('*')
                .eq('device_id', code)
                .single();

            if (error || !data) {
                Alert.alert('Error', 'Este código no corresponde a un dispositivo válido');
                return false;
            }

            if (data.usuario_id && data.usuario_id !== user?.id) {
                Alert.alert('Error', 'Este dispositivo ya está vinculado a otra cuenta');
                return false;
            }

            setDeviceId(code);
            return true;
        } catch (error) {
            console.error('Error verifying device:', error);
            Alert.alert('Error', 'No se pudo verificar el dispositivo');
            return false;
        }
    };

    // Handle QR code scanned
    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || loading) return;
        setScanned(true);
        setLoading(true);

        const isValid = await verifyDevice(data.trim().toUpperCase());
        setLoading(false);

        if (isValid) {
            setStep('wifi');
        } else {
            // Allow scanning again after error
            setTimeout(() => setScanned(false), 2000);
        }
    };

    // Handle manual code submission
    const handleManualSubmit = async () => {
        if (!manualCode.trim()) {
            Alert.alert('Error', 'Ingresa el código del dispositivo');
            return;
        }

        setLoading(true);
        const isValid = await verifyDevice(manualCode.trim().toUpperCase());
        setLoading(false);

        if (isValid) {
            setStep('wifi');
        }
    };

    // Handle WiFi configuration
    const handleWifiSubmit = async () => {
        if (!wifiSSID.trim()) {
            Alert.alert('Error', 'Ingresa el nombre de la red WiFi');
            return;
        }

        setLoading(true);

        try {
            // Update device in database
            const { error } = await supabase
                .from('dispositivos')
                .update({
                    usuario_id: user?.id,
                    estado: 'vinculado',
                    fecha_vinculacion: new Date().toISOString(),
                })
                .eq('device_id', deviceId);

            if (error) throw error;

            // In real implementation, this would send WiFi credentials to ESP32
            // via BLE or softAP mode. For MVP, we simulate success.

            setTimeout(() => {
                setLoading(false);
                setStep('success');
            }, 2000);

        } catch (error) {
            console.error('Error linking device:', error);
            setLoading(false);
            Alert.alert('Error', 'No se pudo vincular el dispositivo');
        }
    };

    // Handle success
    const handleSuccess = () => {
        router.replace('/(tabs)');
    };

    // Skip linking
    const handleSkip = () => {
        router.replace('/(tabs)');
    };

    // Render QR scan step with FULLSCREEN camera
    const renderScanStep = () => {
        // If camera permission granted and not loading, show fullscreen camera
        if (permission?.granted && !loading) {
            return (
                <View style={styles.fullscreenCamera}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    />
                    {/* Overlay with corners and instructions */}
                    <View style={styles.cameraOverlay}>
                        <View style={styles.overlayTop}>
                            <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.overlayMiddle}>
                            <View style={styles.scanFrame}>
                                <View style={[styles.corner, styles.cornerTL]} />
                                <View style={[styles.corner, styles.cornerTR]} />
                                <View style={[styles.corner, styles.cornerBL]} />
                                <View style={[styles.corner, styles.cornerBR]} />
                            </View>
                        </View>

                        <View style={styles.overlayBottom}>
                            <Text style={styles.scanInstruction}>Apunta al código QR del dispositivo</Text>
                            <TouchableOpacity
                                style={styles.manualButton}
                                onPress={() => setStep('manual')}
                            >
                                <Ionicons name="keypad-outline" size={20} color="#fff" />
                                <Text style={styles.manualButtonText}>Ingresar código manual</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        // Show permission or loading states
        return (
            <View style={styles.stepContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="qr-code-outline" size={80} color="#4f46e5" />
                </View>

                <Text style={styles.title}>Vincular dispositivo</Text>
                <Text style={styles.subtitle}>
                    Escanea el código QR que viene con tu dispositivo Cuentatron
                </Text>

                <View style={styles.scannerPlaceholder}>
                    {!permission ? (
                        <View style={styles.scannerFrame}>
                            <ActivityIndicator size="large" color="#4f46e5" />
                            <Text style={styles.scannerText}>Cargando cámara...</Text>
                        </View>
                    ) : !permission.granted ? (
                        <View style={styles.scannerFrame}>
                            <Ionicons name="camera-outline" size={48} color="#666" />
                            <Text style={styles.scannerText}>Permisos de cámara requeridos</Text>
                            <TouchableOpacity
                                style={styles.permissionButton}
                                onPress={requestPermission}
                            >
                                <Text style={styles.permissionButtonText}>Otorgar permisos</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.scannerFrame}>
                            <ActivityIndicator size="large" color="#4f46e5" />
                            <Text style={styles.scannerText}>Verificando dispositivo...</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.alternativeButton}
                    onPress={() => setStep('manual')}
                >
                    <Text style={styles.alternativeText}>
                        ¿No tienes QR? Ingresa el código manualmente
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Omitir por ahora</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render manual code input step
    const renderManualStep = () => (
        <View style={styles.stepContainer}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('scan')}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
                <Ionicons name="keypad-outline" size={64} color="#4f46e5" />
            </View>

            <Text style={styles.title}>Código del dispositivo</Text>
            <Text style={styles.subtitle}>
                Ingresa el código que viene impreso en tu dispositivo Cuentatron
            </Text>

            <TextInput
                style={styles.codeInput}
                placeholder="Ej: CT-A7F3B2"
                placeholderTextColor="#666"
                autoCapitalize="characters"
                autoCorrect={false}
                value={manualCode}
                onChangeText={setManualCode}
                editable={!loading}
            />

            <TouchableOpacity
                style={[styles.primaryButton, !manualCode.trim() && styles.buttonDisabled]}
                onPress={handleManualSubmit}
                disabled={loading || !manualCode.trim()}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>Verificar código</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    // Render WiFi configuration step
    const renderWifiStep = () => (
        <View style={styles.stepContainer}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('manual')}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
                <Ionicons name="wifi" size={64} color="#22c55e" />
            </View>

            <Text style={styles.title}>Configura la red WiFi</Text>
            <Text style={styles.subtitle}>
                Tu dispositivo {deviceId} se conectará a esta red
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre de red (SSID)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: MiRedWiFi"
                    placeholderTextColor="#666"
                    value={wifiSSID}
                    onChangeText={setWifiSSID}
                    editable={!loading}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Contraseña de WiFi"
                        placeholderTextColor="#666"
                        secureTextEntry={!showPassword}
                        value={wifiPassword}
                        onChangeText={setWifiPassword}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, !wifiSSID.trim() && styles.buttonDisabled]}
                onPress={handleWifiSubmit}
                disabled={loading || !wifiSSID.trim()}
            >
                {loading ? (
                    <>
                        <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryButtonText}>Conectando...</Text>
                    </>
                ) : (
                    <Text style={styles.primaryButtonText}>Conectar dispositivo</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    // Render success step
    const renderSuccessStep = () => (
        <View style={[styles.stepContainer, styles.centered]}>
            <View style={[styles.iconContainer, styles.successIcon]}>
                <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
            </View>

            <Text style={styles.title}>¡Vinculación exitosa!</Text>
            <Text style={styles.subtitle}>
                Tu dispositivo {deviceId} está conectado y comenzará a enviar datos
            </Text>

            <View style={styles.successInfo}>
                <View style={styles.successRow}>
                    <Ionicons name="hardware-chip" size={24} color="#4f46e5" />
                    <Text style={styles.successText}>{deviceId}</Text>
                </View>
                <View style={styles.successRow}>
                    <Ionicons name="wifi" size={24} color="#22c55e" />
                    <Text style={styles.successText}>{wifiSSID}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSuccess}
            >
                <Text style={styles.primaryButtonText}>Ir al Dashboard</Text>
            </TouchableOpacity>
        </View>
    );

    // Render current step
    const renderStep = () => {
        switch (step) {
            case 'scan': return renderScanStep();
            case 'manual': return renderManualStep();
            case 'wifi': return renderWifiStep();
            case 'success': return renderSuccessStep();
        }
    };

    return (
        <View style={styles.container}>
            {renderStep()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
    },
    centered: {
        justifyContent: 'center',
        paddingTop: 0,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        padding: 8,
        zIndex: 10,
    },
    iconContainer: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#252542',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successIcon: {
        backgroundColor: '#22c55e20',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    // Scanner
    scannerPlaceholder: {
        alignItems: 'center',
        marginBottom: 24,
    },
    scannerFrame: {
        width: 250,
        height: 250,
        backgroundColor: '#252542',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#333',
        borderStyle: 'dashed',
    },
    cameraContainer: {
        width: 250,
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    scannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    scannerCornerTopLeft: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderLeftWidth: 3,
        borderTopWidth: 3,
        borderColor: '#4f46e5',
    },
    scannerCornerTopRight: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRightWidth: 3,
        borderTopWidth: 3,
        borderColor: '#4f46e5',
    },
    scannerCornerBottomLeft: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 40,
        height: 40,
        borderLeftWidth: 3,
        borderBottomWidth: 3,
        borderColor: '#4f46e5',
    },
    scannerCornerBottomRight: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRightWidth: 3,
        borderBottomWidth: 3,
        borderColor: '#4f46e5',
    },
    scannerText: {
        color: '#888',
        marginTop: 12,
        textAlign: 'center',
    },
    permissionButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    permissionButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    // Buttons
    alternativeButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    alternativeText: {
        color: '#4f46e5',
        fontSize: 14,
    },
    skipButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    skipText: {
        color: '#666',
        fontSize: 14,
    },
    primaryButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    // Inputs
    codeInput: {
        backgroundColor: '#252542',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#252542',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#fff',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252542',
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#fff',
    },
    passwordToggle: {
        padding: 14,
    },
    // Success
    successInfo: {
        backgroundColor: '#252542',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    successRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    successText: {
        color: '#fff',
        fontSize: 16,
    },
});
