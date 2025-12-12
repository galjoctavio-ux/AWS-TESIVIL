PLAN MAESTRO: SISTEMA DE ESTIMACIÓN ELÉCTRICA "TESIVIL"
Versión del Documento: 5.0
Estatus: Definición de Alcance "Francotirador", Modelo Híbrido y Validación Humana
CAPÍTULO 1: DEFINICIÓN, ALCANCE Y MODELO DE NEGOCIO
1.1. Visión y Objetivo Estratégico
Objetivo Central:
Desarrollar una aplicación móvil nativa (Android/iOS) que funcione como una Herramienta Integral de Referencia y Estimación para técnicos electricistas en México. El sistema unifica la formalidad de la ingeniería de costos con la practicidad del cobro por destajo, priorizando la precisión absoluta del dato sobre la automatización masiva.
Propuesta de Valor y Pivote de Precisión:
 * Posicionamiento: "Tu Asistente de Estimación y Referencia".
 * Enfoque "Francotirador" (Calidad Absoluta): La base de datos se limita estrictamente a los "50 Materiales Críticos".
   * Justificación: Al reducir el volumen, garantizamos una precisión de datos del 100% mediante validación humana, eliminando el riesgo de "basura de datos" que generan los bots automáticos en catálogos extensos.
1.2. Premisas Fundamentales (Reglas de Negocio)
El desarrollo del software se rige por cuatro pilares que equilibran la fricción de usuario, la viabilidad técnica y la seguridad de la información:
A. Arquitectura Dual de Cálculo
El sistema soporta dos lógicas de cotización:
 * Modo Ingeniería (APU Simplificado): Cálculo desglosado (Material + Mano de Obra por tiempo + Indirectos).
 * Modo Rápido (Destajo): Cálculo basado en "Precios por Salida" o "Puntos Terminados".
B. Modelo de Negocio: Híbrido (Suscripción + Micro-transacciones)
Estrategia diseñada para reducir la barrera de entrada y facilitar la viralidad orgánica manual.
 * Nivel GRATUITO (Free Tier - Engagement):
   * Slots Activos: El usuario puede mantener hasta 3 (tres) proyectos en borrador simultáneamente.
   * Exportación: Limitada a 1 (una) exportación a PDF gratuita por mes.
   * Branding: PDF con marca de agua "TESIVIL" obligatoria.
   * Mecanismo de Referidos Simplificado: Se elimina la dependencia de Deep Links complejos. La atribución de referidos (para ganar días PRO o beneficios) se realiza mediante input manual de Código de Usuario o Correo Electrónico en el registro.
 * Nivel PRO (Suscripción $99 MXN/mes):
   * Precio Psicológico: Ajuste agresivo para fomentar la compra impulsiva.
   * Beneficios: Proyectos ilimitados, cero publicidad, PDF "Marca Blanca", respaldo Cloud.
 * Micro-transacciones (Pay-per-Use):
   * Producto: "Pase de Proyecto" ($19 MXN pago único).
   * Función: Desbloquea la exportación limpia de un solo proyecto específico sin necesidad de suscripción mensual.
C. Naturaleza de la Información (Human-in-the-Loop)
 * Fuente de Verdad: Se elimina el Web Scraping automático. La actualización de precios es Semanal y Curada por Expertos.
 * Validación: Los precios se ingresan al sistema mediante carga masiva controlada (CSV/Admin Panel) tras revisión humana, garantizando que el "Precio Promedio" sea coherente con la realidad del instalador y no un error de algoritmo.
D. Conectividad (Offline-First Persistente)
 * Operatividad Local: Base de datos SQLite residente en el dispositivo.
 * Validación Híbrida: Tokens de suscripción con persistencia local (7 días) para trabajo sin red.
1.3. Alcance Funcional (Scope - MVP)
El Producto Mínimo Viable se define por la robustez de sus datos manuales y su simplicidad operativa:
1. Catálogo "Francotirador" (Los 50 Críticos)
Base de datos gestionada manualmente. Solo incluye lo indispensable para obra negra y cableado:
 * Conductores: Cable THW (Calibres 14, 12, 10, 8 - Marcas estándar).
 * Canalización: Poliducto 1/2" y 3/4", Tubería Pared Delgada.
 * Protección: Centros de Carga (2, 4, 8 ventanas), Pastillas (15A, 20A, 30A).
 * Dispositivos: Receptáculos y apagadores estándar.
 * Mantenimiento: Actualización vía Backend Admin (Carga CSV), no vía Bots.
2. Motor de Cálculo Dual
 * Ingeniería: Algoritmo de Costo Directo + Indirectos + Utilidad.
 * Destajo: Catálogo de servicios pre-cargados con precios de mano de obra sugeridos y editables.
3. Gestión de Pagos y Usuarios
 * Autenticación: Social Login (Google/Apple).
 * Pasarela: In-App Purchases (Consumibles y Suscripciones).
 * Sistema de Referidos: Campo de texto simple en el perfil: "¿Quién te invitó?" (Ingresar Código/Correo).
1.4. Límites y Exclusiones (Out of Scope)
 * NO Web Scraping / Bots: El sistema no busca precios en internet automáticamente. Se basa 100% en alimentación manual experta.
 * NO Catálogo Extenso: Limitado estrictamente a los 50 materiales críticos.
 * NO Inventario Real: Sin conexión a stocks de tiendas.
 * NO Facturación SAT: Documentos solo informativos/presupuestales.
1.5. Glosario de Variables Críticas
Definición de variables maestras para el control de la lógica de negocio actualizada:
| Variable | Tipo de Dato | Definición Técnica |
|---|---|---|
| subscription_status | Enum | FREE (Límite 3 slots) o PRO (Ilimitado). |
| active_slots_count | Integer | Contador de proyectos abiertos. Bloquea creación si FREE >= 3. |
| monthly_export_count | Integer | Contador de PDFs del mes. Bloquea exportación si FREE >= 1. |
| project_pass_active | Boolean | Si es True (pagó $19), permite exportación limpia de ese proyecto. |
| referral_code_input | String | Campo de texto manual para vincular usuarios referidos. |
| critical_material_id | Integer | Identificador de los 50 materiales base. |
| base_price_manual | Float | Precio asignado manualmente por el administrador (Fuente de verdad). |
| last_csv_update | Timestamp | Fecha de la última carga manual de precios (Control de versiones). |


