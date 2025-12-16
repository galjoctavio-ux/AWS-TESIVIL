import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuoteItem, calculateLineTotal } from '../services/quotes-service';

interface QuoteBuilderProps {
    items: QuoteItem[];
    onUpdateItems: (items: QuoteItem[]) => void;
    editable?: boolean;
}

export default function QuoteBuilder({ items, onUpdateItems, editable = true }: QuoteBuilderProps) {

    const handleQuantityChange = (id: string, delta: number) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0); // Auto remove if 0

        onUpdateItems(newItems);
    };

    const handleRemove = (id: string) => {
        onUpdateItems(items.filter(i => i.id !== id));
    };

    const renderItem = ({ item }: { item: QuoteItem }) => {
        const total = calculateLineTotal(item);

        return (
            <View className="bg-white p-3 rounded-xl mb-2 border border-gray-100 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                    <Text className="font-bold text-gray-800 text-sm">{item.description}</Text>
                    <Text className="text-gray-400 text-xs">
                        {item.type === 'Material' ? 'Mat (Costo + 30%)' : 'Mano de Obra'} • ${item.unitCost} u.
                    </Text>
                </View>

                {editable ? (
                    <View className="flex-row items-center bg-gray-50 rounded-lg p-1">
                        <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)} className="p-2">
                            <Ionicons name="remove" size={16} color="#EF4444" />
                        </TouchableOpacity>
                        <Text className="font-bold w-6 text-center">{item.quantity}</Text>
                        <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)} className="p-2">
                            <Ionicons name="add" size={16} color="#10B981" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text className="font-bold text-gray-800">x{item.quantity}</Text>
                )}

                <View className="w-20 items-end ml-2">
                    <Text className="font-bold text-blue-600">${total.toFixed(0)}</Text>
                    {editable && <TouchableOpacity onPress={() => handleRemove(item.id)} className="mt-1">
                        <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                    </TouchableOpacity>}
                </View>
            </View>
        );
    };

    return (
        <View>
            {items.length === 0 ? (
                <View className="p-8 items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Text className="text-gray-400 text-center">No hay conceptos agregados.</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    scrollEnabled={false}
                />
            )}
        </View>
    );
}
