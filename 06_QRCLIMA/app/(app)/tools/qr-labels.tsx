import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    generateQRLabelsPDF,
    getPreviousDownloads,
    getTimeUntilNextGeneration,
    regeneratePDF,
    PDFDownloadRecord
} from '../../../services/qr-labels-service';

export default function QRLabelsScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [canGenerate, setCanGenerate] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });
    const [previousDownloads, setPreviousDownloads] = useState<PDFDownloadRecord[]>([]);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Check generation availability
            const timeInfo = await getTimeUntilNextGeneration(user.uid);
            setCanGenerate(timeInfo.canGenerate);
            setTimeRemaining({
                hours: timeInfo.hoursRemaining,
                minutes: timeInfo.minutesRemaining,
            });

            // Load previous downloads
            const downloads = await getPreviousDownloads(user.uid);
            setPreviousDownloads(downloads);

        } catch (error) {
            console.error('Error loading QR labels data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = async () => {
        if (!user || !canGenerate || generating) return;

        try {
            setGenerating(true);

            const result = await generateQRLabelsPDF(user.uid);

            if (result.success) {
                Alert.alert(
                    '¡Etiquetas Generadas!',
                    `Se generaron 20 etiquetas QR únicas.\n\nYa puedes imprimir y pegar las etiquetas en los equipos de tus clientes.`,
                    [{ text: 'Entendido', onPress: loadData }]
                );
            } else {
                Alert.alert('Error', result.error || 'No se pudo generar el PDF');
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert('Error', 'Ocurrió un error al generar las etiquetas');
        } finally {
            setGenerating(false);
        }
    };

    const handleRedownload = async (record: PDFDownloadRecord) => {
        if (downloadingId) return;
        setDownloadingId(record.id);
        try {
            await regeneratePDF(record);
        } catch (error) {
            Alert.alert('Error', 'No se pudo descargar el archivo');
        } finally {
            setDownloadingId(null);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Sin fecha';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-500 mt-4">Cargando...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-indigo-600 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white flex-1">Etiquetas QR</Text>
                </View>
                <Text className="text-indigo-100">
                    Genera etiquetas "Hoja de Vida" para tus equipos
                </Text>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                {/* Generation Card */}
                <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-indigo-100 p-3 rounded-full mr-4">
                            <Ionicons name="qr-code" size={28} color="#6366F1" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-800">
                                Generar Nueva Hoja
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                20 etiquetas únicas por hoja
                            </Text>
                        </View>
                    </View>

                    {/* Status Badge */}
                    {canGenerate ? (
                        <View className="bg-green-100 rounded-xl p-4 mb-4">
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                                <Text className="text-green-700 font-bold ml-2">
                                    ¡Disponible para generar!
                                </Text>
                            </View>
                            <Text className="text-green-600 text-sm mt-1">
                                Puedes generar 1 hoja de etiquetas hoy
                            </Text>
                        </View>
                    ) : (
                        <View className="bg-amber-100 rounded-xl p-4 mb-4">
                            <View className="flex-row items-center">
                                <Ionicons name="time" size={24} color="#D97706" />
                                <Text className="text-amber-700 font-bold ml-2">
                                    Disponible mañana
                                </Text>
                            </View>
                            <Text className="text-amber-600 text-sm mt-1">
                                Próxima generación en {timeRemaining.hours}h {timeRemaining.minutes}m
                            </Text>
                        </View>
                    )}

                    {/* Generate Button */}
                    <TouchableOpacity
                        onPress={handleGeneratePDF}
                        disabled={!canGenerate || generating}
                        className={`flex-row items-center justify-center p-4 rounded-2xl ${canGenerate && !generating
                            ? 'bg-indigo-600'
                            : 'bg-gray-300'
                            }`}
                    >
                        {generating ? (
                            <>
                                <ActivityIndicator color="white" size="small" />
                                <Text className="text-white font-bold text-lg ml-3">
                                    Generando...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="print" size={24} color="white" />
                                <Text className="text-white font-bold text-lg ml-3">
                                    Generar PDF
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Info Card */}
                <View className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 mb-6 border border-indigo-100">
                    <Text className="text-indigo-800 font-bold mb-2">
                        📋 ¿Cómo funciona?
                    </Text>
                    <View className="space-y-2">
                        <Text className="text-indigo-700 text-sm">
                            1. Genera tu hoja de etiquetas (máx. 1 por día)
                        </Text>
                        <Text className="text-indigo-700 text-sm">
                            2. Imprime las etiquetas en papel adhesivo
                        </Text>
                        <Text className="text-indigo-700 text-sm">
                            3. Pega una etiqueta en cada equipo que instales
                        </Text>
                        <Text className="text-indigo-700 text-sm">
                            4. Escanea el QR para vincular el equipo
                        </Text>
                    </View>
                </View>

                {/* Previous Downloads */}
                <Text className="text-lg font-bold text-gray-800 mb-3">
                    📥 Descargas Anteriores
                </Text>

                {previousDownloads.length > 0 ? (
                    <View className="space-y-3">
                        {previousDownloads.map((download) => (
                            <View
                                key={download.id}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <View className="bg-gray-100 p-2 rounded-lg mr-3">
                                            <Ionicons name="document" size={20} color="#6B7280" />
                                        </View>
                                        <View>
                                            <Text className="text-gray-800 font-bold">
                                                Hoja de 20 etiquetas
                                            </Text>
                                            <Text className="text-gray-500 text-xs">
                                                {formatDate(download.generatedAt)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center">
                                        <View className="bg-indigo-100 px-2 py-1 rounded-full mr-3">
                                            <Text className="text-indigo-700 text-xs font-bold">
                                                {download.tokens?.length || 0} códigos
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => handleRedownload(download)}
                                            disabled={!!downloadingId}
                                            className="bg-gray-50 p-2 rounded-full border border-gray-200"
                                        >
                                            {downloadingId === download.id ? (
                                                <ActivityIndicator size="small" color="#4F46E5" />
                                            ) : (
                                                <Ionicons name="download-outline" size={20} color="#4F46E5" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="bg-gray-50 rounded-xl p-6 items-center">
                        <Ionicons name="document-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-2 text-center">
                            Aún no has generado etiquetas
                        </Text>
                    </View>
                )}

                {/* Spacer */}
                <View className="h-24" />
            </ScrollView>
        </View>
    );
}