CAPÍTULO 2: ARQUITECTURA DEL SISTEMA (ESPECIFICACIONES TÉCNICAS)
Propósito: Definir una arquitectura ultra-simplificada y robusta enfocada exclusivamente en la experiencia Offline-First. Se elimina toda complejidad operativa de mantenimiento de servidores, scrapers o procesos de IA, delegando la infraestructura a servicios gestionados (Serverless) y la lógica de sincronización a un motor especializado (Middleware).
2.1. Arquitectura Lógica de Alto Nivel
El sistema adopta un modelo de Sincronización Continua Asistida. La aplicación móvil mantiene una base de datos SQLite completa que se sincroniza automáticamente con la nube mediante una capa intermedia dedicada, garantizando consistencia de datos sin necesidad de escribir código complejo de sincronización manual.
Componentes del Sistema:
 * Terminal de Usuario (Mobile App): Cliente inteligente que opera sobre una base de datos SQLite local.
 * Capa de Sincronización (Middleware - PowerSync): Servicio gestionado que actúa como "tubería inteligente". Mantiene la base de datos local del usuario sincronizada con la nube en tiempo real (cuando hay conexión) y gestiona las colas de cambios offline.
 * Backend Serverless (BaaS - Supabase): Fuente de la verdad. Provee la base de datos PostgreSQL, Autenticación y Almacenamiento.
2.2. Stack Tecnológico (Materiales de Construcción)
A. Frontend (Aplicación Móvil)
Entorno optimizado para replicación de datos.
 * Framework: React Native con Expo Prebuild (Dev Client).
   * Requisito: Necesario para integrar los drivers nativos de SQLite de alto rendimiento.
 * Lenguaje: TypeScript.
 * Base de Datos Local: SQLite (gestionada vía PowerSync SDK).
   * Cambio: Se sustituye WatermelonDB por una implementación directa de SQLite orquestada por el SDK de PowerSync, lo que permite consultas SQL estándar directamente en el dispositivo.
 * Motor de Reportes: expo-print.
   * Generación de PDFs y disparador de auditoría (Snapshots).
B. Middleware de Sincronización
 * Servicio: PowerSync.
   * Función: Se conecta a la base de datos de Supabase (PostgreSQL) mediante Replicación Lógica.
   * Valor: Elimina la necesidad de crear APIs REST para "bajar datos". PowerSync detecta cambios en la nube y los empuja automáticamente al SQLite del usuario. Gestiona la resiliencia a desconexiones de red de forma nativa.
C. Backend (Serverless / BaaS)
 * Plataforma: Supabase.
   * Base de Datos: PostgreSQL.
   * Autenticación: Supabase Auth. Integrada directamente con las políticas de acceso.
   * Seguridad: Row Level Security (RLS). Las reglas de seguridad se definen en la base de datos. PowerSync respeta estas reglas, asegurando que cada usuario solo sincronice a su teléfono sus propios datos y el catálogo público.
2.3. Diagrama de Flujo de Datos
 * Lectura/Escritura Local: La App lee y escribe instantáneamente en SQLite (latencia cero).
 * Túnel de Sincronización: El SDK de PowerSync detecta conectividad y sube las transacciones locales al servicio en la nube, y baja los cambios ocurridos en el servidor.
 * Persistencia Final: PowerSync escribe los cambios en Supabase (PostgreSQL).
Nota: Se ha eliminado el flujo de entrada de datos externos. La alimentación del catálogo de precios se realizará mediante administración manual o importaciones CSV controladas directamente en Supabase, garantizando curaduría humana al 100%.
2.4. Estrategia de Auditoría y Seguridad Jurídica (Inmutabilidad)
La arquitectura de sincronización automática no altera la necesidad de congelar cotizaciones para fines legales.
 * Snapshot Local: Al finalizar una cotización, la App genera el JSON inmutable con los precios vigentes en ese segundo.
 * Sincronización de Evidencia: Este JSON se guarda en una tabla history_quotes en SQLite. PowerSync se encarga de subir este registro a Supabase automáticamente en cuanto haya red.
 * Integridad: En Supabase, la tabla de historial tiene permisos de INSERT ONLY (Solo escritura) para prevenir alteraciones post-factum.
2.5. Protocolo de Sincronización (PowerSync Sync Rules)
Se sustituye la lógica manual de "Delta Sync" por "Sync Buckets" (Cubetas de Sincronización) configuradas en PowerSync:
 * Bucket Global (Público): Contiene el catálogo de Materiales y Mano de Obra base. Todos los usuarios descargan una copia de esto automáticamente.
 * Bucket de Usuario (Privado): Contiene las Cotizaciones, Clientes y Configuraciones de Indirectos específicas del user_id. Solo el usuario propietario descarga estos datos.
2.6. Seguridad y Restricciones Técnicas
 * Autenticación Unificada: El token JWT generado por Supabase Auth es utilizado por PowerSync para validar el acceso a los datos.
 * Validación de Datos: Dado que SQLite es permisivo, se utilizarán restricciones CHECK y Types estrictos en PostgreSQL. Si un dato inválido intenta subir desde el móvil, la base de datos central lo rechazará, protegiendo la integridad del sistema.
2.7. Exclusiones Técnicas (Alcance Reducido)
 * Sin Scraping Automatizado: No existen servidores, workers, ni scripts de Python buscando precios en internet. Toda actualización de precios es un proceso administrativo.
 * Sin IA: No hay procesamiento de lenguaje natural ni estimaciones automáticas.
 * Sin Infraestructura Propia: Cero mantenimiento de servidores Linux o Docker. Todo el stack es SaaS (Software as a Service).

