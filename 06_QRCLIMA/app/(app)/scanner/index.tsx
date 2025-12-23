import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getEquipmentByQrCode } from '../../../services/equipment-service';

export default function ScannerScreen() {
    const router = useRouter();
    // mode: 'equipment' (default) or 'service'
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);
    const processingRef = useRef(false);

    // Permission loading state
    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.permissionText}>Cargando cámara...</Text>
            </View>
        );
    }

    // Permission not granted
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionCard}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="camera" size={64} color="#2563EB" />
                    </View>
                    <Text style={styles.permissionTitle}>Acceso a Cámara</Text>
                    <Text style={styles.permissionDescription}>
                        Necesitamos acceso a tu cámara para escanear códigos QR de los equipos.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Permitir Cámara</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
        // Prevent multiple scans
        if (processingRef.current || scanned) return;

        processingRef.current = true;
        setScanned(true);
        setProcessing(true);

        console.log(`Scanned QR: ${data} (Type: ${type})`);

        try {
            // Search for equipment in Firestore
            const equipment = await getEquipmentByQrCode(data);

            if (mode === 'service') {
                // SERVICE MODE: Navigate to new service flow
                if (equipment) {
                    // Equipment exists - navigate to new service with preloaded data
                    router.replace(`/(app)/services/new?equipmentId=${equipment.id}`);
                } else {
                    // Equipment not found - navigate to new service with QR code for inline registration
                    router.replace(`/(app)/services/new?qr_code=${encodeURIComponent(data)}`);
                }
            } else {
                // EQUIPMENT MODE (default): Original behavior
                if (equipment) {
                    // Equipment exists - navigate to detail
                    router.replace(`/(app)/equipment/${equipment.id}`);
                } else {
                    // Equipment not found - ask to register
                    Alert.alert(
                        'Equipo no encontrado',
                        '¿Deseas registrar este equipo?',
                        [
                            {
                                text: 'No',
                                style: 'cancel',
                                onPress: () => {
                                    setScanned(false);
                                    setProcessing(false);
                                    processingRef.current = false;
                                },
                            },
                            {
                                text: 'Sí, Registrar',
                                onPress: () => {
                                    router.replace(`/(app)/equipment/new?qr_code=${encodeURIComponent(data)}`);
                                },
                            },
                        ]
                    );
                }
            }
        } catch (error) {
            console.error('Error processing QR code:', error);
            Alert.alert('Error', 'No se pudo procesar el código QR', [
                {
                    text: 'Reintentar',
                    onPress: () => {
                        setScanned(false);
                        setProcessing(false);
                        processingRef.current = false;
                    },
                },
            ]);
        }
    };

    return (
        <View style={styles.container}>
            {/* Camera View */}
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Top Section */}
                <View style={styles.overlaySection}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Escanear QR</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>

                {/* Middle Section with Frame */}
                <View style={styles.middleRow}>
                    <View style={styles.overlaySection} />
                    <View style={styles.scanFrame}>
                        {/* Corner Decorations */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        {processing && (
                            <View style={styles.processingOverlay}>
                                <ActivityIndicator size="large" color="white" />
                                <Text style={styles.processingText}>Buscando equipo...</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.overlaySection} />
                </View>

                {/* Bottom Section */}
                <View style={styles.overlaySection}>
                    <Text style={styles.instructionText}>
                        Apunta al código QR del equipo
                    </Text>
                    <Text style={styles.subInstructionText}>
                        o apunta a un NUEVO QR para darlo de alta
                    </Text>

                    {scanned && !processing && (
                        <TouchableOpacity
                            style={styles.rescanButton}
                            onPress={() => {
                                setScanned(false);
                                processingRef.current = false;
                            }}
                        >
                            <Ionicons name="refresh" size={20} color="white" />
                            <Text style={styles.rescanText}>Escanear de nuevo</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.helperLinksContainer}>
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/tools/qr-labels')}
                            style={styles.helperLink}
                        >
                            <Text style={styles.helperLinkText}>
                                ¿No tienes QR? Genera uno aquí
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.replace('/(app)/services/new')}
                            style={styles.helperLinkSecondary}
                        >
                            <Text style={styles.helperLinkTextSecondary}>
                                Crear servicio sin QR (no recomendado)
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    overlaySection: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    middleRow: {
        flexDirection: 'row',
    },
    scanFrame: {
        width: 280,
        height: 280,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#2563EB',
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 16,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 16,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 16,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 16,
    },
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    processingText: {
        color: 'white',
        marginTop: 12,
        fontSize: 16,
    },
    instructionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    subInstructionText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginTop: 4,
        marginBottom: 20,
    },
    rescanButton: {
        flexDirection: 'row',
        backgroundColor: '#2563EB',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    rescanText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    helperLinksContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 20,
    },
    helperLink: {
        marginBottom: 15,
        padding: 10,
    },
    helperLinkText: {
        color: '#60A5FA', // Light blue
        textDecorationLine: 'underline',
        fontSize: 14,
        fontWeight: '500',
    },
    helperLinkSecondary: {
        padding: 5,
    },
    helperLinkTextSecondary: {
        color: '#9CA3AF', // Gray 400
        fontSize: 12,
        fontStyle: 'italic',
    },
    permissionCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        margin: 24,
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: '#EFF6FF',
        padding: 20,
        borderRadius: 50,
        marginBottom: 20,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    permissionDescription: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    permissionText: {
        color: '#6B7280',
        marginTop: 16,
    },
    permissionButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        width: '100%',
        marginBottom: 12,
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    cancelButton: {
        paddingVertical: 12,
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
    },
});
