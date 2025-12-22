# DOCUMENTO MAESTRO FINAL — APP “BITÁCORA AIRE ACONDICIONADO SMART” (Bitácora AC)

**Versión:** 1.0 (INICIAL)
**Fecha:** 14 de Diciembre de 2025
**Propósito:** Especificación técnica completa para desarrollo MVP. Incluye arquitectura, reglas de negocio, esquema de datos, marco legal y roadmap.

---

## CAPÍTULO 1: VISIÓN Y ALCANCE

### 1.1 Resumen Ejecutivo
“Bitácora de Aires Acondicionados Smart” es una aplicación móvil (CRM + Herramientas) para técnicos de aire acondicionado que resuelve la gestión diaria, profesionaliza el servicio y crea un ecosistema de confianza mediante QRs.
**Pilares:**
1.  **Gestión**: Registro de servicios ultrarápido (<30s) con evidencia técnica.
2.  **Viralidad Dual**: Etiquetas QR que funcionan como Historial de Garantía para el cliente (sin app) y como Canal de Adquisición para nuevos técnicos (invitación directa en la web).
3.  **Monetización**: Modelo Freemium (Ads vs Suscripción PRO) + Venta de Insumos (Etiquetas).
4.  **Crecimiento**: Perfil Profesional Privado con gamificación interna y capacitación continua.

### 1.2 Objetivos del Producto
- **Operativo**: Digitalizar la bitácora del técnico (adiós libreta), llevar el control de clientes, buscador de errores mediante listado de códigos y comunidad de técnicos y herramientas de utilidad para el técnico.
- **Comercial**: Convertir técnicos a usuarios PRO mediante herramientas de valor.
- **Profesional**: Construir una reputación técnica interna basada en evidencia y capacitación (preparación para futuro directorio).

---

## CAPÍTULO 2: ARQUITECTURA Y TECNOLOGÍA

### 2.1 Stack Técnico
- **Frontend**: Flutter (Dart) - iOS + Android (Código único).
- **Backend / BaaS**: Firebase (Auth, Firestore, Cloud Functions, Storage, FCM).
- **Web (Admin/Landing)**: React / Next.js hosting en Firebase/Vercel.
- **IA**: Groq API (Llama 3) para moderación de contenido.
- **Scraper**: Python/Node (Cloud Run/Lambda) para precios de insumos.
- **Pagos**:
    -   **Stripe**: Suscripciones Recurrentes (PRO).
    -   **MercadoPago**: Pagos Únicos (Paquetes de Etiquetas Físicas).

### 2.2 Principios de Diseño
- **Offline-First**: La app debe ser funcional sin internet (SQLite local para caché crítico).
- **Privacidad por Diseño**: Hashes para datos sensibles (teléfonos), Alias únicos.
- **Identidad del Activo**: Un QR = Un Equipo (Inmutable).

---

## CAPÍTULO 3: MÓDULOS FUNCIONALES (CORE) – ESTRUCTURA "HAPPY PATH"

### 3.0 Módulo 0: Onboarding y Registro (Entrada)
**Objetivo**: Captura segura y configuración de privacidad.
1.  **Pantalla de Bienvenida**:
    -   Principal: "Continuar con Celular" (Firebase Phone Auth - Anti-fraude).
    -   Secundario: Google (requiere validar celular después).
2.  **Identidad**:
    -   **Nombre Real (Privado)**: Facturación/Interno. 
    -   **Nombre de Empresa (Opcional y privado)**: Facturación/Interno.
    -   **Alias Público (Único)**: Visible en bitacoras digitales y Comunidad (ej. "FrioTec2024").
    -   **Ciudad Base**: Para calibrar clima default en BTU y precios.
    -   *Campo Interno*: `profile_completeness_score` (0-100). Influye directamente en el acceso a funciones PRO y en la elegibilidad para el futuro Directorio. (Privado en V1).
3.  **Wizard Inicial**: "¿Años de experiencia?" -> Asigna Rango inicial (**Novato** < 2 años, **Técnico** > 2 años).
4.  **Permisos**: Cámara (QR), Ubicación (Geofencing), Notificaciones.
5.  **Aceptación Legal (Regla UI)**:
    -   Botón "Crear Cuenta" **deshabilitado** por defecto.
    -   Usuario debe marcar: [x] Acepto T&C y Aviso Privacidad | [x] Acepto Disclaimer de Responsabilidad.
    -   Links abren en Modal/WebView (no sacar de la app).

### 3.1 Módulo 1: "Mi Taller" (Dashboard & Clientes)
**Objetivo**: Centro de control diario del técnico. Consolida la agenda, herramientas rápidas y, fundamentalmente, la gestión de su cartera de clientes. Es la pantalla de "aterrizaje" obligatoria al abrir la app.

**Componentes Clave Detallados**:

1.  **Widget de Perfil Profesional (Header)**
    -   **Ubicación**: Top (Sticky/Fijo al hacer scroll).
    -   **Elementos Visuales**:
        -   Avatar del Técnico.
        -   Alias / Nombre del Negocio.
        -   Nivel actual (Novato / Técnico / Pro).
        -   Barra de progreso visual (`profile_completeness_score`).
    -   **Interacción**: Un tap en el área del perfil redirige al **Módulo 7: Economía & Tienda**.

2.  **Recordatorios / Calendario (Agenda Activa)**
    -   **Función**: Mostrar únicamente lo urgente/inmediato.
    -   **Visualización**: Tarjetas de "Próximos Servicios" (Hoy/Mañana).
    -   **Acciones Rápidas** (en la tarjeta):
        -   `[Llamar]`: Abre el marcador del teléfono.
        -   `[WhatsApp]`: Abre chat directo.
        -   `[Registrar Servicio]`: Convierte la cita en una orden de trabajo activa.

3.  **Grid de Acceso Rápido (Toolbox)**
    -   **Función**: Atajos para evitar navegación profunda en menús.
    -   **Botones**:
        -   `[Nuevo Servicio]`: Botón destacado para iniciar una orden sin cita previa.
        -   `[Calculadora BTU]`
        -   `[Guía Cables]`
        -   `[Códigos Error]`

4.  **Cartera de Clientes (Directorio y Expedientes)**
    -   **Ubicación**: Sección central/inferior del Dashboard, accesible mediante un botón "Ver Mis Clientes" o una lista de "Clientes Recientes".
    -   **Lógica de Filtrado**: La app consulta la base de datos y muestra exclusivamente los clientes vinculados al ID del técnico logueado.
    -   **A) Vista de Lista (Listado Principal)**:
        -   Buscador rápido (por Nombre o Colonia).
        -   Cada fila muestra: Nombre del Cliente + Dirección corta + Última fecha de visita.
    -   **B) Vista "Expediente del Cliente" (Al abrir un cliente)**: Se despliega una pantalla con dos pestañas o secciones claras:
        -   **Datos Generales (Perfil)**:
            -   Nombre completo.
            -   Teléfono (con icono para marcar/whatsapp).
            -   Dirección completa (con icono para abrir Google Maps).
            -   Notas fijas (Ej: "Timbre no sirve", "Cliente exigente").
        -   **Historial de Servicios (Timeline)**:
            -   Lista cronológica descendente (del más reciente al más antiguo) de todos los trabajos realizados a este cliente específico.
            -   **Datos por ítem**:
                -   Fecha del servicio.
                -   Tipo de trabajo (Ej: Mantenimiento, Instalación).
                -   Equipo intervenido (Ej: Minisplit Sala).
                -   Monto cobrado.
            -   **Objetivo**: Que el técnico pueda responder en segundos: *"Sí, Doña María, la última vez que le cargamos gas fue en Marzo del año pasado"*.

5.  **Historial Avanzado (Logbook Global)**
    -   **Función**: Registro global de toda la actividad del técnico (a diferencia de la vista por cliente).
    -   **Herramientas**:
        -   Buscador y filtros (Fecha, Tipo de Servicio).
        -   *Feature PRO*: Exportar reporte en PDF.
        -   Opción "Repetir Servicio": Permite clonar los datos de un servicio pasado para crear uno nuevo rápidamente.

6.  **Estadísticas y Progreso**
    -   **Visualización**: Tarjetas pequeñas (KPIs).
    -   **Datos**: Servicios completados en la semana actual y Tokens acumulados.

7.  **Submódulo: Capacitación Ligera (In-App)**
    -   **Contenido**: Cápsulas informativas de "Buenas Prácticas" (Instalación, Normativa, Errores).
    -   **Formato**: Texto breve + Imagen/Video corto.
    -   **Mecánica**: Otorga Tokens por lectura completa para incentivar el uso de la app.
    -   **Disclaimer**: "Material de apoyo, no certificación oficial".

### 3.2 Módulo 2: Gestión de Servicios & CRM (El Núcleo Operativo)
**Objetivo (UX Goal)**: Velocidad y fricción cero. El técnico debe poder registrar un servicio en menos de 30 segundos. Es la herramienta principal de trabajo; si esto es lento, el técnico dejará de usar la app.

**Flujo de Usuario (Step-by-Step)**:

1.  **Selección del Tipo de Servicio (Categorización Visual)**
    -   **Interfaz**: Pantalla limpia con 3 botones de gran tamaño (fáciles de tocar con guantes o manos sucias).
    -   **Opciones**:
        -   `[🛠️ Instalación]`: Configura el flujo para equipos nuevos.
        -   `[🧽 Mantenimiento]`: Configura el flujo para limpieza/preventivo.
        -   `[🔧 Reparación]`: Configura el flujo para correctivo/fallas.
    -   **Lógica**: La selección determina qué "Checklist" y qué sugerencias automáticas aparecen en el paso 4.

2.  **Identificación del Cliente (CRM & Privacidad)**
    -   **Lógica de Negocio: "Aislamiento de Datos" (Data Isolation)**:
        -   **Arquitectura**: Existe una tabla maestra (`contacts_table`), pero cada fila tiene un campo `technician_id`.
        -   **Consulta (Query)**: Al buscar, la app ejecuta: *"Mostrar contactos DONDE technician_id = [ID del Usuario Actual]"*.
        -   **Resultado**: El técnico siente que es "su" agenda privada. Nunca ve los clientes de otros técnicos.
    -   **Interacción**:
        -   **Buscador Inteligente**: Campo de texto con autocompletado. Escribe "Jua" → Aparece "Juan Pérez", "Juan Mecánico", etc.
        -   **Botón "Nuevo Cliente"**: Si no aparece en la lista, permite crearlo ahí mismo sin salir del flujo (abre un modal rápido).
    -   **Feature PRO (Monetización)**:
        -   **Free**: El técnico registra la fecha manualmente.
        -   **PRO**: Opción "Activar Recordatorio Automático". La app enviará una notificación al técnico (y opcionalmente un WhatsApp pre-redactado al cliente) cuando se cumpla el ciclo de servicio.

3.  **Datos del Equipo (Activos)**
    -   **Selección de Marca (Visual Grid)**:
        -   **UX**: Grilla de logos de 3 columnas para reconocimiento visual instantáneo (más rápido que leer una lista).
        -   **Marcas Prioritarias**: Mirage, Midea, York, Trane, Carrier, LG, Samsung, Daikin, Hisense.
        -   **Opción Final**: Botón "Genérica / Otra" (para marcas blancas).
    -   **Integración QR (Hooks)**: Botón "Vincular/Escanear QR". (Permite asociar este servicio a una etiqueta física pegada en el equipo, facilitando el historial futuro. Detalle completo en Módulo 3).

4.  **Trabajo Realizado (Registro Técnico)**
    -   **Chips Multi-select (Entrada Rápida)**:
        -   Nube de etiquetas pulsables. Se pueden seleccionar varias.
        -   **Opciones**: Limpieza Evap/Cond, Carga de Gas, Cambio Capacitor, Cambio Contactor, Reparación Tarjeta, Búsqueda Fugas, Soldadura, Cambio Sensor, Desinstalación, Diagnóstico, Otro.
        -   **Auto-Select Inteligente**: Si en el Paso 1 se eligió "Instalación", el chip [Instalación] aparece marcado por defecto.
    -   **Listas de Verificación (Checklists de Calidad)**:
        -   Se despliegan según el tipo de servicio.
        -   **Caso Instalación**:
            -   [ ] Vacío realizado (Micras).
            -   [ ] Torque aplicado en tuercas.
            -   [ ] Protección eléctrica verificada (Voltaje/Tierra).
            -   [ ] Prueba de operación (Delta T).
        -   **Gamificación**: Completar la checklist al 100% otorga un "Bono de Calidad" en Tokens. Genera evidencia de que se hizo el trabajo bien.

5.  **Cierre y Evidencia**
    -   **Fotos**:
        -   Captura desde cámara o galería.
        -   **Compresión**: Las imágenes se comprimen automáticamente antes de subir para no gastar los datos móviles del técnico ni el almacenamiento del servidor.
    -   **Notas**: Campo de texto libre para observaciones ("El cliente pidió no mover el mueble", "El equipo hace ruido extraño en el fan").
    -   **Próxima Cita**:
        -   Cálculo automático: Fecha actual + 6 meses (Mantenimiento) o + 1 año (Instalación). Editable por el usuario.

### 3.2-B Módulo: Perfil Profesional (Sección "Mi Carrera")
**Ubicación**: Pestaña dedicada en el menú o acceso desde el Header del Dashboard.
**Estado V1**: Privado (Solo para ojos del técnico).
**Objetivo**: Retención y Auto-superación. Funciona como un "espejo profesional" que le muestra al técnico cuánto ha crecido.

**Componentes Visuales**:
1.  **Tarjeta de Identidad**:
    -   Avatar.
    -   Alias.
    -   Rango: Novato → Técnico → Pro (Basado en puntos/servicios).
    -   Ubicación (Ciudad base).
2.  **Estadísticas de Carrera (Lifetime Stats)**:
    -   Datos acumulados desde el día 1 de uso de la app.
    -   **Años de Experiencia**: (Input manual al registrarse + tiempo en app).
    -   **Total de Servicios**: Contador incrementa con cada cierre en el Módulo 3.2.
    -   **Equipos Activos**: Número de QRs únicos vinculados.
    -   **Casos SOS Resueltos**: Métrica de reputación en la comunidad (ayuda a otros).
3.  **Nivel de Perfil (Barra de Progreso)**:
    -   **Visual**: Barra porcentual `profile_completeness_score`.
    -   **Acción**: "Completa tu perfil para llegar al 100%". Items faltantes: "¿Qué herramientas usas?", "Sube tu logo", "Verifica tu teléfono".
4.  **Sala de Trofeos (Insignias/Badges)**:
    -   Visualización de logros desbloqueados en color, y bloqueados en gris (para motivar).
    -   **Ejemplos**:
        -   🏆 **Primer QR**: Por etiquetar el primer equipo.
        -   ❄️ **Experto en Inverter**: Por registrar +50 servicios en equipos Inverter.
        -   🤝 **Buen Samaritano**: Por recibir 10 "Gracias" en el módulo de comunidad.

**Disclaimer UI**:
"Este perfil es privado. Estás construyendo tu hoja de vida digital. En futuras versiones, podrás decidir hacerlo público para aparecer en el Directorio Certificado y conseguir más clientes."

### 3.3 Módulo 2: Cotizador Pro (Premium) – Especificación Detallada
**Objetivo del Módulo**:
Proporcionar una herramienta de generación de presupuestos HVAC que cubra el ciclo completo de venta (Instalación, Preventivo, Correctivo) en menos de 120 segundos. El sistema debe garantizar la rentabilidad del técnico mediante la gestión inteligente de costos de insumos (conectada a precios de mercado) y protegerlo legalmente mediante alcances de servicio predefinidos.

#### 1. Arquitectura de Datos y Configuración (Backend & Setup)
El sistema no opera con precios estáticos, sino con un modelo relacional dinámico.

**1.1 Base de Datos de Insumos (Master Data)**
El backend mantiene una tabla maestra (`master_items_db`) con aproximadamente 174 ítems esenciales.
*   **Categorización (`item_type`)**:
    *   `MATERIAL`: Tubería (cobre/aluminio), cable, armaflex, cinta.
    *   `REFACCION`: Capacitores, motores, sensores, tarjetas, contactores.
    *   `GAS`: Refrigerantes (R22, R410A, R32) por Kg/Lata.
    *   `SERVICIO_CIVIL`: Mano de obra estandarizada (Ranurado, Perforación Losa, Instalación Eléctrica).
    *   `PAQUETE_PREVENTIVO`: Precios base de mantenimiento por tonelaje.
*   **Ranking de Valor (`pareto_rank`)**: Cada ítem tiene un índice basado en su precio promedio para ordenamiento (Items caros primero).

**1.2 Perfil Económico del Usuario (User Configuration)**
El técnico debe configurar su entorno económico. Se ofrecen dos modalidades:
*   **Modalidad A: Control Total (Manual - Default)**
    *   **Interfaz**: Lista paginada de los 174 ítems, ordenada por `pareto_rank` DESC (comienza con lo más caro).
    *   **Input**: El usuario ingresa su **Costo Real de Compra** (incluyendo IVA).
    *   **Lógica "El Vigilante" (The Watcher)**: Proceso en background (Cron job) que compara semanalmente el `user_cost` vs. `global_market_average`.
        *   **Trigger**: Si `global_market_average` sube > 2% vs semana anterior.
        *   **Acción**: Notificación Push y bandera visual (🔴) en el ítem: *"Alerta de Mercado: El Cobre subió 5%. Tu costo registrado ($X) podría estar desactualizado."*
