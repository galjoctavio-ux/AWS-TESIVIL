/**
 * BTU Calculator Service - Professional Thermal Load Calculator
 * 
 * Implements component-based heat gain calculations:
 * Q_total = (Q_conduccion + Q_radiacion + Q_interna + Q_infiltracion) * 1.10
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Orientation = 'N' | 'S' | 'E' | 'O' | 'NE' | 'NO' | 'SE' | 'SO';
export type WallMaterial = 'concreto' | 'ladrillo' | 'tablaroca' | 'aislado';
export type SunExposure = 'sol_directo' | 'sombra';
export type CeilingType = 'losa_concreto' | 'techo_atico' | 'lamina';
export type CeilingColor = 'claro' | 'oscuro';
export type FloorType = 'planta_baja' | 'piso_intermedio';
export type GlassType = 'sencillo' | 'doble' | 'termico';
export type WindowProtection = 'persianas' | 'cortinas' | 'toldo' | 'ninguno';
export type ClimateZone = 'templada' | 'calida' | 'muy_calida';
export type UnitSystem = 'metric' | 'imperial';

export interface WallConfig {
    id: string;
    orientacion: Orientation;
    area: number; // m²
    material: WallMaterial;
    exposicion: SunExposure;
}

export interface WindowConfig {
    id: string;
    area: number; // m²
    tipo_vidrio: GlassType;
    proteccion: WindowProtection;
    orientacion: Orientation;
}

export interface CeilingConfig {
    area: number; // m²
    tipo: CeilingType;
    color: CeilingColor;
}

export interface FloorConfig {
    area: number; // m²
    tipo: FloorType;
}

export interface InternalLoads {
    personas: number;
    estufa: boolean;
    otros_equipos_watts: number;
    iluminacion_watts: number;
}

export interface BTUCalculatorState {
    // Room dimensions
    length: number;
    width: number;
    height: number;

    // Climate
    climateZone: ClimateZone;
    deltaT: number; // Temperature difference (outdoor vs desired indoor)

    // Structure
    walls: WallConfig[];
    ceiling: CeilingConfig;
    floor: FloorConfig;

    // Windows
    windows: WindowConfig[];

    // Internal loads
    internalLoads: InternalLoads;

    // Settings
    unitSystem: UnitSystem;
}

export interface HeatGainBreakdown {
    conduccion: number;
    radiacion: number;
    personas: number;
    equipos: number;
    estufa: number;
    iluminacion: number;
    infiltracion: number;
}

export interface BTUCalculationResult {
    totalBTU: number;
    breakdown: HeatGainBreakdown;
    percentages: HeatGainBreakdown;
    recommendation: {
        tonnage: string;
        btuCommercial: number;
        equipmentType: string;
    };
    area: number;
}

// ============================================================================
// THERMAL COEFFICIENTS
// ============================================================================

/**
 * U-Values (Transmitancia térmica) in BTU/(h·ft²·°F)
 * Converted for use with metric inputs
 */
const U_VALUES: Record<WallMaterial, number> = {
    concreto: 0.55,      // High heat transfer
    ladrillo: 0.45,      // Medium-high
    tablaroca: 0.35,     // Medium (with air gap)
    aislado: 0.15,       // Low (insulated wall)
};

/**
 * Solar Heat Gain Coefficient (SHGC) for glass types
 */
const SHGC_VALUES: Record<GlassType, number> = {
    sencillo: 0.86,      // Single pane - high solar gain
    doble: 0.70,         // Double pane
    termico: 0.40,       // Low-E / thermal glass
};

/**
 * Shade factors for window protection
 */
const SHADE_FACTORS: Record<WindowProtection, number> = {
    ninguno: 1.0,        // No protection
    cortinas: 0.70,      // Interior curtains
    persianas: 0.50,     // Blinds
    toldo: 0.35,         // Exterior awning (most effective)
};

/**
 * Orientation factors - solar intensity multiplier by cardinal direction
 */
const ORIENTATION_FACTORS: Record<Orientation, number> = {
    N: 0.65,             // North - least sun (in northern hemisphere)
    S: 1.15,             // South - most sun
    E: 1.00,             // East - morning sun
    O: 1.05,             // West - afternoon sun (hotter)
    NE: 0.80,
    NO: 0.75,
    SE: 1.05,
    SO: 1.10,
};

/**
 * Ceiling U-values and color multipliers
 */
