
const getMultiplicador = (nombre_equipo, estado_equipo) => {
  let multiplicador = 1.0;
  const equiposSensibles = ['Refrigerador', 'Aire Acondicionado'];

  if (equiposSensibles.includes(nombre_equipo)) {
    if (estado_equipo === 'Regular') multiplicador = 1.25;
    else if (estado_equipo === 'Malo') multiplicador = 1.50;
  }
  return multiplicador;
};

const getDutyCycle = (nombre_equipo) => {
  const dutyCycles = {
    'Refrigerador': 0.4,
    'Aire acondicionado': 0.4,
    'Aire acondicionado inverter': 0.4,
    'Bomba periferica': 0.4,
    'Bomba presurizadora': 0.4,
    'Lavadora': 0.5,
    'Secadora': 0.5,
  };
  return dutyCycles[nombre_equipo] || 1.0;
};

const normalizarHorasBimestre = (tiempo_uso, unidad_tiempo) => {
  if (unidad_tiempo === 'Horas/Día') return tiempo_uso * 60;
  if (unidad_tiempo === 'Horas/Semana') return (tiempo_uso / 7) * 60;
  return 0;
};

export const calcularConsumoEquipos = (equiposData, voltaje) => {
  if (!equiposData || equiposData.length === 0 || !voltaje) {
    return [];
  }

  return equiposData.map(equipo => {
    const { nombre_equipo, estado_equipo, tiempo_uso, unidad_tiempo, amperaje_medido } = equipo;

    const multiplicadorEstado = getMultiplicador(nombre_equipo, estado_equipo);
    const dutyCycle = getDutyCycle(nombre_equipo);
    const horas_bimestre = normalizarHorasBimestre(tiempo_uso, unidad_tiempo);

    const Potencia_W = voltaje * amperaje_medido;
    const Consumo_Base_kWh = (Potencia_W * horas_bimestre) / 1000;
    const kwh_bimestre_calculado = Consumo_Base_kWh * multiplicadorEstado * dutyCycle;

    return {
      ...equipo,
      kwh_bimestre_calculado: parseFloat(kwh_bimestre_calculado.toFixed(2))
    };
  });
};

export const detectarFugas = (revisionData) => {
  const { 
    se_puede_apagar_todo, 
    corriente_fuga_f1, corriente_fuga_f2, corriente_fuga_f3,
    corriente_red_f1, corriente_red_f2, corriente_red_f3, corriente_red_n 
  } = revisionData;

  if (se_puede_apagar_todo === true) {
    const fuga_total = (corriente_fuga_f1 || 0) + (corriente_fuga_f2 || 0) + (corriente_fuga_f3 || 0);
    if (fuga_total > 0.05) {
      return `FUGA DETECTADA: Se midió una fuga directa de ${fuga_total.toFixed(2)}A.`;
    }
  }

  const corriente_entrante = (corriente_red_f1 || 0) + (corriente_red_f2 || 0) + (corriente_red_f3 || 0);
  const diferencia = Math.abs(corriente_entrante - (corriente_red_n || 0));

  if (diferencia > 0.15) {
    return `POSIBLE FUGA: Se detectó un desbalance de ${diferencia.toFixed(2)}A entre fases y neutro.`;
  }

  return null;
};

export const verificarSolar = (revisionData) => {
  const { 
    tipo_servicio, paneles_antiguedad_anos, cantidad_paneles, watts_por_panel, 
    corriente_paneles_f1, corriente_paneles_f2, corriente_paneles_f3, voltaje_medido 
  } = revisionData;

  if (!tipo_servicio?.includes('Paneles') || !paneles_antiguedad_anos || !cantidad_paneles || !watts_por_panel) {
    return null;
  }

  const A = paneles_antiguedad_anos;
  let factor_degradacion = 0;
  if (A === 0) factor_degradacion = 1.0;
  else if (A === 1) factor_degradacion = 0.975;
  else if (A > 1) factor_degradacion = 0.975 - ((A - 1) * 0.005);

  const potencia_instalada_W = cantidad_paneles * watts_por_panel;
  const potencia_esperada_W = (potencia_instalada_W * factor_degradacion) * 0.75;

  const corriente_paneles_total = (corriente_paneles_f1 || 0) + (corriente_paneles_f2 || 0) + (corriente_paneles_f3 || 0);
  const potencia_medida_W = corriente_paneles_total * voltaje_medido;

  const eficiencia_relativa = potencia_medida_W / potencia_esperada_W;

  if (eficiencia_relativa < 0.8) {
    return `RENDIMIENTO BAJO: Sus paneles generan ${potencia_medida_W.toFixed(0)}W, cuando se esperarían al menos ${potencia_esperada_W.toFixed(0)}W. Considere limpieza o mantenimiento.`;
  }

  return null;
};

export const generarDiagnosticosAutomaticos = (revisionData, equiposCalculados, diagnosticoFuga, diagnosticoSolar) => {
  const { tipo_medidor, edad_instalacion, capacidad_vs_calibre } = revisionData;
  const diagnosticos = [];

  if (diagnosticoFuga) diagnosticos.push(diagnosticoFuga);
  if (diagnosticoSolar) diagnosticos.push(diagnosticoSolar);

  if (tipo_medidor === 'Digital') {
    diagnosticos.push("Nota: El medidor digital es más preciso, por lo que podría notar un cambio en su cobro si antes era analógico.");
  }
  if (edad_instalacion === '30+ años') {
    diagnosticos.push("Nota: Su instalación tiene más de 30 años y es considerada obsoleta según las normativas actuales. Se recomienda una modernización.");
  }
  if (capacidad_vs_calibre === false) {
    diagnosticos.push("¡PELIGRO! Se detectó que el calibre de uno o más cables es insuficiente para la capacidad del interruptor, presentando un riesgo de sobrecalentamiento e incendio.");
  }

  equiposCalculados.forEach(equipo => {
    if (equipo.estado_equipo === 'Malo') {
      const ubicacion = equipo.nombre_personalizado ? ` (${equipo.nombre_personalizado})` : '';
      diagnosticos.push(`Nota: El equipo ${equipo.nombre_equipo}${ubicacion} se encuentra en mal estado y consume más energía.`);
    }
  });

  return diagnosticos;
};
