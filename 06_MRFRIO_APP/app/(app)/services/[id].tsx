import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { getServiceById, ServiceData } from '../../../services/services-service';
import { getClientById, ClientData } from '../../../services/clients-service';
import { getUserProfile, UserProfile } from '../../../services/user-service';
import { generateServiceReport } from '../../../services/pdf-generator';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();

    const [service, setService] = useState<(ServiceData & { id: string }) | null>(null);
    const [client, setClient] = useState<(ClientData & { id: string }) | null>(null);
    const [technicianProfile, setTechnicianProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!id || !user) return;

            try {
                setLoading(true);

                // Fetch service
                const serviceData = await getServiceById(id);
                if (!serviceData) {
                    Alert.alert('Error', 'Servicio no encontrado');
                    router.back();
                    return;
                }
                setService(serviceData);

                // Fetch client and technician profile in parallel
                const [clientData, profileData] = await Promise.all([
                    getClientById(serviceData.clientId),
                    getUserProfile(user.uid)
                ]);

                setClient(clientData);
                setTechnicianProfile(profileData);
            } catch (error) {
                console.error('Error loading service details:', error);
                Alert.alert('Error', 'No se pudieron cargar los detalles');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, user]);

    const handleGeneratePdf = async () => {
        if (!service || !client) {
            Alert.alert('Error', 'Faltan datos para generar el reporte');
            return;
        }

        try {
            setGeneratingPdf(true);
            await generateServiceReport({
                service,
                client,
                technicianProfile: technicianProfile || undefined
            });
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            Alert.alert('Error', error?.message || 'No se pudo generar el PDF');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'Fecha desconocida';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-4">Cargando detalles...</Text>
            </View>
        );
    }

    if (!service || !client) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center p-6">
                <Ionicons name="alert-circle" size={64} color="#EF4444" />
                <Text className="text-gray-700 text-lg mt-4">No se encontró el servicio</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white flex-1">Detalle del Servicio</Text>
                </View>

                {/* Service Type Badge */}
                <View className="bg-white/20 rounded-xl p-4">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <View className={`p-2 rounded-full mr-3 ${service.type === 'Reparación' ? 'bg-red-500' :
                                service.type === 'Mantenimiento' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}>
                                <Ionicons
                                    name={service.type === 'Reparación' ? 'construct' :
                                        service.type === 'Mantenimiento' ? 'build' : 'hammer'}
                                    size={20}
                                    color="white"
                                />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-xl">{service.type}</Text>
                                <Text className="text-blue-100 text-sm">{formatDate(service.date)}</Text>
                            </View>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${service.status === 'Terminado' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                            <Text className="text-white text-xs font-bold">{service.status}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                {/* Client Info */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-blue-100 p-2 rounded-full mr-3">
                            <Ionicons name="person" size={20} color="#2563EB" />
                        </View>
                        <Text className="text-lg font-bold text-gray-800">Cliente</Text>
                    </View>
                    <Text className="text-xl font-bold text-gray-900 mb-2">{client.name}</Text>
                    {client.phone && (
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="call" size={16} color="#6B7280" />
                            <Text className="text-gray-600 ml-2">{client.phone}</Text>
                        </View>
                    )}
                    {client.address && (
                        <View className="flex-row items-center">
                            <Ionicons name="location" size={16} color="#6B7280" />
                            <Text className="text-gray-600 ml-2">{client.address}</Text>
                        </View>
                    )}
                </View>

                {/* Diagnosis (if exists) */}
                {service.diagnosis && (
                    <View className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-4">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-red-100 p-2 rounded-full mr-3">
                                <Ionicons name="warning" size={20} color="#DC2626" />
                            </View>
                            <Text className="text-lg font-bold text-red-800">Diagnóstico</Text>
                        </View>
                        <View className="bg-white rounded-xl p-4 border border-red-200">
                            <Text className="text-2xl font-bold text-red-600 mb-2">
                                Código: {service.diagnosis.errorCode}
                            </Text>
                            <Text className="text-gray-700 mb-2">{service.diagnosis.description}</Text>
                            {service.diagnosis.cause && (
                                <Text className="text-gray-500 italic text-sm">
                                    Causa probable: {service.diagnosis.cause}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Notes (if exists) */}
                {service.notes && (
                    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <View className="flex-row items-center mb-3">
                            <View className="bg-gray-100 p-2 rounded-full mr-3">
                                <Ionicons name="document-text" size={20} color="#6B7280" />
                            </View>
                            <Text className="text-lg font-bold text-gray-800">Notas</Text>
                        </View>
                        <Text className="text-gray-600">{service.notes}</Text>
                    </View>
                )}

                {/* Spacer for FAB */}
                <View className="h-24" />
            </ScrollView>

            {/* Floating Action Button - Generate PDF */}
            <TouchableOpacity
                onPress={handleGeneratePdf}
                disabled={generatingPdf}
                className={`absolute bottom-8 left-6 right-6 bg-blue-600 flex-row items-center justify-center p-4 rounded-2xl shadow-lg ${generatingPdf ? 'opacity-70' : ''
                    }`}
            >
                {generatingPdf ? (
                    <>
                        <ActivityIndicator color="white" size="small" />
                        <Text className="text-white font-bold text-lg ml-3">Generando...</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="document" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-3">Generar PDF</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}
