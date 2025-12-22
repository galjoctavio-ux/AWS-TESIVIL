import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import {
    addConcept,
    updateConcept,
    getConcepts,
    ConceptType,
    CotizadorConcept,
    getTechnicianPrefix
} from '../../../services/cotizador-service';

export default function AddConceptScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams<{ defaultType?: string; editId?: string }>();

    const [type, setType] = useState<ConceptType>((params.defaultType as ConceptType) || 'MO');
    const [description, setDescription] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [unit, setUnit] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [existingConcept, setExistingConcept] = useState<CotizadorConcept | null>(null);

    const isEditing = !!params.editId;

    // Load existing concept if editing
    useEffect(() => {
        const loadConcept = async () => {
            if (params.editId && user) {
                setLoading(true);
                try {
                    const concepts = await getConcepts(user.uid);
                    const found = concepts.find(c => c.id === params.editId);
                    if (found) {
                        setExistingConcept(found);
                        setType(found.type);
                        setDescription(found.description);
                        setUnitPrice(found.unitPrice.toString());
                        setUnit(found.unit || '');
                    }
                } catch (e) {
                    console.error('Error loading concept:', e);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadConcept();
    }, [params.editId, user]);

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Error', 'Debes iniciar sesión');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Ingresa una descripción');
            return;
        }

        const price = parseFloat(unitPrice);
        if (isNaN(price) || price <= 0) {
            Alert.alert('Error', 'Ingresa un precio válido mayor a 0');
            return;
        }

        setSaving(true);
        try {
            if (isEditing && params.editId) {
                // Update existing
                await updateConcept(params.editId, {
                    description: description.trim(),
                    unitPrice: price,
                    unit: unit.trim() || undefined,
                });
                Alert.alert('Éxito', 'Concepto actualizado correctamente', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                // Add new
                await addConcept({
                    technicianId: user.uid,
                    type,
                    description: description.trim(),
                    unitPrice: price,
                    unit: unit.trim() || undefined,
                });
                Alert.alert('Éxito', 'Concepto agregado correctamente', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error('Error saving concept:', error);
            Alert.alert('Error', 'No se pudo guardar el concepto');
        } finally {
            setSaving(false);
        }
    };

    const codePreview = user
        ? `${getTechnicianPrefix(user.uid)}-${type}-XXX`
        : '???-??-XXX';

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-slate-50"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">
                    {isEditing ? 'Editar Concepto' : 'Nuevo Concepto'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 px-4 pt-6">
                {/* Type Selector - Only for new concepts */}
                {!isEditing && (
                    <View className="mb-6">
                        <Text className="text-gray-600 font-medium mb-2">Tipo de concepto</Text>
                        <View className="flex-row">
                            <TouchableOpacity
                                className={`flex-1 py-4 rounded-l-xl border-2 ${type === 'MO' ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                                onPress={() => setType('MO')}
                            >
                                <Text className={`text-center font-bold ${type === 'MO' ? 'text-white' : 'text-gray-600'}`}>
                                    🔧 Mano de Obra
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`flex-1 py-4 rounded-r-xl border-2 ${type === 'MT' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
                                onPress={() => setType('MT')}
                            >
                                <Text className={`text-center font-bold ${type === 'MT' ? 'text-white' : 'text-gray-600'}`}>
                                    📦 Material
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Code Preview */}
                <View className="mb-6">
                    <Text className="text-gray-600 font-medium mb-2">Código (auto-generado)</Text>
                    <View className={`p-4 rounded-xl border-2 border-dashed ${type === 'MO' ? 'border-purple-300 bg-purple-50' : 'border-orange-300 bg-orange-50'}`}>
                        <Text className={`text-center font-mono font-bold text-lg ${type === 'MO' ? 'text-purple-700' : 'text-orange-700'}`}>
                            {isEditing && existingConcept ? existingConcept.code : codePreview}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <View className="mb-6">
                    <Text className="text-gray-600 font-medium mb-2">Descripción *</Text>
                    <TextInput
                        className="bg-white p-4 rounded-xl border border-gray-200 text-gray-800"
                        placeholder={type === 'MO' ? 'Ej: Instalación básica de minisplit' : 'Ej: Tubo de cobre 1/4"'}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Unit Price */}
                <View className="mb-6">
                    <Text className="text-gray-600 font-medium mb-2">Precio Unitario (MXN) *</Text>
                    <View className="flex-row items-center bg-white rounded-xl border border-gray-200">
                        <Text className="text-gray-400 text-lg pl-4">$</Text>
                        <TextInput
                            className="flex-1 p-4 text-gray-800 text-lg"
                            placeholder="0.00"
                            value={unitPrice}
                            onChangeText={setUnitPrice}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* Unit (Optional) */}
                <View className="mb-8">
                    <Text className="text-gray-600 font-medium mb-2">Unidad (opcional)</Text>
                    <TextInput
                        className="bg-white p-4 rounded-xl border border-gray-200 text-gray-800"
                        placeholder={type === 'MO' ? 'Ej: servicio, hora' : 'Ej: pieza, metro, kg'}
                        value={unit}
                        onChangeText={setUnit}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`py-4 rounded-xl mb-8 ${saving ? 'bg-gray-400' : type === 'MO' ? 'bg-purple-600' : 'bg-orange-500'}`}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">
                            {isEditing ? 'Guardar Cambios' : 'Agregar Concepto'}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