*   **Modalidad B: Piloto Automático (Algorítmico - Beta)**
    *   **Input**: El usuario solo define el costo de 5 "Ítems Testigo" (ej. Rollo Cobre 1/2", Gas R410A, Minisplit 1 Ton, Capacitor 35uf, Cinta Momia).
    *   **Algoritmo**:
        *   Calcula `Factor_Realidad = Costo_Usuario / Promedio_Global`.
        *   Extrapola este factor a los ~169 ítems restantes de la misma categoría.
    *   **Output UI**: Los precios calculados se muestran con un tag "Estimado".

**1.3 Configuración de Mano de Obra y Textos**
Variables fijas almacenadas en `user_settings`:
*   `labor_base_1ton`: Costo instalación básica.
*   `labor_extra_tubing`: Costo Mano de Obra por metro lineal de tubería adicional (tender, soldar, encintar).
*   `labor_extra_pump`: Costo Mano de Obra por instalar bomba.
*   `text_scope_maintenance`: Texto enriquecido (Rich Text) con la descripción legal/técnica del mantenimiento preventivo.

#### 2. Flujo Principal: "El Trifurcador" (UX Entry Point)
Al iniciar "Nueva Cotización" y seleccionar al Cliente, el sistema presenta 3 tarjetas de selección grandes (Cards) que determinan la interfaz y la lógica de cálculo.

**RUTA 1: VENTA E INSTALACIÓN (Flujo Complejo)**
Caso de Uso: Instalaciones nuevas, cambios de domicilio, obra civil.
*   **Paso 1.1: Definición de Suministro (Switch)**
    *   Pregunta: "¿Quién suministra el equipo?"
    *   **Opción A [Cliente]**: El sistema oculta selectores de marca/modelo. Solo pide Tonelaje (para calcular costo MO base). Costo Equipo = $0.
    *   **Opción B [Técnico]**: Se despliega Wizard de Equipo.
        *   Selectores: Tipo (Minisplit/Piso Techo) > Tecnología (Inverter/On-Off) > Voltaje (110v/220v) > Capacidad (1-3 Ton).
        *   Data Fetch: Obtiene costo del equipo de la BD + Margen Configurado.
*   **Paso 1.2: Definición de Alcance (Básico vs. Adicionales)**
    *   Botón "Instalación Básica": Cierre directo. Asume kit incluido. Pasa a Resumen.
    *   Botón "Con Adicionales": Despliega lista de conceptos extras.
*   **Paso 1.3: Gestión de Adicionales (Lógica Híbrida)**
    *   Se presentan dos tipos de selectores en la misma lista:
        *   **Servicios de Obra (Checkboxes Simples)**:
            *   Ítems: Perforación Losa, Ranurado (m), Instalación Base Piso, Desmontaje equipo viejo.
            *   Lógica: Suma precio fijo precargado (`price_service_civil`).
        *   **Materiales Variables (Selectores Drill-down)**:
            *   Ítems: Tubería Extra, Bomba de Condensado, Kit de Instalación (si no viene incluido).
            *   Interacción: Al hacer clic en "Tubería Extra", se abre modal filtrando la BD por `category = 'TUBERIA'`.
            *   Selección: El usuario elige "Tubo Rígido Tipo L 1/2".
            *   Input: Cantidad (Metros).
            *   **Cálculo Compuesto**:
                $$Precio = (CostoMaterial \times (1+StockFactor) \times Margen) + (ManoObraExtra \times Cantidad)$$

**RUTA 2: MANTENIMIENTO PREVENTIVO (Flujo Volumen)**
Caso de Uso: Servicios recurrentes, limpieza estandarizada.
*   **Paso 2.1: Calculadora de Volumen**
    *   Interfaz: Lista de capacidades con contadores Stepper ( [-] 0 [+] ).
        *   1 Ton (Precio Base $X)
        *   1.5 Ton (Precio Base $Y)...
    *   Subtotal Dinámico: Se actualiza en tiempo real.
*   **Paso 2.2: Política de Descuentos**
    *   Condicional: Si `total_equipos > 1`, aparece campo "Descuento por Paquete".
    *   Opciones: % (Porcentaje) o $ (Monto fijo).
*   **Paso 2.3: Validación de Alcance**
    *   Muestra una vista previa del texto `text_scope_maintenance`.
    *   Permite edición temporal para esta cotización (ej. agregar "Nota: Se requiere uso de andamios por cuenta del cliente").

**RUTA 3: REPARACIÓN Y CORRECTIVO (Flujo Custom/Tienda)**
Caso de Uso: Fallas, recargas de gas, cambios de piezas, diagnósticos.
*   **Paso 3.1: Definición de Mano de Obra (Diagnóstico)**
    *   Selector: Lista de servicios comunes (Revisión General, Corrección de Fuga, Cambio de Compresor).
    *   Opción Manual: Campo de texto libre ("Reparación de tarjeta electrónica...") + Campo de Precio (Mano de Obra Pura).
*   **Paso 3.2: La Tienda de Refacciones (Shopping Cart)**
    *   **Interfaz**: Buscador con barra de búsqueda y filtros rápidos (Chips: Gas, Electricidad, Motores).
    *   **Acceso a BD**: Consulta los 174 ítems.
    *   **Alertas en Tiempo Real**: Si el técnico selecciona un ítem (ej. "Gas R410A") cuyo precio global ha subido drásticamente en las últimas 24h, aparece un Toast: *"⚠️ El precio de este gas subió hoy. Verifica tu margen."*
    *   **Carrito**: Acumula `(Costo_Refaccion * Margen)` al total.

#### 3. Lógica Financiera Transversal (Business Logic)
Reglas matemáticas que aplican a todas las rutas para asegurar la utilidad.

**3.1 Factor de Stock (Financiamiento de Inventario)**
Aplica exclusivamente a materiales fraccionables (Tubería, Cable).
*   **Problema**: El técnico compra rollos de 15.2m pero vende 3m. El resto es capital parado.
*   **Solución**: Al vender por metro, el sistema aplica un markup adicional configurable (ej. +20%) sobre el costo lineal proporcional.
    $$CostoUnitarioCalculado = (CostoRollo / Longitud) \times 1.20$$

**3.2 Manejo de Impuestos (IVA)**
*   **Input**: El sistema asume que todos los costos ingresados por el técnico (Manual o Auto) **YA INCLUYEN IVA**. (Es la realidad operativa, compran en mostrador).
*   **Cálculo de Venta**: El Margen de Ganancia se aplica sobre el costo bruto (con IVA).
*   **Output (PDF)**:
    *   **Switch "Cliente requiere factura": OFF (Default)**. Muestra "Total a Pagar".
    *   **Switch "Cliente requiere factura": ON**. Realiza desglose inverso visual.
        *   Base = Total / 1.16
        *   IVA = Base * 0.16
        *   Total = (Intacto)

#### 4. Salida: Generación del PDF (Output)
El documento generado varía estructuralmente según la Ruta elegida.
*   **Cabecera (Común)**: Logotipo, Datos de Contacto, Folio #, Datos del Cliente, Fecha.
*   **Cuerpo (Variable)**:
    *   **Si Ruta 1 (Instalación)**: Tabla detallada.
        *   Concepto Principal: "Suministro e Instalación..."
        *   Sección Adicionales: "Materiales y Servicios Extra" (Desglose de lo seleccionado en drill-down).
    *   **Si Ruta 2 (Preventivo)**: Tabla Resumen.
        *   Columna Cantidad | Descripción (Capacidad) | P. Unitario | Importe.
        *   Bloque de Texto Legal: "Alcance del Servicio" (El texto configurado).
    *   **Si Ruta 3 (Correctivo)**: Tabla Bipartita.
        *   Sección A: Servicios / Mano de Obra.
        *   Sección B: Refacciones y Materiales Suministrados.
*   **Pie de Página (Común)**:
    *   Vigencia (Dinámica: 7, 15, 30 días).
    *   Notas / Condiciones Comerciales.
    *   **Área de Cierre**:
        *   Costo Total (Gran y legible).
        *   **Link Inteligente**: "Aceptar Presupuesto" (Deep link a WhatsApp API con mensaje pre-llenado).

### 3.4 Módulo 3: Ecosistema QR ("La Llave Maestra")
**Objetivo Estratégico**:
*   **Retención (Lock-in)**: El técnico "marca su territorio". Al pegar el QR, convierte ese aire acondicionado en un cliente recurrente exclusivo (mientras sea el último en dar servicio).
*   **Viralidad (Growth Hack)**: La vista pública actúa como un "Caballo de Troya". Si otro técnico escanea el código, ve el banner para descargar la app.
*   **Confianza**: Ofrece al cliente final una bitácora digital transparente, algo que la competencia no tiene.
**Ubicación UX**: Botón Flotante (FAB) con icono de QR 📷, omnipresente en el Dashboard y CRM.

#### A. Experiencia del Cliente (Web View / Sin App)
**Concepto**: "Fricción Cero". El cliente no descarga nada. Solo escanea con su cámara nativa.
**Acceso Seguro**: URL pública con token hash (ej. `app.tudominio.com/qr/a8b9c7...`).

**Estructura de la Pantalla Web**:
1.  **Header de Estado (Semáforo)**:
    -   Muestra Marca/Modelo.
    -   **Lógica Visual**:
        -   🟢 Al corriente: Si último servicio < 6 meses.
        -   ⚠️ Mantenimiento Sugerido: Si último servicio > 6 meses.
        -   🔴 Crítico: Si último servicio > 12 meses (Opcional).
2.  **Bitácora Transparente (Read-Only)**:
    -   Lista simplificada ("Sanitizada").
    -   **Muestra**: Fecha, Tipo ("Mantenimiento"), Detalle Público ("Limpieza profunda"), Alias del Técnico ("Juan F.").
    -   **Oculta**: Precios, Notas internas, Datos de contacto de técnicos anteriores.
3.  **Botón de Contacto (La Joya del Sistema)**:
    -   **Regla de Oro ("King of the Hill")**: El botón de WhatsApp SIEMPRE enlaza al **último** técnico que registró un servicio en la app.
    -   **Efecto**: Incentiva al técnico a registrar el servicio en la app inmediatamente para "sobreescribir" al técnico anterior y adueñarse del cliente.
4.  **Banner de Adquisición ("El Gancho")**:
    -   Ubicado al pie de página.
    -   Diseñado para atraer a otros técnicos curiosos o dueños de flotillas.
    -   **Copy**: "¿Eres técnico? Organiza tus clientes con esta app gratis." → Link a Store.

#### B. Experiencia del Técnico (In-App Scanner)
**Flujo**: El técnico usa el escáner dentro de la App.
*   **Caso 1: QR Nuevo (Virgen)**:
    *   La app detecta que el QR no está asignado.
    *   Abre modal: "Vincular equipo".
    *   Pide: Cliente (Seleccionar o Crear) + Datos del Equipo.
    *   **Resultado**: El código físico queda "casado" permanentemente con ese ID de equipo en la base de datos.
*   **Caso 2: QR Existente (Consulta)**:
    *   Muestra el "Expediente Completo" (Módulo 3.1).
    *   Incluye **Notas Privadas** (visibles solo para el autor o si se comparten en un futuro equipo de trabajo).
*   **Caso 3: QR Existente (Acción)**:
    *   Desde la pantalla de consulta, botón directo: `[ + Nuevo Servicio ]`.
    *   Pre-llena automáticamente los datos del cliente y del equipo en el formulario del **Módulo 3.2**.

#### C. Traducción de Reputación (Trust System)
Mecanismo psicológico para validar al técnico ante el cliente sin exponer la jerarquía interna de "juego".

| Nivel Interno (Gamificación) | Etiqueta Pública (Web View) | Percepción del Cliente |
| :--- | :--- | :--- |
| **Nivel 1 (Novato)** | ✅ Miembro Verificado | "Es seguro dejarlo entrar a mi casa. La app sabe quién es." |
| **Nivel 2 (Técnico)** | 🛡️ Técnico Profesional | "Sabe lo que hace. Tiene experiencia." |
| **Nivel 3 (Pro)** | 🥇 Especialista Certificado | "Es el mejor. Vale lo que cobra." |

#### D. Lógica de Seguridad y Datos (Backend Rules)
*   **Acceso "Bearer Token"**: La seguridad es física. Quien tiene acceso al QR (está frente al equipo), tiene permiso de lectura. No se requieren contraseñas para la vista web.
*   **Sanitización de Datos (Privacy Filter)**:
    *   La API que alimenta la vista web (`GET /api/public/equipment/{id}`) debe filtrar estrictamente los campos.
    *   **Whitelist**: `service_date`, `service_category`, `public_notes`, `tech_public_name`, `tech_badge_level`.
    *   **Blacklist**: `price`, `private_notes`, `client_phone`, `tech_phone` (excepto el actual).
*   **Inmutabilidad**: Una vez que un QR se asigna a un equipo, no se puede "borrar" fácilmente para evitar fraudes. Si el equipo se tira a la basura, el historial muere con él.
*   **Métricas de Perfil**: Cada vez que un técnico pega y vincula un QR nuevo, su contador de Equipos Activos en el Perfil Profesional (**Módulo 3.2-B**) aumenta +1. Esto desbloquea insignias como "Dueño de la Zona" (al tener 50 QRs activos).

### 3.5 Módulo 4: Herramientas Técnicas & Calculadora (Utility Belt)
**Objetivo**: Convertir el celular en una navaja suiza. Agrupar las herramientas de consulta diaria para evitar que el técnico tenga que "adivinar" o buscar en Google, centralizando el conocimiento técnico validado.

#### 3.5.1 Asistente Eléctrico (Wizard de Instalación)
**UX**: Formulario progresivo de 3 pasos.
**Motor de Decisión (Logic Flow)**:
El sistema toma los inputs y cruza la información con la siguiente matriz de decisión basada en normativa estándar (NOM-001) y buenas prácticas.
*   **Variables de Entrada**:
    *   **Capacidad**: 1, 1.5, 2, 3 Ton.
    *   **Voltaje**: 110v / 220v.
    *   **Tecnología**: Inverter / Estándar (On-Off).
    *   **Distancia**:
        *   **Corto**: < 20 metros (Kit básico).
        *   **Largo**: 20 - 50 metros (Caída de tensión).

**Matriz de Salida (Output para el Usuario)**:

| Capacidad | Voltaje | Tecnología | Distancia | Cable Sugerido | Pastilla (Breaker) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 Ton | 110V | Estándar | Corto/Largo | 12 AWG | 1 x 15A |
| 1 Ton | 110V | Inverter | Corto | 14 AWG | 1 x 15A |
| 1 Ton | 110V | Inverter | Largo | 12 AWG | 1 x 15A |
| 1 Ton | 220V | Estándar | Corto | 14 AWG | 2 x 10A |
| 1 Ton | 220V | Estándar | Largo | 12 AWG | 2 x 10A |
| 1 Ton | 220V | Inverter | Corto | 14 AWG | 2 x 10A |
| 1 Ton | 220V | Inverter | Largo | 12 AWG | 2 x 10A |
| 1.5 - 2 Ton | 220V | Estándar | Corto/Largo | 12 AWG | 2 x 15A |
| 1.5 - 2 Ton | 220V | Inverter | Corto | 14 AWG | 2 x 15A |
| 1.5 - 2 Ton | 220V | Inverter | Largo | 12 AWG | 2 x 15A |
| 3 Ton | 220V | Estándar | Corto | 12 AWG | 2 x 20A |
| 3 Ton | 220V | Estándar | Largo | 10 AWG | 2 x 20A |
| 3 Ton | 220V | Inverter | Corto | 12 AWG | 2 x 20A |
| 3 Ton | 220V | Inverter | Largo | 10 AWG | 2 x 20A |

**Nota UI**: Mostrar visualmente el calibre y la pastilla con íconos vectoriales grandes.

#### 3.5.2 Tabla P-T Dinámica (Gas Ruler)
**Herramienta**: Referencia rápida para carga de gas.
*   **Interfaz**:
    *   **Selector de Gas**: Tabs superiores `[R410A]` `[R32]` `[R22]`.
    *   **Input**: Slider horizontal para Temperatura Ambiente (°C).
    *   **Output**: Un indicador tipo "medidor" que muestra el rango de PSI ideal (Succión/Baja).
*   **Base de Conocimiento (Data Ranges)**:
     -   **Output**: Presión de succión ideal (PSI).
        -   **R-410A (Orientativo)**:
            -   25 °C: ~105 – 125 psig (≈ 7.2 – 8.6 bar)
            -   30 °C: ~110 – 130 psig (≈ 7.6 – 9.0 bar)
            -   35 °C: ~115 – 135 psig (≈ 7.9 – 9.3 bar)
            -   40 °C: ~120 – 145 psig (≈ 8.3 – 10.0 bar)
            -   *Fuentes: FSW, Refrigerants Center Inc, Royal Refrigerants*
        -   **R-32 (Orientativo - Similar a R-410A)**:
            -   25 °C: ~105 – 130 psig (≈ 7.2 – 9.0 bar)
            -   30 °C: ~110 – 135 psig (≈ 7.6 – 9.3 bar)
            -   35 °C: ~115 – 140 psig (≈ 7.9 – 9.6 bar)
            -   40 °C: ~120 – 150 psig (≈ 8.3 – 10.3 bar)
            -   *Fuente: Ace Services (Confirmado que opera en rangos similares)*
        -   **R-22 (Orientativo - Presiones menores)**:
            -   25 °C: ~50 – 70 psig (≈ 3.4 – 4.8 bar)
            -   30 °C: ~55 – 75 psig (≈ 3.8 – 5.2 bar)
            -   35 °C: ~60 – 80 psig (≈ 4.1 – 5.5 bar)
            -   40 °C: ~65 – 90 psig (≈ 4.5 – 6.2 bar)

#### 3.5.3 Biblioteca de Errores (Offline)
**Recurso Base**: `seed_full_database.sql` (Base de Datos Relacional Local) (en `C:\TESIVIL\AWS-TESIVIL\AWS-TESIVIL\06_QRCLIMA\data_mining\output\seed_full_database.sql`).
**Objetivo**: Diagnóstico instantáneo y **OFFLINE**. El técnico debe poder identificar el error en una azotea sin señal de internet en menos de 10 segundos.

1.  **Arquitectura de Datos (Implementación Técnica)**
    *   Para garantizar velocidad y disponibilidad, esta base de datos no se consulta por API cada vez, sino que vive dentro del teléfono.
    *   **Motor Local**: SQLite. El archivo SQL se inyecta como base de datos local en la primera instalación de la app.
    *   **Sincronización Híbrida**:
        *   La app viene precargada con estos 67 modelos y cientos de errores.
        *   **Update System**: Cuando tú (Admin) agregues un nuevo modelo (ej. "Mirage X32") en el servidor, la app descarga solo el "delta" (la diferencia) la próxima vez que tenga Wi-Fi.

2.  **Interfaz de Usuario (UX de Diagnóstico)**
    *   Aprovechando los campos `image_url` y `logo_url` de tu SQL, la navegación es visual, no de texto.
    *   **Paso A: Selección de Marca (Brand Grid)**
        *   **Visual**: Grid de logotipos grandes sobre fondo blanco (card view).
        *   **Data Source**: `SELECT DISTINCT logo_url FROM air_conditioner_models`.
        *   **Marcas Detectadas**: Mirage, Carrier, York, LG, etc.
    *   **Paso B: Identificación de Equipo (Visual Match)**
        *   **Problema**: El técnico a veces no sabe si es un "Magnum 19" o un "X3".
        *   **Solución**: Carrusel Visual.
        *   **Interfaz**: Al tocar "Mirage", se muestran las fotos de los equipos (`image_url`) en un carrusel horizontal o grid vertical.
        *   **Datos**: Muestra `name` (ej. "MAGNUM19") y `type` (ej. "Inverter/Muro").
        *   **Lógica**: El técnico ve la foto y dice: "Es este, el que tiene la franja plateada".
    *   **Paso C: El Buscador de Códigos (The Solver)**
        *   Una vez dentro del modelo (ej. ID=19 M900XERIES):
        *   **Input**: Un teclado numérico/alfanumérico grande.
        *   **Búsqueda Predictiva**: Al escribir "E", la lista se filtra: E1, E2, E6.
        *   **Tarjeta de Solución (Result Card)**:
            *   **Código**: Grande y Rojo (ej. E6).
            *   **Descripción** (Del SQL): "Velocidad del motor evaporador menor a 200 RPM..."
            *   **Solución** (Del SQL - Formateada): La app detecta los saltos de línea en tu SQL y los convierte en Bullet Points interactivos:
                *   ☑ Motor o turbina obstruida.
                *   ☑ Capacitor en mal estado.
                *   ☑ Sensor de velocidad dañado.

3.  **Integración Transversal (Conectando con otros módulos)**
    *   Este módulo alimenta a toda la app:
    *   **Conexión con Módulo 3.4 (QR)**:
        *   Al escanear un QR vinculado a un equipo (ej. un Mirage Life 12), aparece un botón directo: `[ 🛠️ Ver Códigos de Falla de este equipo ]`. Salta los pasos A y B, llevando directo a la lista de errores de ese modelo exacto.
    *   **Conexión con Módulo 3.2 (CRM - Nuevo Servicio)**:
        *   Si el técnico selecciona "Reparación" -> "Mirage", la app sugiere: "¿Tienes un código de error visible?". Si pone "Sí" y escribe el código, la solución se guarda automáticamente en las notas del servicio.

4.  **Estrategia de Contenido (Tu SQL como Activo)**
    *   Analizando tu archivo, tienes joyas específicas que aumentan el valor de la suscripción PRO:
    *   **Contenido Premium (York/Carrier/LG)**: Las marcas comerciales (VRF, Paquetes) suelen tener manuales difíciles de conseguir.
    *   **Estrategia**: Los códigos de Mirage (masivos) son Gratis. Los códigos de LG VRF / York Paquete (Industrial/Comercial) son exclusivos para usuarios PRO o desbloqueables con Tokens.
    *   **Manejo de Variantes**:
        *   Tu SQL tiene variantes interesantes como CARRIER ONE vs CARRIER ONE +. La app debe agruparlas inteligentemente o permitir "Ver modelos similares" si el técnico no encuentra el error en uno.

#### 3.5.4 Submódulo: Capacitación Ligera (LMS)
**Objetivo**: Micro-learning para fidelización.
*   **Feed**: Lista scrollable de tarjetas ("Cápsulas").
*   **Contenido**: Video corto (30 seg) o Infografía.
*   **Botón**: "Marcar como aprendido".
*   **Economía**:
    *   Cada cápsula vista = +5 Tokens.
    *   Completar serie "Instalación Segura" = Insignia en Perfil.
*   **Disclaimer Legal**: Texto visible indicando que son consejos de mejores prácticas y no sustituyen certificaciones oficiales ni manuales del fabricante.

#### 3.5.5 Calculadora BTU (El Vendedor Silencioso)
Esta herramienta justifica la venta de equipos más grandes o inverter ante el cliente.
*   **Versión FREE (Estimación Rápida)**
    *   **Input**: Largo, Ancho, Zona Climática (Templada/Cálida/Muy Cálida).
    *   **Fórmula**: $Área (m^2) \times FactorZona$.
    *   **Output**: Número en BTUs (Solo lectura).
    *   **Limitante**: Marca de agua grande y sin opción de guardar.
*   **Versión PRO (Carga Térmica Detallada)**
    *   **Inputs Detallados (Audit)**:
        *   **Volumen**: Largo $\times$ Ancho $\times$ Alto ($m^3$).
        *   **Ganancia Solar**:
            *   Ventanas (m²): Orientación (Norte/Sur/Este/Oeste) + Protección (Sin/Con Persiana).
        *   **Carga Interna**:
            *   Ocupantes: Cantidad $\times$ 400 BTU (aprox).
            *   Electrónicos: Sumatoria de Watts (TVs, PCs).
            *   Cocina/Hornos: Si aplica.
        *   **Envolvente**: Tipo de techo (Losa concreto vs Aislado).
    *   **Cálculo & Resultado Comercial**:
        *   Resultado Matemático: 14,200 BTU.
        *   **Sugerencia Comercial (Redondeo inteligente)**: "El cálculo exacto es 14,200 BTU. Se recomienda instalar equipo de 1.5 Toneladas (18,000 BTU) para eficiencia óptima."
    *   **Entregable**:
        *   Genera PDF profesional con el desglose del análisis térmico.
        *   Permite adjuntar este PDF a una Cotización del Módulo 3.3.


### 3.6 Módulo 5: Comunidad SOS (Foro Técnico & Base de Conocimiento)
**Objetivo Estratégico**: Crear una red de apoyo "Peer-to-Peer" que aumente la retención diaria (Daily Active Users). Transforma la app de una herramienta solitaria a una comunidad vibrante, utilizando IA para mantener la calidad y evitar el "ruido".

#### 1. Flujo de Creación de Hilo (El Problema)
*   **UX**: Botón flotante "Pedir Ayuda SOS" en la pantalla de Comunidad.
*   **Formulario de Entrada**:
    *   **Marca/Modelo**: Selectores obligatorios (vinculados a la BD de equipos).
    *   **Descripción**: Campo de texto (Mínimo 50 caracteres para evitar posteos vagos).
    *   **Evidencia**: Foto o Video corto (Opcional pero recomendado).
*   **Filtro IA (Groq - Gatekeeper 1)**:
    *   Antes de publicar, el texto pasa por la API de Groq/LLM.
    *   **Regla de Bloqueo**: Detecta lenguaje ofensivo, spam comercial o datos sensibles (teléfonos).
    *   **Regla de Calidad**: Si el texto es "Ayuda no sirve", la IA rechaza y sugiere: *"Por favor detalla qué pruebas has hecho y qué código de error aparece."*

#### 2. Sistema de Respuestas Inteligentes (La Solución)
Aquí es donde la IA y la Gamificación actúan para asegurar que las respuestas sean útiles.
1.  **Filtro IA en Respuestas (Groq - Gatekeeper 2)**:
    *   **Objetivo**: Eliminar el "Ruido Social" que no aporta valor técnico.
    *   **Lógica**:
        *   Input Usuario: "Ok", "Gracias", "A mí también me pasa", "Jaja".
        *   Análisis IA: Clasifica como `NON_TECHNICAL_VALUE`.
        *   **Acción**: Se permite publicar (para socializar) pero **NO genera Tokens** y se oculta visualmente bajo un botón "Ver más comentarios" si hay muchos.
    *   **Validación de Valor**:
        *   Input Usuario: "Revisa el capacitor de marcha, si mide menos de 30uF cámbialo."
        *   Análisis IA: Clasifica como `TECHNICAL_SOLUTION`.
        *   **Acción**: Publicación destacada + Posibilidad de ganar Tokens.
2.  **Cierre del Ciclo (La Recompensa)**:
    *   Solo el autor del hilo puede marcar una respuesta como **[✅ Solución Aceptada]**.
    *   **Distribución de Tokens**:
        *   Autor: Gana **X tokens** (Poco, por usar la plataforma y cerrar el caso).
        *   Respondedor: Gana **XXX tokens** (Mucho, incentivo fuerte por resolver).

#### 3. Moderación y Límites (Anti-Abuso)
Reglas duras para proteger la economía de la app.
*   **Límites de Velocidad (Rate Limiting)**:
    *   Max 5 comentarios totales por hora (Frena bots y spammers humanos).
    *   Max 2 respuestas premiadas con tokens por hora (Evita "granjeo" de tokens).
*   **Sistema de Reputación**:
    *   Botones `[👍 Útil]` y `[👎 Reportar]` en cada respuesta.
    *   **Trigger de Ban**: Si un usuario acumula 3 reportes validados (ej. insultos) en 24h → Suspensión automática de escritura por 3 días.

#### 4. Distintivos Visuales (Jerarquía Social)
El ego es un motor poderoso en comunidades técnicas.
*   **Novato (Nivel 1)**: Sin icono especial. Usuario nuevo.
*   **Técnico (Nivel 2)**: Icono 🛡️. Usuario que ha completado su perfil y ha dado al menos 5 soluciones aceptadas.
*   **Pro (Nivel 3)**: Icono 🥇 + Borde Dorado. Suscriptores de pago O usuarios con >50 soluciones aceptadas (Top Contributors). *Nota: Dar estatus Pro a los mejores colaboradores gratuitos es una gran estrategia de retención.*

#### 5. Base de Datos de Fallas Comunitaria (El "Waze" de las Reparaciones)
Este es un activo de alto valor que se construye solo (Crowdsourcing).
*   **Concepto**: Convertir problemas aislados en una "Verdad Técnica".
*   **Mecanismo de Consenso (La Regla de 3)**:
    1.  **Reporte A**: El Técnico Juan reporta: Marca X, Modelo Y, Error E4 = Sensor de Pozo dañado. → Estado: *Pendiente*.
    2.  **Reporte B**: El Técnico Pedro reporta lo mismo 2 semanas después. → Estado: *Validando*.
    3.  **Reporte C**: El Técnico Luis reporta lo mismo. → Estado: **CONFIRMADO**.
*   **Resultado**:
    *   El sistema crea automáticamente una entrada en la **Biblioteca de Errores (Módulo 3.5.3)**.
    *   Se convierte en información pública accesible para todos.
*   **Incentivo**: Cuando un reporte pasa a "Confirmado", los 3 técnicos que aportaron el dato reciben un bono retroactivo de Tokens.

### 3.7 Módulo 6: Economía de Tokens ("Mi Billetera")
**Objetivo Estratégico**: Gamificación Conductual. Incentivar el uso del CRM y la ayuda comunitaria mediante recompensas virtuales, manteniendo un control estricto para evitar abusos o inflación de la economía interna.

#### 1. Interfaz de Usuario: "Mi Billetera" (Wallet UI)
*   **Ubicación**: Accesible desde el Menú Principal y visible de forma resumida en el Dashboard (Contador de Tokens).
*   **Dashboard Financiero**:
    *   **Saldo Actual**: Número grande y claro.
    *   **Nivel de Usuario**: Barra de progreso hacia el siguiente nivel (Novato -> Pro).
    *   **Historial de Movimientos (Ledger)**:
        *   Lista cronológica estilo bancario:
            *   ⬇️ **+10 Tokens** | Registro de Servicio (Cliente: Juan P.) | Hoy 10:30 AM
            *   ⬇️ **+50 Tokens** | Respuesta Validada (Hilo #882) | Ayer 04:15 PM
            *   ⬆️ **-200 Tokens** | Canje en Tienda (Guantes Nitrilo) | 12/Dic
*   **Valor Percibido**: El diseño debe sentirse "valioso", usando colores dorados o metálicos para los tokens, aunque legalmente no sean dinero.

#### 2. Reglas de Emisión (Faucets & Caps)
Definición estricta de cómo se "imprime" moneda en el sistema. Los límites están calculados para un flujo de trabajo humano realista.

**Tabla de Ganancias Configurable (Backend)**:

| Acción (Trigger) | Recompensa | Límite Diario (Cap) | Racional del Límite |
| :--- | :--- | :--- | :--- |
| Registrar Servicio | +10 Tokens | 6 Servicios | Un técnico promedio hace 3-5 trabajos. Más de 6 suele ser improbable o gestión de flotillas (que requiere otro plan). |
| Crear Hilo SOS | +20 Tokens | 1 Hilo | Incentiva pedir ayuda real, pero evita que llenen el foro de preguntas spam solo para ganar puntos. |
| Respuesta Validada | +50 Tokens | ∞ (Ilimitado) | "High Value Action". Queremos fomentar expertos. El límite natural es la dificultad de que te marquen como "Solución". |
| Perfil Completo | +100 Tokens | 1 (Única vez) | Incentivo de Onboarding ("One-off"). |
| Vincular QR Nuevo | +15 Tokens | 10 QRs | Fomenta la expansión del ecosistema físico. |

*   **Reset**: Los contadores diarios se reinician a las **00:00:00 hora local** del dispositivo del usuario.

#### 3. Sistema de Seguridad "El Sheriff" (Anti-Fraude)
Algoritmos pasivos que corren en el servidor para detectar anomalías y bloquear "granjas" de tokens.
*   **A. Bloqueo de Velocidad (Velocity Checks)**:
    *   **Regla**: "Nadie repara un aire acondicionado en 5 minutos".
    *   **Lógica**: Si el Usuario X registra 2 servicios con una diferencia de tiempo < 15 minutos, el segundo servicio se guarda pero **NO genera tokens** y levanta una bandera amarilla ⚠️.
*   **B. Geofencing (Validación GPS)**:
    *   **Regla**: "No puedes reparar 3 equipos distintos desde el sofá de tu casa".
    *   **Lógica**: El sistema compara las coordenadas GPS de los últimos registros.
    *   **Condición**: Si `Coordenada Serv 1 == Coordenada Serv 2` (radio < 20m) **Y** Cliente es diferente → **Bloqueo de tokens**. (Se asume que es spam o prueba falsa).
*   **C. Detección de Patrones de Texto**:
    *   Si el usuario llena los campos de descripción con "asdasd", "test", "prueba", la IA (Groq) detecta contenido basura y anula la recompensa.

#### 4. Marco Legal y Términos (Liability)
Texto obligatorio visible en la sección "Ayuda" de la Billetera para proteger a la empresa.
> **AVISO LEGAL**: "Los 'Tokens Smart' son puntos de fidelidad virtuales sin valor monetario en el mundo real. Son intransferibles entre cuentas y no pueden canjearse por dinero en efectivo (fiat). La plataforma se reserva el derecho de revocar tokens obtenidos mediante métodos fraudulentos, scripts automatizados o uso indebido de la aplicación sin previo aviso."

### 3.8 Módulo 8: Tienda y Recompensas (Marketplace)
**Objetivo Estratégico**:
*   **Monetización Directa**: Venta de insumos propietarios (Etiquetas QR).
*   **Economía Circular**: "Quemar" los tokens generados para evitar inflación y dar valor real al esfuerzo del técnico.

#### 1. Estrategia de Producto: El Ecosistema QR Dual
Un modelo "Freemium" aplicado al hardware (etiquetas).
*   **A. QR Gratis (DIY - Do It Yourself)**:
    *   **Formato**: Archivo PDF generado dinámicamente en la app.
    *   **Uso**: El técnico lo descarga, lo imprime en su impresora de casa y lo pega con cinta adhesiva.
    *   **Ventaja**: Elimina la barrera de entrada. Permite que cualquiera pruebe el sistema hoy mismo.
    *   **Limitante**: Se desgasta con la lluvia/sol (los aires acondicionados están en exteriores).
*   **B. QR Profesional (Producto Físico - De Pago)**:
    *   **Material**: Vinil de alta resistencia, adhesivo industrial (para superficies rugosas/metal), capa UV anti-sol.
    *   **Diseño**: Branding premium de la App + Espacio para que el técnico escriba su teléfono con plumón permanente.
    *   **Valor**: "Imagen Profesional". El cliente final ve una etiqueta oficial, no un papel pegado con diurex.

#### 2. Sección A: Tienda de Dinero Real (Revenue Stream)
Venta directa a través de pasarelas de pago seguras.
*   **Catálogo de Productos (SKUs)**:
    *   📦 **Pack Inicial (20 QRs)**: Ideal para probar.
    *   📦 **Pack Taller (50 QRs)**: Mejor costo unitario.
    *   📦 **Pack Flotilla (100 QRs)**: Margen máximo.
*   **Gestión de Precios**:
    *   Los precios (`price_mxn`) se controlan desde tu Panel Administrativo, permitiéndote ajustar según costos de imprenta o promociones sin actualizar la app en las tiendas.
*   **Checkout Flow**:
    *   Integración nativa con **MercadoPago** (líder en LatAm) y **Stripe**.
    *   Formulario de envío integrado (Dirección guardada en perfil del usuario).

#### 3. Sección B: Tienda de Tokens (Digital & Merch)
Aquí es donde los usuarios gastan sus ganancias ("Token Burn"). El objetivo es ofrecer recompensas atractivas que tengan un costo marginal bajo para ti.
*   **Categorías de Canje**:
    1.  **Productos Digitales (Margen 100% - Costo $0)**:
        *   🚀 **Booster "Semana PRO"**: Desbloquea todas las funciones Premium por 7 días. (Estrategia: El usuario se acostumbra a lo bueno y luego compra la suscripción).
        *   📄 **Desbloqueo Cotizador**: Pagar X tokens por generar 1 PDF de cotización sin marca de agua (Micro-transacción).
        *   📢 **"Destacar mi Pregunta"**: Pone su hilo SOS al inicio del foro por 24h.
    2.  **Productos Híbridos (Descuentos)**:
        *   🎫 **Cupón 20% OFF en QRs Físicos**: El usuario gasta tokens → Tú recibes una venta en dinero real (con descuento, pero venta al fin).
    3.  **Productos Físicos (Merchandising - Costo Real)**:
        *   Requieren gran cantidad de tokens para ser rentables.
        *   **Herramientas básicas**: Cinta Momia, Desarmador de bolsillo, Gorra con logo de la App.
        *   **Regla de Envío**: "El envío se paga aparte (Dinero)" O "Envío gratis solo al canjear junto con un Pack de QRs".

#### 4. Logística y Backoffice (Panel Admin)
Para que esto no sea un dolor de cabeza operativo, el sistema administrativo debe ser simple.
*   **Tablero de Pedidos**:
    *   Vista de lista: `Nuevo` | `Pagado` | `En Proceso` | `Enviado`.
*   **Gestión de Envíos**:
    *   Al recibir un pedido de QRs o Merch, el administrador prepara el paquete.
    *   **Input**: Campo para ingresar Tracking Number (Número de guía) y Paquetería (DHL/Estafeta/Correos).
    *   **Acción**: Al guardar, la app dispara una **Notificación Push** al técnico: *"¡Tu paquete va en camino! Rastréalo aquí."*
    -   Panel Admin para marcar "Enviado" y subir guía de rastreo.

### 3.9 Módulo 9: Panel de Administración (God Mode)
**Plataforma**: Web App (Escritorio). No es visible en la app móvil. Acceso exclusivo para Super Admins (Tú) y personal de soporte.

#### 1. Dashboard Ejecutivo (KPIs)
Visión de "Águila" sobre la salud del negocio y la app.
*   **Métricas de Negocio (Dinero)**:
    *   Ventas Totales (MXN) mes actual vs anterior.
    *   Pedidos de QRs pendientes de envío.
*   **Métricas de Producto (Retención)**:
    *   **DAU (Daily Active Users)**: Técnicos únicos activos hoy.
    *   **Tasa de Retención**: % de usuarios que regresan después de 7 días.
*   **Economía de Tokens**:
    *   **Token Float**: Total de tokens en circulación (emitidos - quemados). Alerta si la inflación es alta.
    *   **Burn Rate**: Tokens gastados en tienda vs. Tokens generados.

#### 2. Gestión de Usuarios (User CRM)
Control granular sobre cada técnico registrado.
*   **Buscador**: Por Alias, Correo, Teléfono o ID.
*   **Perfil de Usuario (Vista Admin)**:
    *   Datos: Personales + Historial de Dispositivos (IPs).
    *   **Flags de Control (Toggles)**:
        *   `eligible_for_public_directory`: **[ON/OFF]**. Interruptor manual. Si está en ON, el técnico aparece en la búsqueda pública de la web.
        *   `is_banned`: **[ON/OFF]**. Bloqueo total de acceso.
        *   `is_pro_subscriber`: **[ON/OFF]**. Acceso manual a funciones de pago (para pruebas o regalos).
    *   **Scores Calculados**:
        *   `trust_score_internal`: (0-100). Calculado automáticamente (Reportes recibidos vs. Soluciones dadas).
        *   `profile_completeness_score`: % de llenado de perfil.
*   **Acciones**: Restablecer contraseña, Regalar Tokens (Compensación de soporte), Enviar Push Notification individual.

#### 3. Motor de Reglas Dinámicas (Remote Config)
La capacidad de ajustar la lógica del negocio en caliente, sin lanzar una actualización en las App Stores.
*   **Interfaz**: Editor JSON con validación de sintaxis o formularios simples.
*   **Archivos Configurables**:
    *   `token_earn_rules.json`: Cambiar cuántos tokens da un "Like" o un "Registro de Servicio".
    *   `market_prices_master.json`: Actualizar el precio base del Cobre o Gas R410A en el Cotizador.
    *   `btu_factors.json`: Ajustar los factores de cálculo térmico si se detectan imprecisiones.
    *   `store_config.json`: Activar/Desactivar productos de la tienda de canje.

#### 4. Gestión del Catálogo (E-commerce)
*   **Inventario Unificado**:
    *   **Gestión de Productos Físicos (Packs de QRs, Herramientas)**: Control de Stock, Costo MXN, Peso (para envíos).
    *   **Gestión de Productos Digitales (Boosters, Funciones)**: Costo en Tokens, Duración.
*   **Logística de Envíos**:
    *   Cola de pedidos "Pagados / No Enviados".
    *   Botón para cargar "Número de Guía" y marcar como "Enviado" (Dispara notificación al usuario).

#### 5. Moderación con IA (La Sala de Justicia)
Herramienta para mantener limpia la comunidad SOS.
*   **Cola de Prioridad**:
    *   No muestra todo el contenido, solo lo marcado por Groq AI como sospechoso o lo reportado por usuarios humanos > 3 veces.
*   **Score de Toxicidad**:
    *   Visualización del texto con las palabras ofensivas resaltadas automáticamente.
*   **Acciones Rápidas**:
    *   [Ignorar] (Falso positivo).
    *   [Borrar Contenido].
    *   [Borrar + Banear Usuario 24h].

#### 6. Logs de Auditoría (Seguridad)
Registro inmutable de "Quién hizo qué" dentro del panel administrativo.
*   **Ejemplo**: "Admin1 cambió el precio del Gas R410A de $800 a $850 el 12/Dic a las 14:00".
*   **Ejemplo**: "Admin2 otorgó 500 tokens manuales al usuario JuanPerez".
*   **Objetivo**: Evitar robos internos o errores no rastreables.
---

## CAPÍTULO 4: ESQUEMA DE DATOS (FIRESTORE)

### Colecciones Clave

**`users`**
*Perfil del Técnico*
- `uid`: String (Unique)
- `alias`: String (Public)
- `phone_hash`: String (Private/Auth)
- `rank`: String ("Novato", "Técnico", "Pro")
- `token_balance`: Number (Ledger sum)
- `is_premium`: Boolean (Stripe status / Trial 7-days)
- `subscription_end_date`: Timestamp
- `profile_completeness_score`: Number (0-100)
- `stats`: Map { `services_count`, `qrs_active`, `sos_solved`, `training_completed` }
- `pricing_config`: Map { `mode` ("manual"/"assisted"), `labor_base`, `material_factors` }
- `eligible_for_directory`: Boolean (Admin flag)

**`services`**
*Bitácora de Eventos*
- `id`: String (UUID)
- `user_id`: String (Ref: users)
- `equipment_id`: String (Ref: equipments - QR Hash)
- `client_id`: String (Ref: contacts)
- `type`: String ("Instalación", "Mantenimiento", "Reparación")
- `status`: String ("Borrador", "Finalizado")
- `technical_details`: Map { `refrigerant`, `pressure`, `amperage`, `voltage` ... }
- `checklists`: List<Map> [ { `item`: "Vacío", `checked`: true }, ... ]
- `photos`: List<String> (Storage URLs)
- `notes_private`: String
- `service_author_rank_at_time`: String
- `created_at`: Timestamp

**`equipments`**
*Identidad Digital del Activo (QR)*
- `qr_hash`: String (ID Inmutable)
- `brand`: String
- `model`: String
- `capacity`: String ("1 Ton", "1.5 Ton"...)
- `voltage`: String ("110v", "220v")
- `type`: String ("Minisplit", "Inverter", "Window")
- `install_date`: Timestamp
- `last_service_date`: Timestamp
- `last_service_tech_id`: String (Para Regla de Contacto Dinámico)
- `timeline`: Subcollection (Denormalized summary of services for read-only view)

**`contacts`**
*Agenda Privada (Aislamiento de Datos)*
- `id`: String (UUID)
- `linked_technician_id`: String (Ref: users - CRITICAL SECURITY RULE)
- `name`: String
- `phone`: String
- `address`: String
- `notes`: String
- `source`: String ("Manual", "Importado")

**`quotes`**
*Cotizaciones (Cotizador Pro)*
- `id`: String (UUID)
- `user_id`: String (Ref: users)
- `client_name`: String
- `items`: List<Map> [ { `desc`, `qty`, `unit_price`, `total` } ]
- `total_amount`: Number
- `status`: String ("Borrador", "Enviada", "Aceptada")
- `analysis_ref`: String (Opcional - Ref: thermal_analysis)
- `valid_until`: Timestamp

**`sos_threads`**
*Comunidad y Diagnóstico*
- `id`: String
- `author_id`: String
- `title`: String
- `content`: String
- `status`: String ("Abierto", "Resuelto")
- `solution_accepted_id`: String (Ref: sos_comments)
- `ai_analysis`: Map { `is_offensive`, `quality_score` }

**`community_fault_reports`**
*Base de Datos de Consenso*
- `id`: String
- `brand`: String
- `model`: String
- `error_code`: String
- `symptoms`: String
- `fix_description`: String
- `confirmations`: Number (Count of unique techs confirming)
- `confirmed_by`: List<String> (User IDs)
- `is_public`: Boolean (True if confirmations >= 3)

**`store_products`**
*Catálogo Dual (Tokens y Real)*
- `id`: String
- `type`: String ("Physical_Money", "Digital_Token", "Booster")
- `name`: String
- `cost_tokens`: Number
- `price_mxn`: Number
- `stock`: Number
- `is_active`: Boolean

**`admin_rules`**
*Configuración Dinámica (Remote Config)*
- `token_earn_rules`: JSON map
- `btu_factors`: JSON map
- `consensus_threshold`: Number (Default: 3)
- `launch_boosters_enabled`: Boolean

---

## CAPÍTULO 5: LÓGICA BACKEND

1.  **Cloud Functions (Lógica de Negocio)**:
    -   `onServiceCreate`:
        -   **Trigger**: Nuevo documento en `services`.
        -   **Acciones**:
            1.  Copia resumen a `equipments/{id}/timeline` (Read-Optimized).
            2.  **Regla de Contacto**: Actualiza `equipments.last_service_tech_id` con el `uid` del técnico.
            3.  Calcula y asigna Tokens.
            4.  Incrementa contadores en `users.stats` (Servicios, QRs).
    -   `onUserCreate`: Crea perfil base y asigna balance inicial (0 tokens).
    -   `checkSosContent` (AI Guardrail):
        -   **Trigger**: Nuevo `sos_threads` o `sos_comments`.
        -   **Lógica**: Llama a Groq API.
        -   **Output**: Si `is_offensive` || `quality_score < 0.2` -> Rechaza/Flag. Si OK -> Publica.
    -   `onFaultReportCreate` (Motor de Consenso):
        -   **Trigger**: Nuevo reporte en `community_fault_reports`.
        -   **Lógica**: Busca coincidencias (Marca/Modelo/Error).
        -   **Consenso**: Si `confirmations >= 3` (de UIDs distintos) -> Marca `is_public = true` y libera reward grande a los 3 autores.
    -   `generatePdf`:
        -   **Input**: ID Servicio o ID Cotización.
        -   **Proceso**: Render server-side (Puppeteer), adjunta Branding del técnico.
        -   **Output**: URL firmada de Storage.
    -   `scraperUpdate`:
        -   **Cron**: Semanal (Domingos 3 AM).
        -   **Acción**: Scrapea sitios definidos, limpia outliers, actualiza `admin_rules.market_prices`.
    -   `processStoreTransaction`:
        -   **Input**: Compra de producto (Token o Real).
        -   **Lógica**:
            -   Si es "Boost": Activa `is_premium` = true y `subscription_end_date` = now + 7 days.
            -   Si es "Físico": Crea orden en `logistics_orders`.
            -   Descuenta tokens de `users.token_balance` (Atomic transaction).
2.  **Sincronización Offline (Estrategia Detallada)**:
    -   **Persistencia Local**: SQLite para búsquedas rápidas (Autocomplete).
    -   **Cola de Subida**: Background Job. Prioridad: Texto JSON > Imágenes.
    -   **Compresión**: Imágenes < 200KB antes de subir.
    -   **Conflict Resolution**:
        -   *Services*: Last-write-wins basado en timestamp cliente. Si conflicto ID, priorizar el que tenga más evidencia (fotos).
        -   *Tokens*: Siempre operaciones delta (+/-) idempotentes.

---

## CAPÍTULO 6: MARCO LEGAL Y BLINDAJE

### 6.1 Naturaleza
Bitácora de Aires Acondicionados Smart es una herramienta de referencia. **No certifica** ni garantiza instalaciones.

### 6.2 Responsabilidad
"El uso de cálculos y datos es responsabilidad exclusiva del usuario." (Aplica a todas las tools).

### 6.3 Protección de Datos (LFPDPPP)
-   **Minimización**: No nombres en Nube.
-   **Hashing**: Teléfonos ilegibles.
-   **ARCO**: Canal de soporte explícito.

### 6.4 Safe Harbor
Moderación AI + Reportes para contenido de usuarios (Foros).

---

## CAPÍTULO 7: EJECUCIÓN, ROADMAP Y RECURSOS

### 7.1 Fases de Lanzamiento
-   **Fase 0 (Preparación - 2 sem)**: Setup Firebase, Legal, Cuentas Store/Pagos.
-   **Fase 1 (MVP - 8-12 sem)**:
    -   CRM, QR Básico, Radar, Tools Free.
    -   **Seed Data**: Importación y Hashing de cartera de clientes existente "Bitácora de Aires Acondicionados Smart".
    -   Meta: Piloto 500 técnicos.
-   **Fase 2 (Monetización - 6-8 sem)**:
    -   Suscripción PRO (Stripe), Cotizador Pro (Wizard), PDF Pro, Tienda Etiquetas (MercadoPago).
-   **Fase 3 (Escalamiento)**: Refinamiento Scraper, Reporting.

### 7.2 Equipo Recomendado (MVP)
-   1 Tech Lead (Fullstack/Mobile).
-   2 Flutter Devs.
-   1 Backend Dev (Node/Python).
-   0.5 UX/UI Designer.
-   0.5 QA Engineer.

### 7.3 Estimación de Costos (Referencial)
-   **Desarrollo**: USD 35k - 70k (Variable según región).
-   **Infraestructura (Mensual)**: USD 200 - 2,000+ (Escala con uso de Storage/Functions).
-   **Marketing Inicial**: USD 3k - 10k.

---

## CAPÍTULO 8: CALIDAD Y OPERACIONES

-   **Métricas**: DAU/MAU, Conversión PRO, Tokens Burn Rate.
-   **SLA**: 99.9% Uptime.
-   **Testing**: Unitario (Cálculos), Integration (Auth/Pagos), E2E (Flujos críticos).

---

## CAPÍTULO 9: APÉNDICES

### APÉNDICE A: Reglas de Tokens (Default)
*(Ver detalle en Admin Rules)*

### APÉNDICE B: Cambios DB Históricos
*(Log de migraciones)*

### APÉNDICE C: TEXTOS LEGALES Y DISCLAIMERS (COMPLETO)

#### 1. TÉRMINOS Y CONDICIONES DE USO

**Aplicación BITÁCORA DE AIRES ACONDICIONADOS SMART**
*Última actualización: [Fecha]*

El presente documento establece los Términos y Condiciones de Uso que regulan el acceso y utilización de la aplicación móvil BITÁCORA DE AIRES ACONDICIONADOS SMART. Al registrarse, el usuario acepta expresamente estos Términos.

**1. Naturaleza de la Plataforma**
BITÁCORA DE AIRES ACONDICIONADOS SMART es una plataforma tecnológica de apoyo.
BITÁCORA DE AIRES ACONDICIONADOS SMART NO:
- Presta servicios de instalación o reparación.
- Emite certificaciones técnicas.
- Sustituye normas oficiales.
El usuario actúa bajo su exclusiva responsabilidad profesional.

**2. Comunidad**
El contenido es responsabilidad de quien lo genera. BITÁCORA DE AIRES ACONDICIONADOS SMART actúa como intermediario con mecanismos de moderación.

**3. Tokens**
- No son dinero.
- Son intransferibles y revocables.
- BITÁCORA DE AIRES ACONDICIONADOS SMART puede modificar reglas sin compensación.

**4. Limitación de Responsabilidad**
BITÁCORA DE AIRES ACONDICIONADOS SMART no será responsable por daños, pérdidas o fallas derivadas del uso de la App.

#### 2. AVISO DE PRIVACIDAD

**Responsable**: BITÁCORA DE AIRES ACONDICIONADOS SMART
**Datos Recabados**: Teléfono (Auth), Alias, Datos Técnicos.
**Tratamiento**:
- Autenticación.
- No se recaban nombres reales de clientes finales en texto plano en la nube.
**Derechos ARCO**: Solicitar al correo de contacto arco@tesivil.com.

#### 3. DISCLAIMER TÉCNICO (IN-APP)

**IMPORTANTE – LEA ANTES DE USAR**
Las herramientas (Calculadoras, Guías, Historial QR) son de referencia orientativa.

**Alcance**:
- Son estimaciones.
- No sustituyen criterio profesional ni normas.
- El usuario es responsable de validar condiciones reales.

**Historial QR**:
Refleja registros de terceros. No constituye certificación ni garantía por parte de Bitácora de Aires Acondicionados Smart.
