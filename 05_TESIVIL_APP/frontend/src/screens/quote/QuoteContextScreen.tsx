import React from 'react';
import { View, Text, StyleSheet, Switch, Button } from 'react-native';
import { useQuoteState } from '../../context/QuoteStateContext';

export const QuoteContextScreen = () => {
    const {
        logisticsTier, setLogisticsTier,
        isUrgent, setIsUrgent,
        obstructionFactor, setObstructionFactor
    } = useQuoteState();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>1. Contexto de Obra</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Nivel Logístico</Text>
                <View style={styles.buttonGroup}>
                    <Button title="Local (0%)" onPress={() => setLogisticsTier(0)} color={logisticsTier === 0 ? 'blue' : 'gray'} />
                    <Button title="Periferia (+)" onPress={() => setLogisticsTier(1)} color={logisticsTier === 1 ? 'blue' : 'gray'} />
                    <Button title="Foráneo (++)" onPress={() => setLogisticsTier(2)} color={logisticsTier === 2 ? 'blue' : 'gray'} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Obstrucción / Dificultad</Text>
                <View style={styles.buttonGroup}>
                    <Button title="Normal" onPress={() => setObstructionFactor(0)} color={obstructionFactor === 0 ? 'green' : 'gray'} />
                    <Button title="Difícil (+20%)" onPress={() => setObstructionFactor(0.2)} color={obstructionFactor === 0.2 ? 'orange' : 'gray'} />
                    <Button title="Extremo (+50%)" onPress={() => setObstructionFactor(0.5)} color={obstructionFactor === 0.5 ? 'red' : 'gray'} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>¿Es Urgencia? (Noche/Finde)</Text>
                <Switch value={isUrgent} onValueChange={setIsUrgent} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    section: { marginBottom: 30 },
    label: { fontSize: 16, marginBottom: 10 },
    buttonGroup: { flexDirection: 'row', gap: 10 }
});
