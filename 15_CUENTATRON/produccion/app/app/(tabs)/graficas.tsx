/**
 * Gráficas Screen
 * Cuentatron MVP
 * 
 * Module: modulo_04_graficas
 * 3 chart types via tabs: Consumo, Voltaje, Corriente
 * Period selector: Hora, Día, Semana, Mes, Bimestre
 * 
 * NO implementar: exportación (UXUI-050), scroll vertical (UXUI-049)
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ChartType = 'consumo' | 'voltaje' | 'corriente';
type PeriodType = 'hora' | 'dia' | 'semana' | 'mes' | 'bimestre';

const CHART_TABS: { key: ChartType; label: string; icon: string }[] = [
    { key: 'consumo', label: 'Consumo', icon: 'flash' },
    { key: 'voltaje', label: 'Voltaje', icon: 'pulse' },
    { key: 'corriente', label: 'Corriente', icon: 'water' },
];

const PERIODS: { key: PeriodType; label: string }[] = [
    { key: 'hora', label: 'Hora' },
    { key: 'dia', label: 'Día' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes', label: 'Mes' },
    { key: 'bimestre', label: 'Bimestre' },
];

// Mock data for charts
const MOCK_DATA = {
    consumo: {
        values: [12, 18, 15, 22, 19, 25, 20],
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        unit: 'kWh',
        average: 18.7,
        total: 131,
    },
    voltaje: {
        values: [118, 122, 119, 127, 121, 118, 120],
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        unit: 'V',
        average: 120.7,
        min: 118,
        max: 127,
        thresholdHigh: 125,
        thresholdLow: 115,
    },
    corriente: {
        values: [0.2, 0.5, 0.3, 0.8, 0.4, 0.2, 0.3],
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        unit: 'A',
        average: 0.39,
        max: 0.8,
    },
};

const screenWidth = Dimensions.get('window').width;

export default function GraficasScreen() {
    const [activeChart, setActiveChart] = useState<ChartType>('consumo');
    const [period, setPeriod] = useState<PeriodType>('semana');
    const [loading, setLoading] = useState(false);

    // Get current chart data
    const chartData = MOCK_DATA[activeChart];

    // Calculate bar heights for simple chart visualization
    const maxValue = Math.max(...chartData.values);
    const chartHeight = 200;

    // Render chart tabs
    const renderChartTabs = () => (
        <View style={styles.tabsContainer}>
            {CHART_TABS.map((tab) => (
                <TouchableOpacity
                    key={tab.key}
                    style={[
                        styles.tab,
                        activeChart === tab.key && styles.tabActive,
                    ]}
                    onPress={() => setActiveChart(tab.key)}
                >
                    <Ionicons
                        name={tab.icon as any}
                        size={20}
                        color={activeChart === tab.key ? '#fff' : '#888'}
                    />
                    <Text style={[
                        styles.tabText,
                        activeChart === tab.key && styles.tabTextActive,
                    ]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // Render period selector
    const renderPeriodSelector = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodContainer}
            contentContainerStyle={styles.periodContent}
        >
            {PERIODS.map((p) => (
                <TouchableOpacity
                    key={p.key}
                    style={[
                        styles.periodButton,
                        period === p.key && styles.periodButtonActive,
                    ]}
                    onPress={() => setPeriod(p.key)}
                >
                    <Text style={[
                        styles.periodText,
                        period === p.key && styles.periodTextActive,
                    ]}>
                        {p.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    // Render simple bar chart
    const renderChart = () => {
        return (
            <View style={styles.chartContainer}>
                {/* Chart area */}
                <View style={styles.chartArea}>
                    <View style={styles.barsContainer}>
                        {chartData.values.map((value, index) => {
                            const barHeight = (value / maxValue) * chartHeight;
                            const isHighlight = activeChart === 'voltaje' &&
                                (value > MOCK_DATA.voltaje.thresholdHigh || value < MOCK_DATA.voltaje.thresholdLow);

                            return (
                                <View key={index} style={styles.barWrapper}>
                                    <View
                                        style={[
                                            styles.bar,
                                            { height: barHeight },
                                            isHighlight && styles.barWarning,
                                        ]}
                                    />
                                    <Text style={styles.barLabel}>{chartData.labels[index]}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Threshold lines for voltage */}
                    {activeChart === 'voltaje' && (
                        <>
                            <View style={[
                                styles.thresholdLine,
                                { bottom: (MOCK_DATA.voltaje.thresholdHigh / maxValue) * chartHeight + 20 }
                            ]}>
                                <Text style={styles.thresholdText}>Alto: {MOCK_DATA.voltaje.thresholdHigh}V</Text>
                            </View>
                            <View style={[
                                styles.thresholdLine,
                                styles.thresholdLineLow,
                                { bottom: (MOCK_DATA.voltaje.thresholdLow / maxValue) * chartHeight + 20 }
                            ]}>
                                <Text style={[styles.thresholdText, styles.thresholdTextLow]}>
                                    Bajo: {MOCK_DATA.voltaje.thresholdLow}V
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </View>
        );
    };

    // Render statistics
    const renderStats = () => {
        if (activeChart === 'consumo') {
            return (
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Promedio</Text>
                        <Text style={styles.statValue}>
                            {chartData.average} {chartData.unit}/día
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total periodo</Text>
                        <Text style={styles.statValue}>
                            {MOCK_DATA.consumo.total} {chartData.unit}
                        </Text>
                    </View>
                </View>
            );
        }

        if (activeChart === 'voltaje') {
            return (
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Promedio</Text>
                        <Text style={styles.statValue}>
                            {MOCK_DATA.voltaje.average} {chartData.unit}
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Mín / Máx</Text>
                        <Text style={styles.statValue}>
                            {MOCK_DATA.voltaje.min} / {MOCK_DATA.voltaje.max} {chartData.unit}
                        </Text>
                    </View>
                </View>
            );
        }

        if (activeChart === 'corriente') {
            return (
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Promedio fuga</Text>
                        <Text style={styles.statValue}>
                            {MOCK_DATA.corriente.average} {chartData.unit}
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Máximo</Text>
                        <Text style={styles.statValue}>
                            {MOCK_DATA.corriente.max} {chartData.unit}
                        </Text>
                    </View>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Gráficas</Text>
            </View>

            {/* Chart type tabs */}
            {renderChartTabs()}

            {/* Period selector */}
            {renderPeriodSelector()}

            {/* Chart */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>
                            {CHART_TABS.find(t => t.key === activeChart)?.label}
                        </Text>
                        <Text style={styles.chartPeriod}>
                            Última {PERIODS.find(p => p.key === period)?.label}
                        </Text>
                    </View>

                    {renderChart()}
                    {renderStats()}
                </View>
            )}

            {/* Info note */}
            <View style={styles.infoNote}>
                <Ionicons name="information-circle-outline" size={16} color="#888" />
                <Text style={styles.infoText}>
                    Datos de demostración. Conecta tu dispositivo para ver datos reales.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    // Header
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
        backgroundColor: '#252542',
        marginHorizontal: 4,
        borderRadius: 12,
    },
    tabActive: {
        backgroundColor: '#4f46e5',
    },
    tabText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#fff',
    },
    // Period selector
    periodContainer: {
        maxHeight: 44,
        marginBottom: 16,
    },
    periodContent: {
        paddingHorizontal: 16,
    },
    periodButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#252542',
        borderRadius: 20,
        marginRight: 8,
    },
    periodButtonActive: {
        backgroundColor: '#4f46e540',
        borderWidth: 1,
        borderColor: '#4f46e5',
    },
    periodText: {
        color: '#888',
        fontSize: 14,
    },
    periodTextActive: {
        color: '#4f46e5',
        fontWeight: '500',
    },
    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Chart card
    chartCard: {
        backgroundColor: '#252542',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    chartPeriod: {
        fontSize: 14,
        color: '#888',
    },
    // Chart
    chartContainer: {
        marginBottom: 20,
    },
    chartArea: {
        height: 220,
        position: 'relative',
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 200,
        paddingTop: 20,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        width: 24,
        backgroundColor: '#4f46e5',
        borderRadius: 4,
        marginBottom: 8,
    },
    barWarning: {
        backgroundColor: '#ef4444',
    },
    barLabel: {
        fontSize: 10,
        color: '#666',
    },
    // Threshold lines
    thresholdLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#ef444440',
    },
    thresholdLineLow: {
        backgroundColor: '#f59e0b40',
    },
    thresholdText: {
        position: 'absolute',
        right: 0,
        top: -16,
        fontSize: 10,
        color: '#ef4444',
    },
    thresholdTextLow: {
        color: '#f59e0b',
    },
    // Stats
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    // Info note
    infoNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        marginTop: 16,
    },
    infoText: {
        fontSize: 12,
        color: '#888',
    },
});
