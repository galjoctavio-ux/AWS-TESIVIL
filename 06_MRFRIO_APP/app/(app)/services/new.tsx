import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { getClients } from '../../../services/clients-service';
import { searchError, getBrands, getModelsByBrand, BrandData, ModelData } from '../../../services/database-service';
import { addService } from '../../../services/services-service';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function NewService() {
    const router = useRouter();
    const { user } = useAuth();

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
    const [reminderEnabled, setReminderEnabled] = useState(true); // Default to true for PRO feel

    // Diagnosis (Only for Repair)
    const [errorCode, setErrorCode] = useState('');
    const [possibleErrors, setPossibleErrors] = useState<any[]>([]);
    const [selectedError, setSelectedError] = useState<any>(null);
    const [searchingErrors, setSearchingErrors] = useState(false);

    const [saving, setSaving] = useState(false);

    // LOAD INITIAL DATA
    useEffect(() => {
        if (user) {
            loadClients();
        }
        loadBrands();
    }, [user]);

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
            setFilteredClients(clients.filter(c =>
                c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                (c.address && c.address.toLowerCase().includes(clientSearch.toLowerCase()))
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
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const handleSave = async () => {
        if (!selectedClient || !serviceType || !selectedBrand || !selectedModel) return;

        try {
            setSaving(true);

            // Calculate next service date
            const nextDate = new Date();
            if (serviceType === 'Mantenimiento') nextDate.setMonth(nextDate.getMonth() + 6);
            else if (serviceType === 'Instalación') nextDate.setFullYear(nextDate.getFullYear() + 1);
            else nextDate.setMonth(nextDate.getMonth() + 3); // Reparación default

            await addService({
                clientId: selectedClient.id,
                technicianId: user?.uid || '',
                type: serviceType,
                status: 'Pendiente',
                date: new Date(),
                equipment: {
                    brand: selectedBrand.name,
                    model: selectedModel.name,
                    type: selectedModel.type,
                },
                tasks: selectedTasks,
                checklist: checklistData,
                photos: photos,

                diagnosis: selectedError ? {
                    errorCode: selectedError.code,
                    description: selectedError.description,
                    cause: selectedError.solution || ''
                } : undefined,
                notes: notes,
                nextServiceDate: reminderEnabled ? nextDate : null,
                reminderEnabled: reminderEnabled,
                cost: 0 // Placeholder
            });

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
            <View className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-100 flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="notifications" size={18} color="#4F46E5" />
                        <Text className="font-bold text-indigo-900 ml-2">Recordatorio Automático</Text>
                        <View className="bg-indigo-600 px-2 py-0.5 rounded ml-2">
                            <Text className="text-white text-[10px] font-bold">PRO</Text>
                        </View>
                    </View>
                    <Text className="text-indigo-700 text-xs">
                        Notificar al cliente para su próximo servicio ({serviceType === 'Instalación' ? '1 año' : '6 meses'}).
                    </Text>
                </View>
                <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    trackColor={{ false: '#C7D2FE', true: '#818CF8' }}
                    thumbColor={reminderEnabled ? '#4F46E5' : '#EEF2FF'}
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

    // STEP 3: EQUIPMENT
    const renderStep3 = () => (
        <View className="flex-1">
            {!selectedBrand ? (
                <>
                    <Text className="text-lg font-bold text-gray-800 mb-4">Selecciona la Marca</Text>
                    {loading ? <ActivityIndicator size="large" color="#2563EB" /> : (
                        <FlatList
                            data={brands}
                            keyExtractor={item => item.name}
                            numColumns={3}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedBrand(item)}
                                    className="flex-1 m-1 bg-white p-3 rounded-lg border border-gray-100 items-center justify-center aspect-square"
                                >
                                    {item.logo_url ? (
                                        <Image source={{ uri: 'https://mrfrio-assets.com/logos/' + item.name + '.png' }} className="w-12 h-12" resizeMode="contain" /> // Mock URL logic or use local if available
                                    ) : (
                                        <Ionicons name="cube" size={24} color="#CBD5E1" />
                                    )}
                                    <Text className="text-xs text-center mt-2 text-gray-600 font-medium">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </>
            ) : (
                <>
                    <View className="flex-row items-center mb-4">
                        <TouchableOpacity onPress={() => setSelectedBrand(null)} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-800">Modelos {selectedBrand.name}</Text>
                    </View>

                    {loading ? <ActivityIndicator size="large" color="#2563EB" /> : (
                        <FlatList
                            data={models}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { setSelectedModel(item); setStep(4); }}
                                    className="bg-white p-4 rounded-xl mb-3 border border-gray-100 flex-row items-center shadow-sm"
                                >
                                    <View className="w-16 h-16 bg-gray-50 rounded-lg mr-4 items-center justify-center">
                                        <Ionicons name="hardware-chip" size={30} color="#94A3B8" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-800 text-base">{item.name}</Text>
                                        <Text className="text-blue-600 font-medium text-xs bg-blue-50 self-start px-2 py-1 rounded mt-1">{item.type}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </>
            )}
            <TouchableOpacity onPress={() => setStep(2)} className="mt-4 px-4 py-3 items-center">
                <Text className="text-gray-400">Volver a Tipos</Text>
            </TouchableOpacity>
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
            <ScrollView className="flex-1">
                {/* INFO CARD */}
                <View className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                    <Text className="font-bold text-blue-900 text-lg">{selectedClient?.name}</Text>
                    <Text className="text-blue-700">{serviceType} • {selectedBrand?.name} {selectedModel?.name}</Text>
                </View>

                {/* DIAGNOSIS IF REPAIR */}
                {serviceType === 'Reparación' && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-800 mb-2">Diagnóstico</Text>
                        <TextInput
                            className="bg-white p-3 rounded-lg border border-gray-200"
                            placeholder="Buscar código (ej. E1)..."
                            value={errorCode}
                            onChangeText={setErrorCode}
                        />
                        {searchingErrors && <Text className="text-xs text-gray-400 mt-1">Buscando...</Text>}
                        {possibleErrors.length > 0 && (
                            <View className="bg-white border border-gray-100 rounded-lg mt-1 max-h-40">
                                {possibleErrors.map(err => (
                                    <TouchableOpacity
                                        key={err.id}
                                        onPress={() => { setErrorCode(err.code); setSelectedError(err); setPossibleErrors([]); }}
                                        className="p-3 border-b border-gray-50"
                                    >
                                        <Text className="font-bold text-gray-800">{err.code} - {err.description.substring(0, 30)}...</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        {selectedError && (
                            <Text className="text-green-600 text-xs mt-2 font-medium">✅ Diagnóstico: {selectedError.description}</Text>
                        )}
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
                <Text className="text-lg font-bold text-gray-800 mb-3">Evidencia</Text>
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
