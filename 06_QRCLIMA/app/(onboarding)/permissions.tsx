import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../../context/AuthContext';
import { completeOnboarding, UserRank } from '../../services/user-service';
import { registerForPushNotifications } from '../../services/notification-service';
import { LEGAL_CONTENT } from '../../constants/LegalContent';


export default function PermissionsSetup() {
    const router = useRouter();
    const { user, refreshOnboardingStatus } = useAuth();
    // Recibimos los datos acumulados de los pasos anteriores
    const params = useLocalSearchParams<{
        fullName: string;
        alias: string;
        city: string;
        businessName?: string;
        experienceYears: string; // params llegan como string
    }>();

    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<boolean | null>(null);
    const [legalAccepted, setLegalAccepted] = useState(false);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');

    // Verificar estado inicial de permisos
    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        const cameraStatus = await Camera.getCameraPermissionsAsync();
        setCameraPermission(cameraStatus.granted);

        const locationStatus = await Location.getForegroundPermissionsAsync();
        setLocationPermission(locationStatus.granted);

        const notificationStatus = await Notifications.getPermissionsAsync();
        setNotificationPermission(notificationStatus.granted);
    };

    const requestCamera = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(status === 'granted');
    };

    const requestLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
    };

    const requestNotifications = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationPermission(status === 'granted');

        if (status === 'granted' && user) {
            // Registrar token silenciosamente si se concede el permiso
            registerForPushNotifications(user.uid).catch(console.error);
        }
    };

    const handleContinue = async () => {
        if (!user) return;

        // Validar que al menos lo crítico esté aceptado o que el usuario haya intentado
        // (En MVP permitimos avanzar aunque rechacen, pero idealmente forzamos cámara para QR)

        setLoading(true);
        try {
            const success = await completeOnboarding(user.uid, {
                fullName: params.fullName || '',
                alias: params.alias || '',
                city: params.city || '',
                businessName: params.businessName,
                experienceYears: Number(params.experienceYears) || 0,
            });

            if (success) {
                await refreshOnboardingStatus();
                router.replace('/(app)/');
            } else {
                Alert.alert('Error', 'No se pudo guardar tu configuración.');
            }
        } catch (error) {
            console.error('Error finalizando onboarding:', error);
            Alert.alert('Error', 'Ocurrió un problema técnico.');
        } finally {
            setLoading(false);
        }
    };

    const openLegalModal = (title: string, content: string) => {
        setModalTitle(title);
        setModalContent(content);
        setModalVisible(true);
    };

    const PermissionItem = ({
        icon,
        title,
        description,
        isGranted,
        onPress
    }: {
        icon: keyof typeof Ionicons.glyphMap;
        title: string;
        description: string;
        isGranted: boolean | null;
        onPress: () => void
    }) => (
        <TouchableOpacity
            className={`flex-row items-center bg-white p-4 rounded-xl border mb-4 ${isGranted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
            onPress={isGranted ? undefined : onPress}
            disabled={isGranted === true}
        >
            <View className={`w-12 h-12 rounded-full justify-center items-center mr-4 ${isGranted ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                <Ionicons
                    name={icon}
                    size={24}
                    color={isGranted ? '#16a34a' : '#2563eb'}
                />
            </View>
            <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg mb-1">{title}</Text>
                <Text className="text-gray-500 text-sm leading-4">{description}</Text>
            </View>
            {isGranted ? (
                <Ionicons name="checkmark-circle" size={28} color="#16a34a" />
            ) : (
                <View className="bg-blue-600 px-3 py-1 rounded-lg">
                    <Text className="text-white font-bold text-xs">Activar</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 p-6 pt-16">
                <Text className="text-3xl font-bold text-gray-800 mb-2">
                    Habilitar Poderes
                </Text>
                <Text className="text-gray-500 mb-8 text-lg">
                    Para que QRclima funcione al 100%, necesitamos acceso a estas herramientas de tu celular.
                </Text>

                <PermissionItem
                    icon="qr-code-outline"
                    title="Cámara"
                    description="Necesaria para escanear etiquetas QR y vincular equipos al instante."
                    isGranted={cameraPermission}
                    onPress={requestCamera}
                />

                <PermissionItem
                    icon="location-outline"
                    title="Ubicación"
                    description="Para validar coordenadas en servicios y usar el 'Geolock' de seguridad."
                    isGranted={locationPermission}
                    onPress={requestLocation}
                />

                <PermissionItem
                    icon="notifications-outline"
                    title="Notificaciones"
                    description="Te avisaremos cuando tus clientes necesiten mantenimiento preventivo."
                    isGranted={notificationPermission}
                    onPress={requestNotifications}
                />

                <View className="flex-1 min-h-[40px]" />

                {/* Legal Links & Acceptance */}
                <View className="mb-8 p-4 bg-white rounded-xl border border-gray-200">
                    <Text className="font-bold text-gray-800 mb-2">Legal</Text>

                    <TouchableOpacity
                        className="flex-row items-center mb-3"
                        onPress={() => setLegalAccepted(!legalAccepted)}
                    >
                        <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${legalAccepted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                            {legalAccepted && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-600">
                                Acepto los <Text className="text-blue-600 font-bold" onPress={() => openLegalModal('Términos y Condiciones', LEGAL_CONTENT.TERMS)}>Términos y Condiciones</Text> y el <Text className="text-blue-600 font-bold" onPress={() => openLegalModal('Aviso de Privacidad', LEGAL_CONTENT.PRIVACY)}>Aviso de Privacidad</Text>.
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setDisclaimerAccepted(!disclaimerAccepted)}
                    >
                        <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${disclaimerAccepted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                            {disclaimerAccepted && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-600">
                                Entiendo que QRclima es una herramienta de asistencia y <Text className="font-bold text-blue-600" onPress={() => openLegalModal('Disclaimer Técnico', LEGAL_CONTENT.DISCLAIMER)}>no sustituye mi criterio técnico profesional</Text>.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className={`w-full py-4 rounded-xl flex-row justify-center items-center shadow-lg ${cameraPermission && locationPermission && legalAccepted && disclaimerAccepted
                        ? 'bg-blue-600'
                        : 'bg-gray-400'
                        }`}
                    onPress={handleContinue}
                    disabled={loading || !legalAccepted || !disclaimerAccepted}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="font-bold text-lg text-white mr-2">
                                {cameraPermission && locationPermission ? 'Finalizar Configuración' : 'Continuar (Faltan Permisos)'}
                            </Text>
                            <Ionicons name="rocket-outline" size={24} color="white" />
                        </>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-gray-400 text-xs mt-4 mb-8">
                    Puedes cambiar estos permisos después en la configuración de tu teléfono.
                </Text>
            </ScrollView>

            {/* Legal Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <View className="bg-white rounded-2xl w-full max-h-[80%] overflow-hidden shadow-2xl">
                        <View className="p-4 border-b border-gray-200 flex-row justify-between items-center bg-gray-50">
                            <Text className="text-lg font-bold text-gray-800 flex-1">
                                {modalTitle}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-1">
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="p-4">
                            <Text className="text-gray-600 text-base leading-6 mb-8">
                                {modalContent}
                            </Text>
                        </ScrollView>
                        <View className="p-4 border-t border-gray-200 bg-gray-50">
                            <TouchableOpacity
                                className="bg-blue-600 py-3 rounded-xl items-center"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-white font-bold">Entendido</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