CAPÍTULO 3: INGENIERÍA DE PROCESOS Y LÓGICA DE CÁLCULO (EL MOTOR)
Objetivo del Capítulo: Definir la arquitectura algorítmica y las fórmulas matemáticas del núcleo de la aplicación. Este motor transforma variables de mercado, entorno y mano de obra en un presupuesto formal. Se prioriza la simplicidad computacional (Matemática de Enteros), la validación directa (Rangos Duros) y la flexibilidad operativa (Ajuste Global).
3.0. Estándar de Precisión: Matemática de Enteros
Para eliminar errores de redondeo de punto flotante y simplificar el manejo de datos en diferentes plataformas (iOS/Android/Web), el sistema abandona el uso de decimales complejos.
 * Regla de Oro: Todos los valores monetarios se almacenan y procesan como Enteros (INT) representando Centavos.
   * Ejemplo: $100.50 se almacena como 10050.
   * Ejemplo: $1,500.00 se almacena como 150000.
 * Factores y Porcentajes: Se almacenan como enteros escalados (Base 100 o Base 10000 para alta precisión).
   * Ejemplo: IVA 16% \rightarrow Factor 11600 (Escala 10000).
   * Operación: (Precio * Factor) / Escala.
3.1. Diccionario de Variables Maestras
Definición de inputs para la Base de Datos bajo el nuevo estándar de enteros.
| Símbolo | Variable | Tipo de Dato | Descripción | Fuente de Datos |
|---|---|---|---|---|
| REGIONALIZACIÓN |  |  |  |  |
| Zone_{ID} | Zona Económica | ENUM | Norte, Centro, Sur, Frontera. | GPS / Input Usuario |
| F_{reg} | Factor Regional | INT | Multiplicador escalado (Ej. 120 para 1.2x). | BD Servidor |
| MATERIALES |  |  |  |  |
| P_{base} | Precio Base | INT | Precio en centavos (Crowdsourcing/Scraper). | Motor Híbrido |
| P_{min} | Precio Mínimo | INT | Límite inferior permitido ("Hard Limit"). | BD Servidor |
| P_{max} | Precio Máximo | INT | Límite superior permitido ("Hard Limit"). | BD Servidor |
| \pi_{mensual} | Inflación Mensual | INT | Tasa escalada (Ej. 150 para 1.5%). | BD Servidor |
| MANO DE OBRA |  |  |  |  |
| S_{base} | Salario Diario | INT | Salario diario en centavos. | BD Servidor |
| F_{FSR} | Factor Salario Real | INT | Cargas sociales escaladas (Ej. 180 para 1.8x). | Perfil Usuario |
| T_{book} | Book Time | INT | Minutos estándar para 1 unidad. | BD Servidor |
| FINANCIERO |  |  |  |  |
| Item_{ajuste} | Ítem de Ajuste | INT | Valor monetario (+/-) para cuadrar total. | Cálculo Local |
3.2. Algoritmo de Mano de Obra (Regionalizado)
Cálculo basado en enteros para determinar el costo por minuto y por jornada.
3.2.1. Costo Minuto-Hombre Regionalizado (Cmm_{reg})
Se calcula el costo por minuto para mantener la precisión de enteros (evitando horas fraccionadas).
 * 480: Minutos en una jornada de 8 horas.
 * Escala: Divisor necesario para normalizar los factores F_{FSR} y F_{reg} (si son Base 100, se divide entre 10,000).
3.2.2. Costo Unitario de Mano de Obra
 * Nota: F_{dif} y F_{obs} también se manejan como enteros escalados, requiriendo su respectiva división final.
3.3. Motor Híbrido de Precios y Validación Simplificada
Se sustituye la estadística compleja por reglas de negocio directas ("Hard Limits") para validar la integridad de los datos reportados por usuarios.
3.3.1. Validación por Rangos (Hard Limits)
Cada categoría de material en la Base de Datos Maestra tiene definidos un piso y un techo lógico (P_{min}, P_{max}).
Algoritmo de Aceptación:
Al recibir un precio reportado por usuario (P_{input}):
 * Consulta: Obtener P_{min} y P_{max} del servidor para ese SKU.
 * Lógica Booleana:
   * SI (P_{input} \ge P_{min}) Y (P_{input} \le P_{max}) \rightarrow Precio Válido. (Se guarda y promedia).
   * SI (P_{input} < P_{min}) O (P_{input} > P_{max}) \rightarrow Rechazo Inmediato. (Se descarta como error de dedo o dato malicioso).
3.3.2. Capa de Failsafe (Proyección Inflacionaria)
Si el scraper falla y no hay reportes recientes válidos:
 * Operación en enteros: Precio + ((Precio * Tasa * Meses) / 10000).
 * Etiqueta UI: "⚠️ Precio Proyectado".
3.4. Algoritmo de "Modo Rápido" (Quick Quote)
Estimación global basada en puntos eléctricos.
 * P_{zona\_avg}: Precio promedio histórico en centavos por punto en la zona.
 * M_{user}: Margen de usuario (Entero, ej. 10 para 10%).
3.5. Algoritmo de Ajuste Inverso Simplificado (Global Adjustment)
Se elimina la recursividad matemática. Si el usuario desea cambiar el precio total del proyecto, el sistema inserta una partida contable de compensación.
3.5.1. Flujo de Ajuste
 * El sistema calcula el Subtotal Calculado (Total_{sys}) sumando todos los APU.
 * El usuario introduce manualmente el Subtotal Deseado (Total_{user}).
 * El sistema calcula la diferencia simple:
   
3.5.2. Inserción del Ítem de Ajuste
Se añade una línea final al presupuesto llamada:
 * Si Diferencia < 0: "Descuento Global por Ajuste".
 * Si Diferencia > 0: "Cargo Adicional / Ajuste Operativo".
El valor de este ítem es exactamente igual a la Diferencia. Esto cuadra el total sin modificar los precios unitarios de los materiales ni la mano de obra, preservando la integridad de los costos directos.
3.5.3. Semáforo de Riesgo (Validación Visual)
Aunque el ajuste es simple, se mantiene la alerta para proteger al usuario:

 * 🔴 Alerta Roja: Si \%\Delta > 30\% (y es descuento), se exige confirmación: "Estás reduciendo tu presupuesto un 30% por debajo del costo calculado. ¿Continuar?"
