import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getThreads, getComments, addComment, markSolution, pinThread, getPinCost, SOSThread, SOSComment } from '../../../services/community-service';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, UserRank, isUserPro } from '../../../services/user-service';
import { formatTimeAgo } from '../../../utils/date-utils';

// Componente de Insignia según Rango
const RankBadge = ({ rank, isPro = false }: { rank: UserRank; isPro?: boolean }) => {
    const getBadgeConfig = () => {
        if (isPro) {
            return {
                icon: 'star' as const,
                label: 'PRO',
                bgColor: 'bg-amber-500',
                textColor: 'text-white',
                iconColor: '#FFFFFF',
            };
        }
        switch (rank) {
            case 'Experto':
                return {
                    icon: 'shield-checkmark' as const,
                    label: 'Experto',
                    bgColor: 'bg-purple-600',
                    textColor: 'text-white',
                    iconColor: '#FFFFFF',
                };
            case 'Técnico':
                return {
                    icon: 'construct' as const,
                    label: 'Técnico',
                    bgColor: 'bg-blue-500',
                    textColor: 'text-white',
                    iconColor: '#FFFFFF',
                };
            case 'Novato':
            default:
                return {
                    icon: 'leaf' as const,
                    label: 'Novato',
                    bgColor: 'bg-green-500',
                    textColor: 'text-white',
                    iconColor: '#FFFFFF',
                };
        }
    };

    const config = getBadgeConfig();

    return (
        <View className={`flex-row items-center px-2 py-0.5 rounded-full ${config.bgColor} ml-1`}>
            <Ionicons name={config.icon} size={10} color={config.iconColor} />
            <Text className={`text-[10px] font-bold ml-0.5 ${config.textColor}`}>{config.label}</Text>
        </View>
    );
};