const CEILING_U_VALUES: Record<CeilingType, number> = {
    losa_concreto: 0.50,
    techo_atico: 0.25,   // Attic provides insulation
    lamina: 0.70,        // Metal sheet - high transfer
};

const CEILING_COLOR_FACTOR: Record<CeilingColor, number> = {
    claro: 0.85,         // Light/reflective
    oscuro: 1.15,        // Dark/absorptive
};

/**
 * Climate zone base delta T (°F) - difference between outdoor and desired indoor
 */
const CLIMATE_DELTA_T: Record<ClimateZone, number> = {
    templada: 15,        // 15°F difference
    calida: 25,          // 25°F difference
    muy_calida: 35,      // 35°F difference
};

/**
 * Base solar radiation (BTU/h/ft²) for windows
 */
const BASE_SOLAR_RADIATION = 200; // Average solar load

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Convert square meters to square feet
 */
const sqmToSqft = (sqm: number): number => sqm * 10.764;

/**
 * Calculate heat gain through walls and ceiling (conduction)
 */
const calculateConduction = (
    walls: WallConfig[],
    ceiling: CeilingConfig,
    deltaT: number
): number => {
    let Q_walls = 0;

    // Wall conduction: Q = U × A × ΔT
    for (const wall of walls) {
        const U = U_VALUES[wall.material];
        const A = sqmToSqft(wall.area);
        const exposureFactor = wall.exposicion === 'sol_directo' ? 1.2 : 1.0;
        const orientationFactor = ORIENTATION_FACTORS[wall.orientacion];

        Q_walls += U * A * deltaT * exposureFactor * orientationFactor;
    }

    // Ceiling conduction
    const U_ceiling = CEILING_U_VALUES[ceiling.tipo];
    const A_ceiling = sqmToSqft(ceiling.area);
    const colorFactor = CEILING_COLOR_FACTOR[ceiling.color];

    const Q_ceiling = U_ceiling * A_ceiling * deltaT * colorFactor;

    return Q_walls + Q_ceiling;
};

/**
 * Calculate heat gain through windows (solar radiation)
 */
const calculateRadiation = (windows: WindowConfig[]): number => {
    let Q_solar = 0;

    for (const window of windows) {
        const A = sqmToSqft(window.area);
        const SHGC = SHGC_VALUES[window.tipo_vidrio];
        const shadeFactor = SHADE_FACTORS[window.proteccion];
        const orientationFactor = ORIENTATION_FACTORS[window.orientacion];

        // Q = A × SHGC × Shade × Solar Radiation × Orientation
        Q_solar += A * SHGC * shadeFactor * BASE_SOLAR_RADIATION * orientationFactor;
    }

    return Q_solar;
};

/**
 * Calculate internal heat gains (people, equipment, etc.)
 */
const calculateInternalLoads = (loads: InternalLoads): {
    personas: number;
    equipos: number;
    estufa: number;
    iluminacion: number;
} => {
    // People: 450 BTU/h per person (sensible + latent for moderate activity)
    const Q_personas = loads.personas * 450;

    // Equipment: Watts × 3.41 = BTU/h
    const Q_equipos = loads.otros_equipos_watts * 3.41;

    // Stove/Kitchen: 8,000 BTU/h average load
    const Q_estufa = loads.estufa ? 8000 : 0;

    // Lighting: Watts × 3.41
    const Q_iluminacion = loads.iluminacion_watts * 3.41;

    return {
        personas: Q_personas,
        equipos: Q_equipos,
        estufa: Q_estufa,
        iluminacion: Q_iluminacion,
    };
};

/**
 * Calculate infiltration load (air leakage)
 * Simplified: ~10% of conduction load for typical construction
 */
const calculateInfiltration = (roomVolume: number, deltaT: number): number => {
    // Air changes per hour (ACH) for typical residential: 0.5
    const ACH = 0.5;
    const volumeCuFt = roomVolume * 35.315; // m³ to ft³

    // Q = 1.08 × CFM × ΔT, where CFM = Volume × ACH / 60
    const CFM = (volumeCuFt * ACH) / 60;
    return 1.08 * CFM * deltaT;
};

/**
 * Get commercial tonnage recommendation
 */
