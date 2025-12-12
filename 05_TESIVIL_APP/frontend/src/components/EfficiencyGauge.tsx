import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type EfficiencyGaugeProps = {
    profitMargin: number; // 0-100 (e.g. 30 for 30%)
};

export const EfficiencyGauge = ({ profitMargin }: EfficiencyGaugeProps) => {
    // Determine color based on master plan logic
    // Green > 30%, Yellow 15-30%, Red < 15%
    let color = '#f44336'; // Red
    let statusText = 'Crítico';

    if (profitMargin >= 15) {
        color = '#ff9800'; // Orange/Yellow
        statusText = 'Atención';
    }
    if (profitMargin >= 30) {
        color = '#4caf50'; // Green
        statusText = 'Óptimo';
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nivel de Eficiencia (Margen)</Text>
            <View style={[styles.barContainer, { borderColor: color }]}>
                <View style={[styles.fill, { width: `${Math.min(profitMargin, 100)}%`, backgroundColor: color }]} />
            </View>
            <View style={styles.labels}>
                <Text style={[styles.status, { color }]}>{statusText}</Text>
                <Text style={styles.percentage}>{profitMargin.toFixed(1)}%</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginTop: 20 },
    label: { fontSize: 14, color: '#666', marginBottom: 5 },
    barContainer: { height: 20, width: '100%', backgroundColor: '#eee', borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
    fill: { height: '100%' },
    labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    status: { fontWeight: 'bold' },
    percentage: { fontWeight: 'bold' }
});
