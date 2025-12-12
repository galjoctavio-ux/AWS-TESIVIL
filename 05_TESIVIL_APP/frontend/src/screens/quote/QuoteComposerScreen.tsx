import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useQuoteState } from '../../context/QuoteStateContext';
import { db } from '../../powersync/db';

type SearchItem = {
    id: number | string; // ID can be int (materials) or int (assemblies)
    name: string;
    base_price?: number; // Materials have base_price
    type: 'MATERIAL' | 'ASSEMBLY';
};

export const QuoteComposerScreen = () => {
    const { items, addItem, removeItem, logisticsTier } = useQuoteState();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            // Search Materials
            const materials = await db.getAll('SELECT id, name, base_price FROM materials WHERE name LIKE ? LIMIT 5', [`%${searchQuery}%`]);
            const matItems = materials.map((m: any) => ({ ...m, type: 'MATERIAL' }));

            // Search Assemblies
            const assemblies = await db.getAll('SELECT id, name FROM assemblies WHERE name LIKE ? LIMIT 5', [`%${searchQuery}%`]);
            const asmItems = assemblies.map((a: any) => ({ ...a, type: 'ASSEMBLY' }));

            setSearchResults([...matItems, ...asmItems]);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'No se pudo buscar en la base de datos.');
        }
    };

    const handleAddItem = async (item: SearchItem) => {
        let logisticMultiplier = 1.0;
        if (logisticsTier === 1) logisticMultiplier = 1.08;
        if (logisticsTier === 2) logisticMultiplier = 1.15;

        if (item.type === 'MATERIAL') {
            const finalPrice = Math.ceil((item.base_price || 0) * logisticMultiplier);
            addItem({
                id: Date.now().toString() + Math.random().toString(),
                materialId: Number(item.id),
                name: item.name,
                quantity: 1,
                unitPrice: finalPrice,
                laborCost: 15000 // Placeholder
            });
        } else {
            // ASSEMBLY Logic: "The Sniper"
            // Fetch definitions
            try {
                const defs = await db.getAll(
                    `SELECT ad.quantity, m.id as material_id, m.name, m.base_price 
                     FROM assembly_definitions ad
                     JOIN materials m ON ad.material_id = m.id
                     WHERE ad.assembly_id = ?`,
                    [item.id]
                );

                // Add each component
                for (const def of (defs as any[])) {
                    const finalPrice = Math.ceil(def.base_price * logisticMultiplier);
                    addItem({
                        id: Date.now().toString() + Math.random().toString(),
                        materialId: def.material_id,
                        name: `${item.name}: ${def.name}`, // "Kit Salida: Cable"
                        quantity: def.quantity,
                        unitPrice: finalPrice,
                        laborCost: 5000 // Reduced labor per item in kit? or aggregate? For now, simple.
                    });
                }
                Alert.alert("Kit Agregado", `Se agregaron ${defs.length} componentes del kit.`);

            } catch (e) {
                console.error(e);
                Alert.alert("Error", "No se pudo cargar el kit.");
            }
        }

        setSearchResults([]);
        setSearchQuery('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>2. Composición</Text>

            <View style={styles.searchBox}>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar material o kit..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <Button title="Buscar" onPress={handleSearch} />
            </View>

            {searchResults.length > 0 && (
                <View style={styles.results}>
                    <Text style={styles.label}>Resultados:</Text>
                    {searchResults.map((m, i) => (
                        <TouchableOpacity key={m.id + '-' + i} style={styles.resultItem} onPress={() => handleAddItem(m)}>
                            <Text>
                                {m.type === 'ASSEMBLY' ? '[KIT] ' : ''}{m.name}
                                {m.type === 'MATERIAL' ? ` - $${((m.base_price || 0) / 100).toFixed(2)}` : ''}
                            </Text>
                            <Text style={styles.addText}>+</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={[styles.label, { marginTop: 20 }]}>Items Agregados:</Text>
            <ScrollView style={styles.list}>
                {items.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                        <View>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text>Cant: {item.quantity} | ${(item.unitPrice / 100).toFixed(2)}</Text>
                        </View>
                        <Button title="X" color="red" onPress={() => removeItem(item.id)} />
                    </View>
                ))}
                {items.length === 0 && <Text style={styles.empty}>No hay items agregados.</Text>}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    searchBox: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5 },
    results: { maxHeight: 150, backgroundColor: '#f0f0f0', borderRadius: 5, padding: 5 },
    resultItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
    addText: { fontSize: 18, color: 'blue', fontWeight: 'bold' },
    list: { marginTop: 10 },
    itemRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 15, borderBottomWidth: 1, borderColor: '#eee'
    },
    itemName: { fontWeight: 'bold', fontSize: 16 },
    empty: { textAlign: 'center', marginTop: 20, color: '#888' },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 }
});
