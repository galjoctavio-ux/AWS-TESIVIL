import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../../../components/BottomNav';

// Tool definitions with proper categorization
const DIAGNOSTIC_TOOLS = [
    {
        id: 'errors',
        icon: 'warning',
        title: 'Códigos de Error',
        description: 'Biblioteca de fallas por marca y modelo',
        route: '/(app)/library',
        color: 'bg-red-500',
        iconBg: 'bg-red-100',
        iconColor: '#EF4444',
    },
    {
        id: 'pt-table',
        icon: 'thermometer',
        title: 'Tabla P-T',
        description: 'Presiones de succión por refrigerante',
        route: '/(app)/tools/pt-table',
        color: 'bg-cyan-500',
        iconBg: 'bg-cyan-100',
        iconColor: '#06B6D4',
    },
];

const CALCULATION_TOOLS = [
    {
        id: 'btu',
        icon: 'calculator',
        title: 'Calculadora BTU',
        description: 'Estima la carga térmica del espacio',
        route: '/(app)/tools/btu-calculator',
        color: 'bg-purple-500',
        iconBg: 'bg-purple-100',
        iconColor: '#8B5CF6',
    },
    {
        id: 'cables',
        icon: 'flash',
        title: 'Guía de Cables',
        description: 'Selección de calibre y protección',
        route: '/(app)/tools/cable-guide',
        color: 'bg-yellow-500',
        iconBg: 'bg-yellow-100',
        iconColor: '#EAB308',
    },
];

const BUSINESS_TOOLS = [
    {
        id: 'quote',
        icon: 'document-text',
        title: 'Cotizador Pro',
        description: 'Crea presupuestos profesionales',
        route: '/(app)/quotes/wizard',
        color: 'bg-green-500',
        iconBg: 'bg-green-100',
        iconColor: '#22C55E',
        premium: true,
    },
    {
        id: 'scanner',
        icon: 'qr-code',
        title: 'Escanear QR',
        description: 'Identifica equipos con código QR',
        route: '/(app)/scanner',
        color: 'bg-blue-500',
        iconBg: 'bg-blue-100',
        iconColor: '#3B82F6',
    },
];

export default function ToolsIndex() {
    const router = useRouter();

    const renderToolCard = (tool: typeof DIAGNOSTIC_TOOLS[0]) => (
        <TouchableOpacity
            key={tool.id}
            onPress={() => router.push(tool.route as any)}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 flex-row items-center active:bg-gray-50"
        >
            <View className={`${tool.iconBg} w-14 h-14 rounded-2xl items-center justify-center mr-4`}>
                <Ionicons name={tool.icon as any} size={28} color={tool.iconColor} />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className="font-bold text-gray-800 text-lg">{tool.title}</Text>
                    {(tool as any).premium && (
                        <View className="bg-green-100 px-2 py-0.5 rounded-full ml-2">
                            <Text className="text-green-700 text-xs font-bold">PRO</Text>
                        </View>
                    )}
                </View>
                <Text className="text-gray-500 text-sm">{tool.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pt-14 pb-6 px-5">
                <Text className="text-white text-2xl font-bold">Herramientas</Text>
                <Text className="text-blue-200 text-sm mt-1">Todo lo que necesitas para el trabajo</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                {/* Diagnostic Tools */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-red-100 p-1.5 rounded-lg mr-2">
                            <Ionicons name="medkit" size={16} color="#EF4444" />
                        </View>
                        <Text className="text-gray-700 font-bold">Diagnóstico</Text>
                    </View>
                    {DIAGNOSTIC_TOOLS.map(renderToolCard)}
                </View>

                {/* Calculation Tools */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-purple-100 p-1.5 rounded-lg mr-2">
                            <Ionicons name="calculator" size={16} color="#8B5CF6" />
                        </View>
                        <Text className="text-gray-700 font-bold">Cálculos</Text>
                    </View>
                    {CALCULATION_TOOLS.map(renderToolCard)}
                </View>

                {/* Business Tools */}
                <View className="mb-20">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-green-100 p-1.5 rounded-lg mr-2">
                            <Ionicons name="briefcase" size={16} color="#22C55E" />
                        </View>
                        <Text className="text-gray-700 font-bold">Negocio</Text>
                    </View>
                    {BUSINESS_TOOLS.map(renderToolCard)}
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNav />
        </View>
    );
}