3.6. Salida de Datos y Presentación (Output)
3.6.1. Precio de Venta Unitario
 * Se asume escala 10000 para porcentajes (Ej. 10% = 1000).
3.6.2. Cálculo Final del Proyecto
 * Suma APUs: \sum (PU_{venta} \times Cantidad).
 * Suma Logística: + C_{logistica}.
 * Suma Ajuste: + Item_{ajuste} (Puede ser negativo).
 * Resultado: Subtotal_{base} (en centavos).
3.6.3. Renderizado y Fiscalidad
Para la visualización final en pantalla o PDF, se realiza la conversión de Entero a String Decimal.
 * Conversión: FormatCurrency(Subtotal_base / 100).
 * IVA (Si Factura):
   
   
   (Renderizar resultado / 100).

CAPÍTULO 4: DISEÑO DE INTERFAZ Y EXPERIENCIA DE USUARIO (UX/UI)
Versión del Módulo: 5.0 (Lógica Simplificada & Renderizado Flexible)
Filosofía de Interfaz: "Ingeniería Invisible & Selección Directa". La complejidad matemática y de maquetación se oculta. El usuario no "configura" variables complejas, simplemente selecciona escenarios pre-definidos y variantes claras.
4.1. FLUJO DE ARRANQUE (ONBOARDING & LEGAL)
Se mantiene el enfoque de empoderamiento profesional sobre el miedo legal.
 * Pantalla 0: Splash Screen (Carga Silenciosa)
   * Visual: Logotipo TESIVIL sobre fondo corporativo.
   * Procesos: Verificación de integridad de BD, Carga de Tokens, Sincronización Delta.
 * Pantalla 1: Acuerdo de Referencia Profesional
   * Objetivo: Cumplir el requisito legal con un tono de socio de negocios.
   * UI: Modal limpio con tipografía amigable.
   * Mensaje: "TESIVIL te respalda con precios de mercado, pero tú eres el experto en tu obra. Esta herramienta es una guía para potenciar tu negocio."
   * Acción: Botón de aceptación: "Entiendo que los precios son referencias y asumo el control de mi cotización."
 * Pantalla 2: Configuración de "La Empresa" (Setup Financiero)
   * Configuración única de variables persistentes:
     * Switch Renta/Local: "¿Pagas renta de un local o bodega?"
     * Switch Staff: "¿Tienes quien te ayude con la administración?"
     * Slider de Utilidad (%): Margen de ganancia deseado (Default: 30%).
4.2. EL BIFURCADOR DE INICIO (SELECTOR DE MODALIDAD)
Al iniciar una cotización, el usuario elige la profundidad del análisis mediante dos tarjetas visuales.
 * OPCIÓN A: COTIZACIÓN DETALLADA (Flujo Maestro)
   * Caso de Uso: Obras completas, remodelaciones, clientes exigentes.
   * Comportamiento: Activa el flujo de Pestañas con Wizard Contextual.
 * OPCIÓN B: COTIZACIÓN RÁPIDA (Flujo Express)
   * Caso de Uso: Reparaciones menores, venta de material, urgencias.
   * Comportamiento: Activa el flujo lineal tipo "Carrito de Compras".
4.3. FLUJO A: COTIZACIÓN DETALLADA (ESTRUCTURA DE PESTAÑAS)
Navegación por Stepper Tabs.
PESTAÑA 1: EL WIZARD CONTEXTUAL (SETUP DE OBRA)
Uso de preguntas naturales para definir los factores Project_Context.
 * Pregunta A (Logística): "¿Dónde será el trabajo?"
   * Opciones: "Aquí cerca / Local" | "A las afueras / Periferia" | "Lejos / Carretera".
 * Pregunta B (Obstrucción): "¿Cómo está el lugar?"
   * Opciones: "Vacío / Obra Gris" | "Con Muebles / Habitado" | "Delicado / Lujo".
 * Pregunta C (Urgencia): "¿Es una emergencia?" (Switch Si/No).
PESTAÑA 2: COMPOSITOR (KITS Y MATERIALES)
Cambio Crítico de UX: Eliminación de lógica condicional compleja en favor de selección de variantes explícitas.
 * Sub-Pestaña A: LOS "BIG 5" (Kits):
   * Accesos directos: Salidas, Centros de Carga, Luminarias, Acometidas, Recableado.
   * Modal de Selección de Variantes: Al tocar una categoría (ej. "Luminarias"), no se muestra un switch de "quién pone el material". En su lugar, se presentan tarjetas de variantes listas para usar:
     * Variante 1: "Suministro e Instalación" (Incluye Material + Mano de Obra).
     * Variante 2: "Solo Mano de Obra" (Material en $0.00, Mano de Obra intacta).
   * Beneficio: Evita errores de cálculo por parte del usuario y acelera la captura al hacer explícito lo que se está cobrando.
 * Sub-Pestaña B: BUSCADOR (Materiales Sueltos):
   * Búsqueda Fuzzy para insumos individuales con acumulación silenciosa de tiempos (APU).
PESTAÑA 3: RESUMEN Y ANÁLISIS (BOOK TIME)
Validación financiera.
 * Comparador de Tiempos: Gráfico visual comparando "Tiempo Sugerido" vs "Tu Tiempo".
 * Alertas Educativas: Feedback visual (Semáforo) sobre la eficiencia (muy barato/regalando trabajo) o competitividad (muy caro).
 * Ajuste Inverso: Prorrateo automático de mano de obra si se edita el Total Final.
PESTAÑA 4: SALIDA (PDF & SOCIAL)
Vista previa y acciones finales.
4.4. FLUJO B: COTIZACIÓN RÁPIDA (FLUJO LINEAL)
Diseñado como un Carrito de Compras simplificado.
 * Supuestos: Distancia Local, Obstrucción Estándar, Urgencia Normal.
 * Interfaz: Lista vertical simple.
 * Omisión: Se salta el análisis de tiempos (Book Time) y variantes complejas de Kits, priorizando la velocidad.
