import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Image, Dimensions, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, isUserPro } from '../../../services/user-service';
import {
    DIAGNOSTIC_CODES,
    COMPATIBLE_MODELS,
    getSTCodeDescription,
    DiagnosticCode
} from '../../../constants/mirage-diagnostic-data';

// Control type images - loaded at module level
const CONTROL_IMAGES: Record<'A' | 'B', ImageSourcePropType> = {
    A: require('../../../assets/control_type_a.png'),
    B: require('../../../assets/control_type_b.png'),
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MirageDiagnosticScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();

    const [isPro, setIsPro] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSTModal, setShowSTModal] = useState(false);
    const [stInput, setStInput] = useState('');
    const [stResult, setStResult] = useState<string | null>(null);
    const [showHexModal, setShowHexModal] = useState(false);
    const [hexInput, setHexInput] = useState('');
    const [selectedHexCode, setSelectedHexCode] = useState<DiagnosticCode | null>(null);
    const [hexResult, setHexResult] = useState<number | null>(null);
    const [selectedControlType, setSelectedControlType] = useState<'A' | 'B'>('A');

    useEffect(() => {
        const checkProStatus = async () => {
            if (user) {
                const profile = await getUserProfile(user.uid);
                setIsPro(isUserPro(profile));
            }
            setLoading(false);
        };
        checkProStatus();
    }, [user]);

    const filteredCodes = DIAGNOSTIC_CODES.filter(code =>
        code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSTLookup = () => {
        const codeNum = parseInt(stInput, 10);
        if (!isNaN(codeNum) && codeNum >= 1 && codeNum <= 51) {
            setStResult(getSTCodeDescription(codeNum));
        } else {
            setStResult('Ingrese un número del 1 al 51');
        }
    };

    const handleHexConvert = () => {
        if (selectedHexCode && hexInput) {
            const cleaned = hexInput.toUpperCase().replace(/[^0-9A-F]/g, '');
            const decValue = parseInt(cleaned, 16) || 0;
            const result = decValue * (selectedHexCode.multiplier || 1);
            setHexResult(result);
        }
    };

    const openHexModal = (code: DiagnosticCode) => {
        setSelectedHexCode(code);
        setHexInput('');
        setHexResult(null);
        setShowHexModal(true);
    };

    // Loading state
    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <Text className="text-gray-500">Cargando...</Text>
            </View>
        );
    }

    // PRO Lock Screen
    if (!isPro) {
        return (
            <View className="flex-1 bg-slate-50">
                <View className="bg-orange-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                    <TouchableOpacity onPress={() => router.back()} className="mb-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Modo Diagnóstico</Text>
                    <Text className="text-orange-200 text-sm mt-1">Mirage Inverter</Text>
                </View>

                <View className="flex-1 items-center justify-center px-8">
                    <View className="bg-orange-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                        <Ionicons name="lock-closed" size={48} color="#F97316" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                        Función PRO
                    </Text>
                    <Text className="text-gray-500 text-center mb-8">
                        Esta guía técnica avanzada está disponible exclusivamente para usuarios PRO. Desbloquea acceso a los códigos del Modo TEST y el decodificador de causas de paro.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/store')}
                        className="bg-orange-500 px-8 py-4 rounded-2xl"
                    >
                        <Text className="text-white font-bold text-lg">Desbloquear PRO</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Main PRO Content
    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-orange-600 pb-6 px-5" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-2xl font-bold">Modo Diagnóstico</Text>
                        <Text className="text-orange-200 text-sm">Mirage Inverter TEST Mode</Text>
                    </View>
                    <View className="bg-green-500 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">PRO</Text>
                    </View>
                </View>

                {/* Search */}
                <View className="bg-white/20 rounded-xl flex-row items-center px-4 py-2 mt-2">
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                        className="flex-1 ml-2 text-white"
                        placeholder="Buscar código (T1, Fr, ST...)"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                {/* How to Activate Section */}
                <View className="bg-white rounded-2xl overflow-hidden mb-4 border border-gray-100">
                    <View className="bg-orange-50 px-4 py-3 flex-row items-center">
                        <View className="bg-orange-500 p-2 rounded-xl mr-3">
                            <Ionicons name="hand-left" size={20} color="white" />
                        </View>
                        <Text className="text-lg font-bold text-gray-800">Cómo Activar el Modo TEST</Text>
                    </View>

                    {/* Control Type Tabs */}
                    <View className="flex-row mx-4 mt-4 bg-gray-100 rounded-xl p-1">
                        <TouchableOpacity
                            onPress={() => setSelectedControlType('A')}
                            className={`flex-1 py-2 rounded-lg ${selectedControlType === 'A' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-center font-semibold ${selectedControlType === 'A' ? 'text-orange-600' : 'text-gray-500'}`}>
                                Control Tipo A
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSelectedControlType('B')}
                            className={`flex-1 py-2 rounded-lg ${selectedControlType === 'B' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-center font-semibold ${selectedControlType === 'B' ? 'text-orange-600' : 'text-gray-500'}`}>
                                Control Tipo B
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Control Image and Instructions */}
                    <View className="p-4">
                        {selectedControlType === 'A' ? (
                            <>
                                <Image
                                    source={CONTROL_IMAGES.A}
                                    style={{ width: SCREEN_WIDTH - 64, height: 280, alignSelf: 'center' }}
                                    resizeMode="contain"
                                />
                                <View className="mt-4 space-y-3">
                                    <View className="flex-row items-start">
                                        <View className="bg-orange-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                                            <Text className="text-white text-xs font-bold">1</Text>
                                        </View>
                                        <Text className="text-gray-700 flex-1">
                                            Apunte el control hacia la unidad interior y presione <Text className="font-bold text-orange-600">DISPLAY</Text> 3 veces.
                                        </Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <View className="bg-orange-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                                            <Text className="text-white text-xs font-bold">2</Text>
                                        </View>
                                        <Text className="text-gray-700 flex-1">
                                            Inmediatamente presione <Text className="font-bold text-orange-600">DIRECT</Text> 3 veces.
                                        </Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <View className="bg-gray-300 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                                            <Ionicons name="musical-note" size={12} color="#6B7280" />
                                        </View>
                                        <Text className="text-gray-500 flex-1 text-sm">
                                            La unidad emitirá un sonido y mostrará el primer código.
                                        </Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <Image
                                    source={CONTROL_IMAGES.B}
                                    style={{ width: SCREEN_WIDTH - 64, height: 240, alignSelf: 'center' }}
                                    resizeMode="contain"
                                />
                                <View className="mt-4 space-y-3">
                                    <View className="flex-row items-start">
                                        <View className="bg-orange-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                                            <Text className="text-white text-xs font-bold">1</Text>
                                        </View>
                                        <Text className="text-gray-700 flex-1">
                                            Apunte el control hacia la unidad interior y presione <Text className="font-bold text-orange-600">DISPLAY</Text> 3 veces.
                                        </Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <View className="bg-orange-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                                            <Text className="text-white text-xs font-bold">2</Text>
                                        </View>
                                        <Text className="text-gray-700 flex-1">
                                            Enseguida presione <Text className="font-bold text-orange-600">SWING</Text> 3 veces.
                                        </Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <View className="bg-gray-300 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                                            <Ionicons name="musical-note" size={12} color="#6B7280" />
                                        </View>
                                        <Text className="text-gray-500 flex-1 text-sm">
                                            La unidad emitirá un sonido y mostrará el primer código.
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Navigation Tip */}
                    <View className="bg-blue-50 mx-4 mb-4 p-3 rounded-xl flex-row items-center">
                        <Ionicons name="information-circle" size={20} color="#3B82F6" />
                        <Text className="text-blue-700 text-sm ml-2 flex-1">
                            Use <Text className="font-bold">DIRECT</Text> o <Text className="font-bold">SWING</Text> para navegar entre códigos.
                        </Text>
                    </View>
                </View>

                {/* Compatible Models */}
                <View className="bg-gray-100 rounded-xl p-3 mb-4">
                    <Text className="text-gray-500 text-xs mb-1">Modelos Compatibles:</Text>
                    <Text className="text-gray-700 text-xs">{COMPATIBLE_MODELS.join(', ')}</Text>
                </View>

                {/* Codes List Header */}
                <Text className="text-gray-700 font-bold mb-3">Códigos de Consulta</Text>

                {/* Codes List */}
                {filteredCodes.map((code) => (
                    <TouchableOpacity
                        key={code.code}
                        className={`bg-white rounded-2xl p-4 mb-3 border ${code.code === 'ST' ? 'border-orange-300 bg-orange-50' : 'border-gray-100'}`}
                        onPress={() => {
                            if (code.code === 'ST') {
                                setShowSTModal(true);
                                setStInput('');
                                setStResult(null);
                            } else if (code.isHex) {
                                openHexModal(code);
                            }
                        }}
                        disabled={!code.isHex && code.code !== 'ST'}
                    >
                        <View className="flex-row items-center">
                            <View className={`${code.code === 'ST' ? 'bg-orange-500' : 'bg-gray-800'} w-14 h-14 rounded-xl items-center justify-center mr-4`}>
                                <Text className="text-white font-mono font-bold text-lg">{code.code}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800">{code.label}</Text>
                                <Text className="text-gray-500 text-sm">{code.description}</Text>
                                {code.range && (
                                    <Text className="text-gray-400 text-xs mt-1">{code.range}</Text>
                                )}
                            </View>
                            {(code.isHex || code.code === 'ST') && (
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                <View className="h-24" />
            </ScrollView>

            {/* ST Code Modal */}
            <Modal visible={showSTModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 20 }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-800">Decodificador ST</Text>
                            <TouchableOpacity onPress={() => setShowSTModal(false)}>
                                <Ionicons name="close-circle" size={32} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 mb-4">
                            Ingresa el valor numérico que muestra el display cuando seleccionas ST:
                        </Text>
                        <View className="flex-row mb-4">
                            <TextInput
                                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-lg mr-3"
                                placeholder="Ej: 16"
                                keyboardType="number-pad"
                                value={stInput}
                                onChangeText={setStInput}
                            />
                            <TouchableOpacity
                                onPress={handleSTLookup}
                                className="bg-orange-500 px-6 rounded-xl items-center justify-center"
                            >
                                <Text className="text-white font-bold">Buscar</Text>
                            </TouchableOpacity>
                        </View>
                        {stResult && (
                            <View className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                <Text className="text-orange-800 font-medium">{stResult}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Hex Converter Modal */}
            <Modal visible={showHexModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 20 }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-800">
                                Convertir {selectedHexCode?.code}
                            </Text>
                            <TouchableOpacity onPress={() => setShowHexModal(false)}>
                                <Ionicons name="close-circle" size={32} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 mb-4">
                            Ingresa el valor hexadecimal que muestra el display (ej: A2, FF):
                        </Text>
                        <View className="flex-row mb-4">
                            <TextInput
                                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-lg mr-3 font-mono"
                                placeholder="Ej: A2"
                                autoCapitalize="characters"
                                value={hexInput}
                                onChangeText={setHexInput}
                            />
                            <TouchableOpacity
                                onPress={handleHexConvert}
                                className="bg-gray-800 px-6 rounded-xl items-center justify-center"
                            >
                                <Text className="text-white font-bold">Convertir</Text>
                            </TouchableOpacity>
                        </View>
                        {hexResult !== null && (
                            <View className="bg-gray-100 border border-gray-200 rounded-xl p-4">
                                <Text className="text-gray-600 text-sm mb-1">Resultado:</Text>
                                <Text className="text-gray-800 font-bold text-2xl">
                                    {hexResult} {selectedHexCode?.code === 'OF' ? 'RPM' : 'pasos'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
