import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCapsules, completeCapsule, TrainingCapsule } from '../../../services/training-service';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile } from '../../../services/user-service';

export default function TrainingFeed() {
    const router = useRouter();
    const { user } = useAuth();

    const [capsules, setCapsules] = useState<TrainingCapsule[]>([]);
    const [completedIds, setCompletedIds] = useState<string[]>([]); // Simulation of state
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        const data = await getCapsules();
        setCapsules(data);
        // In real app we would load 'completedIds' from Firestore user subcollection
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleComplete = async (capsule: TrainingCapsule) => {
        if (completedIds.includes(capsule.id)) {
            Alert.alert('Completado', 'Ya aprendiste este tema.');
            return;
        }

        try {
            setProcessingId(capsule.id);
            // Simulate reading "content"
            await new Promise(resolve => setTimeout(resolve, 1000));

            const earned = await completeCapsule(user!.uid, capsule.id);
            setCompletedIds([...completedIds, capsule.id]);

            Alert.alert('¡Excelente!', `Has ganado ${earned} Tokens por capacitarte.`);
        } catch (error: any) {
            // If already completed in backend but local state out of sync
            if (error.message.includes('Ya completaste')) {
                setCompletedIds([...completedIds, capsule.id]);
            }
            Alert.alert('Info', error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const renderCapsule = ({ item }: { item: TrainingCapsule }) => {
        const isCompleted = completedIds.includes(item.id);

        return (
            <TouchableOpacity
                onPress={() => handleComplete(item)} // Simplification: Tapping simulates "Watching & Completing"
                disabled={!!processingId || isCompleted}
                className={`bg-white rounded-xl mb-4 p-4 border flex-row items-center ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100 shadow-sm'}`}
            >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isCompleted ? 'bg-green-100' : 'bg-indigo-100'}`}>
                    <Ionicons
                        name={item.thumbnail as any}
                        size={24}
                        color={isCompleted ? '#16A34A' : '#4F46E5'}
                    />
                </View>

                <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                        <Text className={`font-bold text-base flex-1 mr-2 ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                            {item.title}
                        </Text>
                        {isCompleted && <Ionicons name="checkmark-circle" size={20} color="#16A34A" />}
                    </View>

                    <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>{item.description}</Text>

                    <View className="flex-row items-center">
                        <View className="bg-gray-100 px-2 py-0.5 rounded mr-2">
                            <Text className="text-gray-500 text-[10px]">{item.duration}</Text>
                        </View>
                        {!isCompleted && (
                            <Text className="text-yellow-600 font-bold text-xs">+ {item.rewardTokens} Tokens</Text>
                        )}
                    </View>
                </View>

                {processingId === item.id && (
                    <View className="absolute inset-0 bg-white/80 items-center justify-center rounded-xl">
                        <ActivityIndicator color="#4F46E5" />
                        <Text className="text-indigo-600 font-bold text-xs mt-1">Aprendiendo...</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const progress = completedIds.length / (capsules.length || 1);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-indigo-900 pt-12 pb-6 px-4 shadow-lg rounded-b-[30px] z-10">
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white">Capacitación Ligera</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Progress Card */}
                <View className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-indigo-100 font-bold text-xs">TU PROGRESO</Text>
                        <Text className="text-yellow-400 font-bold text-xs">{completedIds.length}/{capsules.length} COMPLETADO</Text>
                    </View>
                    <View className="h-2 bg-indigo-900/50 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </View>
                    <Text className="text-indigo-200 text-[10px] mt-2">
                        Completa todos los módulos para obtener la Insignia "Técnico Certificado".
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                <Text className="font-bold text-gray-800 text-lg mb-4">Módulos Disponibles</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
                ) : (
                    <FlatList
                        data={capsules}
                        keyExtractor={item => item.id}
                        renderItem={renderCapsule}
                        scrollEnabled={false} // Handled by parent ScrollView
                    />
                )}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