4.5. SALIDA DE DATOS Y GENERACIÓN DE PDF
Se actualiza la estrategia técnica de generación de documentos para garantizar consistencia visual sin desarrollo complejo de paginación nativa.
A. Estrategia de Renderizado (HTML/CSS o API Externa)
Se abandona el dibujo manual de coordenadas en PDF nativo.
 * Tecnología: Se utiliza un motor basado en HTML/CSS (vía expo-print o API externa como APITemplate.io).
 * Flujo Continuo: El diseño se estructura como un documento web responsivo que el motor convierte a PDF. Esto permite que las tablas de materiales se expandan y fluyan a nuevas páginas automáticamente sin romper el diseño, eliminando la necesidad de calcular saltos de página manualmente en el código.
 * Contenido (Caja Negra): El PDF muestra Precios Unitarios integrados (Material + MO + Indirectos). No hay desglose de gasolina ni complejidad.
B. Integración Nativa con WhatsApp
 * Botón Principal: "Enviar Presupuesto por WhatsApp" (Icono Verde).
 * Acción:
   * Genera el PDF mediante la estrategia HTML.
   * Abre WhatsApp con un mensaje pre-cargado: "Hola [Cliente], adjunto cotización formal...".
   * El usuario adjunta el archivo y envía.
4.6. COMPONENTES DE INTERFAZ (ESPECIFICACIÓN TÉCNICA)
Elementos clave para el desarrollo en React Native:
 * WizardOptionCard: Componente visual para la Pestaña 1 (Icono + Texto + Selección).
 * KitVariantSelector: Componente de lista dentro del Modal de Kits que reemplaza al switch antiguo. Muestra claramente las opciones "Con Material" vs "Solo Mano de Obra".
 * WhatsAppShareButton: Botón primario que encapsula la lógica de Linking y generación de PDF.
 * EfficiencyGauge: Componente visual (Pestaña 3) para Book Time.
 * WebViewPreview: Componente para mostrar la previsualización del PDF basado en HTML antes de la generación final.

CAPÍTULO 5: ESTRUCTURA DE DATOS (LOS CIMIENTOS)
Introducción
Este capítulo define la arquitectura de información y el esquema de base de datos relacional para el sistema TESIVIL. El diseño soporta un modelo de negocio SaaS, operatividad Offline-First y un sistema de inteligencia de mercado colaborativo (Crowdsourcing).
A nivel de persistencia, se elimina la complejidad de almacenamiento en frío (Cold Storage). Todos los datos históricos y vivos residen en PostgreSQL, gestionados mediante índices temporales eficientes para garantizar velocidad en las consultas sin sacrificar la disponibilidad inmediata del historial.
5.1. Modelo Entidad-Relación (Schema Design)
Se detallan las tablas maestras, transaccionales y de reporte.
A. Tabla users (Perfil, SaaS y Reputación)
Controla la configuración financiera, el estado de la suscripción y el nivel de participación del usuario.
| Campo | Tipo de Dato | Descripción y Función Lógica |
|---|---|---|
| id | UUID (PK) | Identificador único del usuario. |
| plan_type | ENUM | 'FREE', 'PRO'. Define límites de uso y publicidad. |
| subscription_expiry | DATETIME | Fecha límite para validar acceso offline. |
| economic_zone | ENUM | 'ZONE_FREE_NORTH', 'ZONE_GENERAL'. Ajusta validaciones de salario mínimo legal. |
| reputation_score | INTEGER | Gamificación. Puntos acumulados por reportar precios verídicos. |
| overhead_percent | REAL | Porcentaje de Indirectos. |
| profit_percent | REAL | Porcentaje de Utilidad. |
| technician_hourly_rate | REAL | Costo hora del técnico. |
| helper_hourly_rate | REAL | Costo hora del ayudante. |
| last_sync_at | DATETIME | Marca de tiempo crítica para el "Delta Sync". |
B. Tabla materials (Catálogo Maestro y Límites de Control)
Insumos con variables de ingeniería, métricas de confianza y nuevos límites de validación.
| Campo | Tipo de Dato | Descripción y Función Lógica |
|---|---|---|
| id | INTEGER (PK) | ID único. |
| name | TEXT | Nombre comercial (Indexado FTS). |
| category_type | ENUM | 'MATERIAL', 'RENTAL', 'SERVICE'. |
| base_price | REAL | Costo Directo actual. |
| price_min_limit | REAL | Nuevo. Límite inferior permitido. Si un scraper o usuario reporta un precio debajo de esto, se descarta automáticamente (evita errores de $0 o precios absurdos). |
| price_max_limit | REAL | Nuevo. Límite superior permitido. Actúa como filtro de "sanidad" para evitar picos estadísticos erróneos. |
| book_time_index | REAL | Tiempo de Mercado (Minutos estándar). |
| confidence_level | ENUM | HIGH, MEDIUM, LOW. |
| volatility_score | REAL | Índice (0-100) para alertar inestabilidad. |
| manual_override | BOOLEAN | Si es TRUE, bloquea la sobreescritura automática por scrapers. |
| last_verified_at | DATETIME | Fecha de validación del dato. |
| updated_at | DATETIME | Fecha de modificación (Trigger Sync). |
C. Tabla user_price_reports (Crowdsourcing)
Buzón de entrada para la inteligencia de precios reportada desde campo.
| Campo | Tipo de Dato | Descripción y Función Lógica |
|---|---|---|
| id | UUID (PK) | ID del reporte. |
| user_id | UUID (FK) | Usuario reportante. |
| material_id | INTEGER (FK) | Material reportado. |
| reported_price | REAL | Precio observado en tienda. |
| evidence_url | TEXT | Foto del ticket/etiqueta. |
| status | ENUM | 'PENDING', 'APPROVED', 'REJECTED'. |
D. Tabla assemblies y assembly_definitions (Kits)
Estructura para agrupación lógica ("Los 5 Grandes").
 * assemblies: Definición del Kit (ID, Nombre, Categoría, Mano de Obra Base).
 * assembly_definitions: Receta del Kit (ID Kit, ID Material, Cantidad, is_main_component).
