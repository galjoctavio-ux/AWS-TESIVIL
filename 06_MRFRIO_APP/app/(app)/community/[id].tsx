import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getThreads, getComments, addComment, markSolution, SOSThread, SOSComment } from '../../../services/community-service';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile } from '../../../services/user-service';

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
        const allThreads = await getThreads('recent'); // Fallback
        const found = allThreads.find(t => t.id === id);
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-slate-50">
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
                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${thread.authorRank === 'Pro' ? 'bg-yellow-100' : 'bg-blue-100'
                                }`}>
                                <Text className="font-bold text-gray-700">{thread.authorName.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text className="font-bold text-gray-800">{thread.authorName}</Text>
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
                </View>

                {/* Comments Header */}
                <View className="px-4 py-2">
                    <Text className="text-gray-500 font-bold uppercase text-xs">Respuestas ({comments.length})</Text>
                </View>

                {/* Comments List */}
                {comments.map((comment) => (
                    <View key={comment.id} className={`bg-white p-4 mb-2 border-l-4 ${comment.isSolution ? 'border-green-500 bg-green-50' : 'border-transparent'}`}>
                        {comment.isSolution && (
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                                <Text className="text-green-700 font-bold text-xs ml-1">Solución Aceptada</Text>
                            </View>
                        )}
                        <View className="flex-row justify-between mb-2">
                            <Text className="font-bold text-gray-700 text-sm">{comment.authorName} <Text className="text-gray-400 font-normal">• {comment.authorRank}</Text></Text>
                            <Text className="text-gray-400 text-xs">Hace un momento</Text>
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
                                    onPress={() => handleMarkSolution(comment.id, comment.authorId)}
                                    className="bg-green-100 px-3 py-1 rounded-full"
                                >
                                    <Text className="text-green-700 text-xs font-bold">Marcar Solución</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
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
