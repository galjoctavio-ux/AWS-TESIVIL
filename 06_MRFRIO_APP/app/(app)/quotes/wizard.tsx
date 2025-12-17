import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Modal, FlatList, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    getSmartSuggestions,
    ITEM_DATABASE,
    QuoteItem,
    calculateQuoteTotals,
    saveQuote,
    searchItems,
    getItemsByCategory,
    formatCurrency,
    calculateBTURequirement,
    QUOTE_CONFIG,
} from '../../../services/quotes-service';
import QuoteBuilder from '../../../components/QuoteBuilder';
import { useAuth } from '../../../context/AuthContext';

export default function QuoteWizard() {
    const router = useRouter();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [serviceType, setServiceType] = useState<'Instalación' | 'Mantenimiento' | 'Reparación' | null>(null);
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [includeTax, setIncludeTax] = useState(false);
    const [saving, setSaving] = useState(false);

    // Installation specific options
    const [distance, setDistance] = useState(3);
    const [floorType, setFloorType] = useState<'wall' | 'floor' | 'ceiling'>('wall');
    const [includeElectrical, setIncludeElectrical] = useState(false);
    const [tonnage, setTonnage] = useState(1);

    // Item Picker
    const [pickerVisible, setPickerVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'installation' | 'maintenance' | 'repair' | 'parts'>('all');

    // BTU Calculator Modal
    const [btuModalVisible, setBtuModalVisible] = useState(false);
    const [btuArea, setBtuArea] = useState('');
    const [btuClimate, setBtuClimate] = useState<'templado' | 'calido' | 'muy_calido'>('calido');
    const [btuResult, setBtuResult] = useState<{ btu: number; tonnage: number } | null>(null);

    const handleTypeSelect = (type: 'Instalación' | 'Mantenimiento' | 'Reparación') => {
        setServiceType(type);

        if (type === 'Instalación') {
            // Go to installation options first
            setStep(1.5); // Special step for installation options
        } else {
            const suggestions = getSmartSuggestions(type);
            setItems(suggestions);
            setStep(2);
        }
    };

    const handleInstallationOptions = () => {
        const suggestions = getSmartSuggestions('Instalación', {
            distance,
            floorType,
            includeElectrical,
            tonnage,
        });
        setItems(suggestions);
        setStep(2);
    };

    const addItem = (item: QuoteItem) => {
        const exists = items.find(i => i.id === item.id);
        if (exists) {
            setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setItems([...items, { ...item, quantity: 1 }]);
        }
        setPickerVisible(false);
    };

    const calculateBTU = () => {
        const area = parseFloat(btuArea);
        if (isNaN(area) || area <= 0) {
            Alert.alert('Error', 'Ingresa un área válida');
            return;
        }

        const result = calculateBTURequirement({
            area,
            climate: btuClimate,
        });

        setBtuResult({
            btu: result.recommendedBTU,
            tonnage: result.recommendedTonnage,
        });
        setTonnage(result.recommendedTonnage);
    };

    const handleSave = async () => {
        if (!clientName.trim()) {
            Alert.alert('Error', 'Ingresa el nombre del cliente');
            return;
        }

        try {
            setSaving(true);
            const totals = calculateQuoteTotals(items, includeTax);

            await saveQuote({
                userId: user!.uid,
                clientName,
                clientPhone,
                serviceType: serviceType!,
                items,
                subtotal: totals.subtotal,
                tax: totals.tax,
                total: totals.total,
                laborCost: totals.laborCost,
                materialsCost: totals.materialsCost,
                status: 'Sent',
                requires_invoice: includeTax,
                installationData: serviceType === 'Instalación' ? {
                    tonnage,
                    distance,
                    floorType,
                    requiresElectrical: includeElectrical,
                } : undefined,
            });

            Alert.alert('¡Cotización Creada!', `Total: ${formatCurrency(totals.total)}`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    const totals = calculateQuoteTotals(items, includeTax);

    // Filter items for picker
    const getFilteredItems = () => {
        let filtered = ITEM_DATABASE;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(i => i.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = searchItems(searchQuery).filter(i =>
                selectedCategory === 'all' || i.category === selectedCategory
            );
        }

        return filtered;
    };

    const renderHeader = () => (
        <View className="bg-white p-4 pt-12 shadow-sm z-10">
            <View className="flex-row items-center mb-2">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Cotizador Pro</Text>
                <View className="flex-1" />
                <TouchableOpacity onPress={() => setBtuModalVisible(true)} className="bg-blue-100 p-2 rounded-lg">
                    <Ionicons name="calculator" size={20} color="#2563EB" />
                </TouchableOpacity>
            </View>
            <View className="flex-row h-1 bg-gray-100 rounded overflow-hidden">
                <View className={`flex-1 ${step >= 1 ? 'bg-blue-600' : ''}`} />
                <View className={`flex-1 ${step >= 2 ? 'bg-blue-600' : ''}`} />
                <View className={`flex-1 ${step >= 3 ? 'bg-blue-600' : ''}`} />
            </View>
            <Text className="text-center text-xs text-gray-400 mt-2">
                {step === 1 ? 'El Trifurcador' :
                    step === 1.5 ? 'Opciones de Instalación' :
                        step === 2 ? 'Constructor de Items' : 'Revisión Final'}
            </Text>
        </View>
    );

    // STEP 1: THE TRIFURCATOR
    const renderStep1 = () => (
        <View className="flex-1 p-6">
            <Text className="text-lg font-bold text-gray-800 mb-6">¿Qué vas a cotizar hoy?</Text>

            <TouchableOpacity onPress={() => handleTypeSelect('Instalación')} className="bg-white p-6 rounded-2xl mb-4 border border-blue-200 shadow-sm flex-row items-center">
                <View className="bg-blue-100 p-4 rounded-full mr-4">
                    <Ionicons name="hammer" size={32} color="#2563EB" />
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">Instalación</Text>
                    <Text className="text-gray-500 text-xs">Kit, Base, Eléctrico + Mano de obra</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleTypeSelect('Mantenimiento')} className="bg-white p-6 rounded-2xl mb-4 border border-yellow-200 shadow-sm flex-row items-center">
                <View className="bg-yellow-100 p-4 rounded-full mr-4">
                    <Ionicons name="water" size={32} color="#EAB308" />
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">Mantenimiento</Text>
                    <Text className="text-gray-500 text-xs">Preventivo, Correctivo, Limpieza</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleTypeSelect('Reparación')} className="bg-white p-6 rounded-2xl mb-4 border border-red-200 shadow-sm flex-row items-center">
                <View className="bg-red-100 p-4 rounded-full mr-4">
                    <Ionicons name="medkit" size={32} color="#EF4444" />
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">Reparación</Text>
                    <Text className="text-gray-500 text-xs">Diagnóstico, Refacciones, Cambio de piezas</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
        </View>
    );

    // STEP 1.5: INSTALLATION OPTIONS
    const renderStep1_5 = () => (
        <ScrollView className="flex-1 p-6">
            <Text className="text-lg font-bold text-gray-800 mb-2">Opciones de Instalación</Text>
            <Text className="text-gray-500 text-sm mb-6">Personaliza la cotización automática</Text>

            {/* Distance */}
            <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100">
                <Text className="font-bold text-gray-800 mb-2">📏 Distancia de Tubería</Text>
                <View className="flex-row gap-2">
                    {[3, 5, 8].map(d => (
                        <TouchableOpacity
                            key={d}
                            onPress={() => setDistance(d)}
                            className={`flex-1 p-3 rounded-lg items-center ${distance === d ? 'bg-blue-600' : 'bg-gray-100'}`}
                        >
                            <Text className={`font-bold ${distance === d ? 'text-white' : 'text-gray-600'}`}>{d}m</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Floor Type */}
            <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100">
                <Text className="font-bold text-gray-800 mb-2">🏠 Tipo de Montaje</Text>
                <View className="flex-row gap-2">
                    {[
                        { value: 'wall', label: 'Pared', icon: 'tablet-landscape-outline' },
                        { value: 'floor', label: 'Piso', icon: 'layers-outline' },
                        { value: 'ceiling', label: 'Techo', icon: 'arrow-up-outline' },
                    ].map(type => (
                        <TouchableOpacity
                            key={type.value}
                            onPress={() => setFloorType(type.value as any)}
                            className={`flex-1 p-3 rounded-lg items-center ${floorType === type.value ? 'bg-blue-600' : 'bg-gray-100'}`}
                        >
                            <Ionicons name={type.icon as any} size={20} color={floorType === type.value ? 'white' : '#6B7280'} />
                            <Text className={`text-xs mt-1 ${floorType === type.value ? 'text-white' : 'text-gray-600'}`}>{type.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Tonnage */}
            <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-bold text-gray-800">❄️ Tonelaje</Text>
                    <TouchableOpacity onPress={() => setBtuModalVisible(true)} className="bg-blue-50 px-3 py-1 rounded-lg">
                        <Text className="text-blue-600 text-xs font-medium">Calcular BTU</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row gap-2">
                    {[1, 1.5, 2, 2.5, 3].map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setTonnage(t)}
                            className={`flex-1 p-3 rounded-lg items-center ${tonnage === t ? 'bg-blue-600' : 'bg-gray-100'}`}
                        >
                            <Text className={`font-bold text-sm ${tonnage === t ? 'text-white' : 'text-gray-600'}`}>{t}T</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Electrical */}
            <TouchableOpacity
                onPress={() => setIncludeElectrical(!includeElectrical)}
                className={`bg-white p-4 rounded-xl mb-4 border flex-row items-center justify-between ${includeElectrical ? 'border-blue-500' : 'border-gray-100'}`}
            >
                <View className="flex-row items-center">
                    <View className={`p-2 rounded-lg mr-3 ${includeElectrical ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Ionicons name="flash" size={24} color={includeElectrical ? '#2563EB' : '#9CA3AF'} />
                    </View>
                    <View>
                        <Text className="font-bold text-gray-800">Instalación Eléctrica</Text>
                        <Text className="text-gray-500 text-xs">Incluye pastilla, cable y contacto</Text>
                    </View>
                </View>
                <View className={`w-12 h-7 rounded-full p-1 ${includeElectrical ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <View className={`w-5 h-5 bg-white rounded-full shadow ${includeElectrical ? 'self-end' : 'self-start'}`} />
                </View>
            </TouchableOpacity>

            <View className="flex-row gap-4 mt-4">
                <TouchableOpacity onPress={() => setStep(1)} className="flex-1 p-4 bg-gray-100 rounded-xl items-center">
                    <Text className="text-gray-600 font-medium">Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleInstallationOptions} className="flex-1 p-4 bg-blue-600 rounded-xl items-center">
                    <Text className="text-white font-bold">Continuar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // STEP 2: BUILDER
    const renderStep2 = () => (
        <View className="flex-1 p-6">
            <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Cliente</Text>
            <TextInput
                className="bg-white p-3 rounded-xl border border-gray-200 mb-2 font-bold text-lg"
                placeholder="Nombre del Cliente..."
                value={clientName}
                onChangeText={setClientName}
            />
            <TextInput
                className="bg-white p-3 rounded-xl border border-gray-200 mb-6"
                placeholder="Teléfono (opcional)"
                value={clientPhone}
                onChangeText={setClientPhone}
                keyboardType="phone-pad"
            />

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">Conceptos</Text>
                <TouchableOpacity onPress={() => setPickerVisible(true)} className="bg-blue-600 px-3 py-1 rounded-lg flex-row items-center">
                    <Ionicons name="add" size={16} color="white" />
                    <Text className="text-white font-bold ml-1">Agregar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 mb-4">
                <QuoteBuilder items={items} onUpdateItems={setItems} />
            </ScrollView>

            <View className="border-t border-gray-200 pt-4">
                <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-500 text-sm">Materiales</Text>
                    <Text className="text-gray-600">{formatCurrency(totals.materialsCost)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500 text-sm">Mano de Obra</Text>
                    <Text className="text-gray-600">{formatCurrency(totals.laborCost)}</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-800 font-medium">Subtotal</Text>
                    <Text className="font-bold text-gray-800 text-lg">{formatCurrency(totals.subtotal)}</Text>
                </View>
                <TouchableOpacity onPress={() => setStep(3)} className="bg-blue-600 p-4 rounded-xl items-center">
                    <Text className="text-white font-bold text-lg">Continuar a Revisión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // STEP 3: REVIEW (unchanged mostly)
    const renderStep3 = () => (
        <View className="flex-1 p-6">
            <Text className="text-2xl font-bold text-gray-800 mb-6">Resumen Final</Text>

            <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500">Cliente</Text>
                    <Text className="font-bold">{clientName || 'Sin Nombre'}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500">Tipo</Text>
                    <Text className="font-bold text-blue-600">{serviceType}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-500">Conceptos</Text>
                    <Text className="font-bold">{items.length} items</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => setIncludeTax(!includeTax)}
                className="bg-indigo-50 p-4 rounded-xl mb-6 flex-row items-center justify-between border border-indigo-100"
            >
                <View>
                    <Text className="font-bold text-indigo-900">Requiere Factura (+16% IVA)</Text>
                    <Text className="text-indigo-400 text-xs">Se desglosará en el PDF final</Text>
                </View>
                <View className={`w-12 h-7 rounded-full p-1 ${includeTax ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                    <View className={`w-5 h-5 bg-white rounded-full shadow ${includeTax ? 'self-end' : 'self-start'}`} />
                </View>
            </TouchableOpacity>

            <View className="flex-1" />

            <View className="bg-gray-900 p-6 rounded-2xl shadow-xl">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Materiales</Text>
                    <Text className="text-white">{formatCurrency(totals.materialsCost)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Mano de Obra</Text>
                    <Text className="text-white">{formatCurrency(totals.laborCost)}</Text>
                </View>
                <View className="h-px bg-gray-700 my-2" />
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Subtotal</Text>
                    <Text className="text-white font-bold">{formatCurrency(totals.subtotal)}</Text>
                </View>
                {includeTax && (
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-400">IVA (16%)</Text>
                        <Text className="text-white font-bold">{formatCurrency(totals.tax)}</Text>
                    </View>
                )}
                <View className="h-px bg-gray-700 my-2" />
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white text-lg font-bold">Total</Text>
                    <Text className="text-green-400 text-3xl font-bold">{formatCurrency(totals.total)}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`bg-white p-4 rounded-xl items-center ${saving ? 'opacity-70' : ''}`}
                >
                    <Text className="text-gray-900 font-bold text-lg">
                        {saving ? 'Guardando...' : 'Generar Cotización'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {renderHeader()}
            {step === 1 && renderStep1()}
            {step === 1.5 && renderStep1_5()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Item Picker Modal with Search and Categories */}
            <Modal visible={pickerVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-slate-50 p-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-800">Agregar Concepto</Text>
                        <TouchableOpacity onPress={() => setPickerVisible(false)}>
                            <Text className="text-blue-600 font-bold">Cerrar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View className="bg-white p-3 rounded-xl border border-gray-200 mb-4 flex-row items-center">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Category Filter */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {[
                            { key: 'all', label: 'Todos' },
                            { key: 'installation', label: 'Instalación' },
                            { key: 'maintenance', label: 'Mantto' },
                            { key: 'repair', label: 'Refacciones' },
                            { key: 'parts', label: 'Materiales' },
                        ].map(cat => (
                            <TouchableOpacity
                                key={cat.key}
                                onPress={() => setSelectedCategory(cat.key as any)}
                                className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === cat.key ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}
                            >
                                <Text className={selectedCategory === cat.key ? 'text-white font-medium' : 'text-gray-600'}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <FlatList
                        data={getFilteredItems()}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => addItem(item)}
                                className="bg-white p-4 rounded-xl mb-3 border border-gray-100 flex-row justify-between items-center"
                            >
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800">{item.description}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className={`text-xs px-2 py-0.5 rounded mr-2 ${item.type === 'Labor' ? 'bg-purple-100 text-purple-700' :
                                                item.type === 'Gas' ? 'bg-cyan-100 text-cyan-700' :
                                                    item.type === 'Electrical' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>{item.type}</Text>
                                        <Text className="text-gray-400 text-xs">{formatCurrency(item.unitCost)} costo</Text>
                                    </View>
                                </View>
                                <Ionicons name="add-circle" size={28} color="#2563EB" />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            {/* BTU Calculator Modal */}
            <Modal visible={btuModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-slate-50 p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-800">Calculadora BTU</Text>
                        <TouchableOpacity onPress={() => setBtuModalVisible(false)}>
                            <Text className="text-blue-600 font-bold">Cerrar</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white p-4 rounded-xl mb-4">
                        <Text className="font-bold text-gray-800 mb-2">Área del espacio (m²)</Text>
                        <TextInput
                            className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                            placeholder="Ej: 25"
                            keyboardType="numeric"
                            value={btuArea}
                            onChangeText={setBtuArea}
                        />
                    </View>

                    <View className="bg-white p-4 rounded-xl mb-4">
                        <Text className="font-bold text-gray-800 mb-2">Clima de la zona</Text>
                        <View className="flex-row gap-2">
                            {[
                                { value: 'templado', label: '🌤️ Templado' },
                                { value: 'calido', label: '☀️ Cálido' },
                                { value: 'muy_calido', label: '🔥 Muy Cálido' },
                            ].map(climate => (
                                <TouchableOpacity
                                    key={climate.value}
                                    onPress={() => setBtuClimate(climate.value as any)}
                                    className={`flex-1 p-3 rounded-lg items-center ${btuClimate === climate.value ? 'bg-blue-600' : 'bg-gray-100'}`}
                                >
                                    <Text className={`text-sm ${btuClimate === climate.value ? 'text-white font-medium' : 'text-gray-600'}`}>
                                        {climate.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity onPress={calculateBTU} className="bg-blue-600 p-4 rounded-xl items-center mb-6">
                        <Text className="text-white font-bold">Calcular</Text>
                    </TouchableOpacity>

                    {btuResult && (
                        <View className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-2xl">
                            <Text className="text-white text-sm opacity-80 mb-1">Recomendación</Text>
                            <Text className="text-white text-4xl font-bold mb-1">{btuResult.btu.toLocaleString()} BTU</Text>
                            <Text className="text-white text-lg">{btuResult.tonnage} Toneladas</Text>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}
