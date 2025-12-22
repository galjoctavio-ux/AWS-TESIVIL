import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { SPACING } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';

interface RadarChartProps {
    data: {
        speed: number;       // 1-5 scale
        precision: number;   // 1-5 scale
        hallucination: number; // 1-5 scale (5 = no hallucination)
    };
    size?: number;
    color?: string;
}

export function RadarChart({
    data,
    size = 200,
    color,
}: RadarChartProps) {
    const { colors } = useTheme();
    const chartColor = color || colors.pulse;
    const styles = createStyles(colors);

    const center = size / 2;
    const radius = size * 0.35;
    const levels = 5;

    // Labels for the 3 axes
    const labels = [
        { key: 'speed', label: 'Velocidad', angle: -90 },
        { key: 'precision', label: 'Precisión', angle: 30 },
        { key: 'hallucination', label: 'Realismo', angle: 150 },
    ];

    // Convert polar to cartesian coordinates
    const polarToCartesian = (angle: number, value: number) => {
        const radian = (angle * Math.PI) / 180;
        const r = (value / 5) * radius;
        return {
            x: center + r * Math.cos(radian),
            y: center + r * Math.sin(radian),
        };
    };

    // Generate polygon points for data
    const dataPoints = labels.map(({ key, angle }) => {
        const value = data[key as keyof typeof data] || 0;
        return polarToCartesian(angle, value);
    });

    const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    // Generate grid levels
    const gridLevels = Array.from({ length: levels }, (_, i) => i + 1);

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                {/* Background grid */}
                {gridLevels.map((level) => {
                    const levelPoints = labels.map(({ angle }) => {
                        const point = polarToCartesian(angle, level);
                        return `${point.x},${point.y}`;
                    }).join(' ');

                    return (
                        <Polygon
                            key={`grid-${level}`}
                            points={levelPoints}
                            fill="none"
                            stroke={colors.surfaceBorder}
                            strokeWidth={1}
                            opacity={0.5}
                        />
                    );
                })}

                {/* Axis lines */}
                {labels.map(({ angle, label }, index) => {
                    const end = polarToCartesian(angle, 5);
                    const labelPos = polarToCartesian(angle, 6);

                    return (
                        <G key={`axis-${index}`}>
                            <Line
                                x1={center}
                                y1={center}
                                x2={end.x}
                                y2={end.y}
                                stroke={colors.surfaceBorder}
                                strokeWidth={1}
                            />
                            <SvgText
                                x={labelPos.x}
                                y={labelPos.y}
                                fill={colors.textSecondary}
                                fontSize={10}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                            >
                                {label}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Data polygon */}
                <Polygon
                    points={polygonPoints}
                    fill={`${chartColor}40`}
                    stroke={chartColor}
                    strokeWidth={2}
                />

                {/* Data points */}
                {dataPoints.map((point, index) => (
                    <Circle
                        key={`point-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={4}
                        fill={chartColor}
                    />
                ))}

                {/* Center point */}
                <Circle cx={center} cy={center} r={2} fill={colors.textMuted} />
            </Svg>

            {/* Legend */}
            <View style={styles.legend}>
                {labels.map(({ key, label }) => {
                    const value = data[key as keyof typeof data] || 0;
                    return (
                        <View key={key} style={styles.legendItem}>
                            <Text style={styles.legendLabel}>{label}</Text>
                            <Text style={styles.legendValue}>{value.toFixed(1)}/5</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: SPACING.md,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: SPACING.md,
    },
    legendItem: {
        alignItems: 'center',
    },
    legendLabel: {
        fontSize: 11,
        color: colors.textMuted,
    },
    legendValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: 2,
    },
});

export default RadarChart;
