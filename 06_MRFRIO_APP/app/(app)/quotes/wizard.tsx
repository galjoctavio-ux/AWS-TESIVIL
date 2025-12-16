import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getSmartSuggestions, ITEM_DATABASE, QuoteItem, calculateQuoteTotals, saveQuote } from '../../../services/quotes-service';
import QuoteBuilder from '../../../components/QuoteBuilder';
import { useAuth } from '../../../context/AuthContext';

export default function QuoteWizard() {
    const router = useRouter();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [clientName, setClientName] = useState('');
    const [serviceType, setServiceType] = useState<'Instalación' | 'Mantenimiento' | 'Reparación' | null>(null);
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [includeTax, setIncludeTax] = useState(false);
    const [saving, setSaving] = useState(false);

    // Item Picker Modal
    const [pickerVisible, setPickerVisible] = useState(false);

    const handleTypeSelect = (type: 'Instalación' | 'Mantenimiento' | 'Reparación') => {
        setServiceType(type);
        setItems(getSmartSuggestions(type)); // The "Brain" action
        setStep(2);
    };

    const addItem = (item: QuoteItem) => {
        // Check if exists
        const exists = items.find(i => i.id === item.id);
        if (exists) {
            setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setItems([...items, { ...item, quantity: 1 }]);
        }
        setPickerVisible(false);
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
                items,
                subtotal: totals.subtotal,
                tax: totals.tax,
                total: totals.total,
                status: 'Sent',
                requires_invoice: includeTax
            });

            Alert.alert('¡Cotización Creada!', 'Se ha guardado exitosamente.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    const totals = calculateQuoteTotals(items, includeTax);

    const renderHeader = () => (
        <View className="bg-white p-4 pt-12 shadow-sm z-10">
            <View className="flex-row items-center mb-2">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Cotizador Pro</Text>
            </View>
            <View className="flex-row h-1 bg-gray-100 rounded overflow-hidden">
                <View className={`flex-1 ${step >= 1 ? 'bg-blue-600' : ''}`} />
                <View className={`flex-1 ${step >= 2 ? 'bg-blue-600' : ''}`} />
                <View className={`flex-1 ${step >= 3 ? 'bg-blue-600' : ''}`} />
            </View>
            <Text className="text-center text-xs text-gray-400 mt-2">
                {step === 1 ? 'El Trifurcador' : step === 2 ? 'Constructor de Items' : 'Revisión Final'}
            </Text>
        </View>
    );

    // STEP 1: THE TRIFURCATOR
    const renderStep1 = () => (
        <View className="flex-1 p-6">
            <Text className="text-lg font-bold text-gray-800 mb-6">¿Qué vas a cotizar hoy?</Text>

            <TouchableOpacity onPress={() => handleTypeSelect('Instalación')} className="bg-white p-6 rounded-2xl mb-4 border border-blue-50 shadow-sm flex-row items-center">
                <View className="bg-blue-100 p-4 rounded-full mr-4">
                    <Ionicons name="hammer" size={32} color="#2563EB" />
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">Instalación</Text>
                    <Text className="text-gray-500 text-xs">Incluye Kit Básico, Base y Mano de Obra</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleTypeSelect('Mantenimiento')} className="bg-white p-6 rounded-2xl mb-4 border border-yellow-50 shadow-sm flex-row items-center">
                <View className="bg-yellow-100 p-4 rounded-full mr-4">
                    <Ionicons name="water" size={32} color="#EAB308" />
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">Mantenimiento</Text>
                    <Text className="text-gray-500 text-xs">Preventivo, Correctivo, Limpieza</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleTypeSelect('Reparación')} className="bg-white p-6 rounded-2xl mb-4 border border-red-50 shadow-sm flex-row items-center">
                <View className="bg-red-100 p-4 rounded-full mr-4">
                    <Ionicons name="medkit" size={32} color="#EF4444" />
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">Reparación</Text>
                    <Text className="text-gray-500 text-xs">Diagnóstico, Cambio de Piezas</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    // STEP 2: BUILDER
    const renderStep2 = () => (
        <View className="flex-1 p-6">
            <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Cliente</Text>
            <TextInput
                className="bg-white p-3 rounded-xl border border-gray-200 mb-6 font-bold text-lg"
                placeholder="Nombre del Cliente..."
                value={clientName}
                onChangeText={setClientName}
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
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500">Subtotal Estimado</Text>
                    <Text className="font-bold text-gray-800 text-lg">${totals.subtotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={() => setStep(3)} className="bg-blue-600 p-4 rounded-xl items-center mt-2">
                    <Text className="text-white font-bold text-lg">Continuar a Revisión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // STEP 3: REVIEW
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

            {/* Tax Toggle */}
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

            {/* Totals Card */}
            <View className="bg-gray-900 p-6 rounded-2xl shadow-xl">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Subtotal</Text>
                    <Text className="text-white font-bold">${totals.subtotal.toFixed(2)}</Text>
                </View>
                {includeTax && (
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-400">IVA (16%)</Text>
                        <Text className="text-white font-bold">${totals.tax.toFixed(2)}</Text>
                    </View>
                )}
                <View className="h-px bg-gray-700 my-2" />
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white text-lg font-bold">Total Neto</Text>
                    <Text className="text-green-400 text-3xl font-bold">${totals.total.toFixed(2)}</Text>
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
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Item Picker Modal */}
            <Modal visible={pickerVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-slate-50 p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-800">Agregar Concepto</Text>
                        <TouchableOpacity onPress={() => setPickerVisible(false)}>
                            <Text className="text-blue-600 font-bold">Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={ITEM_DATABASE}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => addItem(item)}
                                className="bg-white p-4 rounded-xl mb-3 border border-gray-100 flex-row justify-between items-center"
                            >
                                <View>
                                    <Text className="font-bold text-gray-800">{item.description}</Text>
                                    <Text className="text-gray-400 text-xs">{item.type} • ${item.unitCost} costo base</Text>
                                </View>
                                <Ionicons name="add-circle" size={28} color="#2563EB" />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}
