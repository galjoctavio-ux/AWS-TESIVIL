import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import {
    getConcepts,
    deleteConcept,
    addConcept,
    CotizadorConcept,
    ConceptType,
    formatCurrency,
    getConceptTypeName
} from '../../../services/cotizador-service';

export default function ConceptsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [concepts, setConcepts] = useState<CotizadorConcept[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ConceptType>('MO');

    const loadConcepts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const loaded = await getConcepts(user.uid, activeTab);
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
        }, [user, activeTab])
    );

    const handleDelete = (concept: CotizadorConcept) => {
        Alert.alert(
            'Eliminar Concepto',
            `¿Estás seguro de eliminar "${concept.description}"?\n\nCódigo: ${concept.code}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        if (concept.id) {
                            const success = await deleteConcept(concept.id);
                            if (success) {
                                loadConcepts();
                            } else {
                                Alert.alert('Error', 'No se pudo eliminar el concepto');
                            }
                        }
                    }
                }
            ]
        );
    };


    const renderConcept = ({ item }: { item: CotizadorConcept }) => (
        <View className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <View className={`px-2 py-0.5 rounded mr-2 ${activeTab === 'MO' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                            <Text className={`text-[10px] font-bold ${activeTab === 'MO' ? 'text-purple-700' : 'text-orange-700'}`}>
                                {item.code}
                            </Text>
                        </View>
                    </View>
                    <Text className="font-medium text-gray-800 text-base">{item.description}</Text>
                    {item.unit && (
                        <Text className="text-gray-400 text-xs mt-1">Unidad: {item.unit}</Text>
                    )}
                </View>
                <View className="items-end">
                    <Text className="text-green-600 font-bold text-lg">{formatCurrency(item.unitPrice)}</Text>
                    <View className="flex-row mt-2">
                        <TouchableOpacity
                            className="p-2 mr-1"
                            onPress={() => router.push({
                                pathname: '/(app)/cotizador/add-concept',
                                params: { editId: item.id }
                            })}
                        >
                            <Ionicons name="pencil" size={18} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-2"
                            onPress={() => handleDelete(item)}
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );


    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pb-4 px-4 shadow-sm flex-row items-center justify-between" style={{ paddingTop: insets.top + 8 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Mis Conceptos</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View className="flex-row px-4 pt-4 pb-2">
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-l-xl border ${activeTab === 'MO' ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                    onPress={() => setActiveTab('MO')}
                >
                    <Text className={`text-center font-bold ${activeTab === 'MO' ? 'text-white' : 'text-gray-600'}`}>
                        🔧 Mano de Obra
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-r-xl border ${activeTab === 'MT' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
                    onPress={() => setActiveTab('MT')}
                >
                    <Text className={`text-center font-bold ${activeTab === 'MT' ? 'text-white' : 'text-gray-600'}`}>
                        📦 Materiales
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Concepts List + Recommendations */}
            <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
                ) : (
                    <>
                        {concepts.length === 0 ? (
                            <View className="items-center justify-center mt-16 opacity-60">
                                <Ionicons
                                    name={activeTab === 'MO' ? 'construct-outline' : 'cube-outline'}
                                    size={64}
                                    color="#9CA3AF"
                                />
                                <Text className="text-gray-500 mt-4 text-center font-medium">
                                    No tienes conceptos de {getConceptTypeName(activeTab)}
                                </Text>
                                <Text className="text-gray-400 text-xs text-center mt-1">
                                    Usa el botón + para agregar uno
                                </Text>
                            </View>
                        ) : (
                            concepts.map((concept) => (
                                <View key={concept.id || concept.code}>
                                    {renderConcept({ item: concept })}
                                </View>
                            ))
                        )}

                        <View className="h-32" />
                    </>
                )}
            </ScrollView>

            {/* FAB - Add Concept */}
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(app)/cotizador/add-concept',
                    params: { defaultType: activeTab }
                })}
                className={`absolute bottom-20 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg ${activeTab === 'MO' ? 'bg-purple-600' : 'bg-orange-500'}`}
                style={{ elevation: 5 }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
