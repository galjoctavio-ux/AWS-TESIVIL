import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    getTrainingModuleById,
    getQuizzesByModule,
    startReading,
    canTakeQuiz,
    submitQuiz,
    calculateReadingTime,
    TrainingModule,
    QuizQuestion
} from '../../../../services/training-service';
import {
    addComment,
    getCommentsWithReactions,
    reactToComment,
    CommentWithReactions
} from '../../../../services/training-community-service';
import { useAuth } from '../../../../context/AuthContext';

export default function ModuleViewer() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);

    const [module, setModule] = useState<TrainingModule | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [canQuiz, setCanQuiz] = useState(false);
    const [quizReason, setQuizReason] = useState('');
    const [remainingTime, setRemainingTime] = useState(0);
    const [scrolledToEnd, setScrolledToEnd] = useState(false);

    // Quiz state
    const [showQuiz, setShowQuiz] = useState(false);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState<{
        passed: boolean;
        score: number;
        tokensEarned: number;
        cooldownSeconds?: number;
    } | null>(null);

    // Comments/Debate state
    const [comments, setComments] = useState<CommentWithReactions[]>([]);
    const [newComment, setNewComment] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const [showDebate, setShowDebate] = useState(false);

    const loadModule = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const mod = await getTrainingModuleById(parseInt(id));
            setModule(mod);

            const quizzes = await getQuizzesByModule(parseInt(id));
            setQuestions(quizzes);
            setAnswers(new Array(quizzes.length).fill(-1));

            // Start reading tracking
            if (user?.uid && mod) {
                await startReading(user.uid, mod.id);
            }
        } catch (error) {
            console.error('Error loading module:', error);
        }
        setLoading(false);
    };

    const loadComments = async () => {
        if (!id) return;
        try {
            const data = await getCommentsWithReactions(parseInt(id));
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    useEffect(() => {
        loadModule();
        loadComments();
    }, [id]);

    // Check quiz availability periodically
    useEffect(() => {
        const checkQuiz = async () => {
            if (!user?.uid || !module) return;
            const result = await canTakeQuiz(user.uid, module.id, scrolledToEnd);
            setCanQuiz(result.allowed);
            setQuizReason(result.reason || '');
            setRemainingTime(result.remainingSeconds || 0);
        };

        checkQuiz();
        const interval = setInterval(checkQuiz, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [user?.uid, module, scrolledToEnd]);

    // Countdown timer
    useEffect(() => {
        if (remainingTime <= 0) return;
        const timer = setInterval(() => {
            setRemainingTime(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [remainingTime]);

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
        if (isAtEnd && !scrolledToEnd) {
            setScrolledToEnd(true);
        }
    };

    const handleStartQuiz = () => {
        if (!canQuiz) {
            Alert.alert('Aún no puedes hacer el quiz', quizReason);
            return;
        }
        setShowQuiz(true);
    };

    const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmitQuiz = async () => {
        if (!user?.uid || !module) return;
        if (answers.includes(-1)) {
            Alert.alert('Faltan respuestas', 'Por favor responde todas las preguntas');
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitQuiz(user.uid, module.id, answers);
            setQuizResult(result);
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar el quiz');
        }
        setSubmitting(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePostComment = async () => {
        if (!user?.uid || !module || !newComment.trim()) return;

        setPostingComment(true);
        try {
            const result = await addComment({
                moduleId: module.id,
                userId: user.uid,
                userName: user.displayName || 'Técnico Anónimo',
                content: newComment.trim()
            });

            if (result.success) {
                if (result.approved) {
                    Alert.alert(
                        '✅ Comentario publicado',
                        result.expertBadge
                            ? `¡Excelente aporte técnico! +${result.tokensEarned} tokens 🏆`
                            : `Tu comentario fue aprobado. +${result.tokensEarned} tokens`
                    );
                } else {
                    Alert.alert(
                        '❌ Comentario rechazado',
                        result.reason || 'Tu comentario no cumple con las normas de la comunidad.'
                    );
                }
                setNewComment('');
                loadComments();
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo publicar el comentario');
        }
        setPostingComment(false);
    };

    const handleReaction = async (postId: number, postAuthorId: string, reactionType: 'maestro' | 'tal_cual' | 'interesante') => {
        if (!user?.uid) return;

        const result = await reactToComment(postId, user.uid, reactionType, postAuthorId);
        if (result.success) {
            loadComments();
            if (result.tokensAwarded > 0) {
                // No mostramos nada porque los tokens se dieron al autor, no a quien reacciona
            }
        }
    };

    if (loading || !module) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="text-gray-500 mt-2">Cargando módulo...</Text>
            </View>
        );
    }

    // Quiz Result Screen
    if (quizResult) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center p-6">
                <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${quizResult.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Ionicons
                        name={quizResult.passed ? "checkmark-circle" : "close-circle"}
                        size={60}
                        color={quizResult.passed ? "#16A34A" : "#DC2626"}
                    />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                    {quizResult.passed ? '¡Excelente!' : 'Casi lo logras'}
                </Text>
                <Text className="text-gray-600 text-center mb-4">
                    {quizResult.passed
                        ? `Has completado el módulo y ganaste ${quizResult.tokensEarned} tokens.`
                        : 'Necesitas 100% de respuestas correctas. ¡Inténtalo de nuevo!'}
                </Text>
                <Text className="text-4xl font-bold mb-6" style={{ color: quizResult.passed ? '#16A34A' : '#DC2626' }}>
                    {quizResult.score}%
                </Text>
                {!quizResult.passed && quizResult.cooldownSeconds && (
                    <Text className="text-gray-500 text-sm mb-6">
                        Podrás reintentar en {Math.ceil(quizResult.cooldownSeconds / 60)} minutos
                    </Text>
                )}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-indigo-600 px-8 py-3 rounded-full"
                >
                    <Text className="text-white font-bold">Volver a Módulos</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Quiz Screen
    if (showQuiz) {
        return (
            <View className="flex-1 bg-slate-50">
                <View className="bg-indigo-900 pt-12 pb-4 px-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => setShowQuiz(false)} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg flex-1">Quiz: {module.title}</Text>
                    </View>
                </View>

                <ScrollView className="flex-1 p-4">
                    {questions.map((q, qIndex) => {
                        const options = JSON.parse(q.options);
                        return (
                            <View key={q.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                                <Text className="font-bold text-gray-800 mb-3">
                                    {qIndex + 1}. {q.question}
                                </Text>
                                {options.map((option: string, oIndex: number) => (
                                    <TouchableOpacity
                                        key={oIndex}
                                        onPress={() => handleSelectAnswer(qIndex, oIndex)}
                                        className={`p-3 rounded-lg mb-2 border ${answers[qIndex] === oIndex
                                            ? 'bg-indigo-100 border-indigo-500'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <Text className={answers[qIndex] === oIndex ? 'text-indigo-800' : 'text-gray-700'}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        onPress={handleSubmitQuiz}
                        disabled={submitting}
                        className="bg-indigo-600 p-4 rounded-xl items-center mb-6"
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Enviar Respuestas</Text>
                        )}
                    </TouchableOpacity>
                    <View className="h-10" />
                </ScrollView>
            </View>
        );
    }

    // Content Viewer
    return (
        <View className="flex-1 bg-slate-50">
            <View className="bg-indigo-900 pt-12 pb-4 px-4">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white font-bold" numberOfLines={1}>{module.title}</Text>
                        <Text className="text-indigo-200 text-xs">{module.level} • {module.estimated_time_minutes} min</Text>
                    </View>
                    <View className="bg-yellow-500 px-3 py-1 rounded-full">
                        <Text className="text-white font-bold text-xs">+{module.token_reward}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                className="flex-1 p-4"
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View className="bg-white rounded-xl p-5 shadow-sm mb-4">
                    <Text className="text-gray-800 text-base leading-7">{module.content_body}</Text>
                </View>

                {/* Quiz Button */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="font-bold text-gray-800">Quiz de Validación</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
                            <Text className="text-gray-500 text-xs ml-1">{questions.length} preguntas</Text>
                        </View>
                    </View>

                    {!canQuiz && remainingTime > 0 && (
                        <View className="bg-yellow-50 p-3 rounded-lg mb-3">
                            <Text className="text-yellow-700 text-sm">
                                ⏱️ Tiempo restante: {formatTime(remainingTime)}
                            </Text>
                        </View>
                    )}

                    {!canQuiz && !remainingTime && (
                        <View className="bg-blue-50 p-3 rounded-lg mb-3">
                            <Text className="text-blue-700 text-sm">
                                📖 {quizReason || 'Continúa leyendo para desbloquear el quiz'}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleStartQuiz}
                        disabled={!canQuiz}
                        className={`p-4 rounded-xl items-center ${canQuiz ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                        <Text className={`font-bold ${canQuiz ? 'text-white' : 'text-gray-500'}`}>
                            {canQuiz ? '🎯 Realizar Quiz' : '🔒 Quiz Bloqueado'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Debate Section */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                    <TouchableOpacity
                        onPress={() => setShowDebate(!showDebate)}
                        className="flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="chatbubbles-outline" size={20} color="#4F46E5" />
                            <Text className="font-bold text-gray-800 ml-2">Debate Técnico</Text>
                            <View className="bg-indigo-100 px-2 py-0.5 rounded ml-2">
                                <Text className="text-indigo-600 text-xs font-bold">{comments.length}</Text>
                            </View>
                        </View>
                        <Ionicons
                            name={showDebate ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#6B7280"
                        />
                    </TouchableOpacity>

                    {showDebate && (
                        <View className="mt-4">
                            {/* New Comment Input */}
                            <View className="border border-gray-200 rounded-lg mb-4">
                                <TextInput
                                    value={newComment}
                                    onChangeText={setNewComment}
                                    placeholder="Comparte tu experiencia o pregunta técnica..."
                                    multiline
                                    numberOfLines={3}
                                    className="p-3 text-gray-700"
                                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                                />
                                <TouchableOpacity
                                    onPress={handlePostComment}
                                    disabled={postingComment || !newComment.trim()}
                                    className={`p-3 border-t border-gray-200 flex-row items-center justify-center ${newComment.trim() ? 'bg-indigo-50' : 'bg-gray-50'
                                        }`}
                                >
                                    {postingComment ? (
                                        <ActivityIndicator size="small" color="#4F46E5" />
                                    ) : (
                                        <>
                                            <Ionicons
                                                name="send"
                                                size={16}
                                                color={newComment.trim() ? '#4F46E5' : '#9CA3AF'}
                                            />
                                            <Text className={`ml-2 font-medium ${newComment.trim() ? 'text-indigo-600' : 'text-gray-400'
                                                }`}>
                                                Publicar
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Comments List */}
                            {comments.length === 0 ? (
                                <View className="items-center py-6">
                                    <Ionicons name="chatbubble-ellipses-outline" size={40} color="#D1D5DB" />
                                    <Text className="text-gray-400 mt-2">Aún no hay comentarios</Text>
                                    <Text className="text-gray-400 text-xs">¡Sé el primero en aportar!</Text>
                                </View>
                            ) : (
                                comments.map(comment => (
                                    <View key={comment.id} className="border-b border-gray-100 pb-3 mb-3">
                                        <View className="flex-row items-center mb-2">
                                            <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center">
                                                <Text className="text-indigo-600 font-bold text-sm">
                                                    {(comment.user_name || 'T')[0].toUpperCase()}
                                                </Text>
                                            </View>
                                            <View className="ml-2 flex-1">
                                                <View className="flex-row items-center">
                                                    <Text className="font-bold text-gray-800 text-sm">
                                                        {comment.user_name || 'Técnico'}
                                                    </Text>
                                                    {comment.expert_badge === 1 && (
                                                        <View className="bg-yellow-100 px-2 py-0.5 rounded ml-2">
                                                            <Text className="text-yellow-700 text-[10px] font-bold">🏆 EXPERTO</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text className="text-gray-400 text-[10px]">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className="text-gray-700 text-sm mb-3">{comment.content}</Text>

                                        {/* Reactions */}
                                        <View className="flex-row">
                                            <TouchableOpacity
                                                onPress={() => handleReaction(comment.id, comment.user_id, 'maestro')}
                                                className="flex-row items-center mr-4 px-2 py-1 rounded bg-yellow-50"
                                            >
                                                <Text className="text-sm">🎓</Text>
                                                <Text className="text-yellow-700 text-xs ml-1 font-medium">
                                                    Maestro {comment.reactions.maestro > 0 && `(${comment.reactions.maestro})`}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleReaction(comment.id, comment.user_id, 'tal_cual')}
                                                className="flex-row items-center mr-4 px-2 py-1 rounded bg-green-50"
                                            >
                                                <Text className="text-sm">✅</Text>
                                                <Text className="text-green-700 text-xs ml-1 font-medium">
                                                    Tal cual {comment.reactions.tal_cual > 0 && `(${comment.reactions.tal_cual})`}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleReaction(comment.id, comment.user_id, 'interesante')}
                                                className="flex-row items-center px-2 py-1 rounded bg-blue-50"
                                            >
                                                <Text className="text-sm">💡</Text>
                                                <Text className="text-blue-700 text-xs ml-1 font-medium">
                                                    Interesante {comment.reactions.interesante > 0 && `(${comment.reactions.interesante})`}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Nested Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <View className="ml-6 mt-3 border-l-2 border-gray-100 pl-3">
                                                {comment.replies.map(reply => (
                                                    <View key={reply.id} className="mb-2">
                                                        <Text className="text-gray-600 text-xs font-medium">
                                                            {reply.user_name || 'Técnico'}:
                                                        </Text>
                                                        <Text className="text-gray-600 text-xs">{reply.content}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
