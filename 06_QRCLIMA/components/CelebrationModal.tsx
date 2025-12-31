import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CelebrationModalProps {
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    subMessage?: string;
}

const { width } = Dimensions.get('window');

export default function CelebrationModal({
    isVisible,
    onClose,
    title = '¡Felicidades! 🎉',
    message = 'Has completado tu perfil al 100%',
    subMessage = 'Disfruta 3 días de PRO completamente gratis',
}: CelebrationModalProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const confettiAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            // Reset animations
            scaleAnim.setValue(0);
            confettiAnim.setValue(0);

            // Start animations
            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(confettiAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isVisible]);

    const confettiElements = ['🎊', '⭐', '✨', '🌟', '💫', '🎉'];

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 items-center justify-center px-6">
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                        width: width - 48,
                    }}
                >
                    {/* Main Card */}
                    <View className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                        {/* Header */}
                        <View className="bg-green-600 pt-8 pb-12 px-6 items-center">
                            {/* Floating Confetti */}
                            <View className="absolute top-0 left-0 right-0 flex-row justify-around pt-4">
                                {confettiElements.map((emoji, index) => (
                                    <Animated.Text
                                        key={index}
                                        style={{
                                            fontSize: 24,
                                            opacity: confettiAnim,
                                            transform: [
                                                {
                                                    translateY: confettiAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [-20, 0],
                                                    }),
                                                },
                                            ],
                                        }}
                                    >
                                        {emoji}
                                    </Animated.Text>
                                ))}
                            </View>

                            {/* Trophy Icon */}
                            <View className="bg-white/20 w-24 h-24 rounded-full items-center justify-center mb-4">
                                <Text className="text-5xl">🏆</Text>
                            </View>

                            {/* Title */}
                            <Text className="text-white text-2xl font-bold text-center">
                                {title}
                            </Text>
                        </View>

                        {/* Content */}
                        <View className="px-6 py-6 items-center">
                            <Text className="text-gray-800 text-lg font-semibold text-center mb-2">
                                {message}
                            </Text>

                            {/* PRO Badge */}
                            <View className="bg-gradient-to-r flex-row items-center bg-amber-100 rounded-full px-4 py-2 mb-4">
                                <Ionicons name="star" size={18} color="#F59E0B" />
                                <Text className="text-amber-700 font-bold ml-2">3 días PRO GRATIS</Text>
                                <Ionicons name="star" size={18} color="#F59E0B" />
                            </View>

                            <Text className="text-gray-500 text-center text-sm mb-6">
                                {subMessage}
                            </Text>

                            {/* Features unlocked */}
                            <View className="bg-gray-50 rounded-2xl p-4 w-full mb-4">
                                <Text className="text-gray-600 font-semibold text-center mb-3">
                                    Ahora tienes acceso a:
                                </Text>
                                <View className="space-y-2">
                                    <View className="flex-row items-center">
                                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                        <Text className="text-gray-700 ml-2">Cotizador PRO ilimitado</Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                        <Text className="text-gray-700 ml-2">Distancia con tráfico real</Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                        <Text className="text-gray-700 ml-2">PDFs sin marca de agua</Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                        <Text className="text-gray-700 ml-2">Radar de precios completo</Text>
                                    </View>
                                </View>
                            </View>

                            {/* CTA Button */}
                            <TouchableOpacity
                                onPress={onClose}
                                className="bg-green-600 w-full py-4 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold text-lg">
                                    ¡Empezar a disfrutar! 🚀
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