export default function ThreadDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [thread, setThread] = useState<SOSThread | null>(null);
    const [comments, setComments] = useState<SOSComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        // In a real app we would getThreadById, but reuse getThreads for mock
        const result = await getThreads('recent', 1, 100); // Fallback
        const found = result.threads.find((t: SOSThread) => t.id === id);
        if (found) setThread(found);

        const loadedComments = await getComments(id as string);
        setComments(loadedComments);
        setLoading(false);
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const userProfile = await getUserProfile(user!.uid);

            await addComment({
                threadId: id as string,
                authorId: user!.uid,
                authorName: userProfile?.alias || 'Anon',
                authorRank: userProfile?.rank || 'Novato',
                ...(userProfile?.photoURL && { authorPhotoURL: userProfile.photoURL }),
                authorIsPro: isUserPro(userProfile),
                content: newComment.trim(),
            });

            setNewComment('');
            loadData(); // Refresh

        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo enviar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkSolution = async (commentId: string, authorId: string) => {
        Alert.alert(
            'Confirmar Solución',
            '¿Esta respuesta resolvió tu problema? Se cerrará el hilo y se premiará al autor.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, es la solución',
                    onPress: async () => {
                        try {
                            await markSolution(id as string, commentId, authorId);
                            loadData();
                            Alert.alert('¡Gracias!', 'Has cerrado este caso y premiado a tu compañero.');
                        } catch (e) {
                            Alert.alert('Error', 'No se pudo marcar como solución');
                        }
                    }
                }
            ]
        );
    };

    const handlePinThread = async () => {
        const cost = getPinCost();
        Alert.alert(
            '📌 Fijar Caso',
            `Fijar tu caso lo mostrará al inicio de la lista por 24 horas.\n\nCosto: ${cost} tokens`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: `Pagar ${cost} tokens`,
                    onPress: async () => {
                        const result = await pinThread(id as string, user!.uid);
                        if (result.success) {
                            Alert.alert('¡Éxito!', result.message);
                            loadData();
                        } else {
                            Alert.alert('Error', result.message);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-slate-50">
            <ActivityIndicator size="large" color="#2563EB" />
        </View>
    );

    if (!thread) return (
        <View className="flex-1 justify-center items-center bg-slate-50">
            <Text>Hilo no encontrado</Text>
        </View>
    );

    const isAuthor = user?.uid === thread.authorId;

    return (
        <KeyboardAvoidingView
            behavior="padding"
            className="flex-1 bg-slate-50"
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
        >
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800 flex-1" numberOfLines={1}>{thread.title}</Text>
            </View>

            <ScrollView className="flex-1">
                {/* Main Post */}
                <View className="bg-white p-6 mb-2">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-row items-center">
                            {thread.authorPhotoURL ? (
                                <Image
                                    source={{ uri: thread.authorPhotoURL }}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                            ) : (
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${thread.authorRank === 'Experto' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                    <Text className="font-bold text-gray-700">{thread.authorName.charAt(0)}</Text>
                                </View>
                            )}
                            <View>
                                <View className="flex-row items-center">
                                    <Text className="font-bold text-gray-800">{thread.authorName}</Text>
                                    <RankBadge rank={thread.authorRank} isPro={thread.authorIsPro} />
                                </View>
                                <Text className="text-xs text-gray-500">{thread.brand} • {thread.model}</Text>
                            </View>
                        </View>
                        {thread.status === 'Resuelto' && (
                            <View className="bg-green-100 px-3 py-1 rounded-full">
                                <Text className="text-green-700 text-xs font-bold">Resuelto</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-xl font-bold text-gray-800 mb-4">{thread.title}</Text>
                    <Text className="text-gray-700 leading-6 text-base">{thread.content}</Text>

                    {/* Thread Image */}
                    {thread.imageUrl && (
                        <Image
                            source={{ uri: thread.imageUrl }}
                            className="w-full h-64 rounded-xl mt-4"
                            resizeMode="cover"
                        />
                    )}

                    {/* Pin Button - Only for author, if not already pinned and not resolved */}
                    {isAuthor && !thread.isPinned && thread.status !== 'Resuelto' && (
                        <TouchableOpacity
                            onPress={handlePinThread}
                            className="flex-row items-center justify-center bg-amber-100 py-3 mt-4 rounded-xl border border-amber-300"
                        >
                            <Ionicons name="pin" size={18} color="#D97706" />
                            <Text className="text-amber-700 font-bold ml-2">
                                Fijar caso ({getPinCost()} tokens)
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Pinned Indicator */}
                    {thread.isPinned && (
                        <View className="flex-row items-center justify-center bg-amber-100 py-2 mt-4 rounded-xl">
                            <Ionicons name="pin" size={16} color="#D97706" />
                            <Text className="text-amber-700 font-medium ml-2">📌 Este caso está fijado</Text>
                        </View>
                    )}
                </View>

                {/* Comments Header */}
                <View className="px-4 py-2">
                    <Text className="text-gray-500 font-bold uppercase text-xs">Respuestas ({comments.length})</Text>
                </View>

                {/* Comments List */}
                {comments.map((comment) => {
                    const isSolution = comment.isSolution;
                    const isPro = comment.authorIsPro && !isSolution;

                    return (
                        <View
                            key={comment.id}
                            className={
                                isSolution
                                    ? "p-4 mb-2 border-l-4 border-green-500 bg-green-50"
                                    : isPro
                                        ? "p-4 mb-2 border-l-4 border-amber-400 bg-amber-100"
                                        : "p-4 mb-2 border-l-4 border-transparent bg-white"
                            }
                        >
                            {comment.isSolution && (
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                                    <Text className="text-green-700 font-bold text-xs ml-1">Solución Aceptada</Text>
                                </View>
                            )}
                            <View className="flex-row items-center mb-2">
                                {comment.authorPhotoURL ? (
                                    <Image
                                        source={{ uri: comment.authorPhotoURL }}
                                        className="w-6 h-6 rounded-full mr-2"
                                    />
                                ) : (
                                    <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center mr-2">
                                        <Text className="text-[10px] font-bold text-gray-600">{comment.authorName.charAt(0)}</Text>
                                    </View>
                                )}
                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1 flex-wrap">
                                            <Text className="font-bold text-gray-700 text-sm">{comment.authorName}</Text>
                                            <RankBadge rank={comment.authorRank} isPro={comment.authorIsPro} />
                                        </View>
                                        <Text className="text-gray-400 text-xs ml-2">{formatTimeAgo(comment.createdAt)}</Text>
                                    </View>
                                </View>
                            </View>
                            <Text className="text-gray-800 mb-3">{comment.content}</Text>

                            {/* Actions */}
                            <View className="flex-row justify-between items-center">
                                <TouchableOpacity className="flex-row items-center">
                                    <Ionicons name="thumbs-up-outline" size={16} color="#9CA3AF" />
                                    <Text className="text-gray-400 text-xs ml-1">Util</Text>
                                </TouchableOpacity>

                                {/* Mark Solution Button (Only for Author available if not solved yet) */}
                                {isAuthor && thread.status !== 'Resuelto' && !comment.isSolution && (
                                    <TouchableOpacity
                                        onPress={() => handleMarkSolution(comment.id!, comment.authorId)}
                                        className="bg-green-100 px-3 py-1 rounded-full"
                                    >
                                        <Text className="text-green-700 text-xs font-bold">Marcar Solución</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}
                <View className="h-4" />
            </ScrollView>

            {/* Input Area */}
            {thread.status !== 'Resuelto' && (
                <View className="bg-white p-4 border-t border-gray-200 flex-row items-end">
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 mr-2 max-h-24 text-gray-800"
                        placeholder="Escribe una respuesta..."
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSendComment}
                        disabled={submitting || !newComment.trim()}
                        className={`w-12 h-12 rounded-full items-center justify-center ${submitting || !newComment.trim() ? 'bg-gray-300' : 'bg-blue-600'}`}
                    >
                        {submitting ? <ActivityIndicator color="white" size="small" /> : <Ionicons name="send" size={20} color="white" />}
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
