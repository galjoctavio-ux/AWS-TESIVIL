import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { getClients, ClientData } from '../../../services/clients-service';
import { saveQuote, QuoteItem, QuoteData, calculateQuoteTotals, formatCurrency } from '../../../services/quotes-service';
import { generateQuotePDF } from '../../../services/pdf-generator';
import { Ionicons } from '@expo/vector-icons';

export default function NewQuote() {
    const router = useRouter();
    const { user } = useAuth();

    // Steps: 1=Client, 2=Items
    const [step, setStep] = useState(1);

    // Client Selection
    const [clients, setClients] = useState<(ClientData & { id: string })[]>([]);
    const [selectedClient, setSelectedClient] = useState<(ClientData & { id: string }) | null>(null);

    // Quote Items
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [itemType, setItemType] = useState<'Labor' | 'Material'>('Material');
    const [itemDesc, setItemDesc] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemQty, setItemQty] = useState('1');

    // Quote Settings
    const [requiresInvoice, setRequiresInvoice] = useState(false);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    // Calculated totals
    const totals = calculateQuoteTotals(items, requiresInvoice);

    useEffect(() => {
        if (user) {
            getClients(user.uid).then((data) => {
                setClients(data as (ClientData & { id: string })[]);
            });
        }
    }, [user]);

    const addItem = () => {
        if (!itemDesc.trim() || !itemPrice) {
            Alert.alert('Error', 'Ingresa descripción y precio');
            return;
        }

        const price = parseFloat(itemPrice) || 0;
        const qty = parseInt(itemQty) || 1;

        const newItem: QuoteItem = {
            id: Date.now().toString(),
            description: itemDesc.trim(),
            quantity: qty,
            unitCost: price,
            type: itemType
        };

        setItems([...items, newItem]);
        setItemDesc('');
        setItemPrice('');
        setItemQty('1');
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async (generatePdf: boolean = false) => {
        if (!selectedClient || items.length === 0) {
            Alert.alert('Error', 'Selecciona un cliente y agrega al menos un item');
            return;
        }

        try {
            setSaving(true);

            const quoteData: Omit<QuoteData, 'createdAt'> = {
                userId: user?.uid || '',
                clientName: selectedClient.name,
                // Extra fields for PDF stored in notes or we need to expand interface. For now, basic:
                items,
                subtotal: totals.subtotal,
                tax: totals.tax, // Changed from iva
                total: totals.total,
                requires_invoice: requiresInvoice,
                validity_days: 15,
                status: 'Draft',
                notes
            };

            const quoteId = await saveQuote(quoteData);

            if (generatePdf) {
                await generateQuotePDF({
                    quote: { ...quoteData, id: quoteId, createdAt: new Date() },
                    client: selectedClient,
                    technicianEmail: user?.email || 'Técnico'
                });
            }

            Alert.alert(
                'Éxito',
                generatePdf ? 'Cotización guardada y PDF generado' : 'Cotización guardada',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la cotización');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const renderHeader = () => (
        <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800">Nueva Cotización</Text>
            <View className="flex-row mt-2">
                {[1, 2].map(i => (
                    <View key={i} className={`h-2 flex-1 rounded-full mx-1 ${step >= i ? 'bg-green-600' : 'bg-gray-200'}`} />
                ))}
            </View>
            <Text className="text-center text-gray-500 mt-2">
                {step === 1 ? 'Seleccionar Cliente' : 'Agregar Conceptos'}
            </Text>
        </View>
    );

    // STEP 1: Client Selection
    const renderStep1 = () => (
        <View className="flex-1">
            <Text className="text-lg font-semibold mb-4 text-gray-700">¿Para quién es la cotización?</Text>
            <FlatList
                data={clients}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => { setSelectedClient(item); setStep(2); }}
                        className="bg-white p-4 rounded-xl mb-3 border border-gray-100 flex-row items-center"
                    >
                        <View className="bg-green-100 rounded-full p-2 mr-3">
                            <Ionicons name="person" size={20} color="#16A34A" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800">{item.name}</Text>
                            <Text className="text-gray-500 text-xs">{item.address || 'Sin dirección'}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No tienes clientes registrados.</Text>}
            />
        </View>
    );

    // STEP 2: Add Items
    const renderStep2 = () => (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Client Summary */}
            <View className="bg-green-50 p-4 rounded-xl mb-4">
                <Text className="font-bold text-green-800">Cliente: {selectedClient?.name}</Text>
                {selectedClient?.phone && <Text className="text-green-600 text-sm">📞 {selectedClient.phone}</Text>}
            </View>

            {/* Item Type Toggle */}
            <View className="flex-row mb-3 bg-gray-100 rounded-xl p-1">
                <TouchableOpacity
                    onPress={() => setItemType('Labor')}
                    className={`flex-1 py-2 rounded-lg ${itemType === 'Labor' ? 'bg-white shadow-sm' : ''}`}
                >
                    <Text className={`text-center font-medium ${itemType === 'Labor' ? 'text-green-600' : 'text-gray-500'}`}>
                        🔧 Mano de Obra
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setItemType('Material')}
                    className={`flex-1 py-2 rounded-lg ${itemType === 'Material' ? 'bg-white shadow-sm' : ''}`}
                >
                    <Text className={`text-center font-medium ${itemType === 'Material' ? 'text-green-600' : 'text-gray-500'}`}>
                        📦 Material
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Add Item Form */}
            <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100">
                <TextInput
                    className="bg-gray-50 p-3 rounded-lg mb-2"
                    placeholder={itemType === 'Labor' ? "Ej: Revisión General" : "Ej: Gas R410A"}
                    value={itemDesc}
                    onChangeText={setItemDesc}
                />
                <View className="flex-row gap-2">
                    <TextInput
                        className="bg-gray-50 p-3 rounded-lg flex-1"
                        placeholder="Precio $"
                        keyboardType="numeric"
                        value={itemPrice}
                        onChangeText={setItemPrice}
                    />
                    {itemType === 'Material' && (
                        <TextInput
                            className="bg-gray-50 p-3 rounded-lg w-20"
                            placeholder="Qty"
                            keyboardType="numeric"
                            value={itemQty}
                            onChangeText={setItemQty}
                        />
                    )}
                    <TouchableOpacity
                        onPress={addItem}
                        className="bg-green-600 p-3 rounded-lg justify-center"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Items List */}
            {items.length > 0 && (
                <View className="mb-4">
                    <Text className="text-lg font-semibold mb-2 text-gray-700">Conceptos ({items.length})</Text>
                    {items.map((item, index) => (
                        <View key={index} className="bg-white p-3 rounded-xl mb-2 flex-row items-center border border-gray-100">
                            <Text className="text-lg mr-2">{item.type === 'Labor' ? '🔧' : '📦'}</Text>
                            <View className="flex-1">
                                <Text className="font-medium text-gray-800">{item.description}</Text>
                                <Text className="text-gray-500 text-xs">
                                    {item.quantity > 1 ? `${item.quantity} x ${formatCurrency(item.unitCost)}` : formatCurrency(item.unitCost)}
                                </Text>
                            </View>
                            <Text className="font-bold text-green-600 mr-2">{formatCurrency(calculateQuoteTotals([item], false).subtotal)}</Text>
                            <TouchableOpacity onPress={() => removeItem(index)}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* Invoice Toggle */}
            <View className="bg-white p-4 rounded-xl mb-4 flex-row items-center justify-between border border-gray-100">
                <Text className="text-gray-700 font-medium">¿Cliente requiere factura?</Text>
                <Switch
                    value={requiresInvoice}
                    onValueChange={setRequiresInvoice}
                    trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                    thumbColor={requiresInvoice ? '#16A34A' : '#9CA3AF'}
                />
            </View>

            {/* Notes */}
            <TextInput
                className="bg-white p-4 rounded-xl border border-gray-100 mb-4 h-20"
                placeholder="Notas adicionales (opcional)"
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
            />

            {/* Totals Summary */}
            <View className="bg-gray-800 p-4 rounded-xl mb-4">
                {requiresInvoice ? (
                    <>
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-gray-400">Subtotal (Base)</Text>
                            <Text className="text-white">{formatCurrency(totals.subtotal)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">IVA (16%)</Text>
                            <Text className="text-white">{formatCurrency(totals.tax)}</Text>
                        </View>
                    </>
                ) : null}
                <View className="flex-row justify-between border-t border-gray-600 pt-2">
                    <Text className="text-white font-bold text-lg">TOTAL</Text>
                    <Text className="text-green-400 font-bold text-xl">{formatCurrency(totals.total)}</Text>
                </View>
                <Text className="text-gray-500 text-xs mt-1">
                    {requiresInvoice ? '* Desglose para facturación' : '* Precios con IVA incluido'}
                </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-10">
                <TouchableOpacity
                    onPress={() => handleSave(false)}
                    disabled={saving || items.length === 0}
                    className={`flex-1 bg-gray-600 p-4 rounded-xl items-center ${saving || items.length === 0 ? 'opacity-50' : ''}`}
                >
                    <Text className="text-white font-bold">Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleSave(true)}
                    disabled={saving || items.length === 0}
                    className={`flex-1 bg-green-600 p-4 rounded-xl items-center flex-row justify-center ${saving || items.length === 0 ? 'opacity-50' : ''}`}
                >
                    <Ionicons name="document-text" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Generar PDF</Text>
                </TouchableOpacity>
            </View>

            {/* Back Button */}
            <TouchableOpacity onPress={() => setStep(1)} className="p-4 items-center mb-8">
                <Text className="text-gray-500">Cambiar Cliente</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-slate-50 p-6 pt-12">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
                <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>

            {renderHeader()}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
        </KeyboardAvoidingView>
    );
}
