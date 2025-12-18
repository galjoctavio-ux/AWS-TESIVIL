/**
 * Datos de training - Bloques 5-8 (Inverter y Electricidad)
 * Continúa de training-data.ts
 */

import { TrainingModuleData } from './training-data';

export const TRAINING_DATA_BLOCKS_5_8: TrainingModuleData[] = [
    // ============== BLOQUE 5: Sistemas Inverter ==============
    {
        title: 'El Módulo IPM: El "cerebro" de la potencia',
        content: 'El IPM (Intelligent Power Module) es el componente que recibe la corriente directa y la convierte en pulsos para mover el compresor a distintas velocidades. Prueba Maestra: Con el equipo apagado y descargado, usa tu multímetro en modo "Diodo". Mide entre los bornes de salida (U, V, W) y los polos positivo y negativo del puente rectificador. Si alguna lectura da "0" o continuidad, el IPM está en corto y la tarjeta debe repararse.',
        level: 'Avanzado', category: 'HVAC', block: 5, tokens: 80, time: 12,
        questions: [
            { question: '¿Cuál es la función principal del módulo IPM?', options: ['Enfriar el compresor', 'Convertir DC en pulsos de frecuencia variable para el compresor', 'Medir la temperatura', 'Controlar el termostato'], correctIndex: 1 },
            { question: '¿En qué escala del multímetro se debe probar un IPM sospechoso?', options: ['Voltaje AC', 'Escala de Diodos', 'Continuidad', 'Capacitancia'], correctIndex: 1 },
            { question: '¿Qué indica una lectura de "0" o pitido al medir las salidas U, V, W?', options: ['Funcionamiento normal', 'Que el módulo está en cortocircuito', 'Falta de energía', 'Sensor dañado'], correctIndex: 1 }
        ]
    },
    {
        title: 'El Ciclo de Potencia: De AC a DC',
        content: 'Un equipo Inverter no usa la corriente alterna (AC) directamente para el compresor. Primero la pasa por un Puente Rectificador (la convierte en DC) y luego por Capacitores de Filtrado enormes para "limpiarla". Dato clave: En el bus de datos verás voltajes de entre 310V y 340V DC. ¡Mucho cuidado! Siempre espera a que los LEDs de la tarjeta se apaguen antes de tocarla.',
        level: 'Avanzado', category: 'HVAC', block: 5, tokens: 100, time: 15,
        questions: [
            { question: '¿Cómo se llama el componente que convierte la corriente alterna en directa?', options: ['Transformador', 'Puente Rectificador', 'Capacitor', 'Reactor'], correctIndex: 1 },
            { question: '¿Qué componente se encarga de "suavizar" o filtrar la corriente directa?', options: ['Diodos', 'Los capacitores electrolíticos de potencia', 'Resistencias', 'Inductores'], correctIndex: 1 },
            { question: '¿Es seguro tocar la tarjeta inmediatamente después de desconectarla?', options: ['Sí, siempre', 'No, los capacitores pueden mantener voltajes peligrosos', 'Solo con guantes', 'Depende del modelo'], correctIndex: 1 }
        ]
    },
    {
        title: 'Inverter vs. Estándar: ¿Por qué ahorra energía?',
        content: 'El equipo estándar (On/Off) es como un auto que solo sabe ir a 100 km/h o estar frenado; los arranques consumen picos de corriente enormes. El Inverter regula la frecuencia (Hz); arranca suavemente y, al acercarse a la temperatura deseada, baja las revoluciones pero no se apaga. Esto mantiene la presión constante y evita los picos de consumo.',
        level: 'Avanzado', category: 'HVAC', block: 5, tokens: 70, time: 10,
        questions: [
            { question: '¿Cuál es la principal causa del alto consumo en equipos On/Off?', options: ['Funcionan todo el tiempo', 'Los picos de corriente en cada arranque', 'Usan más refrigerante', 'Son más grandes'], correctIndex: 1 },
            { question: '¿Qué parámetro eléctrico varía el sistema Inverter para cambiar la velocidad?', options: ['El voltaje', 'La frecuencia o Hertz', 'El amperaje', 'La resistencia'], correctIndex: 1 },
            { question: '¿El compresor Inverter se detiene por completo al llegar a la temperatura?', options: ['Sí, siempre', 'Generalmente no, disminuye su velocidad al mínimo', 'Solo en verano', 'Depende del modelo'], correctIndex: 1 }
        ]
    },
    {
        title: 'La Válvula de Expansión Electrónica (EEV)',
        content: 'A diferencia del capilar (fijo) o la TXV (mecánica), la EEV es un motor a pasos controlado por la tarjeta. Abre o cierra según lo que digan los sensores para que el evaporador siempre esté lleno de líquido sin inundar el compresor. Falla común: Si escuchas un "clic-clic-clic" al encender pero no enfría, la válvula puede estar trabada mecánicamente.',
        level: 'Avanzado', category: 'HVAC', block: 5, tokens: 85, time: 12,
        questions: [
            { question: '¿Qué tipo de motor utiliza la Válvula de Expansión Electrónica?', options: ['Motor DC', 'Motor a pasos', 'Motor monofásico', 'Servomotor'], correctIndex: 1 },
            { question: '¿Qué ventaja tiene la EEV sobre un tubo capilar?', options: ['Es más barata', 'Permite un control preciso y variable del flujo de refrigerante', 'No requiere mantenimiento', 'Funciona sin electricidad'], correctIndex: 1 },
            { question: '¿Cómo se puede detectar si una EEV está intentando posicionarse?', options: ['Por la temperatura', 'Por el sonido de pulsos o "clics" al energizar el equipo', 'Por el consumo', 'No se puede detectar'], correctIndex: 1 }
        ]
    },
    {
        title: 'Reactores y Filtros EMI: Protegiendo la electrónica',
        content: 'Los equipos Inverter generan "ruido" eléctrico que puede afectar a otros aparatos. Para eso usan el Reactor (esa bobina pesada de cobre) y los Filtros EMI. Estos componentes limpian la señal y protegen a la tarjeta de picos de voltaje externos. Si el reactor se desconecta o se abre, el equipo enviará un código de error de "Voltaje de bus de DC anormal".',
        level: 'Avanzado', category: 'HVAC', block: 5, tokens: 75, time: 10,
        questions: [
            { question: '¿Para qué sirve el Reactor en un sistema Inverter?', options: ['Enfriar el compresor', 'Para filtrar ruido eléctrico y estabilizar el bus de DC', 'Aumentar la potencia', 'Controlar la temperatura'], correctIndex: 1 },
            { question: '¿Qué sucede si los cables del Reactor están sueltos?', options: ['Funciona normal', 'El equipo marca error y el compresor no arranca', 'Solo pierde eficiencia', 'Se apaga silenciosamente'], correctIndex: 1 },
            { question: '¿Cuál es la función del filtro EMI?', options: ['Enfriar el aire', 'Evitar que las interferencias del equipo salgan hacia la red eléctrica de la casa', 'Filtrar el refrigerante', 'Controlar la humedad'], correctIndex: 1 }
        ]
    },
    // ============== BLOQUE 6: Electrónica de Potencia ==============
    {
        title: 'Componentes de Protección: Varistores y Fusibles Térmicos',
        content: 'Muchas tarjetas "muertas" tras una tormenta solo tienen el Varistor en corto. El varistor es un escudo que se sacrifica ante un pico de voltaje. Si lo ves quemado o estallado, la tarjeta se protegió. Tip Pro: Al cambiar un varistor, revisa siempre el fusible de entrada; usualmente ambos mueren juntos. Es una reparación de $2 USD que salva una tarjeta de $200 USD.',
        level: 'Avanzado', category: 'Electricidad', block: 6, tokens: 70, time: 10,
        questions: [
            { question: '¿Cuál es la función de un Varistor en la tarjeta?', options: ['Aumentar el voltaje', 'Proteger contra picos de voltaje/sobretensiones', 'Enfriar los componentes', 'Amplificar la señal'], correctIndex: 1 },
            { question: '¿Qué apariencia física tiene un varistor dañado?', options: ['Se ve brillante', 'Se ve quemado, carbonizado o estallado', 'Cambia de color a azul', 'Se hincha'], correctIndex: 1 },
            { question: 'Si el varistor se activa por un rayo, ¿qué otro componente suele abrirse?', options: ['El compresor', 'El fusible principal', 'El capacitor', 'El termostato'], correctIndex: 1 }
        ]
    },
    {
        title: 'Medición de Bobinas del Compresor Inverter',
        content: 'A diferencia de un compresor estándar donde tienes común, arranque y marcha (resistencias distintas), en un compresor Inverter las tres bobinas son idénticas. Prueba: Mide entre U-V, V-W y W-U. La resistencia debe ser exactamente la misma (ej. 1.5 ohms en las tres). Si hay una diferencia mayor al 10% entre ellas, el compresor está dañado internamente.',
        level: 'Avanzado', category: 'HVAC', block: 6, tokens: 60, time: 8,
        questions: [
            { question: '¿Cómo deben ser las lecturas de resistencia entre los 3 bornes de un compresor Inverter?', options: ['Diferentes cada una', 'Iguales o balanceadas', 'Una debe ser cero', 'Una debe ser infinita'], correctIndex: 1 },
            { question: '¿Un compresor Inverter tiene capacitor de arranque?', options: ['Sí, siempre', 'No, arranca mediante la frecuencia de la tarjeta', 'Solo en algunos modelos', 'Depende de la marca'], correctIndex: 1 },
            { question: '¿Qué herramienta usas para esta prueba?', options: ['Manómetro', 'Multímetro en la escala más baja de Ohms', 'Termómetro', 'Amperímetro'], correctIndex: 1 }
        ]
    },
    {
        title: '¿Qué es el PWM? (Modulación por Ancho de Pulso)',
        content: 'La tarjeta no baja el voltaje para frenar el compresor; lo que hace es "picar" la corriente muy rápido. Imagina prender y apagar un foco 1,000 veces por segundo. Si el pulso es ancho, el motor va rápido; si es angosto, va lento. Si el compresor vibra mucho o hace ruidos extraños, es posible que el IPM no esté mandando los pulsos PWM de forma simétrica.',
        level: 'Avanzado', category: 'Electricidad', block: 6, tokens: 80, time: 12,
        questions: [
            { question: '¿Qué significan las siglas PWM?', options: ['Power Wave Monitor', 'Modulación por Ancho de Pulso', 'Pulse Width Motor', 'Potencia Watt Máxima'], correctIndex: 1 },
            { question: '¿Cómo regula la tarjeta la velocidad del compresor?', options: ['Bajando el voltaje', 'Variando el ancho y la frecuencia de los pulsos eléctricos', 'Cambiando el refrigerante', 'Ajustando la presión'], correctIndex: 1 },
            { question: '¿El PWM se puede medir fácilmente con un multímetro básico?', options: ['Sí, en AC', 'No, se requiere un multímetro con frecuencia o un osciloscopio', 'Solo en DC', 'Con cualquier multímetro'], correctIndex: 1 }
        ]
    },
    {
        title: 'Diagnóstico de Fuentes Conmutadas (5V, 12V, 15V)',
        content: 'Las tarjetas tienen una "mini fuente" que baja el voltaje para el microprocesador y los sensores. Si el equipo no hace nada (ni un pitido), mide los voltajes de salida en los reguladores: 5V DC (para el cerebro/micro), 12V DC (para relevadores y motores a pasos) y 15V DC (para el disparo del IPM). Si falta uno, la tarjeta no "despertará".',
        level: 'Avanzado', category: 'Electricidad', block: 6, tokens: 100, time: 15,
        questions: [
            { question: '¿Qué voltaje usa normalmente el microprocesador de la tarjeta?', options: ['220V AC', '5V DC', '12V AC', '24V DC'], correctIndex: 1 },
            { question: '¿Qué componente suele usar los 12V DC en una tarjeta de aire acondicionado?', options: ['El compresor', 'Los relevadores/relays o motores a pasos', 'El evaporador', 'El condensador'], correctIndex: 1 },
            { question: '¿Qué sucede si la fuente conmutada falla por completo?', options: ['El equipo enfría pero lento', 'El equipo no enciende ni muestra señales de vida', 'Solo falla el display', 'Se escucha un ruido'], correctIndex: 1 }
        ]
    },
    {
        title: 'Configuración de Multi-Splits: El reto del direccionamiento',
        content: 'En sistemas donde una condensadora alimenta 3 o 4 evaporadoras, el error más común es cruzar las líneas de comunicación. Regla de oro: El cable de señal de la unidad A debe ir al borne A de la condensadora. Muchos equipos modernos requieren un "Auto-addressing" desde un switch en la tarjeta principal para que la máquina sepa qué válvula abrir para cada cuarto.',
        level: 'Avanzado', category: 'HVAC', block: 6, tokens: 90, time: 15,
        questions: [
            { question: '¿Qué sucede si cruzas los cables de comunicación en un Multi-Split?', options: ['Funciona normal', 'El equipo envía aire a una habitación pero la señal llega de otra, causando errores', 'Se apaga automáticamente', 'Enfría más rápido'], correctIndex: 1 },
            { question: '¿Qué función permite que la condensadora identifique cuántas unidades interiores hay conectadas?', options: ['Reset manual', 'Auto-direccionamiento o Addressing', 'Calibración de fábrica', 'Configuración WiFi'], correctIndex: 1 },
            { question: '¿Es necesario purgar cada línea de refrigerante por separado?', options: ['No, se purgan todas juntas', 'Sí, cada circuito es independiente aunque compartan condensadora', 'Solo la principal', 'Depende del modelo'], correctIndex: 1 }
        ]
    },
    // ============== BLOQUE 7: Electricidad Básica ==============
    {
        title: 'El Multímetro: Más allá del "pitido" de continuidad',
        content: 'La continuidad no solo es saber si un cable está roto. En motores, una lectura de "continuidad" (pitido) entre una bobina y la carcasa significa que el motor está "aterrizado" (en corto a tierra). Dato Pro: Algunos multímetros pitan con menos de 50 ohms; aprende a leer el valor real en la pantalla.',
        level: 'Básico', category: 'Electricidad', block: 7, tokens: 20, time: 4,
        questions: [
            { question: '¿Qué significa que el multímetro pite al medir entre un borne del compresor y la tubería de cobre?', options: ['Funciona correctamente', 'Que el compresor está aterrizado o en corto a tierra', 'Falta refrigerante', 'El cable está bien'], correctIndex: 1 },
            { question: '¿Debes confiar solo en el sonido del multímetro?', options: ['Sí, es suficiente', 'No, hay que observar el valor de ohms en la pantalla', 'Solo en modelos nuevos', 'Depende de la marca'], correctIndex: 1 },
            { question: '¿Se puede medir continuidad en un circuito con energía?', options: ['Sí, siempre', 'No, se puede dañar el equipo de medición', 'Solo en DC', 'Solo con protección'], correctIndex: 1 }
        ]
    },
    {
        title: 'Código de Colores y Normativa (México/Latam)',
        content: 'El desorden de cables causa accidentes. Según la norma (NOM-001 en México), el Verde o Verde/Amarillo es siempre Tierra Física, el Blanco o Gris es Neutro, y los colores como Negro, Rojo o Azul son Fases. Tip: Nunca uses el cable verde para llevar corriente; si un colega entra después y lo toca pensando que es tierra, podría ser fatal.',
        level: 'Básico', category: 'Electricidad', block: 7, tokens: 15, time: 4,
        questions: [
            { question: 'Según la norma, ¿qué color de cable se debe usar exclusivamente para la Tierra Física?', options: ['Negro', 'Verde o Verde con franja amarilla', 'Rojo', 'Azul'], correctIndex: 1 },
            { question: '¿De qué color suele ser el cable Neutro en una instalación estándar?', options: ['Negro', 'Blanco o Gris', 'Verde', 'Rojo'], correctIndex: 1 },
            { question: '¿Por qué es importante respetar el código de colores?', options: ['Por estética', 'Por seguridad propia, de colegas y cumplimiento de normas', 'Por costo', 'No es importante'], correctIndex: 1 }
        ]
    },
    {
        title: 'Selección de Calibre de Cable (AWG) para Minisplits',
        content: 'Usar un cable muy delgado (ej. calibre 14 para un equipo de 2 toneladas) causa caída de tensión y sobrecalentamiento. Regla general: Para equipos de 1 tonelada (110V), usa calibre 12. Para 2 toneladas o más (220V), el calibre 10 es lo ideal para la alimentación principal. Recuerda: a mayor distancia entre el tablero y el equipo, más grueso debe ser el cable.',
        level: 'Básico', category: 'Electricidad', block: 7, tokens: 30, time: 6,
        questions: [
            { question: '¿Qué sucede si el calibre del cable es más delgado de lo requerido?', options: ['Funciona mejor', 'Se sobrecalienta y hay caída de voltaje', 'No pasa nada', 'Es más eficiente'], correctIndex: 1 },
            { question: 'Para un equipo de 1 tonelada a 110V, ¿qué calibre se recomienda comúnmente?', options: ['Calibre 14 AWG', 'Calibre 12 AWG', 'Calibre 18 AWG', 'Calibre 8 AWG'], correctIndex: 1 },
            { question: '¿Qué factor obliga a aumentar el grosor del cable además del consumo?', options: ['El color del cable', 'La distancia entre el centro de carga y el equipo', 'La marca del equipo', 'El tipo de refrigerante'], correctIndex: 1 }
        ]
    },
    {
        title: 'Identificación Segura de Fase, Neutro y Tierra',
        content: 'Antes de conectar, mide con el voltímetro: Fase a Neutro debe dar el voltaje de red (127V o 220V). Fase a Tierra debe dar el mismo voltaje. Neutro a Tierra debe dar casi 0V (máximo 1V o 2V). Si mides más de 5V entre Neutro y Tierra, la instalación tiene una falla que puede volver locos a los sensores del equipo Inverter.',
        level: 'Básico', category: 'Electricidad', block: 7, tokens: 25, time: 5,
        questions: [
            { question: '¿Cuánto voltaje debe haber idealmente entre Neutro y Tierra Física?', options: ['127V', 'Cercano a 0 Volts', '50V', '220V'], correctIndex: 1 },
            { question: '¿Qué lectura obtienes al medir Fase contra Fase en un sistema de 220V bifásico?', options: ['127V', '220V a 240V', '0V', '440V'], correctIndex: 1 },
            { question: 'Si entre Neutro y Tierra hay 50V, ¿la instalación es segura para un equipo Inverter?', options: ['Sí, es normal', 'No, indica una falla de tierra o neutro flotante', 'Depende del modelo', 'Solo si es monofásico'], correctIndex: 1 }
        ]
    },
    {
        title: '¿Por qué se queman los bornes del compresor?',
        content: 'El "falso contacto" es el enemigo número uno. Una terminal floja genera un arco eléctrico diminuto que produce calor extremo. Ese calor oxida el metal, aumentando la resistencia y quemando el borne. Solución: Siempre usa terminales de alta calidad y asegúrate de que entren "apretadas". Si un borne ya se quemó, límpialo hasta que brille antes de poner el repuesto.',
        level: 'Básico', category: 'Electricidad', block: 7, tokens: 40, time: 7,
        questions: [
            { question: '¿Cuál es la causa principal de que un borne de compresor se carbonice?', options: ['Exceso de refrigerante', 'Terminales flojas o falso contacto', 'Voltaje bajo', 'Falta de mantenimiento'], correctIndex: 1 },
            { question: '¿Qué efecto físico genera el calor en una conexión eléctrica débil?', options: ['Enfriamiento', 'Oxidación y aumento de resistencia', 'Mayor conductividad', 'Ninguno'], correctIndex: 1 },
            { question: '¿Qué se debe hacer con un borne oxidado antes de conectar una terminal nueva?', options: ['Dejarlo así', 'Lijarlo o limpiarlo hasta que el metal brille', 'Pintarlo', 'Cambiarlo por uno usado'], correctIndex: 1 }
        ]
    },
    // ============== BLOQUE 8: Calidad de Energía ==============
    {
        title: 'Interruptores Termomagnéticos (Breakers) vs. Fusibles',
        content: 'El breaker protege el cable, no solo al equipo. Para HVAC usamos Curva tipo C (soporta el pico de arranque). Un error común es poner una pastilla de 40A a un equipo que consume 15A solo para que "no se bote"; esto es peligroso. Tip: Si el breaker se bota, no lo fuerces; hay un corto o el compresor está sufriendo mecánicamente.',
        level: 'Avanzado', category: 'Electricidad', block: 8, tokens: 35, time: 6,
        questions: [
            { question: '¿Cuál es la función principal de la pastilla térmica?', options: ['Proteger el equipo de aire', 'Proteger el cableado contra sobrecalentamiento', 'Aumentar el voltaje', 'Reducir el consumo'], correctIndex: 1 },
            { question: '¿Qué sucede si instalas una pastilla de amperaje muy superior al del equipo?', options: ['Mejor protección', 'El cable se puede incendiar antes de que la pastilla se bote', 'Funciona igual', 'Ahorra energía'], correctIndex: 1 },
            { question: '¿Qué tipo de curva de disparo se recomienda para motores/climas?', options: ['Curva tipo B', 'Curva tipo C', 'Curva tipo A', 'Curva tipo D'], correctIndex: 1 }
        ]
    },
    {
        title: 'Capacitor de Marcha vs. Capacitor de Arranque',
        content: 'El de Marcha (aluminio) está siempre conectado para ayudar al motor a girar con eficiencia. El de Arranque (negro/plástico) solo entra un segundo para dar un "empujón" de torque y luego sale mediante un relé o térmico. Error fatal: Poner un capacitor de arranque como si fuera de marcha; estallará en pocos minutos por el calor.',
        level: 'Avanzado', category: 'Electricidad', block: 8, tokens: 45, time: 8,
        questions: [
            { question: '¿Cuál de los dos capacitores permanece conectado todo el tiempo mientras el motor gira?', options: ['El de Arranque', 'El de Marcha', 'Ambos', 'Ninguno'], correctIndex: 1 },
            { question: '¿De qué material suele ser el cuerpo del capacitor de arranque?', options: ['Aluminio', 'Plástico o Baquelita negra', 'Cobre', 'Acero'], correctIndex: 1 },
            { question: '¿Qué componente se encarga de sacar de operación al capacitor de arranque tras el encendido?', options: ['El termostato', 'Un relé potencial o térmico', 'El compresor', 'El usuario'], correctIndex: 1 }
        ]
    },
    {
        title: 'Diagnóstico de Caída de Tensión (Voltage Drop)',
        content: 'A veces mides 220V con el equipo apagado, pero al arrancar baja a 190V. Eso es caída de tensión por cables delgados o conexiones flojas. Esto hace que el compresor consuma más amperaje para compensar, calentándose y mandando errores de "Sobrecarga de corriente". Mide siempre el voltaje mientras el compresor está trabajando.',
        level: 'Avanzado', category: 'Electricidad', block: 8, tokens: 60, time: 10,
        questions: [
            { question: '¿Cuándo es el momento correcto para medir el voltaje real de operación?', options: ['Con el equipo apagado', 'Con el equipo y compresor encendidos/bajo carga', 'Antes de instalar', 'No importa cuándo'], correctIndex: 1 },
            { question: '¿Cuál es una causa común de la caída de tensión?', options: ['Equipos muy eficientes', 'Cables muy delgados o distancias muy largas', 'Exceso de refrigerante', 'Termostato mal calibrado'], correctIndex: 1 },
            { question: '¿Qué le sucede al amperaje cuando el voltaje cae excesivamente?', options: ['Baja también', 'El amperaje aumenta', 'Se mantiene igual', 'Se vuelve cero'], correctIndex: 1 }
        ]
    },
    {
        title: 'Protectores de Voltaje y Supresores de Picos (SPD)',
        content: 'Las tarjetas Inverter odian los transitorios (picos rápidos de voltaje). Un protector de voltaje básico desconecta el equipo, pero un Supresor de Picos (SPD) "drena" el pico a tierra en microsegundos. Recomienda siempre instalar uno en el centro de carga del cliente para proteger la inversión del aire acondicionado.',
        level: 'Avanzado', category: 'Electricidad', block: 8, tokens: 70, time: 10,
        questions: [
            { question: '¿Qué hace un Supresor de Picos (SPD) con el exceso de voltaje de un rayo cercano?', options: ['Lo almacena', 'Lo desvía de forma segura hacia la tierra física', 'Lo convierte en calor', 'Lo ignora'], correctIndex: 1 },
            { question: '¿Un protector de voltaje común protege contra rayos?', options: ['Sí, completamente', 'No, usualmente solo contra voltajes altos/bajos constantes', 'Solo los caros', 'Depende de la marca'], correctIndex: 1 },
            { question: '¿Dónde se recomienda instalar el supresor para mayor efectividad?', options: ['En el equipo', 'En el tablero eléctrico principal', 'En la calle', 'En cualquier lugar'], correctIndex: 1 }
        ]
    },
    {
        title: 'La Etapa de Rectificación: El puente de diodos',
        content: 'El puente de diodos es la puerta de entrada de la energía a la tarjeta. Convierte la "ola" de la corriente alterna en una línea de corriente directa. Si el equipo quema el fusible principal inmediatamente al conectarlo, lo primero a revisar es el Puente de Diodos. Si un diodo interno está en corto, dejará pasar la corriente sin control.',
        level: 'Avanzado', category: 'Electricidad', block: 8, tokens: 100, time: 15,
        questions: [
            { question: '¿Cuál es la función del puente de diodos?', options: ['Amplificar la señal', 'Convertir corriente alterna AC en corriente directa DC', 'Enfriar la tarjeta', 'Proteger contra rayos'], correctIndex: 1 },
            { question: '¿Qué síntoma da un puente de diodos en cortocircuito?', options: ['El equipo funciona lento', 'Se quema el fusible principal de la tarjeta al instante', 'Solo hace ruido', 'Pierde eficiencia'], correctIndex: 1 },
            { question: '¿Cómo se mide un puente de diodos con el multímetro?', options: ['En continuidad', 'En la función de prueba de diodos', 'En AC', 'En capacitancia'], correctIndex: 1 }
        ]
    }
];