E. Tabla quotes (Contexto Operativo)
Cabecera de la cotización. Gestiona el entorno y la lógica inversa.
| Campo | Tipo de Dato | Descripción y Función Lógica |
|---|---|---|
| id | UUID (PK) | ID de cotización. |
| status | ENUM | 'DRAFT', 'FINALIZED'. |
| logistics_tier | INTEGER | 0 Local, 1 Periferia, 2 Foráneo. |
| obstruction_factor | REAL | 1.0 Gris, 1.2 Habitado, 1.5 Saturado. |
| difficulty_factor | REAL | Multiplicador técnico. |
| is_urgent | BOOLEAN | Sobrecosto por emergencia. |
| system_labor_total | REAL | Horas calculadas por sistema (Book Time). |
| user_labor_override | REAL | Ajuste manual del usuario (Lógica Inversa). |
| created_at | DATETIME | Fecha de creación. (Indexada para consultas históricas). |
F. Tabla quote_items (Detalle Operativo)
Renglones de la cotización activa.
 * Campos: id, quote_id, material_id, client_supplied, frozen_unit_price, calculated_labor.
G. Tabla quote_snapshots (Respaldo Centralizado)
Registro inmutable de la cotización final. Se simplifica la seguridad delegando la confianza al servidor.
| Campo | Tipo de Dato | Descripción y Función Lógica |
|---|---|---|
| id | UUID (PK) | ID del snapshot. |
| quote_id | UUID (FK) | Referencia a la cotización original. |
| snapshot_json | JSON/TEXT | Dump completo de datos y configuración. Es la "Verdad Absoluta" almacenada en el servidor seguro. |
| pdf_url | TEXT | URL del archivo generado. |
| created_at | DATETIME | Fecha de emisión. |
5.2. Lógica Operativa y Reglas de Negocio
A. Validación de Precios (Límites Min/Max)
Para asegurar la calidad del dato antes de que llegue al usuario, el sistema aplica un filtro simple en la ingestión de datos (ya sea por Scraper o Crowdsourcing):
-- Pseudocódigo de Validación
IF (New_Price >= material.price_min_limit AND New_Price <= material.price_max_limit) THEN
    -- El precio es estadísticamente viable, se procede a evaluar actualización
    Status = 'VALID_CANDIDATE'
ELSE
    -- El precio es una anomalía (ej. error de dedo o bug de scraper)
    Status = 'REJECTED_OUTLIER'
    Log_Error("Precio fuera de rango para material ID " + material.id)
END IF

B. Confianza del Snapshot
Al eliminar la firma HMAC local, el modelo de seguridad se basa en Autoridad de Servidor:
 * Cuando el usuario finaliza una cotización, el móvil sube el JSON.
 * El servidor guarda el JSON en quote_snapshots y genera el PDF.
 * Cualquier consulta futura "histórica" siempre lee de esta tabla en el servidor, nunca de una caché local antigua. Esto garantiza que lo que ve el usuario es exactamente lo que se guardó en la nube, sin riesgo de manipulación local.
5.3. Estrategia de Almacenamiento y Sincronización
A. Gestión Histórica Unificada (PostgreSQL)
Se descarta el uso de almacenamiento en frío (Glacier). Todos los datos residen en la base de datos principal para simplificar la arquitectura y permitir consultas inmediatas.
 * Optimización: Se aplican Índices Temporales (Time-Series Indexing) sobre la columna created_at en la tabla quotes.
 * Consulta Eficiente: Para obtener el historial, el backend ejecuta consultas optimizadas:
   SELECT * FROM quotes WHERE user_id = X AND created_at > '2023-01-01'
   Esto permite manejar millones de registros históricos sin degradar el rendimiento, aprovechando la potencia de PostgreSQL.
B. Protocolo de Sincronización (Delta Sync)
Para mantener la eficiencia en el móvil:
 * Carga Inicial: Al instalar, se descargan solo las cotizaciones activas o recientes (ej. últimos 3 meses).
 * Consulta Histórica: Si el usuario busca una cotización de hace 2 años, la App realiza una petición GET /api/quotes/history (Online), ya que esos datos no necesitan vivir permanentemente en la memoria del teléfono.
 * Actualización de Catálogo: Sigue utilizando updated_at para bajar solo los materiales que cambiaron de precio.


CAPÍTULO 6: SEGURIDAD, AUTENTICACIÓN Y BLINDAJE JURÍDICO
Este capítulo establece la infraestructura de seguridad lógica, la gestión de identidad híbrida y el Ecosistema de Protección Legal. El objetivo es salvaguardar la integridad operativa de la plataforma y establecer barreras contractuales firmes que limiten la responsabilidad financiera de TESIVIL frente a la volatilidad del mercado, trasladando la autoridad de validación del cliente al servidor.
6.1. Arquitectura de Autenticación e Identidad
El sistema implementa un modelo "Token-Based" diseñado para soportar la operatividad Offline-First, delegando la custodia de credenciales a proveedores externos.
6.1.1. Proveedores de Identidad (OAuth 2.0)
No se gestionan contraseñas (No password handling).
 * Google Sign-In: Autenticación primaria para Android.
 * Apple Sign-In: Obligatorio para iOS (cumplimiento de normativas de App Store).
 * Protocolo de Intercambio:
   * Cliente recibe id_token del proveedor.
   * Envía token al Backend para su verificación.
   * El sistema retorna los tokens de sesión del ecosistema TESIVIL.
6.1.2. Estrategia de Tokens (JWT Strategy)
Esquema dual para persistencia segura:
 * Access Token (Memoria): TTL corto (30 min). Autoriza transacciones API.
 * Refresh Token (SecureStore): TTL largo (90 días). Permite regeneración de sesión y habilita el "Modo Offline".
