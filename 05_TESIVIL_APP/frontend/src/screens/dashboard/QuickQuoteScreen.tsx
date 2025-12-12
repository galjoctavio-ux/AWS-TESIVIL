import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';

export const QuickQuoteScreen = () => {
    const [outlets, setOutlets] = useState('');
    const [sqMeters, setSqMeters] = useState('');
    const [estimate, setEstimate] = useState<string | null>(null);

    const calculate = () => {
        const numOutlets = parseInt(outlets) || 0;
        const m2 = parseInt(sqMeters) || 0;

        if (numOutlets === 0 && m2 === 0) {
            Alert.alert("Error", "Ingrese al menos un valor");
            return;
        }

        // Simplified Algorithm (Example)
        // Avg Cost per Outlet: $800 MXN (Material + Labor)
        // Avg Cost per m2 (Wiring only): $150 MXN 

        const costOutlets = numOutlets * 800;
        const costArea = m2 * 150;
        const total = costOutlets + costArea;

        // Range +/- 10%
        const min = total * 0.9;
        const max = total * 1.1;

        setEstimate(`$${min.toFixed(0)} - $${max.toFixed(0)} MXN`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cotización Rápida</Text>
            <Text style={styles.subtitle}>Estimación aproximada basada en métricas generales.</Text>

            <View style={styles.inputGroup}>
                <Text>Número de Salidas (Apagadores, Contactos):</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={outlets}
                    onChangeText={setOutlets}
                    placeholder="Ej. 15"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text>Metros Cuadrados de Construcción:</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={sqMeters}
                    onChangeText={setSqMeters}
                    placeholder="Ej. 80"
                />
            </View>

            <Button title="Calcular Estimado" onPress={calculate} />

            {estimate && (
                <View style={styles.result}>
                    <Text style={styles.resultLabel}>Rango Estimado:</Text>
                    <Text style={styles.resultValue}>{estimate}</Text>
                    <Text style={styles.note}>*No incluye IVA ni acabados especiales.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#0d47a1' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
    inputGroup: { marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginTop: 5, fontSize: 16 },
    result: { marginTop: 40, padding: 20, backgroundColor: '#e3f2fd', borderRadius: 8, alignItems: 'center' },
    resultLabel: { fontSize: 16, color: '#333' },
    resultValue: { fontSize: 28, fontWeight: 'bold', color: '#0d47a1', marginVertical: 10 },
    note: { fontSize: 12, color: '#888', fontStyle: 'italic' }
});
