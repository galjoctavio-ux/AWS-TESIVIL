import { View, Text, TouchableOpacity, FlatList, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ServiceItem {
    id: string;
    type: string;
    status: string;
    date: any;
    clientId: string;
    diagnosis?: { errorCode: string };
    nextServiceDate?: any;
}

interface Client {
    id: string;
    name: string;
    phone?: string;
    address?: string;
}

interface Props {
    services: ServiceItem[];
    clients: Client[];
}

/**
 * Widget de Agenda Activa
 * Muestra servicios programados con acciones rápidas
 */
export default function UpcomingServicesWidget({ services, clients }: Props) {
    const router = useRouter();

    const getClient = (clientId: string): Client | undefined => {
        return clients.find(c => c.id === clientId);
    };

    const handleCall = (clientId: string) => {
        const client = getClient(clientId);
        if (client?.phone) {
            Linking.openURL(`tel:${client.phone}`);
        } else {
            Alert.alert('Sin teléfono', 'Este cliente no tiene número registrado.');
        }
    };

    const handleWhatsApp = (clientId: string) => {
        const client = getClient(clientId);
        if (client?.phone) {
            const cleanPhone = client.phone.replace(/\D/g, '');
            const message = `Hola ${client.name}, soy tu técnico de Mr. Frío. Te confirmo la cita de hoy.`;
            Linking.openURL(`https://wa.me/52${cleanPhone}?text=${encodeURIComponent(message)}`);
        } else {
            Alert.alert('Sin teléfono', 'Este cliente no tiene número registrado.');
        }
    };

    const handleNavigate = (clientId: string) => {
        const client = getClient(clientId);
        if (client?.address) {
            const encodedAddress = encodeURIComponent(client.address);
            Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
        } else {
            Alert.alert('Sin dirección', 'Este cliente no tiene dirección registrada.');
        }
    };

    const formatDate = (date: any): string => {
        if (!date) return 'Sin fecha';
        const d = date.toDate ? date.toDate() : new Date(date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (d.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (d.toDateString() === tomorrow.toDateString()) {
            return 'Mañana';
        }
        return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const renderService = ({ item }: { item: ServiceItem }) => {
        const client = getClient(item.clientId);

        return (
            <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mr-3 w-80">
                {/* Header */}
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800 text-lg">{item.type}</Text>
                        <Text className="text-gray-500 text-sm">{client?.name || 'Cliente'}</Text>
                    </View>
                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                        <Text className="text-blue-700 font-bold text-xs">{formatDate(item.nextServiceDate || item.date)}</Text>
                    </View>
                </View>

                {/* Address */}
                {client?.address && (
                    <View className="flex-row items-center mb-3 bg-gray-50 p-2 rounded-lg">
                        <Ionicons name="location" size={16} color="#6B7280" />
                        <Text className="text-gray-600 text-xs ml-2 flex-1" numberOfLines={1}>
                            {client.address}
                        </Text>
                    </View>
                )}

                {/* Quick Actions */}
                <View className="flex-row gap-2 mt-2">
                    <TouchableOpacity
                        onPress={() => handleCall(item.clientId)}
                        className="flex-1 bg-green-500 p-3 rounded-xl flex-row items-center justify-center"
                    >
                        <Ionicons name="call" size={16} color="white" />
                        <Text className="text-white font-bold text-xs ml-1">Llamar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleWhatsApp(item.clientId)}
                        className="flex-1 bg-emerald-500 p-3 rounded-xl flex-row items-center justify-center"
                    >
                        <Ionicons name="logo-whatsapp" size={16} color="white" />
                        <Text className="text-white font-bold text-xs ml-1">WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleNavigate(item.clientId)}
                        className="flex-1 bg-blue-500 p-3 rounded-xl flex-row items-center justify-center"
                    >
                        <Ionicons name="navigate" size={16} color="white" />
                        <Text className="text-white font-bold text-xs ml-1">Ir</Text>
                    </TouchableOpacity>
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    onPress={() => router.push(`/(app)/services/${item.id}`)}
                    className="bg-gray-800 p-3 rounded-xl mt-2 flex-row items-center justify-center"
                >
                    <Ionicons name="create" size={16} color="white" />
                    <Text className="text-white font-bold text-sm ml-2">Registrar Servicio</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (services.length === 0) {
        return (
            <View className="bg-white p-6 rounded-xl border border-gray-100 flex-row items-center">
                <View className="bg-green-100 p-3 rounded-full mr-4">
                    <Ionicons name="checkmark-done" size={24} color="#16A34A" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 font-bold">¡Agenda libre!</Text>
                    <Text className="text-gray-400 text-sm">No tienes servicios programados próximamente.</Text>
                </View>
            </View>
        );
    }

    return (
        <FlatList
            data={services}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={renderService}
        />
    );
}
