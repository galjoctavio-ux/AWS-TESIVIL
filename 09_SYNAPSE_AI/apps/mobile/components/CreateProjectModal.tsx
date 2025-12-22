import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, API_URL } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { uploadMultipleImages } from '@/lib/supabase';

interface CreateProjectModalProps {
    visible: boolean;
    onClose: () => void;
}

// Available tools
const AVAILABLE_TOOLS = [
    { id: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
    { id: 'claude', label: 'Claude', icon: '🧠' },
    { id: 'cursor', label: 'Cursor', icon: '⌨️' },
    { id: 'v0', label: 'v0.dev', icon: '🌐' },
    { id: 'bolt', label: 'Bolt.new', icon: '⚡' },
    { id: 'gemini', label: 'Gemini', icon: '✨' },
    { id: 'antigravity', label: 'Antigravity', icon: '🪐' },
    { id: 'windsurf', label: 'Windsurf', icon: '🏄' },
    { id: 'midjourney', label: 'Midjourney', icon: '🎨' },
    { id: 'dalle', label: 'DALL-E', icon: '🖼️' },
    { id: 'replit', label: 'Replit', icon: '💻' },
];

// Action types
const ACTION_TYPES = [
    { id: 'visit', label: '🔗 Visitar', description: 'Web, demo, portafolio' },
    { id: 'download', label: '📥 Descargar', description: 'App Store, Play Store, repo' },
    { id: 'inspiration', label: '👁️ Inspiración', description: 'Sin link, solo mostrar' },
];

// Create project API call
async function createProject(data: {
    title: string;
    description: string;
    actionType: string;
    projectUrl?: string;
    toolsUsed: string[];
    images: string[];
}) {
    // Normalize URL - add https:// if missing
    let normalizedUrl = data.projectUrl?.trim();
    if (normalizedUrl && !normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }

    const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'demo-user', // TODO: Replace with real auth
        },
        body: JSON.stringify({
            title: data.title,
            description: data.description,
            toolsUsed: data.toolsUsed,
            images: data.images,
            // Map to current API schema
            demoUrl: data.actionType === 'visit' ? normalizedUrl : undefined,
            repoUrl: data.actionType === 'download' ? normalizedUrl : undefined,
        }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to create project');
    return result.data;
}

export function CreateProjectModal({ visible, onClose }: CreateProjectModalProps) {
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const styles = createStyles(colors);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [actionType, setActionType] = useState('visit');
    const [projectUrl, setProjectUrl] = useState('');
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            resetForm();
            onClose();
            Alert.alert('¡Éxito!', 'Tu proyecto ha sido publicado.');
        },
        onError: (error: Error) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message);
        },
    });

    // Reset form
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setActionType('visit');
        setProjectUrl('');
        setSelectedTools([]);
        setImages([]);
    };

    // Toggle tool selection
    const toggleTool = (toolId: string) => {
        setSelectedTools((prev) =>
            prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Pick image
    const pickImage = async () => {
        if (images.length >= 3) {
            Alert.alert('Límite', 'Máximo 3 imágenes permitidas.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImages((prev) => [...prev, result.assets[0].uri]);
        }
    };

    // Remove image
    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Validate form
    const isValid = title.trim().length >= 3 && selectedTools.length > 0;

    // State for upload progress
    const [isUploading, setIsUploading] = useState(false);

    // Handle submit - upload images first, then create project
    const handleSubmit = async () => {
        if (!isValid) return;

        setIsUploading(true);
        try {
            // Upload images to Supabase Storage
            let uploadedUrls: string[] = [];
            if (images.length > 0) {
                uploadedUrls = await uploadMultipleImages(images, 'projects');
            }

            // Create project with uploaded URLs
            createMutation.mutate({
                title: title.trim(),
                description: description.trim(),
                actionType,
                projectUrl: actionType !== 'inspiration' ? projectUrl : undefined,
                toolsUsed: selectedTools,
                images: uploadedUrls,
            });
        } catch (error) {
            Alert.alert('Error', 'No se pudieron subir las imágenes');
        } finally {
            setIsUploading(false);
        }
    };

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nuevo Proyecto</Text>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!isValid || createMutation.isPending || isUploading}
                    >
                        {(createMutation.isPending || isUploading) ? (
                            <ActivityIndicator color={colors.showcase} />
                        ) : (
                            <Text style={[styles.publishText, !isValid && styles.publishTextDisabled]}>
                                Publicar
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Título *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de tu proyecto"
                            placeholderTextColor={colors.textMuted}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descripción (pitch)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="¿Qué hace tu proyecto? (200 caracteres)"
                            placeholderTextColor={colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            maxLength={200}
                            multiline
                            numberOfLines={3}
                        />
                        <Text style={styles.charCount}>{description.length}/200</Text>
                    </View>

                    {/* Action Type */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tipo de Link</Text>
                        <View style={styles.actionTypesRow}>
                            {ACTION_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.actionTypeCard,
                                        actionType === type.id && styles.actionTypeCardSelected,
                                    ]}
                                    onPress={() => setActionType(type.id)}
                                >
                                    <Text style={styles.actionTypeLabel}>{type.label}</Text>
                                    <Text style={styles.actionTypeDesc}>{type.description}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Project URL */}
                    {actionType !== 'inspiration' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>URL del Proyecto</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://..."
                                placeholderTextColor={colors.textMuted}
                                value={projectUrl}
                                onChangeText={setProjectUrl}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    {/* Tools/Stack */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Herramientas IA usadas *</Text>
                        <View style={styles.toolsGrid}>
                            {AVAILABLE_TOOLS.map((tool) => (
                                <TouchableOpacity
                                    key={tool.id}
                                    style={[
                                        styles.toolChip,
                                        selectedTools.includes(tool.id) && styles.toolChipSelected,
                                    ]}
                                    onPress={() => toggleTool(tool.id)}
                                >
                                    <Text style={styles.toolIcon}>{tool.icon}</Text>
                                    <Text
                                        style={[
                                            styles.toolLabel,
                                            selectedTools.includes(tool.id) && styles.toolLabelSelected,
                                        ]}
                                    >
                                        {tool.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Images */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Capturas (máx. 3)</Text>
                        <View style={styles.imagesRow}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.imagePreview}>
                                    <Image source={{ uri }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Text style={styles.removeImageText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {images.length < 3 && (
                                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                                    <Text style={styles.addImageIcon}>📷</Text>
                                    <Text style={styles.addImageText}>Agregar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Spacer */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    cancelText: {
        fontSize: 15,
        color: colors.textMuted,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    publishText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.showcase,
    },
    publishTextDisabled: {
        color: colors.textMuted,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: SPACING.sm,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: 15,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 11,
        color: colors.textMuted,
        textAlign: 'right',
        marginTop: 4,
    },
    actionTypesRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actionTypeCard: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        alignItems: 'center',
    },
    actionTypeCardSelected: {
        borderColor: colors.showcase,
        backgroundColor: `${colors.showcase}15`,
    },
    actionTypeLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    actionTypeDesc: {
        fontSize: 10,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 2,
    },
    toolsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    toolChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    toolChipSelected: {
        backgroundColor: `${colors.showcase}20`,
        borderColor: colors.showcase,
    },
    toolIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    toolLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    toolLabelSelected: {
        color: colors.showcase,
        fontWeight: '500',
    },
    imagesRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    imagePreview: {
        width: 100,
        height: 70,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 10,
    },
    addImageButton: {
        width: 100,
        height: 70,
        borderRadius: RADIUS.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageIcon: {
        fontSize: 24,
    },
    addImageText: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 4,
    },
});

export default CreateProjectModal;
