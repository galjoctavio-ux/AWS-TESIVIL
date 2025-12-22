import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Switch } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';
import { getClients } from '../../../services/clients-service';
import { searchError, getBrands, getModelsByBrand, BrandData, ModelData } from '../../../services/database-service';
import { addService } from '../../../services/services-service';
import { getUserProfile } from '../../../services/user-service';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function NewService() {
    const router = useRouter();
    const { user } = useAuth();
    const { settings } = useSettings();

    // Steps: 1=Client, 2=Type, 3=Equipment, 4=Details/Review
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // DATA STATE
    const [clients, setClients] = useState<any[]>([]);
    const [filteredClients, setFilteredClients] = useState<any[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [brands, setBrands] = useState<BrandData[]>([]);
    const [models, setModels] = useState<ModelData[]>([]);

    // SELECTION STATE
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [serviceType, setServiceType] = useState<'Reparación' | 'Mantenimiento' | 'Instalación' | null>(null);

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
    const [capacityBTU, setCapacityBTU] = useState(''); // BTU capacity

    // Diagnosis (Only for Repair)
    const [errorCode, setErrorCode] = useState('');
    const [possibleErrors, setPossibleErrors] = useState<any[]>([]);
    const [selectedError, setSelectedError] = useState<any>(null);
    const [searchingErrors, setSearchingErrors] = useState(false);

    const [saving, setSaving] = useState(false);

    // LOAD INITIAL DATA - Use useFocusEffect to reload clients when returning from add client
    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadClients();
                // Check if user is PRO
                getUserProfile(user.uid).then(profile => {
                    const userIsPro = profile?.rank === 'Pro' || profile?.subscription === 'premium';
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
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1, // Get full quality, we'll compress ourselves
        });

        if (!result.canceled) {
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
        }
    };

    const handleSave = async () => {
        if (!selectedClient || !serviceType || !selectedBrand || !selectedModel) return;

        try {
            setSaving(true);

            // Calculate next service date using configurable reminder time
            const nextDate = new Date();
            if (serviceType === 'Instalación') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            } else {
                nextDate.setMonth(nextDate.getMonth() + settings.reminderMonths);
            }

            // Prepare payload to avoid undefined values which Firebase rejects
            const servicePayload: any = {
                clientId: selectedClient.id,
                technicianId: user?.uid || '',
                type: serviceType,
                status: 'Pendiente',
                date: new Date(),
                equipment: {
                    brand: selectedBrand.name,
                    model: selectedModel.name,
                    type: selectedModel.type,
                    capacityBTU: capacityBTU || '', // Save capacity
                },
                tasks: selectedTasks,
                checklist: checklistData,
                photos: photos,
                notes: notes,
                nextServiceDate: reminderEnabled ? nextDate : null,
                reminderEnabled: reminderEnabled,
                cost: 0 // Placeholder
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

            Alert.alert('Éxito', 'Servicio registrado correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar el servicio');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // RENDER HELPERS
    const renderHeader = () => (
        <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-800">Nuevo Servicio</Text>
            <View className="flex-row mt-4 mb-2">
                {[1, 2, 3, 4].map(i => (
                    <View key={i} className={`h-2 flex-1 rounded-full mx-1 ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
            </View>
            <Text className="text-center text-gray-500 text-sm">
                {step === 1 ? 'Seleccionar Cliente' :
                    step === 2 ? 'Tipo de Servicio' :
                        step === 3 ? 'Equipo' : 'Detalles del Trabajo'}
            </Text>
        </View>
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



            {/* PRO Feature: Automatic Reminder */}
            <View className={`p-4 rounded-xl mb-6 border flex-row items-center justify-between ${isPro ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-100 border-gray-200'}`}>
                <View className="flex-1 mr-4">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="notifications" size={18} color={isPro ? '#4F46E5' : '#9CA3AF'} />
                        <Text className={`font-bold ml-2 ${isPro ? 'text-indigo-900' : 'text-gray-500'}`}>Recordatorio Automático</Text>
                        <View className="bg-indigo-600 px-2 py-0.5 rounded ml-2">
                            <Text className="text-white text-[10px] font-bold">PRO</Text>
                        </View>
                    </View>
                    <Text className={`text-xs ${isPro ? 'text-indigo-700' : 'text-gray-400'}`}>
                        {isPro
                            ? `Notificar al cliente para su próximo servicio (${serviceType === 'Instalación' ? '1 año' : `${settings.reminderMonths} ${settings.reminderMonths === 1 ? 'mes' : 'meses'}`}).`
                            : 'Función exclusiva para usuarios PRO'
                        }
                    </Text>
                </View>
                <Switch
                    value={reminderEnabled}
                    onValueChange={(value) => {
                        if (!isPro && value) {
                            Alert.alert(
                                'Función PRO',
                                'Los recordatorios automáticos son una función exclusiva para usuarios PRO. ¿Deseas actualizar tu plan?',
                                [
                                    { text: 'Más tarde', style: 'cancel' },
                                    { text: 'Ver planes', onPress: () => router.push('/(app)/store') }
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
            {['Instalación', 'Mantenimiento', 'Reparación'].map((type) => (
                <TouchableOpacity
                    key={type}
                    onPress={() => {
                        setServiceType(type as any);
                        setStep(3);
                    }}
                    className="bg-white p-6 rounded-xl mb-4 border border-gray-100 shadow-sm flex-row items-center"
                >
                    <View className={`p-4 rounded-full mr-5 ${type === 'Reparación' ? 'bg-red-100' :
                        type === 'Mantenimiento' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                        <Ionicons
                            name={type === 'Reparación' ? 'construct' : type === 'Mantenimiento' ? 'water' : 'hammer'}
                            size={28}
                            color={type === 'Reparación' ? '#EF4444' : type === 'Mantenimiento' ? '#F59E0B' : '#10B981'}
                        />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-800">{type}</Text>
                        <Text className="text-gray-500 text-sm">
                            {type === 'Instalación' ? 'Equipos nuevos' :
                                type === 'Mantenimiento' ? 'Preventivo y limpieza' : 'Fallas y correctivos'}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setStep(1)} className="mt-8 items-center">
                <Text className="text-gray-500 font-medium">Volver</Text>
            </TouchableOpacity>
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
        const installTasks = ['Instalación Básica', 'Vacío', 'Suministro Kit', 'Base Piso', 'Instalación Eléctrica'];
        const maintTasks = ['Limpieza Evaporador', 'Limpieza Condensador', 'Limpieza Drenaje', 'Revisión Gas', 'Revisión Eléctrica'];
        const repairTasks = ['Diagnóstico', 'Carga de Gas', 'Cambio Capacitor', 'Soldadura', 'Cambio Tarjeta', 'Cambio Sensor'];

        const currentTasks = serviceType === 'Instalación' ? installTasks :
            serviceType === 'Mantenimiento' ? maintTasks : repairTasks;

        const installChecklist = ['Vacío realizado (Micras)', 'Torque aplicado', 'Protección eléctrica', 'Prueba operación'];
        const maintChecklist = ['Filtros limpios', 'Drenaje fluido', 'Presiones correctas', 'Consumo (Amperes) OK'];
        const repairChecklist = ['Falla identificada', 'Refacción nueva', 'Prueba funcionamiento'];

        const currentChecklist = serviceType === 'Instalación' ? installChecklist :
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
                        <Text className="text-lg font-bold text-gray-800 mb-2">Diagnóstico de Falla</Text>
                        <TextInput
                            className="bg-white p-3 rounded-lg border border-gray-200"
                            placeholder="Describe el problema o código de error..."
                            value={errorCode}
                            onChangeText={setErrorCode}
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                        />
                    </View>
                )}

                {/* TASKS CHIPS */}
                <Text className="text-lg font-bold text-gray-800 mb-3">Trabajos Realizados</Text>
                <View className="flex-row flex-wrap mb-6">
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
                    onPress={handleSave}
                    disabled={saving}
                    className={`bg-blue-600 p-4 rounded-xl shadow-lg items-center mb-10 ${saving ? 'opacity-70' : ''}`}
                >
                    <Text className="text-white font-bold text-lg">{saving ? 'Guardando...' : 'Finalizar Servicio'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(3)} className="p-4 items-center mb-8">
                    <Text className="text-gray-400">Volver a Equipo</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-slate-50 p-6 pt-12">
            <TouchableOpacity onPress={() => router.back()} className="mb-2">
                <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>

            {renderHeader()}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </KeyboardAvoidingView>
    );
}
