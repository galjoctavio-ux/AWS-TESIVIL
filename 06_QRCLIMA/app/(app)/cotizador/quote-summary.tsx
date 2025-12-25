import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import {
    CotizadorQuoteItem,
    saveCotizadorQuote,
    formatCurrency
} from '../../../services/cotizador-service';
import { generateCotizadorPDF } from '../../../services/pdf-generator';
import { getClientById } from '../../../services/clients-service';
import { getUserProfile } from '../../../services/user-service';

export default function QuoteSummaryScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams<{
        clientId: string;
        clientName: string;
        clientPhone?: string;
        clientAddress?: string;
        items: string;
        total: string;
        quoteId?: string; // For viewing existing quotes
    }>();

    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    // Parse items from params
    const items: CotizadorQuoteItem[] = params.items ? JSON.parse(params.items) : [];
    const total = parseFloat(params.total || '0');

    // Separate by type
    const moItems = items.filter(i => i.type === 'MO');
    const mtItems = items.filter(i => i.type === 'MT');

    const handleSaveAndGeneratePDF = async () => {
        if (!user) return;

        setSaving(true);
        setGeneratingPDF(true);

        try {
            // Fetch user profile for PDF signature
            const profile = await getUserProfile(user.uid);

            // Save the quote first
            const quoteId = await saveCotizadorQuote({
                technicianId: user.uid,
                clientId: params.clientId,
                clientName: params.clientName,
                clientPhone: params.clientPhone,
                clientAddress: params.clientAddress,
                items,
                subtotal: total,
                total: total,
                notes: notes.trim(),
                status: 'Sent'
            });

            // Get full client data for PDF
            const client = await getClientById(params.clientId);

            if (client) {
                // Generate and share PDF
                await generateCotizadorPDF({
                    quote: {
                        id: quoteId,
                        technicianId: user.uid,
                        clientId: params.clientId,
                        clientName: params.clientName,
                        clientPhone: params.clientPhone,
                        clientAddress: params.clientAddress,
                        items,
                        subtotal: total,
                        total,
                        notes: notes.trim(),
                        status: 'Sent'
                    },
                    client: client,
                    technicianProfile: profile || undefined
                });
            }

            Alert.alert('¡Éxito!', 'Cotización guardada y PDF generado', [
                { text: 'OK', onPress: () => router.replace('/(app)/cotizador') }
            ]);

        } catch (error) {
            console.error('Error saving quote or generating PDF:', error);
            Alert.alert('Error', 'Hubo un problema al generar la cotización');
        } finally {
            setSaving(false);
            setGeneratingPDF(false);
        }
    };

    const handleSaveOnly = async () => {
        if (!user) return;

        setSaving(true);

        try {
            await saveCotizadorQuote({
                technicianId: user.uid,
                clientId: params.clientId,
                clientName: params.clientName,
                clientPhone: params.clientPhone,
                clientAddress: params.clientAddress,
                items,
                subtotal: total,
                total: total,
                notes: notes.trim(),
                status: 'Draft'
            });

            Alert.alert('Guardado', 'Cotización guardada como borrador', [
                { text: 'OK', onPress: () => router.replace('/(app)/cotizador') }
            ]);

        } catch (error) {
            console.error('Error saving quote:', error);
            Alert.alert('Error', 'No se pudo guardar la cotización');
        } finally {
            setSaving(false);
        }
    };

    const renderItemRow = (item: CotizadorQuoteItem) => (
        <View key={item.conceptId} className="flex-row py-2 border-b border-gray-100">
            <View className="flex-1">
                <Text className="text-gray-800 text-sm">{item.description}</Text>
                <Text className="text-gray-400 text-xs">{item.code}</Text>
            </View>
            <Text className="text-gray-600 text-sm w-12 text-center">{item.quantity}</Text>
            <Text className="text-gray-600 text-sm w-20 text-right">{formatCurrency(item.unitPrice)}</Text>
            <Text className="text-gray-800 font-bold text-sm w-24 text-right">{formatCurrency(item.total)}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Resumen</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Client Info Card */}
                <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
                    <Text className="text-gray-500 text-xs font-medium mb-2">CLIENTE</Text>
                    <Text className="font-bold text-gray-800 text-lg">{params.clientName}</Text>
                    {params.clientPhone && (
                        <Text className="text-gray-600 text-sm mt-1">📞 {params.clientPhone}</Text>
                    )}
                    {params.clientAddress && (
                        <Text className="text-gray-500 text-sm mt-0.5">📍 {params.clientAddress}</Text>
                    )}
                </View>

                {/* Items Table */}
                <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
                    {/* Table Header */}
                    <View className="flex-row pb-2 border-b-2 border-gray-200 mb-2">
                        <Text className="flex-1 text-gray-500 text-xs font-bold">CONCEPTO</Text>
                        <Text className="text-gray-500 text-xs font-bold w-12 text-center">CANT</Text>
                        <Text className="text-gray-500 text-xs font-bold w-20 text-right">P.UNIT</Text>
                        <Text className="text-gray-500 text-xs font-bold w-24 text-right">TOTAL</Text>
                    </View>

                    {/* MO Section */}
                    {moItems.length > 0 && (
                        <>
                            <Text className="text-purple-600 font-bold text-xs mt-2 mb-1">🔧 MANO DE OBRA</Text>
                            {moItems.map(renderItemRow)}
                        </>
                    )}

                    {/* MT Section */}
                    {mtItems.length > 0 && (
                        <>
                            <Text className="text-orange-600 font-bold text-xs mt-3 mb-1">📦 MATERIALES</Text>
                            {mtItems.map(renderItemRow)}
                        </>
                    )}

                    {/* Total */}
                    <View className="flex-row justify-between items-center mt-4 pt-4 border-t-2 border-gray-300">
                        <Text className="font-bold text-gray-800 text-lg">TOTAL</Text>
                        <Text className="font-bold text-green-600 text-2xl">{formatCurrency(total)}</Text>
                    </View>
                </View>

                {/* Notes */}
                <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
                    <Text className="text-gray-500 text-xs font-medium mb-2">NOTAS (OPCIONAL)</Text>
                    <TextInput
                        className="bg-gray-50 p-3 rounded-lg text-gray-800"
                        placeholder="Condiciones, observaciones..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Watermark Preview */}
                <View className="bg-gray-100 rounded-xl p-3 mb-6 border border-dashed border-gray-300">
                    <Text className="text-gray-500 text-xs text-center italic">
                        El PDF incluirá la marca de agua:
                    </Text>
                    <Text className="text-gray-600 text-sm text-center font-medium mt-1">
                        "Elaborado con QRclima powered by TESIVIL"
                    </Text>
                </View>

                {/* Action Buttons */}
                <View className="mb-8">
                    <TouchableOpacity
                        onPress={handleSaveAndGeneratePDF}
                        disabled={saving || generatingPDF}
                        className={`py-4 rounded-xl mb-3 ${saving || generatingPDF ? 'bg-gray-400' : 'bg-green-600'}`}
                    >
                        {saving || generatingPDF ? (
                            <View className="flex-row items-center justify-center">
                                <ActivityIndicator color="white" />
                                <Text className="text-white ml-2 font-bold">
                                    {generatingPDF ? 'Generando PDF...' : 'Guardando...'}
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="document-text" size={20} color="white" />
                                <Text className="text-white text-center font-bold text-lg ml-2">
                                    Generar PDF y Compartir
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSaveOnly}
                        disabled={saving}
                        className="py-3 rounded-xl border-2 border-gray-300"
                    >
                        <Text className="text-gray-600 text-center font-medium">
                            Guardar como Borrador
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
