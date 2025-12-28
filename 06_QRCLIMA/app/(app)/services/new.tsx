import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Switch, Modal } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';
import { getClients, getClientById } from '../../../services/clients-service';
import { searchError, getBrands, getModelsByBrand, BrandData, ModelData } from '../../../services/database-service';
import { addService } from '../../../services/services-service';
import { getUserProfile, isUserPro } from '../../../services/user-service';
import { getEquipmentById, addEquipment, EquipmentData, markEquipmentAsInstalled } from '../../../services/equipment-service';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SignatureModal from '../../../components/SignatureModal';
import { checkWarrantyStatus, validateWarrantyInput } from '../../../services/warranty-validator';

export default function NewService() {
    const router = useRouter();
    const { user } = useAuth();
    const { settings } = useSettings();

    // URL Parameters for QR integration
    const { equipmentId, qr_code, otherTechnician } = useLocalSearchParams<{
        equipmentId?: string;
        qr_code?: string;
        otherTechnician?: string;  // Flag when equipment belongs to another technician
    }>();

    // Steps: 0=QR Registration (if virgin QR), 1=Client, 2=Type, 3=Equipment, 4=Details/Review
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // PRELOADED DATA FROM QR
    const [preloadedEquipment, setPreloadedEquipment] = useState<(EquipmentData & { id: string }) | null>(null);
    const [preloadedClient, setPreloadedClient] = useState<any>(null);
    const [isQrVirgin, setIsQrVirgin] = useState(false);
    const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);

    // OTHER TECHNICIAN QR STATE
    const [showOtherTechModal, setShowOtherTechModal] = useState(false);
    const [isOtherTechEquipment, setIsOtherTechEquipment] = useState(false);

    // DATA STATE
    const [clients, setClients] = useState<any[]>([]);
    const [filteredClients, setFilteredClients] = useState<any[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [brands, setBrands] = useState<BrandData[]>([]);
    const [models, setModels] = useState<ModelData[]>([]);

    // SELECTION STATE
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [serviceType, setServiceType] = useState<'Reparación' | 'Mantenimiento' | 'Instalación' | 'Reinstalación' | null>(null);
    const [equipmentHasInstallation, setEquipmentHasInstallation] = useState(false);

    // Equipment
    const [selectedBrand, setSelectedBrand] = useState<BrandData | null>(null);
    const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);

    // Details
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [checklistData, setChecklistData] = useState<{ [key: string]: boolean }>({});
    const [photos, setPhotos] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(false); // Default to false, will be set based on isPro
    const [isPro, setIsPro] = useState(false); // Track if user is PRO
    const [customReminderMonths, setCustomReminderMonths] = useState(settings.reminderMonths || 6); // Custom reminder time per service
    const [capacityBTU, setCapacityBTU] = useState(''); // BTU capacity

    // Diagnosis (Only for Repair)
    const [errorCode, setErrorCode] = useState('');
    const [possibleErrors, setPossibleErrors] = useState<any[]>([]);
    const [selectedError, setSelectedError] = useState<any>(null);
    const [searchingErrors, setSearchingErrors] = useState(false);

    const [saving, setSaving] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [clientSignature, setClientSignature] = useState<string | null>(null);

    // WARRANTY STATE (PRO)
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [warrantyMonths, setWarrantyMonths] = useState(3); // Default 3 months

    // LOAD PRELOADED DATA FROM QR
    useEffect(() => {
        const loadPreloadedData = async () => {
            setInitialLoading(true);

            if (equipmentId) {
                // Existing equipment - preload data
                try {
                    const equipment = await getEquipmentById(equipmentId);
                    if (equipment) {
                        setPreloadedEquipment(equipment);

                        // Check if equipment belongs to another technician
                        const belongsToOtherTech = equipment.technicianId !== user?.uid;
                        setIsOtherTechEquipment(belongsToOtherTech);

                        if (belongsToOtherTech) {
                            // DO NOT load client from other technician (Firebase permission denied)
                            // Show modal and let technician B select/create their own client
                            setShowOtherTechModal(true);
                            // Skip to step 1 (client selection) - technician needs to select THEIR client
                            setStep(1);
                        } else {
                            // Same technician - OK to load client
                            if (equipment.clientId) {
                                const client = await getClientById(equipment.clientId);
                                if (client) {
                                    setPreloadedClient(client);
                                    setSelectedClient(client);
                                }
                            }
                            // Start from Step 2 (Type selection) since client and equipment are preloaded
                            setStep(2);
                        }

                        // Preload equipment data (always, regardless of owner)
                        setSelectedBrand({
                            name: equipment.brand,
                            displayName: equipment.brand,
                            logo_url: '',
                            model_count: 0
                        });
                        setSelectedModel({
                            id: -1,
                            name: equipment.model,
                            reference_id: 'preloaded',
                            image_url: '',
                            logo_url: '',
                            type: 'Minisplit'
                        });
                        if (equipment.btu) {
                            setCapacityBTU(equipment.btu.toString());
                        }

                        // Check if equipment already has an installation (use installDate or lastServiceDate as indicator)
                        const hasInstall = !!(equipment.installDate || equipment.lastServiceDate);
                        setEquipmentHasInstallation(hasInstall);
                    }
                } catch (error) {
                    console.error('Error loading preloaded equipment:', error);
                }
            } else if (qr_code) {
                // Virgin QR - need to register equipment inline
                setIsQrVirgin(true);
                setQrCodeValue(qr_code);
                setStep(0); // Go to registration step
            }

            setInitialLoading(false);
        };

        loadPreloadedData();
    }, [equipmentId, qr_code, user?.uid]);

    // LOAD INITIAL DATA - Use useFocusEffect to reload clients when returning from add client
    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadClients();
                // Check if user is PRO
                getUserProfile(user.uid).then(profile => {
                    const userIsPro = isUserPro(profile);
                    setIsPro(userIsPro);
                    setReminderEnabled(userIsPro); // Enable reminder by default only for PRO users
                });
            }
            loadBrands();
        }, [user])
    );

    const loadClients = async () => {
        const fetched = await getClients(user!.uid);
        setClients(fetched);
        setFilteredClients(fetched);
    };

    const loadBrands = async () => {
        const fetchedBrands = await getBrands();
        setBrands(fetchedBrands);
    };

    // SEARCH CLIENTS
    useEffect(() => {
        if (clientSearch === '') {
            setFilteredClients(clients);
        } else {
            const searchLower = clientSearch.toLowerCase();
            setFilteredClients(clients.filter(c =>
                c.name.toLowerCase().includes(searchLower) ||
                (c.address && c.address.toLowerCase().includes(searchLower)) ||
                (c.phone && c.phone.toLowerCase().includes(searchLower))
            ));
        }
    }, [clientSearch, clients]);

    // LOAD MODELS WHEN BRAND SELECTED
    useEffect(() => {
        if (selectedBrand) {
            setLoading(true);
            getModelsByBrand(selectedBrand.logo_url).then(m => {
                setModels(m);
                setLoading(false);
            });
        }
    }, [selectedBrand]);

    // SEARCH ERRORS LIVE
    useEffect(() => {
        if (errorCode.length > 1) {
            setSearchingErrors(true);
            const timer = setTimeout(async () => {
                const results = await searchError(errorCode);
                setPossibleErrors(results);
                setSearchingErrors(false);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setPossibleErrors([]);
        }
    }, [errorCode]);

    // HANDLERS
    const toggleTask = (task: string) => {
        if (selectedTasks.includes(task)) {
            setSelectedTasks(selectedTasks.filter(t => t !== task));
        } else {
            setSelectedTasks([...selectedTasks, task]);
        }
    };

    const toggleChecklist = (item: string) => {
        setChecklistData(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const pickImage = async () => {
        // Show options to choose camera or gallery
        Alert.alert(
            'Agregar Evidencia',
            '¿Cómo deseas agregar la foto?',
            [
                {
                    text: 'Tomar Foto',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar fotos.');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: false, // Full image, no cropping
                            quality: 0.5, // Reduced quality for initial capture to prevent OOM
                        });
                        if (!result.canceled) {
                            await addPhotoFromResult(result);
                        }
                    }
                },
                {
                    text: 'Elegir de Galería',
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: false, // Full image, no cropping
                            quality: 0.5, // Reduced quality for initial selection
                        });
                        if (!result.canceled) {
                            await addPhotoFromResult(result);
                        }
                    }
                },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    const addPhotoFromResult = async (result: ImagePicker.ImagePickerResult) => {
        if (result.canceled) return;
        try {
            // Compress image before adding
            const { compressServicePhoto } = await import('../../../services/image-service');
            const compressed = await compressServicePhoto(result.assets[0].uri);
            setPhotos([...photos, compressed.uri]);

            if (compressed.compressionRatio) {
                console.log(`Photo compressed: ${compressed.compressionRatio}% reduction`);
            }
        } catch (e) {
            // Fallback to original if compression fails
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const handleSave = async (signature?: string) => {
        if (!selectedClient || !serviceType || !selectedBrand || !selectedModel) return;

        try {
            setSaving(true);

            // Upload photos if any
            let uploadedPhotos: string[] = [];
            if (photos.length > 0) {
                const { uploadServicePhotos } = await import('../../../services/image-service');
                try {
                    uploadedPhotos = await uploadServicePhotos(photos);
                } catch (error) {
                    console.error('Error uploading photos:', error);
                    Alert.alert('Advertencia', 'No se pudieron subir algunas fotos. Se guardará el servicio sin ellas.');
                }
            }

            // Calculate next service date using custom reminder time selected by user
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + customReminderMonths);

            // Prepare payload to avoid undefined values which Firebase rejects
            const servicePayload: any = {
                clientId: selectedClient.id,
                technicianId: user?.uid || '',
                type: serviceType,
                status: 'Terminado',
                date: new Date(),
                equipment: {
                    brand: selectedBrand.name,
                    model: selectedModel.name,
                    type: selectedModel.type,
                    capacityBTU: capacityBTU || '', // Save capacity
                },
                tasks: selectedTasks,
                checklist: checklistData,
                photos: uploadedPhotos, // Use uploaded URLs
                notes: notes,
                nextServiceDate: reminderEnabled ? nextDate : null,
                reminderEnabled: reminderEnabled,
                cost: 0, // Placeholder
                clientSignature: signature || null,
                warrantyMonths: warrantyMonths, // Save warranty duration
            };

            // Only add diagnosis if it exists (repair only)
            if (serviceType === 'Reparación' && errorCode) {
                servicePayload.diagnosis = {
                    errorCode: 'MANUAL',
                    description: errorCode, // Using errorCode state for description text
                    cause: ''
                };
            }

            await addService(servicePayload);

            // Mark equipment as installed if this is an Installation or Reinstalación service
            if ((serviceType === 'Instalación' || serviceType === 'Reinstalación') && preloadedEquipment?.id) {
                await markEquipmentAsInstalled(preloadedEquipment.id);
            }

            Alert.alert('Éxito', 'Servicio registrado correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar el servicio');
            console.error(error);
        } finally {
            setSaving(false);
            setShowSignatureModal(false);
        }
    };

    const handleFinishService = () => {
        // Validate fields
        if (!selectedClient || !serviceType || !selectedBrand || !selectedModel) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos (Cliente, Tipo, Equipo)');
            return;
        }

        // Intercept with Warranty Modal if PRO (or generally if we want to capture warranty)
        // Design doc implies explicit step for PRO.
        setChecklistData(prev => ({ ...prev })); // Force update if needed

        // Show Warranty Input first
        setShowWarrantyModal(true);
    };

    const confirmWarranty = () => {
        setShowWarrantyModal(false);
        setShowSignatureModal(true);
    };

    const onSignatureConfirmed = (signature: string) => {
        setClientSignature(signature);
        handleSave(signature);
    };

    // RENDER HELPERS
    const renderHeader = () => (
        <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-800">Nuevo Servicio</Text>

            {/* Preloaded Equipment Banner */}
            {preloadedEquipment && (
                <View className={`${isOtherTechEquipment ? 'bg-amber-100 border-amber-200' : 'bg-purple-100 border-purple-200'} border rounded-xl p-3 mt-3 flex-row items-center`}>
                    <View className={`${isOtherTechEquipment ? 'bg-amber-500' : 'bg-purple-500'} p-2 rounded-full mr-3`}>
                        <Ionicons name="qr-code" size={16} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className={`${isOtherTechEquipment ? 'text-amber-800' : 'text-purple-800'} font-bold text-sm`}>
                            {preloadedEquipment.brand} {preloadedEquipment.model}
                        </Text>
                        <Text className={`${isOtherTechEquipment ? 'text-amber-600' : 'text-purple-600'} text-xs`}>
                            {isOtherTechEquipment
                                ? (selectedClient?.name ? `Cliente: ${selectedClient.name}` : 'Selecciona un cliente de tu cartera')
                                : `Cliente: ${preloadedClient?.name || 'Cargando...'}`}
                        </Text>
                    </View>
                    <Ionicons
                        name={isOtherTechEquipment && !selectedClient ? "alert-circle" : "checkmark-circle"}
                        size={20}
                        color={isOtherTechEquipment ? "#D97706" : "#7C3AED"}
                    />
                </View>
            )}

            {/* Progress Bar */}
            <View className="flex-row mt-4 mb-2">
                {(isQrVirgin ? [0, 1, 2, 3, 4] : [1, 2, 3, 4]).map(i => (
                    <View key={i} className={`h-2 flex-1 rounded-full mx-1 ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
            </View>
            <Text className="text-center text-gray-500 text-sm">
                {step === 0 ? 'Registrar Equipo' :
                    step === 1 ? 'Seleccionar Cliente' :
                        step === 2 ? 'Tipo de Servicio' :
                            step === 3 ? 'Equipo' : 'Detalles del Trabajo'}
            </Text>
        </View>
    );

    // STEP 0: INLINE EQUIPMENT REGISTRATION (Virgin QR)
    const [inlineEquipmentData, setInlineEquipmentData] = useState({
        brand: '',
        model: '',
        btu: '',
        location: ''
    });
    const [savingEquipment, setSavingEquipment] = useState(false);

    const handleSaveInlineEquipment = async () => {
        if (!selectedClient) {
            Alert.alert('Error', 'Selecciona un cliente primero');
            return;
        }
        if (!inlineEquipmentData.brand.trim()) {
            Alert.alert('Error', 'Ingresa la marca del equipo');
            return;
        }
        if (!inlineEquipmentData.model.trim()) {
            Alert.alert('Error', 'Ingresa el modelo del equipo');
            return;
        }

        try {
            setSavingEquipment(true);

            const { id: equipmentIdNew, token } = await addEquipment({
                qrCode: qrCodeValue || undefined,
                clientId: selectedClient.id,
                brand: inlineEquipmentData.brand.trim(),
                model: inlineEquipmentData.model.trim(),
                btu: inlineEquipmentData.btu ? parseInt(inlineEquipmentData.btu, 10) : undefined,
                location: inlineEquipmentData.location.trim() || undefined,
                technicianId: user!.uid,
            });

            // Set preloaded data
            setPreloadedEquipment({
                id: equipmentIdNew,
                token,
                clientId: selectedClient.id,
                brand: inlineEquipmentData.brand.trim(),
                model: inlineEquipmentData.model.trim(),
                btu: inlineEquipmentData.btu ? parseInt(inlineEquipmentData.btu, 10) : undefined,
                technicianId: user!.uid,
            });
            setPreloadedClient(selectedClient);

            // Set selected brand/model
            setSelectedBrand({
                name: inlineEquipmentData.brand.trim().toUpperCase(),
                displayName: inlineEquipmentData.brand.trim(),
                logo_url: '',
                model_count: 0
            });
            setSelectedModel({
                id: -1,
                name: inlineEquipmentData.model.trim(),
                reference_id: 'inline',
                image_url: '',
                logo_url: '',
                type: 'Minisplit'
            });
            if (inlineEquipmentData.btu) {
                setCapacityBTU(inlineEquipmentData.btu);
            }

            Alert.alert(
                '¡Equipo Registrado!',
                `Token QR: ${token.toUpperCase()}`,
                [{ text: 'Continuar', onPress: () => setStep(2) }]
            );
        } catch (error) {
            console.error('Error saving equipment:', error);
            Alert.alert('Error', 'No se pudo guardar el equipo');
        } finally {
            setSavingEquipment(false);
        }
    };

    // State for Step 0 improvements
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [showBrandPicker, setShowBrandPicker] = useState(false);
    const [showCustomBrandInput, setShowCustomBrandInput] = useState(false);
    const [showCustomBtu, setShowCustomBtu] = useState(false);
    const [showCustomLocation, setShowCustomLocation] = useState(false);

    // Brand logos mapping (same as in renderStep3)
    const BRAND_LOGOS_STEP0: { [key: string]: any } = {
        'MIRAGE': require('../../../data_mining/downloaded_assets/logos/Mirage-Logo.png'),
        'YORK': require('../../../data_mining/downloaded_assets/logos/york_logo.png'),
        'LG': require('../../../data_mining/downloaded_assets/logos/logo_lg.png'),
        'CARRIER': require('../../../data_mining/downloaded_assets/logos/carrier_logo.png'),
    };

    // Location presets
    const LOCATION_PRESETS = ['Recámara Principal', 'Recámara Secundaria', 'Sala', 'Oficina', 'Otro'];

    // BTU presets
    const BTU_PRESETS = ['12,000', '18,000', '24,000', '36,000', 'Otro'];

    // Filter clients by search query (name, phone, address)
    const filteredClientsStep0 = clientSearchQuery
        ? clients.filter(c => {
            const query = clientSearchQuery.toLowerCase();
            return (
                c.name?.toLowerCase().includes(query) ||
                c.phone?.toLowerCase().includes(query) ||
                c.address?.toLowerCase().includes(query)
            );
        })
        : clients;

    const renderStep0 = () => (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* QR Code Badge */}
            <View className="bg-purple-100 border border-purple-200 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center">
                    <View className="bg-purple-500 p-2 rounded-full mr-3">
                        <Ionicons name="qr-code" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-purple-800 font-bold">Código QR Nuevo</Text>
                        <Text className="text-purple-600 text-sm" numberOfLines={1}>
                            {qrCodeValue || 'No disponible'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* ===== CLIENT SELECTOR WITH SEARCH ===== */}
            <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Cliente *</Text>
            <TouchableOpacity
                onPress={() => setShowClientPicker(!showClientPicker)}
                className="bg-white border border-gray-200 rounded-xl p-4 mb-2 flex-row justify-between items-center"
            >
                {selectedClient ? (
                    <View className="flex-row items-center flex-1">
                        <View className="bg-green-100 p-2 rounded-full mr-3">
                            <Ionicons name="person" size={16} color="#16A34A" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-800 font-medium">{selectedClient.name}</Text>
                            {selectedClient.phone && (
                                <Text className="text-gray-400 text-xs">{selectedClient.phone}</Text>
                            )}
                        </View>
                    </View>
                ) : (
                    <Text className="text-gray-400">Seleccionar cliente...</Text>
                )}
                <Ionicons name={showClientPicker ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Client Picker Dropdown */}
            {showClientPicker && (
                <View className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden">
                    {/* Search Bar */}
                    <View className="p-3 border-b border-gray-100 flex-row items-center">
                        <Ionicons name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2 text-gray-800"
                            placeholder="Buscar por nombre, teléfono o dirección..."
                            placeholderTextColor="#9CA3AF"
                            value={clientSearchQuery}
                            onChangeText={setClientSearchQuery}
                            autoFocus
                        />
                        {clientSearchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setClientSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Client List */}
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                        {filteredClientsStep0.length === 0 ? (
                            <View className="p-4 items-center">
                                <Text className="text-gray-400 mb-2">
                                    {clientSearchQuery ? 'No se encontraron resultados' : 'No hay clientes'}
                                </Text>
                            </View>
                        ) : (
                            filteredClientsStep0.map((client) => (
                                <TouchableOpacity
                                    key={client.id}
                                    onPress={() => {
                                        setSelectedClient(client);
                                        setShowClientPicker(false);
                                        setClientSearchQuery('');
                                    }}
                                    className={`p-4 border-b border-gray-50 flex-row items-center ${selectedClient?.id === client.id ? 'bg-blue-50' : ''}`}
                                >
                                    <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                                        <Text className="text-blue-600 font-bold">{client.name?.charAt(0)?.toUpperCase()}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-medium">{client.name}</Text>
                                        {client.phone && <Text className="text-gray-400 text-xs">📞 {client.phone}</Text>}
                                        {client.address && <Text className="text-gray-400 text-xs" numberOfLines={1}>📍 {client.address}</Text>}
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    {/* Add New Client Button */}
                    <TouchableOpacity
                        onPress={() => {
                            setShowClientPicker(false);
                            router.push('/(app)/clients/add');
                        }}
                        className="p-4 border-t border-gray-200 flex-row items-center justify-center bg-gray-50"
                    >
                        <Ionicons name="add-circle" size={20} color="#2563EB" />
                        <Text className="text-blue-600 font-bold ml-2">Crear Nuevo Cliente</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!showClientPicker && <View className="mb-2" />}

            {/* ===== BRAND SELECTOR WITH LOGOS ===== */}
            <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Marca *</Text>
            {!showBrandPicker && !showCustomBrandInput ? (
                <TouchableOpacity
                    onPress={() => setShowBrandPicker(true)}
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex-row justify-between items-center"
                >
                    {inlineEquipmentData.brand ? (
                        <View className="flex-row items-center">
                            {BRAND_LOGOS_STEP0[inlineEquipmentData.brand.toUpperCase()] ? (
                                <Image
                                    source={BRAND_LOGOS_STEP0[inlineEquipmentData.brand.toUpperCase()]}
                                    className="w-8 h-8 mr-3"
                                    resizeMode="contain"
                                />
                            ) : (
                                <View className="bg-gray-100 w-8 h-8 rounded-lg items-center justify-center mr-3">
                                    <Ionicons name="cube" size={16} color="#9CA3AF" />
                                </View>
                            )}
                            <Text className="text-gray-800 font-medium">{inlineEquipmentData.brand}</Text>
                        </View>
                    ) : (
                        <Text className="text-gray-400">Seleccionar marca...</Text>
                    )}
                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            ) : showBrandPicker ? (
                <View className="mb-4">
                    <View className="flex-row flex-wrap">
                        {brands.map((brand) => (
                            <TouchableOpacity
                                key={brand.name}
                                onPress={() => {
                                    setInlineEquipmentData(prev => ({ ...prev, brand: brand.name }));
                                    setShowBrandPicker(false);
                                }}
                                className="w-1/3 p-2"
                            >
                                <View className={`bg-white rounded-xl p-3 items-center border ${inlineEquipmentData.brand === brand.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                    {BRAND_LOGOS_STEP0[brand.name] ? (
                                        <Image
                                            source={BRAND_LOGOS_STEP0[brand.name]}
                                            className="w-12 h-12"
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center">
                                            <Ionicons name="cube" size={24} color="#9CA3AF" />
                                        </View>
                                    )}
                                    <Text className="text-xs text-gray-600 mt-1 text-center" numberOfLines={1}>{brand.displayName || brand.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {/* Other Brand Option */}
                        <TouchableOpacity
                            onPress={() => {
                                setShowBrandPicker(false);
                                setShowCustomBrandInput(true);
                            }}
                            className="w-1/3 p-2"
                        >
                            <View className="bg-gray-100 rounded-xl p-3 items-center border-2 border-dashed border-gray-300">
                                <View className="w-12 h-12 items-center justify-center">
                                    <Ionicons name="add-circle-outline" size={28} color="#6B7280" />
                                </View>
                                <Text className="text-xs text-gray-600 mt-1">Otra</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setShowBrandPicker(false)} className="mt-2 p-2 items-center">
                        <Text className="text-gray-400 text-sm">Cancelar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="mb-4">
                    <TextInput
                        value={inlineEquipmentData.brand}
                        onChangeText={(text) => setInlineEquipmentData(prev => ({ ...prev, brand: text }))}
                        placeholder="Escribe el nombre de la marca..."
                        placeholderTextColor="#9CA3AF"
                        className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                        autoFocus
                    />
                    <TouchableOpacity onPress={() => setShowCustomBrandInput(false)} className="mt-2 p-2 items-center">
                        <Text className="text-blue-600 text-sm">Ver marcas disponibles</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Model - Text Input (already good) */}
            <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Modelo *</Text>
            <TextInput
                value={inlineEquipmentData.model}
                onChangeText={(text) => setInlineEquipmentData(prev => ({ ...prev, model: text }))}
                placeholder="Ej: XPower Inverter, Magnum 19..."
                placeholderTextColor="#9CA3AF"
                className="bg-white border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
            />

            {/* ===== BTU CAPACITY WITH QUICK SELECTS ===== */}
            <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Capacidad (BTU)</Text>
            <View className="flex-row flex-wrap mb-2">
                {BTU_PRESETS.map((btu) => (
                    <TouchableOpacity
                        key={btu}
                        onPress={() => {
                            if (btu === 'Otro') {
                                setShowCustomBtu(true);
                                setInlineEquipmentData(prev => ({ ...prev, btu: '' }));
                            } else {
                                setShowCustomBtu(false);
                                setInlineEquipmentData(prev => ({ ...prev, btu: btu.replace(',', '') }));
                            }
                        }}
                        className={`px-4 py-2 rounded-full mr-2 mb-2 border ${(btu !== 'Otro' && inlineEquipmentData.btu === btu.replace(',', '')) ||
                            (btu === 'Otro' && showCustomBtu)
                            ? 'bg-green-600 border-green-600'
                            : 'bg-white border-gray-300'
                            }`}
                    >
                        <Text className={
                            (btu !== 'Otro' && inlineEquipmentData.btu === btu.replace(',', '')) ||
                                (btu === 'Otro' && showCustomBtu)
                                ? 'text-white font-medium'
                                : 'text-gray-600'
                        }>
                            {btu}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* Custom BTU Input - show when "Otro" is selected */}
            {showCustomBtu && (
                <TextInput
                    value={inlineEquipmentData.btu}
                    onChangeText={(text) => setInlineEquipmentData(prev => ({ ...prev, btu: text }))}
                    placeholder="Escribe la capacidad en BTU..."
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    autoFocus
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                />
            )}
            {!showCustomBtu && <View className="mb-2" />}

            {/* ===== LOCATION WITH PRESETS ===== */}
            <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Ubicación</Text>
            <View className="flex-row flex-wrap mb-2">
                {LOCATION_PRESETS.map((loc) => (
                    <TouchableOpacity
                        key={loc}
                        onPress={() => {
                            if (loc === 'Otro') {
                                setShowCustomLocation(true);
                                setInlineEquipmentData(prev => ({ ...prev, location: '' }));
                            } else {
                                setShowCustomLocation(false);
                                setInlineEquipmentData(prev => ({ ...prev, location: loc }));
                            }
                        }}
                        className={`px-3 py-2 rounded-full mr-2 mb-2 border ${(loc !== 'Otro' && inlineEquipmentData.location === loc) ||
                            (loc === 'Otro' && showCustomLocation)
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                            }`}
                    >
                        <Text className={
                            (loc !== 'Otro' && inlineEquipmentData.location === loc) ||
                                (loc === 'Otro' && showCustomLocation)
                                ? 'text-white font-medium'
                                : 'text-gray-600'
                        }>
                            {loc}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* Custom Location Input */}
            {showCustomLocation && (
                <TextInput
                    value={inlineEquipmentData.location}
                    onChangeText={(text) => setInlineEquipmentData(prev => ({ ...prev, location: text }))}
                    placeholder="Escribe la ubicación..."
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                />
            )}
            <View className="mb-4" />

            {/* Save Button */}
            <TouchableOpacity
                onPress={handleSaveInlineEquipment}
                disabled={savingEquipment}
                className={`bg-blue-600 flex-row items-center justify-center p-4 rounded-2xl shadow-lg mb-4 ${savingEquipment ? 'opacity-70' : ''}`}
            >
                {savingEquipment ? (
                    <>
                        <ActivityIndicator color="white" size="small" />
                        <Text className="text-white font-bold text-lg ml-3">Guardando...</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="save" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-3">Registrar y Continuar</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} className="p-4 items-center mb-8">
                <Text className="text-gray-400">Cancelar</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // STEP 1: CLIENT
    const renderStep1 = () => (
        <View className="flex-1">
            <View className="bg-white p-3 rounded-xl border border-gray-200 mb-4 flex-row items-center">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    className="flex-1 ml-2 text-base text-gray-800"
                    placeholder="Buscar cliente por nombre..."
                    value={clientSearch}
                    onChangeText={setClientSearch}
                />
            </View>





            <FlatList
                data={filteredClients}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => { setSelectedClient(item); setStep(2); }}
                        className="bg-white p-4 rounded-xl mb-3 border border-gray-100 flex-row items-center shadow-sm"
                    >
                        <View className="bg-blue-100 rounded-full p-2 mr-3">
                            <Ionicons name="person" size={20} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800">{item.name}</Text>
                            <Text className="text-gray-500 text-xs">{item.address || 'Sin dirección'}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No se encontraron clientes.</Text>}
            />

            <TouchableOpacity
                onPress={() => router.push('/(app)/clients/add')}
                className="bg-blue-600 p-4 rounded-xl items-center mt-4 mb-8"
            >
                <Text className="text-white font-bold">+ Crear Nuevo Cliente</Text>
            </TouchableOpacity>
        </View >
    );

    // STEP 2: TYPE
    const renderStep2 = () => (
        <View className="flex-1">
            {/* Show preloaded equipment info banner */}
            {preloadedEquipment && (
                <View className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
                    <Text className="text-purple-700 font-medium ml-2 flex-1">
                        Equipo: {preloadedEquipment.brand} {preloadedEquipment.model}
                    </Text>
                </View>
            )}

            {/* Service Types - Show Reinstalación instead of Instalación if equipment has prior installation */}
            {(() => {
                const serviceTypes = equipmentHasInstallation
                    ? ['Reinstalación', 'Mantenimiento', 'Reparación']
                    : ['Instalación', 'Mantenimiento', 'Reparación'];

                return serviceTypes.map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => {
                            setServiceType(type as any);
                            // Pre-select tasks based on service type
                            if (type === 'Instalación') {
                                setSelectedTasks(['Instalación Básica']);
                            } else if (type === 'Reinstalación') {
                                setSelectedTasks(['Desinstalación', 'Instalación Básica']);
                            } else {
                                setSelectedTasks([]);
                            }
                            // If equipment is preloaded, skip step 3 and go directly to step 4
                            if (preloadedEquipment) {
                                setStep(4);
                            } else {
                                setStep(3);
                            }
                        }}
                        className="bg-white p-6 rounded-xl mb-4 border border-gray-100 shadow-sm flex-row items-center"
                    >
                        <View className={`p-4 rounded-full mr-5 ${type === 'Reparación' ? 'bg-red-100' :
                            type === 'Mantenimiento' ? 'bg-yellow-100' :
                                type === 'Reinstalación' ? 'bg-orange-100' : 'bg-green-100'
                            }`}>
                            <Ionicons
                                name={
                                    type === 'Reparación' ? 'construct' :
                                        type === 'Mantenimiento' ? 'water' :
                                            type === 'Reinstalación' ? 'swap-horizontal' : 'hammer'
                                }
                                size={28}
                                color={
                                    type === 'Reparación' ? '#EF4444' :
                                        type === 'Mantenimiento' ? '#F59E0B' :
                                            type === 'Reinstalación' ? '#F97316' : '#10B981'
                                }
                            />
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-gray-800">{type}</Text>
                            <Text className="text-gray-500 text-sm">
                                {type === 'Instalación' ? 'Equipos nuevos' :
                                    type === 'Reinstalación' ? 'Cambio de ubicación' :
                                        type === 'Mantenimiento' ? 'Preventivo y limpieza' : 'Fallas y correctivos'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ));
            })()}

            {/* Only show "Volver" if NOT coming from QR flow (no preloaded equipment) */}
            {!preloadedEquipment && (
                <TouchableOpacity onPress={() => setStep(1)} className="mt-8 items-center">
                    <Text className="text-gray-500 font-medium">Volver</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Brand logos mapping (local assets)
    const BRAND_LOGOS: { [key: string]: any } = {
        'MIRAGE': require('../../../data_mining/downloaded_assets/logos/Mirage-Logo.png'),
        'YORK': require('../../../data_mining/downloaded_assets/logos/york_logo.png'),
        'LG': require('../../../data_mining/downloaded_assets/logos/logo_lg.png'),
        'CARRIER': require('../../../data_mining/downloaded_assets/logos/carrier_logo.png'),
    };

    // State for custom brand
    const [customBrandName, setCustomBrandName] = useState('');
    const [customModelName, setCustomModelName] = useState('');
    const [showCustomBrandModal, setShowCustomBrandModal] = useState(false);

    const handleSelectOtherBrand = () => {
        setShowCustomBrandModal(true);
    };

    const handleConfirmCustomBrand = () => {
        if (!customBrandName.trim() || !customModelName.trim()) {
            Alert.alert('Error', 'Ingresa la marca y el modelo');
            return;
        }
        // Create a custom brand and model
        const customBrand: BrandData = {
            name: customBrandName.trim().toUpperCase(),
            displayName: customBrandName.trim(),
            logo_url: '',
            model_count: 0
        };
        const customModel: ModelData = {
            id: -1, // Custom ID
            name: customModelName.trim(),
            reference_id: 'custom',
            image_url: '',
            logo_url: '',
            type: 'Minisplit'
        };
        setSelectedBrand(customBrand);
        setSelectedModel(customModel);
        setShowCustomBrandModal(false);
        setStep(4);
    };

    // STEP 3: EQUIPMENT
    const renderStep3 = () => (
        <View className="flex-1">
            {!selectedBrand ? (
                <>
                    <Text className="text-lg font-bold text-gray-800 mb-4">Selecciona la Marca</Text>
                    {loading ? <ActivityIndicator size="large" color="#2563EB" /> : (
                        <>
                            <FlatList
                                data={brands}
                                keyExtractor={item => item.name}
                                numColumns={2}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => setSelectedBrand(item)}
                                        className="flex-1 m-2 bg-white p-4 rounded-xl border border-gray-100 items-center justify-center shadow-sm"
                                        style={{ minHeight: 100 }}
                                    >
                                        {BRAND_LOGOS[item.name] ? (
                                            <Image
                                                source={BRAND_LOGOS[item.name]}
                                                className="w-16 h-16"
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <Ionicons name="cube" size={32} color="#CBD5E1" />
                                        )}
                                        <Text className="text-sm text-center mt-2 text-gray-700 font-medium">{item.displayName}</Text>
                                    </TouchableOpacity>
                                )}
                                ListFooterComponent={
                                    <TouchableOpacity
                                        onPress={handleSelectOtherBrand}
                                        className="m-2 bg-gray-100 p-4 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center"
                                        style={{ minHeight: 100 }}
                                    >
                                        <Ionicons name="add-circle-outline" size={32} color="#6B7280" />
                                        <Text className="text-sm text-center mt-2 text-gray-600 font-medium">Otra Marca</Text>
                                        <Text className="text-xs text-gray-400">Marca no listada</Text>
                                    </TouchableOpacity>
                                }
                            />
                        </>
                    )}

                    {/* Custom Brand Modal */}
                    {showCustomBrandModal && (
                        <View className="absolute inset-0 bg-black/50 items-center justify-center" style={{ zIndex: 1000 }}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                className="w-80"
                            >
                                <ScrollView
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                                >
                                    <View className="bg-white rounded-2xl p-6">
                                        <Text className="text-lg font-bold text-gray-800 mb-4">Marca Personalizada</Text>

                                        <Text className="text-sm text-gray-600 mb-2">Nombre de la Marca</Text>
                                        <TextInput
                                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4"
                                            placeholder="Ej. Samsung, Hisense..."
                                            value={customBrandName}
                                            onChangeText={setCustomBrandName}
                                        />

                                        <Text className="text-sm text-gray-600 mb-2">Modelo del Equipo</Text>
                                        <TextInput
                                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4"
                                            placeholder="Ej. AR12TXCA..."
                                            value={customModelName}
                                            onChangeText={setCustomModelName}
                                        />

                                        <View className="flex-row">
                                            <TouchableOpacity
                                                onPress={() => setShowCustomBrandModal(false)}
                                                className="flex-1 py-3 mr-2 rounded-xl border border-gray-300"
                                            >
                                                <Text className="text-center text-gray-600 font-medium">Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={handleConfirmCustomBrand}
                                                className="flex-1 py-3 bg-blue-600 rounded-xl"
                                            >
                                                <Text className="text-center text-white font-bold">Confirmar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </View>
                    )}
                </>
            ) : (
                <>
                    <View className="flex-row items-center mb-4">
                        <TouchableOpacity onPress={() => setSelectedBrand(null)} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-800">{selectedBrand.displayName || selectedBrand.name}</Text>
                    </View>

                    {/* Manual Model Input */}
                    <ScrollView
                        className="flex-1"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Modelo del Equipo *</Text>
                            <TextInput
                                className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4"
                                placeholder="Ej. Magnum 19, XPower Ultra, etc."
                                value={customModelName}
                                onChangeText={setCustomModelName}
                            />

                            <Text className="text-sm font-medium text-gray-700 mb-2">Tipo de Equipo</Text>
                            <View className="flex-row flex-wrap mb-4">
                                {['Minisplit', 'Cassette', 'Piso Techo', 'VRF', 'Chiller', 'Otro'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setSelectedModel({
                                            id: -1,
                                            name: customModelName || 'Sin especificar',
                                            reference_id: 'manual',
                                            image_url: '',
                                            logo_url: '',
                                            type: type
                                        })}
                                        className={`px-3 py-2 rounded-full mr-2 mb-2 border ${selectedModel?.type === type
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text className={selectedModel?.type === type ? 'text-white font-medium' : 'text-gray-600'}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-sm font-medium text-gray-700 mb-2">Capacidad (BTU)</Text>
                            <View className="flex-row flex-wrap mb-2">
                                {['12,000', '18,000', '24,000', '36,000', '48,000', '60,000'].map(btu => (
                                    <TouchableOpacity
                                        key={btu}
                                        onPress={() => setCapacityBTU(btu)}
                                        className={`px-3 py-2 rounded-full mr-2 mb-2 border ${capacityBTU === btu
                                            ? 'bg-green-600 border-green-600'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text className={capacityBTU === btu ? 'text-white font-medium' : 'text-gray-600'}>
                                            {btu}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                className="bg-gray-50 p-3 rounded-xl border border-gray-200"
                                placeholder="O escribe otra capacidad..."
                                value={capacityBTU}
                                onChangeText={setCapacityBTU}
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                if (!customModelName.trim()) {
                                    Alert.alert('Error', 'Ingresa el modelo del equipo');
                                    return;
                                }
                                const finalModel: ModelData = {
                                    id: -1,
                                    name: customModelName.trim(),
                                    reference_id: 'manual',
                                    image_url: '',
                                    logo_url: '',
                                    type: selectedModel?.type || 'Minisplit'
                                };
                                setSelectedModel(finalModel);
                                setStep(4);
                            }}
                            className="bg-blue-600 p-4 rounded-xl items-center shadow-lg mb-4"
                        >
                            <Text className="text-white font-bold text-lg">Continuar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setStep(2)} className="px-4 py-3 items-center mb-20">
                            <Text className="text-gray-400">Volver a Tipos</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </>
            )}
            {!selectedBrand && (
                <TouchableOpacity onPress={() => setStep(2)} className="mt-4 px-4 py-3 items-center mb-20">
                    <Text className="text-gray-400">Volver a Tipos</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // STEP 4: DETAILS
    const renderStep4 = () => {
        const installTasks = ['Instalación Básica', 'Vacío', 'Base Piso', 'Base Pared', 'Bomba de Condensados', 'Instalación Eléctrica', 'Otros'];
        const reinstallTasks = ['Desinstalación', 'Instalación Básica', 'Vacío', 'Base Piso', 'Base Pared', 'Bomba de Condensados', 'Instalación Eléctrica', 'Otros'];
        const maintTasks = ['Limpieza Evaporador', 'Limpieza Condensador', 'Limpieza Drenaje', 'Revisión Gas', 'Revisión Eléctrica'];
        const repairTasks = ['Diagnóstico', 'Carga de Gas', 'Cambio Capacitor', 'Soldadura', 'Cambio Tarjeta', 'Cambio Sensor', 'Reparación', 'Otros'];

        const currentTasks = serviceType === 'Instalación' ? installTasks :
            serviceType === 'Reinstalación' ? reinstallTasks :
                serviceType === 'Mantenimiento' ? maintTasks : repairTasks;

        const installChecklist = ['Vacío realizado (Micras)', 'Torque aplicado', 'Protección eléctrica', 'Prueba operación'];
        const reinstallChecklist = ['Equipo anterior retirado', 'Vacío realizado (Micras)', 'Torque aplicado', 'Protección eléctrica', 'Prueba operación'];
        const maintChecklist = ['Filtros limpios', 'Drenaje fluido', 'Presiones correctas', 'Consumo (Amperes) OK'];
        const repairChecklist = ['Falla identificada', 'Refacción nueva', 'Prueba funcionamiento'];

        const currentChecklist = serviceType === 'Instalación' ? installChecklist :
            serviceType === 'Reinstalación' ? reinstallChecklist :
                serviceType === 'Mantenimiento' ? maintChecklist : repairChecklist;

        return (
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* INFO CARD */}
                <View className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                    <Text className="font-bold text-blue-900 text-lg">{selectedClient?.name}</Text>
                    <Text className="text-blue-700">{serviceType} • {selectedBrand?.name} {selectedModel?.name}</Text>
                </View>

                {/* DIAGNOSIS IF REPAIR */}
                {serviceType === 'Reparación' && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-800 mb-3">Diagnóstico de Falla</Text>

                        {/* Diagnosis Chips */}
                        <View className="flex-row flex-wrap mb-3">
                            {['Fuga de gas', 'Capacitor dañado', 'Tarjeta dañada', 'Falla en suministro eléctrico', 'Código de error', 'Otros'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => {
                                        setSelectedError(option);
                                        // Clear or set errorCode based on selection
                                        if (option === 'Código de error' || option === 'Otros') {
                                            setErrorCode(''); // Reset for user input
                                        } else {
                                            setErrorCode(option); // Set preset value
                                        }
                                    }}
                                    className={`px-3 py-2 rounded-full mr-2 mb-2 border ${selectedError === option
                                        ? 'bg-red-600 border-red-600'
                                        : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <Text className={selectedError === option ? 'text-white font-medium' : 'text-gray-600'}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Conditional Inputs */}
                        {selectedError === 'Código de error' && (
                            <View>
                                <Text className="text-gray-600 mb-1 text-sm">Ingresa el código:</Text>
                                <TextInput
                                    className="bg-white p-3 rounded-xl border border-gray-200"
                                    placeholder="Ej: E4, F1..."
                                    value={errorCode}
                                    onChangeText={setErrorCode}
                                    autoFocus
                                />
                            </View>
                        )}

                        {selectedError === 'Otros' && (
                            <View>
                                <Text className="text-gray-600 mb-1 text-sm">Detalla la falla:</Text>
                                <TextInput
                                    className="bg-white p-3 rounded-xl border border-gray-200"
                                    placeholder="Describe el problema con detalle..."
                                    value={errorCode}
                                    onChangeText={setErrorCode}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    autoFocus
                                />
                            </View>
                        )}
                    </View>
                )}

                {/* TASKS CHIPS */}
                <Text className="text-lg font-bold text-gray-800 mb-3">Trabajos Realizados</Text>
                <View className="flex-row flex-wrap mb-2">
                    {currentTasks.map(task => (
                        <TouchableOpacity
                            key={task}
                            onPress={() => toggleTask(task)}
                            className={`px-3 py-2 rounded-full mr-2 mb-2 border ${selectedTasks.includes(task)
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-300'
                                }`}
                        >
                            <Text className={selectedTasks.includes(task) ? 'text-white font-medium' : 'text-gray-600'}>
                                {task}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {/* Custom 'Otros' input - show when 'Otros' is selected */}
                {selectedTasks.includes('Otros') && (
                    <TextInput
                        className="bg-white p-3 rounded-xl border border-gray-200 mb-4"
                        placeholder="Describe el trabajo adicional..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                    />
                )}
                <View className="mb-4" />

                {/* CHECKLIST */}
                <Text className="text-lg font-bold text-gray-800 mb-3">Checklist de Calidad</Text>
                <View className="bg-white rounded-xl border border-gray-100 p-2 mb-6">
                    {currentChecklist.map(item => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => toggleChecklist(item)}
                            className="flex-row items-center p-3 border-b border-gray-50 last:border-0"
                        >
                            <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${checklistData[item] ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                                }`}>
                                {checklistData[item] && <Ionicons name="checkmark" size={16} color="white" />}
                            </View>
                            <Text className="text-gray-700">{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* EVIDENCE/PHOTOS */}
                <View className="flex-row items-center mb-3">
                    <Text className="text-lg font-bold text-gray-800">Evidencia</Text>
                    <Text className="text-xs text-gray-400 ml-2">(opcional, pero recomendada)</Text>
                </View>
                <ScrollView horizontal className="mb-6" showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        onPress={pickImage}
                        className="w-24 h-24 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300 mr-3"
                    >
                        <Ionicons name="camera" size={24} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400 mt-1">Agregar</Text>
                    </TouchableOpacity>
                    {photos.map((uri, idx) => (
                        <Image key={idx} source={{ uri }} className="w-24 h-24 rounded-xl mr-3" />
                    ))}
                </ScrollView>

                {/* NOTES */}
                <Text className="text-lg font-bold text-gray-800 mb-2">Notas</Text>
                <TextInput
                    className="bg-white p-3 rounded-xl border border-gray-200 mb-8 h-24"
                    placeholder="Observaciones finales..."
                    multiline
                    value={notes}
                    onChangeText={setNotes}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    onPress={handleFinishService}
                    disabled={saving}
                    className={`bg-blue-600 p-4 rounded-xl shadow-lg items-center mb-4 ${saving ? 'opacity-70' : ''}`}
                >
                    <Text className="text-white font-bold text-lg">{saving ? 'Guardando...' : 'Finalizar y Firmar'}</Text>
                </TouchableOpacity>

                {/* PRO Feature: Automatic Reminder */}
                {(serviceType === 'Instalación' || serviceType === 'Mantenimiento') && (
                    <View className="mb-6">
                        <View className={`p-4 rounded-xl border flex-row items-center justify-between ${isPro ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-100 border-gray-200'}`}>
                            <View className="flex-1 mr-4">
                                <View className="flex-row items-center mb-1 flex-wrap">
                                    <Ionicons name="notifications" size={18} color={isPro ? '#4F46E5' : '#9CA3AF'} />
                                    <Text className={`font-bold ml-2 ${isPro ? 'text-indigo-900' : 'text-gray-500'}`}>Recordatorio automático</Text>
                                    <View className="bg-indigo-600 px-2 py-0.5 rounded ml-2">
                                        <Text className="text-white text-[10px] font-bold">PRO</Text>
                                    </View>
                                </View>
                                <Text className={`text-xs ${isPro ? 'text-indigo-700' : 'text-gray-400'}`}>
                                    {isPro
                                        ? `Recordatorio en ${customReminderMonths} ${customReminderMonths === 1 ? 'mes' : 'meses'}`
                                        : 'Función exclusiva para usuarios PRO'
                                    }
                                </Text>
                            </View>
                            <Switch
                                value={reminderEnabled}
                                onValueChange={(value) => {
                                    if (!isPro && value) {
                                        Alert.alert(
                                            '🚀 Función PRO',
                                            'Los recordatorios automáticos son una función exclusiva de QRclima Pro',
                                            [
                                                { text: 'Ver Planes', onPress: () => router.push('/(app)/profile/subscription' as any) },
                                                { text: 'Cancelar', style: 'cancel' }
                                            ]
                                        );
                                        return;
                                    }
                                    setReminderEnabled(value);
                                }}
                                trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                                thumbColor={reminderEnabled && isPro ? '#4F46E5' : '#9CA3AF'}
                                disabled={!isPro}
                            />
                        </View>

                        {/* Time Selector - For when reminder enabled */}
                        {reminderEnabled && isPro && (
                            <View className="mt-3 p-3 bg-white rounded-xl border border-gray-100">
                                <Text className="text-gray-600 text-sm font-medium mb-2">⏰ Recordar en:</Text>
                                <View className="flex-row justify-between">
                                    {[3, 6, 12].map((months) => (
                                        <TouchableOpacity
                                            key={months}
                                            onPress={() => setCustomReminderMonths(months)}
                                            className={`flex-1 py-3 mx-1 rounded-xl items-center ${customReminderMonths === months
                                                ? 'bg-indigo-600'
                                                : 'bg-gray-100'
                                                }`}
                                        >
                                            <Text className={`font-bold ${customReminderMonths === months
                                                ? 'text-white'
                                                : 'text-gray-600'
                                                }`}>
                                                {months} {months === 1 ? 'mes' : 'meses'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Helper text */}
                        {reminderEnabled && isPro && (
                            <Text className="text-indigo-600 text-xs mt-2 text-center">
                                💡 Puedes modificar esta fecha después desde Agenda → Recordatorios PRO
                            </Text>
                        )}
                    </View>
                )}

                <TouchableOpacity onPress={() => setStep(preloadedEquipment ? 2 : 3)} className="p-4 items-center mb-8">
                    <Text className="text-gray-400">{preloadedEquipment ? 'Volver a Tipo de Servicio' : 'Volver a Equipo'}</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-slate-50 p-6 pt-12">
            <TouchableOpacity onPress={() => router.back()} className="mb-2">
                <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>

            {initialLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text className="text-gray-500 mt-4">Cargando datos...</Text>
                </View>
            ) : (
                <>
                    {renderHeader()}

                    {step === 0 && renderStep0()}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </>
            )}

            <SignatureModal
                visible={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                onOK={onSignatureConfirmed}
                title="Firma del Cliente"
                description={`Solicita a ${selectedClient?.name || 'el cliente'} su firma de conformidad.`}
                confirmText="Confirmar y Terminar"
            />

            {/* WARRANTY MODAL (Inline for v1.0.0) */}
            {showWarrantyModal && (
                <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/60 justify-center items-center z-50 p-6">
                    <View className="bg-white rounded-2xl w-full max-w-sm p-6">
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
                            <Text className="text-xl font-bold text-gray-800 ml-2">Garantía del Servicio</Text>
                        </View>

                        <Text className="text-gray-500 mb-6">
                            Selecciona el periodo de garantía que otorgarás por este servicio. Esto aparecerá en el reporte PDF.
                        </Text>

                        <View className="flex-row flex-wrap justify-center gap-2 mb-6">
                            {[0, 1, 3, 6, 12].map(m => (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => setWarrantyMonths(m)}
                                    className={`px-4 py-3 rounded-xl border ${warrantyMonths === m ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`font-bold ${warrantyMonths === m ? 'text-white' : 'text-gray-700'}`}>
                                        {m === 0 ? 'Sin Garantía' : `${m} Mes${m > 1 ? 'es' : ''}`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={confirmWarranty}
                            className="bg-indigo-600 p-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">Continuar a Firma</Text>
                        </TouchableOpacity>

                        {!isPro && (
                            <Text className="text-center text-xs text-gray-400 mt-4">
                                * Actualiza a PRO para validación automática de garantías.
                            </Text>
                        )}
                    </View>
                </View>
            )}

            {/* OTHER TECHNICIAN QR MODAL */}
            <Modal
                visible={showOtherTechModal}
                transparent
                animationType="fade"
                onRequestClose={() => router.back()}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        {/* Header con icono */}
                        <View className="items-center mb-4">
                            <View className="bg-amber-100 p-4 rounded-full">
                                <Ionicons name="information-circle" size={40} color="#D97706" />
                            </View>
                        </View>

                        {/* Equipo info */}
                        {preloadedEquipment && (
                            <View className="bg-purple-100 rounded-xl p-3 mb-4">
                                <Text className="text-purple-800 font-bold text-center">
                                    {preloadedEquipment.brand} {preloadedEquipment.model}
                                </Text>
                            </View>
                        )}

                        {/* Título */}
                        <Text className="text-xl font-bold text-gray-800 text-center mb-3">
                            Este QR pertenece a otro técnico
                        </Text>

                        {/* Contenido */}
                        <Text className="text-gray-600 text-center mb-6 leading-5">
                            Si registras un servicio nuevo, tu número de contacto aparecerá
                            en la hoja de vida del equipo y serás el técnico de referencia
                            para el cliente.
                        </Text>

                        {/* Botones */}
                        <TouchableOpacity
                            onPress={() => setShowOtherTechModal(false)}
                            className="bg-blue-600 rounded-xl py-4 mb-3"
                        >
                            <Text className="text-white font-bold text-center text-lg">
                                Entendido, continuar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="py-3"
                        >
                            <Text className="text-gray-500 text-center">
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
