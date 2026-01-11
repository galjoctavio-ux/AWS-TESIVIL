/**
 * Onboarding Screen Component
 * Cuentatron MVP
 * 
 * Captures CFE data required for system operation
 * 5 mandatory fields with visual help modals
 * 
 * Referencia: modulo_01_auth_onboarding
 * Campos: UXUI-023 a UXUI-027
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { TarifaCFE } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Tariff options (UXUI-029 - excluding trifásico)
const TARIFA_OPTIONS: { value: TarifaCFE; label: string }[] = [
    { value: '01', label: '01 - Uso Doméstico' },
    { value: '01A', label: '01A - Uso Doméstico (Verano)' },
    { value: '01B', label: '01B - Uso Doméstico (Alto Consumo)' },
    { value: 'PDBT', label: 'PDBT - Pequeña Demanda Baja Tensión' },
    { value: 'DAC', label: 'DAC - Doméstico Alto Consumo' },
];

// Form field type
interface OnboardingForm {
    tipo_tarifa: TarifaCFE | null;
    fecha_corte: Date | null;
    lectura_medidor_actual: string;
    consumo_ultimo_recibo: string;
    lectura_cierre_anterior: string;
}

// Help modal content
interface HelpContent {
    title: string;
    description: string;
    image: any;
}

const HELP_CONTENT: Record<string, HelpContent> = {
    tipo_tarifa: {
        title: '¿Dónde encuentro mi tarifa?',
        description: 'Busca en la esquina superior derecha de tu recibo CFE',
        image: require('../../assets/guia_tarifa.png'),
    },
    fecha_corte: {
        title: '¿Cuál es la fecha de corte?',
        description: 'Es la fecha límite de pago que aparece en tu recibo',
        image: require('../../assets/guia_fecha_corte.png'),
    },
    lectura_medidor_actual: {
        title: '¿Cómo leo mi medidor?',
        description: 'Mira los números en la pantalla de tu medidor eléctrico. La lectura aparece en tu recibo bajo "Lectura Actual".',
        image: require('../../assets/guia_consumo.png'),
    },
    consumo_ultimo_recibo: {
        title: '¿Dónde veo mi consumo?',
        description: 'Busca el total de kWh en tu último recibo',
        image: require('../../assets/guia_consumo.png'),
    },
    lectura_cierre_anterior: {
        title: '¿Qué es la lectura anterior?',
        description: 'Es la lectura del medidor al inicio del periodo',
        image: require('../../assets/guia_lectura_anterior.png'),
    },
};

export default function OnboardingScreen() {
    const router = useRouter();
    const { updateProfile } = useAuth();

    const [form, setForm] = useState<OnboardingForm>({
        tipo_tarifa: null,
        fecha_corte: null,
        lectura_medidor_actual: '',
        consumo_ultimo_recibo: '',
        lectura_cierre_anterior: '',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTarifaPicker, setShowTarifaPicker] = useState(false);
    const [helpModal, setHelpModal] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Validate form
    const isFormValid = () => {
        return (
            form.tipo_tarifa !== null &&
            form.fecha_corte !== null &&
            form.lectura_medidor_actual.trim() !== '' &&
            form.consumo_ultimo_recibo.trim() !== '' &&
            form.lectura_cierre_anterior.trim() !== ''
        );
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!isFormValid()) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
        }

        setLoading(true);

        const { error } = await updateProfile({
            tipo_tarifa: form.tipo_tarifa!,
            fecha_corte: form.fecha_corte!.toISOString().split('T')[0],
            lectura_medidor_actual: parseFloat(form.lectura_medidor_actual),
            consumo_ultimo_recibo: parseFloat(form.consumo_ultimo_recibo),
            lectura_cierre_anterior: parseFloat(form.lectura_cierre_anterior),
            onboarding_completado: true,
        });

        setLoading(false);

        if (error) {
            Alert.alert('Error', 'No se pudo guardar la información');
        } else {
            // Navigate to device linking (modulo_06)
            router.replace('/vincular');
        }
    };

    // Render help button
    const renderHelpButton = (field: string) => (
        <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setHelpModal(field)}
        >
            <Ionicons name="help-circle-outline" size={24} color="#4f46e5" />
        </TouchableOpacity>
    );

    // Render help modal
    const renderHelpModal = () => {
        if (!helpModal || !HELP_CONTENT[helpModal]) return null;
        const content = HELP_CONTENT[helpModal];

        return (
            <Modal
                visible={true}
                transparent
                animationType="fade"
                onRequestClose={() => setHelpModal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{content.title}</Text>
                        <Text style={styles.modalDescription}>{content.description}</Text>

                        {/* Help image from CFE receipt guides */}
                        <Image
                            source={content.image}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setHelpModal(null)}
                        >
                            <Text style={styles.modalCloseText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Configura tu perfil</Text>
            <Text style={styles.subtitle}>
                Necesitamos algunos datos de tu recibo CFE para calcular tu consumo
            </Text>

            {/* Tipo de Tarifa */}
            <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Tipo de Tarifa CFE *</Text>
                    {renderHelpButton('tipo_tarifa')}
                </View>
                <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowTarifaPicker(true)}
                >
                    <Text style={form.tipo_tarifa ? styles.selectText : styles.selectPlaceholder}>
                        {form.tipo_tarifa
                            ? TARIFA_OPTIONS.find(t => t.value === form.tipo_tarifa)?.label
                            : 'Selecciona tu tarifa'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#888" />
                </TouchableOpacity>
            </View>

            {/* Fecha de Corte */}
            <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Última Fecha de Corte *</Text>
                    {renderHelpButton('fecha_corte')}
                </View>
                <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={form.fecha_corte ? styles.selectText : styles.selectPlaceholder}>
                        {form.fecha_corte
                            ? form.fecha_corte.toLocaleDateString('es-MX')
                            : 'Selecciona la fecha'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#888" />
                </TouchableOpacity>
            </View>

            {/* Lectura Actual del Medidor */}
            <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Lectura Actual del Medidor *</Text>
                    {renderHelpButton('lectura_medidor_actual')}
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 12345"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={form.lectura_medidor_actual}
                    onChangeText={(text) => setForm({ ...form, lectura_medidor_actual: text })}
                />
            </View>

            {/* Consumo Último Recibo */}
            <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Consumo Último Recibo (kWh) *</Text>
                    {renderHelpButton('consumo_ultimo_recibo')}
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 250"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={form.consumo_ultimo_recibo}
                    onChangeText={(text) => setForm({ ...form, consumo_ultimo_recibo: text })}
                />
            </View>

            {/* Lectura Cierre Periodo Anterior */}
            <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Lectura Cierre Periodo Anterior *</Text>
                    {renderHelpButton('lectura_cierre_anterior')}
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 12000"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={form.lectura_cierre_anterior}
                    onChangeText={(text) => setForm({ ...form, lectura_cierre_anterior: text })}
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, !isFormValid() && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading || !isFormValid()}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>Continuar</Text>
                )}
            </TouchableOpacity>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    value={form.fecha_corte || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setForm({ ...form, fecha_corte: date });
                    }}
                />
            )}

            {/* Tariff Picker Modal */}
            <Modal
                visible={showTarifaPicker}
                transparent
                animationType="slide"
            >
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerContent}>
                        <Text style={styles.pickerTitle}>Selecciona tu tarifa</Text>
                        {TARIFA_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.pickerOption}
                                onPress={() => {
                                    setForm({ ...form, tipo_tarifa: option.value });
                                    setShowTarifaPicker(false);
                                }}
                            >
                                <Text style={styles.pickerOptionText}>{option.label}</Text>
                                {form.tipo_tarifa === option.value && (
                                    <Ionicons name="checkmark" size={24} color="#4f46e5" />
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.pickerCloseButton}
                            onPress={() => setShowTarifaPicker(false)}
                        >
                            <Text style={styles.pickerCloseText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Help Modal */}
            {renderHelpModal()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 32,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    helpButton: {
        padding: 4,
    },
    input: {
        backgroundColor: '#252542',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#fff',
    },
    selectInput: {
        backgroundColor: '#252542',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectText: {
        fontSize: 16,
        color: '#fff',
    },
    selectPlaceholder: {
        fontSize: 16,
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#252542',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    modalImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: '#1a1a2e',
    },
    modalCloseButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#fff',
        fontWeight: '600',
    },
    // Picker styles
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    pickerContent: {
        backgroundColor: '#252542',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    pickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    pickerOptionText: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    pickerCloseButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    pickerCloseText: {
        color: '#888',
        fontSize: 16,
    },
});
