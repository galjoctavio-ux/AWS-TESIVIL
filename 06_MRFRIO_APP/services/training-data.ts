/**
 * Datos iniciales de los 40 temas de capacitación
 * Parseados de cursos.txt para el módulo QRclima
 */

export interface TrainingModuleData {
    title: string;
    content: string;
    level: string;
    category: string;
    block: number;
    tokens: number;
    time: number;
    questions: { question: string; options: string[]; correctIndex: number }[];
}

export const INITIAL_TRAINING_DATA: TrainingModuleData[] = [
    // ============== BLOQUE 1: Tendencias y Tecnología ==============
    {
        title: 'El Aire Acondicionado "Tipo Cuadro" (LG ArtCool Gallery)',
        content: 'Este equipo revoluciona la estética permitiendo personalizar la fachada con arte. Sin embargo, para el técnico representa un reto: el acceso a los filtros y a la tarjeta principal requiere mover el panel frontal articulado. Es vital revisar que los servomotores del panel no estén obstruidos.',
        level: 'Básico', category: 'HVAC', block: 1, tokens: 15, time: 3,
        questions: [
            { question: '¿Cuál es la principal característica del modelo ArtCool Gallery?', options: ['Su alta eficiencia energética', 'Su diseño estético tipo cuadro', 'Su bajo costo', 'Su tamaño compacto'], correctIndex: 1 },
            { question: '¿Qué componente adicional requiere revisión en este modelo debido a su panel móvil?', options: ['Compresor', 'Servomotores', 'Capacitor', 'Termostato'], correctIndex: 1 },
            { question: '¿El diseño afecta el acceso tradicional a los componentes internos?', options: ['No, es igual que otros equipos', 'Sí, requiere pasos adicionales', 'Solo en modelos antiguos', 'Depende del instalador'], correctIndex: 1 }
        ]
    },
    {
        title: 'Nueva normativa de refrigerantes A2L (R32)',
        content: 'El R32 está sustituyendo al R410A. Es un refrigerante A2L (ligeramente inflamable). Dato clave: No se debe usar equipo de recuperación estándar si no está certificado para A2L. La carga debe ser precisa y las conexiones deben ser mecánicas o soldadas con protocolos de purga de nitrógeno estrictos.',
        level: 'Básico', category: 'HVAC', block: 1, tokens: 20, time: 5,
        questions: [
            { question: '¿Qué clasificación de seguridad tiene el refrigerante R32?', options: ['A1 - No inflamable', 'A2L - Ligeramente inflamable', 'B1 - Tóxico', 'B2 - Alta inflamabilidad'], correctIndex: 1 },
            { question: '¿Se puede usar cualquier recuperadora para R32?', options: ['Sí, todas sirven', 'No, debe estar certificada para refrigerantes inflamables', 'Solo las de marca original', 'Depende del país'], correctIndex: 1 },
            { question: '¿Cuál es una ventaja del R32 sobre el R410A?', options: ['Es más barato', 'Menor impacto ambiental/GWP', 'Es más fácil de cargar', 'No requiere vacío'], correctIndex: 1 }
        ]
    },
    {
        title: 'El futuro del R-410A: Fechas de salida',
        content: 'Debido a los acuerdos internacionales (Enmienda de Kigali), el R-410A empezará a reducir su producción gradualmente a partir de 2025-2026. Esto significa que el precio del gas subirá. Se recomienda informar a los clientes sobre la migración a equipos más modernos para evitar costos de mantenimiento prohibitivos en el futuro.',
        level: 'Básico', category: 'HVAC', block: 1, tokens: 15, time: 4,
        questions: [
            { question: '¿Por qué dejará de producirse el R-410A?', options: ['Por falta de demanda', 'Por acuerdos internacionales de reducción de gases de efecto invernadero', 'Por problemas de fabricación', 'Por ser muy caro'], correctIndex: 1 },
            { question: '¿Qué pasará con el precio del R-410A a corto plazo?', options: ['Bajará significativamente', 'Aumentará debido a la baja oferta', 'Se mantendrá igual', 'Será gratuito'], correctIndex: 1 },
            { question: '¿Es obligatorio tirar los equipos actuales?', options: ['Sí, inmediatamente', 'No, pero el mantenimiento será más caro', 'Solo si tienen más de 5 años', 'Depende de la marca'], correctIndex: 1 }
        ]
    },
    {
        title: 'Uso del Multímetro: Modo Continuidad',
        content: 'Una de las funciones más subestimadas. La continuidad es esencial para diagnosticar fusibles térmicos en motores y cortes en el cableado de comunicación. Regla de oro: Nunca medir continuidad con el equipo energizado, ya que puedes dañar el multímetro o recibir una descarga.',
        level: 'Básico', category: 'Electricidad', block: 1, tokens: 20, time: 4,
        questions: [
            { question: '¿Cuál es la condición principal para medir continuidad?', options: ['El equipo debe estar funcionando', 'El equipo debe estar desenergizado', 'Usar guantes especiales', 'Estar en modo AC'], correctIndex: 1 },
            { question: '¿Para qué sirve medir continuidad en un fusible?', options: ['Para saber su voltaje', 'Para saber si está abierto o funcional', 'Para medir su temperatura', 'Para calibrarlo'], correctIndex: 1 },
            { question: '¿Qué sonido emite el multímetro si hay continuidad?', options: ['Un pitido intermitente', 'Un pitido constante', 'Ningún sonido', 'Una alarma fuerte'], correctIndex: 1 }
        ]
    },
    {
        title: 'Seguridad: Nuevos protocolos para trabajo en alturas',
        content: 'Las estadísticas muestran que la mayoría de los accidentes ocurren en instalaciones residenciales simples. El uso de arnés es obligatorio a partir de 1.80 metros. No te confíes de las escaleras de tijera en suelos irregulares; siempre usa puntos de anclaje certificados. Tu vida vale más que una instalación rápida.',
        level: 'Básico', category: 'Seguridad', block: 1, tokens: 10, time: 3,
        questions: [
            { question: '¿A partir de qué altura se considera trabajo de riesgo?', options: ['1.00 metros', '1.80 metros', '2.50 metros', '3.00 metros'], correctIndex: 1 },
            { question: '¿Es seguro anclarse de la misma tubería del aire acondicionado?', options: ['Sí, es muy resistente', 'No, se debe usar un punto de anclaje certificado', 'Solo si es tubería de cobre', 'Depende del diámetro'], correctIndex: 1 },
            { question: '¿Cuál es el error más común en accidentes de altura?', options: ['Usar equipo defectuoso', 'Exceso de confianza en instalaciones simples', 'Trabajar de noche', 'No usar casco'], correctIndex: 1 }
        ]
    },
    // ============== BLOQUE 2: Herramientas y Documentación ==============
    {
        title: 'Atención al Cliente: Cómo explicar una fuga sin perder la confianza',
        content: 'El gas refrigerante no se consume, circula. Si falta, hay un agujero. Tip para el técnico: Nunca digas "le falta una recarga" sin antes decir "tenemos una pérdida". Muestra la evidencia con burbujas o detector electrónico. Esto justifica el costo de la reparación antes de la carga.',
        level: 'Básico', category: 'Negocio', block: 2, tokens: 25, time: 5,
        questions: [
            { question: '¿El refrigerante se agota con el uso normal del equipo?', options: ['Sí, cada 2 años', 'No, es un circuito cerrado', 'Solo en verano', 'Depende de la marca'], correctIndex: 1 },
            { question: '¿Cuál es el primer paso antes de rellenar gas en un equipo con baja presión?', options: ['Agregar más gas inmediatamente', 'Localizar y reparar la fuga', 'Cambiar el compresor', 'Limpiar filtros'], correctIndex: 1 },
            { question: '¿Por qué es importante mostrar la fuga al cliente?', options: ['Por ley', 'Para generar confianza y justificar el cobro de la reparación', 'Para presumir conocimientos', 'No es necesario mostrarla'], correctIndex: 1 }
        ]
    },
    {
        title: 'El Manómetro Digital vs. Análogo: ¿Vale la pena la inversión?',
        content: 'Mientras el análogo es fiel, el digital ofrece precisión absoluta, cálculo automático de Sobrecalentamiento (Superheat) y Subenfriamiento (Subcooling). Además, permiten generar reportes en PDF que puedes enviar al cliente por WhatsApp desde la app, dándote una imagen mucho más profesional.',
        level: 'Básico', category: 'Herramientas', block: 2, tokens: 20, time: 4,
        questions: [
            { question: '¿Qué cálculo automático facilita un manómetro digital?', options: ['El voltaje del equipo', 'Sobrecalentamiento y Subenfriamiento', 'El consumo eléctrico', 'La capacidad en BTU'], correctIndex: 1 },
            { question: '¿Cuál es una ventaja competitiva de usar herramientas digitales frente al cliente?', options: ['Son más baratas', 'Permite enviar reportes técnicos profesionales', 'Pesan menos', 'Son más resistentes'], correctIndex: 1 },
            { question: '¿Los manómetros digitales requieren calibración periódica?', options: ['No, nunca', 'Sí, para mantener la precisión', 'Solo los análogos', 'Depende de la marca'], correctIndex: 1 }
        ]
    },
    {
        title: 'Kit de Herramientas Esencial para 2026',
        content: 'Ya no basta con el juego de manómetros y la pinza voltiamperimétrica. El "Kit Pro" actual debe incluir: Vacuómetro electrónico (indispensable para Inverter), termómetro de contacto doble para diferenciales de temperatura y una bomba de vacío de doble etapa. Quien no mide el vacío en micrones, no está instalando, está "adivinando".',
        level: 'Básico', category: 'Herramientas', block: 2, tokens: 15, time: 3,
        questions: [
            { question: '¿Qué herramienta mide con precisión el nivel de vacío?', options: ['Manómetro estándar', 'Vacuómetro electrónico', 'Termómetro', 'Amperímetro'], correctIndex: 1 },
            { question: '¿Cuántas etapas se recomiendan en una bomba de vacío profesional?', options: ['Una etapa', 'Dos etapas', 'Tres etapas', 'No importa'], correctIndex: 1 },
            { question: '¿Para qué sirve el termómetro de doble contacto?', options: ['Medir la temperatura ambiente', 'Para medir el diferencial de temperatura entre entrada y salida de aire', 'Medir la temperatura del compresor', 'Calibrar el termostato'], correctIndex: 1 }
        ]
    },
    {
        title: 'Limpieza de Serpentines: Errores que dañan el equipo',
        content: 'Muchos técnicos usan ácidos fuertes (brilladores) para limpiar el aluminio porque "sale rápido la mugre". Error: Si no se enjuaga al 100%, el ácido sigue comiéndose las aletas, reduciendo la eficiencia. Se recomienda el uso de limpiadores alcalinos biodegradables que protegen el recubrimiento Blue Fin o Gold Fin.',
        level: 'Básico', category: 'HVAC', block: 2, tokens: 20, time: 4,
        questions: [
            { question: '¿Qué riesgo tiene el uso excesivo de ácidos en serpentines?', options: ['Aumenta la eficiencia', 'Corrosión y debilitamiento de las aletas de aluminio', 'Mejora el enfriamiento', 'No tiene ningún riesgo'], correctIndex: 1 },
            { question: '¿Cómo se llama el recubrimiento protector que traen los equipos modernos?', options: ['Chrome Fin', 'Blue Fin o Gold Fin', 'Silver Coat', 'Diamond Shield'], correctIndex: 1 },
            { question: '¿Cuál es el paso más importante tras aplicar cualquier químico de limpieza?', options: ['Dejarlo secar', 'Enjuagar abundantemente con agua', 'Aplicar más químico', 'Encender el equipo inmediatamente'], correctIndex: 1 }
        ]
    },
    {
        title: 'Cómo documentar un servicio para evitar garantías injustificadas',
        content: 'El 30% de las "garantías" son por mal uso del cliente (dejar puertas abiertas, control en 16°C). Protocolo Mr. Frío: Toma foto de la placa de datos, foto del amperaje final de trabajo y foto del diferencial de temperatura. Guarda esto en la app. Si el cliente reclama, tienes el respaldo de que el equipo quedó operando en parámetros de fábrica.',
        level: 'Básico', category: 'Negocio', block: 2, tokens: 15, time: 3,
        questions: [
            { question: '¿Qué dato eléctrico es vital registrar al finalizar una instalación?', options: ['El voltaje de la casa', 'El amperaje de consumo', 'La resistencia del cable', 'La frecuencia de la red'], correctIndex: 1 },
            { question: '¿Por qué se debe documentar el diferencial de temperatura?', options: ['Por requisito legal', 'Para demostrar que el equipo está enfriando según diseño', 'Para calcular el consumo', 'No es necesario documentarlo'], correctIndex: 1 },
            { question: '¿Cuál es un beneficio de guardar fotos del servicio?', options: ['Publicar en redes sociales', 'Evitar reclamos por mal uso del cliente o factores externos', 'Ganar más clientes', 'Cumplir con normas ambientales'], correctIndex: 1 }
        ]
    },
    // ============== BLOQUE 3: Termodinámica y Diagnóstico ==============
    {
        title: 'Cálculo de Sobrecalentamiento (Superheat)',
        content: 'Muchos técnicos cargan gas "por presión" o "al tanteo". El Sobrecalentamiento es la única forma real de asegurar que al compresor le llegue puro vapor y nada de líquido. Fórmula clave: Temperatura de tubería de succión menos temperatura de saturación (manómetro). Un valor ideal está entre 8°F y 12°F (4°C a 6°C). Si es muy bajo, ¡estás inundando el compresor!',
        level: 'Intermedio', category: 'HVAC', block: 3, tokens: 35, time: 6,
        questions: [
            { question: '¿Cuál es el principal riesgo de un sobrecalentamiento muy bajo?', options: ['Baja eficiencia', 'Regreso de líquido al compresor', 'Alto consumo eléctrico', 'Ruido excesivo'], correctIndex: 1 },
            { question: '¿En qué línea se mide la temperatura para este cálculo?', options: ['Línea de descarga', 'Línea de succión/tubería gruesa', 'Línea de líquido', 'En el termostato'], correctIndex: 1 },
            { question: '¿Cargar solo por presión es un método exacto?', options: ['Sí, es el mejor método', 'No, depende de la carga térmica y flujo de aire', 'Solo en equipos nuevos', 'Depende del refrigerante'], correctIndex: 1 }
        ]
    },
    {
        title: 'Subenfriamiento (Subcooling) y Válvulas TXV',
        content: 'Si el equipo tiene válvula de expansión electrónica o termostática (TXV), el sobrecalentamiento será constante. Aquí debemos medir el Subenfriamiento. Esto nos asegura que el refrigerante llegue 100% líquido a la válvula. Se mide en la línea de líquido (delgada). Un subenfriamiento bajo indica falta de carga; uno muy alto, exceso de gas o restricción.',
        level: 'Intermedio', category: 'HVAC', block: 3, tokens: 35, time: 6,
        questions: [
            { question: '¿Dónde se toma la temperatura para medir el subenfriamiento?', options: ['Línea de succión', 'Línea de líquido/tubería delgada', 'En el evaporador', 'En el compresor'], correctIndex: 1 },
            { question: '¿Qué componente del sistema regula el sobrecalentamiento automáticamente?', options: ['El compresor', 'La Válvula de Expansión', 'El condensador', 'El termostato'], correctIndex: 1 },
            { question: '¿Un subenfriamiento alto qué puede indicar?', options: ['Falta de refrigerante', 'Exceso de refrigerante o restricción en el condensador', 'Falla en el motor', 'Problema eléctrico'], correctIndex: 1 }
        ]
    },
    {
        title: 'El Nitrógeno: ¿Por qué es obligatorio al soldar?',
        content: 'Soldar cobre sin un flujo de nitrógeno genera "hollín" (óxido cúprico) por dentro de la tubería. Ese polvo negro viaja y tapa capilares, válvulas y ensucia el aceite del compresor. Tip Pro: Usa un regulador de nitrógeno en 2-3 PSI durante la soldadura; esto desplaza el oxígeno y deja la tubería interna brillante como nueva.',
        level: 'Intermedio', category: 'HVAC', block: 3, tokens: 30, time: 5,
        questions: [
            { question: '¿Cómo se llama el residuo negro que se forma dentro del tubo al soldar sin nitrógeno?', options: ['Carbón', 'Hollín u óxido cúprico', 'Polvo de soldadura', 'Grasa quemada'], correctIndex: 1 },
            { question: '¿Qué componente se tapa más comúnmente por este residuo?', options: ['El compresor', 'El tubo capilar o filtro deshidratador', 'El termostato', 'El motor del ventilador'], correctIndex: 1 },
            { question: '¿A qué presión aproximada se debe mantener el flujo mientras se suelda?', options: ['10 a 15 PSI', '2 a 3 PSI', '50 PSI', '0.5 PSI'], correctIndex: 1 }
        ]
    },
    {
        title: 'Capacitores: Diagnóstico con Multímetro (µF)',
        content: 'No basta con ver si el capacitor está "hinchado". A veces se ve perfecto pero su capacitancia bajó un 20%. La Regla del 10%: Si la placa dice 35µF y tu multímetro marca menos de 31.5µF, cámbialo. Un capacitor débil hace que el motor se caliente, consuma más amperaje y eventualmente se queme.',
        level: 'Intermedio', category: 'Electricidad', block: 3, tokens: 30, time: 5,
        questions: [
            { question: '¿Cuál es la unidad de medida de la capacidad de un capacitor?', options: ['Ohmios', 'Microfaradios / µF', 'Voltios', 'Amperios'], correctIndex: 1 },
            { question: '¿Qué porcentaje de tolerancia se acepta generalmente antes de reemplazarlo?', options: ['30% a 40%', '+/- 5% a 10%', '50%', '1%'], correctIndex: 1 },
            { question: '¿Qué síntoma presenta un compresor con un capacitor débil?', options: ['Funciona perfectamente', 'Intenta arrancar pero se protege por térmico', 'Enfría demasiado', 'Hace mucho ruido'], correctIndex: 1 }
        ]
    },
    {
        title: 'Sensores de Temperatura (NTC): Cómo probarlos',
        content: 'Los sensores (de pozo y de ambiente) son resistencias que varían con la temperatura. Si el equipo marca error de sensor, no lo tires. Mídelo con tu multímetro en Ohms (kΩ). Prueba del vaso con hielo: Mete el sensor en agua con hielo; la resistencia debe subir (normalmente a 10k, 15k o 20k según la marca). Si marca "0" o "infinito", está dañado.',
        level: 'Intermedio', category: 'HVAC', block: 3, tokens: 45, time: 8,
        questions: [
            { question: '¿Qué significa que un sensor sea NTC?', options: ['Que es digital', 'Que su resistencia baja cuando la temperatura sube', 'Que mide voltaje', 'Que es de marca extranjera'], correctIndex: 1 },
            { question: '¿Qué herramienta usas para saber si un sensor está en buen estado?', options: ['Amperímetro', 'Multímetro en escala de Ohms', 'Termómetro infrarrojo', 'Manómetro'], correctIndex: 1 },
            { question: '¿Qué sucede con la resistencia del sensor si lo metes en agua fría?', options: ['Baja a cero', 'La resistencia aumenta', 'Se mantiene igual', 'Marca infinito'], correctIndex: 1 }
        ]
    },
    // ============== BLOQUE 4: Componentes Críticos y Fallas ==============
    {
        title: 'Recuperación de Refrigerante: ¿Por qué no solo "purgar"?',
        content: 'Muchos tiran el gas al aire para ahorrar tiempo, pero el refrigerante recuperado se puede reutilizar si el sistema no está quemado, ahorrando dinero. Además, purgar daña la capa de ozono y es ilegal en muchos países. Tip Pro: Usa cilindros de recuperación limpios y nunca los llenes a más del 80% de su capacidad por seguridad (expansión térmica).',
        level: 'Intermedio', category: 'HVAC', block: 4, tokens: 50, time: 10,
        questions: [
            { question: '¿Cuál es el límite máximo de llenado de un cilindro de recuperación?', options: ['100%', '80%', '50%', '95%'], correctIndex: 1 },
            { question: '¿Se puede reutilizar el gas recuperado de un sistema con el compresor quemado?', options: ['Sí, siempre', 'No, está contaminado con ácido', 'Solo si se filtra', 'Depende del tipo de gas'], correctIndex: 1 },
            { question: '¿Qué beneficio económico tiene recuperar el gas?', options: ['Ninguno', 'Ahorro en la compra de refrigerante nuevo para el mismo cliente', 'Es gratis para el técnico', 'Reduce el tiempo de trabajo'], correctIndex: 1 }
        ]
    },
    {
        title: 'Compresores Scroll vs. Rotativos: Diferencias de diagnóstico',
        content: 'El rotativo es común en Minisplits; el Scroll en equipos centrales. El Scroll es más tolerante a pequeñas cantidades de líquido, pero si gira al revés (fases invertidas), se puede dañar en segundos. Dato técnico: Un compresor rotativo que se calienta suele ser por falta de retorno de gas (que lo enfría), no necesariamente por falla eléctrica.',
        level: 'Intermedio', category: 'HVAC', block: 4, tokens: 40, time: 7,
        questions: [
            { question: '¿Qué tipo de compresor es más común en equipos divididos residenciales grandes (centrales)?', options: ['Rotativo', 'Scroll', 'Recíproco', 'Tornillo'], correctIndex: 1 },
            { question: '¿Qué enfría internamente a un compresor rotativo?', options: ['El aceite', 'El gas refrigerante de retorno', 'El aire ambiente', 'Un ventilador interno'], correctIndex: 1 },
            { question: '¿Qué sucede si un compresor Scroll trifásico gira en sentido contrario?', options: ['Funciona normal', 'No comprime y puede dañarse mecánicamente', 'Es más eficiente', 'Solo hace ruido'], correctIndex: 1 }
        ]
    },
    {
        title: 'Fallas en la Línea de Comunicación (Cable S)',
        content: 'Los equipos Inverter usan un tercer cable (Señal o "S") para que la evaporadora y condensadora "hablen". Si hay ruido eléctrico o el cable está empalmado, el equipo dará error (E1, E6, etc.). Prueba maestra: Mide el voltaje de DC entre Neutro y Señal; debes ver un voltaje que "salta" (oscila). Si está fijo en 0V o 24V, la comunicación está rota.',
        level: 'Intermedio', category: 'HVAC', block: 4, tokens: 45, time: 8,
        questions: [
            { question: '¿Qué tipo de corriente (AC o DC) se usa generalmente en la línea de señal?', options: ['Corriente Alterna - AC', 'Corriente Directa - DC', 'Ambas', 'Ninguna'], correctIndex: 1 },
            { question: '¿Cómo debe comportarse el voltaje al medir la señal de comunicación sana?', options: ['Fijo en 0V', 'Debe oscilar o "brincar" constantemente', 'Fijo en 24V', 'Alternarse entre AC y DC'], correctIndex: 1 },
            { question: '¿Se recomienda usar cables con empalmes en la línea de comunicación?', options: ['Sí, facilita la reparación', 'No, genera interferencia y errores', 'Solo si es cable blindado', 'Da igual'], correctIndex: 1 }
        ]
    },
    {
        title: 'Bombas de Condensado: Instalación sin errores',
        content: 'Cuando no hay gravedad para el desagüe, usamos bombas. El error más común es no instalar el respiradero (anti-sifón) o dejar que la manguera se doble. Tip de oro: Conecta siempre el cable de seguridad (macho/hembra) de la bomba al termostato o señal del equipo; así, si la bomba falla, el clima se apaga y evitas inundar la casa del cliente.',
        level: 'Intermedio', category: 'HVAC', block: 4, tokens: 30, time: 6,
        questions: [
            { question: '¿Para qué sirve el cable de seguridad de una bomba de condensado?', options: ['Para alimentar la bomba', 'Para apagar el equipo si la bomba falla o se tapa', 'Para medir el nivel de agua', 'Para conectar a internet'], correctIndex: 1 },
            { question: '¿Qué sucede si la manguera de salida está bloqueada o doblada?', options: ['Funciona igual', 'La bomba se quema o el agua se desborda', 'Se activa una alarma', 'Se apaga automáticamente'], correctIndex: 1 },
            { question: '¿Es necesario limpiar el depósito de la bomba periódicamente?', options: ['No, es auto-limpiante', 'Sí, para evitar la formación de algas/lodo', 'Solo al instalar', 'Depende de la marca'], correctIndex: 1 }
        ]
    },
    {
        title: 'El Filtro Deshidratador: ¿Cuándo y por qué cambiarlo?',
        content: 'El filtro no es solo para "basura", es para atrapar humedad. Se debe cambiar siempre que se abra el sistema (por fuga o cambio de compresor). Si notas una diferencia de temperatura entre la entrada y la salida del filtro (está frío al tacto), significa que está obstruido y actuando como un dispositivo de expansión.',
        level: 'Intermedio', category: 'HVAC', block: 4, tokens: 30, time: 5,
        questions: [
            { question: '¿Qué indica una diferencia de temperatura entre la entrada y salida del filtro?', options: ['Funciona correctamente', 'Que el filtro está obstruido/tapado', 'Falta de refrigerante', 'Exceso de refrigerante'], correctIndex: 1 },
            { question: '¿Cuándo es obligatorio reemplazar el filtro deshidratador?', options: ['Cada 6 meses', 'Siempre que se abra el circuito de refrigeración', 'Solo si está dañado visualmente', 'Nunca, dura para siempre'], correctIndex: 1 },
            { question: '¿Cuál es la función principal del filtro además de atrapar partículas?', options: ['Enfriar el gas', 'Absorber la humedad interna', 'Aumentar la presión', 'Reducir el ruido'], correctIndex: 1 }
        ]
    },
];

// Importar bloques 5-8 y combinar
import { TRAINING_DATA_BLOCKS_5_8 } from './training-data-2';

// Array completo de los 40 temas
export const ALL_TRAINING_DATA: TrainingModuleData[] = [
    ...INITIAL_TRAINING_DATA,
    ...TRAINING_DATA_BLOCKS_5_8
];
