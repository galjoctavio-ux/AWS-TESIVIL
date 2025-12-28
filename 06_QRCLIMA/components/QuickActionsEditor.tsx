import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    ALL_QUICK_ACTIONS,
    QuickAction,
    getPinnedActions,
    savePinnedActions,
    resetQuickActions
} from '../services/quick-actions-service';

interface QuickActionsEditorProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
}

const MAX_PINNED = 4;

export default function QuickActionsEditor({ visible, onClose, onSave }: QuickActionsEditorProps) {
    const [pinnedIds, setPinnedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            loadPinned();
        }
    }, [visible]);

    const loadPinned = async () => {
        setLoading(true);
        const pinned = await getPinnedActions();
        setPinnedIds(pinned);
        setLoading(false);
    };

    const togglePin = (actionId: string) => {
        if (pinnedIds.includes(actionId)) {
            // Unpin
            setPinnedIds(prev => prev.filter(id => id !== actionId));
        } else {
            // Pin (check max)
            if (pinnedIds.length >= MAX_PINNED) {
                Alert.alert(
                    'Máximo alcanzado',
                    `Solo puedes fijar hasta ${MAX_PINNED} accesos rápidos. Desfija uno primero.`
                );
                return;
            }
            setPinnedIds(prev => [...prev, actionId]);
        }
    };

    const handleSave = async () => {
        await savePinnedActions(pinnedIds);
        onSave();
        onClose();
    };

    const handleReset = () => {
        Alert.alert(
            'Restablecer',
            '¿Regresar al modo automático? Tus accesos se ordenarán por frecuencia de uso.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restablecer',
                    onPress: async () => {
                        await resetQuickActions();
                        setPinnedIds([]);
                        onSave();
                        onClose();
                    }
                }
            ]
        );
    };

    const renderAction = (action: QuickAction) => {
        const isPinned = pinnedIds.includes(action.id);
        const pinnedIndex = pinnedIds.indexOf(action.id);

        return (
            <TouchableOpacity
                key={action.id}
                onPress={() => togglePin(action.id)}
                className={`flex-row items-center p-4 rounded-2xl mb-2 border ${isPinned
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-100'
                    }`}
            >
                {/* Icon */}
                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${action.primary ? 'bg-blue-100' :
                        action.alert ? 'bg-red-100' :
                            action.color ? action.color.replace('bg-', 'bg-').replace('600', '100') :
                                'bg-gray-100'
                    }`}>
                    <Ionicons
                        name={action.icon as any}
                        size={24}
                        color={
                            action.primary ? '#2563EB' :
                                action.alert ? '#EF4444' :
                                    '#374151'
                        }
                    />
                </View>

                {/* Label */}
                <View className="flex-1">
                    <Text className={`font-bold ${isPinned ? 'text-blue-800' : 'text-gray-800'}`}>
                        {action.label}
                    </Text>
                    {isPinned && (
                        <Text className="text-blue-600 text-xs">
                            Fijado en posición {pinnedIndex + 1}
                        </Text>
                    )}
                </View>

                {/* Pin indicator */}
                <View className={`w-8 h-8 rounded-full items-center justify-center ${isPinned ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                    <Ionicons
                        name={isPinned ? 'pin' : 'pin-outline'}
                        size={16}
                        color={isPinned ? 'white' : '#9CA3AF'}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl max-h-[85%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
                        <View>
                            <Text className="text-xl font-bold text-gray-800">
                                Personalizar Accesos
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                Fija hasta {MAX_PINNED} accesos rápidos
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Info banner */}
                    <View className="mx-5 mt-4 bg-blue-50 p-3 rounded-xl flex-row items-center">
                        <Ionicons name="information-circle" size={20} color="#2563EB" />
                        <Text className="text-blue-700 text-xs ml-2 flex-1">
                            Los accesos no fijados se ordenarán automáticamente por frecuencia de uso.
                        </Text>
                    </View>

                    {/* Actions list */}
                    <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                        {/* Pinned section */}
                        {pinnedIds.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-500 font-medium text-sm mb-2">
                                    📌 FIJADOS ({pinnedIds.length}/{MAX_PINNED})
                                </Text>
                                {pinnedIds.map(id => {
                                    const action = ALL_QUICK_ACTIONS.find(a => a.id === id);
                                    return action ? renderAction(action) : null;
                                })}
                            </View>
                        )}

                        {/* Available section */}
                        <View className="mb-6">
                            <Text className="text-gray-500 font-medium text-sm mb-2">
                                ⚡ DISPONIBLES
                            </Text>
                            {ALL_QUICK_ACTIONS
                                .filter(a => !pinnedIds.includes(a.id))
                                .map(renderAction)}
                        </View>
                    </ScrollView>

                    {/* Footer buttons */}
                    <View className="p-5 border-t border-gray-100 flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleReset}
                            className="flex-1 py-4 rounded-xl bg-gray-100 items-center"
                        >
                            <Text className="text-gray-600 font-bold">Restablecer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            className="flex-1 py-4 rounded-xl bg-blue-600 items-center"
                        >
                            <Text className="text-white font-bold">Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
