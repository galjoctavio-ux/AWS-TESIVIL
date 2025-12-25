/**
 * Mirage Diagnostic Mode Data
 * Based on "Boletín Técnico: Función Modo TEST Inverter 2021"
 * 
 * Models: MAGNUM 17/19/21/30/32, PLATINUM 19, FLEX INVERTER, INVERTER X
 */

// Display codes shown in Test Mode
export interface DiagnosticCode {
    code: string;         // Display symbol (T1, Fr, ST...)
    label: string;        // Short label
    description: string;  // Full description
    range?: string;       // Value range or units
    isHex?: boolean;      // Requires hex conversion
    multiplier?: number;  // For hex conversion (x10, x2)
}

export const DIAGNOSTIC_CODES: DiagnosticCode[] = [
    { code: 'T1', label: 'Temp. Interior', description: 'Temperatura ambiente interior (habitación)', range: '-25°C a 70°C' },
    { code: 'T2', label: 'Temp. Evaporador', description: 'Temperatura del serpentín interior', range: '-25°C a 70°C' },
    { code: 'T3', label: 'Temp. Condensador', description: 'Temperatura del serpentín exterior', range: '-25°C a 70°C' },
    { code: 'T4', label: 'Temp. Exterior', description: 'Temperatura ambiente exterior', range: '-25°C a 70°C' },
    { code: 'Tb', label: 'Temp. Tubería Líquido', description: 'Temperatura de la línea de líquido', range: '-25°C a 70°C' },
    { code: 'TP', label: 'Temp. Descarga', description: 'Temperatura de descarga del compresor', range: '20°C a 130°C' },
    { code: 'TH', label: 'Temp. Módulo IPM', description: 'Temperatura del módulo inverter', range: '-25°C a 70°C' },
    { code: 'FT', label: 'Frecuencia Target', description: 'Frecuencia objetivo de la tarjeta', range: '0 - 159 Hz' },
    { code: 'Fr', label: 'Frecuencia Real', description: 'Frecuencia actual del compresor', range: '0 - 159 Hz' },
    { code: 'IF', label: 'Vel. Fan Interior', description: 'Velocidad del ventilador interior', range: '0=Off, 1-4 (Low/Med/High/Turbo)' },
    { code: 'OF', label: 'Vel. Fan Exterior', description: 'Velocidad del ventilador exterior (Hex)', range: '200-2550 RPM', isHex: true, multiplier: 10 },
    { code: 'LA', label: 'Ángulo EXV', description: 'Ángulo de apertura de válvula de expansión (Hex)', range: '0-510 pasos', isHex: true, multiplier: 2 },
    { code: 'CT', label: 'Tiempo Trabajo', description: 'Tiempo de trabajo continuo del compresor', range: '0 - 255 min' },
    { code: 'ST', label: 'Causa de Paro', description: 'Código de razón por la cual se detuvo el compresor', range: 'Ver tabla ST (1-51)' },
];

// ST Codes: Compressor Stop Causes (1-51)
export const ST_CODES: Record<number, string> = {
    1: 'Limitación de frecuencia por corriente',
    2: 'Limitación de frecuencia por T2 en enfriamiento',
    3: 'Limitación de frecuencia por T2 en calefacción',
    4: 'Se alcanzó la temperatura establecida',
    5: 'Limitación de frecuencia por T4',
    6: 'Descongelamiento',
    7: 'Cambio de modo de operación',
    9: 'Protección por alta temp. en descarga (TP)',
    10: 'Protección por T2 (Alta temp. en serpentín evaporador)',
    11: 'Protección por T2 (Baja temp. en evaporador)',
    12: 'Protección por T3 (Alta temp. en condensador)',
    13: 'Protección por temp. ambiente interior baja (Modo Seco)',
    14: 'Protección por baja temp. ambiente',
    15: 'Detección de fuga de refrigerante',
    16: 'Falla de comunicación entre unidades (E1)',
    17: 'Falla de comunicación con driver de compresor',
    18: 'Protección en voltaje de entrada CA',
    19: 'Protección por temp. de descarga en compresor (P2)',
    20: 'Falla en memoria EEPROM (F4)',
    21: 'Mal funcionamiento velocidad ventilador interior',
    22: 'Sensor de temperatura abierto o cortocircuito (E4/E5/F1/F2/F3)',
    23: 'Protección por sobrecorriente',
    24: 'Protección por sobrecorriente en módulo IPM (P0)',
    25: 'Pérdida de fase en compresor (P43)',
    26: 'Mal funcionamiento en compresor',
    27: 'Protección por bajo voltaje en driver del compresor',
    28: 'Protección de corriente en Fan DC (F5)',
    29: 'Pérdida de fase en Fan DC (F5)',
    30: 'Protección de velocidad cero en Fan DC',
    31: 'Protección en módulo PFC',
    32: 'Protección por alto voltaje en driver de compresor',
    33: 'Protección de velocidad cero en compresor (P44)',
    34: 'Falla en módulo PWM en driver de compresor (P45)',
    35: 'Falla en módulo MCE en driver de compresor (P12)',
    36: 'Protección por sobrecorriente en compresor (P49)',
    37: 'Falla en memoria EEPROM tarjeta condensador',
    38: 'Falla en el arranque del compresor (P42)',
    39: 'Velocidad de compresor fuera de control (P46)',
    40: 'Protección por baja presión',
    41: 'Protección por alta presión',
    42: 'Falla en módulo PFC',
    49: 'Paro por apagado de la unidad',
    50: 'Desconexión eléctrica',
    51: 'Paro DR',
};

// Entry instructions
export const ENTRY_INSTRUCTIONS = [
    { step: 1, text: 'Apunte el control remoto hacia la unidad evaporadora.' },
    { step: 2, text: 'Presione el botón DISPLAY 3 veces consecutivas.' },
    { step: 3, text: 'Inmediatamente presione DIRECT (o SWING/GEN) 3 veces.' },
    { step: 4, text: 'Espere el sonido de confirmación. El display mostrará el primer código.' },
    { step: 5, text: 'Use DIRECT para navegar entre códigos. El valor aparece por 2 segundos.' },
];

// Compatible models
export const COMPATIBLE_MODELS = [
    'MAGNUM 17', 'MAGNUM 19', 'MAGNUM 21', 'MAGNUM 30', 'MAGNUM 32',
    'PLATINUM 19', 'FLEX INVERTER', 'INVERTER X'
];

// Helper function: Convert hex display value to decimal
export const hexToDecimal = (hexValue: string): number => {
    const cleaned = hexValue.toUpperCase().replace(/[^0-9A-F]/g, '');
    return parseInt(cleaned, 16) || 0;
};

// Helper function: Get ST code description
export const getSTCodeDescription = (code: number): string => {
    return ST_CODES[code] || 'Código no documentado';
};
