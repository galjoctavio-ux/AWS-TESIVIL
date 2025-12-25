import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { UserProfile, getProfileCompletionCriteria, ProfileCriterion } from '../services/user-service';

interface ProfileCompletionGuideProps {
    profile: UserProfile | null;
    isVisible: boolean;
    onClose: () => void;
}

const CATEGORY_INFO = {
    profile: {
        title: '📋 Datos de Perfil',
        color: '#3B82F6',
        bgColor: 'bg-blue-50',
        description: 'Información básica de tu cuenta'
    },
    config: {
        title: '⚙️ Configuración',
        color: '#10B981',
        bgColor: 'bg-green-50',
        description: 'Personaliza tu experiencia'
    },
    achievement: {
        title: '🏆 Logros de Uso',
        color: '#F59E0B',
        bgColor: 'bg-amber-50',
        description: 'Completa estos pasos para dominar QRclima'
    },
};

export default function ProfileCompletionGuide({ profile, isVisible, onClose }: ProfileCompletionGuideProps) {
    const router = useRouter();
    const criteria = profile ? getProfileCompletionCriteria(profile) : [];

    const completedCount = criteria.filter(c => c.completed).length;
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const completedWeight = criteria.filter(c => c.completed).reduce((sum, c) => sum + c.weight, 0);
    const percentage = Math.round((completedWeight / totalWeight) * 100);

    const groupedCriteria = {
        profile: criteria.filter(c => c.category === 'profile'),
        config: criteria.filter(c => c.category === 'config'),
        achievement: criteria.filter(c => c.category === 'achievement'),
    };

    const handleItemPress = (item: ProfileCriterion) => {
        if (item.route && !item.completed) {
            onClose();
            router.push(item.route as any);
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="bg-blue-600 px-5 pt-4 pb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-bold">Guía de Perfil</Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Summary */}
                    <View className="bg-white/20 rounded-2xl p-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-white font-medium">Progreso total</Text>
                            <Text className="text-white text-2xl font-bold">{percentage}%</Text>
                        </View>
                        <View className="h-3 bg-white/30 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </View>
                        <Text className="text-white/80 text-sm mt-2">
                            {completedCount} de {criteria.length} pasos completados
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {Object.entries(groupedCriteria).map(([category, items]) => {
                        const info = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
                        const categoryCompleted = items.filter(i => i.completed).length;
                        const categoryTotal = items.length;

                        return (
                            <View key={category} className="px-4 pt-5">
                                {/* Category Header */}
                                <View className="mb-3">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-lg font-bold text-gray-800">
                                            {info.title}
                                        </Text>
                                        <Text className="text-gray-500 text-sm">
                                            {categoryCompleted}/{categoryTotal}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-sm">{info.description}</Text>
                                </View>

                                {/* Items */}
                                <View className={`${info.bgColor} rounded-2xl overflow-hidden`}>
                                    {items.map((item, index) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => handleItemPress(item)}
                                            disabled={item.completed || !item.route}
                                            className={`flex-row items-center p-4 ${index < items.length - 1 ? 'border-b border-gray-200/50' : ''
                                                } ${item.completed ? 'opacity-60' : ''}`}
                                        >
                                            {/* Icon */}
                                            <View
                                                className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${item.completed ? 'bg-green-500' : 'bg-white'
                                                    }`}
                                            >
                                                {item.completed ? (
                                                    <Ionicons name="checkmark" size={22} color="white" />
                                                ) : (
                                                    <Ionicons
                                                        name={item.icon as any}
                                                        size={20}
                                                        color={info.color}
                                                    />
                                                )}
                                            </View>

                                            {/* Text */}
                                            <View className="flex-1">
                                                <Text className={`font-semibold ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                                                    }`}>
                                                    {item.label}
                                                </Text>
                                                <Text className="text-gray-500 text-xs">
                                                    {item.description} • +{item.weight}%
                                                </Text>
                                            </View>

                                            {/* Arrow for incomplete items with routes */}
                                            {!item.completed && item.route && (
                                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        );
                    })}

                    {/* Motivational Message */}
                    {/* Motivational Message */}
                    {percentage === 100 ? (
                        <View className="mx-4 mt-6 bg-green-50 rounded-2xl p-5 items-center">
                            <Text className="text-4xl mb-2">🎉</Text>
                            <Text className="text-green-700 font-bold text-lg text-center">
                                ¡Felicidades!
                            </Text>
                            <Text className="text-green-600 font-medium text-center text-sm mt-1">
                                Has ganado 3 días PRO gratis
                            </Text>
                        </View>
                    ) : (
                        <View className="mx-4 mt-6 bg-blue-50 rounded-2xl p-5 border border-blue-100">
                            <Text className="text-blue-700 font-bold text-center text-base mb-1">
                                🎁 Recompensa Exclusiva
                            </Text>
                            <Text className="text-blue-600 text-center text-sm">
                                Completa tu perfil y gana <Text className="font-bold">3 días de PRO gratis</Text>
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
}