6.2. Restricciones Geográficas (Geofencing)
Mecanismo para asegurar la coherencia económica de los costos.
6.2.1. Validación de Ubicación (Bounding Box)
Validación matemática local (hardcoded) al inicio y antes de generar reportes.
 * Rango: Latitud 14.5^\circ N a 33.0^\circ N / Longitud -118.5^\circ W a -86.0^\circ W.
 * Acción Fuera de Rango: No se bloquea la app, pero se fuerza una marca de agua: "PRECIOS NO VÁLIDOS PARA LA REGIÓN ACTUAL".
6.3. Seguridad de Datos y Modelo de Autoridad (Server-Authority)
Se elimina la dependencia de verificaciones criptográficas complejas en el lado del cliente (Frontend). La seguridad adopta un enfoque de Autoridad del Servidor donde la base de datos actúa como el último guardián de la integridad.
6.3.1. Row Level Security (RLS) con Supabase
La lógica de autorización se traslada directamente al motor de la base de datos (PostgreSQL vía Supabase). Esto garantiza que, incluso si la API o el cliente fueran comprometidos, las reglas de negocio críticas no pueden ser violadas.
 * Política de Inmutabilidad: Bloqueo estricto de edición en documentos históricos.
   * Regla: Una vez que una cotización cambia su estado a FINALIZED (ej. cuando se genera el PDF final o se envía al cliente), se activa una política de denegación de escritura.
   * Implementación Técnica (Pseudocódigo SQL):
     CREATE POLICY "Bloquear edición de finalizadas"
ON cotizaciones
FOR UPDATE
USING (status != 'FINALIZED')
WITH CHECK (status != 'FINALIZED');

   * Resultado: Cualquier intento de UPDATE o DELETE sobre estos registros retornará un error de permisos (HTTP 403/401) directamente desde la capa de datos, protegiendo el historial de precios contra manipulaciones post-contrato.
6.3.2. Aislamiento de Datos (Tenant Isolation)
Mediante RLS, se asegura que cada consulta a la base de datos filtre automáticamente los registros basándose en el user_id contenido en el token JWT.
 * Beneficio: Elimina el riesgo de "Fuga de Datos" accidental en el código del Backend (ej. olvidar un WHERE user_id = ...), ya que la base de datos simplemente no retornará filas que no pertenezcan al usuario autenticado.
6.4. Blindaje Jurídico y Gestión de Riesgo
Esta sección redefine la relación legal con el usuario, priorizando la limitación de pasivos y herramientas para la gestión de volatilidad.
6.4.1. Versionado de Términos (Strict Terms Versioning)
El consentimiento es un estado dinámico.
 * Variable: server_terms_version vs user_terms_accepted_version.
 * Bloqueo: Si la versión del servidor es superior, se bloquea la interfaz hasta que el usuario acepte los nuevos términos mediante scroll obligatorio.
6.4.2. Inyección de Disclaimer (Política de Referencia Estadística)
Estandarización de protección legal en la salida de documentos (PDF). Regla inmutable para todos los usuarios (Free y PRO).
 * Implementación: El generador de PDF inyecta un pie de página (Footer) reservado.
 * Texto Obligatorio:
   > "DOCUMENTO DE REFERENCIA ESTADÍSTICA: Los precios presentados se basan en algoritmos de estimación y no constituyen una oferta vinculante de TESIVIL. El usuario asume la responsabilidad total contractual frente a terceros."
   > 
6.4.3. Limitación de Responsabilidad (Liability Cap)
Cláusula contractual crítica implementada en los Términos y Condiciones para mitigar riesgos financieros sin recurrir a seguros costosos.
 * Definición Legal: Se establece explícitamente que la responsabilidad máxima de TESIVIL por cualquier daño, error de cálculo o pérdida derivada del uso del software, está limitada estrictamente al monto total pagado por el usuario en los últimos 12 meses.
 * Impacto Usuarios Gratuitos: Dado que el monto pagado es $0, la responsabilidad contractual se reduce al mínimo legal viable, desincentivando demandas frívolas.
6.4.4. Gestión de Volatilidad: Vigencia Personalizable (Feature PRO)
Herramienta exclusiva para usuarios PRO que permite transferir el riesgo de fluctuación de precios al cliente final.
 * Lógica de Negocio:
   El mercado eléctrico es volátil (cobre, acero). TESIVIL no garantiza precios, por lo que empodera al usuario para restringir la validez de su oferta.
 * Variables:
   * quote_validity_days (Selector: 3, 5, 7, 15 días).
   * expiration_date = creation_date + quote_validity_days.
 * Implementación en PDF (Solo PRO):
   Se genera un bloque destacado debajo del total:
   > "VIGENCIA DE LA OFERTA: [X] DÍAS.
   > Debido a la volatilidad de los insumos (Cobre/Aluminio), estos precios solo se garantizan hasta el [FECHA_EXPIRACIÓN]. Posterior a esta fecha, se requiere recotización."
   > 
 * Comportamiento en Versión Free:
   Se estampa automáticamente una vigencia restrictiva por defecto: "Vigencia inmediata (Sujeto a cambios sin previo aviso)".
6.4.5. Estrategia de Marcas de Agua
 * Free: Marca de agua diagonal "PRESUPUESTO NO OFICIAL".
 * PRO: Documento limpio, manteniendo solo el pie de página legal (6.4.2).
6.5. Privacidad y Derechos ARCO
Cumplimiento LFPDPPP.
 * Derecho al Olvido: Función "Eliminar Cuenta" que ejecuta borrado lógico y anonimización de datos, asegurando que no quede información personal vinculable en la infraestructura.