const getTonnageRecommendation = (btu: number): {
    tonnage: string;
    btuCommercial: number;
    equipmentType: string;
} => {
    if (btu <= 9000) return { tonnage: '0.75', btuCommercial: 9000, equipmentType: 'Mini Split' };
    if (btu <= 12000) return { tonnage: '1', btuCommercial: 12000, equipmentType: 'Mini Split' };
    if (btu <= 18000) return { tonnage: '1.5', btuCommercial: 18000, equipmentType: 'Mini Split' };
    if (btu <= 24000) return { tonnage: '2', btuCommercial: 24000, equipmentType: 'Mini Split o Central' };
    if (btu <= 36000) return { tonnage: '3', btuCommercial: 36000, equipmentType: 'Central o Multi-Split' };
    if (btu <= 48000) return { tonnage: '4', btuCommercial: 48000, equipmentType: 'Central' };
    if (btu <= 60000) return { tonnage: '5', btuCommercial: 60000, equipmentType: 'Central' };
    return { tonnage: '5+', btuCommercial: 60000, equipmentType: 'Sistema Comercial' };
};

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate total BTU requirement and breakdown
 */
export const calculateBTU = (state: BTUCalculatorState): BTUCalculationResult => {
    const deltaT = state.deltaT || CLIMATE_DELTA_T[state.climateZone];
    const roomVolume = state.length * state.width * state.height;
    const area = state.length * state.width;

    // Calculate each component
    const Q_conduccion = calculateConduction(state.walls, state.ceiling, deltaT);
    const Q_radiacion = calculateRadiation(state.windows);
    const internalLoads = calculateInternalLoads(state.internalLoads);
    const Q_infiltracion = calculateInfiltration(roomVolume, deltaT);

    // Sum internal loads
    const Q_interno = internalLoads.personas + internalLoads.equipos +
        internalLoads.estufa + internalLoads.iluminacion;

    // Total before safety factor
    const Q_subtotal = Q_conduccion + Q_radiacion + Q_interno + Q_infiltracion;

    // Apply 10% safety factor
    const Q_total = Q_subtotal * 1.10;

    // Build breakdown
    const breakdown: HeatGainBreakdown = {
        conduccion: Math.round(Q_conduccion),
        radiacion: Math.round(Q_radiacion),
        personas: Math.round(internalLoads.personas),
        equipos: Math.round(internalLoads.equipos),
        estufa: Math.round(internalLoads.estufa),
        iluminacion: Math.round(internalLoads.iluminacion),
        infiltracion: Math.round(Q_infiltracion),
    };

    // Calculate percentages
    const total = Q_subtotal || 1; // Avoid division by zero
    const percentages: HeatGainBreakdown = {
        conduccion: Math.round((Q_conduccion / total) * 100),
        radiacion: Math.round((Q_radiacion / total) * 100),
        personas: Math.round((internalLoads.personas / total) * 100),
        equipos: Math.round((internalLoads.equipos / total) * 100),
        estufa: Math.round((internalLoads.estufa / total) * 100),
        iluminacion: Math.round((internalLoads.iluminacion / total) * 100),
        infiltracion: Math.round((Q_infiltracion / total) * 100),
    };

    return {
        totalBTU: Math.round(Q_total),
        breakdown,
        percentages,
        recommendation: getTonnageRecommendation(Math.round(Q_total)),
        area,
    };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create default/initial state
 */
export const createDefaultState = (): BTUCalculatorState => ({
    length: 0,
    width: 0,
    height: 2.5,
    climateZone: 'calida',
    deltaT: CLIMATE_DELTA_T.calida,
    walls: [],
    ceiling: {
        area: 0,
        tipo: 'losa_concreto',
        color: 'claro',
    },
    floor: {
        area: 0,
        tipo: 'planta_baja',
    },
    windows: [],
    internalLoads: {
        personas: 2,
        estufa: false,
        otros_equipos_watts: 0,
        iluminacion_watts: 0,
    },
    unitSystem: 'metric',
});

/**
 * Generate unique ID for walls/windows
 */
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * Get smart recommendations based on heat gain breakdown
 */
export const getSmartRecommendations = (result: BTUCalculationResult): string[] => {
    const recommendations: string[] = [];
    const { percentages, breakdown } = result;

    // Check highest contributors
    if (percentages.radiacion >= 30) {
        recommendations.push(
            '☀️ El 30%+ del calor entra por las ventanas. Considera instalar persianas o película térmica para reducir el gasto energético.'
        );
    }

    if (percentages.conduccion >= 40) {
        recommendations.push(
            '🧱 Los muros/techo transfieren mucho calor. Considera aislamiento térmico en paredes o techo reflectivo.'
        );
    }

    if (breakdown.estufa > 0) {
        recommendations.push(
            '🍳 La estufa agrega 8,000 BTU. Una campana extractora ayudaría a reducir esta carga.'
        );
    }

    if (percentages.personas >= 20) {
        recommendations.push(
            '👥 Las personas generan calor significativo. Un equipo Inverter manejará mejor las variaciones de ocupación.'
        );
    }

    // Always add efficiency tip
    recommendations.push(
        '💡 Los equipos Inverter son 30-50% más eficientes y mantienen temperatura más estable.'
    );

    return recommendations;
};

/**
 * Labels for UI display
 */
export const LABELS = {
    orientations: {
        N: 'Norte',
        S: 'Sur',
        E: 'Este',
        O: 'Oeste',
        NE: 'Noreste',
        NO: 'Noroeste',
        SE: 'Sureste',
        SO: 'Suroeste',
    } as Record<Orientation, string>,

    materials: {
        concreto: 'Concreto',
        ladrillo: 'Ladrillo',
        tablaroca: 'Tabla-roca',
        aislado: 'Aislado/Térmico',
    } as Record<WallMaterial, string>,

    exposures: {
        sol_directo: 'Sol Directo',
        sombra: 'Sombra',
    } as Record<SunExposure, string>,

    ceilingTypes: {
        losa_concreto: 'Losa de Concreto',
        techo_atico: 'Techo con Ático',
        lamina: 'Lámina Metálica',
    } as Record<CeilingType, string>,

    ceilingColors: {
        claro: 'Claro/Reflectivo',
        oscuro: 'Oscuro',
    } as Record<CeilingColor, string>,

    glassTypes: {
        sencillo: 'Sencillo',
        doble: 'Doble',
        termico: 'Térmico/Filtro UV',
    } as Record<GlassType, string>,

    windowProtections: {
        ninguno: 'Sin Protección',
        cortinas: 'Cortinas',
        persianas: 'Persianas',
        toldo: 'Toldo Exterior',
    } as Record<WindowProtection, string>,

    climateZones: {
        templada: { label: 'Templada', description: '15-25°C promedio' },
        calida: { label: 'Cálida', description: '25-35°C promedio' },
        muy_calida: { label: 'Muy Cálida', description: '>35°C promedio' },
    } as Record<ClimateZone, { label: string; description: string }>,
};

// ============================================================================
// PDF EXPORT FUNCTION
// ============================================================================

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Generate and share a PDF report of the BTU calculation
 */
export const generateBTUReport = async (
    state: BTUCalculatorState,
    result: BTUCalculationResult
): Promise<void> => {
    const currentDate = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const breakdownRows = [
        { label: 'Conducción (Muros/Techo)', value: result.breakdown.conduccion, pct: result.percentages.conduccion },
        { label: 'Radiación Solar (Ventanas)', value: result.breakdown.radiacion, pct: result.percentages.radiacion },
        { label: 'Personas', value: result.breakdown.personas, pct: result.percentages.personas },
        { label: 'Equipos Eléctricos', value: result.breakdown.equipos, pct: result.percentages.equipos },
        { label: 'Estufa/Cocina', value: result.breakdown.estufa, pct: result.percentages.estufa },
        { label: 'Iluminación', value: result.breakdown.iluminacion, pct: result.percentages.iluminacion },
        { label: 'Infiltración', value: result.breakdown.infiltracion, pct: result.percentages.infiltracion },
    ].filter(row => row.value > 0);

    const wallsHtml = state.walls.length > 0
        ? state.walls.map((w, i) =>
            `<tr>
                <td>Muro ${i + 1}</td>
                <td>${LABELS.orientations[w.orientacion]}</td>
                <td>${w.area} m²</td>
                <td>${LABELS.materials[w.material]}</td>
                <td>${LABELS.exposures[w.exposicion]}</td>
            </tr>`
        ).join('')
        : '<tr><td colspan="5">Sin muros configurados</td></tr>';

    const windowsHtml = state.windows.length > 0
        ? state.windows.map((w, i) =>
            `<tr>
                <td>Ventana ${i + 1}</td>
                <td>${w.area} m²</td>
                <td>${LABELS.glassTypes[w.tipo_vidrio]}</td>
                <td>${LABELS.windowProtections[w.proteccion]}</td>
            </tr>`
        ).join('')
        : '<tr><td colspan="4">Sin ventanas configuradas</td></tr>';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Cálculo de Carga Térmica</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.5; padding: 30px; font-size: 12px; }
            .header { text-align: center; border-bottom: 3px solid #2563EB; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { color: #2563EB; font-size: 24px; margin-bottom: 3px; }
            .header .subtitle { color: #666; font-size: 14px; }
            .result-box { background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px; }
            .result-box .btu { font-size: 36px; font-weight: bold; }
            .result-box .recommendation { background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-top: 10px; }
            .section { margin-bottom: 20px; }
            .section-title { color: #2563EB; font-size: 14px; font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #E5E7EB; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 10px; border: 1px solid #E5E7EB; text-align: left; }
            th { background: #F3F4F6; font-weight: bold; }
            .text-right { text-align: right; }
            .breakdown-row td:last-child { font-weight: bold; color: #2563EB; }
            .footer { margin-top: 30px; text-align: center; color: #9CA3AF; font-size: 10px; border-top: 1px solid #E5E7EB; padding-top: 15px; }
            .info-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
            .info-item { flex: 1; min-width: 100px; background: #F8FAFC; padding: 10px; border-radius: 8px; }
            .info-item .label { font-size: 10px; color: #666; }
            .info-item .value { font-weight: bold; color: #1F2937; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>❄️ QRclima</h1>
            <div class="subtitle">Cálculo de Carga Térmica PRO</div>
        </div>

        <div class="result-box">
            <div class="btu">${result.totalBTU.toLocaleString()} BTU/h</div>
            <div class="recommendation">
                <strong>Recomendación:</strong> ${result.recommendation.tonnage} Tonelada(s) - ${result.recommendation.btuCommercial.toLocaleString()} BTU<br>
                <small>${result.recommendation.equipmentType}</small>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <div class="label">Área</div>
                <div class="value">${result.area.toFixed(1)} m²</div>
            </div>
            <div class="info-item">
                <div class="label">Dimensiones</div>
                <div class="value">${state.length}m × ${state.width}m × ${state.height}m</div>
            </div>
            <div class="info-item">
                <div class="label">Zona Climática</div>
                <div class="value">${LABELS.climateZones[state.climateZone].label}</div>
            </div>
            <div class="info-item">
                <div class="label">Ocupantes</div>
                <div class="value">${state.internalLoads.personas}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📊 Desglose de Carga Térmica</div>
            <table>
                <thead>
                    <tr>
                        <th>Componente</th>
                        <th class="text-right">BTU/h</th>
                        <th class="text-right">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${breakdownRows.map(row => `
                        <tr class="breakdown-row">
                            <td>${row.label}</td>
                            <td class="text-right">${row.value.toLocaleString()}</td>
                            <td class="text-right">${row.pct}%</td>
                        </tr>
                    `).join('')}
                    <tr style="background: #EFF6FF; font-weight: bold;">
                        <td>TOTAL (con factor 1.10)</td>
                        <td class="text-right">${result.totalBTU.toLocaleString()}</td>
                        <td class="text-right">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">🧱 Muros Configurados</div>
            <table>
                <thead>
                    <tr>
                        <th>Muro</th>
                        <th>Orientación</th>
                        <th>Área</th>
                        <th>Material</th>
                        <th>Exposición</th>
                    </tr>
                </thead>
                <tbody>${wallsHtml}</tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">🪟 Ventanas Configuradas</div>
            <table>
                <thead>
                    <tr>
                        <th>Ventana</th>
                        <th>Área</th>
                        <th>Tipo Vidrio</th>
                        <th>Protección</th>
                    </tr>
                </thead>
                <tbody>${windowsHtml}</tbody>
            </table>
        </div>

        <div class="footer">
            Documento generado el ${currentDate} por QRclima App - Calculadora BTU PRO<br>
            <small>Este cálculo es una estimación. Consulte con un profesional para proyectos críticos.</small>
        </div>
    </body>
    </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        console.log('BTU Report PDF generated at:', uri);

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Compartir Cálculo BTU',
                UTI: 'com.adobe.pdf',
            });
        } else {
            throw new Error('Compartir no está disponible en este dispositivo');
        }
    } catch (error) {
        console.error('Error generating BTU PDF:', error);
        throw error;
    }
};
