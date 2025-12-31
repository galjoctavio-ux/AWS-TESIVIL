import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import {
    getConcepts,
    CotizadorConcept,
    CotizadorQuoteItem,
    formatCurrency
} from '../../../services/cotizador-service';

interface SelectedItem extends CotizadorConcept {
    quantity: number;
    total: number;
}

export default function SelectConceptsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams<{
        clientId: string;
        clientName: string;
        clientPhone?: string;
        clientAddress?: string;
    }>();

    const [concepts, setConcepts] = useState<CotizadorConcept[]>([]);
    const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
    const [loading, setLoading] = useState(true);

    const loadConcepts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const loaded = await getConcepts(user.uid);
            setConcepts(loaded);
        } catch (e) {
            console.error('Error loading concepts:', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadConcepts();
        }, [user])
    );

    const toggleItem = (concept: CotizadorConcept) => {
        const newMap = new Map(selectedItems);
        if (newMap.has(concept.id!)) {
            newMap.delete(concept.id!);
        } else {
            newMap.set(concept.id!, {
                ...concept,
                quantity: 1,
                total: concept.unitPrice
            });
        }
        setSelectedItems(newMap);
    };

    const updateQuantity = (conceptId: string, delta: number) => {
        const newMap = new Map(selectedItems);
        const item = newMap.get(conceptId);
        if (item) {
            const newQuantity = Math.max(1, item.quantity + delta);
            newMap.set(conceptId, {
                ...item,
                quantity: newQuantity,
                total: item.unitPrice * newQuantity
            });
            setSelectedItems(newMap);
        }
    };

    const grandTotal = Array.from(selectedItems.values()).reduce((sum, item) => sum + item.total, 0);

    const handleContinue = () => {
        if (selectedItems.size === 0) {
            Alert.alert('Atención', 'Selecciona al menos un concepto');
            return;
        }

        // Convert selected items to quote items format
        const quoteItems: CotizadorQuoteItem[] = Array.from(selectedItems.values()).map(item => ({
            conceptId: item.id!,
            code: item.code,
            description: item.description,
            type: item.type,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            total: item.total
        }));

        router.push({
            pathname: '/(app)/cotizador/quote-summary',
            params: {
                clientId: params.clientId,
                clientName: params.clientName,
                clientPhone: params.clientPhone || '',
                clientAddress: params.clientAddress || '',
                items: JSON.stringify(quoteItems),
                total: grandTotal.toString()
            }
        });
    };

    // Separate concepts by type
    const moItems = concepts.filter(c => c.type === 'MO');
    const mtItems = concepts.filter(c => c.type === 'MT');

    const renderConcept = ({ item }: { item: CotizadorConcept }) => {
        const isSelected = selectedItems.has(item.id!);
        const selectedItem = selectedItems.get(item.id!);

        return (
            <TouchableOpacity
                className={`p-4 rounded-xl mb-2 border-2 ${isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-100'}`}
                onPress={() => toggleItem(item)}
            >
                <View className="flex-row items-center">
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <View className={`px-1.5 py-0.5 rounded mr-2 ${item.type === 'MO' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                                <Text className={`text-[9px] font-bold ${item.type === 'MO' ? 'text-purple-700' : 'text-orange-700'}`}>
                                    {item.code}
                                </Text>
                            </View>
                            <Text className="font-medium text-gray-800 flex-1" numberOfLines={1}>{item.description}</Text>
                        </View>
                    </View>

                    <Text className="font-bold text-gray-700 ml-2">{formatCurrency(item.unitPrice)}</Text>
                </View>

                {/* Quantity selector when selected */}
                {isSelected && selectedItem && (
                    <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-green-200">
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                                onPress={() => updateQuantity(item.id!, -1)}
                            >
                                <Ionicons name="remove" size={18} color="#374151" />
                            </TouchableOpacity>
                            <Text className="mx-4 font-bold text-lg text-gray-800">{selectedItem.quantity}</Text>
                            <TouchableOpacity
                                className="w-8 h-8 bg-green-500 rounded-full items-center justify-center"
                                onPress={() => updateQuantity(item.id!, 1)}
                            >
                                <Ionicons name="add" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text className="font-bold text-green-600 text-lg">{formatCurrency(selectedItem.total)}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderSection = (title: string, icon: string, items: CotizadorConcept[], color: string) => {
        if (items.length === 0) return null;

        return (
            <View className="mb-4">
                <Text className={`font-bold text-sm mb-2 ${color}`}>{icon} {title}</Text>
                {items.map(item => (
                    <View key={item.id}>
                        {renderConcept({ item })}
                    </View>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View className="flex-1 mx-4">
                        <Text className="text-lg font-bold text-gray-800 text-center">Seleccionar Conceptos</Text>
                        <Text className="text-xs text-gray-500 text-center">Para: {params.clientName}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            {/* Concepts List */}
            <FlatList
                className="flex-1 px-4 pt-4"
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={
                    <>
                        {renderSection('MANO DE OBRA', '🔧', moItems, 'text-purple-600')}
                        {renderSection('MATERIALES', '📦', mtItems, 'text-orange-600')}
                    </>
                }
                ListEmptyComponent={
                    concepts.length === 0 ? (
                        <View className="items-center justify-center mt-16 opacity-60">
                            <Ionicons name="construct-outline" size={64} color="#9CA3AF" />
                            <Text className="text-gray-500 mt-4 text-center font-medium">
                                No tienes conceptos cargados
                            </Text>
                            <TouchableOpacity
                                className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
                                onPress={() => router.push('/(app)/cotizador/concepts')}
                            >
                                <Text className="text-white font-bold">Agregar Conceptos</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            {/* Footer with Total */}
            {selectedItems.size > 0 && (
                <View className="bg-white border-t border-gray-200 p-4" style={{ paddingBottom: insets.bottom + 16 }}>
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-600">{selectedItems.size} concepto{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}</Text>
                        <Text className="text-2xl font-bold text-green-600">{formatCurrency(grandTotal)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleContinue}
                        className="bg-green-600 py-4 rounded-xl"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Continuar →
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