CAPÍTULO 7: LANZAMIENTO, MANTENIMIENTO Y CRECIMIENTO
Objetivo del Capítulo: Definir el plan integral para la viabilidad técnica y financiera de "TESIVIL". Este capítulo establece la transición de un modelo publicitario a uno de suscripción (SaaS), simplifica la operación de datos a un flujo de administración manual pero robusto, y detalla un cronograma de lanzamiento basado en la validación de mercado.
7.1. Modelo de Negocio y Monetización (Estrategia Freemium-to-Pro)
La sostenibilidad financiera se basa en la conversión de usuarios recurrentes a suscriptores PRO, utilizando la funcionalidad gratuita como embudo de adquisición.
7.1.1. Arquitectura de Suscripciones (In-App Purchases)
Implementación de RevenueCat como middleware para gestionar la validación de recibos y sincronización de estados entre Android e iOS.
 * Niveles de Servicio (Tiers):
   * Nivel Gratuito (Standard):
     * Funcionalidad: Cotización ilimitada y herramientas básicas.
     * Limitantes: Publicidad activa, almacenamiento local, PDF genérico con marca de agua.
   * Nivel PRO (Suscripción Recurrente):
     * Beneficio Técnico: ad_free_entitlement = True.
     * Cloud Sync: Respaldo y sincronización entre dispositivos.
     * Marca Blanca: Personalización total del PDF (Logotipo propio, datos fiscales).
     * Prioridad de Datos: Acceso a actualizaciones de precios en tiempo real.
7.1.2. Publicidad Táctica
La publicidad (AdMob) persiste en la versión gratuita como un generador de fricción calculada:
 * Formatos: Banner en listados e Interstitial al generar PDF.
 * Paywall Triggers: Puntos de conversión estratégica (ej. al intentar subir un logo personal o recuperar un respaldo en la nube).
7.2. Estrategia de Datos: Administración Simplificada (CSV Workflow)
Se reestructura el mantenimiento de datos para eliminar la dependencia constante de "reparación de código". El rol semanal cambia de programador a Administrador de Datos.
7.2.1. Flujo de Trabajo Operativo (Weekly Batch)
En lugar de scrapers autónomos escribiendo en la base de datos, se establece un proceso de "Ingesta Controlada":
 * Extracción (Automática/Semiautomática): Los scripts de scraping se ejecutan localmente o en servidor para generar un archivo plano.
 * Validación (Humana): El administrador descarga el archivo en formato CSV/Excel.
   * Acción: Revisión visual rápida de las columnas de precios para detectar anomalías (ej. un rollo de cable a $5 pesos).
   * Corrección: Ajuste manual directo en la hoja de cálculo si es necesario.
 * Ingesta (Bulk Upload):
   * Se utiliza una herramienta en el Panel Administrativo: Importar CSV de Precios.
   * El backend (FastAPI) procesa el archivo, valida formatos y actualiza masivamente la tabla material_prices en PostgreSQL.
7.2.2. Enfoque "Core 200"
Se mantiene el principio de calidad sobre cantidad. El archivo CSV semanal se limitará estrictamente a los 200 ítems principales (Tier 1) para garantizar que la revisión humana sea rápida (menos de 30 minutos) y altamente efectiva.
7.3. Infraestructura y Escalabilidad Técnica
7.3.1. Sincronización Eficiente
Uso de WatermelonDB con protocolo de "Delta Sync" para usuarios PRO. El servidor solo transmite los registros modificados desde la última conexión, optimizando ancho de banda y CPU.
7.3.2. Gestión de Almacenamiento
 * Activos: Logotipos de usuarios PRO en buckets S3/Spaces.
 * Optimización: Compresión obligatoria en cliente (App) antes de subida (Máx 200KB).
7.4. Mantenimiento del Software
 * OTA (Over-The-Air): Uso de EAS Update (Expo) para corregir lógica y UI sin revisión de tiendas.
 * Integridad de Pagos: Webhooks de RevenueCat en Backend (FastAPI) para gestionar renovaciones y cancelaciones en tiempo real.
7.5. Roadmap de Lanzamiento (Validación Progresiva)
Estrategia de despliegue diseñada para validar la demanda antes de invertir recursos en escalado masivo.
FASE 0: Pre-Validación (La "Waitlist")
Requisito Bloqueante: No se lanza el MVP hasta cumplir este objetivo.
 * Mecánica: Landing page sencilla explicando la propuesta de valor.
 * Objetivo: Capturar 500 correos electrónicos de técnicos interesados.
 * Acción: Solo se inicia el desarrollo de funcionalidades complejas (Cloud Sync) una vez validado el interés real.
FASE 1: Beta Privada (Meses 1-2)
 * Objetivo: Validación de UX/UI y detección de errores críticos.
 * Alcance: 50 usuarios de la Waitlist (TestFlight / Internal Testing).
 * Datos: Carga manual vía CSV.
 * Monetización: Desactivada.
FASE 2: MVP Público (Meses 3-4)
 * Objetivo: Lanzamiento en Tiendas y validación del modelo de negocio.
 * Alcance: Abierto al público general.
 * Datos: Flujo de actualización CSV semanal activo.
 * Monetización: Ads + Suscripción PRO habilitados.
7.6. Estrategia de Crecimiento y Retención (Viral Loops)
Mecanismos integrados para fomentar el crecimiento orgánico de bajo costo y el uso diario.
7.6.1. Sistema de Referidos Simplificado (Low Tech)
Se elimina la complejidad de enlaces profundos (Deep Linking) en favor de una mecánica social sencilla, adecuada para el perfil del usuario.
 * Mecánica de Registro:
   * En el formulario de registro (Sign Up), se incluye un campo de texto opcional: "¿Quién te invitó? (Ingresa su Correo o ID)".
 * Incentivo:
   * "Invita a 3 colegas y obtén 1 mes de PRO gratis".
 * Procesamiento:
   * El backend verifica si el correo/ID ingresado existe.
   * Si es válido, incrementa el contador referral_count del usuario invitador.
   * Al llegar a 3, el sistema otorga automáticamente el beneficio PRO.
7.6.2. Herramientas de Uso Diario (Retención)
Utilidades gratuitas que mantienen la app en la mente del usuario ("Top of Mind") aunque no esté cotizando una obra completa.
 * Ticker de Precio del Cobre: Widget con el precio del commodity en tiempo real para anticipar subidas de material.
 * Calculadora de Caída de Tensión: Herramienta offline rápida basada en la NOM-001-SEDE para cálculo de calibres.
