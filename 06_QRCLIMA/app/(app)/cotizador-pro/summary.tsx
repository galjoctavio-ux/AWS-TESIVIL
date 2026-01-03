import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile, BrandingConfig } from '../../../services/user-service';
import { saveCotizadorQuote, CotizadorQuoteItem, calculateQuoteTotals } from '../../../services/cotizador-service';
import { formatPrice, PRICE_DISCLAIMER } from '../../../services/price-intelligence-service';
import { generateCotizadorPDF } from '../../../services/pdf-generator';
import { getClientById } from '../../../services/clients-service';

export default function SummaryScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams<{
        clientId: string;
        clientName: string;
        clientPhone: string;
        clientAddress: string;
        items: string;
        total: string;
    }>();

    const [items, setItems] = useState<CotizadorQuoteItem[]>([]);
    const [branding, setBranding] = useState<BrandingConfig | null>(null);
    const [includeMarketNote, setIncludeMarketNote] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        // Parse items from params
        if (params.items) {
            try {
                setItems(JSON.parse(params.items));
            } catch (error) {
                console.error('Error parsing items:', error);
            }
        }

        // Load branding
        const loadBranding = async () => {
            if (!user) return;
            try {
                const profile = await getUserProfile(user.uid);
                if (profile?.branding) {
                    setBranding(profile.branding);
                }
            } catch (error) {
                console.error('Error loading branding:', error);
            }
        };
        loadBranding();
    }, [params.items, user]);

    // Check if any item is from market/catalog
    const hasMarketItems = items.some(item =>
        item.code === 'MKT' || item.code === 'CAT'
    );

    // Calculate totals
    const totals = calculateQuoteTotals(items);

    const handleSaveAndGenerate = async () => {
        if (!user) return;

        setSaving(true);
        try {
            // Save quote to Firebase
            const quoteId = await saveCotizadorQuote({
                technicianId: user.uid,
                clientId: params.clientId,
                clientName: params.clientName,
                clientPhone: params.clientPhone,
                clientAddress: params.clientAddress,
                items,
                subtotal: totals.subtotal,
                total: totals.total,
                notes: hasMarketItems && includeMarketNote ? PRICE_DISCLAIMER : undefined,
                status: 'Draft'
            });

            // Get client for PDF - with fallback if not found
            const clientFromDb = await getClientById(params.clientId);
            const clientForPdf = {
                id: params.clientId,
                name: clientFromDb?.name || params.clientName,
                phone: clientFromDb?.phone || params.clientPhone || '',
                address: clientFromDb?.address || params.clientAddress || '',
                technicianId: clientFromDb?.technicianId || user.uid,
                createdAt: clientFromDb?.createdAt || new Date()
            };

            const profile = await getUserProfile(user.uid);

            setGenerating(true);

            // Generate PDF with branding (always premium for cotizador-pro)
            await generateCotizadorPDF({
                quote: {
                    id: quoteId,
                    technicianId: user.uid,
                    clientId: params.clientId,
                    clientName: params.clientName,
                    items,
                    subtotal: totals.subtotal,
                    total: totals.total,
                    status: 'Draft' as const
                },
                client: clientForPdf as any, // Type assertion for compatibility
                technicianProfile: profile || undefined,
                forcePremium: true  // PRO module always generates premium PDF
            });

            Alert.alert(
                '✅ Cotización Creada',
                `Total: ${formatPrice(totals.total)}`,
                [{ text: 'OK', onPress: () => router.replace('/(app)/cotizador-pro') }]
            );
        } catch (error) {
            console.error('Error saving quote:', error);
            Alert.alert('Error', 'No se pudo generar la cotización. Detalles: ' + (error as Error).message);
        } finally {
            setSaving(false);
            setGenerating(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pb-4 px-4" style={{ paddingTop: insets.top + 8 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-white">Resumen</Text>
                        <Text className="text-blue-200 text-xs">{params.clientName}</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Client Info */}
                <View className="px-4 pt-4">
                    <View className="bg-white rounded-xl p-4 border border-gray-100">
                        <Text className="text-gray-500 text-xs mb-1">CLIENTE</Text>
                        <Text className="text-gray-800 font-bold text-lg">{params.clientName}</Text>
                        {params.clientPhone && (
                            <Text className="text-gray-500 text-sm">📞 {params.clientPhone}</Text>
                        )}
                        {params.clientAddress && (
                            <Text className="text-gray-400 text-sm">📍 {params.clientAddress}</Text>
                        )}
                    </View>
                </View>

                {/* Branding Preview */}
                {branding && (
                    <View className="px-4 pt-4">
                        <Text className="text-gray-500 font-medium text-sm mb-2">🎨 TU MARCA EN PDF</Text>
                        <View
                            className="rounded-xl p-4 border flex-row items-center"
                            style={{
                                backgroundColor: branding.primaryColor + '20',
                                borderColor: branding.primaryColor
                            }}
                        >
                            {branding.logoURL && (
                                <View className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-white">
                                    {/* Logo preview would go here */}
                                    <View className="w-full h-full items-center justify-center">
                                        <Ionicons name="business" size={24} color={branding.primaryColor} />
                                    </View>
                                </View>
                            )}
                            <View className="flex-1">
                                <Text style={{ color: branding.primaryColor }} className="font-bold">
                                    PDF con tus colores
                                </Text>
                                {branding.footerText && (
                                    <Text className="text-gray-500 text-xs">{branding.footerText}</Text>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/(app)/profile/branding')}
                                className="p-2"
                            >
                                <Ionicons name="create-outline" size={20} color={branding.primaryColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Items List */}
                <View className="px-4 pt-4">
                    <Text className="text-gray-500 font-medium text-sm mb-2">
                        📋 CONCEPTOS ({items.length})
                    </Text>
                    {items.map((item, index) => (
                        <View key={index} className="bg-white rounded-xl p-3 mb-2 border border-gray-100">
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium" numberOfLines={1}>{item.description}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-400 text-xs mr-2">{item.code}</Text>
                                        {(item.code === 'MKT' || item.code === 'CAT') && (
                                            <View className="bg-purple-100 px-2 py-0.5 rounded">
                                                <Text className="text-purple-600 text-[10px] font-medium">MERCADO</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-gray-800 font-bold">{formatPrice(item.total)}</Text>
                                    <Text className="text-gray-400 text-xs">x{item.quantity}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Market Disclaimer Option */}
                {hasMarketItems && (
                    <View className="px-4 pt-4">
                        <View className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 mr-3">
                                    <Text className="text-amber-800 font-medium">Incluir aviso legal</Text>
                                    <Text className="text-amber-600 text-xs">
                                        Nota sobre precios referenciales en el PDF
                                    </Text>
                                </View>
                                <Switch
                                    value={includeMarketNote}
                                    onValueChange={setIncludeMarketNote}
                                    trackColor={{ false: '#D1D5DB', true: '#FCD34D' }}
                                    thumbColor={includeMarketNote ? '#F59E0B' : '#9CA3AF'}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Totals */}
                <View className="px-4 pt-4">
                    <View className="bg-gray-900 rounded-2xl p-6">
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-gray-400">Subtotal</Text>
                            <Text className="text-white font-bold">{formatPrice(totals.subtotal)}</Text>
                        </View>
                        <View className="h-px bg-gray-700 my-2" />
                        <View className="flex-row justify-between items-center">
                            <Text className="text-white text-lg">Total</Text>
                            <Text className="text-green-400 text-3xl font-bold">{formatPrice(totals.total)}</Text>
                        </View>
                    </View>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Bottom Action */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4" style={{ paddingBottom: insets.bottom + 16 }}>
                <TouchableOpacity
                    onPress={handleSaveAndGenerate}
                    disabled={saving || generating}
                    className={`py-4 rounded-xl flex-row items-center justify-center ${saving || generating ? 'bg-gray-400' : 'bg-blue-600'}`}
                >
                    {saving || generating ? (
                        <>
                            <ActivityIndicator color="white" size="small" />
                            <Text className="text-white font-bold text-lg ml-2">
                                {generating ? 'Generando PDF...' : 'Guardando...'}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="document-text" size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">
                                Generar Cotización PRO
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
