import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuoteState } from '../../context/QuoteStateContext';
import { EfficiencyGauge } from '../../components/EfficiencyGauge';

export const QuoteAnalysisScreen = () => {
    const { totalMaterialCost, totalLaborCost } = useQuoteState();

    // In real implementation, system_labor_total would be calculated based on book_time_index * hourly_rates

    const total = totalMaterialCost + totalLaborCost;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>3. Análisis de Eficiencia</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Materiales:</Text>
                <Text style={styles.value}>${(totalMaterialCost / 100).toFixed(2)}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Mano de Obra Calculada:</Text>
                <Text style={styles.value}>${(totalLaborCost / 100).toFixed(2)}</Text>
            </View>

            <View style={[styles.card, styles.totalCard]}>
                <Text style={[styles.label, styles.totalText]}>TOTAL PROYECTO:</Text>
                <Text style={[styles.value, styles.totalText]}>${(total / 100).toFixed(2)}</Text>
            </View>

            {/* 
                Profit Calculation Mock:
                In reality, "Material Price" includes a markup. 
                Let's assume Base Cost is 70% of Price for this mock visualization.
                Margin = (Price - Base) / Price. 
                Here we act as if 'total' is Revenue. 
                Let's pretend costs are 75% of total.
             */}
            <EfficiencyGauge profitMargin={25} />

            <Text style={styles.note}>El "Gauge" muestra el margen estimado basado en costos teóricos.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    card: {
        flexDirection: 'row', justifyContent: 'space-between',
        padding: 15, backgroundColor: '#f9f9f9', marginBottom: 10, borderRadius: 8
    },
    totalCard: { backgroundColor: '#e3f2fd', marginTop: 20 },
    label: { fontSize: 16 },
    value: { fontSize: 18, fontWeight: 'bold' },
    totalText: { color: '#0d47a1', fontSize: 20 },
    note: { marginTop: 40, textAlign: 'center', fontStyle: 'italic', color: '#666' }
});
